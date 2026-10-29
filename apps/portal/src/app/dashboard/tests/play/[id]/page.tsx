'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import axios from 'axios';
import api, { API_BASE_URL, getAuthToken } from '@/lib/api';
import QuestionText from '@/components/tests/QuestionText';
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
import { useAuth } from '@/components/providers/AuthProvider';
import {
    CBT_TEXT,
    GeneralInstructions,
    OtherInstructions,
    PaletteLegend,
    PALETTE_CLASSES,
    SectionStrip,
    SectionSummaryTable,
    TickBadge,
    ViewInSelect,
    countPalette,
    isSectionState,
    paletteStatus,
    sectionName,
    type SectionState,
    type SectionStatus,
    type SectionSummaryRow,
    type TestSection,
} from '@/components/tests/SectionedPlayer';

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
    sections?: TestSection[] | null;
    section_mode?: 'sequential' | 'free' | null;
    /** false on DSSSB papers: "Answered & Marked for Review" is scored as unattempted. */
    evaluate_marked?: boolean | null;
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
    section_state?: SectionState | null;
};

type StartAttemptResponse = AttemptTiming & {
    attempt: AttemptPayload;
    is_resume?: boolean;
};

type StoredAnswers = { responses: ResponseMap; dirty: number[] };

/** Last section_state seen from the server, with when it arrived (for offline resume). */
type StoredSectionState = { state: SectionState; receivedAt: number };

type LockResponse = {
    completed: boolean;
    section_state?: SectionState;
    remaining_sec?: number;
    attempt?: AttemptPayload;
};

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
    sections: (attemptId: number) => `osd_attempt_${attemptId}_sections`,
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
    removeStorage(storageKeys.sections(attemptId));
    if (testId && readStorage(storageKeys.activeAttempt(testId)) === String(attemptId)) {
        removeStorage(storageKeys.activeAttempt(testId));
    }
}

function readStoredSectionState(attemptId: number): StoredSectionState | null {
    const raw = readStorage(storageKeys.sections(attemptId));
    if (!raw) return null;
    try {
        const parsed = JSON.parse(raw) as Partial<StoredSectionState>;
        if (!isSectionState(parsed.state) || !Number.isFinite(Number(parsed.receivedAt))) return null;
        return { state: parsed.state, receivedAt: Number(parsed.receivedAt) };
    } catch {
        return null;
    }
}

// ── Pure helpers ────────────────────────────────────────────────────────────
function testSections(test: Test | null | undefined): TestSection[] {
    return Array.isArray(test?.sections) ? test.sections.filter((s) => s && s.count > 0) : [];
}

function isSequentialTest(test: Test | null | undefined): boolean {
    return test?.section_mode === 'sequential' && testSections(test).length > 0;
}

/** Index of the section that holds question `idx`, or -1. */
function sectionIndexOf(sections: TestSection[], idx: number): number {
    return sections.findIndex((s) => idx >= s.from && idx < s.from + s.count);
}

/** Section the student may answer right now (sequential mode), or null. */
function activeSectionOf(test: Test | null | undefined, state: SectionState | null): TestSection | null {
    if (!state?.active_key) return null;
    return testSections(test).find((s) => s.key === state.active_key) ?? null;
}

function sectionQuestionIds(test: Test, section: TestSection): number[] {
    return test.questions.slice(section.from, section.from + section.count).map((q) => q.id);
}

