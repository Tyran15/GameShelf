import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { gameService } from "@/services/gameService";
import type { GameFilters, GameInput } from "@/types/game";

export function useGames(filters: GameFilters) {
  return useQuery({
    queryKey: ["games", filters],
    queryFn: () => gameService.list(filters),
  });
}

export function useGame(id: number) {
  return useQuery({
    queryKey: ["games", id],
    queryFn: () => gameService.getById(id),
    enabled: Number.isFinite(id),
    retry: false,
  });
}

export function useCreateGame() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: GameInput) => gameService.create(data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["games"] }),
  });
}

export function useUpdateGame(id: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: GameInput) => gameService.update(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["games"] }),
  });
}

export function useDeleteGame() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => gameService.remove(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["games"] }),
  });
}
