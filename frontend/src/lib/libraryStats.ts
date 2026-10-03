import type { Game, GameStatus } from "@/types/game";

/**
 * Funções puras que transformam a lista de jogos em estatísticas.
 * Nenhuma delas acessa a API, o DOM ou o relógio (a data atual é um parâmetro),
 * então são fáceis de testar e de explicar.
 */

type RatedGame = Game & { rating: number };
type PlayedGame = Game & { hoursPlayed: number };

const isRated = (game: Game): game is RatedGame => typeof game.rating === "number";
const hasHours = (game: Game): game is PlayedGame =>
  typeof game.hoursPlayed === "number" && game.hoursPlayed > 0;

const byDateDesc = (a: string, b: string) => Date.parse(b) - Date.parse(a);

export function percentOf(part: number, total: number): number {
  return total > 0 ? (part / total) * 100 : 0;
}

/* -------------------------------------------------------------------------- */
/* Resumo geral                                                               */
/* -------------------------------------------------------------------------- */

export interface LibrarySummary {
  totalGames: number;
  addedThisMonth: number;
  completedGames: number;
  completionRate: number;
  playingGames: number;
  playingTitles: string[];
  wishlistGames: number;
  /** Jogos pausados + lista de desejos. */
  backlogGames: number;
  totalHours: number;
  gamesWithHours: number;
  averageRating: number | null;
  ratedGames: number;
}

export function calculateLibraryStats(games: Game[], now: Date = new Date()): LibrarySummary {
  const count = (status: GameStatus) => games.filter((game) => game.status === status).length;
  const playing = games.filter((game) => game.status === "PLAYING");
  const rated = games.filter(isRated);

  const completedGames = count("COMPLETED");
  const wishlistGames = count("WISHLIST");

  const addedThisMonth = games.filter((game) => {
    const createdAt = new Date(game.createdAt);
    return createdAt.getFullYear() === now.getFullYear() && createdAt.getMonth() === now.getMonth();
  }).length;

  return {
    totalGames: games.length,
    addedThisMonth,
    completedGames,
    completionRate: percentOf(completedGames, games.length),
    playingGames: playing.length,
    playingTitles: playing.map((game) => game.title),
    wishlistGames,
    backlogGames: wishlistGames + count("PAUSED"),
    totalHours: games.reduce((sum, game) => sum + (game.hoursPlayed ?? 0), 0),
    gamesWithHours: games.filter(hasHours).length,
    averageRating:
      rated.length > 0 ? rated.reduce((sum, game) => sum + game.rating, 0) / rated.length : null,
    ratedGames: rated.length,
  };
}

/* -------------------------------------------------------------------------- */
/* Distribuição por status                                                    */
/* -------------------------------------------------------------------------- */

export interface StatusSlice {
  status: GameStatus;
  count: number;
  percent: number;
}

/** Ordem de exibição no gráfico e na legenda. */
const STATUS_DISPLAY_ORDER: readonly GameStatus[] = [
  "COMPLETED",
  "PLAYING",
  "WISHLIST",
  "PAUSED",
  "DROPPED",
];

export function calculateStatusDistribution(games: Game[]): StatusSlice[] {
  return STATUS_DISPLAY_ORDER.map((status) => {
    const count = games.filter((game) => game.status === status).length;
    return { status, count, percent: percentOf(count, games.length) };
  });
}

/* -------------------------------------------------------------------------- */
/* Horas jogadas                                                              */
/* -------------------------------------------------------------------------- */

export interface HoursEntry {
  id: number;
  title: string;
  hours: number;
  /** Largura da barra: proporção em relação ao jogo com mais horas. */
  percentOfTop: number;
}

export function calculateTopHours(games: Game[], limit = 5): HoursEntry[] {
  const ranked = games
    .filter(hasHours)
    .sort((a, b) => b.hoursPlayed - a.hoursPlayed)
    .slice(0, limit);

  const top = ranked[0];
  if (!top) return [];

  return ranked.map((game) => ({
    id: game.id,
    title: game.title,
    hours: game.hoursPlayed,
    percentOfTop: percentOf(game.hoursPlayed, top.hoursPlayed),
  }));
}

