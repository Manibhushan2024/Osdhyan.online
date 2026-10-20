'use client';

import { useEffect, useState } from 'react';
import { KeyRound, Loader2, Save, Shield, UserPlus } from 'lucide-react';
import api from '@/lib/api';
import { useAuth } from '@/components/providers/AuthProvider';

type AdminUser = {
    id: number;
    name: string;
    email: string;
    admin_role: string | null;
};

const inputClass = 'w-full bg-white/5 border border-card-border rounded-xl p-3 text-sm';
const errorText = (e: any, fallback: string) =>
    e?.response?.data?.message || Object.values(e?.response?.data?.errors ?? {}).flat().join(' ') || fallback;

/** Every admin can change their own password. */
function ChangePasswordCard() {
    const [form, setForm] = useState({ current_password: '', password: '', password_confirmation: '' });
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null);

    const submit = async (e: React.FormEvent) => {
        e.preventDefault();
        setMessage(null);
        if (form.password !== form.password_confirmation) {
            setMessage({ ok: false, text: 'The two new passwords do not match.' });
            return;
        }
        setSaving(true);
        try {
            await api.put('/profile/password', form);
            setForm({ current_password: '', password: '', password_confirmation: '' });
            setMessage({ ok: true, text: 'Password changed. Use the new password next time you sign in.' });
        } catch (err) {
            setMessage({ ok: false, text: errorText(err, 'Could not change the password.') });
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="bg-card-bg border border-card-border rounded-2xl p-8">
            <h2 className="text-base font-semibold mb-1 flex items-center gap-2"><KeyRound className="h-4 w-4" /> Change my password</h2>
            <p className="text-sm text-foreground/50 mb-6">Use at least 8 characters.</p>
            <form onSubmit={submit} className="space-y-4">
                <input required type="password" autoComplete="current-password" placeholder="Current password"
                    value={form.current_password} onChange={(e) => setForm((p) => ({ ...p, current_password: e.target.value }))} className={inputClass} />
                <input required type="password" minLength={8} autoComplete="new-password" placeholder="New password"
                    value={form.password} onChange={(e) => setForm((p) => ({ ...p, password: e.target.value }))} className={inputClass} />
                <input required type="password" minLength={8} autoComplete="new-password" placeholder="New password again"
                    value={form.password_confirmation} onChange={(e) => setForm((p) => ({ ...p, password_confirmation: e.target.value }))} className={inputClass} />
                {message && <p className={message.ok ? 'text-sm text-green-500' : 'text-sm text-red-500'}>{message.text}</p>}
                <button type="submit" disabled={saving}
                    className="flex items-center gap-2 bg-indigo-600 text-white px-5 py-3 rounded-xl text-sm font-semibold disabled:opacity-60">
                    {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                    Change password
                </button>
            </form>
        </div>
    );
}

export default function AdminSettingsPage() {
    const { user } = useAuth();
    const isRootAdmin = user?.admin_role === 'root';
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [admins, setAdmins] = useState<AdminUser[]>([]);
    const [form, setForm] = useState({ name: '', email: '', password: '' });
    const [editingId, setEditingId] = useState<number | null>(null);
    const [error, setError] = useState('');

    const loadAdmins = async () => {
        if (!isRootAdmin) {
            setLoading(false);
            return;
        }
        try {
            const res = await api.get('/admin/users');
            // API answers { data: [...] }
            setAdmins(Array.isArray(res.data) ? res.data : (res.data?.data ?? []));
        } catch (err) {
            console.error('Failed to load admin accounts', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadAdmins();
    }, [isRootAdmin]);

    const resetForm = () => {
        setForm({ name: '', email: '', password: '' });
        setEditingId(null);
        setError('');
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        setError('');
        try {
            if (editingId) {
                await api.patch(`/admin/users/${editingId}`, {
                    name: form.name,
                    email: form.email,
                    password: form.password || undefined,
                });
            } else {
                await api.post('/admin/users', form);
            }
            await loadAdmins();
            resetForm();
        } catch (err) {
            setError(errorText(err, 'Could not save. The e-mail may already be in use.'));
        } finally {
            setSaving(false);
        }
    };

    const startEdit = (a: AdminUser) => {
        setEditingId(a.id);
        setForm({ name: a.name, email: a.email, password: '' });
        setError('');
    };

    const handleRemove = async (id: number) => {
        if (!confirm('Remove admin access for this person? Their student account stays.')) return;
        try {
            await api.delete(`/admin/users/${id}`);
            await loadAdmins();
            if (editingId === id) resetForm();
        } catch (err) {
            alert(errorText(err, 'Could not remove admin access.'));
        }
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center py-40 gap-4">
                <Loader2 className="h-10 w-10 text-indigo-600 animate-spin" />
                <p className="text-sm text-foreground/50">Loading settings…</p>
            </div>
        );
    }

    return (
        <div className="max-w-5xl mx-auto space-y-8 pb-20">
            <div className="bg-card-bg border border-card-border rounded-2xl p-8">
                <h1 className="text-2xl font-semibold">Settings</h1>
                <p className="text-sm text-foreground/50 mt-2">
                    {isRootAdmin ? 'Change your password and manage who else can use the admin panel.' : 'Change your password.'}
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <ChangePasswordCard />

                {isRootAdmin ? (
                    <div className="bg-card-bg border border-card-border rounded-2xl p-8">
                        <h2 className="text-base font-semibold mb-6 flex items-center gap-2">
                            <UserPlus className="h-4 w-4" /> {editingId ? 'Edit editor' : 'Add an editor'}
                        </h2>
                        <p className="text-sm text-foreground/50 -mt-4 mb-6">Editors can add questions, tests and content. Only you can manage editors.</p>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <input required placeholder="Full name" value={form.name}
                                onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} className={inputClass} />
                            <input required type="email" placeholder="E-mail (used to sign in)" value={form.email}
                                onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))} className={inputClass} />
                            <input type="password" minLength={8} required={!editingId}
                                placeholder={editingId ? 'New password (leave blank to keep the current one)' : 'Password (at least 8 characters)'}
                                value={form.password} onChange={(e) => setForm((p) => ({ ...p, password: e.target.value }))} className={inputClass} />
                            {error && <p className="text-sm text-red-500">{error}</p>}
                            <div className="flex items-center gap-3">
                                <button type="submit" disabled={saving}
                                    className="flex items-center gap-2 bg-indigo-600 text-white px-5 py-3 rounded-xl text-sm font-semibold disabled:opacity-60">
                                    {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : editingId ? <Save className="h-4 w-4" /> : <UserPlus className="h-4 w-4" />}
                                    {editingId ? 'Save changes' : 'Add editor'}
                                </button>
                                {editingId && (
                                    <button type="button" onClick={resetForm}
                                        className="px-5 py-3 rounded-xl border border-card-border text-sm font-semibold">
                                        Cancel
                                    </button>
                                )}
                            </div>
                        </form>
                    </div>
                ) : (
                    <div className="bg-card-bg border border-card-border rounded-2xl p-8 text-center">
                        <Shield className="h-10 w-10 text-amber-500 mx-auto mb-4" />
                        <h2 className="text-base font-semibold">Managing editors</h2>
                        <p className="text-sm text-foreground/50 mt-2">Only the main (root) admin can add or remove editors.</p>
                    </div>
                )}
            </div>

            {isRootAdmin && (
                <div className="bg-card-bg border border-card-border rounded-2xl p-8">
                    <h2 className="text-base font-semibold mb-6">People with admin access</h2>
                    <div className="space-y-3">
                        {admins.map((a) => (
                            <div key={a.id} className="border border-card-border rounded-xl p-4 flex items-center justify-between gap-4">
                                <div>
                                    <p className="text-sm font-semibold">{a.name}</p>
                                    <p className="text-xs text-foreground/50">{a.email} · {a.admin_role === 'root' ? 'Main admin' : 'Editor'}</p>
                                </div>
                                {a.admin_role !== 'root' && (
                                    <div className="flex items-center gap-2">
                                        <button onClick={() => startEdit(a)}
                                            className="px-4 py-2 rounded-lg border border-card-border text-sm font-semibold">
                                            Edit
                                        </button>
                                        <button onClick={() => handleRemove(a.id)}
                                            className="px-4 py-2 rounded-lg border border-red-500/30 text-red-500 text-sm font-semibold">
                                            Remove access
                                        </button>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
