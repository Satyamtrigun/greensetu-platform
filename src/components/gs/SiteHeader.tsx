import { Button } from "@/components/ui/button";
import { GsWordmark } from "./Logo";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { useAuth } from "@/hooks/use-auth";
import { LayoutDashboard, LogIn } from "lucide-react";
import { Link } from "react-router";

export function SiteHeader() {
  const { isAuthenticated, isLoading } = useAuth();

  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-3 px-4">
        <Link to="/" className="shrink-0">
          <GsWordmark />
        </Link>

        <nav className="hidden items-center gap-6 text-sm font-medium text-muted-foreground lg:flex">
          <a href="/#how" className="hover:text-foreground">How It Works</a>
          <a href="/#prices" className="hover:text-foreground">Prices</a>
          <a href="/#recyclers" className="hover:text-foreground">Recyclers</a>
          <a href="/#safety" className="hover:text-foreground">Safety</a>
          <a href="/#partners" className="hover:text-foreground">Partners</a>
        </nav>

        <div className="flex items-center gap-2">
          <LanguageSwitcher className="hidden sm:inline-flex" />
          {!isLoading && isAuthenticated ? (
            <Button asChild className="gap-2">
              <Link to="/app">
                <LayoutDashboard className="size-4" />
                Open App
              </Link>
            </Button>
          ) : (
            <Button asChild variant="outline" className="gap-2">
              <Link to="/auth">
                <LogIn className="size-4" />
                Sign In
              </Link>
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}
