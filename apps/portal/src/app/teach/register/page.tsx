'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { CheckCircle2, Loader2 } from 'lucide-react';
import api from '@/lib/api';
import { useAuth } from '@/components/providers/AuthProvider';
import TeacherProfileForm from '@/components/tuition/TeacherProfileForm';
import { TeacherOwnProfile } from '@/components/tuition/types';

/**
 * Teacher onboarding. Logged-in students are upgraded to role=teacher by
 * POST /teacher/register. Logged-out visitors are sent to sign up first
 * (the signup page does not take a role parameter yet, so they register as a
 * student and come back here to upgrade).
 */
export default function TeacherRegisterPage() {
    const { user, loading, updateUser } = useAuth();
    const router = useRouter();
    const [existing, setExisting] = useState<TeacherOwnProfile | null>(null);
    const [checking, setChecking] = useState(true);

    useEffect(() => {
        if (loading || !user) return;
        let cancelled = false;
        (async () => {
            try {
                const res = await api.get('/teacher/profile');
                if (!cancelled) setExisting(res.data.profile);
            } catch {
                // 404 → no profile yet
            } finally {
                if (!cancelled) setChecking(false);
            }
        })();
        return () => { cancelled = true; };
    }, [loading, user]);

    if (loading || (user && checking)) {
        return <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-blue-600" /></div>;
    }

    if (!user) {
        return (
            <div className="max-w-xl mx-auto bg-card-bg border border-card-border rounded-2xl p-8 text-center space-y-4">
                <h1 className="text-2xl font-bold text-foreground">Teach on OSDHYAN</h1>
                <p className="text-sm text-foreground/60">Create an account first, then come back to this page to set up your teacher profile.</p>
                <div className="flex justify-center gap-3">
                    <Link href="/auth/signup?role=teacher" className="px-5 py-2.5 rounded-xl bg-blue-600 text-white text-sm font-bold">Sign up</Link>
                    <Link href="/auth/login?redirect=%2Fteach%2Fregister" className="px-5 py-2.5 rounded-xl border border-card-border text-sm font-bold text-foreground">Log in</Link>
                </div>
            </div>
        );
    }

    if (existing) {
        return (
            <div className="max-w-xl mx-auto bg-card-bg border border-card-border rounded-2xl p-8 text-center space-y-4">
                <CheckCircle2 className="h-10 w-10 text-green-600 mx-auto" />
                <h1 className="text-2xl font-bold text-foreground">You already have a teacher profile</h1>
                <p className="text-sm text-foreground/60">
                    {existing.verification_status === 'verified'
                        ? 'Your profile is verified and visible to students.'
                        : 'Your profile is pending verification by the OSDHYAN team.'}
                </p>
                <Link href="/teach" className="inline-block px-5 py-2.5 rounded-xl bg-blue-600 text-white text-sm font-bold">Open Teacher Panel</Link>
            </div>
        );
    }

    return (
        <div className="max-w-3xl mx-auto space-y-6">
            <div className="bg-card-bg border border-card-border rounded-2xl p-6 md:p-8">
                <h1 className="text-2xl font-bold text-foreground">Teach on OSDHYAN</h1>
                <p className="text-sm text-foreground/60 mt-2">
                    Set up your teacher profile to receive home-tuition and online leads from students in your city.
                    Profiles are reviewed by our team before they appear in search. Your phone number and email are never shown to students.
                </p>
                <ol className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs text-foreground/70">
                    <li className="rounded-xl bg-background border border-card-border p-3"><span className="font-bold text-foreground">1. Create profile</span><br />Subjects, exams, fee and city.</li>
                    <li className="rounded-xl bg-background border border-card-border p-3"><span className="font-bold text-foreground">2. Get approved</span><br />Our team checks every new teacher, usually within 2 working days.</li>
                    <li className="rounded-xl bg-background border border-card-border p-3"><span className="font-bold text-foreground">3. Teach and earn</span><br />Run live classes, get home-tuition leads and chat with students.</li>
                </ol>
            </div>

            <div className="bg-card-bg border border-card-border rounded-2xl p-6 md:p-8">
                <TeacherProfileForm
                    mode="register"
                    onSaved={(_profile, updated) => {
                        if (updated && typeof updated === 'object') {
                            // Keep the cached session user in sync (role → teacher).
                            updateUser({ ...(user as object), ...(updated as object) } as typeof user & object);
                        }
                        router.push('/teach');
                    }}
                />
            </div>
        </div>
    );
}
