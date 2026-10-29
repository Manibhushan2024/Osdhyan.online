'use client';

import { Suspense, useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { Loader2 } from 'lucide-react';
import AuthShell from '@/components/auth/AuthShell';
import { useAuth } from '@/components/providers/AuthProvider';
import { EMAIL_FOR_SIGN_IN_KEY, exchangeFirebaseUser, firebaseErrorMessage, getFirebaseAuth } from '@/lib/firebase';
import { redirectFromLocation } from '@/lib/redirect';

type State = 'checking' | 'need-email' | 'signing-in' | 'error';

/**
 * Landing page for the Firebase e-mail sign-in link. Finishes the sign-in
 * (asking for the address again if the link was opened on another device),
 * exchanges the Firebase ID token for our API token and continues like a
 * normal sign-in.
 */
function EmailLinkInner() {
    const { login } = useAuth();
    const [state, setState] = useState<State>('checking');
    const [error, setError] = useState('');
    const [email, setEmail] = useState('');
    const started = useRef(false);

    const finish = useCallback(async (address: string) => {
        setState('signing-in');
        setError('');
        try {
            const auth = await getFirebaseAuth();
            if (!auth) throw new Error('not-configured');
            const { signInWithEmailLink } = await import('firebase/auth');
            const cred = await signInWithEmailLink(auth, address, window.location.href);
            try { localStorage.removeItem(EMAIL_FOR_SIGN_IN_KEY); } catch { /* ignore */ }
            const data = await exchangeFirebaseUser(auth, cred.user);
            login(data.access_token, data.user as Parameters<typeof login>[1], redirectFromLocation('/dashboard'));
        } catch (err) {
            setError(firebaseErrorMessage(err, 'This sign-in link did not work. Please ask for a new one.'));
            setState('error');
        }
    }, [login]);

    useEffect(() => {
        if (started.current) return;
        started.current = true;
        void (async () => {
            try {
                const auth = await getFirebaseAuth();
                const { isSignInWithEmailLink } = await import('firebase/auth');
                if (!auth || !isSignInWithEmailLink(auth, window.location.href)) {
                    setError('This is not a valid sign-in link. Please ask for a new one from the sign-in page.');
                    setState('error');
                    return;
                }
                let saved = '';
                try { saved = localStorage.getItem(EMAIL_FOR_SIGN_IN_KEY) || ''; } catch { /* ignore */ }
                if (saved) {
                    await finish(saved);
                } else {
                    setState('need-email');
                }
            } catch (err) {
                setError(firebaseErrorMessage(err));
                setState('error');
            }
        })();
    }, [finish]);

    return (
        <AuthShell title="Signing you in" subtitle="Finishing sign-in with your e-mail link.">
            {(state === 'checking' || state === 'signing-in') && (
                <div className="flex items-center gap-3 text-sm text-muted-foreground">
                    <Loader2 className="h-5 w-5 animate-spin" /> Please wait…
                </div>
            )}

            {state === 'need-email' && (
                <form className="space-y-5" onSubmit={(e) => { e.preventDefault(); if (email.trim()) void finish(email.trim().toLowerCase()); }}>
                    <p className="text-sm text-muted-foreground">
                        You opened the link on a different device or browser. Please type the e-mail address the link was sent to.
                    </p>
                    <div>
                        <label htmlFor="confirm-email" className="label">E-mail address</label>
                        <input id="confirm-email" className="input" type="email" required autoComplete="email"
                            placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} />
                    </div>
                    <button type="submit" className="btn btn-primary w-full">Continue</button>
                </form>
            )}

            {state === 'error' && (
                <div className="space-y-4">
                    <div role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-900/20 dark:text-red-300">
                        {error}
                    </div>
                    <Link href="/auth/login?via=email-link" className="btn btn-primary w-full">Back to sign in</Link>
                </div>
            )}
        </AuthShell>
    );
}

export default function EmailLinkPage() {
    return (
        <Suspense fallback={<div className="min-h-screen bg-background" />}>
            <EmailLinkInner />
        </Suspense>
    );
}
