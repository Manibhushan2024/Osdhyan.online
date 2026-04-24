'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
    Plus,
    Search,
    Rocket,
    Loader2,
    Edit2,
    Trash2,
    X,
    CheckCircle2,
    ShieldAlert,
    Image as ImageIcon,
    ChevronRight,
    Globe
} from 'lucide-react';
import api from '@/lib/api';
import { cn } from '@/lib/utils';
import { toast } from 'react-hot-toast';
import { useAuth } from '@/components/providers/AuthProvider';

export default function AdminTestSeriesPage() {
    const { user } = useAuth();
    const canDelete = user?.admin_role === 'root';
    const [series, setSeries] = useState<any[]>([]);
    const [exams, setExams] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [showWizard, setShowWizard] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [wizardData, setWizardData] = useState({
        exam_id: '',
        name_en: '',
        name_hi: '',
        description_en: '',
        description_hi: '',
    });
    const [selectedFile, setSelectedFile] = useState<File | null>(null);

    useEffect(() => {
        fetchInitialData();
    }, []);

    const fetchInitialData = async () => {
        try {
            const [seriesRes, examsRes] = await Promise.all([
                api.get('/admin/test-series'),
                api.get('/exams')
            ]);
            setSeries(seriesRes.data);
            setExams(examsRes.data);
            if (examsRes.data.length > 0) {
                setWizardData(prev => ({ ...prev, exam_id: examsRes.data[0].id }));
            }
        } catch (error) {
            console.error('Failed to fetch data', error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        try {
            const formData = new FormData();
            formData.append('exam_id', wizardData.exam_id);
            formData.append('name_en', wizardData.name_en);
            formData.append('name_hi', wizardData.name_hi);
            formData.append('description_en', wizardData.description_en);
            formData.append('description_hi', wizardData.description_hi);
            if (selectedFile) {
                formData.append('image_file', selectedFile);
            }

            await api.post('/admin/test-series', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            toast.success('Test Series Initialized!');
            setShowWizard(false);
            const res = await api.get('/admin/test-series');
            setSeries(res.data);
            setWizardData({
                exam_id: exams[0]?.id || '',
                name_en: '',
                name_hi: '',
                description_en: '',
                description_hi: '',
            });
            setSelectedFile(null);
        } catch (error) {
            toast.error('Deployment Failed');
        } finally {
            setIsSaving(false);
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm('Are you sure you want to decommission this Test Series?')) return;
        try {
            await api.delete(`/admin/test-series/${id}`);
            setSeries(series.filter(s => s.id !== id));
            toast.success('Series Decommissioned');
        } catch (error) {
            toast.error('Decommission Failed');
        }
    };

    const togglePublish = async (s: any) => {
        try {
            await api.post(`/admin/test-series/${s.id}/update`, { is_published: !s.is_published });
            const res = await api.get('/admin/test-series');
            setSeries(res.data);
            toast.success(s.is_published ? 'Series Drafted' : 'Series Published');
        } catch (error) {
            toast.error('Status Update Failed');
        }
    };

    const filteredSeries = series.filter(s =>
        s.name_en.toLowerCase().includes(search.toLowerCase())
    );

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center py-40 gap-4">
                <Loader2 className="h-10 w-10 text-indigo-600 animate-spin" />
                <p className="text-[10px] font-black text-foreground/40 uppercase tracking-[0.3em]">Syncing Intelligence Vectors...</p>
            </div>
        );
    }

    return (
        <div className="space-y-12 pb-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 animate-in fade-in slide-in-from-bottom-4 duration-1000">
            {/* Header Section */}
            <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8">
                <div className="space-y-4">
                    <div className="flex items-center gap-4 text-[10px] font-black uppercase tracking-[0.2em] text-foreground/40">
                        <span>Intelligence Hub</span>
                        <ChevronRight className="h-3 w-3" />
                        <span className="text-indigo-600">Test Series Management</span>
                    </div>
                    <h1 className="text-5xl font-black text-foreground uppercase tracking-tighter italic leading-none">
                        Tactical <span className="text-indigo-600">Series</span>
                    </h1>
                </div>

                <div className="flex items-center gap-4">
                    <div className="relative group min-w-[300px]">
                        <Search className="absolute left-6 top-1/2 -translate-y-1/2 h-4 w-4 text-foreground/20 group-focus-within:text-indigo-600 transition-colors" />
                        <input
                            type="text"
                            placeholder="SCAN SERIES CODES..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full bg-card-bg border border-card-border rounded-[2rem] py-5 pl-14 pr-6 text-[10px] font-black uppercase tracking-widest focus:outline-none focus:border-indigo-600/30 shadow-xl transition-all"
                        />
                    </div>
                    <button
                        onClick={() => setShowWizard(true)}
                        className="flex items-center gap-3 bg-indigo-600 text-white px-8 py-5 rounded-[2rem] text-[10px] font-black uppercase tracking-widest shadow-2xl shadow-indigo-500/20 hover:scale-[1.02] active:scale-95 transition-all group"
                    >
                        <Plus className="h-4 w-4 group-hover:rotate-12 transition-transform" />
                        Create New Series
                    </button>
                </div>
            </div>

            {/* Test Series Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {filteredSeries.map((s) => (
                    <div key={s.id} className="bg-card-bg border border-card-border rounded-[3.5rem] overflow-hidden group hover:border-indigo-600/30 transition-all duration-500 shadow-sm relative">
                        {/* Image Header */}
                        <div className="h-48 bg-slate-900 relative overflow-hidden">
                            {s.image ? (
                                <img src={`${(process.env.NEXT_PUBLIC_STORAGE_URL ?? process.env.NEXT_PUBLIC_API_URL?.replace(/\/api$/, '') ?? '').replace(/\/$/, '')}/storage/${s.image}`} alt={s.name_en} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 opacity-60" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-white/5">
                                    <Rocket className="h-20 w-20" />
                                </div>
                            )}
                            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 to-transparent" />
                            <div className="absolute top-6 left-6 flex items-center gap-2 px-4 py-2 bg-black/40 backdrop-blur-md rounded-full border border-white/10">
                                <span className="text-[8px] font-black text-white uppercase tracking-widest">{s.exam?.name_en}</span>
                            </div>
                        </div>

                        <div className="p-10 space-y-6">
                            <div className="space-y-2">
                                <h3 className="text-xl font-black text-foreground uppercase tracking-tight italic group-hover:text-indigo-600 transition-colors">{s.name_en}</h3>
                                <div className="flex items-center gap-2">
                                    <Globe className="h-3 w-3 text-foreground/20" />
                                    <span className="text-[8px] font-black text-foreground/30 uppercase tracking-widest">{s.name_hi}</span>
                                </div>
                            </div>

                            <div className="flex items-center justify-between pt-6 border-t border-card-border/50">
                                <button
                                    onClick={() => togglePublish(s)}
                                    className={cn(
                                        "px-4 py-2 rounded-full text-[8px] font-black uppercase tracking-widest border transition-all",
                                        s.is_published
                                            ? "bg-emerald-600/10 text-emerald-600 border-emerald-600/20"
                                            : "bg-amber-600/10 text-amber-600 border-amber-600/20"
                                    )}
                                >
                                    {s.is_published ? 'Live' : 'Draft'}
                                </button>

                                <div className="flex items-center gap-2">
                                    <button
                                        className="h-10 w-10 rounded-xl bg-background border border-card-border flex items-center justify-center text-foreground/30 hover:text-indigo-600 transition-all"
                                    >
                                        <Edit2 className="h-4 w-4" />
                                    </button>
                                    {canDelete && (
                                        <button
                                            onClick={() => handleDelete(s.id)}
                                            className="h-10 w-10 rounded-xl bg-background border border-card-border flex items-center justify-center text-foreground/30 hover:text-red-500 transition-all"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* WIZARD MODAL */}
            {showWizard && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/80 backdrop-blur-md animate-in fade-in duration-300">
                    <div className="w-full max-w-2xl bg-card-bg border border-card-border rounded-[3rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-500">
                        <div className="p-10 space-y-8">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="h-12 w-12 bg-indigo-600 rounded-2xl flex items-center justify-center shadow-xl shadow-indigo-600/20">
                                        <Rocket className="text-white h-6 w-6" />
                                    </div>
                                    <div>
                                        <h2 className="text-lg font-black text-foreground uppercase tracking-tight italic">Series Architect</h2>
                                        <p className="text-[8px] font-black text-indigo-600 uppercase tracking-widest">Initializing Tactical Test Structure</p>
                                    </div>
                                </div>
                                <button onClick={() => setShowWizard(false)} className="text-foreground/20 hover:text-foreground transition-colors p-2">
                                    <X className="h-5 w-5" />
                                </button>
                            </div>

                            <form onSubmit={handleCreate} className="space-y-6">
                                <div className="space-y-2">
                                    <label className="text-[9px] font-black text-foreground/40 uppercase tracking-widest block px-2">Exam Vector</label>
                                    <select
                                        value={wizardData.exam_id}
                                        onChange={(e) => setWizardData({ ...wizardData, exam_id: e.target.value })}
                                        className="w-full bg-white/5 border border-card-border rounded-2xl p-4 text-[10px] font-black uppercase focus:outline-none focus:border-indigo-600/30 transition-all"
                                    >
                                        {exams.map(ex => (
                                            <option key={ex.id} value={ex.id} className="bg-black text-white">{ex.name_en}</option>
                                        ))}
                                    </select>
                                </div>

                                <div className="grid grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-[9px] font-black text-foreground/40 uppercase tracking-widest block px-2">Series Name (EN)</label>
                                        <input
                                            required
                                            type="text"
                                            value={wizardData.name_en}
                                            onChange={(e) => setWizardData({ ...wizardData, name_en: e.target.value })}
                                            className="w-full bg-white/5 border border-card-border rounded-2xl p-4 text-[10px] font-black uppercase focus:outline-none focus:border-indigo-600/30 transition-all"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[9px] font-black text-foreground/40 uppercase tracking-widest block px-2">Series Name (HI)</label>
                                        <input
                                            required
                                            type="text"
                                            value={wizardData.name_hi}
                                            onChange={(e) => setWizardData({ ...wizardData, name_hi: e.target.value })}
                                            className="w-full bg-white/5 border border-card-border rounded-2xl p-4 text-[10px] font-black uppercase focus:outline-none focus:border-indigo-600/30 transition-all"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[9px] font-black text-foreground/40 uppercase tracking-widest block px-2">Series Visual Cover</label>
                                    <div className="bg-white/5 border border-card-border border-dashed rounded-2xl p-8 flex flex-col items-center justify-center gap-4 hover:border-indigo-600/30 transition-all cursor-pointer relative group">
                                        {selectedFile ? (
                                            <div className="flex items-center gap-4">
                                                <ImageIcon className="h-8 w-8 text-indigo-600" />
                                                <span className="text-[10px] font-black uppercase text-foreground">{selectedFile.name}</span>
                                            </div>
                                        ) : (
                                            <>
                                                <ImageIcon className="h-8 w-8 text-foreground/10 group-hover:text-indigo-600/50 transition-colors" />
                                                <span className="text-[8px] font-black uppercase text-foreground/20 tracking-widest">Select Tactical Image Vector</span>
                                            </>
                                        )}
                                        <input
                                            type="file"
                                            className="absolute inset-0 opacity-0 cursor-pointer"
                                            onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                                            accept="image/*"
                                        />
                                    </div>
                                </div>

                                <button
                                    disabled={isSaving}
                                    type="submit"
                                    className="w-full bg-indigo-600 text-white py-6 rounded-[1.5rem] text-xs font-black uppercase tracking-[0.2em] shadow-2xl shadow-indigo-600/20 active:scale-95 transition-all flex items-center justify-center gap-4 disabled:bg-indigo-600/50"
                                >
                                    {isSaving ? <Loader2 className="h-5 w-5 animate-spin" /> : <Rocket className="h-5 w-5" />}
                                    {isSaving ? 'Initializing...' : 'Construct Series Vector'}
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
