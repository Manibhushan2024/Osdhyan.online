'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import {
    AlertCircle, ArrowLeft, BarChart2, Hand, Loader2, MessageSquare, Play,
    Radio, Share2, Square, Users, Video, ExternalLink, Timer, RefreshCw, X, Film,
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import api from '@/lib/api';
import { cn } from '@/lib/utils';
import { useAuth } from '@/components/providers/AuthProvider';
import { loginUrlWithRedirect } from '@/lib/redirect';
import StatusBadge from '@/components/live/StatusBadge';
import JitsiRoom from '@/components/live/JitsiRoom';
import YoutubePlayer, { youtubeIdFromUrl } from '@/components/live/YoutubePlayer';
import LiveChat from '@/components/live/LiveChat';
import LivePoll from '@/components/live/LivePoll';
import HostPanel from '@/components/live/HostPanel';
import { apiErrorCode, apiErrorMessage, countdownTo, formatWhen } from '@/components/live/format';
import type { ChatMessage, JoinPayload, JoinResponse, LiveClassSummary, LiveState, OwnedLiveClass } from '@/components/live/types';

/** Fallbacks when the server has not sent a poll_ms hint yet. */
const STATE_POLL_MS = 5000;
const STATE_POLL_ENDED_MS = 60000;

type Tab = 'chat' | 'poll' | 'people' | 'host';

/**
 * The classroom. Rendered at /dashboard/live/[id] (students and teachers) and at
 * /admin/live/[id] (admins, signed in to the admin panel, as the host).
 */
