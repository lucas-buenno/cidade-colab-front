import { useQuery } from "@tanstack/react-query";
import { fetchCategories } from "@/features/categories/api";
import type { AppError } from "@/shared/api/errors";
import type { CategoryResponse } from "@/shared/types/colab";

export const CATEGORIES_QUERY_KEY = [
  "categories",
  { includeInactive: false },
] as const;

export function useCategories() {
  return useQuery<CategoryResponse[], AppError>({
    queryKey: CATEGORIES_QUERY_KEY,
    queryFn: fetchCategories,
    staleTime: 5 * 60 * 1000,
  });
}
