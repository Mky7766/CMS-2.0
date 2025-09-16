
"use client";

import { useActionState, useEffect } from "react";
import { useFormStatus } from "react-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { createUser, adminUpdateUser } from "@/app/actions";
import { useToast } from "@/hooks/use-toast";
import type { User } from "@/lib/data";

function SubmitButton({ isUpdate }: { isUpdate?: boolean }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? (isUpdate ? "Saving..." : "Creating...") : (isUpdate ? "Save Changes" : "Create User")}
    </Button>
  );
}

type UserFormProps = {
    user?: User;
}

export default function UserForm({ user }: UserFormProps) {
  const action = user ? adminUpdateUser : createUser;
  const [state, formAction] = useActionState(action, null);
  const { toast } = useToast();

  useEffect(() => {
    if (state?.error) {
      toast({
        title: "Error",
        description: state.error,
        variant: "destructive",
      });
    }
  }, [state, toast]);

  return (
    <form action={formAction}>
        {user && <input type="hidden" name="userId" value={user.id} />}
        <Card className="max-w-2xl mx-auto">
            <CardHeader>
                <CardTitle>{user ? "Edit User Details" : "New User Details"}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="name">Name</Label>
                        <Input id="name" name="name" defaultValue={user?.name} required />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input id="email" name="email" type="email" defaultValue={user?.email} required disabled={!!user} />
                        {user && <p className="text-xs text-muted-foreground">Email cannot be changed.</p>}
                    </div>
                </div>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="role">Role</Label>
                        <Select name="role" defaultValue={user?.role || 'Author'}>
                            <SelectTrigger>
                                <SelectValue placeholder="Select a role" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="Author">Author</SelectItem>
                                <SelectItem value="Editor">Editor</SelectItem>
                                <SelectItem value="Admin">Admin</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    {!user && (
                        <div className="space-y-2">
                            <Label htmlFor="password">Password</Label>
                            <Input id="password" name="password" type="password" required />
                        </div>
                    )}
                </div>
            </CardContent>
            <CardFooter className="flex justify-between">
                <Button variant="outline" type="button" onClick={() => window.history.back()}>Cancel</Button>
                <SubmitButton isUpdate={!!user} />
            </CardFooter>
        </Card>
    </form>
  );
}
