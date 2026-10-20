import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";

import { fetchMe, logoutUser } from "@/services/auth";

export const SESSION_QUERY_KEY = ["session"] as const;

/** Usuário logado (data), null se deslogado, e os estados de carregamento/erro. */
export function useSession() {
  return useQuery({
    queryKey: SESSION_QUERY_KEY,
    queryFn: fetchMe,
    staleTime: 5 * 60 * 1000,
    retry: false,
  });
}

export function useLogout() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: logoutUser,
    onSuccess: () => {
      // Apaga o cache de tudo, menos a sessão, para o próximo usuário não ver dados do anterior.
      queryClient.removeQueries({
        predicate: (query) => query.queryKey[0] !== SESSION_QUERY_KEY[0],
      });
      queryClient.setQueryData(SESSION_QUERY_KEY, null);
      navigate({ to: "/login" });
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : "Não foi possível sair.");
    },
  });
}
