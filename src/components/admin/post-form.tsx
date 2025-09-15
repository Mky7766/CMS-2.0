"use client";

import { useActionState, useEffect, useState } from "react";
import { useFormStatus } from "react-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Calendar, Save, UploadCloud } from "lucide-react";
import { Badge } from "../ui/badge";
import { savePost, updatePost } from "@/app/actions";
import { useToast } from "@/hooks/use-toast";
import type { Post } from "@/lib/data";

function SubmitButton({ isUpdate }: { isUpdate?: boolean }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
        <Save className="mr-2 h-4 w-4" /> 
        {pending ? (isUpdate ? "Updating..." : "Saving...") : (isUpdate ? "Update" : "Save")}
    </Button>
  );
}

type PostFormProps = {
    post?: Post;
}

export default function PostForm({ post }: PostFormProps) {
  const [tags, setTags] = useState(post?.tags || ["Technology", "CMS"]);
  const [tagInput, setTagInput] = useState("");

  const action = post ? updatePost : savePost;
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


  const handleTagInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && tagInput.trim() !== "") {
      e.preventDefault();
      if (!tags.includes(tagInput.trim())) {
        setTags([...tags, tagInput.trim()]);
      }
      setTagInput("");
    }
  };
  
  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };


  return (
    <form action={formAction} className="grid gap-6 lg:grid-cols-3">
      {post && <input type="hidden" name="postId" value={post.id} />}
      <div className="lg:col-span-2 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Post Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="title">Post Title</Label>
              <Input id="title" name="title" placeholder="Your amazing post title" defaultValue={post?.title} />
            </div>
            <div>
              <Label htmlFor="permalink">Permalink</Label>
              <Input id="permalink" name="permalink" placeholder="your-amazing-post-title" defaultValue={post?.id} />
              <p className="text-sm text-muted-foreground">The URL-friendly version of the name.</p>
            </div>
            <div>
              <Label htmlFor="content">Content</Label>
              <Textarea id="content" name="content" placeholder="Start writing your content here. Markdown is supported." rows={15} defaultValue={post?.content} />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>SEO Settings</CardTitle>
            <CardDescription>Optimize your post for search engines.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="seo-title">Meta Title</Label>
              <Input id="seo-title" name="seo-title" placeholder="A catchy title for SEO" />
            </div>
            <div>
              <Label htmlFor="seo-description">Meta Description</Label>
              <Textarea id="seo-description" name="seo-description" placeholder="A brief summary for search results" rows={3} />
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
              <Select defaultValue={post?.status || "draft"} name="status">
                <SelectTrigger id="status">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="published">Published</SelectItem>
                  <SelectItem value="scheduled">Scheduled</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
                <Label>Schedule Publish</Label>
                 <Button variant="outline" className="w-full justify-start text-left font-normal">
                    <Calendar className="mr-2 h-4 w-4" />
                    Pick a date
                </Button>
            </div>
          </CardContent>
          <div className="p-6 pt-0 flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Auto-saved</span>
            <SubmitButton isUpdate={!!post} />
          </div>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Organization</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
                <Label htmlFor="tags">Tags</Label>
                <Input 
                    id="tags" 
                    name="tags"
                    placeholder="Add tags..." 
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={handleTagInputKeyDown}
                />
                 <input type="hidden" name="tags-hidden" value={tags.join(',')} />
                <div className="mt-2 flex flex-wrap gap-2">
                    {tags.map(tag => (
                        <Badge key={tag} variant="secondary" className="flex items-center gap-1">
                            {tag}
                            <button type="button" onClick={() => removeTag(tag)} className="text-muted-foreground hover:text-foreground">
                                <span className="sr-only">Remove {tag}</span>
                                &times;
                            </button>
                        </Badge>
                    ))}
                </div>
            </div>
            <div>
              <Label htmlFor="featured-image">Featured Image</Label>
              <div className="mt-1 flex justify-center rounded-md border-2 border-dashed border-border px-6 pt-5 pb-6">
                <div className="space-y-1 text-center">
                  <UploadCloud className="mx-auto h-12 w-12 text-gray-400" />
                  <div className="flex text-sm text-muted-foreground">
                    <Label htmlFor="file-upload" className="relative cursor-pointer rounded-md bg-background font-medium text-primary focus-within:outline-none focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2 hover:text-primary">
                      <span>Upload a file</span>
                      <Input id="file-upload" name="file-upload" type="file" className="sr-only" />
                    </Label>
                    <p className="pl-1">or drag and drop</p>
                  </div>
                  <p className="text-xs text-gray-500">PNG, JPG, GIF up to 10MB</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </form>
  );
}
