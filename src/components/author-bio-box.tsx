
import { User } from "@/lib/data";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Card, CardContent } from "./ui/card";
import { BadgeCheck, Github, Linkedin, Twitter, Link as LinkIcon } from "lucide-react";
import Link from "next/link";
import { Button } from "./ui/button";

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
                        <div className="mt-4 flex items-center gap-2">
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
                             {author.website && (
                                <Button variant="ghost" size="icon" asChild>
                                    <Link href={author.website} target="_blank" rel="noopener noreferrer">
                                        <LinkIcon className="h-5 w-5" />
                                        <span className="sr-only">Website</span>
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
