import Link from 'next/link';
import { ChevronRight, ClipboardCheck, FileText, Target } from 'lucide-react';

const practiceTracks = [
    {
        title: 'Free tests',
        desc: 'Short timed tests to practise regularly and track your accuracy.',
        href: '/dashboard/tests',
        icon: Target,
    },
    {
        title: 'Test series',
        desc: 'Full-length mock tests in a series for your target exam.',
        href: '/dashboard/test-series',
        icon: ClipboardCheck,
    },
    {
        title: 'Previous year papers',
        desc: 'Solve original question papers to understand the exam pattern.',
        href: '/dashboard/pyqs',
        icon: FileText,
    },
];

export default function PracticeHubPage() {
    return (
        <div className="space-y-6 pb-12">
            <div>
                <h1 className="page-title">Practice</h1>
                <p className="page-subtitle">Pick how you want to practise today: attempt, review, improve.</p>
            </div>

            <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {practiceTracks.map((track) => (
                    <Link key={track.title} href={track.href} className="card card-hover p-6 group flex flex-col">
                        <div className="h-11 w-11 rounded-xl bg-accent text-accent-foreground flex items-center justify-center mb-4">
                            <track.icon className="h-5 w-5" />
                        </div>
                        <h2 className="text-lg font-semibold group-hover:text-primary transition-colors">{track.title}</h2>
                        <p className="text-sm text-muted-foreground mt-1.5 leading-relaxed">{track.desc}</p>
                        <div className="mt-5 pt-4 border-t border-card-border flex items-center justify-between text-sm font-semibold text-primary">
                            Open
                            <ChevronRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                        </div>
                    </Link>
                ))}
            </section>
        </div>
    );
}
