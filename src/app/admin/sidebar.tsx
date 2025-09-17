

"use client"

import Link from "next/link"
import React from "react"
import { usePathname } from "next/navigation"
import {
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarGroup,
  SidebarGroupLabel,
} from "@/components/ui/sidebar"
import { Icons } from "@/components/icons"
import { LayoutDashboard, FileText, Image as ImageIcon, Settings, Users, LogOut, AppWindow, Menu as MenuIcon, Palette } from "lucide-react"
import { Separator } from "../ui/separator"
import { logout } from "@/app/actions"
import { Button } from "../ui/button"

const mainMenuItems = [
  { href: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/posts", label: "Posts", icon: FileText },
  { href: "/admin/media", label: "Media", icon: ImageIcon },
  { href: "/admin/users", label: "Users", icon: Users },
]

const settingsMenuItems = [
    { href: "/admin/settings", label: "General", icon: Settings },
    { href: "/admin/menus", label: "Menus", icon: MenuIcon },
    { href: "/admin/appearance/templates", label: "Blog Templates", icon: Palette },
]

export default function AppSidebar({ siteName }: { siteName: string }) {
  const pathname = usePathname()
  
  return (
    <Sidebar>
      <SidebarHeader>
        <Link href="/admin/dashboard" className="flex items-center gap-2">
          <Icons.logo className="w-7 h-7 text-primary" />
          <h1 className="text-xl font-semibold text-sidebar-foreground">{siteName}</h1>
        </Link>
      </SidebarHeader>
      <SidebarContent className="flex-1">
        <SidebarMenu>
          {mainMenuItems.map((item) => (
            <SidebarMenuItem key={item.href}>
              <SidebarMenuButton
                asChild
                isActive={pathname.startsWith(item.href)}
                tooltip={{ children: item.label }}
              >
                <Link href={item.href}>
                  <item.icon className="h-4 w-4" />
                  <span>{item.label}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
         <SidebarGroup>
            <SidebarGroupLabel>Settings</SidebarGroupLabel>
            <SidebarMenu>
                 {settingsMenuItems.map((item) => (
                    <SidebarMenuItem key={item.href}>
                        <SidebarMenuButton
                            asChild
                            isActive={pathname.startsWith(item.href)}
                            tooltip={{ children: item.label }}
                        >
                            <Link href={item.href}>
                            <item.icon className="h-4 w-4" />
                            <span>{item.label}</span>
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                ))}
            </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
      <Separator className="my-2 bg-sidebar-border" />
      <SidebarFooter>
         <SidebarMenu>
             <SidebarMenuItem>
                <form action={logout}>
                    <SidebarMenuButton asChild tooltip={{ children: 'Logout' }}>
                        <Button type="submit" variant="ghost" className="w-full justify-start">
                            <LogOut className="h-4 w-4" />
                            <span>Logout</span>
                        </Button>
                    </SidebarMenuButton>
                </form>
            </SidebarMenuItem>
         </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  )
}
