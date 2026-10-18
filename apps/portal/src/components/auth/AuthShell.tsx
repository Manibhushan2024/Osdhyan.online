'use client';

import Link from 'next/link';
import { Logo } from '@/components/ui/Logo';

interface AuthShellProps {
    title: string;
    subtitle?: string;
    children: React.ReactNode;
    footer?: React.ReactNode;
    /** Max width of the card. Defaults to "md". */
    width?: 'md' | 'lg';
}

/** Shared centred layout for sign in / sign up / password reset. */
export default function AuthShell({ title, subtitle, children, footer, width = 'md' }: AuthShellProps) {
    return (
        <div className="min-h-screen bg-background text-foreground flex flex-col">
            <header className="h-16 flex items-center">
                <div className="page-container">
                    <Link href="/" aria-label="OSDHYAN home" className="inline-flex">
                        <Logo />
                    </Link>
                </div>
            </header>

            <main className="flex-1 flex items-start sm:items-center justify-center px-4 py-8 sm:py-12">
                <div className={width === 'lg' ? 'w-full max-w-2xl' : 'w-full max-w-md'}>
                    <div className="mb-6 text-center sm:text-left">
                        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">{title}</h1>
                        {subtitle && <p className="mt-2 text-sm text-muted-foreground">{subtitle}</p>}
                    </div>

                    <div className="card p-6 sm:p-8">{children}</div>

                    {footer && <p className="mt-6 text-center text-sm text-muted-foreground">{footer}</p>}
                </div>
            </main>
        </div>
    );
}
