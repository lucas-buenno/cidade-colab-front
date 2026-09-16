import { messages } from "@/shared/i18n/pt-BR";
import type { AppError } from "@/shared/api/errors";
import type { CategoryResponse, ColabResponse, FeedPage } from "@/shared/types/colab";

function invalidFeedError(): AppError {
  return {
    kind: "unexpected",
    message: messages.errors.unexpected,
    retryable: true,
  };
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function asString(value: unknown): string {
  return typeof value === "string" ? value : typeof value === "number" ? String(value) : "";
}

function normalizeCategory(value: unknown): CategoryResponse | null {
  if (!isPlainObject(value)) return null;
  const slug = asString(value.slug).trim();
  const name = asString(value.name).trim();
  if (!slug && !name) return null;
  return {
    slug: slug || name,
    name: name || slug,
    description: asString(value.description),
    group: asString(value.group),
    keywords: Array.isArray(value.keywords)
      ? value.keywords.filter((item): item is string => typeof item === "string")
      : [],
  };
}

function normalizeColab(value: unknown): ColabResponse | null {
  if (!isPlainObject(value)) return null;
  const id = asString(value.id).trim();
  if (!id) return null;
  return {
    id,
    userId: asString(value.userId),
    username: asString(value.username),
    title: asString(value.title),
    description: asString(value.description),
    categories: Array.isArray(value.categories)
      ? value.categories
          .map(normalizeCategory)
          .filter((item): item is CategoryResponse => item !== null)
      : [],
    status: asString(value.status),
    supportCount:
      typeof value.supportCount === "number" && Number.isFinite(value.supportCount)
        ? value.supportCount
        : 0,
    supportedByMe: value.supportedByMe === true,
    location: isPlainObject(value.location) ? (value.location as ColabResponse["location"]) : {},
    createdAt: asString(value.createdAt),
    updatedAt: asString(value.updatedAt),
    imageUrl: asString(value.imageUrl),
    distanceMeters:
      typeof value.distanceMeters === "number" ? value.distanceMeters : null,
  };
}

function readItemList(data: Record<string, unknown>): unknown[] {
  const list = data.items ?? data.content ?? data.colabs ?? data.data;
  return Array.isArray(list) ? list : [];
}

export function normalizeFeedPage(data: unknown): FeedPage {
  if (!isPlainObject(data)) {
    throw invalidFeedError();
  }

  const token = data.nextPageToken ?? data.next_page_token;
  return {
    items: readItemList(data)
      .map(normalizeColab)
      .filter((item): item is ColabResponse => item !== null),
    nextPageToken: typeof token === "string" && token.trim() ? token : null,
  };
}

export function flattenFeedItems(pages: FeedPage[] | undefined): ColabResponse[] {
  if (!pages) return [];
  return pages.flatMap((page) => page.items ?? []).filter((colab) => Boolean(colab?.id));
}
