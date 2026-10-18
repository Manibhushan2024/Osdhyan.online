'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { ArrowLeft, Loader2, MessageSquare, Send } from 'lucide-react';
import api from '@/lib/api';
import { cn } from '@/lib/utils';
import { useAuth } from '@/components/providers/AuthProvider';
import { TeacherAvatar } from '@/components/tuition/TeacherCard';

/*
 * Polling-based chat: the open thread is polled every 4s (GET
 * /conversations/{id}/messages?after=<last id>) and the conversation list
 * every 15s. Upgrade path: subscribe to a Laravel Reverb channel per
 * conversation and keep these endpoints for history/catch-up.
 */
const THREAD_POLL_MS = 4000;
const LIST_POLL_MS = 15000;

export type ChatMessage = {
    id: number;
    conversation_id: number;
    sender_id: number;
    body: string;
    created_at: string;
};

export type ConversationSummary = {
    id: number;
    type: string;
    subject_type: string | null;
    subject_id: number | null;
    other: { id: number; name: string; avatar: string | null; role: string } | null;
    last_message: ChatMessage | null;
    last_message_at: string | null;
    unread_count: number;
};

function timeLabel(iso: string | null): string {
    if (!iso) return '';
    const d = new Date(iso);
    const now = new Date();
    const sameDay = d.toDateString() === now.toDateString();
    return sameDay
        ? d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })
        : d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
}

type Props = {
    /** Conversation to open initially (from ?c=). */
    initialConversationId?: number | null;
    onConversationChange?: (id: number | null) => void;
};

