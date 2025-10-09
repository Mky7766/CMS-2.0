
"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Icons } from "@/components/icons";
import { useActionState, useEffect, useState } from "react";
import { useFormStatus } from "react-dom";
import { login, getUsersCount } from "@/app/actions";
import { useToast } from "@/hooks/use-toast";
import LoginForm from "@/components/login-form";

export default function LoginPage() {
  const [userCount, setUserCount] = useState<number | null>(null);

  useEffect(() => {
    async function fetchUserCount() {
      const count = await getUsersCount();
      setUserCount(count);
    }
    // Only check for users if we're not in a setup flow.
    if (process.env.POSTGRES_URL) {
      fetchUserCount();
    } else {
      setUserCount(0); // Assume no users if DB is not configured, to show setup/signup link.
    }
  }, []);
  
  const showSignup = userCount === 0;

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
            <div className="mb-4 flex justify-center">
              <Icons.logo className="h-10 w-10 text-primary" />
            </div>
            <CardTitle className="text-2xl">Welcome to Vinee CMS</CardTitle>
            <CardDescription>
                {userCount === null ? "Loading..." : showSignup 
                    ? "Create the first admin account to get started." 
                    : "Enter your credentials to access your dashboard"
                }
            </CardDescription>
        </CardHeader>
        {userCount !== null && <LoginForm showSignupLink={showSignup} />}
      </Card>
    </div>
  );
}
