import { useMutation, useQueryClient, type InfiniteData } from "@tanstack/react-query";
import { supportColab } from "@/features/feed/api";
import { colabQueryKey } from "@/features/colab/hooks/useColab";
import { SEARCH_QUERY_KEY_PREFIX } from "@/features/search/hooks/useColabSearch";
import type { AppError } from "@/shared/api/errors";
import type { ColabResponse, FeedPage, SupportResponse } from "@/shared/types/colab";

export const FEED_QUERY_KEY = ["feed"] as const;
export const USER_COLABS_QUERY_KEY_PREFIX = ["colabs", "user"] as const;
export const COLAB_SUPPORT_MUTATION_KEY = ["colab-support"] as const;

export function invalidateColabQueries(
  queryClient: ReturnType<typeof useQueryClient>,
) {
  void queryClient.invalidateQueries({ queryKey: FEED_QUERY_KEY });
  void queryClient.invalidateQueries({ queryKey: SEARCH_QUERY_KEY_PREFIX });
  void queryClient.invalidateQueries({ queryKey: ["colab"] });
  void queryClient.invalidateQueries({ queryKey: USER_COLABS_QUERY_KEY_PREFIX });
}

function patchColabSupport(
  colab: ColabResponse,
  colabId: string,
  support: SupportResponse,
): ColabResponse {
  if (!colab || colab.id !== colabId) return colab;
  return {
    ...colab,
    supportCount: support.supportCount,
    supportedByMe: support.supportedByMe,
  };
}

function applySupportResponse(
  queryClient: ReturnType<typeof useQueryClient>,
  colabId: string,
  support: SupportResponse,
) {
  queryClient.setQueryData<ColabResponse>(colabQueryKey(colabId), (old) =>
    old ? patchColabSupport(old, colabId, support) : old,
  );

  const patchPages = (old: InfiniteData<FeedPage> | undefined) => {
    if (!old) return old;
    return {
      ...old,
      pages: old.pages.map((page) => ({
        ...page,
        items: (page.items ?? []).map((item) =>
          item ? patchColabSupport(item, colabId, support) : item,
        ),
      })),
    };
  };

  queryClient.setQueryData<InfiniteData<FeedPage>>(FEED_QUERY_KEY, patchPages);
  queryClient.setQueriesData<InfiniteData<FeedPage>>(
    { queryKey: SEARCH_QUERY_KEY_PREFIX },
    patchPages,
  );

  queryClient.setQueriesData<ColabResponse[]>(
    { queryKey: USER_COLABS_QUERY_KEY_PREFIX },
    (old) => old?.filter(Boolean).map((item) => patchColabSupport(item, colabId, support)),
  );
}

export function useSupportColab() {
  const queryClient = useQueryClient();

  return useMutation<SupportResponse, AppError, string>({
    mutationKey: COLAB_SUPPORT_MUTATION_KEY,
    mutationFn: supportColab,
    onMutate: async (colabId) => {
      await queryClient.cancelQueries({ queryKey: FEED_QUERY_KEY });
      await queryClient.cancelQueries({ queryKey: SEARCH_QUERY_KEY_PREFIX });
      await queryClient.cancelQueries({ queryKey: colabQueryKey(colabId) });
      await queryClient.cancelQueries({ queryKey: USER_COLABS_QUERY_KEY_PREFIX });
    },
    onSuccess: (support, colabId) => {
      applySupportResponse(queryClient, colabId, support);
    },
  });
}
