
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PlusCircle } from "lucide-react";
import Link from "next/link";

export default function MenusPage() {
  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Navigation Menus</h1>
          <p className="text-muted-foreground">
            Manage the navigation menus for your site's header and footer.
          </p>
        </div>
        <Button asChild>
          <Link href="/admin/menus/new">
            <PlusCircle className="mr-2 h-4 w-4" />
            Create New Menu
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Existing Menus</CardTitle>
          <CardDescription>
            Edit or delete your existing menus.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12 text-muted-foreground">
            <p>You haven't created any menus yet.</p>
            <Button variant="link" className="mt-2" asChild>
              <Link href="/admin/menus/new">Create your first menu</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
