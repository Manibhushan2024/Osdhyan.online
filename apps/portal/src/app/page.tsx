'use client';

import Link from 'next/link';
import { Logo } from '@/components/ui/Logo';
import { cn } from '@/lib/utils';
import {
    ArrowRight,
    Zap,
    Trophy,
    BrainCircuit,
    BarChart3,
    BookOpen,
    ClipboardCheck,
    CheckCircle2,
    Star,
    Users,
    Clock,
    Target,
    Sparkles,
    ChevronRight,
    Shield,
    Languages,
} from 'lucide-react';

const stats = [
    { value: '50,000+', label: 'Active Students' },
    { value: '2,000+', label: 'Questions' },
    { value: '98%', label: 'Satisfaction Rate' },
    { value: '15+', label: 'Exam Categories' },
];

const features = [
    {
        icon: ClipboardCheck,
        title: 'Full-Length Mock Tests',
        desc: 'Exam-pattern tests for BPSC, SSC, Banking & more — with negative marking, timer, and real-time question palette.',
        color: 'text-blue-500',
        bg: 'bg-blue-500/10',
    },
    {
        icon: BrainCircuit,
        title: 'AI-Powered Analysis',
        desc: 'Get personalised AI insights on your weak topics, time management strategy, and selection probability after every test.',
        color: 'text-violet-500',
        bg: 'bg-violet-500/10',
    },
    {
        icon: BarChart3,
        title: 'Deep Performance Analytics',
        desc: 'Sectional accuracy breakdown, accuracy trend charts, and topic-level strength/weakness mapping across all attempts.',
        color: 'text-emerald-500',
        bg: 'bg-emerald-500/10',
    },
    {
        icon: BookOpen,
        title: 'Structured Courses',
        desc: 'NCERT video lectures, subject-wise notes, and curated materials — all in one place, accessible on any device.',
        color: 'text-orange-500',
        bg: 'bg-orange-500/10',
    },
    {
        icon: Clock,
        title: 'Focus & Productivity Tools',
        desc: 'Built-in study timer, daily goal tracker, weekly planner, and mission history to keep you consistent every day.',
        color: 'text-cyan-500',
        bg: 'bg-cyan-500/10',
    },
    {
        icon: Languages,
        title: 'Bilingual Interface',
        desc: 'Seamlessly switch between English and Hindi mid-test — every question and option is available in both languages.',
        color: 'text-pink-500',
        bg: 'bg-pink-500/10',
    },
];

const testimonials = [
    {
        name: 'Rahul Sharma',
        exam: 'BPSC 70th',
        text: 'The AI analysis helped me identify that I was spending too much time on GS. After focusing on my weak topics using OSDHYAN, I cracked BPSC in my second attempt.',
        rating: 5,
    },
    {
        name: 'Priya Singh',
        exam: 'SSC CGL 2025',
        text: 'The bilingual test interface is a game changer. I could finally attempt questions in Hindi without switching platforms. The mock tests are closest to the real exam pattern.',
        rating: 5,
    },
    {
        name: 'Amit Kumar',
        exam: 'BPSC AEDO',
        text: 'Completed 40+ full-length mocks on this platform. The performance trend chart kept me motivated. Cleared BPSC AEDO in the first attempt!',
        rating: 5,
    },
];

const exams = [
    'BPSC (CCE)', 'BPSC AEDO', 'SSC CGL', 'SSC CHSL', 'IBPS PO', 'IBPS Clerk',
    'SBI PO', 'RRB NTPC', 'JPSC', 'UPPSC', 'UPSC CSE', 'Banking & Insurance',
];

