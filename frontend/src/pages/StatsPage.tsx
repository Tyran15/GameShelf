import { useMemo, useState } from "react";
import { Monitor, Tag } from "lucide-react";
import { EmptyState } from "@/components/EmptyState";
import { ErrorState } from "@/components/ErrorState";
import { DistributionList } from "@/components/stats/DistributionList";
import { FeaturedGames } from "@/components/stats/FeaturedGames";
import { HoursPlayedChart } from "@/components/stats/HoursPlayedChart";
import { LibraryInsights } from "@/components/stats/LibraryInsights";
import { RatingDistribution } from "@/components/stats/RatingDistribution";
import { StatsSkeleton } from "@/components/stats/StatsSkeleton";
import { StatusDistribution } from "@/components/stats/StatusDistribution";
import { SummaryCards } from "@/components/stats/SummaryCards";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useGames } from "@/hooks/useGames";
import { usePlatforms } from "@/hooks/usePlatforms";
import {
  calculateGenreStats,
  calculateLibraryStats,
  calculatePlatformStats,
  calculateRatingStats,
  calculateStatusDistribution,
  calculateTopHours,
  getFeaturedGames,
} from "@/lib/libraryStats";
import type { Game } from "@/types/game";

const ALL = "ALL";

function buildStats(games: Game[]) {
  const summary = calculateLibraryStats(games);
  const platforms = calculatePlatformStats(games);
  const genres = calculateGenreStats(games);

  return {
    summary,
    platforms,
    genres,
    statuses: calculateStatusDistribution(games),
    hours: calculateTopHours(games, Number.POSITIVE_INFINITY),
    ratings: calculateRatingStats(games),
    featured: getFeaturedGames(games),
  };
}

export function StatsPage() {
  // Mesma query ({}) usada pela Biblioteca: a lista vem do cache do React Query.
  const games = useGames({});
  const platforms = usePlatforms();
  const [platformId, setPlatformId] = useState<number | "">("");

  const allGames = games.data;
  const filteredGames = useMemo(
    () => (allGames ?? []).filter((game) => platformId === "" || game.platformId === platformId),
    [allGames, platformId],
  );
  const stats = useMemo(() => buildStats(filteredGames), [filteredGames]);

  const isFilteredByPlatform = platformId !== "";

  return (
    <div className="page-shell space-y-6">
      <header className="animate-fade-up flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0">
          <h1 className="text-3xl font-bold sm:text-4xl">
            Estatísticas da <span className="text-gradient-brand">biblioteca</span>
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Métricas calculadas a partir dos jogos que você cadastrou: status, horas, plataformas,
            gêneros e notas.
          </p>
        </div>

        {allGames && allGames.length > 0 ? (
          <Select
            value={platformId === "" ? ALL : String(platformId)}
            onValueChange={(value) => setPlatformId(value === ALL ? "" : Number(value))}
          >
            <SelectTrigger className="w-full sm:w-56" aria-label="Filtrar por plataforma">
              <SelectValue placeholder="Plataforma" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL}>Todas as plataformas</SelectItem>
              {(platforms.data ?? []).map((platform) => (
                <SelectItem key={platform.id} value={String(platform.id)}>
                  {platform.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        ) : null}
      </header>

      {games.isPending ? (
        <StatsSkeleton />
      ) : games.isError ? (
        <ErrorState error={games.error} onRetry={() => games.refetch()} />
      ) : !allGames || allGames.length === 0 ? (
        <EmptyState
          title="Ainda não há estatísticas"
          description="Cadastre alguns jogos para gerar as estatísticas da sua biblioteca."
        />
      ) : filteredGames.length === 0 ? (
        <EmptyState
          title="Nenhum jogo nessa plataforma"
          description="Escolha outra plataforma para ver as estatísticas."
          showAction={false}
        />
      ) : (
        <>
          <SummaryCards summary={stats.summary} />

          <div className="grid gap-6 lg:grid-cols-2">
            <StatusDistribution
              slices={stats.statuses}
              totalGames={stats.summary.totalGames}
              completionRate={stats.summary.completionRate}
              index={6}
            />
            <HoursPlayedChart
              entries={stats.hours}
              totalHours={stats.summary.totalHours}
              index={7}
            />
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            {isFilteredByPlatform ? null : (
              <DistributionList
                icon={Monitor}
                title="Jogos por plataforma"
                entries={stats.platforms}
                index={8}
              />
            )}
            <DistributionList
              icon={Tag}
              title="Gêneros mais presentes"
              entries={stats.genres}
              index={9}
              className={isFilteredByPlatform ? "lg:col-span-2" : undefined}
            />
          </div>

          <RatingDistribution
            stats={stats.ratings}
            totalGames={stats.summary.totalGames}
            index={10}
          />

          <FeaturedGames featured={stats.featured} index={11} />

          <LibraryInsights
            summary={stats.summary}
            topPlatform={isFilteredByPlatform ? null : (stats.platforms[0] ?? null)}
            topGenre={stats.genres[0] ?? null}
            index={12}
          />
        </>
      )}
    </div>
  );
}
