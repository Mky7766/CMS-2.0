
"use client";

import { useEffect, useState, useTransition, useRef } from "react";
import { notFound } from "next/navigation";
import ProfileForm from "@/components/admin/profile-form";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { User } from "@/lib/data";
import { useToast } from "@/hooks/use-toast";
import { updateUserAvatar } from "@/app/actions";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Loader, Upload } from "lucide-react";


async function getClientSession() {
  try {
    const res = await fetch('/api/session');
    if (res.ok) {
      const { user } = await res.json();
      return { user };
    }
    return { user: null };
  } catch (error) {
    console.error("Failed to fetch session:", error);
    return { user: null };
  }
}

export default function ProfilePage() {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isPending, startTransition] = useTransition();
    const { toast } = useToast();
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        async function fetchUser() {
            const session = await getClientSession();
            if(session.user) {
                setUser(session.user);
            } else {
                // Handle not found or error case, maybe redirect
            }
            setIsLoading(false);
        }
        fetchUser();
    }, []);

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (!user) return;
        const file = event.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => {
            const dataUrl = reader.result as string;
            startTransition(async () => {
                const result = await updateUserAvatar(user.id, dataUrl);
                if (result.success && result.newAvatarUrl) {
                    setUser(prevUser => prevUser ? { ...prevUser, avatarUrl: result.newAvatarUrl! } : null);
                    toast({ title: "Success", description: "Avatar updated successfully." });
                } else {
                    toast({ title: "Error", description: result.error, variant: "destructive" });
                }
            });
        };
        reader.onerror = (error) => {
            console.error("Error reading file:", error);
            toast({ title: "Error", description: "Failed to read file.", variant: "destructive" });
        };
        if(fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };


    if (isLoading) {
        return <div>Loading...</div>; // Or a spinner component
    }

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
                            <div className="mt-4">
                                <Button asChild variant="outline" size="sm" disabled={isPending}>
                                    <Label htmlFor="avatar-upload" className="cursor-pointer">
                                         {isPending ? <Loader className="mr-2 h-4 w-4 animate-spin" /> : <Upload className="mr-2 h-4 w-4" />}
                                         {isPending ? "Uploading..." : "Upload Photo"}
                                    </Label>
                                </Button>
                                <Input
                                    id="avatar-upload"
                                    type="file"
                                    className="sr-only"
                                    onChange={handleFileChange}
                                    accept="image/*"
                                    ref={fileInputRef}
                                    disabled={isPending}
                                />
                            </div>
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
