
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { PlusCircle } from "lucide-react";
import { getPages } from "@/app/actions";
import PageActions from "@/components/admin/page-actions";

type PageTableProps = {
    pages: Awaited<ReturnType<typeof getPages>>;
}

function PagesTable({ pages }: PageTableProps) {
    if (pages.length === 0) {
        return (
            <div className="text-center text-muted-foreground py-12">
                No pages found.
            </div>
        )
    }

    return (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="hidden md:table-cell">
                Created at
              </TableHead>
              <TableHead>
                <span className="sr-only">Actions</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {pages.map((page) => (
              <TableRow key={page.id}>
                <TableCell className="font-medium">{page.title}</TableCell>
                <TableCell>
                  <Badge variant={page.status.toLowerCase() === 'published' ? 'default' : 'secondary'}>{page.status}</Badge>
                </TableCell>
                <TableCell className="hidden md:table-cell">
                  {page.createdAt}
                </TableCell>
                <TableCell className="text-right">
                    <PageActions pageId={page.id} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
    )
}

export default async function PagesPage() {
  const allPages = await getPages();
  const sortedPages = allPages.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  return (
      <div className="space-y-8">
        <div className="flex items-center justify-between">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Pages</h1>
                <p className="text-muted-foreground">Manage your site's static pages.</p>
            </div>
            <Button size="sm" asChild className="h-8 gap-1">
                <Link href="/admin/pages/new">
                <PlusCircle className="h-3.5 w-3.5" />
                <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                    New Page
                </span>
                </Link>
            </Button>
        </div>
        <Card>
            <CardContent className="pt-6">
                <PagesTable pages={sortedPages} />
            </CardContent>
        </Card>
    </div>
  );
}
