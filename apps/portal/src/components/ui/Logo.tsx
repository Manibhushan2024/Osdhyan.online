'use client';

import React, { useId } from 'react';
import { cn } from '@/lib/utils';

interface LogoProps {
    className?: string;
    iconOnly?: boolean;
    variant?: 'default' | 'white' | 'indigo';
    /** Optional short line under the wordmark (e.g. "Exam preparation"). Off by default. */
    tagline?: string;
}

export function Logo({ className, iconOnly = false, variant = 'default', tagline }: LogoProps) {
    const isWhite = variant === 'white';
    const gradientId = useId().replace(/:/g, '');

    return (
        <div className={cn('flex items-center gap-3 select-none', className)}>
            <div className="relative h-10 w-10 shrink-0 flex items-center justify-center">
                <svg viewBox="0 0 100 100" className="h-full w-full" aria-hidden="true">
                    <defs>
                        <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor={isWhite ? '#ffffff' : '#2563eb'} />
                            <stop offset="100%" stopColor={isWhite ? '#ffffff' : '#10b981'} />
                        </linearGradient>
                    </defs>
                    <circle
                        cx="50" cy="50" r="40"
                        fill="none"
                        stroke={`url(#${gradientId})`}
                        strokeWidth="10"
                        strokeLinecap="round"
                        strokeDasharray="190 62"
                    />
                    <circle cx="50" cy="50" r="15" fill={`url(#${gradientId})`} />
                </svg>
            </div>

            {!iconOnly && (
                <div className="flex flex-col leading-none">
                    <span
                        className={cn(
                            'text-xl font-extrabold tracking-tight',
                            isWhite ? 'text-white' : 'text-slate-900 dark:text-white'
                        )}
                    >
                        OS<span className={isWhite ? 'text-white/90' : 'text-blue-600 dark:text-blue-400'}>DHYAN</span>
                    </span>
                    {tagline && (
                        <span className={cn('mt-1 text-xs font-medium', isWhite ? 'text-white/60' : 'text-muted-foreground')}>
                            {tagline}
                        </span>
                    )}
                </div>
            )}
        </div>
    );
}
