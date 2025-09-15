"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from "@/components/ui/sidebar"
import { Icons } from "@/components/icons"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { LayoutDashboard, FileText, Image as ImageIcon, Settings, Users, LogOut } from "lucide-react"
import { Separator } from "../ui/separator"
import { logout } from "@/app/actions"
import { Button } from "../ui/button"

const menuItems = [
  { href: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/posts", label: "Posts", icon: FileText },
  { href: "/admin/media", label: "Media", icon: ImageIcon },
  { href: "/admin/settings", label: "Settings", icon: Settings },
  { href: "/admin/users", label: "Users", icon: Users },
]

export default function AppSidebar() {
  const pathname = usePathname()

  return (
    <Sidebar>
      <SidebarHeader>
        <Link href="/admin/dashboard" className="flex items-center gap-2">
          <Icons.logo className="w-7 h-7 text-primary" />
          <h1 className="text-xl font-semibold text-sidebar-foreground">Nebula CMS</h1>
        </Link>
      </SidebarHeader>
      <SidebarContent className="flex-1">
        <SidebarMenu>
          {menuItems.map((item) => (
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
      </SidebarContent>
      <Separator className="my-2 bg-sidebar-border" />
      <SidebarFooter>
         <SidebarMenu>
            <SidebarMenuItem>
                <SidebarMenuButton tooltip={{ children: 'User Profile' }}>
                    <Avatar className="h-8 w-8">
                        <AvatarImage src="https://picsum.photos/seed/user/32/32" alt="Admin" />
                        <AvatarFallback>A</AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col text-left">
                        <span className="text-sm font-medium">Admin User</span>
                        <span className="text-xs text-muted-foreground">admin@nebula.io</span>
                    </div>
                </SidebarMenuButton>
            </SidebarMenuItem>
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