/* -------------------------------------------------------------------------- */
/* Plataformas e gêneros                                                      */
/* -------------------------------------------------------------------------- */

export interface CountEntry {
  name: string;
  count: number;
  percent: number;
}

function countByName(games: Game[], getName: (game: Game) => string): CountEntry[] {
  const counts = new Map<string, number>();
  for (const game of games) {
    const name = getName(game);
    counts.set(name, (counts.get(name) ?? 0) + 1);
  }

  return [...counts.entries()]
    .map(([name, count]) => ({ name, count, percent: percentOf(count, games.length) }))
    .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name, "pt-BR"));
}

export const calculatePlatformStats = (games: Game[]) =>
  countByName(games, (game) => game.platform.name);

export const calculateGenreStats = (games: Game[]) => countByName(games, (game) => game.genre.name);

/* -------------------------------------------------------------------------- */
/* Distribuição de notas                                                      */
/* -------------------------------------------------------------------------- */

export interface RatingBucket {
  rating: number;
  count: number;
}

export interface RatingStats {
  /** Um bucket para cada nota inteira de 0 a 10. */
  buckets: RatingBucket[];
  maxCount: number;
  ratedGames: number;
  average: number | null;
  highest: Game | null;
  lowest: Game | null;
}

/**
 * O rating é Float (0–10). Para o histograma, cada nota é agrupada pelo inteiro
 * mais próximo (7,5 → 8). Média, maior e menor nota usam o valor exato.
 */
export function calculateRatingStats(games: Game[]): RatingStats {
  const rated = games.filter(isRated);
  const buckets: RatingBucket[] = Array.from({ length: 11 }, (_, rating) => ({
    rating,
    count: 0,
  }));

  for (const game of rated) {
    const bucket = buckets[Math.min(10, Math.max(0, Math.round(game.rating)))];
    if (bucket) bucket.count += 1;
  }

  const sorted = [...rated].sort((a, b) => b.rating - a.rating);

  return {
    buckets,
    maxCount: Math.max(0, ...buckets.map((bucket) => bucket.count)),
    ratedGames: rated.length,
    average:
      rated.length > 0 ? rated.reduce((sum, game) => sum + game.rating, 0) / rated.length : null,
    highest: sorted[0] ?? null,
    lowest: sorted[sorted.length - 1] ?? null,
  };
}

/* -------------------------------------------------------------------------- */
/* Destaques                                                                  */
/* -------------------------------------------------------------------------- */

export interface FeaturedGames {
  topRated: Game | null;
  mostPlayed: Game | null;
  /** Aproximação: não há data de conclusão, então usa `updatedAt` entre os zerados. */
  lastCompleted: Game | null;
  recentlyAdded: Game | null;
}

export function getFeaturedGames(games: Game[]): FeaturedGames {
  const topRated = games
    .filter(isRated)
    .sort((a, b) => b.rating - a.rating || (b.hoursPlayed ?? 0) - (a.hoursPlayed ?? 0))[0];

  const mostPlayed = games.filter(hasHours).sort((a, b) => b.hoursPlayed - a.hoursPlayed)[0];

  const lastCompleted = games
    .filter((game) => game.status === "COMPLETED")
    .sort((a, b) => byDateDesc(a.updatedAt, b.updatedAt))[0];

  const recentlyAdded = [...games].sort((a, b) => byDateDesc(a.createdAt, b.createdAt))[0];

  return {
    topRated: topRated ?? null,
    mostPlayed: mostPlayed ?? null,
    lastCompleted: lastCompleted ?? null,
    recentlyAdded: recentlyAdded ?? null,
  };
}

/* -------------------------------------------------------------------------- */
/* Formatação (pt-BR)                                                         */
/* -------------------------------------------------------------------------- */

export function formatNumber(value: number, maximumFractionDigits = 1): string {
  return value.toLocaleString("pt-BR", { maximumFractionDigits });
}

export const formatPercent = (value: number) => `${formatNumber(value)}%`;

export const formatHours = (value: number) => `${formatNumber(value)}h`;

export function formatRating(value: number): string {
  return value.toLocaleString("pt-BR", { minimumFractionDigits: 1, maximumFractionDigits: 1 });
}

export const formatDate = (iso: string) => new Date(iso).toLocaleDateString("pt-BR");
