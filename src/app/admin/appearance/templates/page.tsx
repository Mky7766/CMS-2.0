
import { getSettings } from "@/lib/settings";
import TemplateSelectionForm from "@/components/admin/template-selection-form";

export default async function TemplatesPage() {
    const settings = await getSettings();

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
                <h1 className="text-3xl font-bold tracking-tight">Blog Templates</h1>
                <p className="text-muted-foreground">Choose a layout for your blog's homepage.</p>
            </div>
            <TemplateSelectionForm currentTemplate={settings.blogTemplate || 'grid'} templates={templates} />
        </div>
    )
}
