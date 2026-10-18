import type { useAuth } from '@/components/providers/AuthProvider';

type AuthUser = NonNullable<ReturnType<typeof useAuth>['user']>;

/** Teachers (users.role) and admins may run classes. */
export function canTeach(user: AuthUser | null | undefined): boolean {
    if (!user) return false;
    const role = (user as { role?: string }).role;
    return role === 'teacher' || !!user.is_teacher || !!user.is_admin;
}

export function formatAgo(dateStr: string): string {
    const diff = Math.max(0, Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000));
    if (diff < 60) return `${diff}s ago`;
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return `${Math.floor(diff / 86400)}d ago`;
}

export function formatWhen(dateStr: string | null | undefined): string {
    if (!dateStr) return 'Time to be announced';
    return new Date(dateStr).toLocaleString('en-IN', {
        weekday: 'short', day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit',
    });
}

export function formatClock(dateStr: string | null | undefined): string {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
}

/** "02:14:09" style countdown; empty string once the moment has passed. */
export function countdownTo(dateStr: string | null | undefined, now: number = Date.now()): string {
    if (!dateStr) return '';
    const ms = new Date(dateStr).getTime() - now;
    if (ms <= 0) return '';
    const s = Math.floor(ms / 1000);
    const d = Math.floor(s / 86400);
    const h = Math.floor((s % 86400) / 3600);
    const m = Math.floor((s % 3600) / 60);
    const sec = s % 60;
    const pad = (n: number) => String(n).padStart(2, '0');
    return d > 0 ? `${d}d ${pad(h)}:${pad(m)}:${pad(sec)}` : `${pad(h)}:${pad(m)}:${pad(sec)}`;
}

/** Converts a <input type="datetime-local"> value to ISO (local → UTC). */
export function localInputToIso(value: string): string | null {
    if (!value) return null;
    const d = new Date(value);
    return isNaN(d.getTime()) ? null : d.toISOString();
}

/** ISO → value accepted by <input type="datetime-local"> in local time. */
export function isoToLocalInput(iso: string | null | undefined): string {
    if (!iso) return '';
    const d = new Date(iso);
    const pad = (n: number) => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export function apiErrorMessage(err: unknown, fallback: string): string {
    const e = err as { response?: { data?: { message?: string; errors?: Record<string, string[]> } } };
    const data = e?.response?.data;
    if (data?.errors) {
        const first = Object.values(data.errors)[0];
        if (first?.[0]) return first[0];
    }
    return data?.message || fallback;
}

export function apiErrorCode(err: unknown): string | null {
    const e = err as { response?: { data?: { code?: string } } };
    return e?.response?.data?.code ?? null;
}

export async function copyText(text: string): Promise<boolean> {
    try {
        await navigator.clipboard.writeText(text);
        return true;
    } catch {
        return false;
    }
}
