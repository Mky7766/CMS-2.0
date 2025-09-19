
import { User } from "@/lib/data";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Card, CardContent } from "./ui/card";

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
                        <h3 className="text-xl font-bold">About {author.name}</h3>
                        <p className="mt-2 text-muted-foreground">
                            {author.bio || "This author has not yet written a bio."}
                        </p>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}
