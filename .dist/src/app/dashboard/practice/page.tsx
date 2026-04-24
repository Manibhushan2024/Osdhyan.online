import Link from 'next/link';
import { ChevronRight, ClipboardCheck, FileText, Target, Zap } from 'lucide-react';

const practiceTracks = [
    {
        title: 'Daily Practice Tests',
        desc: 'Attempt timed question sets and track accuracy trends.',
        href: '/dashboard/tests',
        icon: Target,
        tone: 'from-blue-500/20 to-cyan-500/10',
    },
    {
        title: 'Test Series Missions',
        desc: 'Practice full-length exam simulations in series format.',
        href: '/dashboard/test-series',
        icon: ClipboardCheck,
        tone: 'from-indigo-500/20 to-blue-500/10',
    },
    {
        title: 'Previous Year Papers',
        desc: 'Build exam sense by solving historical question papers.',
        href: '/dashboard/pyqs',
        icon: FileText,
        tone: 'from-emerald-500/20 to-teal-500/10',
    },
];

export default function PracticeHubPage() {
    return (
        <div className="max-w-7xl mx-auto space-y-8 pb-16 animate-in fade-in duration-700 px-4">
            <section className="relative overflow-hidden rounded-[2.5rem] border border-blue-200/30 bg-gradient-to-br from-slate-950 via-blue-950 to-sky-900 p-8 md:p-10 shadow-[0_24px_60px_-35px_rgba(2,6,23,0.95)]">
                <div className="absolute -top-16 -right-8 h-56 w-56 rounded-full bg-cyan-300/20 blur-[90px]" />
                <div className="absolute -bottom-16 -left-12 h-56 w-56 rounded-full bg-blue-500/20 blur-[90px]" />

                <div className="relative z-10 space-y-4">
                    <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-[10px] font-black uppercase tracking-[0.2em] text-cyan-100">
                        <Zap className="h-3.5 w-3.5" />
                        Practice Hub
                    </span>
                    <h1 className="text-3xl md:text-5xl font-black text-white uppercase tracking-tight italic">
                        Build Speed + Accuracy
                    </h1>
                    <p className="max-w-3xl text-sm md:text-base text-cyan-100/85 font-semibold">
                        Choose your practice mode and keep your preparation loop simple: attempt, review, improve.
                    </p>
                </div>
            </section>

            <section className="grid grid-cols-1 md:grid-cols-3 gap-5">
                {practiceTracks.map((track) => (
                    <Link
                        key={track.title}
                        href={track.href}
                        className="group relative overflow-hidden rounded-2xl border border-card-border bg-card-bg p-6 shadow-sm hover:border-blue-300 hover:shadow-xl transition-all"
                    >
                        <div className={`absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-100 transition-opacity ${track.tone}`} />
                        <div className="relative z-10">
                            <div className="h-12 w-12 rounded-xl border border-blue-200 bg-blue-50 text-blue-700 flex items-center justify-center mb-5">
                                <track.icon className="h-6 w-6" />
                            </div>
                            <h2 className="text-xl font-black uppercase tracking-tight text-foreground">{track.title}</h2>
                            <p className="text-sm text-foreground/55 mt-2">{track.desc}</p>
                            <div className="mt-5 pt-4 border-t border-card-border flex items-center justify-between text-[10px] font-black uppercase tracking-widest text-foreground/45">
                                Open
                                <ChevronRight className="h-4 w-4 text-blue-600 group-hover:translate-x-1 transition-transform" />
                            </div>
                        </div>
                    </Link>
                ))}
            </section>
        </div>
    );
}
