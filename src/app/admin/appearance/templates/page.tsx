
import { getSettings } from "@/lib/settings";
import TemplatesClientPage from "@/components/admin/templates-client-page";

export default async function TemplatesPage() {
    const settings = await getSettings();
    return <TemplatesClientPage settings={settings} />;
}
