'use client';

import { useState, useCallback } from 'react';
import api from '@/lib/api';

export interface Test {
  id: number;
  name_en: string;
  name_hi?: string;
  mode: 'practice' | 'mock' | 'pyq';
  status: 'draft' | 'published';
  duration_sec: number;
  negative_marking: number;
  question_mark: number;
  total_marks: number;
  exam_id?: number;
  questions_count?: number;
}

export interface TestAttempt {
  id: number;
  test_id: number;
  status: 'in_progress' | 'completed' | 'abandoned';
  total_score: number;
  time_taken_sec?: number;
  started_at: string;
  completed_at?: string;
  metadata?: Record<string, unknown>;
}

export interface TestResponse {
  id: number;
  question_id: number;
  selected_option_id?: number;
  is_marked_for_review: boolean;
  time_taken_sec?: number;
  marks_obtained: number;
}

export function useTests() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getTests = useCallback(async (params?: Record<string, unknown>) => {
    setLoading(true);
    try {
      const { data } = await api.get('/tests', { params });
      return data;
    } finally {
      setLoading(false);
    }
  }, []);

  const getTest = useCallback(async (id: number) => {
    const { data } = await api.get(`/tests/${id}`);
    return data.data as Test & { questions: unknown[] };
  }, []);

  const startAttempt = useCallback(async (testId: number) => {
    const { data } = await api.post(`/tests/${testId}/attempts`);
    return data.data as TestAttempt;
  }, []);

  const getLatestAttempt = useCallback(async (testId: number) => {
    try {
      const { data } = await api.get(`/tests/${testId}/latest-attempt`);
      return data.data as TestAttempt | null;
    } catch {
      return null;
    }
  }, []);

  const getAttempt = useCallback(async (attemptId: number) => {
    const { data } = await api.get(`/attempts/${attemptId}`);
    return data.data as TestAttempt & { responses: TestResponse[] };
  }, []);

  const saveResponse = useCallback(async (
    attemptId: number,
    payload: {
      question_id: number;
      selected_option_id?: number;
      is_marked_for_review?: boolean;
      time_taken_sec?: number;
    }
  ) => {
    const { data } = await api.post(`/attempts/${attemptId}/responses`, payload);
    return data.data as TestResponse;
  }, []);

  const syncResponses = useCallback(async (
    attemptId: number,
    responses: Array<{
      question_id: number;
      selected_option_id?: number;
      is_marked_for_review?: boolean;
      time_taken_sec?: number;
    }>
  ) => {
    const { data } = await api.post(`/attempts/${attemptId}/sync`, { responses });
    return data;
  }, []);

  const completeAttempt = useCallback(async (attemptId: number) => {
    const { data } = await api.post(`/attempts/${attemptId}/complete`);
    return data.data as TestAttempt & { summary: Record<string, unknown> };
  }, []);

  return {
    loading,
    error,
    getTests,
    getTest,
    startAttempt,
    getLatestAttempt,
    getAttempt,
    saveResponse,
    syncResponses,
    completeAttempt,
  };
}
