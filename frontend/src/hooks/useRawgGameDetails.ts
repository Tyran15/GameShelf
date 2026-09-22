import { useQuery } from "@tanstack/react-query";
import { request } from "@/services/api";

export type RawgGameDetails = {
  rawgId: number;
  title: string;
  description: string | null;
  releaseDate: string | null;
  coverUrl: string | null;
  rating: number;
  metacritic: number | null;
  averagePlaytime: number;
  genres: string[];
  platforms: string[];
};

type RawgDetailsResponse = {
  game: RawgGameDetails;
};

export function useRawgGameDetails(id: number | null) {
  return useQuery({
    queryKey: ["rawg-details", id],
    queryFn: () => request<RawgDetailsResponse>(`/rawg/games/${id}`),
    enabled: typeof id === "number" && id > 0,
    staleTime: 1000 * 60 * 60, // 1 hora
  });
}