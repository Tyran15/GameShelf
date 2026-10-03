import { Flame } from "lucide-react";
import { formatHours, formatPercent, percentOf, type HoursEntry } from "@/lib/libraryStats";
import { SectionEmpty, StatsSection } from "./StatsSection";

export function HoursPlayedChart({
  entries,
  totalHours,
}: {
  entries: HoursEntry[];
  totalHours: number;
}) {
  const topHours = entries.reduce((sum, entry) => sum + entry.hours, 0);
  const shareLabel =
    entries.length === 1 ? "O jogo mais jogado soma" : `Os ${entries.length} mais jogados somam`;

  return (
    <StatsSection
      icon={Flame}
      title="Tempo investido por título"
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
            {entries.map((entry) => (
              <li key={entry.id}>
                <div className="mb-1 flex items-center justify-between gap-3">
                  <span className="min-w-0 truncate text-sm font-medium" title={entry.title}>
                    {entry.title}
                  </span>
                  <span className="shrink-0 text-sm font-bold text-primary">
                    {formatHours(entry.hours)}
                  </span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full rounded-full bg-linear-to-r from-primary/60 to-primary"
                    style={{ width: `${entry.percentOfTop}%` }}
                  />
                </div>
              </li>
            ))}
          </ul>
          <p className="border-t border-border pt-3 text-xs text-muted-foreground">
            {shareLabel} {formatPercent(percentOf(topHours, totalHours))} do tempo registrado.
          </p>
        </div>
      )}
    </StatsSection>
  );
}
