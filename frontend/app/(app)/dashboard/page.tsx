import { getServerUser } from "@/lib/auth";

export default async function DashboardPage() {
  const user = await getServerUser();

  return (
    <div>
      <h1 className="text-2xl font-semibold">Dashboard</h1>
      <p className="text-muted-foreground mt-2">
        Welcome back, {user?.name}. This is where your application stats will go.
      </p>
    </div>
  );
}
