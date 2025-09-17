
import PageForm from "@/components/admin/page-form";

export default function NewPagePage() {
    return (
        <div>
            <div className="mb-8">
                <h1 className="text-3xl font-bold tracking-tight">Create New Page</h1>
                <p className="text-muted-foreground">Fill in the details below to create a new page.</p>
            </div>
            <PageForm />
        </div>
    );
}
