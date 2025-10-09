
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Icons } from "@/components/icons";
import SetupForm from "@/components/setup-form";
import { redirect } from "next/navigation";

export default function SetupPage() {
    // If the database URL is already set, redirect away from setup
    if (process.env.POSTGRES_URL) {
        redirect('/login');
    }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
            <div className="mb-4 flex justify-center">
              <Icons.logo className="h-10 w-10 text-primary" />
            </div>
            <CardTitle className="text-2xl">Welcome to Vinee CMS Setup</CardTitle>
            <CardDescription>
                Please provide your Supabase database connection string to get started.
            </CardDescription>
        </CardHeader>
        <CardContent>
            <SetupForm />
        </CardContent>
      </Card>
    </div>
  );
}
