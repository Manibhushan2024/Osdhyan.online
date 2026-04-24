'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/api';
import {
    FolderOpen,
    Download,
    FileText,
    Image as ImageIcon,
    File,
    Search,
    BookOpen,
    Filter,
    Maximize2,
    CheckCircle
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTheme } from '@/components/providers/ThemeProvider';
import Link from 'next/link';

type Material = {
    id: number;
    title: string;
    description: string;
    file_path: string;
    type: string;
    subject?: { name_en: string };
    chapter?: { name_en: string };
    progress?: { is_completed: boolean };
    created_at: string;
};

export default function MaterialsPage() {
    const { theme } = useTheme();
    const [materials, setMaterials] = useState<Material[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedType, setSelectedType] = useState('all');

    useEffect(() => {
        fetchMaterials();
    }, []);

    const fetchMaterials = async () => {
        try {
            const res = await api.get('/study-materials');
            setMaterials(res.data);
        } catch (error) {
            console.error('Failed to fetch materials', error);
        } finally {
            setLoading(false);
        }
    };

    const getIcon = (type: string) => {
        switch (type) {
            case 'pdf': return <FileText className="h-6 w-6 text-red-500" />;
            case 'image': return <ImageIcon className="h-6 w-6 text-blue-500" />;
            default: return <File className="h-6 w-6 text-gray-500" />;
        }
    };

    const getBaseUrl = () => {
        const url = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';
        return url.replace(/\/api$/, '');
    };

    const filteredMaterials = materials.filter(m =>
        (m.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            m.description?.toLowerCase().includes(searchTerm.toLowerCase())) &&
        (selectedType === 'all' || m.type === selectedType)
    );

    return (
        <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-3xl font-black text-gray-900 dark:text-white uppercase tracking-tighter italic">Study Repository</h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-1 font-medium italic">Official academic resources and high-yield materials.</p>
                </div>

                <div className="flex items-center gap-3">
                    <div className="relative group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 group-focus-within:text-blue-600 transition-colors" />
                        <input
                            type="text"
                            placeholder="Search materials..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-11 pr-6 py-3 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-2xl w-full md:w-64 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-blue-600/20 transition-all shadow-sm"
                        />
                    </div>
                    <div className="h-10 w-10 bg-blue-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-blue-200 dark:shadow-blue-900/20">
                        <Filter className="h-5 w-5" />
                    </div>
                </div>
            </div>

            {/* Content */}
            {loading ? (
                <div className="flex justify-center py-20">
                    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
                </div>
            ) : filteredMaterials.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredMaterials.map((item) => (
                        <div key={item.id} className="group bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-[2rem] p-6 hover:shadow-2xl hover:shadow-blue-200/20 dark:hover:shadow-blue-900/10 transition-all duration-500 hover:-translate-y-1">
                            <div className="flex items-start justify-between mb-6">
                                <div className="h-14 w-14 bg-gray-50 dark:bg-gray-900/50 rounded-2xl flex items-center justify-center group-hover:bg-blue-50 dark:group-hover:bg-blue-900/20 transition-colors">
                                    {getIcon(item.type)}
                                </div>
                                <span className="px-3 py-1 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 text-[10px] font-black uppercase tracking-widest rounded-full">
                                    {item.type}
                                </span>
                            </div>

                            <h3 className="text-lg font-black text-gray-900 dark:text-white uppercase tracking-tight line-clamp-1">{item.title}</h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2 line-clamp-2 italic font-medium">
                                {item.description || "Official osdhyan study material for target success."}
                            </p>

                            <div className="mt-6 flex flex-wrap gap-2">
                                {item.subject && (
                                    <span className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-50 dark:bg-gray-900/50 text-gray-500 dark:text-gray-400 text-[9px] font-bold uppercase tracking-widest rounded-xl">
                                        <BookOpen className="h-3 w-3" />
                                        {item.subject.name_en}
                                    </span>
                                )}
                                {item.chapter && (
                                    <span className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-50 dark:bg-gray-900/50 text-gray-500 dark:text-gray-400 text-[9px] font-bold uppercase tracking-widest rounded-xl">
                                        <FolderOpen className="h-3 w-3" />
                                        {item.chapter.name_en}
                                    </span>
                                )}
                                {item.progress?.is_completed && (
                                    <span className="flex items-center gap-1.5 px-3 py-1.5 bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 text-[9px] font-bold uppercase tracking-widest rounded-xl border border-green-100 dark:border-green-900/30">
                                        <CheckCircle className="h-3 w-3" />
                                        Mastered
                                    </span>
                                )}
                            </div>

                            <Link
                                href={`/dashboard/materials/${item.id}`}
                                className="mt-8 w-full flex items-center justify-center gap-3 py-4 bg-gray-900 dark:bg-blue-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-blue-600 dark:hover:bg-blue-500 transition-all shadow-xl shadow-gray-200 dark:shadow-none group/btn"
                            >
                                <Maximize2 className="h-4 w-4 group-hover/btn:scale-110 transition-transform" />
                                Open Material
                            </Link>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="bg-white dark:bg-gray-800 rounded-[3rem] p-20 text-center border border-dashed border-gray-200 dark:border-gray-700">
                    <FolderOpen className="h-16 w-16 text-gray-300 mx-auto mb-6" />
                    <h2 className="text-2xl font-black text-gray-900 dark:text-white uppercase italic">No Materials Found</h2>
                    <p className="text-gray-500 dark:text-gray-400 mt-2 font-medium italic">Adjust your search or check back later for high-yield content.</p>
                </div>
            )}
        </div>
    );
}
