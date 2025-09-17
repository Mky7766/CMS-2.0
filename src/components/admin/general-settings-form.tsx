
"use client";

import { useActionState, useEffect } from "react";
import { useFormStatus } from "react-dom";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { updateSettings } from "@/app/actions";
import { SiteSettings } from "@/lib/settings";
import { Textarea } from "../ui/textarea";

type Template = {
    id: string;
    name: string;
    description: string;
    imageUrl: string;
}

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? "Saving..." : "Save Settings"}
    </Button>
  );
}

type GeneralSettingsFormProps = {
    settings: SiteSettings;
}

export default function GeneralSettingsForm({ settings }: GeneralSettingsFormProps) {
  const [state, formAction] = useActionState(updateSettings, null);
  const { toast } = useToast();

  useEffect(() => {
    if (state?.error) {
      toast({
        title: "Error",
        description: state.error,
        variant: "destructive",
      });
    }
    if (state?.success) {
      toast({
        title: "Success",
        description: state.success,
      });
    }
  }, [state, toast]);
  
  return (
    <form action={formAction}>
        <Card>
            <CardHeader>
            <CardTitle>General Settings</CardTitle>
            <CardDescription>Update your site's basic information.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
            <div className="space-y-2">
                <Label htmlFor="site-name">Site Name</Label>
                <Input id="site-name" name="site-name" defaultValue={settings.siteName} />
            </div>
            <div className="space-y-2">
                <Label htmlFor="tagline">Tagline</Label>
                <Input id="tagline" name="tagline" defaultValue={settings.tagline} />
            </div>
             <div className="space-y-2">
                <Label htmlFor="footer-text">Footer Text</Label>
                <Textarea 
                    id="footer-text" 
                    name="footer-text" 
                    defaultValue={settings.footerText} 
                    rows={4}
                    placeholder="Enter footer content. You can use HTML."
                />
            </div>
            </CardContent>
             <CardFooter>
                <SubmitButton />
            </CardFooter>
        </Card>
    </form>
  );
}
