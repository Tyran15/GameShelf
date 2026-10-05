import { useState } from "react";
import { Link, useLocation } from "@tanstack/react-router";
import { ArrowLeft, Menu, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Logo } from "./Logo";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";

const NAV_LINKS = [
  { to: "/", label: "Biblioteca" },
  { to: "/stats", label: "Estatísticas" },
  { to: "/settings", label: "Configurações" },
] as const;

type BackTarget = { type: "home" } | { type: "game-detail"; gameId: string };

function resolveBackTarget(pathname: string): BackTarget | null {
  // Home não mostra botão de voltar
  if (pathname === "/") return null;

  // /games/:id/edit volta para /games/:id
  const editMatch = pathname.match(/^\/games\/(\d+)\/edit\/?$/);
  const gameId = editMatch?.[1];
  if (gameId) return { type: "game-detail", gameId };

  // Qualquer outra rota não-home volta para a biblioteca
  return { type: "home" };
}

export function SiteHeader() {
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = useLocation({ select: (loc) => loc.pathname });
  const backTarget = resolveBackTarget(pathname);

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background">
      <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-3 px-4 py-3">
        {/* Esquerda: voltar (condicional) + logo */}
        <div className="flex min-w-0 items-center gap-1 sm:gap-2">
          {backTarget && (
            <Button
              asChild
              variant="ghost"
              size="icon"
              className="h-9 w-9 shrink-0"
              aria-label="Voltar"
            >
              {backTarget.type === "game-detail" ? (
                <Link to="/games/$id" params={{ id: backTarget.gameId }}>
                  <ArrowLeft className="size-5" />
                </Link>
              ) : (
                <Link to="/">
                  <ArrowLeft className="size-5" />
                </Link>
              )}
            </Button>
          )}

          <Link to="/" className="flex shrink-0 items-center gap-2">
            <Logo className="h-8 w-8 sm:h-10 sm:w-10" />
            <span className="font-display text-base font-bold tracking-tight sm:text-lg">
              Game<span className="text-primary">Shelf</span>
            </span>
          </Link>
        </div>

        {/* ----- Navegação desktop (>= 1024px) ----- */}
        <nav className="hidden items-center gap-1 lg:flex lg:gap-2">
          {NAV_LINKS.map((link) => (
            <Button key={link.to} asChild variant="ghost" size="sm">
              <Link to={link.to} activeProps={{ className: "text-primary" }}>
                {link.label}
              </Link>
            </Button>
          ))}
          <div className="ml-2 flex items-center gap-2">
            <ThemeToggle />
            <Button asChild size="sm">
              <Link to="/games/new">
                <Plus className="size-4" />
                <span>Novo jogo</span>
              </Link>
            </Button>
          </div>
        </nav>

        {/* ----- Ações mobile/tablet (< 1024px) ----- */}
        <div className="flex items-center gap-1.5 lg:hidden">
          <ThemeToggle />

          {/* Novo jogo: só ícone em mobile, com texto em tablet */}
          <Button asChild size="sm" className="h-9">
            <Link to="/games/new" aria-label="Novo jogo">
              <Plus className="size-4" />
              <span className="hidden sm:inline">Novo jogo</span>
            </Link>
          </Button>

          {/* Menu hamburger */}
          <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" aria-label="Abrir menu" className="h-9 w-9">
                <Menu className="size-5" />
              </Button>
            </SheetTrigger>

            <SheetContent side="right" className="w-72">
              <SheetHeader>
                <SheetTitle className="text-left">Menu</SheetTitle>
              </SheetHeader>

              <nav className="mt-2 flex flex-col gap-1 px-4 pb-4">
                {NAV_LINKS.map((link) => (
                  <Button key={link.to} asChild variant="ghost" className="justify-start text-base">
                    <Link
                      to={link.to}
                      activeProps={{ className: "text-primary" }}
                      onClick={() => setMenuOpen(false)}
                    >
                      {link.label}
                    </Link>
                  </Button>
                ))}
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
