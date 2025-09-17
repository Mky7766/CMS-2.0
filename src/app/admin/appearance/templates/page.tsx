
import { getSettings } from "@/lib/settings";
import TemplatesClientPage from "@/components/admin/templates-client-page";
import { getTemplates } from "@/app/actions";

export default async function TemplatesPage() {
    const settings = await getSettings();
    const templates = await getTemplates();
    return <TemplatesClientPage settings={settings} templates={templates} />;
}
