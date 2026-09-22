const RAWG_BASE_URL = "https://api.rawg.io/api/games";
const CACHE_TTL_MS = 1000 * 60 * 60; // 1 hora
const MIN_QUERY_LENGTH = 3;

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

type CacheEntry = {
  data: NormalizedGame[];
  expiresAt: number;
};

const cache = new Map<string, CacheEntry>();

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

function getCacheKey(query: string) {
  return query.trim().toLowerCase();
}

function getFromCache(key: string): NormalizedGame[] | null {
  const entry = cache.get(key);

  if (!entry) return null;

  if (entry.expiresAt < Date.now()) {
    cache.delete(key);
    return null;
  }

  return entry.data;
}

function setCache(key: string, data: NormalizedGame[]) {
  cache.set(key, {
    data,
    expiresAt: Date.now() + CACHE_TTL_MS,
  });
}

export async function searchGames(query: string): Promise<NormalizedGame[]> {
  const trimmedQuery = query.trim();

  if (trimmedQuery.length < MIN_QUERY_LENGTH) {
    return [];
  }

  const cacheKey = getCacheKey(trimmedQuery);
  const cached = getFromCache(cacheKey);
  if (cached) {
    return cached;
  }

  const apiKey = process.env.RAWG_API_KEY;
  if (!apiKey) {
    throw new Error("RAWG_API_KEY_NOT_CONFIGURED");
  }

  const url = new URL(RAWG_BASE_URL);
  url.searchParams.set("key", apiKey);
  url.searchParams.set("search", trimmedQuery);
  url.searchParams.set("page_size", "10");

  const response = await fetch(url.toString());

  if (!response.ok) {
    throw new Error(`RAWG_API_ERROR_${response.status}`);
  }

  const payload = (await response.json()) as RawgSearchResponse;
  const normalized = (payload.results ?? []).map(normalizeGame);

  setCache(cacheKey, normalized);

  return normalized;
}