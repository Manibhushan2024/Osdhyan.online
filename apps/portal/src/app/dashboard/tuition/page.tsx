'use client';

import { Suspense, useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { GraduationCap, Loader2, MessageSquare, Plus, Search } from 'lucide-react';
import api from '@/lib/api';
import { cn } from '@/lib/utils';
import { useAuth } from '@/components/providers/AuthProvider';
import TeacherCard, { TeacherAvatar } from '@/components/tuition/TeacherCard';
import RequirementForm from '@/components/tuition/RequirementForm';
import {
    EXAM_OPTIONS, MODE_LABELS, Paginated, SUBJECT_SUGGESTIONS, TeacherPublic, TuitionRequest,
    errorMessage, formatINR, userRole,
} from '@/components/tuition/types';

const inputCls = 'w-full bg-background border border-card-border rounded-xl px-3 py-2.5 text-sm text-foreground outline-none focus:border-blue-500';

type Tab = 'find' | 'mine';

function statusBadge(status: TuitionRequest['status'] | string) {
    const map: Record<string, string> = {
        open: 'bg-blue-50 text-blue-700',
        matched: 'bg-green-50 text-green-700',
        closed: 'bg-gray-100 text-gray-600',
        pending: 'bg-amber-50 text-amber-700',
        accepted: 'bg-green-50 text-green-700',
        rejected: 'bg-gray-100 text-gray-500',
    };
    return <span className={cn('text-[11px] font-bold uppercase px-2 py-0.5 rounded-md', map[status] || 'bg-gray-100 text-gray-600')}>{status}</span>;
}

function TuitionInner() {
    const params = useSearchParams();
    const { user } = useAuth();
    const isTeacher = userRole(user) === 'teacher';

    const [tab, setTab] = useState<Tab>(params.get('tab') === 'mine' ? 'mine' : 'find');

    // Directory
    const [filters, setFilters] = useState({ subject: '', exam: '', city: '', mode: '' });
    const [teachers, setTeachers] = useState<Paginated<TeacherPublic> | null>(null);
    const [page, setPage] = useState(1);
    const [loadingTeachers, setLoadingTeachers] = useState(true);

    const loadTeachers = useCallback(async () => {
        setLoadingTeachers(true);
        try {
            const res = await api.get('/tuition/teachers', { params: { ...filters, page } });
            setTeachers(res.data);
        } catch {
            setTeachers({ data: [], current_page: 1, last_page: 1, total: 0 });
        } finally {
            setLoadingTeachers(false);
        }
    }, [filters, page]);

    useEffect(() => {
        loadTeachers();
    }, [loadTeachers]);

    // My requirements
    const [requests, setRequests] = useState<TuitionRequest[]>([]);
    const [loadingRequests, setLoadingRequests] = useState(false);
    const [showForm, setShowForm] = useState(false);
    const [busyId, setBusyId] = useState<number | null>(null);
    const [notice, setNotice] = useState<string | null>(null);

    const loadRequests = useCallback(async () => {
        setLoadingRequests(true);
        try {
            const res = await api.get('/tuition/requests/mine');
            setRequests(res.data.data || []);
        } catch {
            setRequests([]);
        } finally {
            setLoadingRequests(false);
        }
    }, []);

    useEffect(() => {
        if (tab === 'mine') loadRequests();
    }, [tab, loadRequests]);

    const accept = async (requestId: number, proposalId: number) => {
        if (!confirm('Accept this proposal? Other proposals on this requirement will be declined.')) return;
        setBusyId(proposalId);
        setNotice(null);
        try {
            const res = await api.post(`/tuition/requests/${requestId}/proposals/${proposalId}/accept`);
            setRequests((prev) => prev.map((r) => (r.id === requestId ? res.data.request : r)));
            setNotice('Proposal accepted. Open the chat to plan your first class.');
        } catch (err) {
            setNotice(errorMessage(err));
        } finally {
            setBusyId(null);
        }
    };

    const close = async (requestId: number) => {
        if (!confirm('Close this requirement? Teachers will no longer see it.')) return;
        setBusyId(requestId);
        try {
            const res = await api.post(`/tuition/requests/${requestId}/close`);
            setRequests((prev) => prev.map((r) => (r.id === requestId ? res.data.request : r)));
        } catch (err) {
            setNotice(errorMessage(err));
        } finally {
            setBusyId(null);
        }
    };

    return (
        <div className="max-w-7xl mx-auto space-y-8">
            {/* Hero */}
            <div className="bg-card-bg border border-card-border rounded-2xl p-6 md:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <div className="flex items-center gap-2 text-blue-600 text-xs font-bold uppercase tracking-wide mb-2">
                        <GraduationCap className="h-4 w-4" /> Home Tuition
                    </div>
                    <h1 className="text-2xl md:text-3xl font-bold text-foreground">Find a home tutor or online tutor</h1>
                    <p className="text-sm text-foreground/60 mt-2 max-w-xl">
                        Verified teachers for BPSC, UPSC, SSC, Banking and Class 6–12. Post your requirement and compare proposals,
                        or contact a teacher directly. All communication stays on OSDHYAN chat.
                    </p>
                </div>
                <div className="flex flex-col sm:flex-row gap-3 shrink-0">
                    <button onClick={() => setShowForm(true)} className="px-5 py-3 rounded-xl bg-blue-600 text-white text-sm font-bold hover:bg-blue-700 flex items-center justify-center gap-2">
                        <Plus className="h-4 w-4" /> Post your requirement
                    </button>
                    {isTeacher ? (
                        <Link href="/teach" className="px-5 py-3 rounded-xl border border-card-border text-sm font-bold text-foreground text-center">Teacher Panel</Link>
                    ) : (
                        <Link href="/teach/register" className="px-5 py-3 rounded-xl border border-card-border text-sm font-bold text-foreground text-center">Teach on OSDHYAN</Link>
                    )}
                </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-2 border-b border-card-border">
                {([['find', 'Find a teacher'], ['mine', 'My requirements']] as [Tab, string][]).map(([key, label]) => (
                    <button
                        key={key}
                        onClick={() => setTab(key)}
                        className={cn('px-4 py-2.5 text-sm font-semibold border-b-2 -mb-px', tab === key ? 'border-blue-600 text-blue-600' : 'border-transparent text-foreground/50 hover:text-foreground')}
                    >
                        {label}
                    </button>
                ))}
            </div>

            {tab === 'find' && (
                <div className="space-y-6">
                    <form
                        onSubmit={(e) => { e.preventDefault(); setPage(1); loadTeachers(); }}
                        className="bg-card-bg border border-card-border rounded-2xl p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3"
                    >
                        <div>
                            <input list="dir-subjects" value={filters.subject} onChange={(e) => setFilters((p) => ({ ...p, subject: e.target.value }))} className={inputCls} placeholder="Subject (e.g. Mathematics)" />
                            <datalist id="dir-subjects">{SUBJECT_SUGGESTIONS.map((s) => <option key={s} value={s} />)}</datalist>
                        </div>
                        <div>
                            <input list="dir-exams" value={filters.exam} onChange={(e) => setFilters((p) => ({ ...p, exam: e.target.value }))} className={inputCls} placeholder="Exam / class" />
                            <datalist id="dir-exams">{EXAM_OPTIONS.map((s) => <option key={s} value={s} />)}</datalist>
                        </div>
                        <input value={filters.city} onChange={(e) => setFilters((p) => ({ ...p, city: e.target.value }))} className={inputCls} placeholder="City" />
                        <select value={filters.mode} onChange={(e) => setFilters((p) => ({ ...p, mode: e.target.value }))} className={inputCls}>
                            <option value="">Any mode</option>
                            <option value="home">Home visit</option>
                            <option value="online">Online</option>
                        </select>
                        <button type="submit" className="px-4 py-2.5 rounded-xl bg-gray-900 text-white text-sm font-bold flex items-center justify-center gap-2">
                            <Search className="h-4 w-4" /> Search
                        </button>
                    </form>

                    {loadingTeachers ? (
                        <div className="flex justify-center py-16"><Loader2 className="h-8 w-8 animate-spin text-blue-600" /></div>
                    ) : !teachers || teachers.data.length === 0 ? (
                        <div className="py-16 text-center bg-card-bg border border-dashed border-card-border rounded-2xl">
                            <p className="font-semibold text-foreground">No verified teachers match these filters yet.</p>
                            <p className="text-sm text-foreground/60 mt-1">Post your requirement and matching teachers will send you proposals.</p>
                            <button onClick={() => setShowForm(true)} className="mt-4 px-5 py-2.5 rounded-xl bg-blue-600 text-white text-sm font-bold">Post your requirement</button>
                        </div>
                    ) : (
                        <>
                            <p className="text-xs text-foreground/50">{teachers.total} teacher{teachers.total === 1 ? '' : 's'} found</p>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                                {teachers.data.map((t) => <TeacherCard key={t.id} teacher={t} />)}
                            </div>
                            {teachers.last_page > 1 && (
                                <div className="flex items-center justify-center gap-3">
                                    <button disabled={page <= 1} onClick={() => setPage((p) => p - 1)} className="px-4 py-2 rounded-xl border border-card-border text-sm disabled:opacity-40">Previous</button>
                                    <span className="text-sm text-foreground/60">Page {teachers.current_page} of {teachers.last_page}</span>
                                    <button disabled={page >= teachers.last_page} onClick={() => setPage((p) => p + 1)} className="px-4 py-2 rounded-xl border border-card-border text-sm disabled:opacity-40">Next</button>
                                </div>
                            )}
                        </>
                    )}
                </div>
            )}

            {tab === 'mine' && (
                <div className="space-y-4">
                    {notice && <div className="rounded-xl bg-blue-50 text-blue-800 text-sm px-4 py-3">{notice}</div>}
                    {loadingRequests ? (
                        <div className="flex justify-center py-16"><Loader2 className="h-8 w-8 animate-spin text-blue-600" /></div>
                    ) : requests.length === 0 ? (
                        <div className="py-16 text-center bg-card-bg border border-dashed border-card-border rounded-2xl">
                            <p className="font-semibold text-foreground">You have not posted any requirement yet.</p>
                            <button onClick={() => setShowForm(true)} className="mt-4 px-5 py-2.5 rounded-xl bg-blue-600 text-white text-sm font-bold">Post your requirement</button>
                        </div>
                    ) : (
                        requests.map((r) => (
                            <div key={r.id} className="bg-card-bg border border-card-border rounded-2xl p-5 space-y-4">
                                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                                    <div>
                                        <div className="flex items-center gap-2 flex-wrap">
                                            <h3 className="font-bold text-foreground">{r.subject}{r.exam ? ` · ${r.exam}` : ''}</h3>
                                            {statusBadge(r.status)}
                                            {r.type === 'direct' && <span className="text-[11px] text-foreground/50">Direct contact</span>}
                                        </div>
                                        <p className="text-sm text-foreground/60 mt-1">
                                            {MODE_LABELS[r.mode]}{r.city ? ` · ${r.city}` : ''}{r.area ? `, ${r.area}` : ''}
                                            {r.budget_per_hour ? ` · Budget ${formatINR(r.budget_per_hour)}/hr` : ''}
                                            {r.preferred_timing ? ` · ${r.preferred_timing}` : ''}
                                        </p>
                                        {r.description && <p className="text-sm text-foreground/70 mt-2">{r.description}</p>}
                                    </div>
                                    <div className="flex gap-2 shrink-0">
                                        {r.conversation_id && (
                                            <Link href={`/dashboard/messages?c=${r.conversation_id}`} className="px-4 py-2 rounded-xl bg-blue-600 text-white text-xs font-bold flex items-center gap-1.5">
                                                <MessageSquare className="h-3.5 w-3.5" /> Chat
                                            </Link>
                                        )}
                                        {r.status === 'open' && (
                                            <button disabled={busyId === r.id} onClick={() => close(r.id)} className="px-4 py-2 rounded-xl border border-card-border text-xs font-bold text-foreground/70">Close</button>
                                        )}
                                    </div>
                                </div>

                                {r.selected_teacher && (
                                    <div className="flex items-center gap-3 rounded-xl bg-green-50 dark:bg-green-900/20 px-4 py-3">
                                        <TeacherAvatar name={r.selected_teacher.name} avatar={r.selected_teacher.avatar} size={36} />
                                        <div className="text-sm">
                                            <p className="font-semibold text-foreground">Matched with {r.selected_teacher.name}</p>
                                            <p className="text-foreground/60 text-xs">Agree on timing and fee in chat.</p>
                                        </div>
                                    </div>
                                )}

                                {r.type === 'requirement' && (
                                    <div>
                                        <p className="text-xs font-bold uppercase text-foreground/50 mb-2">Proposals ({r.proposals_count})</p>
                                        {r.proposals.length === 0 ? (
                                            <p className="text-sm text-foreground/50">No proposals yet. Verified teachers in {r.city || 'your area'} who teach {r.subject} will be notified.</p>
                                        ) : (
                                            <div className="space-y-3">
                                                {r.proposals.map((p) => (
                                                    <div key={p.id} className={cn('rounded-xl border border-card-border p-4 flex flex-col sm:flex-row gap-3 sm:items-start', p.status === 'rejected' && 'opacity-60')}>
                                                        <TeacherAvatar name={p.teacher_name} avatar={p.teacher_avatar} size={40} />
                                                        <div className="flex-1 min-w-0">
                                                            <div className="flex items-center gap-2 flex-wrap">
                                                                <span className="font-semibold text-foreground">{p.teacher_name}</span>
                                                                {statusBadge(p.status)}
                                                                <span className="text-sm font-bold text-foreground">{formatINR(p.fee_per_hour)}/hr</span>
                                                                {p.teacher_experience_years !== null && <span className="text-xs text-foreground/50">{p.teacher_experience_years} yr exp</span>}
                                                            </div>
                                                            {p.teacher_headline && <p className="text-xs text-foreground/60">{p.teacher_headline}</p>}
                                                            <p className="text-sm text-foreground/80 mt-2 whitespace-pre-wrap">{p.message}</p>
                                                        </div>
                                                        <div className="flex gap-2 shrink-0">
                                                            {p.teacher_profile_id && (
                                                                <Link href={`/dashboard/tuition/teachers/${p.teacher_profile_id}`} className="px-3 py-2 rounded-xl border border-card-border text-xs font-bold text-foreground/70">Profile</Link>
                                                            )}
                                                            {r.status === 'open' && p.status === 'pending' && (
                                                                <button disabled={busyId === p.id} onClick={() => accept(r.id, p.id)} className="px-4 py-2 rounded-xl bg-green-600 text-white text-xs font-bold hover:bg-green-700 disabled:opacity-60">
                                                                    {busyId === p.id ? 'Accepting…' : 'Accept'}
                                                                </button>
                                                            )}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        ))
                    )}
                </div>
            )}

            {showForm && (
                <RequirementForm
                    onClose={() => setShowForm(false)}
                    onCreated={(r) => {
                        setShowForm(false);
                        setRequests((prev) => [r, ...prev]);
                        setTab('mine');
                        setNotice('Requirement posted. Matching teachers will send you proposals here.');
                    }}
                />
            )}
        </div>
    );
}

export default function TuitionPage() {
    return (
        <Suspense fallback={<div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-blue-600" /></div>}>
            <TuitionInner />
        </Suspense>
    );
}
