'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import { Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/components/providers/AuthProvider';
import { redirectFromLocation } from '@/lib/redirect';
import AuthShell from '@/components/auth/AuthShell';

export default function SignupPage() {
    const router = useRouter();
    const { login: authenticateUser } = useAuth();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [formData, setFormData] = useState({
        name: '',
        phone: '',
        email: '',
        password: '',
        confirmPassword: '',
        state: '',
        exam_preference: 'osdhyan Mastery',
        target_year: new Date().getFullYear().toString(),
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFormData(prev => ({ ...prev, [e.target.id]: e.target.value }));
    };

    const handleSignup = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        if (formData.password !== formData.confirmPassword) {
            setError('Passwords do not match.');
            setLoading(false);
            return;
        }

        try {
            const { confirmPassword, ...rest } = formData;
            const res = await api.post('/auth/register', {
                ...rest,
                password_confirmation: confirmPassword,
            });
            authenticateUser(res.data.access_token, res.data.user, redirectFromLocation('/dashboard'));
        } catch (err: unknown) {
            const message = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
            setError(message || 'Sign up failed. Please check your details.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <AuthShell
            width="lg"
            title="Create your free account"
            subtitle="Takes about a minute. No payment needed to start."
            footer={
                <>
                    Already have an account?{' '}
                    <Link href="/auth/login" className="font-semibold text-primary hover:underline">
                        Sign in
                    </Link>
                </>
            }
        >
            {error && (
                <div role="alert" className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-900/20 dark:text-red-300">
                    {error}
                </div>
            )}

            <form className="space-y-6" onSubmit={handleSignup}>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                        <label htmlFor="name" className="label">Full name</label>
                        <input
                            type="text" id="name" required autoComplete="name"
                            className="input"
                            placeholder="Your name"
                            value={formData.name} onChange={handleChange}
                        />
                    </div>
                    <div>
                        <label htmlFor="email" className="label">Email</label>
                        <input
                            type="email" id="email" required autoComplete="email" inputMode="email"
                            className="input"
                            placeholder="you@example.com"
                            value={formData.email} onChange={handleChange}
                        />
                    </div>
                    <div>
                        <label htmlFor="phone" className="label">Mobile number</label>
                        <input
                            type="tel" id="phone" required autoComplete="tel" inputMode="tel"
                            className="input"
                            placeholder="10-digit mobile number"
                            value={formData.phone} onChange={handleChange}
                        />
                    </div>
                    <div>
                        <label htmlFor="state" className="label">State</label>
                        <input
                            type="text" id="state" required autoComplete="address-level1"
                            className="input"
                            placeholder="e.g. Bihar"
                            value={formData.state} onChange={handleChange}
                        />
                    </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-5 border-t border-card-border">
                    <div>
                        <label htmlFor="password" className="label">Password</label>
                        <input
                            type="password" id="password" required autoComplete="new-password"
                            className="input"
                            placeholder="At least 8 characters"
                            value={formData.password} onChange={handleChange}
                        />
                    </div>
                    <div>
                        <label htmlFor="confirmPassword" className="label">Confirm password</label>
                        <input
                            type="password" id="confirmPassword" required autoComplete="new-password"
                            className="input"
                            placeholder="Type the password again"
                            value={formData.confirmPassword} onChange={handleChange}
                        />
                    </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-5 border-t border-card-border">
                    <div>
                        <label htmlFor="exam_preference" className="label">Target exam</label>
                        <select
                            id="exam_preference" required
                            className="input"
                            value={formData.exam_preference} onChange={handleChange}
                        >
                            <option value="BPSC AEDO">BPSC AEDO</option>
                            <option value="BPSC Civil Services">BPSC Civil Services</option>
                            <option value="osdhyan Mastery">Not decided yet</option>
                        </select>
                    </div>
                    <div>
                        <label htmlFor="target_year" className="label">Target year</label>
                        <select
                            id="target_year" required
                            className="input"
                            value={formData.target_year} onChange={handleChange}
                        >
                            <option value="2025">2025</option>
                            <option value="2026">2026</option>
                            <option value="2027">2027</option>
                        </select>
                    </div>
                </div>

                <button type="submit" disabled={loading} className="btn btn-primary w-full">
                    {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Create account'}
                </button>
            </form>
        </AuthShell>
    );
}
