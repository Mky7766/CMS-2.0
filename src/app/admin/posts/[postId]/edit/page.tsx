import PostForm from "@/components/admin/post-form";
import { posts } from "@/lib/data";
import { notFound } from "next/navigation";

export default function EditPostPage({ params }: { params: { postId: string } }) {
    const post = posts.find(p => p.id === params.postId);

    if (!post) {
        notFound();
    }

    return (
        <div>
            <div className="mb-8">
                <h1 className="text-3xl font-bold tracking-tight">Edit Post</h1>
                <p className="text-muted-foreground">Update the details of your blog post.</p>
            </div>
            <PostForm post={post} />
        </div>
    );
}
