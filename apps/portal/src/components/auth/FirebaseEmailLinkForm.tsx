'use client';

import { useState } from 'react';
import { Loader2, MailCheck } from 'lucide-react';
import { EMAIL_FOR_SIGN_IN_KEY, firebaseErrorMessage, getFirebaseAuth } from '@/lib/firebase';
import { redirectFromLocation } from '@/lib/redirect';

const isEmail = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim());

/**
 * Password-free sign-in by e-mail: Firebase e-mails a one-time link that
 * comes back to /auth/email-link, which finishes the sign-in.
 */
export default function FirebaseEmailLinkForm({ initialEmail = '' }: { initialEmail?: string }) {
    const [email, setEmail] = useState(isEmail(initialEmail) ? initialEmail.trim() : '');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [sentTo, setSentTo] = useState('');

    const send = async (e?: React.FormEvent) => {
        e?.preventDefault();
        setError('');
        const address = email.trim().toLowerCase();
        if (!isEmail(address)) { setError('Enter a valid e-mail address.'); return; }
        setLoading(true);
        try {
            const auth = await getFirebaseAuth();
            if (!auth) throw new Error('not-configured');
            const { sendSignInLinkToEmail } = await import('firebase/auth');
            const back = new URL('/auth/email-link', window.location.origin);
            const redirect = redirectFromLocation('');
            if (redirect) back.searchParams.set('redirect', redirect);
            await sendSignInLinkToEmail(auth, address, { url: back.toString(), handleCodeInApp: true });
            try { localStorage.setItem(EMAIL_FOR_SIGN_IN_KEY, address); } catch { /* private mode */ }
            setSentTo(address);
        } catch (err) {
            setError(firebaseErrorMessage(err, 'Could not send the sign-in link. Please try again.'));
        } finally {
            setLoading(false);
        }
    };

    if (sentTo) {
        return (
            <div className="space-y-4 text-sm">
                <div className="flex gap-3 rounded-xl border border-card-border bg-background/60 px-4 py-3">
                    <MailCheck className="mt-0.5 h-5 w-5 shrink-0 text-primary" aria-hidden="true" />
                    <div>
                        <p className="font-medium">Check your inbox</p>
                        <p className="mt-1 text-muted-foreground">
                            We sent a sign-in link to <span className="font-medium text-foreground">{sentTo}</span>.
                            Open it on this device to sign in. It may take a minute to arrive; check the spam folder too.
                        </p>
                    </div>
                </div>
                <p className="text-center text-muted-foreground">
                    Wrong address or no e-mail?{' '}
                    <button type="button" className="font-semibold text-primary hover:underline" onClick={() => setSentTo('')}>
                        Send again
                    </button>
                </p>
            </div>
        );
    }

    return (
        <form className="space-y-5" onSubmit={send}>
            {error && (
                <div role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-900/20 dark:text-red-300">
                    {error}
                </div>
            )}
            <div>
                <label htmlFor="fb-email" className="label">E-mail address</label>
                <input id="fb-email" className="input" required type="email" inputMode="email" autoComplete="email"
                    placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
            <button type="submit" disabled={loading} className="btn btn-primary w-full">
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'E-mail me a sign-in link'}
            </button>
            <p className="text-xs text-muted-foreground">No password needed. Click the link in the e-mail and you are in.</p>
        </form>
    );
}
