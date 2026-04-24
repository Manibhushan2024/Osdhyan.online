'use client';

import { useState } from 'react';
import {
    Phone,
    Mail,
    MessageSquare,
    Send,
    CheckCircle,
    ChevronRight,
    LifeBuoy,
    ShieldCheck,
    HelpCircle,
    ArrowRight
} from 'lucide-react';
import api from '@/lib/api';
import { cn } from '@/lib/utils';
import { useTheme } from '@/components/providers/ThemeProvider';

export default function HelpHubPage() {
    const { theme } = useTheme();
    const [submitting, setSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [form, setForm] = useState({
        subject: '',
        message: '',
        priority: 'normal'
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            await api.post('/support/tickets', form);
            setSubmitted(true);
        } catch (error) {
            console.error('Failed to submit ticket', error);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-6 duration-1000">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <h1 className="text-3xl font-black text-gray-900 dark:text-white uppercase tracking-tighter italic">Support Terminal</h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-1 font-medium italic">Dedicated academic assistance and technical support.</p>
                </div>

                <div className="flex items-center gap-4">
                    <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                    <span className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest">Support Line Active</span>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Contact Cards */}
                <div className="lg:col-span-5 space-y-6">
                    <div className="bg-white dark:bg-gray-800 p-8 rounded-[3rem] border border-gray-100 dark:border-gray-700 shadow-sm group hover:border-blue-600/30 transition-all duration-500">
                        <div className="h-14 w-14 bg-blue-50 dark:bg-blue-900/20 rounded-2xl flex items-center justify-center text-blue-600 mb-6 group-hover:scale-110 transition-transform">
                            <Phone className="h-6 w-6" />
                        </div>
                        <h3 className="text-lg font-black text-gray-900 dark:text-white uppercase tracking-tight">Vocal Assistance</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-2 font-medium italic">Call our selectors for immediate technical guidance.</p>
                        <div className="mt-6 flex items-center gap-3">
                            <span className="text-xl font-black text-blue-600 tracking-tighter italic">+91 9334892585</span>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-gray-800 p-8 rounded-[3rem] border border-gray-100 dark:border-gray-700 shadow-sm group hover:border-indigo-600/30 transition-all duration-500">
                        <div className="h-14 w-14 bg-indigo-50 dark:bg-indigo-900/20 rounded-2xl flex items-center justify-center text-indigo-600 mb-6 group-hover:scale-110 transition-transform">
                            <Mail className="h-6 w-6" />
                        </div>
                        <h3 className="text-lg font-black text-gray-900 dark:text-white uppercase tracking-tight">Academic Desk</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-2 font-medium italic">Send your detailed queries for expert review.</p>
                        <div className="mt-6">
                            <span className="text-xs font-black text-indigo-600 uppercase tracking-widest">help.osdhyan@gmail.com</span>
                        </div>
                    </div>

                    {/* FAQ Quick Link */}
                    <div className="bg-gray-900 dark:bg-gray-800 p-10 rounded-[3.5rem] text-white relative overflow-hidden group">
                        <div className="absolute top-0 right-0 h-40 w-40 bg-blue-600/20 rounded-full blur-3xl" />
                        <LifeBuoy className="h-10 w-10 text-blue-400 mb-6 group-hover:rotate-12 transition-transform" />
                        <h2 className="text-xl font-black uppercase tracking-tight italic">Self-Optimization Hub</h2>
                        <p className="text-gray-400 text-sm mt-3 font-medium italic">Browse our selection manuals and technical documentation.</p>
                        <button className="mt-8 flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.2em] text-blue-400 hover:text-white transition-colors">
                            Explore Manuals <ArrowRight className="h-4 w-4" />
                        </button>
                    </div>
                </div>

                {/* Ticket Form */}
                <div className="lg:col-span-7">
                    <div className="bg-white dark:bg-gray-800 rounded-[3.5rem] p-10 lg:p-14 border border-gray-100 dark:border-gray-700 shadow-2xl relative">
                        {submitted ? (
                            <div className="flex flex-col items-center justify-center text-center py-20 space-y-6 animate-in zoom-in duration-500">
                                <div className="h-24 w-24 bg-green-50 dark:bg-green-900/20 rounded-full flex items-center justify-center text-green-500">
                                    <CheckCircle className="h-12 w-12" />
                                </div>
                                <div>
                                    <h2 className="text-2xl font-black text-gray-900 dark:text-white uppercase italic">Ticket Transmitted</h2>
                                    <p className="text-gray-500 dark:text-gray-400 mt-2 font-medium italic">Our support elite will review your data and respond within 2-4 hours.</p>
                                </div>
                                <button
                                    onClick={() => setSubmitted(false)}
                                    className="px-8 py-3 bg-gray-900 dark:bg-blue-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-blue-600 transition-all shadow-xl"
                                >
                                    New Inquiry
                                </button>
                            </div>
                        ) : (
                            <form onSubmit={handleSubmit} className="space-y-8">
                                <div className="space-y-2">
                                    <div className="flex items-center gap-2 mb-8">
                                        <MessageSquare className="h-5 w-5 text-blue-600" />
                                        <h2 className="text-xl font-black text-gray-900 dark:text-white uppercase tracking-tight italic">Selection Priority Support</h2>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Case Subject</label>
                                            <input
                                                type="text"
                                                required
                                                placeholder="e.g. Test Engine Glitch"
                                                className="w-full px-6 py-4 bg-gray-50 dark:bg-gray-900 border-0 rounded-2xl text-sm font-bold focus:ring-2 focus:ring-blue-600/20 transition-all outline-none"
                                                value={form.subject}
                                                onChange={e => setForm({ ...form, subject: e.target.value })}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Urgency Protocol</label>
                                            <select
                                                className="w-full px-6 py-4 bg-gray-50 dark:bg-gray-900 border-0 rounded-2xl text-sm font-bold focus:ring-2 focus:ring-blue-600/20 transition-all outline-none appearance-none"
                                                value={form.priority}
                                                onChange={e => setForm({ ...form, priority: e.target.value })}
                                            >
                                                <option value="low">Low Priority</option>
                                                <option value="normal">Normal Ops</option>
                                                <option value="high">Critical Failure</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Case Intelligence (Message)</label>
                                    <textarea
                                        required
                                        rows={6}
                                        placeholder="Explain the incident in detail..."
                                        className="w-full px-6 py-4 bg-gray-50 dark:bg-gray-900 border-0 rounded-3xl text-sm font-bold focus:ring-2 focus:ring-blue-600/20 transition-all outline-none resize-none"
                                        value={form.message}
                                        onChange={e => setForm({ ...form, message: e.target.value })}
                                    />
                                </div>

                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className="w-full flex items-center justify-center gap-3 py-5 bg-gray-900 dark:bg-blue-600 text-white rounded-[2rem] font-black text-xs uppercase tracking-[0.2em] hover:bg-blue-600 dark:hover:bg-blue-500 transition-all shadow-2xl shadow-gray-200 dark:shadow-none group"
                                >
                                    {submitting ? 'Transmitting Data...' : (
                                        <>
                                            Execute Ticket Submission
                                            <Send className="h-4 w-4 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                                        </>
                                    )}
                                </button>
                            </form>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
