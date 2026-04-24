'use client';

import React, { useId } from 'react';
import { cn } from '@/lib/utils';

interface LogoProps {
    className?: string;
    iconOnly?: boolean;
    variant?: 'default' | 'white' | 'indigo';
}

export function Logo({ className, iconOnly = false, variant = 'default' }: LogoProps) {
    const isWhite = variant === 'white';
    const gradientId = useId().replace(/:/g, ""); // Remove colons for SVG ID compatibility

    return (
        <div className={cn("flex items-center gap-4 select-none group", className)}>
            {/* Logo Icon Container */}
            <div className="relative h-12 w-12 flex items-center justify-center">
                {/* Tech Aura - Inner Glow */}
                <div className={cn(
                    "absolute inset-0 blur-2xl opacity-20 group-hover:opacity-60 transition-all duration-700 rounded-full scale-110",
                    isWhite ? "bg-white" : "bg-indigo-500"
                )} />

                {/* Primary SVG Layer */}
                <svg
                    viewBox="0 0 100 100"
                    className="relative w-full h-full drop-shadow-[0_0_15px_rgba(99,102,241,0.3)] overflow-visible"
                    aria-hidden="true"
                >
                    <defs>
                        <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor={isWhite ? "#fff" : "#6366f1"} />
                            <stop offset="100%" stopColor={isWhite ? "#fff" : "#10b981"} />
                        </linearGradient>

                        <filter id="glow-effect" x="-20%" y="-20%" width="140%" height="140%">
                            <feGaussianBlur stdDeviation="3" result="blur" />
                            <feComposite in="SourceGraphic" in2="blur" operator="over" />
                        </filter>
                    </defs>

                    {/* Outer Technical Ring (The "O") */}
                    <circle
                        cx="50" cy="50" r="42"
                        fill="none"
                        stroke={`url(#${gradientId})`}
                        strokeWidth="8"
                        strokeLinecap="round"
                        strokeDasharray="180 80"
                        className="transition-all duration-1000 group-hover:rotate-[360deg] origin-center"
                    />

                    {/* Secondary Accent Ring */}
                    <circle
                        cx="50" cy="50" r="32"
                        fill="none"
                        stroke={isWhite ? "rgba(255,255,255,0.3)" : "rgba(99,102,241,0.3)"}
                        strokeWidth="1.5"
                        strokeDasharray="4 8"
                        className="transition-all duration-1000 group-hover:-rotate-[180deg] origin-center"
                    />

                    {/* Central Focus Point (The "Dhyan" Core) */}
                    <circle
                        cx="50" cy="50" r="14"
                        fill={`url(#${gradientId})`}
                        className="transition-all duration-500 group-hover:scale-110"
                        style={{ filter: "url(#glow-effect)" }}
                    />

                    {/* Inner Core Pulse */}
                    <circle
                        cx="50" cy="50" r="6"
                        fill="white"
                        className="animate-pulse"
                    />
                </svg>
            </div>

            {/* Brand Text */}
            {!iconOnly && (
                <div className="flex flex-col">
                    <h1 className={cn(
                        "text-2xl font-black tracking-tighter italic uppercase leading-none flex items-center gap-1",
                        isWhite ? "text-white" : "text-slate-900 dark:text-white"
                    )}>
                        os<span className={isWhite ? "text-white/90" : "text-transparent bg-clip-text bg-gradient-to-br from-indigo-600 to-emerald-500"}>dhyan</span>
                    </h1>
                    <div className="flex items-center gap-2 mt-1">
                        <span className={cn(
                            "text-[8px] font-black uppercase tracking-[0.4em]",
                            isWhite ? "text-white/40" : "text-indigo-500/60"
                        )}>
                            Intelligence Hub
                        </span>
                        <div className={cn("h-px w-8 transition-all duration-500 group-hover:w-12", isWhite ? "bg-white/20" : "bg-indigo-500/20")} />
                    </div>
                </div>
            )}
        </div>
    );
}
