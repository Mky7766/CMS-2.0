

import AppHeader from "@/components/admin/header";
import AppSidebar from "@/components/admin/sidebar";
import { SidebarProvider } from "@/components/ui/sidebar";
import { getSettings } from "@/app/actions";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const settings = await getSettings();

  return (
    <>
      <SidebarProvider>
          <AppSidebar siteName={settings.siteName} />
          <div className="flex flex-col w-full">
              <AppHeader />
              <main className="p-4 md:p-8 flex-1 bg-muted/40">
                  {children}
              </main>
          </div>
      </SidebarProvider>
    </>
  );
}
