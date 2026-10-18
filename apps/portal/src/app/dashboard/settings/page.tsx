'use client';

import { useState } from 'react';
import { useAuth } from '@/components/providers/AuthProvider';
import { useTheme } from '@/components/providers/ThemeProvider';
import api from '@/lib/api';
import {
    User,
    Lock,
    Camera,
    Moon,
    Sun,
    Palette,
    Loader2,
    Check,
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
            alert('Profile updated');
        } catch (error) {
            alert('Could not update your profile. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handlePasswordUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            await api.put('/profile/password', passwordData);
            alert('Password changed');
            setPasswordData({ current_password: '', password: '', password_confirmation: '' });
        } catch (error: any) {
            alert(error.response?.data?.message || 'Could not change your password. Please try again.');
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
            alert('Could not upload the photo. Please try a smaller image.');
        } finally {
            setLoading(false);
        }
    };

    const tabs = [
        { id: 'profile', name: 'Profile', icon: User },
        { id: 'security', name: 'Password', icon: Lock },
        { id: 'preferences', name: 'Appearance', icon: Palette },
    ];

    return (
        <div className="space-y-6 pb-12 max-w-4xl">
            <div>
                <h1 className="page-title">Settings</h1>
                <p className="page-subtitle">Manage your profile, password and appearance.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 md:gap-6">
                {/* Tabs */}
                <div className="flex md:flex-col gap-2 overflow-x-auto no-scrollbar -mx-4 px-4 md:mx-0 md:px-0">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={cn(
                                'flex items-center gap-2 px-4 py-2.5 min-h-[44px] rounded-xl text-sm font-medium whitespace-nowrap transition-colors',
                                activeTab === tab.id
                                    ? 'bg-primary text-white'
                                    : 'bg-card-bg border border-card-border text-muted-foreground hover:text-foreground hover:bg-muted'
                            )}
                        >
                            <tab.icon className="h-4 w-4" />
                            {tab.name}
                        </button>
                    ))}
                </div>

                {/* Content */}
                <div className="md:col-span-3">
                    <div className="card p-5 sm:p-8">
                        {activeTab === 'profile' && (
                            <div className="space-y-6">
                                <div className="flex items-center gap-5">
                                    <div className="relative">
                                        <div className="h-20 w-20 rounded-full overflow-hidden bg-accent text-accent-foreground flex items-center justify-center text-2xl font-bold uppercase">
                                            {user?.avatar ? (
                                                // eslint-disable-next-line @next/next/no-img-element
                                                <img
                                                    src={`${getBaseUrl()}/storage/${user.avatar}`}
                                                    alt={user?.name || 'Profile photo'}
                                                    className="h-full w-full object-cover"
                                                    onError={(e) => {
                                                        (e.target as HTMLImageElement).style.display = 'none';
                                                    }}
                                                />
                                            ) : (
                                                <span>{user?.name?.charAt(0) || 'U'}</span>
                                            )}
                                        </div>
                                        <label className="absolute -bottom-1 -right-1 h-9 w-9 rounded-full bg-primary text-white flex items-center justify-center cursor-pointer shadow-sm hover:bg-blue-700" title="Change photo">
                                            <Camera className="h-4 w-4" />
                                            <input type="file" className="hidden" onChange={handleAvatarUpload} accept="image/*" />
                                        </label>
                                    </div>
                                    <div>
                                        <h2 className="text-lg font-semibold">{user?.name}</h2>
                                        <p className="text-sm text-muted-foreground">Tap the camera icon to change your photo.</p>
                                    </div>
                                </div>

                                <form onSubmit={handleProfileUpdate} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label htmlFor="name" className="label">Full name</label>
                                        <input
                                            id="name"
                                            type="text"
                                            autoComplete="name"
                                            className="input"
                                            value={profileData.name}
                                            onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                                        />
                                    </div>

                                    <div>
                                        <label htmlFor="email" className="label">Email</label>
                                        <input
                                            id="email"
                                            type="email"
                                            autoComplete="email"
                                            className="input"
                                            value={profileData.email}
                                            onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                                        />
                                    </div>

                                    <div className="md:col-span-2">
                                        <label htmlFor="address" className="label">Address <span className="text-muted-foreground font-normal">(optional)</span></label>
                                        <textarea
                                            id="address"
                                            rows={3}
                                            autoComplete="street-address"
                                            className="input resize-none"
                                            value={profileData.address}
                                            onChange={(e) => setProfileData({ ...profileData, address: e.target.value })}
                                        />
                                    </div>

                                    <div className="md:col-span-2">
                                        <button disabled={loading} className="btn btn-primary w-full sm:w-auto">
                                            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                                            Save changes
                                        </button>
                                    </div>
                                </form>
                            </div>
                        )}

                        {activeTab === 'security' && (
                            <div className="space-y-6">
                                <div>
                                    <h2 className="text-lg font-semibold">Change password</h2>
                                    <p className="text-sm text-muted-foreground mt-1">Use at least 8 characters.</p>
                                </div>
                                <form onSubmit={handlePasswordUpdate} className="space-y-4 max-w-md">
                                    <div>
                                        <label htmlFor="current_password" className="label">Current password</label>
                                        <input
                                            id="current_password"
                                            type="password"
                                            autoComplete="current-password"
                                            className="input"
                                            value={passwordData.current_password}
                                            onChange={(e) => setPasswordData({ ...passwordData, current_password: e.target.value })}
                                        />
                                    </div>
                                    <div>
                                        <label htmlFor="new_password" className="label">New password</label>
                                        <input
                                            id="new_password"
                                            type="password"
                                            autoComplete="new-password"
                                            className="input"
                                            value={passwordData.password}
                                            onChange={(e) => setPasswordData({ ...passwordData, password: e.target.value })}
                                        />
                                    </div>
                                    <div>
                                        <label htmlFor="confirm_password" className="label">Confirm new password</label>
                                        <input
                                            id="confirm_password"
                                            type="password"
                                            autoComplete="new-password"
                                            className="input"
                                            value={passwordData.password_confirmation}
                                            onChange={(e) => setPasswordData({ ...passwordData, password_confirmation: e.target.value })}
                                        />
                                    </div>
                                    <button disabled={loading} className="btn btn-primary w-full sm:w-auto">
                                        {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                                        Change password
                                    </button>
                                </form>
                            </div>
                        )}

                        {activeTab === 'preferences' && (
                            <div className="space-y-6">
                                <div>
                                    <h2 className="text-lg font-semibold">Appearance</h2>
                                    <p className="text-sm text-muted-foreground mt-1">Choose how OSDHYAN looks on this device.</p>
                                </div>

                                <div className="grid grid-cols-2 gap-3 max-w-md">
                                    <button
                                        onClick={() => theme === 'dark' && toggleTheme()}
                                        aria-pressed={theme === 'light'}
                                        className={cn(
                                            'relative p-5 rounded-2xl border-2 text-left bg-white text-slate-900 transition-colors',
                                            theme === 'light' ? 'border-primary' : 'border-card-border'
                                        )}
                                    >
                                        <Sun className="h-6 w-6 mb-3 text-amber-500" />
                                        <p className="font-semibold">Light</p>
                                        {theme === 'light' && <Check className="absolute top-3 right-3 h-5 w-5 text-primary" />}
                                    </button>

                                    <button
                                        onClick={() => theme === 'light' && toggleTheme()}
                                        aria-pressed={theme === 'dark'}
                                        className={cn(
                                            'relative p-5 rounded-2xl border-2 text-left bg-slate-900 text-white transition-colors',
                                            theme === 'dark' ? 'border-primary' : 'border-card-border'
                                        )}
                                    >
                                        <Moon className="h-6 w-6 mb-3 text-blue-300" />
                                        <p className="font-semibold">Dark</p>
                                        {theme === 'dark' && <Check className="absolute top-3 right-3 h-5 w-5 text-blue-300" />}
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
