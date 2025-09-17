
"use client";

import { useActionState, useEffect } from "react";
import { useFormStatus } from "react-dom";
import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { updateSettings } from "@/app/actions";
import { Check } from "lucide-react";

type Template = {
    id: string;
    name: string;
    description: string;
    imageUrl: string;
}

function SubmitButton() {
    const { pending } = useFormStatus();
    return (
        <Button type="submit" disabled={pending} className="mt-6">
            {pending ? "Saving..." : "Save Template"}
        </Button>
    )
}

type TemplateSelectionFormProps = {
    currentTemplate: string;
    templates: Template[];
}

export default function TemplateSelectionForm({ currentTemplate, templates }: TemplateSelectionFormProps) {
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
            <RadioGroup name="blog-template" defaultValue={currentTemplate}>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {templates.map((template) => (
                         <Label 
                            key={template.id} 
                            htmlFor={template.id} 
                            className="block cursor-pointer"
                        >
                            <Card className={cn(
                                "relative overflow-hidden transition-all",
                                "has-[input:checked]:border-primary has-[input:checked]:ring-2 has-[input:checked]:ring-primary"
                            )}>
                                 <RadioGroupItem value={template.id} id={template.id} className="sr-only" />
                                 {currentTemplate === template.id && (
                                     <div className="absolute top-2 right-2 z-10 flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground">
                                        <Check className="h-4 w-4" />
                                    </div>
                                 )}
                                <CardContent className="p-0">
                                   <div className="aspect-video w-full bg-muted flex items-center justify-center">
                                       <span className="text-muted-foreground text-sm">Image coming soon</span>
                                   </div>
                                    <div className="p-4">
                                        <h3 className="font-semibold text-lg">{template.name}</h3>
                                        <p className="text-sm text-muted-foreground mt-1">{template.description}</p>
                                    </div>
                                </CardContent>
                            </Card>
                         </Label>
                    ))}
                </div>
                <SubmitButton />
            </RadioGroup>
        </form>
    );
}

