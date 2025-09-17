
"use client";

import { useActionState, useEffect } from "react";
import { useFormStatus } from "react-dom";
import Image from "next/image";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { updateSettings } from "@/app/actions";
import { SiteSettings } from "@/lib/settings";
import { CheckCircle, Code } from "lucide-react";


const templates = [
  {
    id: "grid",
    name: "Simple Grid",
    description: "A clean, modern grid layout for your posts.",
    imageUrl: "https://picsum.photos/seed/grid/600/400",
  },
  {
    id: "grid-sidebar",
    name: "Grid with Sidebar",
    description: "A grid layout with a right sidebar for recent posts.",
    imageUrl: "https://picsum.photos/seed/grid-sidebar/600/400",
  },
  {
    id: "list",
    name: "List Layout",
    description: "A classic top-to-bottom list of your blog posts.",
    imageUrl: "https://picsum.photos/seed/list/600/400",
  },
];


function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? "Saving..." : "Save Template"}
    </Button>
  );
}

export default function TemplatesClientPage({ settings }: { settings: SiteSettings }) {
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
    <div className="space-y-8">
       <div>
        <h1 className="text-3xl font-bold tracking-tight">Blog Templates</h1>
        <p className="text-muted-foreground">Choose a layout for your blog's homepage.</p>
      </div>
      <form action={formAction} className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {templates.map((template) => (
            <div key={template.id}>
              <input 
                type="radio" 
                id={template.id} 
                name="blog-template" 
                value={template.id} 
                defaultChecked={settings.blogTemplate === template.id} 
                className="sr-only peer"
              />
              <Label 
                htmlFor={template.id} 
                className="block cursor-pointer"
              >
                <Card className="relative overflow-hidden ring-2 ring-transparent peer-checked:ring-primary transition-all">
                   <div className="absolute top-2 right-2 z-10 h-6 w-6 rounded-full bg-primary text-primary-foreground items-center justify-center hidden peer-checked:flex">
                     <CheckCircle className="h-4 w-4" />
                   </div>
                   <Image
                      src={template.imageUrl}
                      alt={template.name}
                      width={600}
                      height={400}
                      className="w-full object-cover aspect-video"
                    />
                  <CardHeader>
                    <CardTitle>{template.name}</CardTitle>
                    <CardDescription>{template.description}</CardDescription>
                  </CardHeader>
                  <CardFooter>
                      <Button variant="outline" size="sm" onClick={(e) => { e.preventDefault(); alert('To edit this template, ask the AI assistant to "edit the grid-template.tsx file"'); }}>
                        <Code className="mr-2 h-4 w-4" />
                        Edit Code
                      </Button>
                  </CardFooter>
                </Card>
              </Label>
            </div>
          ))}
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Save Selection</CardTitle>
            <CardDescription>
                Your new blog layout will be applied immediately.
            </CardDescription>
          </CardHeader>
          <CardFooter>
            <SubmitButton />
          </CardFooter>
        </Card>
      </form>
    </div>
  );
}
