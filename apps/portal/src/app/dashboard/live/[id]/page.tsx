'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import {
    AlertCircle, ArrowLeft, BarChart2, Hand, Loader2, MessageSquare, Play,
    Radio, Smartphone, Square, Users, Video, ExternalLink, Timer, RefreshCw,
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
import type { JoinPayload, JoinResponse, LiveClassSummary, LiveState, OwnedLiveClass } from '@/components/live/types';

const STATE_POLL_MS = 5000;
const STATE_POLL_ENDED_MS = 60000;

type Tab = 'chat' | 'poll' | 'people' | 'host';

export default function LiveClassroomPage() {
    const { id } = useParams<{ id: string }>();
    const classId = Number(id);
    const { user, loading: authLoading } = useAuth();
    const router = useRouter();

    const [cls, setCls] = useState<LiveClassSummary | null>(null);
    const [owned, setOwned] = useState<OwnedLiveClass | null>(null);
    const [loadError, setLoadError] = useState<string | null>(null);
    const [state, setState] = useState<LiveState | null>(null);
    const [join, setJoin] = useState<JoinPayload | null>(null);
    const [joinError, setJoinError] = useState<{ code: string | null; message: string } | null>(null);
    const [leftRoom, setLeftRoom] = useState(false);
    const [tab, setTab] = useState<Tab>('chat');
    const [now, setNow] = useState(() => Date.now());
    const [busy, setBusy] = useState<'golive' | 'end' | 'hand' | null>(null);

    const joiningRef = useRef(false);
    const joinedRef = useRef(false);

    const status = state?.status ?? cls?.status ?? null;
    const isTeacher = !!(state?.me.is_teacher ?? cls?.can_manage);
    const live = status === 'live';

    // ── Load class ────────────────────────────────────────────────────────
    useEffect(() => {
        if (authLoading) return;
        if (!user) {
            router.replace(loginUrlWithRedirect(`/dashboard/live/${classId}`));
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

    // ── State polling ─────────────────────────────────────────────────────
    const refreshState = useCallback(async () => {
        try {
            const res = await api.get<LiveState>(`/live-classes/${classId}/state`);
            setState(res.data);
        } catch {
            // keep last known state; next tick retries
        }
    }, [classId]);

    useEffect(() => {
        if (!cls) return;
        refreshState();
        const t = setInterval(refreshState, status === 'ended' ? STATE_POLL_ENDED_MS : STATE_POLL_MS);
        return () => clearInterval(t);
    }, [cls, status, refreshState]);

    // ── Join as soon as the class is live ─────────────────────────────────
    useEffect(() => {
        if (!live || join || joinError || leftRoom || joiningRef.current || !user) return;
        joiningRef.current = true;
        api.post<JoinResponse>(`/live-classes/${classId}/join`)
            .then(res => {
                setJoin(res.data.provider);
                setState(res.data.state);
                setCls(res.data.class);
                joinedRef.current = true;
            })
            .catch(e => {
                setJoinError({ code: apiErrorCode(e), message: apiErrorMessage(e, 'Could not join the class.') });
            })
            .finally(() => {
                joiningRef.current = false;
            });
    }, [live, join, joinError, leftRoom, classId, user]);

    // The class ended while we were inside.
    useEffect(() => {
        if (status === 'ended' && join) {
            setJoin(null);
            joinedRef.current = false;
        }
    }, [status, join]);

    // Tell the server we left when the tab closes / route changes.
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

    // ── Actions ───────────────────────────────────────────────────────────
    const goLive = async () => {
        if (busy) return;
        setBusy('golive');
        try {
            const res = await api.post(`/live-classes/${classId}/go-live`);
            const c: OwnedLiveClass = res.data.class;
            setOwned(c);
            setCls(c);
            setJoinError(null);
            setLeftRoom(false);
            toast.success('You are live!');
            refreshState();
        } catch (e) {
            toast.error(apiErrorMessage(e, 'Could not go live'));
        } finally {
            setBusy(null);
        }
    };

    const endClass = async () => {
        if (busy) return;
        if (!confirm('End this class for everyone? Students will be disconnected.')) return;
        setBusy('end');
        try {
            const res = await api.post(`/live-classes/${classId}/end`);
            setCls(res.data.class);
            setJoin(null);
            joinedRef.current = false;
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

    const rejoin = () => {
        setLeftRoom(false);
        setJoinError(null);
    };

    // ── Render ────────────────────────────────────────────────────────────
    if (loadError) {
        return (
            <div className="max-w-xl mx-auto py-20 px-4 text-center space-y-4">
                <AlertCircle className="h-10 w-10 text-red-500 mx-auto" />
                <p className="text-sm font-bold text-foreground">{loadError}</p>
                <Link href="/dashboard/live" className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-blue-500 hover:text-blue-400">
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

    return (
        <div className="max-w-[1400px] mx-auto pb-10 px-4 md:px-0 space-y-4 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex flex-wrap items-center gap-3">
                <Link href="/dashboard/live" className="p-2 rounded-xl hover:bg-card-bg border border-transparent hover:border-card-border text-foreground/50 hover:text-foreground transition-all" aria-label="Back">
                    <ArrowLeft className="h-4 w-4" />
                </Link>
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                        <StatusBadge status={status ?? cls.status} />
                        {cls.subject && <span className="text-[9px] font-black uppercase tracking-widest text-foreground/40">{cls.subject}</span>}
                        <span className="text-[9px] font-black uppercase tracking-widest text-foreground/40 flex items-center gap-1"><Users className="h-3 w-3" /> {participants}</span>
                    </div>
                    <h1 className="text-lg md:text-2xl font-black text-foreground tracking-tight truncate">{cls.title}</h1>
                    <p className="text-[10px] font-bold text-foreground/40 uppercase tracking-widest">with {cls.teacher?.name ?? 'your teacher'}</p>
                </div>

                {/* Teacher controls */}
                {isTeacher && status !== 'ended' && (
                    <div className="flex items-center gap-2">
                        {status === 'scheduled' && (
                            <button onClick={goLive} disabled={busy === 'golive'} className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-red-500 hover:bg-red-400 text-white text-[10px] font-black uppercase tracking-widest shadow-lg shadow-red-500/20 disabled:opacity-50">
                                {busy === 'golive' ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Radio className="h-3.5 w-3.5" />} Go live
                            </button>
                        )}
                        <button onClick={() => setTab('host')} className={cn('flex items-center gap-2 px-4 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest border', tab === 'host' ? 'bg-foreground text-background border-foreground' : 'bg-card-bg border-card-border text-foreground hover:bg-foreground/5')}>
                            <Smartphone className="h-3.5 w-3.5" /> Other device
                        </button>
                        {status === 'live' && (
                            <button onClick={endClass} disabled={busy === 'end'} className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-foreground/5 hover:bg-red-500/10 text-foreground hover:text-red-500 border border-card-border text-[10px] font-black uppercase tracking-widest disabled:opacity-50">
                                <Square className="h-3.5 w-3.5" /> End class
                            </button>
                        )}
                    </div>
                )}
            </div>

            {/* Body */}
            <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_380px] gap-4">
                {/* Video area */}
                <div className="bg-card-bg border border-card-border rounded-[1.5rem] overflow-hidden min-h-[320px] h-[56vw] max-h-[720px] lg:h-[calc(100vh-220px)] lg:min-h-[480px]">
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
                        <div className="h-full flex flex-col items-center justify-center gap-4 p-6 text-center">
                            {joinError ? (
                                <>
                                    <AlertCircle className="h-9 w-9 text-red-500" />
                                    <p className="text-sm font-bold text-foreground">{joinError.message}</p>
                                    {joinError.code !== 'full' && (
                                        <button onClick={rejoin} className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-red-500 text-white text-[10px] font-black uppercase tracking-widest hover:bg-red-400">
                                            <RefreshCw className="h-3.5 w-3.5" /> Try again
                                        </button>
                                    )}
                                    {joinError.code === 'full' && (
                                        <p className="text-[10px] font-bold uppercase tracking-widest text-foreground/40">You can still follow the chat and polls. A seat frees up when someone leaves.</p>
                                    )}
                                </>
                            ) : leftRoom ? (
                                <>
                                    <Video className="h-9 w-9 text-foreground/30" />
                                    <p className="text-sm font-bold text-foreground">You left the room.</p>
                                    <button onClick={rejoin} className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-red-500 text-white text-[10px] font-black uppercase tracking-widest hover:bg-red-400">
                                        <Radio className="h-3.5 w-3.5" /> Rejoin
                                    </button>
                                </>
                            ) : (
                                <>
                                    <Loader2 className="h-7 w-7 animate-spin text-red-500" />
                                    <p className="text-[10px] font-black uppercase tracking-widest text-foreground/40">Joining…</p>
                                </>
                            )}
                        </div>
                    )}

                    {status === 'ended' && (
                        <EndedView title={cls.title} recordingUrl={recordingUrl} youtubeId={recordingYoutubeId} />
                    )}
                </div>

                {/* Side panel */}
                <aside className="bg-card-bg border border-card-border rounded-[1.5rem] flex flex-col overflow-hidden h-[520px] lg:h-[calc(100vh-220px)] lg:min-h-[480px]">
                    <div className="shrink-0 flex items-center gap-1 p-2 border-b border-card-border">
                        <TabButton active={tab === 'chat'} onClick={() => setTab('chat')} icon={MessageSquare} label="Chat" />
                        <TabButton active={tab === 'poll'} onClick={() => setTab('poll')} icon={BarChart2} label="Poll" dot={!!state?.poll?.is_open && !state?.my_vote && !isTeacher} />
                        <TabButton active={tab === 'people'} onClick={() => setTab('people')} icon={Users} label={String(participants)} />
                        {isTeacher && <TabButton active={tab === 'host'} onClick={() => setTab('host')} icon={Hand} label={String(state?.hands_raised_count ?? 0)} dot={(state?.hands_raised_count ?? 0) > 0} />}
                        {!isTeacher && live && state?.me.joined && (
                            <button
                                onClick={toggleHand}
                                disabled={busy === 'hand'}
                                className={cn(
                                    'ml-auto flex items-center gap-1.5 px-3 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all',
                                    state.me.hand_raised ? 'bg-amber-500 text-white shadow-lg shadow-amber-500/30' : 'bg-foreground/5 text-foreground hover:bg-foreground/10',
                                )}
                                title={state.me.hand_raised ? 'Lower hand' : 'Raise hand'}
                            >
                                <Hand className={cn('h-3.5 w-3.5', state.me.hand_raised && 'animate-bounce')} /> {state.me.hand_raised ? 'Hand up' : 'Raise hand'}
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
                                <p className="text-[10px] font-black uppercase tracking-widest text-foreground/40">in the classroom</p>
                                <p className="text-[10px] font-bold uppercase tracking-widest text-amber-600 flex items-center gap-1"><Hand className="h-3 w-3" /> {state?.hands_raised_count ?? 0} hands raised</p>
                                {cls.max_participants > 0 && <p className="text-[10px] font-bold text-foreground/40">Seats: {participants}/{cls.max_participants}</p>}
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
                    <p className="text-[9px] font-black uppercase tracking-widest text-foreground/40 mb-1">About this class</p>
                    <p className="text-sm text-foreground/80 whitespace-pre-wrap">{cls.description}</p>
                </div>
            )}
        </div>
    );
}

function TabButton({ active, onClick, icon: Icon, label, dot }: { active: boolean; onClick: () => void; icon: typeof Users; label: string; dot?: boolean }) {
    return (
        <button
            onClick={onClick}
            className={cn(
                'relative flex items-center gap-1.5 px-3 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all',
                active ? 'bg-foreground text-background' : 'text-foreground/50 hover:text-foreground hover:bg-foreground/5',
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
            <p className="text-[10px] font-black uppercase tracking-widest text-white/50">{cd ? 'Starts in' : 'Scheduled for'}</p>
            {cd ? (
                <p className="text-4xl md:text-5xl font-black tabular-nums tracking-tight">{cd}</p>
            ) : (
                <p className="text-xl font-black">{formatWhen(cls.scheduled_at)}</p>
            )}
            <p className="text-sm font-medium text-white/60 max-w-sm">
                {isTeacher
                    ? 'You are the host. Press "Go live" when you are ready — students waiting here will join automatically.'
                    : cd
                        ? 'Keep this page open. You will be connected the moment your teacher goes live.'
                        : 'Waiting for the teacher to start the class… this page checks every few seconds.'}
            </p>
            {!cd && !isTeacher && <Loader2 className="h-4 w-4 animate-spin text-white/40" />}
        </div>
    );
}

function EndedView({ title, recordingUrl, youtubeId }: { title: string; recordingUrl: string | null; youtubeId: string | null }) {
    if (youtubeId) {
        return <YoutubePlayer videoId={youtubeId} title={title} autoplay={false} />;
    }
    if (recordingUrl && /\.(mp4|webm|m3u8|mov)(\?|$)/i.test(recordingUrl)) {
        return <video src={recordingUrl} controls className="w-full h-full bg-black" />;
    }
    return (
        <div className="h-full flex flex-col items-center justify-center gap-4 p-6 text-center">
            <Play className="h-9 w-9 text-foreground/30" />
            <p className="text-sm font-black text-foreground">This class has ended.</p>
            {recordingUrl ? (
                <a href={recordingUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white text-[10px] font-black uppercase tracking-widest">
                    <ExternalLink className="h-3.5 w-3.5" /> Open recording
                </a>
            ) : (
                <p className="text-[10px] font-bold uppercase tracking-widest text-foreground/40">Recording coming soon — check back later.</p>
            )}
        </div>
    );
}
