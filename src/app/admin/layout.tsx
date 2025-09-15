
"use client";

import AppHeader from "@/components/admin/header";
import AppSidebar from "@/components/admin/sidebar";
import { SidebarProvider } from "@/components/ui/sidebar";
import { getSession } from "@/lib/session";
import { redirect } from 'next/navigation';
import { useEffect, useState } from "react";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sessionChecked, setSessionChecked] = useState(false);
  const [themeStyles, setThemeStyles] = useState('');

  useEffect(() => {
    const checkSession = async () => {
      const session = await getSession();
      if (!session) {
        redirect('/login');
      } else {
        setSessionChecked(true);
      }
    };
    checkSession();
  }, []);

  useEffect(() => {
    const storedTheme = localStorage.getItem('selected-theme');
    if (storedTheme) {
        setThemeStyles(storedTheme);
    }
  }, []);


  if (!sessionChecked) {
    return null; // Or a loading spinner
  }

  return (
    <>
      <style jsx global>{`
        :root {
          ${themeStyles}
        }
      `}</style>
      <SidebarProvider>
          <AppSidebar />
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
