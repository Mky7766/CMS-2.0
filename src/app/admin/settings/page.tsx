
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

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">Manage your site settings and preferences.</p>
      </div>
      <Tabs defaultValue="general" className="w-full">
        <TabsList>
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="appearance">Appearance</TabsTrigger>
          <TabsTrigger value="users">Users & Roles</TabsTrigger>
        </TabsList>
        <TabsContent value="general" className="mt-4">
            <GeneralSettingsForm settings={settings} />
        </TabsContent>
        <TabsContent value="appearance" className="mt-4">
            <Card>
                <CardHeader>
                    <CardTitle>Appearance Settings</CardTitle>
                    <CardDescription>Customize the look and feel of your public-facing site.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                   <div className="flex justify-between items-center p-4 border rounded-lg">
                       <div>
                           <h4 className="font-semibold">Colors</h4>
                           <p className="text-sm text-muted-foreground">Change your site's color scheme.</p>
                       </div>
                       <Button asChild variant="outline"><Link href="/admin/theme">Customize Colors</Link></Button>
                   </div>
                   <div className="flex justify-between items-center p-4 border rounded-lg">
                       <div>
                           <h4 className="font-semibold">Blog Templates</h4>
                           <p className="text-sm text-muted-foreground">Change the layout of your blog homepage.</p>
                       </div>
                       <Button asChild variant="outline"><Link href="/admin/appearance/templates">Change Template</Link></Button>
                   </div>
                </CardContent>
            </Card>
        </TabsContent>
        <TabsContent value="users" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>User Management</CardTitle>
              <CardDescription>Manage who has access to your CMS.</CardDescription>
            </CardHeader>
            <CardContent>
              <p>User management interface coming soon.</p>
              <Button className="mt-4">Invite User</Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
