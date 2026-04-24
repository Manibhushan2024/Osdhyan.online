'use client';

import { useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';

export default function LegacyTestPlayerRedirect() {
    const params = useParams();
    const router = useRouter();

    useEffect(() => {
        router.replace(`/dashboard/tests/play/${params.id}`);
    }, [params.id, router]);

    return (
        <div className="flex items-center justify-center min-h-screen">
            <p>Redirecting to mission command...</p>
        </div>
    );
}
