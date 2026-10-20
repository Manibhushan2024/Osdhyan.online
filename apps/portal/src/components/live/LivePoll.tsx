'use client';

import { useState } from 'react';
import { BarChart2, Check, Eye, Lock, Plus, X } from 'lucide-react';
import { toast } from 'react-hot-toast';
import api from '@/lib/api';
import { cn } from '@/lib/utils';
import { apiErrorMessage } from './format';
import type { Poll } from './types';

type Props = {
    classId: number;
    poll: Poll | null;
    myVote: string | null;
    canModerate: boolean;
    live: boolean;
    /** ask the page to refetch state right away */
    onChanged: () => void;
};

export default function LivePoll({ classId, poll, myVote, canModerate, live, onChanged }: Props) {
    const [voting, setVoting] = useState(false);
    const [localVote, setLocalVote] = useState<{ pollId: number; option: string } | null>(null);
    const [showCreate, setShowCreate] = useState(false);
    const [busy, setBusy] = useState(false);

    const vote = localVote && poll && localVote.pollId === poll.id ? localVote.option : myVote;
    const results = poll?.results ?? null;
    const total = results ? Object.values(results).reduce((a, b) => a + b, 0) : poll?.total_votes ?? 0;
    const showResults = !!results && (canModerate || !!poll?.revealed_at);

    const castVote = async (optionId: string) => {
        if (!poll || voting || vote) return;
        setVoting(true);
        try {
            await api.post(`/live-classes/${classId}/polls/${poll.id}/vote`, { option_id: optionId });
            setLocalVote({ pollId: poll.id, option: optionId });
            onChanged();
        } catch (e) {
            const code = (e as { response?: { status?: number; data?: { option_id?: string } } })?.response;
            if (code?.status === 409 && code.data?.option_id) {
                setLocalVote({ pollId: poll.id, option: code.data.option_id });
            } else {
                toast.error(apiErrorMessage(e, 'Vote not recorded'));
            }
        } finally {
            setVoting(false);
        }
    };

    const teacherAction = async (action: 'close' | 'reveal') => {
        if (!poll || busy) return;
        setBusy(true);
        try {
            await api.post(`/live-classes/${classId}/polls/${poll.id}/${action}`);
            onChanged();
        } catch (e) {
            toast.error(apiErrorMessage(e, 'Could not update poll'));
        } finally {
            setBusy(false);
        }
    };

    return (
        <div className="flex flex-col h-full min-h-0">
            <div className="flex-1 min-h-0 overflow-y-auto p-4 space-y-4">
                {!poll && (
                    <div className="flex flex-col items-center justify-center gap-3 py-12 text-center">
                        <BarChart2 className="h-8 w-8 text-foreground/20" />
                        <p className="text-[10px] font-black uppercase tracking-widest text-foreground/40">
                            {canModerate ? 'No poll yet. Press "New poll" to ask the class a quick question.' : 'No poll right now'}
                        </p>
                    </div>
                )}

                {poll && (
                    <div className="space-y-3">
                        <div className="flex items-center gap-2">
                            {poll.is_open ? (
                                <span className="text-[9px] font-black uppercase tracking-widest text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded-full">Open</span>
                            ) : (
                                <span className="text-[9px] font-black uppercase tracking-widest text-foreground/40 bg-foreground/5 px-2 py-0.5 rounded-full flex items-center gap-1"><Lock className="h-2.5 w-2.5" /> Closed</span>
                            )}
                            <span className="text-[10px] font-bold text-foreground/40">{total} vote{total === 1 ? '' : 's'}</span>
                        </div>
                        <p className="text-sm font-black text-foreground leading-snug">{poll.question}</p>

                        <div className="space-y-2">
                            {poll.options.map(opt => {
                                const count = results?.[opt.id] ?? 0;
                                const pct = showResults && total > 0 ? Math.round((count / total) * 100) : 0;
                                const chosen = vote === opt.id;
                                const canVote = poll.is_open && !vote && !canModerate && live;
                                return (
                                    <button
                                        key={opt.id}
                                        disabled={!canVote || voting}
                                        onClick={() => castVote(opt.id)}
                                        className={cn(
                                            'relative w-full text-left rounded-xl border px-3 py-2.5 text-sm overflow-hidden transition-all',
                                            chosen ? 'border-red-500/50 bg-red-500/5' : 'border-card-border bg-foreground/[0.02]',
                                            canVote && 'hover:border-red-500/40 hover:bg-red-500/5 active:scale-[0.99]',
                                            !canVote && 'cursor-default',
                                        )}
                                    >
                                        {showResults && (
                                            <span className="absolute inset-y-0 left-0 bg-red-500/15 transition-all" style={{ width: `${pct}%` }} />
                                        )}
                                        <span className="relative flex items-center gap-2">
                                            <span className="h-5 w-5 rounded-full border border-current/30 text-[10px] font-black flex items-center justify-center uppercase text-foreground/60">{opt.id}</span>
                                            <span className="flex-1 text-foreground/90">{opt.text}</span>
                                            {chosen && <Check className="h-4 w-4 text-red-500" />}
                                            {showResults && <span className="text-[11px] font-black tabular-nums text-foreground/70">{pct}% <span className="text-foreground/40">({count})</span></span>}
                                        </span>
                                    </button>
                                );
                            })}
                        </div>

                        {!canModerate && vote && !poll.revealed_at && (
                            <p className="text-[10px] font-bold uppercase tracking-widest text-foreground/40 text-center">Answer saved — results appear when the teacher reveals them.</p>
                        )}
                        {!canModerate && !vote && !poll.is_open && !poll.revealed_at && (
                            <p className="text-[10px] font-bold uppercase tracking-widest text-foreground/40 text-center">This poll closed before you voted.</p>
                        )}
                    </div>
                )}
            </div>

            {canModerate && (
                <div className="shrink-0 border-t border-card-border p-3 flex flex-wrap gap-2">
                    {poll?.is_open && (
                        <button onClick={() => teacherAction('close')} disabled={busy} className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-foreground/5 hover:bg-foreground/10 text-[10px] font-black uppercase tracking-widest text-foreground disabled:opacity-40">
                            <Lock className="h-3 w-3" /> Stop voting
                        </button>
                    )}
                    {poll && !poll.revealed_at && (
                        <button onClick={() => teacherAction('reveal')} disabled={busy} className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-[10px] font-black uppercase tracking-widest disabled:opacity-40">
                            <Eye className="h-3 w-3" /> Show results to students
                        </button>
                    )}
                    <button
                        onClick={() => setShowCreate(true)}
                        disabled={!live}
                        title={live ? undefined : 'Start the class to launch a poll'}
                        className="ml-auto flex items-center gap-1.5 px-3 py-2 rounded-xl bg-red-500 hover:bg-red-400 text-white text-[10px] font-black uppercase tracking-widest disabled:opacity-40"
                    >
                        <Plus className="h-3 w-3" /> New poll
                    </button>
                </div>
            )}

            {showCreate && (
                <CreatePollModal
                    classId={classId}
                    onClose={() => setShowCreate(false)}
                    onCreated={() => { setShowCreate(false); onChanged(); }}
                />
            )}
        </div>
    );
}

