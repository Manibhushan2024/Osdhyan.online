'use client';

import { cn } from '@/lib/utils';

/**
 * Question text as plain text (never HTML — code such as `#include<stdio.h>` or
 * `a<b` must show as written). Line breaks are kept. Code is shown in a
 * monospaced box: either fenced with ``` … ``` or, for older questions, the run
 * of lines after the first prose line that look like code.
 */
const CODE_LINE = /[;{}]\s*$|^\s*(#include|#define|def |class |public |private |import |from \S+ import|print\(|printf|cout|cin|System\.out|for\s*\(|for \S+ in |while\s*[(\w]|if\s*\(|elif |else\s*[:{]|return\b|int |char |float |double |void |String |try\s*[:{]|except\b|catch\s*\()|^\s{2,}\S|^\s*[a-zA-Z_]\w*\s*=\s*\S/;

type Segment = { code: boolean; text: string };

export function splitQuestion(text: string): Segment[] {
    const value = (text ?? '').replace(/\r\n/g, '\n');
    if (value.includes('```')) {
        return value.split(/```[a-zA-Z+#]*\n?/).map((part, i) => ({ code: i % 2 === 1, text: i % 2 === 1 ? part.replace(/\n$/, '') : part }))
            .filter((s) => s.text.trim() !== '');
    }
    const lines = value.split('\n');
    if (lines.length < 3) return [{ code: false, text: value }];
    const start = lines.findIndex((l, i) => i > 0 && CODE_LINE.test(l));
    if (start === -1) return [{ code: false, text: value }];
    // Code runs until a trailing prose line such as "What is the output?" (no code marks, ends with ? or :)
    let end = lines.length;
    for (let i = lines.length - 1; i > start; i--) {
        const l = lines[i].trim();
        if (l === '' || (/[?:.]$/.test(l) && !CODE_LINE.test(lines[i]) && /\s/.test(l))) end = i;
        else break;
    }
    const segs: Segment[] = [{ code: false, text: lines.slice(0, start).join('\n') }, { code: true, text: lines.slice(start, end).join('\n') }];
    if (end < lines.length) segs.push({ code: false, text: lines.slice(end).join('\n') });
    return segs.filter((s) => s.text.trim() !== '');
}

export default function QuestionText({ text, className }: { text: string | null | undefined; className?: string }) {
    const segments = splitQuestion(text ?? '');
    return (
        <div className={className}>
            {segments.map((s, i) =>
                s.code ? (
                    <pre key={i} className="my-3 overflow-x-auto rounded-xl border border-card-border bg-foreground/[0.04] p-3 font-mono text-[0.85em] leading-relaxed whitespace-pre text-foreground">
                        {s.text}
                    </pre>
                ) : (
                    <span key={i} className={cn('block whitespace-pre-wrap')}>
                        {/* `inline code` → monospace */}
                        {s.text.split(/`([^`\n]+)`/).map((part, j) =>
                            j % 2 === 1
                                ? <code key={j} className="rounded bg-foreground/[0.06] px-1 py-0.5 font-mono text-[0.9em]">{part}</code>
                                : part,
                        )}
                    </span>
                ),
            )}
        </div>
    );
}
