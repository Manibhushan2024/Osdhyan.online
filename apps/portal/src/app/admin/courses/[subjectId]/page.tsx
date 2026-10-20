'use client';

import { useCallback, useEffect, useMemo, useState, type MouseEvent, type ReactNode } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
    ArrowLeft,
    Edit2,
    ExternalLink,
    Eye,
    EyeOff,
    FileText,
    Headphones,
    Image as ImageIcon,
    Layout as LayoutIcon,
    Link2,
    Loader2,
    Plus,
    Trash2,
    Upload,
    Video,
    X,
    Youtube,
} from 'lucide-react';
import { isAxiosError } from 'axios';
import api from '@/lib/api';
import { cn } from '@/lib/utils';
import { useAuth } from '@/components/providers/AuthProvider';
import {
    type CourseChapter,
    type CourseMaterial,
    type CourseTopic,
    MAX_UPLOAD_BYTES,
    UPLOAD_ACCEPT,
    asList,
    formatBytes,
    materialUrl,
    typeLabel,
} from '@/lib/courseContent';

type Subject = { id: number; name_en: string; is_published: boolean; category?: string | null };

const typeIcons: Record<string, typeof FileText> = {
    pdf: FileText,
    doc: FileText,
    image: ImageIcon,
    video: Video,
    youtube: Youtube,
    audio: Headphones,
};

function errorMessage(error: unknown, fallback: string): string {
    if (!isAxiosError(error)) return fallback;
    if (error.response?.status === 413) return 'The file is too large for the server. The limit is 500 MB (100 MB when uploading through the public website address) — for longer videos, add a YouTube link instead.';
    const data = error.response?.data as { message?: string; errors?: Record<string, string[]> } | undefined;
    const firstFieldError = data?.errors ? (Object.values(data.errors)[0] as string[] | undefined)?.[0] : undefined;
    return data?.message || firstFieldError || fallback;
}

function StatusBadge({ visible }: { visible: boolean }) {
    return (
        <span className={cn(
            'text-xs font-semibold px-2 py-0.5 rounded-full border whitespace-nowrap',
            visible ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20' : 'bg-amber-500/10 text-amber-600 border-amber-500/20'
        )}>
            {visible ? 'Visible' : 'Hidden'}
        </span>
    );
}

