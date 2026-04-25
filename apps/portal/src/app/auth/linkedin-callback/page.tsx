'use client';

import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';

function CallbackContent() {
    const params = useSearchParams();
    const code = params.get('code');
    const error = params.get('error');

    if (error) {
        return (
            <div style={{ fontFamily: 'monospace', padding: 40, background: '#0f0f1a', minHeight: '100vh', color: 'white' }}>
                <h2 style={{ color: '#ef4444' }}>Error: {error}</h2>
                <p>{params.get('error_description')}</p>
            </div>
        );
    }

    return (
        <div style={{ fontFamily: 'monospace', padding: 40, background: '#0f0f1a', minHeight: '100vh', color: 'white' }}>
            <h2 style={{ color: '#10b981', marginBottom: 8 }}>Authorization successful</h2>
            <p style={{ color: '#94a3b8', marginBottom: 24 }}>Copy the code below and paste it to Claude:</p>
            <div style={{
                background: '#1e293b',
                border: '1px solid #334155',
                borderRadius: 8,
                padding: '20px 24px',
                fontSize: 14,
                wordBreak: 'break-all',
                color: '#6366f1',
                letterSpacing: 1
            }}>
                {code || 'No code found in URL'}
            </div>
            <button
                onClick={() => code && navigator.clipboard.writeText(code)}
                style={{
                    marginTop: 16,
                    background: '#6366f1',
                    color: 'white',
                    border: 'none',
                    borderRadius: 6,
                    padding: '10px 20px',
                    cursor: 'pointer',
                    fontWeight: 700
                }}
            >
                Copy Code
            </button>
        </div>
    );
}

export default function LinkedInCallback() {
    return (
        <Suspense fallback={<div style={{ padding: 40, color: 'white', background: '#0f0f1a', minHeight: '100vh' }}>Loading...</div>}>
            <CallbackContent />
        </Suspense>
    );
}
