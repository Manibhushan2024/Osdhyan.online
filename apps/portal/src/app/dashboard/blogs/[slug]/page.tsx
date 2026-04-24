'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import api from '@/lib/api';
import {
    Clock,
    Calendar,
    User,
    ArrowLeft,
    Share2,
    Bookmark
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTheme } from '@/components/providers/ThemeProvider';
import Link from 'next/link';

type BlogPost = {
    id: number;
    title: string;
    slug: string;
    content: string;
    thumbnail: string;
    author: { name: string, avatar?: string };
    created_at: string;
};

export default function BlogDetailPage() {
    const { theme } = useTheme();
    const { slug } = useParams();
    const [post, setPost] = useState<BlogPost | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (slug) fetchPost();
    }, [slug]);

    const fetchPost = async () => {
        try {
            const res = await api.get(`/blogs/${slug}`);
            setPost(res.data);
        } catch (error) {
            console.error('Failed to fetch post', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center py-40">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    if (!post) {
        return (
            <div className="text-center py-20">
                <h2 className="text-2xl font-black text-gray-900 dark:text-white uppercase italic">Post Not Found</h2>
                <Link href="/dashboard/blogs" className="mt-4 inline-flex text-blue-600 font-bold hover:underline">Return to Hub</Link>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto space-y-12 animate-in fade-in slide-in-from-bottom-6 duration-1000">
            {/* Back Nav */}
            <Link href="/dashboard/blogs" className="inline-flex items-center gap-2 text-sm font-bold text-gray-400 hover:text-blue-600 transition-colors uppercase tracking-widest">
                <ArrowLeft className="h-4 w-4" />
                Back to Blogs
            </Link>

            {/* Header */}
            <div className="space-y-8">
                <div className="space-y-4">
                    <div className="flex items-center gap-4 text-[10px] font-bold text-blue-600 uppercase tracking-[0.2em]">
                        <span className="px-3 py-1 bg-blue-50 dark:bg-blue-900/20 rounded-lg">Official Mastery Blog</span>
                        <div className="flex items-center gap-2 text-gray-400">
                            <Calendar className="h-4 w-4" />
                            {new Date(post.created_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                        </div>
                    </div>
                    <h1 className="text-4xl md:text-5xl font-black text-gray-900 dark:text-white uppercase tracking-tighter italic leading-[1.1]">
                        {post.title}
                    </h1>
                </div>

                <div className="flex items-center justify-between py-6 border-y border-gray-50 dark:border-gray-800">
                    <div className="flex items-center gap-4">
                        <div className="h-12 w-12 rounded-full bg-blue-100 dark:bg-blue-900/30 p-0.5">
                            {post.author.avatar ? (
                                <img src={`${process.env.NEXT_PUBLIC_API_URL}/storage/${post.author.avatar}`} className="h-full w-full object-cover rounded-full" />
                            ) : (
                                <div className="h-full w-full bg-white dark:bg-gray-800 rounded-full flex items-center justify-center text-blue-600">
                                    <User className="h-6 w-6" />
                                </div>
                            )}
                        </div>
                        <div>
                            <p className="text-xs font-black text-gray-900 dark:text-white uppercase tracking-widest">{post.author.name}</p>
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Mastery Educator</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <button className="h-10 w-10 bg-gray-50 dark:bg-gray-800 rounded-xl flex items-center justify-center text-gray-400 hover:text-blue-600 transition-all">
                            <Bookmark className="h-5 w-5" />
                        </button>
                        <button className="h-10 w-10 bg-gray-50 dark:bg-gray-800 rounded-xl flex items-center justify-center text-gray-400 hover:text-blue-600 transition-all">
                            <Share2 className="h-5 w-5" />
                        </button>
                    </div>
                </div>
            </div>

            {/* Featured Image */}
            {post.thumbnail && (
                <div className="relative h-[450px] rounded-[3rem] overflow-hidden shadow-2xl">
                    <img
                        src={`${process.env.NEXT_PUBLIC_API_URL}/storage/${post.thumbnail}`}
                        className="h-full w-full object-cover"
                        alt={post.title}
                    />
                </div>
            )}

            {/* Content */}
            <div
                className="prose prose-lg dark:prose-invert prose-blue max-w-none 
                    prose-headings:font-black prose-headings:uppercase prose-headings:italic prose-headings:tracking-tight
                    prose-p:text-gray-700 dark:prose-p:text-gray-300 prose-p:leading-relaxed prose-p:font-medium prose-p:italic
                    prose-blockquote:border-l-4 prose-blockquote:border-blue-600 prose-blockquote:bg-blue-50 dark:prose-blockquote:bg-blue-900/10 prose-blockquote:p-6 prose-blockquote:rounded-r-3xl
                    pb-32"
                dangerouslySetInnerHTML={{ __html: post.content }}
            />
        </div>
    );
}
