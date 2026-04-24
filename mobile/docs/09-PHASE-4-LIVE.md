# Phase 4 — Live Classes & WebRTC (Week 8–10)

> **This phase requires a custom dev client (not Expo Go).**
> See `01-SETUP.md` → Custom Dev Client section.

---

## Step 4.1 — Live Class List Screen

```
Screen: LiveClassListScreen
API: GET /live-classes (polls every 10 seconds to detect newly live classes)

Tabs:
- LIVE NOW (status=live) — with red pulse indicator
- Upcoming (status=scheduled)
- Past / Recordings (status=ended)

LiveClassCard:
- Status badge (LIVE / SCHEDULED / ENDED)
- Title + subject + teacher name
- Participant count (if live)
- Scheduled time (if scheduled)
- "Watch Recording" button (if ended + has recording)
- "Join" button (if live)
- Tap → LiveClassDetailScreen
```

---

## Step 4.2 — Live Class Detail Screen (Pre-Join)

```
Screen: LiveClassDetailScreen
Route params: { classId }
API: GET /live-classes/{id}

Shows:
- Class title + teacher avatar + name
- Status badge
- Subject + description
- Features enabled: Chat ✓, Q&A ✓, Polls ✓, Raise Hand ✓
- Coin incentive: "Answer polls correctly to earn coins! 🪙"
- Join button (if live) → LiveClassRoomScreen
- Watch Recording button (if ended + recording_url exists)
```

---

## Step 4.3 — Live Class Room (Viewer Mode)

```
Screen: LiveClassRoomScreen
Full-screen, hides tab bar and header

This is the most complex screen. Split into:
- VideoPanel (top 55%)
- PanelTabs + Content (bottom 45%)
```

### Architecture

```typescript
// src/screens/live/LiveClassRoomScreen.tsx

// State:
const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
const [joined, setJoined] = useState(false);
const [teacherId, setTeacherId] = useState<number | null>(null);
const peerConnection = useRef<RTCPeerConnection | null>(null);
const lastSignalId = useRef(0);
const signalInterval = useRef<NodeJS.Timeout | null>(null);
const stateInterval = useRef<NodeJS.Timeout | null>(null);

// On mount:
// 1. Determine role (teacher or student based on liveClass.teacher.id === user.id)
// 2. If student → show "Join" button
// 3. If teacher → show "Go Live" button
```

### Student Flow

```typescript
// 1. JOIN
const handleJoin = async () => {
  const res = await api.post(`/live-classes/${id}/join`);
  setTeacherId(res.data.teacher_id);
  setJoined(true);

  // Send "ready" signal to teacher
  await api.post(`/live-classes/${id}/signals`, {
    type: 'ready',
    payload: {},
    to_user_id: res.data.teacher_id,
  });

  // Start polling state + signals
  startPolling(res.data.teacher_id);
};

// 2. SIGNAL POLLING (every 800ms)
const pollSignals = async (tId: number) => {
  const res = await api.get(`/live-classes/${id}/signals`, {
    params: { since_id: lastSignalId.current }
  });
  const { signals, last_id } = res.data;
  lastSignalId.current = last_id;

  for (const sig of signals) {
    if (sig.from_user_id !== tId) continue;

    if (sig.type === 'offer' || sig.type === 'screen-share-offer') {
      // Create or reuse peer connection
      if (!peerConnection.current) {
        createStudentPC(tId);
      }
      await peerConnection.current.setRemoteDescription(
        new RTCSessionDescription(sig.payload)
      );
      const answer = await peerConnection.current.createAnswer();
      await peerConnection.current.setLocalDescription(answer);
      await api.post(`/live-classes/${id}/signals`, {
        type: 'answer',
        payload: { type: answer.type, sdp: answer.sdp },
        to_user_id: tId,
      });
    }

    if (sig.type === 'ice-candidate' && sig.payload?.candidate) {
      if (peerConnection.current?.remoteDescription) {
        await peerConnection.current.addIceCandidate(
          new RTCIceCandidate(sig.payload)
        );
      }
    }
  }
};

// 3. Create Peer Connection (Student)
const createStudentPC = (tId: number) => {
  const pc = new RTCPeerConnection({
    iceServers: [
      { urls: 'stun:stun.l.google.com:19302' },
      { urls: 'stun:stun1.l.google.com:19302' },
    ]
  });

  pc.onicecandidate = async (event) => {
    if (!event.candidate) return;
    await api.post(`/live-classes/${id}/signals`, {
      type: 'ice-candidate',
      payload: {
        candidate: event.candidate.candidate,
        sdpMid: event.candidate.sdpMid,
        sdpMLineIndex: event.candidate.sdpMLineIndex,
      },
      to_user_id: tId,
    });
  };

  pc.ontrack = (event) => {
    setRemoteStream(event.streams[0]);
  };

  peerConnection.current = pc;
};
```