export default function ChatPanel({ initialConversationId = null, onConversationChange }: Props) {
    const { user } = useAuth();
    const myId = user?.id;

    const [conversations, setConversations] = useState<ConversationSummary[]>([]);
    const [listLoading, setListLoading] = useState(true);
    const [activeId, setActiveId] = useState<number | null>(initialConversationId);
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [threadLoading, setThreadLoading] = useState(false);
    const [draft, setDraft] = useState('');
    const [sending, setSending] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const bottomRef = useRef<HTMLDivElement>(null);
    const lastIdRef = useRef<number>(0);

    const active = conversations.find((c) => c.id === activeId) || null;

    // ── Conversation list ────────────────────────────────────────────────────
    const loadList = useCallback(async () => {
        try {
            const res = await api.get('/conversations');
            setConversations(res.data.data || []);
        } catch {
            // keep stale list
        } finally {
            setListLoading(false);
        }
    }, []);

    useEffect(() => {
        loadList();
        const t = setInterval(loadList, LIST_POLL_MS);
        return () => clearInterval(t);
    }, [loadList]);

    // ── Thread ───────────────────────────────────────────────────────────────
    const markRead = useCallback(async (id: number) => {
        try {
            await api.post(`/conversations/${id}/read`);
            setConversations((prev) => prev.map((c) => (c.id === id ? { ...c, unread_count: 0 } : c)));
        } catch {
            // ignore
        }
    }, []);

    useEffect(() => {
        onConversationChange?.(activeId);
        if (!activeId) {
            setMessages([]);
            lastIdRef.current = 0;
            return;
        }
        let cancelled = false;
        setThreadLoading(true);
        setError(null);
        lastIdRef.current = 0;

        const initial = async () => {
            try {
                const res = await api.get(`/conversations/${activeId}/messages`, { params: { limit: 50 } });
                if (cancelled) return;
                const rows: ChatMessage[] = res.data.data || [];
                setMessages(rows);
                lastIdRef.current = rows.length ? rows[rows.length - 1].id : 0;
                markRead(activeId);
            } catch (err) {
                if (cancelled) return;
                const status = (err as { response?: { status?: number } })?.response?.status;
                setError(status === 403 ? 'You are not part of this conversation.' : 'Could not load messages.');
            } finally {
                if (!cancelled) setThreadLoading(false);
            }
        };

        const poll = async () => {
            try {
                const res = await api.get(`/conversations/${activeId}/messages`, { params: { after: lastIdRef.current, limit: 50 } });
                if (cancelled) return;
                const rows: ChatMessage[] = res.data.data || [];
                if (rows.length) {
                    setMessages((prev) => {
                        const seen = new Set(prev.map((m) => m.id));
                        return [...prev, ...rows.filter((m) => !seen.has(m.id))];
                    });
                    lastIdRef.current = rows[rows.length - 1].id;
                    markRead(activeId);
                }
            } catch {
                // transient
            }
        };

        initial();
        const t = setInterval(poll, THREAD_POLL_MS);
        return () => {
            cancelled = true;
            clearInterval(t);
        };
    }, [activeId, markRead, onConversationChange]);

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ block: 'end' });
    }, [messages.length]);

    const send = async (e: React.FormEvent) => {
        e.preventDefault();
        const body = draft.trim();
        if (!body || !activeId || sending) return;
        setSending(true);
        try {
            const res = await api.post(`/conversations/${activeId}/messages`, { body });
            const m: ChatMessage = res.data.message;
            setMessages((prev) => (prev.some((x) => x.id === m.id) ? prev : [...prev, m]));
            lastIdRef.current = Math.max(lastIdRef.current, m.id);
            setDraft('');
            setConversations((prev) => prev.map((c) => (c.id === activeId ? { ...c, last_message: m, last_message_at: m.created_at } : c)));
        } catch {
            setError('Message not sent. Please try again.');
        } finally {
            setSending(false);
        }
    };

    // ── Render ───────────────────────────────────────────────────────────────
    const list = (
        <div className="flex flex-col h-full">
            <div className="px-4 py-3 border-b border-card-border">
                <h2 className="font-bold text-foreground">Messages</h2>
                <p className="text-xs text-foreground/50">Chats with your tutors and students.</p>
            </div>
            <div className="flex-1 overflow-y-auto">
                {listLoading ? (
                    <div className="p-6 flex justify-center"><Loader2 className="h-5 w-5 animate-spin text-blue-600" /></div>
                ) : conversations.length === 0 ? (
                    <div className="p-8 text-center text-sm text-foreground/50">
                        <MessageSquare className="h-8 w-8 mx-auto mb-2 text-foreground/20" />
                        No conversations yet. Accept a tutor&apos;s proposal or contact a teacher to start one.
                    </div>
                ) : (
                    conversations.map((c) => (
                        <button
                            key={c.id}
                            onClick={() => setActiveId(c.id)}
                            className={cn(
                                'w-full text-left px-4 py-3 flex items-center gap-3 border-b border-card-border/60 hover:bg-background',
                                c.id === activeId && 'bg-blue-50 dark:bg-blue-900/20',
                            )}
                        >
                            <TeacherAvatar name={c.other?.name || null} avatar={c.other?.avatar || null} size={40} />
                            <div className="min-w-0 flex-1">
                                <div className="flex items-center justify-between gap-2">
                                    <span className="font-semibold text-sm text-foreground truncate">{c.other?.name || 'Conversation'}</span>
                                    <span className="text-[10px] text-foreground/40 shrink-0">{timeLabel(c.last_message_at)}</span>
                                </div>
                                <div className="flex items-center justify-between gap-2">
                                    <span className="text-xs text-foreground/50 truncate">
                                        {c.last_message ? (c.last_message.sender_id === myId ? 'You: ' : '') + c.last_message.body : 'No messages yet'}
                                    </span>
                                    {c.unread_count > 0 && (
                                        <span className="shrink-0 min-w-[18px] h-[18px] rounded-full bg-blue-600 text-white text-[10px] font-bold flex items-center justify-center px-1">
                                            {c.unread_count}
                                        </span>
                                    )}
                                </div>
                                {c.other?.role === 'teacher' && <span className="text-[10px] text-green-700 font-semibold">Teacher</span>}
                            </div>
                        </button>
                    ))
                )}
            </div>
        </div>
    );

    const thread = (
        <div className="flex flex-col h-full">
            {activeId ? (
                <>
                    <div className="px-4 py-3 border-b border-card-border flex items-center gap-3">
                        <button onClick={() => setActiveId(null)} className="md:hidden text-foreground/60" aria-label="Back to list">
                            <ArrowLeft className="h-5 w-5" />
                        </button>
                        <TeacherAvatar name={active?.other?.name || null} avatar={active?.other?.avatar || null} size={36} />
                        <div className="min-w-0">
                            <p className="font-semibold text-sm text-foreground truncate">{active?.other?.name || 'Conversation'}</p>
                            <p className="text-[11px] text-foreground/50">
                                {active?.other?.role === 'teacher' ? 'Teacher' : 'Student'} · Keep all contact on OSDHYAN chat
                            </p>
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto px-4 py-4 space-y-2 bg-background/40">
                        {threadLoading ? (
                            <div className="flex justify-center py-10"><Loader2 className="h-5 w-5 animate-spin text-blue-600" /></div>
                        ) : error ? (
                            <p className="text-sm text-red-600 text-center py-10">{error}</p>
                        ) : messages.length === 0 ? (
                            <p className="text-sm text-foreground/40 text-center py-10">Say hello and agree on timing, fee and the first class.</p>
                        ) : (
                            messages.map((m) => {
                                const mine = m.sender_id === myId;
                                return (
                                    <div key={m.id} className={cn('flex', mine ? 'justify-end' : 'justify-start')}>
                                        <div className={cn(
                                            'max-w-[80%] rounded-2xl px-3.5 py-2 text-sm whitespace-pre-wrap break-words',
                                            mine ? 'bg-blue-600 text-white rounded-br-md' : 'bg-card-bg border border-card-border text-foreground rounded-bl-md',
                                        )}>
                                            {m.body}
                                            <div className={cn('text-[10px] mt-1', mine ? 'text-white/70' : 'text-foreground/40')}>{timeLabel(m.created_at)}</div>
                                        </div>
                                    </div>
                                );
                            })
                        )}
                        <div ref={bottomRef} />
                    </div>

                    <form onSubmit={send} className="p-3 border-t border-card-border flex items-end gap-2">
                        <textarea
                            value={draft}
                            onChange={(e) => setDraft(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' && !e.shiftKey) {
                                    e.preventDefault();
                                    send(e);
                                }
                            }}
                            maxLength={2000}
                            rows={1}
                            placeholder="Type a message"
                            className="flex-1 resize-none bg-background border border-card-border rounded-xl px-3 py-2.5 text-sm text-foreground outline-none focus:border-blue-500 max-h-32"
                        />
                        <button type="submit" disabled={sending || !draft.trim()} className="h-10 w-10 rounded-xl bg-blue-600 text-white flex items-center justify-center disabled:opacity-50" aria-label="Send">
                            {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                        </button>
                    </form>
                </>
            ) : (
                <div className="hidden md:flex flex-1 items-center justify-center text-sm text-foreground/40 px-8 text-center">
                    Select a conversation to read and reply.
                </div>
            )}
        </div>
    );

    return (
        <div className="bg-card-bg border border-card-border rounded-2xl overflow-hidden h-[calc(100vh-200px)] min-h-[520px] grid grid-cols-1 md:grid-cols-[320px_1fr]">
            <div className={cn('border-r border-card-border min-h-0', activeId ? 'hidden md:block' : 'block')}>{list}</div>
            <div className={cn('min-h-0', activeId ? 'block' : 'hidden md:block')}>{thread}</div>
        </div>
    );
}
