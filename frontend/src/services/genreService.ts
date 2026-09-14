import { request } from "./api";
import type { Genre, GenreInput } from "@/types/genre";

export const genreService = {
  list() {
    return request<Genre[]>("/genres");
  },
  getById(id: number) {
    return request<Genre>(`/genres/${id}`);
  },
  create(data: GenreInput) {
    return request<Genre>("/genres", { method: "POST", body: data });
  },
  update(id: number, data: GenreInput) {
    return request<Genre>(`/genres/${id}`, { method: "PUT", body: data });
  },
  remove(id: number) {
    return request<void>(`/genres/${id}`, { method: "DELETE" });
  },
};
