'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/api';
import { BookOpen, Clock, ChevronRight, FileText, Search, Filter } from 'lucide-react';
import Link from 'next/link';

export default function PYQPage() {
    const [tests, setTests] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchTests();
    }, []);

    const fetchTests = async () => {
        try {
            // Fetching tests with 'pyq' filter or identifying from metadata
            const res = await api.get('/tests?mode=pyq');
            setTests(res.data);
        } catch (error) {
            console.error('Failed to fetch PYQs', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-7xl mx-auto space-y-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 tracking-tight italic">Previous Year Papers</h1>
                    <p className="mt-2 text-gray-600 font-medium">Original question papers from BPSC and other competitive exams.</p>
                </div>

                <div className="flex items-center gap-3">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search papers..."
                            className="pl-10 pr-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 bg-white text-sm"
                        />
                    </div>
                    <button className="p-2 border border-gray-200 rounded-xl hover:bg-gray-50 bg-white transition-colors">
                        <Filter className="h-5 w-5 text-gray-600" />
                    </button>
                </div>
            </div>

            {loading ? (
                <div className="flex justify-center py-20">
                    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {tests.length > 0 ? tests.map((test) => (
                        <div key={test.id} className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all group">
                            <div className="flex justify-between items-start mb-4">
                                <div className="h-12 w-12 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600">
                                    <FileText className="h-6 w-6" />
                                </div>
                                <span className="bg-orange-100 text-orange-700 text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wider">
                                    PYQ
                                </span>
                            </div>
                            <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors uppercase tracking-tight">
                                {test.title}
                            </h3>
                            <div className="flex items-center gap-4 text-sm text-gray-500 font-medium mb-6">
                                <div className="flex items-center gap-1">
                                    <Clock className="h-4 w-4" />
                                    {test.duration} mins
                                </div>
                                <div className="flex items-center gap-1">
                                    <BookOpen className="h-4 w-4" />
                                    {test.total_questions} Questions
                                </div>
                            </div>
                            <Link
                                href={`/dashboard/tests/${test.id}`}
                                className="w-full flex items-center justify-center gap-2 py-3 bg-gray-900 text-white rounded-xl font-bold hover:bg-blue-600 transition-all shadow-lg"
                            >
                                Start Paper
                                <ChevronRight className="h-4 w-4" />
                            </Link>
                        </div>
                    )) : (
                        <div className="col-span-full py-20 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200 flex flex-col items-center justify-center">
                            <FileText className="h-12 w-12 text-gray-300 mb-4" />
                            <p className="text-gray-500 font-medium text-lg italic">No Previous Year Papers found in your collection.</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
