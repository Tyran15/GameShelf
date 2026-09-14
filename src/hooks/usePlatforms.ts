import { useQuery } from "@tanstack/react-query";
import { platformService } from "@/services/platformService";

export function usePlatforms() {
  return useQuery({
    queryKey: ["platforms"],
    queryFn: () => platformService.list(),
  });
}
