

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import GeneralSettingsForm from "@/components/admin/general-settings-form";
import MenuSettingsForm from "@/components/admin/menu-settings-form";
import { getSettings } from "@/lib/settings";
import { Menu } from "@/lib/data";
import fs from 'fs/promises';
import path from 'path';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";


async function getMenus(): Promise<Menu[]> {
    const filePath = path.join(process.cwd(), 'src', 'lib', 'menus.json');
    try {
        const data = await fs.readFile(filePath, 'utf-8');
        return JSON.parse(data) as Menu[];
    } catch (error) {
        return [];
    }
}

export default async function SettingsPage() {
  const settings = await getSettings();
  const menus = await getMenus();
  const templates = [
        {
            name: "Simple Grid",
            id: "grid",
            description: "A clean, simple grid layout for your blog posts.",
            imageUrl: "/images/template-grid.png"
        },
        {
            name: "Grid with Sidebar",
            id: "grid-sidebar",
            description: "A grid layout with a right sidebar for widgets.",
            imageUrl: "/images/template-grid-sidebar.png"
        }
    ]

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">Manage your site settings and preferences.</p>
      </div>
      <Tabs defaultValue="general" className="w-full">
        <TabsList>
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="menus">Menus</TabsTrigger>
          <TabsTrigger value="users">Users & Roles</TabsTrigger>
        </TabsList>
        <TabsContent value="general" className="mt-4">
            <GeneralSettingsForm settings={settings} templates={templates} />
        </TabsContent>
        <TabsContent value="menus" className="mt-4">
          <MenuSettingsForm settings={settings} menus={menus} />
        </TabsContent>
        <TabsContent value="users" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>User Management</CardTitle>
              <CardDescription>Manage who has access to your CMS.</CardDescription>
            </CardHeader>
            <CardContent>
              <p>User management interface coming soon.</p>
              <Button asChild>
                <Link href="/admin/users">Manage Users</Link>
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

    