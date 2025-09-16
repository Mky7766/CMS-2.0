
"use client";

import { useActionState, useEffect } from "react";
import { useFormStatus } from "react-dom";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { updateUser } from "@/app/actions";
import type { User } from "@/lib/data";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? "Saving..." : "Save Changes"}
    </Button>
  );
}

type ProfileFormProps = {
    user: User;
}

export default function ProfileForm({ user }: ProfileFormProps) {
  const [state, formAction] = useActionState(updateUser, null);
  const { toast } = useToast();

  useEffect(() => {
    if (state?.error) {
      toast({
        title: "Error",
        description: state.error,
        variant: "destructive",
      });
    }
    if (state?.success) {
      toast({
        title: "Success",
        description: state.success,
      });
      // Optionally reset password fields after successful submission
      const form = document.getElementById('profile-form') as HTMLFormElement;
      if(form) {
        const passwordInput = form.elements.namedItem('password') as HTMLInputElement;
        const confirmPasswordInput = form.elements.namedItem('confirmPassword') as HTMLInputElement;
        if(passwordInput) passwordInput.value = '';
        if(confirmPasswordInput) confirmPasswordInput.value = '';
      }
    }
  }, [state, toast]);
  
  return (
    <form id="profile-form" action={formAction}>
        <Card>
            <CardHeader>
            <CardTitle>Edit Profile</CardTitle>
            <CardDescription>Update your name and password.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="name">Name</Label>
                    <Input id="name" name="name" defaultValue={user.name} required />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" name="email" type="email" value={user.email} disabled />
                    <p className="text-sm text-muted-foreground">Email address cannot be changed.</p>
                </div>
                 <div className="space-y-2">
                    <Label htmlFor="password">New Password</Label>
                    <Input id="password" name="password" type="password" placeholder="Leave blank to keep current password"/>
                </div>
                 <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirm New Password</Label>
                    <Input id="confirmPassword" name="confirmPassword" type="password" />
                </div>
            </CardContent>
            <CardFooter>
                <SubmitButton />
            </CardFooter>
        </Card>
    </form>
  );
}
