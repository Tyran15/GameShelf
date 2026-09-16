import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { platformService } from "@/services/platformService";
import type { PlatformInput } from "@/types/platform";

export function usePlatforms() {
  return useQuery({
    queryKey: ["platforms"],
    queryFn: () => platformService.list(),
  });
}

export function useCreatePlatform() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: PlatformInput) => platformService.create(data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["platforms"] }),
  });
}

export function useUpdatePlatform() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: PlatformInput }) =>
      platformService.update(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["platforms"] }),
  });
}

export function useDeletePlatform() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => platformService.remove(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["platforms"] }),
  });
}