export default function LandingPage() {
    return (
        <div className="min-h-screen bg-slate-950 text-white overflow-x-hidden">
            {/* ── Navbar ─────────────────────────────────────── */}
            <nav className="fixed top-0 inset-x-0 z-50 border-b border-white/5 bg-slate-950/80 backdrop-blur-xl">
                <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
                    <Logo />
                    <div className="hidden md:flex items-center gap-8 text-[11px] font-black uppercase tracking-widest text-white/40">
                        <a href="#features" className="hover:text-white transition-colors">Features</a>
                        <a href="#exams" className="hover:text-white transition-colors">Exams</a>
                        <a href="#testimonials" className="hover:text-white transition-colors">Reviews</a>
                    </div>
                    <div className="flex items-center gap-3">
                        <Link
                            href="/auth/login"
                            className="px-5 py-2.5 text-[11px] font-black uppercase tracking-widest text-white/60 hover:text-white transition-colors"
                        >
                            Sign In
                        </Link>
                        <Link
                            href="/auth/signup"
                            className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-[11px] font-black uppercase tracking-widest transition-all shadow-lg shadow-blue-600/20 active:scale-95"
                        >
                            Start Free
                        </Link>
                    </div>
                </div>
            </nav>

            {/* ── Hero ───────────────────────────────────────── */}
            <section className="relative min-h-screen flex items-center justify-center px-6 pt-16">
                {/* Background glows */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-blue-600/10 rounded-full blur-[120px]" />
                    <div className="absolute top-1/2 left-1/4 w-[400px] h-[400px] bg-violet-600/8 rounded-full blur-[100px]" />
                    <div className="absolute top-1/3 right-1/4 w-[300px] h-[300px] bg-cyan-600/8 rounded-full blur-[80px]" />
                </div>

                {/* Grid pattern */}
                <div className="absolute inset-0 pointer-events-none opacity-[0.03]"
                    style={{ backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)', backgroundSize: '40px 40px' }} />

                <div className="relative z-10 max-w-5xl mx-auto text-center space-y-10">
                    {/* Badge */}
                    <div className="inline-flex items-center gap-2 px-5 py-2 bg-blue-500/10 border border-blue-500/20 rounded-full">
                        <Sparkles className="h-3.5 w-3.5 text-blue-400" />
                        <span className="text-[11px] font-black uppercase tracking-widest text-blue-400">Next-Generation Exam Preparation</span>
                    </div>

                    {/* Headline */}
                    <h1 className="text-5xl md:text-7xl font-black tracking-tighter leading-none uppercase italic">
                        <span className="text-white">Crack Your</span>
                        <br />
                        <span className="bg-gradient-to-r from-blue-400 via-cyan-400 to-violet-400 bg-clip-text text-transparent">
                            Dream Exam
                        </span>
                        <br />
                        <span className="text-white">with Intelligence</span>
                    </h1>

                    <p className="text-lg text-white/40 font-medium max-w-2xl mx-auto leading-relaxed">
                        OSDHYAN combines AI-powered analysis, full-length mock tests, structured courses, and productivity tools — everything you need to clear BPSC, SSC, Banking & more.
                    </p>

                    {/* CTAs */}
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
                        <Link
                            href="/auth/signup"
                            className="group flex items-center gap-3 px-10 py-5 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl font-black text-sm uppercase tracking-widest shadow-2xl shadow-blue-600/30 transition-all active:scale-95"
                        >
                            Start For Free
                            <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                        </Link>
                        <Link
                            href="/auth/login"
                            className="flex items-center gap-3 px-10 py-5 border border-white/10 hover:border-white/20 text-white/60 hover:text-white rounded-2xl font-black text-sm uppercase tracking-widest transition-all"
                        >
                            Sign In
                        </Link>
                    </div>

                    {/* Trust line */}
                    <p className="text-[10px] font-black uppercase tracking-widest text-white/20">
                        No credit card required · Free mock tests available · Trusted by 50,000+ aspirants
                    </p>
                </div>
            </section>

            {/* ── Stats ──────────────────────────────────────── */}
            <section className="py-20 border-y border-white/5 bg-white/[0.02]">
                <div className="max-w-5xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8">
                    {stats.map((s, i) => (
                        <div key={i} className="text-center space-y-2">
                            <p className="text-4xl font-black text-white tracking-tighter italic">{s.value}</p>
                            <p className="text-[10px] font-black uppercase tracking-widest text-white/30">{s.label}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* ── Features ───────────────────────────────────── */}
            <section id="features" className="py-32 px-6">
                <div className="max-w-7xl mx-auto space-y-16">
                    <div className="text-center space-y-4">
                        <div className="inline-flex items-center gap-2 px-5 py-2 bg-violet-500/10 border border-violet-500/20 rounded-full">
                            <Zap className="h-3.5 w-3.5 text-violet-400" />
                            <span className="text-[11px] font-black uppercase tracking-widest text-violet-400">Platform Features</span>
                        </div>
                        <h2 className="text-4xl md:text-5xl font-black tracking-tighter uppercase italic text-white">
                            Everything You Need to <span className="text-blue-400">Win</span>
                        </h2>
                        <p className="text-white/40 max-w-xl mx-auto">
                            Built specifically for Indian competitive exam aspirants — not a generic quiz app.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {features.map((f, i) => (
                            <div
                                key={i}
                                className="group p-8 bg-white/[0.03] border border-white/8 rounded-[2.5rem] hover:border-white/15 hover:bg-white/[0.05] transition-all duration-500 space-y-5"
                            >
                                <div className={cn('h-12 w-12 rounded-2xl flex items-center justify-center', f.bg)}>
                                    <f.icon className={cn('h-6 w-6', f.color)} />
                                </div>
                                <div className="space-y-2">
                                    <h3 className="text-base font-black uppercase tracking-tight text-white">{f.title}</h3>
                                    <p className="text-sm text-white/40 leading-relaxed">{f.desc}</p>
                                </div>
                                <div className={cn('h-px w-12 group-hover:w-full transition-all duration-700', f.bg.replace('/10', '/30'))} />
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── Exam Coverage ──────────────────────────────── */}
            <section id="exams" className="py-24 px-6 bg-white/[0.02] border-y border-white/5">
                <div className="max-w-5xl mx-auto space-y-12 text-center">
                    <div className="space-y-4">
                        <div className="inline-flex items-center gap-2 px-5 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-full">
                            <Target className="h-3.5 w-3.5 text-emerald-400" />
                            <span className="text-[11px] font-black uppercase tracking-widest text-emerald-400">Exam Coverage</span>
                        </div>
                        <h2 className="text-4xl font-black tracking-tighter uppercase italic text-white">
                            15+ Exams <span className="text-emerald-400">Covered</span>
                        </h2>
                    </div>
                    <div className="flex flex-wrap justify-center gap-3">
                        {exams.map((exam, i) => (
                            <span
                                key={i}
                                className="px-5 py-2.5 bg-white/5 border border-white/10 rounded-full text-[11px] font-black uppercase tracking-widest text-white/60 hover:bg-white/10 hover:text-white transition-all cursor-default"
                            >
                                {exam}
                            </span>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── How It Works ───────────────────────────────── */}
            <section className="py-32 px-6">
                <div className="max-w-4xl mx-auto space-y-16">
                    <div className="text-center space-y-4">
                        <h2 className="text-4xl font-black tracking-tighter uppercase italic text-white">
                            From Day 1 to <span className="text-blue-400">Selection</span>
                        </h2>
                        <p className="text-white/40">A proven 4-step system used by thousands of selected candidates.</p>
                    </div>
                    <div className="space-y-6">
                        {[
                            { step: '01', title: 'Enroll in a Test Series', desc: 'Pick your target exam and enroll in the matching full-length test series.' },
                            { step: '02', title: 'Attempt Under Real Conditions', desc: 'Bilingual, timed, with negative marking — exactly like the actual exam.' },
                            { step: '03', title: 'Get AI-Powered Feedback', desc: 'Instantly see where you lost marks, your time-per-question, and AI suggestions.' },
                            { step: '04', title: 'Revise Weak Topics', desc: 'Use course videos, notes, and PYQs to close the gaps before the next attempt.' },
                        ].map((item, i) => (
                            <div key={i} className="flex gap-6 p-8 bg-white/[0.02] border border-white/8 rounded-[2rem] hover:border-white/15 transition-all group">
                                <div className="shrink-0 h-12 w-12 bg-blue-600/15 border border-blue-600/20 rounded-2xl flex items-center justify-center">
                                    <span className="text-sm font-black text-blue-400">{item.step}</span>
                                </div>
                                <div className="space-y-1.5">
                                    <h3 className="font-black uppercase tracking-tight text-white text-sm">{item.title}</h3>
                                    <p className="text-sm text-white/40">{item.desc}</p>
                                </div>
                                <ChevronRight className="shrink-0 h-5 w-5 text-white/10 group-hover:text-blue-400 group-hover:translate-x-1 transition-all self-center ml-auto" />
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── Testimonials ───────────────────────────────── */}
            <section id="testimonials" className="py-24 px-6 bg-white/[0.02] border-y border-white/5">
                <div className="max-w-7xl mx-auto space-y-16">
                    <div className="text-center space-y-4">
                        <div className="inline-flex items-center gap-2 px-5 py-2 bg-orange-500/10 border border-orange-500/20 rounded-full">
                            <Trophy className="h-3.5 w-3.5 text-orange-400" />
                            <span className="text-[11px] font-black uppercase tracking-widest text-orange-400">Success Stories</span>
                        </div>
                        <h2 className="text-4xl font-black tracking-tighter uppercase italic text-white">
                            From Aspirant to <span className="text-orange-400">Selected</span>
                        </h2>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {testimonials.map((t, i) => (
                            <div key={i} className="p-8 bg-white/[0.03] border border-white/8 rounded-[2.5rem] space-y-6">
                                <div className="flex gap-1">
                                    {Array.from({ length: t.rating }).map((_, j) => (
                                        <Star key={j} className="h-4 w-4 fill-orange-400 text-orange-400" />
                                    ))}
                                </div>
                                <p className="text-sm text-white/60 leading-relaxed italic">"{t.text}"</p>
                                <div className="flex items-center gap-3 pt-2 border-t border-white/5">
                                    <div className="h-9 w-9 rounded-full bg-blue-600/20 flex items-center justify-center">
                                        <span className="text-[11px] font-black text-blue-400">{t.name.substring(0, 2).toUpperCase()}</span>
                                    </div>
                                    <div>
                                        <p className="text-xs font-black uppercase tracking-wide text-white">{t.name}</p>
                                        <p className="text-[10px] font-black uppercase tracking-widest text-white/30">{t.exam}</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── CTA Banner ─────────────────────────────────── */}
            <section className="py-32 px-6">
                <div className="max-w-4xl mx-auto">
                    <div className="relative p-16 bg-gradient-to-br from-blue-600/20 to-violet-600/10 border border-blue-500/20 rounded-[3rem] text-center overflow-hidden">
                        <div className="absolute inset-0 pointer-events-none opacity-5"
                            style={{ backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)', backgroundSize: '30px 30px' }} />
                        <div className="relative z-10 space-y-8">
                            <div className="h-16 w-16 bg-blue-600/20 border border-blue-500/30 rounded-[2rem] flex items-center justify-center mx-auto">
                                <Shield className="h-8 w-8 text-blue-400" />
                            </div>
                            <div className="space-y-4">
                                <h2 className="text-4xl font-black tracking-tighter uppercase italic text-white">
                                    Your Selection Starts Today
                                </h2>
                                <p className="text-white/40 max-w-xl mx-auto">
                                    Join 50,000+ aspirants who trust OSDHYAN for their exam preparation. Free mock tests, no credit card required.
                                </p>
                            </div>
                            <div className="flex flex-col sm:flex-row gap-4 justify-center">
                                <Link
                                    href="/auth/signup"
                                    className="group inline-flex items-center gap-3 px-10 py-5 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl font-black text-sm uppercase tracking-widest shadow-2xl shadow-blue-600/30 transition-all active:scale-95"
                                >
                                    Create Free Account
                                    <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                                </Link>
                                <Link
                                    href="/dashboard/test-series"
                                    className="inline-flex items-center gap-3 px-10 py-5 border border-white/15 text-white/60 hover:text-white hover:border-white/25 rounded-2xl font-black text-sm uppercase tracking-widest transition-all"
                                >
                                    Browse Test Series
                                </Link>
                            </div>
                            <div className="flex items-center justify-center gap-6 text-[10px] font-black uppercase tracking-widest text-white/20">
                                <span className="flex items-center gap-1.5"><CheckCircle2 className="h-3 w-3 text-emerald-500" /> No credit card</span>
                                <span className="flex items-center gap-1.5"><CheckCircle2 className="h-3 w-3 text-emerald-500" /> Free mock tests</span>
                                <span className="flex items-center gap-1.5"><CheckCircle2 className="h-3 w-3 text-emerald-500" /> Cancel anytime</span>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ── Footer ─────────────────────────────────────── */}
            <footer className="border-t border-white/5 py-12 px-6">
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
                    <Logo />
                    <div className="flex items-center gap-6 text-[10px] font-black uppercase tracking-widest text-white/20">
                        <Link href="/auth/login" className="hover:text-white/60 transition-colors">Login</Link>
                        <Link href="/auth/signup" className="hover:text-white/60 transition-colors">Sign Up</Link>
                        <Link href="/dashboard/test-series" className="hover:text-white/60 transition-colors">Test Series</Link>
                    </div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-white/15">
                        © {new Date().getFullYear()} OSDHYAN. All rights reserved.
                    </p>
                </div>
            </footer>
        </div>
    );
}
