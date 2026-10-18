'use client';

import { useState, useEffect } from 'react';
import {
    Plus,
    Search,
    Rocket,
    Loader2,
    Edit2,
    Trash2,
    X,
    ShieldAlert,
    Image as ImageIcon,
    ChevronRight,
    Globe,
    IndianRupee,
    Lock,
    CalendarClock,
    Save,
} from 'lucide-react';
import api from '@/lib/api';
import { cn } from '@/lib/utils';
import { toast } from 'react-hot-toast';
import { useAuth } from '@/components/providers/AuthProvider';
import PriceTag from '@/components/payments/PriceTag';

type Series = {
    id: number;
    exam_id?: number | null;
    name_en: string;
    name_hi?: string | null;
    description_en?: string | null;
    description_hi?: string | null;
    image?: string | null;
    is_published: boolean;
    is_paid?: boolean;
    tests?: { id: number; name_en: string }[];
    tests_count?: number;
    price?: string | number | null;
    mrp?: string | number | null;
    currency?: string | null;
    validity_days?: number | null;
    exam?: { id: number; name_en: string } | null;
};

type PricingForm = {
    is_paid: boolean;
    price: string;
    mrp: string;
    validity_days: string;
};

const emptyPricing: PricingForm = { is_paid: false, price: '', mrp: '', validity_days: '' };

function PricingFields({ value, onChange }: { value: PricingForm; onChange: (v: PricingForm) => void }) {
    const inputClass = 'w-full bg-white/5 border border-card-border rounded-2xl p-4 text-[10px] font-black focus:outline-none focus:border-indigo-600/30 transition-all disabled:opacity-40';
    const priceNum = Number(value.price || 0);
    const mrpNum = value.mrp === '' ? null : Number(value.mrp);
    const mrpInvalid = value.is_paid && mrpNum !== null && mrpNum < priceNum;

    return (
        <div className="space-y-4 rounded-2xl border border-card-border bg-white/[0.02] p-5">
            <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center">
                        <IndianRupee className="h-4 w-4" />
                    </div>
                    <div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-foreground">Pricing</p>
                        <p className="text-[8px] font-black uppercase tracking-widest text-foreground/40">Paid series are unlocked via Razorpay</p>
                    </div>
                </div>
                <label className="flex items-center gap-3 cursor-pointer select-none">
                    <span className="text-[9px] font-black uppercase tracking-widest text-foreground/60">{value.is_paid ? 'Paid' : 'Free'}</span>
                    <span
                        role="switch"
                        aria-checked={value.is_paid}
                        tabIndex={0}
                        onClick={() => onChange({ ...value, is_paid: !value.is_paid })}
                        onKeyDown={(e) => {
                            if (e.key === ' ' || e.key === 'Enter') {
                                e.preventDefault();
                                onChange({ ...value, is_paid: !value.is_paid });
                            }
                        }}
                        className={cn('relative inline-flex h-6 w-11 items-center rounded-full transition-colors', value.is_paid ? 'bg-amber-500' : 'bg-foreground/20')}
                    >
                        <span className={cn('inline-block h-4 w-4 transform rounded-full bg-white transition-transform', value.is_paid ? 'translate-x-6' : 'translate-x-1')} />
                    </span>
                </label>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-2">
                    <label className="text-[9px] font-black text-foreground/40 uppercase tracking-widest block px-2">Price (₹)</label>
                    <input
                        type="number"
                        min={0}
                        step="1"
                        inputMode="decimal"
                        disabled={!value.is_paid}
                        required={value.is_paid}
                        value={value.price}
                        onChange={(e) => onChange({ ...value, price: e.target.value })}
                        placeholder="499"
                        className={inputClass}
                    />
                </div>
                <div className="space-y-2">
                    <label className="text-[9px] font-black text-foreground/40 uppercase tracking-widest block px-2">MRP (₹, strike-through)</label>
                    <input
                        type="number"
                        min={0}
                        step="1"
                        inputMode="decimal"
                        disabled={!value.is_paid}
                        value={value.mrp}
                        onChange={(e) => onChange({ ...value, mrp: e.target.value })}
                        placeholder="999"
                        className={cn(inputClass, mrpInvalid && 'border-red-500/50')}
                    />
                    {mrpInvalid && <p className="text-[8px] font-black uppercase tracking-widest text-red-500 px-2">MRP must be ≥ price</p>}
                </div>
                <div className="space-y-2">
                    <label className="text-[9px] font-black text-foreground/40 uppercase tracking-widest block px-2">Validity (days)</label>
                    <input
                        type="number"
                        min={0}
                        step="1"
                        disabled={!value.is_paid}
                        value={value.validity_days}
                        onChange={(e) => onChange({ ...value, validity_days: e.target.value })}
                        placeholder="Blank = lifetime"
                        className={inputClass}
                    />
                </div>
            </div>

            {value.is_paid && priceNum > 0 && (
                <div className="flex items-center gap-3 px-2">
                    <span className="text-[8px] font-black uppercase tracking-widest text-foreground/40">Students see</span>
                    <PriceTag price={priceNum} mrp={mrpNum} size="sm" />
                    <span className="text-[8px] font-black uppercase tracking-widest text-foreground/40">
                        · {value.validity_days && Number(value.validity_days) > 0 ? `${value.validity_days} days access` : 'lifetime access'}
                    </span>
                </div>
            )}
        </div>
    );
}

