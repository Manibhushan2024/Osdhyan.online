'use client';

import { useState } from 'react';
import { Loader2, X } from 'lucide-react';
import api from '@/lib/api';
import { Lead, MODE_LABELS, errorMessage, formatINR } from './types';

type Props = {
    lead: Lead;
    defaultFee?: number | null;
    onClose: () => void;
    onSent: (leadId: number) => void;
};

/** Teacher sends a proposal on an open requirement. */
export default function ProposalModal({ lead, defaultFee, onClose, onSent }: Props) {
    const [message, setMessage] = useState('');
    const [fee, setFee] = useState(defaultFee ? String(defaultFee) : lead.budget_per_hour ? String(lead.budget_per_hour) : '');
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const submit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        setError(null);
        try {
            await api.post(`/tuition/requests/${lead.id}/proposals`, { message, fee_per_hour: Number(fee) });
            onSent(lead.id);
        } catch (err) {
            setError(errorMessage(err));
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 bg-gray-900/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-card-bg border border-card-border rounded-2xl w-full max-w-lg p-6">
                <div className="flex items-start justify-between mb-4">
                    <div>
                        <h2 className="text-lg font-bold text-foreground">Send proposal</h2>
                        <p className="text-sm text-foreground/60">
                            {lead.subject}{lead.exam ? ` · ${lead.exam}` : ''} · {MODE_LABELS[lead.mode]}{lead.city ? ` · ${lead.city}` : ''}
                            {lead.budget_per_hour ? ` · Budget ${formatINR(lead.budget_per_hour)}/hr` : ''}
                        </p>
                    </div>
                    <button onClick={onClose} className="text-foreground/40 hover:text-foreground" aria-label="Close"><X className="h-5 w-5" /></button>
                </div>

                <form onSubmit={submit} className="space-y-4">
                    <div>
                        <label className="block text-xs font-semibold text-foreground/60 mb-1">Your fee per hour (₹) *</label>
                        <input type="number" required min={0} max={100000} value={fee} onChange={(e) => setFee(e.target.value)} className="w-full bg-background border border-card-border rounded-xl px-3 py-2.5 text-sm text-foreground outline-none focus:border-blue-500" />
                    </div>
                    <div>
                        <label className="block text-xs font-semibold text-foreground/60 mb-1">Message to the student *</label>
                        <textarea required maxLength={2000} rows={5} value={message} onChange={(e) => setMessage(e.target.value)} className="w-full bg-background border border-card-border rounded-xl px-3 py-2.5 text-sm text-foreground outline-none focus:border-blue-500" placeholder="Introduce yourself, your experience with this subject/exam, and how you would plan the classes. Do not share phone numbers; the student can chat with you here once they accept." />
                    </div>
                    {error && <p className="text-sm text-red-600">{error}</p>}
                    <div className="flex gap-3">
                        <button type="button" onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-card-border text-sm font-semibold text-foreground/70">Cancel</button>
                        <button type="submit" disabled={saving} className="flex-1 py-2.5 rounded-xl bg-blue-600 text-white text-sm font-bold hover:bg-blue-700 disabled:opacity-60 flex items-center justify-center gap-2">
                            {saving && <Loader2 className="h-4 w-4 animate-spin" />} Send proposal
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
