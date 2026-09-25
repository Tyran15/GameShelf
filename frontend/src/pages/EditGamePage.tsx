import { Link, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { GameForm } from "@/components/GameForm";
import { ErrorState } from "@/components/ErrorState";
import { useGame, useUpdateGame } from "@/hooks/useGames";
import { ApiError } from "@/services/api";

export function EditGamePage({ id }: { id: number }) {
  const navigate = useNavigate();
  const { data: game, isLoading, isError, error, refetch } = useGame(id);
  const updateGame = useUpdateGame(id);

  return (
    <div className="page-shell flex max-w-3xl flex-1 flex-col space-y-6">
      <Link
        to="/games/$id"
        params={{ id: String(id) }}
        className="inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="size-4" />
        Voltar para o jogo
      </Link>

      <div>
        <h1 className="text-3xl font-bold">Editar jogo</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Atualize as informações da sua biblioteca.
        </p>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="size-6 animate-spin text-primary" />
        </div>
      ) : isError || !game ? (
        <ErrorState
          error={
            error instanceof ApiError && error.status === 404
              ? new Error("Jogo não encontrado.")
              : error
          }
          onRetry={() => refetch()}
        />
      ) : (
        <GameForm
          game={game}
          submitLabel="Salvar alterações"
          isSubmitting={updateGame.isPending}
          fieldErrors={
            updateGame.error instanceof ApiError
              ? updateGame.error.errors
              : undefined
          }
          onCancel={() =>
            navigate({ to: "/games/$id", params: { id: String(id) } })
          }
          onSubmit={(data) =>
            updateGame.mutate(data, {
              onSuccess: (updated) => {
                toast.success("Alterações salvas!");
                navigate({
                  to: "/games/$id",
                  params: { id: String(updated.id) },
                });
              },
              onError: (err) =>
                toast.error(
                  err instanceof Error
                    ? err.message
                    : "Não foi possível salvar as alterações.",
                ),
            })
          }
        />
      )}
    </div>
  );
}
