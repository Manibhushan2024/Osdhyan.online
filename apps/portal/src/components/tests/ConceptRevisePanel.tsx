'use client';

import { useCallback, useRef, useState } from 'react';
import Link from 'next/link';
import { BookOpen, ChevronDown, FileText, Loader2, RotateCcw } from 'lucide-react';
import api from '@/lib/api';
import { cn } from '@/lib/utils';

/* ------------------------------------------------------------------ */
/* API shapes: GET /questions/{id}/concept and GET /concepts/{key}      */
/* ------------------------------------------------------------------ */

export type ConceptSectionRef = { position: number; title: string };

export type ConceptChapterRef = {
    concept_key: string;
    chapter_title: string;
    material_id: number | null;
    sections: ConceptSectionRef[];
};

export type QuestionConceptFound = {
    found: true;
    concept_key: string;
    subtopic?: string | null;
    pack?: string | null;
    chapter_key: string;
    chapter_title: string;
    material_id: number | null;
    section: { position: number; title: string; html: string; markdown?: string };
    chapters: ConceptChapterRef[];
};

export type QuestionConcept =
    | QuestionConceptFound
    | { found: false; reason: 'no_concept_key' | 'no_notes_yet' | string; concept_key?: string };

export type ConceptChapter = {
    concept_key: string;
    chapter_title: string;
    pack?: string | null;
    material_id: number | null;
    sections: { position: number; title: string; html: string }[];
};

export type Loadable<T> =
    | { status: 'loading' }
    | { status: 'ready'; data: T }
    | { status: 'error' };

/* ------------------------------------------------------------------ */
/* Cache: one entry per question, one per chapter, in-flight de-duped    */
/* ------------------------------------------------------------------ */

export function useConceptNotes() {
    const [byQuestion, setByQuestion] = useState<Record<number, Loadable<QuestionConcept>>>({});
    const [byChapter, setByChapter] = useState<Record<string, Loadable<ConceptChapter>>>({});
    const questionRequests = useRef(new Map<number, Promise<QuestionConcept | null>>());
    const chapterRequests = useRef(new Map<string, Promise<ConceptChapter | null>>());

    const loadQuestion = useCallback((questionId: number): Promise<QuestionConcept | null> => {
        const existing = questionRequests.current.get(questionId);
        if (existing) return existing;

        setByQuestion((prev) => ({ ...prev, [questionId]: { status: 'loading' } }));
        const request = api
            .get<QuestionConcept>(`/questions/${questionId}/concept`)
            .then((res) => {
                setByQuestion((prev) => ({ ...prev, [questionId]: { status: 'ready', data: res.data } }));
                return res.data;
            })
            .catch(() => {
                questionRequests.current.delete(questionId); // allow a retry
                setByQuestion((prev) => ({ ...prev, [questionId]: { status: 'error' } }));
                return null;
            });
        questionRequests.current.set(questionId, request);
        return request;
    }, []);

    const loadChapter = useCallback((key: string): Promise<ConceptChapter | null> => {
        const existing = chapterRequests.current.get(key);
        if (existing) return existing;

        setByChapter((prev) => ({ ...prev, [key]: { status: 'loading' } }));
        const request = api
            .get<ConceptChapter>(`/concepts/${encodeURIComponent(key)}`)
            .then((res) => {
                setByChapter((prev) => ({ ...prev, [key]: { status: 'ready', data: res.data } }));
                return res.data;
            })
            .catch(() => {
                chapterRequests.current.delete(key);
                setByChapter((prev) => ({ ...prev, [key]: { status: 'error' } }));
                return null;
            });
        chapterRequests.current.set(key, request);
        return request;
    }, []);

    return { byQuestion, byChapter, loadQuestion, loadChapter };
}

export type ConceptNotes = ReturnType<typeof useConceptNotes>;

/** Runs `fn` over `items` with at most `limit` calls in flight. */
export async function runWithConcurrency<T>(
    items: T[],
    limit: number,
    fn: (item: T) => Promise<unknown>,
    isCancelled: () => boolean = () => false,
): Promise<void> {
    let next = 0;
    const worker = async () => {
        while (!isCancelled() && next < items.length) {
            const item = items[next++];
            await fn(item);
        }
    };
    await Promise.all(Array.from({ length: Math.min(limit, items.length) }, worker));
}

/* ------------------------------------------------------------------ */
/* Notes HTML styling (server-rendered from our own markdown)           */
/* ------------------------------------------------------------------ */

