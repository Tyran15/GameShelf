import { Link } from "@tanstack/react-router";
import { CalendarPlus, CheckCircle2, Clock, Gamepad2, Trophy } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { StatusBadge } from "@/components/StatusBadge";
import {
  formatDate,
  formatHours,
  formatRating,
  type FeaturedGames as FeaturedGamesData,
} from "@/lib/libraryStats";
import type { Game } from "@/types/game";
import { StatsSection } from "./StatsSection";

interface Highlight {
  key: keyof FeaturedGamesData;
  label: string;
  icon: LucideIcon;
  emptyText: string;
  badge: (game: Game) => string | null;
  detail: (game: Game) => string;
}

const HIGHLIGHTS: Highlight[] = [
  {
    key: "topRated",
    label: "Melhor avaliado",
    icon: Trophy,
    emptyText: "Nenhum jogo avaliado ainda.",
    badge: (game) => (game.rating === null ? null : `★ ${formatRating(game.rating)}`),
    detail: (game) =>
      game.hoursPlayed ? `${formatHours(game.hoursPlayed)} jogadas` : "Sem horas registradas",
  },
  {
    key: "mostPlayed",
    label: "Mais jogado",
    icon: Clock,
    emptyText: "Nenhum jogo com horas registradas.",
    badge: (game) => (game.hoursPlayed ? formatHours(game.hoursPlayed) : null),
    detail: (game) => (game.rating === null ? "Sem nota" : `Nota ${formatRating(game.rating)}`),
  },
  {
    key: "lastCompleted",
    label: "Zerado recentemente",
    icon: CheckCircle2,
    emptyText: "Nenhum jogo zerado ainda.",
    badge: () => null,
    detail: (game) => `Atualizado em ${formatDate(game.updatedAt)}`,
  },
  {
    key: "recentlyAdded",
    label: "Adicionado recentemente",
    icon: CalendarPlus,
    emptyText: "Nenhum jogo cadastrado.",
    badge: () => null,
    detail: (game) => `Adicionado em ${formatDate(game.createdAt)}`,
  },
];

function FeaturedCard({ highlight, game }: { highlight: Highlight; game: Game | null }) {
  const Icon = highlight.icon;

  if (!game) {
    return (
      <div className="flex min-h-48 flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-border bg-surface p-4 text-center">
        <Icon className="size-6 text-muted-foreground" />
        <p className="text-sm font-semibold">{highlight.label}</p>
        <p className="text-xs text-muted-foreground">{highlight.emptyText}</p>
      </div>
    );
  }

  const badge = highlight.badge(game);

  return (
    <Link
      to="/games/$id"
      params={{ id: String(game.id) }}
      className="group flex min-w-0 flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-card transition-all hover:-translate-y-0.5 hover:border-primary/50"
    >
      <div className="relative aspect-[2/3] overflow-hidden bg-secondary">
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
        <div className="absolute inset-0 bg-linear-to-t from-black/85 via-black/20 to-transparent" />

        <span className="absolute left-2 top-2 flex max-w-[calc(100%-1rem)] items-center gap-1 rounded bg-background/80 px-2 py-1 text-[11px] font-semibold backdrop-blur-md">
          <Icon className="size-3.5 shrink-0 text-primary" />
          <span className="truncate">{highlight.label}</span>
        </span>
        {badge ? (
          <span className="absolute right-2 top-10 rounded-full bg-primary px-2 py-0.5 text-xs font-bold text-primary-foreground shadow-md">
            {badge}
          </span>
        ) : null}

        <div className="absolute inset-x-2 bottom-2 text-white">
          <p className="truncate text-[11px] font-semibold text-white/80">
            {game.platform.name} · {game.genre.name}
          </p>
          <h3 className="line-clamp-2 text-sm font-bold">{game.title}</h3>
        </div>
      </div>

      <div className="flex items-center justify-between gap-2 p-3 text-xs text-muted-foreground">
        <span className="min-w-0 truncate">{highlight.detail(game)}</span>
        <StatusBadge status={game.status} className="shrink-0" />
      </div>
    </Link>
  );
}

export function FeaturedGames({
  featured,
  index = 0,
}: {
  featured: FeaturedGamesData;
  index?: number;
}) {
  return (
    <StatsSection icon={Trophy} title="Destaques da biblioteca" index={index}>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {HIGHLIGHTS.map((highlight) => (
          <FeaturedCard key={highlight.key} highlight={highlight} game={featured[highlight.key]} />
        ))}
      </div>
    </StatsSection>
  );
}
