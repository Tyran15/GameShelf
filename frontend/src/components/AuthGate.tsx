import type { ReactNode } from "react";
import { Navigate, useLocation } from "@tanstack/react-router";
import { Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useSession } from "@/hooks/useSession";
import { isPublicPath } from "@/lib/publicPaths";

/**
 * Portão de navegação: só mostra as páginas privadas para quem está logado.
 * É experiência de uso, não segurança: quem protege os dados é o backend (requireAuth).
 */
export function AuthGate({ children }: { children: ReactNode }) {
  const pathname = useLocation({ select: (loc) => loc.pathname });
  const session = useSession();

  if (isPublicPath(pathname)) {
    // Quem já está logado não precisa ver login/cadastro.
    if (session.data) return <Navigate to="/" replace />;
    return <>{children}</>;
  }

  if (session.isPending) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <Loader2 className="size-6 animate-spin text-primary" aria-label="Carregando" />
      </div>
    );
  }

  // Erro de rede/servidor não é "deslogado": não redireciona, oferece tentar de novo.
  if (session.isError) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-3 p-6 text-center">
        <p className="text-sm text-muted-foreground">
          Não foi possível verificar sua sessão. O servidor pode estar fora do ar.
        </p>
        <Button variant="outline" onClick={() => session.refetch()}>
          Tentar novamente
        </Button>
      </div>
    );
  }

  if (!session.data) return <Navigate to="/login" replace />;

  return <>{children}</>;
}