const NOTES_CSS = `
.concept-notes { font-size: 14px; line-height: 1.7; color: var(--foreground); overflow-wrap: anywhere; }
.concept-notes > * + * { margin-top: 0.75rem; }
.concept-notes h1, .concept-notes h2, .concept-notes h3, .concept-notes h4, .concept-notes h5 { font-weight: 700; line-height: 1.35; margin-top: 1.25rem; color: var(--foreground); }
.concept-notes h1, .concept-notes h2 { font-size: 1.05rem; }
.concept-notes h3 { font-size: 1rem; }
.concept-notes h4, .concept-notes h5 { font-size: 0.925rem; }
.concept-notes p { margin: 0; }
.concept-notes p + p { margin-top: 0.6rem; }
.concept-notes strong { font-weight: 700; color: var(--foreground); }
.concept-notes em { font-style: italic; }
.concept-notes ul { list-style: disc; padding-left: 1.25rem; }
.concept-notes ol { list-style: decimal; padding-left: 1.4rem; }
.concept-notes li + li { margin-top: 0.3rem; }
.concept-notes li > ul, .concept-notes li > ol { margin-top: 0.3rem; }
.concept-notes a { color: var(--primary); text-decoration: underline; }
.concept-notes code { font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace; font-size: 0.85em; background: var(--muted); border: 1px solid var(--card-border); border-radius: 0.35rem; padding: 0.05rem 0.3rem; }
.concept-notes pre { background: var(--muted); border: 1px solid var(--card-border); border-radius: 0.75rem; padding: 0.75rem 1rem; overflow-x: auto; font-size: 13px; line-height: 1.55; }
.concept-notes pre code { background: none; border: 0; padding: 0; font-size: inherit; overflow-wrap: normal; white-space: pre; }
.concept-notes blockquote { border-left: 3px solid var(--primary); padding: 0.25rem 0 0.25rem 0.9rem; color: var(--muted-foreground); }
.concept-notes hr { border: 0; border-top: 1px solid var(--card-border); margin: 1rem 0; }
.concept-notes table { display: block; max-width: 100%; overflow-x: auto; border-collapse: collapse; font-size: 13px; -webkit-overflow-scrolling: touch; }
.concept-notes th, .concept-notes td { border: 1px solid var(--card-border); padding: 0.45rem 0.65rem; text-align: left; vertical-align: top; min-width: 6rem; overflow-wrap: normal; }
.concept-notes th { background: var(--muted); font-weight: 700; }
.concept-notes tr:nth-child(even) td { background: color-mix(in srgb, var(--muted) 45%, transparent); }
`;

/* ------------------------------------------------------------------ */
/* The panel                                                            */
/* ------------------------------------------------------------------ */

type Props = {
    questionId: number;
    /** Wrong or skipped: show the button prominently. */
    highlight: boolean;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    notes: ConceptNotes;
};

export default function ConceptRevisePanel({ questionId, highlight, open, onOpenChange, notes }: Props) {
    const { byQuestion, byChapter, loadQuestion, loadChapter } = notes;
    const entry = byQuestion[questionId];

    // Which chapter/section the student picked; null = the section matched to this question.
    const [picked, setPicked] = useState<{ key: string; position: number } | null>(null);

    const toggle = () => {
        const next = !open;
        onOpenChange(next);
        if (next && (!entry || entry.status === 'error')) void loadQuestion(questionId);
    };

    return (
        <div className="space-y-4">
            <button
                type="button"
                onClick={toggle}
                aria-expanded={open}
                className={cn(
                    'w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl px-5 py-3 text-sm font-bold transition-all active:scale-[0.98]',
                    highlight
                        ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20 hover:bg-blue-700'
                        : 'border border-card-border bg-background text-foreground/80 hover:border-blue-500/40 hover:text-blue-600',
                )}
            >
                <BookOpen className="h-4 w-4" />
                Revise this concept
                <ChevronDown className={cn('h-4 w-4 transition-transform', open && 'rotate-180')} />
            </button>

            {open && (
                <div className="rounded-2xl border border-blue-500/20 bg-blue-500/[0.03] dark:bg-blue-500/[0.06] p-4 sm:p-6">
                    <style dangerouslySetInnerHTML={{ __html: NOTES_CSS }} />
                    {(!entry || entry.status === 'loading') && <LoadingLine label="Loading the notes…" />}

                    {entry?.status === 'error' && (
                        <div className="flex flex-wrap items-center gap-3 text-sm text-foreground/70">
                            <span>Couldn&apos;t load the notes.</span>
                            <button
                                type="button"
                                onClick={() => void loadQuestion(questionId)}
                                className="inline-flex items-center gap-1.5 font-bold text-blue-600 hover:underline"
                            >
                                <RotateCcw className="h-3.5 w-3.5" /> Try again
                            </button>
                        </div>
                    )}

                    {entry?.status === 'ready' && !entry.data.found && (
                        <p className="text-sm text-muted-foreground">Notes for this topic are coming soon.</p>
                    )}

                    {entry?.status === 'ready' && entry.data.found && (
                        <FoundNotes
                            data={entry.data}
                            picked={picked}
                            onPick={(key, position) => {
                                setPicked({ key, position });
                                // Sections other than the matched one come from GET /concepts/{key} (cached per chapter).
                                if (entry.data.found && !(key === entry.data.chapter_key && position === entry.data.section.position)) {
                                    void loadChapter(key);
                                }
                            }}
                            byChapter={byChapter}
                            onRetryChapter={(key) => void loadChapter(key)}
                        />
                    )}
                </div>
            )}
        </div>
    );
}

