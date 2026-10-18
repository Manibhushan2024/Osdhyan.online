'use client';

import { useState } from 'react';
import { X } from 'lucide-react';

type Props = {
    value: string[];
    onChange: (next: string[]) => void;
    placeholder?: string;
    suggestions?: string[];
    max?: number;
};

/** Comma/Enter-separated tag editor with optional one-click suggestions. */
export default function TagInput({ value, onChange, placeholder, suggestions = [], max = 20 }: Props) {
    const [draft, setDraft] = useState('');

    const add = (raw: string) => {
        const tag = raw.trim().replace(/\s+/g, ' ');
        if (!tag) return;
        if (value.some((v) => v.toLowerCase() === tag.toLowerCase())) return;
        if (value.length >= max) return;
        onChange([...value, tag]);
    };

    const remove = (tag: string) => onChange(value.filter((v) => v !== tag));

    const remaining = suggestions.filter((s) => !value.some((v) => v.toLowerCase() === s.toLowerCase()));

    return (
        <div className="space-y-2">
            <div className="flex flex-wrap gap-2 rounded-xl border border-card-border bg-background p-2 min-h-[48px]">
                {value.map((tag) => (
                    <span key={tag} className="inline-flex items-center gap-1 rounded-lg bg-blue-50 text-blue-700 px-2 py-1 text-xs font-semibold">
                        {tag}
                        <button type="button" onClick={() => remove(tag)} aria-label={`Remove ${tag}`} className="hover:text-red-600">
                            <X className="h-3 w-3" />
                        </button>
                    </span>
                ))}
                <input
                    value={draft}
                    onChange={(e) => setDraft(e.target.value)}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ',') {
                            e.preventDefault();
                            add(draft);
                            setDraft('');
                        } else if (e.key === 'Backspace' && !draft && value.length) {
                            remove(value[value.length - 1]);
                        }
                    }}
                    onBlur={() => {
                        if (draft.trim()) {
                            add(draft);
                            setDraft('');
                        }
                    }}
                    placeholder={value.length ? '' : placeholder}
                    className="flex-1 min-w-[120px] bg-transparent text-sm outline-none text-foreground"
                />
            </div>
            {remaining.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                    {remaining.slice(0, 12).map((s) => (
                        <button
                            key={s}
                            type="button"
                            onClick={() => add(s)}
                            className="rounded-md border border-card-border px-2 py-0.5 text-[11px] text-foreground/60 hover:border-blue-400 hover:text-blue-600"
                        >
                            + {s}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}
