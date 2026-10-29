'use client';

/**
 * Firebase Authentication for the web sign-in (phone OTP, e-mail link,
 * Google). The browser signs in with the Firebase SDK and then trades the
 * Firebase ID token for our own API token at POST /auth/firebase/token, so
 * after that point the session works exactly like a password sign-in.
 *
 * Configuration comes from the NEXT_PUBLIC_FIREBASE_* variables (fixed at
 * build time). When they are missing, the public web config the backend
 * publishes at GET /auth/options is used instead, so a server that only has
 * FIREBASE_* in its backend .env still gets Firebase sign-in. When neither is
 * set, Firebase is "not configured" and the pages fall back to the
 * server-side OTP and Google flows.
 *
 * The SDK is loaded lazily (dynamic import) so pages that never sign in do
 * not download it.
 */

import { useEffect, useState } from 'react';
import type { FirebaseApp, FirebaseOptions } from 'firebase/app';
import type { Auth, User as FirebaseUser } from 'firebase/auth';
import api from '@/lib/api';

export type FirebaseWebConfig = {
    apiKey: string;
    authDomain: string;
    projectId: string;
    appId: string;
    messagingSenderId?: string;
};

const ENV_CONFIG: FirebaseWebConfig | null = process.env.NEXT_PUBLIC_FIREBASE_API_KEY
    ? {
        apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
        authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN
            || `${process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID}.firebaseapp.com`,
        projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || '',
        appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || '',
        messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || undefined,
    }
    : null;

/** True when the build itself carries the Firebase web config. */
export const firebaseConfiguredAtBuild = ENV_CONFIG !== null;

let configPromise: Promise<FirebaseWebConfig | null> | null = null;

/** The Firebase web config, or null when Firebase sign-in is not set up. */
export function loadFirebaseConfig(): Promise<FirebaseWebConfig | null> {
    if (ENV_CONFIG) return Promise.resolve(ENV_CONFIG);
    if (!configPromise) {
        configPromise = api.get('/auth/options')
            .then((res) => {
                const fb = res.data?.firebase;
                const web = fb?.web;
                if (!fb?.enabled || !web?.apiKey || !fb.project_id) return null;
                return {
                    apiKey: String(web.apiKey),
                    authDomain: String(web.authDomain || `${fb.project_id}.firebaseapp.com`),
                    projectId: String(fb.project_id),
                    appId: String(web.appId || ''),
                    messagingSenderId: web.messagingSenderId ? String(web.messagingSenderId) : undefined,
                };
            })
            .catch(() => {
                configPromise = null; // try again next time
                return null;
            });
    }
    return configPromise;
}

let authPromise: Promise<Auth | null> | null = null;

/** The Firebase Auth instance, or null when Firebase is not configured. */
export function getFirebaseAuth(): Promise<Auth | null> {
    if (!authPromise) {
        authPromise = (async () => {
            const config = await loadFirebaseConfig();
            if (!config) return null;
            const [{ initializeApp, getApps }, { getAuth }] = await Promise.all([
                import('firebase/app'),
                import('firebase/auth'),
            ]);
            const app: FirebaseApp = getApps()[0] ?? initializeApp(config as FirebaseOptions);
            const auth = getAuth(app);
            auth.languageCode = 'en';
            return auth;
        })().catch((err) => {
            authPromise = null;
            throw err;
        });
    }
    return authPromise;
}

export type ExchangeResult = {
    access_token: string;
    user: unknown;
    is_new_user?: boolean;
    needs_phone?: boolean;
};

/**
 * Trade the signed-in Firebase user for our API token. The Firebase session
 * is closed afterwards: from here on our own token is the session.
 */
