'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { CheckCircle, Pin, PinOff, Send, Trash2 } from 'lucide-react';
import { toast } from 'react-hot-toast';
import api from '@/lib/api';
import { cn } from '@/lib/utils';
import { apiErrorMessage, formatClock } from './format';
import type { ChatMessage } from './types';

const POLL_MS = 3000;
const MIN_SEND_GAP_MS = 2000;
const MAX_KEPT = 400;

type Props = {
    classId: number;
    currentUserId: number;
    canModerate: boolean;
    /** chat is read-only when the class is not live */
    open: boolean;
    pinned: ChatMessage[];
    /** hint from the state endpoint; when it exceeds our cursor we poll right away */
    latestMessageId: number;
};

function mergeMessages(existing: ChatMessage[], incoming: ChatMessage[]): ChatMessage[] {
    if (incoming.length === 0) return existing;
    const byId = new Map<number, ChatMessage>();
    for (const m of existing) if (!m.pending) byId.set(m.id, m);
    for (const m of incoming) byId.set(m.id, m);
    const merged = Array.from(byId.values()).sort((a, b) => a.id - b.id);
    // Keep optimistic messages whose server copy hasn't been seen yet.
    const pendingLeft = existing.filter(m => m.pending && !incoming.some(i => i.body === m.body && i.user.id === m.user.id));
    const out = [...merged, ...pendingLeft];
    return out.length > MAX_KEPT ? out.slice(out.length - MAX_KEPT) : out;
}

