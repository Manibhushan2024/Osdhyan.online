'use client';

import { useEffect, useState, type ComponentType } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
    ArrowLeft,
    BookOpen,
    ChevronRight,
    CircleCheck,
    FileText,
    LibraryBig,
    Loader2,
    Map,
    Mic,
    Video,
    Zap,
    Layers,
} from 'lucide-react';
import api from '@/lib/api';
import { cn } from '@/lib/utils';
import MultiModalPlayer from './MultiModalPlayer';

type ContentType = 'text' | 'audio' | 'video' | 'mindmap' | 'infographic';

type BreadcrumbItem = {
    label: string;
    href?: string;
};

type SubjectLearningConsoleProps = {
    subjectId: string;
    breadcrumbs: BreadcrumbItem[];
    contextLabel: string;
    subtitle?: string;
};

const contentModes: Array<{
    id: ContentType;
    icon: ComponentType<{ className?: string }>;
    label: string;
    short: string;
}> = [
    { id: 'text', icon: FileText, label: 'PDF Notes', short: 'PDF' },
    { id: 'audio', icon: Mic, label: 'Audio Brief', short: 'Audio' },
    { id: 'video', icon: Video, label: 'Video Class', short: 'Video' },
    { id: 'mindmap', icon: Map, label: 'Mindmap', short: 'Map' },
    { id: 'infographic', icon: Layers, label: 'Infographic', short: 'Info' },
];

function hasType(topic: any, type: ContentType) {
    return !!topic?.materials?.some((m: any) => m.type === type);
}

