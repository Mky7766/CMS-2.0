
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
                <CardTitle>SEO & Code</CardTitle>
                <CardDescription>Manage settings for SEO and custom code injection.</CardDescription>
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
                 <div className="space-y-2">
                    <Label htmlFor="custom-head-code">Custom Code in &lt;head&gt;</Label>
                     <p className="text-sm text-muted-foreground">
                        Add custom scripts, meta tags, or styles to the &lt;head&gt; section of your site.
                    </p>
                    <Textarea 
                        id="custom-head-code" 
                        name="custom-head-code" 
                        defaultValue={settings.customHeadCode} 
                        rows={8}
                        placeholder="<style>...</style> or <script>...</script>"
                        className="font-mono text-sm"
                    />
                </div>
                 <div className="space-y-2">
                    <Label htmlFor="custom-body-code">Custom Code before &lt;/body&gt;</Label>
                     <p className="text-sm text-muted-foreground">
                        Add scripts, like analytics, just before the closing &lt;/body&gt; tag.
                    </p>
                    <Textarea 
                        id="custom-body-code" 
                        name="custom-body-code" 
                        defaultValue={settings.customBodyCode} 
                        rows={8}
                        placeholder="<script>...</script>"
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
