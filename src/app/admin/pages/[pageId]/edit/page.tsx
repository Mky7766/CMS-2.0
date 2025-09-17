
import PageForm from "@/components/admin/page-form";
import { pages } from "@/lib/data";
import { notFound } from "next/navigation";

export default function EditPagePage({ params }: { params: { pageId: string } }) {
    const page = pages.find(p => p.id === params.pageId);

    if (!page) {
        notFound();
    }

    return (
        <div>
            <div className="mb-8">
                <h1 className="text-3xl font-bold tracking-tight">Edit Page</h1>
                <p className="text-muted-foreground">Update the details of your page.</p>
            </div>
            <PageForm page={page} />
        </div>
    );
}
