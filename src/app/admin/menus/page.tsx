
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Menu } from "@/lib/data";
import fs from 'fs/promises';
import path from 'path';
import { MoreHorizontal, PlusCircle } from "lucide-react";
import Link from "next/link";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

async function getMenus(): Promise<Menu[]> {
    const filePath = path.join(process.cwd(), 'src', 'lib', 'menus.json');
    try {
        const data = await fs.readFile(filePath, 'utf-8');
        return JSON.parse(data) as Menu[];
    } catch (error) {
        // If file doesn't exist, return empty array
        return [];
    }
}


export default async function MenusPage() {
  const menus = await getMenus();

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
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button aria-haspopup="true" size="icon" variant="ghost">
                                            <MoreHorizontal className="h-4 w-4" />
                                            <span className="sr-only">Toggle menu</span>
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                        <DropdownMenuItem>Edit</DropdownMenuItem>
                                        <DropdownMenuItem className="text-red-500">Delete</DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
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
