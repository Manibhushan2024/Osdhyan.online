'use client';

import { useState, useRef } from 'react';
import api from '@/lib/api';
import {
    Upload, Download, FileText, CheckCircle2, AlertCircle,
    Loader2, X, ChevronDown, ChevronRight, BookOpen, HelpCircle,
    Table2, Info
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'react-hot-toast';

type TabType = 'questions' | 'syllabus' | 'tests';
type DryRunResult = {
    dry_run: boolean;
    message: string;
    total_rows?: number;
    created: number;
    skipped?: number;
    error_count?: number;
    errors: string[];
    details?: { created: string[]; skipped: string[]; errors: string[] };
    sample_questions?: any[];
    // Test-specific fields
    test_name?: string;
    exam_code?: string;
    sections_count?: number;
    question_count?: number;
    test_id?: number;
    status?: string;
    sections_preview?: { name: string; question_count: number; sample_ids: number[] }[];
};

export default function AdminBulkImportPage() {
    const [tab, setTab] = useState<TabType>('questions');

    // Questions import state
    const [qFile, setQFile] = useState<File | null>(null);
    const [qExamCode, setQExamCode] = useState('');
    const [qPublished, setQPublished] = useState(false);
    const [qDryRun, setQDryRun] = useState(true);
    const [qLoading, setQLoading] = useState(false);
    const [qResult, setQResult] = useState<DryRunResult | null>(null);
    const qFileRef = useRef<HTMLInputElement>(null);

    // Syllabus import state
    const [sFile, setSFile] = useState<File | null>(null);
    const [sDryRun, setSDryRun] = useState(true);
    const [sLoading, setSLoading] = useState(false);
    const [sResult, setSResult] = useState<DryRunResult | null>(null);
    const sFileRef = useRef<HTMLInputElement>(null);

    // Tests import state
    const [tFile, setTFile] = useState<File | null>(null);
    const [tDryRun, setTDryRun] = useState(true);
    const [tLoading, setTLoading] = useState(false);
    const [tResult, setTResult] = useState<DryRunResult | null>(null);
    const tFileRef = useRef<HTMLInputElement>(null);

    // Download template
    const downloadTemplate = async (type: 'questions' | 'syllabus' | 'tests') => {
        try {
            const res = await api.get(`/admin/bulk-import/template/${type}`, { responseType: 'blob' });
            const url = URL.createObjectURL(res.data);
            const a = document.createElement('a');
            a.href = url;
            a.download = `${type}_template.csv`;
            a.click();
            URL.revokeObjectURL(url);
        } catch {
            toast.error('Failed to download template');
        }
    };

    // Submit questions import
    const submitQuestions = async () => {
        if (!qFile) { toast.error('Select a CSV file first'); return; }
        setQLoading(true);
        setQResult(null);
        try {
            const form = new FormData();
            form.append('file', qFile);
            if (qExamCode.trim()) form.append('exam_code', qExamCode.trim().toUpperCase());
            form.append('dry_run', qDryRun ? '1' : '0');
            form.append('is_published', qPublished ? '1' : '0');
            const res = await api.post('/admin/bulk-import/questions', form, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            setQResult(res.data);
            if (!qDryRun && res.data.created > 0) toast.success(`${res.data.created} questions imported!`);
        } catch (err: any) {
            toast.error(err?.response?.data?.message ?? 'Import failed');
        } finally {
            setQLoading(false);
        }
    };

    // Submit tests import
    const submitTests = async () => {
        if (!tFile) { toast.error('Select a CSV file first'); return; }
        setTLoading(true);
        setTResult(null);
        try {
            const form = new FormData();
            form.append('file', tFile);
            form.append('dry_run', tDryRun ? '1' : '0');
            const res = await api.post('/admin/bulk-import/tests', form, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            setTResult(res.data);
            if (!tDryRun && res.data.test_id) toast.success(`Test "${res.data.test_name}" created!`);
        } catch (err: any) {
            toast.error(err?.response?.data?.message ?? 'Import failed');
        } finally {
            setTLoading(false);
        }
    };

    // Submit syllabus import
    const submitSyllabus = async () => {
        if (!sFile) { toast.error('Select a CSV file first'); return; }
        setSLoading(true);
        setSResult(null);
        try {
            const form = new FormData();
            form.append('file', sFile);
            form.append('dry_run', sDryRun ? '1' : '0');
            const res = await api.post('/admin/bulk-import/syllabus', form, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            setSResult(res.data);
            if (!sDryRun && res.data.created > 0) toast.success(`${res.data.created} items imported!`);
        } catch (err: any) {
            toast.error(err?.response?.data?.message ?? 'Import failed');
        } finally {
            setSLoading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-8 pb-16">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-black text-white tracking-tight italic uppercase">Bulk Import</h1>
                <p className="text-white/40 mt-1 font-bold text-sm">Upload hundreds of questions or syllabus entries via CSV in one go.</p>
            </div>

            {/* Tabs */}
            <div className="flex gap-1 p-1.5 bg-slate-900 border border-indigo-500/10 rounded-2xl w-fit">
                {([
                    { key: 'questions', label: '📝 Questions' },
                    { key: 'syllabus',  label: '📚 Syllabus' },
                    { key: 'tests',     label: '🎯 Tests' },
                ] as { key: TabType; label: string }[]).map(({ key, label }) => (
                    <button
                        key={key}
                        onClick={() => setTab(key)}
                        className={cn(
                            "px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                            tab === key ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/20" : "text-white/30 hover:text-white"
                        )}
                    >
                        {label}
                    </button>
                ))}
            </div>

            {/* ── Questions Import ── */}
            {tab === 'questions' && (
                <div className="space-y-6">
                    {/* CSV format info */}
                    <div className="bg-indigo-500/5 border border-indigo-500/20 rounded-2xl p-5 space-y-3">
                        <div className="flex items-center gap-2">
                            <Info className="h-4 w-4 text-indigo-400 shrink-0" />
                            <p className="text-[11px] font-black text-indigo-400 uppercase tracking-widest">CSV Column Reference</p>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                            {[
                                { col: 'question_en', req: true, desc: 'Question text (English)' },
                                { col: 'option_a … option_e', req: true, desc: 'Answer options (at least A & B)' },
                                { col: 'correct_option', req: true, desc: 'Correct answer: A/B/C/D/E or 1/2/3/4/5' },
                                { col: 'exam_code', req: false, desc: 'Exam code (or set globally below)' },
                                { col: 'subject_name_en', req: true, desc: 'Subject name — auto-created if missing' },
                                { col: 'chapter_name_en', req: false, desc: 'Chapter — auto-created if missing' },
                                { col: 'topic_name_en', req: false, desc: 'Topic — auto-created if missing' },
                                { col: 'explanation_en', req: false, desc: 'Answer explanation' },
                                { col: 'difficulty', req: false, desc: 'easy / medium / hard (default: medium)' },
                                { col: 'question_hi', req: false, desc: 'Hindi question (falls back to English)' },
                            ].map(({ col, req, desc }) => (
                                <div key={col} className="flex items-start gap-2">
                                    <code className={cn("text-[9px] font-black px-1.5 py-0.5 rounded shrink-0", req ? "bg-indigo-500/20 text-indigo-400" : "bg-white/5 text-white/30")}>{col}</code>
                                    <span className="text-[9px] text-white/40">{desc}{req ? ' *' : ''}</span>
                                </div>
                            ))}
                        </div>
                        <button
                            onClick={() => downloadTemplate('questions')}
                            className="flex items-center gap-2 text-[10px] font-black text-indigo-400 hover:text-indigo-300 uppercase tracking-widest transition-all"
                        >
                            <Download className="h-3.5 w-3.5" /> Download Template CSV
                        </button>
                    </div>

                    {/* Form */}
                    <div className="bg-slate-900 border border-indigo-500/10 rounded-3xl p-8 space-y-6">
                        {/* File upload */}
                        <div>
                            <label className="text-[10px] font-black text-white/40 uppercase tracking-widest mb-3 block">CSV File *</label>
                            <div
                                onClick={() => qFileRef.current?.click()}
                                className={cn(
                                    "cursor-pointer border-2 border-dashed rounded-2xl p-8 flex flex-col items-center gap-3 transition-all",
                                    qFile ? "border-indigo-500/40 bg-indigo-500/5" : "border-indigo-500/10 hover:border-indigo-500/30"
                                )}
                            >
                                {qFile ? (
                                    <>
                                        <FileText className="h-8 w-8 text-indigo-400" />
                                        <p className="text-[11px] font-black text-indigo-400">{qFile.name}</p>
                                        <p className="text-[9px] text-white/20">{(qFile.size / 1024).toFixed(1)} KB — click to change</p>
                                    </>
                                ) : (
                                    <>
                                        <Upload className="h-8 w-8 text-white/20" />
                                        <p className="text-[11px] font-black text-white/30">Click to select CSV file</p>
                                        <p className="text-[9px] text-white/20">Max 50 MB</p>
                                    </>
                                )}
                            </div>
                            <input ref={qFileRef} type="file" accept=".csv,.txt" className="hidden" onChange={e => setQFile(e.target.files?.[0] ?? null)} />
                        </div>

                        {/* Options row */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="text-[10px] font-black text-white/40 uppercase tracking-widest mb-2 block">Default Exam Code</label>
                                <input
                                    type="text"
                                    placeholder="e.g. BPSC_71 (optional if in CSV)"
                                    value={qExamCode}
                                    onChange={e => setQExamCode(e.target.value)}
                                    className="w-full bg-slate-950 border border-indigo-500/20 rounded-2xl px-4 py-3 text-[12px] font-black text-white placeholder:text-white/20 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 uppercase"
                                />
                            </div>
                            <div className="flex flex-col gap-3 pt-2">
                                <label className="flex items-center gap-3 cursor-pointer">
                                    <div
                                        onClick={() => setQDryRun(p => !p)}
                                        className={cn(
                                            "h-5 w-9 rounded-full transition-all relative",
                                            qDryRun ? "bg-indigo-600" : "bg-white/10"
                                        )}
                                    >
                                        <span className={cn("absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-all", qDryRun ? "left-4" : "left-0.5")} />
                                    </div>
                                    <span className="text-[10px] font-black text-white/50 uppercase tracking-widest">Dry Run (preview only)</span>
                                </label>
                                <label className="flex items-center gap-3 cursor-pointer">
                                    <div
                                        onClick={() => setQPublished(p => !p)}
                                        className={cn(
                                            "h-5 w-9 rounded-full transition-all relative",
                                            qPublished ? "bg-emerald-600" : "bg-white/10"
                                        )}
                                    >
                                        <span className={cn("absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-all", qPublished ? "left-4" : "left-0.5")} />
                                    </div>
                                    <span className="text-[10px] font-black text-white/50 uppercase tracking-widest">Publish questions immediately</span>
                                </label>
                            </div>
                        </div>

                        <button
                            onClick={submitQuestions}
                            disabled={qLoading || !qFile}
                            className="w-full py-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl font-black text-[11px] uppercase tracking-widest shadow-lg shadow-indigo-600/20 transition-all disabled:opacity-40 flex items-center justify-center gap-2"
                        >
                            {qLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                            {qLoading ? 'Processing...' : qDryRun ? 'Run Preview (Dry Run)' : 'Import Questions'}
                        </button>
                    </div>

                    {/* Result */}
                    {qResult && <ImportResult result={qResult} type="questions" />}
                </div>
            )}

            {/* ── Syllabus Import ── */}
            {tab === 'syllabus' && (
                <div className="space-y-6">
                    {/* CSV format info */}
                    <div className="bg-purple-500/5 border border-purple-500/20 rounded-2xl p-5 space-y-3">
                        <div className="flex items-center gap-2">
                            <Info className="h-4 w-4 text-purple-400 shrink-0" />
                            <p className="text-[11px] font-black text-purple-400 uppercase tracking-widest">CSV Column Reference</p>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                            {[
                                { col: 'type', req: true, desc: 'subject / chapter / topic' },
                                { col: 'exam_code', req: true, desc: 'Exam code (must exist in DB)' },
                                { col: 'name_en', req: true, desc: 'Name in English' },
                                { col: 'name_hi', req: false, desc: 'Name in Hindi (optional)' },
                                { col: 'code', req: false, desc: 'Short code — auto-generated if blank' },
                                { col: 'category', req: false, desc: 'For subjects: core / optional etc.' },
                                { col: 'sort_order', req: false, desc: 'Display order number' },
                                { col: 'parent_name_en', req: false, desc: 'Parent subject/chapter name' },
                            ].map(({ col, req, desc }) => (
                                <div key={col} className="flex items-start gap-2">
                                    <code className={cn("text-[9px] font-black px-1.5 py-0.5 rounded shrink-0", req ? "bg-purple-500/20 text-purple-400" : "bg-white/5 text-white/30")}>{col}</code>
                                    <span className="text-[9px] text-white/40">{desc}{req ? ' *' : ''}</span>
                                </div>
                            ))}
                        </div>
                        <button
                            onClick={() => downloadTemplate('syllabus')}
                            className="flex items-center gap-2 text-[10px] font-black text-purple-400 hover:text-purple-300 uppercase tracking-widest transition-all"
                        >
                            <Download className="h-3.5 w-3.5" /> Download Template CSV
                        </button>
                    </div>

                    {/* Form */}
                    <div className="bg-slate-900 border border-indigo-500/10 rounded-3xl p-8 space-y-6">
                        <div>
                            <label className="text-[10px] font-black text-white/40 uppercase tracking-widest mb-3 block">CSV File *</label>
                            <div
                                onClick={() => sFileRef.current?.click()}
                                className={cn(
                                    "cursor-pointer border-2 border-dashed rounded-2xl p-8 flex flex-col items-center gap-3 transition-all",
                                    sFile ? "border-purple-500/40 bg-purple-500/5" : "border-indigo-500/10 hover:border-indigo-500/30"
                                )}
                            >
                                {sFile ? (
                                    <>
                                        <FileText className="h-8 w-8 text-purple-400" />
                                        <p className="text-[11px] font-black text-purple-400">{sFile.name}</p>
                                        <p className="text-[9px] text-white/20">{(sFile.size / 1024).toFixed(1)} KB — click to change</p>
                                    </>
                                ) : (
                                    <>
                                        <Upload className="h-8 w-8 text-white/20" />
                                        <p className="text-[11px] font-black text-white/30">Click to select CSV file</p>
                                        <p className="text-[9px] text-white/20">Max 10 MB</p>
                                    </>
                                )}
                            </div>
                            <input ref={sFileRef} type="file" accept=".csv,.txt" className="hidden" onChange={e => setSFile(e.target.files?.[0] ?? null)} />
                        </div>

                        <label className="flex items-center gap-3 cursor-pointer">
                            <div
                                onClick={() => setSDryRun(p => !p)}
                                className={cn(
                                    "h-5 w-9 rounded-full transition-all relative",
                                    sDryRun ? "bg-purple-600" : "bg-white/10"
                                )}
                            >
                                <span className={cn("absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-all", sDryRun ? "left-4" : "left-0.5")} />
                            </div>
                            <span className="text-[10px] font-black text-white/50 uppercase tracking-widest">Dry Run (preview only)</span>
                        </label>

                        <button
                            onClick={submitSyllabus}
                            disabled={sLoading || !sFile}
                            className="w-full py-4 bg-purple-600 hover:bg-purple-500 text-white rounded-2xl font-black text-[11px] uppercase tracking-widest shadow-lg shadow-purple-600/20 transition-all disabled:opacity-40 flex items-center justify-center gap-2"
                        >
                            {sLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                            {sLoading ? 'Processing...' : sDryRun ? 'Run Preview (Dry Run)' : 'Import Syllabus'}
                        </button>
                    </div>

                    {/* Result */}
                    {sResult && <ImportResult result={sResult} type="syllabus" />}
                </div>
            )}

            {/* ── Tests Import ── */}
            {tab === 'tests' && (
                <div className="space-y-6">
                    {/* CSV format info */}
                    <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-2xl p-5 space-y-3">
                        <div className="flex items-center gap-2">
                            <Info className="h-4 w-4 text-emerald-400 shrink-0" />
                            <p className="text-[11px] font-black text-emerald-400 uppercase tracking-widest">Test CSV Format</p>
                        </div>
                        <div className="space-y-2 text-[9px] text-white/40">
                            <p>Each row has a <code className="bg-white/10 px-1 rounded text-white/60">type</code> column that determines its meaning:</p>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-2">
                                {[
                                    { type: 'TEST', desc: 'One row defining test metadata (name, exam, duration, marks, etc.)' },
                                    { type: 'SECTION', desc: 'Defines a section within the test (name, marks per Q, neg marks)' },
                                    { type: 'CRITERIA', desc: 'Auto-pick N questions from the bank (subject, chapter, count, difficulty)' },
                                    { type: 'Q_IDS', desc: 'Assign specific question IDs (comma-separated in the ids column)' },
                                ].map(({ type, desc }) => (
                                    <div key={type} className="flex items-start gap-2">
                                        <code className="text-[9px] font-black px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 shrink-0">{type}</code>
                                        <span>{desc}</span>
                                    </div>
                                ))}
                            </div>
                            <p className="mt-2 text-white/30">The exam must already exist in the system. Questions are auto-picked using CRITERIA rows from the imported question bank.</p>
                        </div>
                        <button
                            onClick={() => downloadTemplate('tests')}
                            className="flex items-center gap-2 text-[10px] font-black text-emerald-400 hover:text-emerald-300 uppercase tracking-widest transition-all"
                        >
                            <Download className="h-3.5 w-3.5" /> Download Test Template CSV (with BPSC + SSC examples)
                        </button>
                    </div>

                    {/* Form */}
                    <div className="bg-slate-900 border border-indigo-500/10 rounded-3xl p-8 space-y-6">
                        <div>
                            <label className="text-[10px] font-black text-white/40 uppercase tracking-widest mb-3 block">CSV File *</label>
                            <div
                                onClick={() => tFileRef.current?.click()}
                                className={cn(
                                    "cursor-pointer border-2 border-dashed rounded-2xl p-8 flex flex-col items-center gap-3 transition-all",
                                    tFile ? "border-emerald-500/40 bg-emerald-500/5" : "border-indigo-500/10 hover:border-indigo-500/30"
                                )}
                            >
                                {tFile ? (
                                    <>
                                        <FileText className="h-8 w-8 text-emerald-400" />
                                        <p className="text-[11px] font-black text-emerald-400">{tFile.name}</p>
                                        <p className="text-[9px] text-white/20">{(tFile.size / 1024).toFixed(1)} KB — click to change</p>
                                    </>
                                ) : (
                                    <>
                                        <Upload className="h-8 w-8 text-white/20" />
                                        <p className="text-[11px] font-black text-white/30">Click to select Test CSV file</p>
                                        <p className="text-[9px] text-white/20">Max 10 MB</p>
                                    </>
                                )}
                            </div>
                            <input ref={tFileRef} type="file" accept=".csv,.txt" className="hidden" onChange={e => setTFile(e.target.files?.[0] ?? null)} />
                        </div>

                        <label className="flex items-center gap-3 cursor-pointer">
                            <div
                                onClick={() => setTDryRun(p => !p)}
                                className={cn("h-5 w-9 rounded-full transition-all relative", tDryRun ? "bg-emerald-600" : "bg-white/10")}
                            >
                                <span className={cn("absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-all", tDryRun ? "left-4" : "left-0.5")} />
                            </div>
                            <span className="text-[10px] font-black text-white/50 uppercase tracking-widest">Dry Run (preview only)</span>
                        </label>

                        <button
                            onClick={submitTests}
                            disabled={tLoading || !tFile}
                            className="w-full py-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl font-black text-[11px] uppercase tracking-widest shadow-lg shadow-emerald-600/20 transition-all disabled:opacity-40 flex items-center justify-center gap-2"
                        >
                            {tLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                            {tLoading ? 'Processing...' : tDryRun ? 'Preview Test Import' : 'Create Test'}
                        </button>
                    </div>

                    {/* Result */}
                    {tResult && <TestImportResult result={tResult} />}
                </div>
            )}
        </div>
    );
}

// ── Result Panel Component ──────────────────────────────────────────────────────

function ImportResult({ result, type }: { result: DryRunResult; type: 'questions' | 'syllabus' }) {
    const [showErrors, setShowErrors] = useState(false);
    const [showDetails, setShowDetails] = useState(false);
    const [showSamples, setShowSamples] = useState(false);
    const success = result.error_count === 0 || (result.created > 0 && (result.error_count ?? 0) < result.created);
    const color = result.dry_run ? 'indigo' : success ? 'green' : 'red';

    return (
        <div className={cn(
            "border rounded-3xl p-6 space-y-4",
            color === 'indigo' ? "bg-indigo-500/5 border-indigo-500/20" :
            color === 'green' ? "bg-emerald-500/5 border-emerald-500/20" :
            "bg-red-500/5 border-red-500/20"
        )}>
            {/* Summary */}
            <div className="flex items-start gap-3">
                {result.dry_run
                    ? <Info className="h-5 w-5 text-indigo-400 shrink-0 mt-0.5" />
                    : success
                        ? <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0 mt-0.5" />
                        : <AlertCircle className="h-5 w-5 text-red-500 shrink-0 mt-0.5" />
                }
                <div>
                    <p className={cn("text-[11px] font-black uppercase tracking-widest",
                        color === 'indigo' ? "text-indigo-400" : color === 'green' ? "text-emerald-500" : "text-red-500"
                    )}>
                        {result.dry_run ? 'DRY RUN PREVIEW' : 'IMPORT RESULT'}
                    </p>
                    <p className="text-sm text-white/60 mt-1">{result.message}</p>
                </div>
            </div>

            {/* Stats */}
            <div className="flex flex-wrap gap-3">
                {result.total_rows !== undefined && (
                    <Stat label="Total Rows" value={result.total_rows} color="white" />
                )}
                <Stat label={result.dry_run ? 'Would Import' : 'Imported'} value={result.created} color="green" />
                {result.skipped !== undefined && result.skipped > 0 && (
                    <Stat label="Skipped (exist)" value={result.skipped} color="amber" />
                )}
                {(result.error_count ?? result.errors.length) > 0 && (
                    <Stat label="Errors" value={result.error_count ?? result.errors.length} color="red" />
                )}
            </div>

            {/* Errors */}
            {result.errors.length > 0 && (
                <div>
                    <button onClick={() => setShowErrors(p => !p)} className="flex items-center gap-2 text-[10px] font-black text-red-400 uppercase tracking-widest">
                        {showErrors ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
                        {result.errors.length} Error{result.errors.length !== 1 ? 's' : ''}
                    </button>
                    {showErrors && (
                        <ul className="mt-2 space-y-1 max-h-48 overflow-y-auto">
                            {result.errors.map((e, i) => (
                                <li key={i} className="flex items-start gap-2 text-[10px] text-red-400">
                                    <AlertCircle className="h-3 w-3 shrink-0 mt-0.5" />
                                    {e}
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            )}

            {/* Syllabus details (created/skipped breakdown) */}
            {result.details && (result.details.created.length > 0 || result.details.skipped.length > 0) && (
                <div>
                    <button onClick={() => setShowDetails(p => !p)} className="flex items-center gap-2 text-[10px] font-black text-white/30 uppercase tracking-widest">
                        {showDetails ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
                        View Row Details
                    </button>
                    {showDetails && (
                        <div className="mt-2 space-y-1 max-h-48 overflow-y-auto">
                            {result.details.created.map((m, i) => (
                                <p key={i} className="text-[9px] text-emerald-500">✓ {m}</p>
                            ))}
                            {result.details.skipped.map((m, i) => (
                                <p key={i} className="text-[9px] text-white/20">— {m}</p>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* Sample questions preview */}
            {result.sample_questions && result.sample_questions.length > 0 && (
                <div>
                    <button onClick={() => setShowSamples(p => !p)} className="flex items-center gap-2 text-[10px] font-black text-white/30 uppercase tracking-widest">
                        {showSamples ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
                        Preview Sample Questions ({result.sample_questions.length})
                    </button>
                    {showSamples && (
                        <div className="mt-3 space-y-4">
                            {result.sample_questions.map((q: any, i: number) => (
                                <div key={i} className="bg-slate-950/60 border border-indigo-500/10 rounded-2xl p-4 space-y-2">
                                    <p className="text-[11px] font-black text-white">{i + 1}. {q.question_en}</p>
                                    <div className="grid grid-cols-2 gap-1">
                                        {(q.options ?? []).map((o: any, j: number) => (
                                            <div key={j} className={cn("flex items-center gap-1.5 px-2 py-1 rounded-lg text-[9px]",
                                                o.is_correct ? "bg-emerald-500/10 text-emerald-500 font-black" : "text-white/30"
                                            )}>
                                                {o.is_correct ? '✓' : String.fromCharCode(65 + j) + '.'} {o.text}
                                            </div>
                                        ))}
                                    </div>
                                    <div className="flex flex-wrap gap-2 pt-1">
                                        {q.exam && <Tag label="Exam" value={q.exam} />}
                                        {q.subject && <Tag label="Subject" value={q.subject} />}
                                        {q.chapter && <Tag label="Chapter" value={q.chapter} />}
                                        {q.topic && <Tag label="Topic" value={q.topic} />}
                                        <Tag label="Difficulty" value={q.difficulty} />
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* Confirm CTA for dry-run */}
            {result.dry_run && result.created > 0 && (
                <div className="pt-2 border-t border-indigo-500/10">
                    <p className="text-[10px] text-white/30 font-bold">
                        Satisfied with the preview? Turn off <strong className="text-white/50">Dry Run</strong> above and re-submit to save to the database.
                    </p>
                </div>
            )}
        </div>
    );
}

function Stat({ label, value, color }: { label: string; value: number; color: string }) {
    const cls = color === 'green' ? 'text-emerald-500' : color === 'red' ? 'text-red-500' : color === 'amber' ? 'text-amber-500' : 'text-white';
    return (
        <div className="bg-slate-950 border border-indigo-500/10 rounded-2xl px-4 py-2 text-center min-w-[70px]">
            <p className={cn("text-xl font-black", cls)}>{value}</p>
            <p className="text-[8px] font-black text-white/20 uppercase tracking-widest">{label}</p>
        </div>
    );
}

function Tag({ label, value }: { label: string; value: string }) {
    return (
        <span className="text-[8px] font-black uppercase tracking-widest text-white/20 bg-white/5 px-2 py-0.5 rounded-lg">
            {label}: {value}
        </span>
    );
}

// ── Test Import Result Component ────────────────────────────────────────────

function TestImportResult({ result }: { result: DryRunResult }) {
    const [showErrors, setShowErrors] = useState(false);
    const success = (result.error_count ?? 0) === 0;
    const color = result.dry_run ? 'indigo' : success ? 'green' : 'amber';

    return (
        <div className={cn("border rounded-3xl p-6 space-y-4",
            color === 'indigo' ? "bg-indigo-500/5 border-indigo-500/20" :
            color === 'green'  ? "bg-emerald-500/5 border-emerald-500/20" :
                                 "bg-amber-500/5 border-amber-500/20"
        )}>
            <div className="flex items-start gap-3">
                {result.dry_run
                    ? <Info className="h-5 w-5 text-indigo-400 shrink-0 mt-0.5" />
                    : success
                        ? <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0 mt-0.5" />
                        : <AlertCircle className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
                }
                <div>
                    <p className={cn("text-[11px] font-black uppercase tracking-widest",
                        color === 'indigo' ? "text-indigo-400" : color === 'green' ? "text-emerald-500" : "text-amber-500")}>
                        {result.dry_run ? 'DRY RUN PREVIEW' : 'TEST CREATED'}
                    </p>
                    <p className="text-sm text-white/60 mt-1">{result.message}</p>
                </div>
            </div>

            {/* Test summary stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {result.test_name && (
                    <div className="col-span-2 bg-slate-950 border border-indigo-500/10 rounded-2xl px-4 py-3">
                        <p className="text-[8px] font-black text-white/20 uppercase tracking-widest">Test Name</p>
                        <p className="text-[12px] font-black text-white mt-1">{result.test_name}</p>
                    </div>
                )}
                {result.exam_code && (
                    <div className="bg-slate-950 border border-indigo-500/10 rounded-2xl px-4 py-3">
                        <p className="text-[8px] font-black text-white/20 uppercase tracking-widest">Exam</p>
                        <p className="text-lg font-black text-indigo-400 mt-1">{result.exam_code}</p>
                    </div>
                )}
                {result.question_count !== undefined && (
                    <div className="bg-slate-950 border border-indigo-500/10 rounded-2xl px-4 py-3">
                        <p className="text-[8px] font-black text-white/20 uppercase tracking-widest">Questions</p>
                        <p className="text-lg font-black text-emerald-500 mt-1">{result.question_count}</p>
                    </div>
                )}
                {result.sections_count !== undefined && (
                    <div className="bg-slate-950 border border-indigo-500/10 rounded-2xl px-4 py-3">
                        <p className="text-[8px] font-black text-white/20 uppercase tracking-widest">Sections</p>
                        <p className="text-lg font-black text-white mt-1">{result.sections_count}</p>
                    </div>
                )}
            </div>

            {/* Sections breakdown */}
            {result.sections_preview && result.sections_preview.length > 0 && (
                <div className="space-y-2">
                    <p className="text-[9px] font-black text-white/30 uppercase tracking-widest">Sections Preview</p>
                    {result.sections_preview.map((s, i) => (
                        <div key={i} className="flex items-center justify-between bg-slate-950/60 border border-white/5 rounded-xl px-4 py-2.5">
                            <span className="text-[11px] font-black text-white">{s.name}</span>
                            <span className="text-[9px] font-black text-emerald-400">{s.question_count} questions</span>
                        </div>
                    ))}
                </div>
            )}

            {/* Errors */}
            {result.errors && result.errors.length > 0 && (
                <div>
                    <button onClick={() => setShowErrors(p => !p)} className="flex items-center gap-2 text-[10px] font-black text-amber-400 uppercase tracking-widest">
                        {showErrors ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
                        {result.errors.length} Warning{result.errors.length !== 1 ? 's' : ''}
                    </button>
                    {showErrors && (
                        <ul className="mt-2 space-y-1 max-h-40 overflow-y-auto">
                            {result.errors.map((e, i) => (
                                <li key={i} className="flex items-start gap-2 text-[10px] text-amber-400/70">
                                    <AlertCircle className="h-3 w-3 shrink-0 mt-0.5" />{e}
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            )}

            {/* Next steps */}
            {result.dry_run && result.question_count && result.question_count > 0 && (
                <div className="pt-2 border-t border-indigo-500/10">
                    <p className="text-[10px] text-white/30 font-bold">
                        Preview looks good? Turn off <strong className="text-white/50">Dry Run</strong> and re-upload to create the test live.
                    </p>
                </div>
            )}
            {!result.dry_run && result.test_id && (
                <div className="pt-2 border-t border-emerald-500/10">
                    <p className="text-[10px] text-emerald-400 font-bold">
                        ✓ Test ID {result.test_id} is now {result.status}. Students can find it at /dashboard/tests.
                    </p>
                </div>
            )}
        </div>
    );
}
