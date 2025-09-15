
"use client";

import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import { MoreVertical, UploadCloud } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function MediaPage() {
  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Media Library</h1>
          <p className="text-muted-foreground">Manage your images and other media files.</p>
        </div>
        <div>
           <Button asChild>
            <Label htmlFor="file-upload" className="cursor-pointer">
              <UploadCloud className="mr-2 h-4 w-4" />
              Upload Media
            </Label>
          </Button>
          <Input id="file-upload" type="file" className="sr-only" />
        </div>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {PlaceHolderImages.map((image) => (
          <Card key={image.id} className="group relative overflow-hidden">
            <CardContent className="p-0">
              <Image
                src={image.imageUrl}
                alt={image.description}
                width={400}
                height={300}
                className="aspect-[4/3] w-full object-cover transition-transform group-hover:scale-105"
                data-ai-hint={image.imageHint}
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