export default function LiveClassroom({ area = 'student' }: { area?: 'student' | 'admin' }) {
    const base = area === 'admin' ? '/admin/live' : '/dashboard/live';
    const { id } = useParams<{ id: string }>();
    const classId = Number(id);
    const { user, loading: authLoading } = useAuth();
    const router = useRouter();

    const [cls, setCls] = useState<LiveClassSummary | null>(null);
    const [owned, setOwned] = useState<OwnedLiveClass | null>(null);
    const [loadError, setLoadError] = useState<string | null>(null);
    const [state, setState] = useState<LiveState | null>(null);
    const [join, setJoin] = useState<JoinPayload | null>(null);
    const [joining, setJoining] = useState(false);
    const [joinError, setJoinError] = useState<{ code: string | null; message: string } | null>(null);
    const [leftRoom, setLeftRoom] = useState(false);
    const [tab, setTab] = useState<Tab>('chat');
    const [now, setNow] = useState(() => Date.now());
    const [busy, setBusy] = useState<'golive' | 'end' | 'hand' | null>(null);
    const [confirmEnd, setConfirmEnd] = useState(false);

    const joinedRef = useRef(false);
    /** the open chat's cursor; when set, state polls also bring new chat messages */
    const chatCursorRef = useRef<number | null>(null);
    const [chatIncoming, setChatIncoming] = useState<{ messages: ChatMessage[]; hasMore: boolean } | null>(null);
    const onChatCursor = useCallback((lastId: number | null) => {
        chatCursorRef.current = lastId;
    }, []);

    const status = state?.status ?? cls?.status ?? null;
    const isTeacher = !!(state?.me.is_teacher ?? cls?.can_manage);
    const live = status === 'live';
    const pollMs = state?.poll_ms ?? (status === 'ended' ? STATE_POLL_ENDED_MS : STATE_POLL_MS);

    // ── Load class ────────────────────────────────────────────────────────
    useEffect(() => {
        if (authLoading) return;
        if (!user) {
            router.replace(area === 'admin' ? '/admin/login' : loginUrlWithRedirect(`/dashboard/live/${classId}`));
            return;
        }
        if (!Number.isFinite(classId)) {
            setLoadError('This class link is not valid.');
            return;
        }
        let cancelled = false;
        api.get(`/live-classes/${classId}`)
            .then(res => {
                if (!cancelled) setCls(res.data.class);
            })
            .catch(e => {
                if (cancelled) return;
                const st = (e as { response?: { status?: number } })?.response?.status;
                setLoadError(st === 404 ? 'This class does not exist or was removed.' : apiErrorMessage(e, 'Could not load the class.'));
            });
        return () => {
            cancelled = true;
        };
    }, [authLoading, user, classId, router]);

    // ── State polling (also the "I am still here" heartbeat) ──────────────
    const refreshState = useCallback(async () => {
        try {
            const after = chatCursorRef.current;
            const res = await api.get<LiveState>(`/live-classes/${classId}/state`, after !== null ? { params: { after } } : undefined);
            const { messages, messages_has_more, ...rest } = res.data;
            if (messages && (messages.length > 0 || messages_has_more)) {
                setChatIncoming({ messages, hasMore: !!messages_has_more });
            }
            setState(rest);
        } catch {
            // keep last known state; next tick retries
        }
    }, [classId]);

    useEffect(() => {
        if (!cls) return;
        refreshState();
        const t = setInterval(refreshState, pollMs);
        return () => clearInterval(t);
    }, [cls, pollMs, refreshState]);

    // ── Join (a click — browsers need one for sound / camera anyway) ──────
    const joinClass = useCallback(async () => {
        if (joining) return;
        setJoining(true);
        setJoinError(null);
        setLeftRoom(false);
        try {
            const res = await api.post<JoinResponse>(`/live-classes/${classId}/join`);
            setJoin(res.data.provider);
            setState(res.data.state);
            setCls(c => ({ ...res.data.class, can_manage: c?.can_manage ?? res.data.class.can_manage }));
            joinedRef.current = true;
        } catch (e) {
            setJoinError({ code: apiErrorCode(e), message: apiErrorMessage(e, 'Could not join the class.') });
        } finally {
            setJoining(false);
        }
    }, [classId, joining]);

    // Teacher pressed "Start class" in the teacher panel: open the room straight away.
    const autoJoinTriedRef = useRef(false);
    useEffect(() => {
        if (autoJoinTriedRef.current || !live || !isTeacher || join || joining) return;
        if (typeof window === 'undefined' || new URLSearchParams(window.location.search).get('autojoin') !== '1') return;
        autoJoinTriedRef.current = true;
        window.history.replaceState(null, '', window.location.pathname);
        joinClass();
    }, [live, isTeacher, join, joining, joinClass]);

    // The class ended while we were inside.
    useEffect(() => {
        if (status === 'ended' && join) {
            setJoin(null);
            joinedRef.current = false;
        }
    }, [status, join]);

    // Tell the server we left when the tab closes / route changes. If this
    // never arrives (crash, lost network) the server drops us after ~2 min
    // without a state poll.
    useEffect(() => {
        const leave = () => {
            if (!joinedRef.current) return;
            joinedRef.current = false;
            api.post(`/live-classes/${classId}/leave`).catch(() => {});
        };
        window.addEventListener('pagehide', leave);
        return () => {
            window.removeEventListener('pagehide', leave);
            leave();
        };
    }, [classId]);

    // Countdown tick while waiting.
    useEffect(() => {
        if (status !== 'scheduled') return;
        const t = setInterval(() => setNow(Date.now()), 1000);
        return () => clearInterval(t);
    }, [status]);

    // ── Teacher actions ───────────────────────────────────────────────────
    const startClass = async () => {
        if (busy) return;
        setBusy('golive');
        try {
            const res = await api.post(`/live-classes/${classId}/go-live`);
            const c: OwnedLiveClass = res.data.class;
            setOwned(c);
            setCls(c);
            toast.success('Class started. Students can join now.');
            await refreshState();
            await joinClass();
        } catch (e) {
            toast.error(apiErrorMessage(e, 'Could not start the class'));
        } finally {
            setBusy(null);
        }
    };

    const endClass = async (recordingUrl: string) => {
        if (busy) return;
        setBusy('end');
        try {
            const res = await api.post(`/live-classes/${classId}/end`, recordingUrl ? { recording_url: recordingUrl } : {});
            setCls(res.data.class);
            setOwned(res.data.class);
            setJoin(null);
            joinedRef.current = false;
            setConfirmEnd(false);
            toast.success('Class ended');
            refreshState();
        } catch (e) {
            toast.error(apiErrorMessage(e, 'Could not end the class'));
        } finally {
            setBusy(null);
        }
    };

    const toggleHand = async () => {
        if (busy || !state) return;
        setBusy('hand');
        const raised = state.me.hand_raised;
        try {
            await api.post(`/live-classes/${classId}/${raised ? 'lower-hand' : 'raise-hand'}`);
            setState(s => (s ? { ...s, me: { ...s.me, hand_raised: !raised } } : s));
            if (!raised) toast.success('Hand raised. The teacher can see your name.');
            refreshState();
        } catch (e) {
            toast.error(apiErrorMessage(e, 'Could not update your hand'));
        } finally {
            setBusy(null);
        }
    };

    const onLeftRoom = useCallback(() => {
        setJoin(null);
        setLeftRoom(true);
        if (joinedRef.current) {
            joinedRef.current = false;
            api.post(`/live-classes/${classId}/leave`).catch(() => {});
        }
    }, [classId]);

    // ── Render ────────────────────────────────────────────────────────────
    if (loadError) {
        return (
            <div className="max-w-xl mx-auto py-20 px-4 text-center space-y-4">
                <AlertCircle className="h-10 w-10 text-red-500 mx-auto" />
                <p className="text-sm font-bold text-foreground">{loadError}</p>
                <Link href={base} className="inline-flex items-center gap-2 text-xs font-bold text-blue-500 hover:text-blue-400">
                    <ArrowLeft className="h-3.5 w-3.5" /> Back to live classes
                </Link>
            </div>
        );
    }

    if (!cls || authLoading) {
        return (
            <div className="flex items-center justify-center h-[60vh]">
                <Loader2 className="h-6 w-6 animate-spin text-red-500" />
            </div>
        );
    }

    const joinLink = typeof window !== 'undefined' ? `${window.location.origin}/dashboard/live/${cls.id}` : `/dashboard/live/${cls.id}`;
    const roomPassword = join?.kind === 'jitsi' ? join.password : owned?.join_password ?? null;
    const roomName = join?.kind === 'jitsi' ? join.room : owned?.room_name ?? null;
    const participants = state?.participants_count ?? cls.participants_count;
    const recordingUrl = state?.recording_url ?? cls.recording_url;
    const recordingYoutubeId = youtubeIdFromUrl(recordingUrl) ?? (cls.provider === 'youtube' ? cls.youtube_video_id : null);
    const handsCount = state?.hands_raised_count ?? 0;

    return (
        <div className="max-w-[1400px] mx-auto pb-10 px-4 md:px-0 space-y-4 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex flex-wrap items-center gap-3">
                <Link href={base} className="p-2 rounded-xl hover:bg-card-bg border border-transparent hover:border-card-border text-foreground/50 hover:text-foreground transition-all" aria-label="Back to live classes">
                    <ArrowLeft className="h-4 w-4" />
                </Link>
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                        <StatusBadge status={status ?? cls.status} />
                        {cls.subject && <span className="text-[10px] font-bold uppercase tracking-wide text-foreground/50">{cls.subject}</span>}
                        <span className="text-[10px] font-bold text-foreground/50 flex items-center gap-1"><Users className="h-3 w-3" /> {participants} in class</span>
                    </div>
                    <h1 className="text-lg md:text-2xl font-black text-foreground tracking-tight truncate">{cls.title}</h1>
                    <p className="text-xs font-medium text-foreground/50">Teacher: {cls.teacher?.name ?? 'your teacher'}</p>
                </div>

                {/* Teacher controls */}
                {isTeacher && status !== 'ended' && (
                    <div className="flex items-center gap-2 flex-wrap">
                        {status === 'scheduled' && (
                            <button onClick={startClass} disabled={busy === 'golive'} className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-red-500 hover:bg-red-400 text-white text-sm font-black shadow-lg shadow-red-500/20 disabled:opacity-50">
                                {busy === 'golive' ? <Loader2 className="h-4 w-4 animate-spin" /> : <Radio className="h-4 w-4" />} Start class
                            </button>
                        )}
                        <button onClick={() => setTab('host')} className={cn('flex items-center gap-2 px-4 py-3 rounded-2xl text-xs font-bold border', tab === 'host' ? 'bg-foreground text-background border-foreground' : 'bg-card-bg border-card-border text-foreground hover:bg-foreground/5')}>
                            <Share2 className="h-3.5 w-3.5" /> Share link
                        </button>
                        {status === 'live' && (
                            <button onClick={() => setConfirmEnd(true)} disabled={busy === 'end'} className="flex items-center gap-2 px-4 py-3 rounded-2xl bg-foreground/5 hover:bg-red-500/10 text-foreground hover:text-red-500 border border-card-border text-xs font-bold disabled:opacity-50">
                                <Square className="h-3.5 w-3.5" /> End class
                            </button>
                        )}
                    </div>
                )}
            </div>

            {/* Body: video on the left, questions & chat beside it */}
            <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_380px] gap-4">
                {/* Video area */}
                <div className="bg-card-bg border border-card-border rounded-[1.5rem] overflow-hidden aspect-video lg:aspect-auto lg:h-[calc(100vh-220px)] lg:min-h-[480px]">
                    {status === 'scheduled' && (
                        <WaitingView cls={cls} now={now} isTeacher={isTeacher} />
                    )}

                    {status === 'live' && join?.kind === 'jitsi' && (
                        <JitsiRoom
                            payload={join}
                            subject={cls.title}
                            displayName={user?.name ?? 'Student'}
                            email={user?.email}
                            onLeft={onLeftRoom}
                        />
                    )}
                    {status === 'live' && join?.kind === 'youtube' && (
                        <YoutubePlayer videoId={join.video_id} title={cls.title} />
                    )}

                    {status === 'live' && !join && (
                        <div className="h-full flex flex-col items-center justify-center gap-4 p-6 text-center bg-gradient-to-br from-slate-950 via-slate-900 to-red-950 text-white">
                            {joinError ? (
                                <>
                                    <AlertCircle className="h-9 w-9 text-red-400" />
                                    <p className="text-base font-bold">{joinError.message}</p>
                                    {joinError.code === 'full' ? (
                                        <p className="text-sm text-white/60 max-w-sm">All seats are taken. You can still read the chat and answer polls on the right. A seat frees up when someone leaves — try again in a minute.</p>
                                    ) : null}
                                    <button onClick={joinClass} disabled={joining} className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-red-500 text-white text-sm font-black hover:bg-red-400 disabled:opacity-50">
                                        {joining ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />} Try again
                                    </button>
                                </>
                            ) : (
                                <>
                                    <span className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-red-300">
                                        <span className="h-2 w-2 rounded-full bg-red-500 animate-pulse" /> {leftRoom ? 'You left the class' : 'The class has started'}
                                    </span>
                                    <p className="text-xl md:text-2xl font-black max-w-md">{cls.title}</p>
                                    <button
                                        onClick={joinClass}
                                        disabled={joining}
                                        className="flex items-center gap-2 px-8 py-4 rounded-2xl bg-red-500 hover:bg-red-400 text-white text-base font-black shadow-xl shadow-red-500/30 disabled:opacity-60 active:scale-95"
                                    >
                                        {joining ? <Loader2 className="h-5 w-5 animate-spin" /> : <Video className="h-5 w-5" />}
                                        {isTeacher ? 'Open the classroom' : leftRoom ? 'Join again' : 'Join class'}
                                    </button>
                                    <p className="text-xs text-white/50 max-w-sm">
                                        {cls.provider === 'youtube'
                                            ? 'The class video plays here. Ask your questions in the chat on the right.'
                                            : 'Your microphone and camera start switched off. Ask questions in the chat on the right.'}
                                    </p>
                                </>
                            )}
                        </div>
                    )}

                    {status === 'ended' && (
                        <EndedView
                            classId={cls.id}
                            title={cls.title}
                            recordingUrl={recordingUrl}
                            youtubeId={recordingYoutubeId}
                            isTeacher={isTeacher}
                            onSaved={c => { setCls(c); refreshState(); }}
                        />
                    )}
                </div>

                {/* Side panel */}
                <aside className="bg-card-bg border border-card-border rounded-[1.5rem] flex flex-col overflow-hidden h-[560px] lg:h-[calc(100vh-220px)] lg:min-h-[480px]">
                    <div className="shrink-0 flex items-center gap-1 p-2 border-b border-card-border flex-wrap">
                        <TabButton active={tab === 'chat'} onClick={() => setTab('chat')} icon={MessageSquare} label="Questions & chat" />
                        <TabButton active={tab === 'poll'} onClick={() => setTab('poll')} icon={BarChart2} label="Poll" dot={!!state?.poll?.is_open && !state?.my_vote && !isTeacher} />
                        {!isTeacher && <TabButton active={tab === 'people'} onClick={() => setTab('people')} icon={Users} label={String(participants)} />}
                        {isTeacher && <TabButton active={tab === 'host'} onClick={() => setTab('host')} icon={Hand} label={`Hands ${handsCount}`} dot={handsCount > 0} />}
                        {!isTeacher && live && state?.me.joined && (
                            <button
                                onClick={toggleHand}
                                disabled={busy === 'hand'}
                                className={cn(
                                    'ml-auto flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all',
                                    state.me.hand_raised ? 'bg-amber-500 text-white shadow-lg shadow-amber-500/30' : 'bg-foreground/5 text-foreground hover:bg-foreground/10',
                                )}
                            >
                                <Hand className={cn('h-3.5 w-3.5', state.me.hand_raised && 'animate-bounce')} /> {state.me.hand_raised ? 'Lower hand' : 'Raise hand'}
                            </button>
                        )}
                    </div>

                    <div className="flex-1 min-h-0">
                        {tab === 'chat' && user && (
                            <LiveChat
                                classId={classId}
                                currentUserId={user.id}
                                canModerate={isTeacher}
                                open={live}
                                pinned={state?.pinned_messages ?? []}
                                latestMessageId={state?.latest_message_id ?? 0}
                                removedIds={state?.removed_message_ids}
                                answeredIds={state?.answered_message_ids}
                                incoming={chatIncoming}
                                onCursor={onChatCursor}
                            />
                        )}
                        {tab === 'poll' && (
                            <LivePoll
                                classId={classId}
                                poll={state?.poll ?? null}
                                myVote={state?.my_vote ?? null}
                                canModerate={isTeacher}
                                live={live}
                                onChanged={refreshState}
                            />
                        )}
                        {tab === 'people' && (
                            <div className="h-full flex flex-col items-center justify-center gap-3 p-6 text-center">
                                <Users className="h-8 w-8 text-foreground/30" />
                                <p className="text-3xl font-black text-foreground tabular-nums">{participants}</p>
                                <p className="text-xs font-bold text-foreground/50">people in the class</p>
                                <p className="text-xs font-bold text-amber-600 flex items-center gap-1"><Hand className="h-3 w-3" /> {handsCount} hands raised</p>
                                {cls.max_participants > 0 && <p className="text-xs font-bold text-foreground/40">Seats: {participants}/{cls.max_participants}</p>}
                            </div>
                        )}
                        {tab === 'host' && isTeacher && (
                            <HostPanel
                                classId={classId}
                                status={status ?? cls.status}
                                participantsCount={participants}
                                handsRaised={state?.hands_raised ?? []}
                                joinLink={joinLink}
                                roomName={roomName}
                                password={roomPassword}
                                onChanged={refreshState}
                            />
                        )}
                    </div>
                </aside>
            </div>

            {cls.description && (
                <div className="bg-card-bg border border-card-border rounded-[1.5rem] p-5">
                    <p className="text-[10px] font-bold uppercase tracking-wide text-foreground/50 mb-1">About this class</p>
                    <p className="text-sm text-foreground/80 whitespace-pre-wrap">{cls.description}</p>
                </div>
            )}

            {confirmEnd && (
                <EndClassDialog
                    provider={cls.provider}
                    participants={participants}
                    busy={busy === 'end'}
                    onCancel={() => setConfirmEnd(false)}
                    onConfirm={endClass}
                />
            )}
        </div>
    );
}

