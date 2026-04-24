'use client';

import { useState, useEffect, useCallback } from 'react';
import api from '@/lib/api';

export interface TestSeries {
  id: number;
  exam_id?: number;
  name_en: string;
  name_hi?: string;
  description_en?: string;
  category?: string;
  is_published: boolean;
  tests_count?: number;
  enrolled?: boolean;
}

export function useTestSeries(params?: Record<string, unknown>) {
  const [series, setSeries] = useState<TestSeries[]>([]);
  const [loading, setLoading] = useState(true);
  const [meta, setMeta] = useState<Record<string, unknown>>({});

  const refresh = useCallback(async () => {
    const { data } = await api.get('/test-series', { params });
    setSeries(data.data);
    if (data.meta) setMeta(data.meta);
  }, [params]);

  useEffect(() => {
    refresh().finally(() => setLoading(false));
  }, [refresh]);

  return { series, loading, meta, refresh };
}

export function useEnrolledSeries() {
  const [series, setSeries] = useState<TestSeries[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/test-series/enrolled')
      .then(res => setSeries(res.data.data))
      .catch(() => setSeries([]))
      .finally(() => setLoading(false));
  }, []);

  return { series, loading };
}

export function useSeriesDetail(seriesId: number | null) {
  const [series, setSeries] = useState<TestSeries | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!seriesId) return;
    setLoading(true);
    api.get(`/test-series/${seriesId}`)
      .then(res => setSeries(res.data.data))
      .catch(() => setSeries(null))
      .finally(() => setLoading(false));
  }, [seriesId]);

  const enroll = useCallback(async () => {
    if (!seriesId) return;
    await api.post(`/test-series/${seriesId}/enroll`);
    setSeries(prev => prev ? { ...prev, enrolled: true } : prev);
  }, [seriesId]);

  const unenroll = useCallback(async () => {
    if (!seriesId) return;
    await api.post(`/test-series/${seriesId}/unenroll`);
    setSeries(prev => prev ? { ...prev, enrolled: false } : prev);
  }, [seriesId]);

  return { series, loading, enroll, unenroll };
}
