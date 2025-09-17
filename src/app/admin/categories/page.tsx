
"use client";

import { useEffect, useState, useTransition, useActionState } from 'react';
import { useFormStatus } from 'react-dom';
import { getCategories, createCategory, updateCategory, deleteCategory } from '@/app/actions';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import type { Category } from '@/lib/data';
import { MoreHorizontal, PlusCircle } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

function slugify(text: string) {
    return text.toString().toLowerCase().trim()
        .replace(/\s+/g, '-')
        .replace(/[^\w-]+/g, '')
        .replace(/--+/g, '-');
}

function SubmitButton({ isEditing }: { isEditing: boolean }) {
    const { pending } = useFormStatus();
    return (
        <Button type="submit" disabled={pending}>
            {pending ? (isEditing ? 'Saving...' : 'Adding...') : (isEditing ? 'Save Category' : 'Add New Category')}
        </Button>
    )
}

function CategoryForm({ category, onFormSubmit }: { category?: Category | null, onFormSubmit: () => void }) {
    const action = category ? updateCategory : createCategory;
    const [state, formAction] = useActionState(action, null);
    const { toast } = useToast();
    const [name, setName] = useState(category?.name || '');
    const [slug, setSlug] = useState(category?.slug || '');

    useEffect(() => {
        if (state?.success) {
            toast({ title: "Success", description: state.success });
            onFormSubmit();
            setName('');
            setSlug('');
        } else if (state?.error) {
            toast({ title: "Error", description: state.error, variant: 'destructive' });
        }
    }, [state, toast, onFormSubmit]);

    const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newName = e.target.value;
        setName(newName);
        if (!category) { // Only auto-slugify for new categories
            setSlug(slugify(newName));
        }
    }

    return (
        <form action={formAction}>
            {category && <input type="hidden" name="categoryId" value={category.id} />}
            <Card>
                <CardHeader>
                    <CardTitle>{category ? 'Edit Category' : 'Add New Category'}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="name">Name</Label>
                        <Input id="name" name="name" value={name} onChange={handleNameChange} required />
                        <p className="text-sm text-muted-foreground">The name is how it appears on your site.</p>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="slug">Slug</Label>
                        <Input id="slug" name="slug" value={slug} onChange={(e) => setSlug(e.target.value)} required />
                        <p className="text-sm text-muted-foreground">The “slug” is the URL-friendly version of the name.</p>
                    </div>
                </CardContent>
                <CardFooter>
                    <SubmitButton isEditing={!!category} />
                </CardFooter>
            </Card>
        </form>
    )
}


function CategoryActions({ category, onEdit, onDelete }: { category: Category, onEdit: (cat: Category) => void, onDelete: (cat: Category) => void }) {
    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                    <MoreHorizontal className="h-4 w-4" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
                <DropdownMenuItem onSelect={() => onEdit(category)}>Edit</DropdownMenuItem>
                <DropdownMenuItem onSelect={() => onDelete(category)} className="text-red-500">Delete</DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}

export default function CategoriesPage() {
    const [categories, setCategories] = useState<Category[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [editingCategory, setEditingCategory] = useState<Category | null>(null);
    const [deletingCategory, setDeletingCategory] = useState<Category | null>(null);
    const [isPending, startTransition] = useTransition();
    const { toast } = useToast();

    const fetchCategories = async () => {
        setIsLoading(true);
        const cats = await getCategories();
        setCategories(cats);
        setIsLoading(false);
    }

    useEffect(() => {
        fetchCategories();
    }, []);

    const handleFormSubmit = () => {
        fetchCategories();
        setEditingCategory(null);
    }

    const handleDelete = () => {
        if (!deletingCategory) return;

        startTransition(async () => {
            const result = await deleteCategory(deletingCategory.id);
            if (result?.success) {
                toast({ title: "Success", description: result.success });
                fetchCategories();
            } else {
                toast({ title: "Error", description: result?.error, variant: 'destructive' });
            }
            setDeletingCategory(null);
        });
    }

    return (
        <div className="space-y-8">
            <h1 className="text-3xl font-bold tracking-tight">Categories</h1>

            <div className="grid gap-8 md:grid-cols-3">
                <div className="md:col-span-1">
                    <CategoryForm key={editingCategory?.id || 'new'} category={editingCategory} onFormSubmit={handleFormSubmit} />
                    {editingCategory && <Button variant="link" onClick={() => setEditingCategory(null)} className="mt-2">Cancel Edit</Button>}
                </div>
                <div className="md:col-span-2">
                    <Card>
                        <CardHeader>
                            <CardTitle>Existing Categories</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {isLoading ? (
                                <p>Loading...</p>
                            ) : (
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Name</TableHead>
                                            <TableHead>Slug</TableHead>
                                            <TableHead><span className="sr-only">Actions</span></TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {categories.map(cat => (
                                            <TableRow key={cat.id}>
                                                <TableCell className="font-medium">{cat.name}</TableCell>
                                                <TableCell>{cat.slug}</TableCell>
                                                <TableCell className="text-right">
                                                    <CategoryActions 
                                                        category={cat} 
                                                        onEdit={setEditingCategory}
                                                        onDelete={setDeletingCategory}
                                                    />
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>

            <AlertDialog open={!!deletingCategory} onOpenChange={() => setDeletingCategory(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete the category. Posts in this category will not be deleted.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDelete} disabled={isPending} className="bg-red-600 hover:bg-red-700">
                            {isPending ? 'Deleting...' : 'Delete'}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    )
}
