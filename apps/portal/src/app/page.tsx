'use client';

import Link from 'next/link';
import { Logo } from '@/components/ui/Logo';
import {
    ArrowRight,
    BarChart3,
    BookOpen,
    CheckCircle2,
    ClipboardCheck,
    FileText,
    GraduationCap,
    Languages,
    Smartphone,
    Video,
} from 'lucide-react';

const features = [
    {
        icon: ClipboardCheck,
        title: 'Mock tests on the real exam pattern',
        desc: 'Timed tests with negative marking, question palette and mark-for-review, just like the actual exam.',
    },
    {
        icon: Languages,
        title: 'Hindi and English',
        desc: 'Every question and option is available in both languages. Switch at any time during the test.',
    },
    {
        icon: BarChart3,
        title: 'Instant result analysis',
        desc: 'See your score, accuracy, time per question and section-wise performance the moment you submit.',
    },
    {
        icon: FileText,
        title: 'Previous year papers',
        desc: 'Solve original question papers from past years to understand the pattern and difficulty.',
    },
    {
        icon: Video,
        title: 'Live classes',
        desc: 'Join scheduled live classes with teachers, ask questions and revise with the recordings.',
    },
    {
        icon: GraduationCap,
        title: 'Home tuition',
        desc: 'Find verified teachers near you for one-to-one help with specific subjects.',
    },
];

const exams = [
    'BPSC (CCE)', 'BPSC AEDO', 'UPSC CSE', 'SSC CGL', 'SSC CHSL', 'IBPS PO',
    'IBPS Clerk', 'SBI PO', 'RRB NTPC', 'JPSC', 'UPPSC', 'Banking & Insurance',
];

const steps = [
    { title: 'Create a free account', desc: 'Sign up with your mobile number or email. No payment needed to start.' },
    { title: 'Pick your exam', desc: 'Choose a test series or a free test for the exam you are preparing for.' },
    { title: 'Attempt under exam conditions', desc: 'Timed, bilingual, with negative marking, so you build real exam habits.' },
    { title: 'Review and improve', desc: 'Check solutions, find weak topics and revise with notes, courses and PYQs.' },
];

const faqs = [
    {
        q: 'Is OSDHYAN free to use?',
        a: 'Yes. You can create an account and attempt free tests without paying. Some test series are paid and are clearly marked.',
    },
    {
        q: 'Can I attempt tests in Hindi?',
        a: 'Yes. Questions and options are available in both Hindi and English, and you can switch language during the test.',
    },
    {
        q: 'Does it work on a phone?',
        a: 'Yes. The portal is built for mobile browsers, including low-cost Android phones. Your answers are saved as you go, even if the network drops.',
    },
    {
        q: 'Which exams are covered?',
        a: 'BPSC, UPSC, SSC, Banking and other state and central government exams. New tests are added regularly.',
    },
];