export default function SubjectLearningConsole({
    subjectId,
    breadcrumbs,
    contextLabel,
    subtitle,
}: SubjectLearningConsoleProps) {
    const router = useRouter();
    const [chapters, setChapters] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeChapter, setActiveChapter] = useState<number | null>(null);
    const [selectedTopic, setSelectedTopic] = useState<any>(null);
    const [contentType, setContentType] = useState<ContentType>('text');

    useEffect(() => {
        if (!subjectId) return;
        void fetchHierarchy();
    }, [subjectId]);

    const fetchHierarchy = async () => {
        try {
            const res = await api.get(`/courses/subjects/${subjectId}/hierarchy`);
            const allChapters = res.data || [];
            setChapters(allChapters);

            if (allChapters.length > 0) {
                setActiveChapter(allChapters[0].id);
                const firstTopic = allChapters[0]?.topics?.[0];
                if (firstTopic) {
                    setSelectedTopic(firstTopic);
                }
            }
        } catch (error) {
            console.error('Failed to fetch hierarchy', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (!selectedTopic) return;
        if (!hasType(selectedTopic, contentType)) {
            const firstAvailable = contentModes.find((mode) => hasType(selectedTopic, mode.id));
            if (firstAvailable) {
                setContentType(firstAvailable.id);
            }
        }
    }, [selectedTopic, contentType]);

    const totalTopics = chapters.reduce((sum, chapter) => sum + (chapter.topics?.length || 0), 0);
    const activeChapterInfo = chapters.find((chapter) => chapter.id === activeChapter);
    const availableModeCount = selectedTopic
        ? contentModes.filter((mode) => hasType(selectedTopic, mode.id)).length
        : 0;

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center py-40 gap-4">
                <Loader2 className="h-10 w-10 text-blue-600 animate-spin" />
                <p className="text-[10px] font-black text-foreground/40 uppercase tracking-[0.3em]">
                    Mapping {contextLabel} content...
                </p>
            </div>
        );
    }

    return (
        <div className="max-w-[1700px] mx-auto space-y-5 animate-in fade-in duration-700 px-4 pb-16">
            <div className="relative overflow-hidden rounded-[2rem] border border-blue-200/30 bg-gradient-to-br from-slate-950 via-blue-950 to-sky-900 p-5 md:p-6 shadow-[0_24px_60px_-38px_rgba(2,6,23,0.9)]">
                <div className="absolute -top-16 -right-8 h-52 w-52 rounded-full bg-cyan-300/20 blur-[80px]" />
                <div className="absolute -bottom-16 -left-10 h-52 w-52 rounded-full bg-blue-500/20 blur-[80px]" />

                <div className="relative z-10 flex items-center justify-between gap-4 flex-wrap">
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => router.back()}
                            className="h-10 w-10 bg-white/10 backdrop-blur rounded-xl flex items-center justify-center text-white/75 hover:text-cyan-200 border border-white/15 transition-colors"
                        >
                            <ArrowLeft className="h-5 w-5" />
                        </button>
                        <div>
                            <div className="flex items-center gap-2 text-[9px] font-black uppercase tracking-widest text-white/60 flex-wrap">
                                {breadcrumbs.map((item, index) => (
                                    <span key={`${item.label}-${index}`} className="inline-flex items-center gap-2">
                                        {index > 0 ? <ChevronRight className="h-3 w-3" /> : null}
                                        {item.href ? (
                                            <Link href={item.href} className="hover:text-cyan-200 transition-colors">
                                                {item.label}
                                            </Link>
                                        ) : (
                                            <span>{item.label}</span>
                                        )}
                                    </span>
                                ))}
                            </div>
                            <h1 className="text-xl md:text-3xl font-black text-white uppercase tracking-tight italic">
                                {selectedTopic?.name_en || contextLabel}
                            </h1>
                            <p className="text-xs md:text-sm text-cyan-100/80 mt-1">
                                {subtitle || 'Study with PDF, Audio, Video, Mindmap, and Infographic in one full-window console.'}
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest">
                        <span className="rounded-full border border-white/25 bg-white/10 px-3 py-1 text-cyan-100">
                            Chapters: {chapters.length}
                        </span>
                        <span className="rounded-full border border-white/25 bg-white/10 px-3 py-1 text-cyan-100">
                            Topics: {totalTopics}
                        </span>
                        <span className="rounded-full border border-white/25 bg-white/10 px-3 py-1 text-cyan-100">
                            Modes: {availableModeCount}/5
                        </span>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-[330px_minmax(0,1fr)] gap-5 min-h-[calc(100vh-14rem)]">
                <aside className="rounded-[2rem] border border-card-border bg-card-bg shadow-sm overflow-hidden flex flex-col xl:sticky xl:top-24 h-fit max-h-[calc(100vh-7rem)]">
                    <div className="p-5 border-b border-card-border">
                        <h2 className="text-[10px] font-black text-foreground/40 uppercase tracking-[0.3em]">Chapter Navigator</h2>
                        <p className="text-xs text-foreground/55 mt-2">Select chapter and topic to open full learning view.</p>
                        {activeChapterInfo ? (
                            <div className="mt-3 rounded-xl border border-blue-200/40 bg-blue-50/70 px-3 py-2">
                                <p className="text-[10px] font-black uppercase tracking-widest text-blue-700">Active Chapter</p>
                                <p className="text-xs font-bold text-blue-900 mt-1 line-clamp-2">{activeChapterInfo.name_en}</p>
                            </div>
                        ) : null}
                    </div>

                    <div className="flex-1 overflow-y-auto custom-scrollbar p-3 space-y-3">
                        {chapters.map((chapter) => (
                            <div key={chapter.id} className="space-y-1.5">
                                <button
                                    onClick={() => setActiveChapter(activeChapter === chapter.id ? null : chapter.id)}
                                    className={cn(
                                        'w-full flex items-center justify-between rounded-xl border px-3 py-3 transition-all',
                                        activeChapter === chapter.id
                                            ? 'border-blue-300 bg-blue-50/70 text-blue-700'
                                            : 'border-transparent text-foreground/75 hover:border-card-border hover:bg-background'
                                    )}
                                >
                                    <span className="text-xs font-black uppercase tracking-tight text-left pr-2 truncate">{chapter.name_en}</span>
                                    <span className="text-[10px] font-black">{chapter.topics?.length || 0}</span>
                                </button>

                                {activeChapter === chapter.id ? (
                                    <div className="space-y-1 px-1 pb-1 animate-in slide-in-from-top-2 duration-200">
                                        {chapter.topics?.map((topic: any) => (
                                            <button
                                                key={topic.id}
                                                onClick={() => setSelectedTopic(topic)}
                                                className={cn(
                                                    'w-full flex items-center gap-2 rounded-lg px-3 py-2.5 text-left transition-all',
                                                    selectedTopic?.id === topic.id
                                                        ? 'bg-blue-600 text-white shadow-md shadow-blue-600/15'
                                                        : 'text-foreground/60 hover:bg-background hover:text-foreground'
                                                )}
                                            >
                                                <Zap className={cn('h-3.5 w-3.5', selectedTopic?.id === topic.id ? 'text-white' : 'text-blue-600')} />
                                                <span className="text-[11px] font-black uppercase tracking-wider truncate">{topic.name_en}</span>
                                            </button>
                                        ))}
                                    </div>
                                ) : null}
                            </div>
                        ))}
                    </div>
                </aside>

                <section className="rounded-[2rem] border border-card-border bg-card-bg shadow-sm overflow-hidden flex flex-col min-h-0">
                    <div className="border-b border-card-border p-4 md:p-5">
                        <div className="flex items-center justify-between gap-4 flex-wrap">
                            <div>
                                <p className="text-[10px] font-black text-foreground/40 uppercase tracking-[0.3em]">Learning Modes</p>
                                <p className="text-sm text-foreground/60 mt-1">
                                    All modes support full-window study and mini mode from the player controls.
                                </p>
                            </div>
                            <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-foreground/55">
                                <LibraryBig className="h-4 w-4 text-blue-600" />
                                Topic-ready multimodal learning
                            </div>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-5 gap-2 mt-4">
                            {contentModes.map((mode) => {
                                const available = hasType(selectedTopic, mode.id);
                                return (
                                    <button
                                        key={mode.id}
                                        onClick={() => setContentType(mode.id)}
                                        className={cn(
                                            'rounded-xl border px-3 py-3 text-left transition-all',
                                            contentType === mode.id
                                                ? 'border-blue-500 bg-blue-600 text-white shadow-lg shadow-blue-600/15'
                                                : 'border-card-border bg-background hover:border-blue-300',
                                            !available && contentType !== mode.id ? 'opacity-60' : ''
                                        )}
                                    >
                                        <div className="flex items-center justify-between gap-2">
                                            <mode.icon className={cn('h-4 w-4', contentType === mode.id ? 'text-white' : 'text-blue-600')} />
                                            {available ? (
                                                <CircleCheck className={cn('h-3.5 w-3.5', contentType === mode.id ? 'text-white' : 'text-emerald-600')} />
                                            ) : (
                                                <span className={cn('text-[9px] font-black uppercase tracking-widest', contentType === mode.id ? 'text-white/90' : 'text-foreground/35')}>
                                                    N/A
                                                </span>
                                            )}
                                        </div>
                                        <div className={cn('mt-2 text-[10px] font-black uppercase tracking-wider', contentType === mode.id ? 'text-white' : 'text-foreground')}>
                                            {mode.short}
                                        </div>
                                        <div className={cn('text-[10px] mt-0.5', contentType === mode.id ? 'text-white/80' : 'text-foreground/50')}>
                                            {mode.label}
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    <div className="flex-1 min-h-0 p-4 md:p-5">
                        {selectedTopic ? (
                            <MultiModalPlayer type={contentType} topic={selectedTopic} />
                        ) : (
                            <div className="h-full rounded-[1.5rem] border border-dashed border-card-border bg-background flex flex-col items-center justify-center text-center p-8">
                                <BookOpen className="h-8 w-8 text-blue-600/60 mb-3" />
                                <p className="text-sm font-black uppercase tracking-wider text-foreground/60">Select a topic from the left panel</p>
                                <p className="text-xs text-foreground/45 mt-2">Then choose PDF, Audio, Video, Mindmap, or Infographic mode.</p>
                            </div>
                        )}
                    </div>
                </section>
            </div>
        </div>
    );
}
