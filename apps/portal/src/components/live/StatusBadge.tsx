import { Check, Clock } from 'lucide-react';
import type { LiveStatus } from './types';

export default function StatusBadge({ status }: { status: LiveStatus }) {
    if (status === 'live') {
        return (
            <span className="inline-flex items-center gap-1.5 text-[9px] font-black uppercase tracking-widest text-red-500 bg-red-500/10 border border-red-500/20 px-2.5 py-1 rounded-full">
                <span className="h-1.5 w-1.5 rounded-full bg-red-500 animate-pulse" /> Live
            </span>
        );
    }
    if (status === 'scheduled') {
        return (
            <span className="inline-flex items-center gap-1.5 text-[9px] font-black uppercase tracking-widest text-blue-500 bg-blue-500/10 border border-blue-500/20 px-2.5 py-1 rounded-full">
                <Clock className="h-2.5 w-2.5" /> Upcoming
            </span>
        );
    }
    return (
        <span className="inline-flex items-center gap-1.5 text-[9px] font-black uppercase tracking-widest text-foreground/40 bg-foreground/5 border border-card-border px-2.5 py-1 rounded-full">
            <Check className="h-2.5 w-2.5" /> Ended
        </span>
    );
}
