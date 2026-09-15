import { Link } from "@tanstack/react-router";
import { Library, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ThemeToggle";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/85 backdrop-blur">
      <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-4 px-4 py-3">
        <Link to="/" className="flex items-center gap-2">
          <div className="flex items-center">
            <img
              src="../../public/logo.ico"
              alt="GameShelf Logo"
              className="h-10 w-auto"
            />
          </div>
          <span className="font-display text-lg font-bold tracking-tight">
            Game<span className="text-primary">Shelf</span>
          </span>
        </Link>

        <nav className="flex items-center gap-1 sm:gap-2">
          <Button asChild variant="ghost" size="sm">
            <Link to="/" activeProps={{ className: "text-primary" }}>
              Biblioteca
            </Link>
          </Button>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Button asChild size="sm">
              <Link to="/games/new">
                <Plus className="size-4" />
                <span className="hidden sm:inline">Novo jogo</span>
              </Link>
            </Button>
          </div>
        </nav>
      </div>
    </header>
  );
}
