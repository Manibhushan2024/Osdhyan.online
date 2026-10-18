'use client';

import Link from 'next/link';
import { BadgeCheck, MapPin, Briefcase } from 'lucide-react';
import { MODE_LABELS, TeacherPublic, formatINR } from './types';

export function TeacherAvatar({ name, avatar, size = 48 }: { name: string | null; avatar: string | null; size?: number }) {
    const initials = (name || '?').split(' ').map((p) => p[0]).slice(0, 2).join('').toUpperCase();
    if (avatar) {
        // eslint-disable-next-line @next/next/no-img-element
        return <img src={avatar} alt={name || ''} width={size} height={size} className="rounded-full object-cover shrink-0" style={{ width: size, height: size }} />;
    }
    return (
        <div
            className="rounded-full bg-blue-100 text-blue-700 font-bold flex items-center justify-center shrink-0"
            style={{ width: size, height: size, fontSize: size / 2.8 }}
        >
            {initials}
        </div>
    );
}

export default function TeacherCard({ teacher }: { teacher: TeacherPublic }) {
    return (
        <div className="bg-card-bg border border-card-border rounded-2xl p-5 flex flex-col gap-4 hover:border-blue-300 transition-colors">
            <div className="flex items-start gap-3">
                <TeacherAvatar name={teacher.name} avatar={teacher.avatar} />
                <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                        <h3 className="font-bold text-foreground truncate">{teacher.name}</h3>
                        {teacher.is_verified && (
                            <span title="Verified by OSDHYAN" className="inline-flex items-center gap-0.5 text-[10px] font-semibold text-green-700 bg-green-50 px-1.5 py-0.5 rounded-md">
                                <BadgeCheck className="h-3 w-3" /> Verified
                            </span>
                        )}
                    </div>
                    <p className="text-sm text-foreground/60 line-clamp-2">{teacher.headline || 'Tutor'}</p>
                </div>
            </div>

            <div className="flex flex-wrap gap-1.5">
                {teacher.subjects.slice(0, 4).map((s) => (
                    <span key={s} className="text-[11px] font-semibold bg-blue-50 text-blue-700 px-2 py-0.5 rounded-md">{s}</span>
                ))}
                {teacher.exams.slice(0, 3).map((e) => (
                    <span key={e} className="text-[11px] font-semibold bg-amber-50 text-amber-700 px-2 py-0.5 rounded-md">{e}</span>
                ))}
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs text-foreground/70">
                <span className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5" /> {teacher.city || 'Online'}</span>
                <span className="flex items-center gap-1"><Briefcase className="h-3.5 w-3.5" /> {teacher.experience_years} yr exp</span>
                <span className="col-span-2 text-foreground/50">{MODE_LABELS[teacher.teaching_mode]}</span>
            </div>

            <div className="mt-auto flex items-center justify-between pt-2 border-t border-card-border">
                <div>
                    <span className="text-lg font-bold text-foreground">{formatINR(teacher.fee_per_hour)}</span>
                    <span className="text-xs text-foreground/50"> / hour</span>
                </div>
                <Link
                    href={`/dashboard/tuition/teachers/${teacher.id}`}
                    className="px-4 py-2 rounded-xl bg-blue-600 text-white text-xs font-bold hover:bg-blue-700"
                >
                    View
                </Link>
            </div>
        </div>
    );
}
