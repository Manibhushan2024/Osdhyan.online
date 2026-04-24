'use client';

import { useState, useEffect } from 'react';
import {
    Search,
    Plus,
    Loader2,
    ChevronRight,
    BookOpen,
    Edit2,
    Trash2,
    Image as ImageIcon,
    CheckCircle2
} from 'lucide-react';
import api from '@/lib/api';
import { cn } from '@/lib/utils';
import { toast } from 'react-hot-toast';

type Option = {
    id?: number;
    option_en: string;
    option_hi: string;
    is_correct: boolean;
    image_path?: string | null;
};

export default function AdminQuestionsPage() {
    const [questions, setQuestions] = useState<any[]>([]);
    const [exams, setExams] = useState<any[]>([]);
    const [subjects, setSubjects] = useState<any[]>([]);
    const [chapters, setChapters] = useState<any[]>([]);
    const [topics, setTopics] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [showWizard, setShowWizard] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [search, setSearch] = useState('');

    const [formData, setFormData] = useState({
        exam_id: '',
        subject_id: '',
        chapter_id: '',
        topic_id: '',
        question_en: '',
        question_hi: '',
        explanation_en: '',
        explanation_hi: '',
        difficulty: 'medium',
        is_published: true,
    });

    const [options, setOptions] = useState<Option[]>([
        { option_en: '', option_hi: '', is_correct: false },
        { option_en: '', option_hi: '', is_correct: false },
        { option_en: '', option_hi: '', is_correct: false },
        { option_en: '', option_hi: '', is_correct: false },
    ]);

    useEffect(() => {
        fetchInitialData();
    }, []);

    useEffect(() => {
        if (formData.exam_id) {
            fetchSubjects(formData.exam_id);
        }
    }, [formData.exam_id]);

    useEffect(() => {
        if (formData.subject_id) {
            fetchChapters(formData.subject_id);
        }
    }, [formData.subject_id]);

    useEffect(() => {
        if (formData.chapter_id) {
            fetchTopics(formData.chapter_id);
        }
    }, [formData.chapter_id]);

    const fetchInitialData = async () => {
        try {
            const examsRes = await api.get('/exams');
            setExams(examsRes.data);
            if (examsRes.data.length > 0) {
                setFormData(prev => ({ ...prev, exam_id: examsRes.data[0].id }));
            }
        } catch (error) {
            console.error('Failed to fetch data', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchSubjects = async (examId: string) => {
        try {
            const res = await api.get(`/exams/${examId}/subjects`);
            setSubjects(res.data);
            if (res.data.length > 0) {
                setFormData(prev => ({ ...prev, subject_id: res.data[0].id }));
            }
        } catch (error) {
            console.error('Failed to fetch subjects', error);
        }
    };

    const fetchChapters = async (subjectId: string) => {
        try {
            const res = await api.get(`/subjects/${subjectId}/chapters`);
            setChapters(res.data);
            if (res.data.length > 0) {
                setFormData(prev => ({ ...prev, chapter_id: res.data[0].id }));
            }
        } catch (error) {
            console.error('Failed to fetch chapters', error);
        }
    };

    const fetchTopics = async (chapterId: string) => {
        try {
            const res = await api.get(`/chapters/${chapterId}/topics`);
            setTopics(res.data);
            if (res.data.length > 0) {
                setFormData(prev => ({ ...prev, topic_id: res.data[0].id }));
            }
        } catch (error) {
            console.error('Failed to fetch topics', error);
        }
    };

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();

        // Validation
        if (!formData.question_en || !formData.question_hi) {
            toast.error('Question text required in both languages');
            return;
        }

        const filledOptions = options.filter(opt => opt.option_en && opt.option_hi);
        if (filledOptions.length < 2) {
            toast.error('At least 2 options required');
            return;
        }

        const correctCount = filledOptions.filter(opt => opt.is_correct).length;
        if (correctCount !== 1) {
            toast.error('Exactly ONE option must be marked as correct');
            return;
        }

        setIsSaving(true);
        try {
            const payload = {
                ...formData,
                options: filledOptions
            };

            await api.post('/admin/questions', payload);
            toast.success('Question Created Successfully!');
            setShowWizard(false);
            resetForm();
        } catch (error: any) {
            const errorMsg = error.response?.data?.message || 'Failed to create question';
            toast.error(errorMsg);
        } finally {
            setIsSaving(false);
        }
    };

    const resetForm = () => {
        setFormData({
            exam_id: exams[0]?.id || '',
            subject_id: '',
            chapter_id: '',
            topic_id: '',
            question_en: '',
            question_hi: '',
            explanation_en: '',
            explanation_hi: '',
            difficulty: 'medium',
            is_published: true,
        });
        setOptions([
            { option_en: '', option_hi: '', is_correct: false },
            { option_en: '', option_hi: '', is_correct: false },
            { option_en: '', option_hi: '', is_correct: false },
            { option_en: '', option_hi: '', is_correct: false },
        ]);
    };

    const toggleCorrectAnswer = (index: number) => {
        setOptions(prev => prev.map((opt, i) => ({
            ...opt,
            is_correct: i === index
        })));
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center py-40 gap-4">
                <Loader2 className="h-10 w-10 text-indigo-600 animate-spin" />
                <p className="text-[10px] font-black text-foreground/40 uppercase tracking-[0.3em]">Loading Intelligence Vectors...</p>
            </div>
        );
    }

    return (
        <div className="space-y-12 pb-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 animate-in fade-in slide-in-from-bottom-4 duration-1000">
            {/* Header */}
            <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8">
                <div className="space-y-4">
                    <div className="flex items-center gap-4 text-[10px] font-black uppercase tracking-[0.2em] text-foreground/40">
                        <span>Intelligence Hub</span>
                        <ChevronRight className="h-3 w-3" />
                        <span className="text-indigo-600">Question Bank</span>
                    </div>
                    <h1 className="text-5xl font-black text-foreground uppercase tracking-tighter italic leading-none">
                        Question <span className="text-indigo-600">Architect</span>
                    </h1>
                    <p className="text-sm text-foreground/40 font-bold uppercase tracking-widest">
                        Create, manage, and deploy intelligent test questions
                    </p>
                </div>

                <button
                    onClick={() => setShowWizard(true)}
                    className="flex items-center gap-3 bg-indigo-600 text-white px-8 py-5 rounded-[2rem] text-[10px] font-black uppercase tracking-widest shadow-2xl shadow-indigo-500/20 hover:scale-[1.02] active:scale-95 transition-all group"
                >
                    <Plus className="h-4 w-4 group-hover:rotate-90 transition-transform" />
                    Create New Question
                </button>
            </div>

            {/* Quick Link to Filament */}
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-1 rounded-[3rem] shadow-2xl shadow-blue-500/20">
                <div className="bg-background rounded-[2.8rem] p-8 flex flex-col lg:flex-row items-center justify-between gap-6">
                    <div className="space-y-2">
                        <h3 className="text-xl font-black text-foreground uppercase tracking-tighter italic">Advanced Question Management</h3>
                        <p className="text-sm font-bold text-foreground/40 uppercase tracking-widest">
                            Use Filament Admin for bulk uploads, advanced filtering, and detailed analytics
                        </p>
                    </div>
                    <button
                        onClick={() => window.open((process.env.NEXT_PUBLIC_SITE_URL ?? '') + '/admin/questions', '_blank')}
                        className="px-10 py-5 bg-indigo-600 text-white rounded-[2rem] font-black text-sm uppercase tracking-[0.3em] shadow-xl hover:scale-105 active:scale-95 transition-all flex items-center gap-4"
                    >
                        Open Filament
                        <ChevronRight className="h-5 w-5" />
                    </button>
                </div>
            </div>

            {/* CREATE WIZARD MODAL */}
            {showWizard && (
                <div className="fixed inset-0 z-50 flex items-start justify-center p-6 bg-black/80 backdrop-blur-md animate-in fade-in duration-300 overflow-y-auto">
                    <div className="w-full max-w-5xl bg-slate-900 border border-indigo-600/20 rounded-[3rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-500 my-12 max-h-[90vh]">
                        <div className="overflow-y-auto max-h-[90vh]">
                            <div className="p-12 space-y-10">
                                {/* Header */}
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h2 className="text-3xl font-black text-white uppercase tracking-tight italic">Question Creation Form</h2>
                                        <p className="text-sm font-black text-indigo-400 uppercase tracking-widest mt-2">Mark the correct answer by toggling ON</p>
                                    </div>
                                    <button onClick={() => setShowWizard(false)} className="text-white/40 hover:text-white transition-colors p-2">
                                        <Plus className="h-6 w-6 rotate-45" />
                                    </button>
                                </div>

                                <form onSubmit={handleCreate} className="space-y-10">
                                    {/* Hierarchy */}
                                    <div className="grid grid-cols-4 gap-6">
                                        <div className="space-y-2">
                                            <label className="text-[9px] font-black text-white/40 uppercase tracking-widest block">Exam</label>
                                            <select
                                                value={formData.exam_id}
                                                onChange={(e) => setFormData({ ...formData, exam_id: e.target.value })}
                                                className="w-full bg-slate-800/50 border border-slate-700 rounded-xl p-3 text-sm font-bold text-white focus:outline-none focus:border-indigo-600/50 transition-all"
                                            >
                                                {exams.map(ex => (
                                                    <option key={ex.id} value={ex.id}>{ex.name_en}</option>
                                                ))}
                                            </select>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[9px] font-black text-white/40 uppercase tracking-widest block">Subject</label>
                                            <select
                                                value={formData.subject_id}
                                                onChange={(e) => setFormData({ ...formData, subject_id: e.target.value })}
                                                className="w-full bg-slate-800/50 border border-slate-700 rounded-xl p-3 text-sm font-bold text-white focus:outline-none focus:border-indigo-600/50 transition-all"
                                            >
                                                {subjects.map(s => (
                                                    <option key={s.id} value={s.id}>{s.name_en}</option>
                                                ))}
                                            </select>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[9px] font-black text-white/40 uppercase tracking-widest block">Chapter</label>
                                            <select
                                                value={formData.chapter_id}
                                                onChange={(e) => setFormData({ ...formData, chapter_id: e.target.value })}
                                                className="w-full bg-slate-800/50 border border-slate-700 rounded-xl p-3 text-sm font-bold text-white focus:outline-none focus:border-indigo-600/50 transition-all"
                                            >
                                                {chapters.map(c => (
                                                    <option key={c.id} value={c.id}>{c.name_en}</option>
                                                ))}
                                            </select>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[9px] font-black text-white/40 uppercase tracking-widest block">Topic</label>
                                            <select
                                                value={formData.topic_id}
                                                onChange={(e) => setFormData({ ...formData, topic_id: e.target.value })}
                                                className="w-full bg-slate-800/50 border border-slate-700 rounded-xl p-3 text-sm font-bold text-white focus:outline-none focus:border-indigo-600/50 transition-all"
                                            >
                                                {topics.map(t => (
                                                    <option key={t.id} value={t.id}>{t.name_en}</option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>

                                    {/* Question (EN) */}
                                    <div className="space-y-2">
                                        <label className="text-[9px] font-black text-white/40 uppercase tracking-widest block">Question (EN)</label>
                                        <textarea
                                            required
                                            value={formData.question_en}
                                            onChange={(e) => setFormData({ ...formData, question_en: e.target.value })}
                                            rows={4}
                                            className="w-full bg-slate-800/50 border border-slate-700 rounded-2xl p-4 text-sm font-medium text-white focus:outline-none focus:border-indigo-600/50 transition-all resize-none"
                                            placeholder="What is the primary function of the mitochondria in a cell?"
                                        />
                                    </div>

                                    {/* Question (HI) */}
                                    <div className="space-y-2">
                                        <label className="text-[9px] font-black text-white/40 uppercase tracking-widest block">Question (HI)</label>
                                        <textarea
                                            required
                                            value={formData.question_hi}
                                            onChange={(e) => setFormData({ ...formData, question_hi: e.target.value })}
                                            rows={4}
                                            className="w-full bg-slate-800/50 border border-slate-700 rounded-2xl p-4 text-sm font-medium text-white focus:outline-none focus:border-indigo-600/50 transition-all resize-none"
                                            placeholder="कोशिका में माइटोकॉन्ड्रिया का प्राथमिक कार्य क्या है?"
                                        />
                                    </div>

                                    {/* Options */}
                                    <div className="space-y-4">
                                        <h3 className="text-sm font-black text-white/60 uppercase tracking-widest">Options</h3>
                                        {options.map((opt, index) => (
                                            <div key={index} className="bg-slate-800/30 border border-slate-700 rounded-2xl p-6 space-y-4">
                                                <div className="flex items-center justify-between">
                                                    <span className="text-[10px] font-black text-white/40 uppercase tracking-widest">Option {index + 1} Text</span>
                                                    <div className="flex items-center gap-3">
                                                        <span className="text-[9px] font-black text-white/40 uppercase tracking-widest">Correct Answer</span>
                                                        <button
                                                            type="button"
                                                            onClick={() => toggleCorrectAnswer(index)}
                                                            className={cn(
                                                                "relative w-14 h-7 rounded-full transition-all duration-300",
                                                                opt.is_correct ? "bg-emerald-500" : "bg-slate-700"
                                                            )}
                                                        >
                                                            <div className={cn(
                                                                "absolute top-1 left-1 w-5 h-5 bg-white rounded-full shadow-lg transition-transform duration-300",
                                                                opt.is_correct && "translate-x-7"
                                                            )} />
                                                        </button>
                                                    </div>
                                                </div>
                                                <div className="grid grid-cols-2 gap-4">
                                                    <input
                                                        type="text"
                                                        value={opt.option_en}
                                                        onChange={(e) => {
                                                            const newOpts = [...options];
                                                            newOpts[index].option_en = e.target.value;
                                                            setOptions(newOpts);
                                                        }}
                                                        className="w-full bg-slate-900/50 border border-slate-700 rounded-xl p-3 text-sm font-medium text-white focus:outline-none focus:border-indigo-600/50 transition-all"
                                                        placeholder={`Option ${index + 1} (English)`}
                                                    />
                                                    <input
                                                        type="text"
                                                        value={opt.option_hi}
                                                        onChange={(e) => {
                                                            const newOpts = [...options];
                                                            newOpts[index].option_hi = e.target.value;
                                                            setOptions(newOpts);
                                                        }}
                                                        className="w-full bg-slate-900/50 border border-slate-700 rounded-xl p-3 text-sm font-medium text-white focus:outline-none focus:border-indigo-600/50 transition-all"
                                                        placeholder={`विकल्प ${index + 1} (हिंदी)`}
                                                    />
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    {/* Explanation */}
                                    <div className="space-y-4">
                                        <h3 className="text-sm font-black text-white/60 uppercase tracking-widest">Explanation</h3>
                                        <div className="grid grid-cols-2 gap-6">
                                            <div className="space-y-2">
                                                <label className="text-[9px] font-black text-white/40 uppercase tracking-widest block">Explanation (EN)</label>
                                                <textarea
                                                    value={formData.explanation_en}
                                                    onChange={(e) => setFormData({ ...formData, explanation_en: e.target.value })}
                                                    rows={5}
                                                    className="w-full bg-slate-800/50 border border-slate-700 rounded-2xl p-4 text-sm font-medium text-white focus:outline-none focus:border-indigo-600/50 transition-all resize-none"
                                                    placeholder="Provide a detailed explanation for the correct answer..."
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-[9px] font-black text-white/40 uppercase tracking-widest block">Explanation (HI)</label>
                                                <textarea
                                                    value={formData.explanation_hi}
                                                    onChange={(e) => setFormData({ ...formData, explanation_hi: e.target.value })}
                                                    rows={5}
                                                    className="w-full bg-slate-800/50 border border-slate-700 rounded-2xl p-4 text-sm font-medium text-white focus:outline-none focus:border-indigo-600/50 transition-all resize-none"
                                                    placeholder="सही उत्तर के लिए विस्तृत व्याख्या प्रदान करें..."
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Difficulty */}
                                    <div className="grid grid-cols-3 gap-6">
                                        {['easy', 'medium', 'hard'].map(level => (
                                            <button
                                                key={level}
                                                type="button"
                                                onClick={() => setFormData({ ...formData, difficulty: level })}
                                                className={cn(
                                                    "py-4 rounded-2xl font-black text-sm uppercase tracking-widest transition-all border-2",
                                                    formData.difficulty === level
                                                        ? "bg-indigo-600 border-indigo-600 text-white shadow-xl shadow-indigo-500/20"
                                                        : "border-slate-700 text-white/40 hover:border-indigo-600/30"
                                                )}
                                            >
                                                {level}
                                            </button>
                                        ))}
                                    </div>

                                    {/* Submit */}
                                    <button
                                        disabled={isSaving}
                                        type="submit"
                                        className="w-full bg-indigo-600 text-white py-6 rounded-[2rem] text-sm font-black uppercase tracking-[0.2em] shadow-2xl shadow-indigo-600/20 active:scale-95 transition-all flex items-center justify-center gap-4 disabled:bg-indigo-600/50"
                                    >
                                        {isSaving ? <Loader2 className="h-5 w-5 animate-spin" /> : <CheckCircle2 className="h-5 w-5" />}
                                        {isSaving ? 'Creating...' : 'Create Question'}
                                    </button>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