function errorCode(err: unknown): string | undefined {
    if (!axios.isAxiosError(err)) return undefined;
    return (err.response?.data as { code?: string } | undefined)?.code;
}

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
    // Palette: open beside the question on tablets and desktops; on phones it
    // covers the question, so it starts closed and opens from the ≡ button.
    const [isSidebarOpen, setIsSidebarOpen] = useState(() => (typeof window === 'undefined' ? true : window.innerWidth >= 640));
    const closePaletteOnPhone = () => { if (typeof window !== 'undefined' && window.innerWidth < 640) setIsSidebarOpen(false); };
    const [attemptId, setAttemptId] = useState<number | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitError, setSubmitError] = useState<string | null>(null);
    const [showSubmitModal, setShowSubmitModal] = useState(false);
    const [dirtyCount, setDirtyCount] = useState(0);
    const [syncState, setSyncState] = useState<SyncState>('ok');
    const [sessionExpired, setSessionExpired] = useState(false);
    const { user } = useAuth();

    // Sections ("groups", DSSSB/TCS style). All null/empty for tests without sections.
    const [sectionState, setSectionState] = useState<SectionState | null>(null);
    const [blockDeadline, setBlockDeadline] = useState<number | null>(null);
    const [blockTimeLeft, setBlockTimeLeft] = useState<number | null>(null);
    const [blockExpired, setBlockExpired] = useState(false); // group timer hit 0; waiting for the server
    const [showSectionModal, setShowSectionModal] = useState(false);
    const [isLocking, setIsLocking] = useState(false);
    const [notice, setNotice] = useState<{ text: string; okLabel?: string; onOk?: () => void } | null>(null);
    // TCS save rule: a selection is only saved by Save & Next / Mark for Review & Next.
    const [draft, setDraft] = useState<{ qid: number; optionId: number | null } | null>(null);
    const [languageChosen, setLanguageChosen] = useState(false);

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
    const currentIdxRef = useRef(0);
    const sectionStateRef = useRef<SectionState | null>(null);
    const writableRef = useRef<Set<number> | null>(null); // null = every question can be answered
    const blockDeadlineRef = useRef<number | null>(null);
    const blockExpiryRef = useRef<{ key: string | null; nextTryAt: number }>({ key: null, nextTryAt: 0 });
    const blockPreFlushRef = useRef<string | null>(null);
    const lockInFlightRef = useRef<Promise<void> | null>(null);
    const refreshInFlightRef = useRef<Promise<void> | null>(null);
    const lastIdxBySectionRef = useRef<Record<string, number>>({});

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
        // Sequential sections: only the open group takes answers (the server drops the rest).
        if (writableRef.current && !writableRef.current.has(questionId)) return;
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

    // ── Sections ────────────────────────────────────────────────────────────
    /**
     * Stores a server section_state (never computed locally) and derives which
     * questions can be answered and the group timer. Returns the previously
     * active key, or undefined when there was no state before.
     */
    const applySectionState = useCallback((state: SectionState | null | undefined, receivedAt = Date.now()): string | null | undefined => {
        const testData = testRef.current;
        if (!isSectionState(state) || !testData) return undefined;
        const prevKey = sectionStateRef.current ? sectionStateRef.current.active_key : undefined;
        sectionStateRef.current = state;
        setSectionState(state);

        const sequential = state.mode === 'sequential' && isSequentialTest(testData);
        const active = activeSectionOf(testData, state);
        writableRef.current = sequential ? new Set(active ? sectionQuestionIds(testData, active) : []) : null;

        const row = state.sections.find((r) => r.key === state.active_key);
        const rem = row?.remaining_sec;
        const bdl = sequential && rem !== null && rem !== undefined && Number.isFinite(Number(rem))
            ? receivedAt + Math.max(0, Number(rem)) * 1000
            : null;
        blockDeadlineRef.current = bdl;
        setBlockDeadline(bdl);
        setBlockTimeLeft(bdl === null ? null : secondsUntil(bdl));
        setBlockExpired(bdl !== null && secondsUntil(bdl) <= 0);
        if (blockExpiryRef.current.key !== state.active_key) blockExpiryRef.current = { key: state.active_key, nextTryAt: 0 };

        const aid = attemptIdRef.current;
        if (aid) writeStorage(storageKeys.sections(aid), JSON.stringify({ state, receivedAt } satisfies StoredSectionState));
        return prevKey;
    }, []);

    const goToQuestion = useCallback((idx: number) => {
        const testData = testRef.current;
        const q = testData?.questions[idx];
        if (!testData || !q) return;
        // Sequential sections: only questions of the open group can be opened.
        if (writableRef.current && !writableRef.current.has(q.id)) return;
        commitTime();
        setDraft(null); // moving away discards an unsaved selection (TCS rule)
        setCurrentQuestionIdx(idx);
        currentIdxRef.current = idx;
        const sections = testSections(testData);
        const secIdx = sectionIndexOf(sections, idx);
        if (secIdx >= 0) lastIdxBySectionRef.current[sections[secIdx].key] = idx;
        const aid = attemptIdRef.current;
        if (aid) writeStorage(storageKeys.index(aid), String(idx));
        markAsVisited(q.id);
        startTracking(q.id);
        if (dirtyRef.current.size >= NAV_FLUSH_THRESHOLD) nextSyncAtRef.current = 0; // next tick flushes
    }, [commitTime, markAsVisited, startTracking]);

    const finishAndShowResult = useCallback((aid: number, message: string) => {
        finishedRef.current = true;
        closedRef.current = true;
        dirtyRef.current.clear();
        setDirtyCount(0);
        clearAttemptStorage(aid, testId);
        toast.success(message);
        router.push(`/dashboard/tests/result/${aid}`);
    }, [router, testId]);

    /** For questions that can no longer be answered, the server's copy wins. */
    const reconcileReadOnly = useCallback((server: ServerResponse[] | undefined) => {
        const writable = writableRef.current;
        const testData = testRef.current;
        if (!writable || !testData || !Array.isArray(server)) return;
        const byId = new Map(server.map((r) => [r.question_id, r]));
        const next: ResponseMap = { ...responsesRef.current };
        let changed = false;
        for (const q of testData.questions) {
            if (writable.has(q.id)) continue;
            dirtyRef.current.delete(q.id);
            const local = next[q.id];
            const r = byId.get(q.id);
            if (!local && !r) continue;
            const selected = r?.selected_option_id ?? null;
            const status = r ? statusFromServer(r) : 'not_answered';
            if (local && (local.selected_option_id ?? null) === selected && local.status === status) continue;
            next[q.id] = { ...(local ?? {}), selected_option_id: selected, status, visited: local?.visited ?? true };
            changed = true;
        }
        if (changed) {
            responsesRef.current = next;
            setResponses(next);
        }
        setDirtyCount(dirtyRef.current.size);
        persistAnswers();
    }, [persistAnswers]);

    /** Applies a new section_state and moves the student into the open group when it changed. */
    const handleSectionUpdate = useCallback((state: SectionState | null | undefined, cause: 'student' | 'server', receivedAt?: number) => {
        const prevKey = applySectionState(state, receivedAt);
        const testData = testRef.current;
        if (!isSectionState(state) || !testData || state.mode !== 'sequential') return;
        const active = activeSectionOf(testData, state);
        if (!active) return;
        const currentQ = testData.questions[currentIdxRef.current];
        const inActive = !!currentQ && !!writableRef.current?.has(currentQ.id);
        if (prevKey !== undefined && prevKey !== state.active_key) {
            goToQuestion(active.from);
            if (cause === 'server') {
                const prev = testSections(testData).find((s) => s.key === prevKey);
                const prevRow = state.sections.find((r) => r.key === prevKey);
                const why = prevRow?.locked_by === 'timer' ? 'because its time is over' : 'already (for example on another device)';
                setNotice({
                    text: `${prev ? `“${prev.name_en}”` : 'The previous group'} has been submitted ${why}. You are now in “${active.name_en}”.`,
                });
            }
        } else if (!inActive) {
            goToQuestion(lastIdxBySectionRef.current[active.key] ?? active.from);
        }
    }, [applySectionState, goToQuestion]);

    /** Re-reads the attempt (after a group timer ran out, a rejected answer, or a 409). */
    const refreshAttempt = useCallback((): Promise<void> => {
        const aid = attemptIdRef.current;
        if (!aid || finishedRef.current) return Promise.resolve();
        if (refreshInFlightRef.current) return refreshInFlightRef.current;
        const run = (async () => {
            try {
                const res = await api.get(`/attempts/${aid}`, { skipAuthRedirect: true, timeout: 20_000 });
                const attempt = res.data as AttemptPayload;
                if (attempt?.status === 'completed') {
                    finishAndShowResult(aid, 'Your test has been submitted.');
                    return;
                }
                applyServerRemaining(attempt);
                handleSectionUpdate(attempt?.section_state, 'server');
                reconcileReadOnly(attempt?.responses);
                setSyncState('ok');
            } catch (err) {
                if (httpStatus(err) === 401) markSessionExpired();
                else setSyncState('offline');
            }
        })();
        refreshInFlightRef.current = run;
        void run.finally(() => {
            refreshInFlightRef.current = null;
        });
        return run;
    }, [applyServerRemaining, finishAndShowResult, handleSectionUpdate, markSessionExpired, reconcileReadOnly]);

    // ── Batched sync ────────────────────────────────────────────────────────
    const flush = useCallback(async (): Promise<void> => {
        const aid = attemptIdRef.current;
        if (!aid || closedRef.current || finishedRef.current || submitPromiseRef.current || sessionExpiredRef.current) return;
        if (lockInFlightRef.current) return; // the lock call carries this group's answers
        if (syncInFlightRef.current) return syncInFlightRef.current;

        let attemptClosed = false;
        let lockedRejected = 0;
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
                const data = res.data as { section_state?: SectionState; locked_rejected?: number } | undefined;
                if (data?.section_state) handleSectionUpdate(data.section_state, 'server');
                lockedRejected = Number(data?.locked_rejected) || 0;
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
        if (lockedRejected > 0) {
            // Answers for a group that was already closed: show the server's copy again.
            setNotice({
                text: `${lockedRejected} answer${lockedRejected === 1 ? ' was' : 's were'} not saved because ${lockedRejected === 1 ? 'its' : 'their'} group had already been submitted.`,
            });
            void refreshAttempt();
        }
    }, [applyServerRemaining, commitTime, handleSectionUpdate, markSessionExpired, persistAnswers, refreshAttempt, submitAttempt]);

    /** Fire-and-forget flush that survives tab close (pagehide / hidden). */
    const flushKeepalive = useCallback(() => {
        const aid = attemptIdRef.current;
        if (!aid || closedRef.current || finishedRef.current || submitPromiseRef.current || sessionExpiredRef.current) return;
        if (lockInFlightRef.current) return;
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

    // ── Submit the open group (sequential sections) ─────────────────────────
    const lockSection = useCallback((): Promise<void> => {
        if (lockInFlightRef.current) return lockInFlightRef.current;
        const aid = attemptIdRef.current;
        const testData = testRef.current;
        const active = activeSectionOf(testData, sectionStateRef.current);
        if (!aid || !testData || !active || finishedRef.current || submitPromiseRef.current) return Promise.resolve();

        const run = (async () => {
            setIsLocking(true);
            await Promise.allSettled([syncInFlightRef.current, keepaliveInFlightRef.current].filter(Boolean));
            commitTime();
            // This group's unsaved answers travel with the lock call.
            const blockIds = new Set(sectionQuestionIds(testData, active));
            const ids = [...dirtyRef.current].filter((id) => blockIds.has(id));
            const payload = ids.map((id) => toPayload(id, responsesRef.current[id]));
            try {
                const res = await api.post(
                    `/attempts/${aid}/sections/${encodeURIComponent(active.key)}/lock`,
                    { responses: payload },
                    { skipAuthRedirect: true, timeout: 30_000 },
                );
                const data = res.data as LockResponse;
                // The group is closed now: anything of it still marked unsaved (e.g. time
                // spent, committed while the request was in flight) can no longer be sent.
                for (const id of blockIds) dirtyRef.current.delete(id);
                setDirtyCount(dirtyRef.current.size);
                persistAnswers();
                setShowSectionModal(false);
                setSyncState('ok');
                if (data.completed) {
                    finishAndShowResult(aid, 'All the responses provided by you are saved in the system and the assessment has been submitted successfully.');
                    return;
                }
                applyServerRemaining(data);
                handleSectionUpdate(data.section_state, 'student');
                const next = activeSectionOf(testRef.current, sectionStateRef.current);
                toast.success(next ? `Group submitted. “${next.name_en}” is now open.` : 'Group submitted.');
            } catch (err) {
                const status = httpStatus(err);
                const code = errorCode(err);
                setShowSectionModal(false);
                if (status === 409 && code === 'SECTION_NOT_ACTIVE') {
                    // The group was already closed (its timer, or another device): follow the server.
                    const data = axios.isAxiosError(err) ? (err.response?.data as { section_state?: SectionState } | undefined) : undefined;
                    handleSectionUpdate(data?.section_state, 'server');
                    await refreshAttempt();
                } else if (status === 409) {
                    // The attempt itself is over (time up or already submitted).
                    closedRef.current = true;
                    void submitAttempt(true);
                } else if (status === 401) {
                    markSessionExpired();
                    toast.error('Your session expired. Sign in again to submit this group — your answers are saved on this device.');
                } else {
                    setSyncState('offline');
                    toast.error('Could not submit the group. Check your internet connection and click Submit again — your answers are saved on this device.');
                }
            } finally {
                setIsLocking(false);
            }
        })();

        lockInFlightRef.current = run;
        void run.finally(() => {
            lockInFlightRef.current = null;
        });
        return run;
    }, [applyServerRemaining, commitTime, finishAndShowResult, handleSectionUpdate, markSessionExpired, persistAnswers, refreshAttempt, submitAttempt]);

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

        // Sections: the server's state when we have it, else the last copy saved on this device.
        sectionStateRef.current = null;
        writableRef.current = null;
        blockDeadlineRef.current = null;
        lastIdxBySectionRef.current = {};
        setSectionState(null);
        setBlockDeadline(null);
        setBlockTimeLeft(null);
        setBlockExpired(false);
        setDraft(null);
        if (isSectionState(attempt.section_state)) {
            applySectionState(attempt.section_state);
            reconcileReadOnly(attempt.responses); // drop stale local answers of closed groups
        } else {
            const stored = readStoredSectionState(aid);
            if (stored) applySectionState(stored.state, stored.receivedAt);
        }

        let dl = deadlineFromTiming(timing, testData.duration_sec);
        if (dl === null) {
            const stored = Number(readStorage(storageKeys.deadline(aid)));
            dl = stored > 0 ? stored : Date.now() + testData.duration_sec * 1000;
        }
        deadlineRef.current = dl;
        writeStorage(storageKeys.deadline(aid), String(dl));

        const questionCount = testData.questions.length;
        const storedIdx = Number(readStorage(storageKeys.index(aid)));
        let idx = Number.isInteger(storedIdx) && storedIdx >= 0 && storedIdx < questionCount ? storedIdx : 0;
        // Resume inside the open group (a stored position in a closed group is not allowed).
        const writable = writableRef.current as Set<number> | null; // set by applySectionState above
        if (writable && !writable.has(testData.questions[idx]?.id)) {
            const active = activeSectionOf(testData, sectionStateRef.current);
            idx = active ? active.from : idx;
        }
        currentIdxRef.current = idx;
        const sectionsList = testSections(testData);
        const secIdx = sectionIndexOf(sectionsList, idx);
        if (secIdx >= 0) lastIdxBySectionRef.current[sectionsList[secIdx].key] = idx;

        setAttemptId(aid);
        setResponses(responsesRef.current);
        setDirtyCount(dirtyRef.current.size);
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
        nextSyncAtRef.current = Date.now() + (dirtyRef.current.size > 0 ? 1_000 : SYNC_INTERVAL_MS) + Math.random() * SYNC_JITTER_MS;
    }, [applySectionState, markAsVisited, persistAnswers, reconcileReadOnly, startTracking, testId]);

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
            if (attempt?.status === 'completed') {
                // Every group had already closed while away: the server has submitted it.
                clearAttemptStorage(Number(attempt.id), testId);
                toast('This attempt was already submitted.');
                router.replace(`/dashboard/tests/result/${attempt.id}`);
                return;
            }
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

    const toggleFullscreen = () => {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen();
        } else if (document.exitFullscreen) {
            document.exitFullscreen();
        }
    };

    // ── Sections (derived) ──────────────────────────────────────────────────
    const sectionList = testSections(test);
    const hasSections = sectionList.length > 0;
    const sequential = isSequentialTest(test);
    // Sectioned papers follow the TCS iON (DSSSB) rules: a selection is saved only
    // by Save & Next / Mark for Review & Next. Other tests keep saving on click.
    const cbt = hasSections;
    const markedEvaluated = test?.evaluate_marked !== false;
    const activeSection = sequential ? activeSectionOf(test, sectionState) : null;
    const isLastGroup = !!activeSection && sectionList[sectionList.length - 1]?.key === activeSection.key;

    const sectionStatusOf = (key: string): SectionStatus =>
        sectionState?.sections.find((r) => r.key === key)?.status ?? (sequential ? 'pending' : 'open');

    /** Next question, or null at the end of the open group (sequential) / the paper. */
    const nextIndex = (idx: number): number | null => {
        if (!test) return null;
        if (sequential) {
            if (activeSection && idx >= activeSection.from && idx < activeSection.from + activeSection.count - 1) return idx + 1;
            return null;
        }
        return idx < test.questions.length - 1 ? idx + 1 : null;
    };

    const advance = (toastAtEnd: boolean) => {
        const next = nextIndex(currentQuestionIdx);
        if (next !== null) {
            goToQuestion(next);
        } else if (sequential) {
            setNotice({ text: CBT_TEXT.endOfGroup });
        } else if (toastAtEnd) {
            toast.success('You have reached the last question.');
        }
    };

    /** What the radio buttons show: the unsaved selection, else the saved answer. */
    const shownSelection = (q: Question): number | null =>
        draft && draft.qid === q.id ? draft.optionId : (responses[q.id]?.selected_option_id ?? null);

    const handleSaveAndNext = () => {
        const currentQ = test?.questions[currentQuestionIdx];
        if (!currentQ) return;

        if (cbt) {
            const selected = shownSelection(currentQ);
            updateEntry(currentQ.id, (prev) => ({
                ...(prev ?? {}),
                selected_option_id: selected,
                status: selected ? 'answered' : 'not_answered',
                visited: true,
            }));
            setDraft(null);
            advance(true);
            return;
        }

        updateEntry(currentQ.id, (prev) => ({
            ...(prev ?? {}),
            status: prev?.status === 'marked' ? 'marked' : (prev?.selected_option_id ? 'answered' : 'not_answered'),
            visited: true,
        }));
        advance(true);
    };

    const handleMarkForReview = () => {
        const currentQ = test?.questions[currentQuestionIdx];
        if (!currentQ) return;

        const selected = cbt ? shownSelection(currentQ) : undefined;
        updateEntry(currentQ.id, (prev) => ({
            ...(prev ?? {}),
            ...(selected !== undefined ? { selected_option_id: selected } : {}),
            status: 'marked',
            visited: true,
        }));
        setDraft(null);
        advance(false);
    };

    const handleSelectOption = (questionId: number, optionId: number) => {
        if (cbt) {
            if (writableRef.current && !writableRef.current.has(questionId)) return;
            const q = test?.questions.find((x) => x.id === questionId);
            const current = q ? shownSelection(q) : null;
            // Clicking the chosen option again deselects it (TCS rule).
            setDraft({ qid: questionId, optionId: current === optionId ? null : optionId });
            return;
        }
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

        setDraft(null);
        updateEntry(currentQ.id, (prev) => ({
            ...(prev ?? {}),
            status: 'not_answered',
            selected_option_id: null,
            visited: true,
        }));
    };

    const handleSelectSection = (section: TestSection) => {
        if (!test) return;
        const status = sectionStatusOf(section.key);
        if (sequential) {
            if (status === 'locked') {
                setNotice({ text: CBT_TEXT.attemptedGroup(sectionName(section, language)) });
                return;
            }
            if (status !== 'active') return;
        }
        goToQuestion(lastIdxBySectionRef.current[section.key] ?? section.from);
    };

    const handleSubmit = () => {
        if (!attemptId || isNaN(Number(attemptId))) {
            toast.error('No active session. Please refresh and try again.');
            return;
        }
        if (isSubmitting || isLocking) return;
        if (sequential) {
            if (!activeSectionOf(testRef.current, sectionStateRef.current)) {
                toast('Checking your test status…');
                void refreshAttempt();
                return;
            }
            setShowSectionModal(true);
            return;
        }
        setShowSubmitModal(true);
    };

    /** "Yes" on the group summary: lock the group; the last one first shows the final message. */
    const handleConfirmSection = () => {
        if (isLastGroup) {
            setShowSectionModal(false);
            setNotice({ text: CBT_TEXT.finalSubmit, okLabel: 'OK', onOk: () => void lockSection() });
            return;
        }
        void lockSection();
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

            // Group timer (only when the group has its own duration_sec).
            const bdl = blockDeadlineRef.current;
            const overallOver = dl !== null && Date.now() >= dl - 1_000;
            if (bdl !== null && !overallOver && !finishedRef.current) {
                const left = secondsUntil(bdl);
                setBlockTimeLeft(left);
                const key = sectionStateRef.current?.active_key ?? null;
                // Get the group's last answers to the server before it closes.
                if (left <= 5 && left > 0 && blockPreFlushRef.current !== key) {
                    blockPreFlushRef.current = key;
                    if (dirtyRef.current.size > 0) nextSyncAtRef.current = 0;
                }
                if (left <= 0) {
                    // The server closes the group; re-read and follow it (never lock locally).
                    setBlockExpired(true);
                    const now = Date.now();
                    if (now >= blockExpiryRef.current.nextTryAt && !lockInFlightRef.current) {
                        blockExpiryRef.current = { key, nextTryAt: now + 2_000 };
                        void refreshAttempt();
                    }
                }
            }

            if (dirtyRef.current.size > 0 && Date.now() >= nextSyncAtRef.current) void flush();
        }, 1000);
        return () => clearInterval(interval);
    }, [step, flush, refreshAttempt]);

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

    // Sectioned papers: the TCS iON (DSSSB) instruction pages 1 and 2.
    if (cbt && test && (step === 'instructions' || step === 'declaration')) {
        const ready = declared && languageChosen;
        return (
            <div className="max-w-4xl mx-auto py-6 sm:py-10 px-4">
                <div className="bg-card-bg border border-card-border rounded-2xl shadow-sm overflow-hidden">
                    <div className="flex flex-wrap items-center justify-between gap-3 px-5 sm:px-8 py-4 border-b border-card-border">
                        <div className="min-w-0">
                            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">Instructions</h1>
                            <p className="text-sm text-foreground/60 truncate">{test.name_en}</p>
                        </div>
                        <ViewInSelect language={language} onChange={setLanguage} />
                    </div>

                    <div className="p-5 sm:p-8">
                        {step === 'instructions' ? (
                            <GeneralInstructions sequential={sequential} markedEvaluated={markedEvaluated} />
                        ) : (
                            <div className="space-y-8">
                                <OtherInstructions
                                    sections={sectionList}
                                    sequential={sequential}
                                    totalDurationSec={test.duration_sec}
                                    totalMarks={Number(test.total_marks) || 0}
                                    negativeMarking={Number(test.negative_marking) || 0}
                                    language={language}
                                />

                                <div className="space-y-2 p-4 sm:p-5 bg-background rounded-xl border border-card-border">
                                    <label className="flex flex-wrap items-center gap-3 text-sm font-semibold text-foreground">
                                        Choose your default language :
                                        <select
                                            value={languageChosen ? language : ''}
                                            onChange={(e) => {
                                                if (!e.target.value) return;
                                                setLanguage(e.target.value === 'hi' ? 'hi' : 'en');
                                                setLanguageChosen(true);
                                            }}
                                            className="h-10 min-w-[160px] rounded-lg border border-card-border bg-card-bg px-3 text-sm font-normal"
                                        >
                                            <option value="">-- Select --</option>
                                            <option value="en">English</option>
                                            <option value="hi">Hindi</option>
                                        </select>
                                    </label>
                                    <p className="text-xs text-red-600 dark:text-red-400">
                                        Please note all questions will appear in your default language. This language can be changed for a particular question later on.
                                    </p>
                                </div>

                                <div className="flex items-start gap-3 p-4 sm:p-5 bg-orange-500/5 rounded-xl border border-orange-500/20">
                                    <input
                                        type="checkbox"
                                        id="declaration"
                                        checked={declared}
                                        onChange={(e) => setDeclared(e.target.checked)}
                                        className="mt-1 h-5 w-5 shrink-0 rounded bg-background border-card-border text-blue-600 cursor-pointer"
                                    />
                                    <label htmlFor="declaration" className="text-sm text-foreground/80 leading-relaxed cursor-pointer select-none">
                                        {CBT_TEXT.declaration}
                                    </label>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="flex flex-col-reverse sm:flex-row sm:items-center sm:justify-between gap-3 px-5 sm:px-8 py-4 border-t border-card-border">
                        {step === 'declaration' ? (
                            <button
                                onClick={() => setStep('instructions')}
                                className="px-4 py-3 min-h-[44px] border border-card-border rounded-xl text-sm font-semibold text-foreground/70 hover:text-foreground transition-colors flex items-center justify-center gap-2"
                            >
                                <ChevronLeft className="h-4 w-4" />
                                Previous
                            </button>
                        ) : <span />}
                        {step === 'instructions' ? (
                            <button
                                onClick={() => setStep('declaration')}
                                className="px-6 py-3 min-h-[48px] bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold text-base transition-colors shadow-sm flex items-center justify-center gap-2"
                            >
                                Next
                                <ChevronRight className="h-5 w-5" />
                            </button>
                        ) : (
                            <button
                                onClick={startTest}
                                disabled={!ready || isStarting}
                                title={ready ? undefined : 'Choose your default language and tick the declaration first'}
                                className={cn(
                                    'px-6 py-3 min-h-[48px] rounded-xl font-semibold text-base transition-colors flex items-center justify-center gap-2 shadow-sm',
                                    ready
                                        ? 'bg-blue-600 hover:bg-blue-700 text-white'
                                        : 'bg-gray-200 dark:bg-gray-800 text-foreground/30 cursor-not-allowed shadow-none',
                                )}
                            >
                                I am ready to begin
                                {isStarting && <Loader2 className="h-5 w-5 animate-spin" />}
                            </button>
                        )}
                    </div>
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
        const showBlockOverlay = !showSubmitOverlay && sequential && blockExpired && blockDeadline !== null;

        // Group shown in the palette: the open group (sequential) or the current question's group (free).
        const currentSectionIdx = hasSections ? sectionIndexOf(sectionList, currentQuestionIdx) : -1;
        const viewSection: TestSection | null = activeSection ?? (currentSectionIdx >= 0 ? sectionList[currentSectionIdx] : null);
        const paletteFrom = viewSection ? viewSection.from : 0;
        const paletteQuestions = test
            ? (viewSection ? test.questions.slice(viewSection.from, viewSection.from + viewSection.count) : test.questions)
            : [];
        const paletteCounts = countPalette(paletteQuestions.map((q) => responses[q.id]));
        const allCounts = countPalette((test?.questions ?? []).map((q) => responses[q.id]));
        const currentSelection = currentQ ? (cbt ? shownSelection(currentQ) : (responses[currentQ.id]?.selected_option_id ?? null)) : null;
        const currentSection = currentSectionIdx >= 0 ? sectionList[currentSectionIdx] : null;
        const submitLabel = sequential ? 'Submit' : 'Submit test';

        const summaryRow = (s: TestSection): SectionSummaryRow => ({
            key: s.key,
            name: sectionName(s, language),
            total: s.count,
            counts: countPalette((test?.questions.slice(s.from, s.from + s.count) ?? []).map((q) => responses[q.id])),
            current: activeSection?.key === s.key,
        });
        const groupSummaryRows: SectionSummaryRow[] = isLastGroup || !activeSection
            ? sectionList.map(summaryRow)
            : [summaryRow(activeSection)];

        return (
            <div className="fixed inset-0 bg-background z-[100] flex flex-col font-sans">
                {/* 1. Header Bar */}
                <div className="h-16 sm:h-20 bg-card-bg border-b border-card-border px-3 sm:px-6 flex items-center justify-between gap-2 shadow-sm">
                    <div className="flex items-center gap-3 sm:gap-6 min-w-0">
                        <div className="h-10 w-10 shrink-0 bg-blue-600 rounded-xl flex items-center justify-center text-white">
                            <Zap className="h-5 w-5" />
                        </div>
                        <div className="hidden md:block min-w-0">
                            <h2 className="text-sm font-semibold text-foreground truncate max-w-[280px]">{test?.name_en}</h2>
                            <p className="text-xs text-foreground/50 mt-0.5 truncate max-w-[280px]">
                                {cbt && user?.name ? `Candidate: ${user.name}` : `Test ID: ${test?.id}`}
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2 sm:gap-6">
                        {/* Status Counts */}
                        <div className="hidden xl:flex items-center gap-6 border-r border-card-border pr-8">
                            {[
                                { label: 'Answered', count: allCounts.answered + allCounts.answered_marked, color: 'text-green-500' },
                                { label: 'Marked', count: allCounts.marked + allCounts.answered_marked, color: 'text-purple-500' },
                                { label: 'Not answered', count: allCounts.not_answered + allCounts.not_visited, color: 'text-foreground/40' },
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

                        {/* Group timer (only when the group has its own time limit) */}
                        {sequential && blockTimeLeft !== null && (
                            <div
                                className={cn(
                                    "flex items-center gap-1.5 px-2 sm:px-3 py-2 rounded-xl border transition-colors",
                                    blockTimeLeft < 60 ? "bg-red-500/10 border-red-500/20 text-red-500" : "bg-background border-card-border text-foreground/70"
                                )}
                                title="Time left in this group"
                            >
                                <span className="hidden sm:inline text-xs font-semibold">Group :</span>
                                <span className="text-sm sm:text-base font-bold tabular-nums">{formatTime(blockTimeLeft)}</span>
                            </div>
                        )}

                        {/* Timer */}
                        <div className={cn(
                            "flex items-center gap-2 sm:gap-3 px-3 sm:px-5 py-2 rounded-xl border transition-colors",
                            timeLeft < 300 ? "bg-red-500/10 border-red-500/20 text-red-500" : "bg-blue-500/5 border-blue-500/10 text-blue-600"
                        )}>
                            {cbt
                                ? <span className="hidden sm:inline text-xs font-semibold whitespace-nowrap">Time Left :</span>
                                : <Timer className={cn("h-5 w-5", timeLeft < 300 && "animate-pulse")} />}
                            <span className="text-lg sm:text-xl font-bold tabular-nums">{formatTime(timeLeft)}</span>
                        </div>

                        {/* Controls */}
                        <div className="flex items-center gap-3">
                            <button
                                onClick={handleSubmit}
                                disabled={isSubmitting || isLocking}
                                className="h-11 border border-card-border rounded-xl px-3 sm:px-4 text-sm font-semibold text-foreground/70 hover:bg-background transition-colors"
                            >
                                {isSubmitting || isLocking ? <Loader2 className="h-4 w-4 animate-spin" /> : submitLabel}
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

                {/* Group tabs */}
                {hasSections && (
                    <SectionStrip
                        sections={sectionList}
                        statusOf={sectionStatusOf}
                        currentKey={currentSection?.key ?? null}
                        language={language}
                        sequential={sequential}
                        onSelect={handleSelectSection}
                    />
                )}

                {/* 2. Main Workspace */}
                <div className="flex-1 flex overflow-hidden relative">
                    {/* Left: Question Area */}
                    <div className="flex-1 overflow-y-auto no-scrollbar p-4 sm:p-8 lg:p-12 bg-background">
                        <div className="max-w-4xl mx-auto space-y-8">
                            {/* Question Header */}
                            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-card-border pb-6">
                                <div className="flex flex-col gap-1 min-w-0">
                                    {currentSection && (
                                        <span className="text-xs font-medium text-foreground/60 truncate">{sectionName(currentSection, language)}</span>
                                    )}
                                    <span className="self-start bg-blue-600/10 text-blue-700 dark:text-blue-300 text-sm font-semibold px-3 py-1.5 rounded-full border border-blue-600/20">
                                        {cbt ? 'Question No.' : 'Question'} {currentQuestionIdx + 1}
                                    </span>
                                </div>
                                <div className="flex items-center gap-3 sm:gap-4">
                                    <button
                                        onClick={toggleFullscreen}
                                        aria-label="Full screen"
                                        className="h-10 w-10 flex items-center justify-center bg-card-bg border border-card-border rounded-full hover:text-blue-600 transition-colors"
                                    >
                                        <Maximize className="h-4 w-4" />
                                    </button>
                                    {cbt ? (
                                        <ViewInSelect language={language} onChange={setLanguage} />
                                    ) : (
                                        <button
                                            onClick={() => setLanguage(language === 'en' ? 'hi' : 'en')}
                                            className="flex items-center gap-2 px-3 py-2 min-h-[40px] bg-card-bg border border-card-border rounded-full text-sm font-medium text-foreground/70 hover:text-blue-600 transition-colors"
                                        >
                                            <Languages className="h-4 w-4" />
                                            {language === 'en' ? 'Hindi' : 'English'}
                                        </button>
                                    )}
                                </div>
                            </div>

                            {/* Question Text */}
                            <div className="space-y-8">
                                <QuestionText
                                    className="text-lg sm:text-xl font-semibold text-foreground leading-relaxed"
                                    text={(language === 'en' ? currentQ?.question_en : currentQ?.question_hi) || currentQ?.question_en}
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

                            {/* Options (sectioned papers: one vertical list, like the exam) */}
                            <div
                                className={cn("grid grid-cols-1 gap-3 sm:gap-4 pb-24", !cbt && "md:grid-cols-2")}
                                role={cbt ? 'radiogroup' : undefined}
                            >
                                {currentQ?.options.map((opt, idx) => {
                                    const isSelected = currentSelection === opt.id;
                                    return (
                                        <button
                                            key={opt.id}
                                            onClick={() => handleSelectOption(currentQ.id, opt.id)}
                                            role={cbt ? 'radio' : undefined}
                                            aria-checked={cbt ? isSelected : undefined}
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
                                                    <span className="whitespace-pre-wrap">{(language === 'en' ? opt.option_en : opt.option_hi) || opt.option_en}</span>
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

                                            {isSelected && !cbt && <div className="absolute top-4 right-4 h-2 w-2 bg-blue-600 rounded-full animate-ping" />}
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
                        <div className="p-5 border-b border-card-border flex items-center justify-between gap-2">
                            <div className="space-y-1 min-w-0">
                                <h3 className="text-sm font-semibold text-foreground leading-none">Question palette</h3>
                                <p className="text-xs text-foreground/60 truncate max-w-[220px]">
                                    {viewSection ? sectionName(viewSection, language) : test?.name_en}
                                </p>
                            </div>
                            <div className="flex items-center gap-2 shrink-0">
                                <button
                                    type="button"
                                    onClick={() => setIsSidebarOpen(false)}
                                    className="sm:hidden h-9 px-3 rounded-lg border border-card-border text-xs font-semibold text-foreground/70"
                                    aria-label="Back to the question"
                                >
                                    Back to question
                                </button>
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

                        {/* Legend with counts for the questions shown */}
                        <div className="p-4 border-b border-card-border bg-background/50">
                            <PaletteLegend counts={paletteCounts} markedEvaluated={markedEvaluated} />
                        </div>

                        <div className="flex-1 overflow-y-auto no-scrollbar p-5">
                            <div className="grid grid-cols-5 gap-3">
                                {paletteQuestions.map((q, j) => {
                                    const i = paletteFrom + j;
                                    const status = paletteStatus(responses[q.id]);
                                    const isCurrent = currentQuestionIdx === i;
                                    return (
                                        <button
                                            key={q.id}
                                            onClick={() => { goToQuestion(i); closePaletteOnPhone(); }}
                                            aria-label={`Question ${i + 1}`}
                                            className={cn(
                                                "h-12 w-12 border flex items-center justify-center text-xs font-bold transition-all hover:scale-110 relative",
                                                PALETTE_CLASSES[status],
                                                isCurrent && "ring-4 ring-blue-500/30 ring-offset-2 ring-offset-background scale-110 z-10"
                                            )}
                                        >
                                            {i + 1}
                                            {status === 'answered_marked' && <TickBadge />}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Submit (below the palette, as in the exam) */}
                        <div className="p-5 border-t border-card-border bg-emerald-600/5">
                            <button
                                onClick={handleSubmit}
                                disabled={isSubmitting || isLocking}
                                className="w-full py-3 min-h-[44px] bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-semibold text-sm shadow-sm transition-colors flex items-center justify-center gap-2"
                            >
                                {isSubmitting || isLocking ? <Loader2 className="h-4 w-4 animate-spin" /> : <ShieldCheck className="h-4 w-4" />}
                                {submitLabel}
                            </button>
                        </div>
                    </div>
                </div>

                {/* 3. Footer Action Bar */}
                <div className="min-h-[72px] bg-card-bg border-t border-card-border px-3 sm:px-6 py-2 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1 sm:gap-2">
                        <button
                            onClick={handleMarkForReview}
                            className="px-3 sm:px-4 py-2.5 min-h-[44px] border border-card-border hover:border-purple-500/40 text-foreground/70 hover:text-purple-600 rounded-xl text-sm font-medium transition-colors"
                        >
                            Mark for Review &amp; Next
                        </button>
                        <button
                            onClick={handleClearSelection}
                            className="px-3 sm:px-4 py-2.5 min-h-[44px] border border-transparent hover:border-card-border text-foreground/60 hover:text-red-500 rounded-xl text-sm font-medium transition-colors"
                        >
                            Clear Response
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
                            className="px-4 sm:px-8 py-2.5 min-h-[44px] bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold text-sm shadow-sm transition-colors flex items-center gap-2"
                        >
                            Save &amp; Next
                            <ChevronRight className="h-4 w-4" />
                        </button>
                    </div>
                </div>

                {!sequential && (
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
                )}

                {/* Group submit: summary + "Are you sure to submit this Group?" */}
                {showSectionModal && activeSection && (
                    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-xl z-[300] flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200">
                        <div className="bg-card-bg border border-card-border rounded-2xl p-5 sm:p-7 max-w-2xl w-full shadow-2xl space-y-5 max-h-[92vh] overflow-y-auto">
                            <div className="space-y-1">
                                <h2 className="text-xl font-bold tracking-tight text-foreground">
                                    {isLastGroup ? 'Exam summary' : 'Group summary'}
                                </h2>
                                <p className="text-sm text-foreground/60">{sectionName(activeSection, language)}</p>
                            </div>

                            <SectionSummaryTable rows={groupSummaryRows} markedEvaluated={markedEvaluated} />

                            <div className="space-y-2 rounded-xl border border-orange-500/30 bg-orange-500/5 p-3 text-sm">
                                <p className="flex items-start gap-2 text-orange-700 dark:text-orange-300">
                                    <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
                                    {CBT_TEXT.lockWarning}
                                </p>
                                <p className="font-semibold text-foreground">{CBT_TEXT.groupConfirm}</p>
                            </div>

                            <div className="flex gap-3">
                                <button
                                    onClick={() => setShowSectionModal(false)}
                                    disabled={isLocking}
                                    className="flex-1 py-3 min-h-[44px] border border-card-border rounded-xl text-sm font-semibold text-foreground/70 hover:text-foreground hover:bg-background transition-colors"
                                >
                                    No
                                </button>
                                <button
                                    onClick={handleConfirmSection}
                                    disabled={isLocking}
                                    className="flex-1 py-3 min-h-[44px] bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-semibold shadow-sm transition-colors flex items-center justify-center gap-2"
                                >
                                    {isLocking ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Yes'}
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Submit Confirmation Modal (tests without locked groups) */}
                {showSubmitModal && (
                    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-xl z-[300] flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200">
                        <div className={cn(
                            "bg-card-bg border border-card-border rounded-2xl p-6 sm:p-8 w-full shadow-2xl space-y-6 max-h-[92vh] overflow-y-auto",
                            hasSections ? "max-w-2xl" : "max-w-md"
                        )}>
                            <div className="flex flex-col items-center text-center space-y-4">
                                <div className="h-16 w-16 bg-orange-500/10 rounded-[2rem] flex items-center justify-center border border-orange-500/20">
                                    <ShieldCheck className="h-8 w-8 text-orange-500" />
                                </div>
                                <h2 className="text-2xl font-bold tracking-tight text-foreground">Submit test?</h2>
                                <p className="text-sm text-foreground/70 leading-relaxed">
                                    Once you submit, you cannot change your answers.
                                </p>
                            </div>

                            {hasSections ? (
                                <SectionSummaryTable rows={sectionList.map(summaryRow)} markedEvaluated={markedEvaluated} />
                            ) : (
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
                            )}

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

                {/* Messages (end of group, closed group, final submit, group timer) */}
                {notice && !showSubmitOverlay && (
                    <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-[320] flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200">
                        <div role="alertdialog" aria-modal="true" className="bg-card-bg border border-card-border rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-5">
                            <p className="flex items-start gap-3 text-sm text-foreground leading-relaxed">
                                <Info className="h-5 w-5 text-blue-600 shrink-0 mt-0.5" />
                                {notice.text}
                            </p>
                            <div className="flex justify-end">
                                <button
                                    onClick={() => {
                                        const onOk = notice.onOk;
                                        setNotice(null);
                                        onOk?.();
                                    }}
                                    disabled={isLocking}
                                    className="px-6 py-2.5 min-h-[44px] bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-semibold transition-colors"
                                >
                                    {notice.okLabel ?? 'OK'}
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Group timer ran out: wait for the server to close it and open the next */}
                {showBlockOverlay && (
                    <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-xl z-[240] flex flex-col items-center justify-center p-8 text-center animate-in fade-in duration-300">
                        <Loader2 className="h-10 w-10 text-blue-500 animate-spin mb-6" />
                        <h2 className="text-2xl font-bold text-white mb-3">Time for this group is over</h2>
                        <p className="text-base text-white/70 max-w-xl">
                            {isOffline
                                ? 'Waiting for the connection to open the next group. Your answers are saved on this device.'
                                : 'Opening the next group…'}
                        </p>
                    </div>
                )}

                {/* Time-up / submission failure overlay */}
                {showSubmitOverlay && (
                    <div className="fixed inset-0 bg-slate-950/90 backdrop-blur-xl z-[250] flex flex-col items-center justify-center p-6 sm:p-12 text-center animate-in fade-in duration-300">
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
                                : cbt ? CBT_TEXT.timeOver : 'Submitting your answers…'}
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