function TabButton({ active, onClick, icon: Icon, label, dot }: { active: boolean; onClick: () => void; icon: typeof Users; label: string; dot?: boolean }) {
    return (
        <button
            onClick={onClick}
            className={cn(
                'relative flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all',
                active ? 'bg-foreground text-background' : 'text-foreground/60 hover:text-foreground hover:bg-foreground/5',
            )}
        >
            <Icon className="h-3.5 w-3.5" /> {label}
            {dot && <span className="absolute -top-0.5 -right-0.5 h-2 w-2 rounded-full bg-red-500" />}
        </button>
    );
}

function WaitingView({ cls, now, isTeacher }: { cls: LiveClassSummary; now: number; isTeacher: boolean }) {
    const cd = countdownTo(cls.scheduled_at, now);
    return (
        <div className="h-full flex flex-col items-center justify-center gap-4 p-6 text-center bg-gradient-to-br from-slate-950 via-slate-900 to-red-950 text-white">
            <Timer className="h-9 w-9 text-red-400" />
            <p className="text-xs font-bold uppercase tracking-widest text-white/50">{cd ? 'Class starts in' : 'Scheduled for'}</p>
            {cd ? (
                <p className="text-4xl md:text-5xl font-black tabular-nums tracking-tight">{cd}</p>
            ) : (
                <p className="text-xl font-black">{formatWhen(cls.scheduled_at)}</p>
            )}
            <p className="text-sm font-medium text-white/70 max-w-sm">
                {isTeacher
                    ? 'You are the teacher. Press "Start class" (top right) when you are ready. Students waiting on this page will see a "Join class" button.'
                    : cd
                        ? 'Keep this page open. A "Join class" button appears here the moment your teacher starts.'
                        : 'Waiting for the teacher to start the class. This page checks automatically.'}
            </p>
            {!cd && !isTeacher && <Loader2 className="h-4 w-4 animate-spin text-white/40" />}
        </div>
    );
}

