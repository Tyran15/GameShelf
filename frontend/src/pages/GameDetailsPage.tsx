import { useState } from "react";
import { Link, useNavigate, useParams } from "@tanstack/react-router";
import {
  ArrowLeft,
  Calendar,
  Clock,
  Gamepad2,
  ImagePlus,
  Pencil,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { DeleteGameDialog } from "@/components/DeleteGameDialog";
import { RatingPill } from "@/components/RatingPill";
import { StatusBadge } from "@/components/StatusBadge";
import { useDeleteGame, useGame, useUpdateGame } from "@/hooks/useGames";
import { ExpandableDescription } from "@/components/ExpandableDescription";
import { HeroBackground } from "@/components/HeroBackground";
import { BackgroundSelectorModal } from "@/components/BackgroundSelectorModal";
import { useQueryClient } from "@tanstack/react-query";

export function GameDetailsPage() {
  const { id } = useParams({ from: "/games/$id/" });
  const navigate = useNavigate();
  const { data: game, isLoading, isError } = useGame(Number(id));
  const deleteMutation = useDeleteGame();
  const queryClient = useQueryClient();
  const updateMutation = useUpdateGame(game?.id ?? 0);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [bgModalOpen, setBgModalOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (isLoading) {
    return (
      <div className="mx-auto w-full max-w-6xl px-4 py-8">
        <p className="text-muted-foreground">Carregando...</p>
      </div>
    );
  }

  if (isError || !game) {
    return (
      <div className="mx-auto w-full max-w-6xl px-4 py-8">
        <p className="text-destructive">Jogo não encontrado.</p>
        <Button asChild variant="outline" className="mt-4">
          <Link to="/">Voltar para a biblioteca</Link>
        </Button>
      </div>
    );
  }

  const releaseDate = game.releaseDate
    ? new Date(game.releaseDate).toLocaleDateString("pt-BR")
    : "—";

  const hasHoursPlayed =
    game.hoursPlayed !== null && game.hoursPlayed !== undefined;

  function handleOpenDialog() {
    setErrorMessage(null);
    setDialogOpen(true);
  }

  function handleConfirmDelete() {
    if (!game) return;

    setErrorMessage(null);

    deleteMutation.mutate(game.id, {
      onSuccess: () => {
        setDialogOpen(false);
        navigate({ to: "/" });
      },
      onError: (error) => {
        setErrorMessage(
          error instanceof Error ? error.message : "Erro ao excluir o jogo."
        );
      },
    });
  }

  function handleBackgroundSelect(url: string) {
    if (!game) return;
    updateMutation.mutate(
      {
        title: game.title,
        platformId: game.platformId,
        genreId: game.genreId,
        backgroundUrl: url,
      },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: ["games"] });
          queryClient.invalidateQueries({ queryKey: ["game", game.id] });
        },
      }
    );
  }

  return (
    <div className="relative min-h-[calc(100vh-4rem)] w-full">
      {/* Background full-width, atrás de tudo */}
      <HeroBackground url={game.backgroundUrl} />

      {/* Conteúdo: centralizado, acima do background */}
      <div className="relative z-10 mx-auto w-full max-w-6xl px-4 py-6 sm:py-8">
        <Button asChild variant="ghost" size="sm" className="mb-4 -ml-2">
          <Link to="/">
            <ArrowLeft className="size-4" />
            Voltar para a biblioteca
          </Link>
        </Button>

        <div className="grid gap-6 md:grid-cols-[minmax(200px,280px)_1fr] lg:grid-cols-[340px_1fr] lg:gap-8">
          <div className="mx-auto w-full max-w-[200px] md:mx-0 md:max-w-none">
            <div className="relative">
              <div className="relative aspect-[2/3] overflow-hidden rounded-2xl bg-secondary">
                {game.coverUrl ? (
                  <>
                    <img
                      src={game.coverUrl}
                      alt=""
                      aria-hidden="true"
                      className="absolute inset-0 size-full scale-110 object-cover blur-xl opacity-70"
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

              <div className="pointer-events-none absolute left-2 top-2 z-10">
                <StatusBadge status={game.status} />
              </div>
            </div>
          </div>

          <div className="grid gap-5 sm:gap-6">
            <div className="grid gap-3">
              <div className="flex flex-wrap items-center gap-2">
                {game.rating !== null && game.rating !== undefined && (
                  <RatingPill rating={game.rating} />
                )}
              </div>

              <h1 className="font-display text-2xl font-bold tracking-tight sm:text-3xl lg:text-4xl">
                {game.title}
              </h1>

              <p className="text-sm text-muted-foreground sm:text-base">
                {game.platform.name} · {game.genre.name}
              </p>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4">
              <div className="rounded-xl border border-border bg-surface p-4">
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Plataforma
                </p>
                <p className="mt-1 font-medium">{game.platform.name}</p>
              </div>

              <div className="rounded-xl border border-border bg-surface p-4">
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Gênero
                </p>
                <p className="mt-1 font-medium">{game.genre.name}</p>
              </div>

              <div
                className={`rounded-xl border border-border bg-surface p-4 ${hasHoursPlayed ? "" : "sm:col-span-2"
                  }`}
              >
                <p className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  <Calendar className="size-3.5" />
                  Lançamento
                </p>
                <p className="mt-1 font-medium">{releaseDate}</p>
              </div>

              {hasHoursPlayed ? (
                <div className="rounded-xl border border-border bg-surface p-4">
                  <p className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    <Clock className="size-3.5" />
                    Horas jogadas
                  </p>
                  <p className="mt-1 font-medium">{game.hoursPlayed}h</p>
                </div>
              ) : null}
            </div>

            {game.description && (
              <div className="rounded-xl border border-border bg-surface p-4 sm:p-5">
                <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                  Descrição
                </h2>
                <ExpandableDescription text={game.description} />
              </div>
            )}

            <div className="flex flex-col gap-3 sm:flex-row">
              <Button asChild className="sm:w-auto">
                <Link to="/games/$id/edit" params={{ id: String(game.id) }}>
                  <Pencil className="size-4" />
                  Editar
                </Link>
              </Button>
              <Button
                type="button"
                variant="outline"
                className="sm:w-auto"
                onClick={handleOpenDialog}
              >
                <Trash2 className="size-4" />
                Excluir
              </Button>
            </div>
          </div>
        </div>

        <DeleteGameDialog
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          gameTitle={game.title}
          isPending={deleteMutation.isPending}
          error={errorMessage}
          onConfirm={handleConfirmDelete}
        />
      </div>

      {/* Botão flutuante e modal ficam fora do container de conteúdo */}
      <button
        type="button"
        onClick={() => setBgModalOpen(true)}
        className="fixed bottom-6 right-6 z-50 flex size-12 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg transition hover:scale-105"
        title="Alterar background"
      >
        <ImagePlus className="size-5" />
      </button>

      <BackgroundSelectorModal
        title={game.title}
        currentUrl={game.backgroundUrl}
        open={bgModalOpen}
        onOpenChange={setBgModalOpen}
        onSelect={handleBackgroundSelect}
      />
    </div>
  );
}