export default function LandingPage() {
    return (
        <div className="min-h-screen bg-background text-foreground">
            {/* Header */}
            <header className="sticky top-0 z-50 border-b border-card-border bg-background/90 backdrop-blur">
                <div className="page-container h-16 flex items-center justify-between gap-4">
                    <Link href="/" aria-label="OSDHYAN home">
                        <Logo />
                    </Link>
                    <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-muted-foreground">
                        <a href="#features" className="hover:text-foreground">What you get</a>
                        <a href="#exams" className="hover:text-foreground">Exams</a>
                        <a href="#how" className="hover:text-foreground">How it works</a>
                        <a href="#faq" className="hover:text-foreground">FAQ</a>
                    </nav>
                    <div className="flex items-center gap-2">
                        <Link href="/auth/login" className="btn btn-ghost btn-sm">Sign in</Link>
                        <Link href="/auth/signup" className="btn btn-primary btn-sm">Start free</Link>
                    </div>
                </div>
            </header>

            {/* Hero */}
            <section className="page-container pt-14 pb-16 sm:pt-20 sm:pb-24">
                <div className="max-w-3xl">
                    <p className="eyebrow mb-4">For BPSC, UPSC, SSC and Banking aspirants</p>
                    <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight leading-tight">
                        Practise like it&apos;s the real exam. In Hindi or English.
                    </h1>
                    <p className="mt-5 text-lg text-muted-foreground leading-relaxed">
                        OSDHYAN gives you exam-pattern mock tests, previous year papers, instant analysis of every attempt,
                        live classes and home tuition — all in one place, built to work on any phone.
                    </p>
                    <div className="mt-8 flex flex-col sm:flex-row gap-3">
                        <Link href="/auth/signup" className="btn btn-primary btn-lg">
                            Start free
                            <ArrowRight className="h-4 w-4" />
                        </Link>
                        <Link href="/auth/login" className="btn btn-secondary btn-lg">
                            Sign in
                        </Link>
                    </div>
                    <ul className="mt-6 flex flex-wrap gap-x-6 gap-y-2 text-sm text-muted-foreground">
                        <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-green-600" /> Free tests to start</li>
                        <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-green-600" /> No card needed</li>
                        <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-green-600" /> Works on low-end phones</li>
                    </ul>
                    {/* Android app: the APK is served from the API's public storage. */}
                    <a
                        href="/storage/downloads/osdhyan.apk"
                        download
                        className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-primary hover:underline"
                    >
                        <Smartphone className="h-4 w-4" />
                        Download the Android app (APK)
                    </a>
                </div>
            </section>

            {/* Features */}
            <section id="features" className="border-t border-card-border bg-card-bg/60">
                <div className="page-container py-16 sm:py-20">
                    <div className="max-w-2xl">
                        <p className="eyebrow mb-2">What you get</p>
                        <h2 className="text-3xl font-bold tracking-tight">Everything you need to prepare, nothing extra</h2>
                        <p className="mt-3 text-muted-foreground">
                            Built for Indian competitive exams, not a generic quiz app.
                        </p>
                    </div>
                    <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                        {features.map((f) => (
                            <div key={f.title} className="card p-6">
                                <div className="h-11 w-11 rounded-xl bg-accent text-accent-foreground flex items-center justify-center">
                                    <f.icon className="h-5 w-5" />
                                </div>
                                <h3 className="mt-4 text-base font-semibold">{f.title}</h3>
                                <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Exams */}
            <section id="exams" className="page-container py-16 sm:py-20">
                <div className="max-w-2xl">
                    <p className="eyebrow mb-2">Exams covered</p>
                    <h2 className="text-3xl font-bold tracking-tight">Tests for the exams you are preparing for</h2>
                    <p className="mt-3 text-muted-foreground">
                        Browse the test series to see what is available for each exam. More are added regularly.
                    </p>
                </div>
                <div className="mt-8 flex flex-wrap gap-2">
                    {exams.map((exam) => (
                        <span key={exam} className="rounded-full border border-card-border bg-card-bg px-4 py-2 text-sm font-medium">
                            {exam}
                        </span>
                    ))}
                </div>
                <Link href="/dashboard/test-series" className="mt-8 inline-flex items-center gap-2 text-sm font-semibold text-primary hover:underline">
                    Browse all test series <ArrowRight className="h-4 w-4" />
                </Link>
            </section>

            {/* How it works */}
            <section id="how" className="border-t border-card-border bg-card-bg/60">
                <div className="page-container py-16 sm:py-20">
                    <div className="max-w-2xl">
                        <p className="eyebrow mb-2">How it works</p>
                        <h2 className="text-3xl font-bold tracking-tight">Four simple steps</h2>
                    </div>
                    <ol className="mt-10 grid grid-cols-1 md:grid-cols-2 gap-4">
                        {steps.map((s, i) => (
                            <li key={s.title} className="card p-6 flex gap-4">
                                <span className="h-10 w-10 shrink-0 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold">
                                    {i + 1}
                                </span>
                                <div>
                                    <h3 className="font-semibold">{s.title}</h3>
                                    <p className="mt-1 text-sm text-muted-foreground leading-relaxed">{s.desc}</p>
                                </div>
                            </li>
                        ))}
                    </ol>
                </div>
            </section>

            {/* FAQ */}
            <section id="faq" className="page-container py-16 sm:py-20">
                <div className="max-w-2xl">
                    <p className="eyebrow mb-2">FAQ</p>
                    <h2 className="text-3xl font-bold tracking-tight">Common questions</h2>
                </div>
                <div className="mt-8 max-w-3xl divide-y divide-card-border border-y border-card-border">
                    {faqs.map((f) => (
                        <details key={f.q} className="group py-4">
                            <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-base font-semibold min-h-[44px]">
                                {f.q}
                                <span className="text-muted-foreground transition-transform group-open:rotate-90">
                                    <ArrowRight className="h-4 w-4" />
                                </span>
                            </summary>
                            <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{f.a}</p>
                        </details>
                    ))}
                </div>
            </section>

            {/* Final CTA */}
            <section className="page-container pb-16 sm:pb-20">
                <div className="card p-8 sm:p-10 text-center">
                    <BookOpen className="h-8 w-8 mx-auto text-primary" />
                    <h2 className="mt-4 text-2xl sm:text-3xl font-bold tracking-tight">Start with a free test today</h2>
                    <p className="mt-2 text-muted-foreground max-w-xl mx-auto">
                        Create your account in a minute and attempt your first mock test for free.
                    </p>
                    <div className="mt-6 flex flex-col sm:flex-row justify-center gap-3">
                        <Link href="/auth/signup" className="btn btn-primary btn-lg">
                            Create free account
                            <ArrowRight className="h-4 w-4" />
                        </Link>
                        <Link href="/dashboard/tests" className="btn btn-secondary btn-lg">
                            Browse free tests
                        </Link>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="border-t border-card-border">
                <div className="page-container py-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
                    <Logo />
                    <nav className="flex flex-wrap items-center gap-x-5 gap-y-2">
                        <Link href="/dashboard/test-series" className="hover:text-foreground">Test series</Link>
                        <Link href="/dashboard/tests" className="hover:text-foreground">Free tests</Link>
                        <Link href="/dashboard/live" className="hover:text-foreground">Live classes</Link>
                        <Link href="/dashboard/help" className="hover:text-foreground">Help</Link>
                        <Link href="/auth/login" className="hover:text-foreground">Sign in</Link>
                    </nav>
                    <p>© {new Date().getFullYear()} OSDHYAN</p>
                </div>
            </footer>
        </div>
    );
}
