
"use client";

import { useState, useEffect } from 'react';
import { Post } from '@/lib/data';
import { Button } from './ui/button';
import { Facebook, Twitter, Linkedin, Copy, Check } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

// Simple SVG for WhatsApp icon
const WhatsAppIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path>
  </svg>
);


type SocialShareProps = {
  post: Post;
};

export default function SocialShare({ post }: SocialShareProps) {
  const { toast } = useToast();
  const [currentUrl, setCurrentUrl] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    // This runs only on the client, so `window` is available.
    setCurrentUrl(window.location.href);
  }, []);

  if (!currentUrl) {
    return null; // Don't render on the server
  }

  const encodedUrl = encodeURIComponent(currentUrl);
  const encodedTitle = encodeURIComponent(post.title);

  const shareLinks = {
    twitter: `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`,
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
    linkedin: `https://www.linkedin.com/shareArticle?mini=true&url=${encodedUrl}&title=${encodedTitle}`,
    whatsapp: `https://api.whatsapp.com/send?text=${encodedTitle}%20${encodedUrl}`,
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(currentUrl).then(() => {
      setCopied(true);
      toast({ title: "Success", description: "Link copied to clipboard!" });
      setTimeout(() => setCopied(false), 2000); // Reset icon after 2 seconds
    }, (err) => {
      toast({ title: "Error", description: "Failed to copy link.", variant: "destructive" });
    });
  };

  const shareButtons = [
    { name: 'Twitter', href: shareLinks.twitter, icon: <Twitter className="h-5 w-5" /> },
    { name: 'Facebook', href: shareLinks.facebook, icon: <Facebook className="h-5 w-5" /> },
    { name: 'LinkedIn', href: shareLinks.linkedin, icon: <Linkedin className="h-5 w-5" /> },
    { name: 'WhatsApp', href: shareLinks.whatsapp, icon: <WhatsAppIcon className="h-5 w-5" /> },
  ];

  return (
    <div className="border-t border-b py-6">
      <div className="flex items-center justify-center gap-2">
        <span className="text-sm font-semibold mr-4">Share this post:</span>
        {shareButtons.map((button) => (
          <Button
            key={button.name}
            variant="outline"
            size="icon"
            asChild
            className="rounded-full"
          >
            <a href={button.href} target="_blank" rel="noopener noreferrer" aria-label={`Share on ${button.name}`}>
              {button.icon}
            </a>
          </Button>
        ))}
        <Button
            variant="outline"
            size="icon"
            className="rounded-full"
            onClick={handleCopy}
            aria-label="Copy link"
        >
            {copied ? <Check className="h-5 w-5 text-green-500" /> : <Copy className="h-5 w-5" />}
        </Button>
      </div>
    </div>
  );
}
