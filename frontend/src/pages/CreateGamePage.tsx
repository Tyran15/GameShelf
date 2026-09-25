import { Link, useNavigate } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { GameForm } from "@/components/GameForm";
import { useCreateGame } from "@/hooks/useGames";
import { ApiError } from "@/services/api";
import { HeroBackground } from "@/components/HeroBackground"; // Certifique-se de importar se for usar fundo dinâmico

export function CreateGamePage() {
  const navigate = useNavigate();
  const createGame = useCreateGame();

  return (
    <div className="relative flex w-full flex-col items-center">
      {/* Se o HeroBackground estiver nesta página, ele vai cobrir exatamente este contêiner */}

      <div className="page-shell z-10 w-full max-w-3xl space-y-6 py-8">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="size-4" />
          Voltar para a biblioteca
        </Link>

        <div>
          <h1 className="text-3xl font-bold">Cadastrar jogo</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Preencha os dados do jogo que você quer adicionar à estante.
          </p>
        </div>

        <GameForm
          submitLabel="Salvar jogo"
          isSubmitting={createGame.isPending}
          fieldErrors={
            createGame.error instanceof ApiError
              ? createGame.error.errors
              : undefined
          }
          onCancel={() => navigate({ to: "/" })}
          onSubmit={(data) =>
            createGame.mutate(data, {
              onSuccess: (game) => {
                toast.success("Jogo cadastrado com sucesso!");
                navigate({ to: "/games/$id", params: { id: String(game.id) } });
              },
              onError: (error) =>
                toast.error(
                  error instanceof Error
                    ? error.message
                    : "Não foi possível salvar o jogo.",
                ),
            })
          }
        />
      </div>
    </div>
  );
}