function EndClassDialog({ provider, participants, busy, onCancel, onConfirm }: {
    provider: string;
    participants: number;
    busy: boolean;
    onCancel: () => void;
    onConfirm: (recordingUrl: string) => void;
}) {
    const [url, setUrl] = useState('');
    const urlOk = url.trim() === '' || /^https?:\/\/\S+$/i.test(url.trim());
    return (
        <div className="fixed inset-0 z-[500] flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-labelledby="end-class-title">
            <div className="absolute inset-0 bg-slate-950/70 backdrop-blur-sm" onClick={busy ? undefined : onCancel} />
            <div className="relative z-10 w-full max-w-md bg-card-bg border border-card-border rounded-[1.5rem] p-6 shadow-2xl space-y-4">
                <div className="flex items-start justify-between gap-3">
                    <h3 id="end-class-title" className="text-lg font-black text-foreground">End the class for everyone?</h3>
                    <button onClick={onCancel} disabled={busy} className="p-2 rounded-xl hover:bg-foreground/5 text-foreground/50" aria-label="Close"><X className="h-4 w-4" /></button>
                </div>
                <p className="text-sm text-foreground/70">
                    {participants} {participants === 1 ? 'person is' : 'people are'} in the class. Ending it closes the video, the chat and any open poll for everyone. This cannot be undone.
                </p>
                {provider === 'youtube' ? (
                    <p className="text-xs text-foreground/60 bg-foreground/[0.03] border border-card-border rounded-xl p-3">
                        Remember to also press <strong>End stream</strong> in YouTube Studio / OBS. The YouTube video is saved as the recording automatically.
                    </p>
                ) : (
                    <div className="space-y-1.5">
                        <label className="text-xs font-bold text-foreground/60" htmlFor="end-recording">Recording link (optional — you can add it later)</label>
                        <input
                            id="end-recording"
                            value={url}
                            onChange={e => setUrl(e.target.value)}
                            placeholder="https://youtu.be/…"
                            className="w-full bg-background border border-card-border rounded-xl px-3 py-2.5 text-sm text-foreground placeholder:text-foreground/30 focus:outline-none focus:ring-2 focus:ring-red-500/20"
                        />
                        {!urlOk && <p className="text-xs text-red-500">The link must start with https://</p>}
                    </div>
                )}
                <div className="flex gap-2 pt-1">
                    <button onClick={onCancel} disabled={busy} className="flex-1 py-3 rounded-xl border border-card-border text-sm font-bold text-foreground/70 hover:text-foreground">Keep teaching</button>
                    <button onClick={() => onConfirm(url.trim())} disabled={busy || !urlOk} className="flex-1 py-3 rounded-xl bg-red-500 hover:bg-red-400 text-white text-sm font-black disabled:opacity-40 flex items-center justify-center gap-2">
                        {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Square className="h-4 w-4" />} Yes, end class
                    </button>
                </div>
            </div>
        </div>
    );
}

function EndedView({ classId, title, recordingUrl, youtubeId, isTeacher, onSaved }: {
    classId: number;
    title: string;
    recordingUrl: string | null;
    youtubeId: string | null;
    isTeacher: boolean;
    onSaved: (cls: LiveClassSummary) => void;
}) {
    const [url, setUrl] = useState('');
    const [saving, setSaving] = useState(false);

    if (youtubeId) {
        return <YoutubePlayer videoId={youtubeId} title={title} autoplay={false} />;
    }
    if (recordingUrl && /\.(mp4|webm|m3u8|mov)(\?|$)/i.test(recordingUrl)) {
        return <video src={recordingUrl} controls className="w-full h-full bg-black" />;
    }

    const save = async () => {
        if (!/^https?:\/\/\S+$/i.test(url.trim()) || saving) return;
        setSaving(true);
        try {
            const res = await api.post(`/live-classes/${classId}/recording`, { recording_url: url.trim() });
            toast.success('Recording saved. Students can watch it now.');
            onSaved(res.data.class);
        } catch (e) {
            toast.error(apiErrorMessage(e, 'Could not save the recording'));
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="h-full flex flex-col items-center justify-center gap-4 p-6 text-center">
            <Play className="h-9 w-9 text-foreground/30" />
            <p className="text-base font-black text-foreground">This class has ended.</p>
            {recordingUrl ? (
                <a href={recordingUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-bold">
                    <ExternalLink className="h-4 w-4" /> Watch the recording
                </a>
            ) : isTeacher ? (
                <div className="w-full max-w-sm space-y-2">
                    <p className="text-sm text-foreground/60">Add the recording so students who missed it can watch. Paste a YouTube link or a direct .mp4 link.</p>
                    <div className="flex gap-2">
                        <input value={url} onChange={e => setUrl(e.target.value)} placeholder="https://youtu.be/…" className="flex-1 bg-background border border-card-border rounded-xl px-3 py-2.5 text-sm text-foreground placeholder:text-foreground/30 focus:outline-none focus:ring-2 focus:ring-indigo-500/20" />
                        <button onClick={save} disabled={saving || !/^https?:\/\/\S+$/i.test(url.trim())} className="flex items-center gap-1.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-bold disabled:opacity-40">
                            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Film className="h-4 w-4" />} Save
                        </button>
                    </div>
                </div>
            ) : (
                <p className="text-sm text-foreground/50">The recording is not available yet. Please check back later.</p>
            )}
        </div>
    );
}
