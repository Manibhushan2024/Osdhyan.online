'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, BadgeCheck, Briefcase, Clock, GraduationCap, Languages, Loader2, MapPin, MessageSquare } from 'lucide-react';
import api from '@/lib/api';
import { useAuth } from '@/components/providers/AuthProvider';
import { TeacherAvatar } from '@/components/tuition/TeacherCard';
import { MODE_LABELS, TeacherPublic, errorMessage, formatINR } from '@/components/tuition/types';

export default function TeacherProfilePage() {
    const { id } = useParams<{ id: string }>();
    const router = useRouter();
    const { user } = useAuth();

    const [teacher, setTeacher] = useState<TeacherPublic | null>(null);
    const [conversationId, setConversationId] = useState<number | null>(null);
    const [loading, setLoading] = useState(true);
    const [notFound, setNotFound] = useState(false);
    const [showContact, setShowContact] = useState(false);
    const [message, setMessage] = useState('');
    const [sending, setSending] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        let cancelled = false;
        (async () => {
            try {
                const res = await api.get(`/tuition/teachers/${id}`);
                if (cancelled) return;
                setTeacher(res.data.teacher);
                setConversationId(res.data.conversation_id ?? null);
            } catch {
                if (!cancelled) setNotFound(true);
            } finally {
                if (!cancelled) setLoading(false);
            }
        })();
        return () => { cancelled = true; };
    }, [id]);

    const contact = async (e?: React.FormEvent) => {
        e?.preventDefault();
        setSending(true);
        setError(null);
        try {
            const res = await api.post(`/tuition/teachers/${id}/contact`, { message: message.trim() || null });
            router.push(`/dashboard/messages?c=${res.data.conversation_id}`);
        } catch (err) {
            setError(errorMessage(err));
            setSending(false);
        }
    };

    if (loading) {
        return <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-blue-600" /></div>;
    }

    if (notFound || !teacher) {
        return (
            <div className="max-w-2xl mx-auto text-center py-20 space-y-4">
                <p className="font-semibold text-foreground">This teacher profile is not available.</p>
                <p className="text-sm text-foreground/60">It may be pending verification or the teacher is not accepting students right now.</p>
                <Link href="/dashboard/tuition" className="inline-block px-5 py-2.5 rounded-xl bg-blue-600 text-white text-sm font-bold">Back to teachers</Link>
            </div>
        );
    }

    const isSelf = user?.id === teacher.user_id;

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <Link href="/dashboard/tuition" className="inline-flex items-center gap-1.5 text-sm text-foreground/60 hover:text-foreground">
                <ArrowLeft className="h-4 w-4" /> All teachers
            </Link>

            <div className="bg-card-bg border border-card-border rounded-2xl p-6 md:p-8">
                <div className="flex flex-col md:flex-row gap-6 md:items-start">
                    <TeacherAvatar name={teacher.name} avatar={teacher.avatar} size={88} />
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                            <h1 className="text-2xl font-bold text-foreground">{teacher.name}</h1>
                            {teacher.is_verified && (
                                <span className="inline-flex items-center gap-1 text-xs font-semibold text-green-700 bg-green-50 px-2 py-0.5 rounded-md">
                                    <BadgeCheck className="h-3.5 w-3.5" /> Verified by OSDHYAN
                                </span>
                            )}
                        </div>
                        <p className="text-foreground/70 mt-1">{teacher.headline || 'Tutor'}</p>
                        <div className="flex flex-wrap gap-4 mt-3 text-sm text-foreground/70">
                            <span className="flex items-center gap-1.5"><MapPin className="h-4 w-4" /> {teacher.city || 'Online'}{teacher.areas.length ? ` · ${teacher.areas.join(', ')}` : ''}</span>
                            <span className="flex items-center gap-1.5"><Briefcase className="h-4 w-4" /> {teacher.experience_years} years experience</span>
                            <span className="flex items-center gap-1.5"><GraduationCap className="h-4 w-4" /> {MODE_LABELS[teacher.teaching_mode]}</span>
                        </div>
                    </div>
                    <div className="md:text-right shrink-0">
                        <p className="text-3xl font-bold text-foreground">{formatINR(teacher.fee_per_hour)}<span className="text-sm text-foreground/50 font-normal"> / hour</span></p>
                        {!isSelf && (
                            conversationId ? (
                                <Link href={`/dashboard/messages?c=${conversationId}`} className="mt-3 inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-blue-600 text-white text-sm font-bold hover:bg-blue-700">
                                    <MessageSquare className="h-4 w-4" /> Open chat
                                </Link>
                            ) : (
                                <button onClick={() => setShowContact(true)} className="mt-3 inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-blue-600 text-white text-sm font-bold hover:bg-blue-700">
                                    <MessageSquare className="h-4 w-4" /> Contact teacher
                                </button>
                            )
                        )}
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-2 space-y-6">
                    <section className="bg-card-bg border border-card-border rounded-2xl p-6">
                        <h2 className="font-bold text-foreground mb-3">About</h2>
                        <p className="text-sm text-foreground/80 whitespace-pre-wrap">{teacher.bio || 'No description provided yet.'}</p>
                    </section>
                    <section className="bg-card-bg border border-card-border rounded-2xl p-6 space-y-4">
                        <div>
                            <h2 className="font-bold text-foreground mb-2">Subjects</h2>
                            <div className="flex flex-wrap gap-1.5">
                                {teacher.subjects.map((s) => <span key={s} className="text-xs font-semibold bg-blue-50 text-blue-700 px-2.5 py-1 rounded-md">{s}</span>)}
                            </div>
                        </div>
                        {teacher.exams.length > 0 && (
                            <div>
                                <h2 className="font-bold text-foreground mb-2">Exams and classes</h2>
                                <div className="flex flex-wrap gap-1.5">
                                    {teacher.exams.map((e) => <span key={e} className="text-xs font-semibold bg-amber-50 text-amber-700 px-2.5 py-1 rounded-md">{e}</span>)}
                                </div>
                            </div>
                        )}
                    </section>
                </div>
                <aside className="space-y-6">
                    <section className="bg-card-bg border border-card-border rounded-2xl p-6 space-y-3 text-sm">
                        <h2 className="font-bold text-foreground">Details</h2>
                        {teacher.qualifications && <p className="flex items-start gap-2 text-foreground/80"><GraduationCap className="h-4 w-4 mt-0.5 shrink-0" /> {teacher.qualifications}</p>}
                        {teacher.languages.length > 0 && <p className="flex items-start gap-2 text-foreground/80"><Languages className="h-4 w-4 mt-0.5 shrink-0" /> {teacher.languages.join(', ')}</p>}
                        {teacher.availability && <p className="flex items-start gap-2 text-foreground/80"><Clock className="h-4 w-4 mt-0.5 shrink-0" /> {teacher.availability}</p>}
                    </section>
                    <section className="rounded-2xl border border-dashed border-card-border p-5 text-xs text-foreground/60">
                        Contact details are not shared. Message the teacher here, agree on a trial class, and keep all communication on OSDHYAN.
                    </section>
                </aside>
            </div>

            {showContact && (
                <div className="fixed inset-0 z-50 bg-gray-900/60 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-card-bg border border-card-border rounded-2xl w-full max-w-md p-6">
                        <h2 className="text-lg font-bold text-foreground">Message {teacher.name}</h2>
                        <p className="text-sm text-foreground/60 mt-1">This opens a chat. Mention the subject, class or exam, and your preferred timing.</p>
                        <form onSubmit={contact} className="mt-4 space-y-3">
                            <textarea
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                maxLength={2000}
                                rows={4}
                                className="w-full bg-background border border-card-border rounded-xl px-3 py-2.5 text-sm text-foreground outline-none focus:border-blue-500"
                                placeholder={`Hello ${teacher.name?.split(' ')[0] || ''}, I am looking for ${teacher.subjects[0] || 'tuition'} classes…`}
                            />
                            {error && <p className="text-sm text-red-600">{error}</p>}
                            <div className="flex gap-3">
                                <button type="button" onClick={() => setShowContact(false)} className="flex-1 py-2.5 rounded-xl border border-card-border text-sm font-semibold text-foreground/70">Cancel</button>
                                <button type="submit" disabled={sending} className="flex-1 py-2.5 rounded-xl bg-blue-600 text-white text-sm font-bold disabled:opacity-60 flex items-center justify-center gap-2">
                                    {sending && <Loader2 className="h-4 w-4 animate-spin" />} Start chat
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
