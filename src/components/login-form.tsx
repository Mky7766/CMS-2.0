
"use client";

import Link from "next/link";
import { useActionState, useEffect, useState } from "react";
import { useFormStatus } from "react-dom";
import { Button } from "@/components/ui/button";
import { CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Icons } from "@/components/icons";
import { login } from "@/app/actions";
import { useToast } from "@/hooks/use-toast";
import { SiteSettings } from "@/lib/data";
import { getFirebaseApp, signInWithGoogle } from "@/lib/firebase";

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
  const [firebaseConfigured, setFirebaseConfigured] = useState(false);

  useEffect(() => {
    async function checkFirebase() {
        const app = await getFirebaseApp();
        setFirebaseConfigured(!!app);
    }
    checkFirebase();

    if (state?.error) {
      toast({
        title: "Login Failed",
        description: state.error,
        variant: "destructive",
      });
    }
  }, [state, toast]);

  const handleGoogleSignIn = async () => {
    try {
        const user = await signInWithGoogle();
        if (user) {
            // Here you would typically call a server action to find or create
            // a user in your CMS's user database and create a session.
            // For now, we'll just show a toast.
            toast({
                title: "Google Sign-In Successful",
                description: `Welcome, ${user.displayName}! (Backend integration needed)`,
            });
            // Example: await yourServerActionForSocialLogin(user.email, user.displayName);
        }
    } catch (error) {
        console.error("Google Sign-In Error:", error);
        toast({
            title: "Google Sign-In Failed",
            description: "Could not sign in with Google. Please try again.",
            variant: "destructive",
        });
    }
};

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
          {firebaseConfigured && (
             <>
                <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                        <span className="w-full border-t" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                        <span className="bg-background px-2 text-muted-foreground">
                        Or continue with
                        </span>
                    </div>
                </div>
                 <Button variant="outline" type="button" onClick={handleGoogleSignIn}>
                    <Icons.google className="mr-2 h-4 w-4" />
                    Google
                </Button>
            </>
          )}
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
