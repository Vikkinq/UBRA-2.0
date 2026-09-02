import { getServerUser } from "@/lib/auth";

export default async function AdminDashboardPage() {
  const user = await getServerUser();

  return (
    <div>
      <h1 className="text-2xl font-semibold">Admin Dashboard</h1>
      <p className="text-muted-foreground mt-2">Welcome, {user?.name}. Admin-only area.</p>
    </div>
  );
}
