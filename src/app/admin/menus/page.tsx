
"use client"

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Menu } from "@/lib/data";
import { PlusCircle } from "lucide-react";
import Link from "next/link";
import { useState, useEffect } from "react";
import MenuActions from "@/components/admin/menu-actions";
import { getMenus } from "@/app/actions";


export default function MenusPage() {
  const [menus, setMenus] = useState<Menu[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Initial load
  useEffect(() => {
    async function loadMenus() {
      setIsLoading(true);
      const menusData = await getMenus();
      setMenus(menusData);
      setIsLoading(false);
    }
    loadMenus();
  }, [])
  
  const handleMenuDeleted = (menuId: string) => {
    setMenus(prevMenus => prevMenus.filter(m => m.id !== menuId));
  }

  if (isLoading) {
    return <div>Loading menus...</div>
  }

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
          {menus.length > 0 ? (
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Menu Name</TableHead>
                        <TableHead>Items</TableHead>
                        <TableHead>
                            <span className="sr-only">Actions</span>
                        </TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {menus.map((menu) => (
                        <TableRow key={menu.id}>
                            <TableCell className="font-medium">{menu.name}</TableCell>
                            <TableCell>{menu.items.length}</TableCell>
                            <TableCell className="text-right">
                                <MenuActions menuId={menu.id} onMenuDeleted={handleMenuDeleted} />
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              <p>You haven't created any menus yet.</p>
              <Button variant="link" className="mt-2" asChild>
                <Link href="/admin/menus/new">Create your first menu</Link>
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
