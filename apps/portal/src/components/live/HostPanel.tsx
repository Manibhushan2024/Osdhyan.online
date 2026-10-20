'use client';

import { useState } from 'react';
import { Copy, Check, Hand, KeyRound, Link2, Smartphone, Users } from 'lucide-react';
import { toast } from 'react-hot-toast';
import api from '@/lib/api';
import { cn } from '@/lib/utils';
import QrCode from './QrCode';
import { apiErrorMessage, copyText, formatAgo } from './format';
import type { HandRaised, LiveStatus } from './types';

type Props = {
    classId: number;
    status: LiveStatus;
    participantsCount: number;
    handsRaised: HandRaised[];
    joinLink: string;
    roomName: string | null;
    password: string | null;
    onChanged: () => void;
};

function CopyButton({ value, label }: { value: string; label: string }) {
    const [done, setDone] = useState(false);
    return (
        <button
            onClick={async () => {
                const ok = await copyText(value);
                if (ok) {
                    setDone(true);
                    setTimeout(() => setDone(false), 1500);
                } else {
                    toast.error('Copy failed — select the text and copy manually');
                }
            }}
            className="shrink-0 flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-foreground/5 hover:bg-foreground/10 text-[9px] font-black uppercase tracking-widest text-foreground"
            aria-label={`Copy ${label}`}
        >
            {done ? <Check className="h-3 w-3 text-emerald-500" /> : <Copy className="h-3 w-3" />} {done ? 'Copied' : 'Copy'}
        </button>
    );
}

/** Teacher-only side tab: who has a hand up + the link to share with students. */
export default function HostPanel({ classId, status, participantsCount, handsRaised, joinLink, roomName, password, onChanged }: Props) {
    const [busyUser, setBusyUser] = useState<number | null>(null);

    const lowerHand = async (userId: number) => {
        setBusyUser(userId);
        try {
            await api.post(`/live-classes/${classId}/participants/${userId}/lower-hand`);
            onChanged();
        } catch (e) {
            toast.error(apiErrorMessage(e, 'Could not lower hand'));
        } finally {
            setBusyUser(null);
        }
    };

    return (
        <div className="h-full min-h-0 overflow-y-auto p-4 space-y-6">
            <section className="space-y-3">
                <div className="flex items-center justify-between">
                    <h4 className="text-[10px] font-black uppercase tracking-widest text-foreground/50 flex items-center gap-1.5"><Hand className="h-3.5 w-3.5" /> Raised hands</h4>
                    <span className="text-[10px] font-black text-foreground/50 flex items-center gap-1"><Users className="h-3 w-3" /> {participantsCount} in room</span>
                </div>
                {handsRaised.length === 0 ? (
                    <p className="text-xs font-medium text-foreground/40">No raised hands. When a student presses &ldquo;Raise hand&rdquo; their name appears here, oldest first. Press &ldquo;Done&rdquo; after you have answered them.</p>
                ) : (
                    <ul className="space-y-1.5">
                        {handsRaised.map((h, i) => (
                            <li key={h.user_id} className="flex items-center gap-2 bg-foreground/[0.03] border border-card-border rounded-xl px-3 py-2">
                                <span className="text-[10px] font-black text-foreground/40 w-4">{i + 1}</span>
                                <span className="flex-1 text-sm font-bold text-foreground truncate">{h.name ?? 'Student'}</span>
                                {h.raised_at && <span className="text-[9px] font-bold text-foreground/40">{formatAgo(h.raised_at)}</span>}
                                <button
                                    onClick={() => lowerHand(h.user_id)}
                                    disabled={busyUser === h.user_id}
                                    className="text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded-lg bg-foreground/5 hover:bg-foreground/10 text-foreground disabled:opacity-40"
                                >
                                    Done
                                </button>
                            </li>
                        ))}
                    </ul>
                )}
            </section>

            <section className="space-y-3">
                <h4 className="text-[10px] font-black uppercase tracking-widest text-foreground/50 flex items-center gap-1.5"><Smartphone className="h-3.5 w-3.5" /> Share the class link</h4>
                <p className="text-xs font-medium text-foreground/50">
                    Send this link to your students (WhatsApp, Telegram, SMS). Or scan the code to open the class on your own phone to watch the chat.
                </p>
                <div className="flex flex-col items-center gap-3 bg-white rounded-2xl p-3 border border-card-border">
                    <QrCode value={joinLink} size={176} />
                </div>
                <div className="space-y-2">
                    <div className="flex items-center gap-2 bg-foreground/[0.03] border border-card-border rounded-xl px-3 py-2">
                        <Link2 className="h-3.5 w-3.5 text-foreground/40 shrink-0" />
                        <span className="flex-1 text-[11px] font-mono text-foreground/80 truncate select-all">{joinLink}</span>
                        <CopyButton value={joinLink} label="link" />
                    </div>
                    {password && (
                        <div className="flex items-center gap-2 bg-foreground/[0.03] border border-card-border rounded-xl px-3 py-2">
                            <KeyRound className="h-3.5 w-3.5 text-foreground/40 shrink-0" />
                            <div className="flex-1 min-w-0">
                                <p className="text-[9px] font-black uppercase tracking-widest text-foreground/40">Room password</p>
                                <p className="text-lg font-black tracking-[0.2em] text-foreground select-all">{password}</p>
                            </div>
                            <CopyButton value={password} label="password" />
                        </div>
                    )}
                    {roomName && (
                        <p className="text-[10px] font-bold text-foreground/40 px-1">Room: <span className="font-mono text-foreground/60">{roomName}</span></p>
                    )}
                </div>
                <p className={cn('text-[10px] font-bold text-foreground/40', status !== 'live' && 'text-amber-600')}>
                    {status === 'live'
                        ? 'Students who join from this website get the password automatically.'
                        : 'Students can open the link now; they will see a countdown until you press "Start class".'}
                </p>
            </section>
        </div>
    );
}
