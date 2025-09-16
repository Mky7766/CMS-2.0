
"use client";

import { useActionState, useEffect, useState } from "react";
import { useFormStatus } from "react-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PlusCircle, Trash2 } from "lucide-react";
import { saveMenu } from "@/app/actions";
import { useToast } from "@/hooks/use-toast";

type MenuItem = {
  id: number;
  label: string;
  url: string;
};

function SubmitButton() {
    const { pending } = useFormStatus();
    return (
      <Button className="w-full" type="submit" disabled={pending}>
        {pending ? "Saving..." : "Save Menu"}
      </Button>
    );
}

export default function NewMenuPage() {
  const [menuName, setMenuName] = useState("");
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const { toast } = useToast();
  
  const [state, formAction] = useActionState(saveMenu, null);

  useEffect(() => {
    if (state?.error) {
      toast({
        title: "Error",
        description: state.error,
        variant: "destructive",
      });
    }
  }, [state, toast]);


  const addMenuItem = () => {
    setMenuItems([...menuItems, { id: Date.now(), label: "", url: "" }]);
  };

  const removeMenuItem = (id: number) => {
    setMenuItems(menuItems.filter(item => item.id !== id));
  };

  const handleItemChange = (id: number, field: "label" | "url", value: string) => {
    setMenuItems(menuItems.map(item => item.id === id ? { ...item, [field]: value } : item));
  };

  return (
    <form action={formAction}>
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Create New Menu</h1>
                <p className="text-muted-foreground">Define the name and structure of your new menu.</p>
            </div>
            <div className="grid gap-8 lg:grid-cols-3">
                <div className="lg:col-span-2">
                    <Card>
                        <CardHeader>
                            <CardTitle>Menu Name</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <Label htmlFor="menu-name">Name</Label>
                            <Input 
                              id="menu-name" 
                              name="menu-name" 
                              placeholder="e.g., Main Navigation"
                              value={menuName}
                              onChange={(e) => setMenuName(e.target.value)}
                              required
                            />
                        </CardContent>
                    </Card>
                    <Card className="mt-8">
                        <CardHeader>
                            <CardTitle>Menu Structure</CardTitle>
                            <CardDescription>Add and arrange menu items.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {menuItems.length > 0 ? (
                                menuItems.map((item, index) => (
                                    <div key={item.id} className="flex items-end gap-4 p-4 border rounded-lg">
                                        <div className="grid gap-2 flex-1">
                                            <Label htmlFor={`item-label-${index}`}>Label</Label>
                                            <Input 
                                                id={`item-label-${index}`} 
                                                name="item-labels"
                                                placeholder="e.g., Home"
                                                value={item.label}
                                                onChange={(e) => handleItemChange(item.id, 'label', e.target.value)}
                                            />
                                        </div>
                                        <div className="grid gap-2 flex-1">
                                            <Label htmlFor={`item-url-${index}`}>URL</Label>
                                            <Input 
                                                id={`item-url-${index}`}
                                                name="item-urls" 
                                                placeholder="e.g., /"
                                                value={item.url}
                                                onChange={(e) => handleItemChange(item.id, 'url', e.target.value)}
                                            />
                                        </div>
                                        <Button variant="ghost" size="icon" type="button" onClick={() => removeMenuItem(item.id)}>
                                            <Trash2 className="h-4 w-4 text-red-500" />
                                            <span className="sr-only">Remove Item</span>
                                        </Button>
                                    </div>
                                ))
                            ) : (
                                <div className="text-center py-12 border-2 border-dashed rounded-lg">
                                    <p className="text-muted-foreground">No menu items yet. Add one to get started.</p>
                                </div>
                            )}
                            <Button variant="outline" className="mt-4" type="button" onClick={addMenuItem}>
                                <PlusCircle className="mr-2 h-4 w-4" />
                                Add Menu Item
                            </Button>
                        </CardContent>
                    </Card>
                </div>
                <div className="lg:col-span-1">
                    <Card>
                        <CardHeader>
                            <CardTitle>Publish</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-muted-foreground">
                                Once you save the menu, you can assign it to a location in your theme settings.
                            </p>
                        </CardContent>
                        <CardFooter>
                            <SubmitButton />
                        </CardFooter>
                    </Card>
                </div>
            </div>
        </div>
    </form>
  );
}
