
"use client";

import Image from "next/image";
import { useState, useTransition, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { type ImagePlaceholder } from "@/lib/placeholder-images";
import { MoreVertical, UploadCloud } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getImages, uploadMedia } from "@/app/actions";
import { useToast } from "@/hooks/use-toast";
import { Loader } from "lucide-react";

export default function MediaPage() {
  const [images, setImages] = useState<ImagePlaceholder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isPending, startTransition] = useTransition();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    async function loadImages() {
      setIsLoading(true);
      const fetchedImages = await getImages();
      setImages(fetchedImages);
      setIsLoading(false);
    }
    loadImages();
  }, []);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const dataUrl = reader.result as string;
      startTransition(async () => {
        const result = await uploadMedia(dataUrl, file.name);
        if (result.success && result.newImage) {
           setImages(prevImages => [result.newImage!, ...prevImages]);
           toast({ title: "Success", description: "Image uploaded successfully." });
        } else {
           toast({ title: "Error", description: result.error, variant: "destructive" });
        }
      });
    };
    reader.onerror = (error) => {
        console.error("Error reading file:", error);
        toast({ title: "Error", description: "Failed to read file.", variant: "destructive" });
    };

    // Reset file input to allow uploading the same file again
    if(fileInputRef.current) {
        fileInputRef.current.value = "";
    }
  };

  if (isLoading) {
    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <div>
                <h1 className="text-3xl font-bold tracking-tight">Media Library</h1>
                <p className="text-muted-foreground">Manage your images and other media files.</p>
                </div>
                 <Button disabled={true}>
                    <Loader className="mr-2 h-4 w-4 animate-spin" />
                    Loading...
                </Button>
            </div>
             <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {Array.from({ length: 12 }).map((_, i) => (
                    <Card key={i} className="group relative overflow-hidden">
                        <CardContent className="p-0 bg-muted animate-pulse aspect-[4/3] w-full" />
                    </Card>
                ))}
            </div>
        </div>
    )
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Media Library</h1>
          <p className="text-muted-foreground">Manage your images and other media files.</p>
        </div>
        <div>
           <Button asChild disabled={isPending}>
            <Label htmlFor="file-upload" className="cursor-pointer">
              {isPending ? <Loader className="mr-2 h-4 w-4 animate-spin" /> : <UploadCloud className="mr-2 h-4 w-4" />}
              {isPending ? "Uploading..." : "Upload Media"}
            </Label>
          </Button>
          <Input 
            id="file-upload" 
            type="file" 
            className="sr-only" 
            onChange={handleFileChange}
            accept="image/*"
            ref={fileInputRef}
            disabled={isPending}
          />
        </div>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {images.map((image) => (
          <Card key={image.id} className="group relative overflow-hidden">
            <CardContent className="p-0">
              <Image
                src={image.imageUrl}
                alt={image.description}
                width={400}
                height={300}
                className="aspect-[4/3] w-full object-cover transition-transform group-hover:scale-105"
                data-ai-hint={image.imageHint}
                unoptimized={image.imageUrl.startsWith('data:')} // unoptimize data urls
              />
            </CardContent>
             <div className="absolute top-2 right-2">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="secondary" size="icon" className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem>View details</DropdownMenuItem>
                    <DropdownMenuItem>Replace</DropdownMenuItem>
                    <DropdownMenuItem className="text-red-600">Delete</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