export async function exchangeFirebaseUser(auth: Auth, fbUser: FirebaseUser, name?: string): Promise<ExchangeResult> {
    const idToken = await fbUser.getIdToken();
    try {
        const res = await api.post('/auth/firebase/token', { id_token: idToken, ...(name ? { name } : {}) });
        return res.data as ExchangeResult;
    } finally {
        try {
            const { signOut } = await import('firebase/auth');
            await signOut(auth);
        } catch {
            // ignore — the Firebase session is not used after this point
        }
    }
}

const MESSAGES: Record<string, string> = {
    'auth/invalid-phone-number': 'That mobile number does not look right. Enter your 10-digit number.',
    'auth/missing-phone-number': 'Enter your mobile number.',
    'auth/invalid-verification-code': 'That code is not correct. Please check the SMS and try again.',
    'auth/missing-verification-code': 'Enter the 6-digit code from the SMS.',
    'auth/code-expired': 'This code has expired. Please ask for a new one.',
    'auth/session-expired': 'This code has expired. Please ask for a new one.',
    'auth/too-many-requests': 'Too many attempts. Please wait a few minutes and try again.',
    'auth/quota-exceeded': 'We cannot send more codes right now. Please try again later or sign in with your password.',
    'auth/captcha-check-failed': 'The security check failed. Please reload the page and try again.',
    'auth/invalid-app-credential': 'The security check failed. Please reload the page and try again.',
    'auth/missing-app-credential': 'The security check failed. Please reload the page and try again.',
    'auth/network-request-failed': 'No internet connection. Please check your network and try again.',
    'auth/popup-closed-by-user': 'The Google window was closed before signing in finished.',
    'auth/cancelled-popup-request': 'The Google window was closed before signing in finished.',
    'auth/popup-blocked': 'Your browser blocked the Google window. Please allow pop-ups for this site and try again.',
    'auth/operation-not-allowed': 'This sign-in method is not switched on yet. Please use another way to sign in.',
    'auth/unauthorized-domain': 'Sign-in is not allowed from this web address yet. Please use another way to sign in.',
    'auth/unauthorized-continue-uri': 'Sign-in is not allowed from this web address yet. Please use another way to sign in.',
    'auth/invalid-email': 'That e-mail address does not look right.',
    'auth/missing-email': 'Enter your e-mail address.',
    'auth/invalid-action-code': 'This sign-in link is not valid any more. It may have been used already. Please ask for a new one.',
    'auth/expired-action-code': 'This sign-in link has expired. Please ask for a new one.',
    'auth/user-disabled': 'This account has been blocked. Please contact support.',
    'auth/account-exists-with-different-credential': 'This e-mail is already linked to another sign-in method. Please sign in with your mobile number or password.',
    'auth/billing-not-enabled': 'SMS sign-in is not available right now. Please sign in with your password.',
    'auth/admin-restricted-operation': 'This sign-in method is not switched on yet. Please use another way to sign in.',
    'auth/web-storage-unsupported': 'Your browser is blocking storage that sign-in needs. Please turn off private mode or try another browser.',
};

/** A plain-English message for any error from the Firebase flow or the token exchange. */
export function firebaseErrorMessage(err: unknown, fallback = 'Sign-in did not work. Please try again.'): string {
    const apiMessage = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
    if (apiMessage) return apiMessage;
    const code = (err as { code?: string })?.code;
    if (code && MESSAGES[code]) return MESSAGES[code];
    return fallback;
}

/** localStorage key for the address an e-mail link was sent to. */
export const EMAIL_FOR_SIGN_IN_KEY = 'osd_email_for_signin';

/**
 * Whether Firebase sign-in is available: true / false, or null while the
 * config is still being fetched from the API.
 */
export function useFirebaseAvailable(): boolean | null {
    const [available, setAvailable] = useState<boolean | null>(firebaseConfiguredAtBuild ? true : null);
    useEffect(() => {
        if (firebaseConfiguredAtBuild) return;
        let cancelled = false;
        void loadFirebaseConfig().then((config) => {
            if (!cancelled) setAvailable(config !== null);
        });
        return () => { cancelled = true; };
    }, []);
    return available;
}