function CreatePollModal({ classId, onClose, onCreated }: { classId: number; onClose: () => void; onCreated: () => void }) {
    const [question, setQuestion] = useState('');
    const [options, setOptions] = useState<string[]>(['', '']);
    const [saving, setSaving] = useState(false);

    const valid = question.trim().length > 0 && options.filter(o => o.trim()).length >= 2 && options.every(o => o.trim());

    const submit = async () => {
        if (!valid || saving) return;
        setSaving(true);
        try {
            await api.post(`/live-classes/${classId}/polls`, {
                question: question.trim(),
                options: options.map(o => o.trim()),
            });
            toast.success('Poll launched');
            onCreated();
        } catch (e) {
            toast.error(apiErrorMessage(e, 'Could not create poll'));
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[500] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-950/70 backdrop-blur-sm" onClick={onClose} />
            <div className="relative z-10 w-full max-w-md bg-card-bg border border-card-border rounded-[1.5rem] p-6 shadow-2xl space-y-4">
                <div className="flex items-start justify-between">
                    <div>
                        <h3 className="text-lg font-black text-foreground tracking-tight">New poll</h3>
                        <p className="text-[10px] font-bold uppercase tracking-widest text-foreground/40">2 to 6 options · students vote once</p>
                    </div>
                    <button onClick={onClose} className="p-2 rounded-xl hover:bg-foreground/5 text-foreground/50"><X className="h-4 w-4" /></button>
                </div>
                <input
                    autoFocus
                    value={question}
                    onChange={e => setQuestion(e.target.value.slice(0, 500))}
                    placeholder="Question"
                    className="w-full bg-background border border-card-border rounded-xl px-3 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-red-500/20"
                />
                <div className="space-y-2">
                    {options.map((o, i) => (
                        <div key={i} className="flex items-center gap-2">
                            <span className="h-7 w-7 rounded-full bg-foreground/5 text-[10px] font-black flex items-center justify-center text-foreground/60">{String.fromCharCode(65 + i)}</span>
                            <input
                                value={o}
                                onChange={e => setOptions(prev => prev.map((p, j) => (j === i ? e.target.value.slice(0, 120) : p)))}
                                placeholder={`Option ${i + 1}`}
                                className="flex-1 bg-background border border-card-border rounded-xl px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-red-500/20"
                            />
                            {options.length > 2 && (
                                <button onClick={() => setOptions(prev => prev.filter((_, j) => j !== i))} className="p-1.5 rounded-lg hover:bg-red-500/10 text-red-500"><X className="h-3.5 w-3.5" /></button>
                            )}
                        </div>
                    ))}
                    {options.length < 6 && (
                        <button onClick={() => setOptions(prev => [...prev, ''])} className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-blue-500 hover:text-blue-400 px-1">
                            <Plus className="h-3 w-3" /> Add option
                        </button>
                    )}
                </div>
                <div className="flex gap-2 pt-1">
                    <button onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-card-border text-[10px] font-black uppercase tracking-widest text-foreground/60 hover:text-foreground">Cancel</button>
                    <button onClick={submit} disabled={!valid || saving} className="flex-1 py-2.5 rounded-xl bg-red-500 hover:bg-red-400 text-white text-[10px] font-black uppercase tracking-widest disabled:opacity-40">
                        {saving ? 'Launching…' : 'Launch poll'}
                    </button>
                </div>
            </div>
        </div>
    );
}
