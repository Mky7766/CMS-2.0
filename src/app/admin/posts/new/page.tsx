import PostForm from "@/components/admin/post-form";

export default function NewPostPage() {
    return (
        <div>
            <div className="mb-8">
                <h1 className="text-3xl font-bold tracking-tight">Create New Post</h1>
                <p className="text-muted-foreground">Fill in the details below to create a new blog post.</p>
            </div>
            <PostForm />
        </div>
    );
}
