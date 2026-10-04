import { Flame } from "lucide-react";
import { formatHours, formatPercent, percentOf, type HoursEntry } from "@/lib/libraryStats";
import { staggerMs } from "@/lib/motion";
import { StatsDetailsDialog } from "./StatsDetailsDialog";
import { SectionEmpty, StatsSection } from "./StatsSection";

function HoursRow({
  entry,
  rank,
  detail,
  delayMs,
}: {
  entry: HoursEntry;
  rank?: number | undefined;
  detail?: string | undefined;
  /** Atraso da animação da barra. */
  delayMs: number;
}) {
  return (
    <li>
      <div className="mb-1 flex items-center justify-between gap-3">
        <span className="flex min-w-0 items-center gap-2 text-sm font-medium">
          {rank !== undefined ? (
            <span className="w-7 shrink-0 text-xs tabular-nums text-muted-foreground">{rank}º</span>
          ) : null}
          <span className="truncate" title={entry.title}>
            {entry.title}
          </span>
        </span>
        <span className="flex shrink-0 items-baseline gap-2">
          <span className="text-sm font-bold text-primary">{formatHours(entry.hours)}</span>
          {detail ? (
            <span className="w-12 text-right text-xs text-muted-foreground">{detail}</span>
          ) : null}
        </span>
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
        <div
          className="animate-grow-x h-full rounded-full bg-linear-to-r from-primary/60 to-primary transition-[width] duration-500 motion-reduce:transition-none"
          style={{ width: `${entry.percentOfTop}%`, animationDelay: `${delayMs}ms` }}
        />
      </div>
    </li>
  );
}

/** `entries` traz todos os jogos com horas (do maior para o menor); o card mostra só o top `limit`. */
export function HoursPlayedChart({
  entries,
  totalHours,
  limit = 5,
  index = 0,
}: {
  entries: HoursEntry[];
  totalHours: number;
  limit?: number;
  index?: number;
}) {
  const visible = entries.slice(0, limit);
  const hasMore = entries.length > visible.length;
  const topHours = visible.reduce((sum, entry) => sum + entry.hours, 0);
  const shareLabel =
    visible.length === 1 ? "O jogo mais jogado soma" : `Os ${visible.length} mais jogados somam`;

  return (
    <StatsSection
      icon={Flame}
      title="Tempo investido por título"
      index={index}
      aside={
        entries.length > 0 ? (
          <span className="text-right">
            Total registrado
            <span className="block font-display text-sm font-bold text-primary">
              {formatHours(totalHours)}
            </span>
          </span>
        ) : null
      }
    >
      {entries.length === 0 ? (
        <SectionEmpty>Nenhum jogo com horas registradas ainda.</SectionEmpty>
      ) : (
        <div className="space-y-4">
          <ul className="space-y-3.5">
            {visible.map((entry, row) => (
              <HoursRow key={entry.id} entry={entry} delayMs={staggerMs(index, 200 + row * 70)} />
            ))}
          </ul>
          <div className="space-y-3 border-t border-border pt-3">
            <p className="text-xs text-muted-foreground">
              {shareLabel} {formatPercent(percentOf(topHours, totalHours))} do tempo registrado.
            </p>
            {hasMore ? (
              <StatsDetailsDialog
                title="Tempo investido por título"
                description={`${entries.length} jogos com horas registradas · ${formatHours(totalHours)} no total`}
              >
                <ul className="space-y-3.5">
                  {entries.map((entry, row) => (
                    <HoursRow
                      key={entry.id}
                      entry={entry}
                      rank={row + 1}
                      delayMs={200 + Math.min(row, 8) * 70}
                      detail={formatPercent(percentOf(entry.hours, totalHours))}
                    />
                  ))}
                </ul>
              </StatsDetailsDialog>
            ) : null}
          </div>
        </div>
      )}
    </StatsSection>
  );
}
