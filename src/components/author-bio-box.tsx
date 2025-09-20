
import { User } from "@/lib/data";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Card, CardContent } from "./ui/card";
import { BadgeCheck } from "lucide-react";

type AuthorBioBoxProps = {
    author: User;
}

export default function AuthorBioBox({ author }: AuthorBioBoxProps) {
    return (
        <Card>
            <CardContent className="pt-6">
                <div className="flex items-start gap-4">
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
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}
