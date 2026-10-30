'use client';

import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react';
import { Maximize2, Minimize2 } from 'lucide-react';
import { cn } from '@/lib/utils';

/** Remembered across materials: the student last chose to study in full screen. */
const PREF_KEY = 'osd_material_fullscreen';

type FsDocument = Document & {
    webkitFullscreenElement?: Element | null;
    webkitExitFullscreen?: () => Promise<void> | void;
};
type FsElement = HTMLElement & { webkitRequestFullscreen?: () => Promise<void> | void };

function fullscreenElement(): Element | null {
    const d = document as FsDocument;
    return d.fullscreenElement ?? d.webkitFullscreenElement ?? null;
}

function readPref(): boolean {
    try {
        return localStorage.getItem(PREF_KEY) === '1';
    } catch {
        return false;
    }
}

function writePref(on: boolean) {
    try {
        localStorage.setItem(PREF_KEY, on ? '1' : '0');
    } catch {
        /* private mode — the preference is just not remembered */
    }
}

type Props = {
    title: string;
    /** Render the content; `full` is true while in full screen (fill the screen). */
    children: (full: boolean) => ReactNode;
    className?: string;
};

/**
 * Wraps a study material with a real full-screen mode (Fullscreen API: the
 * page's own header, sidebar and the browser's tabs/address bar disappear,
 * like a normal PDF reader). Where the API is missing (iPhone Safari) it
 * falls back to covering the whole window. F toggles, Esc exits. The choice
 * is remembered: the next material offers "Continue in full screen" (browsers
 * only allow full screen after a tap, so it cannot switch on by itself).
 */
export default function FullscreenFrame({ title, children, className }: Props) {
    const ref = useRef<HTMLDivElement>(null);
    const [full, setFull] = useState(false);
    const [fallback, setFallback] = useState(false); // CSS full window (no Fullscreen API)
    // The page renders on the client after its data loads, so reading the
    // remembered choice in the initial state is safe.
    const [offer, setOffer] = useState(() => typeof window !== 'undefined' && readPref());
    const [barVisible, setBarVisible] = useState(true);
    const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

    // In full screen the top bar fades after 3 s without movement.
    const wake = useCallback(() => {
        setBarVisible(true);
        if (hideTimer.current) clearTimeout(hideTimer.current);
        hideTimer.current = setTimeout(() => setBarVisible(false), 3000);
    }, []);
    useEffect(() => () => {
        if (hideTimer.current) clearTimeout(hideTimer.current);
    }, []);

    const enter = useCallback(async () => {
        const el = ref.current as FsElement | null;
        if (!el) return;
        setOffer(false);
        writePref(true);
        const request = el.requestFullscreen
            ? () => el.requestFullscreen({ navigationUI: 'hide' })
            : el.webkitRequestFullscreen
                ? () => el.webkitRequestFullscreen!()
                : null;
        if (request) {
            try {
                // Some embedded browsers neither grant nor refuse: give up after 1 s.
                await Promise.race([
                    Promise.resolve(request()),
                    new Promise((resolve) => setTimeout(resolve, 1000)),
                ]);
            } catch {
                /* refused — fall back below */
            }
            if (fullscreenElement() === el) return;
        }
        setFallback(true);
        setFull(true);
        wake();
    }, [wake]);

    const exit = useCallback(async () => {
        writePref(false);
        if (fallback) {
            setFallback(false);
            setFull(false);
            setBarVisible(true);
            return;
        }
        const d = document as FsDocument;
        try {
            if (d.exitFullscreen) await d.exitFullscreen();
            else if (d.webkitExitFullscreen) await d.webkitExitFullscreen();
        } catch {
            setFull(false);
        }
    }, [fallback]);

    const toggle = useCallback(() => (full ? exit() : enter()), [full, enter, exit]);

    // Track the browser's full-screen state (Esc, F11, system gestures).
    useEffect(() => {
        const onChange = () => {
            const isOurs = fullscreenElement() === ref.current;
            setFull(isOurs);
            if (isOurs) wake();
            else {
                setFallback(false);
                setBarVisible(true);
            }
        };
        document.addEventListener('fullscreenchange', onChange);
        document.addEventListener('webkitfullscreenchange', onChange);
        return () => {
            document.removeEventListener('fullscreenchange', onChange);
            document.removeEventListener('webkitfullscreenchange', onChange);
        };
    }, [wake]);

    // F toggles; Esc leaves the CSS fallback (the API handles Esc itself).
    useEffect(() => {
        const onKey = (e: KeyboardEvent) => {
            const t = e.target as HTMLElement | null;
            if (t && (t.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT'].includes(t.tagName))) return;
            if (e.ctrlKey || e.metaKey || e.altKey) return;
            if (e.key === 'f' || e.key === 'F') {
                e.preventDefault();
                void toggle();
            } else if (e.key === 'Escape' && fallback) {
                void exit();
            }
        };
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, [toggle, exit, fallback]);

    // No page scrolling behind the CSS fallback.
    useEffect(() => {
        if (!fallback) return;
        const prev = document.body.style.overflow;
        document.body.style.overflow = 'hidden';
        return () => {
            document.body.style.overflow = prev;
        };
    }, [fallback]);

    return (
        <div
            ref={ref}
            onMouseMove={full ? wake : undefined}
            onTouchStart={full ? wake : undefined}
            className={cn(
                'relative',
                full ? 'h-screen w-screen bg-white dark:bg-slate-950 flex flex-col' : className,
                fallback && 'fixed inset-0 z-[200]',
            )}
        >
            {full ? (
                <div
                    className={cn(
                        'absolute inset-x-0 top-0 z-10 flex items-center justify-between gap-3 px-3 py-2 sm:px-4',
                        'bg-slate-900/85 text-white backdrop-blur transition-opacity duration-300',
                        barVisible ? 'opacity-100' : 'opacity-0 pointer-events-none',
                    )}
                    onMouseEnter={wake}
                >
                    <p className="min-w-0 truncate text-sm font-semibold">{title}</p>
                    <button
                        type="button"
                        onClick={() => void exit()}
                        className="shrink-0 inline-flex items-center gap-2 rounded-lg bg-white/15 px-3 py-1.5 text-xs font-semibold hover:bg-white/25"
                    >
                        <Minimize2 className="h-4 w-4" />
                        Exit full screen <span className="hidden sm:inline text-white/60">(Esc)</span>
                    </button>
                </div>
            ) : (
                <div className="flex items-center justify-end gap-2 px-2 py-1.5 border-b border-card-border bg-card-bg">
                    {offer && (
                        <button
                            type="button"
                            onClick={() => void enter()}
                            className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white shadow ring-4 ring-blue-600/20 hover:bg-blue-700 animate-in fade-in"
                        >
                            <Maximize2 className="h-4 w-4" />
                            Continue in full screen
                        </button>
                    )}
                    <button
                        type="button"
                        onClick={() => void enter()}
                        title="Full screen (F)"
                        aria-label="Open in full screen"
                        className="inline-flex items-center gap-2 rounded-lg border border-card-border px-3 py-1.5 text-xs font-semibold text-foreground/80 hover:border-blue-400 hover:text-blue-600"
                    >
                        <Maximize2 className="h-4 w-4" />
                        Full screen <span className="hidden sm:inline text-foreground/40">(F)</span>
                    </button>
                </div>
            )}

            <div className={cn(full ? 'flex-1 min-h-0' : 'h-[calc(100%-2.6rem)] w-full')}>{children(full)}</div>
        </div>
    );
}
