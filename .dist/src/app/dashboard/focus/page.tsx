'use client';

import { useState, useEffect, useRef } from 'react';
import api from '@/lib/api';
import {
    Play,
    Pause,
    RotateCcw,
    Coffee,
    Zap,
    ShieldCheck,
    Target as TargetIcon
} from 'lucide-react';
import { cn } from '@/lib/utils';

export default function FocusTimerPage() {
    const [isActive, setIsActive] = useState(false);
    const [isPaused, setIsPaused] = useState(false);
    const [time, setTime] = useState(3600); // 1 hour default
    const [customHours, setCustomHours] = useState(1);
    const [customMinutes, setCustomMinutes] = useState(0);
    const [focusTime, setFocusTime] = useState(0);
    const [breakTime, setBreakTime] = useState(0);
    const [goals, setGoals] = useState<any[]>([]);
    const [selectedGoalId, setSelectedGoalId] = useState<number | null>(null);
    const [sessionId, setSessionId] = useState<number | null>(null);
    const [currentChallenge, setCurrentChallenge] = useState<string | null>(null);
    const [showChallenge, setShowChallenge] = useState(false);
    const [challengePoints, setChallengePoints] = useState(0);

    const timerRef = useRef<any>(null);
    const stateRef = useRef({ isPaused: false, isActive: false });

    useEffect(() => {
        stateRef.current = { isPaused, isActive };
    }, [isPaused, isActive]);

    const challenges = [
        "Active Recall: Summarize the last 15 minutes of your study in 3 sentences.",
        "Mental Map: Visualize the core hierarchy of the topic you just read.",
        "Self-Test: Quick! What is the most complex concept you've studied today?",
        "Pre-Read: What are the next 3 things you need to learn in this chapter?"
    ];

    const triggerChallenge = () => {
        const randomChallenge = challenges[Math.floor(Math.random() * challenges.length)];
        setCurrentChallenge(randomChallenge);
        setShowChallenge(true);
    };

    useEffect(() => {
        fetchGoals();
        return () => clearInterval(timerRef.current);
    }, []);

    const fetchGoals = async () => {
        try {
            const res = await api.get('/study-goals');
            setGoals(res.data);
            if (res.data.length > 0) setSelectedGoalId(res.data[0].id);
        } catch (error) {
            console.error('Failed to fetch goals', error);
        }
    };

    const startTimer = async () => {
        try {
            const res = await api.post('/study-sessions/start', {
                study_goal_id: selectedGoalId
            });
            setSessionId(res.data.id);

            const totalSeconds = (customHours * 3600) + (customMinutes * 60);
            setTime(totalSeconds);
            setIsActive(true);
            setIsPaused(false);

            timerRef.current = setInterval(() => {
                if (!stateRef.current.isPaused) {
                    setTime(prev => Math.max(0, prev - 1));
                    setFocusTime(prev => {
                        const newFocusTime = prev + 1;
                        if (newFocusTime > 0 && newFocusTime % 900 === 0) { // Every 15 mins
                            triggerChallenge();
                        }
                        return newFocusTime;
                    });
                } else {
                    setBreakTime(prev => prev + 1);
                }
            }, 1000);
        } catch (error) {
            alert('Failed to start session');
        }
    };

    const handleChallengeComplete = () => {
        setChallengePoints(prev => prev + 50);
        setShowChallenge(false);
        setCurrentChallenge(null);
    };

    const togglePause = async () => {
        if (!sessionId) return;
        try {
            if (!isPaused) {
                await api.post(`/study-sessions/${sessionId}/pause`);
            } else {
                await api.post(`/study-sessions/${sessionId}/resume`);
            }
            setIsPaused(!isPaused);
        } catch (error) {
            console.error('Pause/Resume failed', error);
        }
    };

    const stopTimer = async () => {
        if (!sessionId) return;
        try {
            await api.post(`/study-sessions/${sessionId}/stop`, {
                focus_duration_sec: focusTime,
                break_duration_sec: breakTime
            });

            // Add points if backend supports it or store in session
            if (challengePoints > 0) {
                await api.post('/achievements', {
                    type: 'points',
                    name: 'Focus Bonus',
                    points: challengePoints,
                    description: `Earned ${challengePoints} points through focus challenges.`
                });
            }

            clearInterval(timerRef.current);
            setIsActive(false);
            setSessionId(null);
            setChallengePoints(0);
            alert(`Session Completed! Focus: ${Math.floor(focusTime / 60)}m, Break: ${Math.floor(breakTime / 60)}m. Points Earned: ${challengePoints}`);
        } catch (error) {
            alert('Failed to stop session');
        }
    };

    const formatTime = (seconds: number) => {
        const hrs = Math.floor(seconds / 3600);
        const mins = Math.floor((seconds % 3600) / 60);
        const secs = seconds % 60;
        return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    return (
        <div className="max-w-4xl mx-auto py-12 px-4 h-[calc(100vh-100px)] flex flex-col items-center justify-center">
            <div className="text-center mb-12">
                <h1 className="text-4xl font-black text-foreground uppercase tracking-tighter italic">Mastery Timer</h1>
                <p className="text-foreground/40 font-medium italic mt-2">Activate Focus Mode to accelerate your learning.</p>
            </div>

            <div className={cn(
                "relative h-80 w-80 rounded-full flex flex-col items-center justify-center border-[16px] transition-all duration-700 shadow-2xl bg-card-bg",
                isActive ? (isPaused ? "border-orange-500/20 shadow-orange-500/5" : "border-blue-600 shadow-blue-600/10 animate-pulse-subtle") : "border-card-border"
            )}>
                <p className="text-5xl font-black text-foreground tracking-tighter tabular-nums drop-shadow-sm">
                    {formatTime(time)}
                </p>
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-foreground/40 mt-2">
                    {isPaused ? 'Break Mode Active' : 'Focus Mode Active'}
                </p>

                {isActive && (
                    <div className="absolute -bottom-4 bg-gray-900 dark:bg-blue-600/20 text-white px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest shadow-xl border border-card-border">
                        {isPaused ? <Coffee className="h-3 w-3 inline mr-2 text-orange-400" /> : <Zap className="h-3 w-3 inline mr-2 text-blue-400" />}
                        {isPaused ? 'On Break' : 'Studying Now'}
                    </div>
                )}
            </div>

            <div className="mt-16 w-full max-w-sm space-y-6">
                {!isActive ? (
                    <div className="space-y-6">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-[10px] font-black text-foreground/40 uppercase tracking-widest mb-2 block px-2">Hours (0-24)</label>
                                <input
                                    type="number" min="0" max="24"
                                    className="w-full bg-card-bg border border-card-border rounded-2xl p-4 font-bold text-foreground focus:ring-2 focus:ring-blue-600"
                                    value={customHours}
                                    onChange={(e) => setCustomHours(Math.min(24, Math.max(0, parseInt(e.target.value) || 0)))}
                                />
                            </div>
                            <div>
                                <label className="text-[10px] font-black text-foreground/40 uppercase tracking-widest mb-2 block px-2">Minutes (0-59)</label>
                                <input
                                    type="number" min="0" max="59"
                                    className="w-full bg-card-bg border border-card-border rounded-2xl p-4 font-bold text-foreground focus:ring-2 focus:ring-blue-600"
                                    value={customMinutes}
                                    onChange={(e) => setCustomMinutes(Math.min(59, Math.max(0, parseInt(e.target.value) || 0)))}
                                />
                            </div>
                        </div>

                        <div>
                            <label className="text-[10px] font-black text-foreground/40 uppercase tracking-widest mb-2 block px-2">Select Study Goal</label>
                            <select
                                className="w-full bg-card-bg border border-card-border rounded-2xl p-4 font-bold text-foreground focus:ring-2 focus:ring-blue-600 appearance-none"
                                value={selectedGoalId || ''}
                                onChange={(e) => setSelectedGoalId(parseInt(e.target.value))}
                            >
                                {goals.map(g => (
                                    <option key={g.id} value={g.id}>{g.goalable?.name_en || 'Goal'} ({g.target_hours}h)</option>
                                ))}
                                <option value="">No specific goal</option>
                            </select>
                        </div>

                        <button
                            onClick={startTimer}
                            className="w-full bg-blue-600 text-white font-black py-5 rounded-3xl hover:bg-blue-700 transition-all shadow-xl shadow-blue-500/10 flex items-center justify-center gap-3"
                        >
                            <Play className="h-5 w-5 fill-current" />
                            Start Focus Session
                        </button>
                    </div>
                ) : (
                    <div className="flex gap-4">
                        <button
                            onClick={togglePause}
                            className={cn(
                                "flex-1 font-black py-5 rounded-3xl transition-all shadow-xl flex items-center justify-center gap-3",
                                isPaused ? "bg-blue-600 text-white shadow-blue-500/10" : "bg-orange-500 text-white shadow-orange-500/10"
                            )}
                        >
                            {isPaused ? <Play className="h-5 w-5 fill-current" /> : <Pause className="h-5 w-5 fill-current" />}
                            {isPaused ? 'Resume' : 'Pause Break'}
                        </button>
                        <button
                            onClick={stopTimer}
                            className="flex-1 bg-gray-900 dark:bg-blue-600/20 text-white font-black py-5 rounded-3xl hover:bg-red-600 transition-all shadow-xl border border-card-border flex items-center justify-center gap-3"
                        >
                            <RotateCcw className="h-5 w-5" />
                            Stop Focus
                        </button>
                    </div>
                )}
            </div>

            <div className="mt-12 max-w-md bg-blue-600/5 border border-blue-600/10 rounded-2xl p-6 text-center">
                <div className="flex items-center justify-center gap-2 text-blue-600 mb-2">
                    <ShieldCheck className="h-5 w-5" />
                    <span className="text-[10px] font-black uppercase tracking-widest">Psychological Focus Tip</span>
                </div>
                <p className="text-xs font-bold text-foreground/80 leading-relaxed italic">
                    {focusTime > 1800
                        ? "Deep work state achieved! Your brain is now neuroplastically primed for high-speed retention."
                        : "Studies show that studying for 50 minutes with a 10-minute break improves long-term retention by 45%. Keep breathing!"}
                </p>
            </div>

            {/* Interactive Challenge Modal */}
            {showChallenge && (
                <div className="fixed inset-0 bg-blue-950/40 backdrop-blur-md z-[100] flex items-center justify-center p-4">
                    <div className="bg-white rounded-[40px] shadow-2xl w-full max-w-md p-10 text-center border-t-8 border-blue-600 transform animate-in zoom-in-95 duration-300">
                        <div className="h-20 w-20 bg-blue-50 rounded-3xl flex items-center justify-center text-blue-600 mx-auto mb-6 shadow-sm">
                            <TargetIcon className="h-10 w-10" />
                        </div>
                        <h2 className="text-2xl font-black text-gray-900 uppercase tracking-tighter italic mb-4">Focus Challenge!</h2>
                        <div className="p-6 bg-gray-50 rounded-2xl border border-gray-100 mb-8">
                            <p className="text-gray-700 font-bold italic leading-relaxed">
                                "{currentChallenge}"
                            </p>
                        </div>
                        <button
                            onClick={handleChallengeComplete}
                            className="w-full bg-blue-600 text-white font-black py-5 rounded-3xl hover:bg-blue-700 transition-all shadow-xl shadow-blue-100 uppercase tracking-widest text-xs"
                        >
                            I've Completed It (+50 pts)
                        </button>
                        <button
                            onClick={() => setShowChallenge(false)}
                            className="mt-4 text-[10px] font-black text-gray-400 uppercase tracking-widest hover:text-gray-600 transition-colors"
                        >
                            Skip this for now
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
