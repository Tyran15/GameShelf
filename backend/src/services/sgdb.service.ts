const SGDB_BASE_URL = "https://www.steamgriddb.com/api/v2";
const CACHE_TTL_MS = 1000 * 60 * 60 * 24;
const MIN_QUERY_LENGTH = 3;
const MAX_CACHE_SIZE = 100;
const COVER_DIMENSIONS = "600x900";
const COVER_FETCH_TIMEOUT_MS = 5000;


type SgdbSearchGame = {
  id: number;
  name: string;
  release_date: number | null;
};

type SgdbSearchResponse = {
  success: boolean;
  data: SgdbSearchGame[];
};

type SgdbGrid = {
  id: number;
  url: string;
  thumb: string;
  width: number;
  height: number;
  mime: string;
  author: { name: string };
  score: number;
};

type SgdbGridsResponse = {
  success: boolean;
  data: SgdbGrid[];
};

export type NormalizedSgdbGame = {
  id: number;
  name: string;
  releaseYear: number | null;
};

export type NormalizedCover = {
  id: number;
  url: string;
  thumbUrl: string;
  width: number;
  height: number;
  mime: string;
  author: string;
};

type CacheEntry<T> = {
  data: T;
  expiresAt: number;
};

const searchCache = new Map<string, CacheEntry<NormalizedSgdbGame[]>>();
const coversCache = new Map<number, CacheEntry<NormalizedCover[]>>();

function normalizeSearchGame(raw: SgdbSearchGame): NormalizedSgdbGame {
  return {
    id: raw.id,
    name: raw.name,
    releaseYear: raw.release_date
      ? new Date(raw.release_date * 1000).getUTCFullYear()
      : null,
  };
}

function normalizeCover(raw: SgdbGrid): NormalizedCover {
  return {
    id: raw.id,
    url: raw.url,
    thumbUrl: raw.thumb,
    width: raw.width,
    height: raw.height,
    mime: raw.mime,
    author: raw.author?.name ?? "",
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
  const apiKey = process.env.STEAMGRIDDB_API_KEY;
  if (!apiKey) {
    throw new Error("SGDB_API_KEY_NOT_CONFIGURED");
  }
  return apiKey;
}

async function sgdbFetch<T>(url: string): Promise<T> {
  const response = await fetch(url, {
    headers: { Authorization: `Bearer ${getApiKey()}` },
  });

  if (!response.ok) {
    throw new Error(`SGDB_API_ERROR_${response.status}`);
  }

  return (await response.json()) as T;
}

export async function searchGames(
  query: string
): Promise<NormalizedSgdbGame[]> {
  const trimmedQuery = query.trim();

  if (trimmedQuery.length < MIN_QUERY_LENGTH) {
    return [];
  }

  const cacheKey = getCacheKey(trimmedQuery);
  const cached = getFromCache(searchCache, cacheKey);
  if (cached) {
    return cached;
  }

  const url = `${SGDB_BASE_URL}/search/autocomplete/${encodeURIComponent(
    trimmedQuery
  )}`;

  const payload = await sgdbFetch<SgdbSearchResponse>(url);
  const normalized = (payload.data ?? []).map(normalizeSearchGame);

  setCache(searchCache, cacheKey, normalized);

  return normalized;
}

export async function getCoversByGameId(
  gameId: number
): Promise<NormalizedCover[]> {
  const cached = getFromCache(coversCache, gameId);
  if (cached) {
    return cached;
  }

  const url = `${SGDB_BASE_URL}/grids/game/${gameId}?dimensions=${COVER_DIMENSIONS}&types=static`;

  const payload = await sgdbFetch<SgdbGridsResponse>(url);
  const normalized = (payload.data ?? [])
    .slice()
    .sort((a, b) => b.score - a.score)
    .map(normalizeCover);

  setCache(coversCache, gameId, normalized);

  return normalized;
}

function normalizeTitle(title: string): string {
  return title.toLowerCase().replace(/[^a-z0-9]/g, "").trim();
}

function titlesMatch(a: string, b: string): boolean {
  const na = normalizeTitle(a);
  const nb = normalizeTitle(b);
  if (!na || !nb) return false;
  return na === nb || na.includes(nb) || nb.includes(na);
}

async function fetchWithTimeout(
  url: string,
  init: RequestInit,
  timeoutMs = COVER_FETCH_TIMEOUT_MS
): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    return await fetch(url, { ...init, signal: controller.signal });
  } finally {
    clearTimeout(timer);
  }
}

/**
 * Busca a melhor capa 2:3 (maior score) para um título.
 * Retorna null se não encontrar nada compatível.
 * Nunca lança erro — falhas são silenciosas (fallback pro frontend).
 */
export async function findFirstCoverByTitle(
  title: string
): Promise<string | null> {
  if (!title.trim()) return null;

  try {
    const apiKey = process.env.STEAMGRIDDB_API_KEY;
    if (!apiKey) return null;

    // 1. Busca o jogo pelo título
    const searchUrl = `https://www.steamgriddb.com/api/v2/search/autocomplete/${encodeURIComponent(
      title
    )}`;

    const searchRes = await fetchWithTimeout(searchUrl, {
      headers: { Authorization: `Bearer ${apiKey}` },
    });

    if (!searchRes.ok) return null;

    const searchData = (await searchRes.json()) as {
      data?: { id: number; name: string }[];
    };

    // 2. Encontra o primeiro resultado com título compatível
    const matched = (searchData.data ?? []).find((g) =>
      titlesMatch(g.name, title)
    );

    if (!matched) return null;

    // 3. Busca as capas 2:3 estáticas
    const coversUrl = `https://www.steamgriddb.com/api/v2/grids/game/${matched.id}?dimensions=600x900&types=static`;

    const coversRes = await fetchWithTimeout(coversUrl, {
      headers: { Authorization: `Bearer ${apiKey}` },
    });

    if (!coversRes.ok) return null;

    const coversData = (await coversRes.json()) as {
      data?: { url: string; score: number }[];
    };

    const covers = (coversData.data ?? []).sort((a, b) => b.score - a.score);

    return covers[0]?.url ?? null;
  } catch {
    return null;
  }
}