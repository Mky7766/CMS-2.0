
"use client";

import { useActionState, useEffect, useState } from "react";
import { useFormStatus } from "react-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import RichTextEditor from "@/components/ui/rich-text-editor";
import { Save } from "lucide-react";
import { createPage, updatePage } from "@/app/actions";
import { useToast } from "@/hooks/use-toast";
import type { Page } from "@/lib/data";

function SubmitButton({ isUpdate }: { isUpdate?: boolean }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
        <Save className="mr-2 h-4 w-4" /> 
        {pending ? (isUpdate ? "Updating..." : "Saving...") : (isUpdate ? "Update Page" : "Save Page")}
    </Button>
  );
}

type PageFormProps = {
    page?: Page;
}

function slugify(text: string) {
    return text
        .toString()
        .toLowerCase()
        .trim()
        .replace(/\s+/g, '-') // Replace spaces with -
        .replace(/[^\w-]+/g, '') // Remove all non-word chars
        .replace(/--+/g, '-'); // Replace multiple - with single -
}

export default function PageForm({ page }: PageFormProps) {
  const [title, setTitle] = useState(page?.title || "");
  const [permalink, setPermalink] = useState(page?.id || "");
  const [content, setContent] = useState(page?.content || "");
  
  const action = page ? updatePage : createPage;
  const [state, formAction] = useActionState(action, null);

  const { toast } = useToast();

  useEffect(() => {
    if (state?.error) {
      toast({
        title: "Error",
        description: state.error,
        variant: "destructive",
      });
    }
  }, [state, toast]);

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTitle = e.target.value;
    setTitle(newTitle);
    if (!page || (page && page.id === slugify(page.title))) {
        setPermalink(slugify(newTitle));
    }
  };

  return (
    <form action={formAction} className="grid gap-6 lg:grid-cols-3">
      {page && <input type="hidden" name="pageId" value={page.id} />}
      <input type="hidden" name="content" value={content} />
      
      <div className="lg:col-span-2 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Page Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="title">Page Title</Label>
              <Input 
                id="title" 
                name="title" 
                placeholder="Your amazing page title" 
                value={title}
                onChange={handleTitleChange}
                required
              />
            </div>
            <div>
              <Label htmlFor="permalink">Permalink</Label>
              <Input 
                id="permalink" 
                name="permalink" 
                placeholder="your-amazing-page-title" 
                value={permalink}
                onChange={(e) => setPermalink(slugify(e.target.value))}
                required
              />
              <p className="text-sm text-muted-foreground">The URL-friendly version of the name.</p>
            </div>
            <div>
              <Label htmlFor="content">Content</Label>
              <RichTextEditor value={content} onChange={setContent} />
            </div>
          </CardContent>
        </Card>
      </div>
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Publish</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="status">Status</Label>
              <Select defaultValue={page?.status || "Draft"} name="status">
                <SelectTrigger id="status">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Draft">Draft</SelectItem>
                  <SelectItem value="Published">Published</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
          <div className="p-6 pt-0 flex justify-between items-center">
             <Button variant="outline" type="button" onClick={() => window.history.back()}>Cancel</Button>
            <SubmitButton isUpdate={!!page} />
          </div>
        </Card>
      </div>
    </form>
  );
}
