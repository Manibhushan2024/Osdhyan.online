'use client';

import { Download, FileText, FolderOpen, Headphones } from 'lucide-react';
import { cn } from '@/lib/utils';
import { type CourseMaterial, materialUrl, storageUrl, youtubeEmbedUrl } from '@/lib/courseContent';
import FullscreenFrame from './FullscreenFrame';

type MaterialViewProps = {
    material: CourseMaterial;
    /** Fill the parent (course console) instead of sizing to content (material page). */
    fill?: boolean;
    className?: string;
};

/**
 * Renders one piece of course content:
 * pdf → inline viewer, image → picture, video → <video>, audio → <audio>,
 * youtube → embedded player, anything else → download card.
 *
 * PDFs, images, videos and YouTube lessons get a real full-screen mode
 * (FullscreenFrame): button in the corner, F to toggle, Esc to leave.
 */
export default function MaterialView({ material, fill = true, className }: MaterialViewProps) {
    const fileUrl = storageUrl(material.file_path);
    const viewable = ['pdf', 'image', 'video', 'youtube'].includes(material.type)
        && (material.type === 'youtube' ? !!youtubeEmbedUrl(material) : !!fileUrl);

    if (!viewable) {
        return <Content material={material} fileUrl={fileUrl} fill={fill} className={className} full={false} />;
    }

    return (
        <FullscreenFrame title={material.title} className={fill ? 'h-full w-full' : 'w-full'}>
            {(full) => <Content material={material} fileUrl={fileUrl} fill={fill || full} className={full ? undefined : className} full={full} />}
        </FullscreenFrame>
    );
}

function Content({ material, fileUrl, fill, className, full }: {
    material: CourseMaterial;
    fileUrl: string | null;
    fill: boolean;
    className?: string;
    full: boolean;
}) {
    const frame = cn(fill ? 'h-full w-full' : 'w-full', className);

    if (material.type === 'youtube') {
        const embed = youtubeEmbedUrl(material);
        if (!embed) return <Unavailable title={material.title} url={materialUrl(material)} />;
        return (
            <div className={cn(frame, 'bg-black flex items-center justify-center', !fill && 'aspect-video')}>
                <iframe
                    src={embed}
                    title={material.title}
                    className="h-full w-full border-0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    referrerPolicy="strict-origin-when-cross-origin"
                    allowFullScreen
                />
            </div>
        );
    }

    if (!fileUrl) return <Unavailable title={material.title} url={null} />;

    if (material.type === 'pdf') {
        return (
            <iframe
                src={`${fileUrl}#view=FitH&navpanes=0`}
                title={material.title}
                className={cn(frame, 'border-0 bg-white', !fill && !full && 'min-h-[80vh]')}
            />
        );
    }

    if (material.type === 'image') {
        return (
            <div className={cn(frame, 'overflow-auto bg-slate-50 dark:bg-slate-900')}>
                <div className="min-h-full flex items-center justify-center p-4 md:p-8">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                        src={fileUrl}
                        alt={material.title}
                        className="max-w-full h-auto object-contain rounded-2xl border border-card-border shadow-lg"
                    />
                </div>
            </div>
        );
    }

    if (material.type === 'video') {
        return (
            <div className={cn(frame, 'bg-black flex items-center justify-center', !fill && 'aspect-video')}>
                <video
                    key={fileUrl}
                    controls
                    playsInline
                    preload="metadata"
                    className="h-full w-full outline-none"
                    controlsList="nodownload"
                >
                    <source src={fileUrl} type={material.mime_type?.startsWith('video/') ? material.mime_type : undefined} />
                    Your browser cannot play this video. Use the download button instead.
                </video>
            </div>
        );
    }

    if (material.type === 'audio') {
        return (
            <div className={cn(frame, 'flex items-center justify-center bg-gradient-to-br from-orange-50 to-amber-50 dark:from-slate-900 dark:to-slate-800 p-6 md:p-10', !fill && 'py-16')}>
                <div className="w-full max-w-2xl rounded-2xl border border-orange-200 dark:border-slate-700 bg-white/90 dark:bg-slate-900/80 p-6 md:p-8 text-center space-y-5 shadow-sm">
                    <div className="mx-auto h-16 w-16 rounded-2xl border border-orange-300 bg-orange-100 text-orange-700 flex items-center justify-center">
                        <Headphones className="h-8 w-8" />
                    </div>
                    <p className="text-base font-semibold text-foreground">{material.title}</p>
                    <audio key={fileUrl} controls preload="metadata" src={fileUrl} className="w-full">
                        Your browser cannot play this audio. Use the download button instead.
                    </audio>
                </div>
            </div>
        );
    }

    return <Unavailable title={material.title} url={fileUrl} />;
}

function Unavailable({ title, url }: { title: string; url: string | null }) {
    return (
        <div className="h-full w-full flex flex-col items-center justify-center text-center gap-4 py-16 px-6">
            <div className="h-16 w-16 rounded-2xl bg-blue-50 dark:bg-blue-900/20 text-blue-600 flex items-center justify-center">
                {url ? <FileText className="h-8 w-8" /> : <FolderOpen className="h-8 w-8" />}
            </div>
            <div>
                <p className="text-base font-semibold text-foreground">{title}</p>
                <p className="text-sm text-foreground/55 mt-1">
                    {url ? 'This file cannot be shown here. Download it to open it on your device.' : 'This content is not available right now.'}
                </p>
            </div>
            {url && (
                <a
                    href={url}
                    download
                    className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
                >
                    <Download className="h-4 w-4" />
                    Download
                </a>
            )}
        </div>
    );
}
