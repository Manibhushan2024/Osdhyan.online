'use client';

import { useEffect, useRef, useState } from 'react';
import { Loader2, AlertCircle, ExternalLink, Info, X } from 'lucide-react';
import type { JitsiPayload } from './types';

/* Jitsi's iframe API object (subset we use). Loaded at runtime from the
   provider's external_api.js, never bundled. */
type JitsiApi = {
    executeCommand: (cmd: string, ...args: unknown[]) => void;
    getIFrame?: () => HTMLIFrameElement | null;
    addListener: (event: string, handler: (...args: unknown[]) => void) => void;
    dispose: () => void;
};
type JitsiCtor = new (domain: string, options: Record<string, unknown>) => JitsiApi;

declare global {
    interface Window {
        JitsiMeetExternalAPI?: JitsiCtor;
    }
}

const scriptPromises = new Map<string, Promise<void>>();

function loadScript(src: string): Promise<void> {
    if (typeof window === 'undefined') return Promise.reject(new Error('no window'));
    const existing = scriptPromises.get(src);
    if (existing) return existing;
    const p = new Promise<void>((resolve, reject) => {
        if (window.JitsiMeetExternalAPI && document.querySelector(`script[src="${src}"]`)) {
            resolve();
            return;
        }
        const el = document.createElement('script');
        el.src = src;
        el.async = true;
        el.onload = () => resolve();
        el.onerror = () => {
            scriptPromises.delete(src);
            reject(new Error('Could not load the video library'));
        };
        document.head.appendChild(el);
    });
    scriptPromises.set(src, p);
    return p;
}

type Props = {
    payload: JitsiPayload;
    subject: string;
    displayName: string;
    email?: string;
    onLeft?: () => void;
};

