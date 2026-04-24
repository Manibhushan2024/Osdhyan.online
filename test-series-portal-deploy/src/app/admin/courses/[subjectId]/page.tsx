'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
    Plus,
    ChevronRight,
    ChevronDown,
    GripVertical,
    FileText,
    Headphones,
    Video,
    Image as ImageIcon,
    Upload,
    Save,
    Trash2,
    ArrowLeft,
    Loader2,
    CheckCircle2,
    Edit2,
    Map as MapIcon,
    Layout as LayoutIcon,
    Rocket,
    X
} from 'lucide-react';
import api from '@/lib/api';
import { cn } from '@/lib/utils';
import { useAuth } from '@/components/providers/AuthProvider';

export default function AdminCurriculumEditor() {
    const params = useParams();
    const router = useRouter();
    const { user } = useAuth();
    const canDelete = user?.admin_role === 'root';
    const subjectId = params.subjectId;

    const [subject, setSubject] = useState<any>(null);
    const [chapters, setChapters] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);

    // Form states
    const [newSectionName, setNewSectionName] = useState('');
    const [selectedTopic, setSelectedTopic] = useState<any>(null);
    const [uploadType, setUploadType] = useState<'text' | 'audio' | 'video' | 'mindmap' | 'infographic'>('text');
    const [uploadFile, setUploadFile] = useState<File | null>(null);

    useEffect(() => {
        fetchData();
    }, [subjectId]);

    const fetchData = async () => {
        try {
            const res = await api.get(`/courses/subjects/${subjectId}/hierarchy`);
            setChapters(res.data);
            const subjectsRes = await api.get('/admin/subjects');
            const currentSub = subjectsRes.data.find((s: any) => s.id === parseInt(subjectId as string));
            setSubject(currentSub);
        } catch (error) {
            console.error('Failed to fetch data', error);
        } finally {
            setLoading(false);
        }
    };

    // --- Section (Chapter Model) Operations ---
    const handleAddSection = async () => {
        if (!newSectionName) return;
        try {
            await api.post('/admin/chapters', {
                subject_id: subjectId,
                name_en: newSectionName,
                name_hi: newSectionName,
                code: 'SEC-' + Date.now()
            });
            setNewSectionName('');
            fetchData();
        } catch (error) {
            console.error('Failed to add section', error);
        }
    };

    const handleRenameSection = async (id: number, oldName: string) => {
        const newName = prompt('Enter New Section Name:', oldName);
        if (!newName || newName === oldName) return;
        try {
            await api.put(`/admin/chapters/${id}`, { name_en: newName, name_hi: newName });
            fetchData();
        } catch (error) {
            console.error('Failed to rename section', error);
        }
    };

    const handleDeleteSection = async (id: number) => {
        if (!confirm('CAUTION: Deleting this SECTION will remove all its Chapters and Content. Proceed?')) return;
        try {
            await api.delete(`/admin/chapters/${id}`);
            fetchData();
        } catch (error) {
            console.error('Failed to delete section', error);
        }
    };

    // --- Chapter (Topic Model) Operations ---
    const handleAddChapter = async (sectionId: number) => {
        const chapterName = prompt('Enter Chapter Name:');
        if (!chapterName) return;
        try {
            await api.post('/admin/topics', {
                chapter_id: sectionId, // subject_id/chapter_id logic
                name_en: chapterName,
                name_hi: chapterName,
                code: 'CH-' + Date.now()
            });
            fetchData();
        } catch (error) {
            console.error('Failed to add chapter', error);
        }
    };

    const handleRenameChapter = async (id: number, oldName: string) => {
        const newName = prompt('Enter New Chapter Name:', oldName);
        if (!newName || newName === oldName) return;
        try {
            await api.put(`/admin/topics/${id}`, { name_en: newName, name_hi: newName });
            fetchData();
        } catch (error) {
            console.error('Failed to rename chapter', error);
        }
    };

    const handleDeleteChapter = async (id: number) => {
        if (!confirm('Delete this Chapter and its assets?')) return;
        try {
            await api.delete(`/admin/topics/${id}`);
            if (selectedTopic?.id === id) setSelectedTopic(null);
            fetchData();
        } catch (error) {
            console.error('Failed to delete chapter', error);
        }
    };

    // --- Material Operations ---
    const handleDeleteMaterial = async (id: number) => {
        if (!confirm('Delete this content asset?')) return;
        try {
            await api.delete(`/admin/materials/${id}`);
            fetchData();
            // Also refresh selected topic to reflect changes
            if (selectedTopic) {
                const updatedChapters = await api.get(`/courses/subjects/${subjectId}/hierarchy`);
                for (const section of updatedChapters.data) {
                    const match = section.topics.find((t: any) => t.id === selectedTopic.id);
                    if (match) setSelectedTopic(match);
                }
            }
        } catch (error) {
            console.error('Failed to delete material', error);
        }
    };

    const handleUpload = async () => {
        if (!selectedTopic || !uploadFile) return;

        setUploading(true);
        const formData = new FormData();
        formData.append('topic_id', selectedTopic.id);
        formData.append('type', uploadType);
        formData.append('title', uploadFile.name);
        formData.append('file', uploadFile);

        try {
            await api.post('/admin/materials/upload', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            setUploadFile(null);
            fetchData();
            // Refresh local topic state
            const updatedChaptersRes = await api.get(`/courses/subjects/${subjectId}/hierarchy`);
            setChapters(updatedChaptersRes.data);
            for (const section of updatedChaptersRes.data) {
                const match = section.topics.find((t: any) => t.id === selectedTopic.id);
                if (match) setSelectedTopic(match);
            }
            alert('Intelligence Payload Deployed!');
        } catch (error) {
            console.error('Upload failed', error);
        } finally {
            setUploading(false);
        }
    };

    // --- Publication Operations ---
    const handleTogglePublication = async (model: 'subjects' | 'chapters' | 'topics', id: number, currentStatus: boolean) => {
        try {
            await api.put(`/admin/${model}/${id}`, { is_published: !currentStatus });
            fetchData();
        } catch (error) {
            console.error('Failed to toggle publication', error);
        }
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center py-40 gap-4">
                <Loader2 className="h-10 w-10 text-indigo-600 animate-spin" />
                <p className="text-[10px] font-black text-foreground/40 uppercase tracking-[0.3em]">Connecting to Neural Network...</p>
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto space-y-12 pb-20">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => router.push('/admin/courses')}
                        className="h-10 w-10 rounded-xl bg-card-bg border border-card-border flex items-center justify-center text-foreground/40 hover:text-indigo-600 transition-all font-black"
                    >
                        <ArrowLeft className="h-4 w-4" />
                    </button>
                    <div>
                        <h1 className="text-3xl font-black text-foreground uppercase tracking-tight italic">
                            Curriculum <span className="text-indigo-600">Architect</span>
                        </h1>
                        <div className="flex items-center gap-3">
                            <p className="text-[10px] font-black text-foreground/40 uppercase tracking-[0.2em]">{subject?.name_en}</p>
                            <span className={cn(
                                "text-[7px] font-black px-2 py-0.5 rounded-full border",
                                subject?.is_published ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" : "bg-amber-500/10 text-amber-500 border-amber-500/20"
                            )}>
                                {subject?.is_published ? 'LIVE' : 'DRAFT'}
                            </span>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    <button
                        onClick={() => handleTogglePublication('subjects', subject.id, subject.is_published)}
                        className={cn(
                            "flex items-center gap-2 px-6 py-3 rounded-2xl text-[9px] font-black uppercase tracking-widest transition-all",
                            subject?.is_published
                                ? "bg-amber-600/10 text-amber-600 border border-amber-600/20 hover:bg-amber-600/20"
                                : "bg-indigo-600 text-white shadow-lg shadow-indigo-600/20 hover:scale-105"
                        )}
                    >
                        {subject?.is_published ? 'Move to Draft' : 'Publish Domain'}
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                {/* Left: Deep Dive Tree */}
                <div className="lg:col-span-7 space-y-8">
                    <div className="bg-card-bg border border-card-border rounded-[2.5rem] p-8 space-y-6">
                        <div className="flex items-center justify-between border-b border-card-border pb-6">
                            <h3 className="text-xs font-black text-foreground uppercase tracking-widest flex items-center gap-2">
                                <LayoutIcon className="h-4 w-4 text-indigo-600" />
                                Structural Vectors (Sections)
                            </h3>
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    placeholder="NEW SECTION NAME..."
                                    value={newSectionName}
                                    onChange={(e) => setNewSectionName(e.target.value)}
                                    className="bg-card-border/20 border border-card-border rounded-lg px-4 py-2 text-[9px] uppercase font-black tracking-widest focus:outline-none focus:border-indigo-600/30 w-48"
                                />
                                <button
                                    onClick={handleAddSection}
                                    className="h-9 px-4 bg-indigo-600 text-white rounded-xl flex items-center gap-2 text-[8px] font-black uppercase tracking-widest shadow-lg shadow-indigo-500/20 active:scale-95 transition-all"
                                >
                                    <Plus className="h-4 w-4" />
                                    Create Section
                                </button>
                            </div>
                        </div>

                        <div className="space-y-6 max-h-[800px] overflow-y-auto pr-4 custom-scrollbar">
                            {chapters.length === 0 && (
                                <div className="py-20 text-center text-[10px] font-black text-foreground/20 uppercase tracking-[0.2em]">
                                    No Sections Deployed
                                </div>
                            )}
                            {chapters.map((section) => (
                                <div key={section.id} className="space-y-4">
                                    <div className="flex items-center justify-between group bg-white/5 p-5 rounded-[1.5rem] border border-card-border hover:border-indigo-600/30 transition-all">
                                        <div className="flex flex-col">
                                            <div className="flex items-center gap-3">
                                                <span className="text-[11px] font-black text-foreground uppercase tracking-wider italic">{section.name_en}</span>
                                                <span className={cn(
                                                    "text-[6px] font-black px-1.5 py-0.5 rounded-full border uppercase tracking-widest",
                                                    section.is_published ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/10" : "bg-amber-500/10 text-amber-500 border-amber-500/10"
                                                )}>
                                                    {section.is_published ? 'LIVE' : 'DRAFT'}
                                                </span>
                                            </div>
                                            <span className="text-[7px] font-black text-foreground/20 uppercase tracking-widest mt-1">Section Protocol</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <button
                                                onClick={() => handleRenameSection(section.id, section.name_en)}
                                                className="h-8 w-8 rounded-xl bg-card-bg border border-card-border flex items-center justify-center text-foreground/30 hover:text-indigo-600 hover:border-indigo-600/30 transition-all"
                                            >
                                                <Edit2 className="h-4 w-4" />
                                            </button>
                                            <button
                                                onClick={() => handleTogglePublication('chapters', section.id, section.is_published)}
                                                className={cn(
                                                    "h-8 px-3 rounded-xl border flex items-center justify-center text-[7px] font-black uppercase tracking-widest transition-all",
                                                    section.is_published ? "border-amber-500/20 text-amber-500 hover:bg-amber-500/5" : "border-emerald-500/20 text-emerald-500 hover:bg-emerald-500/5"
                                                )}
                                            >
                                                {section.is_published ? 'Unpublish' : 'Publish'}
                                            </button>
                                            {canDelete && (
                                                <button
                                                    onClick={() => handleDeleteSection(section.id)}
                                                    className="h-8 w-8 rounded-xl bg-card-bg border border-card-border flex items-center justify-center text-foreground/30 hover:text-red-500 hover:border-red-500/30 transition-all"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </button>
                                            )}
                                            <div className="w-[1px] h-6 bg-card-border mx-2" />
                                            <button
                                                onClick={() => handleAddChapter(section.id)}
                                                className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-xl text-[8px] font-black uppercase tracking-widest shadow-xl shadow-indigo-600/10 hover:scale-[1.02] active:scale-95 transition-all"
                                            >
                                                <Plus className="h-3.5 w-3.5" />
                                                New Topic
                                            </button>
                                        </div>
                                    </div>

                                    <div className="pl-10 space-y-3 border-l-2 border-indigo-600/5 ml-8 py-2">
                                        {section.topics?.map((topic: any) => (
                                            <div
                                                key={topic.id}
                                                className={cn(
                                                    "flex items-center justify-between p-4 rounded-2xl transition-all border group",
                                                    selectedTopic?.id === topic.id
                                                        ? "bg-indigo-600/5 border-indigo-600/40 text-indigo-600 shadow-lg shadow-indigo-600/5"
                                                        : "bg-transparent border-card-border/30 text-foreground/40 hover:bg-white/5 hover:border-card-border"
                                                )}
                                            >
                                                <div
                                                    className="flex-1 cursor-pointer flex items-center gap-4"
                                                    onClick={() => setSelectedTopic(topic)}
                                                >
                                                    <div className={cn(
                                                        "h-2 w-2 rounded-full",
                                                        topic.is_published ? "bg-emerald-500" : "bg-amber-500"
                                                    )} />
                                                    <div className="flex flex-col">
                                                        <span className="text-[10px] font-black uppercase tracking-widest">{topic.name_en}</span>
                                                        <div className="flex gap-2 mt-1">
                                                            {topic.materials?.map((m: any) => (
                                                                <span key={m.id} className="text-[6px] bg-indigo-600/10 text-indigo-600/70 border border-indigo-600/10 px-1 py-0.5 rounded uppercase font-black">
                                                                    {m.type}
                                                                </span>
                                                            ))}
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <button
                                                        onClick={(e) => { e.stopPropagation(); handleRenameChapter(topic.id, topic.name_en); }}
                                                        className="h-7 w-7 rounded-lg hover:bg-white dark:hover:bg-black flex items-center justify-center text-foreground/20 hover:text-indigo-600 transition-all"
                                                    >
                                                        <Edit2 className="h-3.5 w-3.5" />
                                                    </button>
                                                    <button
                                                        onClick={(e) => { e.stopPropagation(); handleTogglePublication('topics', topic.id, topic.is_published); }}
                                                        className={cn(
                                                            "h-7 px-2 rounded-lg border text-[7px] font-black uppercase tracking-widest transition-all",
                                                            topic.is_published ? "border-amber-500/20 text-amber-500" : "border-emerald-500/20 text-emerald-500"
                                                        )}
                                                    >
                                                        {topic.is_published ? 'Save Draft' : 'Publish'}
                                                    </button>
                                                    {canDelete && (
                                                        <button
                                                            onClick={(e) => { e.stopPropagation(); handleDeleteChapter(topic.id); }}
                                                            className="h-7 w-7 rounded-lg hover:bg-white dark:hover:bg-black flex items-center justify-center text-foreground/20 hover:text-red-500 transition-all"
                                                        >
                                                            <Trash2 className="h-3.5 w-3.5" />
                                                        </button>
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

                {/* Right: Perfect Payload Panel */}
                <div className="lg:col-span-5 space-y-8">
                    {selectedTopic ? (
                        <div className="bg-card-bg border border-card-border rounded-[3rem] p-10 space-y-10 sticky top-8 animate-in slide-in-from-right duration-500 shadow-2xl">
                            <div className="flex items-start justify-between border-b border-card-border pb-6">
                                <div className="space-y-1">
                                    <div className="flex items-center gap-3">
                                        <h3 className="text-sm font-black text-foreground uppercase tracking-[0.2em]">Neural Deployment</h3>
                                        <span className={cn(
                                            "text-[7px] font-black px-2 py-0.5 rounded-full border uppercase tracking-widest",
                                            selectedTopic.is_published ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" : "bg-amber-500/10 text-amber-500 border-amber-500/20"
                                        )}>
                                            {selectedTopic.is_published ? 'LIVE IN PORTAL' : 'STAGING DRAFT'}
                                        </span>
                                    </div>
                                    <p className="text-[9px] font-black text-indigo-600 uppercase tracking-[0.3em] italic">{selectedTopic.name_en}</p>
                                </div>
                                <button onClick={() => setSelectedTopic(null)} className="h-8 w-8 rounded-full bg-white/5 flex items-center justify-center text-foreground/20 hover:text-foreground transition-all">
                                    <X className="h-4 w-4" />
                                </button>
                            </div>

                            {/* Publication Command */}
                            <div className="bg-indigo-600/[0.03] border border-indigo-600/10 rounded-2xl p-5 flex items-center justify-between">
                                <div className="space-y-1">
                                    <p className="text-[8px] font-black text-indigo-600 uppercase tracking-widest">Publication Vector</p>
                                    <p className="text-[10px] font-bold text-foreground/60 uppercase tracking-tight">
                                        {selectedTopic.is_published ? 'Visible to all students' : 'Only visible to administrators'}
                                    </p>
                                </div>
                                <button
                                    onClick={() => handleTogglePublication('topics', selectedTopic.id, selectedTopic.is_published)}
                                    className={cn(
                                        "px-6 py-2.5 rounded-xl text-[8px] font-black uppercase tracking-widest transition-all shadow-lg",
                                        selectedTopic.is_published
                                            ? "bg-amber-600/10 text-amber-600 border border-amber-600/20"
                                            : "bg-emerald-600 text-white shadow-emerald-600/20"
                                    )}
                                >
                                    {selectedTopic.is_published ? 'Restore to Draft' : 'Deploy to Live'}
                                </button>
                            </div>

                            {/* Active Assets Review */}
                            <div className="space-y-4">
                                <h4 className="text-[9px] font-black text-foreground/30 uppercase tracking-[0.3em] px-2 flex items-center gap-2">
                                    <CheckCircle2 className="h-3 w-3 text-emerald-500" />
                                    Active Intelligence Payloads
                                </h4>
                                <div className="grid grid-cols-1 gap-3">
                                    {['text', 'audio', 'video', 'mindmap', 'infographic'].map((type) => {
                                        const material = selectedTopic.materials?.find((m: any) => m.type === type);
                                        const config: any = {
                                            text: { label: 'Digital Dossier (PDF)', icon: FileText, color: 'text-blue-500' },
                                            audio: { label: 'Audio Brief (MP3)', icon: Headphones, color: 'text-amber-500' },
                                            video: { label: 'Neural Feed (MP4)', icon: Video, color: 'text-indigo-500' },
                                            mindmap: { label: 'Neural Mindmap', icon: MapIcon, color: 'text-fuchsia-500' },
                                            infographic: { label: 'Tactical Infographic', icon: LayoutIcon, color: 'text-emerald-500' },
                                        };
                                        const item = config[type];

                                        return (
                                            <div key={type} className={cn(
                                                "flex items-center justify-between p-4 rounded-2xl border transition-all group/item",
                                                material ? "bg-white/5 border-indigo-600/20" : "bg-transparent border-dashed border-card-border opacity-40 hover:opacity-60"
                                            )}>
                                                <div className="flex items-center gap-3">
                                                    <div className={cn("h-8 w-8 rounded-xl bg-card-bg border border-card-border flex items-center justify-center shadow-lg", item.color)}>
                                                        <item.icon className="h-4 w-4" />
                                                    </div>
                                                    <div className="flex flex-col">
                                                        <span className="text-[9px] font-black text-foreground uppercase tracking-wider">{item.label}</span>
                                                        <span className="text-[7px] font-bold text-foreground/30 uppercase tracking-widest">
                                                            {material ? material.title : 'Not Deployed'}
                                                        </span>
                                                    </div>
                                                </div>
                                                {material ? (
                                                    canDelete ? (
                                                        <button
                                                            onClick={() => handleDeleteMaterial(material.id)}
                                                            className="h-8 w-8 rounded-xl hover:bg-red-500/10 flex items-center justify-center text-foreground/10 hover:text-red-500 transition-all opacity-0 group-hover/item:opacity-100"
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                        </button>
                                                    ) : (
                                                        <span className="text-[7px] font-black text-foreground/20 uppercase tracking-widest">Locked</span>
                                                    )
                                                ) : (
                                                    <button
                                                        onClick={() => setUploadType(type as any)}
                                                        className="h-8 px-4 rounded-xl bg-card-bg border border-card-border text-[7px] font-black uppercase tracking-widest hover:border-indigo-600/30 hover:text-indigo-600 transition-all"
                                                    >
                                                        Upload
                                                    </button>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* New Payload Wizard */}
                            <div className="space-y-6 pt-10 border-t border-card-border">
                                <h4 className="text-[9px] font-black text-foreground/30 uppercase tracking-[0.3em] text-center">Transfer Intelligence Data</h4>

                                <div className="space-y-4">
                                    <div className="grid grid-cols-5 gap-2">
                                        {['text', 'audio', 'video', 'mindmap', 'infographic'].map((t) => (
                                            <button
                                                key={t}
                                                onClick={() => setUploadType(t as any)}
                                                className={cn(
                                                    "h-12 rounded-xl flex items-center justify-center border transition-all",
                                                    uploadType === t ? "bg-indigo-600 border-indigo-600 text-white shadow-xl" : "bg-white/5 border-card-border text-foreground/20 hover:text-indigo-600"
                                                )}
                                            >
                                                {t === 'text' && <FileText className="h-4 w-4" />}
                                                {t === 'audio' && <Headphones className="h-4 w-4" />}
                                                {t === 'video' && <Video className="h-4 w-4" />}
                                                {t === 'mindmap' && <MapIcon className="h-4 w-4" />}
                                                {t === 'infographic' && <LayoutIcon className="h-4 w-4" />}
                                            </button>
                                        ))}
                                    </div>

                                    <div className="relative group">
                                        <input
                                            type="file"
                                            onChange={(e) => setUploadFile(e.target.files?.[0] || null)}
                                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                        />
                                        <div className={cn(
                                            "border-2 border-dashed rounded-[2rem] p-12 flex flex-col items-center gap-4 transition-all group-hover:bg-indigo-600/[0.02] group-hover:border-indigo-600/40 animate-pulse-slow",
                                            uploadFile ? "border-emerald-500/50 bg-emerald-500/5" : "border-card-border"
                                        )}>
                                            <Upload className={cn("h-10 w-10 transition-colors", uploadFile ? "text-emerald-500" : "text-foreground/10 group-hover:text-indigo-600")} />
                                            <div className="text-center">
                                                <p className="text-[10px] font-black text-foreground uppercase tracking-[0.2em] max-w-[250px] truncate">
                                                    {uploadFile ? uploadFile.name : 'Click or Drag Strategic Assets'}
                                                </p>
                                                <p className="text-[7px] font-black text-foreground/20 uppercase tracking-widest mt-2 italic">Max Payload: 100MB</p>
                                            </div>
                                        </div>
                                    </div>

                                    <button
                                        onClick={handleUpload}
                                        disabled={!uploadFile || uploading}
                                        className="w-full bg-indigo-600 disabled:bg-indigo-600/30 text-white py-6 rounded-[1.5rem] text-[11px] font-black uppercase tracking-[0.2em] shadow-2xl shadow-indigo-600/20 active:scale-95 transition-all flex items-center justify-center gap-4"
                                    >
                                        {uploading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Rocket className="h-5 w-5" />}
                                        {uploading ? 'Processing Signal...' : 'Commence Intelligence Deployment'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="bg-card-bg border border-card-border border-dashed rounded-[3rem] p-20 text-center flex flex-col items-center justify-center gap-6 h-[600px] sticky top-8">
                            <div className="h-24 w-24 rounded-[2rem] bg-indigo-600/5 flex items-center justify-center border border-indigo-600/10">
                                <LayoutIcon className="h-10 w-10 text-indigo-600/20" />
                            </div>
                            <div className="space-y-2">
                                <p className="text-[11px] font-black text-foreground/40 uppercase tracking-[0.3em] italic">
                                    Curriculum Core Offline
                                </p>
                                <p className="text-[8px] font-bold text-foreground/20 uppercase tracking-widest max-w-[220px] mx-auto leading-relaxed">
                                    Select a structural topic from the neural tree to initialize tactical payload deployment.
                                </p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
