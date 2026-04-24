'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import api from '@/lib/api';
import {
    ChevronRight,
    ChevronLeft,
    Clock,
    Target,
    ClipboardCheck,
    Zap,
    Info,
    AlertCircle,
    Play,
    Timer,
    Maximize,
    Pause,
    Menu,
    Languages,
    ShieldCheck,
    Loader2,
    Rocket,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { storageUrl } from '@/lib/storage';
import { toast } from 'react-hot-toast';

type Question = {
    id: number;
    question_en: string;
    question_hi: string;
    image_path: string | null;
    explanation_en: string | null;
    explanation_hi: string | null;
    options: { id: number; option_en: string; option_hi: string; image_path: string | null }[];
};

type Test = {
    id: number;
    name_en: string;
    name_hi: string;
    description_en: string | null;
    description_hi: string | null;
    duration_sec: number;
    total_marks: number;
    negative_marking: number;
    questions: Question[];
};

export default function TestPlayer() {
    const params = useParams();
    const router = useRouter();
    const [step, setStep] = useState<'instructions' | 'declaration' | 'playing'>('instructions');
    const [test, setTest] = useState<Test | null>(null);
    const [loading, setLoading] = useState(true);
    const [language, setLanguage] = useState<'en' | 'hi'>('en');
    const [declared, setDeclared] = useState(false);

    // Test State
    const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
    const [timeLeft, setTimeLeft] = useState(0);
    const [responses, setResponses] = useState<Record<number, { selected_option_id?: number, status: string, visited?: boolean }>>({});
    const [isPaused, setIsPaused] = useState(false);
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [attemptId, setAttemptId] = useState<number | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSyncing, setIsSyncing] = useState(false); // set true while syncing a response
    const [showSubmitModal, setShowSubmitModal] = useState(false);
    const autoSubmitFiredRef = useRef(false);

    useEffect(() => {
        fetchTest();
    }, [params.id]);

    const fetchTest = async () => {
        setLoading(true);
        try {
            const res = await api.get(`/tests/${params.id}`);
            setTest(res.data);
            setTimeLeft(res.data.duration_sec);
        } catch (error) {
            console.error('Failed to fetch test', error);
            toast.error('Failed to load test');
        } finally {
            setLoading(false);
        }
    };

    const startTest = async () => {
        if (!declared) {
            toast.error('Please accept the declaration to proceed');
            return;
        }

        try {
            const res = await api.post(`/tests/${params.id}/attempts`);
            const attempt = res.data.attempt;
            setAttemptId(attempt.id);

            if (res.data.is_resume) {
                const savedResponses: any = {};
                attempt.responses.forEach((r: any) => {
                    savedResponses[r.question_id] = {
                        selected_option_id: r.selected_option_id,
                        status: r.is_marked_for_review ? 'marked' : (r.selected_option_id ? 'answered' : 'not_answered'),
                        visited: true
                    };
                });
                setResponses(savedResponses);
                toast.success('Attempt Resumed!');
            } else {
                toast.success('Mission Started!');
            }

            setStep('playing');
            // Auto-mark first question as visited
            if (test?.questions.length) {
                markAsVisited(test.questions[0].id);
            }
        } catch (error) {
            toast.error('Failed to initialize attempt');
        }
    };

    const markAsVisited = (questionId: number) => {
        setResponses(prev => {
            if (prev[questionId]?.visited) return prev;
            const currentStatus = prev[questionId]?.status || 'not_answered';
            return {
                ...prev,
                [questionId]: {
                    ...(prev[questionId] || {}),
                    visited: true,
                    status: currentStatus === 'not_visited' ? 'not_answered' : currentStatus
                }
            }
        });
    };

    const toggleFullscreen = () => {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen();
        } else if (document.exitFullscreen) {
            document.exitFullscreen();
        }
    };

    const syncResponseToBackend = async (questionId: number, data: any) => {
        if (!attemptId || isNaN(Number(attemptId))) return;
        setIsSyncing(true);
        try {
            await api.post(`/attempts/${attemptId}/responses`, {
                question_id: questionId,
                selected_option_id: data.selected_option_id,
                is_marked_for_review: data.status === 'marked',
                time_taken_sec: 0,
            });
        } catch {
            // silent — response will be re-synced on next interaction
        } finally {
            setIsSyncing(false);
        }
    };

    const handleSaveAndNext = async () => {
        const currentQ = test?.questions[currentQuestionIdx];
        if (!currentQ) return;

        const currentResponse = responses[currentQ.id];
        const newStatus = currentResponse?.selected_option_id ? 'answered' : 'not_answered';

        const updatedData = {
            ...(currentResponse || {}),
            status: currentResponse?.status === 'marked' ? 'marked' : newStatus,
            visited: true
        };

        setResponses(prev => ({
            ...prev,
            [currentQ.id]: updatedData
        }));

        syncResponseToBackend(currentQ.id, updatedData);

        if (currentQuestionIdx < (test?.questions.length || 0) - 1) {
            const nextIdx = currentQuestionIdx + 1;
            const nextQ = test?.questions[nextIdx];
            if (nextQ) markAsVisited(nextQ.id);
            setCurrentQuestionIdx(nextIdx);
        } else {
            toast.success('Reached the end of the mission!');
        }
    };

    const handleMarkForReview = () => {
        const currentQ = test?.questions[currentQuestionIdx];
        if (!currentQ) return;

        const updatedData = {
            ...(responses[currentQ.id] || {}),
            status: 'marked',
            visited: true
        };

        setResponses(prev => ({
            ...prev,
            [currentQ.id]: updatedData
        }));

        syncResponseToBackend(currentQ.id, updatedData);

        if (currentQuestionIdx < (test?.questions.length || 0) - 1) {
            const nextIdx = currentQuestionIdx + 1;
            const nextQ = test?.questions[nextIdx];
            if (nextQ) markAsVisited(nextQ.id);
            setCurrentQuestionIdx(nextIdx);
        }
    };

    const handleAutoSubmit = useCallback(async () => {
        if (autoSubmitFiredRef.current || isSubmitting) return;
        autoSubmitFiredRef.current = true;
        if (!attemptId) return;
        setIsSubmitting(true);
        try {
            await api.post(`/attempts/${attemptId}/complete`);
            toast.success('Time up! Test submitted automatically.');
            router.push(`/dashboard/tests/result/${attemptId}`);
        } catch {
            toast.error('Auto-submit failed. Please submit manually.');
        } finally {
            setIsSubmitting(false);
        }
    }, [attemptId, isSubmitting, router]);

    // Timer Logic — MUST be above all conditional returns to satisfy Rules of Hooks
    useEffect(() => {
        if (step !== 'playing' || isPaused) return;

        const interval = setInterval(() => {
            setTimeLeft((prev) => {
                if (prev <= 1) {
                    clearInterval(interval);
                    handleAutoSubmit();
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(interval);
    }, [step, isPaused, handleAutoSubmit]);

    if (loading) {
        return (
            <div className="min-h-screen bg-background flex flex-col items-center justify-center p-10 space-y-6">
                <div className="h-20 w-20 bg-blue-600/10 rounded-[2.5rem] flex items-center justify-center animate-pulse">
                    <Zap className="h-10 w-10 text-blue-600" />
                </div>
                <div className="space-y-2 text-center">
                    <h2 className="text-xl font-black text-foreground uppercase tracking-tight italic">Initiating Engine</h2>
                    <p className="text-[10px] font-bold text-foreground/40 uppercase tracking-widest">Loading assessment parameters & question payload...</p>
                </div>
            </div>
        );
    }

    if (step === 'instructions') {
        return (
            <div className="max-w-4xl mx-auto py-20 px-4 animate-in fade-in slide-in-from-bottom-10 duration-700">
                <div className="bg-card-bg border border-card-border rounded-[4rem] shadow-2xl overflow-hidden">
                    <div className="p-12 space-y-10">
                        <div className="flex items-center gap-4">
                            <div className="h-12 w-12 bg-blue-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-blue-500/20">
                                <Info className="h-6 w-6" />
                            </div>
                            <h1 className="text-3xl font-black text-foreground uppercase tracking-tighter italic">Exam <span className="text-blue-600">Instructions</span></h1>
                        </div>

                        <div className="space-y-8">
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                                <div className="p-6 bg-background rounded-3xl border border-card-border space-y-2">
                                    <Clock className="h-5 w-5 text-orange-500" />
                                    <p className="text-[10px] font-black text-foreground/40 uppercase tracking-widest">Duration</p>
                                    <p className="text-lg font-black text-foreground">{Math.floor(test?.duration_sec! / 60)} Mins</p>
                                </div>
                                <div className="p-6 bg-background rounded-3xl border border-card-border space-y-2">
                                    <Target className="h-5 w-5 text-green-600" />
                                    <p className="text-[10px] font-black text-foreground/40 uppercase tracking-widest">Total Marks</p>
                                    <p className="text-lg font-black text-foreground">{test?.total_marks} Marks</p>
                                </div>
                                <div className="p-6 bg-background rounded-3xl border border-card-border space-y-2">
                                    <ClipboardCheck className="h-5 w-5 text-blue-600" />
                                    <p className="text-[10px] font-black text-foreground/40 uppercase tracking-widest">Questions</p>
                                    <p className="text-lg font-black text-foreground">{test?.questions.length}</p>
                                </div>
                                <div className="p-6 bg-background rounded-3xl border border-card-border space-y-2">
                                    <AlertCircle className="h-5 w-5 text-red-500" />
                                    <p className="text-[10px] font-black text-foreground/40 uppercase tracking-widest">Negative</p>
                                    <p className="text-lg font-black text-foreground">{test?.negative_marking}</p>
                                </div>
                            </div>

                            <div className="space-y-6 text-sm font-bold text-foreground/60 uppercase tracking-wide leading-relaxed p-8 border border-dashed border-card-border rounded-[2.5rem]">
                                <ul className="space-y-4 list-disc pl-5">
                                    <li>Ensure you have a stable internet connection before starting the mission.</li>
                                    <li>Each question has 4 options, only one is correct.</li>
                                    <li>Marked for Review questions will be considered for final assessment.</li>
                                    <li>The clock starts exactly when you initiate the mission.</li>
                                    <li>You can switch between Languages (English/Hindi) during the test.</li>
                                </ul>
                            </div>
                        </div>

                        <div className="flex justify-end pt-6">
                            <button
                                onClick={() => setStep('declaration')}
                                className="px-16 py-6 bg-blue-600 hover:bg-blue-700 text-white rounded-[2.5rem] font-black text-sm uppercase tracking-[0.3em] transition-all shadow-xl shadow-blue-500/20 active:scale-95 flex items-center gap-4 group"
                            >
                                Next Step
                                <ChevronRight className="h-5 w-5 group-hover:translate-x-2 transition-transform" />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (step === 'declaration') {
        return (
            <div className="max-w-4xl mx-auto py-20 px-4 animate-in fade-in slide-in-from-right-10 duration-700">
                <div className="bg-card-bg border border-card-border rounded-[4rem] shadow-2xl overflow-hidden">
                    <div className="p-12 space-y-12">
                        <div className="flex items-center gap-4">
                            <div className="h-12 w-12 bg-orange-500 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-orange-500/20">
                                <Languages className="h-6 w-6" />
                            </div>
                            <h1 className="text-3xl font-black text-foreground uppercase tracking-tighter italic">Language <span className="text-orange-500">& Declaration</span></h1>
                        </div>

                        <div className="space-y-10">
                            {/* Language Choice */}
                            <div className="space-y-6 p-10 bg-background rounded-[3rem] border border-card-border shadow-inner">
                                <label className="text-[10px] font-black text-foreground/30 uppercase tracking-[0.3em]">Select Default Language</label>
                                <div className="flex gap-4">
                                    <button
                                        onClick={() => setLanguage('en')}
                                        className={cn(
                                            "flex-1 py-8 rounded-[2rem] font-black text-sm uppercase tracking-[0.2em] transition-all border-2",
                                            language === 'en'
                                                ? "bg-blue-600/10 border-blue-600 text-blue-600 shadow-xl"
                                                : "border-card-border text-foreground/40 hover:border-blue-500/30"
                                        )}
                                    >
                                        English
                                    </button>
                                    <button
                                        onClick={() => setLanguage('hi')}
                                        className={cn(
                                            "flex-1 py-8 rounded-[2rem] font-black text-sm uppercase tracking-[0.2em] transition-all border-2",
                                            language === 'hi'
                                                ? "bg-blue-600/10 border-blue-600 text-blue-600 shadow-xl"
                                                : "border-card-border text-foreground/40 hover:border-blue-500/30"
                                        )}
                                    >
                                        Hindi / हिंदी
                                    </button>
                                </div>
                                <p className="text-[8px] font-black text-blue-600 uppercase tracking-widest text-center italic">** You can toggle language later for specific questions</p>
                            </div>

                            {/* Declaration */}
                            <div className="space-y-6">
                                <div className="flex items-start gap-4 p-8 bg-orange-500/5 rounded-[2.5rem] border border-orange-500/10">
                                    <div className="pt-1">
                                        <input
                                            type="checkbox"
                                            id="declaration"
                                            checked={declared}
                                            onChange={(e) => setDeclared(e.target.checked)}
                                            className="h-6 w-6 rounded-lg bg-background border-card-border text-blue-600 focus:ring-blue-500/20 cursor-pointer"
                                        />
                                    </div>
                                    <label htmlFor="declaration" className="text-xs font-bold text-foreground/70 uppercase tracking-wide leading-relaxed cursor-pointer select-none italic">
                                        I have read and understood the instructions. All computer hardware allotted to me are in proper working condition. I declare that I am not in possession of / not wearing any prohibited gadgets and I will not engage in any unfair means. Any engagement in prohibited items/unfair means shall disqualify me.
                                    </label>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center justify-between pt-6">
                            <button
                                onClick={() => setStep('instructions')}
                                className="px-10 py-5 text-[10px] font-black text-foreground/30 uppercase tracking-[0.3em] hover:text-foreground transition-colors flex items-center gap-3"
                            >
                                <ChevronLeft className="h-4 w-4" />
                                Back to Instructions
                            </button>
                            <button
                                onClick={startTest}
                                className={cn(
                                    "px-16 py-6 rounded-[2.5rem] font-black text-sm uppercase tracking-[0.3em] transition-all flex items-center gap-4 group shadow-xl",
                                    declared
                                        ? "bg-green-500 hover:bg-green-600 text-white shadow-green-500/20 active:scale-95"
                                        : "bg-gray-200 dark:bg-gray-800 text-foreground/20 cursor-not-allowed shadow-none"
                                )}
                            >
                                I am Ready to Begin
                                <Play className="h-5 w-5 group-hover:scale-110 transition-transform" />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // Timer Logic moved above conditional returns (Rules of Hooks)

    const formatTime = (sec: number) => {
        const h = Math.floor(sec / 3600);
        const m = Math.floor((sec % 3600) / 60);
        const s = sec % 60;
        return `${h > 0 ? h + ':' : ''}${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    };

    const handleClearSelection = () => {
        const currentQ = test?.questions[currentQuestionIdx];
        if (!currentQ) return;

        setResponses(prev => {
            const newResp = { ...prev };
            newResp[currentQ.id] = { ...newResp[currentQ.id], status: 'not_answered', selected_option_id: undefined };
            return newResp;
        });

        syncResponseToBackend(currentQ.id, { status: 'not_answered', selected_option_id: null });
    };

    const handleSubmit = () => {
        if (!attemptId || isNaN(Number(attemptId))) {
            toast.error('No active session. Please refresh and try again.');
            return;
        }
        if (isSubmitting) return;
        setShowSubmitModal(true);
    };

    const handleConfirmedSubmit = async () => {
        setShowSubmitModal(false);
        setIsSubmitting(true);
        try {
            await api.post(`/attempts/${attemptId}/complete`);
            toast.success('Test submitted successfully!');
            router.push(`/dashboard/tests/result/${attemptId}`);
        } catch (error: any) {
            const errorMessage = error.response?.data?.message || error.message || 'Failed to submit test. Please try again.';
            toast.error(errorMessage);
        } finally {
            setIsSubmitting(false);
        }
    };

    if (step === 'playing') {
        const currentQ = test?.questions[currentQuestionIdx];

        return (
            <div className="fixed inset-0 bg-background z-[100] flex flex-col font-sans">
                {/* 1. Header Bar */}
                <div className="h-20 bg-card-bg border-b border-card-border px-8 flex items-center justify-between shadow-sm">
                    <div className="flex items-center gap-6">
                        <div className="h-10 w-10 bg-blue-600 rounded-xl flex items-center justify-center text-white">
                            <Zap className="h-5 w-5" />
                        </div>
                        <div className="hidden md:block">
                            <h2 className="text-sm font-black text-foreground uppercase tracking-tight italic">{test?.name_en}</h2>
                            <p className="text-[9px] font-bold text-foreground/30 uppercase tracking-widest mt-0.5">Mission ID: #{test?.id}</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-10">
                        {/* Status Counts */}
                        <div className="hidden lg:flex items-center gap-6 border-r border-card-border pr-10">
                            {[
                                { label: 'Answered', count: Object.values(responses).filter(r => r.status === 'answered').length, color: 'text-green-500' },
                                { label: 'Marked', count: Object.values(responses).filter(r => r.status === 'marked').length, color: 'text-purple-500' },
                                { label: 'Left', count: (test?.questions.length || 0) - Object.keys(responses).length, color: 'text-foreground/20' }
                            ].map((s, i) => (
                                <div key={i} className="text-center">
                                    <p className={cn("text-lg font-black leading-none", s.color)}>{s.count}</p>
                                    <p className="text-[7px] font-black uppercase tracking-widest text-foreground/40 mt-1">{s.label}</p>
                                </div>
                            ))}
                        </div>

                        {/* Timer */}
                        <div className={cn(
                            "flex items-center gap-4 px-6 py-3 rounded-2xl border transition-colors",
                            timeLeft < 300 ? "bg-red-500/10 border-red-500/20 text-red-500" : "bg-blue-500/5 border-blue-500/10 text-blue-600"
                        )}>
                            <Timer className={cn("h-5 w-5", timeLeft < 300 && "animate-pulse")} />
                            <span className="text-xl font-black tabular-nums tracking-tighter">{formatTime(timeLeft)}</span>
                        </div>

                        {/* Controls */}
                        <div className="flex items-center gap-3">
                            <button
                                onClick={() => setIsPaused(!isPaused)}
                                className="h-12 w-12 bg-card-bg border border-card-border rounded-xl flex items-center justify-center hover:bg-background transition-all"
                            >
                                {isPaused ? <Play className="h-5 w-5 text-green-600" /> : <Pause className="h-5 w-5 text-foreground/40" />}
                            </button>
                            <button
                                onClick={handleSubmit}
                                disabled={isSubmitting}
                                className="h-12 border border-card-border rounded-xl px-6 font-black text-[10px] uppercase tracking-widest text-foreground/40 hover:bg-background transition-all"
                            >
                                {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Submit'}
                            </button>
                        </div>
                    </div>
                </div>

                {/* 2. Main Workspace */}
                <div className="flex-1 flex overflow-hidden">
                    {/* Left: Question Area */}
                    <div className="flex-1 overflow-y-auto no-scrollbar p-12 bg-background">
                        <div className="max-w-4xl mx-auto space-y-12">
                            {/* Question Header */}
                            <div className="flex items-center justify-between border-b border-card-border pb-6">
                                <span className="bg-blue-600/10 text-blue-600 text-[10px] font-black px-4 py-2 rounded-full uppercase tracking-widest border border-blue-600/20">
                                    Question {currentQuestionIdx + 1}
                                </span>
                                <div className="flex items-center gap-4">
                                    <button
                                        onClick={toggleFullscreen}
                                        className="h-10 w-10 flex items-center justify-center bg-card-bg border border-card-border rounded-full hover:text-blue-600 transition-colors"
                                    >
                                        <Maximize className="h-4 w-4" />
                                    </button>
                                    <button
                                        onClick={() => setLanguage(language === 'en' ? 'hi' : 'en')}
                                        className="flex items-center gap-2 px-4 py-2 bg-card-bg border border-card-border rounded-full text-[10px] font-black uppercase tracking-widest text-foreground/40 hover:text-blue-600 transition-colors"
                                    >
                                        <Languages className="h-4 w-4" />
                                        {language === 'en' ? 'Hindi' : 'English'}
                                    </button>
                                </div>
                            </div>

                            {/* Question Text */}
                            <div className="space-y-8">
                                <div
                                    className="text-2xl font-black text-foreground uppercase tracking-tight italic leading-tight"
                                    dangerouslySetInnerHTML={{ __html: (language === 'en' ? currentQ?.question_en : currentQ?.question_hi) || '' }}
                                />

                                {currentQ?.image_path && (
                                    <div className="rounded-[2.5rem] overflow-hidden border border-card-border shadow-2xl">
                                        <img
                                            src={storageUrl(currentQ.image_path)}
                                            alt="Question Visual"
                                            className="w-full object-contain max-h-[400px]"
                                        />
                                    </div>
                                )}
                            </div>

                            {/* Options */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-20">
                                {currentQ?.options.map((opt, idx) => {
                                    const isSelected = responses[currentQ.id]?.selected_option_id === opt.id;
                                    return (
                                        <button
                                            key={opt.id}
                                            onClick={() => {
                                                const updatedData = {
                                                    ...(responses[currentQ.id] || {}),
                                                    selected_option_id: opt.id,
                                                    status: responses[currentQ.id]?.status === 'marked' ? 'marked' : 'answered',
                                                    visited: true
                                                };
                                                setResponses(prev => ({
                                                    ...prev,
                                                    [currentQ.id]: updatedData
                                                }));
                                                syncResponseToBackend(currentQ.id, updatedData);
                                            }}
                                            className={cn(
                                                "p-8 rounded-[2.5rem] border-2 text-left transition-all relative group flex flex-col gap-4",
                                                isSelected
                                                    ? "bg-blue-600/10 border-blue-600 shadow-xl"
                                                    : "bg-card-bg border-card-border hover:border-blue-500/30"
                                            )}
                                        >
                                            <div className="flex items-center gap-6">
                                                <div className={cn(
                                                    "h-10 w-10 shrink-0 rounded-xl flex items-center justify-center text-xs font-black border transition-all",
                                                    isSelected ? "bg-blue-600 border-blue-600 text-white" : "bg-background border-card-border text-foreground/40"
                                                )}>
                                                    {String.fromCharCode(65 + idx)}
                                                </div>
                                                <span className={cn(
                                                    "text-sm font-bold uppercase tracking-wide",
                                                    isSelected ? "text-blue-600" : "text-foreground/60"
                                                )}>
                                                    {language === 'en' ? opt.option_en : opt.option_hi}
                                                </span>
                                            </div>

                                            {opt.image_path && (
                                                <div className="rounded-2xl overflow-hidden border border-card-border/50">
                                                    <img
                                                        src={storageUrl(opt.image_path)}
                                                        alt="Option Visual"
                                                        className="w-full object-contain max-h-[150px]"
                                                    />
                                                </div>
                                            )}

                                            {isSelected && <div className="absolute top-4 right-4 h-2 w-2 bg-blue-600 rounded-full animate-ping" />}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    </div>

                    {/* Right: Palette Sidebar */}
                    <div className={cn(
                        "bg-card-bg border-l border-card-border transition-all overflow-hidden flex flex-col",
                        isSidebarOpen ? "w-[400px]" : "w-0"
                    )}>
                        <div className="p-8 border-b border-card-border flex items-center justify-between">
                            <div className="space-y-1">
                                <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-foreground/40 italic leading-none">Mission Analysis</h3>
                                <p className="text-[8px] font-black uppercase text-blue-600 tracking-widest">{test?.name_en}</p>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="h-2 w-2 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]" />
                                <span className="text-[8px] font-black uppercase text-foreground/20 italic">{isSyncing ? 'Uploading Vector...' : 'Real-time Sync'}</span>
                            </div>
                        </div>

                        {/* Top: Final Submission and Stats Breakdown */}
                        <div className="p-8 border-b border-card-border bg-emerald-600/5">
                            <button
                                onClick={handleSubmit}
                                disabled={isSubmitting}
                                className="w-full py-5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-black text-[11px] uppercase tracking-[0.2em] shadow-lg shadow-emerald-500/20 active:scale-95 transition-all flex items-center justify-center gap-3 group"
                            >
                                {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <ShieldCheck className="h-4 w-4" />}
                                PREPARE FINAL SUBMISSION
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto no-scrollbar p-8">
                            <div className="grid grid-cols-5 gap-4">
                                {test?.questions.map((q, i) => {
                                    const resp = responses[q.id];
                                    const isCurrent = currentQuestionIdx === i;

                                    let btnClass = "bg-background border-card-border text-foreground/20 italic"; // Not visited
                                    if (resp?.visited && !resp?.selected_option_id && resp?.status !== 'marked') {
                                        btnClass = "bg-red-500 border-red-500 text-white shadow-lg shadow-red-500/20";
                                    }
                                    if (resp?.status === 'answered') {
                                        btnClass = "bg-green-500 border-green-500 text-white shadow-lg shadow-green-500/20";
                                    }
                                    if (resp?.status === 'marked') {
                                        btnClass = "bg-purple-600 border-purple-600 text-white shadow-lg shadow-purple-600/20";
                                    }
                                    if (isCurrent) btnClass += " ring-4 ring-blue-500/30 ring-offset-2 ring-offset-background scale-110 z-10";

                                    return (
                                        <button
                                            key={q.id}
                                            onClick={() => {
                                                markAsVisited(q.id);
                                                setCurrentQuestionIdx(i);
                                            }}
                                            className={cn(
                                                "h-12 w-12 rounded-xl border flex items-center justify-center text-[10px] font-black transition-all hover:scale-110 relative",
                                                btnClass
                                            )}
                                        >
                                            {i + 1}
                                            {resp?.status === 'marked' && resp?.selected_option_id && (
                                                <div className="absolute -top-1 -right-1 h-3 w-3 bg-green-400 border-2 border-white dark:border-gray-800 rounded-full" />
                                            )}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Legend */}
                        <div className="p-8 border-t border-card-border bg-background/50 grid grid-cols-2 gap-4">
                            <div className="flex items-center gap-3">
                                <div className="h-3 w-3 rounded-full bg-green-500" />
                                <span className="text-[8px] font-black uppercase tracking-widest text-foreground/40">Answered</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="h-3 w-3 rounded-full bg-red-500" />
                                <span className="text-[8px] font-black uppercase tracking-widest text-foreground/40">Not Answered</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="h-3 w-3 rounded-full bg-purple-600" />
                                <span className="text-[8px] font-black uppercase tracking-widest text-foreground/40">Marked</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="h-3 w-3 rounded-full bg-background border border-card-border" />
                                <span className="text-[8px] font-black uppercase tracking-widest text-foreground/40">Not Visited</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* 3. Footer Action Bar */}
                <div className="h-24 bg-card-bg border-t border-card-border px-12 flex items-center justify-between">
                    <div className="flex items-center gap-6">
                        <button
                            onClick={handleMarkForReview}
                            className="px-8 py-4 border border-card-border hover:border-purple-500/30 text-foreground/40 hover:text-purple-600 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all"
                        >
                            Mark for Review & Next
                        </button>
                        <button
                            onClick={handleClearSelection}
                            className="px-8 py-4 text-foreground/20 hover:text-red-500 font-black text-[10px] uppercase tracking-widest transition-all"
                        >
                            Clear Selection
                        </button>
                    </div>

                    <div className="flex items-center gap-6">
                        <button
                            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                            className="h-14 w-14 bg-background border border-card-border rounded-2xl flex items-center justify-center text-foreground/40 hover:text-blue-600 transition-all"
                        >
                            <Menu className="h-6 w-6" />
                        </button>
                        <button
                            onClick={handleSaveAndNext}
                            className="px-16 py-5 bg-blue-600 hover:bg-blue-700 text-white rounded-[2rem] font-black text-[10px] uppercase tracking-[0.3em] shadow-xl shadow-blue-500/20 transition-all active:scale-95 flex items-center gap-4"
                        >
                            Save & Tactical Move
                            <ChevronRight className="h-4 w-4" />
                        </button>
                    </div>
                </div>

                <div className="fixed bottom-32 right-12 z-[50]">
                    <button
                        onClick={handleSubmit}
                        disabled={isSubmitting}
                        className="p-6 bg-emerald-600 hover:bg-emerald-700 text-white rounded-full shadow-2xl shadow-emerald-500/20 active:scale-90 transition-all group overflow-hidden relative"
                    >
                        <div className="flex items-center gap-3">
                            <Rocket className="h-6 w-6 group-hover:translate-x-12 transition-all duration-500" />
                            <span className="text-[10px] font-black uppercase tracking-widest hidden group-hover:block animate-in slide-in-from-left duration-300">Final Submission</span>
                        </div>
                    </button>
                </div>

                {/* Submit Confirmation Modal */}
                {showSubmitModal && (
                    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-xl z-[300] flex items-center justify-center p-6 animate-in fade-in duration-200">
                        <div className="bg-card-bg border border-card-border rounded-[3rem] p-12 max-w-md w-full shadow-2xl space-y-8 animate-in zoom-in-95 duration-200">
                            <div className="flex flex-col items-center text-center space-y-4">
                                <div className="h-16 w-16 bg-orange-500/10 rounded-[2rem] flex items-center justify-center border border-orange-500/20">
                                    <ShieldCheck className="h-8 w-8 text-orange-500" />
                                </div>
                                <h2 className="text-2xl font-black text-foreground uppercase tracking-tight italic">Final Submission</h2>
                                <p className="text-[11px] font-bold text-foreground/50 uppercase tracking-widest leading-relaxed">
                                    You are about to submit this test. This action cannot be undone.
                                </p>
                            </div>

                            <div className="grid grid-cols-3 gap-4 text-center p-6 bg-background rounded-[2rem] border border-card-border">
                                <div>
                                    <p className="text-xl font-black text-green-500">{Object.values(responses).filter(r => r.status === 'answered').length}</p>
                                    <p className="text-[8px] font-black uppercase tracking-widest text-foreground/40 mt-1">Answered</p>
                                </div>
                                <div>
                                    <p className="text-xl font-black text-purple-500">{Object.values(responses).filter(r => r.status === 'marked').length}</p>
                                    <p className="text-[8px] font-black uppercase tracking-widest text-foreground/40 mt-1">Marked</p>
                                </div>
                                <div>
                                    <p className="text-xl font-black text-foreground/30">{(test?.questions.length || 0) - Object.values(responses).filter(r => r.status === 'answered' || r.status === 'marked').length}</p>
                                    <p className="text-[8px] font-black uppercase tracking-widest text-foreground/40 mt-1">Skipped</p>
                                </div>
                            </div>

                            <div className="flex gap-4">
                                <button
                                    onClick={() => setShowSubmitModal(false)}
                                    className="flex-1 py-5 border border-card-border rounded-[2rem] text-[10px] font-black uppercase tracking-widest text-foreground/40 hover:text-foreground hover:border-foreground/20 transition-all"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleConfirmedSubmit}
                                    disabled={isSubmitting}
                                    className="flex-1 py-5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-[2rem] text-[10px] font-black uppercase tracking-widest shadow-xl shadow-emerald-500/20 transition-all active:scale-95 flex items-center justify-center gap-2"
                                >
                                    {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Confirm Submit'}
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Pause Overlay */}
                {isPaused && (
                    <div className="fixed inset-0 bg-slate-950/90 backdrop-blur-xl z-[200] flex flex-col items-center justify-center p-12 text-center animate-in fade-in duration-500">
                        <div className="h-24 w-24 bg-blue-600/10 rounded-[3rem] flex items-center justify-center mb-10 border border-blue-600/20">
                            <Pause className="h-10 w-10 text-blue-600" />
                        </div>
                        <h2 className="text-5xl font-black text-white uppercase tracking-tighter italic mb-4">TACTICAL PAUSE</h2>
                        <p className="text-sm font-bold text-white/40 uppercase tracking-[0.3em] mb-12">Mission timer suspended. Your current progress is encrypted and synced.</p>
                        <button
                            onClick={() => setIsPaused(false)}
                            className="px-20 py-8 bg-blue-600 hover:bg-blue-700 text-white rounded-[3rem] font-black text-sm uppercase tracking-[0.4em] transition-all shadow-2xl shadow-blue-500/40 active:scale-95 flex items-center gap-6"
                        >
                            RESUME MISSION
                            <Play className="h-6 w-6" />
                        </button>
                    </div>
                )}
            </div>
        );
    }
}
