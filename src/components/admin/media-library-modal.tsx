
"use client";

import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
    DialogClose,
} from "@/components/ui/dialog";
import Image from "next/image";
import { useState, useTransition, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { type ImagePlaceholder } from "@/lib/placeholder-images";
import { UploadCloud, Loader } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getImages, uploadMedia } from "@/app/actions";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";


type MediaLibraryModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSelectImage: (imageUrl: string) => void;
};

export default function MediaLibraryModal({ isOpen, onClose, onSelectImage }: MediaLibraryModalProps) {
  const [images, setImages] = useState<ImagePlaceholder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, startUploading] = useTransition();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (isOpen) {
      async function loadImages() {
        setIsLoading(true);
        const fetchedImages = await getImages();
        setImages(fetchedImages);
        setIsLoading(false);
      }
      loadImages();
    }
  }, [isOpen]);

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

    if(fileInputRef.current) {
        fileInputRef.current.value = "";
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Media Library</DialogTitle>
          <DialogDescription>Select an image or upload a new one.</DialogDescription>
        </DialogHeader>
        <Tabs defaultValue="select" className="flex-grow flex flex-col">
            <TabsList>
                <TabsTrigger value="select">Select Image</TabsTrigger>
                <TabsTrigger value="upload">Upload Image</TabsTrigger>
            </TabsList>
            <TabsContent value="select" className="flex-grow overflow-auto mt-4">
                 {isLoading ? (
                     <div className="grid grid-cols-4 gap-4">
                        {Array.from({ length: 8 }).map((_, i) => (
                            <Card key={i} className="group relative overflow-hidden">
                                <CardContent className="p-0 bg-muted animate-pulse aspect-[4/3] w-full" />
                            </Card>
                        ))}
                    </div>
                 ) : (
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                        {images.map((image) => (
                            <Card key={image.id} className="group relative overflow-hidden cursor-pointer" onClick={() => onSelectImage(image.imageUrl)}>
                                <CardContent className="p-0">
                                    <Image
                                    src={image.imageUrl}
                                    alt={image.description}
                                    width={200}
                                    height={150}
                                    className="aspect-[4/3] w-full object-cover transition-transform group-hover:scale-105"
                                    unoptimized={image.imageUrl.startsWith('data:')}
                                    />
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                 )}
            </TabsContent>
            <TabsContent value="upload" className="mt-4">
                <div className="flex justify-center items-center h-full">
                     <div className="mt-1 flex justify-center rounded-md border-2 border-dashed border-border px-6 pt-12 pb-12 w-full max-w-md">
                        <div className="space-y-1 text-center">
                        {isUploading ? <Loader className="mx-auto h-12 w-12 text-gray-400 animate-spin" /> : <UploadCloud className="mx-auto h-12 w-12 text-gray-400" />}
                        <div className="flex text-sm text-muted-foreground justify-center">
                            <Label htmlFor="modal-file-upload" className="relative cursor-pointer rounded-md bg-background font-medium text-primary focus-within:outline-none focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2 hover:text-primary">
                            <span>{isUploading ? "Uploading..." : "Upload a file"}</span>
                            <Input 
                                id="modal-file-upload" 
                                name="modal-file-upload" 
                                type="file" 
                                className="sr-only"
                                onChange={handleFileChange}
                                accept="image/*"
                                ref={fileInputRef}
                                disabled={isUploading}
                            />
                            </Label>
                        </div>
                        <p className="text-xs text-gray-500">PNG, JPG, GIF up to 10MB</p>
                        </div>
                    </div>
                </div>
            </TabsContent>
        </Tabs>
        <DialogFooter className="mt-4">
            <DialogClose asChild>
                <Button type="button" variant="secondary">Close</Button>
            </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
