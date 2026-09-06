import { getServerUser } from "@/lib/auth";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app/AppSidebar";
import { AppNavbar } from "@/components/app/AppNavbar";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const user = await getServerUser();

  return (
    <SidebarProvider>
      <AppSidebar user={user} />
      <div className="flex min-h-svh flex-1 flex-col">
        <AppNavbar />
        <main className="flex-1 p-6">{children}</main>
      </div>
    </SidebarProvider>
  );
}