export default function JitsiRoom({ payload, subject, displayName, email, onLeft }: Props) {
    const containerRef = useRef<HTMLDivElement>(null);
    const onLeftRef = useRef(onLeft);
    // loading → the Jitsi page is loading; shown → Jitsi's own screen is visible
    // (it may still be waiting for the host); joined → inside the call.
    const [phase, setPhase] = useState<'loading' | 'shown' | 'joined' | 'error'>('loading');
    const [error, setError] = useState<string | null>(null);
    const [hintClosed, setHintClosed] = useState(false);

    useEffect(() => {
        onLeftRef.current = onLeft;
    }, [onLeft]);

    useEffect(() => {
        let api: JitsiApi | null = null;
        let cancelled = false;

        loadScript(payload.external_api_url)
            .then(() => {
                if (cancelled || !containerRef.current || !window.JitsiMeetExternalAPI) return;
                containerRef.current.innerHTML = '';

                const moderator = payload.is_moderator;
                api = new window.JitsiMeetExternalAPI(payload.domain, {
                    roomName: payload.room,
                    parentNode: containerRef.current,
                    jwt: payload.jwt ?? undefined,
                    width: '100%',
                    height: '100%',
                    lang: 'en',
                    userInfo: { displayName, email },
                    configOverwrite: {
                        subject,
                        prejoinConfig: { enabled: false },
                        startWithAudioMuted: !moderator,
                        startWithVideoMuted: !moderator,
                        disableDeepLinking: true,
                        enableWelcomePage: false,
                        disableInviteFunctions: true,
                        hideConferenceSubject: false,
                        enableClosePage: false,
                        toolbarButtons: moderator
                            ? ['microphone', 'camera', 'desktop', 'chat', 'raisehand', 'participants-pane', 'tileview', 'settings', 'recording', 'mute-everyone', 'security', 'hangup', 'fullscreen', 'whiteboard', 'select-background']
                            : ['microphone', 'camera', 'raisehand', 'tileview', 'fullscreen', 'hangup', 'settings'],
                    },
                    interfaceConfigOverwrite: {
                        SHOW_JITSI_WATERMARK: false,
                        SHOW_BRAND_WATERMARK: false,
                        MOBILE_APP_PROMO: false,
                        DISABLE_JOIN_LEAVE_NOTIFICATIONS: true,
                    },
                });

                // Hide our spinner once Jitsi's own page is up, even if it is still
                // showing "waiting for the moderator" (videoConferenceJoined only
                // fires after that), so the two never draw over each other.
                const iframe = api.getIFrame?.();
                const shown = () => { if (!cancelled) setPhase(p => (p === 'loading' ? 'shown' : p)); };
                if (iframe) iframe.addEventListener('load', shown, { once: true });
                setTimeout(shown, 6000);

                api.addListener('videoConferenceJoined', () => {
                    setPhase('joined');
                    // Plain Jitsi: the moderator locks the room with the class password.
                    if (moderator && payload.password) api?.executeCommand('password', payload.password);
                });
                api.addListener('passwordRequired', () => {
                    if (payload.password) api?.executeCommand('password', payload.password);
                });
                api.addListener('readyToClose', () => onLeftRef.current?.());
                api.addListener('videoConferenceLeft', () => onLeftRef.current?.());
                api.addListener('errorOccurred', (e: unknown) => {
                    const detail = e as { error?: { name?: string; isFatal?: boolean } };
                    if (detail?.error?.isFatal) {
                        setError(detail.error.name || 'The video session hit an error.');
                        setPhase('error');
                    }
                });
            })
            .catch((e: Error) => {
                if (cancelled) return;
                setError(e.message);
                setPhase('error');
            });

        return () => {
            cancelled = true;
            try { api?.dispose(); } catch { /* iframe already gone */ }
        };
        // payload fields are stable for a given join; re-create only when the room changes
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [payload.room, payload.jwt, payload.domain, payload.external_api_url, payload.password, payload.is_moderator]);

    const moderator = payload.is_moderator;
    const showHostHint = !!payload.needs_host_login && phase === 'shown' && !hintClosed;

    return (
        <div className="relative w-full h-full bg-slate-950">
            <div ref={containerRef} className="absolute inset-0 [&>iframe]:w-full [&>iframe]:h-full" />
            {phase === 'loading' && (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-white/70 pointer-events-none">
                    <Loader2 className="h-6 w-6 animate-spin" />
                    <p className="text-xs font-bold">Opening the video room…</p>
                </div>
            )}
            {showHostHint && (
                <div className="absolute left-2 right-2 bottom-2 z-10 flex items-start gap-2 rounded-xl bg-slate-900/95 border border-white/10 p-3 text-white text-xs shadow-xl">
                    <Info className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
                    <div className="flex-1 space-y-1.5">
                        {moderator ? (
                            <p>
                                If the video says <strong>&ldquo;waiting for a moderator&rdquo;</strong>, press <strong>Log-in</strong> inside the video
                                and sign in with Google (once). Students are let in as soon as you do.
                            </p>
                        ) : (
                            <p>If the video says it is waiting for the moderator, the teacher has not opened the room yet. Stay on this page — you can already ask questions in the chat.</p>
                        )}
                        {payload.web_url && (
                            <a href={payload.web_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 font-bold text-amber-300 hover:text-amber-200">
                                <ExternalLink className="h-3 w-3" /> Sign-in not working? Open the video in a new tab
                            </a>
                        )}
                        {payload.web_url && payload.password && (
                            <p className="text-white/60">Room password: <span className="font-mono font-bold text-white select-all">{payload.password}</span></p>
                        )}
                    </div>
                    <button onClick={() => setHintClosed(true)} className="p-1 rounded-lg hover:bg-white/10" aria-label="Close tip"><X className="h-3.5 w-3.5" /></button>
                </div>
            )}
            {phase === 'error' && (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-white p-6 text-center">
                    <AlertCircle className="h-8 w-8 text-red-400" />
                    <p className="text-sm font-bold">{error ?? 'Could not start the video.'}</p>
                    <p className="text-xs text-white/60">Check your internet connection and reload the page. The chat keeps working.</p>
                </div>
            )}
        </div>
    );
}