function LoadingLine({ label }: { label: string }) {
    return (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" /> {label}
        </div>
    );
}

function FoundNotes({
    data,
    picked,
    onPick,
    byChapter,
    onRetryChapter,
}: {
    data: QuestionConceptFound;
    picked: { key: string; position: number } | null;
    onPick: (key: string, position: number) => void;
    byChapter: Record<string, Loadable<ConceptChapter>>;
    onRetryChapter: (key: string) => void;
}) {
    const key = picked?.key ?? data.chapter_key;
    const position = picked?.position ?? data.section.position;
    const isMatched = key === data.chapter_key && position === data.section.position;

    const chapters: ConceptChapterRef[] = data.chapters?.length
        ? data.chapters
        : [{ concept_key: data.chapter_key, chapter_title: data.chapter_title, material_id: data.material_id, sections: [{ position: data.section.position, title: data.section.title }] }];
    const chapterRef = chapters.find((c) => c.concept_key === key)
        ?? { concept_key: key, chapter_title: data.chapter_title, material_id: data.material_id, sections: [] };
    const materialId = chapterRef.material_id ?? (key === data.chapter_key ? data.material_id : null);

    const chapterLoad = byChapter[key];
    let title = chapterRef.sections.find((s) => s.position === position)?.title ?? '';
    let html: string | null = null;
    if (isMatched) {
        title = data.section.title;
        html = data.section.html;
    } else if (chapterLoad?.status === 'ready') {
        const section = chapterLoad.data.sections.find((s) => s.position === position);
        if (section) {
            title = section.title;
            html = section.html;
        }
    }

    return (
        <div className="space-y-5">
            <div className="space-y-1">
                <p className="text-xs font-bold uppercase tracking-wide text-blue-600">{chapterRef.chapter_title}</p>
                <h4 className="text-base sm:text-lg font-bold text-foreground leading-snug">{title}</h4>
                {isMatched && data.subtopic && (
                    <p className="text-xs text-muted-foreground">Topic: {data.subtopic}</p>
                )}
            </div>

            <div className="min-w-0">
                {html !== null ? (
                    // Our own notes, rendered to HTML on the server.
                    <div className="concept-notes" dangerouslySetInnerHTML={{ __html: html }} />
                ) : chapterLoad?.status === 'error' ? (
                    <div className="flex flex-wrap items-center gap-3 text-sm text-foreground/70">
                        <span>Couldn&apos;t load this section.</span>
                        <button type="button" onClick={() => onRetryChapter(key)} className="inline-flex items-center gap-1.5 font-bold text-blue-600 hover:underline">
                            <RotateCcw className="h-3.5 w-3.5" /> Try again
                        </button>
                    </div>
                ) : chapterLoad?.status === 'ready' ? (
                    <p className="text-sm text-muted-foreground">This section isn&apos;t available.</p>
                ) : (
                    <LoadingLine label="Loading section…" />
                )}
            </div>

            {chapterRef.sections.length > 1 && (
                <div className="space-y-2 border-t border-card-border pt-4">
                    <p className="text-xs font-bold uppercase tracking-wide text-foreground/50">Other sections of this chapter</p>
                    <div className="flex flex-wrap gap-2">
                        {chapterRef.sections.map((s) => {
                            const active = s.position === position;
                            return (
                                <button
                                    key={s.position}
                                    type="button"
                                    onClick={() => onPick(key, s.position)}
                                    className={cn(
                                        'max-w-full truncate rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors',
                                        active
                                            ? 'border-blue-600 bg-blue-600 text-white'
                                            : 'border-card-border bg-card-bg text-foreground/70 hover:border-blue-500/50 hover:text-blue-600',
                                    )}
                                    title={s.title}
                                >
                                    {s.title}
                                </button>
                            );
                        })}
                    </div>
                </div>
            )}

            {chapters.length > 1 && (
                <div className="space-y-2">
                    <p className="text-xs font-bold uppercase tracking-wide text-foreground/50">More chapters on this topic</p>
                    <div className="flex flex-wrap gap-2">
                        {chapters.map((c) => {
                            const active = c.concept_key === key;
                            return (
                                <button
                                    key={c.concept_key}
                                    type="button"
                                    onClick={() => {
                                        if (active) return;
                                        if (c.concept_key === data.chapter_key) onPick(c.concept_key, data.section.position);
                                        else onPick(c.concept_key, c.sections[0]?.position ?? 0);
                                    }}
                                    className={cn(
                                        'max-w-full truncate rounded-xl border px-3 py-1.5 text-xs font-semibold transition-colors',
                                        active
                                            ? 'border-blue-600/40 bg-blue-500/10 text-blue-600'
                                            : 'border-card-border bg-card-bg text-foreground/70 hover:border-blue-500/50 hover:text-blue-600',
                                    )}
                                    title={c.chapter_title}
                                >
                                    {c.chapter_title}
                                </button>
                            );
                        })}
                    </div>
                </div>
            )}

            {materialId && (
                <Link
                    href={`/dashboard/materials/${materialId}`}
                    target="_blank"
                    rel="noopener"
                    className="inline-flex items-center gap-2 rounded-xl border border-card-border bg-card-bg px-4 py-2.5 text-sm font-bold text-blue-600 hover:border-blue-500/50"
                >
                    <FileText className="h-4 w-4" /> Open full notes PDF
                </Link>
            )}
        </div>
    );
}

