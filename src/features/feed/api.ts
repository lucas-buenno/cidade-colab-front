import { apiClient } from "@/shared/api/client";
import type { FeedPage } from "@/shared/types/colab";

const DEFAULT_PAGE_SIZE = 20;
const MAX_PAGE_SIZE = 50;

export async function fetchFeedPage(
  pageToken: string | null,
  size: number = DEFAULT_PAGE_SIZE,
): Promise<FeedPage> {
  const safeSize = Math.min(Math.max(size, 1), MAX_PAGE_SIZE);
  const params = new URLSearchParams();
  params.set("size", String(safeSize));
  if (pageToken) {
    params.set("pageToken", pageToken);
  }

  const { data } = await apiClient.get<FeedPage>(`/v1/feed?${params.toString()}`);
  return data;
}

export async function supportColab(colabId: string): Promise<void> {
  await apiClient.put(`/v1/colab/support/${colabId}`);
}
