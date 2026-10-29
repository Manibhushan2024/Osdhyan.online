'use client';

import { Fragment, ReactNode, useState, useEffect, useRef } from 'react';
import { useParams } from 'next/navigation';
import api from '@/lib/api';
import QuestionText from '@/components/tests/QuestionText';
import {
    ChevronLeft,
    ChevronRight,
    CheckCircle2,
    XCircle,
    Info,
    Download,
    Bot,
    Send,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import AttemptSwitcher, { AttemptRef, reportHref } from '@/components/tests/AttemptSwitcher';
import ConceptRevisePanel, { WeakConceptsSummary, runWithConcurrency, useConceptNotes } from '@/components/tests/ConceptRevisePanel';

/** Weak-concepts summary looks up notes for at most this many wrong answers. */
const WEAK_CONCEPT_LIMIT = 60;

type Option = {
    id: number;
    option_en: string;
    option_hi: string;
    is_correct: boolean;
};

type Question = {
    id: number;
    question_en: string;
    question_hi: string;
    options: Option[];
    explanation_en: string;
    explanation_hi: string;
    subject: { name_en: string } | null;
};

type Response = {
    question_id: number;
    selected_option_id: number | null;
    marks_obtained: number;
};

type Attempt = {
    id: number;
    test_id?: number;
    attempt_number?: number | null;
    attempts?: AttemptRef[];
    test: {
        id?: number;
        name_en: string;
        questions: Question[];
    };
    responses: Response[];
};

type ChatMessage = {
    role: 'user' | 'assistant';
    content: string;
};

function renderInlineTokens(text: string): ReactNode[] {
    const parts = text.split(/(\*\*[^*]+\*\*)/g);
    return parts.filter(Boolean).map((part, index) => {
        const boldMatch = part.match(/^\*\*([^*]+)\*\*$/);
        if (boldMatch) {
            return <strong key={`bold-${index}`} className="font-extrabold text-foreground">{boldMatch[1]}</strong>;
        }
        return <Fragment key={`txt-${index}`}>{part}</Fragment>;
    });
}

function FormattedAssistantMessage({ content }: { content: string }) {
    const blocks = content
        .replace(/\r\n/g, '\n')
        .split(/\n{2,}/)
        .map((block) => block.trim())
        .filter(Boolean);

    const bulletRegex = /^[-*•]\s+/;
    const numberRegex = /^\d+[.)]\s+/;

    return (
        <div className="space-y-3">
            {blocks.map((block, blockIndex) => {
                const lines = block.split('\n').map((line) => line.trim()).filter(Boolean);
                if (lines.length === 0) return null;

                if (lines.every((line) => bulletRegex.test(line))) {
                    return (
                        <ul key={`ul-${blockIndex}`} className="list-disc space-y-1 pl-5 text-foreground/80">
                            {lines.map((line, lineIndex) => (
                                <li key={`li-${blockIndex}-${lineIndex}`}>
                                    {renderInlineTokens(line.replace(bulletRegex, ''))}
                                </li>
                            ))}
                        </ul>
                    );
                }

                if (lines.every((line) => numberRegex.test(line))) {
                    return (
                        <ol key={`ol-${blockIndex}`} className="list-decimal space-y-1 pl-5 text-foreground/80">
                            {lines.map((line, lineIndex) => (
                                <li key={`oli-${blockIndex}-${lineIndex}`}>
                                    {renderInlineTokens(line.replace(numberRegex, ''))}
                                </li>
                            ))}
                        </ol>
                    );
                }

                if (lines.length === 1 && lines[0].endsWith(':') && lines[0].length <= 80) {
                    return (
                        <h4 key={`h-${blockIndex}`} className="text-xs font-black uppercase tracking-wide text-blue-600">
                            {lines[0]}
                        </h4>
                    );
                }

                return (
                    <p key={`p-${blockIndex}`} className="text-foreground/80 leading-6">
                        {renderInlineTokens(lines.join(' '))}
                    </p>
                );
            })}
        </div>
    );
}

