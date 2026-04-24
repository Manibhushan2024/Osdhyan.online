'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import api from '@/lib/api';
import { useAuth } from '@/components/providers/AuthProvider';
import AuthModal from '@/components/auth/AuthModal';
import {
    Mic, MicOff, Video, VideoOff, Hand, MessageSquare, BarChart2,
    Users, X, Send, Radio, Check, ArrowLeft,
    Pin, CheckCircle, AlertCircle, Loader2, Monitor, MonitorOff,
    Coins, Save, LogOut
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'react-hot-toast';

// ─── Types ─────────────────────────────────────────────────────────────────────

type LiveClass = {
    id: number;
    title: string;
    description: string;
    subject: string;
    status: 'scheduled' | 'live' | 'ended';
    agora_channel: string;
    teacher: { id: number; name: string; avatar: string };
    chat_enabled: boolean;
    qa_enabled: boolean;
    polls_enabled: boolean;
    raise_hand_enabled: boolean;
    active_participants_count: number;
    recording_url?: string;
};

type Message = {
    id: number;
    user: { id: number; name: string; avatar: string };
    message: string;
    type: 'chat' | 'question' | 'announcement' | 'answer';
    is_pinned: boolean;
    is_answered: boolean;
    created_at: string;
};

type Poll = {
    id: number;
    question: string;
    options: string[];
    votes: number[];
    is_active: boolean;
    correct_option_index: number | null;
    coin_reward: number;
};

type PanelType = 'chat' | 'qa' | 'polls' | 'participants';

// ICE server config — uses free public STUN
const ICE_SERVERS: RTCIceServer[] = [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
];

const SIGNAL_INTERVAL = 800;
const STATE_INTERVAL  = 2500;

// ─── Main Component ─────────────────────────────────────────────────────────────

export default function LiveClassroomPage() {
    const { id } = useParams<{ id: string }>();
    const { user } = useAuth();
    const router = useRouter();

    const [liveClass, setLiveClass] = useState<LiveClass | null>(null);
    const [loading, setLoading] = useState(true);
    const [authModal, setAuthModal] = useState(false);
    const [joined, setJoined] = useState(false);
    const [joining, setJoining] = useState(false);
    const [teacherId, setTeacherId] = useState<number | null>(null);

    // Teacher controls
    const [isLive, setIsLive] = useState(false);
    const [goingLive, setGoingLive] = useState(false);
    const [showEndModal, setShowEndModal] = useState(false);
    const [savingRecording, setSavingRecording] = useState(false);

    // Teacher media
    const [micOn, setMicOn] = useState(true);
    const [camOn, setCamOn] = useState(true);
    const [screenSharing, setScreenSharing] = useState(false);
    const [localStream, setLocalStream] = useState<MediaStream | null>(null);
    const localVideoRef = useRef<HTMLVideoElement>(null);

    // Student receive
    const remoteVideoRef = useRef<HTMLVideoElement>(null);
    const [remoteActive, setRemoteActive] = useState(false);

    // WebRTC — teacher: one PC per student; student: one PC to teacher
    const pcsRef = useRef<Map<number, RTCPeerConnection>>(new Map());
    const lastSignalIdRef = useRef<number>(0);
    const signalIntervalRef = useRef<number | null>(null);
    const stateIntervalRef = useRef<number | null>(null);
    const localStreamRef = useRef<MediaStream | null>(null);

    // ICE candidate buffering — buffers candidates until remote desc is set
    const studentIceBufferRef = useRef<RTCIceCandidateInit[]>([]);
    const teacherIceBuffersRef = useRef<Map<number, RTCIceCandidateInit[]>>(new Map());

    // MediaRecorder for class recording
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const recordingChunksRef = useRef<Blob[]>([]);
    const recordingStartRef = useRef<number>(0);

    // Panels
    const [activePanel, setActivePanel] = useState<PanelType>('chat');
    const [messages, setMessages] = useState<Message[]>([]);
    const [polls, setPolls] = useState<Poll[]>([]);
    const [participantCount, setParticipantCount] = useState(0);
    const [handsRaised, setHandsRaised] = useState<{ user: { id: number; name: string } }[]>([]);
    const [myVotes, setMyVotes] = useState<Record<number, number>>({});
    const [userCoins, setUserCoins] = useState(0);

    // Chat
    const [msgType, setMsgType] = useState<'chat' | 'question'>('chat');
    const [msgText, setMsgText] = useState('');
    const [sending, setSending] = useState(false);
    const chatBottomRef = useRef<HTMLDivElement>(null);

    // Poll creation (teacher)
    const [showPollForm, setShowPollForm] = useState(false);
    const [pollQuestion, setPollQuestion] = useState('');
    const [pollOptions, setPollOptions] = useState(['', '']);
    const [pollCoinReward, setPollCoinReward] = useState(5);
    const [creatingPoll, setCreatingPoll] = useState(false);

    // Poll reveal (teacher)
    const [revealingPoll, setRevealingPoll] = useState<number | null>(null);

    const serverTimeRef = useRef<string>(new Date().toISOString());

    // ── Derived ──────────────────────────────────────────────────────────────────
    const isTeacher = !!(user && liveClass && user.id === liveClass.teacher?.id);

    // ── Load class ──────────────────────────────────────────────────────────────
    useEffect(() => {
        loadClass();
        return () => {
            stopAllIntervals();
            cleanupAllPCs();
            stopLocalMedia();
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [id]);

    const loadClass = async () => {
        try {
            const res = await api.get(`/live-classes/${id}`);
            const cls = res.data.class ?? res.data;
            setLiveClass(cls);
            setIsLive(cls.status === 'live');
            setParticipantCount(cls.active_participants_count ?? 0);
        } catch {
            toast.error('Class not found');
            router.push('/dashboard/live');
        } finally {
            setLoading(false);
        }
    };

    // ── Auto-scroll chat ────────────────────────────────────────────────────────
    useEffect(() => {
        chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    // ── State polling (chat/polls/participants) ──────────────────────────────────
    const pollState = useCallback(async () => {
        if (!liveClass) return;
        try {
            const res = await api.get(`/live-classes/${id}/state`, {
                params: { since: serverTimeRef.current }
            });
            const data = res.data;
            serverTimeRef.current = data.server_time;

            if (data.messages?.length) {
                setMessages(prev => {
                    const existingIds = new Set(prev.map((m: Message) => m.id));
                    const newMsgs = data.messages.filter((m: Message) => !existingIds.has(m.id));
                    return [...prev, ...newMsgs];
                });
            }
            if (data.polls?.length) {
                setPolls(prev => {
                    const map = new Map(prev.map(p => [p.id, p]));
                    data.polls.forEach((p: Poll) => map.set(p.id, p));
                    return Array.from(map.values());
                });
            }
            setParticipantCount(data.participant_count ?? participantCount);
            setHandsRaised(data.hands_raised ?? []);
            if (data.user_coins !== undefined && data.user_coins !== null) {
                setUserCoins(data.user_coins);
            }

            if (data.status === 'ended' && liveClass.status !== 'ended') {
                toast('Class has ended.');
                setLiveClass(prev => prev ? { ...prev, status: 'ended' } : prev);
                stopAllIntervals();
                cleanupAllPCs();
                stopLocalMedia();
            }
        } catch {
            // silent
        }
    }, [id, liveClass, participantCount]);

    // ── WebRTC: Teacher signal loop ─────────────────────────────────────────────
    // Handles: 'ready' (new student) → send offer
    //          'answer' → setRemoteDescription + flush ICE buffer
    //          'ice-candidate' → buffer or add directly
    const teacherSignalLoop = useCallback(async () => {
        const stream = localStreamRef.current;
        if (!stream) return;
        try {
            const res = await api.get(`/live-classes/${id}/signals`, {
                params: { since_id: lastSignalIdRef.current }
            });
            const { signals, last_id } = res.data;
            if (last_id > lastSignalIdRef.current) lastSignalIdRef.current = last_id;

            for (const sig of signals ?? []) {
                if (sig.type === 'ready') {
                    // New student joined — create PC and send offer
                    const studentId = sig.from_user_id;
                    if (!pcsRef.current.has(studentId)) {
                        teacherIceBuffersRef.current.set(studentId, []);
                        await createTeacherPC(studentId, stream);
                    }
                } else if (sig.type === 'answer') {
                    const studentId = sig.from_user_id;
                    let pc = pcsRef.current.get(studentId);
                    if (!pc) {
                        teacherIceBuffersRef.current.set(studentId, []);
                        pc = await createTeacherPC(studentId, stream);
                    }
                    if (pc.signalingState !== 'stable') {
                        await pc.setRemoteDescription(new RTCSessionDescription(sig.payload));
                        // Flush buffered ICE candidates for this student
                        const buffered = teacherIceBuffersRef.current.get(studentId) ?? [];
                        for (const cand of buffered) {
                            await pc.addIceCandidate(new RTCIceCandidate(cand)).catch(() => {});
                        }
                        teacherIceBuffersRef.current.set(studentId, []);
                    }
                } else if (sig.type === 'ice-candidate' && sig.payload?.candidate) {
                    const studentId = sig.from_user_id;
                    const pc = pcsRef.current.get(studentId);
                    if (pc) {
                        if (pc.remoteDescription) {
                            await pc.addIceCandidate(new RTCIceCandidate(sig.payload)).catch(() => {});
                        } else {
                            const buf = teacherIceBuffersRef.current.get(studentId) ?? [];
                            buf.push(sig.payload);
                            teacherIceBuffersRef.current.set(studentId, buf);
                        }
                    }
                }
            }
        } catch {
            // silent
        }
    }, [id]);

    // ── WebRTC: Student signal loop ─────────────────────────────────────────────
    // Handles: 'offer'/'screen-share-offer' → answer + flush ICE buffer
    //          'ice-candidate' → buffer until remote desc is set
    //          'screen-share-end' → update UI
    const studentSignalLoop = useCallback(async (tId: number) => {
        try {
            const res = await api.get(`/live-classes/${id}/signals`, {
                params: { since_id: lastSignalIdRef.current }
            });
            const { signals, last_id } = res.data;
            if (last_id > lastSignalIdRef.current) lastSignalIdRef.current = last_id;

            for (const sig of signals ?? []) {
                if (sig.from_user_id !== tId) continue;

                if (sig.type === 'offer' || sig.type === 'screen-share-offer') {
                    let pc = pcsRef.current.get(tId);
                    if (!pc) {
                        studentIceBufferRef.current = [];
                        pc = createStudentPC(tId);
                    }
                    await pc.setRemoteDescription(new RTCSessionDescription(sig.payload));
                    // Flush ICE candidates buffered before remote desc was set
                    for (const cand of studentIceBufferRef.current) {
                        await pc.addIceCandidate(new RTCIceCandidate(cand)).catch(() => {});
                    }
                    studentIceBufferRef.current = [];

                    const answer = await pc.createAnswer();
                    await pc.setLocalDescription(answer);
                    await api.post(`/live-classes/${id}/signals`, {
                        type: 'answer',
                        payload: { type: answer.type, sdp: answer.sdp },
                        to_user_id: tId,
                    });
                } else if (sig.type === 'ice-candidate' && sig.payload?.candidate) {
                    const pc = pcsRef.current.get(tId);
                    if (pc) {
                        if (pc.remoteDescription) {
                            await pc.addIceCandidate(new RTCIceCandidate(sig.payload)).catch(() => {});
                        } else {
                            studentIceBufferRef.current.push(sig.payload);
                        }
                    }
                } else if (sig.type === 'screen-share-end') {
                    setScreenSharing(false);
                }
            }
        } catch {
            // silent
        }
    }, [id]);

    // ── Create RTCPeerConnection for teacher (one per student) ──────────────────
    const createTeacherPC = async (studentId: number, stream: MediaStream): Promise<RTCPeerConnection> => {
        const pc = new RTCPeerConnection({ iceServers: ICE_SERVERS });
        pcsRef.current.set(studentId, pc);

        stream.getTracks().forEach(t => pc.addTrack(t, stream));

        pc.onicecandidate = async (e) => {
            if (!e.candidate) return;
            await api.post(`/live-classes/${id}/signals`, {
                type: 'ice-candidate',
                payload: { candidate: e.candidate.candidate, sdpMid: e.candidate.sdpMid, sdpMLineIndex: e.candidate.sdpMLineIndex },
                to_user_id: studentId,
            }).catch(() => {});
        };

        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);
        await api.post(`/live-classes/${id}/signals`, {
            type: 'offer',
            payload: { type: offer.type, sdp: offer.sdp },
            to_user_id: studentId,
        });

        return pc;
    };

    // ── Create RTCPeerConnection for student ────────────────────────────────────
    const createStudentPC = (tId: number): RTCPeerConnection => {
        pcsRef.current.get(tId)?.close();

        const pc = new RTCPeerConnection({ iceServers: ICE_SERVERS });
        pcsRef.current.set(tId, pc);

        pc.onicecandidate = async (e) => {
            if (!e.candidate) return;
            await api.post(`/live-classes/${id}/signals`, {
                type: 'ice-candidate',
                payload: { candidate: e.candidate.candidate, sdpMid: e.candidate.sdpMid, sdpMLineIndex: e.candidate.sdpMLineIndex },
                to_user_id: tId,
            }).catch(() => {});
        };

        pc.ontrack = (e) => {
            if (remoteVideoRef.current && e.streams[0]) {
                remoteVideoRef.current.srcObject = e.streams[0];
                setRemoteActive(true);
            }
        };

        pc.onconnectionstatechange = () => {
            if (pc.connectionState === 'disconnected' || pc.connectionState === 'failed') {
                setRemoteActive(false);
            }
        };

        return pc;
    };

    // ── Start / stop polling intervals ──────────────────────────────────────────
    const startIntervals = useCallback((tId?: number) => {
        stopAllIntervals();
        stateIntervalRef.current = window.setInterval(pollState, STATE_INTERVAL);
        if (isTeacher) {
            signalIntervalRef.current = window.setInterval(teacherSignalLoop, SIGNAL_INTERVAL);
        } else if (tId) {
            signalIntervalRef.current = window.setInterval(() => studentSignalLoop(tId), SIGNAL_INTERVAL);
        }
    }, [isTeacher, pollState, teacherSignalLoop, studentSignalLoop]);

    const stopAllIntervals = () => {
        if (stateIntervalRef.current) { clearInterval(stateIntervalRef.current); stateIntervalRef.current = null; }
        if (signalIntervalRef.current) { clearInterval(signalIntervalRef.current); signalIntervalRef.current = null; }
    };

    const cleanupAllPCs = () => {
        pcsRef.current.forEach(pc => pc.close());
        pcsRef.current.clear();
        teacherIceBuffersRef.current.clear();
        studentIceBufferRef.current = [];
    };

    // ── Media helpers ────────────────────────────────────────────────────────────
    const startCamera = async (): Promise<MediaStream | null> => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
            setLocalStream(stream);
            localStreamRef.current = stream;
            if (localVideoRef.current) localVideoRef.current.srcObject = stream;
            return stream;
        } catch {
            toast.error('Camera/mic access denied — check browser permissions');
            return null;
        }
    };

    const stopLocalMedia = () => {
        localStreamRef.current?.getTracks().forEach(t => t.stop());
        localStreamRef.current = null;
        setLocalStream(null);
    };

    const toggleMic = () => {
        localStreamRef.current?.getAudioTracks().forEach(t => { t.enabled = !t.enabled; });
        setMicOn(p => !p);
    };

    const toggleCam = () => {
        localStreamRef.current?.getVideoTracks().forEach(t => { t.enabled = !t.enabled; });
        setCamOn(p => !p);
    };

    // ── Recording helpers ────────────────────────────────────────────────────────
    const startRecording = (stream: MediaStream) => {
        recordingChunksRef.current = [];
        try {
            const mimeType = MediaRecorder.isTypeSupported('video/webm;codecs=vp9,opus')
                ? 'video/webm;codecs=vp9,opus'
                : MediaRecorder.isTypeSupported('video/webm')
                ? 'video/webm'
                : '';
            const mr = new MediaRecorder(stream, mimeType ? { mimeType } : {});
            mr.ondataavailable = (e) => {
                if (e.data.size > 0) recordingChunksRef.current.push(e.data);
            };
            mr.start(1000); // 1-second chunks
            mediaRecorderRef.current = mr;
            recordingStartRef.current = Date.now();
        } catch {
            // MediaRecorder not supported — recording silently skipped
        }
    };

    const stopRecorderAndGetBlob = (): Promise<Blob | null> => {
        return new Promise((resolve) => {
            const mr = mediaRecorderRef.current;
            if (!mr || mr.state === 'inactive') {
                resolve(recordingChunksRef.current.length > 0
                    ? new Blob(recordingChunksRef.current, { type: 'video/webm' })
                    : null);
                return;
            }
            mr.onstop = () => {
                const blob = recordingChunksRef.current.length > 0
                    ? new Blob(recordingChunksRef.current, { type: 'video/webm' })
                    : null;
                resolve(blob);
            };
            mr.stop();
        });
    };

    // ── Screen share ─────────────────────────────────────────────────────────────
    const startScreenShare = async () => {
        try {
            const screenStream = await navigator.mediaDevices.getDisplayMedia({ video: true, audio: true });
            const videoTrack = screenStream.getVideoTracks()[0];

            // Replace video track in all existing peer connections and re-negotiate
            await Promise.all(
                Array.from(pcsRef.current.entries()).map(async ([sid, pc]) => {
                    const sender = pc.getSenders().find(s => s.track?.kind === 'video');
                    if (sender) await sender.replaceTrack(videoTrack);
                    const offerSdp = await pc.createOffer();
                    await pc.setLocalDescription(offerSdp);
                    await api.post(`/live-classes/${id}/signals`, {
                        type: 'screen-share-offer',
                        payload: { type: offerSdp.type, sdp: offerSdp.sdp },
                        to_user_id: sid,
                    });
                })
            );

            if (localVideoRef.current) {
                localVideoRef.current.srcObject = new MediaStream([videoTrack]);
            }

            setScreenSharing(true);
            localStreamRef.current = screenStream;
            videoTrack.onended = () => stopScreenShare();
        } catch {
            toast.error('Screen share cancelled or denied');
        }
    };

    const stopScreenShare = async () => {
        const camStream = await startCamera();
        if (!camStream) return;
        const videoTrack = camStream.getVideoTracks()[0];
        await Promise.all(
            Array.from(pcsRef.current.entries()).map(async ([sid, pc]) => {
                const sender = pc.getSenders().find(s => s.track?.kind === 'video');
                if (sender) await sender.replaceTrack(videoTrack);
                const offerSdp = await pc.createOffer();
                await pc.setLocalDescription(offerSdp);
                await api.post(`/live-classes/${id}/signals`, {
                    type: 'offer',
                    payload: { type: offerSdp.type, sdp: offerSdp.sdp },
                    to_user_id: sid,
                });
            })
        );
        await api.post(`/live-classes/${id}/signals`, { type: 'screen-share-end', payload: {} });
        setScreenSharing(false);
    };

    // ── Teacher actions ─────────────────────────────────────────────────────────
    const handleGoLive = async () => {
        if (!user) { setAuthModal(true); return; }
        setGoingLive(true);
        try {
            await api.post(`/live-classes/${id}/go-live`);
            setIsLive(true);
            setLiveClass(prev => prev ? { ...prev, status: 'live' } : prev);
            const stream = await startCamera();
            if (stream) {
                startRecording(stream); // begin recording immediately
                toast.success('You are now LIVE! 🔴');
            }
            startIntervals();
        } catch {
            toast.error('Failed to go live');
        } finally {
            setGoingLive(false);
        }
    };

    const saveAndEnd = async () => {
        setShowEndModal(false);
        setSavingRecording(true);
        try {
            const blob = await stopRecorderAndGetBlob();
            if (blob) {
                const duration = Math.round((Date.now() - recordingStartRef.current) / 1000);
                const formData = new FormData();
                formData.append('recording', blob, `class_${id}.webm`);
                formData.append('recording_duration', String(duration));
                await api.post(`/live-classes/${id}/upload-recording`, formData, {
                    headers: { 'Content-Type': 'multipart/form-data' },
                    timeout: 300000,
                });
                toast.success('Recording saved! Class ended.');
            } else {
                await api.post(`/live-classes/${id}/end`);
                toast.success('Class ended (no recording data).');
            }
        } catch {
            toast.error('Upload failed — ending class without recording.');
            await api.post(`/live-classes/${id}/end`).catch(() => {});
        } finally {
            setSavingRecording(false);
            stopAllIntervals();
            cleanupAllPCs();
            stopLocalMedia();
            setIsLive(false);
            setLiveClass(prev => prev ? { ...prev, status: 'ended' } : prev);
        }
    };

    const endWithoutSaving = async () => {
        setShowEndModal(false);
        try {
            const mr = mediaRecorderRef.current;
            if (mr && mr.state !== 'inactive') mr.stop();
            await api.post(`/live-classes/${id}/end`);
            stopAllIntervals();
            cleanupAllPCs();
            stopLocalMedia();
            setIsLive(false);
            setLiveClass(prev => prev ? { ...prev, status: 'ended' } : prev);
            toast.success('Class ended.');
        } catch {
            toast.error('Failed to end class');
        }
    };

    // ── Student join ────────────────────────────────────────────────────────────
    const handleJoin = async () => {
        if (!user) { setAuthModal(true); return; }
        setJoining(true);
        try {
            const res = await api.post(`/live-classes/${id}/join`);
            const tId: number = res.data.teacher_id;
            setTeacherId(tId);
            setJoined(true);
            // Signal teacher that this student is ready to receive a stream
            await api.post(`/live-classes/${id}/signals`, {
                type: 'ready',
                payload: {},
                to_user_id: tId,
            });
            toast.success('Joined class! Waiting for teacher stream...');
            startIntervals(tId);
        } catch (err: any) {
            toast.error(err?.response?.data?.message ?? 'Failed to join');
        } finally {
            setJoining(false);
        }
    };

    const handleLeave = async () => {
        await api.post(`/live-classes/${id}/leave`).catch(() => {});
        stopAllIntervals();
        cleanupAllPCs();
        stopLocalMedia();
        router.push('/dashboard/live');
    };

    // ── Chat ────────────────────────────────────────────────────────────────────
    const sendMessage = async () => {
        if (!msgText.trim() || !user) return;
        setSending(true);
        try {
            await api.post(`/live-classes/${id}/messages`, { message: msgText, type: msgType });
            setMsgText('');
        } catch {
            toast.error('Failed to send message');
        } finally {
            setSending(false);
        }
    };

    const pinMessage = async (msgId: number) => {
        await api.patch(`/live-classes/${id}/messages/${msgId}/pin`).catch(() => {});
        setMessages(prev => prev.map(m => m.id === msgId ? { ...m, is_pinned: !m.is_pinned } : m));
    };

    const markAnswered = async (msgId: number) => {
        await api.patch(`/live-classes/${id}/messages/${msgId}/answered`).catch(() => {});
        setMessages(prev => prev.map(m => m.id === msgId ? { ...m, is_answered: true } : m));
    };

    // ── Raise hand ──────────────────────────────────────────────────────────────
    const [handRaised, setHandRaised] = useState(false);
    const toggleHand = async () => {
        if (!user) return;
        try {
            const res = await api.post(`/live-classes/${id}/raise-hand`);
            setHandRaised(res.data.hand_raised);
        } catch {}
    };

    // ── Poll ────────────────────────────────────────────────────────────────────
    const votePoll = async (pollId: number, optionIndex: number) => {
        if (!user) { setAuthModal(true); return; }
        if (myVotes[pollId] !== undefined) return;
        try {
            const res = await api.post(`/live-classes/${id}/polls/${pollId}/vote`, { option_index: optionIndex });
            setMyVotes(p => ({ ...p, [pollId]: optionIndex }));
            setPolls(prev => prev.map(p => p.id === pollId ? res.data.poll : p));
            if (res.data.coins_earned > 0) {
                setUserCoins(c => c + res.data.coins_earned);
                toast.success(`+${res.data.coins_earned} coins earned! 🪙`);
            }
        } catch (err: any) {
            toast.error(err?.response?.data?.message ?? 'Vote failed');
        }
    };

    const revealAnswer = async (pollId: number, correctIndex: number) => {
        setRevealingPoll(pollId);
        try {
            const res = await api.post(`/live-classes/${id}/polls/${pollId}/reveal`, {
                correct_option_index: correctIndex,
                coin_reward: pollCoinReward,
            });
            setPolls(prev => prev.map(p => p.id === pollId ? res.data.poll : p));
            toast.success(`Answer revealed! ${res.data.rewarded_count} students earned ${res.data.coins_each} coins each 🪙`);
        } catch {
            toast.error('Failed to reveal answer');
        } finally {
            setRevealingPoll(null);
        }
    };

    const createPoll = async () => {
        if (!pollQuestion.trim() || pollOptions.filter(o => o.trim()).length < 2) {
            toast.error('Fill question and at least 2 options');
            return;
        }
        setCreatingPoll(true);
        try {
            const res = await api.post(`/live-classes/${id}/polls`, {
                question: pollQuestion,
                options: pollOptions.filter(o => o.trim()),
                coin_reward: pollCoinReward,
            });
            setPolls(prev => [...prev, res.data]);
            setShowPollForm(false);
            setPollQuestion('');
            setPollOptions(['', '']);
            setPollCoinReward(5);
            toast.success('Poll launched!');
        } catch {
            toast.error('Failed to create poll');
        } finally {
            setCreatingPoll(false);
        }
    };

    // ── Render ──────────────────────────────────────────────────────────────────
    if (loading) {
        return (
            <div className="flex items-center justify-center h-[calc(100vh-8rem)]">
                <Loader2 className="h-8 w-8 animate-spin text-red-500" />
            </div>
        );
    }

    if (!liveClass) return null;

    const showPreJoin = !isTeacher && !joined;
    const activePoll = polls.find(p => p.is_active);
    const pinnedMsg = messages.find(m => m.is_pinned);
    const questions = messages.filter(m => m.type === 'question');
    const chatMsgs = messages.filter(m => m.type === 'chat' || m.type === 'announcement');

    return (
        <div className="flex flex-col h-[calc(100vh-5rem)] overflow-hidden bg-background">

            {/* ── Top Bar ─────────────────────────────────────────────────────── */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-card-border bg-card-bg shrink-0">
                <div className="flex items-center gap-3">
                    <button onClick={handleLeave} className="p-2 rounded-xl hover:bg-background transition-all text-foreground/40 hover:text-foreground">
                        <ArrowLeft className="h-4 w-4" />
                    </button>
                    <div>
                        <div className="flex items-center gap-2">
                            {liveClass.status === 'live' && (
                                <span className="flex items-center gap-1 text-[9px] font-black text-red-500 uppercase tracking-widest">
                                    <span className="h-1.5 w-1.5 rounded-full bg-red-500 animate-pulse" /> LIVE
                                </span>
                            )}
                            <h1 className="text-sm font-black text-foreground uppercase tracking-tight">{liveClass.title}</h1>
                        </div>
                        <p className="text-[9px] font-black text-foreground/30 uppercase tracking-widest">{liveClass.subject} · {liveClass.teacher?.name}</p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    {user && (joined || isTeacher) && (
                        <div className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-500/10 border border-amber-500/20 rounded-full">
                            <Coins className="h-3.5 w-3.5 text-amber-500" />
                            <span className="text-[10px] font-black text-amber-500">{userCoins}</span>
                        </div>
                    )}
                    <span className="flex items-center gap-1.5 text-[9px] font-black text-foreground/40 uppercase tracking-widest">
                        <Users className="h-3 w-3" /> {participantCount}
                    </span>
                    {isTeacher && liveClass.status === 'live' && (
                        <button
                            onClick={() => setShowEndModal(true)}
                            disabled={savingRecording}
                            className="flex items-center gap-2 px-4 py-2 bg-red-500/10 border border-red-500/30 text-red-500 rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-red-500/20 transition-all disabled:opacity-50"
                        >
                            {savingRecording ? <Loader2 className="h-3 w-3 animate-spin" /> : <Radio className="h-3 w-3" />}
                            {savingRecording ? 'Saving...' : 'End Class'}
                        </button>
                    )}
                </div>
            </div>

            {/* ── Pre-Join (student) ───────────────────────────────────────────── */}
            {showPreJoin && (
                <div className="flex-1 flex items-center justify-center p-8">
                    <div className="max-w-md w-full bg-card-bg border border-card-border rounded-[2.5rem] p-10 text-center space-y-6">
                        <div className={cn(
                            "h-20 w-20 rounded-[2rem] flex items-center justify-center mx-auto",
                            liveClass.status === 'live' ? "bg-red-500/10" : liveClass.status === 'ended' ? "bg-foreground/5" : "bg-blue-500/10"
                        )}>
                            {liveClass.status === 'live'
                                ? <Radio className="h-10 w-10 text-red-500" />
                                : liveClass.status === 'ended'
                                ? <Video className="h-10 w-10 text-foreground/20" />
                                : <Video className="h-10 w-10 text-blue-500" />}
                        </div>
                        <div>
                            <h2 className="text-2xl font-black text-foreground uppercase tracking-tight italic">{liveClass.title}</h2>
                            <p className="text-[10px] font-black text-foreground/40 uppercase tracking-widest mt-1">{liveClass.subject}</p>
                            <p className="text-sm font-bold text-foreground/50 mt-3">{liveClass.description}</p>
                        </div>
                        <div className="flex items-center justify-center gap-2">
                            <div className="h-8 w-8 rounded-full bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-[11px] font-black text-white">
                                {liveClass.teacher?.name?.charAt(0)}
                            </div>
                            <span className="text-[10px] font-black text-foreground/50 uppercase tracking-widest">{liveClass.teacher?.name}</span>
                        </div>

                        {liveClass.status === 'ended' ? (
                            <div className="space-y-4">
                                {liveClass.recording_url ? (
                                    <div className="space-y-3">
                                        <p className="text-[10px] font-black text-foreground/40 uppercase tracking-widest">Class Recording</p>
                                        <video
                                            src={liveClass.recording_url}
                                            controls
                                            className="w-full rounded-2xl bg-black border border-card-border"
                                            style={{ maxHeight: '220px' }}
                                        />
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-center gap-2">
                                        <AlertCircle className="h-5 w-5 text-foreground/20" />
                                        <p className="text-[10px] font-black text-foreground/30 uppercase tracking-widest">This class has ended · No recording available</p>
                                    </div>
                                )}
                            </div>
                        ) : liveClass.status !== 'live' ? (
                            <div className="flex flex-col items-center gap-2">
                                <AlertCircle className="h-5 w-5 text-blue-500" />
                                <p className="text-[10px] font-black text-foreground/40 uppercase tracking-widest">Class has not started yet.</p>
                            </div>
                        ) : (
                            <>
                                <div className="flex items-center gap-2 justify-center text-[10px] font-black text-amber-500 uppercase tracking-widest">
                                    <Coins className="h-3.5 w-3.5" /> Answer polls correctly to earn coins!
                                </div>
                                <button
                                    onClick={handleJoin}
                                    disabled={joining}
                                    className="w-full flex items-center justify-center gap-2 py-4 bg-red-500 hover:bg-red-400 text-white rounded-2xl font-black text-sm uppercase tracking-widest shadow-lg shadow-red-500/20 transition-all active:scale-95 disabled:opacity-50"
                                >
                                    {joining ? <Loader2 className="h-4 w-4 animate-spin" /> : <><span className="h-2 w-2 rounded-full bg-white animate-pulse" /> Join Live Class</>}
                                </button>
                            </>
                        )}
                    </div>
                </div>
            )}

            {/* ── Teacher Pre-Live ──────────────────────────────────────────────── */}
            {isTeacher && !isLive && liveClass.status !== 'ended' && (
                <div className="flex-1 flex items-center justify-center p-8">
                    <div className="max-w-md w-full bg-card-bg border border-card-border rounded-[2.5rem] p-10 text-center space-y-6">
                        <div className="h-20 w-20 bg-red-500/10 rounded-[2rem] flex items-center justify-center mx-auto">
                            <Radio className="h-10 w-10 text-red-500" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-black text-foreground uppercase tracking-tight italic">{liveClass.title}</h2>
                            <p className="text-sm font-bold text-foreground/40 mt-2">Your camera and mic will be shared with students when you go live.</p>
                        </div>
                        <div className="bg-background border border-card-border rounded-2xl p-4 space-y-2 text-left">
                            {[
                                { label: 'Live Chat', val: liveClass.chat_enabled },
                                { label: 'Q&A Panel', val: liveClass.qa_enabled },
                                { label: 'Polls + Coins', val: liveClass.polls_enabled },
                                { label: 'Raise Hand', val: liveClass.raise_hand_enabled },
                            ].map(({ label, val }) => (
                                <div key={label} className="flex items-center justify-between">
                                    <span className="text-[10px] font-black text-foreground/40 uppercase tracking-widest">{label}</span>
                                    {val ? <Check className="h-4 w-4 text-green-500" /> : <X className="h-4 w-4 text-foreground/20" />}
                                </div>
                            ))}
                        </div>
                        <button
                            onClick={handleGoLive}
                            disabled={goingLive}
                            className="w-full flex items-center justify-center gap-3 py-5 bg-red-500 hover:bg-red-400 text-white rounded-2xl font-black text-sm uppercase tracking-widest shadow-lg shadow-red-500/20 transition-all active:scale-95 disabled:opacity-50"
                        >
                            {goingLive ? <Loader2 className="h-5 w-5 animate-spin" /> : <><span className="h-2.5 w-2.5 rounded-full bg-white animate-pulse" /> Go Live Now</>}
                        </button>
                    </div>
                </div>
            )}

            {/* ── Teacher: class ended ─────────────────────────────────────────── */}
            {isTeacher && liveClass.status === 'ended' && (
                <div className="flex-1 flex items-center justify-center p-8">
                    <div className="max-w-md w-full bg-card-bg border border-card-border rounded-[2.5rem] p-10 text-center space-y-6">
                        <div className="h-20 w-20 bg-foreground/5 rounded-[2rem] flex items-center justify-center mx-auto">
                            <Video className="h-10 w-10 text-foreground/20" />
                        </div>
                        <div>
                            <h2 className="text-xl font-black text-foreground uppercase tracking-tight italic">{liveClass.title}</h2>
                            <p className="text-[10px] font-black text-foreground/30 uppercase tracking-widest mt-1">Class Ended</p>
                        </div>
                        {liveClass.recording_url && (
                            <div className="space-y-3 text-left">
                                <p className="text-[10px] font-black text-foreground/40 uppercase tracking-widest">Recording</p>
                                <video
                                    src={liveClass.recording_url}
                                    controls
                                    className="w-full rounded-2xl bg-black border border-card-border"
                                    style={{ maxHeight: '220px' }}
                                />
                            </div>
                        )}
                        <button onClick={() => router.push('/dashboard/live/manage')}
                            className="w-full py-3 border border-card-border rounded-2xl text-[10px] font-black text-foreground/40 uppercase tracking-widest hover:bg-card-bg transition-all">
                            Back to My Classes
                        </button>
                    </div>
                </div>
            )}

            {/* ── Classroom (teacher live OR student joined) ────────────────────── */}
            {((isTeacher && isLive) || (!isTeacher && joined)) && (
                <div className="flex flex-1 overflow-hidden">

                    {/* ── Video Column ───────────────────────────────────────── */}
                    <div className="flex flex-col flex-1 min-w-0 overflow-hidden">

                        {/* Main video area */}
                        <div className="flex-1 bg-black relative overflow-hidden">
                            {/* Teacher: local preview */}
                            {isTeacher && (
                                <video
                                    ref={localVideoRef}
                                    autoPlay
                                    muted
                                    playsInline
                                    className="w-full h-full object-cover"
                                />
                            )}
                            {/* Student: teacher's remote stream */}
                            {!isTeacher && (
                                <>
                                    <video
                                        ref={remoteVideoRef}
                                        autoPlay
                                        playsInline
                                        className={cn("w-full h-full object-cover", !remoteActive && "hidden")}
                                    />
                                    {!remoteActive && (
                                        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-white/30">
                                            <Video className="h-12 w-12" />
                                            <p className="text-[10px] font-black uppercase tracking-widest">Waiting for teacher&apos;s stream...</p>
                                            <p className="text-[8px] text-white/20 uppercase tracking-widest">Audio &amp; video will appear automatically</p>
                                        </div>
                                    )}
                                </>
                            )}

                            {/* Pinned message overlay */}
                            {pinnedMsg && (
                                <div className="absolute top-3 left-3 right-3 bg-black/70 backdrop-blur-sm border border-amber-500/30 rounded-2xl px-4 py-2 flex items-center gap-2">
                                    <Pin className="h-3 w-3 text-amber-500 shrink-0" />
                                    <p className="text-[10px] font-black text-white truncate">{pinnedMsg.message}</p>
                                </div>
                            )}

                            {/* Screen share badge */}
                            {screenSharing && (
                                <div className="absolute top-12 left-3 flex items-center gap-1.5 bg-blue-600/80 border border-blue-400/30 rounded-full px-3 py-1">
                                    <Monitor className="h-3 w-3 text-white" />
                                    <span className="text-[9px] font-black text-white uppercase tracking-widest">Screen Sharing</span>
                                </div>
                            )}

                            {/* Recording indicator */}
                            {isTeacher && isLive && (
                                <div className="absolute bottom-3 right-3 flex items-center gap-1.5 bg-red-600/80 border border-red-400/30 rounded-full px-3 py-1">
                                    <span className="h-1.5 w-1.5 rounded-full bg-white animate-pulse" />
                                    <span className="text-[8px] font-black text-white uppercase tracking-widest">REC</span>
                                </div>
                            )}
                        </div>

                        {/* ── Teacher Controls ───────────────────────────────── */}
                        {isTeacher && (
                            <div className="bg-card-bg border-t border-card-border px-6 py-4 flex items-center justify-center gap-4 shrink-0">
                                <button
                                    onClick={toggleMic}
                                    className={cn(
                                        "h-12 w-12 rounded-2xl flex items-center justify-center transition-all",
                                        micOn ? "bg-foreground/10 text-foreground hover:bg-foreground/20" : "bg-red-500 text-white"
                                    )}
                                    title={micOn ? 'Mute' : 'Unmute'}
                                >
                                    {micOn ? <Mic className="h-5 w-5" /> : <MicOff className="h-5 w-5" />}
                                </button>
                                <button
                                    onClick={toggleCam}
                                    className={cn(
                                        "h-12 w-12 rounded-2xl flex items-center justify-center transition-all",
                                        camOn ? "bg-foreground/10 text-foreground hover:bg-foreground/20" : "bg-red-500 text-white"
                                    )}
                                    title={camOn ? 'Stop Camera' : 'Start Camera'}
                                >
                                    {camOn ? <Video className="h-5 w-5" /> : <VideoOff className="h-5 w-5" />}
                                </button>
                                <button
                                    onClick={screenSharing ? stopScreenShare : startScreenShare}
                                    className={cn(
                                        "h-12 w-12 rounded-2xl flex items-center justify-center transition-all",
                                        screenSharing ? "bg-blue-600 text-white" : "bg-foreground/10 text-foreground hover:bg-foreground/20"
                                    )}
                                    title={screenSharing ? 'Stop Screen Share' : 'Share Screen'}
                                >
                                    {screenSharing ? <MonitorOff className="h-5 w-5" /> : <Monitor className="h-5 w-5" />}
                                </button>
                                {liveClass.polls_enabled && (
                                    <button
                                        onClick={() => setShowPollForm(true)}
                                        className="h-12 px-5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white flex items-center gap-2 text-[10px] font-black uppercase tracking-widest transition-all"
                                    >
                                        <BarChart2 className="h-4 w-4" /> Poll
                                    </button>
                                )}
                            </div>
                        )}

                        {/* ── Student Controls ───────────────────────────────── */}
                        {!isTeacher && (
                            <div className="bg-card-bg border-t border-card-border px-4 py-3 flex items-center justify-between shrink-0">
                                <button
                                    onClick={toggleHand}
                                    className={cn(
                                        "flex items-center gap-2 px-5 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all",
                                        handRaised ? "bg-amber-500 text-white" : "bg-foreground/10 text-foreground hover:bg-foreground/20"
                                    )}
                                >
                                    <Hand className="h-4 w-4" /> {handRaised ? 'Lower Hand' : 'Raise Hand'}
                                </button>
                                <div className="flex items-center gap-1.5 text-[10px] font-black text-foreground/40 uppercase tracking-widest">
                                    <Video className="h-3.5 w-3.5" />
                                    <span>Viewer mode</span>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* ── Right Panel ────────────────────────────────────────── */}
                    <div className="w-80 flex flex-col border-l border-card-border bg-card-bg shrink-0 overflow-hidden">
                        <div className="flex border-b border-card-border shrink-0">
                            {(['chat', 'qa', 'polls', 'participants'] as PanelType[]).map(tab => (
                                <button
                                    key={tab}
                                    onClick={() => setActivePanel(tab)}
                                    className={cn(
                                        "flex-1 py-3 text-[8px] font-black uppercase tracking-widest transition-all",
                                        activePanel === tab ? "text-foreground border-b-2 border-indigo-500" : "text-foreground/30 hover:text-foreground/60"
                                    )}
                                >
                                    {tab === 'chat' ? '💬' : tab === 'qa' ? '❓' : tab === 'polls' ? '📊' : '👥'}
                                </button>
                            ))}
                        </div>

                        {/* ── Chat Panel ────────────────────────────────────── */}
                        {activePanel === 'chat' && (
                            <>
                                <div className="flex-1 overflow-y-auto p-4 space-y-3 scrollbar-hide">
                                    {chatMsgs.length === 0 && (
                                        <div className="text-center text-[9px] font-black text-foreground/20 uppercase tracking-widest pt-8">No messages yet</div>
                                    )}
                                    {chatMsgs.map(m => (
                                        <div key={m.id} className={cn("group flex gap-2", m.type === 'announcement' && "bg-amber-500/5 border border-amber-500/10 rounded-2xl p-2 -mx-1")}>
                                            <div className="h-6 w-6 rounded-full bg-gradient-to-br from-indigo-600 to-blue-600 flex items-center justify-center text-[9px] font-black text-white shrink-0 mt-0.5">
                                                {m.user?.name?.charAt(0)}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-1.5">
                                                    <span className="text-[9px] font-black text-indigo-400 uppercase">{m.user?.name}</span>
                                                    {m.type === 'announcement' && <span className="text-[8px] font-black text-amber-500 uppercase">📢</span>}
                                                    {isTeacher && (
                                                        <button onClick={() => pinMessage(m.id)} className="opacity-0 group-hover:opacity-100 ml-auto">
                                                            <Pin className={cn("h-2.5 w-2.5", m.is_pinned ? "text-amber-500" : "text-foreground/30")} />
                                                        </button>
                                                    )}
                                                </div>
                                                <p className="text-[10px] text-foreground/70 break-words">{m.message}</p>
                                            </div>
                                        </div>
                                    ))}
                                    <div ref={chatBottomRef} />
                                </div>
                                <div className="p-3 border-t border-card-border space-y-2 shrink-0">
                                    {user && (
                                        <div className="flex gap-1.5">
                                            {(['chat', 'question'] as const).map(t => (
                                                <button key={t} onClick={() => setMsgType(t)}
                                                    className={cn("flex-1 py-1.5 rounded-xl text-[8px] font-black uppercase tracking-widest transition-all",
                                                        msgType === t ? "bg-indigo-600 text-white" : "bg-foreground/5 text-foreground/40")}>
                                                    {t === 'chat' ? '💬 Chat' : '❓ Question'}
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                    <div className="flex gap-2">
                                        <input
                                            value={msgText}
                                            onChange={e => setMsgText(e.target.value)}
                                            onKeyDown={e => e.key === 'Enter' && !e.shiftKey && sendMessage()}
                                            placeholder={user ? "Type a message..." : "Sign in to chat"}
                                            disabled={!user}
                                            className="flex-1 bg-background border border-card-border rounded-xl px-3 py-2 text-[11px] text-foreground placeholder:text-foreground/30 focus:outline-none focus:ring-1 focus:ring-indigo-500/30"
                                        />
                                        <button onClick={sendMessage} disabled={!user || sending || !msgText.trim()}
                                            className="h-9 w-9 rounded-xl bg-indigo-600 flex items-center justify-center text-white disabled:opacity-30 hover:bg-indigo-500 transition-all">
                                            <Send className="h-3.5 w-3.5" />
                                        </button>
                                    </div>
                                </div>
                            </>
                        )}

                        {/* ── Q&A Panel ─────────────────────────────────────── */}
                        {activePanel === 'qa' && (
                            <div className="flex-1 overflow-y-auto p-4 space-y-3 scrollbar-hide">
                                {questions.length === 0 && (
                                    <div className="text-center text-[9px] font-black text-foreground/20 uppercase tracking-widest pt-8">No questions yet</div>
                                )}
                                {questions.map(q => (
                                    <div key={q.id} className={cn("rounded-2xl border p-3 space-y-1.5 transition-all",
                                        q.is_answered ? "border-green-500/20 bg-green-500/5" : "border-card-border bg-background")}>
                                        <div className="flex items-start justify-between gap-2">
                                            <span className="text-[9px] font-black text-indigo-400 uppercase">{q.user?.name}</span>
                                            {q.is_answered && <CheckCircle className="h-3.5 w-3.5 text-green-500 shrink-0" />}
                                        </div>
                                        <p className="text-[11px] text-foreground/70">{q.message}</p>
                                        {isTeacher && !q.is_answered && (
                                            <button onClick={() => markAnswered(q.id)}
                                                className="text-[8px] font-black text-green-500 uppercase tracking-widest hover:underline">
                                                Mark answered
                                            </button>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* ── Polls Panel ───────────────────────────────────── */}
                        {activePanel === 'polls' && (
                            <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-hide">
                                {polls.length === 0 && (
                                    <div className="text-center text-[9px] font-black text-foreground/20 uppercase tracking-widest pt-8">No polls yet</div>
                                )}
                                {polls.map(poll => {
                                    const totalVotes = poll.votes.reduce((a, b) => a + b, 0);
                                    const myVote = myVotes[poll.id];
                                    const revealed = poll.correct_option_index !== null && poll.correct_option_index !== undefined;
                                    return (
                                        <div key={poll.id} className="bg-background border border-card-border rounded-2xl p-4 space-y-3">
                                            <div className="flex items-start justify-between gap-2">
                                                <p className="text-[11px] font-black text-foreground">{poll.question}</p>
                                                <div className="flex items-center gap-1 shrink-0">
                                                    <Coins className="h-3 w-3 text-amber-500" />
                                                    <span className="text-[9px] font-black text-amber-500">{poll.coin_reward}</span>
                                                </div>
                                            </div>
                                            <div className="space-y-2">
                                                {poll.options.map((opt, i) => {
                                                    const voteCount = poll.votes[i] ?? 0;
                                                    const pct = totalVotes > 0 ? Math.round((voteCount / totalVotes) * 100) : 0;
                                                    const isCorrect = revealed && poll.correct_option_index === i;
                                                    const isWrong = revealed && myVote === i && poll.correct_option_index !== i;
                                                    const voted = myVote === i;
                                                    return (
                                                        <button
                                                            key={i}
                                                            onClick={() => !isTeacher && poll.is_active && votePoll(poll.id, i)}
                                                            disabled={!poll.is_active || myVote !== undefined || isTeacher}
                                                            className={cn(
                                                                "w-full relative flex items-center gap-3 px-3 py-2.5 rounded-xl border text-left overflow-hidden transition-all",
                                                                isCorrect ? "border-green-500/50 bg-green-500/10" :
                                                                isWrong ? "border-red-500/50 bg-red-500/10" :
                                                                voted ? "border-indigo-500/50 bg-indigo-500/10" :
                                                                "border-card-border hover:border-foreground/20"
                                                            )}
                                                        >
                                                            {(myVote !== undefined || !poll.is_active) && (
                                                                <div
                                                                    className={cn("absolute left-0 top-0 bottom-0 opacity-20 transition-all",
                                                                        isCorrect ? "bg-green-500" : "bg-indigo-500")}
                                                                    style={{ width: `${pct}%` }}
                                                                />
                                                            )}
                                                            <span className="text-[10px] font-black text-foreground/70 relative z-10 flex-1">{opt}</span>
                                                            <div className="flex items-center gap-2 relative z-10">
                                                                {isCorrect && <CheckCircle className="h-3.5 w-3.5 text-green-500" />}
                                                                {isWrong && <X className="h-3.5 w-3.5 text-red-500" />}
                                                                {(myVote !== undefined || !poll.is_active) && (
                                                                    <span className="text-[9px] font-black text-foreground/40">{pct}%</span>
                                                                )}
                                                            </div>
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                            {isTeacher && !revealed && (
                                                <div className="space-y-1.5 pt-1">
                                                    <p className="text-[8px] font-black text-foreground/30 uppercase tracking-widest">Reveal correct answer:</p>
                                                    <div className="flex flex-wrap gap-1.5">
                                                        {poll.options.map((opt, i) => (
                                                            <button key={i} onClick={() => revealAnswer(poll.id, i)}
                                                                disabled={revealingPoll === poll.id}
                                                                className="px-3 py-1.5 rounded-xl bg-green-500/10 border border-green-500/20 text-[9px] font-black text-green-500 hover:bg-green-500/20 transition-all">
                                                                {String.fromCharCode(65 + i)}
                                                            </button>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                            {revealed && (
                                                <div className="flex items-center gap-1.5 text-[9px] font-black text-green-500 uppercase tracking-widest">
                                                    <CheckCircle className="h-3.5 w-3.5" /> Answer revealed · {totalVotes} votes
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        )}

                        {/* ── Participants Panel ────────────────────────────── */}
                        {activePanel === 'participants' && (
                            <div className="flex-1 overflow-y-auto p-4 space-y-2 scrollbar-hide">
                                <div className="text-[9px] font-black text-foreground/30 uppercase tracking-widest mb-3">
                                    {participantCount} in class
                                </div>
                                {handsRaised.length > 0 && (
                                    <div className="space-y-1.5">
                                        <p className="text-[8px] font-black text-amber-500 uppercase tracking-widest">Raised Hands</p>
                                        {handsRaised.map(h => (
                                            <div key={h.user.id} className="flex items-center justify-between gap-2 bg-amber-500/5 border border-amber-500/10 rounded-xl px-3 py-2">
                                                <span className="text-[10px] font-black text-foreground/70 uppercase">{h.user.name}</span>
                                                {isTeacher && (
                                                    <button onClick={() => api.patch(`/live-classes/${id}/participants/${h.user.id}/lower-hand`).then(() => setHandsRaised(p => p.filter(x => x.user.id !== h.user.id))).catch(() => {})}
                                                        className="text-[8px] font-black text-amber-500 hover:text-amber-400">Lower</button>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* ── End Class Modal ──────────────────────────────────────────────── */}
            {showEndModal && (
                <div className="fixed inset-0 z-[500] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setShowEndModal(false)} />
                    <div className="relative z-10 w-full max-w-sm bg-card-bg border border-card-border rounded-[2rem] p-8 space-y-6 shadow-2xl animate-in zoom-in-95 fade-in duration-200">
                        <div className="text-center">
                            <div className="h-16 w-16 bg-red-500/10 rounded-[1.5rem] flex items-center justify-center mx-auto mb-4">
                                <Radio className="h-8 w-8 text-red-500" />
                            </div>
                            <h3 className="text-lg font-black text-foreground uppercase tracking-tight italic">End Live Class?</h3>
                            <p className="text-[10px] font-black text-foreground/40 uppercase tracking-widest mt-1">Choose how you want to end</p>
                        </div>
                        <div className="space-y-3">
                            <button
                                onClick={saveAndEnd}
                                className="w-full flex items-center gap-3 px-5 py-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl transition-all group"
                            >
                                <Save className="h-5 w-5 shrink-0" />
                                <div className="text-left">
                                    <p className="text-[11px] font-black uppercase tracking-widest">Save Video &amp; End Class</p>
                                    <p className="text-[9px] text-white/60 uppercase tracking-widest mt-0.5">Students can watch the recording later</p>
                                </div>
                            </button>
                            <button
                                onClick={endWithoutSaving}
                                className="w-full flex items-center gap-3 px-5 py-4 bg-red-500/10 border border-red-500/30 hover:bg-red-500/20 text-red-500 rounded-2xl transition-all"
                            >
                                <LogOut className="h-5 w-5 shrink-0" />
                                <div className="text-left">
                                    <p className="text-[11px] font-black uppercase tracking-widest">End Without Saving</p>
                                    <p className="text-[9px] text-red-500/60 uppercase tracking-widest mt-0.5">Recording will be discarded</p>
                                </div>
                            </button>
                        </div>
                        <button
                            onClick={() => setShowEndModal(false)}
                            className="w-full py-3 text-[10px] font-black text-foreground/30 uppercase tracking-widest hover:text-foreground/50 transition-all"
                        >
                            Cancel — Keep Class Live
                        </button>
                    </div>
                </div>
            )}

            {/* ── Poll Creation Modal ──────────────────────────────────────────── */}
            {showPollForm && (
                <div className="fixed inset-0 z-[500] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowPollForm(false)} />
                    <div className="relative z-10 w-full max-w-md bg-card-bg border border-card-border rounded-[2rem] p-6 space-y-4 shadow-2xl animate-in zoom-in-95 fade-in duration-200">
                        <h3 className="text-base font-black text-foreground uppercase tracking-tight italic">Launch Poll</h3>
                        <input value={pollQuestion} onChange={e => setPollQuestion(e.target.value)} placeholder="Poll question..."
                            className="w-full bg-background border border-card-border rounded-2xl px-4 py-3 text-sm text-foreground placeholder:text-foreground/30 focus:outline-none focus:ring-1 focus:ring-indigo-500/30" />
                        <div className="space-y-2">
                            {pollOptions.map((opt, i) => (
                                <div key={i} className="flex gap-2">
                                    <input value={opt} onChange={e => setPollOptions(p => p.map((o, j) => j === i ? e.target.value : o))}
                                        placeholder={`Option ${String.fromCharCode(65 + i)}`}
                                        className="flex-1 bg-background border border-card-border rounded-2xl px-4 py-2.5 text-sm text-foreground placeholder:text-foreground/30 focus:outline-none" />
                                    {pollOptions.length > 2 && (
                                        <button onClick={() => setPollOptions(p => p.filter((_, j) => j !== i))}
                                            className="h-10 w-10 rounded-xl bg-red-500/10 text-red-500 flex items-center justify-center hover:bg-red-500/20">
                                            <X className="h-3.5 w-3.5" />
                                        </button>
                                    )}
                                </div>
                            ))}
                            {pollOptions.length < 6 && (
                                <button onClick={() => setPollOptions(p => [...p, ''])}
                                    className="text-[10px] font-black text-indigo-400 uppercase tracking-widest hover:text-indigo-300">
                                    + Add option
                                </button>
                            )}
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="flex items-center gap-2 flex-1">
                                <Coins className="h-4 w-4 text-amber-500 shrink-0" />
                                <label className="text-[10px] font-black text-foreground/40 uppercase tracking-widest shrink-0">Coin reward</label>
                                <input type="number" min={0} max={100} value={pollCoinReward} onChange={e => setPollCoinReward(+e.target.value)}
                                    className="w-16 bg-background border border-card-border rounded-xl px-2 py-1 text-sm text-foreground text-center focus:outline-none" />
                            </div>
                        </div>
                        <div className="flex gap-3">
                            <button onClick={() => setShowPollForm(false)}
                                className="flex-1 py-3 border border-card-border rounded-2xl text-[10px] font-black uppercase tracking-widest text-foreground/40">
                                Cancel
                            </button>
                            <button onClick={createPoll} disabled={creatingPoll || !pollQuestion.trim()}
                                className="flex-1 py-3 bg-indigo-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-500 disabled:opacity-40">
                                {creatingPoll ? 'Launching...' : 'Launch Poll'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <AuthModal open={authModal} onClose={() => setAuthModal(false)} reason="join live classes" redirectTo="/dashboard/live" />
        </div>
    );
}
