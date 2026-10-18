'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import axios from 'axios';
import api, { API_BASE_URL, getAuthToken } from '@/lib/api';
import { loginUrlWithRedirect } from '@/lib/redirect';
import {
    ChevronRight,
    ChevronLeft,
    Clock,
    Target,
    ClipboardCheck,
    Zap,
    Info,
    AlertCircle,
    Play,
    Timer,
    Maximize,
    Menu,
    Languages,
    ShieldCheck,
    Loader2,
    Rocket,
    CloudOff,
    CloudUpload,
    CheckCircle2,
    RotateCw,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { storageUrl } from '@/lib/storage';
import { toast } from 'react-hot-toast';

type Question = {
    id: number;
    question_en: string;
    question_hi: string;
    image_path: string | null;
    explanation_en: string | null;
    explanation_hi: string | null;
    options: { id: number; option_en: string; option_hi: string; image_path: string | null }[];
};

type Test = {
    id: number;
    name_en: string;
    name_hi: string;
    description_en: string | null;
    description_hi: string | null;
    duration_sec: number;
    total_marks: number;
    negative_marking: number;
    questions: Question[];
};

type ResponseEntry = {
    selected_option_id?: number | null;
    status: string; // 'answered' | 'marked' | 'not_answered'
    visited?: boolean;
    time_taken_sec?: number;
};
type ResponseMap = Record<number, ResponseEntry>;

type ServerResponse = {
    question_id: number;
    selected_option_id: number | null;
    is_marked_for_review?: boolean | number | null;
    time_taken_sec?: number | null;
};

type AttemptTiming = {
    started_at?: string | null;
    remaining_sec?: number | string | null;
    deadline_at?: string | null;
    server_time?: string | null;
};

type AttemptPayload = AttemptTiming & {
    id: number;
    test_id?: number | string;
    status?: string;
    responses?: ServerResponse[];
};

type StartAttemptResponse = AttemptTiming & {
    attempt: AttemptPayload;
    is_resume?: boolean;
};

type StoredAnswers = { responses: ResponseMap; dirty: number[] };

type SyncState = 'ok' | 'offline';

// ── Tunables ────────────────────────────────────────────────────────────────
// Answers are already safe in localStorage, so the server copy only needs to be
// recent enough to survive a device loss. 30s keeps 10k students at ~330 req/s.
const SYNC_INTERVAL_MS = 30_000; // periodic batch flush
const SYNC_JITTER_MS = 5_000; // spread 10k clients so they don't flush in lock-step
// When a mock ends, every student's timer hits 0 in the same second. Spread
// auto-submits over this window; the server accepts final answers for 2 min
// after the deadline, so nothing is lost.
const AUTO_SUBMIT_SPREAD_MS = 45_000;
const NAV_FLUSH_THRESHOLD = 10; // flush on navigation once this many answers are dirty
const BACKOFF_BASE_MS = 5_000;
const BACKOFF_MAX_MS = 60_000;
const SUBMIT_MAX_TRIES = 5;
const KEEPALIVE_MAX_BYTES = 60_000; // browsers cap keepalive bodies at 64KB

const storageKeys = {
    answers: (attemptId: number) => `osd_attempt_${attemptId}_answers`,
    index: (attemptId: number) => `osd_attempt_${attemptId}_index`,
    deadline: (attemptId: number) => `osd_attempt_${attemptId}_deadline`,
    activeAttempt: (testId: string) => `osd_test_${testId}_active_attempt`,
};

// ── localStorage helpers (never throw: private mode / quota errors) ─────────
function readStorage(key: string): string | null {
    try {
        return localStorage.getItem(key);
    } catch {
        return null;
    }
}

function writeStorage(key: string, value: string) {
    try {
        localStorage.setItem(key, value);
    } catch {
        // quota exceeded / storage disabled — in-memory state still syncs to server
    }
}

function removeStorage(key: string) {
    try {
        localStorage.removeItem(key);
    } catch {
        // ignore
    }
}

function readStoredAnswers(attemptId: number): StoredAnswers | null {
    const raw = readStorage(storageKeys.answers(attemptId));
    if (!raw) return null;
    try {
        const parsed = JSON.parse(raw) as Partial<StoredAnswers>;
        return {
            responses: parsed.responses && typeof parsed.responses === 'object' ? parsed.responses : {},
            dirty: Array.isArray(parsed.dirty) ? parsed.dirty.map(Number).filter(Number.isFinite) : [],
        };
    } catch {
        return null;
    }
}

function clearAttemptStorage(attemptId: number, testId?: string) {
    removeStorage(storageKeys.answers(attemptId));
    removeStorage(storageKeys.index(attemptId));
    removeStorage(storageKeys.deadline(attemptId));
    if (testId && readStorage(storageKeys.activeAttempt(testId)) === String(attemptId)) {
        removeStorage(storageKeys.activeAttempt(testId));
    }
}

// ── Pure helpers ────────────────────────────────────────────────────────────
function statusFromServer(r: ServerResponse): string {
    if (r.is_marked_for_review) return 'marked';
    return r.selected_option_id ? 'answered' : 'not_answered';
}

/** Server responses merged with this device's copy; local wins for unsynced (dirty) entries. */
function mergeResponses(server: ServerResponse[] | undefined, local: StoredAnswers | null) {
    const merged: ResponseMap = {};
    for (const r of server ?? []) {
        merged[r.question_id] = {
            selected_option_id: r.selected_option_id ?? null,
            status: statusFromServer(r),
            visited: true,
            time_taken_sec: Number(r.time_taken_sec) || 0,
        };
    }

    const dirty = new Set<number>(local?.dirty ?? []);
    for (const [key, entry] of Object.entries(local?.responses ?? {})) {
        const qid = Number(key);
        if (!Number.isFinite(qid) || !entry) continue;
        const serverEntry = merged[qid];
        if (dirty.has(qid) || !serverEntry) {
            merged[qid] = entry;
        } else {
            merged[qid] = {
                ...serverEntry,
                visited: true,
                time_taken_sec: Math.max(serverEntry.time_taken_sec ?? 0, entry.time_taken_sec ?? 0),
            };
        }
    }

    return { responses: merged, dirty };
}

/**
 * Local deadline (epoch ms). Prefer the server's remaining_sec measured at the
 * moment the response arrived — immune to client clock skew. Fall back to
 * started_at + duration for older backends.
 */
function deadlineFromTiming(timing: AttemptTiming, durationSec: number): number | null {
    const remaining = timing.remaining_sec;
    if (remaining !== null && remaining !== undefined && remaining !== '' && Number.isFinite(Number(remaining))) {
        return Date.now() + Math.max(0, Number(remaining)) * 1000;
    }
    if (timing.started_at) {
        const started = Date.parse(timing.started_at);
        if (!Number.isNaN(started)) return started + durationSec * 1000;
    }
    return null;
}

function secondsUntil(deadline: number): number {
    return Math.max(0, Math.ceil((deadline - Date.now()) / 1000));
}

function toPayload(questionId: number, entry: ResponseEntry | undefined) {
    return {
        question_id: questionId,
        selected_option_id: entry?.selected_option_id ?? null,
        is_marked_for_review: entry?.status === 'marked',
        time_taken_sec: Math.round(entry?.time_taken_sec ?? 0),
    };
}

function httpStatus(err: unknown): number | undefined {
    return axios.isAxiosError(err) ? err.response?.status : undefined;
}

function errorMessage(err: unknown, fallback: string): string {
    if (axios.isAxiosError(err)) {
        const data = err.response?.data as { message?: string } | undefined;
        return data?.message || err.message || fallback;
    }
    return err instanceof Error ? err.message : fallback;
}

const sleep = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

/**
 * The api.ts interceptor never hard-redirects from the player (so a 401 mid-test
 * can't destroy progress). Before the test is running there is nothing to lose,
 * so send the student to login and bring them back here afterwards.
 */
function redirectToLogin() {
    window.location.href = loginUrlWithRedirect(window.location.pathname);
}

export default function TestPlayer() {
    const params = useParams();
    const router = useRouter();
    const testId = String(params.id);

    const [step, setStep] = useState<'instructions' | 'declaration' | 'playing'>('instructions');
    const [test, setTest] = useState<Test | null>(null);
    const [loading, setLoading] = useState(true);
    const [language, setLanguage] = useState<'en' | 'hi'>('en');
    const [declared, setDeclared] = useState(false);
    const [isStarting, setIsStarting] = useState(false);

    // Test State
    const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
    const [timeLeft, setTimeLeft] = useState(0);
    const [deadline, setDeadline] = useState<number | null>(null);
    const [responses, setResponses] = useState<ResponseMap>({});
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [attemptId, setAttemptId] = useState<number | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitError, setSubmitError] = useState<string | null>(null);
    const [showSubmitModal, setShowSubmitModal] = useState(false);
    const [dirtyCount, setDirtyCount] = useState(0);
    const [syncState, setSyncState] = useState<SyncState>('ok');
    const [sessionExpired, setSessionExpired] = useState(false);

    // Mutable engine state (read from timers / event listeners without re-subscribing)
    const testRef = useRef<Test | null>(null);
    const attemptIdRef = useRef<number | null>(null);
    const responsesRef = useRef<ResponseMap>({});
    const dirtyRef = useRef<Set<number>>(new Set());
    const versionRef = useRef<Record<number, number>>({});
    const currentQRef = useRef<{ qid: number | null; since: number }>({ qid: null, since: 0 });
    const deadlineRef = useRef<number | null>(null);
    const syncInFlightRef = useRef<Promise<void> | null>(null);
    const keepaliveInFlightRef = useRef<Promise<void> | null>(null);
    const nextSyncAtRef = useRef(0);
    const backoffRef = useRef(BACKOFF_BASE_MS);
    const closedRef = useRef(false); // attempt closed server-side → stop syncing
    const finishedRef = useRef(false); // submitted successfully
    const submitPromiseRef = useRef<Promise<void> | null>(null);
    const autoSubmitFiredRef = useRef(false);
    const sessionExpiredRef = useRef(false);
    const expiredTokenRef = useRef<string | null>(null);
    const allowUnloadRef = useRef(false);

    // ── Persistence ─────────────────────────────────────────────────────────
    const persistAnswers = useCallback(() => {
        const aid = attemptIdRef.current;
        if (!aid || finishedRef.current) return;
        const payload: StoredAnswers = { responses: responsesRef.current, dirty: [...dirtyRef.current] };
        writeStorage(storageKeys.answers(aid), JSON.stringify(payload));
    }, []);

    /** Applies a change to one question, mirrors it to state + localStorage, tracks dirtiness. */
    const updateEntry = useCallback((
        questionId: number,
        updater: (prev: ResponseEntry | undefined) => ResponseEntry,
        forceDirty = false,
    ) => {
        const prevMap = responsesRef.current;
        const prev = prevMap[questionId];
        const next = updater(prev);
        const answerChanged =
            (prev?.selected_option_id ?? null) !== (next.selected_option_id ?? null) ||
            (prev?.status === 'marked') !== (next.status === 'marked');

        const nextMap = { ...prevMap, [questionId]: next };
        responsesRef.current = nextMap;
        setResponses(nextMap);

        if (answerChanged || forceDirty) {
            const wasClean = dirtyRef.current.size === 0;
            dirtyRef.current.add(questionId);
            versionRef.current[questionId] = (versionRef.current[questionId] ?? 0) + 1;
            setDirtyCount(dirtyRef.current.size);
            // Batch: first change after a quiet period waits for the next ~10s window.
            const now = Date.now();
            if (wasClean && nextSyncAtRef.current < now) {
                nextSyncAtRef.current = now + SYNC_INTERVAL_MS + Math.random() * SYNC_JITTER_MS;
            }
        }
        persistAnswers();
    }, [persistAnswers]);

    /** Adds time spent on the current question since the last commit. */
    const commitTime = useCallback(() => {
        const cur = currentQRef.current;
        if (cur.qid === null || cur.since === 0) return;
        const now = Date.now();
        const elapsed = (now - cur.since) / 1000;
        cur.since = now;
        if (elapsed <= 0) return;
        const qid = cur.qid;
        const before = responsesRef.current[qid]?.time_taken_sec ?? 0;
        const after = before + elapsed;
        updateEntry(
            qid,
            (prev) => ({ ...(prev ?? { status: 'not_answered' }), visited: true, time_taken_sec: after }),
            Math.round(after) !== Math.round(before),
        );
    }, [updateEntry]);

    const startTracking = useCallback((questionId: number) => {
        const visible = typeof document === 'undefined' || document.visibilityState === 'visible';
        currentQRef.current = { qid: questionId, since: visible ? Date.now() : 0 };
    }, []);

    const markAsVisited = useCallback((questionId: number) => {
        if (responsesRef.current[questionId]?.visited) return;
        updateEntry(questionId, (prev) => ({
            ...(prev ?? {}),
            visited: true,
            status: prev?.status && prev.status !== 'not_visited' ? prev.status : 'not_answered',
        }));
    }, [updateEntry]);

    const markSessionExpired = useCallback(() => {
        if (sessionExpiredRef.current) return;
        sessionExpiredRef.current = true;
        expiredTokenRef.current = getAuthToken();
        setSessionExpired(true);
        setSyncState('offline');
    }, []);

    const applyServerRemaining = useCallback((data: unknown) => {
        const remaining = (data as AttemptTiming | undefined)?.remaining_sec;
        if (remaining === null || remaining === undefined || remaining === '') return;
        const n = Number(remaining);
        if (!Number.isFinite(n)) return;
        const dl = Date.now() + Math.max(0, n) * 1000;
        deadlineRef.current = dl;
        const aid = attemptIdRef.current;
        if (aid) writeStorage(storageKeys.deadline(aid), String(dl));
        setDeadline(dl);
    }, []);

    // ── Submit (final flush + scoring in one request) ───────────────────────
    const submitAttempt = useCallback((auto: boolean): Promise<void> => {
        if (finishedRef.current) return Promise.resolve();
        if (submitPromiseRef.current) return submitPromiseRef.current;
        const aid = attemptIdRef.current;
        if (!aid) return Promise.resolve();

        const run = (async () => {
            setShowSubmitModal(false);
            setSubmitError(null);
            setIsSubmitting(true);

            // Let any in-flight sync settle so the final payload is ordered after it.
            await Promise.allSettled([syncInFlightRef.current, keepaliveInFlightRef.current].filter(Boolean));
            commitTime();

            let lastError = 'Failed to submit test. Please try again.';
            for (let attempt = 0; attempt < SUBMIT_MAX_TRIES; attempt++) {
                const payload = [...dirtyRef.current].map((qid) => toPayload(qid, responsesRef.current[qid]));
                try {
                    await api.post(
                        `/attempts/${aid}/complete`,
                        { responses: payload },
                        { skipAuthRedirect: true, timeout: 30_000 },
                    );
                    finishedRef.current = true;
                    closedRef.current = true;
                    dirtyRef.current.clear();
                    setDirtyCount(0);
                    clearAttemptStorage(aid, testId);
                    toast.success(auto ? 'Time up! Test submitted automatically.' : 'Test submitted successfully!');
                    router.push(`/dashboard/tests/result/${aid}`);
                    return;
                } catch (err) {
                    const status = httpStatus(err);
                    if (status === 401) {
                        markSessionExpired();
                        lastError = 'Your session expired. Log in again to submit — your answers are saved on this device.';
                        break;
                    }
                    lastError = errorMessage(err, lastError);
                    // Non-retryable client errors (validation, forbidden, not found).
                    if (status && status >= 400 && status < 500 && status !== 408 && status !== 429) break;
                    if (attempt < SUBMIT_MAX_TRIES - 1) {
                        await sleep(Math.min(BACKOFF_MAX_MS, 2_000 * 2 ** attempt));
                    }
                }
            }

            persistAnswers();
            setSubmitError(lastError);
            setIsSubmitting(false);
            toast.error(lastError);
        })();

        submitPromiseRef.current = run;
        void run.finally(() => {
            submitPromiseRef.current = null;
        });
        return run;
    }, [commitTime, markSessionExpired, persistAnswers, router, testId]);

    // ── Batched sync ────────────────────────────────────────────────────────
    const flush = useCallback(async (): Promise<void> => {
        const aid = attemptIdRef.current;
        if (!aid || closedRef.current || finishedRef.current || submitPromiseRef.current || sessionExpiredRef.current) return;
        if (syncInFlightRef.current) return syncInFlightRef.current;

        let attemptClosed = false;
        const run = (async () => {
            if (keepaliveInFlightRef.current) await keepaliveInFlightRef.current.catch(() => undefined);
            commitTime();
            const ids = [...dirtyRef.current];
            if (ids.length === 0) return;
            const versions = ids.map((id) => versionRef.current[id] ?? 0);
            const payload = ids.map((id) => toPayload(id, responsesRef.current[id]));

            try {
                const res = await api.post(
                    `/attempts/${aid}/sync`,
                    { responses: payload },
                    { skipAuthRedirect: true, timeout: 20_000 },
                );
                ids.forEach((id, i) => {
                    if ((versionRef.current[id] ?? 0) === versions[i]) dirtyRef.current.delete(id);
                });
                persistAnswers();
                setDirtyCount(dirtyRef.current.size);
                setSyncState('ok');
                backoffRef.current = BACKOFF_BASE_MS;
                nextSyncAtRef.current = Date.now() + SYNC_INTERVAL_MS + Math.random() * SYNC_JITTER_MS;
                applyServerRemaining(res.data);
            } catch (err) {
                const status = httpStatus(err);
                if (status === 409) {
                    // Attempt already closed server-side: stop syncing, go through submit → result.
                    closedRef.current = true;
                    attemptClosed = true;
                    return;
                }
                if (status === 401) {
                    markSessionExpired();
                    return;
                }
                // 429 / 5xx / network: keep dirty, retry with exponential backoff (5s → 60s).
                setSyncState('offline');
                nextSyncAtRef.current = Date.now() + backoffRef.current;
                backoffRef.current = Math.min(BACKOFF_MAX_MS, backoffRef.current * 2);
            }
        })();

        syncInFlightRef.current = run;
        try {
            await run;
        } finally {
            syncInFlightRef.current = null;
        }
        if (attemptClosed) void submitAttempt(true);
    }, [applyServerRemaining, commitTime, markSessionExpired, persistAnswers, submitAttempt]);

    /** Fire-and-forget flush that survives tab close (pagehide / hidden). */
    const flushKeepalive = useCallback(() => {
        const aid = attemptIdRef.current;
        if (!aid || closedRef.current || finishedRef.current || submitPromiseRef.current || sessionExpiredRef.current) return;
        if (dirtyRef.current.size === 0) return;

        const ids = [...dirtyRef.current];
        const versions = ids.map((id) => versionRef.current[id] ?? 0);
        const body = JSON.stringify({ responses: ids.map((id) => toPayload(id, responsesRef.current[id])) });
        const token = getAuthToken();
        const headers: Record<string, string> = {
            'Content-Type': 'application/json',
            Accept: 'application/json',
        };
        if (token) headers.Authorization = `Bearer ${token}`;

        let request: Promise<Response>;
        try {
            request = fetch(`${API_BASE_URL}/attempts/${aid}/sync`, {
                method: 'POST',
                headers,
                body,
                keepalive: body.length <= KEEPALIVE_MAX_BYTES,
            });
        } catch {
            return;
        }

        const tracked = request
            .then((res) => {
                if (res.ok) {
                    ids.forEach((id, i) => {
                        if ((versionRef.current[id] ?? 0) === versions[i]) dirtyRef.current.delete(id);
                    });
                    persistAnswers();
                    setDirtyCount(dirtyRef.current.size);
                    setSyncState('ok');
                } else if (res.status === 409) {
                    closedRef.current = true;
                } else if (res.status === 401) {
                    markSessionExpired();
                }
            })
            .catch(() => undefined)
            .finally(() => {
                if (keepaliveInFlightRef.current === tracked) keepaliveInFlightRef.current = null;
            });
        keepaliveInFlightRef.current = tracked;
    }, [markSessionExpired, persistAnswers]);

    // ── Enter the playing state (fresh start, resume, or refresh) ───────────
    const enterPlaying = useCallback((attempt: AttemptPayload, timing: AttemptTiming, testData: Test) => {
        const aid = Number(attempt.id);

        // Drop leftovers of a different attempt for this test.
        const previous = Number(readStorage(storageKeys.activeAttempt(testId)));
        if (previous && previous !== aid) clearAttemptStorage(previous, testId);

        attemptIdRef.current = aid;
        closedRef.current = false;
        finishedRef.current = false;
        autoSubmitFiredRef.current = false;
        writeStorage(storageKeys.activeAttempt(testId), String(aid));

        const merged = mergeResponses(attempt.responses, readStoredAnswers(aid));
        responsesRef.current = merged.responses;
        dirtyRef.current = merged.dirty;
        versionRef.current = {};

        let dl = deadlineFromTiming(timing, testData.duration_sec);
        if (dl === null) {
            const stored = Number(readStorage(storageKeys.deadline(aid)));
            dl = stored > 0 ? stored : Date.now() + testData.duration_sec * 1000;
        }
        deadlineRef.current = dl;
        writeStorage(storageKeys.deadline(aid), String(dl));

        const questionCount = testData.questions.length;
        const storedIdx = Number(readStorage(storageKeys.index(aid)));
        const idx = Number.isInteger(storedIdx) && storedIdx >= 0 && storedIdx < questionCount ? storedIdx : 0;

        setAttemptId(aid);
        setResponses(merged.responses);
        setDirtyCount(merged.dirty.size);
        setDeadline(dl);
        setTimeLeft(secondsUntil(dl));
        setCurrentQuestionIdx(idx);
        setStep('playing');
        persistAnswers();

        const q = testData.questions[idx];
        if (q) {
            markAsVisited(q.id);
            startTracking(q.id);
        }
        // Unsynced answers from a previous session go out shortly.
        nextSyncAtRef.current = Date.now() + (merged.dirty.size > 0 ? 1_000 : SYNC_INTERVAL_MS) + Math.random() * SYNC_JITTER_MS;
    }, [markAsVisited, persistAnswers, startTracking, testId]);

    // ── Load test, auto-resume an attempt saved on this device ──────────────
    useEffect(() => {
        let cancelled = false;

        (async () => {
            let testData: Test;
            try {
                const res = await api.get(`/tests/${testId}`);
                testData = res.data;
            } catch (error) {
                if (httpStatus(error) === 401) {
                    redirectToLogin();
                    return;
                }
                console.error('Failed to fetch test', error);
                if (!cancelled) {
                    toast.error('Failed to load test');
                    setLoading(false);
                }
                return;
            }
            if (cancelled) return;
            testRef.current = testData;
            setTest(testData);
            setTimeLeft(testData.duration_sec);

            const storedAttempt = Number(readStorage(storageKeys.activeAttempt(testId)));
            if (storedAttempt > 0) {
                try {
                    const res = await api.get(`/attempts/${storedAttempt}`);
                    if (cancelled) return;
                    const attempt = res.data as AttemptPayload;
                    const status = attempt?.status;
                    if (status === 'completed') {
                        clearAttemptStorage(storedAttempt, testId);
                        toast('This attempt was already submitted.');
                        router.replace(`/dashboard/tests/result/${storedAttempt}`);
                        return;
                    }
                    if ((status === 'ongoing' || status === 'in_progress') &&
                        (attempt.test_id === undefined || String(attempt.test_id) === testId)) {
                        enterPlaying(attempt, attempt, testData);
                        toast.success('Attempt Resumed!');
                    } else {
                        clearAttemptStorage(storedAttempt, testId);
                    }
                } catch (err) {
                    if (cancelled) return;
                    const status = httpStatus(err);
                    if (status === 401) {
                        redirectToLogin(); // answers stay in localStorage for after login
                        return;
                    }
                    if (status === 403 || status === 404) {
                        clearAttemptStorage(storedAttempt, testId);
                    } else {
                        // Server busy / network blip: resume from this device's copy and
                        // the locally stored deadline; sync catches up with backoff.
                        enterPlaying({ id: storedAttempt }, {}, testData);
                        setSyncState('offline');
                        nextSyncAtRef.current = Date.now() + BACKOFF_BASE_MS;
                    }
                }
            }
            if (!cancelled) setLoading(false);
        })();

        return () => {
            cancelled = true;
        };
    }, [testId, router, enterPlaying]);

    const startTest = async () => {
        if (!declared) {
            toast.error('Please accept the declaration to continue');
            return;
        }
        const testData = testRef.current;
        if (!testData || isStarting) return;

        setIsStarting(true);
        try {
            const res = await api.post(`/tests/${testId}/attempts`);
            const data = res.data as StartAttemptResponse;
            const attempt = data.attempt;
            const timing: AttemptTiming = {
                started_at: attempt.started_at,
                remaining_sec: data.remaining_sec ?? attempt.remaining_sec,
                deadline_at: data.deadline_at ?? attempt.deadline_at,
                server_time: data.server_time ?? attempt.server_time,
            };
            enterPlaying(attempt, timing, testData);
            toast.success(data.is_resume ? 'Attempt resumed' : 'Test started');
        } catch (error) {
            if (httpStatus(error) === 401) {
                redirectToLogin();
                return;
            }
            toast.error(errorMessage(error, 'Could not start the test'));
        } finally {
            setIsStarting(false);
        }
    };

    const goToQuestion = (idx: number) => {
        const q = test?.questions[idx];
        if (!q) return;
        commitTime();
        setCurrentQuestionIdx(idx);
        const aid = attemptIdRef.current;
        if (aid) writeStorage(storageKeys.index(aid), String(idx));
        markAsVisited(q.id);
        startTracking(q.id);
        if (dirtyRef.current.size >= NAV_FLUSH_THRESHOLD) void flush();
    };

    const toggleFullscreen = () => {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen();
        } else if (document.exitFullscreen) {
            document.exitFullscreen();
        }
    };

    const handleSaveAndNext = () => {
        const currentQ = test?.questions[currentQuestionIdx];
        if (!currentQ) return;

        updateEntry(currentQ.id, (prev) => ({
            ...(prev ?? {}),
            status: prev?.status === 'marked' ? 'marked' : (prev?.selected_option_id ? 'answered' : 'not_answered'),
            visited: true,
        }));

        if (currentQuestionIdx < (test?.questions.length || 0) - 1) {
            goToQuestion(currentQuestionIdx + 1);
        } else {
            toast.success('You have reached the last question.');
        }
    };

    const handleMarkForReview = () => {
        const currentQ = test?.questions[currentQuestionIdx];
        if (!currentQ) return;

        updateEntry(currentQ.id, (prev) => ({
            ...(prev ?? {}),
            status: 'marked',
            visited: true,
        }));

        if (currentQuestionIdx < (test?.questions.length || 0) - 1) {
            goToQuestion(currentQuestionIdx + 1);
        }
    };

    const handleSelectOption = (questionId: number, optionId: number) => {
        updateEntry(questionId, (prev) => ({
            ...(prev ?? {}),
            selected_option_id: optionId,
            status: prev?.status === 'marked' ? 'marked' : 'answered',
            visited: true,
        }));
    };

    const handleClearSelection = () => {
        const currentQ = test?.questions[currentQuestionIdx];
        if (!currentQ) return;

        updateEntry(currentQ.id, (prev) => ({
            ...(prev ?? {}),
            status: 'not_answered',
            selected_option_id: null,
            visited: true,
        }));
    };

    const handleSubmit = () => {
        if (!attemptId || isNaN(Number(attemptId))) {
            toast.error('No active session. Please refresh and try again.');
            return;
        }
        if (isSubmitting) return;
        setShowSubmitModal(true);
    };

    const handleConfirmedSubmit = () => {
        void submitAttempt(false);
    };

    const handleRetrySubmit = () => {
        void submitAttempt(timeLeft <= 0);
    };

    const goToLogin = () => {
        commitTime();
        persistAnswers();
        allowUnloadRef.current = true;
        redirectToLogin();
    };

    // ── Timer + periodic sync tick ──────────────────────────────────────────
    useEffect(() => {
        if (step !== 'playing') return;
        const interval = setInterval(() => {
            const dl = deadlineRef.current;
            if (dl !== null) setTimeLeft(secondsUntil(dl));
            if (dirtyRef.current.size > 0 && Date.now() >= nextSyncAtRef.current) void flush();
        }, 1000);
        return () => clearInterval(interval);
    }, [step, flush]);

    // ── Auto-submit at 0 (effect, never inside a setState updater) ──────────
    const submitAttemptRef = useRef(submitAttempt);
    submitAttemptRef.current = submitAttempt;
    useEffect(() => {
        if (step !== 'playing' || deadline === null || timeLeft > 0) return;
        if (autoSubmitFiredRef.current || finishedRef.current) return;
        autoSubmitFiredRef.current = true;
        // Not cleared on re-render on purpose: the fired flag prevents a re-arm,
        // so clearing here would mean the submit never happens.
        window.setTimeout(() => void submitAttemptRef.current(true), Math.random() * AUTO_SUBMIT_SPREAD_MS);
    }, [step, deadline, timeLeft]);

    // ── Tab hidden / closed / back online / unload guard ────────────────────
    useEffect(() => {
        if (step !== 'playing') return;

        const onVisibilityChange = () => {
            if (document.visibilityState === 'hidden') {
                commitTime();
                currentQRef.current.since = 0; // don't count time while the tab is hidden
                persistAnswers();
                flushKeepalive();
                return;
            }
            currentQRef.current.since = Date.now();
            const dl = deadlineRef.current;
            if (dl !== null) setTimeLeft(secondsUntil(dl));

            // Logged in again (e.g. in another tab)? Resume syncing.
            if (sessionExpiredRef.current) {
                const token = getAuthToken();
                if (token && token !== expiredTokenRef.current) {
                    sessionExpiredRef.current = false;
                    setSessionExpired(false);
                    nextSyncAtRef.current = 0;
                }
            }
            if (closedRef.current && !finishedRef.current) {
                void submitAttempt(true);
            } else if (dirtyRef.current.size > 0) {
                void flush();
            }
        };

        const onPageHide = () => {
            commitTime();
            persistAnswers();
            flushKeepalive();
        };

        const onOnline = () => {
            backoffRef.current = BACKOFF_BASE_MS;
            nextSyncAtRef.current = 0;
            void flush();
        };

        const onBeforeUnload = (e: BeforeUnloadEvent) => {
            if (allowUnloadRef.current || finishedRef.current) return;
            if (dirtyRef.current.size > 0 || submitPromiseRef.current) {
                e.preventDefault();
                e.returnValue = '';
            }
        };

        document.addEventListener('visibilitychange', onVisibilityChange);
        window.addEventListener('pagehide', onPageHide);
        window.addEventListener('online', onOnline);
        window.addEventListener('beforeunload', onBeforeUnload);
        return () => {
            document.removeEventListener('visibilitychange', onVisibilityChange);
            window.removeEventListener('pagehide', onPageHide);
            window.removeEventListener('online', onOnline);
            window.removeEventListener('beforeunload', onBeforeUnload);
        };
    }, [step, commitTime, persistAnswers, flushKeepalive, flush, submitAttempt]);

    if (loading) {
        return (
            <div className="min-h-screen bg-background flex flex-col items-center justify-center p-10 space-y-6">
                <div className="h-20 w-20 bg-blue-600/10 rounded-[2.5rem] flex items-center justify-center animate-pulse">
                    <Zap className="h-10 w-10 text-blue-600" />
                </div>
                <div className="space-y-2 text-center">
                    <h2 className="text-xl font-semibold text-foreground">Loading test</h2>
                    <p className="text-sm text-foreground/60">Please wait while we load the questions…</p>
                </div>
            </div>
        );
    }

    if (step === 'instructions') {
        return (
            <div className="max-w-3xl mx-auto py-6 sm:py-12 px-4">
                <div className="bg-card-bg border border-card-border rounded-2xl shadow-sm overflow-hidden">
                    <div className="p-5 sm:p-8 space-y-8">
                        <div className="flex items-center gap-4">
                            <div className="h-12 w-12 bg-blue-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-blue-500/20">
                                <Info className="h-6 w-6" />
                            </div>
                            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">Test instructions</h1>
                        </div>

                        <div className="space-y-8">
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                <div className="p-4 bg-background rounded-xl border border-card-border space-y-2">
                                    <Clock className="h-5 w-5 text-orange-500" />
                                    <p className="text-xs font-medium text-foreground/60">Duration</p>
                                    <p className="text-lg font-black text-foreground">{Math.floor((test?.duration_sec ?? 0) / 60)} min</p>
                                </div>
                                <div className="p-4 bg-background rounded-xl border border-card-border space-y-2">
                                    <Target className="h-5 w-5 text-green-600" />
                                    <p className="text-xs font-medium text-foreground/60">Total marks</p>
                                    <p className="text-lg font-black text-foreground">{test?.total_marks}</p>
                                </div>
                                <div className="p-4 bg-background rounded-xl border border-card-border space-y-2">
                                    <ClipboardCheck className="h-5 w-5 text-blue-600" />
                                    <p className="text-xs font-medium text-foreground/60">Questions</p>
                                    <p className="text-lg font-black text-foreground">{test?.questions.length}</p>
                                </div>
                                <div className="p-4 bg-background rounded-xl border border-card-border space-y-2">
                                    <AlertCircle className="h-5 w-5 text-red-500" />
                                    <p className="text-xs font-medium text-foreground/60">Negative marking</p>
                                    <p className="text-lg font-black text-foreground">{test?.negative_marking}</p>
                                </div>
                            </div>

                            <div className="space-y-6 text-sm text-foreground/80 leading-relaxed p-6 border border-dashed border-card-border rounded-2xl">
                                <ul className="space-y-4 list-disc pl-5">
                                    <li>Make sure you have a stable internet connection before you start. Your answers are also saved on this device.</li>
                                    <li>Each question has 4 options and only one is correct.</li>
                                    <li>Questions marked for review are still counted if you have selected an answer.</li>
                                    <li>The timer starts as soon as you begin the test.</li>
                                    <li>You can switch between English and Hindi at any time during the test.</li>
                                </ul>
                            </div>
                        </div>

                        <div className="flex justify-end pt-4">
                            <button
                                onClick={() => setStep('declaration')}
                                className="px-6 py-3 min-h-[48px] bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold text-base transition-colors shadow-sm flex items-center gap-2 group"
                            >
                                Next
                                <ChevronRight className="h-5 w-5 group-hover:translate-x-2 transition-transform" />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (step === 'declaration') {
        return (
            <div className="max-w-3xl mx-auto py-6 sm:py-12 px-4">
                <div className="bg-card-bg border border-card-border rounded-2xl shadow-sm overflow-hidden">
                    <div className="p-5 sm:p-8 space-y-8">
                        <div className="flex items-center gap-4">
                            <div className="h-12 w-12 bg-orange-500 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-orange-500/20">
                                <Languages className="h-6 w-6" />
                            </div>
                            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">Language and declaration</h1>
                        </div>

                        <div className="space-y-10">
                            {/* Language Choice */}
                            <div className="space-y-4 p-5 sm:p-6 bg-background rounded-2xl border border-card-border">
                                <label className="text-sm font-semibold text-foreground">Choose your language</label>
                                <div className="flex gap-4">
                                    <button
                                        onClick={() => setLanguage('en')}
                                        className={cn(
                                            "flex-1 py-4 min-h-[56px] rounded-xl font-semibold text-base transition-colors border-2",
                                            language === 'en'
                                                ? "bg-blue-600/10 border-blue-600 text-blue-600 shadow-xl"
                                                : "border-card-border text-foreground/40 hover:border-blue-500/30"
                                        )}
                                    >
                                        English
                                    </button>
                                    <button
                                        onClick={() => setLanguage('hi')}
                                        className={cn(
                                            "flex-1 py-4 min-h-[56px] rounded-xl font-semibold text-base transition-colors border-2",
                                            language === 'hi'
                                                ? "bg-blue-600/10 border-blue-600 text-blue-600 shadow-xl"
                                                : "border-card-border text-foreground/40 hover:border-blue-500/30"
                                        )}
                                    >
                                        Hindi / हिंदी
                                    </button>
                                </div>
                                <p className="text-sm text-foreground/60 text-center">You can switch language for any question during the test</p>
                            </div>

                            {/* Declaration */}
                            <div className="space-y-6">
                                <div className="flex items-start gap-4 p-5 bg-orange-500/5 rounded-2xl border border-orange-500/20">
                                    <div className="pt-1">
                                        <input
                                            type="checkbox"
                                            id="declaration"
                                            checked={declared}
                                            onChange={(e) => setDeclared(e.target.checked)}
                                            className="h-6 w-6 rounded-lg bg-background border-card-border text-blue-600 focus:ring-blue-500/20 cursor-pointer"
                                        />
                                    </div>
                                    <label htmlFor="declaration" className="text-sm text-foreground/80 leading-relaxed cursor-pointer select-none">
                                        I have read and understood the instructions. All computer hardware allotted to me are in proper working condition. I declare that I am not in possession of / not wearing any prohibited gadgets and I will not engage in any unfair means. Any engagement in prohibited items/unfair means shall disqualify me.
                                    </label>
                                </div>
                            </div>
                        </div>

                        <div className="flex flex-col-reverse sm:flex-row sm:items-center sm:justify-between gap-3 pt-4">
                            <button
                                onClick={() => setStep('instructions')}
                                className="px-4 py-3 min-h-[44px] text-sm font-medium text-foreground/70 hover:text-foreground transition-colors flex items-center justify-center gap-2"
                            >
                                <ChevronLeft className="h-4 w-4" />
                                Back to instructions
                            </button>
                            <button
                                onClick={startTest}
                                disabled={isStarting}
                                className={cn(
                                    "px-6 py-3 min-h-[48px] rounded-xl font-semibold text-base transition-colors flex items-center justify-center gap-2 group shadow-sm",
                                    declared
                                        ? "bg-green-500 hover:bg-green-600 text-white shadow-green-500/20 active:scale-95"
                                        : "bg-gray-200 dark:bg-gray-800 text-foreground/20 cursor-not-allowed shadow-none"
                                )}
                            >
                                Start test
                                {isStarting
                                    ? <Loader2 className="h-5 w-5 animate-spin" />
                                    : <Play className="h-5 w-5 group-hover:scale-110 transition-transform" />}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    const formatTime = (sec: number) => {
        const h = Math.floor(sec / 3600);
        const m = Math.floor((sec % 3600) / 60);
        const s = sec % 60;
        return `${h > 0 ? h + ':' : ''}${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    };

    if (step === 'playing') {
        const currentQ = test?.questions[currentQuestionIdx];
        const isOffline = sessionExpired || syncState === 'offline';
        const syncLabel = sessionExpired
            ? 'Session expired – answers saved on this device'
            : syncState === 'offline'
                ? 'Offline – answers saved on this device'
                : dirtyCount > 0
                    ? 'Saving…'
                    : 'All answers saved';
        const timeUp = deadline !== null && timeLeft <= 0;
        // Lock the paper as soon as time is up (auto-submit may be a few seconds away).
        const showSubmitOverlay = !!submitError || timeUp;

        return (
            <div className="fixed inset-0 bg-background z-[100] flex flex-col font-sans">
                {/* 1. Header Bar */}
                <div className="h-16 sm:h-20 bg-card-bg border-b border-card-border px-3 sm:px-6 flex items-center justify-between gap-2 shadow-sm">
                    <div className="flex items-center gap-6">
                        <div className="h-10 w-10 bg-blue-600 rounded-xl flex items-center justify-center text-white">
                            <Zap className="h-5 w-5" />
                        </div>
                        <div className="hidden md:block">
                            <h2 className="text-sm font-semibold text-foreground truncate max-w-[280px]">{test?.name_en}</h2>
                            <p className="text-xs text-foreground/50 mt-0.5">Test ID: {test?.id}</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3 sm:gap-6">
                        {/* Status Counts */}
                        <div className="hidden lg:flex items-center gap-6 border-r border-card-border pr-10">
                            {[
                                { label: 'Answered', count: Object.values(responses).filter(r => r.status === 'answered').length, color: 'text-green-500' },
                                { label: 'Marked', count: Object.values(responses).filter(r => r.status === 'marked').length, color: 'text-purple-500' },
                                { label: 'Not answered', count: (test?.questions.length || 0) - Object.keys(responses).length, color: 'text-foreground/20' }
                            ].map((s, i) => (
                                <div key={i} className="text-center">
                                    <p className={cn("text-lg font-black leading-none", s.color)}>{s.count}</p>
                                    <p className="text-xs font-semibold text-foreground/60 mt-1">{s.label}</p>
                                </div>
                            ))}
                        </div>

                        {/* Save status (unobtrusive) */}
                        <div
                            className={cn(
                                "hidden sm:flex items-center gap-2 text-xs font-medium",
                                isOffline ? "text-orange-500" : "text-foreground/30"
                            )}
                            aria-live="polite"
                        >
                            {isOffline
                                ? <CloudOff className="h-3.5 w-3.5" />
                                : dirtyCount > 0
                                    ? <CloudUpload className="h-3.5 w-3.5 animate-pulse" />
                                    : <CheckCircle2 className="h-3.5 w-3.5 text-green-500" />}
                            <span className="max-w-[160px] leading-tight">{syncLabel}</span>
                        </div>

                        {/* Timer */}
                        <div className={cn(
                            "flex items-center gap-2 sm:gap-3 px-3 sm:px-5 py-2 rounded-xl border transition-colors",
                            timeLeft < 300 ? "bg-red-500/10 border-red-500/20 text-red-500" : "bg-blue-500/5 border-blue-500/10 text-blue-600"
                        )}>
                            <Timer className={cn("h-5 w-5", timeLeft < 300 && "animate-pulse")} />
                            <span className="text-lg sm:text-xl font-bold tabular-nums">{formatTime(timeLeft)}</span>
                        </div>

                        {/* Controls */}
                        <div className="flex items-center gap-3">
                            <button
                                onClick={handleSubmit}
                                disabled={isSubmitting}
                                className="h-11 border border-card-border rounded-xl px-4 text-sm font-semibold text-foreground/70 hover:bg-background transition-colors"
                            >
                                {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Submit test'}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Session expired notice — answers keep being saved on this device */}
                {sessionExpired && (
                    <div className="bg-orange-500/10 border-b border-orange-500/20 px-4 sm:px-6 py-3 flex items-center justify-between gap-4">
                        <div className="flex items-center gap-3 text-orange-600">
                            <AlertCircle className="h-4 w-4 shrink-0" />
                            <p className="text-sm font-medium">
                                Your session has expired. Sign in again to continue — your answers are saved on this device.
                            </p>
                        </div>
                        <button
                            onClick={goToLogin}
                            className="shrink-0 px-4 py-2 min-h-[40px] bg-orange-500 hover:bg-orange-600 text-white rounded-xl font-semibold text-sm transition-colors"
                        >
                            Sign in again
                        </button>
                    </div>
                )}

                {/* 2. Main Workspace */}
                <div className="flex-1 flex overflow-hidden relative">
                    {/* Left: Question Area */}
                    <div className="flex-1 overflow-y-auto no-scrollbar p-4 sm:p-8 lg:p-12 bg-background">
                        <div className="max-w-4xl mx-auto space-y-8">
                            {/* Question Header */}
                            <div className="flex items-center justify-between border-b border-card-border pb-6">
                                <span className="bg-blue-600/10 text-blue-700 dark:text-blue-300 text-sm font-semibold px-3 py-1.5 rounded-full border border-blue-600/20">
                                    Question {currentQuestionIdx + 1}
                                </span>
                                <div className="flex items-center gap-4">
                                    <button
                                        onClick={toggleFullscreen}
                                        className="h-10 w-10 flex items-center justify-center bg-card-bg border border-card-border rounded-full hover:text-blue-600 transition-colors"
                                    >
                                        <Maximize className="h-4 w-4" />
                                    </button>
                                    <button
                                        onClick={() => setLanguage(language === 'en' ? 'hi' : 'en')}
                                        className="flex items-center gap-2 px-3 py-2 min-h-[40px] bg-card-bg border border-card-border rounded-full text-sm font-medium text-foreground/70 hover:text-blue-600 transition-colors"
                                    >
                                        <Languages className="h-4 w-4" />
                                        {language === 'en' ? 'Hindi' : 'English'}
                                    </button>
                                </div>
                            </div>

                            {/* Question Text */}
                            <div className="space-y-8">
                                <div
                                    className="text-lg sm:text-xl font-semibold text-foreground leading-relaxed"
                                    dangerouslySetInnerHTML={{ __html: (language === 'en' ? currentQ?.question_en : currentQ?.question_hi) || '' }}
                                />

                                {currentQ?.image_path && (
                                    <div className="rounded-[2.5rem] overflow-hidden border border-card-border shadow-2xl">
                                        {/* eslint-disable-next-line @next/next/no-img-element */}
                                        <img
                                            src={storageUrl(currentQ.image_path)}
                                            alt="Question image"
                                            className="w-full object-contain max-h-[400px]"
                                        />
                                    </div>
                                )}
                            </div>

                            {/* Options */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4 pb-24">
                                {currentQ?.options.map((opt, idx) => {
                                    const isSelected = responses[currentQ.id]?.selected_option_id === opt.id;
                                    return (
                                        <button
                                            key={opt.id}
                                            onClick={() => handleSelectOption(currentQ.id, opt.id)}
                                            className={cn(
                                                "p-4 sm:p-5 rounded-2xl border-2 text-left transition-colors relative group flex flex-col gap-3",
                                                isSelected
                                                    ? "bg-blue-600/10 border-blue-600 shadow-xl"
                                                    : "bg-card-bg border-card-border hover:border-blue-500/30"
                                            )}
                                        >
                                            <div className="flex items-center gap-4">
                                                <div className={cn(
                                                    "h-10 w-10 shrink-0 rounded-xl flex items-center justify-center text-xs font-black border transition-all",
                                                    isSelected ? "bg-blue-600 border-blue-600 text-white" : "bg-background border-card-border text-foreground/40"
                                                )}>
                                                    {String.fromCharCode(65 + idx)}
                                                </div>
                                                <span className={cn(
                                                    "text-base font-medium",
                                                    isSelected ? "text-blue-600" : "text-foreground/60"
                                                )}>
                                                    {language === 'en' ? opt.option_en : opt.option_hi}
                                                </span>
                                            </div>

                                            {opt.image_path && (
                                                <div className="rounded-2xl overflow-hidden border border-card-border/50">
                                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                                    <img
                                                        src={storageUrl(opt.image_path)}
                                                        alt="Option image"
                                                        className="w-full object-contain max-h-[150px]"
                                                    />
                                                </div>
                                            )}

                                            {isSelected && <div className="absolute top-4 right-4 h-2 w-2 bg-blue-600 rounded-full animate-ping" />}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    </div>

                    {/* Right: Palette Sidebar */}
                    <div className={cn(
                        "bg-card-bg border-l border-card-border transition-all overflow-hidden flex flex-col",
                        isSidebarOpen ? "absolute inset-y-0 right-0 z-20 w-full sm:static sm:w-[360px] lg:w-[400px]" : "w-0"
                    )}>
                        <div className="p-5 border-b border-card-border flex items-center justify-between">
                            <div className="space-y-1">
                                <h3 className="text-sm font-semibold text-foreground leading-none">Question palette</h3>
                                <p className="text-xs text-foreground/60 truncate max-w-[220px]">{test?.name_en}</p>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className={cn(
                                    "h-2 w-2 rounded-full",
                                    isOffline
                                        ? "bg-orange-500 shadow-[0_0_8px_rgba(249,115,22,0.5)]"
                                        : "bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]"
                                )} />
                                <span className="text-xs text-foreground/60">
                                    {isOffline ? 'Saved on device' : dirtyCount > 0 ? 'Saving…' : 'All saved'}
                                </span>
                            </div>
                        </div>

                        {/* Top: Final Submission and Stats Breakdown */}
                        <div className="p-5 border-b border-card-border bg-emerald-600/5">
                            <button
                                onClick={handleSubmit}
                                disabled={isSubmitting}
                                className="w-full py-3 min-h-[44px] bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-semibold text-sm shadow-sm transition-colors flex items-center justify-center gap-2"
                            >
                                {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <ShieldCheck className="h-4 w-4" />}
                                Submit test
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto no-scrollbar p-5">
                            <div className="grid grid-cols-5 gap-3">
                                {test?.questions.map((q, i) => {
                                    const resp = responses[q.id];
                                    const isCurrent = currentQuestionIdx === i;

                                    let btnClass = "bg-background border-card-border text-foreground/20 italic"; // Not visited
                                    if (resp?.visited && !resp?.selected_option_id && resp?.status !== 'marked') {
                                        btnClass = "bg-red-500 border-red-500 text-white shadow-lg shadow-red-500/20";
                                    }
                                    if (resp?.status === 'answered') {
                                        btnClass = "bg-green-500 border-green-500 text-white shadow-lg shadow-green-500/20";
                                    }
                                    if (resp?.status === 'marked') {
                                        btnClass = "bg-purple-600 border-purple-600 text-white shadow-lg shadow-purple-600/20";
                                    }
                                    if (isCurrent) btnClass += " ring-4 ring-blue-500/30 ring-offset-2 ring-offset-background scale-110 z-10";

                                    return (
                                        <button
                                            key={q.id}
                                            onClick={() => goToQuestion(i)}
                                            className={cn(
                                                "h-12 w-12 rounded-xl border flex items-center justify-center text-[10px] font-black transition-all hover:scale-110 relative",
                                                btnClass
                                            )}
                                        >
                                            {i + 1}
                                            {resp?.status === 'marked' && resp?.selected_option_id && (
                                                <div className="absolute -top-1 -right-1 h-3 w-3 bg-green-400 border-2 border-white dark:border-gray-800 rounded-full" />
                                            )}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Legend */}
                        <div className="p-5 border-t border-card-border bg-background/50 grid grid-cols-2 gap-3">
                            <div className="flex items-center gap-3">
                                <div className="h-3 w-3 rounded-full bg-green-500" />
                                <span className="text-xs text-foreground/70">Answered</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="h-3 w-3 rounded-full bg-red-500" />
                                <span className="text-xs text-foreground/70">Not answered</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="h-3 w-3 rounded-full bg-purple-600" />
                                <span className="text-xs text-foreground/70">Marked for review</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="h-3 w-3 rounded-full bg-background border border-card-border" />
                                <span className="text-xs text-foreground/70">Not visited</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* 3. Footer Action Bar */}
                <div className="min-h-[72px] bg-card-bg border-t border-card-border px-3 sm:px-6 py-2 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                        <button
                            onClick={handleMarkForReview}
                            className="px-3 sm:px-4 py-2.5 min-h-[44px] border border-card-border hover:border-purple-500/40 text-foreground/70 hover:text-purple-600 rounded-xl text-sm font-medium transition-colors"
                        >
                            Mark for review & next
                        </button>
                        <button
                            onClick={handleClearSelection}
                            className="px-3 sm:px-4 py-2.5 min-h-[44px] text-foreground/60 hover:text-red-500 text-sm font-medium transition-colors"
                        >
                            Clear
                        </button>
                    </div>

                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                            aria-label="Toggle question palette"
                            className="h-11 w-11 bg-background border border-card-border rounded-xl flex items-center justify-center text-foreground/70 hover:text-blue-600 transition-colors"
                        >
                            <Menu className="h-6 w-6" />
                        </button>
                        <button
                            onClick={handleSaveAndNext}
                            className="px-5 sm:px-8 py-2.5 min-h-[44px] bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold text-sm shadow-sm transition-colors flex items-center gap-2"
                        >
                            Save & Next
                            <ChevronRight className="h-4 w-4" />
                        </button>
                    </div>
                </div>

                <div className="hidden sm:block fixed bottom-28 right-6 lg:right-12 z-[50]">
                    <button
                        onClick={handleSubmit}
                        disabled={isSubmitting}
                        className="p-6 bg-emerald-600 hover:bg-emerald-700 text-white rounded-full shadow-2xl shadow-emerald-500/20 active:scale-90 transition-all group overflow-hidden relative"
                    >
                        <div className="flex items-center gap-3">
                            <Rocket className="h-6 w-6 group-hover:translate-x-12 transition-all duration-500" />
                            <span className="text-[10px] font-black uppercase tracking-widest hidden group-hover:block animate-in slide-in-from-left duration-300">Submit test</span>
                        </div>
                    </button>
                </div>

                {/* Submit Confirmation Modal */}
                {showSubmitModal && (
                    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-xl z-[300] flex items-center justify-center p-6 animate-in fade-in duration-200">
                        <div className="bg-card-bg border border-card-border rounded-2xl p-6 sm:p-8 max-w-md w-full shadow-2xl space-y-6">
                            <div className="flex flex-col items-center text-center space-y-4">
                                <div className="h-16 w-16 bg-orange-500/10 rounded-[2rem] flex items-center justify-center border border-orange-500/20">
                                    <ShieldCheck className="h-8 w-8 text-orange-500" />
                                </div>
                                <h2 className="text-2xl font-bold tracking-tight text-foreground">Submit test?</h2>
                                <p className="text-sm text-foreground/70 leading-relaxed">
                                    Once you submit, you cannot change your answers.
                                </p>
                            </div>

                            <div className="grid grid-cols-3 gap-3 text-center p-4 bg-background rounded-xl border border-card-border">
                                <div>
                                    <p className="text-xl font-black text-green-500">{Object.values(responses).filter(r => r.status === 'answered').length}</p>
                                    <p className="text-xs text-foreground/60 mt-1">Answered</p>
                                </div>
                                <div>
                                    <p className="text-xl font-black text-purple-500">{Object.values(responses).filter(r => r.status === 'marked').length}</p>
                                    <p className="text-xs text-foreground/60 mt-1">Marked</p>
                                </div>
                                <div>
                                    <p className="text-xl font-black text-foreground/30">{(test?.questions.length || 0) - Object.values(responses).filter(r => r.status === 'answered' || r.status === 'marked').length}</p>
                                    <p className="text-xs text-foreground/60 mt-1">Not answered</p>
                                </div>
                            </div>

                            <div className="flex gap-4">
                                <button
                                    onClick={() => setShowSubmitModal(false)}
                                    className="flex-1 py-3 min-h-[44px] border border-card-border rounded-xl text-sm font-semibold text-foreground/70 hover:text-foreground hover:bg-background transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleConfirmedSubmit}
                                    disabled={isSubmitting}
                                    className="flex-1 py-3 min-h-[44px] bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-semibold shadow-sm transition-colors flex items-center justify-center gap-2"
                                >
                                    {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Yes, submit'}
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Time-up / submission failure overlay */}
                {showSubmitOverlay && (
                    <div className="fixed inset-0 bg-slate-950/90 backdrop-blur-xl z-[250] flex flex-col items-center justify-center p-12 text-center animate-in fade-in duration-300">
                        <div className="h-24 w-24 bg-blue-600/10 rounded-[3rem] flex items-center justify-center mb-10 border border-blue-600/20">
                            {submitError
                                ? <AlertCircle className="h-10 w-10 text-orange-500" />
                                : <Loader2 className="h-10 w-10 text-blue-600 animate-spin" />}
                        </div>
                        <h2 className="text-3xl font-bold text-white tracking-tight mb-4">
                            {submitError ? 'Submission pending' : 'Time up'}
                        </h2>
                        <p className="text-base text-white/70 mb-12 max-w-2xl">
                            {submitError
                                ? `${submitError} Your answers are saved on this device.`
                                : 'Submitting your answers…'}
                        </p>
                        {submitError && (
                            <div className="flex flex-wrap items-center justify-center gap-4">
                                {sessionExpired ? (
                                    <button
                                        onClick={goToLogin}
                                        className="px-6 py-3 min-h-[48px] bg-orange-500 hover:bg-orange-600 text-white rounded-xl font-semibold text-base transition-colors shadow-sm"
                                    >
                                        Sign in again
                                    </button>
                                ) : (
                                    <button
                                        onClick={handleRetrySubmit}
                                        disabled={isSubmitting}
                                        className="px-6 py-3 min-h-[48px] bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold text-base transition-colors shadow-sm flex items-center gap-2"
                                    >
                                        {isSubmitting ? <Loader2 className="h-5 w-5 animate-spin" /> : <RotateCw className="h-5 w-5" />}
                                        Retry submission
                                    </button>
                                )}
                                {!timeUp && (
                                    <button
                                        onClick={() => setSubmitError(null)}
                                        className="px-6 py-3 min-h-[48px] text-sm font-medium text-white/70 hover:text-white transition-colors"
                                    >
                                        Back to test
                                    </button>
                                )}
                            </div>
                        )}
                    </div>
                )}
            </div>
        );
    }
}
