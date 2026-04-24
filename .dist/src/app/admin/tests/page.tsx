'use client';

import { useState, useEffect } from 'react';
import {
    Plus,
    Loader2,
    ChevronRight,
    Search,
    Check,
    X,
    ArrowLeft,
    ArrowRight,
    Rocket,
    BookOpen,
    CheckCircle2,
    Clock,
    Target
} from 'lucide-react';
import api from '@/lib/api';
import { cn } from '@/lib/utils';
import { toast } from 'react-hot-toast';

type TestMode = 'chapter' | 'subject' | 'full_mock' | 'pyq';

type Question = {
    id: number;
    question_en: string;
    question_hi: string;
    difficulty: string;
    subject?: { name_en: string };
    chapter?: { name_en: string };
};

type SelectedQuestion = Question & {
    marks: number;
    negative_marks: number;
    sort_order: number;
};

export default function AdminTestsPage() {
    const [loading, setLoading] = useState(true);
    const [showWizard, setShowWizard] = useState(false);
    const [currentStep, setCurrentStep] = useState(1);
    const [isSaving, setIsSaving] = useState(false);

    // Data
    const [exams, setExams] = useState<any[]>([]);
    const [subjects, setSubjects] = useState<any[]>([]);
    const [chapters, setChapters] = useState<any[]>([]);
    const [availableQuestions, setAvailableQuestions] = useState<Question[]>([]);
    const [selectedQuestions, setSelectedQuestions] = useState<SelectedQuestion[]>([]);

    // Test Configuration
    const [testConfig, setTestConfig] = useState({
        exam_id: '',
        subject_id: '',
        chapter_id: '',
        mode: 'chapter' as TestMode,
        name_en: '',
        name_hi: '',
        description_en: '',
        description_hi: '',
        duration_sec: 7200,
        total_marks: 150,
        negative_marking: 0.33,
        status: 'draft',
    });

    // Question Creation Form (Quick)
    const [showQuickCreate, setShowQuickCreate] = useState(false);
    const [quickQuestion, setQuickQuestion] = useState({
        question_en: '',
        question_hi: '',
        explanation_en: '',
        explanation_hi: '',
        difficulty: 'medium',
        options: [
            { option_en: '', option_hi: '', is_correct: false },
            { option_en: '', option_hi: '', is_correct: false },
            { option_en: '', option_hi: '', is_correct: false },
            { option_en: '', option_hi: '', is_correct: false },
        ]
    });

    // Search & Filter
    const [searchTerm, setSearchTerm] = useState('');
    const [difficultyFilter, setDifficultyFilter] = useState('all');

    useEffect(() => {
        fetchInitialData();
    }, []);

    useEffect(() => {
        if (testConfig.exam_id) {
            fetchSubjects(testConfig.exam_id);
        }
    }, [testConfig.exam_id]);

    useEffect(() => {
        if (testConfig.subject_id) {
            fetchChapters(testConfig.subject_id);
        }
    }, [testConfig.subject_id]);

    const fetchInitialData = async () => {
        try {
            const examsRes = await api.get('/exams');
            setExams(examsRes.data);
            if (examsRes.data.length > 0) {
                setTestConfig(prev => ({ ...prev, exam_id: examsRes.data[0].id }));
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
                setTestConfig(prev => ({ ...prev, subject_id: res.data[0].id }));
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
                setTestConfig(prev => ({ ...prev, chapter_id: res.data[0].id }));
            }
        } catch (error) {
            console.error('Failed to fetch chapters', error);
        }
    };

    const fetchQuestions = async () => {
        try {
            const params: any = {};
            if (testConfig.mode === 'chapter' && testConfig.chapter_id) {
                params.chapter_id = testConfig.chapter_id;
            } else if (testConfig.mode === 'subject' && testConfig.subject_id) {
                params.subject_id = testConfig.subject_id;
            } else if (testConfig.mode === 'full_mock' && testConfig.exam_id) {
                params.exam_id = testConfig.exam_id;
            }

            const res = await api.get('/admin/questions/search', { params });
            setAvailableQuestions(res.data);
        } catch (error) {
            console.error('Failed to fetch questions', error);
            toast.error('Failed to load questions');
        }
    };

    const handleNextStep = () => {
        if (currentStep === 1) {
            // Validate test config
            if (!testConfig.name_en || !testConfig.name_hi) {
                toast.error('Test name required in both languages');
                return;
            }
            fetchQuestions();
        }
        setCurrentStep(prev => prev + 1);
    };

    const handlePrevStep = () => {
        setCurrentStep(prev => prev - 1);
    };

    const toggleQuestionSelection = (question: Question) => {
        const isSelected = selectedQuestions.some(q => q.id === question.id);

        if (isSelected) {
            setSelectedQuestions(prev => prev.filter(q => q.id !== question.id));
        } else {
            setSelectedQuestions(prev => [...prev, {
                ...question,
                marks: 1.0,
                negative_marks: testConfig.negative_marking,
                sort_order: prev.length + 1
            }]);
        }
    };

    const handleCreateTest = async () => {
        if (selectedQuestions.length === 0) {
            toast.error('Please select at least one question');
            return;
        }

        setIsSaving(true);
        try {
            const testData = {
                ...testConfig,
                questions: selectedQuestions.map(q => ({
                    question_id: q.id,
                    marks: q.marks,
                    negative_marks: q.negative_marks,
                    sort_order: q.sort_order
                }))
            };

            await api.post('/admin/tests/with-questions', testData);
            toast.success('Test created successfully!');
            setShowWizard(false);
            resetWizard();
        } catch (error: any) {
            const errorMsg = error.response?.data?.message || 'Failed to create test';
            toast.error(errorMsg);
        } finally {
            setIsSaving(false);
        }
    };

    const resetWizard = () => {
        setCurrentStep(1);
        setSelectedQuestions([]);
        setTestConfig({
            exam_id: exams[0]?.id || '',
            subject_id: '',
            chapter_id: '',
            mode: 'chapter',
            name_en: '',
            name_hi: '',
            description_en: '',
            description_hi: '',
            duration_sec: 7200,
            total_marks: 150,
            negative_marking: 0.33,
            status: 'draft',
        });
    };

    const filteredQuestions = availableQuestions.filter(q => {
        const matchesSearch = q.question_en.toLowerCase().includes(searchTerm.toLowerCase()) ||
            q.question_hi.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesDifficulty = difficultyFilter === 'all' || q.difficulty === difficultyFilter;
        return matchesSearch && matchesDifficulty;
    });

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center py-40 gap-4">
                <Loader2 className="h-10 w-10 text-indigo-600 animate-spin" />
                <p className="text-[10px] font-black text-foreground/40 uppercase tracking-[0.3em]">Loading Test Arsenal...</p>
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
                        <span className="text-indigo-600">Tests Pool</span>
                    </div>
                    <h1 className="text-5xl font-black text-foreground uppercase tracking-tighter italic leading-none">
                        Test <span className="text-indigo-600">Command Center</span>
                    </h1>
                    <p className="text-sm text-foreground/40 font-bold uppercase tracking-widest">
                        Create and deploy tactical test missions
                    </p>
                </div>

                <button
                    onClick={() => setShowWizard(true)}
                    className="flex items-center gap-3 bg-indigo-600 text-white px-8 py-5 rounded-[2rem] text-[10px] font-black uppercase tracking-widest shadow-2xl shadow-indigo-500/20 hover:scale-[1.02] active:scale-95 transition-all group"
                >
                    <Plus className="h-4 w-4 group-hover:rotate-90 transition-transform" />
                    Create New Test
                </button>
            </div>

            {/* Quick Link to Filament */}
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-1 rounded-[3rem] shadow-2xl shadow-blue-500/20">
                <div className="bg-background rounded-[2.8rem] p-8 flex flex-col lg:flex-row items-center justify-between gap-6">
                    <div className="space-y-2">
                        <h3 className="text-xl font-black text-foreground uppercase tracking-tighter italic">Advanced Test Management</h3>
                        <p className="text-sm font-bold text-foreground/40 uppercase tracking-widest">
                            Use Filament Admin for bulk operations, detailed analytics, and complex test configurations
                        </p>
                    </div>
                    <button
                        onClick={() => window.open('http://localhost:8000/admin/tests', '_blank')}
                        className="px-10 py-5 bg-indigo-600 text-white rounded-[2rem] font-black text-sm uppercase tracking-[0.3em] shadow-xl hover:scale-105 active:scale-95 transition-all flex items-center gap-4"
                    >
                        Open Filament
                        <ChevronRight className="h-5 w-5" />
                    </button>
                </div>
            </div>

            {/* TEST CREATION WIZARD */}
            {showWizard && (
                <div className="fixed inset-0 z-50 flex items-start justify-center p-4 bg-black/90 backdrop-blur-md animate-in fade-in duration-300 overflow-y-auto">
                    <div className="w-full max-w-6xl bg-slate-900 border border-indigo-600/20 rounded-[3rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-500 my-8">
                        <div className="overflow-y-auto max-h-[85vh]">
                            <div className="p-8 lg:p-12 space-y-8">
                                {/* Header */}
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h2 className="text-3xl font-black text-white uppercase tracking-tight italic">Test Creation Wizard</h2>
                                        <p className="text-sm font-black text-indigo-400 uppercase tracking-widest mt-2">
                                            Step {currentStep} of 3 • {currentStep === 1 ? 'Configuration' : currentStep === 2 ? 'Add Questions' : 'Review & Publish'}
                                        </p>
                                    </div>
                                    <button onClick={() => setShowWizard(false)} className="text-white/40 hover:text-white transition-colors p-2">
                                        <X className="h-6 w-6" />
                                    </button>
                                </div>

                                {/* Progress Bar */}
                                <div className="flex items-center gap-4">
                                    {[1, 2, 3].map(step => (
                                        <div key={step} className="flex-1">
                                            <div className={cn(
                                                "h-2 rounded-full transition-all",
                                                step <= currentStep ? "bg-indigo-600" : "bg-slate-700"
                                            )} />
                                        </div>
                                    ))}
                                </div>

                                {/* STEP 1: Test Configuration */}
                                {currentStep === 1 && (
                                    <div className="space-y-8">
                                        {/* Test Type */}
                                        <div className="space-y-4">
                                            <h3 className="text-sm font-black text-white/60 uppercase tracking-widest">Test Type</h3>
                                            <div className="grid grid-cols-4 gap-4">
                                                {[
                                                    { value: 'chapter', label: 'Chapter Test' },
                                                    { value: 'subject', label: 'Subject Test' },
                                                    { value: 'full_mock', label: 'Full Mock' },
                                                    { value: 'pyq', label: 'PYQ' },
                                                ].map(type => (
                                                    <button
                                                        key={type.value}
                                                        type="button"
                                                        onClick={() => setTestConfig({ ...testConfig, mode: type.value as TestMode })}
                                                        className={cn(
                                                            "py-4 rounded-xl font-black text-xs uppercase tracking-widest transition-all border-2",
                                                            testConfig.mode === type.value
                                                                ? "bg-indigo-600 border-indigo-600 text-white"
                                                                : "border-slate-700 text-white/40 hover:border-indigo-600/30"
                                                        )}
                                                    >
                                                        {type.label}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Hierarchy */}
                                        <div className="grid grid-cols-3 gap-6">
                                            <div className="space-y-2">
                                                <label className="text-[9px] font-black text-white/40 uppercase tracking-widest block">Exam</label>
                                                <select
                                                    value={testConfig.exam_id}
                                                    onChange={(e) => setTestConfig({ ...testConfig, exam_id: e.target.value })}
                                                    className="w-full bg-slate-800/50 border border-slate-700 rounded-xl p-3 text-sm font-bold text-white"
                                                >
                                                    {exams.map(ex => (
                                                        <option key={ex.id} value={ex.id}>{ex.name_en}</option>
                                                    ))}
                                                </select>
                                            </div>

                                            {['chapter', 'subject'].includes(testConfig.mode) && (
                                                <div className="space-y-2">
                                                    <label className="text-[9px] font-black text-white/40 uppercase tracking-widest block">Subject</label>
                                                    <select
                                                        value={testConfig.subject_id}
                                                        onChange={(e) => setTestConfig({ ...testConfig, subject_id: e.target.value })}
                                                        className="w-full bg-slate-800/50 border border-slate-700 rounded-xl p-3 text-sm font-bold text-white"
                                                    >
                                                        {subjects.map(s => (
                                                            <option key={s.id} value={s.id}>{s.name_en}</option>
                                                        ))}
                                                    </select>
                                                </div>
                                            )}

                                            {testConfig.mode === 'chapter' && (
                                                <div className="space-y-2">
                                                    <label className="text-[9px] font-black text-white/40 uppercase tracking-widest block">Chapter</label>
                                                    <select
                                                        value={testConfig.chapter_id}
                                                        onChange={(e) => setTestConfig({ ...testConfig, chapter_id: e.target.value })}
                                                        className="w-full bg-slate-800/50 border border-slate-700 rounded-xl p-3 text-sm font-bold text-white"
                                                    >
                                                        {chapters.map(c => (
                                                            <option key={c.id} value={c.id}>{c.name_en}</option>
                                                        ))}
                                                    </select>
                                                </div>
                                            )}
                                        </div>

                                        {/* Test Names */}
                                        <div className="grid grid-cols-2 gap-6">
                                            <div className="space-y-2">
                                                <label className="text-[9px] font-black text-white/40 uppercase tracking-widest block">Test Name (EN)</label>
                                                <input
                                                    required
                                                    type="text"
                                                    value={testConfig.name_en}
                                                    onChange={(e) => setTestConfig({ ...testConfig, name_en: e.target.value })}
                                                    className="w-full bg-slate-800/50 border border-slate-700 rounded-xl p-3 text-sm font-medium text-white"
                                                    placeholder="Ancient India Chapter Test"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-[9px] font-black text-white/40 uppercase tracking-widest block">Test Name (HI)</label>
                                                <input
                                                    required
                                                    type="text"
                                                    value={testConfig.name_hi}
                                                    onChange={(e) => setTestConfig({ ...testConfig, name_hi: e.target.value })}
                                                    className="w-full bg-slate-800/50 border border-slate-700 rounded-xl p-3 text-sm font-medium text-white"
                                                    placeholder="प्राचीन भारत अध्याय परीक्षण"
                                                />
                                            </div>
                                        </div>

                                        {/* Test Params */}
                                        <div className="grid grid-cols-3 gap-6">
                                            <div className="space-y-2">
                                                <label className="text-[9px] font-black text-white/40 uppercase tracking-widest block">Duration (minutes)</label>
                                                <input
                                                    type="number"
                                                    value={isNaN(testConfig.duration_sec) ? '' : testConfig.duration_sec / 60}
                                                    onChange={(e) => {
                                                        const val = e.target.value;
                                                        setTestConfig({ ...testConfig, duration_sec: val === '' ? NaN : parseInt(val) * 60 });
                                                    }}
                                                    className="w-full bg-slate-800/50 border border-slate-700 rounded-xl p-3 text-sm font-medium text-white"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-[9px] font-black text-white/40 uppercase tracking-widest block">Total Marks</label>
                                                <input
                                                    type="number"
                                                    value={isNaN(testConfig.total_marks) ? '' : testConfig.total_marks}
                                                    onChange={(e) => {
                                                        const val = e.target.value;
                                                        setTestConfig({ ...testConfig, total_marks: val === '' ? NaN : parseInt(val) });
                                                    }}
                                                    className="w-full bg-slate-800/50 border border-slate-700 rounded-xl p-3 text-sm font-medium text-white"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-[9px] font-black text-white/40 uppercase tracking-widest block">Negative Marking</label>
                                                <input
                                                    type="number"
                                                    step="0.01"
                                                    value={isNaN(testConfig.negative_marking) ? '' : testConfig.negative_marking}
                                                    onChange={(e) => {
                                                        const val = e.target.value;
                                                        setTestConfig({ ...testConfig, negative_marking: val === '' ? NaN : parseFloat(val) });
                                                    }}
                                                    className="w-full bg-slate-800/50 border border-slate-700 rounded-xl p-3 text-sm font-medium text-white"
                                                />
                                            </div>
                                        </div>

                                        {/* Next Button */}
                                        <button
                                            onClick={handleNextStep}
                                            className="w-full bg-indigo-600 text-white py-5 rounded-[2rem] text-sm font-black uppercase tracking-[0.2em] shadow-xl hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-4"
                                        >
                                            Next: Add Questions
                                            <ArrowRight className="h-5 w-5" />
                                        </button>
                                    </div>
                                )}

                                {/* STEP 2: Question Selection */}
                                {currentStep === 2 && (
                                    <div className="space-y-6">
                                        {/* Search & Filter */}
                                        <div className="flex gap-4">
                                            <div className="flex-1">
                                                <div className="relative">
                                                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-white/40" />
                                                    <input
                                                        type="text"
                                                        value={searchTerm}
                                                        onChange={(e) => setSearchTerm(e.target.value)}
                                                        placeholder="Search questions..."
                                                        className="w-full bg-slate-800/50 border border-slate-700 rounded-xl pl-12 pr-4 py-3 text-sm text-white"
                                                    />
                                                </div>
                                            </div>
                                            <select
                                                value={difficultyFilter}
                                                onChange={(e) => setDifficultyFilter(e.target.value)}
                                                className="bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white"
                                            >
                                                <option value="all">All Difficulties</option>
                                                <option value="easy">Easy</option>
                                                <option value="medium">Medium</option>
                                                <option value="hard">Hard</option>
                                            </select>
                                        </div>

                                        {/* Selected Count */}
                                        <div className="bg-indigo-600/10 border border-indigo-600/20 rounded-xl p-4 flex items-center justify-between">
                                            <span className="text-sm font-black text-white uppercase tracking-widest">
                                                Selected Questions: {selectedQuestions.length}
                                            </span>
                                            <button
                                                onClick={() => setSelectedQuestions([])}
                                                className="text-xs font-black text-indigo-400 uppercase tracking-widest hover:text-indigo-300"
                                            >
                                                Clear All
                                            </button>
                                        </div>

                                        {/* Questions List */}
                                        <div className="space-y-3 max-h-[40vh] overflow-y-auto">
                                            {filteredQuestions.map((question) => {
                                                const isSelected = selectedQuestions.some(q => q.id === question.id);
                                                return (
                                                    <div
                                                        key={question.id}
                                                        onClick={() => toggleQuestionSelection(question)}
                                                        className={cn(
                                                            "bg-slate-800/30 border rounded-xl p-4 cursor-pointer transition-all hover:bg-slate-800/50",
                                                            isSelected ? "border-indigo-600 bg-indigo-600/10" : "border-slate-700"
                                                        )}
                                                    >
                                                        <div className="flex items-start gap-4">
                                                            <div className={cn(
                                                                "mt-1 w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 transition-all",
                                                                isSelected ? "bg-indigo-600 border-indigo-600" : "border-slate-600"
                                                            )}>
                                                                {isSelected && <Check className="h-3 w-3 text-white" />}
                                                            </div>
                                                            <div className="flex-1 space-y-2">
                                                                <p className="text-sm font-medium text-white line-clamp-2">{question.question_en}</p>
                                                                <div className="flex items-center gap-3 text-[10px] font-bold text-white/40 uppercase tracking-widest">
                                                                    <span className={cn(
                                                                        "px-2 py-1 rounded",
                                                                        question.difficulty === 'easy' ? 'bg-green-500/20 text-green-400' :
                                                                            question.difficulty === 'medium' ? 'bg-yellow-500/20 text-yellow-400' :
                                                                                'bg-red-500/20 text-red-400'
                                                                    )}>
                                                                        {question.difficulty}
                                                                    </span>
                                                                    {question.subject && <span>{question.subject.name_en}</span>}
                                                                    {question.chapter && <span>• {question.chapter.name_en}</span>}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>

                                        {/* Navigation */}
                                        <div className="flex gap-4">
                                            <button
                                                onClick={handlePrevStep}
                                                className="flex-1 bg-slate-800 text-white py-4 rounded-[2rem] text-sm font-black uppercase tracking-widest hover:bg-slate-700 transition-all flex items-center justify-center gap-3"
                                            >
                                                <ArrowLeft className="h-5 w-5" />
                                                Back
                                            </button>
                                            <button
                                                onClick={handleNextStep}
                                                disabled={selectedQuestions.length === 0}
                                                className="flex-1 bg-indigo-600 text-white py-4 rounded-[2rem] text-sm font-black uppercase tracking-widest hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
                                            >
                                                Review & Publish
                                                <ArrowRight className="h-5 w-5" />
                                            </button>
                                        </div>
                                    </div>
                                )}

                                {/* STEP 3: Review & Publish */}
                                {currentStep === 3 && (
                                    <div className="space-y-6">
                                        {/* Test Summary */}
                                        <div className="bg-slate-800/30 border border-slate-700 rounded-2xl p-6 space-y-4">
                                            <h3 className="text-xl font-black text-white uppercase">{testConfig.name_en}</h3>
                                            <div className="grid grid-cols-4 gap-4">
                                                <div className="space-y-1">
                                                    <div className="flex items-center gap-2">
                                                        <Clock className="h-4 w-4 text-indigo-400" />
                                                        <span className="text-[10px] font-black text-white/40 uppercase tracking-widest">Duration</span>
                                                    </div>
                                                    <p className="text-lg font-black text-white">{testConfig.duration_sec / 60} min</p>
                                                </div>
                                                <div className="space-y-1">
                                                    <div className="flex items-center gap-2">
                                                        <Target className="h-4 w-4 text-indigo-400" />
                                                        <span className="text-[10px] font-black text-white/40 uppercase tracking-widest">Total Marks</span>
                                                    </div>
                                                    <p className="text-lg font-black text-white">{testConfig.total_marks}</p>
                                                </div>
                                                <div className="space-y-1">
                                                    <div className="flex items-center gap-2">
                                                        <BookOpen className="h-4 w-4 text-indigo-400" />
                                                        <span className="text-[10px] font-black text-white/40 uppercase tracking-widest">Questions</span>
                                                    </div>
                                                    <p className="text-lg font-black text-white">{selectedQuestions.length}</p>
                                                </div>
                                                <div className="space-y-1">
                                                    <div className="flex items-center gap-2">
                                                        <X className="h-4 w-4 text-red-400" />
                                                        <span className="text-[10px] font-black text-white/40 uppercase tracking-widest">Negative</span>
                                                    </div>
                                                    <p className="text-lg font-black text-white">-{testConfig.negative_marking}</p>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Questions Preview */}
                                        <div className="space-y-3 max-h-[35vh] overflow-y-auto">
                                            <h4 className="text-sm font-black text-white/60 uppercase tracking-widest">Questions List</h4>
                                            {selectedQuestions.map((question, index) => (
                                                <div key={question.id} className="bg-slate-800/20 border border-slate-700 rounded-xl p-4 flex items-start gap-4">
                                                    <span className="text-lg font-black text-indigo-400">{index + 1}.</span>
                                                    <div className="flex-1">
                                                        <p className="text-sm font-medium text-white line-clamp-1">{question.question_en}</p>
                                                        <div className="flex items-center gap-4 mt-2 text-[10px] font-bold text-white/40 uppercase">
                                                            <span>Marks: {question.marks}</span>
                                                            <span>Negative: -{question.negative_marks}</span>
                                                            <span className="px-2 py-1 bg-indigo-600/20 text-indigo-400 rounded">{question.difficulty}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>

                                        {/* Publish Actions */}
                                        <div className="flex gap-4">
                                            <button
                                                onClick={handlePrevStep}
                                                className="flex-1 bg-slate-800 text-white py-4 rounded-[2rem] text-sm font-black uppercase tracking-widest hover:bg-slate-700 transition-all flex items-center justify-center gap-3"
                                            >
                                                <ArrowLeft className="h-5 w-5" />
                                                Back
                                            </button>
                                            <button
                                                onClick={() => {
                                                    setTestConfig({ ...testConfig, status: 'draft' });
                                                    handleCreateTest();
                                                }}
                                                disabled={isSaving}
                                                className="flex-1 bg-slate-700 text-white py-4 rounded-[2rem] text-sm font-black uppercase tracking-widest hover:bg-slate-600 transition-all disabled:opacity-50"
                                            >
                                                Save as Draft
                                            </button>
                                            <button
                                                onClick={() => {
                                                    setTestConfig({ ...testConfig, status: 'published' });
                                                    handleCreateTest();
                                                }}
                                                disabled={isSaving}
                                                className="flex-1 bg-indigo-600 text-white py-4 rounded-[2rem] text-sm font-black uppercase tracking-widest hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
                                            >
                                                {isSaving ? <Loader2 className="h-5 w-5 animate-spin" /> : <Rocket className="h-5 w-5" />}
                                                {isSaving ? 'Publishing...' : 'Publish Test'}
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
