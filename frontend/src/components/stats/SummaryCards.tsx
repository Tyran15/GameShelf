import { CheckCircle2, Clock, Heart, LayoutGrid, PlayCircle, Star } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatNumber, formatPercent, formatRating, type LibrarySummary } from "@/lib/libraryStats";

const TONES = {
  primary: "bg-primary/15 text-primary",
  success: "bg-success/15 text-success",
  violet: "bg-violet/15 text-violet",
  warning: "bg-warning/15 text-warning",
} as const;

function StatCard({
  label,
  value,
  suffix,
  hint,
  icon: Icon,
  tone,
}: {
  label: string;
  value: string;
  suffix?: string | undefined;
  hint: string;
  icon: LucideIcon;
  tone: keyof typeof TONES;
}) {
  return (
    <div className="flex min-w-0 flex-col justify-between gap-3 rounded-2xl border border-border bg-surface p-4">
      <div className="flex items-center justify-between gap-2">
        <span className="truncate text-xs font-medium text-muted-foreground">{label}</span>
        <span
          className={cn("flex size-8 shrink-0 items-center justify-center rounded-lg", TONES[tone])}
        >
          <Icon className="size-4" />
        </span>
      </div>
      <div className="min-w-0">
        <p className="font-display text-3xl font-bold leading-none">
          {value}
          {suffix ? (
            <span className="ml-1 text-sm font-medium text-muted-foreground">{suffix}</span>
          ) : null}
        </p>
        <p className="mt-1.5 truncate text-xs text-muted-foreground">{hint}</p>
      </div>
    </div>
  );
}

function describePlaying(titles: string[]) {
  if (titles.length === 0) return "nenhum no momento";
  const [first, second] = titles;
  const rest = titles.length - 2;
  if (!second) return `${first}`;
  return rest > 0 ? `${first}, ${second} e +${rest}` : `${first} e ${second}`;
}

export function SummaryCards({ summary }: { summary: LibrarySummary }) {
  const { totalGames } = summary;

  return (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
      <StatCard
        label="Total de jogos"
        value={formatNumber(totalGames)}
        hint={
          summary.addedThisMonth > 0
            ? `+${summary.addedThisMonth} adicionados este mês`
            : "nenhum adicionado este mês"
        }
        icon={LayoutGrid}
        tone="primary"
      />
      <StatCard
        label="Jogos zerados"
        value={formatNumber(summary.completedGames)}
        hint={`${formatPercent(summary.completionRate)} da biblioteca`}
        icon={CheckCircle2}
        tone="success"
      />
      <StatCard
        label="Jogando agora"
        value={formatNumber(summary.playingGames)}
        hint={describePlaying(summary.playingTitles)}
        icon={PlayCircle}
        tone="primary"
      />
      <StatCard
        label="Lista de desejos"
        value={formatNumber(summary.wishlistGames)}
        hint="ainda não jogados"
        icon={Heart}
        tone="violet"
      />
      <StatCard
        label="Horas jogadas"
        value={formatNumber(summary.totalHours)}
        suffix="h"
        hint={
          summary.gamesWithHours === 1
            ? "1 jogo com horas registradas"
            : `${summary.gamesWithHours} jogos com horas registradas`
        }
        icon={Clock}
        tone="primary"
      />
      <StatCard
        label="Nota média"
        value={summary.averageRating === null ? "—" : formatRating(summary.averageRating)}
        suffix={summary.averageRating === null ? undefined : "/ 10"}
        hint={
          summary.ratedGames === 1 ? "1 jogo avaliado" : `${summary.ratedGames} jogos avaliados`
        }
        icon={Star}
        tone="warning"
      />
    </div>
  );
}
