
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Icons } from "@/components/icons";
import { users } from "@/lib/data";
import LoginForm from "@/components/login-form";

export default function LoginPage() {
  const showSignup = users.length === 0;

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
            <div className="mb-4 flex justify-center">
              <Icons.logo className="h-10 w-10 text-primary" />
            </div>
            <CardTitle className="text-2xl">Welcome to Nebula CMS</CardTitle>
            <CardDescription>
                {showSignup 
                    ? "Create the first admin account to get started." 
                    : "Enter your credentials to access your dashboard"
                }
            </CardDescription>
        </CardHeader>
        <LoginForm showSignupLink={showSignup} />
      </Card>
    </div>
  );
}
