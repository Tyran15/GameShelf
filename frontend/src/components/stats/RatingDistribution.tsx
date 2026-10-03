import { Star } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  formatNumber,
  formatPercent,
  formatRating,
  percentOf,
  type RatingStats,
} from "@/lib/libraryStats";
import { SectionEmpty, StatsSection } from "./StatsSection";

const CHART_HEIGHT = 128;
const MIN_BAR_HEIGHT = 4;

function Metric({
  label,
  value,
  caption,
  valueClassName,
}: {
  label: string;
  value: string;
  caption: string;
  valueClassName?: string;
}) {
  return (
    <div className="min-w-0 rounded-xl bg-secondary/60 p-3">
      <span className="block text-xs text-muted-foreground">{label}</span>
      <p className={cn("font-display text-xl font-bold", valueClassName)}>{value}</p>
      <span className="block truncate text-xs text-muted-foreground" title={caption}>
        {caption}
      </span>
    </div>
  );
}

export function RatingDistribution({
  stats,
  totalGames,
}: {
  stats: RatingStats;
  totalGames: number;
}) {
  const { buckets, maxCount, ratedGames, average, highest, lowest } = stats;

  return (
    <StatsSection
      icon={Star}
      title="Distribuição das avaliações"
      aside={`${ratedGames} de ${totalGames} ${totalGames === 1 ? "jogo avaliado" : "jogos avaliados"} (${formatPercent(
        percentOf(ratedGames, totalGames),
      )})`}
    >
      {average === null || !highest || !lowest ? (
        <SectionEmpty>Nenhum jogo avaliado ainda.</SectionEmpty>
      ) : (
        <div className="grid items-end gap-5 lg:grid-cols-12">
          <div className="grid grid-cols-2 gap-3 lg:col-span-4">
            <Metric
              label="Nota média"
              value={formatRating(average)}
              caption={`${formatNumber(ratedGames)} ${ratedGames === 1 ? "avaliação" : "avaliações"}`}
              valueClassName="text-warning"
            />
            <Metric
              label="Jogos avaliados"
              value={formatNumber(ratedGames)}
              caption={`de ${formatNumber(totalGames)} na biblioteca`}
            />
            <Metric
              label="Maior nota"
              value={formatRating(highest.rating ?? 0)}
              caption={highest.title}
              valueClassName="text-success"
            />
            <Metric
              label="Menor nota"
              value={formatRating(lowest.rating ?? 0)}
              caption={lowest.title}
            />
          </div>

          <div className="min-w-0 rounded-xl bg-background/40 p-4 lg:col-span-8">
            <div className="flex items-end gap-1.5 sm:gap-2">
              {buckets.map((bucket) => {
                const isPeak = bucket.count > 0 && bucket.count === maxCount;
                const height =
                  maxCount > 0
                    ? Math.max(MIN_BAR_HEIGHT, (bucket.count / maxCount) * CHART_HEIGHT)
                    : MIN_BAR_HEIGHT;

                return (
                  <div
                    key={bucket.rating}
                    className="flex min-w-0 flex-1 flex-col items-center justify-end gap-1.5"
                    title={`Nota ${bucket.rating}: ${bucket.count} ${bucket.count === 1 ? "jogo" : "jogos"}`}
                  >
                    <span
                      className={cn(
                        "h-4 text-xs font-semibold",
                        isPeak ? "text-primary" : "text-muted-foreground",
                      )}
                    >
                      {bucket.count > 0 ? bucket.count : ""}
                    </span>
                    <div
                      className={cn(
                        "w-full rounded-t",
                        bucket.count === 0 ? "bg-muted" : isPeak ? "bg-primary" : "bg-primary/40",
                      )}
                      style={{ height }}
                    />
                    <span
                      className={cn(
                        "text-xs",
                        isPeak ? "font-bold text-foreground" : "text-muted-foreground",
                      )}
                    >
                      {bucket.rating}
                    </span>
                  </div>
                );
              })}
            </div>
            <p className="mt-3 text-center text-[11px] text-muted-foreground">
              Notas decimais são agrupadas pelo inteiro mais próximo.
            </p>
          </div>
        </div>
      )}
    </StatsSection>
  );
}
