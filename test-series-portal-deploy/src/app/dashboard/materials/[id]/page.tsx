'use client';

import { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import api from '@/lib/api';
import {
    Clock,
    ChevronLeft,
    Calendar,
    User,
    ArrowLeft,
    Share2,
    Bookmark,
    CheckCircle,
    Timer,
    Maximize2,
    Download
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTheme } from '@/components/providers/ThemeProvider';
import Link from 'next/link';

type Material = {
    id: number;
    title: string;
    description: string;
    file_path: string;
    type: string;
    subject?: { name_en: string };
    chapter?: { name_en: string };
    created_at: string;
};

type Progress = {
    time_spent_seconds: number;
    is_completed: boolean;
};

export default function MaterialViewerPage() {
    const { theme } = useTheme();
    const { id } = useParams();
    const router = useRouter();
    const [material, setMaterial] = useState<Material | null>(null);
    const [progress, setProgress] = useState<Progress | null>(null);
    const [loading, setLoading] = useState(true);
    const [secondsSpent, setSecondsSpent] = useState(0);
    const [isCompleted, setIsCompleted] = useState(false);
    const [isActive, setIsActive] = useState(true);
    const [sessionId, setSessionId] = useState<number | null>(null);
    const [syncing, setSyncing] = useState(false);

    // Tracking refs
    const viewerRef = useRef<HTMLDivElement>(null);
    const timerRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        if (id) {
            fetchDetail();
            startSession();
        }
        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
            if (sessionId) syncProgress(0, 'completed');
        };
    }, [id]);

    useEffect(() => {
        if (!loading && material && isActive) {
            timerRef.current = setInterval(() => {
                setSecondsSpent(prev => prev + 1);
            }, 1000);
            return () => {
                if (timerRef.current) clearInterval(timerRef.current);
            };
        }
    }, [loading, material, isActive]);

    const fetchDetail = async () => {
        try {
            const res = await api.get(`/study-materials/${id}`);
            setMaterial(res.data.material);
            setProgress(res.data.progress);
            setIsCompleted(res.data.progress.is_completed);
            setSecondsSpent(res.data.progress.time_spent_seconds);
        } catch (error) {
            console.error('Failed to fetch material', error);
        } finally {
            setLoading(false);
        }
    };

    const startSession = async () => {
        try {
            const res = await api.post('/study-sessions/start', { material_id: id });
            setSessionId(res.data.id);
        } catch (error) {
            console.error('Failed to start session', error);
        }
    };

    const syncProgress = async (timeSpentInInterval: number, status: 'active' | 'paused' | 'completed' = 'active') => {
        if (!sessionId) return;
        setSyncing(true);
        try {
            // Sync with StudySession API
            await api.post(`/study-sessions/${sessionId}/sync`, {
                focus_duration: timeSpentInInterval,
                break_duration: 0,
                status: status
            });
            // Also sync legacy progress for "Mastered" status
            await api.post(`/study-materials/${id}/progress`, {
                time_spent: timeSpentInInterval,
                is_completed: status === 'completed' || isCompleted
            });
        } catch (error) {
            console.error('Failed to sync', error);
        } finally {
            setSyncing(false);
        }
    };

    const handleToggleTimer = () => {
        const newStatus = !isActive ? 'active' : 'paused';
        setIsActive(!isActive);
        syncProgress(0, newStatus);
    };

    const handleSaveAndClose = async () => {
        await syncProgress(0, 'completed');
        router.push('/dashboard/materials');
    };

    const handleScroll = () => {
        if (!viewerRef.current || isCompleted) return;

        const { scrollTop, scrollHeight, clientHeight } = viewerRef.current;
        const reachedBottom = scrollTop + clientHeight >= scrollHeight - 50;

        if (reachedBottom) {
            setIsCompleted(true);
            syncProgress(0); // Mark as mastered in progress
        }
    };

    const formatTime = (totalSeconds: number) => {
        const hr = Math.floor(totalSeconds / 3600);
        const mins = Math.floor((totalSeconds % 3600) / 60);
        const secs = totalSeconds % 60;
        return `${hr > 0 ? hr + 'h ' : ''}${mins}m ${secs}s`;
    };

    if (loading) {
        return (
            <div className="flex justify-center py-40">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    if (!material) return null;

    const getBaseUrl = () => {
        const url = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';
        return url.replace(/\/api$/, '');
    };

    const fileUrl = `${getBaseUrl()}/storage/${material.file_path}`;

    return (
        <div className="flex flex-col h-[calc(100vh-6rem)] max-w-7xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-6 duration-1000">
            {/* Header / Toolbar */}
            <div className="flex items-center justify-between bg-card-bg p-4 rounded-[2rem] border border-card-border shadow-sm transition-all">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => router.back()}
                        className="h-10 w-10 bg-background/50 rounded-xl flex items-center justify-center text-foreground/50 hover:text-blue-600 transition-colors border border-card-border"
                    >
                        <ChevronLeft className="h-5 w-5" />
                    </button>
                    <div>
                        <h1 className="text-sm font-black text-foreground uppercase tracking-tight line-clamp-1">{material.title}</h1>
                        <div className="flex items-center gap-3 mt-0.5">
                            <span className="text-[10px] font-bold text-blue-600 uppercase tracking-widest">{material.subject?.name_en}</span>
                            <span className="h-1 w-1 rounded-full bg-card-border" />
                            <span className="text-[10px] font-bold text-foreground/40 uppercase tracking-widest">{material.type}</span>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-4 md:gap-8">
                    {/* Stats Widget */}
                    <div className={cn(
                        "flex items-center gap-4 px-6 py-2.5 rounded-2xl border transition-all duration-500",
                        isActive
                            ? "bg-blue-600/10 border-blue-600/30 shadow-lg shadow-blue-500/10"
                            : "bg-orange-500/10 border-orange-500/30"
                    )}>
                        <div className="flex items-center gap-3">
                            <div className={cn(
                                "h-2 w-2 rounded-full animate-pulse",
                                isActive ? "bg-blue-600 shadow-[0_0_8px_rgba(37,99,235,1)]" : "bg-orange-500 shadow-[0_0_8px_rgba(249,115,22,1)]"
                            )} />
                            <div className="flex flex-col">
                                <span className="text-[8px] font-black text-foreground/40 uppercase tracking-[0.2em]">{isActive ? 'Flowing' : 'Paused'}</span>
                                <span className="text-xs font-black text-foreground uppercase tracking-widest tabular-nums">{formatTime(secondsSpent)}</span>
                            </div>
                        </div>

                        <div className="h-8 w-px bg-card-border mx-2" />

                        <div className="flex items-center gap-2">
                            <button
                                onClick={handleToggleTimer}
                                className={cn(
                                    "px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all",
                                    isActive
                                        ? "bg-orange-500 text-white hover:bg-orange-600"
                                        : "bg-blue-600 text-white shadow-lg shadow-blue-500/20 hover:scale-105"
                                )}
                            >
                                {isActive ? 'Pause' : 'Resume'}
                            </button>
                            <button
                                onClick={handleSaveAndClose}
                                className="px-4 py-1.5 bg-gray-900 dark:bg-blue-600/20 text-white rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-blue-600 transition-all border border-card-border shadow-md"
                            >
                                Save & Close
                            </button>
                        </div>
                    </div>

                    <div className="hidden lg:flex items-center gap-2 border-l border-card-border pl-8">
                        <a
                            href={fileUrl}
                            download
                            className="h-10 w-10 bg-background/50 text-foreground/40 rounded-xl flex items-center justify-center hover:text-blue-600 transition-all border border-card-border"
                            title="Download Material"
                        >
                            <Download className="h-4 w-4" />
                        </a>
                        <button className="h-10 w-10 bg-background/50 rounded-xl flex items-center justify-center text-foreground/40 hover:text-blue-600 transition-all border border-card-border">
                            <Maximize2 className="h-4 w-4" />
                        </button>
                    </div>
                </div>
            </div>

            {/* Viewer Area */}
            <div className="flex-1 bg-card-bg rounded-[3rem] border border-card-border shadow-xl overflow-hidden relative group">
                {/* Scroll Indicator */}
                {!isCompleted && (
                    <div className="absolute top-0 left-0 w-full h-1 bg-background/50 z-50">
                        <div className="h-full bg-blue-600 transition-all shadow-[0_0_8px_rgba(37,99,235,0.6)]" style={{ width: '0%' }} />
                    </div>
                )}

                <div
                    ref={viewerRef}
                    onScroll={handleScroll}
                    className="h-full overflow-y-auto p-4 md:p-8 custom-scrollbar"
                >
                    {material.type === 'pdf' ? (
                        <div className="w-full h-full min-h-[800px]">
                            <iframe
                                src={`${fileUrl}#toolbar=0`}
                                className="w-full h-full rounded-2xl border-0"
                                title={material.title}
                            />
                        </div>
                    ) : material.type === 'image' ? (
                        <div className="flex justify-center py-10">
                            <img
                                src={fileUrl}
                                alt={material.title}
                                className="max-w-full rounded-3xl shadow-2xl border border-gray-100 dark:border-gray-700"
                            />
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center h-full py-20 text-center space-y-6">
                            <div className="h-20 w-20 bg-blue-50 dark:bg-blue-900/20 rounded-[2rem] flex items-center justify-center text-blue-600">
                                <FolderOpen className="h-10 w-10" />
                            </div>
                            <div>
                                <h2 className="text-xl font-black text-gray-900 dark:text-white uppercase italic">Unsupported Preview</h2>
                                <p className="text-gray-500 dark:text-gray-400 mt-2 font-medium italic">This file type cannot be previewed. Please download it using the button above.</p>
                            </div>
                        </div>
                    )}

                    {/* Completion Sensor at bottom */}
                    {!isCompleted && (
                        <div className="h-20 flex items-center justify-center text-gray-300 italic font-medium">
                            Scroll to the bottom to mark as mastered...
                        </div>
                    )}
                </div>
            </div>

            {/* Achievement Footer (Float) */}
            {isCompleted && (
                <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-[60] animate-in fade-in slide-in-from-bottom-4">
                    <div className="bg-gray-900 dark:bg-blue-600 text-white px-8 py-4 rounded-full flex items-center gap-4 shadow-2xl border border-white/10">
                        <div className="h-8 w-8 bg-blue-500 rounded-full flex items-center justify-center text-white">
                            <CheckCircle className="h-5 w-5" />
                        </div>
                        <span className="text-xs font-black uppercase tracking-[0.2em]">Material Selection Optimized</span>
                    </div>
                </div>
            )}
        </div>
    );
}

import { FolderOpen } from 'lucide-react';
