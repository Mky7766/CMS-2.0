
"use client";

import { useActionState, useEffect, useState, useTransition, useRef } from "react";
import { useFormStatus } from "react-dom";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Calendar, Save, UploadCloud, X, Loader, Bold, Italic, Link as LinkIcon, Code } from "lucide-react";
import { Badge } from "../ui/badge";
import { savePost, updatePost, uploadMedia } from "@/app/actions";
import { useToast } from "@/hooks/use-toast";
import type { Post } from "@/lib/data";

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
  const contentRef = useRef<HTMLTextAreaElement>(null);


  // Determine the action and prepare the initial state
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

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTitle = e.target.value;
    setTitle(newTitle);
    // Only auto-update permalink for new posts or if it was already a slugified version of the old title
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

    // Reset file input
    if(fileInputRef.current) {
        fileInputRef.current.value = "";
    }
  };

  const removeFeaturedImage = () => {
      setFeaturedImageUrl("");
  }

  const applyFormat = (format: 'bold' | 'italic' | 'link' | 'code') => {
    const textarea = contentRef.current;
    if (!textarea) return;
    
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = content.substring(start, end);

    let newText = '';
    
    switch(format) {
        case 'bold':
            newText = `**${selectedText}**`;
            break;
        case 'italic':
            newText = `*${selectedText}*`;
            break;
        case 'link':
            newText = `[${selectedText}](url)`;
            break;
        case 'code':
            newText = "```html\n" + selectedText + "\n```";
            break;
    }

    setContent(content.substring(0, start) + newText + content.substring(end));
    
    // Focus and adjust cursor position after state update
    setTimeout(() => {
        textarea.focus();
        if (format === 'link') {
            textarea.setSelectionRange(start + newText.length - 4, start + newText.length - 1);
        } else {
            textarea.setSelectionRange(start + newText.length, start + newText.length);
        }
    }, 0);
};


  return (
    <form action={formAction} className="grid gap-6 lg:grid-cols-3">
      {/* Hidden input to pass the original post ID for updates */}
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
              <div className="rounded-md border border-input">
                <div className="p-2 border-b">
                     <Button type="button" variant="ghost" size="icon" onMouseDown={(e) => e.preventDefault()} onClick={() => applyFormat('bold')} title="Bold">
                        <Bold className="h-4 w-4" />
                    </Button>
                     <Button type="button" variant="ghost" size="icon" onMouseDown={(e) => e.preventDefault()} onClick={() => applyFormat('italic')} title="Italic">
                        <Italic className="h-4 w-4" />
                    </Button>
                     <Button type="button" variant="ghost" size="icon" onMouseDown={(e) => e.preventDefault()} onClick={() => applyFormat('link')} title="Link">
                        <LinkIcon className="h-4 w-4" />
                    </Button>
                     <Button type="button" variant="ghost" size="icon" onMouseDown={(e) => e.preventDefault()} onClick={() => applyFormat('code')} title="Code">
                        <Code className="h-4 w-4" />
                    </Button>
                </div>
                <Textarea 
                    id="content-display" 
                    name="content-display"
                    placeholder="Start writing your content here. Markdown is supported." 
                    rows={15} 
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    className="border-0 focus-visible:ring-0 focus-visible:ring-offset-0"
                    ref={contentRef}
                    required 
                />
              </div>
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

    