/** Shape of GET /api/attempts/{id}/analysis (owner only, completed attempts). */

export type AnalysisSection = {
    key: string;
    name: string;
    total: number;
    correct: number;
    incorrect: number;
    unattempted: number;
    marks: number;
    max_marks: number;
    accuracy: number;
    percentage: number;
    time_sec: number;
    avg_marks: number | null;
    topper_marks: number | null;
};

export type ImproveTip = {
    kind: string;
    priority: 'high' | 'medium' | 'low' | string;
    title: string;
    detail: string;
    section_key?: string;
    concept_key?: string;
};

export type WeakChapter = {
    concept_key: string;
    chapter_title: string;
    wrong: number;
    question_ids: number[];
};

export type QualifyingCategory = {
    category: string;
    percent: number;
    total_needed: number;
    section_b_needed: number;
    qualified: boolean;
    short_by: number;
};

export type Analysis = {
    attempt_id: number;
    test?: { id: number; name_en: string; duration_sec?: number; negative_marking?: number; evaluate_marked?: boolean };
    score: number;
    max_marks: number;
    percentage: number;
    counts: {
        total: number;
        attempted: number;
        correct: number;
        incorrect: number;
        unattempted: number;
        marked_not_evaluated: number;
    };
    accuracy: number;
    negative_marks_lost: number;
    rank: {
        rank: number;
        out_of: number;
        percentile: number;
        basis: 'first_attempt' | 'reattempt_compared_with_first_attempts' | string;
    } | null;
    comparison: { topper: number; average: number; median: number; you: number } | null;
    distribution: { from: number; to: number; students: number; you: boolean }[];
    sections: AnalysisSection[];
    time: { taken_sec: number; allowed_sec: number; per_question_sec: number };
    venn: {
        attempted_only: number;
        marked_only: number;
        both: number;
        neither: number;
        correct_attempted_only: number;
        correct_both: number;
    };
    qualifying: {
        total_percent: number;
        section_b_marks: number;
        section_b_max: number;
        section_b_percent: number;
        categories: QualifyingCategory[];
    } | null;
    improve: ImproveTip[];
    weak_chapters: WeakChapter[];
    trend: { attempt_id: number; number: number; score: number; date: string }[];
};

/** Exact number, at most 2 decimals, no trailing zeros. */
export function num(value: number | string | null | undefined): string {
    const n = Number(value ?? 0);
    if (!Number.isFinite(n)) return '0';
    return String(Math.round(n * 100) / 100);
}

export function plural(n: number, one: string, many = `${one}s`) {
    return `${num(n)} ${Math.abs(n) === 1 ? one : many}`;
}

export function formatDuration(sec: number) {
    const safe = Math.max(0, Math.floor(Number(sec) || 0));
    const h = Math.floor(safe / 3600);
    const m = Math.floor((safe % 3600) / 60);
    const s = safe % 60;
    if (h > 0) return `${h}h ${m}m`;
    if (m > 0) return `${m}m ${s}s`;
    return `${s}s`;
}

export function clampPct(value: number) {
    if (!Number.isFinite(value)) return 0;
    return Math.max(0, Math.min(100, value));
}

/**
 * Chart colours (validated categorical slots + status colours), stepped per mode.
 * Text never uses these: labels stay in foreground / muted ink.
 */
export function chartColors(dark: boolean) {
    return dark
        ? {
            you: '#3987e5',
            average: '#d95926',
            median: '#9085e9',
            topper: '#199e70',
            correct: '#22c55e',
            wrong: '#ef4444',
            skipped: '#475569',
            notEvaluated: '#f59e0b',
            bar: '#334155',
            grid: 'rgba(148,163,184,0.18)',
            axis: '#94a3b8',
            surface: '#111827',
        }
        : {
            you: '#2a78d6',
            average: '#eb6834',
            median: '#6250d6',
            topper: '#1baf7a',
            correct: '#16a34a',
            wrong: '#dc2626',
            skipped: '#cbd5e1',
            notEvaluated: '#d97706',
            bar: '#cbd5e1',
            grid: 'rgba(100,116,139,0.18)',
            axis: '#64748b',
            surface: '#ffffff',
        };
}

export type ChartColors = ReturnType<typeof chartColors>;
