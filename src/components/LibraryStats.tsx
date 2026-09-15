import { CheckCircle2, Heart, LayoutGrid, PlayCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Game } from "@/types/game";

function countByStatus(games: Game[], status: Game["status"]) {
  return games.filter((game) => game.status === status).length;
}

export function LibraryStats({ games }: { games: Game[] }) {
  const stats = [
    {
      label: "Na biblioteca",
      value: games.length,
      icon: LayoutGrid,
      tone: "brand" as const,
    },
    {
      label: "Jogando",
      value: countByStatus(games, "PLAYING"),
      icon: PlayCircle,
      tone: "primary" as const,
    },
    {
      label: "Zerados",
      value: countByStatus(games, "COMPLETED"),
      icon: CheckCircle2,
      tone: "success" as const,
    },
    {
      label: "Lista de desejos",
      value: countByStatus(games, "WISHLIST"),
      icon: Heart,
      tone: "violet" as const,
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {stats.map((stat) => (
        <StatCard key={stat.label} {...stat} />
      ))}
    </div>
  );
}

const ICON_WRAP_STYLES = {
  brand: "bg-gradient-brand text-primary-foreground",
  primary: "bg-primary/15 text-primary",
  success: "bg-success/15 text-success",
  violet: "bg-violet/15 text-violet",
} as const;

function StatCard({
  label,
  value,
  icon: Icon,
  tone,
}: {
  label: string;
  value: number;
  icon: typeof LayoutGrid;
  tone: keyof typeof ICON_WRAP_STYLES;
}) {
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-border bg-surface p-4">
      <span
        className={cn(
          "flex size-10 shrink-0 items-center justify-center rounded-xl",
          ICON_WRAP_STYLES[tone],
        )}
      >
        <Icon className="size-5" />
      </span>
      <div className="min-w-0">
        <p className="text-2xl font-bold leading-none font-display">{value}</p>
        <p className="mt-1 truncate text-xs text-muted-foreground">{label}</p>
      </div>
    </div>
  );
}