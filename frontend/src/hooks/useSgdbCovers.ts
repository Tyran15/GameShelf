import { useQuery } from "@tanstack/react-query";
import { request } from "@/services/api";

const MIN_QUERY_LENGTH = 3;
const STALE_TIME = 1000 * 60 * 60 * 24; // 24 horas

export type SgdbGame = {
  id: number;
  name: string;
  releaseYear: number | null;
};

export type SgdbCover = {
  id: number;
  url: string;
  thumbUrl: string;
  width: number;
  height: number;
  mime: string;
  author: string;
};

type SgdbSearchResponse = {
  games: SgdbGame[];
};

type SgdbCoversResponse = {
  covers: SgdbCover[];
};

export function useSgdbSearch(query: string, enabled: boolean) {
  const trimmed = query.trim();
  const canSearch = enabled && trimmed.length >= MIN_QUERY_LENGTH;

  return useQuery({
    queryKey: ["sgdb-search", trimmed],
    queryFn: () =>
      request<SgdbSearchResponse>("/sgdb/search", { query: { q: trimmed } }),
    enabled: canSearch,
    staleTime: STALE_TIME,
  });
}

export function useSgdbCovers(gameId: number | null) {
  return useQuery({
    queryKey: ["sgdb-covers", gameId],
    queryFn: () =>
      request<SgdbCoversResponse>(`/sgdb/games/${gameId}/covers`),
    enabled: typeof gameId === "number" && gameId > 0,
    staleTime: STALE_TIME,
  });
}