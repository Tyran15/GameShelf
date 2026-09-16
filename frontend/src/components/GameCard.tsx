import { Link } from "@tanstack/react-router";
import { Clock, Gamepad2 } from "lucide-react";
import { RatingPill } from "./RatingPill";
import { StatusBadge } from "./StatusBadge";
import { useGenres } from "@/hooks/useGenres";
import { usePlatforms } from "@/hooks/usePlatforms";
import type { Game } from "@/types/game";

export function GameCard({ game }: { game: Game }) {
  const platforms = usePlatforms();
  const genres = useGenres();

  const platformName = platforms.data?.find(
    (p) => p.id === game.platformId
  )?.name;
  const genreName = genres.data?.find((g) => g.id === game.genreId)?.name;

  return (
    <Link
      to="/games/$id"
      params={{ id: String(game.id) }}
      className="group flex flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-card transition-all hover:-translate-y-0.5 hover:border-primary/50"
    >
      {/* Capa em proporção 2:3 com blur de fundo */}
      <div className="relative aspect-[2/3] overflow-hidden bg-secondary">
        {game.coverUrl ? (
          <>
            {/* Fundo desfocado preenchendo o card */}
            <img
              src={game.coverUrl}
              alt=""
              aria-hidden="true"
              className="absolute inset-0 size-full scale-110 object-cover blur-xl opacity-60"
            />
            {/* Imagem principal, sem corte */}
            <img
              src={game.coverUrl}
              alt={`Capa de ${game.title}`}
              loading="lazy"
              className="relative size-full object-contain transition-transform duration-300 group-hover:scale-105"
            />
          </>
        ) : (
          <div className="flex size-full items-center justify-center text-muted-foreground">
            <Gamepad2 className="size-10" />
          </div>
        )}

        <div className="absolute left-2 top-2">
          <StatusBadge status={game.status} className="backdrop-blur-sm" />
        </div>
      </div>

      {/* Infos do card */}
      <div className="grid gap-1.5 p-3">
        <h3 className="line-clamp-2 text-sm font-semibold">
          {game.title}
        </h3>

        <div className="flex flex-wrap gap-1.5 text-xs text-muted-foreground">
          {platformName ? (
            <span className="rounded bg-muted px-2 py-0.5">
              {platformName}
            </span>
          ) : null}
          {genreName ? (
            <span className="rounded bg-muted px-2 py-0.5">
              {genreName}
            </span>
          ) : null}
        </div>

        {game.rating !== null && game.rating !== undefined ? (
          <div className="flex items-center">
            <RatingPill rating={game.rating} />
          </div>
        ) : null}

        {game.hoursPlayed !== null && game.hoursPlayed !== undefined ? (
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Clock className="size-3" />
            {game.hoursPlayed}h jogadas
          </div>
        ) : null}
      </div>
    </Link>
  );
}