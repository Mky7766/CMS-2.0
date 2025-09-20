
"use client";

import { useActionState, useEffect } from "react";
import { useFormStatus } from "react-dom";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { updateSettings } from "@/app/actions";
import { SiteSettings } from "@/lib/data";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? "Saving..." : "Save Firebase Config"}
    </Button>
  );
}

type FirebaseSettingsFormProps = {
    settings: SiteSettings;
}

export default function FirebaseSettingsForm({ settings }: FirebaseSettingsFormProps) {
  const [state, formAction] = useActionState(updateSettings, null);
  const { toast } = useToast();

  useEffect(() => {
    if (state?.error) {
      toast({ title: "Error", description: state.error, variant: "destructive" });
    }
    if (state?.success) {
      toast({ title: "Success", description: state.success });
    }
  }, [state, toast]);
  
  return (
    <form action={formAction}>
        <Card>
            <CardHeader>
                <CardTitle>Firebase Integration</CardTitle>
                <CardDescription>
                    Connect your Firebase project to enable features like Google Sign-In. 
                    You can find these values in your Firebase project settings.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="firebase-apiKey">API Key</Label>
                        <Input id="firebase-apiKey" name="firebase-apiKey" defaultValue={settings.firebaseConfig?.apiKey} />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="firebase-authDomain">Auth Domain</Label>
                        <Input id="firebase-authDomain" name="firebase-authDomain" defaultValue={settings.firebaseConfig?.authDomain} />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="firebase-projectId">Project ID</Label>
                        <Input id="firebase-projectId" name="firebase-projectId" defaultValue={settings.firebaseConfig?.projectId} />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="firebase-storageBucket">Storage Bucket</Label>
                        <Input id="firebase-storageBucket" name="firebase-storageBucket" defaultValue={settings.firebaseConfig?.storageBucket} />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="firebase-messagingSenderId">Messaging Sender ID</Label>
                        <Input id="firebase-messagingSenderId" name="firebase-messagingSenderId" defaultValue={settings.firebaseConfig?.messagingSenderId} />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="firebase-appId">App ID</Label>
                        <Input id="firebase-appId" name="firebase-appId" defaultValue={settings.firebaseConfig?.appId} />
                    </div>
                </div>
            </CardContent>
            <CardFooter>
                <SubmitButton />
            </CardFooter>
        </Card>
    </form>
  );
}
