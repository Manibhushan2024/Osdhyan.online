export type LiveStatus = 'scheduled' | 'live' | 'ended';
export type LiveProviderKey = 'jitsi' | 'youtube';

export type LiveTeacher = { id: number; name: string; avatar?: string | null } | null;

export type LiveClassSummary = {
    id: number;
    title: string;
    description: string | null;
    subject: string | null;
    exam: string | null;
    tags: string[];
    thumbnail: string | null;
    provider: LiveProviderKey;
    status: LiveStatus;
    duration_min: number | null;
    max_participants: number;
    scheduled_at: string | null;
    started_at: string | null;
    ended_at: string | null;
    recording_url: string | null;
    is_recording_available: boolean;
    youtube_video_id: string | null;
    teacher: LiveTeacher;
    participants_count: number;
    can_manage?: boolean;
};

/** Owner view: public fields + room credentials. */
export type OwnedLiveClass = LiveClassSummary & {
    room_name: string | null;
    join_password: string | null;
};

export type ChatUser = { id: number; name: string | null; avatar?: string | null; is_teacher: boolean };

export type ChatMessage = {
    id: number;
    body: string;
    is_pinned: boolean;
    is_answered: boolean;
    created_at: string | null;
    user: ChatUser;
    /** client-only: optimistic message not yet acknowledged */
    pending?: boolean;
};

export type PollOption = { id: string; text: string };

export type Poll = {
    id: number;
    question: string;
    options: PollOption[];
    is_open: boolean;
    revealed_at: string | null;
    created_at: string | null;
    total_votes: number;
    results: Record<string, number> | null;
};

export type HandRaised = { user_id: number; name: string | null; avatar?: string | null; raised_at: string | null };

export type LiveState = {
    id: number;
    status: LiveStatus;
    provider: LiveProviderKey;
    started_at: string | null;
    ended_at: string | null;
    scheduled_at: string | null;
    recording_url: string | null;
    participants_count: number;
    hands_raised_count: number;
    pinned_messages: ChatMessage[];
    poll: Poll | null;
    latest_message_id: number;
    server_time: string;
    me: { joined: boolean; hand_raised: boolean; is_teacher: boolean };
    my_vote: string | null;
    /** teacher only */
    hands_raised?: HandRaised[];
};

export type JitsiPayload = {
    kind: 'jitsi';
    mode: 'plain' | 'jaas';
    domain: string;
    external_api_url: string;
    room: string;
    jwt: string | null;
    password: string | null;
    is_moderator: boolean;
};

export type YoutubePayload = {
    kind: 'youtube';
    video_id: string;
    embed_url: string;
    is_moderator: boolean;
};

export type JoinPayload = JitsiPayload | YoutubePayload;

export type JoinResponse = {
    class: LiveClassSummary;
    provider: JoinPayload;
    state: LiveState;
};

export type ProviderInfo = Record<LiveProviderKey, { label: string; mode: string; recommended: string }>;

export type Paginated<T> = {
    data: T[];
    current_page: number;
    last_page: number;
    total: number;
};
