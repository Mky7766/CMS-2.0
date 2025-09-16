
import UserForm from "@/components/admin/user-form";
import { getUserById } from "@/app/actions";
import { notFound } from "next/navigation";

export default async function EditUserPage({ params }: { params: { userId: string } }) {
    const user = await getUserById(params.userId);

    if (!user) {
        notFound();
    }

    return (
        <div>
            <div className="mb-8">
                <h1 className="text-3xl font-bold tracking-tight">Edit User</h1>
                <p className="text-muted-foreground">Update the user's details and role.</p>
            </div>
            <UserForm user={user} />
        </div>
    );
}
