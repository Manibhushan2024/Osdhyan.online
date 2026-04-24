'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import {
    ArrowLeft,
    Book,
    ChevronRight,
    FileText,
    Headphones,
    LayoutGrid,
    Layers,
    Loader2,
    Map,
    MonitorPlay,
    Sparkles,
} from 'lucide-react';
import api from '@/lib/api';

function formatCategoryName(value: string) {
    return value
        .split('-')
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
}

export default function CategorySubjectsPage() {
    const params = useParams();
    const router = useRouter();
    const [subjects, setSubjects] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const category = params.category as string;
    const categoryName = formatCategoryName(category || '');

    useEffect(() => {
        if (category) {
            fetchSubjects();
        }
    }, [category]);

    const fetchSubjects = async () => {
        try {
            const res = await api.get(`/courses/subjects?category=${category}`);
            setSubjects(res.data);
        } catch (error) {
            console.error('Failed to fetch subjects', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center py-40 gap-4">
                <Loader2 className="h-10 w-10 text-blue-600 animate-spin" />
                <p className="text-[10px] font-black text-foreground/40 uppercase tracking-[0.3em]">Loading {categoryName} content...</p>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto space-y-10 animate-in fade-in duration-1000 pb-20 px-4">
            {/* Breadcrumbs & Actions */}
            <div className="flex items-center justify-between gap-4 flex-wrap">
                <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-foreground/45">
                    <Link href="/dashboard/courses" className="hover:text-blue-600 transition-colors">Courses</Link>
                    <ChevronRight className="h-3 w-3" />
                    <span className="text-blue-600">{categoryName}</span>
                </div>

                <button
                    onClick={() => router.back()}
                    className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-foreground/60 hover:text-blue-600 transition-all group"
                >
                    <ArrowLeft className="h-3 w-3 group-hover:-translate-x-1 transition-transform" />
                    Back to Courses
                </button>
            </div>

            <div className="relative overflow-hidden rounded-[2.5rem] border border-blue-200/35 bg-gradient-to-br from-slate-950 via-blue-950 to-sky-900 p-8 md:p-10 shadow-[0_24px_60px_-35px_rgba(2,6,23,0.95)]">
                <div className="absolute -top-16 -right-8 h-56 w-56 rounded-full bg-cyan-300/20 blur-[90px]" />
                <div className="absolute -bottom-16 -left-12 h-56 w-56 rounded-full bg-blue-500/20 blur-[90px]" />

                <div className="relative z-10 space-y-5">
                    <h1 className="text-3xl md:text-5xl font-black text-white uppercase tracking-tight italic">
                        {categoryName} <span className="text-cyan-200">Learning Hub</span>
                    </h1>
                    <p className="text-cyan-100/85 font-semibold text-sm md:text-base max-w-3xl">
                        Open any subject and study in one immersive console with PDF, Audio, Video, Mindmap, and Infographic modes.
                    </p>

                    <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
                        {[
                            { icon: FileText, label: 'PDF' },
                            { icon: Headphones, label: 'Audio' },
                            { icon: MonitorPlay, label: 'Video' },
                            { icon: Map, label: 'Mindmap' },
                            { icon: Layers, label: 'Infographic' },
                        ].map((item) => (
                            <div key={item.label} className="rounded-xl border border-white/20 bg-white/10 px-3 py-2 flex items-center gap-2">
                                <item.icon className="h-4 w-4 text-cyan-200" />
                                <span className="text-[10px] font-black uppercase tracking-widest text-white">{item.label}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Subjects Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {subjects.length > 0 ? (
                    subjects.map((subject) => (
                        <Link
                            key={subject.id}
                            href={`/dashboard/courses/${category}/${subject.id}`}
                            className="group relative bg-card-bg border border-card-border p-7 rounded-[2rem] shadow-sm hover:shadow-2xl hover:border-blue-500/30 transition-all duration-500 overflow-hidden"
                        >
                            <div className="absolute top-4 right-8 opacity-5 group-hover:opacity-10 transition-opacity">
                                <Sparkles className="h-16 w-16 text-blue-600" />
                            </div>

                            <div className="relative z-10">
                                <div className="h-12 w-12 rounded-xl bg-blue-600/10 flex items-center justify-center mb-5 text-blue-600 border border-blue-600/20 group-hover:bg-blue-600 group-hover:text-white transition-all">
                                    <Book className="h-6 w-6" />
                                </div>

                                <h3 className="text-xl font-black text-foreground uppercase tracking-tight italic mb-2 group-hover:text-blue-500 transition-colors line-clamp-1">
                                    {subject.name_en}
                                </h3>
                                <p className="text-[10px] font-bold text-foreground/40 uppercase tracking-widest mb-5">
                                    {categoryName} Study Stream
                                </p>

                                <div className="flex gap-1.5 mb-5">
                                    {['PDF', 'Audio', 'Video', 'Map', 'Info'].map((label) => (
                                        <span key={label} className="rounded-full border border-gray-200 px-2 py-0.5 text-[9px] font-black uppercase tracking-wider text-foreground/45">
                                            {label}
                                        </span>
                                    ))}
                                </div>

                                <div className="flex items-center justify-between pt-5 border-t border-card-border">
                                    <div className="flex items-center gap-2">
                                        <div className="h-2 w-2 rounded-full bg-blue-500 animate-pulse" />
                                        <span className="text-[9px] font-black text-foreground/35 uppercase tracking-widest">Open Subject Console</span>
                                    </div>
                                    <ChevronRight className="h-4 w-4 text-foreground/20 group-hover:text-blue-600 group-hover:translate-x-1 transition-all" />
                                </div>
                            </div>
                        </Link>
                    ))
                ) : (
                    <div className="col-span-full py-20 bg-card-bg border border-dashed border-card-border rounded-[2rem] text-center">
                        <LayoutGrid className="h-12 w-12 text-foreground/20 mx-auto mb-4" />
                        <p className="text-xs font-black text-foreground/40 uppercase tracking-widest italic">No subjects available for {categoryName} yet.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
