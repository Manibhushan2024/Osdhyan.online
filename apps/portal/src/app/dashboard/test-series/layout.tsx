// Guests can browse test series freely.
// Auth is required only when enrolling or attempting a test (handled inline).
export default function Layout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}
