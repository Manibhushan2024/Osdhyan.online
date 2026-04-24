import { useState, useEffect, useRef } from 'react';
import { Play, Pause, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import axios from '@/lib/axios';

interface StudyTimerProps {
    onSessionComplete?: (minutes: number) => void;
}

export function StudyTimer({ onSessionComplete }: StudyTimerProps) {
    const [isActive, setIsActive] = useState(false);
    const [sessionSeconds, setSessionSeconds] = useState(0); // For current session
    const [isSaving, setIsSaving] = useState(false);
    const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

    useEffect(() => {
        if (isActive) {
            intervalRef.current = setInterval(() => {
                setSessionSeconds(s => s + 1);
            }, 1000);
        } else if (intervalRef.current) {
            clearInterval(intervalRef.current);
        }
        return () => {
            if (intervalRef.current) clearInterval(intervalRef.current);
        };
    }, [isActive]);

    // Format time helper
    const formatTime = (totalSeconds: number) => {
        const h = Math.floor(totalSeconds / 3600);
        const m = Math.floor((totalSeconds % 3600) / 60);
        const s = totalSeconds % 60;
        return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    };

    const startSession = () => {
        if (isSaving || isActive || sessionSeconds > 0) return;
        setSessionSeconds(0);
        setIsActive(true);
    };

    const togglePauseResume = () => {
        if (isSaving || sessionSeconds <= 0) return;
        setIsActive((prev) => !prev);
    };

    const playCompletionCue = () => {
        try {
            const audioContext = new window.AudioContext();
            const oscillator = audioContext.createOscillator();
            const gain = audioContext.createGain();
            oscillator.type = 'triangle';
            oscillator.frequency.setValueAtTime(880, audioContext.currentTime);
            gain.gain.setValueAtTime(0.08, audioContext.currentTime);
            oscillator.connect(gain);
            gain.connect(audioContext.destination);
            oscillator.start();
            oscillator.stop(audioContext.currentTime + 0.35);
        } catch (error) {
            console.warn('Timer completion sound blocked', error);
        }

        if ('speechSynthesis' in window) {
            const message = new SpeechSynthesisUtterance('Great focus session complete. Keep going.');
            message.rate = 1;
            message.pitch = 1;
            window.speechSynthesis.speak(message);
        }
    };

    const saveAndEndSession = async () => {
        if (sessionSeconds <= 0 || isSaving) return;

        setIsSaving(true);
        setIsActive(false);

        const minutes = Math.max(1, Math.round(sessionSeconds / 60));
        try {
            await axios.post('/study-planner/log', { minutes });
            playCompletionCue();
            if (onSessionComplete) onSessionComplete(minutes);
            setSessionSeconds(0);
        } catch (error) {
            console.error('Failed to log session', error);
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="bg-gradient-to-br from-indigo-600 to-violet-700 rounded-[2.5rem] p-8 text-white shadow-xl relative overflow-hidden">
            {/* Background decoration */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none" />

            <div className="relative z-10 flex flex-col items-center justify-center space-y-6">
                <div className="text-center">
                    <h3 className="text-lg font-medium text-indigo-100 uppercase tracking-widest">Focus Session</h3>
                    <p className="text-6xl font-bold font-mono tracking-wider tabular-nums mt-2">
                        {formatTime(sessionSeconds)}
                    </p>
                </div>

                <div className="flex items-center gap-3 flex-wrap justify-center">
                    <button
                        onClick={startSession}
                        disabled={isSaving}
                        className={cn(
                            "h-12 rounded-xl px-4 bg-white text-indigo-700 hover:bg-indigo-50 flex items-center justify-center transition-colors text-sm font-semibold gap-2",
                            (isSaving || isActive || sessionSeconds > 0) ? "opacity-60 cursor-not-allowed" : ""
                        )}
                    >
                        <Play className="h-4 w-4 fill-current" />
                        Start
                    </button>

                    <button
                        onClick={togglePauseResume}
                        disabled={isSaving || sessionSeconds <= 0}
                        className={cn(
                            "h-12 rounded-xl px-4 bg-amber-500 hover:bg-amber-600 text-white flex items-center justify-center transition-colors text-sm font-semibold gap-2",
                            (isSaving || sessionSeconds <= 0) ? "opacity-60 cursor-not-allowed" : ""
                        )}
                    >
                        <Pause className="h-4 w-4 fill-current" />
                        {isActive ? 'Pause' : 'Resume'}
                    </button>

                    <button
                        onClick={saveAndEndSession}
                        disabled={isSaving || sessionSeconds <= 0}
                        className={cn(
                            "h-12 rounded-xl px-4 bg-white/20 hover:bg-white/30 text-white flex items-center justify-center backdrop-blur-sm transition-colors text-sm font-semibold gap-2",
                            (isSaving || sessionSeconds <= 0) ? "opacity-60 cursor-not-allowed" : ""
                        )}
                    >
                        <CheckCircle2 className="h-4 w-4" />
                        {isSaving ? 'Saving...' : 'End & Save'}
                    </button>
                </div>

                <p className="text-sm text-indigo-200">
                    {sessionSeconds <= 0
                        ? 'Press Start to begin your focus session.'
                        : isActive
                            ? 'Session running. Use Pause or End & Save.'
                            : 'Session paused. Use Resume or End & Save.'}
                </p>
            </div>
        </div>
    );
}
