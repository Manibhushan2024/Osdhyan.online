'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { BadgeCheck, Clock, Loader2, MapPin, MessageSquare, Send } from 'lucide-react';
import api from '@/lib/api';
import { cn } from '@/lib/utils';
import { useAuth } from '@/components/providers/AuthProvider';
import TeacherProfileForm from '@/components/tuition/TeacherProfileForm';
import ProposalModal from '@/components/tuition/ProposalModal';
import { Lead, MODE_LABELS, MyProposal, TeacherOwnProfile, errorMessage, formatINR } from '@/components/tuition/types';

type Tab = 'leads' | 'proposals' | 'profile';

function statusBadge(status: string) {
    const map: Record<string, string> = {
        pending: 'bg-amber-50 text-amber-700',
        accepted: 'bg-green-50 text-green-700',
        rejected: 'bg-gray-100 text-gray-500',
    };
    return <span className={cn('text-[11px] font-bold uppercase px-2 py-0.5 rounded-md', map[status] || 'bg-gray-100 text-gray-600')}>{status}</span>;
}

export default function TeacherPanelPage() {
    const { user, loading: authLoading } = useAuth();
    const [profile, setProfile] = useState<TeacherOwnProfile | null>(null);
    const [noProfile, setNoProfile] = useState(false);
    const [loading, setLoading] = useState(true);
    const [tab, setTab] = useState<Tab>('leads');

    const [leads, setLeads] = useState<Lead[]>([]);
    const [leadsError, setLeadsError] = useState<string | null>(null);
    const [leadsLoading, setLeadsLoading] = useState(false);
    const [proposalFor, setProposalFor] = useState<Lead | null>(null);

    const [proposals, setProposals] = useState<MyProposal[]>([]);
    const [proposalsLoading, setProposalsLoading] = useState(false);
    const [notice, setNotice] = useState<string | null>(null);

    useEffect(() => {
        if (authLoading || !user) return;
        let cancelled = false;
        (async () => {
            try {
                const res = await api.get('/teacher/profile');
                if (!cancelled) setProfile(res.data.profile);
            } catch {
                if (!cancelled) setNoProfile(true);
            } finally {
                if (!cancelled) setLoading(false);
            }
        })();
        return () => { cancelled = true; };
    }, [authLoading, user]);

    const loadLeads = useCallback(async () => {
        setLeadsLoading(true);
        setLeadsError(null);
        try {
            const res = await api.get('/tuition/leads');
            setLeads(res.data.data || []);
        } catch (err) {
            setLeads([]);
            setLeadsError(errorMessage(err, 'Could not load leads.'));
        } finally {
            setLeadsLoading(false);
        }
    }, []);

    const loadProposals = useCallback(async () => {
        setProposalsLoading(true);
        try {
            const res = await api.get('/tuition/proposals/mine');
            setProposals(res.data.data || []);
        } catch {
            setProposals([]);
        } finally {
            setProposalsLoading(false);
        }
    }, []);

    useEffect(() => {
        if (!profile) return;
        if (tab === 'leads' && profile.verification_status === 'verified') loadLeads();
        if (tab === 'proposals') loadProposals();
    }, [tab, profile, loadLeads, loadProposals]);

    if (authLoading || loading) {
        return <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-blue-600" /></div>;
    }

    if (noProfile || !profile) {
        return (
            <div className="max-w-xl mx-auto bg-card-bg border border-card-border rounded-2xl p-8 text-center space-y-4">
                <h1 className="text-2xl font-bold text-foreground">Teacher Panel</h1>
                <p className="text-sm text-foreground/60">You do not have a teacher profile yet. Create one to receive tuition leads.</p>
                <Link href="/teach/register" className="inline-block px-5 py-2.5 rounded-xl bg-blue-600 text-white text-sm font-bold">Create teacher profile</Link>
            </div>
        );
    }

    const verified = profile.verification_status === 'verified';

    return (
        <div className="max-w-6xl mx-auto space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-foreground">Teacher Panel</h1>
                    <p className="text-sm text-foreground/60">Leads, proposals and your public profile.</p>
                </div>
                <Link href="/dashboard/messages" className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-card-border text-sm font-bold text-foreground">
                    <MessageSquare className="h-4 w-4" /> Messages
                </Link>
            </div>

            {verified ? (
                <div className="rounded-2xl bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 px-5 py-4 flex items-center gap-3 text-sm">
                    <BadgeCheck className="h-5 w-5 text-green-600 shrink-0" />
                    <div>
                        <p className="font-semibold text-green-800 dark:text-green-200">Verified teacher</p>
                        <p className="text-green-700/80 dark:text-green-300/80">
                            Your profile is {profile.is_available ? 'visible to students' : 'hidden because you are marked as not accepting students'}. New leads appear below.
                        </p>
                    </div>
                </div>
            ) : (
                <div className="rounded-2xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 px-5 py-4 flex items-center gap-3 text-sm">
                    <Clock className="h-5 w-5 text-amber-600 shrink-0" />
                    <div>
                        <p className="font-semibold text-amber-800 dark:text-amber-200">Pending verification</p>
                        <p className="text-amber-700/80 dark:text-amber-300/80">
                            The OSDHYAN team reviews new teacher profiles, usually within 2 working days. Complete your profile (qualifications, experience, subjects) to speed this up. Leads and proposals unlock once verified.
                        </p>
                    </div>
                </div>
            )}

            <div className="flex gap-2 border-b border-card-border overflow-x-auto">
                {([['leads', 'Leads'], ['proposals', 'My proposals'], ['profile', 'Profile']] as [Tab, string][]).map(([key, label]) => (
                    <button
                        key={key}
                        onClick={() => setTab(key)}
                        className={cn('px-4 py-2.5 text-sm font-semibold border-b-2 -mb-px whitespace-nowrap', tab === key ? 'border-blue-600 text-blue-600' : 'border-transparent text-foreground/50 hover:text-foreground')}
                    >
                        {label}
                    </button>
                ))}
            </div>

            {notice && <div className="rounded-xl bg-blue-50 text-blue-800 text-sm px-4 py-3">{notice}</div>}

            {tab === 'leads' && (
                <div className="space-y-4">
                    {!verified ? (
                        <div className="py-16 text-center bg-card-bg border border-dashed border-card-border rounded-2xl text-sm text-foreground/60">
                            Leads will appear here after your profile is verified.
                        </div>
                    ) : leadsLoading ? (
                        <div className="flex justify-center py-16"><Loader2 className="h-8 w-8 animate-spin text-blue-600" /></div>
                    ) : leadsError ? (
                        <div className="py-10 text-center text-sm text-red-600">{leadsError}</div>
                    ) : leads.length === 0 ? (
                        <div className="py-16 text-center bg-card-bg border border-dashed border-card-border rounded-2xl">
                            <p className="font-semibold text-foreground">No open requirements match your profile right now.</p>
                            <p className="text-sm text-foreground/60 mt-1">Leads match on your city (for home visits), online availability, and your subjects or exams. Add more subjects in your profile to see more.</p>
                        </div>
                    ) : (
                        <>
                            <p className="text-xs text-foreground/50">{leads.length} open requirement{leads.length === 1 ? '' : 's'} match your profile.</p>
                            {leads.map((lead) => (
                                <div key={lead.id} className="bg-card-bg border border-card-border rounded-2xl p-5 flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                                    <div className="min-w-0">
                                        <h3 className="font-bold text-foreground">{lead.subject}{lead.exam ? ` · ${lead.exam}` : ''}</h3>
                                        <p className="text-sm text-foreground/60 mt-1 flex flex-wrap gap-x-3 gap-y-1">
                                            <span className="inline-flex items-center gap-1"><MapPin className="h-3.5 w-3.5" /> {lead.city || 'Online'}{lead.area ? `, ${lead.area}` : ''}</span>
                                            <span>{MODE_LABELS[lead.mode]}</span>
                                            {lead.budget_per_hour ? <span>Budget {formatINR(lead.budget_per_hour)}/hr</span> : null}
                                            {lead.preferred_timing ? <span>{lead.preferred_timing}</span> : null}
                                        </p>
                                        {lead.description && <p className="text-sm text-foreground/80 mt-2 whitespace-pre-wrap">{lead.description}</p>}
                                        <p className="text-xs text-foreground/40 mt-2">Posted by {lead.student_name || 'a student'} · {new Date(lead.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</p>
                                    </div>
                                    <div className="shrink-0">
                                        {lead.already_proposed ? (
                                            <span className="inline-block px-4 py-2 rounded-xl bg-gray-100 text-gray-600 text-xs font-bold">Proposal sent</span>
                                        ) : (
                                            <button onClick={() => setProposalFor(lead)} className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 text-white text-xs font-bold hover:bg-blue-700">
                                                <Send className="h-3.5 w-3.5" /> Send proposal
                                            </button>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </>
                    )}
                </div>
            )}

            {tab === 'proposals' && (
                <div className="space-y-4">
                    {proposalsLoading ? (
                        <div className="flex justify-center py-16"><Loader2 className="h-8 w-8 animate-spin text-blue-600" /></div>
                    ) : proposals.length === 0 ? (
                        <div className="py-16 text-center bg-card-bg border border-dashed border-card-border rounded-2xl text-sm text-foreground/60">
                            You have not sent any proposals yet.
                        </div>
                    ) : (
                        proposals.map((p) => (
                            <div key={p.id} className="bg-card-bg border border-card-border rounded-2xl p-5 flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                                <div className="min-w-0">
                                    <div className="flex items-center gap-2 flex-wrap">
                                        <h3 className="font-bold text-foreground">{p.request?.subject || 'Requirement'}{p.request?.exam ? ` · ${p.request.exam}` : ''}</h3>
                                        {statusBadge(p.status)}
                                        <span className="text-sm font-bold text-foreground">{formatINR(p.fee_per_hour)}/hr</span>
                                    </div>
                                    {p.request && (
                                        <p className="text-sm text-foreground/60 mt-1">
                                            {p.request.city || 'Online'} · {MODE_LABELS[p.request.mode]} · Requirement {p.request.status}
                                        </p>
                                    )}
                                    <p className="text-sm text-foreground/80 mt-2 whitespace-pre-wrap">{p.message}</p>
                                </div>
                                <div className="shrink-0">
                                    {p.status === 'accepted' && p.conversation_id ? (
                                        <Link href={`/dashboard/messages?c=${p.conversation_id}`} className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-green-600 text-white text-xs font-bold">
                                            <MessageSquare className="h-3.5 w-3.5" /> Chat with student
                                        </Link>
                                    ) : p.status === 'pending' ? (
                                        <span className="text-xs text-foreground/50">Waiting for the student</span>
                                    ) : (
                                        <span className="text-xs text-foreground/50">Not selected</span>
                                    )}
                                </div>
                            </div>
                        ))
                    )}
                </div>
            )}

            {tab === 'profile' && (
                <div className="bg-card-bg border border-card-border rounded-2xl p-6 md:p-8">
                    <div className="flex items-center justify-between mb-5">
                        <div>
                            <h2 className="font-bold text-foreground">Your public profile</h2>
                            <p className="text-xs text-foreground/60">Students see this in search. Your phone and email are never shown.</p>
                        </div>
                        {verified && (
                            <Link href={`/dashboard/tuition/teachers/${profile.id}`} className="text-xs font-bold text-blue-600">View as student</Link>
                        )}
                    </div>
                    <TeacherProfileForm
                        key={profile.id}
                        mode="update"
                        initial={profile}
                        onSaved={(p) => {
                            setProfile(p);
                            setNotice('Profile saved.');
                        }}
                    />
                </div>
            )}

            {proposalFor && (
                <ProposalModal
                    lead={proposalFor}
                    defaultFee={profile.fee_per_hour}
                    onClose={() => setProposalFor(null)}
                    onSent={(leadId) => {
                        setProposalFor(null);
                        setLeads((prev) => prev.map((l) => (l.id === leadId ? { ...l, already_proposed: true } : l)));
                        setNotice('Proposal sent. You will be able to chat once the student accepts.');
                    }}
                />
            )}
        </div>
    );
}
