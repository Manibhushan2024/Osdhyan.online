'use client';

import { useEffect, useRef, type ReactNode } from 'react';
import { Check, CheckCircle2, Lock } from 'lucide-react';
import { cn } from '@/lib/utils';

/*
 * Pieces of the DSSSB-style (TCS iON) computer-based test used by the test
 * player. Wording and colours follow
 * backend/database/data/dsssb/research/DSSSB_CBT_PATTERN.md §2.4–2.7 and §5;
 * the API contract is in SECTIONS_API.md next to it.
 */

/* ─── API shapes ────────────────────────────────────────────────────────── */

/** One group of a sectioned test: a 0-based range [from, from + count) into test.questions. */
export type TestSection = {
    key: string;
    name_en: string;
    name_hi?: string | null;
    from: number;
    count: number;
    duration_sec: number | null;
};

export type SectionStatus = 'locked' | 'active' | 'pending' | 'open';

export type SectionStateRow = TestSection & {
    status: SectionStatus;
    started_at?: string | null;
    deadline_at?: string | null;
    remaining_sec?: number | null;
    locked_at?: string | null;
    locked_by?: 'student' | 'timer' | null;
};

export type SectionState = {
    mode: 'sequential' | 'free';
    active_key: string | null;
    all_locked: boolean;
    sections: SectionStateRow[];
};

/** One row of metadata.section_results on a completed attempt. */
export type SectionResult = {
    key: string;
    name_en: string;
    name_hi?: string | null;
    total: number;
    correct: number;
    incorrect: number;
    unattempted: number;
    marks: number | string;
    max_marks: number | string;
    accuracy: number | string;
};

export function isSectionState(value: unknown): value is SectionState {
    const v = value as SectionState | null | undefined;
    return !!v && typeof v === 'object' && Array.isArray(v.sections) && v.sections.length > 0;
}

export function sectionName(s: { name_en: string; name_hi?: string | null }, language: 'en' | 'hi') {
    return (language === 'hi' && s.name_hi) || s.name_en;
}

/* ─── Exact TCS strings (DSSSB mock) ───────────────────────────────────── */

export const CBT_TEXT = {
    groupConfirm: "Are you sure to submit this Group? Click 'Yes' to proceed; Click 'No' to go back.",
    lockWarning: 'Dear Candidate, Once the Group is submitted, you cannot revisit and edit your responses.',
    attemptedGroup: (group: string) =>
        `You have already attempted ${group} group. Viewing or editing this group is not allowed upon submission.`,
    endOfGroup:
        'Dear Candidate, You have visited/attempted all the questions in the Group and reached the end. Please submit the group to proceed further.',
    finalSubmit: "Dear Candidate, Thank you. Please note that, your Exam is about to be submitted. Click on 'OK' to proceed further.",
    timeOver:
        'Dear Candidate, The time duration allotted to you for the assessment has exhausted. Be assured that all the responses provided by you are saved in the system.',
    markedNotEvaluated:
        'The question(s) "Marked for Review" will be not be considered for evaluation. Hence, no marks will be allocated for the same.',
    declaration:
        'I have read and understood the instructions. All computer hardware allotted to me are in proper working condition. I declare that I am not in possession of / not wearing / not carrying any prohibited gadget like mobile phone, bluetooth devices etc. /any prohibited material with me into the Examination Hall.I agree that in case of not adhering to the instructions, I shall be liable to be debarred from this Test and/or to disciplinary action, which may include ban from future Tests / Examinations',
} as const;

/* ─── Palette status (the five standard states) ─────────────────────────── */

export type PaletteStatus = 'not_visited' | 'not_answered' | 'answered' | 'marked' | 'answered_marked';

type EntryLike = { selected_option_id?: number | null; status?: string; visited?: boolean } | undefined;

export function paletteStatus(entry: EntryLike): PaletteStatus {
    const answered = !!entry?.selected_option_id;
    const marked = entry?.status === 'marked';
    if (marked) return answered ? 'answered_marked' : 'marked';
    if (answered) return 'answered';
    if (entry?.visited) return 'not_answered';
    return 'not_visited';
}

