'use client';

import { useState } from 'react';
import { Loader2, X } from 'lucide-react';
import api from '@/lib/api';
import { EXAM_OPTIONS, SUBJECT_SUGGESTIONS, TeachingMode, TuitionRequest, errorMessage } from './types';

type Props = {
    onClose: () => void;
    onCreated: (request: TuitionRequest) => void;
};

const inputCls = 'w-full bg-background border border-card-border rounded-xl px-3 py-2.5 text-sm text-foreground outline-none focus:border-blue-500';
const labelCls = 'block text-xs font-semibold text-foreground/60 mb-1';

/** Modal: a student posts a tuition requirement. */
export default function RequirementForm({ onClose, onCreated }: Props) {
    const [form, setForm] = useState({
        subject: '',
        exam: '',
        mode: 'home' as TeachingMode,
        city: '',
        area: '',
        budget_per_hour: '',
        preferred_timing: '',
        description: '',
    });
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const set = (key: keyof typeof form, value: string) => setForm((p) => ({ ...p, [key]: value }));

    const submit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        setError(null);
        try {
            const res = await api.post('/tuition/requests', {
                ...form,
                exam: form.exam || null,
                city: form.city || null,
                area: form.area || null,
                budget_per_hour: form.budget_per_hour ? Number(form.budget_per_hour) : null,
                preferred_timing: form.preferred_timing || null,
                description: form.description || null,
            });
            onCreated(res.data.request);
        } catch (err) {
            setError(errorMessage(err));
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 bg-gray-900/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-card-bg border border-card-border rounded-2xl w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto">
                <div className="flex items-start justify-between mb-5">
                    <div>
                        <h2 className="text-lg font-bold text-foreground">Post your requirement</h2>
                        <p className="text-sm text-foreground/60">Verified teachers in your city (or online) will send you proposals.</p>
                    </div>
                    <button onClick={onClose} className="text-foreground/40 hover:text-foreground" aria-label="Close"><X className="h-5 w-5" /></button>
                </div>

                <form onSubmit={submit} className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className={labelCls}>Subject *</label>
                            <input list="subject-suggestions" required maxLength={100} value={form.subject} onChange={(e) => set('subject', e.target.value)} className={inputCls} placeholder="e.g. Mathematics" />
                            <datalist id="subject-suggestions">{SUBJECT_SUGGESTIONS.map((s) => <option key={s} value={s} />)}</datalist>
                        </div>
                        <div>
                            <label className={labelCls}>Exam / class</label>
                            <input list="exam-suggestions" maxLength={100} value={form.exam} onChange={(e) => set('exam', e.target.value)} className={inputCls} placeholder="e.g. BPSC, Class 10" />
                            <datalist id="exam-suggestions">{EXAM_OPTIONS.map((s) => <option key={s} value={s} />)}</datalist>
                        </div>
                        <div>
                            <label className={labelCls}>Mode *</label>
                            <select value={form.mode} onChange={(e) => set('mode', e.target.value)} className={inputCls}>
                                <option value="home">Home tuition</option>
                                <option value="online">Online</option>
                                <option value="both">Either</option>
                            </select>
                        </div>
                        <div>
                            <label className={labelCls}>City {form.mode !== 'online' && '*'}</label>
                            <input required={form.mode !== 'online'} maxLength={100} value={form.city} onChange={(e) => set('city', e.target.value)} className={inputCls} placeholder="e.g. Patna" />
                        </div>
                        <div>
                            <label className={labelCls}>Area / locality</label>
                            <input maxLength={100} value={form.area} onChange={(e) => set('area', e.target.value)} className={inputCls} placeholder="e.g. Boring Road" />
                        </div>
                        <div>
                            <label className={labelCls}>Budget per hour (₹)</label>
                            <input type="number" min={0} max={100000} value={form.budget_per_hour} onChange={(e) => set('budget_per_hour', e.target.value)} className={inputCls} placeholder="e.g. 300" />
                        </div>
                    </div>
                    <div>
                        <label className={labelCls}>Preferred timing</label>
                        <input maxLength={150} value={form.preferred_timing} onChange={(e) => set('preferred_timing', e.target.value)} className={inputCls} placeholder="e.g. Weekdays 5–7 pm" />
                    </div>
                    <div>
                        <label className={labelCls}>Details</label>
                        <textarea maxLength={2000} rows={3} value={form.description} onChange={(e) => set('description', e.target.value)} className={inputCls} placeholder="Current level, goals, number of students, anything the teacher should know." />
                    </div>

                    {error && <p className="text-sm text-red-600">{error}</p>}

                    <div className="flex gap-3 pt-2">
                        <button type="button" onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-card-border text-sm font-semibold text-foreground/70">Cancel</button>
                        <button type="submit" disabled={saving} className="flex-1 py-2.5 rounded-xl bg-blue-600 text-white text-sm font-bold hover:bg-blue-700 disabled:opacity-60 flex items-center justify-center gap-2">
                            {saving && <Loader2 className="h-4 w-4 animate-spin" />} Post requirement
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
