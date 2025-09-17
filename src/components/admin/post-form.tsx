
"use client";

import { useActionState, useEffect, useState, useTransition, useRef } from "react";
import { useFormStatus } from "react-dom";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import RichTextEditor from "@/components/ui/rich-text-editor";
import { Calendar, Save, UploadCloud, X, Loader } from "lucide-react";
import { Badge } from "../ui/badge";
import { savePost, updatePost, uploadMedia, getCategories, getSettings } from "@/app/actions";
import { useToast } from "@/hooks/use-toast";
import type { Post, Category } from "@/lib/data";

function SubmitButton({ isUpdate }: { isUpdate?: boolean }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
        <Save className="mr-2 h-4 w-4" /> 
        {pending ? (isUpdate ? "Updating..." : "Saving...") : (isUpdate ? "Update Post" : "Save Post")}
    </Button>
  );
}

type PostFormProps = {
    post?: Post;
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

export default function PostForm({ post }: PostFormProps) {
  const [title, setTitle] = useState(post?.title || "");
  const [permalink, setPermalink] = useState(post?.id || "");
  const [content, setContent] = useState(post?.content || "");
  const [tags, setTags] = useState(post?.tags || []);
  const [tagInput, setTagInput] = useState("");
  const [featuredImageUrl, setFeaturedImageUrl] = useState(post?.featuredImage?.url || "");
  const [isUploading, startUploading] = useTransition();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [categories, setCategories] = useState<Category[]>([]);
  const [settings, setSettings] = useState<any>(null);
  const [selectedCategory, setSelectedCategory] = useState(post?.categoryId || "");

  const action = post ? updatePost : savePost;
  const [state, formAction] = useActionState(action, null);

  const { toast } = useToast();

  useEffect(() => {
    async function loadData() {
        const [cats, siteSettings] = await Promise.all([
            getCategories(),
            getSettings()
        ]);
        setCategories(cats);
        setSettings(siteSettings);
        if (!post) {
            setSelectedCategory(siteSettings.defaultPostCategoryId || (cats[0] ? cats[0].id : ""));
        }
    }
    loadData();
  }, [post]);


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
    if (!post || (post && post.id === slugify(post.title))) {
        setPermalink(slugify(newTitle));
    }
  };


  const handleTagInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && tagInput.trim() !== "") {
      e.preventDefault();
      const newTag = tagInput.trim();
      if (!tags.includes(newTag)) {
        setTags([...tags, newTag]);
      }
      setTagInput("");
    }
  };
  
  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };
  
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const dataUrl = reader.result as string;
      startUploading(async () => {
        const result = await uploadMedia(dataUrl, file.name);
        if (result.success && result.newImage) {
           setFeaturedImageUrl(result.newImage.imageUrl);
           toast({ title: "Success", description: "Image uploaded and set as featured." });
        } else {
           toast({ title: "Error", description: result.error, variant: "destructive" });
        }
      });
    };
    reader.onerror = (error) => {
        console.error("Error reading file:", error);
        toast({ title: "Error", description: "Failed to read file.", variant: "destructive" });
    };

    if(fileInputRef.current) {
        fileInputRef.current.value = "";
    }
  };

  const removeFeaturedImage = () => {
      setFeaturedImageUrl("");
  }

  return (
    <form action={formAction} className="grid gap-6 lg:grid-cols-3">
      {post && <input type="hidden" name="postId" value={post.id} />}
      <input type="hidden" name="featured-image-url" value={featuredImageUrl} />
       <input type="hidden" name="content" value={content} />
      
      <div className="lg:col-span-2 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Post Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="title">Post Title</Label>
              <Input 
                id="title" 
                name="title" 
                placeholder="Your amazing post title" 
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
                placeholder="your-amazing-post-title" 
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
               <textarea
                id="seo-description"
                name="seo-description"
                rows={3}
                className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
                placeholder="A brief summary for search results"
              ></textarea>
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
              <Select defaultValue={post?.status || "Draft"} name="status">
                <SelectTrigger id="status">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Draft">Draft</SelectItem>
                  <SelectItem value="Published">Published</SelectItem>
                  <SelectItem value="Scheduled">Scheduled</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
                <Label>Schedule Publish</Label>
                 <Button variant="outline" className="w-full justify-start text-left font-normal" disabled>
                    <Calendar className="mr-2 h-4 w-4" />
                    Pick a date
                </Button>
            </div>
          </CardContent>
          <div className="p-6 pt-0 flex justify-between items-center">
             <Button variant="outline" type="button" onClick={() => window.history.back()}>Cancel</Button>
            <SubmitButton isUpdate={!!post} />
          </div>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Organization</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
             <div>
                <Label htmlFor="category-id">Category</Label>
                 <Select name="category-id" value={selectedCategory} onValueChange={setSelectedCategory}>
                    <SelectTrigger id="category-id">
                        <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                    <SelectContent>
                        {categories.map((cat) => (
                            <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
             </div>
            <div>
                <Label htmlFor="tags">Tags</Label>
                <Input 
                    id="tags" 
                    name="tags"
                    placeholder="Add tags and press Enter" 
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={handleTagInputKeyDown}
                />
                 <input type="hidden" name="tags-hidden" value={tags.join(',')} />
                <div className="mt-2 flex flex-wrap gap-2">
                    {tags.map(tag => (
                        <Badge key={tag} variant="secondary" className="flex items-center gap-1">
                            {tag}
                            <button type="button" onClick={() => removeTag(tag)} className="ml-1 text-muted-foreground hover:text-foreground">
                                <span className="sr-only">Remove {tag}</span>
                                &times;
                            </button>
                        </Badge>
                    ))}
                </div>
            </div>
            <div>
              <Label>Featured Image</Label>
                {featuredImageUrl ? (
                    <div className="mt-2 relative">
                        <Image
                            src={featuredImageUrl}
                            alt="Featured image preview"
                            width={300}
                            height={200}
                            className="w-full h-auto rounded-md object-cover"
                            unoptimized={featuredImageUrl.startsWith('data:')}
                        />
                        <Button
                            type="button"
                            variant="destructive"
                            size="icon"
                            className="absolute top-2 right-2 h-7 w-7"
                            onClick={removeFeaturedImage}
                        >
                            <X className="h-4 w-4" />
                            <span className="sr-only">Remove image</span>
                        </Button>
                    </div>
                ) : (
                    <div className="mt-1 flex justify-center rounded-md border-2 border-dashed border-border px-6 pt-5 pb-6">
                        <div className="space-y-1 text-center">
                        {isUploading ? <Loader className="mx-auto h-12 w-12 text-gray-400 animate-spin" /> : <UploadCloud className="mx-auto h-12 w-12 text-gray-400" />}
                        <div className="flex text-sm text-muted-foreground">
                            <Label htmlFor="file-upload" className="relative cursor-pointer rounded-md bg-background font-medium text-primary focus-within:outline-none focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2 hover:text-primary">
                            <span>{isUploading ? "Uploading..." : "Upload a file"}</span>
                            <Input 
                                id="file-upload" 
                                name="file-upload" 
                                type="file" 
                                className="sr-only"
                                onChange={handleFileChange}
                                accept="image/*"
                                ref={fileInputRef}
                                disabled={isUploading}
                            />
                            </Label>
                            <p className="pl-1">or drag and drop</p>
                        </div>
                        <p className="text-xs text-gray-500">PNG, JPG, GIF up to 10MB</p>
                        </div>
                    </div>
                )}
            </div>
          </CardContent>
        </Card>
      </div>
    </form>
  );
}
