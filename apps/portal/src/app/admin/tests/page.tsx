'use client';

import { useState, useEffect, useCallback } from 'react';
import api from '@/lib/api';
import { cn } from '@/lib/utils';
import { toast } from 'react-hot-toast';
import {
    Plus, Search, Loader2, Edit2, Trash2, Copy, Eye, EyeOff,
    ChevronRight, Clock, Target, BookOpen, Users, Filter,
    ArrowRight, ArrowLeft, X, Check, Upload, Download,
    Zap, AlertCircle, CheckCircle2, LayoutList, Hash
} from 'lucide-react';
import Link from 'next/link';

// ─── Types ────────────────────────────────────────────────────────────────────

type Exam       = { id: number; code: string; name_en: string };
type Subject    = { id: number; name_en: string };
type Test = {
    id: number; name_en: string; name_hi: string;
    exam: Exam; mode: string; category: string;
    duration_sec: number; total_marks: number; negative_marking: number;
    passing_marks: number | null; status: string; is_free: boolean;
    question_count: number; attempt_count: number;
    year: number | null; paper_type: string | null;
    created_at: string;
};
type Section    = { id?: number; name_en: string; name_hi: string; duration_min: string; marks_per_q: string; negative_marks_per_q: string };
type Question   = { id: number; question_en: string; difficulty: string; subject?: { name_en: string }; chapter?: { name_en: string } };

