"use client"

import { useTransition } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { applyTheme } from "@/app/actions";

export default function ThemeForm() {
    const [isPending, startTransition] = useTransition();
    const { toast } = useToast();

    const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const formData = new FormData(event.currentTarget);
        const customCss = formData.get("custom-css") as string;

        startTransition(async () => {
            const result = await applyTheme(customCss);
            if(result.themeCss) {
                console.log("Applied Theme CSS:\n", result.themeCss);
                toast({
                    title: "Theme Applied",
                    description: "Your custom theme has been processed successfully.",
                });
            } else {
                 toast({
                    title: "Error",
                    description: "Could not apply custom theme.",
                    variant: "destructive",
                });
            }
        });
    }

    return (
        <form onSubmit={handleSubmit}>
            <Card>
                <CardHeader>
                <CardTitle>Appearance</CardTitle>
                <CardDescription>Customize the look and feel of your site.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="custom-css">Custom CSS</Label>
                    <Textarea 
                        id="custom-css"
                        name="custom-css"
                        placeholder="/* Your custom CSS here */"
                        rows={10}
                    />
                    <p className="text-sm text-muted-foreground">
                        Add your own CSS to override the default theme.
                    </p>
                </div>
                <Button type="submit" disabled={isPending}>
                    {isPending ? "Applying..." : "Apply Theme"}
                </Button>
                </CardContent>
            </Card>
        </form>
    )
}
