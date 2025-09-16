
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PlusCircle } from "lucide-react";

export default function NewMenuPage() {
  return (
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
                        <Input id="menu-name" name="menu-name" placeholder="e.g., Main Navigation" />
                    </CardContent>
                </Card>
                <Card className="mt-8">
                    <CardHeader>
                        <CardTitle>Menu Structure</CardTitle>
                        <CardDescription>Add and arrange menu items.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {/* Placeholder for menu item editor */}
                        <div className="text-center py-12 border-2 border-dashed rounded-lg">
                            <p className="text-muted-foreground">Menu item editor coming soon.</p>
                            <Button variant="outline" className="mt-4">
                                <PlusCircle className="mr-2 h-4 w-4" />
                                Add Menu Item
                            </Button>
                        </div>
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
                         <Button className="w-full">Save Menu</Button>
                    </CardFooter>
                </Card>
            </div>
        </div>
    </div>
  );
}
