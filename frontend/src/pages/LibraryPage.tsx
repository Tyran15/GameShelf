import { useEffect, useMemo, useState } from "react";
import { Link } from "@tanstack/react-router";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { GameCard } from "@/components/GameCard";
import { GameCardSkeleton } from "@/components/GameCardSkeleton";
import { EmptyState } from "@/components/EmptyState";
import { ErrorState } from "@/components/ErrorState";
import { GameFiltersBar, type FiltersValue } from "@/components/GameFiltersBar";
import { useGames } from "@/hooks/useGames";
import { useGenres } from "@/hooks/useGenres";
import { useSettings } from "@/hooks/useSettings";
import { usePlatforms } from "@/hooks/usePlatforms";
import { LibraryStats } from "@/components/LibraryStats";
import { LIBRARY_GRID_CLASSES, prepareLibraryGames } from "@/lib/libraryView";
import { staggerDelay } from "@/lib/motion";

const EMPTY_FILTERS: FiltersValue = {
  search: "",
  status: "",
  platformId: "",
  genreId: "",
};

export function LibraryPage() {
  const [filters, setFilters] = useState<FiltersValue>(EMPTY_FILTERS);
  const [debouncedSearch, setDebouncedSearch] = useState("");

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(filters.search), 350);
    return () => clearTimeout(timer);
  }, [filters.search]);

  const { settings } = useSettings();
  const platforms = usePlatforms();
  const genres = useGenres();
  const libraryStats = useGames({});
  const games = useGames({
    search: debouncedSearch,
    status: filters.status,
    platformId: filters.platformId,
    genreId: filters.genreId,
  });

  const { visible, hiddenCount } = useMemo(
    () => prepareLibraryGames(games.data ?? [], settings, filters.status),
    [games.data, settings, filters.status],
  );
  const gridClassName = LIBRARY_GRID_CLASSES[settings.density];

  const hasFilters =
    debouncedSearch !== "" ||
    filters.status !== "" ||
    filters.platformId !== "" ||
    filters.genreId !== "";

  return (
    <div className="page-shell space-y-6">
      <header className="animate-fade-up flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold sm:text-4xl">
            Sua <span className="text-gradient-brand">biblioteca</span>
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Organize, avalie e acompanhe o progresso dos seus jogos.
          </p>
        </div>
        <Button asChild>
          <Link to="/games/new">
            <Plus className="size-4" />
            Novo jogo
          </Link>
        </Button>
      </header>

      {libraryStats.data && libraryStats.data.length > 0 ? (
        <LibraryStats games={libraryStats.data} />
      ) : null}

      <div className="animate-fade-up" style={staggerDelay(5)}>
        <GameFiltersBar
          value={filters}
          onChange={setFilters}
          platforms={platforms.data ?? []}
          genres={genres.data ?? []}
        />
      </div>

      {games.isLoading ? (
        <div className={gridClassName}>
          {Array.from({ length: 10 }).map((_, index) => (
            <GameCardSkeleton key={index} />
          ))}
        </div>
      ) : games.isError ? (
        <ErrorState error={games.error} onRetry={() => games.refetch()} />
      ) : (games.data ?? []).length === 0 ? (
        hasFilters ? (
          <EmptyState
            title="Nenhum jogo encontrado"
            description="Tente ajustar a busca ou limpar os filtros aplicados."
            showAction={false}
          />
        ) : (
          <EmptyState
            title="Sua estante está vazia"
            description="Cadastre o primeiro jogo da sua coleção para começar."
          />
        )
      ) : visible.length === 0 ? (
        <EmptyState
          title="Nenhum jogo para exibir"
          description="Os jogos abandonados estão ocultos pelas suas configurações."
          showAction={false}
        />
      ) : (
        <>
          <p className="text-xs uppercase tracking-wide text-muted-foreground">
            {visible.length} {visible.length === 1 ? "jogo" : "jogos"}
            {hiddenCount > 0
              ? ` · ${hiddenCount} ${hiddenCount === 1 ? "abandonado oculto" : "abandonados ocultos"}`
              : null}
          </p>
          <div className={gridClassName}>
            {visible.map((game, index) => (
              <GameCard
                key={game.id}
                game={game}
                className="animate-fade-up"
                style={staggerDelay(index + 6)}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
