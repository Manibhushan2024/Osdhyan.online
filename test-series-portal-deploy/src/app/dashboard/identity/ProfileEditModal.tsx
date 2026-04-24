'use client';

import { useState, useRef } from 'react';
import api from '@/lib/api';
import { X, Camera, Save, MapPin, Phone, GraduationCap, Calendar, User as UserIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/components/providers/AuthProvider';

interface ProfileEditModalProps {
    isOpen: boolean;
    onClose: () => void;
    user: any;
    onUpdate: (updatedUser: any) => void;
}

export default function ProfileEditModal({ isOpen, onClose, user, onUpdate }: ProfileEditModalProps) {
    const { updateUser } = useAuth();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: user?.name || '',
        phone: user?.phone || '',
        state: user?.state || '',
        exam_preference: user?.exam_preference || '',
        target_year: user?.target_year || new Date().getFullYear(),
    });
    const [avatarFile, setAvatarFile] = useState<File | null>(null);
    const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    if (!isOpen) return null;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setAvatarFile(file);
            setAvatarPreview(URL.createObjectURL(file));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            // Use FormData for file upload
            const data = new FormData();
            data.append('name', formData.name);
            data.append('phone', formData.phone);
            data.append('email', user?.email); // Required by backend validation
            if (formData.state) data.append('state', formData.state);
            if (formData.exam_preference) data.append('exam_preference', formData.exam_preference);
            if (formData.target_year) data.append('target_year', formData.target_year.toString());

            if (avatarFile) {
                data.append('avatar_file', avatarFile);
            }

            // If we are sending file, we need 'multipart/form-data', api client usually handles this if data is FormData
            // However, our api client might set Content-Type to json by default.
            // Let's explicitly set header or rely on fetch logic.
            // Actually, axios handles FormData automatically.

            // Note: Our backend validation requires email unique check ignore, which we handled.

            const res = await api.post('/profile', data, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            onUpdate(res.data.user);
            updateUser(res.data.user);
            onClose();
        } catch (error) {
            console.error('Failed to update profile', error);
            alert('Failed to update profile. Please check your inputs.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-card-bg border border-card-border w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
                <div className="flex items-center justify-between p-6 border-b border-card-border bg-background/50">
                    <h2 className="text-xl font-black text-foreground uppercase tracking-tight">Edit Identity</h2>
                    <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                        <X className="h-5 w-5 text-foreground/70" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-6 max-h-[80vh] overflow-y-auto custom-scrollbar">
                    {/* Avatar Upload */}
                    <div className="flex flex-col items-center gap-4">
                        <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                            <div className="h-24 w-24 rounded-full overflow-hidden border-2 border-blue-600/50 shadow-lg shadow-blue-500/20 group-hover:border-blue-500 transition-all">
                                {avatarPreview ? (
                                    <img src={avatarPreview} alt="Preview" className="h-full w-full object-cover" />
                                ) : user?.avatar ? (
                                    <img src={`${process.env.NEXT_PUBLIC_API_URL?.replace(/\/api$/, '')}/storage/${user.avatar}`} alt="Avatar" className="h-full w-full object-cover" />
                                ) : (
                                    <div className="h-full w-full bg-blue-600/10 flex items-center justify-center text-blue-600 font-bold text-3xl">
                                        {user?.name?.charAt(0)}
                                    </div>
                                )}
                            </div>
                            <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-full">
                                <Camera className="h-8 w-8 text-white" />
                            </div>
                        </div>
                        <input
                            type="file"
                            ref={fileInputRef}
                            className="hidden"
                            accept="image/*"
                            onChange={handleFileChange}
                        />
                        <p className="text-xs text-foreground/50 font-bold uppercase tracking-widest">Tap to change avatar</p>
                    </div>

                    <div className="space-y-4">
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-foreground/70 uppercase tracking-widest pl-1">Full Name</label>
                            <div className="relative">
                                <UserIcon className="absolute left-3 top-3 h-4 w-4 text-foreground/40" />
                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    className="w-full bg-background/50 border border-card-border rounded-xl px-10 py-2.5 text-sm font-medium text-foreground focus:outline-none focus:border-blue-600 transition-colors"
                                    placeholder="Enter your name"
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-1">
                            <label className="text-xs font-bold text-foreground/70 uppercase tracking-widest pl-1">Phone Number</label>
                            <div className="relative">
                                <Phone className="absolute left-3 top-3 h-4 w-4 text-foreground/40" />
                                <input
                                    type="tel"
                                    name="phone"
                                    value={formData.phone}
                                    onChange={handleChange}
                                    className="w-full bg-background/50 border border-card-border rounded-xl px-10 py-2.5 text-sm font-medium text-foreground focus:outline-none focus:border-blue-600 transition-colors"
                                    placeholder="Registered phone number"
                                    required
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1">
                                <label className="text-xs font-bold text-foreground/70 uppercase tracking-widest pl-1">Target Exam</label>
                                <div className="relative">
                                    <GraduationCap className="absolute left-3 top-3 h-4 w-4 text-foreground/40" />
                                    <input
                                        type="text"
                                        name="exam_preference"
                                        value={formData.exam_preference}
                                        onChange={handleChange}
                                        className="w-full bg-background/50 border border-card-border rounded-xl px-10 py-2.5 text-sm font-medium text-foreground focus:outline-none focus:border-blue-600 transition-colors"
                                        placeholder="e.g. BPSC"
                                    />
                                </div>
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs font-bold text-foreground/70 uppercase tracking-widest pl-1">Target Year</label>
                                <div className="relative">
                                    <Calendar className="absolute left-3 top-3 h-4 w-4 text-foreground/40" />
                                    <input
                                        type="number"
                                        name="target_year"
                                        value={formData.target_year}
                                        onChange={handleChange}
                                        className="w-full bg-background/50 border border-card-border rounded-xl px-10 py-2.5 text-sm font-medium text-foreground focus:outline-none focus:border-blue-600 transition-colors"
                                        placeholder="2026"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="space-y-1">
                            <label className="text-xs font-bold text-foreground/70 uppercase tracking-widest pl-1">State</label>
                            <div className="relative">
                                <MapPin className="absolute left-3 top-3 h-4 w-4 text-foreground/40" />
                                <input
                                    type="text"
                                    name="state"
                                    value={formData.state}
                                    onChange={handleChange}
                                    className="w-full bg-background/50 border border-card-border rounded-xl px-10 py-2.5 text-sm font-medium text-foreground focus:outline-none focus:border-blue-600 transition-colors"
                                    placeholder="Your Residence State"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="pt-4 flex justify-end gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider text-foreground/60 hover:bg-white/5 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="px-6 py-2.5 rounded-xl bg-blue-600 text-white text-xs font-bold uppercase tracking-wider shadow-lg shadow-blue-500/20 hover:bg-blue-700 transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? (
                                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            ) : (
                                <Save className="h-4 w-4" />
                            )}
                            Save Changes
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

