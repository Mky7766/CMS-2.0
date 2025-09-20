
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
import { Textarea } from "../ui/textarea";

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
            <CardDescription>Update your name, bio, and social links.</CardDescription>
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
                    <Label htmlFor="bio">Biographical Info</Label>
                    <Textarea 
                        id="bio"
                        name="bio"
                        defaultValue={user.bio}
                        placeholder="Share a little about yourself."
                        rows={5}
                        maxLength={700}
                    />
                     <p className="text-sm text-muted-foreground">A brief bio (around 120 words). Displayed on your author profile.</p>
                </div>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="website">Website URL</Label>
                        <Input id="website" name="website" defaultValue={user.website} placeholder="https://example.com" />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="twitter">Twitter Profile URL</Label>
                        <Input id="twitter" name="twitter" defaultValue={user.twitter} placeholder="https://twitter.com/username" />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="linkedin">LinkedIn Profile URL</Label>
                        <Input id="linkedin" name="linkedin" defaultValue={user.linkedin} placeholder="https://linkedin.com/in/username" />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="github">GitHub Profile URL</Label>
                        <Input id="github" name="github" defaultValue={user.github} placeholder="https://github.com/username" />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="facebook">Facebook Profile URL</Label>
                        <Input id="facebook" name="facebook" defaultValue={user.facebook} placeholder="https://facebook.com/username" />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="instagram">Instagram Profile URL</Label>
                        <Input id="instagram" name="instagram" defaultValue={user.instagram} placeholder="https://instagram.com/username" />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="youtube">YouTube Channel URL</Label>
                        <Input id="youtube" name="youtube" defaultValue={user.youtube} placeholder="https://youtube.com/c/channelname" />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="whatsapp">WhatsApp Link</Label>
                        <Input id="whatsapp" name="whatsapp" defaultValue={user.whatsapp} placeholder="https://wa.me/1234567890" />
                    </div>
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