function appendPricing(formData: FormData, pricing: PricingForm) {
    formData.append('is_paid', pricing.is_paid ? '1' : '0');
    formData.append('price', pricing.is_paid ? (pricing.price || '0') : '0');
    if (pricing.is_paid && pricing.mrp !== '') formData.append('mrp', pricing.mrp);
    if (pricing.is_paid && pricing.validity_days !== '' && Number(pricing.validity_days) > 0) {
        formData.append('validity_days', pricing.validity_days);
    }
}

type PickableTest = { id: number; name_en: string; status?: string; questions_count?: number; duration_sec?: number };

/** Checkbox list of tests to include in a series, with search. */
function TestPicker({ selected, onChange }: { selected: number[]; onChange: (ids: number[]) => void }) {
    const [tests, setTests] = useState<PickableTest[]>([]);
    const [q, setQ] = useState('');
    const [loadingTests, setLoadingTests] = useState(true);

    useEffect(() => {
        let alive = true;
        api.get('/admin/tests', { params: { per_page: 50, search: q || undefined } })
            .then(res => { if (alive) setTests(res.data.data ?? res.data ?? []); })
            .catch(() => { if (alive) setTests([]); })
            .finally(() => { if (alive) setLoadingTests(false); });
        return () => { alive = false; };
    }, [q]);

    const toggle = (id: number) => onChange(selected.includes(id) ? selected.filter(x => x !== id) : [...selected, id]);

    return (
        <div className="space-y-3">
            <div className="flex items-center justify-between">
                <label className="text-[10px] font-black text-foreground/40 uppercase tracking-widest">Tests in this series ({selected.length} selected)</label>
                <input value={q} onChange={e => setQ(e.target.value)} placeholder="Search tests…"
                    className="bg-background border border-card-border rounded-xl px-3 py-1.5 text-xs w-44 focus:outline-none" />
            </div>
            <div className="max-h-56 overflow-y-auto rounded-2xl border border-card-border divide-y divide-card-border">
                {loadingTests && <p className="p-3 text-xs text-foreground/40">Loading tests…</p>}
                {!loadingTests && tests.length === 0 && <p className="p-3 text-xs text-foreground/40">No tests yet. Create tests under Admin → Tests or Bulk import first.</p>}
                {tests.map(t => (
                    <label key={t.id} className="flex items-center gap-3 px-3 py-2 text-sm cursor-pointer hover:bg-foreground/5">
                        <input type="checkbox" checked={selected.includes(t.id)} onChange={() => toggle(t.id)} className="h-4 w-4 accent-indigo-600" />
                        <span className="flex-1 truncate">{t.name_en}</span>
                        <span className="text-[10px] text-foreground/40 uppercase">{t.status ?? ''}{t.questions_count != null ? ` · ${t.questions_count} Q` : ''}</span>
                    </label>
                ))}
            </div>
            <p className="text-[11px] text-foreground/40">Students see these tests inside the series. You can also build a series from Bulk import → Tests.</p>
        </div>
    );
}

