import Link from 'next/link';
import { CalendarClock, ChevronRight, MonitorPlay, Radio, Users } from 'lucide-react';

const upcomingSlots = [
    { title: 'Current Affairs Rapid Revision', time: '07:00 PM', instructor: 'Faculty Panel', mode: 'Live + Q&A' },
    { title: 'Quant Shortcuts Sprint', time: '08:30 PM', instructor: 'Aptitude Mentor', mode: 'Interactive Drill' },
    { title: 'GS Answer Writing Lab', time: '09:30 PM', instructor: 'Mains Coach', mode: 'Workshop' },
];

export default function LiveClassesPage() {
    return (
        <div className="max-w-7xl mx-auto space-y-8 pb-16 animate-in fade-in duration-700 px-4">
            <section className="relative overflow-hidden rounded-[2.5rem] border border-rose-200/30 bg-gradient-to-br from-slate-950 via-rose-950 to-red-900 p-8 md:p-10 shadow-[0_24px_60px_-35px_rgba(2,6,23,0.95)]">
                <div className="absolute -top-16 -right-8 h-56 w-56 rounded-full bg-rose-300/20 blur-[90px]" />
                <div className="absolute -bottom-16 -left-12 h-56 w-56 rounded-full bg-red-500/20 blur-[90px]" />

                <div className="relative z-10 space-y-4">
                    <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-[10px] font-black uppercase tracking-[0.2em] text-rose-100">
                        <Radio className="h-3.5 w-3.5" />
                        Live Zone
                    </span>
                    <h1 className="text-3xl md:text-5xl font-black text-white uppercase tracking-tight italic">
                        Live Classes Console
                    </h1>
                    <p className="max-w-3xl text-sm md:text-base text-rose-100/85 font-semibold">
                        Join scheduled classes, revision sprints, and interactive doubt sessions from one place.
                    </p>
                </div>
            </section>

            <section className="grid grid-cols-1 md:grid-cols-3 gap-5">
                {upcomingSlots.map((slot) => (
                    <article key={slot.title} className="rounded-2xl border border-card-border bg-card-bg p-6 shadow-sm">
                        <div className="flex items-center justify-between mb-4">
                            <span className="rounded-full border border-rose-200 bg-rose-50 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-rose-700">
                                {slot.mode}
                            </span>
                            <Users className="h-4 w-4 text-rose-600" />
                        </div>
                        <h2 className="text-lg font-black uppercase tracking-tight text-foreground">{slot.title}</h2>
                        <p className="text-xs text-foreground/55 mt-2">{slot.instructor}</p>
                        <div className="mt-4 flex items-center gap-2 text-sm font-bold text-rose-700">
                            <CalendarClock className="h-4 w-4" />
                            {slot.time}
                        </div>
                    </article>
                ))}
            </section>

            <section className="rounded-2xl border border-card-border bg-card-bg p-6">
                <h3 className="text-[10px] font-black uppercase tracking-[0.24em] text-foreground/45 mb-4">Quick Actions</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Link href="/dashboard/courses" className="rounded-xl border border-card-border px-4 py-3 hover:border-blue-300 hover:text-blue-700 transition-colors flex items-center justify-between">
                        Course Library <ChevronRight className="h-4 w-4" />
                    </Link>
                    <Link href="/dashboard/materials" className="rounded-xl border border-card-border px-4 py-3 hover:border-blue-300 hover:text-blue-700 transition-colors flex items-center justify-between">
                        Study Materials <ChevronRight className="h-4 w-4" />
                    </Link>
                    <Link href="/dashboard/help" className="rounded-xl border border-card-border px-4 py-3 hover:border-blue-300 hover:text-blue-700 transition-colors flex items-center justify-between">
                        Raise Support Ticket <ChevronRight className="h-4 w-4" />
                    </Link>
                </div>
                <p className="mt-4 text-xs text-foreground/55 flex items-center gap-2">
                    <MonitorPlay className="h-4 w-4 text-blue-600" />
                    Live scheduling is now centralized so students can quickly start sessions without navigation friction.
                </p>
            </section>
        </div>
    );
}