### Video Component

```typescript
import { RTCView } from 'react-native-webrtc';

// Display remote stream
<RTCView
  streamURL={remoteStream?.toURL()}
  style={{ flex: 1 }}
  objectFit="cover"
  mirror={false}
/>

// When no stream yet:
<View style={styles.waitingOverlay}>
  <VideoIcon size={48} color="rgba(255,255,255,0.2)" />
  <Text style={styles.waitingText}>Waiting for teacher's stream...</Text>
</View>
```

---

## Step 4.4 — Chat Panel

```typescript
// Polls with state: GET /live-classes/{id}/state?since={timestamp}
// Updates messages array (deduplicate by id)

// Message types:
// - chat: regular message
// - question: student question (shown in Q&A tab too)
// - announcement: teacher announcement (gold badge)

// Chat input:
// - Type selector: Chat / Question (segmented control)
// - Text input + Send button
// - POST /live-classes/{id}/messages

// Raise hand button (for students):
// - POST /live-classes/{id}/raise-hand
// - Toggle state, show amber color when raised
```

---

## Step 4.5 — Polls Panel

```typescript
// Poll display:
// - Question text
// - Options as vote buttons
// - After voting: show percentage bars (animate with Reanimated)
// - Coin reward badge (amber, shown before voting)

// Correct answer revealed:
// - Correct option: green background
// - User's wrong option: red background
// - Coin toast: "+5 coins earned! 🪙"

// Student vote:
// POST /live-classes/{id}/polls/{pollId}/vote
// Body: { option_index }
// Response: { poll, coins_earned }
// If coins_earned > 0 → trigger CoinEarnedAnimation component
```

### CoinEarnedAnimation
```typescript
// Animated component: coins fly up from bottom + "+5 🪙" text
// Uses react-native-reanimated
// Triggers when coins_earned > 0 from vote response
```

---

## Step 4.6 — Past Class Recordings

```
Screen: RecordingPlayerScreen
Route params: { classId, recordingUrl }

Uses expo-av for video playback:
- Full-screen video player
- Standard controls (play/pause, seek, fullscreen toggle, speed)
- Video source: liveClass.recording_url
```

```typescript
import { Video, ResizeMode } from 'expo-av';

<Video
  source={{ uri: recordingUrl }}
  useNativeControls
  resizeMode={ResizeMode.CONTAIN}
  style={{ width: '100%', aspectRatio: 16/9 }}
/>
```

---

## Phase 4 Checklist

- [ ] Custom dev client built (required for WebRTC)
- [ ] LiveClassListScreen with LIVE/Upcoming/Past tabs
- [ ] LiveClassDetailScreen (pre-join)
- [ ] LiveClassRoomScreen (full-screen)
  - [ ] RTCPeerConnection setup for student
  - [ ] Signal polling loop (800ms)
  - [ ] "ready" signal on join
  - [ ] ICE candidate handling
  - [ ] RTCView displaying remote stream
  - [ ] "Waiting for stream..." placeholder
- [ ] Chat panel with message sending
- [ ] Raise hand functionality
- [ ] Q&A panel (filtered questions)
- [ ] Polls panel with voting + result bars
- [ ] Coin earned animation
- [ ] RecordingPlayerScreen with expo-av
- [ ] State polling (2.5 second intervals)
- [ ] Coin balance update in real time

---

## Notes

### react-native-webrtc Installation

```bash
npm install react-native-webrtc

# iOS (after pod install):
# Add to Info.plist:
<key>NSCameraUsageDescription</key>
<string>Camera access for live classes</string>
<key>NSMicrophoneUsageDescription</key>
<string>Microphone access for live classes</string>

# Android: add to AndroidManifest.xml:
<uses-permission android:name="android.permission.CAMERA" />
<uses-permission android:name="android.permission.RECORD_AUDIO" />
<uses-permission android:name="android.permission.MODIFY_AUDIO_SETTINGS" />
```

### Students are VIEW-ONLY
Students do NOT use camera or microphone on mobile. Only the teacher sends a stream. Students receive and display the remote stream. This simplifies the mobile implementation significantly.
