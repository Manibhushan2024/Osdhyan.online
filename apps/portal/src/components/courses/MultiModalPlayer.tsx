'use client';

import { useEffect, useMemo, useState } from 'react';
import {
    Download,
    ExternalLink,
    FileText,
    Layers,
    Map,
    Maximize2,
    Mic,
    Minimize2,
    PictureInPicture2,
    RotateCcw,
    Video,
    X,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface MultiModalPlayerProps {
    type: 'text' | 'audio' | 'video' | 'visual' | 'mindmap' | 'infographic';
    topic: any;
}

type ViewMode = 'normal' | 'fullscreen' | 'minimized';

const modeMeta = {
    text: {
        label: 'PDF Notes',
        icon: FileText,
        badge: 'text-blue-700 bg-blue-50 border-blue-200',
    },
    audio: {
        label: 'Audio Brief',
        icon: Mic,
        badge: 'text-orange-700 bg-orange-50 border-orange-200',
    },
    video: {
        label: 'Video Class',
        icon: Video,
        badge: 'text-rose-700 bg-rose-50 border-rose-200',
    },
    visual: {
        label: 'Visual Layer',
        icon: Map,
        badge: 'text-violet-700 bg-violet-50 border-violet-200',
    },
    mindmap: {
        label: 'Mindmap',
        icon: Map,
        badge: 'text-violet-700 bg-violet-50 border-violet-200',
    },
    infographic: {
        label: 'Infographic',
        icon: Layers,
        badge: 'text-emerald-700 bg-emerald-50 border-emerald-200',
    },
} as const;

export default function MultiModalPlayer({ type, topic }: MultiModalPlayerProps) {
    const [viewMode, setViewMode] = useState<ViewMode>('normal');
    const STORAGE_URL = ((process.env.NEXT_PUBLIC_STORAGE_URL ?? process.env.NEXT_PUBLIC_API_URL?.replace(/\/api$/, '') ?? '').replace(/\/$/, '')) + '/storage/';

    const material = useMemo(() => {
        const materials = topic?.materials ?? [];
        const direct = materials.find((m: any) => m.type === type);
        if (direct) return direct;
        if (type === 'visual') {
            return materials.find((m: any) => m.type === 'mindmap' || m.type === 'infographic');
        }
        return null;
    }, [topic, type]);

    const fileUrl = useMemo(() => {
        if (!material?.file_path) return null;
        return material.file_path.startsWith('http') ? material.file_path : `${STORAGE_URL}${material.file_path}`;
    }, [material]);

    useEffect(() => {
        if (viewMode !== 'fullscreen') return undefined;

        const previous = document.body.style.overflow;
        const onKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                setViewMode('normal');
            }
        };

        document.body.style.overflow = 'hidden';
        window.addEventListener('keydown', onKeyDown);

        return () => {
            document.body.style.overflow = previous;
            window.removeEventListener('keydown', onKeyDown);
        };
    }, [viewMode]);

    const meta = modeMeta[type] ?? modeMeta.text;
    const Icon = meta.icon;
    const title = material?.title || topic?.name_en || 'Learning Material';

    const openInNewTab = () => {
        if (!fileUrl) return;
        window.open(fileUrl, '_blank', 'noopener,noreferrer');
    };

    const renderNoMaterial = (label: string) => (
        <div className="h-full w-full flex flex-col items-center justify-center text-center px-6">
            <Icon className="h-12 w-12 text-foreground/30 mb-4" />
            <p className="text-sm font-black uppercase tracking-wider text-foreground/55">{label} is not uploaded yet</p>
            <p className="text-xs text-foreground/45 mt-2">Upload this mode from admin to unlock full study view.</p>
        </div>
    );

    const renderMaterial = () => {
        if ((type === 'mindmap' || type === 'infographic' || type === 'visual') && fileUrl) {
            return (
                <div className="h-full w-full overflow-auto bg-gradient-to-br from-slate-50 to-slate-100">
                    <div className="min-h-full flex items-center justify-center p-4 md:p-8">
                        <img
                            src={fileUrl}
                            alt={title}
                            className="max-w-full max-h-full object-contain rounded-2xl border border-card-border shadow-[0_16px_40px_-24px_rgba(15,23,42,0.9)]"
                        />
                    </div>
                </div>
            );
        }

        if (type === 'text') {
            return fileUrl ? (
                <iframe
                    src={`${fileUrl}#view=FitH&toolbar=0&navpanes=0&scrollbar=1`}
                    className="h-full w-full border-0 bg-white"
                    title={title}
                />
            ) : (
                renderNoMaterial('PDF')
            );
        }

        if (type === 'audio') {
            return fileUrl ? (
                <div className="h-full w-full flex items-center justify-center bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50 p-6 md:p-10">
                    <div className="w-full max-w-2xl rounded-[1.8rem] border border-orange-200 bg-white/90 backdrop-blur p-6 md:p-8 text-center space-y-5 shadow-sm">
                        <div className="mx-auto h-16 w-16 rounded-2xl border border-orange-300 bg-orange-100 text-orange-700 flex items-center justify-center">
                            <Mic className="h-8 w-8" />
                        </div>
                        <p className="text-sm md:text-base font-black text-slate-800 uppercase tracking-wide">{title}</p>
                        <audio controls src={fileUrl} className="w-full" preload="metadata">
                            Your browser does not support the audio element.
                        </audio>
                    </div>
                </div>
            ) : (
                renderNoMaterial('Audio')
            );
        }

        if (type === 'video') {
            return fileUrl ? (
                <div className="h-full w-full bg-black">
                    <video controls className="h-full w-full outline-none" preload="metadata">
                        <source src={fileUrl} type="video/mp4" />
                        Your browser does not support the video element.
                    </video>
                </div>
            ) : (
                <div className="h-full w-full bg-black">{renderNoMaterial('Video')}</div>
            );
        }

        if ((type === 'mindmap' || type === 'infographic' || type === 'visual') && !fileUrl) {
            return renderNoMaterial(type === 'mindmap' ? 'Mindmap' : 'Infographic');
        }

        return renderNoMaterial('Content');
    };

    if (viewMode === 'minimized') {
        return (
            <div className="fixed bottom-5 right-5 z-[80] w-[min(92vw,24rem)] rounded-2xl border border-card-border bg-card-bg p-4 shadow-[0_24px_50px_-24px_rgba(15,23,42,0.95)] animate-in fade-in zoom-in-95 duration-300">
                <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                        <div className={cn('h-10 w-10 rounded-xl border flex items-center justify-center shrink-0', meta.badge)}>
                            <Icon className="h-5 w-5" />
                        </div>
                        <div className="min-w-0">
                            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-foreground/45">{meta.label}</p>
                            <p className="text-xs font-bold text-foreground truncate">{title}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-1">
                        <button
                            type="button"
                            onClick={() => setViewMode('normal')}
                            className="h-8 w-8 rounded-lg border border-card-border text-foreground/60 hover:text-blue-700 hover:border-blue-300 transition-colors flex items-center justify-center"
                            title="Restore"
                        >
                            <RotateCcw className="h-4 w-4" />
                        </button>
                        <button
                            type="button"
                            onClick={() => setViewMode('fullscreen')}
                            className="h-8 w-8 rounded-lg border border-card-border text-foreground/60 hover:text-blue-700 hover:border-blue-300 transition-colors flex items-center justify-center"
                            title="Open full window"
                        >
                            <Maximize2 className="h-4 w-4" />
                        </button>
                    </div>
                </div>
                {type === 'audio' && fileUrl && (
                    <audio controls src={fileUrl} className="w-full mt-3" preload="metadata">
                        Your browser does not support the audio element.
                    </audio>
                )}
            </div>
        );
    }

    const isFullscreen = viewMode === 'fullscreen';

    return (
        <div
            className={cn(
                'w-full animate-in fade-in duration-300',
                isFullscreen ? 'fixed inset-0 z-[70] bg-slate-950/90 backdrop-blur-md p-3 md:p-5' : 'h-full'
            )}
        >
            <div className={cn('h-full w-full flex flex-col gap-3', isFullscreen ? 'max-w-none' : 'max-w-none')}>
                <div className="rounded-2xl border border-card-border bg-card-bg px-4 py-3 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                        <div className={cn('h-9 w-9 rounded-xl border flex items-center justify-center shrink-0', meta.badge)}>
                            <Icon className="h-4 w-4" />
                        </div>
                        <div className="min-w-0">
                            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-foreground/45">{meta.label}</p>
                            <p className="text-sm font-bold text-foreground truncate">{title}</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        {fileUrl && (
                            <>
                                <button
                                    type="button"
                                    onClick={openInNewTab}
                                    className="h-9 rounded-lg border border-card-border px-3 text-[10px] font-black uppercase tracking-[0.18em] text-foreground/60 hover:text-blue-700 hover:border-blue-300 transition-colors flex items-center gap-1.5"
                                    title="Open in new tab"
                                >
                                    <ExternalLink className="h-3.5 w-3.5" />
                                    Open
                                </button>
                                <a
                                    href={fileUrl}
                                    download
                                    className="h-9 rounded-lg border border-card-border px-3 text-[10px] font-black uppercase tracking-[0.18em] text-foreground/60 hover:text-blue-700 hover:border-blue-300 transition-colors flex items-center gap-1.5"
                                >
                                    <Download className="h-3.5 w-3.5" />
                                    Save
                                </a>
                            </>
                        )}

                        <button
                            type="button"
                            onClick={() => setViewMode('minimized')}
                            className="h-9 w-9 rounded-lg border border-card-border text-foreground/60 hover:text-blue-700 hover:border-blue-300 transition-colors flex items-center justify-center"
                            title="Minimize"
                        >
                            <PictureInPicture2 className="h-4 w-4" />
                        </button>

                        <button
                            type="button"
                            onClick={() => setViewMode(isFullscreen ? 'normal' : 'fullscreen')}
                            className="h-9 w-9 rounded-lg border border-card-border text-foreground/60 hover:text-blue-700 hover:border-blue-300 transition-colors flex items-center justify-center"
                            title={isFullscreen ? 'Exit full window' : 'Open full window'}
                        >
                            {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
                        </button>

                        {isFullscreen && (
                            <button
                                type="button"
                                onClick={() => setViewMode('normal')}
                                className="h-9 w-9 rounded-lg border border-card-border text-foreground/60 hover:text-red-600 hover:border-red-300 transition-colors flex items-center justify-center"
                                title="Close full window"
                            >
                                <X className="h-4 w-4" />
                            </button>
                        )}
                    </div>
                </div>

                <div
                    className={cn(
                        'rounded-[1.4rem] overflow-hidden border border-card-border bg-background shadow-[0_24px_60px_-40px_rgba(15,23,42,0.95)]',
                        isFullscreen ? 'flex-1 min-h-0' : 'h-[64vh] md:h-[70vh] min-h-[360px]'
                    )}
                >
                    {renderMaterial()}
                </div>

                <div className={cn('grid gap-3', isFullscreen ? 'grid-cols-2 lg:grid-cols-4' : 'grid-cols-1 md:grid-cols-3')}>
                    <div className="rounded-2xl border border-card-border bg-card-bg p-4">
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-foreground/45">Current Topic</p>
                        <p className="text-sm font-bold text-foreground mt-1 line-clamp-1">{topic?.name_en || 'Selected topic'}</p>
                    </div>
                    <div className="rounded-2xl border border-card-border bg-card-bg p-4">
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-foreground/45">Active Mode</p>
                        <p className="text-sm font-bold text-foreground mt-1">{meta.label}</p>
                    </div>
                    <div className="rounded-2xl border border-card-border bg-card-bg p-4">
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-foreground/45">Window State</p>
                        <p className="text-sm font-bold text-foreground mt-1 capitalize">{viewMode}</p>
                    </div>
                    {isFullscreen && (
                        <div className="rounded-2xl border border-card-border bg-card-bg p-4">
                            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-foreground/45">Quick Hint</p>
                            <p className="text-sm font-bold text-foreground mt-1">Press `Esc` to exit full window</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}


