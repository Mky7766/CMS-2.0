
import UserForm from "@/components/admin/user-form";

export default function NewUserPage() {
    return (
        <div>
            <div className="mb-8">
                <h1 className="text-3xl font-bold tracking-tight">Create New User</h1>
                <p className="text-muted-foreground">Fill in the details below to create a new user account.</p>
            </div>
            <UserForm />
        </div>
    );
}
