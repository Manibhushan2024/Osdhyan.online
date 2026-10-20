'use client';

import Link from 'next/link';
import { Calendar, Clock, Play, Radio, Users, Video, Youtube } from 'lucide-react';
import { cn } from '@/lib/utils';
import StatusBadge from './StatusBadge';
import { formatAgo, formatWhen } from './format';
import type { LiveClassSummary } from './types';

type Props = {
    cls: LiveClassSummary;
    /** Big "live now" presentation */
    featured?: boolean;
};

export default function ClassCard({ cls, featured = false }: Props) {
    const href = `/dashboard/live/${cls.id}`;
    const ProviderIcon = cls.provider === 'youtube' ? Youtube : Video;

    return (
        <div
            className={cn(
                'group relative overflow-hidden bg-card-bg border rounded-[2rem] flex flex-col gap-4 transition-all hover:shadow-xl',
                featured ? 'p-7 border-red-500/30 shadow-lg shadow-red-500/5' : 'p-6 border-card-border',
            )}
        >
            {featured && <div className="absolute inset-0 bg-gradient-to-br from-red-500/5 to-transparent pointer-events-none" />}

            <div className="relative flex items-start justify-between gap-3">
                <div className={cn('h-11 w-11 rounded-2xl flex items-center justify-center shrink-0', featured ? 'bg-red-500/10' : 'bg-foreground/5')}>
                    <ProviderIcon className={cn('h-5 w-5', featured ? 'text-red-500' : 'text-foreground/40')} />
                </div>
                <StatusBadge status={cls.status} />
            </div>

            <div className="relative space-y-1 flex-1">
                {cls.subject && <p className="text-[9px] font-black text-red-500 uppercase tracking-widest">{cls.subject}{cls.exam ? ` · ${cls.exam}` : ''}</p>}
                <h3 className={cn('font-black text-foreground tracking-tight leading-snug group-hover:text-red-500 transition-colors', featured ? 'text-xl' : 'text-base')}>
                    {cls.title}
                </h3>
                {cls.description && <p className="text-xs font-medium text-foreground/50 line-clamp-2">{cls.description}</p>}
            </div>

            <div className="relative flex flex-wrap items-center gap-x-4 gap-y-1 text-[10px] font-bold text-foreground/50 uppercase tracking-wider">
                <span className="flex items-center gap-1.5 truncate">
                    <span className="h-5 w-5 rounded-full bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-[9px] font-black text-white shrink-0">
                        {cls.teacher?.name?.charAt(0) ?? 'T'}
                    </span>
                    {cls.teacher?.name ?? 'Teacher'}
                </span>
                {cls.status === 'live' && (
                    <>
                        <span className="flex items-center gap-1"><Users className="h-3 w-3" /> {cls.participants_count} in class</span>
                        {cls.started_at && <span className="flex items-center gap-1 text-red-500"><Clock className="h-3 w-3" /> started {formatAgo(cls.started_at)}</span>}
                    </>
                )}
                {cls.status === 'scheduled' && (
                    <span className="flex items-center gap-1"><Calendar className="h-3 w-3" /> {formatWhen(cls.scheduled_at)}</span>
                )}
                {cls.status === 'ended' && cls.ended_at && (
                    <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {formatWhen(cls.ended_at)}</span>
                )}
                {cls.duration_min ? <span>{cls.duration_min} min</span> : null}
            </div>

            <Link
                href={href}
                className={cn(
                    'relative w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all active:scale-95',
                    cls.status === 'live'
                        ? 'bg-red-500 hover:bg-red-400 text-white shadow-lg shadow-red-500/20'
                        : cls.status === 'scheduled'
                            ? 'bg-foreground/5 hover:bg-foreground/10 text-foreground'
                            : cls.recording_url
                                ? 'bg-indigo-600 hover:bg-indigo-500 text-white'
                                : 'bg-foreground/5 text-foreground/40',
                )}
            >
                {cls.status === 'live' && <><Radio className="h-3.5 w-3.5" /> Join class</>}
                {cls.status === 'scheduled' && <><Clock className="h-3.5 w-3.5" /> See details</>}
                {cls.status === 'ended' && (cls.recording_url ? <><Play className="h-3.5 w-3.5" /> Watch recording</> : <>Recording coming soon</>)}
            </Link>
        </div>
    );
}
