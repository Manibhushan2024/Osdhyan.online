'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/api';
import {
    Plus,
    FileText,
    Image as ImageIcon,
    File as FileIcon,
    Search,
    Trash2,
    MoreVertical,
    Paperclip,
    CheckCircle2,
    BookOpen
} from 'lucide-react';
import { cn } from '@/lib/utils';

export default function NotesHubPage() {
    const [notes, setNotes] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [showAddNote, setShowAddNote] = useState(false);
    const [subjects, setSubjects] = useState<any[]>([]);
    const [chapters, setChapters] = useState<any[]>([]);
    const [topics, setTopics] = useState<any[]>([]);
    const [newNote, setNewNote] = useState({
        title: '',
        content: '',
        noteable_type: 'Subject',
        noteable_id: ''
    });
    const [files, setFiles] = useState<File[]>([]);

    useEffect(() => {
        fetchData();
    }, []);

    useEffect(() => {
        if (newNote.noteable_type === 'Subject' && newNote.noteable_id) {
            fetchChapters(parseInt(newNote.noteable_id));
        }
    }, [newNote.noteable_id, newNote.noteable_type]);

    const fetchData = async () => {
        try {
            const [notesRes, subjectsRes] = await Promise.all([
                api.get('/notes'),
                api.get('/exams')
            ]);
            setNotes(notesRes.data);
            if (subjectsRes.data.length > 0) {
                const firstExamDetails = await api.get(`/exams/${subjectsRes.data[0].id}/subjects`);
                setSubjects(firstExamDetails.data);
                if (firstExamDetails.data.length > 0) {
                    setNewNote(prev => ({ ...prev, noteable_id: firstExamDetails.data[0].id.toString() }));
                }
            }
        } catch (error) {
            console.error('Failed to fetch notes', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchChapters = async (subjectId: number) => {
        try {
            const res = await api.get(`/subjects/${subjectId}/chapters`);
            setChapters(res.data);
            setTopics([]);
        } catch (error) {
            console.error("Failed to fetch chapters", error);
        }
    };

    const fetchTopics = async (chapterId: number) => {
        try {
            const res = await api.get(`/chapters/${chapterId}/topics`);
            setTopics(res.data);
        } catch (error) {
            console.error("Failed to fetch topics", error);
        }
    };

    const handleCreateNote = async (e: React.FormEvent) => {
        e.preventDefault();
        const formData = new FormData();
        formData.append('title', newNote.title);
        formData.append('content', newNote.content || '');
        formData.append('noteable_type', newNote.noteable_type);
        formData.append('noteable_id', newNote.noteable_id);

        files.forEach((file) => {
            formData.append('attachments[]', file);
        });

        try {
            await api.post('/notes', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            setShowAddNote(false);
            setNewNote({ title: '', content: '', noteable_type: 'Subject', noteable_id: subjects[0]?.id });
            setFiles([]);
            fetchData();
        } catch (error) {
            alert('Failed to save note');
        }
    };

    const handleDeleteNote = async (id: number) => {
        if (!confirm('Are you sure?')) return;
        try {
            await api.delete(`/notes/${id}`);
            fetchData();
        } catch (error) {
            alert('Failed to delete note');
        }
    };

    return (
        <div className="max-w-7xl mx-auto space-y-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 tracking-tight italic">Multimedia Notes</h1>
                    <p className="text-gray-600 mt-1 font-medium italic">Store text, diagrams, and PDFs for your osdhyan preparation.</p>
                </div>
                <button
                    onClick={() => setShowAddNote(true)}
                    className="flex items-center gap-2 px-6 py-3 bg-gray-900 text-white font-bold rounded-2xl hover:bg-blue-600 transition-all shadow-lg"
                >
                    <Plus className="h-4 w-4" />
                    Create New Note
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {notes.length > 0 ? notes.map((note) => (
                    <div key={note.id} className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm hover:border-blue-200 transition-all flex flex-col justify-between group">
                        <div>
                            <div className="flex justify-between items-start mb-4">
                                <div className={cn(
                                    "p-2 rounded-lg font-black text-[10px] uppercase tracking-widest pl-3 pr-3",
                                    note.user?.is_admin ? "bg-amber-100 text-amber-700 border border-amber-200" : "bg-blue-50 text-blue-600"
                                )}>
                                    {note.user?.is_admin ? 'Official Note' : 'My Note'}
                                </div>
                                <button onClick={() => handleDeleteNote(note.id)} className="text-gray-300 hover:text-red-500 transition-colors">
                                    <Trash2 className="h-4 w-4" />
                                </button>
                            </div>
                            <h3 className="font-bold text-gray-900 text-lg mb-2">{note.title}</h3>
                            <p className="text-sm text-gray-500 line-clamp-3 mb-6 font-medium italic">
                                {note.content || "Empty content..."}
                            </p>
                        </div>

                        <div className="space-y-3">
                            {note.attachments?.map((att: any, i: number) => (
                                <a
                                    key={i}
                                    href={`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/storage/${att.file_path}`}
                                    target="_blank" rel="noopener noreferrer"
                                    className="flex items-center gap-2 p-2 bg-gray-50 rounded-xl border border-gray-100 hover:bg-blue-50 hover:border-blue-100 transition-colors"
                                >
                                    {att.file_type === 'pdf' ? <FileIcon className="h-3 w-3 text-red-500" /> : <ImageIcon className="h-3 w-3 text-green-500" />}
                                    <span className="text-[10px] font-bold text-gray-600 truncate uppercase tracking-widest">Attachment {i + 1} ({att.file_type})</span>
                                </a>
                            ))}
                            {!note.attachments?.length && <p className="text-[10px] text-gray-300 italic font-bold">No attachments</p>}
                        </div>
                    </div>
                )) : (
                    <div className="lg:col-span-3 py-20 bg-gray-50 rounded-3xl border-2 border-dashed border-gray-200 flex flex-col items-center justify-center">
                        <FileText className="h-12 w-12 text-gray-300 mb-4" />
                        <p className="text-gray-500 font-medium italic tracking-tight">Your knowledge base is empty.</p>
                    </div>
                )}
            </div>

            {showAddNote && (
                <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg p-8 transform transition-all">
                        <h2 className="text-2xl font-black text-gray-900 uppercase tracking-tight italic mb-8">Create New Knowledge Note</h2>

                        <form onSubmit={handleCreateNote} className="space-y-5">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                    <label className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2 block">Subject</label>
                                    <select
                                        className="w-full bg-gray-50 border border-gray-100 p-4 rounded-2xl font-bold text-gray-800 text-sm"
                                        value={newNote.noteable_type === 'Subject' ? newNote.noteable_id : (subjects.find(s => s.id)?.id || '')}
                                        onChange={(e) => {
                                            setNewNote({ ...newNote, noteable_type: 'Subject', noteable_id: e.target.value });
                                        }}
                                    >
                                        <option value="">Select Subject</option>
                                        {subjects.map(s => <option key={s.id} value={s.id}>{s.name_en}</option>)}
                                    </select>
                                </div>

                                <div>
                                    <label className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2 block">Chapter (Opt)</label>
                                    <select
                                        className="w-full bg-gray-50 border border-gray-100 p-4 rounded-2xl font-bold text-gray-800 text-sm"
                                        value={newNote.noteable_type === 'Chapter' ? newNote.noteable_id : ''}
                                        onChange={(e) => {
                                            if (e.target.value) {
                                                setNewNote({ ...newNote, noteable_type: 'Chapter', noteable_id: e.target.value });
                                                fetchTopics(parseInt(e.target.value));
                                            }
                                        }}
                                    >
                                        <option value="">None</option>
                                        {chapters.map(c => <option key={c.id} value={c.id}>{c.name_en}</option>)}
                                    </select>
                                </div>

                                <div>
                                    <label className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2 block">Topic (Opt)</label>
                                    <select
                                        className="w-full bg-gray-50 border border-gray-100 p-4 rounded-2xl font-bold text-gray-800 text-sm"
                                        value={newNote.noteable_type === 'Topic' ? newNote.noteable_id : ''}
                                        onChange={(e) => {
                                            if (e.target.value) {
                                                setNewNote({ ...newNote, noteable_type: 'Topic', noteable_id: e.target.value });
                                            }
                                        }}
                                    >
                                        <option value="">None</option>
                                        {topics.map(t => <option key={t.id} value={t.id}>{t.name_en}</option>)}
                                    </select>
                                </div>
                            </div>

                            <input
                                type="text" placeholder="Note Title (e.g. Mughal Architecture Summary)"
                                className="w-full bg-gray-50 border border-gray-100 p-4 rounded-2xl font-bold text-gray-800"
                                value={newNote.title}
                                onChange={(e) => setNewNote({ ...newNote, title: e.target.value })}
                                required
                            />

                            <textarea
                                placeholder="Your detailed notes here..."
                                className="w-full bg-gray-50 border border-gray-100 p-4 rounded-2xl font-medium text-gray-800 h-32"
                                value={newNote.content}
                                onChange={(e) => setNewNote({ ...newNote, content: e.target.value })}
                            />

                            <div className="p-4 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
                                <label className="flex flex-col items-center cursor-pointer">
                                    <Paperclip className="h-6 w-6 text-gray-400 mb-2" />
                                    <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Attach Diagrams or PDFs</span>
                                    <input
                                        type="file" multiple className="hidden"
                                        onChange={(e) => setFiles(Array.from(e.target.files || []))}
                                    />
                                </label>
                                {files.length > 0 && (
                                    <div className="mt-4 space-y-2">
                                        {files.map((f, i) => (
                                            <p key={i} className="text-[10px] font-bold text-blue-600">{f.name}</p>
                                        ))}
                                    </div>
                                )}
                            </div>

                            <div className="flex gap-4 mt-8">
                                <button
                                    type="button" onClick={() => setShowAddNote(false)}
                                    className="flex-1 py-4 font-bold text-gray-500 hover:text-gray-900 transition-colors uppercase tracking-widest text-xs"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 py-4 bg-blue-600 text-white font-black rounded-2xl hover:bg-blue-700 transition-all uppercase tracking-widest text-xs shadow-lg shadow-blue-100"
                                >
                                    Create Note
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
