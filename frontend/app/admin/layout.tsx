import { redirect } from "next/navigation";
import { getServerUser } from "@/lib/auth";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await getServerUser();

  if (!user) redirect("/login");
  if (user.role !== "Super Admin") redirect("/dashboard");

  return (
    <div className="flex min-h-screen">
      <aside className="w-64 border-r bg-muted/40 p-4">
        <div className="mb-6 text-lg font-semibold">UBRA Admin</div>
      </aside>
      <main className="flex-1 p-6">{children}</main>
    </div>
  );
}
