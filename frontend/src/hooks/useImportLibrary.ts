import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { ImportPlan } from "@/lib/importLibrary";
import { runLibraryImport } from "@/services/libraryImportService";
import type { Genre } from "@/types/genre";
import type { Platform } from "@/types/platform";

export function useImportLibrary() {
  const queryClient = useQueryClient();
  const [progress, setProgress] = useState({ done: 0, total: 0 });

  const mutation = useMutation({
    mutationFn: ({
      plan,
      existing,
    }: {
      plan: ImportPlan;
      existing: { platforms: Platform[]; genres: Genre[] };
    }) => {
      setProgress({ done: 0, total: plan.toImport.length });
      return runLibraryImport(plan, existing, (done, total) => setProgress({ done, total }));
    },
    onSettled: () =>
      Promise.all([
        queryClient.invalidateQueries({ queryKey: ["games"] }),
        queryClient.invalidateQueries({ queryKey: ["platforms"] }),
        queryClient.invalidateQueries({ queryKey: ["genres"] }),
      ]),
  });

  return { mutation, progress };
}
