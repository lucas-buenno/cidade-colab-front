import type { PrepareColabResponse } from "@/shared/types/colab";
import {
  EMPTY_LOCATION,
  type LocationFormValue,
} from "@/shared/utils/location";

const STORAGE_KEY = "cidade-colab.create-draft.v1";

export type CreateColabDraft = {
  title: string;
  description: string;
  categoriesSlugs: string[];
  location: LocationFormValue;
  prepare: PrepareColabResponse | null;
  savedAt: string;
};

function isCoordinates(
  value: unknown,
): value is [number, number] {
  return (
    Array.isArray(value) &&
    value.length === 2 &&
    typeof value[0] === "number" &&
    typeof value[1] === "number"
  );
}

function isLocation(value: unknown): value is LocationFormValue {
  if (!value || typeof value !== "object") return false;
  const loc = value as LocationFormValue;
  return (
    typeof loc.street === "string" &&
    typeof loc.neighborhood === "string" &&
    (loc.coordinates === null || isCoordinates(loc.coordinates))
  );
}

function isPrepare(value: unknown): value is PrepareColabResponse {
  if (!value || typeof value !== "object") return false;
  const prep = value as PrepareColabResponse;
  return (
    typeof prep.imageKey === "string" &&
    typeof prep.colabId === "string" &&
    typeof prep.url === "string"
  );
}

export function readCreateDraft(): CreateColabDraft | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<CreateColabDraft>;
    if (typeof parsed.title !== "string") return null;
    return {
      title: parsed.title,
      description: typeof parsed.description === "string" ? parsed.description : "",
      categoriesSlugs: Array.isArray(parsed.categoriesSlugs)
        ? parsed.categoriesSlugs.filter((slug) => typeof slug === "string")
        : [],
      location: isLocation(parsed.location) ? parsed.location : EMPTY_LOCATION,
      prepare: isPrepare(parsed.prepare) ? parsed.prepare : null,
      savedAt: typeof parsed.savedAt === "string" ? parsed.savedAt : "",
    };
  } catch {
    return null;
  }
}

export function writeCreateDraft(draft: CreateColabDraft): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(draft));
}

export function clearCreateDraft(): void {
  localStorage.removeItem(STORAGE_KEY);
}

export function emptyCreateDraft(): CreateColabDraft {
  return {
    title: "",
    description: "",
    categoriesSlugs: [],
    location: EMPTY_LOCATION,
    prepare: null,
    savedAt: "",
  };
}