const CATEGORIES = ['full_test', 'chapter_test', 'subject_test', 'pyq', 'current_affairs', 'most_saved', 'mega_live'];
const MODES      = ['full_mock', 'subject', 'chapter'];

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function AdminTestsPage() {
    const [tests, setTests]       = useState<Test[]>([]);
    const [total, setTotal]       = useState(0);
    const [page, setPage]         = useState(1);
    const [loading, setLoading]   = useState(true);
    const [search, setSearch]     = useState('');
    const [statusF, setStatusF]   = useState('');
    const [examF, setExamF]       = useState('');
    const [exams, setExams]       = useState<Exam[]>([]);
    const [showWizard, setShowWizard] = useState(false);
    const [editTest, setEditTest] = useState<Test | null>(null);

    const load = useCallback(async () => {
        setLoading(true);
        try {
            const params: any = { page, per_page: 15 };
            if (search)  params.search  = search;
            if (statusF) params.status  = statusF;
            if (examF)   params.exam_id = examF;
            const res = await api.get('/admin/tests', { params });
            setTests(res.data.data ?? res.data);
            setTotal(res.data.total ?? res.data.length);
        } catch { toast.error('Failed to load tests'); }
        finally { setLoading(false); }
    }, [page, search, statusF, examF]);

    useEffect(() => { load(); }, [load]);

    useEffect(() => {
        api.get('/exams').then(r => setExams(r.data)).catch(() => {});
    }, []);

    const handlePublish = async (test: Test) => {
        try {
            const res = await api.post(`/admin/tests/${test.id}/publish`);
            toast.success(res.data.message);
            load();
        } catch { toast.error('Failed to update status'); }
    };

    const handleDelete = async (test: Test) => {
        if (!confirm(`Delete "${test.name_en}"? This cannot be undone.`)) return;
        try {
            await api.delete(`/admin/tests/${test.id}`);
            toast.success('Test deleted');
            load();
        } catch { toast.error('Failed to delete test'); }
    };

    const handleDuplicate = async (test: Test) => {
        try {
            await api.post(`/admin/tests/${test.id}/duplicate`);
            toast.success('Test duplicated');
            load();
        } catch { toast.error('Failed to duplicate test'); }
    };

    return (
        <div className="space-y-8 pb-20">
            {/* Header */}
            <div className="flex items-end justify-between">
                <div>
                    <div className="flex items-center gap-2 text-[9px] font-black text-white/30 uppercase tracking-widest mb-3">
                        <span>Admin</span><ChevronRight className="h-3 w-3" /><span className="text-indigo-400">Tests Pool</span>
                    </div>
                    <h1 className="text-4xl font-black text-white uppercase tracking-tighter italic">
                        Test <span className="text-indigo-400">Command Center</span>
                    </h1>
                    <p className="text-white/30 text-[10px] font-black uppercase tracking-widest mt-1">
                        {total} tests in the system
                    </p>
                </div>
                <div className="flex gap-3">
                    <Link href="/admin/bulk-import" className="flex items-center gap-2 px-5 py-3 bg-white/5 border border-white/10 rounded-2xl text-[10px] font-black text-white/50 uppercase tracking-widest hover:text-white transition-all">
                        <Upload className="h-3.5 w-3.5" /> Bulk Import
                    </Link>
                    <button
                        onClick={() => { setEditTest(null); setShowWizard(true); }}
                        className="flex items-center gap-2 px-6 py-3 bg-indigo-600 rounded-2xl text-[10px] font-black text-white uppercase tracking-widest shadow-lg shadow-indigo-600/20 hover:bg-indigo-500 transition-all"
                    >
                        <Plus className="h-4 w-4" /> Create Test
                    </button>
                </div>
            </div>

            {/* Filters */}
            <div className="flex flex-wrap gap-3">
                <div className="relative flex-1 min-w-[200px]">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/20" />
                    <input value={search} onChange={e => { setSearch(e.target.value); setPage(1); }}
                        placeholder="Search tests..." className="w-full bg-slate-900 border border-indigo-500/10 rounded-xl pl-9 pr-4 py-2.5 text-[11px] text-white placeholder:text-white/20 focus:outline-none focus:ring-1 focus:ring-indigo-500/30" />
                </div>
                <select value={statusF} onChange={e => { setStatusF(e.target.value); setPage(1); }}
                    className="bg-slate-900 border border-indigo-500/10 rounded-xl px-4 py-2.5 text-[11px] text-white focus:outline-none">
                    <option value="">All Status</option>
                    <option value="published">Published</option>
                    <option value="draft">Draft</option>
                </select>
                <select value={examF} onChange={e => { setExamF(e.target.value); setPage(1); }}
                    className="bg-slate-900 border border-indigo-500/10 rounded-xl px-4 py-2.5 text-[11px] text-white focus:outline-none">
                    <option value="">All Exams</option>
                    {exams.map(e => <option key={e.id} value={e.id}>{e.code}</option>)}
                </select>
            </div>

            {/* Test List */}
            {loading ? (
                <div className="flex items-center justify-center py-20">
                    <Loader2 className="h-8 w-8 text-indigo-500 animate-spin" />
                </div>
            ) : tests.length === 0 ? (
                <div className="text-center py-20">
                    <LayoutList className="h-12 w-12 text-white/10 mx-auto mb-4" />
                    <p className="text-white/30 font-black uppercase tracking-widest text-[10px]">No tests found</p>
                    <button onClick={() => setShowWizard(true)} className="mt-4 text-indigo-400 text-[10px] font-black uppercase tracking-widest hover:text-indigo-300">
                        + Create your first test
                    </button>
                </div>
            ) : (
                <div className="space-y-3">
                    {tests.map(test => (
                        <TestRow key={test.id} test={test}
                            onEdit={() => { setEditTest(test); setShowWizard(true); }}
                            onPublish={() => handlePublish(test)}
                            onDelete={() => handleDelete(test)}
                            onDuplicate={() => handleDuplicate(test)}
                        />
                    ))}
                </div>
            )}

            {/* Pagination */}
            {total > 15 && (
                <div className="flex items-center justify-center gap-3">
                    <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                        className="px-4 py-2 bg-slate-900 border border-indigo-500/10 rounded-xl text-[10px] font-black text-white/50 hover:text-white disabled:opacity-30 transition-all">
                        ← Prev
                    </button>
                    <span className="text-[10px] font-black text-white/30">Page {page} of {Math.ceil(total / 15)}</span>
                    <button onClick={() => setPage(p => p + 1)} disabled={page >= Math.ceil(total / 15)}
                        className="px-4 py-2 bg-slate-900 border border-indigo-500/10 rounded-xl text-[10px] font-black text-white/50 hover:text-white disabled:opacity-30 transition-all">
                        Next →
                    </button>
                </div>
            )}

            {/* Create / Edit Wizard */}
            {showWizard && (
                <TestWizard
                    exams={exams}
                    editTest={editTest}
                    onClose={() => { setShowWizard(false); setEditTest(null); }}
                    onSaved={() => { setShowWizard(false); setEditTest(null); load(); }}
                />
            )}
        </div>
    );
}

// ─── Test Row ─────────────────────────────────────────────────────────────────

