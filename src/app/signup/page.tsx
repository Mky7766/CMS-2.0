
import { redirect } from 'next/navigation';
import { users } from '@/lib/data';
import SignupForm from '@/components/signup-form';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Icons } from "@/components/icons";
import Link from 'next/link';

export default function SignupPage() {
  // If users already exist, redirect to login page.
  if (users.length > 0) {
    redirect('/login');
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
            <div className="mb-4 flex justify-center">
              <Icons.logo className="h-10 w-10 text-primary" />
            </div>
            <CardTitle className="text-2xl">Create an account</CardTitle>
            <CardDescription>Enter your details to create the first admin account.</CardDescription>
        </CardHeader>
        <SignupForm />
      </Card>
    </div>
  );
}