export default function AdminCurriculumEditor() {
    const params = useParams();
    const router = useRouter();
    const { user } = useAuth();
    const canDelete = user?.admin_role === 'root';
    const subjectId = Array.isArray(params.subjectId) ? params.subjectId[0] : params.subjectId;

    const [subject, setSubject] = useState<Subject | null>(null);
    const [chapters, setChapters] = useState<CourseChapter[]>([]);
    const [loading, setLoading] = useState(true);
    const [loadError, setLoadError] = useState<string | null>(null);
    const [notice, setNotice] = useState<{ kind: 'ok' | 'error'; text: string } | null>(null);

    const [newChapterName, setNewChapterName] = useState('');
    const [addingChapter, setAddingChapter] = useState(false);
    const [selectedTopicId, setSelectedTopicId] = useState<number | null>(null);

    // Add-content form
    const [mode, setMode] = useState<'file' | 'link'>('file');
    const [uploadFile, setUploadFile] = useState<File | null>(null);
    const [videoUrl, setVideoUrl] = useState('');
    const [contentTitle, setContentTitle] = useState('');
    const [uploading, setUploading] = useState(false);
    const [progress, setProgress] = useState(0);
    const [fileInputKey, setFileInputKey] = useState(0);

    const fetchData = useCallback(async () => {
        try {
            const res = await api.get(`/admin/subjects/${subjectId}/hierarchy`);
            setChapters(asList<CourseChapter>(res.data));
            setSubject(res.data?.subject ?? null);
            setLoadError(null);
        } catch (error) {
            setLoadError(errorMessage(error, 'Could not load this subject.'));
        } finally {
            setLoading(false);
        }
    }, [subjectId]);

    useEffect(() => {
        if (subjectId) void fetchData();
    }, [subjectId, fetchData]);

    const selectedTopic: CourseTopic | null = useMemo(() => {
        for (const chapter of chapters) {
            const match = chapter.topics?.find((t) => t.id === selectedTopicId);
            if (match) return match;
        }
        return null;
    }, [chapters, selectedTopicId]);

    const selectedChapter = useMemo(
        () => chapters.find((c) => c.topics?.some((t) => t.id === selectedTopicId)) ?? null,
        [chapters, selectedTopicId]
    );

    const run = async (action: () => Promise<unknown>, success: string | null, failure: string) => {
        try {
            await action();
            if (success) setNotice({ kind: 'ok', text: success });
            await fetchData();
        } catch (error) {
            setNotice({ kind: 'error', text: errorMessage(error, failure) });
        }
    };

    // ── Chapters ────────────────────────────────────────────────────────────
    const handleAddChapter = async () => {
        const name = newChapterName.trim();
        if (!name || addingChapter) return;
        setAddingChapter(true);
        try {
            await run(() => api.post('/admin/chapters', { subject_id: subjectId, name_en: name }), 'Chapter added.', 'Could not add the chapter.');
            setNewChapterName('');
        } finally {
            setAddingChapter(false);
        }
    };

    const handleRenameChapter = (chapter: CourseChapter) => {
        const name = prompt('New name for this chapter:', chapter.name_en)?.trim();
        if (!name || name === chapter.name_en) return;
        void run(() => api.put(`/admin/chapters/${chapter.id}`, { name_en: name }), 'Chapter renamed.', 'Could not rename the chapter.');
    };

    const handleDeleteChapter = (chapter: CourseChapter) => {
        if (!confirm(`Delete the chapter "${chapter.name_en}" with all its topics and content? This cannot be undone.`)) return;
        if (selectedChapter?.id === chapter.id) setSelectedTopicId(null);
        void run(() => api.delete(`/admin/chapters/${chapter.id}`), 'Chapter deleted.', 'Could not delete the chapter.');
    };

    // ── Topics ──────────────────────────────────────────────────────────────
    const handleAddTopic = async (chapter: CourseChapter) => {
        const name = prompt(`Name of the new topic in "${chapter.name_en}":`)?.trim();
        if (!name) return;
        try {
            const res = await api.post('/admin/topics', { chapter_id: chapter.id, name_en: name });
            setNotice({ kind: 'ok', text: 'Topic added. You can now add content to it.' });
            await fetchData();
            if (res.data?.data?.id) setSelectedTopicId(res.data.data.id);
        } catch (error) {
            setNotice({ kind: 'error', text: errorMessage(error, 'Could not add the topic.') });
        }
    };

    const handleRenameTopic = (topic: CourseTopic) => {
        const name = prompt('New name for this topic:', topic.name_en)?.trim();
        if (!name || name === topic.name_en) return;
        void run(() => api.put(`/admin/topics/${topic.id}`, { name_en: name }), 'Topic renamed.', 'Could not rename the topic.');
    };

    const handleDeleteTopic = (topic: CourseTopic) => {
        if (!confirm(`Delete the topic "${topic.name_en}" and all its content? This cannot be undone.`)) return;
        if (selectedTopicId === topic.id) setSelectedTopicId(null);
        void run(() => api.delete(`/admin/topics/${topic.id}`), 'Topic deleted.', 'Could not delete the topic.');
    };

    // ── Show / hide ─────────────────────────────────────────────────────────
    const toggleVisibility = (model: 'subjects' | 'chapters' | 'topics' | 'materials', id: number, visible: boolean) => {
        void run(
            () => api.put(`/admin/${model}/${id}`, { is_published: !visible }),
            visible ? 'Hidden from students.' : 'Now visible to students.',
            'Could not change visibility.'
        );
    };

    // ── Content ─────────────────────────────────────────────────────────────
    const resetForm = () => {
        setUploadFile(null);
        setVideoUrl('');
        setContentTitle('');
        setProgress(0);
        setFileInputKey((k) => k + 1);
    };

    const handleAddContent = async () => {
        if (!selectedTopic) return;
        if (mode === 'file' && !uploadFile) return;
        if (mode === 'link' && !videoUrl.trim()) return;
        if (mode === 'file' && uploadFile && uploadFile.size > MAX_UPLOAD_BYTES) {
            setNotice({ kind: 'error', text: 'This file is larger than 500 MB. For long videos, upload them to YouTube and add the link instead.' });
            return;
        }

        const form = new FormData();
        form.append('topic_id', String(selectedTopic.id));
        if (contentTitle.trim()) form.append('title', contentTitle.trim());
        if (mode === 'file' && uploadFile) form.append('file', uploadFile);
        if (mode === 'link') form.append('video_url', videoUrl.trim());

        setUploading(true);
        setProgress(0);
        try {
            await api.post('/admin/materials/upload', form, {
                headers: { 'Content-Type': 'multipart/form-data' },
                onUploadProgress: (e) => {
                    if (e.total) setProgress(Math.round((e.loaded / e.total) * 100));
                },
            });
            resetForm();
            setNotice({ kind: 'ok', text: 'Content added and visible to students.' });
            await fetchData();
        } catch (error) {
            setNotice({ kind: 'error', text: errorMessage(error, 'Upload failed. Please try again.') });
        } finally {
            setUploading(false);
        }
    };

    const handleRenameMaterial = (material: CourseMaterial) => {
        const title = prompt('New title:', material.title)?.trim();
        if (!title || title === material.title) return;
        void run(() => api.put(`/admin/materials/${material.id}`, { title }), 'Title updated.', 'Could not rename.');
    };

    const handleDeleteMaterial = (material: CourseMaterial) => {
        if (!confirm(`Delete "${material.title}"? This cannot be undone.`)) return;
        void run(() => api.delete(`/admin/materials/${material.id}`), 'Content deleted.', 'Could not delete.');
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center py-40 gap-4">
                <Loader2 className="h-10 w-10 text-indigo-600 animate-spin" />
                <p className="text-sm font-semibold text-foreground/50">Loading subject…</p>
            </div>
        );
    }

    if (loadError || !subject) {
        return (
            <div className="max-w-xl mx-auto py-32 text-center space-y-4">
                <p className="text-base font-semibold text-foreground">{loadError ?? 'Subject not found.'}</p>
                <button onClick={() => router.push('/admin/courses')} className="text-sm font-semibold text-indigo-600">Back to courses</button>
            </div>
        );
    }

    const totalTopics = chapters.reduce((n, c) => n + (c.topics?.length ?? 0), 0);

    return (
        <div className="max-w-6xl mx-auto space-y-8 pb-20">
            {/* Header */}
            <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => router.push('/admin/courses')}
                        title="Back to courses"
                        className="h-10 w-10 rounded-xl bg-card-bg border border-card-border flex items-center justify-center text-foreground/50 hover:text-indigo-600 transition-all"
                    >
                        <ArrowLeft className="h-4 w-4" />
                    </button>
                    <div>
                        <p className="text-xs font-semibold text-foreground/50">Course content</p>
                        <div className="flex items-center gap-3">
                            <h1 className="text-2xl font-bold text-foreground">{subject.name_en}</h1>
                            <StatusBadge visible={subject.is_published} />
                        </div>
                        <p className="text-xs text-foreground/50 mt-0.5">
                            {chapters.length} chapter{chapters.length === 1 ? '' : 's'} · {totalTopics} topic{totalTopics === 1 ? '' : 's'}
                            {subject.is_published ? ' · students can see this subject' : ' · students cannot see this subject until you show it'}
                        </p>
                    </div>
                </div>

                <button
                    onClick={() => toggleVisibility('subjects', subject.id, subject.is_published)}
                    className={cn(
                        'flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all',
                        subject.is_published
                            ? 'bg-amber-500/10 text-amber-600 border border-amber-500/20 hover:bg-amber-500/20'
                            : 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20 hover:bg-indigo-700'
                    )}
                >
                    {subject.is_published ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    {subject.is_published ? 'Hide subject from students' : 'Show subject to students'}
                </button>
            </div>

            {notice && (
                <div className={cn(
                    'flex items-start justify-between gap-4 rounded-xl border px-4 py-3 text-sm font-medium',
                    notice.kind === 'ok' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-700' : 'bg-red-500/10 border-red-500/20 text-red-600'
                )}>
                    <span>{notice.text}</span>
                    <button onClick={() => setNotice(null)} title="Dismiss"><X className="h-4 w-4" /></button>
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Left: chapters and topics */}
                <div className="lg:col-span-7">
                    <div className="bg-card-bg border border-card-border rounded-2xl p-6 space-y-5">
                        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-card-border pb-5">
                            <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                                <LayoutIcon className="h-4 w-4 text-indigo-600" />
                                Chapters and topics
                            </h3>
                            <form
                                className="flex gap-2"
                                onSubmit={(e) => { e.preventDefault(); void handleAddChapter(); }}
                            >
                                <input
                                    type="text"
                                    placeholder="New chapter name"
                                    value={newChapterName}
                                    onChange={(e) => setNewChapterName(e.target.value)}
                                    className="bg-card-border/20 border border-card-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-indigo-600/40 w-52"
                                />
                                <button
                                    type="submit"
                                    disabled={!newChapterName.trim() || addingChapter}
                                    className="h-9 px-4 bg-indigo-600 disabled:bg-indigo-600/40 text-white rounded-lg flex items-center gap-2 text-sm font-semibold"
                                >
                                    <Plus className="h-4 w-4" />
                                    Add chapter
                                </button>
                            </form>
                        </div>

                        <div className="space-y-5 max-h-[800px] overflow-y-auto pr-2 custom-scrollbar">
                            {chapters.length === 0 && (
                                <div className="py-16 text-center text-sm text-foreground/50">
                                    No chapters yet. Add the first chapter above, then add topics to it.
                                </div>
                            )}
                            {chapters.map((chapter) => (
                                <div key={chapter.id} className="space-y-3">
                                    <div className="flex flex-wrap items-center justify-between gap-3 bg-white/5 p-4 rounded-xl border border-card-border">
                                        <div className="flex items-center gap-3 min-w-0">
                                            <span className="text-sm font-bold text-foreground truncate">{chapter.name_en}</span>
                                            <StatusBadge visible={chapter.is_published} />
                                        </div>
                                        <div className="flex items-center gap-1.5">
                                            <SmallButton title="Rename chapter" onClick={() => handleRenameChapter(chapter)}>
                                                <Edit2 className="h-4 w-4" />
                                            </SmallButton>
                                            <SmallButton
                                                title={chapter.is_published ? 'Hide chapter from students' : 'Show chapter to students'}
                                                onClick={() => toggleVisibility('chapters', chapter.id, chapter.is_published)}
                                            >
                                                {chapter.is_published ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                            </SmallButton>
                                            {canDelete && (
                                                <SmallButton title="Delete chapter" danger onClick={() => handleDeleteChapter(chapter)}>
                                                    <Trash2 className="h-4 w-4" />
                                                </SmallButton>
                                            )}
                                            <button
                                                onClick={() => void handleAddTopic(chapter)}
                                                className="ml-1 flex items-center gap-1.5 bg-indigo-600 text-white px-3 py-1.5 rounded-lg text-xs font-semibold hover:bg-indigo-700"
                                            >
                                                <Plus className="h-3.5 w-3.5" />
                                                Add topic
                                            </button>
                                        </div>
                                    </div>

                                    <div className="pl-6 ml-4 border-l-2 border-indigo-600/10 space-y-2">
                                        {!chapter.topics?.length && (
                                            <p className="text-xs text-foreground/45 py-1">No topics yet — use “Add topic”.</p>
                                        )}
                                        {chapter.topics?.map((topic) => (
                                            <div
                                                key={topic.id}
                                                onClick={() => setSelectedTopicId(topic.id)}
                                                className={cn(
                                                    'flex items-center justify-between gap-3 p-3 rounded-xl border cursor-pointer transition-all',
                                                    selectedTopicId === topic.id
                                                        ? 'bg-indigo-600/5 border-indigo-600/40'
                                                        : 'border-card-border/40 hover:bg-white/5 hover:border-card-border'
                                                )}
                                            >
                                                <div className="min-w-0">
                                                    <div className="flex items-center gap-2">
                                                        <span className={cn('text-sm font-semibold truncate', selectedTopicId === topic.id ? 'text-indigo-600' : 'text-foreground/80')}>
                                                            {topic.name_en}
                                                        </span>
                                                        {!topic.is_published && <StatusBadge visible={false} />}
                                                    </div>
                                                    <div className="flex flex-wrap gap-1.5 mt-1">
                                                        {topic.materials?.length ? topic.materials.map((m) => (
                                                            <span key={m.id} className={cn(
                                                                'text-[11px] px-1.5 py-0.5 rounded border font-medium',
                                                                m.is_published ? 'bg-indigo-600/10 text-indigo-600/80 border-indigo-600/10' : 'bg-amber-500/10 text-amber-600 border-amber-500/20'
                                                            )}>
                                                                {typeLabel(m.type)}
                                                            </span>
                                                        )) : (
                                                            <span className="text-[11px] text-foreground/40">No content yet</span>
                                                        )}
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-1.5 shrink-0">
                                                    <SmallButton title="Rename topic" onClick={(e) => { e.stopPropagation(); handleRenameTopic(topic); }}>
                                                        <Edit2 className="h-3.5 w-3.5" />
                                                    </SmallButton>
                                                    <SmallButton
                                                        title={topic.is_published ? 'Hide topic from students' : 'Show topic to students'}
                                                        onClick={(e) => { e.stopPropagation(); toggleVisibility('topics', topic.id, topic.is_published); }}
                                                    >
                                                        {topic.is_published ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                                                    </SmallButton>
                                                    {canDelete && (
                                                        <SmallButton title="Delete topic" danger onClick={(e) => { e.stopPropagation(); handleDeleteTopic(topic); }}>
                                                            <Trash2 className="h-3.5 w-3.5" />
                                                        </SmallButton>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Right: selected topic's content */}
                <div className="lg:col-span-5">
                    {selectedTopic ? (
                        <div className="bg-card-bg border border-card-border rounded-2xl p-6 space-y-6 sticky top-8 shadow-xl">
                            <div className="flex items-start justify-between gap-3 border-b border-card-border pb-4">
                                <div className="min-w-0">
                                    <p className="text-xs font-semibold text-foreground/50">{selectedChapter?.name_en}</p>
                                    <div className="flex items-center gap-2">
                                        <h3 className="text-lg font-bold text-foreground truncate">{selectedTopic.name_en}</h3>
                                        <StatusBadge visible={selectedTopic.is_published} />
                                    </div>
                                </div>
                                <button onClick={() => setSelectedTopicId(null)} title="Close" className="h-8 w-8 rounded-full flex items-center justify-center text-foreground/40 hover:text-foreground">
                                    <X className="h-4 w-4" />
                                </button>
                            </div>

                            {/* Existing content */}
                            <div className="space-y-2">
                                <h4 className="text-sm font-bold text-foreground">Content in this topic</h4>
                                {!selectedTopic.materials?.length && (
                                    <p className="text-sm text-foreground/50 py-2">Nothing added yet. Use the form below.</p>
                                )}
                                {selectedTopic.materials?.map((m) => {
                                    const Icon = typeIcons[m.type] ?? FileText;
                                    const url = materialUrl(m);
                                    return (
                                        <div key={m.id} className="flex items-center justify-between gap-3 p-3 rounded-xl border border-card-border bg-white/5">
                                            <div className="flex items-center gap-3 min-w-0">
                                                <div className="h-9 w-9 rounded-lg bg-indigo-600/10 text-indigo-600 flex items-center justify-center shrink-0">
                                                    <Icon className="h-4 w-4" />
                                                </div>
                                                <div className="min-w-0">
                                                    <p className="text-sm font-semibold text-foreground truncate">{m.title}</p>
                                                    <p className="text-xs text-foreground/50">
                                                        {typeLabel(m.type)}{m.file_size ? ` · ${formatBytes(m.file_size)}` : ''} · {m.is_published ? 'visible' : 'hidden'}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-1 shrink-0">
                                                {url && (
                                                    <a href={url} target="_blank" rel="noopener noreferrer" title="Open" className="h-8 w-8 rounded-lg border border-card-border flex items-center justify-center text-foreground/50 hover:text-indigo-600">
                                                        <ExternalLink className="h-3.5 w-3.5" />
                                                    </a>
                                                )}
                                                <SmallButton title="Rename" onClick={() => handleRenameMaterial(m)}>
                                                    <Edit2 className="h-3.5 w-3.5" />
                                                </SmallButton>
                                                <SmallButton
                                                    title={m.is_published ? 'Hide from students' : 'Show to students'}
                                                    onClick={() => toggleVisibility('materials', m.id, !!m.is_published)}
                                                >
                                                    {m.is_published ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                                                </SmallButton>
                                                {canDelete && (
                                                    <SmallButton title="Delete" danger onClick={() => handleDeleteMaterial(m)}>
                                                        <Trash2 className="h-3.5 w-3.5" />
                                                    </SmallButton>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>

                            {/* Add content */}
                            <div className="space-y-4 pt-5 border-t border-card-border">
                                <h4 className="text-sm font-bold text-foreground">Add content</h4>
                                <div className="grid grid-cols-2 gap-2">
                                    <button
                                        onClick={() => setMode('file')}
                                        className={cn('flex items-center justify-center gap-2 rounded-xl border py-2.5 text-sm font-semibold',
                                            mode === 'file' ? 'bg-indigo-600 border-indigo-600 text-white' : 'border-card-border text-foreground/60 hover:text-indigo-600')}
                                    >
                                        <Upload className="h-4 w-4" /> Upload a file
                                    </button>
                                    <button
                                        onClick={() => setMode('link')}
                                        className={cn('flex items-center justify-center gap-2 rounded-xl border py-2.5 text-sm font-semibold',
                                            mode === 'link' ? 'bg-indigo-600 border-indigo-600 text-white' : 'border-card-border text-foreground/60 hover:text-indigo-600')}
                                    >
                                        <Link2 className="h-4 w-4" /> YouTube link
                                    </button>
                                </div>

                                {mode === 'file' ? (
                                    <div className="relative group">
                                        <input
                                            key={fileInputKey}
                                            type="file"
                                            accept={UPLOAD_ACCEPT}
                                            onChange={(e) => setUploadFile(e.target.files?.[0] || null)}
                                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                        />
                                        <div className={cn(
                                            'border-2 border-dashed rounded-2xl p-8 flex flex-col items-center gap-3 transition-all group-hover:border-indigo-600/40',
                                            uploadFile ? 'border-emerald-500/50 bg-emerald-500/5' : 'border-card-border'
                                        )}>
                                            <Upload className={cn('h-8 w-8', uploadFile ? 'text-emerald-500' : 'text-foreground/30')} />
                                            <div className="text-center">
                                                <p className="text-sm font-semibold text-foreground max-w-[260px] truncate">
                                                    {uploadFile ? `${uploadFile.name} (${formatBytes(uploadFile.size)})` : 'Click to choose a file'}
                                                </p>
                                                <p className="text-xs text-foreground/50 mt-1 leading-relaxed">
                                                    PDF notes, pictures (mind maps, infographics: JPG, PNG, WEBP), video (MP4, WEBM), audio (MP3, M4A, WAV) or Word / PowerPoint. Up to 500 MB.
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="space-y-1">
                                        <input
                                            type="url"
                                            placeholder="https://www.youtube.com/watch?v=…"
                                            value={videoUrl}
                                            onChange={(e) => setVideoUrl(e.target.value)}
                                            className="w-full bg-card-border/20 border border-card-border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-indigo-600/40"
                                        />
                                        <p className="text-xs text-foreground/50">
                                            Best for long lectures. The video plays inside the course page. Unlisted YouTube videos work too.
                                        </p>
                                    </div>
                                )}

                                <input
                                    type="text"
                                    placeholder={mode === 'file' ? 'Title (optional — the file name is used if empty)' : 'Title (optional)'}
                                    value={contentTitle}
                                    onChange={(e) => setContentTitle(e.target.value)}
                                    className="w-full bg-card-border/20 border border-card-border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-indigo-600/40"
                                />

                                {uploading && mode === 'file' && (
                                    <div className="space-y-1">
                                        <div className="h-2 w-full rounded-full bg-card-border/40 overflow-hidden">
                                            <div className="h-full bg-indigo-600 transition-all" style={{ width: `${progress}%` }} />
                                        </div>
                                        <p className="text-xs text-foreground/50">
                                            {progress < 100 ? `Uploading… ${progress}%` : 'Processing on the server…'}
                                        </p>
                                    </div>
                                )}

                                <button
                                    onClick={() => void handleAddContent()}
                                    disabled={uploading || (mode === 'file' ? !uploadFile : !videoUrl.trim())}
                                    className="w-full bg-indigo-600 disabled:bg-indigo-600/30 text-white py-3 rounded-xl text-sm font-semibold flex items-center justify-center gap-2"
                                >
                                    {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                                    {uploading ? 'Adding…' : mode === 'file' ? 'Upload' : 'Add video link'}
                                </button>
                                <p className="text-xs text-foreground/45 text-center">New content is visible to students straight away. Use the eye button to hide it.</p>
                            </div>
                        </div>
                    ) : (
                        <div className="bg-card-bg border border-card-border border-dashed rounded-2xl p-12 text-center flex flex-col items-center justify-center gap-4 min-h-[420px] sticky top-8">
                            <div className="h-16 w-16 rounded-2xl bg-indigo-600/5 flex items-center justify-center border border-indigo-600/10">
                                <LayoutIcon className="h-8 w-8 text-indigo-600/40" />
                            </div>
                            <p className="text-sm font-semibold text-foreground/60">Select a topic to add or manage its content</p>
                            <p className="text-xs text-foreground/45 max-w-[260px]">
                                Each subject is made of chapters, and each chapter of topics. Notes, videos, audio and mind maps are added to a topic.
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

function SmallButton({
    title,
    onClick,
    danger,
    children,
}: {
    title: string;
    onClick: (e: MouseEvent) => void;
    danger?: boolean;
    children: ReactNode;
}) {
    return (
        <button
            type="button"
            title={title}
            aria-label={title}
            onClick={onClick}
            className={cn(
                'h-8 w-8 rounded-lg bg-card-bg border border-card-border flex items-center justify-center text-foreground/45 transition-all',
                danger ? 'hover:text-red-500 hover:border-red-500/30' : 'hover:text-indigo-600 hover:border-indigo-600/30'
            )}
        >
            {children}
        </button>
    );
}
