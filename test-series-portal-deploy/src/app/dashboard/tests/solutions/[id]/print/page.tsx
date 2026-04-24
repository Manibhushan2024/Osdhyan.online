'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import api from '@/lib/api';
import {
    CheckCircle2,
    XCircle,
    Info,
    Zap,
    Download,
    ArrowLeft
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTheme } from '@/components/providers/ThemeProvider';

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
    test: {
        name_en: string;
        exam?: { name_en: string };
        questions: Question[];
    };
    responses: Response[];
    user: {
        name: string;
    };
    created_at: string;
};

export default function FullSolutionPrint() {
    const params = useParams();
    const router = useRouter();
    const [attempt, setAttempt] = useState<Attempt | null>(null);
    const [language, setLanguage] = useState<'en' | 'hi'>('en');
    const [loading, setLoading] = useState(true);

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

    const handlePrint = () => {
        window.print();
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black"></div>
            </div>
        );
    }

    if (!attempt) return null;

    return (
        <div className="bg-white min-h-screen text-black p-8 md:p-12 print:p-0 max-w-5xl mx-auto font-serif">
            {/* Header - Print Only / Screen */}
            <div className="mb-8 border-b-2 border-black pb-6 flex justify-between items-start">
                <div>
                    <h1 className="text-3xl font-black uppercase tracking-tight mb-2">{attempt.test.name_en}</h1>
                    <div className="flex flex-col text-sm font-bold uppercase tracking-widest text-gray-600 gap-1">
                        <span>Candidate: {attempt.user?.name || 'N/A'}</span>
                        <span>Date: {new Date(attempt.created_at).toLocaleDateString()}</span>
                        <span>Exam: {attempt.test.exam?.name_en || 'General'}</span>
                    </div>
                </div>
                <div className="print:hidden flex flex-col gap-4 items-end">
                    <button
                        onClick={() => router.back()}
                        className="flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-gray-500 hover:text-black"
                    >
                        <ArrowLeft className="h-4 w-4" /> Go Back
                    </button>
                    <button
                        onClick={handlePrint}
                        className="px-8 py-3 bg-black text-white rounded-xl font-bold uppercase tracking-widest shadow-lg hover:bg-gray-800 transition-all flex items-center gap-2"
                    >
                        <Download className="h-4 w-4" /> Print PDF
                    </button>
                    <button
                        onClick={() => setLanguage(language === 'en' ? 'hi' : 'en')}
                        className="px-6 py-2 border border-black rounded-lg text-xs font-bold uppercase tracking-widest hover:bg-black hover:text-white transition-all"
                    >
                        Switch to {language === 'en' ? 'Hindi' : 'English'}
                    </button>
                </div>
            </div>

            {/* Questions List */}
            <div className="space-y-12">
                {attempt.test.questions.map((q, index) => {
                    const userResp = attempt.responses.find(r => r.question_id === q.id);
                    const status = !userResp?.selected_option_id ? 'skipped' : (userResp.marks_obtained > 0 ? 'correct' : 'wrong');

                    return (
                        <div key={q.id} className="break-inside-avoid page-break-after-auto border-b border-gray-200 pb-12 last:border-0">
                            {/* Question Header */}
                            <div className="flex items-start justify-between mb-6">
                                <div className="flex items-center gap-4">
                                    <span className="bg-black text-white px-3 py-1 rounded-md text-sm font-bold">Q.{index + 1}</span>
                                    {status === 'correct' && <span className="text-green-600 font-bold text-xs uppercase border border-green-600 px-2 py-0.5 rounded">Correct (+{userResp?.marks_obtained})</span>}
                                    {status === 'wrong' && <span className="text-red-600 font-bold text-xs uppercase border border-red-600 px-2 py-0.5 rounded">Wrong (0)</span>}
                                    {status === 'skipped' && <span className="text-gray-500 font-bold text-xs uppercase border border-gray-500 px-2 py-0.5 rounded">Not Attempted</span>}
                                </div>
                                <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">{q.subject?.name_en || 'General'}</span>
                            </div>

                            {/* Question Text */}
                            <div className="mb-6 text-xl font-bold leading-tight">
                                {language === 'en' ? q.question_en : q.question_hi}
                            </div>

                            {/* Options */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                                {q.options.map((opt, i) => {
                                    const isSelected = userResp?.selected_option_id === opt.id;
                                    const isCorrect = opt.is_correct;

                                    return (
                                        <div key={opt.id} className={cn(
                                            "p-4 rounded-xl border flex items-center justify-between",
                                            isCorrect ? "bg-green-50 border-green-600 text-black print:bg-white print:border-green-600 print:text-black" :
                                                isSelected ? "bg-red-50 border-red-600 text-black print:bg-white print:border-red-600 print:text-black" :
                                                    "border-gray-200"
                                        )}>
                                            <div className="flex items-center gap-3">
                                                <div className={cn(
                                                    "h-6 w-6 rounded-full flex items-center justify-center text-xs font-bold border",
                                                    isCorrect ? "bg-green-600 border-green-600 text-white" :
                                                        isSelected ? "bg-red-600 border-red-600 text-white" : "bg-gray-100 border-gray-200 text-gray-500"
                                                )}>
                                                    {String.fromCharCode(65 + i)}
                                                </div>
                                                <span className="text-sm font-medium">{language === 'en' ? opt.option_en : opt.option_hi}</span>
                                            </div>
                                            {isCorrect && <CheckCircle2 className="h-4 w-4 text-green-600" />}
                                            {!isCorrect && isSelected && <XCircle className="h-4 w-4 text-red-600" />}
                                        </div>
                                    );
                                })}
                            </div>

                            {/* Explanation */}
                            <div className="bg-gray-50 p-6 rounded-2xl border border-gray-200 print:bg-white print:border-gray-300">
                                <div className="flex items-center gap-2 mb-3 text-gray-500">
                                    <Info className="h-4 w-4" />
                                    <span className="text-xs font-black uppercase tracking-widest">Logic & Explanation</span>
                                </div>
                                <div className="text-sm text-gray-700 leading-relaxed font-medium">
                                    {language === 'en' ? q.explanation_en : q.explanation_hi || 'No explanation available.'}
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Print Footer */}
            <div className="mt-12 pt-8 border-t border-gray-200 text-center text-xs font-bold text-gray-400 uppercase tracking-widest">
                Generated by OSDHYAN AI Test Platform • {new Date().getFullYear()}
            </div>

            <style dangerouslySetInnerHTML={{
                __html: `
                @media print {
                    @page {
                        margin: 1.5cm;
                    }
                    body {
                        -webkit-print-color-adjust: exact;
                        print-color-adjust: exact;
                    }
                }
            `}} />
        </div>
    );
}
