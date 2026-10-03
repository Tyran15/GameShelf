import { Activity } from "lucide-react";
import { GAME_STATUS_LABELS, type GameStatus } from "@/types/game";
import { formatPercent, type StatusSlice } from "@/lib/libraryStats";
import { SectionEmpty, StatsSection } from "./StatsSection";

const STATUS_COLORS: Record<GameStatus, { bg: string; stroke: string }> = {
  COMPLETED: { bg: "bg-success", stroke: "stroke-success" },
  PLAYING: { bg: "bg-primary", stroke: "stroke-primary" },
  WISHLIST: { bg: "bg-info", stroke: "stroke-info" },
  PAUSED: { bg: "bg-warning", stroke: "stroke-warning" },
  DROPPED: { bg: "bg-destructive", stroke: "stroke-destructive" },
};

const RADIUS = 62;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

export function StatusDistribution({
  slices,
  totalGames,
  completionRate,
}: {
  slices: StatusSlice[];
  totalGames: number;
  completionRate: number;
}) {
  const visible = slices.filter((slice) => slice.count > 0);

  const segments = visible.reduce<{ slice: StatusSlice; dash: number; offset: number }[]>(
    (acc, slice) => {
      const dash = (CIRCUMFERENCE * slice.percent) / 100;
      const offset = acc.reduce((sum, segment) => sum + segment.dash, 0);
      return [...acc, { slice, dash, offset }];
    },
    [],
  );

  return (
    <StatsSection
      icon={Activity}
      title="Distribuição por status"
      aside={`${totalGames} ${totalGames === 1 ? "título" : "títulos"}`}
    >
      {totalGames === 0 ? (
        <SectionEmpty>Nenhum jogo para exibir.</SectionEmpty>
      ) : (
        <div className="space-y-5">
          <div className="grid items-center gap-5 sm:grid-cols-[auto_1fr]">
            <div className="relative mx-auto size-40">
              <svg
                viewBox="0 0 160 160"
                className="size-full -rotate-90"
                role="img"
                aria-label="Gráfico de distribuição por status"
              >
                <circle
                  cx="80"
                  cy="80"
                  r={RADIUS}
                  fill="none"
                  strokeWidth="18"
                  className="stroke-muted"
                />
                {segments.map(({ slice, dash, offset }) => (
                  <circle
                    key={slice.status}
                    cx="80"
                    cy="80"
                    r={RADIUS}
                    fill="none"
                    strokeWidth="18"
                    strokeDasharray={`${dash} ${CIRCUMFERENCE - dash}`}
                    strokeDashoffset={-offset}
                    className={STATUS_COLORS[slice.status].stroke}
                  />
                ))}
              </svg>
              <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
                <span className="font-display text-xl font-bold">
                  {formatPercent(completionRate)}
                </span>
                <span className="text-[10px] font-semibold uppercase tracking-wide text-success">
                  Zerados
                </span>
              </div>
            </div>

            <ul className="space-y-2">
              {slices.map((slice) => (
                <li
                  key={slice.status}
                  className="flex items-center justify-between gap-3 rounded-lg bg-secondary/60 px-3 py-2"
                >
                  <span className="flex min-w-0 items-center gap-2 text-sm">
                    <span
                      className={`size-2.5 shrink-0 rounded-full ${STATUS_COLORS[slice.status].bg}`}
                    />
                    <span className="truncate">{GAME_STATUS_LABELS[slice.status]}</span>
                  </span>
                  <span className="flex shrink-0 items-baseline gap-2">
                    <span className="text-sm font-bold">{slice.count}</span>
                    <span className="w-12 text-right text-xs text-muted-foreground">
                      {formatPercent(slice.percent)}
                    </span>
                  </span>
                </li>
              ))}
            </ul>
          </div>

          <div className="flex h-2.5 w-full gap-0.5 overflow-hidden rounded-full bg-muted">
            {visible.map((slice) => (
              <div
                key={slice.status}
                className={STATUS_COLORS[slice.status].bg}
                style={{ width: `${slice.percent}%` }}
                title={`${GAME_STATUS_LABELS[slice.status]}: ${formatPercent(slice.percent)}`}
              />
            ))}
          </div>
        </div>
      )}
    </StatsSection>
  );
}
