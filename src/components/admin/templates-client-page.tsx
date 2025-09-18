

"use client";

import { useActionState, useEffect, useState, useTransition } from "react";
import { useFormStatus } from "react-dom";
import Image from "next/image";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { updateSettings, deleteTemplate, getTemplates, getSettings } from "@/app/actions";
import type { SiteSettings, Template } from "@/lib/data";
import { CheckCircle, Code, PlusCircle, Trash2, Loader } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";


function ActivateButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending} size="sm">
      {pending ? "Activating..." : "Activate"}
    </Button>
  );
}

function DeactivateButton() {
    const { pending } = useFormStatus();
    return (
        <Button type="submit" disabled={pending} size="sm" variant="outline">
            {pending ? "Deactivating..." : "Deactivate"}
        </Button>
    )
}

export default function TemplatesClientPage() {
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [templates, setTemplates] = useState<Template[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [state, formAction] = useActionState(updateSettings, null);
  const { toast } = useToast();

  const [templateToDelete, setTemplateToDelete] = useState<Template | null>(null);
  const [isDeleting, startDeleteTransition] = useTransition();
  const [isCreateInfoDialogOpen, setIsCreateInfoDialogOpen] = useState(false);

  useEffect(() => {
    async function loadData() {
        setIsLoading(true);
        const [settingsData, templatesData] = await Promise.all([
            getSettings(),
            getTemplates()
        ]);
        setSettings(settingsData);
        setTemplates(templatesData);
        setIsLoading(false);
    }
    loadData();
  }, [state]);


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

  const handleDeleteTemplate = async () => {
    if (!templateToDelete) return;
    
    startDeleteTransition(async () => {
      const result = await deleteTemplate(templateToDelete.id);
      if (result.success) {
        setTemplates(currentTemplates => currentTemplates.filter(t => t.id !== templateToDelete.id));
        toast({ title: "Success", description: result.success });
      } else {
        toast({ title: "Error", description: result.error, variant: "destructive" });
      }
      setTemplateToDelete(null);
    });
  }

  if (isLoading || !settings) {
    return (
        <div className="space-y-8">
             <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Blog Templates</h1>
                    <p className="text-muted-foreground">Choose a layout for your blog's homepage.</p>
                </div>
                <Button disabled>
                    <Loader className="mr-2 h-4 w-4 animate-spin" />
                    Loading...
                </Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {Array.from({length: 3}).map((_, i) => (
                    <Card key={i}>
                        <div className="w-full bg-muted animate-pulse aspect-video" />
                        <CardHeader>
                            <div className="h-6 w-1/2 bg-muted animate-pulse rounded-md" />
                            <div className="h-4 w-full bg-muted animate-pulse rounded-md mt-2" />
                        </CardHeader>
                         <CardFooter className="flex justify-between items-center">
                            <div className="h-8 w-24 bg-muted animate-pulse rounded-md" />
                             <div className="h-8 w-24 bg-muted animate-pulse rounded-md" />
                         </CardFooter>
                    </Card>
                ))}
            </div>
        </div>
    )
  }

  return (
    <>
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Blog Templates</h1>
            <p className="text-muted-foreground">Choose a layout for your blog's homepage.</p>
          </div>
          <Button onClick={() => setIsCreateInfoDialogOpen(true)}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Create New Template
          </Button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {templates.map((template) => {
            const isActive = settings.blogTemplate === template.id;
            return (
              <Card key={template.id} className={`relative overflow-hidden ${isActive ? 'ring-2 ring-primary' : ''}`}>
                {isActive && (
                  <div className="absolute top-2 right-2 z-10 h-6 w-6 rounded-full bg-primary text-primary-foreground items-center justify-center flex">
                    <CheckCircle className="h-4 w-4" />
                  </div>
                )}
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
                <CardFooter className="flex justify-between items-center">
                    <div>
                         <Button variant="ghost" size="sm" className="text-red-500 hover:text-red-600" onClick={() => setTemplateToDelete(template)}>
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                        </Button>
                    </div>
                    {isActive ? (
                        <form action={formAction}>
                            <input type="hidden" name="blog-template" value="grid" />
                            <DeactivateButton />
                        </form>
                    ) : (
                        <form action={formAction}>
                            <input type="hidden" name="blog-template" value={template.id} />
                            <ActivateButton />
                        </form>
                    )}
                </CardFooter>
              </Card>
            )
          })}
        </div>
      </div>
      {templateToDelete && (
        <AlertDialog open={!!templateToDelete} onOpenChange={() => setTemplateToDelete(null)}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Are you sure you want to delete this template?</AlertDialogTitle>
                    <AlertDialogDescription>
                        This action cannot be undone. This will permanently delete the &quot;{templateToDelete.name}&quot; template.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction 
                      onClick={handleDeleteTemplate} 
                      disabled={isDeleting}
                      className="bg-red-600 hover:bg-red-700"
                    >
                      {isDeleting ? "Deleting..." : "Delete"}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
      )}

       <AlertDialog open={isCreateInfoDialogOpen} onOpenChange={setIsCreateInfoDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>How to Create a New Template</AlertDialogTitle>
            <AlertDialogDescription>
              To create a new custom template, please ask the AI assistant to do it for you. Describe the layout you want, for example:
              <br /><br />
              <em className="text-foreground">&quot;Create a new blog template called 'Featured Post' that shows the latest post in a large hero section and the rest in a grid below.&quot;</em>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction onClick={() => setIsCreateInfoDialogOpen(false)}>
              Understood
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
