'use client';

import { useMemo } from 'react';
import { encodeQr, qrToSvgPath } from './qr';

type Props = {
    value: string;
    /** rendered size in px */
    size?: number;
    className?: string;
};

/** Client-side QR code (no external image API) rendered as an SVG. */
export default function QrCode({ value, size = 180, className }: Props) {
    const { path, modules } = useMemo(() => {
        try {
            const matrix = encodeQr(value, 'M');
            return { path: qrToSvgPath(matrix), modules: matrix.length };
        } catch {
            return { path: '', modules: 0 };
        }
    }, [value]);

    if (!modules) return null;
    const quiet = 4;
    const view = modules + quiet * 2;

    return (
        <svg
            role="img"
            aria-label="QR code"
            width={size}
            height={size}
            viewBox={`0 0 ${view} ${view}`}
            shapeRendering="crispEdges"
            className={className}
        >
            <rect width={view} height={view} fill="#ffffff" />
            <path d={path} fill="#0f172a" transform={`translate(${quiet} ${quiet})`} />
        </svg>
    );
}
