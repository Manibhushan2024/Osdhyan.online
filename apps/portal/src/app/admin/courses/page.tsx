'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
    Plus,
    Search,
    Filter,
    BookOpen,
    ChevronRight,
    MoreVertical,
    LayoutGrid,
    List as ListIcon,
    Loader2,
    Edit2,
    Trash2,
    X,
    ShieldAlert,
    Rocket,
    Globe,
    Layers,
    CheckCircle2
} from 'lucide-react';
import api from '@/lib/api';
import { cn } from '@/lib/utils';
import { useAuth } from '@/components/providers/AuthProvider';

export default function AdminSubjectsPage() {
    const { user } = useAuth();
    const canDelete = user?.admin_role === 'root';
    const [subjects, setSubjects] = useState<any[]>([]);
    const [exams, setExams] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('ALL');

    // Wizard State
    const [showWizard, setShowWizard] = useState(false);
    const [isDeploying, setIsDeploying] = useState(false);
    const [wizardData, setWizardData] = useState({
        exam_id: '',
        category: 'NCERT',
        class_level: '',
        code: '',
        name_en: '',
        name_hi: '',
        sort_order: 0
    });

    useEffect(() => {
        fetchInitialData();
    }, []);

    const [showExamWizard, setShowExamWizard] = useState(false);
    const [examWizardData, setExamWizardData] = useState({ name_en: '', name_hi: '', code: '', description_en: '' });
    const [isCreatingExam, setIsCreatingExam] = useState(false);

    const fetchInitialData = async () => {
        try {
            const [subsRes, examsRes] = await Promise.all([
                api.get('/admin/subjects'),
                api.get('/admin/exams')
            ]);
            setSubjects(Array.isArray(subsRes.data) ? subsRes.data : []);
            setExams(Array.isArray(examsRes.data) ? examsRes.data : []);
            if (examsRes.data.length > 0) {
                setWizardData(prev => ({ ...prev, exam_id: examsRes.data[0].id }));
            }
        } catch (error) {
            console.error('Failed to fetch data', error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateExam = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsCreatingExam(true);
        try {
            await api.post('/admin/exams', examWizardData);
            setShowExamWizard(false);
            const res = await api.get('/admin/exams');
            const newExams = Array.isArray(res.data) ? res.data : [];
            setExams(newExams);
            if (newExams.length > 0) setWizardData(prev => ({ ...prev, exam_id: newExams[0].id }));
            setExamWizardData({ name_en: '', name_hi: '', code: '', description_en: '' });
        } catch (error: any) {
            alert(error?.response?.data?.message ?? 'Failed to create exam');
        } finally {
            setIsCreatingExam(false);
        }
    };

    const handleDeploy = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsDeploying(true);
        try {
            await api.post('/admin/subjects', wizardData);
            setShowWizard(false);
            const res = await api.get('/admin/subjects');
            setSubjects(Array.isArray(res.data) ? res.data : []);
            // Reset wizard
            setWizardData({
                exam_id: exams[0]?.id || '',
                category: 'NCERT',
                class_level: '',
                code: '',
                name_en: '',
                name_hi: '',
                sort_order: 0
            });
        } catch (error) {
            console.error('Deployment Failed', error);
            alert('Deployment Error: Verify unique code and required fields.');
        } finally {
            setIsDeploying(false);
        }
    };

    const handleDeleteSubject = async (id: number) => {
        if (!confirm('CAUTION: This will delete the entire Subject hierarchy. Proceed?')) return;
        try {
            await api.delete(`/admin/subjects/${id}`);
            setSubjects(subjects.filter(s => s.id !== id));
        } catch (error) {
            console.error('Delete failed', error);
        }
    };

    const categories = ['ALL', 'NCERT', 'GS', 'APTITUDE', 'REASONING', 'ENGLISH', 'CURRENT AFFAIRS'];

    const filteredSubjects = (Array.isArray(subjects) ? subjects : []).filter(s => {
        const matchesSearch = s.name_en?.toLowerCase().includes(search.toLowerCase()) ||
            (s.code ?? '').toLowerCase().includes(search.toLowerCase());
        const matchesCategory = categoryFilter === 'ALL' || s.category === categoryFilter;
        return matchesSearch && matchesCategory;
    });

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center py-40 gap-4">
                <Loader2 className="h-10 w-10 text-indigo-600 animate-spin" />
                <p className="text-[10px] font-black text-foreground/40 uppercase tracking-[0.3em]">Connecting to Intelligence Hub...</p>
            </div>
        );
    }

    return (
        <div className="space-y-12 pb-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 animate-in fade-in slide-in-from-bottom-4 duration-1000">
            {/* Header / Stats Overlay */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {[
                    { label: 'Total Subjects', val: subjects.length, icon: BookOpen, color: 'text-blue-600', href: '/admin/courses' },
                    { label: 'Live Domains', val: subjects.filter(s => s.is_published).length, icon: CheckCircle2, color: 'text-emerald-600', href: '/admin/courses' },
                    { label: 'Test Series', val: 'MANAGE', icon: Rocket, color: 'text-indigo-600', href: '/admin/test-series' },
                    { label: 'General GS', val: subjects.filter(s => s.category !== 'NCERT').length, icon: Globe, color: 'text-indigo-600', href: '/admin/courses' },
                ].map((stat, i) => (
                    <Link key={i} href={stat.href} className="bg-card-bg border border-card-border p-6 rounded-[2rem] flex items-center gap-4 group hover:border-indigo-600/20 transition-all">
                        <div className={cn("h-12 w-12 rounded-2xl flex items-center justify-center bg-card-border/10 transition-transform group-hover:scale-110", stat.color)}>
                            <stat.icon className="h-6 w-6" />
                        </div>
                        <div>
                            <p className="text-[8px] font-black text-foreground/40 uppercase tracking-widest">{stat.label}</p>
                            <p className="text-2xl font-black text-foreground tracking-tighter italic">{stat.val}</p>
                        </div>
                    </Link>
                ))}
            </div>

            {/* Tactical Actions */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
                <div className="relative flex-1 max-w-xl group">
                    <Search className="absolute left-6 top-1/2 -translate-y-1/2 h-4 w-4 text-foreground/20 group-focus-within:text-indigo-600 transition-colors" />
                    <input
                        type="text"
                        placeholder="SCAN DOMAIN CODES OR NAMES..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full bg-card-bg border border-card-border rounded-[2rem] py-5 pl-14 pr-6 text-[10px] font-black uppercase tracking-widest focus:outline-none focus:border-indigo-600/30 shadow-xl shadow-transparent focus:shadow-indigo-600/5 transition-all"
                    />
                </div>

                <div className="flex items-center gap-4">
                    <div className="hidden md:flex bg-card-bg p-1.5 rounded-[1.5rem] border border-card-border">
                        {categories.slice(0, 4).map(cat => (
                            <button
                                key={cat}
                                onClick={() => setCategoryFilter(cat)}
                                className={cn(
                                    "px-6 py-2.5 text-[8px] font-black uppercase tracking-widest rounded-xl transition-all",
                                    categoryFilter === cat ? "bg-indigo-600 text-white shadow-lg shadow-indigo-500/20" : "text-foreground/30 hover:text-foreground"
                                )}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>

                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => setShowExamWizard(true)}
                            className="flex items-center gap-2 bg-white/5 border border-white/10 text-foreground/60 px-6 py-5 rounded-[2rem] text-[9px] font-black uppercase tracking-widest hover:bg-white/10 hover:text-white transition-all group"
                        >
                            <Plus className="h-3 w-3" />
                            New Exam
                        </button>
                        <button
                            onClick={() => setShowWizard(true)}
                            className="flex items-center gap-3 bg-indigo-600 text-white px-8 py-5 rounded-[2rem] text-[10px] font-black uppercase tracking-widest shadow-2xl shadow-indigo-500/20 hover:scale-[1.02] active:scale-95 transition-all group"
                        >
                            <Plus className="h-4 w-4 group-hover:rotate-12 transition-transform" />
                            Deploy New Course
                        </button>
                    </div>
                </div>
            </div>

            {/* Subjects Table */}
            <div className="bg-card-bg border border-card-border rounded-[3rem] overflow-hidden shadow-sm backdrop-blur-xl">
                <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                        <thead>
                            <tr className="border-b border-card-border/50">
                                <th className="px-8 py-8 text-left text-[9px] font-black text-foreground/30 uppercase tracking-[0.3em]">Protocol Code</th>
                                <th className="px-8 py-8 text-left text-[9px] font-black text-foreground/30 uppercase tracking-[0.3em]">Intelligence Vector</th>
                                <th className="px-8 py-8 text-left text-[9px] font-black text-foreground/30 uppercase tracking-[0.3em]">Status</th>
                                <th className="px-8 py-8 text-left text-[9px] font-black text-foreground/30 uppercase tracking-[0.3em]">Category</th>
                                <th className="px-8 py-8 text-right text-[9px] font-black text-foreground/30 uppercase tracking-[0.3em]">Ops</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-card-border/30">
                            {filteredSubjects.map((subject) => (
                                <tr key={subject.id} className="group hover:bg-indigo-600/[0.03] transition-all duration-500">
                                    <td className="px-8 py-7">
                                        <code className="bg-white/5 border border-white/10 px-4 py-2 rounded-xl text-[10px] font-black text-indigo-600/70 tracking-widest uppercase">
                                            {subject.code}
                                        </code>
                                    </td>
                                    <td className="px-8 py-7">
                                        <div className="flex items-center gap-4">
                                            <div className="h-10 w-10 rounded-2xl bg-indigo-600/5 flex items-center justify-center text-indigo-600 border border-indigo-600/10 group-hover:bg-indigo-600 group-hover:text-white transition-all duration-500">
                                                <BookOpen className="h-5 w-5" />
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="text-sm font-black text-foreground uppercase tracking-tight italic group-hover:translate-x-1 transition-transform">{subject.name_en}</span>
                                                <span className="text-[7px] font-black text-foreground/30 uppercase tracking-[0.2em]">{subject.name_hi}</span>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-8 py-7">
                                        <div className={cn(
                                            "inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-[8px] font-black uppercase tracking-widest border",
                                            subject.is_published
                                                ? "bg-emerald-600/10 text-emerald-600 border-emerald-600/20"
                                                : "bg-amber-600/10 text-amber-600 border-amber-600/20"
                                        )}>
                                            <div className={cn("h-1.5 w-1.5 rounded-full", subject.is_published ? "bg-emerald-500 animate-pulse" : "bg-amber-500")} />
                                            {subject.is_published ? 'LIVE IN PORTAL' : 'SELECTION DRAFT'}
                                        </div>
                                    </td>
                                    <td className="px-8 py-7">
                                        <div className="flex items-center gap-2">
                                            <span className={cn(
                                                "inline-flex items-center px-4 py-1.5 rounded-full text-[8px] font-black uppercase tracking-widest border",
                                                subject.category === 'NCERT' ? "bg-blue-600/10 text-blue-600 border-blue-600/20" : "bg-indigo-600/10 text-indigo-600 border-indigo-600/20"
                                            )}>
                                                {subject.category}
                                            </span>
                                            <span className="text-[9px] font-black text-foreground/40 uppercase tracking-widest">{subject.class_level}</span>
                                        </div>
                                    </td>
                                    <td className="px-8 py-7 text-right">
                                        <div className="flex items-center justify-end gap-3 opacity-0 group-hover:opacity-100 transition-all duration-500 translate-x-4 group-hover:translate-x-0">
                                            <Link
                                                href={`/admin/courses/${subject.id}`}
                                                className="flex items-center gap-2 bg-card-bg border border-card-border px-4 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-widest text-indigo-600/70 hover:text-indigo-600 hover:border-indigo-600/30 hover:shadow-lg hover:shadow-indigo-600/10 transition-all"
                                            >
                                                <Edit2 className="h-3.5 w-3.5" />
                                                Edit Content
                                            </Link>
                                            {canDelete && (
                                                <button
                                                    onClick={() => handleDeleteSubject(subject.id)}
                                                    className="h-10 w-10 rounded-xl bg-card-bg border border-card-border flex items-center justify-center text-foreground/30 hover:text-red-500 hover:border-red-500/30 hover:shadow-lg hover:shadow-red-600/10 transition-all"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* DEPLOYMENT WIZARD MODAL */}
            {showWizard && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/80 backdrop-blur-md animate-in fade-in duration-300">
                    <div className="w-full max-w-2xl bg-card-bg border border-card-border rounded-[3rem] shadow-2xl overflow-hidden animate-in zoom-in-95 focus-in-center duration-500">
                        <div className="p-10 space-y-8">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="h-12 w-12 bg-indigo-600 rounded-2xl flex items-center justify-center shadow-xl shadow-indigo-600/20">
                                        <Rocket className="text-white h-6 w-6" />
                                    </div>
                                    <div>
                                        <h2 className="text-lg font-black text-foreground uppercase tracking-tight italic">Deployment Wizard</h2>
                                        <p className="text-[8px] font-black text-indigo-600 uppercase tracking-widest">Constructing New Intelligence Domain</p>
                                    </div>
                                </div>
                                <button onClick={() => setShowWizard(false)} className="text-foreground/20 hover:text-foreground transition-colors p-2">
                                    <X className="h-5 w-5" />
                                </button>
                            </div>

                            <form onSubmit={handleDeploy} className="space-y-6">
                                <div className="grid grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-[9px] font-black text-foreground/40 uppercase tracking-widest block px-2">Mission Parameters (Category)</label>
                                        <select
                                            value={wizardData.category}
                                            onChange={(e) => setWizardData({ ...wizardData, category: e.target.value })}
                                            className="w-full bg-white/5 border border-card-border rounded-2xl p-4 text-[10px] font-black uppercase focus:outline-none focus:border-indigo-600/30 transition-all"
                                        >
                                            {categories.filter(c => c !== 'ALL').map(c => (
                                                <option key={c} value={c} className="bg-black text-white">{c}</option>
                                            ))}
                                        </select>
                                    </div>

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
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[9px] font-black text-foreground/40 uppercase tracking-widest block px-2">Strategic Key (Unique Code)</label>
                                    <input
                                        required
                                        type="text"
                                        placeholder="e.g. UPSC-NCERT-HIS-10"
                                        value={wizardData.code}
                                        onChange={(e) => setWizardData({ ...wizardData, code: e.target.value.toUpperCase() })}
                                        className="w-full bg-white/5 border border-card-border rounded-2xl p-4 text-[10px] font-black uppercase focus:outline-none focus:border-indigo-600/30 transition-all"
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-[9px] font-black text-foreground/40 uppercase tracking-widest block px-2">Domain Name (English)</label>
                                        <input
                                            required
                                            type="text"
                                            placeholder="ECONOMICS"
                                            value={wizardData.name_en}
                                            onChange={(e) => setWizardData({ ...wizardData, name_en: e.target.value })}
                                            className="w-full bg-white/5 border border-card-border rounded-2xl p-4 text-[10px] font-black uppercase focus:outline-none focus:border-indigo-600/30 transition-all"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[9px] font-black text-foreground/40 uppercase tracking-widest block px-2">Domain Name (Hindi)</label>
                                        <input
                                            required
                                            type="text"
                                            placeholder="अर्थशास्त्र"
                                            value={wizardData.name_hi}
                                            onChange={(e) => setWizardData({ ...wizardData, name_hi: e.target.value })}
                                            className="w-full bg-white/5 border border-card-border rounded-2xl p-4 text-[10px] font-black uppercase focus:outline-none focus:border-indigo-600/30 transition-all"
                                        />
                                    </div>
                                </div>

                                {wizardData.category === 'NCERT' && (
                                    <div className="space-y-2 animate-in slide-in-from-top-2 duration-300">
                                        <label className="text-[9px] font-black text-foreground/40 uppercase tracking-widest block px-2">Grade Level</label>
                                        <input
                                            type="text"
                                            placeholder="e.g. 10th"
                                            value={wizardData.class_level}
                                            onChange={(e) => setWizardData({ ...wizardData, class_level: e.target.value })}
                                            className="w-full bg-white/5 border border-card-border rounded-2xl p-4 text-[10px] font-black uppercase focus:outline-none focus:border-indigo-600/30 transition-all"
                                        />
                                    </div>
                                )}

                                <button
                                    disabled={isDeploying}
                                    type="submit"
                                    className="w-full bg-indigo-600 text-white py-6 rounded-[1.5rem] text-xs font-black uppercase tracking-[0.2em] shadow-2xl shadow-indigo-600/20 active:scale-95 transition-all flex items-center justify-center gap-4 group disabled:bg-indigo-600/50"
                                >
                                    {isDeploying ? (
                                        <Loader2 className="h-5 w-5 animate-spin" />
                                    ) : (
                                        <Rocket className="h-5 w-5 group-hover:-translate-y-1 transition-transform" />
                                    )}
                                    {isDeploying ? 'Deploying...' : 'Initialize Deployment'}
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            )}

            {/* EXAM CREATION WIZARD */}
            {showExamWizard && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/80 backdrop-blur-md animate-in fade-in duration-300">
                    <div className="w-full max-w-lg bg-card-bg border border-card-border rounded-[3rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-500">
                        <div className="p-10 space-y-6">
                            <div className="flex items-center justify-between">
                                <h2 className="text-lg font-black text-foreground uppercase tracking-tight italic">Create New Exam</h2>
                                <button onClick={() => setShowExamWizard(false)} className="text-foreground/20 hover:text-foreground transition-colors p-2">
                                    <X className="h-5 w-5" />
                                </button>
                            </div>
                            <form onSubmit={handleCreateExam} className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="col-span-2">
                                        <label className="block text-[8px] font-black uppercase tracking-widest text-foreground/40 mb-2">Exam Name (English) *</label>
                                        <input
                                            required
                                            value={examWizardData.name_en}
                                            onChange={e => setExamWizardData({ ...examWizardData, name_en: e.target.value })}
                                            placeholder="e.g. BPSC 70th"
                                            className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-sm font-black text-foreground focus:outline-none focus:border-indigo-600/30"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[8px] font-black uppercase tracking-widest text-foreground/40 mb-2">Short Code</label>
                                        <input
                                            value={examWizardData.code}
                                            onChange={e => setExamWizardData({ ...examWizardData, code: e.target.value.toUpperCase() })}
                                            placeholder="BPSC70"
                                            className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-sm font-black text-foreground focus:outline-none focus:border-indigo-600/30"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[8px] font-black uppercase tracking-widest text-foreground/40 mb-2">Hindi Name</label>
                                        <input
                                            value={examWizardData.name_hi}
                                            onChange={e => setExamWizardData({ ...examWizardData, name_hi: e.target.value })}
                                            placeholder="Optional"
                                            className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-sm font-black text-foreground focus:outline-none focus:border-indigo-600/30"
                                        />
                                    </div>
                                </div>
                                <button
                                    type="submit"
                                    disabled={isCreatingExam}
                                    className="w-full bg-indigo-600 text-white py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-700 disabled:opacity-50 transition-all"
                                >
                                    {isCreatingExam ? 'Creating...' : 'Create Exam'}
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