export default function AdminTestSeriesPage() {
    const { user } = useAuth();
    const canDelete = user?.admin_role === 'root';
    const [series, setSeries] = useState<Series[]>([]);
    const [exams, setExams] = useState<{ id: number; name_en: string }[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [showWizard, setShowWizard] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [wizardData, setWizardData] = useState({
        exam_id: '',
        name_en: '',
        name_hi: '',
        description_en: '',
        description_hi: '',
    });
    const [wizardPricing, setWizardPricing] = useState<PricingForm>(emptyPricing);
    const [wizardTestIds, setWizardTestIds] = useState<number[]>([]);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);

    const [editing, setEditing] = useState<Series | null>(null);
    const [editData, setEditData] = useState({ name_en: '', name_hi: '', description_en: '', is_published: false });
    const [editPricing, setEditPricing] = useState<PricingForm>(emptyPricing);
    const [editTestIds, setEditTestIds] = useState<number[]>([]);

    useEffect(() => {
        fetchInitialData();
    }, []);

    const fetchInitialData = async () => {
        try {
            const [seriesRes, examsRes] = await Promise.all([
                api.get('/admin/test-series'),
                api.get('/exams')
            ]);
            setSeries(seriesRes.data);
            setExams(examsRes.data);
            if (examsRes.data.length > 0) {
                setWizardData(prev => ({ ...prev, exam_id: String(examsRes.data[0].id) }));
            }
        } catch (error) {
            console.error('Failed to fetch data', error);
        } finally {
            setLoading(false);
        }
    };

    const refreshSeries = async () => {
        const res = await api.get('/admin/test-series');
        setSeries(res.data);
    };

    const pricingValid = (p: PricingForm) => {
        if (!p.is_paid) return true;
        const price = Number(p.price || 0);
        if (!(price > 0)) {
            toast.error('Paid series need a price above ₹0');
            return false;
        }
        if (p.mrp !== '' && Number(p.mrp) < price) {
            toast.error('MRP must be greater than or equal to the price');
            return false;
        }
        return true;
    };

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!pricingValid(wizardPricing)) return;
        setIsSaving(true);
        try {
            const formData = new FormData();
            formData.append('exam_id', wizardData.exam_id);
            formData.append('name_en', wizardData.name_en);
            formData.append('name_hi', wizardData.name_hi);
            formData.append('description_en', wizardData.description_en);
            formData.append('description_hi', wizardData.description_hi);
            appendPricing(formData, wizardPricing);
            wizardTestIds.forEach(id => formData.append('test_ids[]', String(id)));
            if (selectedFile) {
                formData.append('image_file', selectedFile);
            }

            await api.post('/admin/test-series', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            toast.success('Test series created');
            setShowWizard(false);
            await refreshSeries();
            setWizardData({
                exam_id: exams[0] ? String(exams[0].id) : '',
                name_en: '',
                name_hi: '',
                description_en: '',
                description_hi: '',
            });
            setWizardPricing(emptyPricing);
            setWizardTestIds([]);
            setSelectedFile(null);
        } catch (error: unknown) {
            const ax = error as { response?: { data?: { message?: string } } };
            toast.error(ax.response?.data?.message || 'Could not create the series');
        } finally {
            setIsSaving(false);
        }
    };

    const openEdit = (s: Series) => {
        setEditing(s);
        setEditData({
            name_en: s.name_en ?? '',
            name_hi: s.name_hi ?? '',
            description_en: s.description_en ?? '',
            is_published: !!s.is_published,
        });
        setEditPricing({
            is_paid: !!s.is_paid,
            price: s.price !== null && s.price !== undefined && Number(s.price) > 0 ? String(Number(s.price)) : '',
            mrp: s.mrp !== null && s.mrp !== undefined ? String(Number(s.mrp)) : '',
            validity_days: s.validity_days ? String(s.validity_days) : '',
        });
        setEditTestIds((s.tests ?? []).map(t => t.id));
    };

    const handleUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editing) return;
        if (!pricingValid(editPricing)) return;
        setIsSaving(true);
        try {
            await api.post(`/admin/test-series/${editing.id}/update`, {
                name_en: editData.name_en,
                name_hi: editData.name_hi,
                description_en: editData.description_en,
                is_published: editData.is_published,
                is_paid: editPricing.is_paid,
                price: editPricing.is_paid ? Number(editPricing.price || 0) : 0,
                mrp: editPricing.is_paid && editPricing.mrp !== '' ? Number(editPricing.mrp) : null,
                validity_days: editPricing.is_paid && editPricing.validity_days !== '' ? Number(editPricing.validity_days) : 0,
                test_ids: editTestIds,
            });
            toast.success('Series Updated');
            setEditing(null);
            await refreshSeries();
        } catch (error: unknown) {
            const ax = error as { response?: { data?: { message?: string } } };
            toast.error(ax.response?.data?.message || 'Update Failed');
        } finally {
            setIsSaving(false);
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm('Are you sure you want to decommission this Test Series?')) return;
        try {
            await api.delete(`/admin/test-series/${id}`);
            setSeries(series.filter(s => s.id !== id));
            toast.success('Series Decommissioned');
        } catch {
            toast.error('Decommission Failed');
        }
    };

    const togglePublish = async (s: Series) => {
        try {
            await api.post(`/admin/test-series/${s.id}/update`, { is_published: !s.is_published });
            await refreshSeries();
            toast.success(s.is_published ? 'Series Drafted' : 'Series Published');
        } catch {
            toast.error('Status Update Failed');
        }
    };

    const filteredSeries = series.filter(s =>
        s.name_en.toLowerCase().includes(search.toLowerCase())
    );

    const paidCount = series.filter(s => s.is_paid && Number(s.price) > 0).length;

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center py-40 gap-4">
                <Loader2 className="h-10 w-10 text-indigo-600 animate-spin" />
                <p className="text-[10px] font-black text-foreground/40 uppercase tracking-[0.3em]">Loading test series…</p>
            </div>
        );
    }

    return (
        <div className="space-y-12 pb-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 animate-in fade-in slide-in-from-bottom-4 duration-1000">
            {/* Header Section */}
            <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8">
                <div className="space-y-4">
                    <div className="flex items-center gap-4 text-[10px] font-black uppercase tracking-[0.2em] text-foreground/40">
                        <span>Admin</span>
                        <ChevronRight className="h-3 w-3" />
                        <span className="text-indigo-600">Test Series Management</span>
                    </div>
                    <h1 className="text-5xl font-black text-foreground uppercase tracking-tighter italic leading-none">
                        Test <span className="text-indigo-600">Series</span>
                    </h1>
                    <p className="text-[9px] font-black uppercase tracking-widest text-foreground/40">
                        {series.length} series · {paidCount} paid · <a href="/admin/orders" className="text-indigo-600 hover:underline">view orders & revenue</a>
                    </p>
                </div>

                <div className="flex items-center gap-4">
                    <div className="relative group min-w-[300px]">
                        <Search className="absolute left-6 top-1/2 -translate-y-1/2 h-4 w-4 text-foreground/20 group-focus-within:text-indigo-600 transition-colors" />
                        <input
                            type="text"
                            placeholder="SCAN SERIES CODES..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full bg-card-bg border border-card-border rounded-[2rem] py-5 pl-14 pr-6 text-[10px] font-black uppercase tracking-widest focus:outline-none focus:border-indigo-600/30 shadow-xl transition-all"
                        />
                    </div>
                    <button
                        onClick={() => setShowWizard(true)}
                        className="flex items-center gap-3 bg-indigo-600 text-white px-8 py-5 rounded-[2rem] text-[10px] font-black uppercase tracking-widest shadow-2xl shadow-indigo-500/20 hover:scale-[1.02] active:scale-95 transition-all group"
                    >
                        <Plus className="h-4 w-4 group-hover:rotate-12 transition-transform" />
                        Create New Series
                    </button>
                </div>
            </div>

            {/* Test Series Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {filteredSeries.map((s) => {
                    const isPaid = !!s.is_paid && Number(s.price) > 0;
                    return (
                    <div key={s.id} className="bg-card-bg border border-card-border rounded-[3.5rem] overflow-hidden group hover:border-indigo-600/30 transition-all duration-500 shadow-sm relative">
                        {/* Image Header */}
                        <div className="h-48 bg-slate-900 relative overflow-hidden">
                            {s.image ? (
                                <img src={`${(process.env.NEXT_PUBLIC_STORAGE_URL ?? process.env.NEXT_PUBLIC_API_URL?.replace(/\/api$/, '') ?? '').replace(/\/$/, '')}/storage/${s.image}`} alt={s.name_en} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 opacity-60" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-white/5">
                                    <Rocket className="h-20 w-20" />
                                </div>
                            )}
                            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 to-transparent" />
                            <div className="absolute top-6 left-6 flex items-center gap-2 px-4 py-2 bg-black/40 backdrop-blur-md rounded-full border border-white/10">
                                <span className="text-[8px] font-black text-white uppercase tracking-widest">{s.exam?.name_en}</span>
                            </div>
                            <div className="absolute top-6 right-6">
                                {isPaid ? (
                                    <span className="flex items-center gap-1.5 px-4 py-2 bg-amber-500 text-white rounded-full text-[8px] font-black uppercase tracking-widest shadow-lg shadow-amber-500/30">
                                        <Lock className="h-3 w-3" /> Paid
                                    </span>
                                ) : (
                                    <span className="px-4 py-2 bg-emerald-500/80 text-white rounded-full text-[8px] font-black uppercase tracking-widest">Free</span>
                                )}
                            </div>
                        </div>

                        <div className="p-10 space-y-6">
                            <div className="space-y-2">
                                <h3 className="text-xl font-black text-foreground uppercase tracking-tight italic group-hover:text-indigo-600 transition-colors">{s.name_en}</h3>
                                <div className="flex items-center gap-2">
                                    <Globe className="h-3 w-3 text-foreground/20" />
                                    <span className="text-[8px] font-black text-foreground/30 uppercase tracking-widest">{s.name_hi}</span>
                                </div>
                            </div>

                            <div className="flex items-center justify-between gap-3">
                                <PriceTag price={s.price ?? 0} mrp={s.mrp} currency={s.currency ?? 'INR'} isPaid={isPaid} size="sm" />
                                {isPaid && (
                                    <span className="flex items-center gap-1.5 text-[8px] font-black uppercase tracking-widest text-foreground/40">
                                        <CalendarClock className="h-3 w-3" />
                                        {s.validity_days ? `${s.validity_days} days` : 'Lifetime'}
                                    </span>
                                )}
                            </div>

                            <div className="flex items-center justify-between pt-6 border-t border-card-border/50">
                                <button
                                    onClick={() => togglePublish(s)}
                                    className={cn(
                                        "px-4 py-2 rounded-full text-[8px] font-black uppercase tracking-widest border transition-all",
                                        s.is_published
                                            ? "bg-emerald-600/10 text-emerald-600 border-emerald-600/20"
                                            : "bg-amber-600/10 text-amber-600 border-amber-600/20"
                                    )}
                                >
                                    {s.is_published ? 'Live' : 'Draft'}
                                </button>

                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => openEdit(s)}
                                        title="Edit series & pricing"
                                        className="h-10 w-10 rounded-xl bg-background border border-card-border flex items-center justify-center text-foreground/30 hover:text-indigo-600 transition-all"
                                    >
                                        <Edit2 className="h-4 w-4" />
                                    </button>
                                    {canDelete && (
                                        <button
                                            onClick={() => handleDelete(s.id)}
                                            className="h-10 w-10 rounded-xl bg-background border border-card-border flex items-center justify-center text-foreground/30 hover:text-red-500 transition-all"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                    );
                })}
            </div>

            {/* WIZARD MODAL */}
            {showWizard && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/80 backdrop-blur-md animate-in fade-in duration-300 overflow-y-auto">
                    <div className="w-full max-w-2xl bg-card-bg border border-card-border rounded-[3rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-500 my-auto">
                        <div className="p-10 space-y-8">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="h-12 w-12 bg-indigo-600 rounded-2xl flex items-center justify-center shadow-xl shadow-indigo-600/20">
                                        <Rocket className="text-white h-6 w-6" />
                                    </div>
                                    <div>
                                        <h2 className="text-lg font-black text-foreground uppercase tracking-tight italic">Series Architect</h2>
                                        <p className="text-[8px] font-black text-indigo-600 uppercase tracking-widest">Test structure</p>
                                    </div>
                                </div>
                                <button onClick={() => setShowWizard(false)} className="text-foreground/20 hover:text-foreground transition-colors p-2">
                                    <X className="h-5 w-5" />
                                </button>
                            </div>

                            <form onSubmit={handleCreate} className="space-y-6">
                                <div className="space-y-2">
                                    <label className="text-[9px] font-black text-foreground/40 uppercase tracking-widest block px-2">Exam Vector</label>
                                    <select
                                        value={wizardData.exam_id}
                                        onChange={(e) => setWizardData({ ...wizardData, exam_id: e.target.value })}
                                        className="w-full bg-white/5 border border-card-border rounded-2xl p-4 text-[10px] font-black uppercase focus:outline-none focus:border-indigo-600/30 transition-all"
                                    >
                                        {exams.map(ex => (
                                            <option key={ex.id} value={ex.id} className="bg-black text-white">{ex.name_en}</option>
                                        ))}
                                    </select>
                                </div>

                                <div className="grid grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-[9px] font-black text-foreground/40 uppercase tracking-widest block px-2">Series Name (EN)</label>
                                        <input
                                            required
                                            type="text"
                                            value={wizardData.name_en}
                                            onChange={(e) => setWizardData({ ...wizardData, name_en: e.target.value })}
                                            className="w-full bg-white/5 border border-card-border rounded-2xl p-4 text-[10px] font-black uppercase focus:outline-none focus:border-indigo-600/30 transition-all"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[9px] font-black text-foreground/40 uppercase tracking-widest block px-2">Series Name (HI)</label>
                                        <input
                                            required
                                            type="text"
                                            value={wizardData.name_hi}
                                            onChange={(e) => setWizardData({ ...wizardData, name_hi: e.target.value })}
                                            className="w-full bg-white/5 border border-card-border rounded-2xl p-4 text-[10px] font-black uppercase focus:outline-none focus:border-indigo-600/30 transition-all"
                                        />
                                    </div>
                                </div>

                                <PricingFields value={wizardPricing} onChange={setWizardPricing} />
                                <TestPicker selected={wizardTestIds} onChange={setWizardTestIds} />

                                <div className="space-y-2">
                                    <label className="text-[9px] font-black text-foreground/40 uppercase tracking-widest block px-2">Series Visual Cover</label>
                                    <div className="bg-white/5 border border-card-border border-dashed rounded-2xl p-8 flex flex-col items-center justify-center gap-4 hover:border-indigo-600/30 transition-all cursor-pointer relative group">
                                        {selectedFile ? (
                                            <div className="flex items-center gap-4">
                                                <ImageIcon className="h-8 w-8 text-indigo-600" />
                                                <span className="text-[10px] font-black uppercase text-foreground">{selectedFile.name}</span>
                                            </div>
                                        ) : (
                                            <>
                                                <ImageIcon className="h-8 w-8 text-foreground/10 group-hover:text-indigo-600/50 transition-colors" />
                                                <span className="text-[8px] font-black uppercase text-foreground/20 tracking-widest">Choose a cover image</span>
                                            </>
                                        )}
                                        <input
                                            type="file"
                                            className="absolute inset-0 opacity-0 cursor-pointer"
                                            onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                                            accept="image/*"
                                        />
                                    </div>
                                </div>

                                <button
                                    disabled={isSaving}
                                    type="submit"
                                    className="w-full bg-indigo-600 text-white py-6 rounded-[1.5rem] text-xs font-black uppercase tracking-[0.2em] shadow-2xl shadow-indigo-600/20 active:scale-95 transition-all flex items-center justify-center gap-4 disabled:bg-indigo-600/50"
                                >
                                    {isSaving ? <Loader2 className="h-5 w-5 animate-spin" /> : <Rocket className="h-5 w-5" />}
                                    {isSaving ? 'Initializing...' : 'Construct Series Vector'}
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            )}

            {/* EDIT MODAL */}
            {editing && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/80 backdrop-blur-md animate-in fade-in duration-300 overflow-y-auto">
                    <div className="w-full max-w-2xl bg-card-bg border border-card-border rounded-[3rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-500 my-auto">
                        <div className="p-10 space-y-8">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="h-12 w-12 bg-indigo-600 rounded-2xl flex items-center justify-center shadow-xl shadow-indigo-600/20">
                                        <Edit2 className="text-white h-6 w-6" />
                                    </div>
                                    <div>
                                        <h2 className="text-lg font-black text-foreground uppercase tracking-tight italic">Edit Series</h2>
                                        <p className="text-[8px] font-black text-indigo-600 uppercase tracking-widest">#{editing.id} · {editing.exam?.name_en ?? 'No exam'}</p>
                                    </div>
                                </div>
                                <button onClick={() => setEditing(null)} className="text-foreground/20 hover:text-foreground transition-colors p-2">
                                    <X className="h-5 w-5" />
                                </button>
                            </div>

                            <form onSubmit={handleUpdate} className="space-y-6">
                                <div className="grid grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-[9px] font-black text-foreground/40 uppercase tracking-widest block px-2">Series Name (EN)</label>
                                        <input
                                            required
                                            type="text"
                                            value={editData.name_en}
                                            onChange={(e) => setEditData({ ...editData, name_en: e.target.value })}
                                            className="w-full bg-white/5 border border-card-border rounded-2xl p-4 text-[10px] font-black uppercase focus:outline-none focus:border-indigo-600/30 transition-all"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[9px] font-black text-foreground/40 uppercase tracking-widest block px-2">Series Name (HI)</label>
                                        <input
                                            type="text"
                                            value={editData.name_hi}
                                            onChange={(e) => setEditData({ ...editData, name_hi: e.target.value })}
                                            className="w-full bg-white/5 border border-card-border rounded-2xl p-4 text-[10px] font-black uppercase focus:outline-none focus:border-indigo-600/30 transition-all"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[9px] font-black text-foreground/40 uppercase tracking-widest block px-2">Description (EN)</label>
                                    <textarea
                                        rows={3}
                                        value={editData.description_en}
                                        onChange={(e) => setEditData({ ...editData, description_en: e.target.value })}
                                        className="w-full bg-white/5 border border-card-border rounded-2xl p-4 text-[10px] font-bold focus:outline-none focus:border-indigo-600/30 transition-all"
                                    />
                                </div>

                                <PricingFields value={editPricing} onChange={setEditPricing} />
                                <TestPicker selected={editTestIds} onChange={setEditTestIds} />

                                <label className="flex items-center gap-3 px-2 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={editData.is_published}
                                        onChange={(e) => setEditData({ ...editData, is_published: e.target.checked })}
                                        className="h-4 w-4 accent-indigo-600"
                                    />
                                    <span className="text-[9px] font-black text-foreground/60 uppercase tracking-widest">Published (visible to students)</span>
                                </label>

                                {editPricing.is_paid && (
                                    <p className="flex items-start gap-2 text-[9px] font-bold text-amber-600 bg-amber-500/10 border border-amber-500/20 rounded-xl px-4 py-3">
                                        <ShieldAlert className="h-4 w-4 shrink-0" />
                                        Tests are locked only when they are not marked free and do not also belong to a free series. Students who already enrolled keep their access.
                                    </p>
                                )}

                                <button
                                    disabled={isSaving}
                                    type="submit"
                                    className="w-full bg-indigo-600 text-white py-6 rounded-[1.5rem] text-xs font-black uppercase tracking-[0.2em] shadow-2xl shadow-indigo-600/20 active:scale-95 transition-all flex items-center justify-center gap-4 disabled:bg-indigo-600/50"
                                >
                                    {isSaving ? <Loader2 className="h-5 w-5 animate-spin" /> : <Save className="h-5 w-5" />}
                                    {isSaving ? 'Saving...' : 'Save Changes'}
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
