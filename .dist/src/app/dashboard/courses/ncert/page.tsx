'use client';

import Link from 'next/link';
import { ChevronRight, FileText, Headphones, Layers, Library, Map, MonitorPlay, BookOpenCheck } from 'lucide-react';

const classes = [
    { id: '6th', name: 'Class 6th', subtitle: 'Foundation Alpha' },
    { id: '7th', name: 'Class 7th', subtitle: 'Foundation Beta' },
    { id: '8th', name: 'Class 8th', subtitle: 'Foundation Gamma' },
    { id: '9th', name: 'Class 9th', subtitle: 'Core Alpha' },
    { id: '10th', name: 'Class 10th', subtitle: 'Core Beta' },
    { id: '11th', name: 'Class 11th', subtitle: 'Advanced Alpha' },
    { id: '12th', name: 'Class 12th', subtitle: 'Advanced Beta' }
];

export default function NcertClassesPage() {
    return (
        <div className="max-w-7xl mx-auto space-y-10 animate-in fade-in duration-1000 pb-20 px-4">
            {/* Breadcrumbs */}
            <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-foreground/40">
                <Link href="/dashboard/courses" className="hover:text-blue-600 transition-colors">Courses</Link>
                <ChevronRight className="h-3 w-3" />
                <span className="text-blue-600">NCERT Repository</span>
            </div>

            <div className="relative overflow-hidden rounded-[2.5rem] border border-blue-200/35 bg-gradient-to-br from-slate-950 via-blue-950 to-sky-900 p-8 md:p-10 shadow-[0_24px_60px_-35px_rgba(2,6,23,0.95)]">
                <div className="absolute -top-16 -right-8 h-56 w-56 rounded-full bg-cyan-300/20 blur-[90px]" />
                <div className="absolute -bottom-16 -left-12 h-56 w-56 rounded-full bg-blue-500/20 blur-[90px]" />

                <div className="relative z-10 space-y-5">
                    <h1 className="text-3xl md:text-5xl font-black text-white uppercase tracking-tight italic">NCERT Class Selection</h1>
                    <p className="text-cyan-100/85 font-semibold text-sm md:text-base max-w-3xl">
                        Choose your class to enter chapter-wise multimodal learning with full-window PDF, audio, video, mindmaps, and infographics.
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

            {/* Classes Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                {classes.map((cls) => (
                    <Link
                        key={cls.id}
                        href={`/dashboard/courses/ncert/${cls.id}`}
                        className="group relative bg-card-bg border border-card-border p-7 rounded-[2rem] shadow-sm hover:shadow-xl hover:border-blue-500/30 transition-all duration-500 text-center"
                    >
                        <div className="h-16 w-16 bg-blue-600/10 rounded-2xl flex items-center justify-center mx-auto mb-6 text-blue-600 border border-blue-600/20 group-hover:bg-blue-600 group-hover:text-white transition-all duration-500 group-hover:scale-110 group-hover:rotate-3">
                            <Library className="h-8 w-8" />
                        </div>

                        <h3 className="text-xl font-black text-foreground uppercase tracking-tight italic group-hover:text-blue-500 transition-colors">
                            {cls.name}
                        </h3>
                        <p className="text-[10px] font-black text-foreground/30 uppercase tracking-[0.2em] mt-2">
                            {cls.subtitle}
                        </p>

                        <div className="mt-8 pt-5 border-t border-card-border flex items-center justify-center gap-2 text-[9px] font-black uppercase tracking-widest text-foreground/30 group-hover:text-blue-600 transition-colors">
                            Access Class Intel <ChevronRight className="h-3 w-3" />
                        </div>
                    </Link>
                ))}

                {/* All Classes Card */}
                <Link
                    href={`/dashboard/courses/ncert/all`}
                    className="group relative bg-gradient-to-br from-blue-600 to-indigo-700 p-7 rounded-[2rem] shadow-lg hover:shadow-neon transition-all duration-500 text-center flex flex-col justify-center border-2 border-white/15"
                >
                    <BookOpenCheck className="h-10 w-10 text-white mx-auto mb-6" />
                    <h3 className="text-xl font-black text-white uppercase tracking-tight italic">
                        Integrated
                    </h3>
                    <p className="text-[10px] font-black text-white/60 uppercase tracking-[0.2em] mt-2">
                        Class 6 - 12 Unified
                    </p>
                </Link>
            </div>
        </div>
    );
}