export const PALETTE_ORDER: PaletteStatus[] = ['not_visited', 'not_answered', 'answered', 'marked', 'answered_marked'];

export const PALETTE_LABELS: Record<PaletteStatus, string> = {
    not_visited: 'Not Visited',
    not_answered: 'Not Answered',
    answered: 'Answered',
    marked: 'Marked for Review',
    answered_marked: 'Answered & Marked for Review',
};

/** Legend sentences from the TCS instructions. */
export function legendSentence(status: PaletteStatus, markedEvaluated: boolean): string {
    switch (status) {
        case 'not_visited':
            return 'You have not visited the question yet.';
        case 'not_answered':
            return 'You have not answered the question.';
        case 'answered':
            return 'You have answered the question.';
        case 'marked':
            return 'You have NOT answered the question, but have marked the question for review.';
        case 'answered_marked':
            return markedEvaluated
                ? 'You have answered the question and marked it for review. It will be evaluated.'
                : CBT_TEXT.markedNotEvaluated;
    }
}

/** Button colours (TCS sprite): grey square, orange-red / green tabs, purple circles. */
export const PALETTE_CLASSES: Record<PaletteStatus, string> = {
    not_visited: 'bg-[#E4E4E4] border-[#cfcfcf] text-[#474747] rounded-md',
    not_answered: 'bg-[#DB4007] border-[#DB4007] text-white rounded-t-2xl rounded-b-md',
    answered: 'bg-[#7EC222] border-[#7EC222] text-white rounded-t-md rounded-b-2xl',
    marked: 'bg-[#755397] border-[#755397] text-white rounded-full',
    answered_marked: 'bg-[#755397] border-[#755397] text-white rounded-full',
};

export type PaletteCounts = Record<PaletteStatus, number>;

export function countPalette(entries: EntryLike[]): PaletteCounts {
    const counts: PaletteCounts = { not_visited: 0, not_answered: 0, answered: 0, marked: 0, answered_marked: 0 };
    for (const e of entries) counts[paletteStatus(e)] += 1;
    return counts;
}

export function TickBadge() {
    return (
        <span className="absolute -bottom-1 -right-1 h-4 w-4 rounded-full bg-[#7EC222] border-2 border-white dark:border-gray-900 flex items-center justify-center">
            <Check className="h-2.5 w-2.5 text-white" strokeWidth={4} />
        </span>
    );
}

/** Palette-style marker for a status (used in the legend). */
export function PaletteSwatch({ status, children, className }: { status: PaletteStatus; children?: ReactNode; className?: string }) {
    return (
        <span className={cn('relative h-8 w-8 shrink-0 border flex items-center justify-center text-xs font-bold tabular-nums', PALETTE_CLASSES[status], className)}>
            {children}
            {status === 'answered_marked' && <TickBadge />}
        </span>
    );
}

/** Legend with counts (palette) or with the instruction sentences (instructions page). */
export function PaletteLegend({
    counts,
    sentences = false,
    markedEvaluated = true,
    className,
}: {
    counts?: PaletteCounts;
    sentences?: boolean;
    markedEvaluated?: boolean;
    className?: string;
}) {
    return (
        <div className={cn(sentences ? 'space-y-3' : 'grid grid-cols-2 gap-x-3 gap-y-2', className)}>
            {PALETTE_ORDER.map((status) => (
                <div
                    key={status}
                    className={cn('flex items-center gap-2 min-w-0', !sentences && status === 'answered_marked' && 'col-span-2')}
                >
                    <PaletteSwatch status={status}>{counts ? counts[status] : sentences ? PALETTE_ORDER.indexOf(status) + 1 : null}</PaletteSwatch>
                    <span className="text-xs text-foreground/80 leading-snug">
                        {sentences ? legendSentence(status, markedEvaluated) : PALETTE_LABELS[status]}
                    </span>
                </div>
            ))}
            {!sentences && !markedEvaluated && (
                <p className="col-span-2 text-[11px] leading-snug text-foreground/60">
                    Answered &amp; Marked for Review questions are not evaluated. Use Save &amp; Next on them for the answer to count.
                </p>
            )}
        </div>
    );
}

