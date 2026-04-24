import RouteGuard from '@/components/auth/RouteGuard';

export default function Layout({ children }: { children: React.ReactNode }) {
    return <RouteGuard>{children}</RouteGuard>;
}
