import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { genreService } from "@/services/genreService";
import type { GenreInput } from "@/types/genre";

export function useGenres() {
  return useQuery({
    queryKey: ["genres"],
    queryFn: () => genreService.list(),
  });
}

export function useCreateGenre() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: GenreInput) => genreService.create(data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["genres"] }),
  });
}

export function useUpdateGenre() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: GenreInput }) => genreService.update(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["genres"] }),
  });
}

export function useDeleteGenre() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => genreService.remove(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["genres"] }),
  });
}