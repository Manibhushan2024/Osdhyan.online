'use client';

import { useParams } from 'next/navigation';
import SubjectLearningConsole from '@/components/courses/SubjectLearningConsole';

function formatCategoryName(value: string) {
    return value
        .split('-')
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
}

export default function CategorySubjectPage() {
    const params = useParams();
    const category = Array.isArray(params.category) ? params.category[0] : params.category;
    const subjectId = Array.isArray(params.subjectId) ? params.subjectId[0] : params.subjectId;

    if (!category || !subjectId) return null;

    const categoryName = formatCategoryName(category);

    return (
        <SubjectLearningConsole
            subjectId={subjectId}
            contextLabel={`${categoryName} Learning Console`}
            breadcrumbs={[
                { label: 'Courses', href: '/dashboard/courses' },
                { label: categoryName, href: `/dashboard/courses/${category}` },
                { label: 'Subject' },
            ]}
            subtitle={`${categoryName} multimodal learning with chapter and topic navigation plus full-window controls.`}
        />
    );
}
