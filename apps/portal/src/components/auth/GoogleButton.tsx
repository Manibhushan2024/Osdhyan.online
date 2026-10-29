'use client';

import { useEffect, useRef, useState } from 'react';
import { Loader2 } from 'lucide-react';
import type { Auth } from 'firebase/auth';
import api from '@/lib/api';
import { useAuth } from '@/components/providers/AuthProvider';
import { exchangeFirebaseUser, firebaseErrorMessage, getFirebaseAuth } from '@/lib/firebase';
import { redirectFromLocation, rememberOAuthRedirect } from '@/lib/redirect';

type FirebaseAuthModule = typeof import('firebase/auth');

/** Firebase errors that mean "Google is not switched on in Firebase" — use the server flow instead. */
const NOT_ENABLED = new Set(['auth/operation-not-allowed', 'auth/admin-restricted-operation', 'auth/configuration-not-found']);

/**
 * "Continue with Google". When Firebase sign-in is configured this opens the
 * Google pop-up through Firebase and exchanges the Firebase ID token for our
 * API token. Otherwise (or when Google is not switched on in Firebase yet) it
 * starts the server-side OAuth flow, which answers 503 with a readable
 * message when Google isn't configured there either.
 */
export default function GoogleButton({ label = 'Continue with Google', onError }: { label?: string; onError?: (message: string) => void }) {
    const { login } = useAuth();
    const [loading, setLoading] = useState(false);
    // Loaded ahead of the click: browsers only allow the pop-up when it opens
    // straight from the click, without waiting for a download first.
    const fb = useRef<{ auth: Auth; mod: FirebaseAuthModule } | null>(null);

    useEffect(() => {
        let cancelled = false;
        void (async () => {
            try {
                const auth = await getFirebaseAuth();
                if (!auth || cancelled) return;
                const mod = await import('firebase/auth');
                if (!cancelled) fb.current = { auth, mod };
            } catch {
                // Firebase unavailable — the server flow is used.
            }
        })();
        return () => { cancelled = true; };
    }, []);

    const startServerFlow = async () => {
        try {
            rememberOAuthRedirect(redirectFromLocation(''));
            const res = await api.get('/auth/google/redirect');
            window.location.href = res.data.url;
        } catch (err: unknown) {
            const data = (err as { response?: { data?: { message?: string } } })?.response?.data;
            onError?.(data?.message || 'Google sign-in is unavailable right now. Please use your mobile number instead.');
            setLoading(false);
        }
    };

    const start = async () => {
        setLoading(true);
        const ready = fb.current;
        if (!ready) {
            await startServerFlow();
            return;
        }
        try {
            const { mod, auth } = ready;
            const provider = new mod.GoogleAuthProvider();
            provider.setCustomParameters({ prompt: 'select_account' });
            const cred = await mod.signInWithPopup(auth, provider);
            const data = await exchangeFirebaseUser(auth, cred.user);
            login(data.access_token, data.user as Parameters<typeof login>[1], redirectFromLocation('/dashboard'));
        } catch (err) {
            const code = (err as { code?: string })?.code;
            if (code && NOT_ENABLED.has(code)) {
                await startServerFlow();
                return;
            }
            onError?.(firebaseErrorMessage(err, 'Google sign-in did not work. Please try again or use your mobile number.'));
            setLoading(false);
        }
    };

    return (
        <button type="button" disabled={loading} onClick={start} className="btn btn-secondary w-full">
            {loading
                ? <Loader2 className="h-4 w-4 animate-spin" />
                : <svg className="h-4 w-4" viewBox="0 0 24 24" aria-hidden="true">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" />
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                </svg>}
            {label}
        </button>
    );
}
