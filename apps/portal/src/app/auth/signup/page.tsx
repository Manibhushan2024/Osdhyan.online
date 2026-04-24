'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import { Loader2, User, Phone, Mail, MapPin, Target, Calendar, ArrowRight, Lock, ShieldCheck, Smartphone } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { Logo } from '@/components/ui/Logo';
import { useAuth } from '@/components/providers/AuthProvider';

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
            const res = await api.post('/auth/register', formData);
            await authenticateUser(res.data.access_token, res.data.user);
        } catch (err: any) {
            setError(err.response?.data?.message || 'Signup failed. Please check your details.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-12 sm:px-6 lg:px-8 relative overflow-hidden">
            {/* Tech Background */}
            <div className="absolute top-0 left-0 w-[600px] h-[600px] bg-indigo-600/5 rounded-full blur-[140px] -ml-64 -mt-64" />
            <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-emerald-600/5 rounded-full blur-[140px] -mr-64 -mb-64" />

            <div className="w-full max-w-xl space-y-12 relative z-10">
                <div className="flex flex-col items-center text-center">
                    <Logo className="scale-125 mb-8" />
                    <h2 className="text-3xl font-black text-slate-900 tracking-tighter uppercase">
                        Register Protocol
                    </h2>
                    <p className="mt-2 text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]">
                        Establish your candidacy for global mastery
                    </p>
                </div>

                <div className="bg-white border border-slate-200 p-10 rounded-[3rem] shadow-xl shadow-indigo-500/5 relative">
                    <div className="absolute -top-px -left-px w-24 h-24 bg-gradient-to-br from-indigo-500/10 to-transparent rounded-tl-[3rem]" />

                    {error && (
                        <div className="mb-8 rounded-2xl bg-red-50 border border-red-100 p-4">
                            <div className="text-[10px] font-black text-red-600 uppercase tracking-widest text-center">{error}</div>
                        </div>
                    )}

                    <form className="space-y-8" onSubmit={handleSignup}>
                        {/* Identity Segment */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label htmlFor="name" className="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">Candidate Name</label>
                                <div className="relative group">
                                    <User className="absolute left-5 top-1/2 -translate-y-1/2 h-4 w-4 text-indigo-500 group-focus-within:text-emerald-500 transition-colors" />
                                    <input
                                        type="text" id="name" required
                                        className="block w-full pl-12 pr-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all font-bold text-sm"
                                        placeholder="Full Name"
                                        value={formData.name} onChange={handleChange}
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label htmlFor="email" className="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">Communication Link</label>
                                <div className="relative group">
                                    <Mail className="absolute left-5 top-1/2 -translate-y-1/2 h-4 w-4 text-indigo-500 group-focus-within:text-emerald-500 transition-colors" />
                                    <input
                                        type="email" id="email" required
                                        className="block w-full pl-12 pr-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all font-bold text-sm"
                                        placeholder="Email Address"
                                        value={formData.email} onChange={handleChange}
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label htmlFor="phone" className="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">Mobile Ident</label>
                                <div className="relative group">
                                    <Smartphone className="absolute left-5 top-1/2 -translate-y-1/2 h-4 w-4 text-indigo-500 group-focus-within:text-emerald-500 transition-colors" />
                                    <input
                                        type="tel" id="phone" required
                                        className="block w-full pl-12 pr-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all font-bold text-sm"
                                        placeholder="91XXXXXXXX"
                                        value={formData.phone} onChange={handleChange}
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label htmlFor="state" className="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">Regional Vector</label>
                                <div className="relative group">
                                    <MapPin className="absolute left-5 top-1/2 -translate-y-1/2 h-4 w-4 text-indigo-500 group-focus-within:text-emerald-500 transition-colors" />
                                    <input
                                        type="text" id="state" required
                                        className="block w-full pl-12 pr-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all font-bold text-sm"
                                        placeholder="State"
                                        value={formData.state} onChange={handleChange}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Password Segment */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t border-slate-100">
                            <div className="space-y-2">
                                <label htmlFor="password" className="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4 text-indigo-600">Security Key</label>
                                <div className="relative group">
                                    <Lock className="absolute left-5 top-1/2 -translate-y-1/2 h-4 w-4 text-indigo-400/50 group-focus-within:text-indigo-600 transition-colors" />
                                    <input
                                        type="password" id="password" required
                                        className="block w-full pl-12 pr-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all font-bold text-sm"
                                        placeholder="••••••••"
                                        value={formData.password} onChange={handleChange}
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label htmlFor="confirmPassword" className="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4 text-indigo-600">Confirm Key</label>
                                <div className="relative group">
                                    <Lock className="absolute left-5 top-1/2 -translate-y-1/2 h-4 w-4 text-indigo-400/50 group-focus-within:text-indigo-600 transition-colors" />
                                    <input
                                        type="password" id="confirmPassword" required
                                        className="block w-full pl-12 pr-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all font-bold text-sm"
                                        placeholder="••••••••"
                                        value={formData.confirmPassword} onChange={handleChange}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Academic Alignment */}
                        <div className="pt-6 border-t border-slate-100">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label htmlFor="exam_preference" className="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4 text-emerald-600">Mission Target</label>
                                    <div className="relative group">
                                        <Target className="absolute left-5 top-1/2 -translate-y-1/2 h-4 w-4 text-emerald-500/50 group-focus-within:text-emerald-500 transition-colors" />
                                        <select
                                            id="exam_preference" required
                                            className="block w-full pl-12 pr-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all font-bold text-sm appearance-none cursor-pointer"
                                            value={formData.exam_preference} onChange={handleChange}
                                        >
                                            <option value="BPSC AEDO">BPSC AEDO</option>
                                            <option value="BPSC Civil Services">BPSC Civil Services</option>
                                            <option value="osdhyan Mastery">osdhyan Mastery</option>
                                        </select>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label htmlFor="target_year" className="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4 text-amber-600">Temporal Objective</label>
                                    <div className="relative group">
                                        <Calendar className="absolute left-5 top-1/2 -translate-y-1/2 h-4 w-4 text-amber-500/50 group-focus-within:text-amber-500 transition-colors" />
                                        <select
                                            id="target_year" required
                                            className="block w-full pl-12 pr-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500/50 transition-all font-bold text-sm appearance-none cursor-pointer"
                                            value={formData.target_year} onChange={handleChange}
                                        >
                                            <option value="2025">2025</option>
                                            <option value="2026">2026</option>
                                            <option value="2027">2027</option>
                                        </select>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <button
                            type="submit" disabled={loading}
                            className="w-full py-4 px-6 bg-gradient-to-r from-indigo-600 to-indigo-700 rounded-2xl text-[10px] font-black text-white uppercase tracking-[0.2em] shadow-xl shadow-indigo-500/20 hover:from-indigo-500 hover:to-indigo-600 focus:outline-none transition-all active:scale-[0.98] flex items-center justify-center gap-3 disabled:opacity-50"
                        >
                            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : (
                                <>
                                    Initialize Protocol
                                    <ArrowRight className="h-3 w-3" />
                                </>
                            )}
                        </button>

                        <p className="mt-8 text-center">
                            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest mr-2">Core Member?</span>
                            <Link href="/auth/login" className="text-[10px] font-black text-emerald-600 uppercase tracking-widest hover:text-emerald-500 transition-colors">
                                Establish Link
                            </Link>
                        </p>
                    </form>
                </div>
            </div>
        </div>
    );
}
