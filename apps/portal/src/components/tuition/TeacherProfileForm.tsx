'use client';

import { useState } from 'react';
import { Loader2 } from 'lucide-react';
import api from '@/lib/api';
import TagInput from './TagInput';
import {
    EMPTY_PROFILE_INPUT, EXAM_OPTIONS, SUBJECT_SUGGESTIONS, TeacherOwnProfile, TeacherProfileInput,
    TeachingMode, errorMessage,
} from './types';

type Props = {
    /** 'register' → POST /teacher/register (also upgrades role); 'update' → PUT /teacher/profile. */
    mode: 'register' | 'update';
    initial?: TeacherOwnProfile | null;
    onSaved: (profile: TeacherOwnProfile, user?: unknown) => void;
    submitLabel?: string;
};

const inputCls = 'w-full bg-background border border-card-border rounded-xl px-3 py-2.5 text-sm text-foreground outline-none focus:border-blue-500';
const labelCls = 'block text-xs font-semibold text-foreground/60 mb-1';

export function profileToInput(p: TeacherOwnProfile | null | undefined): TeacherProfileInput {
    if (!p) return EMPTY_PROFILE_INPUT;
    return {
        headline: p.headline || '',
        bio: p.bio || '',
        subjects: p.subjects || [],
        exams: p.exams || [],
        teaching_mode: p.teaching_mode || 'both',
        city: p.city || '',
        areas: p.areas || [],
        fee_per_hour: p.fee_per_hour === null || p.fee_per_hour === undefined ? '' : String(p.fee_per_hour),
        experience_years: String(p.experience_years ?? 0),
        qualifications: p.qualifications || '',
        languages: p.languages || [],
        availability: p.availability || '',
        is_available: p.is_available ?? true,
    };
}

export default function TeacherProfileForm({ mode, initial, onSaved, submitLabel }: Props) {
    const [form, setForm] = useState<TeacherProfileInput>(() => profileToInput(initial));
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const set = <K extends keyof TeacherProfileInput>(key: K, value: TeacherProfileInput[K]) =>
        setForm((p) => ({ ...p, [key]: value }));

    const submit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (form.subjects.length === 0) {
            setError('Add at least one subject you teach.');
            return;
        }
        if (form.teaching_mode !== 'online' && !form.city.trim()) {
            setError('City is required for home tuition.');
            return;
        }
        setSaving(true);
        setError(null);
        const payload = {
            ...form,
            fee_per_hour: form.fee_per_hour === '' ? null : Number(form.fee_per_hour),
            experience_years: Number(form.experience_years || 0),
            city: form.city || null,
            headline: form.headline || null,
            bio: form.bio || null,
            qualifications: form.qualifications || null,
            availability: form.availability || null,
        };
        try {
            const res = mode === 'register'
                ? await api.post('/teacher/register', payload)
                : await api.put('/teacher/profile', payload);
            onSaved(res.data.profile, res.data.user);
        } catch (err) {
            setError(errorMessage(err));
        } finally {
            setSaving(false);
        }
    };

    return (
        <form onSubmit={submit} className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                    <label className={labelCls}>Headline</label>
                    <input maxLength={150} value={form.headline} onChange={(e) => set('headline', e.target.value)} className={inputCls} placeholder="e.g. Mathematics tutor for Class 9–12 and BPSC, 6 years experience" />
                </div>
                <div className="sm:col-span-2">
                    <label className={labelCls}>Subjects you teach *</label>
                    <TagInput value={form.subjects} onChange={(v) => set('subjects', v)} placeholder="Type a subject and press Enter" suggestions={SUBJECT_SUGGESTIONS} />
                </div>
                <div className="sm:col-span-2">
                    <label className={labelCls}>Exams / classes</label>
                    <TagInput value={form.exams} onChange={(v) => set('exams', v)} placeholder="e.g. BPSC, Class 10" suggestions={EXAM_OPTIONS} />
                </div>
                <div>
                    <label className={labelCls}>Teaching mode *</label>
                    <select value={form.teaching_mode} onChange={(e) => set('teaching_mode', e.target.value as TeachingMode)} className={inputCls}>
                        <option value="both">Online and home visits</option>
                        <option value="online">Online only</option>
                        <option value="home">Home visits only</option>
                    </select>
                </div>
                <div>
                    <label className={labelCls}>City {form.teaching_mode !== 'online' && '*'}</label>
                    <input maxLength={100} value={form.city} onChange={(e) => set('city', e.target.value)} className={inputCls} placeholder="e.g. Patna" />
                </div>
                <div className="sm:col-span-2">
                    <label className={labelCls}>Areas you can visit</label>
                    <TagInput value={form.areas} onChange={(v) => set('areas', v)} placeholder="e.g. Kankarbagh, Boring Road" />
                </div>
                <div>
                    <label className={labelCls}>Fee per hour (₹)</label>
                    <input type="number" min={0} max={100000} value={form.fee_per_hour} onChange={(e) => set('fee_per_hour', e.target.value)} className={inputCls} placeholder="e.g. 400" />
                </div>
                <div>
                    <label className={labelCls}>Years of experience</label>
                    <input type="number" min={0} max={60} value={form.experience_years} onChange={(e) => set('experience_years', e.target.value)} className={inputCls} />
                </div>
                <div className="sm:col-span-2">
                    <label className={labelCls}>Qualifications</label>
                    <input maxLength={255} value={form.qualifications} onChange={(e) => set('qualifications', e.target.value)} className={inputCls} placeholder="e.g. M.Sc. Mathematics, B.Ed." />
                </div>
                <div className="sm:col-span-2">
                    <label className={labelCls}>Languages</label>
                    <TagInput value={form.languages} onChange={(v) => set('languages', v)} placeholder="e.g. Hindi, English" suggestions={['Hindi', 'English', 'Bhojpuri', 'Maithili', 'Urdu']} max={10} />
                </div>
                <div className="sm:col-span-2">
                    <label className={labelCls}>Availability</label>
                    <input maxLength={500} value={form.availability} onChange={(e) => set('availability', e.target.value)} className={inputCls} placeholder="e.g. Mon–Sat, 4 pm to 9 pm" />
                </div>
                <div className="sm:col-span-2">
                    <label className={labelCls}>About you</label>
                    <textarea maxLength={3000} rows={4} value={form.bio} onChange={(e) => set('bio', e.target.value)} className={inputCls} placeholder="Teaching approach, results, batch sizes." />
                </div>
                {mode === 'update' && (
                    <label className="sm:col-span-2 flex items-center gap-2 text-sm text-foreground">
                        <input type="checkbox" checked={form.is_available} onChange={(e) => set('is_available', e.target.checked)} />
                        Currently accepting new students (hides your profile from search when off)
                    </label>
                )}
            </div>

            {error && <p className="text-sm text-red-600">{error}</p>}

            <button type="submit" disabled={saving} className="w-full sm:w-auto px-6 py-3 rounded-xl bg-blue-600 text-white text-sm font-bold hover:bg-blue-700 disabled:opacity-60 flex items-center justify-center gap-2">
                {saving && <Loader2 className="h-4 w-4 animate-spin" />}
                {submitLabel || (mode === 'register' ? 'Create teacher profile' : 'Save changes')}
            </button>
        </form>
    );
}
