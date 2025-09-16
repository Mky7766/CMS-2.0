
import { getSession } from "@/lib/session";
import { users } from "@/lib/data";
import { notFound } from "next/navigation";
import ProfileForm from "@/components/admin/profile-form";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";


export default async function ProfilePage() {
    const session = await getSession();
    if (!session?.userId) {
        notFound();
    }

    const user = users.find(u => u.id === session.userId);

    if (!user) {
        notFound();
    }

    return (
        <div className="space-y-8">
             <div>
                <h1 className="text-3xl font-bold tracking-tight">Your Profile</h1>
                <p className="text-muted-foreground">Manage your personal information.</p>
            </div>
            <div className="grid gap-8 lg:grid-cols-3">
                <div className="lg:col-span-1">
                    <Card>
                        <CardContent className="pt-6 flex flex-col items-center text-center">
                            <Avatar className="h-24 w-24 mb-4">
                                <AvatarImage src={user.avatarUrl} alt={user.name} />
                                <AvatarFallback className="text-3xl">
                                    {user.name.charAt(0)}
                                </AvatarFallback>
                            </Avatar>
                            <h2 className="text-2xl font-bold">{user.name}</h2>
                            <p className="text-muted-foreground">{user.email}</p>
                            <p className="mt-2 text-sm text-muted-foreground">Role: {user.role}</p>
                        </CardContent>
                    </Card>
                </div>
                <div className="lg:col-span-2">
                    <ProfileForm user={user} />
                </div>
            </div>
        </div>
    );
}
