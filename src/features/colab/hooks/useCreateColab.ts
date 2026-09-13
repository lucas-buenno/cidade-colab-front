import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createColab } from "@/features/colab/api";
import { SEARCH_QUERY_KEY_PREFIX } from "@/features/search/hooks/useColabSearch";
import type { AppError } from "@/shared/api/errors";
import type { CreateColabRequest } from "@/shared/types/colab";

export const FEED_QUERY_KEY = ["feed"] as const;

export function useCreateColab() {
  const queryClient = useQueryClient();

  return useMutation<void, AppError, CreateColabRequest>({
    mutationFn: createColab,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: FEED_QUERY_KEY });
      void queryClient.invalidateQueries({ queryKey: SEARCH_QUERY_KEY_PREFIX });
    },
  });
}
