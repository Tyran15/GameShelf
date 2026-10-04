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

const DELETE_BATCH_SIZE = 5;

/** Exclui vários jogos em lotes (a API só tem DELETE por id) e informa quantos falharam. */
export function useDeleteAllGames() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (ids: number[]) => {
      let failed = 0;
      for (let start = 0; start < ids.length; start += DELETE_BATCH_SIZE) {
        const batch = ids.slice(start, start + DELETE_BATCH_SIZE);
        const results = await Promise.allSettled(batch.map((id) => gameService.remove(id)));
        failed += results.filter((result) => result.status === "rejected").length;
      }
      return { deleted: ids.length - failed, failed };
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: ["games"] }),
  });
}

export function useDeleteGame() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => gameService.remove(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["games"] }),
  });
}
