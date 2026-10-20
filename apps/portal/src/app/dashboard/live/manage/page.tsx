'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
    ArrowLeft, Check, Copy, GraduationCap, Link2, Loader2, Pencil, Plus, Radio,
    Square, Trash2, Users, Video, Youtube, X, Film, Info, ExternalLink,
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import api from '@/lib/api';
import { cn } from '@/lib/utils';
import { useAuth } from '@/components/providers/AuthProvider';
import { loginUrlWithRedirect } from '@/lib/redirect';
import StatusBadge from '@/components/live/StatusBadge';
import { apiErrorMessage, canTeach, copyText, formatWhen, isoToLocalInput, localInputToIso } from '@/components/live/format';
import type { LiveProviderKey, OwnedLiveClass, ProviderInfo } from '@/components/live/types';

type FormState = {
    title: string;
    description: string;
    subject: string;
    exam: string;
    provider: LiveProviderKey;
    scheduled_at: string; // datetime-local
    duration_min: string;
    max_participants: string;
    youtube_url: string;
};

const emptyForm = (provider: LiveProviderKey = 'youtube'): FormState => ({
    title: '', description: '', subject: '', exam: '', provider,
    scheduled_at: isoToLocalInput(new Date(Date.now() + 60 * 60 * 1000).toISOString()),
    duration_min: '60', max_participants: '0', youtube_url: '',
});

