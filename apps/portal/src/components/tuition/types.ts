/** Shared types for the home-tuition marketplace (mirrors routes/api/tuition.php). */

export type TeachingMode = 'online' | 'home' | 'both';

export const MODE_LABELS: Record<TeachingMode, string> = {
    online: 'Online',
    home: 'Home visit',
    both: 'Online or home',
};

export const EXAM_OPTIONS = [
    'BPSC', 'UPSC', 'SSC', 'Banking', 'Railway', 'JEE', 'NEET', 'CTET', 'BTET',
    'Class 6', 'Class 7', 'Class 8', 'Class 9', 'Class 10', 'Class 11', 'Class 12',
];

export const SUBJECT_SUGGESTIONS = [
    'Mathematics', 'Science', 'Physics', 'Chemistry', 'Biology', 'English', 'Hindi',
    'History', 'Geography', 'Polity', 'Economics', 'General Studies', 'Reasoning', 'Computer',
];

export type TeacherPublic = {
    id: number;
    user_id: number;
    name: string | null;
    avatar: string | null;
    headline: string | null;
    bio: string | null;
    subjects: string[];
    exams: string[];
    teaching_mode: TeachingMode;
    city: string | null;
    areas: string[];
    fee_per_hour: number | null;
    experience_years: number;
    qualifications: string | null;
    languages: string[];
    availability: string | null;
    is_available: boolean;
    is_verified: boolean;
    verified_at: string | null;
};

export type TeacherOwnProfile = TeacherPublic & {
    verification_status: 'pending' | 'verified';
};

export type TeacherProfileInput = {
    headline: string;
    bio: string;
    subjects: string[];
    exams: string[];
    teaching_mode: TeachingMode;
    city: string;
    areas: string[];
    fee_per_hour: string;
    experience_years: string;
    qualifications: string;
    languages: string[];
    availability: string;
    is_available: boolean;
};

export const EMPTY_PROFILE_INPUT: TeacherProfileInput = {
    headline: '',
    bio: '',
    subjects: [],
    exams: [],
    teaching_mode: 'both',
    city: '',
    areas: [],
    fee_per_hour: '',
    experience_years: '0',
    qualifications: '',
    languages: [],
    availability: '',
    is_available: true,
};

export type Proposal = {
    id: number;
    teacher_id: number;
    teacher_name: string | null;
    teacher_avatar: string | null;
    teacher_headline: string | null;
    teacher_experience_years: number | null;
    teacher_profile_id: number | null;
    message: string;
    fee_per_hour: number;
    status: 'pending' | 'accepted' | 'rejected';
    created_at: string;
};

export type TuitionRequest = {
    id: number;
    type: 'requirement' | 'direct';
    subject: string;
    exam: string | null;
    mode: TeachingMode;
    city: string | null;
    area: string | null;
    budget_per_hour: number | null;
    preferred_timing: string | null;
    description: string | null;
    status: 'open' | 'matched' | 'closed';
    selected_teacher_id: number | null;
    selected_teacher: { id: number; name: string; avatar: string | null } | null;
    conversation_id: number | null;
    proposals_count: number;
    proposals: Proposal[];
    created_at: string;
};

export type Lead = {
    id: number;
    subject: string;
    exam: string | null;
    mode: TeachingMode;
    city: string | null;
    area: string | null;
    budget_per_hour: number | null;
    preferred_timing: string | null;
    description: string | null;
    status: string;
    student_name: string | null;
    created_at: string;
    already_proposed?: boolean;
};

export type MyProposal = {
    id: number;
    message: string;
    fee_per_hour: number;
    status: 'pending' | 'accepted' | 'rejected';
    created_at: string;
    request: Lead | null;
    conversation_id: number | null;
};

export type Paginated<T> = {
    data: T[];
    current_page: number;
    last_page: number;
    total: number;
};

/** The AuthProvider user type predates `role`; read it defensively. */
export function userRole(user: unknown): 'student' | 'teacher' | undefined {
    const role = (user as { role?: string } | null | undefined)?.role;
    return role === 'teacher' ? 'teacher' : role === 'student' ? 'student' : undefined;
}

export function errorMessage(err: unknown, fallback = 'Something went wrong. Please try again.'): string {
    const e = err as { response?: { data?: { message?: string; errors?: Record<string, string[]> } } };
    const errors = e?.response?.data?.errors;
    if (errors) {
        const first = Object.values(errors)[0];
        if (first?.length) return first[0];
    }
    return e?.response?.data?.message || fallback;
}

export function formatINR(n: number | null | undefined): string {
    if (n === null || n === undefined) return '—';
    return '₹' + n.toLocaleString('en-IN');
}
