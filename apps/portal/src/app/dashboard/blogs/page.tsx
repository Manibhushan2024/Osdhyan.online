'use client';

import { useState, useEffect } from 'react';
import { storageUrl } from '@/lib/storage';
import api from '@/lib/api';
import {
    Clock,
    ChevronRight,
    Calendar,
    User,
    ArrowRight,
    Newspaper,
    Sparkles
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
    status: string;
    author: { name: string, avatar?: string };
    created_at: string;
};

export default function BlogsPage() {
    const { theme } = useTheme();
    const [blogs, setBlogs] = useState<BlogPost[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchBlogs();
    }, []);

    const fetchBlogs = async () => {
        try {
            const res = await api.get('/blogs');
            setBlogs(res.data.data);
        } catch {
            // silent;
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-7xl mx-auto space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Hero Section */}
            <div className="relative rounded-2xl overflow-hidden bg-gray-900 p-12 md:p-20 text-center">
                <div className="absolute top-0 right-0 h-96 w-96 bg-blue-600/20 rounded-full blur-[120px]" />
                <div className="absolute bottom-0 left-0 h-64 w-64 bg-indigo-600/10 rounded-full blur-[100px]" />

                <div className="relative z-10 space-y-6">
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600/10 border border-blue-600/20 rounded-full text-blue-400 text-xs font-black uppercase tracking-wide">
                        <Sparkles className="h-3.5 w-3.5" />
                        Blog
                    </div>
                    <h1 className="text-3xl md:text-5xl font-bold text-white tracking-tight leading-tight">Blog</h1>
                    <p className="text-gray-300 max-w-2xl mx-auto text-base">Strategy articles, exam updates and study tips from the OSDHYAN team.</p>
                </div>
            </div>

            {/* Grid */}
            {loading ? (
                <div className="flex justify-center py-20">
                    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
                </div>
            ) : blogs.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 pb-20">
                    {blogs.map((post) => (
                        <div key={post.id} className="group bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-2xl overflow-hidden hover:shadow-2xl hover:shadow-blue-200/20 dark:hover:shadow-blue-900/10 transition-all duration-500 hover:-translate-y-2">
                            <div className="relative h-64 overflow-hidden">
                                {post.thumbnail ? (
                                    <img
                                        src={storageUrl(post.thumbnail)}
                                        alt={post.title}
                                        className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                                    />
                                ) : (
                                    <div className="h-full w-full bg-gradient-to-tr from-gray-900 to-blue-900 flex items-center justify-center p-12">
                                        <Newspaper className="h-16 w-16 text-white/20" />
                                    </div>
                                )}
                                <div className="absolute top-6 left-6">
                                    <span className="px-4 py-1.5 bg-blue-600 text-white text-xs font-black uppercase tracking-wide rounded-xl shadow-lg">
                                        Article
                                    </span>
                                </div>
                            </div>

                            <div className="p-8 space-y-4">
                                <div className="flex items-center gap-4 text-xs font-bold text-gray-400 uppercase tracking-wide">
                                    <div className="flex items-center gap-1.5">
                                        <Calendar className="h-3.5 w-3.5" />
                                        {new Date(post.created_at).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })}
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                        <Clock className="h-3.5 w-3.5" />
                                        {Math.ceil(post.content.split(' ').length / 200)} min read
                                    </div>
                                </div>

                                <h3 className="text-lg font-semibold text-foreground leading-snug line-clamp-2 min-h-[3.5rem] group-hover:text-blue-600 transition-colors">
                                    {post.title}
                                </h3>

                                <div className="pt-6 border-t border-gray-50 dark:border-gray-700 flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="h-8 w-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600">
                                            {post.author.avatar ? (
                                                <img src={storageUrl(post.author.avatar)} className="h-full w-full object-cover rounded-full" />
                                            ) : (
                                                <User className="h-4 w-4" />
                                            )}
                                        </div>
                                        <span className="text-xs font-black text-gray-900 dark:text-white uppercase tracking-wide">By {post.author.name}</span>
                                    </div>
                                    <Link href={`/dashboard/blogs/${post.slug}`} className="h-10 w-10 bg-gray-50 dark:bg-gray-900 rounded-xl flex items-center justify-center text-gray-400 hover:bg-blue-600 hover:text-white transition-all">
                                        <ArrowRight className="h-4 w-4" />
                                    </Link>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="bg-white dark:bg-gray-800 rounded-2xl p-32 text-center border border-dashed border-gray-200 dark:border-gray-700">
                    <Newspaper className="h-20 w-20 text-gray-200 mx-auto mb-8" />
                    <h2 className="text-xl font-semibold text-foreground">No articles yet</h2>
                    <p className="text-muted-foreground mt-2 text-sm">Check back soon — new articles are on the way.</p>
                </div>
            )}
        </div>
    );
}
