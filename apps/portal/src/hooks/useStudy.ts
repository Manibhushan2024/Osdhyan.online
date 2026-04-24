'use client';

import { useState, useEffect, useCallback } from 'react';
import api from '@/lib/api';

export interface StudyGoal {
  id: number;
  exam_id?: number;
  subject_id?: number;
  target_minutes: number;
  target_date?: string;
  status: 'active' | 'inactive' | 'completed';
}

export interface StudySession {
  id: number;
  subject_id?: number;
  topic_id?: number;
  started_at?: string;
  ended_at?: string;
  duration_sec: number;
  status: 'active' | 'paused' | 'completed' | 'abandoned';
}

export interface Note {
  id: number;
  title: string;
  content?: string;
  exam_id?: number;
  subject_id?: number;
  topic_id?: number;
  created_at: string;
  updated_at: string;
}

// ─── Study Goals ──────────────────────────────────────────────────

export function useStudyGoals() {
  const [goals, setGoals] = useState<StudyGoal[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    const { data } = await api.get('/study-goals');
    setGoals(data.data);
  }, []);

  useEffect(() => {
    refresh().finally(() => setLoading(false));
  }, [refresh]);

  const createGoal = useCallback(async (payload: Partial<StudyGoal>) => {
    const { data } = await api.post('/study-goals', payload);
    setGoals(prev => [data.data, ...prev]);
    return data.data as StudyGoal;
  }, []);

  const deleteGoal = useCallback(async (id: number) => {
    await api.delete(`/study-goals/${id}`);
    setGoals(prev => prev.filter(g => g.id !== id));
  }, []);

  return { goals, loading, createGoal, deleteGoal, refresh };
}

// ─── Study Sessions ───────────────────────────────────────────────

export function useStudySession() {
  const [activeSession, setActiveSession] = useState<StudySession | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/study-sessions/active')
      .then(res => setActiveSession(res.data.data))
      .catch(() => setActiveSession(null))
      .finally(() => setLoading(false));
  }, []);

  const startSession = useCallback(async (payload: { subject_id?: number; topic_id?: number }) => {
    const { data } = await api.post('/study-sessions/start', payload);
    setActiveSession(data.data);
    return data.data as StudySession;
  }, []);

  const pauseSession = useCallback(async (id: number) => {
    const { data } = await api.post(`/study-sessions/${id}/pause`);
    setActiveSession(data.data);
  }, []);

  const resumeSession = useCallback(async (id: number) => {
    const { data } = await api.post(`/study-sessions/${id}/resume`);
    setActiveSession(data.data);
  }, []);

  const stopSession = useCallback(async (id: number) => {
    const { data } = await api.post(`/study-sessions/${id}/stop`);
    setActiveSession(null);
    return data.data as StudySession;
  }, []);

  const syncSession = useCallback(async (id: number, duration_sec: number) => {
    await api.post(`/study-sessions/${id}/sync`, { duration_sec });
  }, []);

  return { activeSession, loading, startSession, pauseSession, resumeSession, stopSession, syncSession };
}

// ─── Notes ────────────────────────────────────────────────────────

export function useNotes() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async (params?: Record<string, unknown>) => {
    const { data } = await api.get('/notes', { params });
    setNotes(data.data);
  }, []);

  useEffect(() => {
    refresh().finally(() => setLoading(false));
  }, [refresh]);

  const createNote = useCallback(async (payload: Partial<Note>) => {
    const { data } = await api.post('/notes', payload);
    setNotes(prev => [data.data, ...prev]);
    return data.data as Note;
  }, []);

  const updateNote = useCallback(async (id: number, payload: Partial<Note>) => {
    const { data } = await api.patch(`/notes/${id}`, payload);
    setNotes(prev => prev.map(n => n.id === id ? data.data : n));
    return data.data as Note;
  }, []);

  const deleteNote = useCallback(async (id: number) => {
    await api.delete(`/notes/${id}`);
    setNotes(prev => prev.filter(n => n.id !== id));
  }, []);

  return { notes, loading, createNote, updateNote, deleteNote, refresh };
}
