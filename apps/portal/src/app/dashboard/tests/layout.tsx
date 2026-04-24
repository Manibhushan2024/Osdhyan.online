// Guests can browse and view tests freely.
// Auth is required only when starting an attempt (handled inline in the test player).
export default function Layout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}
