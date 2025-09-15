
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import ThemeForm from "@/components/admin/theme-form";
import GeneralSettingsForm from "@/components/admin/general-settings-form";
import { getSettings } from "@/lib/settings";


export default async function SettingsPage() {
  const settings = await getSettings();

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
            <ThemeForm />
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
