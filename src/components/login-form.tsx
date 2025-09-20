
"use client";

import Link from "next/link";
import { useActionState, useEffect } from "react";
import { useFormStatus } from "react-dom";
import { Button } from "@/components/ui/button";
import { CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Icons } from "@/components/icons";
import { login } from "@/app/actions";
import { useToast } from "@/hooks/use-toast";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" className="w-full" disabled={pending}>
      {pending ? 'Signing In...' : 'Sign In'}
    </Button>
  );
}

export default function LoginForm({ showSignupLink }: { showSignupLink: boolean }) {
  const [state, formAction] = useActionState(login, undefined);
  const { toast } = useToast();

  useEffect(() => {
    if (state?.error) {
      toast({
        title: "Login Failed",
        description: state.error,
        variant: "destructive",
      });
    }
  }, [state, toast]);

  return (
    <form action={formAction}>
      <CardContent>
        <div className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" name="email" type="email" placeholder="name@example.com" required />
          </div>
          <div className="grid gap-2">
            <div className="flex items-center">
              <Label htmlFor="password">Password</Label>
              <Link href="#" className="ml-auto inline-block text-sm underline">
                Forgot your password?
              </Link>
            </div>
            <Input id="password" name="password" type="password" required />
          </div>
          <SubmitButton />
        </div>
      </CardContent>
      <CardFooter className="justify-center text-sm">
        {showSignupLink && (
            <p>Don&apos;t have an account? <Link href="/signup" className="underline">Sign up</Link></p>
        )}
      </CardFooter>
    </form>
  );
}
