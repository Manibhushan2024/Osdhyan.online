'use client';

import { useState } from 'react';
import {
    Phone,
    Mail,
    MessageSquare,
    Send,
    CheckCircle,
    HelpCircle,
} from 'lucide-react';
import api from '@/lib/api';

const faqs = [
    { q: 'My test did not submit. Are my answers lost?', a: 'No. Answers are saved on your device as you go. Open the test again from the same device and tap Submit, or sign in again if your session expired.' },
    { q: 'Can I attempt a test in Hindi?', a: 'Yes. Choose Hindi before starting, or use the language button on any question during the test.' },
    { q: 'Where do I see my results?', a: 'Open Test History in the sidebar, or tap View result on any completed test in the Tests page.' },
    { q: 'How do I change my password?', a: 'Go to Settings, open the Security tab and enter your current and new password.' },
];

export default function HelpPage() {
    const [submitting, setSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [error, setError] = useState('');
    const [form, setForm] = useState({
        subject: '',
        message: '',
        priority: 'normal'
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        setError('');
        try {
            await api.post('/support/tickets', form);
            setSubmitted(true);
        } catch (err) {
            console.error('Failed to submit ticket', err);
            setError('Could not send your message. Please try again or call us.');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="space-y-6 pb-12">
            <div>
                <h1 className="page-title">Help & support</h1>
                <p className="page-subtitle">Questions about a test, payment or your account? We are here to help.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                <div className="lg:col-span-5 space-y-4">
                    <a href="tel:+919334892585" className="card card-hover p-5 flex items-start gap-4">
                        <div className="h-11 w-11 shrink-0 rounded-xl bg-accent text-accent-foreground flex items-center justify-center">
                            <Phone className="h-5 w-5" />
                        </div>
                        <div>
                            <h3 className="font-semibold">Call us</h3>
                            <p className="text-sm text-muted-foreground mt-0.5">For urgent issues during a test.</p>
                            <p className="mt-2 text-base font-semibold text-primary">+91 93348 92585</p>
                        </div>
                    </a>

                    <a href="mailto:help.osdhyan@gmail.com" className="card card-hover p-5 flex items-start gap-4">
                        <div className="h-11 w-11 shrink-0 rounded-xl bg-accent text-accent-foreground flex items-center justify-center">
                            <Mail className="h-5 w-5" />
                        </div>
                        <div className="min-w-0">
                            <h3 className="font-semibold">Email us</h3>
                            <p className="text-sm text-muted-foreground mt-0.5">For detailed questions or feedback.</p>
                            <p className="mt-2 text-base font-semibold text-primary break-all">help.osdhyan@gmail.com</p>
                        </div>
                    </a>

                    <div className="card p-5">
                        <h3 className="font-semibold flex items-center gap-2"><HelpCircle className="h-4 w-4 text-primary" /> Common questions</h3>
                        <div className="mt-3 divide-y divide-card-border">
                            {faqs.map((f) => (
                                <details key={f.q} className="py-3 group">
                                    <summary className="cursor-pointer list-none text-sm font-medium min-h-[40px] flex items-center justify-between gap-3">
                                        {f.q}
                                        <span className="text-muted-foreground group-open:rotate-180 transition-transform">⌄</span>
                                    </summary>
                                    <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{f.a}</p>
                                </details>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="lg:col-span-7">
                    <div className="card p-5 sm:p-8">
                        {submitted ? (
                            <div className="flex flex-col items-center text-center py-10 gap-4">
                                <div className="h-16 w-16 rounded-full bg-green-100 dark:bg-green-900/30 text-green-600 flex items-center justify-center">
                                    <CheckCircle className="h-8 w-8" />
                                </div>
                                <div>
                                    <h2 className="text-xl font-bold">Message sent</h2>
                                    <p className="mt-1 text-sm text-muted-foreground">We usually reply within a few hours on working days.</p>
                                </div>
                                <button onClick={() => { setSubmitted(false); setForm({ subject: '', message: '', priority: 'normal' }); }} className="btn btn-secondary">
                                    Send another message
                                </button>
                            </div>
                        ) : (
                            <form onSubmit={handleSubmit} className="space-y-5">
                                <div className="flex items-center gap-2">
                                    <MessageSquare className="h-5 w-5 text-primary" />
                                    <h2 className="text-lg font-semibold">Send us a message</h2>
                                </div>

                                {error && (
                                    <div role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-900/20 dark:text-red-300">
                                        {error}
                                    </div>
                                )}

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label htmlFor="subject" className="label">Subject</label>
                                        <input
                                            id="subject"
                                            type="text"
                                            required
                                            placeholder="e.g. Test did not submit"
                                            className="input"
                                            value={form.subject}
                                            onChange={e => setForm({ ...form, subject: e.target.value })}
                                        />
                                    </div>
                                    <div>
                                        <label htmlFor="priority" className="label">How urgent is it?</label>
                                        <select
                                            id="priority"
                                            className="input"
                                            value={form.priority}
                                            onChange={e => setForm({ ...form, priority: e.target.value })}
                                        >
                                            <option value="low">Not urgent</option>
                                            <option value="normal">Normal</option>
                                            <option value="high">Urgent — I cannot use the app</option>
                                        </select>
                                    </div>
                                </div>

                                <div>
                                    <label htmlFor="message" className="label">Message</label>
                                    <textarea
                                        id="message"
                                        required
                                        rows={6}
                                        placeholder="Tell us what happened, including the test name if relevant."
                                        className="input resize-none"
                                        value={form.message}
                                        onChange={e => setForm({ ...form, message: e.target.value })}
                                    />
                                </div>

                                <button type="submit" disabled={submitting} className="btn btn-primary w-full sm:w-auto">
                                    {submitting ? 'Sending…' : (
                                        <>
                                            Send message
                                            <Send className="h-4 w-4" />
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
