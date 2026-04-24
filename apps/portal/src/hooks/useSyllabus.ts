'use client';

import { useState, useEffect, useCallback } from 'react';
import api from '@/lib/api';

export interface Exam {
  id: number;
  name_en: string;
  name_hi?: string;
  slug: string;
  description_en?: string;
}

export interface Subject {
  id: number;
  exam_id: number;
  name_en: string;
  name_hi?: string;
  slug: string;
}

export interface Chapter {
  id: number;
  subject_id: number;
  name_en: string;
  name_hi?: string;
  slug: string;
}

export interface Topic {
  id: number;
  chapter_id: number;
  name_en: string;
  name_hi?: string;
  slug: string;
}

export function useExams() {
  const [exams, setExams] = useState<Exam[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/exams')
      .then(res => setExams(res.data.data))
      .catch(() => setExams([]))
      .finally(() => setLoading(false));
  }, []);

  return { exams, loading };
}

export function useSubjects(examId: number | null) {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!examId) { setSubjects([]); return; }
    setLoading(true);
    api.get(`/exams/${examId}/subjects`)
      .then(res => setSubjects(res.data.data))
      .catch(() => setSubjects([]))
      .finally(() => setLoading(false));
  }, [examId]);

  return { subjects, loading };
}

export function useChapters(subjectId: number | null) {
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!subjectId) { setChapters([]); return; }
    setLoading(true);
    api.get(`/subjects/${subjectId}/chapters`)
      .then(res => setChapters(res.data.data))
      .catch(() => setChapters([]))
      .finally(() => setLoading(false));
  }, [subjectId]);

  return { chapters, loading };
}

export function useTopics(chapterId: number | null) {
  const [topics, setTopics] = useState<Topic[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!chapterId) { setTopics([]); return; }
    setLoading(true);
    api.get(`/chapters/${chapterId}/topics`)
      .then(res => setTopics(res.data.data))
      .catch(() => setTopics([]))
      .finally(() => setLoading(false));
  }, [chapterId]);

  return { topics, loading };
}

export function useFullHierarchy(examId: number | null) {
  const [hierarchy, setHierarchy] = useState<(Subject & { chapters: (Chapter & { topics: Topic[] })[] })[]>([]);
  const [loading, setLoading] = useState(false);

  const fetch = useCallback(async (id: number) => {
    setLoading(true);
    try {
      const res = await api.get(`/exams/${id}/full`);
      setHierarchy(res.data.data);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (examId) fetch(examId);
  }, [examId, fetch]);

  return { hierarchy, loading };
}
