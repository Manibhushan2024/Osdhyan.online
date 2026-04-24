'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/api';
import {
    Trophy,
    Clock,
    Calendar,
    ChevronRight,
    CheckCircle2,
    XCircle,
    Zap,
    History as HistoryIcon
} from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

export default function HistoryPage() {
    const [history, setHistory] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [hideScores, setHideScores] = useState(false);

    useEffect(() => {
        fetchHistory();
        const stored = localStorage.getItem('hide_scores');
        if (stored === 'true') setHideScores(true);
    }, []);

    const toggleHideScores = () => {
        const newVal = !hideScores;
        setHideScores(newVal);
        localStorage.setItem('hide_scores', String(newVal));
    };

    const fetchHistory = async () => {
        try {
            const res = await api.get('/analytics/overview');
            setHistory(res.data.recent_activity || []);
        } catch (error) {
            console.error('Failed to fetch history', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-7xl mx-auto space-y-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 tracking-tight italic">Your Learning History</h1>
                    <p className="mt-2 text-gray-600 font-medium italic">Track your past performance and review solutions.</p>
                </div>
                <button
                    onClick={toggleHideScores}
                    className={cn(
                        "px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-widest transition-all",
                        hideScores ? "bg-blue-600 text-white shadow-lg" : "bg-white border border-gray-200 text-gray-500 hover:border-blue-200"
                    )}
                >
                    {hideScores ? 'Show Scores' : 'Hide My Scores'}
                </button>
            </div>

            {loading ? (
                <div className="flex justify-center py-20">
                    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
                </div>
            ) : (
                <div className="space-y-4">
                    {history.length > 0 ? history.map((item, idx) => (
                        <div key={idx} className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6 hover:border-blue-200 transition-all group">
                            <div className="flex items-center gap-4">
                                <div className="h-14 w-14 bg-gray-50 rounded-2xl flex items-center justify-center text-blue-600 group-hover:bg-blue-50 transition-colors">
                                    <Trophy className="h-8 w-8" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-gray-900 text-lg uppercase tracking-tight">{item.test_title || 'Mock Test Attempt'}</h3>
                                    <div className="flex items-center gap-4 text-sm text-gray-500 mt-1 font-medium">
                                        <span className="flex items-center gap-1">
                                            <Calendar className="h-3.5 w-3.5" />
                                            {new Date().toLocaleDateString()}
                                        </span>
                                        <span className="flex items-center gap-1">
                                            <Zap className="h-3.5 w-3.5" />
                                            {hideScores ? 'Score Hidden' : `${item.score || 0}/${item.max_marks || 100} Marks`}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center gap-6">
                                <div className="text-right hidden sm:block">
                                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Accuracy</p>
                                    <p className={item.accuracy > 70 ? "text-lg font-bold text-green-600" : "text-lg font-bold text-orange-600"}>
                                        {hideScores ? '??' : `${item.accuracy}%`}
                                    </p>
                                </div>
                                <Link
                                    href={`/dashboard/analytics`}
                                    className="flex items-center justify-center gap-2 px-6 py-3 bg-gray-50 text-gray-900 font-bold rounded-xl hover:bg-blue-600 hover:text-white transition-all shadow-sm border border-gray-200"
                                >
                                    View Solution
                                    <ChevronRight className="h-4 w-4" />
                                </Link>
                            </div>
                        </div>
                    )) : (
                        <div className="py-20 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200 flex flex-col items-center justify-center">
                            <HistoryIcon className="h-12 w-12 text-gray-300 mb-4" />
                            <p className="text-gray-500 font-medium text-lg italic tracking-tight">You haven't attempted any tests yet.</p>
                            <Link href="/dashboard/tests" className="mt-4 text-blue-600 font-bold hover:underline">Start your first test →</Link>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
