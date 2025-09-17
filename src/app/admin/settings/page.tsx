

import GeneralSettingsForm from "@/components/admin/general-settings-form";
import { getSettings } from "@/lib/settings";

export default async function SettingsPage() {
  const settings = await getSettings();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">Manage your site's general settings and preferences.</p>
      </div>
      <GeneralSettingsForm settings={settings} />
    </div>
  );
}
