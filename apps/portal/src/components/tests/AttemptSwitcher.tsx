'use client';

import Link from 'next/link';
import { Download, History } from 'lucide-react';
import { cn } from '@/lib/utils';

/** One entry of `attempts[]` from GET /attempts/{id} (oldest first). */
export type AttemptRef = {
    id: number;
    number: number;
    status: string;
    total_score: number | string | null;
    started_at: string | null;
    completed_at: string | null;
};

export function formatScore(value: number | string | null | undefined): string {
    const n = Number(value ?? 0);
    if (!Number.isFinite(n)) return '0';
    return Number.isInteger(n) ? String(n) : String(Math.round(n * 100) / 100);
}

export function reportHref(attemptId: number | string, autoPrint = false) {
    return `/dashboard/tests/solutions/${attemptId}/print${autoPrint ? '?print=1' : ''}`;
}

/**
 * "Attempt 2 of 3" plus a chip for every completed attempt at the same test,
 * each opening the same page (result / solutions) for that attempt.
 */
export default function AttemptSwitcher({
    currentId,
    attemptNumber,
    attempts,
    testId,
    hrefFor,
    showDownload = true,
}: {
    currentId: number;
    attemptNumber?: number | null;
    attempts?: AttemptRef[] | null;
    testId?: number | null;
    hrefFor: (attemptId: number) => string;
    showDownload?: boolean;
}) {
    const list = attempts ?? [];
    const total = list.length;
    const number = attemptNumber ?? list.find((a) => a.id === currentId)?.number ?? null;
    const completed = list.filter((a) => a.status === 'completed');

    return (
        <div className="card p-4 flex flex-col gap-3 print:hidden">
            <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="text-sm font-semibold">
                    {number && total > 0 ? `Attempt ${number} of ${total}` : 'Attempt'}
                    {total > 1 && completed.length > 1 && (
                        <span className="font-normal text-muted-foreground"> · pick another attempt to compare</span>
                    )}
                </p>
                <div className="flex flex-wrap items-center gap-2">
                    {testId ? (
                        <Link href={`/dashboard/history?test=${testId}`} className="btn btn-ghost btn-sm">
                            <History className="h-4 w-4" />
                            All attempts
                        </Link>
                    ) : null}
                    {showDownload && (
                        <Link href={reportHref(currentId)} className="btn btn-secondary btn-sm">
                            <Download className="h-4 w-4" />
                            Download PDF
                        </Link>
                    )}
                </div>
            </div>
            {completed.length > 1 && (
                <div className="flex flex-wrap gap-2" role="list" aria-label="Completed attempts">
                    {completed.map((a) => {
                        const active = a.id === currentId;
                        const when = a.completed_at
                            ? new Date(a.completed_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })
                            : '';
                        return (
                            <Link
                                key={a.id}
                                role="listitem"
                                href={hrefFor(a.id)}
                                aria-current={active ? 'page' : undefined}
                                className={cn(
                                    'inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors',
                                    active
                                        ? 'bg-primary text-white border-primary'
                                        : 'bg-card-bg border-card-border text-muted-foreground hover:text-foreground hover:bg-muted'
                                )}
                            >
                                <span className="font-semibold">#{a.number}</span>
                                <span>{formatScore(a.total_score)} {Number(a.total_score) === 1 ? 'mark' : 'marks'}</span>
                                {when && <span className={active ? 'opacity-80' : 'opacity-70'}>· {when}</span>}
                            </Link>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
