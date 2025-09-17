

import GeneralSettingsForm from "@/components/admin/general-settings-form";
import MenuSettingsForm from "@/components/admin/menu-settings-form";
import SEOSettingsForm from "@/components/admin/seo-settings-form";
import WritingSettingsForm from "@/components/admin/writing-settings-form";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"
import { getMenus, getSettings, getCategories } from "@/app/actions";


export default async function SettingsPage() {
  const settings = await getSettings();
  const menus = await getMenus();
  const categories = await getCategories();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">Manage your site's settings and preferences.</p>
      </div>

       <Tabs defaultValue="general">
        <TabsList>
            <TabsTrigger value="general">General</TabsTrigger>
            <TabsTrigger value="writing">Writing</TabsTrigger>
            <TabsTrigger value="menus">Menus</TabsTrigger>
            <TabsTrigger value="seo">SEO</TabsTrigger>
        </TabsList>
        <TabsContent value="general" className="mt-4">
            <GeneralSettingsForm settings={settings} />
        </TabsContent>
        <TabsContent value="writing" className="mt-4">
            <WritingSettingsForm settings={settings} categories={categories} />
        </TabsContent>
         <TabsContent value="menus" className="mt-4">
          <MenuSettingsForm settings={settings} menus={menus} />
        </TabsContent>
        <TabsContent value="seo" className="mt-4">
            <SEOSettingsForm settings={settings} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
