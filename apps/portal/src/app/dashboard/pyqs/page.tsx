'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/api';
import { Clock, ChevronRight, FileText, Search, HelpCircle, Award } from 'lucide-react';
import Link from 'next/link';

type PyqTest = {
    id: number;
    name_en?: string;
    name_hi?: string;
    title?: string;
    duration_sec?: number;
    duration?: number;
    questions_count?: number;
    total_questions?: number;
    total_marks?: number;
};

export default function PYQPage() {
    const [tests, setTests] = useState<PyqTest[]>([]);
    const [loading, setLoading] = useState(true);
    const [query, setQuery] = useState('');

    useEffect(() => {
        fetchTests();
    }, []);

    const fetchTests = async () => {
        try {
            // Fetching tests with 'pyq' filter or identifying from metadata
            const res = await api.get('/tests?mode=pyq');
            setTests(Array.isArray(res.data) ? res.data : []);
        } catch (error) {
            console.error('Failed to fetch PYQs', error);
        } finally {
            setLoading(false);
        }
    };

    const visible = tests.filter((t) => {
        const name = `${t.name_en || t.title || ''} ${t.name_hi || ''}`.toLowerCase();
        return name.includes(query.toLowerCase());
    });

    return (
        <div className="space-y-6 pb-12">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h1 className="page-title">Previous year papers</h1>
                    <p className="page-subtitle">Original question papers from BPSC and other competitive exams.</p>
                </div>

                <div className="relative w-full md:w-80">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <input
                        type="search"
                        placeholder="Search papers"
                        aria-label="Search papers"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        className="input pl-10"
                    />
                </div>
            </div>

            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {Array.from({ length: 3 }).map((_, i) => (
                        <div key={i} className="card p-5 animate-pulse space-y-3">
                            <div className="h-5 w-3/4 bg-muted rounded" />
                            <div className="h-4 w-1/2 bg-muted rounded" />
                            <div className="h-11 w-full bg-muted rounded-xl mt-2" />
                        </div>
                    ))}
                </div>
            ) : visible.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {visible.map((test) => {
                        const name = test.name_en || test.title || 'Question paper';
                        const mins = test.duration_sec ? Math.round(test.duration_sec / 60) : test.duration;
                        const questions = test.questions_count ?? test.total_questions;
                        return (
                            <div key={test.id} className="card card-hover p-5 flex flex-col gap-3">
                                <div className="flex justify-between items-start gap-3">
                                    <div className="h-11 w-11 shrink-0 rounded-xl bg-accent text-accent-foreground flex items-center justify-center">
                                        <FileText className="h-5 w-5" />
                                    </div>
                                    <span className="badge badge-amber">PYQ</span>
                                </div>
                                <div>
                                    <h3 className="text-base font-semibold leading-snug">{name}</h3>
                                    {test.name_hi && <p className="text-sm text-muted-foreground mt-0.5">{test.name_hi}</p>}
                                </div>
                                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
                                    {mins != null && (
                                        <span className="flex items-center gap-1.5"><Clock className="h-4 w-4" /> {mins} min</span>
                                    )}
                                    {questions != null && (
                                        <span className="flex items-center gap-1.5"><HelpCircle className="h-4 w-4" /> {questions} questions</span>
                                    )}
                                    {test.total_marks != null && (
                                        <span className="flex items-center gap-1.5"><Award className="h-4 w-4" /> {test.total_marks} marks</span>
                                    )}
                                </div>
                                <Link href={`/dashboard/tests/play/${test.id}`} className="btn btn-primary mt-auto">
                                    Start paper
                                    <ChevronRight className="h-4 w-4" />
                                </Link>
                            </div>
                        );
                    })}
                </div>
            ) : (
                <div className="card p-10 text-center">
                    <FileText className="h-10 w-10 mx-auto text-muted-foreground/50" />
                    <h3 className="mt-4 text-lg font-semibold">No papers found</h3>
                    <p className="mt-1 text-sm text-muted-foreground">
                        {query ? 'Try a different search.' : 'Previous year papers will appear here once they are added.'}
                    </p>
                </div>
            )}
        </div>
    );
}
