import { findFirstCoverByTitle } from "./sgdb.service";

const RAWG_BASE_URL = "https://api.rawg.io/api/games";
const CACHE_TTL_MS = 1000 * 60 * 60; // 1 hora
const MIN_QUERY_LENGTH = 3;
const MAX_CACHE_SIZE = 100;

type RawgGamePlatform = {
  platform: {
    id: number;
    name: string;
  };
};

type RawgGameGenre = {
  id: number;
  name: string;
};

// Formato bruto (parcial) da resposta da API da RAWG.
// O endpoint /games/{id} retorna campos extras (description_raw).
type RawgGame = {
  id: number;
  name: string;
  released: string | null;
  background_image: string | null;
  rating: number;
  metacritic: number | null;
  playtime: number;
  genres: RawgGameGenre[];
  platforms: RawgGamePlatform[] | null;
  description_raw?: string;
};

type RawgSearchResponse = {
  results: RawgGame[];
};

export type NormalizedGame = {
  rawgId: number;
  title: string;
  releaseDate: string | null;
  coverUrl: string | null;
  rating: number;
  metacritic: number | null;
  averagePlaytime: number;
  genres: string[];
  platforms: string[];
};

export type GameDetails = NormalizedGame & {
  description: string | null;
};

type CacheEntry<T> = {
  data: T;
  expiresAt: number;
};

const searchCache = new Map<string, CacheEntry<NormalizedGame[]>>();
const detailsCache = new Map<number, CacheEntry<GameDetails>>();

function normalizeGame(raw: RawgGame): NormalizedGame {
  return {
    rawgId: raw.id,
    title: raw.name,
    releaseDate: raw.released ?? null,
    coverUrl: raw.background_image ?? null,
    rating: raw.rating ?? 0,
    metacritic: raw.metacritic ?? null,
    averagePlaytime: raw.playtime ?? 0,
    genres: (raw.genres ?? []).map((genre) => genre.name),
    platforms: (raw.platforms ?? []).map((entry) => entry.platform.name),
  };
}

function normalizeGameDetails(raw: RawgGame): GameDetails {
  return {
    ...normalizeGame(raw),
    // description_raw é texto puro; description vem em HTML (evitamos)
    description: raw.description_raw?.trim() || null,
  };
}

function getCacheKey(query: string) {
  return query.trim().toLowerCase();
}

function getFromCache<T>(
  cache: Map<string | number, CacheEntry<T>>,
  key: string | number
): T | null {
  const entry = cache.get(key);

  if (!entry) return null;

  if (entry.expiresAt < Date.now()) {
    cache.delete(key);
    return null;
  }

  return entry.data;
}

function setCache<T>(
  cache: Map<string | number, CacheEntry<T>>,
  key: string | number,
  data: T
) {
  // Evita crescimento ilimitado: remove a entrada mais antiga se cheio
  if (cache.size >= MAX_CACHE_SIZE) {
    const firstKey = cache.keys().next().value;
    if (firstKey !== undefined) cache.delete(firstKey);
  }

  cache.set(key, {
    data,
    expiresAt: Date.now() + CACHE_TTL_MS,
  });
}

function getApiKey(): string {
  const apiKey = process.env.RAWG_API_KEY;
  if (!apiKey) {
    throw new Error("RAWG_API_KEY_NOT_CONFIGURED");
  }
  return apiKey;
}

export async function searchGames(query: string): Promise<NormalizedGame[]> {
  const trimmedQuery = query.trim();

  if (trimmedQuery.length < MIN_QUERY_LENGTH) {
    return [];
  }

  const cacheKey = getCacheKey(trimmedQuery);
  const cached = getFromCache(searchCache, cacheKey);
  if (cached) {
    return cached;
  }

  const url = new URL(RAWG_BASE_URL);
  url.searchParams.set("key", getApiKey());
  url.searchParams.set("search", trimmedQuery);
  url.searchParams.set("page_size", "10");

  const response = await fetch(url.toString());

  if (!response.ok) {
    throw new Error(`RAWG_API_ERROR_${response.status}`);
  }

  const payload = (await response.json()) as RawgSearchResponse;
  const normalized = (payload.results ?? []).map(normalizeGame);

  setCache(searchCache, cacheKey, normalized);

  return normalized;
}

export async function getGameDetails(id: number): Promise<GameDetails> {
  const cached = getFromCache(detailsCache, id);
  if (cached) {
    return cached;
  }

  const url = new URL(`${RAWG_BASE_URL}/${id}`);
  url.searchParams.set("key", getApiKey());

  const response = await fetch(url.toString());

  if (!response.ok) {
    throw new Error(`RAWG_API_ERROR_${response.status}`);
  }

  const payload = (await response.json()) as RawgGame;
  const details = normalizeGameDetails(payload);

  setCache(detailsCache, id, details);

  return details;
}

export type NormalizedGameWithCover = NormalizedGame & {
  /** Capa 2:3 do SteamGridDB. null se não encontrar. */
  sgdbCoverUrl: string | null;
};

const MAX_RESULTS_WITH_COVERS = 6;

export async function searchGamesWithCovers(
  query: string
): Promise<NormalizedGameWithCover[]> {
  const games = await searchGames(query);
  const limited = games.slice(0, MAX_RESULTS_WITH_COVERS);

  const enriched = await Promise.all(
    limited.map(async (game) => {
      const sgdbCoverUrl = await findFirstCoverByTitle(game.title);
      return { ...game, sgdbCoverUrl };
    })
  );

  return enriched;
}