/** TCS "View in :" language dropdown. */
export function ViewInSelect({
    language,
    onChange,
    className,
}: {
    language: 'en' | 'hi';
    onChange: (language: 'en' | 'hi') => void;
    className?: string;
}) {
    return (
        <label className={cn('flex items-center gap-2 text-sm text-foreground/70', className)}>
            <span className="whitespace-nowrap">View in :</span>
            <select
                value={language}
                onChange={(e) => onChange(e.target.value === 'hi' ? 'hi' : 'en')}
                className="h-9 rounded-lg border border-card-border bg-background px-2 text-sm text-foreground"
            >
                <option value="en">English</option>
                <option value="hi">Hindi</option>
            </select>
        </label>
    );
}

/* ─── Group strip (tabs across the top) ─────────────────────────────────── */

export function SectionStrip({
    sections,
    statusOf,
    currentKey,
    language,
    sequential,
    onSelect,
}: {
    sections: TestSection[];
    statusOf: (key: string) => SectionStatus;
    currentKey: string | null;
    language: 'en' | 'hi';
    sequential: boolean;
    onSelect: (section: TestSection) => void;
}) {
    const stripRef = useRef<HTMLDivElement | null>(null);

    // Keep the current group's tab in sight on narrow screens.
    useEffect(() => {
        const el = stripRef.current?.querySelector<HTMLElement>('[data-current="true"]');
        el?.scrollIntoView({ block: 'nearest', inline: 'center', behavior: 'smooth' });
    }, [currentKey]);

    return (
        <div className="bg-card-bg border-b border-card-border">
            <div ref={stripRef} className="flex gap-2 overflow-x-auto no-scrollbar px-3 sm:px-6 py-2" role="tablist" aria-label="Groups">
                {sections.map((s, i) => {
                    const status = statusOf(s.key);
                    const isCurrent = currentKey === s.key;
                    const disabled = sequential && status === 'pending';
                    const title = status === 'locked'
                        ? 'Submitted'
                        : status === 'pending'
                            ? 'Opens after you submit the current group'
                            : undefined;
                    return (
                        <button
                            key={s.key}
                            type="button"
                            role="tab"
                            aria-selected={isCurrent}
                            aria-disabled={disabled || (sequential && status === 'locked')}
                            data-current={isCurrent}
                            disabled={disabled}
                            title={title}
                            onClick={() => onSelect(s)}
                            className={cn(
                                'shrink-0 flex items-center gap-2 rounded-lg border px-3 py-1.5 min-h-[40px] text-left text-xs font-semibold transition-colors',
                                isCurrent
                                    ? 'bg-blue-600 border-blue-600 text-white'
                                    : status === 'locked'
                                        ? 'bg-background border-card-border text-foreground/60'
                                        : status === 'pending'
                                            ? 'bg-background border-card-border text-foreground/35 cursor-not-allowed'
                                            : 'bg-background border-card-border text-foreground/80 hover:border-blue-500/40',
                            )}
                        >
                            {status === 'locked' && <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-green-600" />}
                            {status === 'pending' && <Lock className="h-3.5 w-3.5 shrink-0" />}
                            <span className="tabular-nums opacity-70">{i + 1}.</span>
                            <span className="max-w-[150px] sm:max-w-[240px] truncate">{sectionName(s, language)}</span>
                        </button>
                    );
                })}
            </div>
        </div>
    );
}

/* ─── Group summary (TCS summary page before submitting) ────────────────── */

export type SectionSummaryRow = {
    key: string;
    name: string;
    total: number;
    counts: PaletteCounts;
    current?: boolean;
};

/** Section Name | No. of Questions | Answered | Not Answered | Marked for Review | Not Visited */
export function SectionSummaryTable({ rows, markedEvaluated = true }: { rows: SectionSummaryRow[]; markedEvaluated?: boolean }) {
    const answeredMarked = rows.reduce((acc, r) => acc + r.counts.answered_marked, 0);
    return (
        <div className="space-y-2">
            <div className="max-h-[45vh] overflow-auto rounded-xl border border-card-border">
                <table className="w-full text-xs">
                    <thead className="bg-background text-foreground/70 sticky top-0">
                        <tr>
                            <th className="text-left font-semibold px-3 py-2">Section Name</th>
                            <th className="text-right font-semibold px-2 py-2">No. of Questions</th>
                            <th className="text-right font-semibold px-2 py-2">Answered</th>
                            <th className="text-right font-semibold px-2 py-2">Not Answered</th>
                            <th className="text-right font-semibold px-2 py-2">Marked for Review</th>
                            <th className="text-right font-semibold px-3 py-2">Not Visited</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-card-border">
                        {rows.map((r) => (
                            <tr key={r.key} className={cn(r.current && 'bg-blue-600/5 font-semibold')}>
                                <td className="px-3 py-2 text-foreground">{r.name}</td>
                                <td className="px-2 py-2 text-right tabular-nums">{r.total}</td>
                                <td className="px-2 py-2 text-right tabular-nums">{r.counts.answered}</td>
                                <td className="px-2 py-2 text-right tabular-nums">{r.counts.not_answered}</td>
                                <td className="px-2 py-2 text-right tabular-nums">{r.counts.marked + r.counts.answered_marked}</td>
                                <td className="px-3 py-2 text-right tabular-nums">{r.counts.not_visited}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            {answeredMarked > 0 && (
                <p className="text-xs text-foreground/70">
                    Marked for Review includes {answeredMarked} Answered &amp; Marked for Review
                    {markedEvaluated ? '.' : ' (will not be considered for evaluation).'}
                </p>
            )}
        </div>
    );
}

/* ─── Instructions (TCS pages 1 and 2) ──────────────────────────────────── */

function minutes(sec: number) {
    return Math.round(sec / 60);
}

/** Page 1: "General Instructions" (timer, palette legend, navigating, answering, sections). */
export function GeneralInstructions({ sequential, markedEvaluated }: { sequential: boolean; markedEvaluated: boolean }) {
    return (
        <div className="space-y-5 text-sm text-foreground/80 leading-relaxed">
            <p className="font-semibold text-foreground">Please read the instructions carefully</p>
            <div className="space-y-2">
                <h3 className="font-semibold text-foreground underline">General Instructions:</h3>
                <ol className="list-decimal pl-5 space-y-2">
                    <li>
                        The clock is set on the server. The countdown timer at the top right of the screen shows the time left to complete the
                        exam. When the timer reaches zero, the exam ends by itself. You do not need to end or submit it.
                    </li>
                    <li>
                        The Question Palette on the right of the screen shows the status of each question using one of these symbols:
                        <PaletteLegend sentences markedEvaluated={markedEvaluated} className="mt-3" />
                    </li>
                    <li>You can click the &quot;&gt;&quot; / &quot;&lt;&quot; button (☰ on phones) to hide or show the Question Palette.</li>
                </ol>
            </div>
            <div className="space-y-2">
                <h3 className="font-semibold text-foreground underline">Navigating to a Question:</h3>
                <ol className="list-decimal pl-5 space-y-2">
                    <li>Click a question number in the Question Palette to go to that question directly. This does NOT save your answer to the current question.</li>
                    <li>Click <strong>Save &amp; Next</strong> to save your answer for the current question and go to the next question.</li>
                    <li>Click <strong>Mark for Review &amp; Next</strong> to save your answer, mark the question for review and go to the next question.</li>
                </ol>
            </div>
            <div className="space-y-2">
                <h3 className="font-semibold text-foreground underline">Answering a Question:</h3>
                <ol className="list-decimal pl-5 space-y-2">
                    <li>To select an answer, click the button of one of the options. Click the selected option again or click <strong>Clear Response</strong> to deselect it.</li>
                    <li>To change your answer, click the button of another option.</li>
                    <li>To save your answer, you MUST click <strong>Save &amp; Next</strong>.</li>
                    <li>To mark a question for review, click <strong>Mark for Review &amp; Next</strong>.</li>
                </ol>
            </div>
            <div className="space-y-2">
                <h3 className="font-semibold text-foreground underline">Navigating through sections:</h3>
                <ol className="list-decimal pl-5 space-y-2">
                    <li>The sections (groups) of this question paper are shown on the top bar of the screen. The section you are viewing is highlighted.</li>
                    {sequential ? (
                        <li>
                            After you click <strong>Submit</strong> for a section, you will see its summary, and the next section opens when you click
                            <strong> Yes</strong>. You cannot move between sections at will: they open one after another, in order.
                        </li>
                    ) : (
                        <li>You can move between sections at any time by clicking their names on the top bar.</li>
                    )}
                </ol>
            </div>
        </div>
    );
}

/** Page 2: "Other Important Instructions" with the group table. */
export function OtherInstructions({
    sections,
    sequential,
    totalDurationSec,
    totalMarks,
    negativeMarking,
    language,
}: {
    sections: TestSection[];
    sequential: boolean;
    totalDurationSec: number;
    totalMarks: number;
    negativeMarking: number;
    language: 'en' | 'hi';
}) {
    const timed = sections.some((s) => s.duration_sec);
    const totalQs = sections.reduce((acc, s) => acc + s.count, 0);
    return (
        <div className="space-y-4 text-sm text-foreground/80 leading-relaxed">
            <h3 className="font-semibold text-foreground underline">Other Important Instructions</h3>
            <div className="overflow-x-auto rounded-xl border border-card-border">
                <table className="w-full text-sm">
                    <thead className="bg-background text-foreground/70">
                        <tr>
                            <th className="text-left font-semibold px-3 py-2 w-12">Group</th>
                            <th className="text-left font-semibold px-3 py-2">Section</th>
                            <th className="text-right font-semibold px-3 py-2">Questions</th>
                            {timed && <th className="text-right font-semibold px-3 py-2">Time</th>}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-card-border">
                        {sections.map((s, i) => (
                            <tr key={s.key}>
                                <td className="px-3 py-2 tabular-nums text-foreground/60">{i + 1}</td>
                                <td className="px-3 py-2 text-foreground">{sectionName(s, language)}</td>
                                <td className="px-3 py-2 text-right tabular-nums">{s.count}</td>
                                {timed && <td className="px-3 py-2 text-right">{s.duration_sec ? `${minutes(s.duration_sec)} min` : '—'}</td>}
                            </tr>
                        ))}
                    </tbody>
                    <tfoot className="border-t border-card-border font-semibold">
                        <tr>
                            <td className="px-3 py-2" />
                            <td className="px-3 py-2">Total</td>
                            <td className="px-3 py-2 text-right tabular-nums">{totalQs}</td>
                            {timed && <td className="px-3 py-2" />}
                        </tr>
                    </tfoot>
                </table>
            </div>
            <ol className="list-decimal pl-5 space-y-2">
                <li>
                    You will be given <strong>{minutes(totalDurationSec)} minutes</strong> for {totalQs} questions ({totalMarks} marks).
                    {timed
                        ? ' Some sections also have their own time limit (shown above); when it runs out, that section is submitted automatically and the next one opens.'
                        : ' There is no separate time limit for a section: the total time is shared by all sections.'}
                </li>
                <li>Questions are available in English and Hindi. If the two versions differ, the English version prevails.</li>
                <li>One question will be displayed on the screen at a time. Each question has 4 options, and only one of them is correct.</li>
                {negativeMarking > 0 && (
                    <li>
                        <strong>{negativeMarking} marks</strong> will be deducted for every wrong answer. Unanswered questions get no marks.
                    </li>
                )}
                {sequential && (
                    <li>
                        <strong>Candidates will not be allowed to re-visit the same group again after submission of that particular group.</strong>
                        {' '}Submitting the last group submits the whole test.
                    </li>
                )}
            </ol>
        </div>
    );
}
