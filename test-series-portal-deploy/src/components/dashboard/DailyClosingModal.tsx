import { useEffect, useRef, useState } from 'react';
import axios from '@/lib/axios';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Mic, StopCircle, CheckCircle2, Loader2, CalendarDays } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/components/ui/use-toast';

interface DailyClosingModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onCloseComplete: () => void;
    pendingTasksCount?: number;
}

function getTomorrowDate() {
    const date = new Date();
    date.setDate(date.getDate() + 1);
    return date.toISOString().slice(0, 10);
}

export function DailyClosingModal({
    open,
    onOpenChange,
    onCloseComplete,
    pendingTasksCount = 0,
}: DailyClosingModalProps) {
    const [isRecording, setIsRecording] = useState(false);
    const [recordingSeconds, setRecordingSeconds] = useState(0);
    const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
    const [tomorrowTask, setTomorrowTask] = useState('');
    const [carryUnfinished, setCarryUnfinished] = useState(true);
    const [rescheduleDate, setRescheduleDate] = useState(getTomorrowDate());
    const [loading, setLoading] = useState(false);

    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const chunksRef = useRef<BlobPart[]>([]);
    const recordingTimerRef = useRef<NodeJS.Timeout | null>(null);
    const { toast } = useToast();

    const clearRecordingTimer = () => {
        if (recordingTimerRef.current) {
            clearInterval(recordingTimerRef.current);
            recordingTimerRef.current = null;
        }
    };

    const stopRecording = () => {
        if (mediaRecorderRef.current && isRecording) {
            mediaRecorderRef.current.stop();
            setIsRecording(false);
            clearRecordingTimer();
        }
    };

    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            mediaRecorderRef.current = new MediaRecorder(stream);
            chunksRef.current = [];

            mediaRecorderRef.current.ondataavailable = (event) => {
                if (event.data.size > 0) {
                    chunksRef.current.push(event.data);
                }
            };

            mediaRecorderRef.current.onstop = () => {
                const detectedType = chunksRef.current[0] instanceof Blob
                    ? chunksRef.current[0].type
                    : 'audio/webm';
                const blob = new Blob(chunksRef.current, { type: detectedType || 'audio/webm' });
                setAudioBlob(blob);
                stream.getTracks().forEach((track) => track.stop());
            };

            mediaRecorderRef.current.start();
            setRecordingSeconds(0);
            setIsRecording(true);
            clearRecordingTimer();

            recordingTimerRef.current = setInterval(() => {
                setRecordingSeconds((seconds) => {
                    const next = seconds + 1;
                    if (next >= 30) {
                        stopRecording();
                        return 30;
                    }
                    return next;
                });
            }, 1000);
        } catch (error) {
            console.error('Mic permission denied', error);
            toast({
                title: 'Microphone Error',
                description: 'Please allow microphone access to record your oath.',
                variant: 'destructive',
            });
        }
    };

    const handleSubmit = async () => {
        setLoading(true);

        const formData = new FormData();
        if (audioBlob) {
            formData.append('voice_note', audioBlob, 'closing_oath.webm');
        }
        formData.append('tomorrow_task', tomorrowTask.trim());
        formData.append('carry_unfinished', carryUnfinished ? '1' : '0');
        formData.append('reschedule_date', rescheduleDate);

        try {
            await axios.post('/study-planner/close-day', formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            onCloseComplete();
            onOpenChange(false);
            toast({
                title: 'Day Closed Successfully',
                description: 'Great job today. Tomorrow is ready.',
            });
        } catch (error) {
            console.error('Failed to close day', error);
            toast({
                title: 'Error',
                description: 'Something went wrong. Please try again.',
                variant: 'destructive',
            });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (!open) {
            clearRecordingTimer();
            setIsRecording(false);
        }
    }, [open]);

    useEffect(() => {
        return () => {
            clearRecordingTimer();
        };
    }, []);

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[560px]">
                <DialogHeader>
                    <DialogTitle className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-pink-600">
                        End Day Ritual
                    </DialogTitle>
                </DialogHeader>

                <div className="space-y-6 py-4">
                    <div className="space-y-3">
                        <Label className="text-base font-semibold flex items-center gap-2">
                            <Mic className="h-4 w-4 text-purple-600" />
                            Record 30-sec Oath
                        </Label>
                        <p className="text-sm text-gray-500">
                            Share what you learned today and your commitment for tomorrow.
                        </p>

                        <div className="flex justify-center py-2">
                            {!isRecording ? (
                                <Button
                                    onClick={startRecording}
                                    disabled={!!audioBlob}
                                    variant={audioBlob ? 'outline' : 'default'}
                                    className={cn('rounded-full h-16 w-16', audioBlob && 'border-green-500 text-green-600')}
                                >
                                    {audioBlob ? <CheckCircle2 className="h-8 w-8" /> : <Mic className="h-8 w-8" />}
                                </Button>
                            ) : (
                                <Button
                                    onClick={stopRecording}
                                    className="rounded-full h-16 w-16 bg-red-500 hover:bg-red-600 animate-pulse"
                                >
                                    <StopCircle className="h-8 w-8" />
                                </Button>
                            )}
                        </div>

                        {isRecording && (
                            <p className="text-center text-xs font-semibold text-red-500">
                                Recording... {30 - recordingSeconds}s left
                            </p>
                        )}
                        {audioBlob && !isRecording && (
                            <p className="text-center text-xs text-green-600 font-medium">Recording saved.</p>
                        )}
                    </div>

                    <div className="space-y-3">
                        <Label className="text-base font-semibold">Tomorrow&apos;s One Main Task</Label>
                        <Textarea
                            placeholder="Example: Complete Chapter 4 revision and solve 25 MCQs."
                            value={tomorrowTask}
                            onChange={(event) => setTomorrowTask(event.target.value)}
                            className="resize-none"
                        />
                    </div>

                    <div className="rounded-xl border border-gray-200 p-4 space-y-3">
                        <div className="flex items-center justify-between gap-3">
                            <p className="text-sm font-medium text-gray-700">
                                Move unfinished tasks to another day
                                {pendingTasksCount > 0 ? ` (${pendingTasksCount} pending)` : ''}
                            </p>
                            <label className="inline-flex items-center cursor-pointer">
                                <input
                                    type="checkbox"
                                    className="sr-only peer"
                                    checked={carryUnfinished}
                                    onChange={(event) => setCarryUnfinished(event.target.checked)}
                                />
                                <span className="h-6 w-11 rounded-full bg-gray-300 peer-checked:bg-purple-600 transition-colors relative">
                                    <span className={cn(
                                        'absolute left-1 top-1 h-4 w-4 rounded-full bg-white transition-transform',
                                        carryUnfinished && 'translate-x-5'
                                    )} />
                                </span>
                            </label>
                        </div>

                        {carryUnfinished && (
                            <div className="space-y-1">
                                <Label className="text-sm flex items-center gap-2 text-gray-600">
                                    <CalendarDays className="h-4 w-4" />
                                    Reschedule To
                                </Label>
                                <input
                                    type="date"
                                    value={rescheduleDate}
                                    onChange={(event) => setRescheduleDate(event.target.value)}
                                    className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm"
                                />
                            </div>
                        )}
                    </div>

                    <Button
                        onClick={handleSubmit}
                        disabled={loading || !tomorrowTask.trim()}
                        className="w-full"
                    >
                        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Close Day and Save
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
