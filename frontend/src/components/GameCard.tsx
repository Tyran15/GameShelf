import { Link } from "@tanstack/react-router";
import { Gamepad2 } from "lucide-react";
import { RatingPill } from "./RatingPill";
import { StatusBadge } from "./StatusBadge";
import type { Game } from "@/types/game";

export function GameCard({ game }: { game: Game }) {
  return (
    <Link
      to="/games/$id"
      params={{ id: String(game.id) }}
      className="group flex flex-col overflow-hidden rounded-xl border border-border bg-card shadow-card transition-all hover:-translate-y-0.5 hover:border-primary/50"
    >
      <div className="relative aspect-[3/4] overflow-hidden bg-secondary">
        {game.coverUrl ? (
          <img
            src={game.coverUrl}
            alt={`Capa de ${game.title}`}
            loading="lazy"
            className="size-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex size-full items-center justify-center text-muted-foreground">
            <Gamepad2 className="size-10" />
          </div>
        )}
        <div className="absolute left-2 top-2">
          <StatusBadge status={game.status} className="backdrop-blur-sm" />
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-2 p-3">
        <h3 className="line-clamp-2 text-sm font-semibold leading-snug">
          {game.title}
        </h3>
        <p className="text-xs text-muted-foreground">
          {game.platform?.name} · {game.genre?.name}
        </p>
        <div className="mt-auto pt-1">
          <RatingPill rating={game.rating} />
        </div>
      </div>
    </Link>
  );
}
