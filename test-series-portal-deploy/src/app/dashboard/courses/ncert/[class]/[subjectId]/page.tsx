'use client';

import { useParams } from 'next/navigation';
import SubjectLearningConsole from '@/components/courses/SubjectLearningConsole';

export default function NcertChapterFlowPage() {
    const params = useParams();
    const className = Array.isArray(params.class) ? params.class[0] : params.class;
    const subjectId = Array.isArray(params.subjectId) ? params.subjectId[0] : params.subjectId;

    if (!subjectId) return null;

    return (
        <SubjectLearningConsole
            subjectId={subjectId}
            contextLabel={`Class ${className || ''} Learning Console`}
            breadcrumbs={[
                { label: 'Courses', href: '/dashboard/courses' },
                { label: 'NCERT', href: '/dashboard/courses/ncert' },
                { label: `Class ${className || '-'}` },
            ]}
            subtitle="Class-wise NCERT multimodal learning with full-window and mini-view controls."
        />
    );
}