export default function LiveChat({ classId, currentUserId, canModerate, open, pinned, latestMessageId }: Props) {
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [draft, setDraft] = useState('');
    const [sending, setSending] = useState(false);
    const lastIdRef = useRef(0);
    const lastSentAtRef = useRef(0);
    const listRef = useRef<HTMLDivElement>(null);
    const stickToBottomRef = useRef(true);

    const fetchNewer = useCallback(async () => {
        try {
            const res = await api.get(`/live-classes/${classId}/messages`, {
                params: { after: lastIdRef.current, limit: 50 },
            });
            const incoming: ChatMessage[] = res.data.messages ?? [];
            if (incoming.length) {
                lastIdRef.current = Math.max(lastIdRef.current, res.data.last_id ?? incoming[incoming.length - 1].id);
                setMessages(prev => mergeMessages(prev, incoming));
            }
        } catch {
            // transient; next tick retries
        }
    }, [classId]);

    // Initial load + steady polling.
    useEffect(() => {
        lastIdRef.current = 0;
        fetchNewer();
        const t = setInterval(fetchNewer, POLL_MS);
        return () => clearInterval(t);
    }, [fetchNewer]);

    // The state poller saw something newer than we have — fetch now.
    useEffect(() => {
        if (latestMessageId > lastIdRef.current) fetchNewer();
    }, [latestMessageId, fetchNewer]);

    // Reflect pin/unpin changes coming from state.
    useEffect(() => {
        const pinnedIds = new Set(pinned.map(p => p.id));
        setMessages(prev => {
            let changed = false;
            const next = prev.map(m => {
                const isPinned = pinnedIds.has(m.id);
                if (m.is_pinned !== isPinned && !m.pending) {
                    changed = true;
                    return { ...m, is_pinned: isPinned };
                }
                return m;
            });
            return changed ? next : prev;
        });
    }, [pinned]);

    // Auto-scroll when the user is already at the bottom.
    useEffect(() => {
        const el = listRef.current;
        if (el && stickToBottomRef.current) el.scrollTop = el.scrollHeight;
    }, [messages]);

    const onScroll = () => {
        const el = listRef.current;
        if (!el) return;
        stickToBottomRef.current = el.scrollHeight - el.scrollTop - el.clientHeight < 60;
    };

    const send = async () => {
        const body = draft.trim();
        if (!body || sending || !open) return;
        const now = Date.now();
        if (now - lastSentAtRef.current < MIN_SEND_GAP_MS) {
            toast('Slow down a little — one message every 2 seconds.', { id: 'chat-rate' });
            return;
        }
        lastSentAtRef.current = now;
        setSending(true);
        const tempId = -now;
        const optimistic: ChatMessage = {
            id: tempId,
            body,
            is_pinned: false,
            is_answered: false,
            created_at: new Date().toISOString(),
            user: { id: currentUserId, name: 'You', is_teacher: canModerate },
            pending: true,
        };
        setMessages(prev => [...prev, optimistic]);
        setDraft('');
        stickToBottomRef.current = true;
        try {
            const res = await api.post(`/live-classes/${classId}/messages`, { body });
            const saved: ChatMessage = res.data.message;
            lastIdRef.current = Math.max(lastIdRef.current, saved.id);
            setMessages(prev => mergeMessages(prev.filter(m => m.id !== tempId), [saved]));
        } catch (e) {
            setMessages(prev => prev.filter(m => m.id !== tempId));
            setDraft(body);
            toast.error(apiErrorMessage(e, 'Message not sent'));
        } finally {
            setSending(false);
        }
    };

    const moderate = async (m: ChatMessage, action: 'pin' | 'answered' | 'delete') => {
        if (!canModerate || m.pending) return;
        try {
            if (action === 'delete') {
                setMessages(prev => prev.filter(x => x.id !== m.id));
                await api.delete(`/live-classes/${classId}/messages/${m.id}`);
                return;
            }
            const res = await api.patch(`/live-classes/${classId}/messages/${m.id}/${action}`);
            const updated: ChatMessage = res.data.message;
            setMessages(prev => prev.map(x => (x.id === updated.id ? updated : x)));
        } catch (e) {
            toast.error(apiErrorMessage(e, 'Could not update message'));
            fetchNewer();
        }
    };

    const renderMessage = (m: ChatMessage, compact = false) => {
        const mine = m.user.id === currentUserId;
        return (
            <div
                key={`${compact ? 'pin-' : ''}${m.id}`}
                className={cn(
                    'group/msg rounded-2xl px-3 py-2 text-sm',
                    m.is_pinned && !compact ? 'bg-amber-500/10 border border-amber-500/20' : 'bg-foreground/[0.03]',
                    m.pending && 'opacity-60',
                    m.is_answered && 'border border-emerald-500/20',
                )}
            >
                <div className="flex items-center gap-2 text-[10px] font-bold text-foreground/50">
                    <span className={cn('truncate', m.user.is_teacher ? 'text-red-500' : mine ? 'text-blue-500' : 'text-foreground/70')}>
                        {mine ? 'You' : m.user.name ?? 'Student'}
                    </span>
                    {m.user.is_teacher && (
                        <span className="text-[8px] font-black uppercase tracking-widest text-red-500 bg-red-500/10 px-1.5 py-0.5 rounded-full">Teacher</span>
                    )}
                    {m.is_answered && <CheckCircle className="h-3 w-3 text-emerald-500" />}
                    <span className="ml-auto tabular-nums">{m.created_at ? formatClock(m.created_at) : ''}</span>
                </div>
                <p className="text-foreground/90 whitespace-pre-wrap break-words leading-snug mt-0.5">{m.body}</p>
                {canModerate && !m.pending && !compact && (
                    <div className="flex items-center gap-1 mt-1.5 opacity-0 group-hover/msg:opacity-100 focus-within:opacity-100 transition-opacity">
                        <button onClick={() => moderate(m, 'pin')} title={m.is_pinned ? 'Unpin' : 'Pin'} className="p-1.5 rounded-lg hover:bg-foreground/10 text-foreground/60">
                            {m.is_pinned ? <PinOff className="h-3.5 w-3.5" /> : <Pin className="h-3.5 w-3.5" />}
                        </button>
                        <button onClick={() => moderate(m, 'answered')} title={m.is_answered ? 'Mark unanswered' : 'Mark answered'} className={cn('p-1.5 rounded-lg hover:bg-foreground/10', m.is_answered ? 'text-emerald-500' : 'text-foreground/60')}>
                            <CheckCircle className="h-3.5 w-3.5" />
                        </button>
                        <button onClick={() => moderate(m, 'delete')} title="Delete" className="p-1.5 rounded-lg hover:bg-red-500/10 text-red-500">
                            <Trash2 className="h-3.5 w-3.5" />
                        </button>
                    </div>
                )}
            </div>
        );
    };

    return (
        <div className="flex flex-col h-full min-h-0">
            {pinned.length > 0 && (
                <div className="shrink-0 border-b border-card-border p-3 space-y-2 bg-amber-500/5">
                    <p className="text-[9px] font-black uppercase tracking-widest text-amber-600 flex items-center gap-1"><Pin className="h-3 w-3" /> Pinned</p>
                    {pinned.map(m => renderMessage(m, true))}
                </div>
            )}

            <div ref={listRef} onScroll={onScroll} className="flex-1 min-h-0 overflow-y-auto p-3 space-y-2">
                {messages.length === 0 && (
                    <p className="text-center text-[10px] font-bold uppercase tracking-widest text-foreground/30 py-10">
                        {open ? 'No messages yet — say hello!' : 'Chat is closed.'}
                    </p>
                )}
                {messages.map(m => renderMessage(m))}
            </div>

            <form
                onSubmit={e => { e.preventDefault(); send(); }}
                className="shrink-0 border-t border-card-border p-3 flex items-end gap-2"
            >
                <textarea
                    value={draft}
                    onChange={e => setDraft(e.target.value.slice(0, 1000))}
                    onKeyDown={e => {
                        if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); }
                    }}
                    rows={1}
                    disabled={!open}
                    placeholder={open ? 'Ask a doubt… (Enter to send)' : 'Chat opens when the class is live'}
                    className="flex-1 resize-none bg-background border border-card-border rounded-xl px-3 py-2 text-sm text-foreground placeholder:text-foreground/30 focus:outline-none focus:ring-2 focus:ring-red-500/20 disabled:opacity-50 max-h-24"
                />
                <button
                    type="submit"
                    disabled={!open || sending || !draft.trim()}
                    className="h-10 w-10 rounded-xl bg-red-500 text-white flex items-center justify-center hover:bg-red-400 disabled:opacity-40 transition-all active:scale-95"
                    aria-label="Send"
                >
                    <Send className="h-4 w-4" />
                </button>
            </form>
        </div>
    );
}
