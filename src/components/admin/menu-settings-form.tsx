
"use client";

import { useActionState, useEffect } from "react";
import { useFormStatus } from "react-dom";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { updateSettings } from "@/app/actions";
import { SiteSettings } from "@/lib/settings";
import { Menu } from "@/lib/data";
import Link from "next/link";
import { PlusCircle } from "lucide-react";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? "Saving..." : "Save Settings"}
    </Button>
  );
}

type MenuSettingsFormProps = {
    settings: SiteSettings;
    menus: Menu[];
}

export default function MenuSettingsForm({ settings, menus }: MenuSettingsFormProps) {
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
                <CardTitle>Menu Settings</CardTitle>
                <CardDescription>Assign menus to locations in your theme.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="space-y-2">
                    <Label>Header Menu</Label>
                     <p className="text-sm text-muted-foreground">The main navigation for your site.</p>
                    <Select name="header-menu-id" defaultValue={settings.headerMenuId}>
                        <SelectTrigger>
                            <SelectValue placeholder="Select a menu" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="none">None</SelectItem>
                            {menus.map((menu) => (
                                <SelectItem key={menu.id} value={menu.id}>{menu.name}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
                 <div className="space-y-2">
                    <Label>Footer Menu</Label>
                    <p className="text-sm text-muted-foreground">The navigation for your site's footer.</p>
                    <Select name="footer-menu-id" defaultValue={settings.footerMenuId} disabled>
                        <SelectTrigger>
                            <SelectValue placeholder="Select a menu" />
                        </SelectTrigger>
                        <SelectContent>
                             <SelectItem value="none">None</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                 <div>
                    <p className="text-sm text-muted-foreground mb-2">Need to create or edit a menu?</p>
                    <Button variant="outline" asChild>
                        <Link href="/admin/menus">
                            <PlusCircle className="mr-2 h-4 w-4" />
                            Go to Menu Editor
                        </Link>
                    </Button>
                </div>
            </CardContent>
            <CardFooter>
                <SubmitButton />
            </CardFooter>
        </Card>
    </form>
  );
}
