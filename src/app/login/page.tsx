
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Icons } from "@/components/icons";
import { users } from "@/lib/data";
import LoginForm from "@/components/login-form";
import fs from 'fs/promises';
import path from 'path';
import { redirect } from 'next/navigation';

async function getUsers() {
    if (!process.env.POSTGRES_URL) {
        // If there's no DB connection, we assume we might need to set one up,
        // or we're running locally with JSON files.
        try {
            const filePath = path.join(process.cwd(), 'src', 'lib', 'users.json');
            const data = await fs.readFile(filePath, 'utf-8');
            return JSON.parse(data);
        } catch (error) {
            return []; // No users file, implies first run.
        }
    }
    // If POSTGRES_URL is set, we assume the DB is the source of truth,
    // and we don't need to check for the first user from the JSON file.
    // The login form will handle DB authentication.
    return [{id: 'db-user'}]; // Return a placeholder to indicate DB is used.
}

export default async function LoginPage() {
  if (!process.env.POSTGRES_URL) {
      redirect('/setup');
  }

  const allUsers = await getUsers();
  const showSignup = allUsers.length === 0;

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
            <div className="mb-4 flex justify-center">
              <Icons.logo className="h-10 w-10 text-primary" />
            </div>
            <CardTitle className="text-2xl">Welcome to Vinee CMS</CardTitle>
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

    