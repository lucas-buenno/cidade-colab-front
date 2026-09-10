import { apiClient } from "@/shared/api/client";
import type { CategoryResponse } from "@/shared/types/colab";

export async function fetchCategories(): Promise<CategoryResponse[]> {
  const { data } = await apiClient.get<CategoryResponse[]>(
    "/v1/categories?includeInactive=false",
  );
  return Array.isArray(data) ? data : [];
}
