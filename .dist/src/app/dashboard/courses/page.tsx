'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
    BookOpen,
    GraduationCap,
    Brain,
    Zap,
    Languages,
    Newspaper,
    ChevronRight,
    Sparkles,
    MonitorPlay,
    Headphones,
    Map,
    Layers,
    FileText,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const categories = [
    {
        id: 'ncert',
        name: 'NCERT',
        icon: BookOpen,
        desc: 'Class 6th to 12th structured foundation with chapter-wise multimodal learning.',
        accent: 'from-blue-600/20 to-cyan-600/10',
        iconClass: 'bg-blue-600/15 text-blue-600 border-blue-600/30',
        badgeClass: 'bg-blue-600/10 text-blue-700 border-blue-600/30',
    },
    {
        id: 'gs',
        name: 'General Studies',
        icon: GraduationCap,
        desc: 'History, polity, geography and governance in a high-retention concept sequence.',
        accent: 'from-indigo-600/20 to-sky-600/10',
        iconClass: 'bg-indigo-600/15 text-indigo-600 border-indigo-600/30',
        badgeClass: 'bg-indigo-600/10 text-indigo-700 border-indigo-600/30',
    },
    {
        id: 'aptitude',
        name: 'Aptitude',
        icon: Brain,
        desc: 'Quantitative drills, speed strategies and decision-based problem solving.',
        accent: 'from-fuchsia-600/20 to-violet-600/10',
        iconClass: 'bg-fuchsia-600/15 text-fuchsia-600 border-fuchsia-600/30',
        badgeClass: 'bg-fuchsia-600/10 text-fuchsia-700 border-fuchsia-600/30',
    },
    {
        id: 'reasoning',
        name: 'Reasoning',
        icon: Zap,
        desc: 'Logical frameworks, pattern intelligence and exam-grade puzzle practice.',
        accent: 'from-amber-600/20 to-orange-600/10',
        iconClass: 'bg-amber-600/15 text-amber-600 border-amber-600/30',
        badgeClass: 'bg-amber-600/10 text-amber-700 border-amber-600/30',
    },
    {
        id: 'english',
        name: 'English',
        icon: Languages,
        desc: 'Grammar, comprehension and answer expression for competitive exams.',
        accent: 'from-pink-600/20 to-rose-600/10',
        iconClass: 'bg-pink-600/15 text-pink-600 border-pink-600/30',
        badgeClass: 'bg-pink-600/10 text-pink-700 border-pink-600/30',
    },
    {
        id: 'current-affairs',
        name: 'Current Affairs',
        icon: Newspaper,
        desc: 'Rapid issue tracking, revision capsules and policy-linked context building.',
        accent: 'from-red-600/20 to-orange-600/10',
        iconClass: 'bg-red-600/15 text-red-600 border-red-600/30',
        badgeClass: 'bg-red-600/10 text-red-700 border-red-600/30',
    },
];

export default function CoursesLandingPage() {
    return (
        <div className="max-w-7xl mx-auto space-y-10 animate-in fade-in slide-in-from-bottom-6 duration-1000 pb-20 px-4">
            <div className="relative overflow-hidden rounded-[2.75rem] border border-blue-200/40 bg-gradient-to-br from-slate-950 via-blue-950 to-sky-900 p-8 md:p-12 shadow-[0_24px_60px_rgba(2,6,23,0.35)]">
                <div className="absolute -top-20 -right-8 h-72 w-72 rounded-full bg-cyan-300/20 blur-[90px]" />
                <div className="absolute -bottom-24 -left-10 h-72 w-72 rounded-full bg-blue-500/20 blur-[100px]" />

                <div className="relative z-10 space-y-6">
                    <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-[10px] font-black uppercase tracking-[0.28em] text-cyan-100">
                        <Sparkles className="h-3.5 w-3.5" />
                        Mission Command: Courses
                    </div>

                    <div className="space-y-3">
                        <h1 className="text-4xl md:text-6xl font-black tracking-tight text-white uppercase italic leading-none">
                            Build Your
                            <span className="block text-cyan-200">Exam Knowledge Stack</span>
                        </h1>
                        <p className="max-w-3xl text-sm md:text-base font-semibold text-blue-100/85 leading-relaxed">
                            Select a category and study in full multimodal mode: PDF, Audio, Video, Mindmap, and Infographic. Designed for fast revision and deep retention.
                        </p>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-5 gap-2 md:gap-3">
                        {[
                            { icon: FileText, label: 'PDF Notes' },
                            { icon: Headphones, label: 'Audio Briefs' },
                            { icon: MonitorPlay, label: 'Video Classes' },
                            { icon: Map, label: 'Mindmaps' },
                            { icon: Layers, label: 'Infographics' },
                        ].map((item) => (
                            <div
                                key={item.label}
                                className="rounded-2xl border border-white/15 bg-white/10 px-3 py-3 flex items-center gap-2 text-white/95"
                            >
                                <item.icon className="h-4 w-4 text-cyan-200" />
                                <span className="text-[10px] md:text-xs font-black uppercase tracking-widest">{item.label}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {categories.map((cat) => (
                    <Link
                        key={cat.id}
                        href={cat.id === 'ncert' ? `/dashboard/courses/ncert` : `/dashboard/courses/${cat.id}`}
                        className="group relative overflow-hidden rounded-[2.2rem] border border-card-border bg-card-bg p-7 shadow-sm transition-all duration-500 hover:-translate-y-1 hover:shadow-2xl hover:shadow-blue-500/10 hover:border-blue-400/30"
                    >
                        <div className={cn('absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-100 transition-opacity', cat.accent)} />

                        <div className="relative z-10 space-y-5">
                            <div className="flex items-center justify-between">
                                <div className={cn('h-12 w-12 rounded-xl border flex items-center justify-center transition-transform duration-500 group-hover:scale-110 group-hover:rotate-3', cat.iconClass)}>
                                    <cat.icon className="h-6 w-6" />
                                </div>
                                <span className={cn('rounded-full border px-3 py-1 text-[9px] font-black uppercase tracking-[0.2em]', cat.badgeClass)}>
                                    Explore
                                </span>
                            </div>

                            <div>
                                <h3 className="text-xl font-black text-foreground uppercase tracking-tight italic group-hover:text-blue-700 transition-colors">
                                    {cat.name}
                                </h3>
                                <p className="text-xs font-semibold text-foreground/55 leading-relaxed mt-2">{cat.desc}</p>
                            </div>

                            <div className="pt-4 border-t border-card-border/70 flex items-center justify-between">
                                <div className="text-[10px] font-black uppercase tracking-[0.2em] text-foreground/45">Open Learning Hub</div>
                                <ChevronRight className="h-4 w-4 text-blue-600 transition-transform group-hover:translate-x-1" />
                            </div>
                        </div>
                    </Link>
                ))}
            </div>

            <div className="rounded-[2.2rem] border border-card-border bg-card-bg p-6 text-center">
                <p className="text-[10px] font-black uppercase tracking-[0.35em] text-foreground/45">EdTech Focus Layer Active</p>
                <p className="text-sm font-bold text-foreground/80 mt-2">
                    Select a category and continue with chapter-wise full-screen learning flow.
                </p>
            </div>
        </div>
    );
}
