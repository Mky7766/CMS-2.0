import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Icons } from "@/components/icons";
import { ArrowRight } from "lucide-react";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      <header className="p-4 flex justify-between items-center">
        <Link href="/" className="flex items-center gap-2 font-headline text-xl font-bold">
          <Icons.logo className="h-6 w-6" />
          Nebula CMS
        </Link>
      </header>
      <main className="flex-1 flex flex-col items-center justify-center text-center p-4">
        <div className="max-w-3xl">
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight">
            The Modern, Git-Based CMS for Static Sites
          </h1>
          <p className="mt-6 text-lg text-muted-foreground">
            Nebula CMS is a full-featured, open-source Content Management System that runs on static site hosting. No database required, just your Git repository.
          </p>
          <div className="mt-8 flex justify-center gap-4">
            <Button size="lg" asChild>
              <Link href="/login">
                Go to Dashboard
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="https://github.com" target="_blank">
                View on GitHub
              </Link>
            </Button>
          </div>
        </div>
      </main>
      <footer className="p-4 text-center text-sm text-muted-foreground">
        Built with &#x2764;&#xFE0F; by the open-source community.
      </footer>
    </div>
  );
}
