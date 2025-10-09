
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
  const [dbConfigured, setDbConfigured] = useState(true);

  useEffect(() => {
    async function fetchUserCount() {
        const count = await getUsersCount();
        if (count === -1) { // Special value to indicate DB not configured
            setDbConfigured(false);
            setUserCount(0);
        } else {
            setDbConfigured(true);
            setUserCount(count);
        }
    }
    fetchUserCount();
  }, []);
  
  const showSignup = userCount === 0 && dbConfigured;

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
                    : !dbConfigured
                    ? "Database is not configured yet."
                    : "Enter your credentials to access your dashboard"
                }
            </CardDescription>
        </CardHeader>
        {userCount !== null && dbConfigured && <LoginForm showSignupLink={showSignup} />}
        {userCount !== null && !dbConfigured && (
            <CardFooter>
                 <Button asChild className="w-full">
                    <Link href="/setup">Go to Setup</Link>
                </Button>
            </CardFooter>
        )}
      </Card>
    </div>
  );
}
