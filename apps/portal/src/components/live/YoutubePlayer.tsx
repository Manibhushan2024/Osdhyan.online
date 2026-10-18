'use client';

type Props = {
    videoId: string;
    title: string;
    /** autoplay for live sessions; off for recordings */
    autoplay?: boolean;
};

/** Privacy-enhanced YouTube embed used for broadcast classes and recordings. */
export default function YoutubePlayer({ videoId, title, autoplay = true }: Props) {
    const src = `https://www.youtube-nocookie.com/embed/${encodeURIComponent(videoId)}?rel=0&modestbranding=1&playsinline=1${autoplay ? '&autoplay=1' : ''}`;
    return (
        <iframe
            title={title}
            src={src}
            className="w-full h-full bg-black"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
            referrerPolicy="strict-origin-when-cross-origin"
        />
    );
}

/** Pulls the video id out of a stored recording URL when it is a YouTube link. */
export function youtubeIdFromUrl(url: string | null | undefined): string | null {
    if (!url) return null;
    const m = url.match(/(?:[?&]v=|youtu\.be\/|youtube\.com\/(?:live|embed|shorts|v)\/)([A-Za-z0-9_-]{11})/);
    return m ? m[1] : null;
}
