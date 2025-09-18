
"use client"

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Search, Bell, User } from "lucide-react"
import React, { useEffect, useState } from "react"
import { logout } from "@/app/actions"
import Link from "next/link"
import { ThemeToggle } from "../theme-toggle"

// This is a simplified client-side session fetcher.
// In a real app, you'd likely use a context provider or a library like next-auth.
async function getClientSession() {
  try {
    const res = await fetch('/api/session');
    if (res.ok) {
      const { user } = await res.json();
      return { user };
    }
    return { user: null };
  } catch (error) {
    console.error("Failed to fetch session:", error);
    return { user: null };
  }
}


export default function AppHeader() {
  const [user, setUser] = useState<{name: string, email: string, avatarUrl: string} | null>(null);

  useEffect(() => {
    // Fetch user session
    async function fetchUser() {
        const session = await getClientSession();
        if(session.user) {
            setUser(session.user);
        }
    }
    fetchUser();
  }, []);

  return (
    <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b bg-card px-4 md:px-6">
        <div className="md:hidden">
            <SidebarTrigger />
        </div>
      <div className="flex-1">
        <form>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search content..."
              className="w-full appearance-none bg-background pl-9 shadow-none md:w-1/3"
            />
          </div>
        </form>
      </div>
      <div className="flex items-center gap-4">
        <ThemeToggle />
        <Button variant="ghost" size="icon" className="rounded-full">
            <Bell className="h-5 w-5" />
            <span className="sr-only">Toggle notifications</span>
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="rounded-full">
              <Avatar className="h-8 w-8">
                 {user ? (
                    <>
                        <AvatarImage src={user.avatarUrl} alt={user.name} />
                        <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                    </>
                 ) : (
                    <AvatarFallback>
                        <User className="h-5 w-5" />
                    </AvatarFallback>
                 )}
              </Avatar>
              <span className="sr-only">Toggle user menu</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>{user ? user.name : "My Account"}</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
                <Link href="/admin/profile">Profile</Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
                <Link href="/admin/settings">Settings</Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
             <form action={logout}>
                <DropdownMenuItem asChild>
                    <button type="submit" className="w-full text-left">Logout</button>
                </DropdownMenuItem>
             </form>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
