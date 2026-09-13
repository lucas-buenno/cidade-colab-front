import type { CategoryResponse } from "@/shared/types/colab";

const FEATURED_MATCHERS = [
  { slug: "flooding", name: /alagamento|enchente|flood/i },
  { slug: "pothole", name: /buraco|pothole/i },
] as const;

export function pickFeaturedCategories(
  all: CategoryResponse[],
): CategoryResponse[] {
  const picked: CategoryResponse[] = [];

  for (const matcher of FEATURED_MATCHERS) {
    const found =
      all.find((category) => category.slug === matcher.slug) ??
      all.find((category) => matcher.name.test(category.name));
    if (found && !picked.some((item) => item.slug === found.slug)) {
      picked.push(found);
    }
  }

  for (const category of all) {
    if (picked.length >= 2) break;
    if (!picked.some((item) => item.slug === category.slug)) {
      picked.push(category);
    }
  }

  return picked.slice(0, 2);
}
