import type { Density, LibrarySort, Settings } from "@/lib/settings";
import type { Game, GameStatus } from "@/types/game";

export const LIBRARY_GRID_CLASSES: Record<Density, string> = {
  comfortable: "grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5",
  compact: "grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-6",
};

const collator = new Intl.Collator("pt-BR", { sensitivity: "base" });

function toTime(value: string | null): number | null {
  if (!value) return null;
  const time = Date.parse(value);
  return Number.isNaN(time) ? null : time;
}

/** Ordem decrescente com valores ausentes sempre no fim. */
function compareDescNullsLast(a: number | null, b: number | null): number {
  if (a === null && b === null) return 0;
  if (a === null) return 1;
  if (b === null) return -1;
  return b - a;
}

function compareBy(sort: LibrarySort, a: Game, b: Game): number {
  switch (sort) {
    case "recent":
      return compareDescNullsLast(toTime(a.createdAt), toTime(b.createdAt));
    case "rating":
      return compareDescNullsLast(a.rating, b.rating);
    case "release":
      return compareDescNullsLast(toTime(a.releaseDate), toTime(b.releaseDate));
    case "hours":
      return compareDescNullsLast(a.hoursPlayed, b.hoursPlayed);
    case "title":
      return 0;
  }
}

export function sortGames(games: Game[], sort: LibrarySort): Game[] {
  return [...games].sort(
    (a, b) => compareBy(sort, a, b) || collator.compare(a.title, b.title) || a.id - b.id,
  );
}

/**
 * Aplica as preferências da biblioteca. Jogos abandonados só ficam ocultos quando a pessoa
 * não está filtrando explicitamente por esse status.
 */
export function prepareLibraryGames(
  games: Game[],
  settings: Pick<Settings, "librarySort" | "hideDropped">,
  statusFilter: GameStatus | "",
): { visible: Game[]; hiddenCount: number } {
  const shouldHide = settings.hideDropped && statusFilter !== "DROPPED";
  const visible = shouldHide ? games.filter((game) => game.status !== "DROPPED") : games;
  return {
    visible: sortGames(visible, settings.librarySort),
    hiddenCount: games.length - visible.length,
  };
}
