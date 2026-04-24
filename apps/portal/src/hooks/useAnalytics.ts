'use client';

import { useState, useEffect, useCallback } from 'react';
import api from '@/lib/api';

export interface AnalyticsOverview {
  total_tests: number;
  total_score: number;
  avg_accuracy: number;
  score_trend: number[];
  ai_insights?: string;
  ai_insights_ready: boolean;
  strengths?: string[];
  weaknesses?: string[];
  recommendation?: string;
}

export interface TopicPerformance {
  topic_id: number;
  topic_name: string;
  subject_name: string;
  attempts: number;
  avg_accuracy: number;
}

export interface TopicData {
  data: TopicPerformance[];
  strengths: TopicPerformance[];
  weaknesses: TopicPerformance[];
}

export function useAnalyticsOverview() {
  const [data, setData] = useState<AnalyticsOverview | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get('/analytics/overview');
      setData(res.data.data);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed to load analytics');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetch(); }, [fetch]);

  return { data, loading, error, refetch: fetch };
}

export function useTopicPerformance() {
  const [data, setData] = useState<TopicData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/analytics/topics')
      .then(res => setData(res.data))
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  }, []);

  return { data, loading };
}

export function useQuestionExplanation(questionId: number | null) {
  const [explanation, setExplanation] = useState<string | null>(null);
  const [generating, setGenerating] = useState(false);
  const [loading, setLoading] = useState(false);

  const fetch = useCallback(async (qId: number) => {
    setLoading(true);
    try {
      const res = await api.get(`/analytics/explanation/${qId}`);
      if (res.data.generating) {
        setGenerating(true);
      } else {
        setExplanation(res.data.data);
        setGenerating(false);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (questionId) fetch(questionId);
  }, [questionId, fetch]);

  return { explanation, generating, loading, refetch: () => questionId && fetch(questionId) };
}

export function useAssistantChat(attemptId: number) {
  const [messages, setMessages] = useState<Array<{ role: 'user' | 'assistant'; content: string }>>([]);
  const [loading, setLoading] = useState(false);

  const sendMessage = useCallback(async (message: string) => {
    setMessages(prev => [...prev, { role: 'user', content: message }]);
    setLoading(true);
    try {
      const res = await api.post(`/attempts/${attemptId}/assistant-chat`, { message });
      setMessages(prev => [...prev, { role: 'assistant', content: res.data.reply }]);
    } catch {
      setMessages(prev => [...prev, { role: 'assistant', content: 'Sorry, I could not respond. Please try again.' }]);
    } finally {
      setLoading(false);
    }
  }, [attemptId]);

  return { messages, loading, sendMessage };
}
