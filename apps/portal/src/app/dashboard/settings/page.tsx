'use client';

import { useState } from 'react';
import { useAuth } from '@/components/providers/AuthProvider';
import { useTheme } from '@/components/providers/ThemeProvider';
import api from '@/lib/api';
import {
    User,
    Lock,
    MapPin,
    Mail,
    Camera,
    Moon,
    Sun,
    ShieldCheck,
    ArrowRight,
    Loader2
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useEffect } from 'react';

const getBaseUrl = () =>
    (process.env.NEXT_PUBLIC_STORAGE_URL ?? process.env.NEXT_PUBLIC_API_URL?.replace(/\/api$/, '') ?? '').replace(/\/$/, '');

export default function SettingsPage() {
    const { user, updateUser } = useAuth();
    const { theme, toggleTheme } = useTheme();
    const [loading, setLoading] = useState(false);
    const [activeTab, setActiveTab] = useState('profile');

    const [profileData, setProfileData] = useState({
        name: user?.name || '',
        email: user?.email || '',
        address: user?.address || '',
    });

    useEffect(() => {
        if (user) {
            setProfileData({
                name: user.name || '',
                email: user.email || '',
                address: user.address || '',
            });
        }
    }, [user]);

    const [passwordData, setPasswordData] = useState({
        current_password: '',
        password: '',
        password_confirmation: ''
    });

    const handleProfileUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await api.post('/profile', profileData);
            updateUser(res.data.user);
            alert('Profile updated successfully');
        } catch (error) {
            alert('Failed to update profile');
        } finally {
            setLoading(false);
        }
    };

    const handlePasswordUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            await api.put('/profile/password', passwordData);
            alert('Password changed successfully');
            setPasswordData({ current_password: '', password: '', password_confirmation: '' });
        } catch (error: any) {
            alert(error.response?.data?.message || 'Failed to change password');
        } finally {
            setLoading(false);
        }
    };

    const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('avatar_file', file);
        formData.append('name', profileData.name);
        formData.append('email', profileData.email);

        setLoading(true);
        try {
            const res = await api.post('/profile', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            updateUser(res.data.user);
        } catch (error) {
            alert('Failed to upload avatar');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div>
                <h1 className="text-4xl font-black text-gray-900 dark:text-white uppercase tracking-tighter italic">Portal Settings</h1>
                <p className="text-gray-500 dark:text-gray-400 font-medium italic mt-2">Manage your identity, security, and preferences across osdhyan.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                {/* Sidebar Navigation */}
                <div className="space-y-2">
                    {[
                        { id: 'profile', name: 'Identity', icon: User },
                        { id: 'security', name: 'Security', icon: Lock },
                        { id: 'preferences', name: 'Aesthetics', icon: ShieldCheck },
                    ].map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={cn(
                                "w-full flex items-center gap-3 px-4 py-3 rounded-2xl font-bold uppercase tracking-widest text-[10px] transition-all",
                                activeTab === tab.id
                                    ? "bg-blue-600 text-white shadow-xl shadow-blue-200 dark:shadow-blue-900/20"
                                    : "bg-white dark:bg-gray-800/50 text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800"
                            )}
                        >
                            <tab.icon className="h-4 w-4" />
                            {tab.name}
                        </button>
                    ))}
                </div>

                {/* Content Area */}
                <div className="md:col-span-3">
                    <div className="bg-card-bg border border-card-border rounded-[2.5rem] p-8 md:p-12 shadow-sm">

                        {activeTab === 'profile' && (
                            <div className="space-y-8">
                                <div className="flex flex-col items-center gap-6 mb-8">
                                    <div className="relative group">
                                        <div className="h-32 w-32 rounded-full border-4 border-blue-600/20 p-1 bg-gradient-to-tr from-blue-600 to-indigo-600 overflow-hidden shadow-2xl flex items-center justify-center">
                                            {user?.avatar ? (
                                                <img
                                                    src={`${getBaseUrl()}/storage/${user.avatar}`}
                                                    alt={user?.name}
                                                    className="h-full w-full object-cover rounded-full"
                                                    onError={(e) => {
                                                        (e.target as HTMLImageElement).src = '';
                                                        (e.target as HTMLImageElement).style.display = 'none';
                                                    }}
                                                />
                                            ) : (
                                                <div className="text-3xl font-black text-white uppercase">
                                                    {user?.name?.charAt(0) || 'U'}
                                                </div>
                                            )}
                                        </div>
                                        <label className="absolute bottom-0 right-0 p-2 bg-blue-600 text-white rounded-full cursor-pointer shadow-lg hover:bg-blue-700 transition-colors">
                                            <Camera className="h-4 w-4" />
                                            <input type="file" className="hidden" onChange={handleAvatarUpload} accept="image/*" />
                                        </label>
                                    </div>
                                    <div className="text-center">
                                        <h3 className="text-xl font-black text-gray-900 dark:text-white uppercase tracking-tight">{user?.name}</h3>
                                        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-1">osdhyan Candidate</p>
                                    </div>
                                </div>

                                <form onSubmit={handleProfileUpdate} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest px-2">Full Legal Name</label>
                                        <div className="relative">
                                            <User className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-300" />
                                            <input
                                                type="text"
                                                className="w-full bg-gray-50 dark:bg-gray-900/50 border border-gray-100 dark:border-gray-700 p-4 pl-12 rounded-2xl font-bold text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-600 outline-none"
                                                value={profileData.name}
                                                onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest px-2">Email Address</label>
                                        <div className="relative">
                                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-300" />
                                            <input
                                                type="email"
                                                className="w-full bg-gray-50 dark:bg-gray-900/50 border border-gray-100 dark:border-gray-700 p-4 pl-12 rounded-2xl font-bold text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-600 outline-none"
                                                value={profileData.email}
                                                onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                                            />
                                        </div>
                                    </div>

                                    <div className="md:col-span-2 space-y-2">
                                        <label className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest px-2">Correspondence Address</label>
                                        <div className="relative">
                                            <MapPin className="absolute left-4 top-4 h-4 w-4 text-gray-300" />
                                            <textarea
                                                rows={3}
                                                className="w-full bg-gray-50 dark:bg-gray-900/50 border border-gray-100 dark:border-gray-700 p-4 pl-12 rounded-2xl font-bold text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-600 outline-none resize-none"
                                                value={profileData.address}
                                                onChange={(e) => setProfileData({ ...profileData, address: e.target.value })}
                                            />
                                        </div>
                                    </div>

                                    <div className="md:col-span-2">
                                        <button
                                            disabled={loading}
                                            className="w-full py-4 bg-gray-900 dark:bg-blue-600 text-white font-black rounded-2xl hover:bg-blue-600 dark:hover:bg-blue-700 transition-all shadow-xl shadow-blue-100 dark:shadow-none uppercase tracking-widest text-xs flex items-center justify-center gap-2"
                                        >
                                            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                                            Update Identity Detail
                                        </button>
                                    </div>
                                </form>
                            </div>
                        )}

                        {activeTab === 'security' && (
                            <div className="space-y-8">
                                <h3 className="text-xl font-black text-gray-900 dark:text-white uppercase tracking-tight">Security Credentials</h3>
                                <form onSubmit={handlePasswordUpdate} className="space-y-6">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest px-2">Current Secret Key</label>
                                        <input
                                            type="password"
                                            className="w-full bg-gray-50 dark:bg-gray-900/50 border border-gray-100 dark:border-gray-700 p-4 rounded-2xl font-bold text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-600 outline-none"
                                            value={passwordData.current_password}
                                            onChange={(e) => setPasswordData({ ...passwordData, current_password: e.target.value })}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest px-2">New Password Pattern</label>
                                        <input
                                            type="password"
                                            className="w-full bg-gray-50 dark:bg-gray-900/50 border border-gray-100 dark:border-gray-700 p-4 rounded-2xl font-bold text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-600 outline-none"
                                            value={passwordData.password}
                                            onChange={(e) => setPasswordData({ ...passwordData, password: e.target.value })}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest px-2">Confirm Pattern</label>
                                        <input
                                            type="password"
                                            className="w-full bg-gray-50 dark:bg-gray-900/50 border border-gray-100 dark:border-gray-700 p-4 rounded-2xl font-bold text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-600 outline-none"
                                            value={passwordData.password_confirmation}
                                            onChange={(e) => setPasswordData({ ...passwordData, password_confirmation: e.target.value })}
                                        />
                                    </div>
                                    <button
                                        disabled={loading}
                                        className="w-full py-4 bg-gray-900 dark:bg-blue-600 text-white font-black rounded-2xl hover:bg-blue-600 dark:hover:bg-blue-700 transition-all uppercase tracking-widest text-xs flex items-center justify-center gap-2"
                                    >
                                        {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                                        Update Security Pattern
                                    </button>
                                </form>
                            </div>
                        )}

                        {activeTab === 'preferences' && (
                            <div className="space-y-10">
                                <div className="space-y-4">
                                    <h3 className="text-xl font-black text-gray-900 dark:text-white uppercase tracking-tight">Portal Aesthetic</h3>
                                    <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">Choose how osdhyan appears on your device. Dark mode is recommended for late-night focus sessions.</p>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <button
                                        onClick={() => theme === 'dark' && toggleTheme()}
                                        className={cn(
                                            "relative p-8 rounded-[2rem] border-2 transition-all group overflow-hidden bg-white",
                                            theme === 'light' ? "border-blue-600 shadow-neon" : "border-card-border"
                                        )}
                                    >
                                        <div className="absolute top-0 right-0 w-24 h-24 bg-blue-600/5 rounded-full -mr-8 -mt-8" />
                                        <Sun className={cn("h-8 w-8 mb-4", theme === 'light' ? "text-blue-600" : "text-gray-400")} />
                                        <p className={cn("font-black uppercase tracking-widest text-xs", theme === 'light' ? "text-blue-600" : "text-gray-400")}>Solar Light</p>
                                        {theme === 'light' && <ShieldCheck className="absolute top-4 right-4 h-4 w-4 text-blue-600" />}
                                    </button>

                                    <button
                                        onClick={() => theme === 'light' && toggleTheme()}
                                        className={cn(
                                            "relative p-8 rounded-[2rem] border-2 transition-all group overflow-hidden bg-[#080808] text-white",
                                            theme === 'dark' ? "border-blue-500 shadow-neon" : "border-transparent"
                                        )}
                                    >
                                        <div className="absolute top-0 right-0 w-24 h-24 bg-white/5 rounded-full -mr-8 -mt-8" />
                                        <Moon className={cn("h-8 w-8 mb-4", theme === 'dark' ? "text-blue-400" : "text-white")} />
                                        <p className={cn("font-black uppercase tracking-widest text-xs", theme === 'dark' ? "text-blue-400" : "text-white")}>Midnight Stealth</p>
                                        {theme === 'dark' && <ShieldCheck className="absolute top-4 right-4 h-4 w-4 text-blue-400" />}
                                    </button>
                                </div>
                            </div>
                        )}

                    </div>
                </div>
            </div>
        </div>
    );
}
