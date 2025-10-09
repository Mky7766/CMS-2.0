
"use client";

import { useActionState, useEffect } from "react";
import { useFormStatus } from "react-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { saveDatabaseUrl } from "@/app/actions";
import { useToast } from "@/hooks/use-toast";
import Link from "next/link";
import { Alert, AlertDescription, AlertTitle } from "./ui/alert";
import { Terminal } from "lucide-react";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" className="w-full" disabled={pending}>
      {pending ? "Saving..." : "Save and Continue"}
    </Button>
  );
}

export default function SetupForm() {
  const [state, formAction] = useActionState(saveDatabaseUrl, undefined);
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
      <div className="grid gap-4">
        <div className="grid gap-2">
          <Label htmlFor="db-url">Supabase Connection String</Label>
          <Input 
            id="db-url" 
            name="db-url" 
            type="text" 
            placeholder="postgres://..." 
            required 
          />
           <p className="text-xs text-muted-foreground">
            Find this in your Supabase project under Settings &gt; Database &gt; Connection string (URI tab).
          </p>
        </div>
        <SubmitButton />
        <Alert>
            <Terminal className="h-4 w-4" />
            <AlertTitle>Important!</AlertTitle>
            <AlertDescription>
                After submitting, you must manually restart the development server for the changes to take effect.
            </AlertDescription>
        </Alert>
      </div>
    </form>
  );
}

    