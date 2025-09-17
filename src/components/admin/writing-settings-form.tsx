
"use client";

import { useActionState, useEffect } from "react";
import { useFormStatus } from "react-dom";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { updateSettings } from "@/app/actions";
import { SiteSettings, Category } from "@/lib/data";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? "Saving..." : "Save Settings"}
    </Button>
  );
}

type WritingSettingsFormProps = {
    settings: SiteSettings;
    categories: Category[];
}

export default function WritingSettingsForm({ settings, categories }: WritingSettingsFormProps) {
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
                <CardTitle>Writing Settings</CardTitle>
                <CardDescription>Set defaults for creating new content.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="space-y-2">
                    <Label>Default Post Category</Label>
                    <p className="text-sm text-muted-foreground">The category assigned to new posts by default.</p>
                    <Select name="default-category-id" defaultValue={settings.defaultPostCategoryId || "uncategorized"}>
                        <SelectTrigger>
                            <SelectValue placeholder="Select a category" />
                        </SelectTrigger>
                        <SelectContent>
                            {categories.map((category) => (
                                <SelectItem key={category.id} value={category.id}>{category.name}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
                 <div className="space-y-2">
                    <Label>Default Post Format</Label>
                    <p className="text-sm text-muted-foreground">The content format for new posts.</p>
                    <Select name="default-post-format" defaultValue={settings.defaultPostFormat || 'standard'}>
                        <SelectTrigger>
                            <SelectValue placeholder="Select a format" />
                        </SelectTrigger>
                        <SelectContent>
                             <SelectItem value="standard">Standard</SelectItem>
                             {/* Other formats could be added here in the future */}
                        </SelectContent>
                    </Select>
                </div>
            </CardContent>
            <CardFooter>
                <SubmitButton />
            </CardFooter>
        </Card>
    </form>
  );
}
