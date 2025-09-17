
"use client";

import { useActionState, useEffect, useState } from "react";
import { useFormStatus } from "react-dom";
import Image from "next/image";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { updateSettings } from "@/app/actions";
import { SiteSettings } from "@/lib/data";
import { Textarea } from "../ui/textarea";
import MediaLibraryModal from "./media-library-modal";
import { UploadCloud, Image as ImageIcon } from "lucide-react";

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

export default function GeneralSettingsForm({ settings: initialSettings }: GeneralSettingsFormProps) {
  const [state, formAction] = useActionState(updateSettings, null);
  const { toast } = useToast();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [faviconUrl, setFaviconUrl] = useState(initialSettings.faviconUrl || "");

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

  const handleSelectImage = (imageUrl: string) => {
    setFaviconUrl(imageUrl);
    setIsModalOpen(false);
  }
  
  return (
    <>
    <form action={formAction}>
        <input type="hidden" name="favicon-url" value={faviconUrl} />
        <Card>
            <CardHeader>
            <CardTitle>General Settings</CardTitle>
            <CardDescription>Update your site's basic information.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
            <div className="space-y-2">
                <Label htmlFor="site-name">Site Name</Label>
                <Input id="site-name" name="site-name" defaultValue={initialSettings.siteName} />
            </div>
            <div className="space-y-2">
                <Label htmlFor="tagline">Tagline</Label>
                <Input id="tagline" name="tagline" defaultValue={initialSettings.tagline} />
            </div>
            <div className="space-y-2">
                <Label>Favicon</Label>
                <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-md border flex items-center justify-center bg-muted/50">
                        {faviconUrl ? (
                            <Image src={faviconUrl} alt="Favicon Preview" width={64} height={64} className="object-contain" unoptimized={faviconUrl.startsWith('data:')}/>
                        ) : (
                            <ImageIcon className="w-8 h-8 text-muted-foreground" />
                        )}
                    </div>
                    <Button type="button" variant="outline" onClick={() => setIsModalOpen(true)}>
                        <UploadCloud className="mr-2 h-4 w-4" />
                        Upload Image
                    </Button>
                </div>
            </div>
             <div className="space-y-2">
                <Label htmlFor="footer-text">Footer Text</Label>
                <Textarea 
                    id="footer-text" 
                    name="footer-text" 
                    defaultValue={initialSettings.footerText} 
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
    <MediaLibraryModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSelectImage={handleSelectImage}
    />
    </>
  );
}
