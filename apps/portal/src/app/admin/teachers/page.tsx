'use client';

import { useCallback, useEffect, useState } from 'react';
import { BadgeCheck, Loader2, Search, ShieldOff, X } from 'lucide-react';
import api from '@/lib/api';
import { cn } from '@/lib/utils';
import { MODE_LABELS, TeacherPublic, errorMessage, formatINR } from '@/components/tuition/types';

type AdminTeacher = TeacherPublic & {
    email: string | null;
    phone: string | null;
    user_city: string | null;
    created_at: string;
};

type Status = 'pending' | 'verified' | 'all';

export default function AdminTeachersPage() {
    const [status, setStatus] = useState<Status>('pending');
    const [q, setQ] = useState('');
    const [rows, setRows] = useState<AdminTeacher[]>([]);
    const [counts, setCounts] = useState({ pending: 0, verified: 0 });
    const [page, setPage] = useState(1);
    const [lastPage, setLastPage] = useState(1);
    const [loading, setLoading] = useState(true);
    const [busyId, setBusyId] = useState<number | null>(null);
    const [preview, setPreview] = useState<AdminTeacher | null>(null);
    const [error, setError] = useState<string | null>(null);

    const load = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await api.get('/admin/teachers', { params: { status, q: q || undefined, page } });
            setRows(res.data.data || []);
            setCounts(res.data.counts || { pending: 0, verified: 0 });
            setLastPage(res.data.last_page || 1);
        } catch (err) {
            setError(errorMessage(err, 'Could not load teachers.'));
        } finally {
            setLoading(false);
        }
    }, [status, q, page]);

    useEffect(() => {
        load();
    }, [load]);

    const toggle = async (t: AdminTeacher, verify: boolean) => {
        setBusyId(t.id);
        setError(null);
        try {
            const res = await api.post(`/admin/teachers/${t.id}/${verify ? 'verify' : 'unverify'}`);
            const updated: AdminTeacher = res.data.teacher;
            setRows((prev) => prev.map((r) => (r.id === t.id ? updated : r)).filter((r) => status === 'all' || (status === 'pending' ? !r.is_verified : r.is_verified)));
            setCounts((c) => ({ pending: c.pending + (verify ? -1 : 1), verified: c.verified + (verify ? 1 : -1) }));
            if (preview?.id === t.id) setPreview(updated);
        } catch (err) {
            setError(errorMessage(err));
        } finally {
            setBusyId(null);
        }
    };

    return (
        <div className="space-y-8 pb-20">
            <div className="bg-card-bg border border-card-border rounded-[2rem] p-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-black uppercase tracking-tight italic">Teachers</h1>
                    <p className="text-[10px] font-black text-foreground/40 uppercase tracking-[0.2em] mt-2">
                        Verify home-tuition teachers. Only verified teachers appear in search and can send proposals.
                    </p>
                </div>
                <div className="flex gap-3 text-center">
                    <div className="rounded-2xl border border-card-border px-5 py-3">
                        <p className="text-2xl font-black">{counts.pending}</p>
                        <p className="text-[9px] font-black uppercase tracking-widest text-foreground/40">Pending</p>
                    </div>
                    <div className="rounded-2xl border border-card-border px-5 py-3">
                        <p className="text-2xl font-black">{counts.verified}</p>
                        <p className="text-[9px] font-black uppercase tracking-widest text-foreground/40">Verified</p>
                    </div>
                </div>
            </div>

            <div className="bg-card-bg border border-card-border rounded-[2rem] p-6 space-y-5">
                <div className="flex flex-col md:flex-row gap-3 md:items-center justify-between">
                    <div className="flex gap-2">
                        {(['pending', 'verified', 'all'] as Status[]).map((s) => (
                            <button
                                key={s}
                                onClick={() => { setStatus(s); setPage(1); }}
                                className={cn('px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border', status === s ? 'bg-indigo-600 text-white border-indigo-600' : 'border-card-border text-foreground/50')}
                            >
                                {s}
                            </button>
                        ))}
                    </div>
                    <form onSubmit={(e) => { e.preventDefault(); setPage(1); load(); }} className="flex gap-2">
                        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search name, email, city, subject" className="bg-white/5 border border-card-border rounded-xl p-3 text-sm w-72 max-w-full" />
                        <button type="submit" className="px-4 rounded-xl border border-card-border"><Search className="h-4 w-4" /></button>
                    </form>
                </div>

                {error && <p className="text-sm text-red-500">{error}</p>}

                {loading ? (
                    <div className="flex justify-center py-16"><Loader2 className="h-8 w-8 animate-spin text-indigo-600" /></div>
                ) : rows.length === 0 ? (
                    <p className="text-[10px] font-black text-foreground/30 uppercase tracking-[0.2em] py-10 text-center">No teachers in this list.</p>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="text-left text-[9px] font-black uppercase tracking-widest text-foreground/40 border-b border-card-border">
                                    <th className="py-3 pr-4">Teacher</th>
                                    <th className="py-3 pr-4">Subjects</th>
                                    <th className="py-3 pr-4">City / mode</th>
                                    <th className="py-3 pr-4">Fee</th>
                                    <th className="py-3 pr-4">Exp</th>
                                    <th className="py-3 pr-4">Status</th>
                                    <th className="py-3 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {rows.map((t) => (
                                    <tr key={t.id} className="border-b border-card-border/60 hover:bg-white/5">
                                        <td className="py-3 pr-4">
                                            <button onClick={() => setPreview(t)} className="text-left">
                                                <p className="font-bold">{t.name}</p>
                                                <p className="text-xs text-foreground/50">{t.email}{t.phone ? ` · ${t.phone}` : ''}</p>
                                            </button>
                                        </td>
                                        <td className="py-3 pr-4 max-w-[220px]">
                                            <p className="truncate">{t.subjects.join(', ') || '—'}</p>
                                            <p className="text-xs text-foreground/50 truncate">{t.exams.join(', ')}</p>
                                        </td>
                                        <td className="py-3 pr-4">
                                            <p>{t.city || '—'}</p>
                                            <p className="text-xs text-foreground/50">{MODE_LABELS[t.teaching_mode]}</p>
                                        </td>
                                        <td className="py-3 pr-4 whitespace-nowrap">{formatINR(t.fee_per_hour)}/hr</td>
                                        <td className="py-3 pr-4">{t.experience_years} yr</td>
                                        <td className="py-3 pr-4">
                                            {t.is_verified
                                                ? <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase text-green-600"><BadgeCheck className="h-3.5 w-3.5" /> Verified</span>
                                                : <span className="text-[10px] font-black uppercase text-amber-600">Pending</span>}
                                        </td>
                                        <td className="py-3 text-right whitespace-nowrap">
                                            <button onClick={() => setPreview(t)} className="px-3 py-1.5 rounded-lg border border-card-border text-[10px] font-black uppercase tracking-widest mr-2">Preview</button>
                                            {t.is_verified ? (
                                                <button disabled={busyId === t.id} onClick={() => toggle(t, false)} className="px-3 py-1.5 rounded-lg bg-red-600/10 text-red-600 text-[10px] font-black uppercase tracking-widest disabled:opacity-50">Unverify</button>
                                            ) : (
                                                <button disabled={busyId === t.id} onClick={() => toggle(t, true)} className="px-3 py-1.5 rounded-lg bg-indigo-600 text-white text-[10px] font-black uppercase tracking-widest disabled:opacity-50">Verify</button>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {lastPage > 1 && (
                    <div className="flex items-center justify-center gap-3">
                        <button disabled={page <= 1} onClick={() => setPage((p) => p - 1)} className="px-4 py-2 rounded-xl border border-card-border text-xs disabled:opacity-40">Previous</button>
                        <span className="text-xs text-foreground/60">Page {page} of {lastPage}</span>
                        <button disabled={page >= lastPage} onClick={() => setPage((p) => p + 1)} className="px-4 py-2 rounded-xl border border-card-border text-xs disabled:opacity-40">Next</button>
                    </div>
                )}
            </div>

            {preview && (
                <div className="fixed inset-0 z-50 bg-gray-900/70 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setPreview(null)}>
                    <div className="bg-card-bg border border-card-border rounded-[2rem] w-full max-w-2xl p-8 max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-start justify-between mb-6">
                            <div>
                                <h2 className="text-xl font-black">{preview.name}</h2>
                                <p className="text-sm text-foreground/60">{preview.headline || 'No headline'}</p>
                                <p className="text-xs text-foreground/50 mt-1">{preview.email}{preview.phone ? ` · ${preview.phone}` : ''} · Joined {new Date(preview.created_at).toLocaleDateString('en-IN')}</p>
                            </div>
                            <button onClick={() => setPreview(null)} className="text-foreground/40 hover:text-foreground" aria-label="Close"><X className="h-5 w-5" /></button>
                        </div>
                        <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                            <div><dt className="text-[9px] font-black uppercase tracking-widest text-foreground/40">Subjects</dt><dd>{preview.subjects.join(', ') || '—'}</dd></div>
                            <div><dt className="text-[9px] font-black uppercase tracking-widest text-foreground/40">Exams / classes</dt><dd>{preview.exams.join(', ') || '—'}</dd></div>
                            <div><dt className="text-[9px] font-black uppercase tracking-widest text-foreground/40">City / areas</dt><dd>{preview.city || '—'}{preview.areas.length ? ` · ${preview.areas.join(', ')}` : ''}</dd></div>
                            <div><dt className="text-[9px] font-black uppercase tracking-widest text-foreground/40">Mode</dt><dd>{MODE_LABELS[preview.teaching_mode]}</dd></div>
                            <div><dt className="text-[9px] font-black uppercase tracking-widest text-foreground/40">Fee</dt><dd>{formatINR(preview.fee_per_hour)}/hr</dd></div>
                            <div><dt className="text-[9px] font-black uppercase tracking-widest text-foreground/40">Experience</dt><dd>{preview.experience_years} years</dd></div>
                            <div><dt className="text-[9px] font-black uppercase tracking-widest text-foreground/40">Qualifications</dt><dd>{preview.qualifications || '—'}</dd></div>
                            <div><dt className="text-[9px] font-black uppercase tracking-widest text-foreground/40">Languages</dt><dd>{preview.languages.join(', ') || '—'}</dd></div>
                            <div className="sm:col-span-2"><dt className="text-[9px] font-black uppercase tracking-widest text-foreground/40">Availability</dt><dd>{preview.availability || '—'}</dd></div>
                            <div className="sm:col-span-2"><dt className="text-[9px] font-black uppercase tracking-widest text-foreground/40">About</dt><dd className="whitespace-pre-wrap">{preview.bio || '—'}</dd></div>
                        </dl>
                        <div className="flex gap-3 mt-8">
                            {preview.is_verified ? (
                                <button disabled={busyId === preview.id} onClick={() => toggle(preview, false)} className="flex items-center gap-2 px-5 py-3 rounded-xl bg-red-600/10 text-red-600 text-[10px] font-black uppercase tracking-widest disabled:opacity-50">
                                    <ShieldOff className="h-4 w-4" /> Remove verification
                                </button>
                            ) : (
                                <button disabled={busyId === preview.id} onClick={() => toggle(preview, true)} className="flex items-center gap-2 px-5 py-3 rounded-xl bg-indigo-600 text-white text-[10px] font-black uppercase tracking-widest disabled:opacity-50">
                                    <BadgeCheck className="h-4 w-4" /> Verify teacher
                                </button>
                            )}
                            <button onClick={() => setPreview(null)} className="px-5 py-3 rounded-xl border border-card-border text-[10px] font-black uppercase tracking-widest">Close</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
