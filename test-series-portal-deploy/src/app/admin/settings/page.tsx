'use client';

import { useEffect, useState } from 'react';
import { Loader2, Shield, UserPlus, Save } from 'lucide-react';
import api from '@/lib/api';
import { useAuth } from '@/components/providers/AuthProvider';

type EditorUser = {
    id: number;
    name: string;
    username: string;
    email: string;
};

export default function AdminSettingsPage() {
    const { user } = useAuth();
    const isRootAdmin = user?.admin_role === 'root';
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [editors, setEditors] = useState<EditorUser[]>([]);
    const [form, setForm] = useState({
        name: '',
        username: '',
        email: '',
        password: '',
    });
    const [editingId, setEditingId] = useState<number | null>(null);

    const loadEditors = async () => {
        if (!isRootAdmin) {
            setLoading(false);
            return;
        }

        try {
            const res = await api.get('/admin/users');
            setEditors(res.data);
        } catch (error) {
            console.error('Failed to load editors', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadEditors();
    }, [isRootAdmin]);

    const resetForm = () => {
        setForm({ name: '', username: '', email: '', password: '' });
        setEditingId(null);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);

        try {
            if (editingId) {
                await api.patch(`/admin/users/${editingId}`, {
                    name: form.name,
                    username: form.username,
                    email: form.email,
                    password: form.password || undefined,
                });
            } else {
                await api.post('/admin/users', form);
            }

            await loadEditors();
            resetForm();
        } catch (error) {
            console.error('Failed to save editor', error);
            alert('Unable to save editor. Check username/email uniqueness.');
        } finally {
            setSaving(false);
        }
    };

    const startEdit = (editor: EditorUser) => {
        setEditingId(editor.id);
        setForm({
            name: editor.name,
            username: editor.username,
            email: editor.email,
            password: '',
        });
    };

    const handleDelete = async (editorId: number) => {
        if (!confirm('Delete this editor account?')) return;

        try {
            await api.delete(`/admin/users/${editorId}`);
            await loadEditors();
            if (editingId === editorId) {
                resetForm();
            }
        } catch (error) {
            console.error('Failed to delete editor', error);
            alert('Unable to delete editor account.');
        }
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center py-40 gap-4">
                <Loader2 className="h-10 w-10 text-indigo-600 animate-spin" />
                <p className="text-[10px] font-black text-foreground/40 uppercase tracking-[0.3em]">Loading Control Matrix...</p>
            </div>
        );
    }

    if (!isRootAdmin) {
        return (
            <div className="bg-card-bg border border-card-border rounded-[2rem] p-10 text-center">
                <Shield className="h-10 w-10 text-amber-500 mx-auto mb-4" />
                <h2 className="text-xl font-black uppercase tracking-tight">Root Access Required</h2>
                <p className="text-[10px] font-black text-foreground/40 uppercase tracking-[0.2em] mt-3">
                    Only the root admin can manage editor accounts.
                </p>
            </div>
        );
    }

    return (
        <div className="max-w-5xl mx-auto space-y-8 pb-20">
            <div className="bg-card-bg border border-card-border rounded-[2rem] p-8">
                <h1 className="text-2xl font-black uppercase tracking-tight italic">Admin Settings</h1>
                <p className="text-[10px] font-black text-foreground/40 uppercase tracking-[0.2em] mt-2">
                    Create and manage editor accounts.
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-card-bg border border-card-border rounded-[2rem] p-8">
                    <h2 className="text-sm font-black uppercase tracking-widest mb-6">
                        {editingId ? 'Edit Editor Account' : 'Create Editor Account'}
                    </h2>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <input
                            required
                            placeholder="Name"
                            value={form.name}
                            onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                            className="w-full bg-white/5 border border-card-border rounded-xl p-3 text-sm"
                        />
                        <input
                            required
                            placeholder="Username"
                            value={form.username}
                            onChange={(e) => setForm((p) => ({ ...p, username: e.target.value }))}
                            className="w-full bg-white/5 border border-card-border rounded-xl p-3 text-sm"
                        />
                        <input
                            required
                            type="email"
                            placeholder="Email"
                            value={form.email}
                            onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
                            className="w-full bg-white/5 border border-card-border rounded-xl p-3 text-sm"
                        />
                        <input
                            type="password"
                            placeholder={editingId ? 'Password (leave blank to keep unchanged)' : 'Password'}
                            required={!editingId}
                            value={form.password}
                            onChange={(e) => setForm((p) => ({ ...p, password: e.target.value }))}
                            className="w-full bg-white/5 border border-card-border rounded-xl p-3 text-sm"
                        />
                        <div className="flex items-center gap-3">
                            <button
                                type="submit"
                                disabled={saving}
                                className="flex items-center gap-2 bg-indigo-600 text-white px-5 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest disabled:opacity-60"
                            >
                                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : editingId ? <Save className="h-4 w-4" /> : <UserPlus className="h-4 w-4" />}
                                {editingId ? 'Update Editor' : 'Create Editor'}
                            </button>
                            {editingId && (
                                <button
                                    type="button"
                                    onClick={resetForm}
                                    className="px-5 py-3 rounded-xl border border-card-border text-[10px] font-black uppercase tracking-widest"
                                >
                                    Cancel
                                </button>
                            )}
                        </div>
                    </form>
                </div>

                <div className="bg-card-bg border border-card-border rounded-[2rem] p-8">
                    <h2 className="text-sm font-black uppercase tracking-widest mb-6">Editors</h2>
                    <div className="space-y-3">
                        {editors.length === 0 && (
                            <p className="text-[10px] font-black text-foreground/30 uppercase tracking-[0.2em]">No editors created yet.</p>
                        )}
                        {editors.map((editor) => (
                            <div key={editor.id} className="border border-card-border rounded-xl p-4 flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-black">{editor.name}</p>
                                    <p className="text-[10px] text-foreground/50">@{editor.username} | {editor.email}</p>
                                </div>
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => startEdit(editor)}
                                        className="px-4 py-2 rounded-lg border border-card-border text-[10px] font-black uppercase tracking-widest"
                                    >
                                        Edit
                                    </button>
                                    <button
                                        onClick={() => handleDelete(editor.id)}
                                        className="px-4 py-2 rounded-lg border border-red-500/30 text-red-500 text-[10px] font-black uppercase tracking-widest"
                                    >
                                        Delete
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
