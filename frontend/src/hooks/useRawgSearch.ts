import { useQuery } from "@tanstack/react-query";
import { request } from "@/services/api";

const MIN_QUERY_LENGTH = 3;

export type RawgGame = {
  rawgId: number;
  title: string;
  releaseDate: string | null;
  coverUrl: string | null;
  rating: number;
  metacritic: number | null;
  averagePlaytime: number;
  genres: string[];
  platforms: string[];
  /** Capa 2:3 do SteamGridDB. null se não encontrada. */
  sgdbCoverUrl: string | null;
};

type RawgSearchResponse = {
  games: RawgGame[];
};

export function useRawgSearch(query: string, enabled: boolean) {
  const trimmed = query.trim();
  const canSearch = enabled && trimmed.length >= MIN_QUERY_LENGTH;

  return useQuery({
    queryKey: ["rawg-search", trimmed],
    queryFn: () =>
      request<RawgSearchResponse>("/rawg/search-with-covers", {
        query: { q: trimmed },
      }),
    enabled: canSearch,
    staleTime: 1000 * 60 * 60,
  });
}