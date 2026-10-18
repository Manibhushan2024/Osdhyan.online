'use client';

import { Suspense, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import ChatPanel from '@/components/chat/ChatPanel';

function MessagesInner() {
    const params = useSearchParams();
    const router = useRouter();
    const initial = params.get('c');
    const initialId = initial && /^\d+$/.test(initial) ? Number(initial) : null;

    const onChange = useCallback((id: number | null) => {
        const next = id ? `/dashboard/messages?c=${id}` : '/dashboard/messages';
        if (typeof window !== 'undefined' && window.location.pathname + window.location.search !== next) {
            router.replace(next);
        }
    }, [router]);

    return (
        <div className="max-w-6xl mx-auto space-y-4">
            <div>
                <h1 className="text-2xl font-bold text-foreground">Messages</h1>
                <p className="text-sm text-foreground/60">All contact with tutors and students stays here. Never share phone numbers or payment details in chat.</p>
            </div>
            <ChatPanel initialConversationId={initialId} onConversationChange={onChange} />
        </div>
    );
}

export default function MessagesPage() {
    return (
        <Suspense fallback={<div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-blue-600" /></div>}>
            <MessagesInner />
        </Suspense>
    );
}
