'use client';

import { useParams } from 'next/navigation';
import SubjectLearningConsole from '@/components/courses/SubjectLearningConsole';

const CATEGORY_NAMES: Record<string, string> = {
    dsssb: 'DSSSB TGT Computer Science',
    gs: 'General Studies',
};

function formatCategoryName(value: string) {
    if (CATEGORY_NAMES[value]) return CATEGORY_NAMES[value];
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
            subtitle={`${categoryName}: pick a chapter, then a topic, and study its notes, videos and practice material.`}
        />
    );
}
