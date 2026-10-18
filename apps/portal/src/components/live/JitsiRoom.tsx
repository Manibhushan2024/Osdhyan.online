'use client';

import { useEffect, useRef, useState } from 'react';
import { Loader2, AlertCircle } from 'lucide-react';
import type { JitsiPayload } from './types';

/* Jitsi's iframe API object (subset we use). Loaded at runtime from the
   provider's external_api.js, never bundled. */
type JitsiApi = {
    executeCommand: (cmd: string, ...args: unknown[]) => void;
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
    const [phase, setPhase] = useState<'loading' | 'ready' | 'error'>('loading');
    const [error, setError] = useState<string | null>(null);

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

                api.addListener('videoConferenceJoined', () => {
                    setPhase('ready');
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

    return (
        <div className="relative w-full h-full bg-slate-950">
            <div ref={containerRef} className="absolute inset-0 [&>iframe]:w-full [&>iframe]:h-full" />
            {phase === 'loading' && (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-white/70 pointer-events-none">
                    <Loader2 className="h-6 w-6 animate-spin" />
                    <p className="text-[10px] font-black uppercase tracking-widest">Connecting to the classroom…</p>
                </div>
            )}
            {phase === 'error' && (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-white p-6 text-center">
                    <AlertCircle className="h-8 w-8 text-red-400" />
                    <p className="text-sm font-bold">{error ?? 'Could not start the video.'}</p>
                    <p className="text-[10px] text-white/50 font-bold uppercase tracking-widest">Check your connection and reload the page.</p>
                </div>
            )}
        </div>
    );
}
