import { useState } from "react";
import { Link, useLocation } from "@tanstack/react-router";
import { ArrowLeft, ChevronDown, LogOut, Menu, Plus, User } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Logo } from "./Logo";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { useLogout, useSession } from "@/hooks/useSession";
import { assetUrl, type AuthUser } from "@/services/auth";

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

/** Foto do usuário. Sem foto (ou se a imagem falhar), o Radix mostra o ícone de reserva. */
function UserAvatar({ user, className = "size-8" }: { user: AuthUser; className?: string }) {
  const src = assetUrl(user.avatarUrl);

  return (
    <Avatar className={className}>
      {src && <AvatarImage src={src} alt="" />}
      <AvatarFallback>
        <User className="size-4 text-muted-foreground" aria-hidden="true" />
      </AvatarFallback>
    </Avatar>
  );
}

/** Menu do usuário no desktop: avatar + nickname abrem um menu com "Sair". */
function DesktopUserMenu() {
  const session = useSession();
  const logout = useLogout();

  if (session.isPending) {
    return <span aria-hidden="true" className="size-8 animate-pulse rounded-full bg-muted" />;
  }
  const user = session.data;
  if (!user) return null;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="h-9 gap-2 px-2" aria-label="Menu do usuário">
          <UserAvatar user={user} className="size-7" />
          <span className="max-w-28 truncate text-sm font-medium">{user.nickname}</span>
          <ChevronDown className="size-3.5 text-muted-foreground" aria-hidden="true" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel className="font-normal">
          <p className="truncate text-sm font-semibold">{user.nickname}</p>
          <p className="truncate text-xs text-muted-foreground">{user.email}</p>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem disabled={logout.isPending} onSelect={() => logout.mutate()}>
          <LogOut className="size-4" aria-hidden="true" />
          Sair
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

/** Rodapé do menu lateral no mobile: quem está logado + botão "Sair". */
function MobileUserFooter() {
  const session = useSession();
  const logout = useLogout();

  const user = session.data;
  if (!user) return null;

  return (
    <div className="mt-auto space-y-3 border-t border-border px-4 pt-4 pb-4">
      <div className="flex items-center gap-3">
        <UserAvatar user={user} className="size-10" />
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold">{user.nickname}</p>
          <p className="truncate text-xs text-muted-foreground">{user.email}</p>
        </div>
      </div>
      <Button
        variant="outline"
        className="w-full gap-2"
        disabled={logout.isPending}
        onClick={() => logout.mutate()}
      >
        <LogOut className="size-4" aria-hidden="true" />
        Sair
      </Button>
    </div>
  );
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
            <DesktopUserMenu />
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

              <MobileUserFooter />
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