/* ------------------------------------------------------------------ */
/* "Weak concepts": wrong answers grouped by notes chapter              */
/* ------------------------------------------------------------------ */

export function WeakConceptsSummary({
    wrongIds,
    totalWrong,
    notes,
    onJump,
}: {
    /** Wrong question ids in paper order (already capped). */
    wrongIds: number[];
    totalWrong: number;
    notes: ConceptNotes;
    onJump: (questionId: number) => void;
}) {
    if (totalWrong === 0) return null;

    const groups = new Map<string, { title: string; count: number; firstId: number }>();
    let settled = 0;
    let withoutNotes = 0;
    for (const id of wrongIds) {
        const entry = notes.byQuestion[id];
        if (!entry || entry.status === 'loading') continue;
        settled++;
        if (entry.status !== 'ready' || !entry.data.found) {
            withoutNotes++;
            continue;
        }
        const title = entry.data.chapter_title;
        const g = groups.get(title);
        if (g) g.count++;
        else groups.set(title, { title, count: 1, firstId: id });
    }
    const loading = settled < wrongIds.length;
    const list = [...groups.values()].sort((a, b) => b.count - a.count);

    return (
        <div className="bg-card-bg border border-card-border rounded-2xl shadow-sm p-5 sm:p-6 space-y-3">
            <div className="flex flex-wrap items-baseline justify-between gap-2">
                <h3 className="flex items-center gap-2 text-sm font-bold text-foreground">
                    <BookOpen className="h-4 w-4 text-blue-600" /> Weak concepts
                </h3>
                <p className="text-xs text-muted-foreground">
                    {loading ? `Checking your wrong answers… ${settled}/${wrongIds.length}` : 'Tap a chapter to jump to its first wrong question.'}
                </p>
            </div>

            {list.length > 0 && (
                <div className="flex flex-wrap gap-2">
                    {list.map((g) => (
                        <button
                            key={g.title}
                            type="button"
                            onClick={() => onJump(g.firstId)}
                            className="max-w-full rounded-xl border border-red-500/25 bg-red-500/5 px-3 py-2 text-left text-xs font-semibold text-foreground/80 hover:border-red-500/50 hover:bg-red-500/10 transition-colors"
                        >
                            <span className="break-words">{g.title}</span>
                            <span className="ml-1.5 whitespace-nowrap font-bold text-red-600">— {g.count} wrong</span>
                        </button>
                    ))}
                </div>
            )}

            {!loading && list.length === 0 && (
                <p className="text-sm text-muted-foreground">Notes for the topics you got wrong are coming soon.</p>
            )}
            {!loading && list.length > 0 && withoutNotes > 0 && (
                <p className="text-xs text-muted-foreground">
                    {withoutNotes} other wrong answer{withoutNotes === 1 ? ' is' : 's are'} not linked to notes yet.
                </p>
            )}
            {totalWrong > wrongIds.length && (
                <p className="text-xs text-muted-foreground">Based on your first {wrongIds.length} wrong answers.</p>
            )}
        </div>
    );
}
