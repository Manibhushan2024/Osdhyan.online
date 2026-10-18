import DashboardLayout from '@/components/layout/DashboardLayout';

/** Teacher area shares the student dashboard shell (sidebar, navbar, RouteGuard). */
export default function TeachLayout({ children }: { children: React.ReactNode }) {
    return <DashboardLayout>{children}</DashboardLayout>;
}