function TestRow({ test, onEdit, onPublish, onDelete, onDuplicate }: {
    test: Test; onEdit: () => void; onPublish: () => void; onDelete: () => void; onDuplicate: () => void;
}) {
    const mins = Math.round(test.duration_sec / 60);
    return (
        <div className="bg-slate-900 border border-indigo-500/10 rounded-2xl p-5 flex items-center gap-5 hover:border-indigo-500/20 transition-all">
            {/* Status dot */}
            <span className={cn("h-2 w-2 rounded-full flex-shrink-0",
                test.status === 'published' ? "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]" : "bg-white/20")} />

            {/* Main info */}
            <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-[13px] font-black text-white truncate">{test.name_en}</p>
                    {test.year && <span className="text-[8px] font-black text-white/30 bg-white/5 px-2 py-0.5 rounded">{test.year}</span>}
                    {test.paper_type && <span className="text-[8px] font-black text-white/30 bg-white/5 px-2 py-0.5 rounded">{test.paper_type}</span>}
                </div>
                <div className="flex items-center gap-4 mt-1 flex-wrap">
                    <span className="text-[9px] font-black text-indigo-400 uppercase">{test.exam?.code}</span>
                    <span className="text-[9px] font-black text-white/30 uppercase">{test.category?.replace('_', ' ')}</span>
                    <span className="flex items-center gap-1 text-[9px] text-white/30"><Clock className="h-3 w-3" />{mins} min</span>
                    <span className="flex items-center gap-1 text-[9px] text-white/30"><BookOpen className="h-3 w-3" />{test.question_count} Qs</span>
                    <span className="flex items-center gap-1 text-[9px] text-white/30"><Target className="h-3 w-3" />{test.total_marks} marks</span>
                    {test.negative_marking > 0 && <span className="text-[9px] text-red-400">-{test.negative_marking}/wrong</span>}
                    <span className="flex items-center gap-1 text-[9px] text-white/30"><Users className="h-3 w-3" />{test.attempt_count} attempts</span>
                </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2">
                <button onClick={onPublish} title={test.status === 'published' ? 'Unpublish' : 'Publish'}
                    className={cn("p-2 rounded-xl transition-all",
                        test.status === 'published' ? "text-emerald-400 hover:bg-emerald-500/10" : "text-white/20 hover:text-emerald-400 hover:bg-emerald-500/10")}>
                    {test.status === 'published' ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                </button>
                <button onClick={onEdit} className="p-2 rounded-xl text-white/20 hover:text-indigo-400 hover:bg-indigo-500/10 transition-all">
                    <Edit2 className="h-4 w-4" />
                </button>
                <button onClick={onDuplicate} className="p-2 rounded-xl text-white/20 hover:text-amber-400 hover:bg-amber-500/10 transition-all">
                    <Copy className="h-4 w-4" />
                </button>
                <button onClick={onDelete} className="p-2 rounded-xl text-white/20 hover:text-red-400 hover:bg-red-500/10 transition-all">
                    <Trash2 className="h-4 w-4" />
                </button>
            </div>
        </div>
    );
}

// ─── Test Creation Wizard ─────────────────────────────────────────────────────

function TestWizard({ exams, editTest, onClose, onSaved }: {
    exams: Exam[]; editTest: Test | null; onClose: () => void; onSaved: () => void;
}) {
    const isEdit = !!editTest;
    const [step, setStep] = useState(1); // 1=meta, 2=sections, 3=questions
    const [saving, setSaving] = useState(false);

    // Step 1: Test metadata
    const [meta, setMeta] = useState({
        exam_id:          String(editTest?.exam?.id ?? exams[0]?.id ?? ''),
        name_en:          editTest?.name_en ?? '',
        name_hi:          editTest?.name_hi ?? '',
        description_en:   '',
        mode:             editTest?.mode ?? 'full_mock',
        category:         editTest?.category ?? 'full_test',
        duration_min:     String(Math.round((editTest?.duration_sec ?? 7200) / 60)),
        total_marks:      String(editTest?.total_marks ?? 150),
        negative_marking: String(editTest?.negative_marking ?? 0),
        passing_marks:    String(editTest?.passing_marks ?? ''),
        year:             String(editTest?.year ?? ''),
        paper_type:       editTest?.paper_type ?? '',
        max_attempts:     '0',
        shuffle:          false,
        is_free:          true,
        status:           editTest?.status ?? 'published',
    });

    // Step 2: Sections
    const [sections, setSections] = useState<Section[]>([
        { name_en: 'General Studies', name_hi: 'सामान्य अध्ययन', duration_min: '', marks_per_q: '1', negative_marks_per_q: '0' }
    ]);

    // Step 3: Questions
    const [subjects, setSubjects]             = useState<Subject[]>([]);
    const [subjectF, setSubjectF]             = useState('');
    const [diffF, setDiffF]                   = useState('');
    const [qSearch, setQSearch]               = useState('');
    const [available, setAvailable]           = useState<Question[]>([]);
    const [qLoading, setQLoading]             = useState(false);
    const [selectedQIds, setSelectedQIds]     = useState<number[]>([]);
    const [sectionAssign, setSectionAssign]   = useState<Record<number, number | null>>({});
    // Auto-assign state
    const [autoSection, setAutoSection]       = useState(0);
    const [autoSubject, setAutoSubject]       = useState('');
    const [autoCount, setAutoCount]           = useState('30');
    const [autoLoading, setAutoLoading]       = useState(false);

    useEffect(() => {
        if (meta.exam_id) {
            api.get(`/exams/${meta.exam_id}/subjects`).then(r => setSubjects(r.data)).catch(() => {});
        }
    }, [meta.exam_id]);

    const loadQuestions = async () => {
        setQLoading(true);
        try {
            const params: any = { exam_id: meta.exam_id };
            if (subjectF) params.subject_id = subjectF;
            if (diffF)    params.difficulty  = diffF;
            if (qSearch)  params.search      = qSearch;
            const res = await api.get('/admin/questions/search', { params });
            setAvailable(res.data);
        } catch { toast.error('Failed to load questions'); }
        finally { setQLoading(false); }
    };

    useEffect(() => { if (step === 3) loadQuestions(); }, [step, subjectF, diffF]);

    const handleAutoAssign = async () => {
        if (!autoSubject) { toast.error('Select a subject'); return; }
        setAutoLoading(true);
        try {
            const selectedSubject = subjects.find(s => String(s.id) === autoSubject);
            const res = await api.post('/admin/tests/auto-assign', {
                exam_id:         parseInt(meta.exam_id),
                subject_name_en: selectedSubject?.name_en ?? '',
                count:           parseInt(autoCount) || 30,
            });
            const foundIds: number[] = res.data.questions.map((q: any) => q.id);
            setSelectedQIds(prev => [...new Set([...prev, ...foundIds])]);
            const secId = sections[autoSection] ? autoSection : null;
            const newAssign = { ...sectionAssign };
            foundIds.forEach(id => { newAssign[id] = secId; });
            setSectionAssign(newAssign);
            toast.success(`${foundIds.length} questions auto-selected`);
        } catch { toast.error('Auto-assign failed'); }
        finally { setAutoLoading(false); }
    };

    const toggleQ = (q: Question) => {
        setSelectedQIds(prev =>
            prev.includes(q.id) ? prev.filter(id => id !== q.id) : [...prev, q.id]
        );
    };

    const handleSave = async () => {
        if (!meta.name_en) { toast.error('Test name required'); return; }
        setSaving(true);
        try {
            // Build sections payload with question IDs grouped by section
            const sectionPayload = sections.map((sec, idx) => {
                const qIds = selectedQIds.filter(id => (sectionAssign[id] ?? 0) === idx);
                return {
                    name_en:               sec.name_en,
                    name_hi:               sec.name_hi,
                    duration_sec:          sec.duration_min ? parseInt(sec.duration_min) * 60 : null,
                    marks_per_q:           parseFloat(sec.marks_per_q) || 1,
                    negative_marks_per_q:  parseFloat(sec.negative_marks_per_q) || 0,
                    sort_order:            idx,
                    question_ids:          qIds,
                };
            });

            // Questions not assigned to any section
            const unassigned = selectedQIds.filter(id => sectionAssign[id] === null || sectionAssign[id] === undefined);

            const payload = {
                exam_id:           parseInt(meta.exam_id),
                name_en:           meta.name_en,
                name_hi:           meta.name_hi || meta.name_en,
                description_en:    meta.description_en,
                mode:              meta.mode,
                category:          meta.category,
                duration_sec:      parseInt(meta.duration_min) * 60,
                total_marks:       parseFloat(meta.total_marks) || selectedQIds.length,
                negative_marking:  parseFloat(meta.negative_marking) || 0,
                passing_marks:     meta.passing_marks ? parseFloat(meta.passing_marks) : null,
                year:              meta.year ? parseInt(meta.year) : null,
                paper_type:        meta.paper_type || null,
                max_attempts:      parseInt(meta.max_attempts) || 0,
                shuffle_questions: meta.shuffle,
                is_free:           meta.is_free,
                status:            meta.status,
                sections:          sections.length > 0 ? sectionPayload : undefined,
                question_ids:      unassigned.length > 0 ? unassigned : undefined,
            };

            if (isEdit) {
                await api.put(`/admin/tests/${editTest!.id}`, payload);
                toast.success('Test updated');
            } else {
                await api.post('/admin/tests', payload);
                toast.success('Test created!');
            }
            onSaved();
        } catch (err: any) {
            toast.error(err?.response?.data?.message ?? 'Failed to save test');
        } finally {
            setSaving(false);
        }
    };

    const allSelected = available.length > 0 && available.every(q => selectedQIds.includes(q.id));

    return (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm overflow-y-auto">
            <div className="min-h-full flex items-start justify-center p-4 py-8">
                <div className="w-full max-w-5xl bg-slate-950 border border-indigo-500/20 rounded-3xl shadow-2xl">
                    {/* Header */}
                    <div className="flex items-center justify-between p-8 border-b border-indigo-500/10">
                        <div>
                            <h2 className="text-2xl font-black text-white uppercase tracking-tight italic">
                                {isEdit ? 'Edit Test' : 'Create Test'}
                            </h2>
                            <div className="flex gap-4 mt-3">
                                {['Metadata', 'Sections', 'Questions'].map((s, i) => (
                                    <button key={s} onClick={() => setStep(i + 1)}
                                        className={cn("text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-lg transition-all",
                                            step === i + 1 ? "bg-indigo-600 text-white" : step > i + 1 ? "text-emerald-400" : "text-white/20")}>
                                        {step > i + 1 ? '✓ ' : ''}{s}
                                    </button>
                                ))}
                            </div>
                        </div>
                        <button onClick={onClose} className="text-white/20 hover:text-white p-2 transition-all">
                            <X className="h-6 w-6" />
                        </button>
                    </div>

                    <div className="p-8 space-y-8">
                        {/* ── STEP 1: Metadata ── */}
                        {step === 1 && (
                            <div className="space-y-6">
                                <div className="grid grid-cols-2 gap-4">
                                    <Field label="Test Name (EN) *">
                                        <input value={meta.name_en} onChange={e => setMeta({...meta, name_en: e.target.value})}
                                            placeholder="71st BPSC Prelims Mock Test 1" className={inputCls} />
                                    </Field>
                                    <Field label="Test Name (HI)">
                                        <input value={meta.name_hi} onChange={e => setMeta({...meta, name_hi: e.target.value})}
                                            placeholder="71वीं बीपीएससी प्रीलिम्स मॉक टेस्ट 1" className={inputCls} />
                                    </Field>
                                </div>

                                <div className="grid grid-cols-3 gap-4">
                                    <Field label="Exam *">
                                        <select value={meta.exam_id} onChange={e => setMeta({...meta, exam_id: e.target.value})} className={inputCls}>
                                            {exams.map(e => <option key={e.id} value={e.id}>{e.code} — {e.name_en}</option>)}
                                        </select>
                                    </Field>
                                    <Field label="Category *">
                                        <select value={meta.category} onChange={e => setMeta({...meta, category: e.target.value})} className={inputCls}>
                                            {CATEGORIES.map(c => <option key={c} value={c}>{c.replace('_', ' ').toUpperCase()}</option>)}
                                        </select>
                                    </Field>
                                    <Field label="Mode *">
                                        <select value={meta.mode} onChange={e => setMeta({...meta, mode: e.target.value})} className={inputCls}>
                                            {MODES.map(m => <option key={m} value={m}>{m.replace('_', ' ').toUpperCase()}</option>)}
                                        </select>
                                    </Field>
                                </div>

                                <div className="grid grid-cols-4 gap-4">
                                    <Field label="Duration (minutes) *">
                                        <input type="number" value={meta.duration_min} onChange={e => setMeta({...meta, duration_min: e.target.value})}
                                            placeholder="120" className={inputCls} />
                                    </Field>
                                    <Field label="Total Marks *">
                                        <input type="number" value={meta.total_marks} onChange={e => setMeta({...meta, total_marks: e.target.value})}
                                            placeholder="150" className={inputCls} />
                                    </Field>
                                    <Field label="Negative Marking">
                                        <input type="number" step="0.01" value={meta.negative_marking}
                                            onChange={e => setMeta({...meta, negative_marking: e.target.value})}
                                            placeholder="0 or 0.33" className={inputCls} />
                                    </Field>
                                    <Field label="Passing Marks">
                                        <input type="number" value={meta.passing_marks} onChange={e => setMeta({...meta, passing_marks: e.target.value})}
                                            placeholder="60" className={inputCls} />
                                    </Field>
                                </div>

                                <div className="grid grid-cols-3 gap-4">
                                    <Field label="Year (PYQ)">
                                        <input type="number" value={meta.year} onChange={e => setMeta({...meta, year: e.target.value})}
                                            placeholder="2025" className={inputCls} />
                                    </Field>
                                    <Field label="Paper Type">
                                        <input value={meta.paper_type} onChange={e => setMeta({...meta, paper_type: e.target.value})}
                                            placeholder="Paper I / GS-1" className={inputCls} />
                                    </Field>
                                    <Field label="Max Attempts (0=unlimited)">
                                        <input type="number" value={meta.max_attempts} onChange={e => setMeta({...meta, max_attempts: e.target.value})}
                                            placeholder="0" className={inputCls} />
                                    </Field>
                                </div>

                                <div className="flex gap-6">
                                    <Toggle label="Shuffle Questions" checked={meta.shuffle} onChange={v => setMeta({...meta, shuffle: v})} />
                                    <Toggle label="Free Test" checked={meta.is_free} onChange={v => setMeta({...meta, is_free: v})} />
                                    <div className="flex gap-2">
                                        {['draft', 'published'].map(s => (
                                            <button key={s} onClick={() => setMeta({...meta, status: s})}
                                                className={cn("px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all",
                                                    meta.status === s
                                                        ? s === 'published' ? "bg-emerald-600 text-white" : "bg-slate-600 text-white"
                                                        : "text-white/30 bg-white/5 hover:text-white")}>
                                                {s}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <button onClick={() => setStep(2)}
                                    disabled={!meta.name_en || !meta.exam_id}
                                    className="w-full py-4 bg-indigo-600 rounded-2xl text-[11px] font-black text-white uppercase tracking-widest disabled:opacity-40 flex items-center justify-center gap-2 hover:bg-indigo-500 transition-all">
                                    Next: Define Sections <ArrowRight className="h-4 w-4" />
                                </button>
                            </div>
                        )}

                        {/* ── STEP 2: Sections ── */}
                        {step === 2 && (
                            <div className="space-y-6">
                                <div className="flex items-center justify-between">
                                    <p className="text-[10px] font-black text-white/40 uppercase tracking-widest">
                                        Define sections (e.g., General Studies, Reasoning, English). For a simple single-paper exam, keep one section.
                                    </p>
                                    <button onClick={() => setSections(p => [...p, { name_en: '', name_hi: '', duration_min: '', marks_per_q: '1', negative_marks_per_q: '0' }])}
                                        className="flex items-center gap-1.5 text-[9px] font-black text-indigo-400 hover:text-indigo-300 uppercase tracking-widest">
                                        <Plus className="h-3.5 w-3.5" /> Add Section
                                    </button>
                                </div>

                                <div className="space-y-3">
                                    {sections.map((sec, idx) => (
                                        <div key={idx} className="bg-slate-900 border border-indigo-500/10 rounded-2xl p-4 space-y-3">
                                            <div className="flex items-center justify-between">
                                                <span className="text-[9px] font-black text-indigo-400 uppercase tracking-widest">Section {idx + 1}</span>
                                                {sections.length > 1 && (
                                                    <button onClick={() => setSections(p => p.filter((_, i) => i !== idx))}
                                                        className="text-red-400/50 hover:text-red-400 transition-all">
                                                        <X className="h-4 w-4" />
                                                    </button>
                                                )}
                                            </div>
                                            <div className="grid grid-cols-2 gap-3">
                                                <Field label="Section Name (EN)">
                                                    <input value={sec.name_en} onChange={e => setSections(p => p.map((s, i) => i === idx ? {...s, name_en: e.target.value} : s))}
                                                        placeholder="General Studies" className={inputCls} />
                                                </Field>
                                                <Field label="Section Name (HI)">
                                                    <input value={sec.name_hi} onChange={e => setSections(p => p.map((s, i) => i === idx ? {...s, name_hi: e.target.value} : s))}
                                                        placeholder="सामान्य अध्ययन" className={inputCls} />
                                                </Field>
                                            </div>
                                            <div className="grid grid-cols-3 gap-3">
                                                <Field label="Duration (min, blank=test duration)">
                                                    <input type="number" value={sec.duration_min} onChange={e => setSections(p => p.map((s, i) => i === idx ? {...s, duration_min: e.target.value} : s))}
                                                        placeholder="Leave blank" className={inputCls} />
                                                </Field>
                                                <Field label="Marks per Question">
                                                    <input type="number" step="0.5" value={sec.marks_per_q} onChange={e => setSections(p => p.map((s, i) => i === idx ? {...s, marks_per_q: e.target.value} : s))}
                                                        className={inputCls} />
                                                </Field>
                                                <Field label="Neg Marks per Q">
                                                    <input type="number" step="0.01" value={sec.negative_marks_per_q} onChange={e => setSections(p => p.map((s, i) => i === idx ? {...s, negative_marks_per_q: e.target.value} : s))}
                                                        className={inputCls} />
                                                </Field>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                <div className="flex gap-3">
                                    <button onClick={() => setStep(1)} className="flex-1 py-4 bg-white/5 rounded-2xl text-[11px] font-black text-white/50 hover:text-white uppercase tracking-widest transition-all flex items-center justify-center gap-2">
                                        <ArrowLeft className="h-4 w-4" /> Back
                                    </button>
                                    <button onClick={() => setStep(3)} className="flex-1 py-4 bg-indigo-600 rounded-2xl text-[11px] font-black text-white uppercase tracking-widest hover:bg-indigo-500 transition-all flex items-center justify-center gap-2">
                                        Next: Add Questions <ArrowRight className="h-4 w-4" />
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* ── STEP 3: Questions ── */}
                        {step === 3 && (
                            <div className="space-y-5">
                                {/* Auto-assign panel */}
                                <div className="bg-indigo-500/5 border border-indigo-500/20 rounded-2xl p-5 space-y-4">
                                    <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest flex items-center gap-2">
                                        <Zap className="h-3.5 w-3.5" /> Auto-Fill from Question Bank
                                    </p>
                                    <div className="grid grid-cols-4 gap-3">
                                        <Field label="Section">
                                            <select value={autoSection} onChange={e => setAutoSection(parseInt(e.target.value))} className={inputCls}>
                                                {sections.map((s, i) => <option key={i} value={i}>{s.name_en || `Section ${i + 1}`}</option>)}
                                            </select>
                                        </Field>
                                        <Field label="Subject">
                                            <select value={autoSubject} onChange={e => setAutoSubject(e.target.value)} className={inputCls}>
                                                <option value="">All subjects</option>
                                                {subjects.map(s => <option key={s.id} value={s.id}>{s.name_en}</option>)}
                                            </select>
                                        </Field>
                                        <Field label="Count">
                                            <input type="number" value={autoCount} onChange={e => setAutoCount(e.target.value)}
                                                placeholder="30" className={inputCls} />
                                        </Field>
                                        <div className="flex items-end">
                                            <button onClick={handleAutoAssign} disabled={autoLoading}
                                                className="w-full py-3 bg-indigo-600 rounded-xl text-[9px] font-black text-white uppercase tracking-widest disabled:opacity-40 flex items-center justify-center gap-2 hover:bg-indigo-500 transition-all">
                                                {autoLoading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Zap className="h-3.5 w-3.5" />}
                                                Auto Fill
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                {/* Selected count */}
                                <div className="flex items-center justify-between bg-emerald-500/5 border border-emerald-500/20 rounded-xl px-4 py-3">
                                    <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">
                                        {selectedQIds.length} questions selected
                                    </span>
                                    {selectedQIds.length > 0 && (
                                        <button onClick={() => { setSelectedQIds([]); setSectionAssign({}); }}
                                            className="text-[9px] font-black text-white/30 hover:text-red-400 uppercase tracking-widest transition-all">
                                            Clear All
                                        </button>
                                    )}
                                </div>

                                {/* Manual search */}
                                <div className="flex gap-3">
                                    <div className="relative flex-1">
                                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/20" />
                                        <input value={qSearch} onChange={e => setQSearch(e.target.value)}
                                            onKeyDown={e => e.key === 'Enter' && loadQuestions()}
                                            placeholder="Search questions…" className={cn(inputCls, 'pl-9')} />
                                    </div>
                                    <select value={subjectF} onChange={e => setSubjectF(e.target.value)} className={cn(inputCls, 'w-auto')}>
                                        <option value="">All subjects</option>
                                        {subjects.map(s => <option key={s.id} value={s.id}>{s.name_en}</option>)}
                                    </select>
                                    <select value={diffF} onChange={e => setDiffF(e.target.value)} className={cn(inputCls, 'w-auto')}>
                                        <option value="">Any difficulty</option>
                                        <option value="easy">Easy</option>
                                        <option value="medium">Medium</option>
                                        <option value="hard">Hard</option>
                                    </select>
                                    <button onClick={loadQuestions} className="px-4 bg-indigo-600 rounded-xl text-[10px] font-black text-white hover:bg-indigo-500 transition-all">Search</button>
                                </div>

                                {/* Select all */}
                                {available.length > 0 && (
                                    <button onClick={() => {
                                        if (allSelected) {
                                            setSelectedQIds(prev => prev.filter(id => !available.map(q => q.id).includes(id)));
                                        } else {
                                            const newIds = available.map(q => q.id);
                                            setSelectedQIds(prev => [...new Set([...prev, ...newIds])]);
                                            const assign = { ...sectionAssign };
                                            newIds.forEach(id => { if (assign[id] === undefined) assign[id] = 0; });
                                            setSectionAssign(assign);
                                        }
                                    }} className="text-[9px] font-black text-indigo-400 hover:text-indigo-300 uppercase tracking-widest transition-all">
                                        {allSelected ? '✓ Deselect all visible' : `Select all ${available.length} visible`}
                                    </button>
                                )}

                                {/* Question list */}
                                {qLoading ? (
                                    <div className="flex items-center justify-center py-8"><Loader2 className="h-6 w-6 text-indigo-400 animate-spin" /></div>
                                ) : (
                                    <div className="max-h-80 overflow-y-auto space-y-2 pr-1">
                                        {available.map(q => {
                                            const sel = selectedQIds.includes(q.id);
                                            return (
                                                <div key={q.id} onClick={() => toggleQ(q)}
                                                    className={cn("flex items-start gap-3 p-3 rounded-xl cursor-pointer transition-all border",
                                                        sel ? "border-indigo-500/40 bg-indigo-500/5" : "border-white/5 bg-white/2 hover:border-white/10")}>
                                                    <div className={cn("mt-0.5 h-4 w-4 rounded border-2 flex items-center justify-center flex-shrink-0 transition-all",
                                                        sel ? "bg-indigo-600 border-indigo-600" : "border-white/20")}>
                                                        {sel && <Check className="h-2.5 w-2.5 text-white" />}
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-[11px] text-white line-clamp-1">{q.question_en}</p>
                                                        <div className="flex gap-2 mt-1">
                                                            <span className={cn("text-[8px] font-black px-1.5 py-0.5 rounded",
                                                                q.difficulty === 'easy' ? 'bg-emerald-500/20 text-emerald-400' :
                                                                q.difficulty === 'hard' ? 'bg-red-500/20 text-red-400' : 'bg-amber-500/20 text-amber-400')}>
                                                                {q.difficulty}
                                                            </span>
                                                            {q.subject && <span className="text-[8px] text-white/30">{q.subject.name_en}</span>}
                                                        </div>
                                                    </div>
                                                    {/* Section assignment */}
                                                    {sel && sections.length > 1 && (
                                                        <select value={sectionAssign[q.id] ?? 0}
                                                            onClick={e => e.stopPropagation()}
                                                            onChange={e => setSectionAssign(prev => ({...prev, [q.id]: parseInt(e.target.value)}))}
                                                            className="text-[8px] bg-slate-800 border border-indigo-500/20 rounded-lg px-2 py-1 text-white/50 w-32">
                                                            {sections.map((s, i) => <option key={i} value={i}>{s.name_en || `Section ${i + 1}`}</option>)}
                                                        </select>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}

                                {/* Actions */}
                                <div className="flex gap-3 pt-2 border-t border-indigo-500/10">
                                    <button onClick={() => setStep(2)} className="px-6 py-4 bg-white/5 rounded-2xl text-[11px] font-black text-white/50 hover:text-white uppercase tracking-widest transition-all flex items-center gap-2">
                                        <ArrowLeft className="h-4 w-4" /> Back
                                    </button>
                                    <button onClick={handleSave} disabled={saving}
                                        className="flex-1 py-4 bg-indigo-600 rounded-2xl text-[11px] font-black text-white uppercase tracking-widest hover:bg-indigo-500 disabled:opacity-40 transition-all flex items-center justify-center gap-2">
                                        {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
                                        {saving ? 'Saving...' : isEdit ? 'Update Test' : `Save & ${meta.status === 'published' ? 'Publish' : 'Draft'}`}
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

// ─── Tiny helpers ─────────────────────────────────────────────────────────────

const inputCls = "w-full bg-slate-900 border border-indigo-500/10 rounded-xl px-3 py-2.5 text-[11px] text-white placeholder:text-white/20 focus:outline-none focus:ring-1 focus:ring-indigo-500/30";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
    return (
        <div className="space-y-1.5">
            <label className="text-[8px] font-black text-white/30 uppercase tracking-widest block">{label}</label>
            {children}
        </div>
    );
}

function Toggle({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
    return (
        <label className="flex items-center gap-2 cursor-pointer">
            <div onClick={() => onChange(!checked)}
                className={cn("h-4 w-8 rounded-full relative transition-all", checked ? "bg-indigo-600" : "bg-white/10")}>
                <span className={cn("absolute top-0.5 h-3 w-3 rounded-full bg-white shadow transition-all", checked ? "left-4" : "left-0.5")} />
            </div>
            <span className="text-[9px] font-black text-white/40 uppercase tracking-widest">{label}</span>
        </label>
    );
}
