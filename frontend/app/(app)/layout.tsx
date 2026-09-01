import Link from "next/link";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen">
      <aside className="w-64 border-r bg-muted/40 p-4">
        <div className="mb-6 text-lg font-semibold">UBRA</div>
        <nav className="flex flex-col gap-2">
          <Link href="/dashboard" className="rounded px-3 py-2 hover:bg-muted">
            Dashboard
          </Link>
          <Link href="/applications" className="rounded px-3 py-2 hover:bg-muted">
            Applications
          </Link>
        </nav>
      </aside>
      <main className="flex-1 p-6">{children}</main>
    </div>
  );
}
