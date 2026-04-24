'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';

export interface AuthUser {
  id: number;
  name: string;
  username?: string;
  email?: string;
  phone?: string;
  avatar?: string;
  state?: string;
  exam_preference?: string;
  target_year?: number;
  is_admin: boolean;
  admin_role?: string;
  total_tests_attempted: number;
  avg_accuracy: number;
}

interface LoginPayload {
  email?: string;
  phone?: string;
  password?: string;
}

interface OtpPayload {
  phone: string;
  otp: string;
}

export function useAuth() {
  const router = useRouter();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  const getStoredUser = useCallback((): AuthUser | null => {
    if (typeof window === 'undefined') return null;
    try {
      const raw = localStorage.getItem('user');
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }, []);

  useEffect(() => {
    setUser(getStoredUser());
    setLoading(false);
  }, [getStoredUser]);

  const login = useCallback(async (payload: LoginPayload) => {
    const { data } = await api.post('/auth/login', payload);
    localStorage.setItem('auth_token', data.token);
    localStorage.setItem('user', JSON.stringify(data.user));
    setUser(data.user);
    return data.user as AuthUser;
  }, []);

  const sendOtp = useCallback(async (phone: string) => {
    await api.post('/auth/send-otp', { phone });
  }, []);

  const verifyOtp = useCallback(async (payload: OtpPayload) => {
    const { data } = await api.post('/auth/verify-otp', payload);
    localStorage.setItem('auth_token', data.token);
    localStorage.setItem('user', JSON.stringify(data.user));
    setUser(data.user);
    return data.user as AuthUser;
  }, []);

  const logout = useCallback(async () => {
    try {
      await api.post('/auth/logout');
    } finally {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user');
      setUser(null);
      router.push('/auth/login');
    }
  }, [router]);

  const refreshUser = useCallback(async () => {
    const { data } = await api.get('/profile');
    localStorage.setItem('user', JSON.stringify(data.user));
    setUser(data.user);
    return data.user as AuthUser;
  }, []);

  return {
    user,
    loading,
    isAuthenticated: !!user,
    isAdmin: user?.is_admin ?? false,
    isRootAdmin: user?.is_admin && user?.admin_role === 'root',
    login,
    sendOtp,
    verifyOtp,
    logout,
    refreshUser,
  };
}
