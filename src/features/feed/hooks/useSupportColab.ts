import { useMutation, useQueryClient, type InfiniteData } from "@tanstack/react-query";
import { supportColab } from "@/features/feed/api";
import { useSupportStore } from "@/features/feed/supportStore";
import { colabQueryKey } from "@/features/colab/hooks/useColab";
import type { AppError } from "@/shared/api/errors";
import type { ColabResponse, FeedPage } from "@/shared/types/colab";

const FEED_QUERY_KEY = ["feed"] as const;

type MutationContext = {
  previousData: InfiniteData<FeedPage> | undefined;
  colabId: string;
  currentlySupported: boolean;
};

function updateFeedItemSupportCount(
  queryClient: ReturnType<typeof useQueryClient>,
  colabId: string,
  delta: number,
) {
  queryClient.setQueryData<InfiniteData<FeedPage>>(FEED_QUERY_KEY, (old) => {
    if (!old) return old;

    return {
      ...old,
      pages: old.pages.map((page) => ({
        ...page,
        items: page.items.map((item) =>
          item.id === colabId
            ? { ...item, supportCount: Math.max(0, item.supportCount + delta) }
            : item,
        ),
      })),
    };
  });

  queryClient.setQueryData<ColabResponse>(colabQueryKey(colabId), (old) => {
    if (!old) return old;
    return {
      ...old,
      supportCount: Math.max(0, old.supportCount + delta),
    };
  });
}

export function useSupportColab() {
  const queryClient = useQueryClient();

  return useMutation<void, AppError, string, MutationContext>({
    mutationFn: supportColab,

    onMutate: async (colabId) => {
      const store = useSupportStore.getState();
      const currentlySupported = store.isSupported(colabId);
      const delta = currentlySupported ? -1 : +1;

      await queryClient.cancelQueries({ queryKey: FEED_QUERY_KEY });
      await queryClient.cancelQueries({ queryKey: colabQueryKey(colabId) });
      const previousData = queryClient.getQueryData<InfiniteData<FeedPage>>(
        FEED_QUERY_KEY,
      );

      updateFeedItemSupportCount(queryClient, colabId, delta);

      if (currentlySupported) {
        store.remove(colabId);
      } else {
        store.add(colabId);
      }

      return { previousData, colabId, currentlySupported };
    },

    onError: (_error, _colabId, context) => {
      if (!context) return;

      const store = useSupportStore.getState();
      const rollbackDelta = context.currentlySupported ? +1 : -1;

      updateFeedItemSupportCount(queryClient, context.colabId, rollbackDelta);

      if (context.currentlySupported) {
        store.add(context.colabId);
      } else {
        store.remove(context.colabId);
      }
    },
  });
}
