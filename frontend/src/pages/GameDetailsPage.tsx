import { useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, Calendar, Clock, Gamepad2, Loader2, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { ErrorState } from "@/components/ErrorState";
import { RatingPill } from "@/components/RatingPill";
import { StatusBadge } from "@/components/StatusBadge";
import { useDeleteGame, useGame } from "@/hooks/useGames";
import { ApiError } from "@/services/api";

function formatDate(value: string | null) {
  if (!value) return "Não informada";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Não informada";
  return date.toLocaleDateString("pt-BR", { timeZone: "UTC" });
}

export function GameDetailsPage({ id }: { id: number }) {
  const navigate = useNavigate();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const { data: game, isLoading, isError, error, refetch } = useGame(id);
  const deleteGame = useDeleteGame();

  if (isLoading) {
    return (
      <div className="page-shell flex justify-center py-24">
        <Loader2 className="size-6 animate-spin text-primary" />
      </div>
    );
  }

  if (isError || !game) {
    const notFound = error instanceof ApiError && error.status === 404;
    return (
      <div className="page-shell space-y-4">
        <BackLink />
        <ErrorState
          error={notFound ? new Error("Jogo não encontrado.") : error}
          onRetry={notFound ? undefined : () => refetch()}
        />
      </div>
    );
  }

  function handleDelete() {
    deleteGame.mutate(game!.id, {
      onSuccess: () => {
        toast.success("Jogo excluído da sua biblioteca.");
        setConfirmOpen(false);
        navigate({ to: "/" });
      },
      onError: (err) =>
        toast.error(
          err instanceof Error ? err.message : "Não foi possível excluir.",
        ),
    });
  }

  return (
    <div className="page-shell space-y-6">
      <BackLink />

      <div className="grid gap-8 md:grid-cols-[300px_1fr]">
        <div className="overflow-hidden rounded-xl border border-border bg-card shadow-card">
          <div className="relative aspect-[2/3] bg-secondary">
            {game.coverUrl ? (
              <>
                <img
                  src={game.coverUrl}
                  alt=""
                  aria-hidden="true"
                  className="absolute inset-0 size-full scale-110 object-cover blur-2xl opacity-50"
                />
                <img
                  src={game.coverUrl}
                  alt={`Capa de ${game.title}`}
                  className="relative size-full object-contain"
                />
              </>
            ) : (
              <div className="flex size-full items-center justify-center text-muted-foreground">
                <Gamepad2 className="size-12" />
              </div>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <StatusBadge status={game.status} />
              <RatingPill rating={game.rating} />
            </div>
            <h1 className="text-3xl font-bold sm:text-4xl">{game.title}</h1>
            <p className="text-sm text-muted-foreground">
              {game.platform?.name} · {game.genre?.name}
            </p>
          </div>

          <dl className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <InfoBlock label="Plataforma" value={game.platform?.name ?? "—"} />
            <InfoBlock label="Gênero" value={game.genre?.name ?? "—"} />
            <InfoBlock
              label="Lançamento"
              value={formatDate(game.releaseDate)}
              icon={<Calendar className="size-3.5" />}
            />
            <InfoBlock
              label="Horas jogadas"
              value={
                game.hoursPlayed !== null && game.hoursPlayed !== undefined
                  ? `${game.hoursPlayed}h`
                  : "—"
              }
              icon={<Clock className="size-3.5" />}
            />
          </dl>

          <div className="rounded-xl border border-border bg-surface p-5">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
              Descrição
            </h2>
            <p className="mt-2 whitespace-pre-line text-sm leading-relaxed">
              {game.description?.trim()
                ? game.description
                : "Nenhuma descrição cadastrada."}
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <Button asChild>
              <Link to="/games/$id/edit" params={{ id: String(game.id) }}>
                <Pencil className="size-4" />
                Editar
              </Link>
            </Button>
            <Button variant="outline" onClick={() => setConfirmOpen(true)}>
              <Trash2 className="size-4" />
              Excluir
            </Button>
          </div>
        </div>
      </div>

      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir “{game.title}”?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação remove o jogo da sua biblioteca e não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteGame.isPending}>
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={(event) => {
                event.preventDefault();
                handleDelete();
              }}
              disabled={deleteGame.isPending}
            >
              {deleteGame.isPending ? (
                <Loader2 className="size-4 animate-spin" />
              ) : null}
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function BackLink() {
  return (
    <Link
      to="/"
      className="inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
    >
      <ArrowLeft className="size-4" />
      Voltar para a biblioteca
    </Link>
  );
}

function InfoBlock({
  label,
  value,
  icon,
}: {
  label: string;
  value: string;
  icon?: React.ReactNode | undefined;
}) {
  return (
    <div className="rounded-lg border border-border bg-surface p-4">
      <dt className="flex items-center gap-1.5 text-xs uppercase tracking-wide text-muted-foreground">
        {icon}
        {label}
      </dt>
      <dd className="mt-1 text-sm font-medium">{value}</dd>
    </div>
  );
}