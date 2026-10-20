'use client';

import { useEffect, useMemo, useState, type ReactNode } from 'react';
import {
    Download,
    ExternalLink,
    FileText,
    Headphones,
    Image as ImageIcon,
    Maximize2,
    Minimize2,
    PictureInPicture2,
    RotateCcw,
    Video,
    X,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
    CONTENT_GROUPS,
    type ContentGroup,
    type CourseMaterial,
    formatBytes,
    materialUrl,
    materialsInGroup,
    typeLabel,
} from '@/lib/courseContent';
import MaterialView from './MaterialView';

interface MultiModalPlayerProps {
    group: ContentGroup;
    topic: { name_en?: string; materials?: CourseMaterial[] } | null;
}

type ViewMode = 'normal' | 'fullscreen' | 'minimized';

export const groupIcons = {
    notes: FileText,
    video: Video,
    audio: Headphones,
    pictures: ImageIcon,
} as const;

export default function MultiModalPlayer({ group, topic }: MultiModalPlayerProps) {
    const [viewMode, setViewMode] = useState<ViewMode>('normal');
    const items = useMemo(() => materialsInGroup(topic?.materials, group), [topic, group]);
    const [selectedId, setSelectedId] = useState<number | null>(null);

    // Falls back to the first item when the topic or tab changes.
    const material = items.find((m) => m.id === selectedId) ?? items[0] ?? null;
    const url = material ? materialUrl(material) : null;
    const groupLabel = CONTENT_GROUPS.find((g) => g.id === group)?.label ?? 'Content';
    const Icon = groupIcons[group] ?? FileText;
    const title = material?.title || topic?.name_en || 'Study material';

    useEffect(() => {
        if (viewMode !== 'fullscreen') return undefined;
        const previous = document.body.style.overflow;
        const onKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape') setViewMode('normal');
        };
        document.body.style.overflow = 'hidden';
        window.addEventListener('keydown', onKeyDown);
        return () => {
            document.body.style.overflow = previous;
            window.removeEventListener('keydown', onKeyDown);
        };
    }, [viewMode]);

    if (viewMode === 'minimized') {
        return (
            <div className="fixed bottom-5 right-5 z-[80] w-[min(92vw,24rem)] rounded-2xl border border-card-border bg-card-bg p-4 shadow-2xl animate-in fade-in zoom-in-95 duration-300">
                <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                        <div className="h-10 w-10 rounded-xl border border-blue-200 bg-blue-50 text-blue-700 flex items-center justify-center shrink-0">
                            <Icon className="h-5 w-5" />
                        </div>
                        <div className="min-w-0">
                            <p className="text-xs font-semibold text-foreground/50">{groupLabel}</p>
                            <p className="text-sm font-semibold text-foreground truncate">{title}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-1">
                        <IconButton title="Back to normal size" onClick={() => setViewMode('normal')}>
                            <RotateCcw className="h-4 w-4" />
                        </IconButton>
                        <IconButton title="Full screen" onClick={() => setViewMode('fullscreen')}>
                            <Maximize2 className="h-4 w-4" />
                        </IconButton>
                    </div>
                </div>
                {material?.type === 'audio' && url && (
                    <audio controls src={url} className="w-full mt-3" preload="metadata" />
                )}
            </div>
        );
    }

    const isFullscreen = viewMode === 'fullscreen';

    return (
        <div className={cn('w-full animate-in fade-in duration-300', isFullscreen ? 'fixed inset-0 z-[70] bg-slate-950/90 backdrop-blur-md p-3 md:p-5' : 'h-full')}>
            <div className="h-full w-full flex flex-col gap-3">
                <div className="rounded-2xl border border-card-border bg-card-bg px-4 py-3 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                        <div className="h-9 w-9 rounded-xl border border-blue-200 bg-blue-50 text-blue-700 flex items-center justify-center shrink-0">
                            <Icon className="h-4 w-4" />
                        </div>
                        <div className="min-w-0">
                            <p className="text-xs font-semibold text-foreground/50">
                                {material ? typeLabel(material.type) : groupLabel}
                                {material?.file_size ? ` · ${formatBytes(material.file_size)}` : ''}
                            </p>
                            <p className="text-sm font-semibold text-foreground truncate">{title}</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        {url && (
                            <>
                                <a
                                    href={url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="h-9 rounded-lg border border-card-border px-3 text-xs font-semibold text-foreground/70 hover:text-blue-700 hover:border-blue-300 transition-colors flex items-center gap-1.5"
                                >
                                    <ExternalLink className="h-3.5 w-3.5" />
                                    {material?.type === 'youtube' ? 'Open on YouTube' : 'Open'}
                                </a>
                                {material?.type !== 'youtube' && (
                                    <a
                                        href={url}
                                        download
                                        className="h-9 rounded-lg border border-card-border px-3 text-xs font-semibold text-foreground/70 hover:text-blue-700 hover:border-blue-300 transition-colors flex items-center gap-1.5"
                                    >
                                        <Download className="h-3.5 w-3.5" />
                                        Download
                                    </a>
                                )}
                            </>
                        )}
                        {material && (
                            <IconButton title="Shrink to a small window" onClick={() => setViewMode('minimized')}>
                                <PictureInPicture2 className="h-4 w-4" />
                            </IconButton>
                        )}
                        <IconButton title={isFullscreen ? 'Exit full screen' : 'Full screen'} onClick={() => setViewMode(isFullscreen ? 'normal' : 'fullscreen')}>
                            {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
                        </IconButton>
                        {isFullscreen && (
                            <IconButton title="Close full screen" onClick={() => setViewMode('normal')}>
                                <X className="h-4 w-4" />
                            </IconButton>
                        )}
                    </div>
                </div>

                {items.length > 1 && (
                    <div className="flex gap-2 overflow-x-auto pb-1">
                        {items.map((m, index) => (
                            <button
                                key={m.id}
                                type="button"
                                onClick={() => setSelectedId(m.id)}
                                className={cn(
                                    'shrink-0 rounded-xl border px-3 py-2 text-left text-xs font-semibold transition-colors max-w-[16rem]',
                                    material?.id === m.id
                                        ? 'border-blue-500 bg-blue-600 text-white'
                                        : 'border-card-border bg-card-bg text-foreground/70 hover:border-blue-300'
                                )}
                            >
                                <span className="block truncate">{index + 1}. {m.title}</span>
                            </button>
                        ))}
                    </div>
                )}

                <div className={cn('rounded-2xl overflow-hidden border border-card-border bg-background', isFullscreen ? 'flex-1 min-h-0' : 'h-[64vh] md:h-[70vh] min-h-[360px]')}>
                    {material ? (
                        <MaterialView key={material.id} material={material} />
                    ) : (
                        <div className="h-full w-full flex flex-col items-center justify-center text-center px-6">
                            <Icon className="h-12 w-12 text-foreground/30 mb-4" />
                            <p className="text-sm font-semibold text-foreground/60">No {groupLabel.toLowerCase()} for this topic yet</p>
                            <p className="text-xs text-foreground/45 mt-2">Try another tab above, or check back later.</p>
                        </div>
                    )}
                </div>

                {isFullscreen && (
                    <p className="text-center text-xs text-white/60">Press Esc to exit full screen</p>
                )}
            </div>
        </div>
    );
}

function IconButton({ title, onClick, children }: { title: string; onClick: () => void; children: ReactNode }) {
    return (
        <button
            type="button"
            onClick={onClick}
            title={title}
            aria-label={title}
            className="h-9 w-9 rounded-lg border border-card-border text-foreground/60 hover:text-blue-700 hover:border-blue-300 transition-colors flex items-center justify-center"
        >
            {children}
        </button>
    );
}