export default function ManageLiveClassesPage() {
    const { user, loading: authLoading } = useAuth();
    const router = useRouter();
    const [classes, setClasses] = useState<OwnedLiveClass[]>([]);
    const [providers, setProviders] = useState<ProviderInfo | null>(null);
    const [loading, setLoading] = useState(true);
    const [editing, setEditing] = useState<OwnedLiveClass | 'new' | null>(null);
    const [recordingFor, setRecordingFor] = useState<OwnedLiveClass | null>(null);
    const [busyId, setBusyId] = useState<number | null>(null);

    const isTeacher = canTeach(user);

    const load = useCallback(async () => {
        try {
            const res = await api.get('/live-classes/my/classes');
            setClasses(res.data.classes ?? []);
            setProviders(res.data.providers ?? null);
        } catch (e) {
            toast.error(apiErrorMessage(e, 'Could not load your classes'));
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        if (authLoading) return;
        if (!user) {
            router.replace(loginUrlWithRedirect('/dashboard/live/manage'));
            return;
        }
        if (!isTeacher) {
            // handled by the "become a teacher" view below
            return;
        }
        load();
    }, [authLoading, user, isTeacher, router, load]);

    const act = async (cls: OwnedLiveClass, action: 'go-live' | 'end' | 'delete') => {
        if (busyId) return;
        if (action === 'end' && !confirm(`End "${cls.title}" for everyone?\n\nThe video, chat and polls close for all students. This cannot be undone.`)) return;
        if (action === 'delete' && !confirm(`Delete "${cls.title}"? This cannot be undone.`)) return;
        setBusyId(cls.id);
        try {
            if (action === 'delete') {
                await api.delete(`/live-classes/${cls.id}`);
                setClasses(prev => prev.filter(c => c.id !== cls.id));
                toast.success('Class deleted');
            } else {
                const res = await api.post(`/live-classes/${cls.id}/${action}`);
                const updated: OwnedLiveClass = res.data.class;
                setClasses(prev => prev.map(c => (c.id === updated.id ? updated : c)));
                if (action === 'go-live') {
                    toast.success('Class started. Opening the classroom…');
                    router.push(`/dashboard/live/${cls.id}?autojoin=1`);
                } else {
                    toast.success('Class ended');
                    setRecordingFor(updated);
                }
            }
        } catch (e) {
            toast.error(apiErrorMessage(e, 'Action failed'));
        } finally {
            setBusyId(null);
        }
    };

    const copyLink = async (cls: OwnedLiveClass) => {
        const link = `${window.location.origin}/dashboard/live/${cls.id}`;
        if (await copyText(link)) toast.success('Student link copied');
        else toast.error('Copy failed');
    };

    if (authLoading || (isTeacher && loading)) {
        return (
            <div className="flex items-center justify-center h-64">
                <Loader2 className="h-6 w-6 animate-spin text-red-500" />
            </div>
        );
    }

    if (user && !isTeacher) {
        return (
            <div className="max-w-xl mx-auto py-16 px-4 text-center space-y-5">
                <div className="h-16 w-16 rounded-3xl bg-red-500/10 flex items-center justify-center mx-auto">
                    <GraduationCap className="h-8 w-8 text-red-500" />
                </div>
                <h1 className="text-2xl font-black text-foreground tracking-tight">Teach live on OSDHYAN</h1>
                <p className="text-sm text-foreground/60">
                    This panel is for teachers. Register as a teacher to schedule interactive classes, run polls, and reach students across India.
                </p>
                <div className="flex items-center justify-center gap-3">
                    <Link href="/teach/register" className="px-6 py-3 rounded-2xl bg-red-500 hover:bg-red-400 text-white text-[10px] font-black uppercase tracking-widest">Become a teacher</Link>
                    <Link href="/dashboard/live" className="px-6 py-3 rounded-2xl border border-card-border text-[10px] font-black uppercase tracking-widest text-foreground/60 hover:text-foreground">Browse classes</Link>
                </div>
            </div>
        );
    }

    const liveCount = classes.filter(c => c.status === 'live').length;

    return (
        <div className="max-w-5xl mx-auto space-y-8 pb-16 px-4 md:px-0 animate-in fade-in duration-500">
            <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <Link href="/dashboard/live" className="p-2 rounded-xl hover:bg-card-bg border border-transparent hover:border-card-border transition-all text-foreground/40 hover:text-foreground" aria-label="Back">
                        <ArrowLeft className="h-4 w-4" />
                    </Link>
                    <div>
                        <h1 className="text-2xl font-black text-foreground tracking-tight">Teacher panel</h1>
                        <p className="text-[10px] font-black text-foreground/40 uppercase tracking-widest">{classes.length} classes · {liveCount} live</p>
                    </div>
                </div>
                <button onClick={() => setEditing('new')} className="flex items-center gap-2 px-5 py-3 bg-red-500 hover:bg-red-400 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all shadow-lg shadow-red-500/20">
                    <Plus className="h-3.5 w-3.5" /> Schedule class
                </button>
            </div>

            {/* Provider explainer */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-card-bg border border-card-border rounded-[1.5rem] p-5 flex gap-4">
                    <div className="h-11 w-11 rounded-2xl bg-blue-500/10 flex items-center justify-center shrink-0"><Video className="h-5 w-5 text-blue-500" /></div>
                    <div>
                        <p className="text-sm font-black text-foreground">{providers?.jitsi.label ?? 'Small interactive class (Jitsi video call)'}</p>
                        <p className="text-xs text-foreground/60 mt-1">{providers?.jitsi.recommended ?? 'Best for up to ~50 students. Teacher and students can talk, share camera and screen.'}</p>
                        {providers?.jitsi.warning && <p className="text-xs text-amber-600 mt-2">{providers.jitsi.warning}</p>}
                    </div>
                </div>
                <div className="bg-card-bg border border-card-border rounded-[1.5rem] p-5 flex gap-4">
                    <div className="h-11 w-11 rounded-2xl bg-red-500/10 flex items-center justify-center shrink-0"><Youtube className="h-5 w-5 text-red-500" /></div>
                    <div>
                        <p className="text-sm font-black text-foreground">{providers?.youtube.label ?? 'Big class (YouTube Live + OSDHYAN chat)'} {providers?.default === 'youtube' && <span className="ml-1 text-[10px] font-bold text-emerald-600 bg-emerald-500/10 px-2 py-0.5 rounded-full align-middle">Recommended</span>}</p>
                        <p className="text-xs text-foreground/60 mt-1">{providers?.youtube.recommended ?? 'Best for 50 to 5,000+ students. You stream on YouTube; students watch here and ask questions in our chat.'}</p>
                    </div>
                </div>
            </div>

            {classes.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 gap-4 bg-card-bg border border-dashed border-card-border rounded-[2.5rem]">
                    <Video className="h-10 w-10 text-foreground/10" />
                    <p className="text-xs font-bold text-foreground/40">You have not scheduled a class yet.</p>
                    <button onClick={() => setEditing('new')} className="flex items-center gap-2 px-6 py-3 bg-red-500 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-red-400">
                        <Plus className="h-3.5 w-3.5" /> Schedule your first class
                    </button>
                </div>
            ) : (
                <div className="space-y-3">
                    {classes.map(cls => (
                        <div key={cls.id} className={cn('bg-card-bg border rounded-[1.5rem] p-5 flex flex-col md:flex-row md:items-center gap-4', cls.status === 'live' ? 'border-red-500/30' : 'border-card-border')}>
                            <div className={cn('h-12 w-12 rounded-2xl flex items-center justify-center shrink-0', cls.status === 'live' ? 'bg-red-500/10' : 'bg-foreground/5')}>
                                {cls.provider === 'youtube' ? <Youtube className={cn('h-5 w-5', cls.status === 'live' ? 'text-red-500' : 'text-foreground/40')} /> : <Video className={cn('h-5 w-5', cls.status === 'live' ? 'text-red-500' : 'text-foreground/40')} />}
                            </div>

                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 flex-wrap mb-1">
                                    <StatusBadge status={cls.status} />
                                    {cls.subject && <span className="text-[9px] font-black text-foreground/40 uppercase tracking-widest">{cls.subject}</span>}
                                    <span className="text-[9px] font-black text-foreground/40 uppercase tracking-widest">{cls.provider === 'youtube' ? 'YouTube Live' : 'Jitsi'}</span>
                                </div>
                                <h3 className="text-sm font-black text-foreground truncate">{cls.title}</h3>
                                <div className="flex items-center gap-3 mt-1 text-[10px] font-bold text-foreground/40 flex-wrap">
                                    <span className="flex items-center gap-1"><Users className="h-3 w-3" /> {cls.participants_count}{cls.max_participants ? `/${cls.max_participants}` : ''}</span>
                                    <span>{cls.status === 'ended' ? `Ended ${formatWhen(cls.ended_at)}` : formatWhen(cls.scheduled_at)}</span>
                                    {cls.duration_min ? <span>{cls.duration_min} min</span> : null}
                                    {cls.status === 'ended' && (
                                        cls.recording_url
                                            ? <a href={cls.recording_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-indigo-500 hover:text-indigo-400"><Film className="h-3 w-3" /> Recording <ExternalLink className="h-2.5 w-2.5" /></a>
                                            : <span className="text-amber-600">No recording yet</span>
                                    )}
                                </div>
                            </div>

                            <div className="flex items-center gap-2 flex-wrap md:justify-end">
                                {cls.status === 'scheduled' && (
                                    <button onClick={() => act(cls, 'go-live')} disabled={busyId === cls.id} className="flex items-center gap-1.5 px-4 py-2.5 rounded-2xl bg-red-500 hover:bg-red-400 text-white text-[9px] font-black uppercase tracking-widest disabled:opacity-50">
                                        <Radio className="h-3 w-3" /> Start class
                                    </button>
                                )}
                                {cls.status === 'live' && (
                                    <>
                                        <Link href={`/dashboard/live/${cls.id}`} className="flex items-center gap-1.5 px-4 py-2.5 rounded-2xl bg-red-500 hover:bg-red-400 text-white text-[9px] font-black uppercase tracking-widest">
                                            <Radio className="h-3 w-3" /> Open classroom
                                        </Link>
                                        <button onClick={() => act(cls, 'end')} disabled={busyId === cls.id} className="flex items-center gap-1.5 px-4 py-2.5 rounded-2xl bg-foreground/5 hover:bg-foreground/10 text-foreground text-[9px] font-black uppercase tracking-widest disabled:opacity-50">
                                            <Square className="h-3 w-3" /> End class
                                        </button>
                                    </>
                                )}
                                {cls.status === 'ended' && (
                                    <button onClick={() => setRecordingFor(cls)} className="flex items-center gap-1.5 px-4 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white text-[9px] font-black uppercase tracking-widest">
                                        <Film className="h-3 w-3" /> {cls.recording_url ? 'Change recording' : 'Add recording'}
                                    </button>
                                )}
                                <IconButton title="Copy the link for students" onClick={() => copyLink(cls)}><Link2 className="h-3.5 w-3.5" /></IconButton>
                                {cls.status !== 'ended' && (
                                    <IconButton title="Edit" onClick={() => setEditing(cls)}><Pencil className="h-3.5 w-3.5" /></IconButton>
                                )}
                                {cls.status !== 'live' && (
                                    <IconButton title="Delete" danger onClick={() => act(cls, 'delete')}><Trash2 className="h-3.5 w-3.5" /></IconButton>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {editing && (
                <ScheduleModal
                    existing={editing === 'new' ? null : editing}
                    providers={providers}
                    onClose={() => setEditing(null)}
                    onSaved={saved => {
                        setClasses(prev => {
                            const i = prev.findIndex(c => c.id === saved.id);
                            return i === -1 ? [saved, ...prev] : prev.map(c => (c.id === saved.id ? saved : c));
                        });
                        setEditing(null);
                    }}
                />
            )}

            {recordingFor && (
                <RecordingModal
                    cls={recordingFor}
                    onClose={() => setRecordingFor(null)}
                    onSaved={saved => {
                        setClasses(prev => prev.map(c => (c.id === saved.id ? saved : c)));
                        setRecordingFor(null);
                    }}
                />
            )}
        </div>
    );
}

function IconButton({ title, onClick, danger, children }: { title: string; onClick: () => void; danger?: boolean; children: React.ReactNode }) {
    return (
        <button
            title={title}
            aria-label={title}
            onClick={onClick}
            className={cn('h-9 w-9 rounded-2xl flex items-center justify-center transition-all', danger ? 'bg-red-500/10 text-red-500 hover:bg-red-500/20' : 'bg-foreground/5 text-foreground/70 hover:bg-foreground/10 hover:text-foreground')}
        >
            {children}
        </button>
    );
}

function Field({ label, children, hint }: { label: string; children: React.ReactNode; hint?: string }) {
    return (
        <div>
            <label className="text-[10px] font-black text-foreground/50 uppercase tracking-widest block mb-1.5">{label}</label>
            {children}
            {hint && <p className="text-[10px] text-foreground/40 mt-1">{hint}</p>}
        </div>
    );
}

const inputCls = 'w-full bg-background border border-card-border rounded-xl px-3 py-2.5 text-sm text-foreground placeholder:text-foreground/30 focus:outline-none focus:ring-2 focus:ring-red-500/20';

function ScheduleModal({ existing, providers, onClose, onSaved }: {
    existing: OwnedLiveClass | null;
    providers: ProviderInfo | null;
    onClose: () => void;
    onSaved: (cls: OwnedLiveClass) => void;
}) {
    const [form, setForm] = useState<FormState>(() => existing ? {
        title: existing.title,
        description: existing.description ?? '',
        subject: existing.subject ?? '',
        exam: existing.exam ?? '',
        provider: existing.provider,
        scheduled_at: isoToLocalInput(existing.scheduled_at),
        duration_min: existing.duration_min ? String(existing.duration_min) : '',
        max_participants: String(existing.max_participants ?? 0),
        youtube_url: existing.youtube_video_id ? `https://www.youtube.com/watch?v=${existing.youtube_video_id}` : '',
    } : emptyForm(providers?.default ?? 'youtube'));
    const [saving, setSaving] = useState(false);
    const set = <K extends keyof FormState>(k: K, v: FormState[K]) => setForm(f => ({ ...f, [k]: v }));

    const valid = form.title.trim() && form.scheduled_at && (form.provider !== 'youtube' || form.youtube_url.trim());

    const submit = async () => {
        if (!valid || saving) return;
        setSaving(true);
        try {
            const payload = {
                title: form.title.trim(),
                description: form.description.trim() || null,
                subject: form.subject.trim() || null,
                exam: form.exam.trim() || null,
                provider: form.provider,
                scheduled_at: localInputToIso(form.scheduled_at),
                duration_min: form.duration_min ? Number(form.duration_min) : null,
                max_participants: form.max_participants ? Number(form.max_participants) : 0,
                youtube_url: form.provider === 'youtube' ? form.youtube_url.trim() : null,
            };
            const res = existing
                ? await api.patch(`/live-classes/${existing.id}`, payload)
                : await api.post('/live-classes', payload);
            toast.success(existing ? 'Class updated' : 'Class scheduled');
            onSaved(res.data.class);
        } catch (e) {
            toast.error(apiErrorMessage(e, 'Could not save class'));
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[500] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-950/70 backdrop-blur-sm" onClick={onClose} />
            <div className="relative z-10 w-full max-w-2xl max-h-[92vh] overflow-y-auto bg-card-bg border border-card-border rounded-[1.75rem] p-6 md:p-8 shadow-2xl space-y-5">
                <div className="flex items-start justify-between">
                    <div>
                        <h2 className="text-xl font-black text-foreground tracking-tight">{existing ? 'Edit class' : 'Schedule a live class'}</h2>
                        <p className="text-[10px] font-bold text-foreground/40 uppercase tracking-widest mt-1">Students see it under &ldquo;Upcoming&rdquo; right away. You start it later with &ldquo;Start class&rdquo;.</p>
                    </div>
                    <button onClick={onClose} className="p-2 rounded-xl hover:bg-foreground/5 text-foreground/50" aria-label="Close"><X className="h-4 w-4" /></button>
                </div>

                {/* Provider */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {(['jitsi', 'youtube'] as LiveProviderKey[]).map(p => {
                        const info = providers?.[p];
                        const active = form.provider === p;
                        const disabled = !!existing && existing.status === 'live' && !active;
                        return (
                            <button
                                key={p}
                                type="button"
                                disabled={disabled}
                                onClick={() => set('provider', p)}
                                className={cn('text-left rounded-2xl border p-4 transition-all disabled:opacity-40', active ? 'border-red-500/50 bg-red-500/5 ring-2 ring-red-500/20' : 'border-card-border hover:border-foreground/20')}
                            >
                                <div className="flex items-center gap-2">
                                    {p === 'youtube' ? <Youtube className="h-4 w-4 text-red-500" /> : <Video className="h-4 w-4 text-blue-500" />}
                                    <span className="text-sm font-black text-foreground">{info?.label ?? (p === 'youtube' ? 'Big class (YouTube Live)' : 'Small interactive class (Jitsi)')}</span>
                                    {active && <Check className="h-4 w-4 text-red-500 ml-auto" />}
                                </div>
                                <p className="text-[11px] text-foreground/60 mt-1.5">
                                    {info?.recommended ?? (p === 'youtube'
                                        ? 'Best for big batches. You stream on YouTube; chat and polls stay in OSDHYAN.'
                                        : 'Best for up to ~50 students. Talk, camera and screen share.')}
                                    {providers?.default === p && <span className="block mt-1 text-[10px] font-bold text-emerald-600">Recommended</span>}
                                </p>
                            </button>
                        );
                    })}
                </div>

                {form.provider === 'youtube' && (
                    <div className="space-y-3">
                        <div className="flex gap-3 bg-amber-500/10 border border-amber-500/20 rounded-2xl p-4 text-xs text-foreground/80">
                            <Info className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
                            <div className="space-y-1">
                                <p className="font-bold">How to get the YouTube link (one-time: turn on live streaming for your channel; YouTube can take up to 24 hours):</p>
                                <ol className="list-decimal ml-4 space-y-0.5">
                                    <li>Open <strong>YouTube Studio &rarr; Create &rarr; Go live</strong> (or use OBS).</li>
                                    <li>Set visibility to <strong>Unlisted</strong> and keep <strong>&ldquo;Allow embedding&rdquo;</strong> on.</li>
                                    <li>Copy the share link (looks like youtube.com/live/&hellip; or youtu.be/&hellip;) and paste it below.</li>
                                    <li>At class time press <strong>Go live</strong> in YouTube, then <strong>Start class</strong> here.</li>
                                </ol>
                                <p>Students watch inside OSDHYAN and ask questions in our chat. Turn off YouTube&rsquo;s own live chat so all questions come to one place.</p>
                            </div>
                        </div>
                        <Field label="YouTube live link *" hint="e.g. https://youtube.com/live/abc123 or https://youtu.be/abc123">
                            <input value={form.youtube_url} onChange={e => set('youtube_url', e.target.value)} placeholder="https://youtube.com/live/…" className={inputCls} />
                        </Field>
                    </div>
                )}
                {form.provider === 'jitsi' && (
                    <div className={cn('flex gap-3 rounded-2xl p-4 text-xs text-foreground/80 border', providers?.jitsi.warning ? 'bg-amber-500/10 border-amber-500/20' : 'bg-blue-500/10 border-blue-500/20')}>
                        <Info className={cn('h-4 w-4 shrink-0 mt-0.5', providers?.jitsi.warning ? 'text-amber-600' : 'text-blue-500')} />
                        <p>
                            A private video room with a password is created when you press <strong>Start class</strong>. Nothing to install.
                            {providers?.jitsi.warning ? <> {providers.jitsi.warning}</> : null}
                        </p>
                    </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                        <Field label="Title *">
                            <input autoFocus value={form.title} onChange={e => set('title', e.target.value.slice(0, 160))} placeholder="e.g. Modern History — Revolt of 1857 in 60 min" className={inputCls} />
                        </Field>
                    </div>
                    <Field label="Subject">
                        <input value={form.subject} onChange={e => set('subject', e.target.value.slice(0, 80))} placeholder="e.g. History" className={inputCls} />
                    </Field>
                    <Field label="Exam">
                        <input value={form.exam} onChange={e => set('exam', e.target.value.slice(0, 50))} placeholder="e.g. BPSC, UPSC, SSC" className={inputCls} />
                    </Field>
                    <Field label="Date & time *">
                        <input type="datetime-local" value={form.scheduled_at} onChange={e => set('scheduled_at', e.target.value)} className={inputCls} />
                    </Field>
                    <div className="grid grid-cols-2 gap-3">
                        <Field label="Duration (min)">
                            <input type="number" min={5} max={600} value={form.duration_min} onChange={e => set('duration_min', e.target.value)} className={inputCls} />
                        </Field>
                        <Field label="Max students" hint="0 = no limit">
                            <input type="number" min={0} value={form.max_participants} onChange={e => set('max_participants', e.target.value)} className={inputCls} />
                        </Field>
                    </div>
                    <div className="md:col-span-2">
                        <Field label="Description">
                            <textarea rows={3} value={form.description} onChange={e => set('description', e.target.value.slice(0, 5000))} placeholder="What will students learn? Any pre-reads?" className={cn(inputCls, 'resize-none')} />
                        </Field>
                    </div>
                </div>

                <div className="flex gap-3 pt-1">
                    <button onClick={onClose} className="flex-1 py-3 border border-card-border rounded-2xl text-[10px] font-black uppercase tracking-widest text-foreground/50 hover:text-foreground">Cancel</button>
                    <button onClick={submit} disabled={!valid || saving} className="flex-1 py-3 bg-red-500 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-red-400 disabled:opacity-40">
                        {saving ? 'Saving…' : existing ? 'Save changes' : 'Schedule'}
                    </button>
                </div>
            </div>
        </div>
    );
}

function RecordingModal({ cls, onClose, onSaved }: { cls: OwnedLiveClass; onClose: () => void; onSaved: (cls: OwnedLiveClass) => void }) {
    const [url, setUrl] = useState(cls.recording_url ?? '');
    const [saving, setSaving] = useState(false);
    const valid = /^https?:\/\/\S+$/i.test(url.trim());

    const submit = async () => {
        if (!valid || saving) return;
        setSaving(true);
        try {
            const res = await api.post(`/live-classes/${cls.id}/recording`, { recording_url: url.trim() });
            toast.success('Recording saved — students can watch it now');
            onSaved(res.data.class);
        } catch (e) {
            toast.error(apiErrorMessage(e, 'Could not save recording'));
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
                        <h3 className="text-lg font-black text-foreground tracking-tight">Recording</h3>
                        <p className="text-[10px] font-bold uppercase tracking-widest text-foreground/40 truncate max-w-[280px]">{cls.title}</p>
                    </div>
                    <button onClick={onClose} className="p-2 rounded-xl hover:bg-foreground/5 text-foreground/50" aria-label="Close"><X className="h-4 w-4" /></button>
                </div>
                <p className="text-xs text-foreground/60">Paste a YouTube link (plays inline) or a direct .mp4 URL. Students will find it under &ldquo;Recordings&rdquo;.</p>
                <input autoFocus value={url} onChange={e => setUrl(e.target.value)} placeholder="https://youtu.be/…" className={inputCls} />
                <div className="flex gap-2">
                    <button onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-card-border text-[10px] font-black uppercase tracking-widest text-foreground/60 hover:text-foreground">Later</button>
                    <button onClick={submit} disabled={!valid || saving} className="flex-1 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-[10px] font-black uppercase tracking-widest disabled:opacity-40 flex items-center justify-center gap-1.5">
                        {saving ? 'Saving…' : <><Copy className="h-3 w-3" /> Save recording</>}
                    </button>
                </div>
            </div>
        </div>
    );
}
