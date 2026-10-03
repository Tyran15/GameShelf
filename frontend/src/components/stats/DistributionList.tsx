import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatPercent, type CountEntry } from "@/lib/libraryStats";
import { SectionEmpty, StatsSection } from "./StatsSection";

const BAR_COLORS = [
  "bg-primary",
  "bg-success",
  "bg-warning",
  "bg-violet",
  "bg-info",
  "bg-destructive",
] as const;

/**
 * Lista com barras de participação (nome, quantidade, percentual).
 * Usada tanto para plataformas quanto para gêneros.
 */
export function DistributionList({
  icon,
  title,
  entries,
  limit = 6,
  className,
}: {
  icon: LucideIcon;
  title: string;
  entries: CountEntry[];
  limit?: number;
  className?: string | undefined;
}) {
  const visible = entries.slice(0, limit);
  const hidden = entries.length - visible.length;

  return (
    <StatsSection
      icon={icon}
      title={title}
      className={className}
      aside={`${entries.length} ${entries.length === 1 ? "item" : "itens"}`}
    >
      {entries.length === 0 ? (
        <SectionEmpty>Nenhum dado disponível.</SectionEmpty>
      ) : (
        <div className="space-y-4">
          <ul className="space-y-3.5">
            {visible.map((entry, index) => (
              <DistributionRow
                key={entry.name}
                entry={entry}
                color={BAR_COLORS[index % BAR_COLORS.length]}
              />
            ))}
          </ul>
          {hidden > 0 ? (
            <p className="border-t border-border pt-3 text-xs text-muted-foreground">
              + {hidden} {hidden === 1 ? "outro" : "outros"} fora do top {limit}.
            </p>
          ) : null}
        </div>
      )}
    </StatsSection>
  );
}

function DistributionRow({ entry, color }: { entry: CountEntry; color: string | undefined }) {
  return (
    <li>
      <div className="mb-1.5 flex items-center justify-between gap-3">
        <span className="flex min-w-0 items-center gap-2 text-sm font-medium">
          <span className={cn("size-2 shrink-0 rounded-full", color)} />
          <span className="truncate" title={entry.name}>
            {entry.name}
          </span>
        </span>
        <span className="flex shrink-0 items-baseline gap-2">
          <span className="text-sm font-bold">{entry.count}</span>
          <span className="w-12 text-right text-xs text-muted-foreground">
            {formatPercent(entry.percent)}
          </span>
        </span>
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
        <div className={cn("h-full rounded-full", color)} style={{ width: `${entry.percent}%` }} />
      </div>
    </li>
  );
}
