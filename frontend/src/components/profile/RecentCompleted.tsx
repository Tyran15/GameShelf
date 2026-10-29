import { Link } from "@tanstack/react-router";
import { ArrowRight, BadgeCheck, Gamepad2, Star } from "lucide-react";
import { formatDate, formatRating } from "@/lib/libraryStats";
import { staggerDelay } from "@/lib/motion";
import type { Game } from "@/types/game";

function CompletedCard({ game, index }: { game: Game; index: number }) {
  return (
    <li className="animate-fade-up" style={staggerDelay(index)}>
      <Link
        to="/games/$id"
        params={{ id: String(game.id) }}
        className="group flex flex-col focus-visible:outline-none"
      >
        <div className="relative aspect-[2/3] overflow-hidden rounded-xl border border-border bg-secondary shadow-card transition-all group-hover:-translate-y-1 group-hover:border-primary/50 group-focus-visible:ring-2 group-focus-visible:ring-ring">
          {game.coverUrl ? (
            <img
              src={game.coverUrl}
              alt={`Capa de ${game.title}`}
              loading="lazy"
              className="size-full object-cover"
            />
          ) : (
            <div className="flex size-full items-center justify-center text-muted-foreground">
              <Gamepad2 className="size-10" aria-hidden="true" />
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent" />

          {game.rating !== null && (
            <span className="absolute right-2 top-2 inline-flex items-center gap-0.5 rounded-full bg-background/80 px-2 py-0.5 text-xs font-semibold text-warning backdrop-blur-sm">
              <Star className="size-3 fill-current" aria-hidden="true" />
              {formatRating(game.rating)}
            </span>
          )}
          <span className="absolute bottom-2 left-2 rounded bg-secondary/90 px-2 py-0.5 text-xs font-medium">
            {game.platform.name}
          </span>
        </div>

        <div className="mt-2 min-w-0">
          <p className="truncate text-sm font-semibold transition-colors group-hover:text-primary">
            {game.title}
          </p>
          <p className="text-xs text-muted-foreground">Zerado em {formatDate(game.updatedAt)}</p>
        </div>
      </Link>
    </li>
  );
}

export function RecentCompleted({ games }: { games: Game[] }) {
  return (
    <section className="space-y-4">
      <header className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <BadgeCheck className="size-6 text-success" aria-hidden="true" />
          <h2 className="text-lg font-semibold">Jogos zerados recentemente</h2>
        </div>
        <Link
          to="/"
          className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
        >
          Ver biblioteca
          <ArrowRight className="size-4" aria-hidden="true" />
        </Link>
      </header>

      {games.length === 0 ? (
        <p className="rounded-xl border border-dashed border-border bg-surface p-6 text-sm text-muted-foreground">
          Você ainda não zerou nenhum jogo. Quando mudar o status de um jogo para “Zerado”, ele
          aparece aqui.
        </p>
      ) : (
        <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
          {games.map((game, index) => (
            <CompletedCard key={game.id} game={game} index={index} />
          ))}
        </ul>
      )}
    </section>
  );
}
