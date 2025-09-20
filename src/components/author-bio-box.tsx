
import { User } from "@/lib/data";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Card, CardContent } from "./ui/card";
import { BadgeCheck, Github, Linkedin, Twitter, Link as LinkIcon, Instagram, Youtube, Facebook } from "lucide-react";
import Link from "next/link";
import { Button } from "./ui/button";

// Simple SVG for WhatsApp icon as it's not in lucide-react
const WhatsAppIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
        <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path>
    </svg>
);


type AuthorBioBoxProps = {
    author: User;
}

export default function AuthorBioBox({ author }: AuthorBioBoxProps) {
    return (
        <Card>
            <CardContent className="pt-6">
                <div className="flex flex-col sm:flex-row items-start gap-4">
                    <Avatar className="h-16 w-16">
                        <AvatarImage src={author.avatarUrl} alt={author.name} />
                        <AvatarFallback>{author.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                        <h3 className="text-xl font-bold flex items-center gap-2">
                            About {author.name}
                            {(author.role === 'Admin' || author.role === 'Editor' || author.role === 'Author') && <BadgeCheck className="h-5 w-5 text-blue-500" />}
                        </h3>
                        <p className="mt-2 text-muted-foreground">
                            {author.bio || "This author has not yet written a bio."}
                        </p>
                        <div className="mt-4 flex items-center gap-2 flex-wrap">
                            {author.website && (
                                <Button variant="ghost" size="icon" asChild>
                                    <Link href={author.website} target="_blank" rel="noopener noreferrer">
                                        <LinkIcon className="h-5 w-5" />
                                        <span className="sr-only">Website</span>
                                    </Link>
                                </Button>
                            )}
                            {author.twitter && (
                                <Button variant="ghost" size="icon" asChild>
                                    <Link href={author.twitter} target="_blank" rel="noopener noreferrer">
                                        <Twitter className="h-5 w-5" />
                                        <span className="sr-only">Twitter</span>
                                    </Link>
                                </Button>
                            )}
                             {author.linkedin && (
                                <Button variant="ghost" size="icon" asChild>
                                    <Link href={author.linkedin} target="_blank" rel="noopener noreferrer">
                                        <Linkedin className="h-5 w-5" />
                                        <span className="sr-only">LinkedIn</span>
                                    </Link>
                                </Button>
                            )}
                             {author.github && (
                                <Button variant="ghost" size="icon" asChild>
                                    <Link href={author.github} target="_blank" rel="noopener noreferrer">
                                        <Github className="h-5 w-5" />
                                        <span className="sr-only">GitHub</span>
                                    </Link>
                                </Button>
                            )}
                            {author.facebook && (
                                <Button variant="ghost" size="icon" asChild>
                                    <Link href={author.facebook} target="_blank" rel="noopener noreferrer">
                                        <Facebook className="h-5 w-5" />
                                        <span className="sr-only">Facebook</span>
                                    </Link>
                                </Button>
                            )}
                            {author.instagram && (
                                <Button variant="ghost" size="icon" asChild>
                                    <Link href={author.instagram} target="_blank" rel="noopener noreferrer">
                                        <Instagram className="h-5 w-5" />
                                        <span className="sr-only">Instagram</span>
                                    </Link>
                                </Button>
                            )}
                            {author.youtube && (
                                <Button variant="ghost" size="icon" asChild>
                                    <Link href={author.youtube} target="_blank" rel="noopener noreferrer">
                                        <Youtube className="h-5 w-5" />
                                        <span className="sr-only">YouTube</span>
                                    </Link>
                                </Button>
                            )}
                            {author.whatsapp && (
                                <Button variant="ghost" size="icon" asChild>
                                    <Link href={author.whatsapp} target="_blank" rel="noopener noreferrer">
                                        <WhatsAppIcon className="h-5 w-5" />
                                        <span className="sr-only">WhatsApp</span>
                                    </Link>
                                </Button>
                            )}
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}
