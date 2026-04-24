'use client';

import { useParams } from 'next/navigation';
import SubjectLearningConsole from '@/components/courses/SubjectLearningConsole';

export default function IntegratedNcertSubjectPage() {
    const params = useParams();
    const subjectId = Array.isArray(params.subjectId) ? params.subjectId[0] : params.subjectId;

    if (!subjectId) return null;

    return (
        <SubjectLearningConsole
            subjectId={subjectId}
            contextLabel="Integrated NCERT Learning Console"
            breadcrumbs={[
                { label: 'Courses', href: '/dashboard/courses' },
                { label: 'NCERT', href: '/dashboard/courses/ncert' },
                { label: 'Integrated', href: '/dashboard/courses/ncert/all' },
                { label: 'Subject' },
            ]}
            subtitle="Unified NCERT stream across classes with multimodal full-window study controls."
        />
    );
}
