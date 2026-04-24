'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/api';
import {
    ChevronDown,
    ChevronRight,
    Book,
    Layers,
    Target,
    Search,
    BookOpen
} from 'lucide-react';
import { cn } from '@/lib/utils';

type Topic = {
    id: number;
    name_en: string;
    name_hi: string;
};

type Chapter = {
    id: number;
    name_en: string;
    name_hi: string;
    topics: Topic[];
};

type Subject = {
    id: number;
    name_en: string;
    name_hi: string;
    chapters: Chapter[];
};

type Exam = {
    id: number;
    name_en: string;
    name_hi: string;
    subjects?: Subject[];
};

export default function SyllabusPage() {
    const [exams, setExams] = useState<Exam[]>([]);
    const [selectedExamId, setSelectedExamId] = useState<number | null>(null);
    const [selectedExamData, setSelectedExamData] = useState<Exam | null>(null);
    const [loading, setLoading] = useState(true);
    const [openSubjects, setOpenSubjects] = useState<number[]>([]);
    const [openChapters, setOpenChapters] = useState<number[]>([]);

    useEffect(() => {
        fetchExams();
    }, []);

    const fetchExams = async () => {
        try {
            const res = await api.get('/exams');
            setExams(res.data);
            if (res.data.length > 0) {
                setSelectedExamId(res.data[0].id);
                fetchHierarchy(res.data[0].id);
            }
        } catch (error) {
            console.error('Failed to fetch exams', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchHierarchy = async (examId: number) => {
        setLoading(true);
        try {
            const res = await api.get(`/exams/${examId}/full`);
            setSelectedExamData(res.data);
            // Auto-open first subject
            if (res.data.subjects?.length > 0) {
                setOpenSubjects([res.data.subjects[0].id]);
            }
        } catch (error) {
            console.error('Failed to fetch hierarchy', error);
        } finally {
            setLoading(false);
        }
    };

    const toggleSubject = (id: number) => {
        setOpenSubjects(prev =>
            prev.includes(id) ? prev.filter(sId => sId !== id) : [...prev, id]
        );
    };

    const toggleChapter = (id: number) => {
        setOpenChapters(prev =>
            prev.includes(id) ? prev.filter(cId => cId !== id) : [...prev, id]
        );
    };

    return (
        <div className="max-w-5xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Syllabus Explorer</h1>
                <p className="mt-2 text-gray-600">Browse your exam course structure and set study goals.</p>
            </div>

            <div className="flex flex-col md:flex-row gap-6">
                {/* Exam Selection Tabs */}
                <div className="flex flex-wrap gap-2 mb-6">
                    {exams.map(exam => (
                        <button
                            key={exam.id}
                            onClick={() => {
                                setSelectedExamId(exam.id);
                                fetchHierarchy(exam.id);
                            }}
                            className={cn(
                                "px-4 py-2 rounded-full text-sm font-medium transition-all shadow-sm border",
                                selectedExamId === exam.id
                                    ? "bg-blue-600 text-white border-blue-600"
                                    : "bg-white text-gray-600 hover:bg-gray-50 border-gray-200"
                            )}
                        >
                            {exam.name_en}
                        </button>
                    ))}
                </div>
            </div>

            {loading ? (
                <div className="flex justify-center py-20">
                    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
                </div>
            ) : (
                <div className="space-y-4">
                    {selectedExamData?.subjects?.map((subject) => (
                        <div key={subject.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden text-sm">
                            <button
                                onClick={() => toggleSubject(subject.id)}
                                className="w-full flex items-center justify-between p-4 bg-gray-50/50 hover:bg-gray-50 transition-colors"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="bg-blue-100 p-2 rounded-lg">
                                        <Book className="h-5 w-5 text-blue-600" />
                                    </div>
                                    <div className="text-left font-semibold text-gray-900 text-base">
                                        {subject.name_en}
                                        <p className="text-xs text-blue-600 font-normal mt-0.5">{subject.chapters.length} Chapters</p>
                                    </div>
                                </div>
                                {openSubjects.includes(subject.id) ? (
                                    <ChevronDown className="h-5 w-5 text-gray-400" />
                                ) : (
                                    <ChevronRight className="h-5 w-5 text-gray-400" />
                                )}
                            </button>

                            {openSubjects.includes(subject.id) && (
                                <div className="p-2 space-y-2 bg-white">
                                    {subject.chapters.map((chapter) => (
                                        <div key={chapter.id} className="rounded-lg border border-gray-100 overflow-hidden">
                                            <button
                                                onClick={() => toggleChapter(chapter.id)}
                                                className="w-full flex items-center justify-between p-3 hover:bg-gray-50 transition-colors text-left"
                                            >
                                                <div className="flex items-center gap-3 ml-2">
                                                    <Layers className="h-4 w-4 text-gray-400" />
                                                    <span className="font-medium text-gray-700">{chapter.name_en}</span>
                                                </div>
                                                {openChapters.includes(chapter.id) ? (
                                                    <ChevronDown className="h-4 w-4 text-gray-400" />
                                                ) : (
                                                    <ChevronRight className="h-4 w-4 text-gray-400" />
                                                )}
                                            </button>

                                            {openChapters.includes(chapter.id) && (
                                                <div className="px-10 py-3 bg-gray-50/30 border-t border-gray-50 space-y-2">
                                                    {chapter.topics.map((topic) => (
                                                        <div key={topic.id} className="flex items-center gap-3 text-gray-600 group cursor-pointer hover:text-blue-600">
                                                            <Target className="h-3 w-3 text-gray-300 group-hover:text-blue-400" />
                                                            <span className="text-sm font-medium">{topic.name_en}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
