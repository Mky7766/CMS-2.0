
"use client";

import { useActionState, useEffect } from "react";
import { useFormStatus } from "react-dom";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { updateSettings } from "@/app/actions";
import { SiteSettings } from "@/lib/settings";
import { Textarea } from "../ui/textarea";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? "Saving..." : "Save SEO Settings"}
    </Button>
  );
}

type SEOSettingsFormProps = {
    settings: SiteSettings;
}

export default function SEOSettingsForm({ settings }: SEOSettingsFormProps) {
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
                <CardTitle>SEO Settings</CardTitle>
                <CardDescription>Manage settings for search engine optimization.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="space-y-2">
                    <Label htmlFor="robots-txt">robots.txt</Label>
                    <p className="text-sm text-muted-foreground">
                        Define rules for search engine crawlers.
                    </p>
                    <Textarea 
                        id="robots-txt" 
                        name="robots-txt" 
                        defaultValue={settings.robotsTxt} 
                        rows={8}
                        placeholder="User-agent: *&#10;Allow: /"
                        className="font-mono text-sm"
                    />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="ads-txt">ads.txt</Label>
                     <p className="text-sm text-muted-foreground">
                        Declare your authorized digital sellers.
                    </p>
                    <Textarea 
                        id="ads-txt" 
                        name="ads-txt" 
                        defaultValue={settings.adsTxt} 
                        rows={8}
                        placeholder="google.com, pub-0000000000000000, DIRECT, f08c47fec0942fa0"
                        className="font-mono text-sm"
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
