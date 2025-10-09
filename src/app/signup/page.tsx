
'use server'

import SignupForm from '@/components/signup-form';
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Icons } from "@/components/icons";
import { getUsersCount } from '@/app/actions';
import { redirect } from 'next/navigation';

export default async function SignupPage() {
  const userCount = await getUsersCount();
  
  if (userCount > 0) {
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
