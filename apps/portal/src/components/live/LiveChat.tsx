'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { CheckCircle, MessageCircleQuestion, Pin, PinOff, Send, Trash2 } from 'lucide-react';
import { toast } from 'react-hot-toast';
import api from '@/lib/api';
import { cn } from '@/lib/utils';
import { apiErrorMessage, formatClock } from './format';
import type { ChatMessage } from './types';

/*
 * Polling model (works for big classes without websockets):
 *  - the classroom page polls `state` (cached on the server) with our cursor
 *    (onCursor → ?after=), so new messages usually arrive inside the state
 *    response itself (`incoming`) — one request per tick per viewer;
 *  - we call `messages` ourselves only for the first load, to catch up
 *    (has_more), when latestMessageId is still ahead, and as a slow safety
 *    poll;
 *  - first load asks for after=0, which returns the NEWEST messages;
 *  - has_more=true means "call again right away" (catching up);
 *  - pins / answered ticks / deletions arrive through state as id lists.
 */
const SAFETY_POLL_MS = 20000;
const MIN_SEND_GAP_MS = 2000;
const MAX_KEPT = 400;

type Props = {
    classId: number;
    currentUserId: number;
    canModerate: boolean;
    /** chat is read-only when the class is not live */
    open: boolean;
    pinned: ChatMessage[];
    /** hint from the state endpoint; when it exceeds our cursor we fetch right away */
    latestMessageId: number;
    /** ids the teacher deleted (from state) */
    removedIds?: number[];
    /** ids the teacher marked answered (from state) */
    answeredIds?: number[];
    /** new messages delivered inside the state response */
    incoming?: { messages: ChatMessage[]; hasMore: boolean } | null;
    /** tells the page our cursor so it can ask state for newer messages (null = not ready) */
    onCursor?: (lastId: number | null) => void;
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

export default function LiveChat({ classId, currentUserId, canModerate, open, pinned, latestMessageId, removedIds, answeredIds, incoming, onCursor }: Props) {
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [draft, setDraft] = useState('');
    const [sending, setSending] = useState(false);
    const [onlyOpenQuestions, setOnlyOpenQuestions] = useState(false);
    /** highest id received through the messages endpoint (never bumped by our own sends,
        so messages others posted just before ours are not skipped) */
    const lastIdRef = useRef(0);
    const fetchingRef = useRef(false);
    const lastSentAtRef = useRef(0);
    const listRef = useRef<HTMLDivElement>(null);
    const stickToBottomRef = useRef(true);
    const onCursorRef = useRef(onCursor);
    useEffect(() => {
        onCursorRef.current = onCursor;
    }, [onCursor]);

    const fetchNewer = useCallback(async () => {
        if (fetchingRef.current) return;
        fetchingRef.current = true;
        try {
            // Catch up in pages; stop after a few rounds so one tick never runs away.
            for (let round = 0; round < 5; round++) {
                const res = await api.get(`/live-classes/${classId}/messages`, {
                    params: { after: lastIdRef.current, limit: 100 },
                });
                const batch: ChatMessage[] = res.data.messages ?? [];
                if (batch.length) {
                    lastIdRef.current = Math.max(lastIdRef.current, res.data.last_id ?? batch[batch.length - 1].id);
                    setMessages(prev => mergeMessages(prev, batch));
                }
                if (!res.data.has_more || batch.length === 0) break;
            }
            onCursorRef.current?.(lastIdRef.current);
        } catch {
            // transient; the next state tick retries
        } finally {
            fetchingRef.current = false;
        }
    }, [classId]);

    // Initial load + slow safety poll.
    useEffect(() => {
        lastIdRef.current = 0;
        setMessages([]);
        fetchNewer();
        const t = setInterval(fetchNewer, SAFETY_POLL_MS);
        return () => {
            clearInterval(t);
            onCursorRef.current?.(null);
        };
    }, [fetchNewer]);

    // Messages that came inside the state response (declared before the
    // latestMessageId check so the cursor is already up to date there).
    useEffect(() => {
        if (!incoming) return;
        const batch = incoming.messages;
        if (batch.length) {
            lastIdRef.current = Math.max(lastIdRef.current, batch[batch.length - 1].id);
            setMessages(prev => mergeMessages(prev, batch));
            onCursorRef.current?.(lastIdRef.current);
        }
        if (incoming.hasMore) fetchNewer();
    }, [incoming, fetchNewer]);

    // The state poller saw something newer than we have — fetch now.
    useEffect(() => {
        if (latestMessageId > lastIdRef.current) fetchNewer();
    }, [latestMessageId, fetchNewer]);

    // Reflect pin / answered / delete changes coming from state.
    const removedKey = (removedIds ?? []).join(',');
    const answeredKey = (answeredIds ?? []).join(',');
    useEffect(() => {
        const pinnedIds = new Set(pinned.map(p => p.id));
        const removed = new Set(removedIds ?? []);
        const answered = answeredIds ? new Set(answeredIds) : null;
        // The server sends the newest 200 answered ids: a shorter list is complete,
        // a full one only speaks for messages from its oldest id onwards.
        const answeredFrom = !answeredIds || answeredIds.length < 200 ? 0 : Math.min(...answeredIds);
        setMessages(prev => {
            let changed = false;
            const next: ChatMessage[] = [];
            for (const m of prev) {
                if (m.pending) { next.push(m); continue; }
                if (removed.has(m.id)) { changed = true; continue; }
                const isPinned = pinnedIds.has(m.id);
                const isAnswered = answered && m.id >= answeredFrom ? answered.has(m.id) : m.is_answered;
                if (m.is_pinned !== isPinned || m.is_answered !== isAnswered) {
                    changed = true;
                    next.push({ ...m, is_pinned: isPinned, is_answered: isAnswered });
                } else {
                    next.push(m);
                }
            }
            return changed ? next : prev;
        });
        // keys stand in for the arrays (new array objects arrive on every poll)
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [pinned, removedKey, answeredKey]);

    const visible = useMemo(
        () => (onlyOpenQuestions ? messages.filter(m => !m.user.is_teacher && !m.is_answered) : messages),
        [messages, onlyOpenQuestions],
    );

    // Auto-scroll when the user is already at the bottom.
    useEffect(() => {
        const el = listRef.current;
        if (el && stickToBottomRef.current) el.scrollTop = el.scrollHeight;
    }, [visible]);

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
            toast('Please wait 2 seconds between messages.', { id: 'chat-rate' });
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
            setMessages(prev => mergeMessages(prev.filter(m => m.id !== tempId), [saved]));
        } catch (e) {
            setMessages(prev => prev.filter(m => m.id !== tempId));
            setDraft(body);
            toast.error(apiErrorMessage(e, 'Message not sent. Please try again.'));
        } finally {
            setSending(false);
        }
    };

    const moderate = async (m: ChatMessage, action: 'pin' | 'answered' | 'delete') => {
        if (!canModerate || m.pending) return;
        if (action === 'delete' && !confirm('Delete this message for everyone?')) return;
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
            toast.error(apiErrorMessage(e, 'Could not update the message'));
            fetchNewer();
        }
    };

    const renderMessage = (m: ChatMessage, compact = false) => {
        const mine = m.user.id === currentUserId;
        return (
            <div
                key={`${compact ? 'pin-' : ''}${m.id}`}
                className={cn(
                    'rounded-2xl px-3 py-2 text-sm',
                    m.is_pinned && !compact ? 'bg-amber-500/10 border border-amber-500/20' : 'bg-foreground/[0.03]',
                    m.pending && 'opacity-60',
                    m.is_answered && 'border border-emerald-500/20',
                )}
            >
                <div className="flex items-center gap-2 text-[11px] font-bold text-foreground/50">
                    <span className={cn('truncate', m.user.is_teacher ? 'text-red-500' : mine ? 'text-blue-500' : 'text-foreground/70')}>
                        {mine ? 'You' : m.user.name ?? 'Student'}
                    </span>
                    {m.user.is_teacher && (
                        <span className="text-[9px] font-black uppercase tracking-wide text-red-500 bg-red-500/10 px-1.5 py-0.5 rounded-full">Teacher</span>
                    )}
                    {m.is_answered && (
                        <span className="flex items-center gap-0.5 text-[10px] text-emerald-600"><CheckCircle className="h-3 w-3" /> Answered</span>
                    )}
                    <span className="ml-auto tabular-nums">{m.pending ? 'Sending…' : m.created_at ? formatClock(m.created_at) : ''}</span>
                </div>
                <p className="text-foreground/90 whitespace-pre-wrap break-words leading-snug mt-0.5">{m.body}</p>
                {/* Always visible (no hover) so teachers on phones and tablets can use them. */}
                {canModerate && !m.pending && !compact && (
                    <div className="flex items-center gap-1 mt-1.5">
                        <button onClick={() => moderate(m, 'pin')} className="flex items-center gap-1 px-2 py-1 rounded-lg hover:bg-foreground/10 text-[10px] font-bold text-foreground/60">
                            {m.is_pinned ? <PinOff className="h-3 w-3" /> : <Pin className="h-3 w-3" />} {m.is_pinned ? 'Unpin' : 'Pin'}
                        </button>
                        {!m.user.is_teacher && (
                            <button onClick={() => moderate(m, 'answered')} className={cn('flex items-center gap-1 px-2 py-1 rounded-lg hover:bg-foreground/10 text-[10px] font-bold', m.is_answered ? 'text-emerald-600' : 'text-foreground/60')}>
                                <CheckCircle className="h-3 w-3" /> {m.is_answered ? 'Answered' : 'Mark answered'}
                            </button>
                        )}
                        <button onClick={() => moderate(m, 'delete')} className="ml-auto flex items-center gap-1 px-2 py-1 rounded-lg hover:bg-red-500/10 text-[10px] font-bold text-red-500">
                            <Trash2 className="h-3 w-3" /> Delete
                        </button>
                    </div>
                )}
            </div>
        );
    };

    const openQuestions = canModerate ? messages.filter(m => !m.pending && !m.user.is_teacher && !m.is_answered).length : 0;

    return (
        <div className="flex flex-col h-full min-h-0">
            {pinned.length > 0 && (
                <div className="shrink-0 border-b border-card-border p-3 space-y-2 bg-amber-500/5 max-h-[40%] overflow-y-auto">
                    <p className="text-[10px] font-black uppercase tracking-wide text-amber-600 flex items-center gap-1"><Pin className="h-3 w-3" /> Pinned by the teacher</p>
                    {pinned.map(m => renderMessage(m, true))}
                </div>
            )}

            {canModerate && (
                <div className="shrink-0 flex items-center gap-2 px-3 py-2 border-b border-card-border">
                    <button
                        onClick={() => setOnlyOpenQuestions(v => !v)}
                        className={cn('flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[10px] font-bold', onlyOpenQuestions ? 'bg-foreground text-background' : 'bg-foreground/5 text-foreground/70 hover:bg-foreground/10')}
                    >
                        <MessageCircleQuestion className="h-3.5 w-3.5" /> {onlyOpenQuestions ? 'Showing unanswered only' : `Show unanswered (${openQuestions})`}
                    </button>
                </div>
            )}

            <div ref={listRef} onScroll={onScroll} className="flex-1 min-h-0 overflow-y-auto p-3 space-y-2">
                {visible.length === 0 && (
                    <p className="text-center text-xs font-medium text-foreground/40 py-10 px-4">
                        {onlyOpenQuestions
                            ? 'No unanswered questions.'
                            : open
                                ? 'No messages yet. Type your question below — the teacher sees it right away.'
                                : 'Questions and comments open when the class starts.'}
                    </p>
                )}
                {visible.map(m => renderMessage(m))}
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
                    aria-label="Your question or comment"
                    placeholder={open ? (canModerate ? 'Reply to the class…' : 'Type your question or comment…') : 'Opens when the class starts'}
                    className="flex-1 resize-none bg-background border border-card-border rounded-xl px-3 py-2 text-sm text-foreground placeholder:text-foreground/40 focus:outline-none focus:ring-2 focus:ring-red-500/20 disabled:opacity-50 max-h-24"
                />
                <button
                    type="submit"
                    disabled={!open || sending || !draft.trim()}
                    className="h-10 px-3 rounded-xl bg-red-500 text-white flex items-center justify-center gap-1.5 text-xs font-bold hover:bg-red-400 disabled:opacity-40 transition-all active:scale-95"
                    aria-label="Send"
                >
                    <Send className="h-4 w-4" /> Send
                </button>
            </form>
        </div>
    );
}