export default function SolutionHub() {
    const params = useParams();
    const [attempt, setAttempt] = useState<Attempt | null>(null);
    const [currentIdx, setCurrentIdx] = useState(0);
    const [language, setLanguage] = useState<'en' | 'hi'>('en');
    const [loading, setLoading] = useState(true);
    const [showAiChat, setShowAiChat] = useState(false);
    const [chatMessage, setChatMessage] = useState('');
    const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
    const [sendingChat, setSendingChat] = useState(false);
    const [filter, setFilter] = useState<'all' | 'correct' | 'wrong' | 'skipped'>('all');
    const conceptNotes = useConceptNotes();
    const { loadQuestion: loadConcept } = conceptNotes;
    const [openConcept, setOpenConcept] = useState<Record<number, boolean>>({});
    const questionCardRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        fetchSolutions();
    }, [params.id]);

    const fetchSolutions = async () => {
        try {
            const res = await api.get(`/attempts/${params.id}`);
            setAttempt(res.data);
        } catch (error) {
            console.error('Failed to fetch solutions', error);
        } finally {
            setLoading(false);
        }
    };

    // "Weak concepts": look up the notes chapter behind each wrong answer (6 at a time).
    useEffect(() => {
        if (!attempt) return;
        const wrong = (attempt.test?.questions || [])
            .filter((q) => {
                const r = attempt.responses.find((x) => x.question_id === q.id);
                return !!r?.selected_option_id && Number(r.marks_obtained) <= 0;
            })
            .slice(0, WEAK_CONCEPT_LIMIT)
            .map((q) => q.id);
        let cancelled = false;
        void runWithConcurrency(wrong, 6, loadConcept, () => cancelled);
        return () => { cancelled = true; };
    }, [attempt, loadConcept]);

    const getQuestionStatus = (q: Question) => {
        if (!attempt) return 'skipped';
        const resp = attempt.responses.find(r => r.question_id === q.id);
        if (!resp?.selected_option_id) return 'skipped';
        return resp.marks_obtained! > 0 ? 'correct' : 'wrong';
    };

    const questions = attempt?.test?.questions || [];
    const filteredQuestions = questions.filter(q => {
        if (filter === 'all') return true;
        return getQuestionStatus(q) === filter;
    });

    const currentQ = filteredQuestions[currentIdx] || questions[0] || null;
    const currentQuestionId = currentQ?.id || null;
    const userResponse = currentQ && attempt
        ? attempt.responses.find(r => r.question_id === currentQ.id)
        : null;
    const correctOption = currentQ?.options?.find(o => o.is_correct) || null;

    useEffect(() => {
        if (!currentQuestionId) return;
        setChatMessages([
            {
                role: 'assistant',
                content: 'Ask me anything about this question: the concept, where you went wrong, a shortcut, or an explanation in Hindi.',
            },
        ]);
        setChatMessage('');
    }, [currentQuestionId]);

    if (loading) return null;
    if (!attempt || !currentQ) return null;

    const wrongQuestionIds = questions.filter((q) => getQuestionStatus(q) === 'wrong').map((q) => q.id);
    const currentStatus = getQuestionStatus(currentQ);

    const jumpToQuestion = (questionId: number) => {
        const index = questions.findIndex((q) => q.id === questionId);
        if (index < 0) return;
        setFilter('all');
        setCurrentIdx(index);
        setOpenConcept((prev) => ({ ...prev, [questionId]: true }));
        void loadConcept(questionId);
        requestAnimationFrame(() => {
            questionCardRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        });
    };

    const handleSendChat = async () => {
        const message = chatMessage.trim();
        if (!message || !attempt || !currentQ || sendingChat) return;

        const userEntry: ChatMessage = { role: 'user', content: message };
        const nextHistory = [...chatMessages, userEntry];

        setChatMessages(nextHistory);
        setChatMessage('');
        setSendingChat(true);

        try {
            const response = await api.post(`/attempts/${attempt.id}/assistant-chat`, {
                question_id: currentQ.id,
                message,
                history: nextHistory.slice(-12).map((entry) => ({
                    role: entry.role,
                    content: entry.content,
                })),
            });

            const assistantReply = response?.data?.reply || 'No response received from assistant.';
            setChatMessages((prev) => [...prev, { role: 'assistant', content: assistantReply }]);
        } catch (error: unknown) {
            const apiMessage = (
                typeof error === 'object'
                && error !== null
                && 'response' in error
                && typeof (error as { response?: unknown }).response === 'object'
            )
                ? ((error as { response?: { data?: { message?: string } } }).response?.data?.message ?? null)
                : null;
            const fallback = apiMessage === 'Unauthorized attempt access.'
                ? 'Session mismatch detected. Please login again from Student Portal.'
                : (apiMessage || 'AI assistant is currently unavailable. Please try again.');
            setChatMessages((prev) => [...prev, { role: 'assistant', content: fallback }]);
        } finally {
            setSendingChat(false);
        }
    };

    return (
        <div className="max-w-7xl mx-auto space-y-12 pb-20 px-4 md:px-0 animate-in fade-in duration-1000">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
                <div className="space-y-4">
                    <div className="flex items-center gap-4 text-xs font-black uppercase tracking-wide text-foreground/40">
                        <Link href={`/dashboard/tests/result/${attempt.id}`} className="hover:text-blue-600 transition-colors">Result</Link>
                        <ChevronRight className="h-3 w-3" />
                        <span>Solutions</span>
                    </div>
                    <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
                        Solutions
                    </h1>
                    {attempt.test?.name_en && (
                        <p className="text-sm text-muted-foreground">{attempt.test.name_en}</p>
                    )}
                </div>

                <Link
                    href={reportHref(attempt.id)}
                    className="self-start md:self-auto px-6 py-3 bg-blue-600 text-white rounded-2xl font-black text-xs uppercase tracking-wide shadow-xl shadow-blue-500/20 active:scale-95 flex items-center gap-3"
                >
                    <Download className="h-4 w-4" />
                    Download PDF
                </Link>
            </div>

            <AttemptSwitcher
                currentId={attempt.id}
                attemptNumber={attempt.attempt_number}
                attempts={attempt.attempts}
                testId={attempt.test_id ?? attempt.test?.id}
                hrefFor={(id) => `/dashboard/tests/solutions/${id}`}
                showDownload={false}
            />

            <WeakConceptsSummary
                wrongIds={wrongQuestionIds.slice(0, WEAK_CONCEPT_LIMIT)}
                totalWrong={wrongQuestionIds.length}
                notes={conceptNotes}
                onJump={jumpToQuestion}
            />

            <style dangerouslySetInnerHTML={{
                __html: `
                @media print {
                    body * {
                        visibility: hidden;
                    }
                    .question-card, .question-card *,
                    .explanation-card, .explanation-card * {
                        visibility: visible;
                    }
                    .question-card {
                        position: absolute;
                        left: 0;
                        top: 0;
                        width: 100%;
                    }
                    .explanation-card {
                        position: absolute;
                        left: 0;
                        top: 500px; /* Adjust based on content */
                        width: 100%;
                        margin-top: 2rem;
                    }
                    /* Hide header, sidebar, nav */
                    header, nav, aside, .sidebar {
                        display: none !important;
                    }
                }
            `}} />

            {/* Solution Workspace */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                {/* Palette Sidebar */}
                <div className="lg:col-span-3 space-y-6">
                    <div className="bg-card-bg border border-card-border p-8 rounded-2xl shadow-sm">
                        <h3 className="text-xs font-black uppercase tracking-wide text-foreground/30 px-2 mb-4">Filter</h3>
                        <div className="flex flex-wrap gap-2 mb-6">
                            {(['all', 'correct', 'wrong', 'skipped'] as const).map((f) => (
                                <button
                                    key={f}
                                    onClick={() => { setFilter(f); setCurrentIdx(0); }}
                                    className={cn(
                                        "px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wide border transition-all",
                                        filter === f
                                            ? f === 'correct' ? "bg-green-500/10 border-green-500/30 text-green-600"
                                                : f === 'wrong' ? "bg-red-500/10 border-red-500/30 text-red-600"
                                                    : f === 'skipped' ? "bg-gray-500/10 border-gray-500/30 text-gray-500"
                                                        : "bg-blue-500/10 border-blue-500/30 text-blue-600"
                                            : "border-card-border text-foreground/30 hover:text-foreground/60"
                                    )}
                                >
                                    {f === 'all' ? `All (${attempt.test.questions.length})` :
                                        f === 'correct' ? `✓ (${attempt.test.questions.filter(q => getQuestionStatus(q) === 'correct').length})` :
                                            f === 'wrong' ? `✗ (${attempt.test.questions.filter(q => getQuestionStatus(q) === 'wrong').length})` :
                                                `— (${attempt.test.questions.filter(q => getQuestionStatus(q) === 'skipped').length})`}
                                </button>
                            ))}
                        </div>

                        <h3 className="text-xs font-black uppercase tracking-wide text-foreground/30 px-2 mb-6">Questions</h3>
                        <div className="grid grid-cols-5 gap-3">
                            {filteredQuestions.map((q, i) => {
                                const status = getQuestionStatus(q);

                                return (
                                    <button
                                        key={q.id}
                                        onClick={() => setCurrentIdx(i)}
                                        className={cn(
                                            "h-10 w-10 rounded-xl border-2 flex items-center justify-center text-xs font-black transition-all hover:scale-110",
                                            currentIdx === i ? "border-blue-600 bg-blue-600/10 text-blue-600" :
                                                status === 'skipped' ? "border-card-border text-foreground/20" :
                                                    status === 'correct' ? "border-green-500 bg-green-500/10 text-green-600" : "border-red-500 bg-red-500/10 text-red-600"
                                        )}
                                    >
                                        {attempt.test.questions.indexOf(q) + 1}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    <div className="bg-gradient-to-br from-blue-600/10 to-cyan-500/10 border border-blue-500/20 p-8 rounded-2xl shadow-sm space-y-4">
                        <div className="flex items-center gap-3 text-blue-600">
                            <Bot className="h-5 w-5" />
                            <h4 className="text-xs font-black uppercase tracking-wide ">Ask AI</h4>
                        </div>
                        <p className="text-xs font-bold text-foreground/50 uppercase tracking-wide leading-relaxed">
                            Ask about this question: the concept, a shortcut, or an explanation in Hindi.
                        </p>
                        <button
                            onClick={() => setShowAiChat(true)}
                            className="w-full py-4 bg-blue-600 text-white rounded-2xl font-black text-xs uppercase tracking-wide shadow-lg shadow-blue-500/20"
                        >
                            Start chat
                        </button>
                    </div>
                </div>

                {/* Question & Solution Area */}
                <div className="lg:col-span-9 space-y-8">
                    {/* Question Card */}
                    <div ref={questionCardRef} className="question-card scroll-mt-24 bg-card-bg border border-card-border p-12 rounded-2xl shadow-sm space-y-10 group">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-black text-blue-600 uppercase tracking-wide bg-blue-500/10 px-6 py-2 rounded-full border border-blue-600/20">
                                Question {currentIdx + 1}
                            </span>
                            <span className="text-xs font-black text-foreground/30 uppercase tracking-wide">
                                Subject: {currentQ.subject?.name_en ?? 'General'}
                            </span>
                        </div>

                        <h2 className="text-lg sm:text-xl font-semibold text-foreground leading-relaxed">
                            <QuestionText text={(language === 'en' ? currentQ.question_en : currentQ.question_hi) || currentQ.question_en} />
                        </h2>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {currentQ.options.map((opt, i) => {
                                const isUserSelected = userResponse?.selected_option_id === opt.id;
                                const isCorrect = opt.is_correct;

                                return (
                                    <div
                                        key={opt.id}
                                        className={cn(
                                            "p-8 rounded-2xl border-2 flex items-center justify-between transition-all",
                                            isCorrect ? "bg-green-500/5 border-green-500/30 text-green-600" :
                                                isUserSelected ? "bg-red-500/5 border-red-500/30 text-red-600" : "bg-background border-card-border text-foreground/40"
                                        )}
                                    >
                                        <div className="flex items-center gap-6">
                                            <div className={cn(
                                                "h-10 w-10 rounded-xl flex items-center justify-center text-xs font-black border",
                                                isCorrect ? "bg-green-500 border-green-500 text-white" :
                                                    isUserSelected ? "bg-red-500 border-red-500 text-white" : "bg-card-bg border-card-border text-foreground/40"
                                            )}>
                                                {String.fromCharCode(65 + i)}
                                            </div>
                                            <span className="text-sm font-bold uppercase tracking-wide">
                                                {language === 'en' ? opt.option_en : opt.option_hi}
                                            </span>
                                        </div>
                                        {isCorrect && <CheckCircle2 className="h-5 w-5" />}
                                        {!isCorrect && isUserSelected && <XCircle className="h-5 w-5" />}
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Explanation Card */}
                    <div className="explanation-card bg-card-bg border border-card-border rounded-2xl shadow-sm overflow-hidden animate-in slide-in-from-bottom-5">
                        <div className="p-8 border-b border-card-border bg-background/50 flex items-center gap-4">
                            <Info className="h-5 w-5 text-blue-600" />
                            <h3 className="text-xs font-black uppercase tracking-wide text-foreground/60 ">Explanation</h3>
                        </div>
                        <div className="p-5 sm:p-12 space-y-8">
                            <div className="prose prose-blue dark:prose-invert max-w-none text-foreground/70 font-medium uppercase tracking-wide leading-relaxed text-sm">
                                <span className="whitespace-pre-wrap">{language === 'en' ? currentQ.explanation_en : currentQ.explanation_hi || currentQ.explanation_en || "No explanation has been added for this question yet."}</span>
                            </div>

                            {/* Revise this concept: the matching notes section, inline */}
                            <ConceptRevisePanel
                                key={currentQ.id}
                                questionId={currentQ.id}
                                highlight={currentStatus !== 'correct'}
                                open={!!openConcept[currentQ.id]}
                                onOpenChange={(open) => setOpenConcept((prev) => ({ ...prev, [currentQ.id]: open }))}
                                notes={conceptNotes}
                            />
                        </div>
                    </div>

                    {/* Navigation */}
                    <div className="flex items-center justify-between gap-6 pt-4">
                        <button
                            disabled={currentIdx === 0}
                            onClick={() => setCurrentIdx(prev => prev - 1)}
                            className="flex-1 py-6 bg-card-bg border border-card-border rounded-2xl font-black text-xs uppercase tracking-wide transition-all hover:bg-background disabled:opacity-20 flex items-center justify-center gap-4"
                        >
                            <ChevronLeft className="h-4 w-4" />
                            Previous Logic
                        </button>
                        <button
                            disabled={currentIdx === filteredQuestions.length - 1}
                            onClick={() => setCurrentIdx(prev => prev + 1)}
                            className="flex-1 py-6 bg-blue-600 text-white rounded-2xl font-black text-xs uppercase tracking-wide transition-all shadow-xl shadow-blue-500/20 active:scale-95 flex items-center justify-center gap-4"
                        >
                            Next Logic
                            <ChevronRight className="h-4 w-4" />
                        </button>
                    </div>
                </div>
            </div>

            {/* AI Chat Drawer Overlay (Simplified for Step 1) */}
            {
                showAiChat && (
                    <div className="fixed inset-y-0 right-0 w-full md:w-[450px] bg-card-bg border-l border-card-border z-[200] shadow-3xl flex flex-col animate-in slide-in-from-right duration-500">
                        <div className="p-8 border-b border-card-border flex items-center justify-between bg-background">
                            <div className="flex items-center gap-4">
                                <div className="h-10 w-10 bg-blue-600 rounded-xl flex items-center justify-center">
                                    <Bot className="h-6 w-6 text-white" />
                                </div>
                                <div>
                                    <h3 className="text-sm font-black text-foreground uppercase tracking-tight ">OSDHYAN AI</h3>
                                    <p className="text-xs font-black text-green-500 uppercase tracking-wide">Online</p>
                                </div>
                            </div>
                            <button onClick={() => setShowAiChat(false)} className="p-2 hover:bg-background rounded-full transition-colors">
                                <ChevronRight className="h-6 w-6 text-foreground/20" />
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto p-8 space-y-8">
                            {chatMessages.map((entry, index) => (
                                <div
                                    key={`${entry.role}-${index}`}
                                    className={cn('flex gap-4', entry.role === 'user' ? 'justify-end' : '')}
                                >
                                    {entry.role === 'assistant' && (
                                        <div className="h-8 w-8 bg-blue-600/10 rounded-lg flex items-center justify-center shrink-0">
                                            <Bot className="h-4 w-4 text-blue-600" />
                                        </div>
                                    )}

                                    <div
                                        className={cn(
                                            'p-5 rounded-2xl max-w-[88%] shadow-sm',
                                            entry.role === 'assistant'
                                                ? 'bg-gradient-to-b from-blue-50/60 to-white dark:from-blue-900/15 dark:to-card-bg border border-blue-200/40 dark:border-blue-500/20 text-[12px] font-medium tracking-normal rounded-tl-none'
                                                : 'bg-blue-600 text-white rounded-tr-none text-xs font-bold uppercase tracking-wide'
                                        )}
                                    >
                                        {entry.role === 'assistant' ? (
                                            <FormattedAssistantMessage content={entry.content} />
                                        ) : (
                                            entry.content
                                        )}
                                    </div>
                                </div>
                            ))}

                            {sendingChat && (
                                <div className="flex gap-4">
                                    <div className="h-8 w-8 bg-blue-600/10 rounded-lg flex items-center justify-center shrink-0">
                                        <Bot className="h-4 w-4 text-blue-600" />
                                    </div>
                                    <div className="bg-background border border-card-border p-4 rounded-2xl rounded-tl-none text-xs font-bold text-foreground/50 uppercase tracking-wider">
                                        Processing question context...
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="p-8 bg-background border-t border-card-border">
                            <div className="relative">
                                <input
                                    type="text"
                                    placeholder="Ask: Why is option C wrong? Give shortcut..."
                                    value={chatMessage}
                                    onChange={(e) => setChatMessage(e.target.value)}
                                    onKeyDown={(event) => {
                                        if (event.key === 'Enter') {
                                            event.preventDefault();
                                            handleSendChat();
                                        }
                                    }}
                                    className="w-full bg-card-bg border border-card-border p-5 pr-14 rounded-2xl text-sm font-semibold tracking-wide focus:outline-none focus:border-blue-500/50 transition-all font-sans"
                                />
                                <button
                                    onClick={handleSendChat}
                                    disabled={sendingChat || !chatMessage.trim()}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 h-10 w-10 bg-blue-600 text-white rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <Send className="h-4 w-4" />
                                </button>
                            </div>
                        </div>
                    </div>
                )
            }
        </div >
    );
}
