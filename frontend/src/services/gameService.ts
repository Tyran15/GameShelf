import { request } from "./api";
import type { Game, GameFilters, GameInput } from "@/types/game";

export const gameService = {
  list(filters: GameFilters = {}) {
    return request<Game[]>("/games", {
      query: {
        status: filters.status,
        platformId: filters.platformId,
        genreId: filters.genreId,
        search: filters.search,
      },
    });
  },

  getById(id: number) {
    return request<Game>(`/games/${id}`);
  },

  create(data: GameInput) {
    return request<Game>("/games", { method: "POST", body: data });
  },

  update(id: number, data: GameInput) {
    return request<Game>(`/games/${id}`, { method: "PUT", body: data });
  },

  remove(id: number) {
    return request<void>(`/games/${id}`, { method: "DELETE" });
  },
};
