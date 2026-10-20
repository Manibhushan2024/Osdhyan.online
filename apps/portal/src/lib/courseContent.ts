/**
 * Shared contract for Courses content (mirrors backend App\Support\CourseContent).
 *
 * Hierarchy endpoints (student: GET /courses/subjects/{id}/hierarchy,
 * admin: GET /admin/subjects/{id}/hierarchy) return
 *   { subject, data: Chapter[] }  where Chapter.topics[].materials[]
 * Course list endpoints return { data: [...] }.
 */

export type MaterialType = 'pdf' | 'image' | 'video' | 'audio' | 'youtube' | 'doc';

export type CourseMaterial = {
    id: number;
    title: string;
    description?: string | null;
    type: MaterialType | string;
    file_path?: string | null;
    external_url?: string | null;
    embed_url?: string | null;
    mime_type?: string | null;
    file_size?: number | null;
    is_published?: boolean;
    created_at?: string;
};

export type CourseTopic = {
    id: number;
    chapter_id: number;
    name_en: string;
    name_hi?: string | null;
    is_published: boolean;
    materials: CourseMaterial[];
};

export type CourseChapter = {
    id: number;
    subject_id: number;
    name_en: string;
    name_hi?: string | null;
    is_published: boolean;
    topics: CourseTopic[];
};

/** Accepts either a bare array or a {data: [...]} envelope. */
// eslint-disable-next-line @typescript-eslint/no-explicit-any -- callers pass loosely typed API rows
export function asList<T = any>(body: unknown): T[] {
    if (Array.isArray(body)) return body as T[];
    const data = (body as { data?: unknown } | null)?.data;
    return Array.isArray(data) ? (data as T[]) : [];
}

/** Public URL of a file on the API's public disk (same-origin /storage by default). */
export function storageUrl(path?: string | null): string | null {
    if (!path) return null;
    if (/^https?:\/\//i.test(path)) return path;
    const configured = (process.env.NEXT_PUBLIC_STORAGE_URL || process.env.NEXT_PUBLIC_API_URL?.replace(/\/api\/?$/, '') || '').replace(/\/$/, '');
    const base = configured.endsWith('/storage') ? configured : `${configured}/storage`;
    return `${base}/${path.replace(/^\//, '')}`;
}

export function youtubeId(url?: string | null): string | null {
    if (!url) return null;
    const m = url.match(/(?:youtu\.be\/|youtube(?:-nocookie)?\.com\/(?:watch\?(?:.*&)?v=|embed\/|shorts\/|live\/|v\/))([A-Za-z0-9_-]{11})/);
    return m ? m[1] : null;
}

export function youtubeEmbedUrl(material: CourseMaterial): string | null {
    if (material.embed_url) return material.embed_url;
    const id = youtubeId(material.external_url);
    return id ? `https://www.youtube-nocookie.com/embed/${id}?rel=0&modestbranding=1` : null;
}

/** Where the "open / download" buttons should point. */
export function materialUrl(material: CourseMaterial): string | null {
    if (material.type === 'youtube') return material.external_url ?? null;
    return storageUrl(material.file_path);
}

export const TYPE_LABELS: Record<string, string> = {
    pdf: 'PDF notes',
    image: 'Picture',
    video: 'Video',
    audio: 'Audio',
    youtube: 'YouTube video',
    doc: 'Document',
};

export function typeLabel(type: string): string {
    return TYPE_LABELS[type] ?? 'File';
}

/** How students browse a topic: one tab per group. */
export type ContentGroup = 'notes' | 'video' | 'audio' | 'pictures';

export const CONTENT_GROUPS: Array<{ id: ContentGroup; label: string; types: string[] }> = [
    { id: 'notes', label: 'Notes', types: ['pdf', 'doc'] },
    { id: 'video', label: 'Video', types: ['video', 'youtube'] },
    { id: 'audio', label: 'Audio', types: ['audio'] },
    { id: 'pictures', label: 'Mind maps & pictures', types: ['image'] },
];

export function materialsInGroup(materials: CourseMaterial[] | undefined, group: ContentGroup): CourseMaterial[] {
    const types = CONTENT_GROUPS.find((g) => g.id === group)?.types ?? [];
    return (materials ?? []).filter((m) => types.includes(m.type));
}

/** Accept list for the admin file picker (keep in sync with CourseContent::EXTENSIONS). */
export const UPLOAD_ACCEPT = '.pdf,.jpg,.jpeg,.png,.webp,.gif,.mp4,.m4v,.webm,.mp3,.m4a,.aac,.wav,.ogg,.oga,.doc,.docx,.ppt,.pptx';

export const MAX_UPLOAD_BYTES = 500 * 1024 * 1024;

export function formatBytes(bytes?: number | null): string {
    if (!bytes) return '';
    if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`;
    if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
}
