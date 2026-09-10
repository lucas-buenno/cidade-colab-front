import { useQuery } from "@tanstack/react-query";
import { fetchColab } from "@/features/colab/api";
import type { AppError } from "@/shared/api/errors";
import type { ColabResponse } from "@/shared/types/colab";

export const colabQueryKey = (colabId: string) => ["colab", colabId] as const;

export function useColab(colabId: string | undefined) {
  return useQuery<ColabResponse, AppError>({
    queryKey: colabQueryKey(colabId ?? ""),
    queryFn: () => fetchColab(colabId!),
    enabled: Boolean(colabId),
  });
}
