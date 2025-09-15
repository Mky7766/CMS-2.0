import AppHeader from "@/components/admin/header";
import AppSidebar from "@/components/admin/sidebar";
import { SidebarProvider } from "@/components/ui/sidebar";
import { getSession } from "@/lib/session";
import { redirect } from 'next/navigation';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();

  if (!session) {
    redirect('/login');
  }

  return (
    <SidebarProvider>
        <AppSidebar />
        <div className="flex flex-col w-full">
            <AppHeader />
            <main className="p-4 md:p-8 flex-1 bg-muted/40">
                {children}
            </main>
        </div>
    </SidebarProvider>
  );
}
