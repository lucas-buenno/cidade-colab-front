import type { Location } from "@/shared/types/colab";

export type LocationFormValue = {
  name: string;
  reference: string;
  street: string;
  number: string;
  neighborhood: string;
  postalCode: string;
  coordinates: [number, number] | null;
};

export const EMPTY_LOCATION: LocationFormValue = {
  name: "",
  reference: "",
  street: "",
  number: "",
  neighborhood: "",
  postalCode: "",
  coordinates: null,
};

export const DEFAULT_MAP_CENTER: [number, number] = [-23.55052, -46.633308];

export function formatLocationName(location: {
  street: string;
  number: string;
  neighborhood: string;
}): string {
  const streetPart = [location.street.trim(), location.number.trim()]
    .filter(Boolean)
    .join(", ");
  const parts = [streetPart, location.neighborhood.trim()].filter(Boolean);
  return parts.join(" — ") || "Local da ocorrência";
}

export function locationCoordinates(
  location: Location | undefined,
): [number, number] | null {
  if (!location) return null;
  if (
    Array.isArray(location.coordinates) &&
    location.coordinates.length === 2 &&
    typeof location.coordinates[0] === "number" &&
    typeof location.coordinates[1] === "number"
  ) {
    return location.coordinates;
  }
  if (
    typeof location.latitude === "number" &&
    typeof location.longitude === "number"
  ) {
    return [location.longitude, location.latitude];
  }
  return null;
}

export function formatLocationAddress(location: Location | undefined): string {
  if (!location) return "";
  if (typeof location.address === "string") return location.address;
  if (location.address && typeof location.address === "object") {
    return formatLocationName({
      street: location.address.street ?? "",
      number: location.address.number ?? "",
      neighborhood: location.address.neighborhood ?? "",
    });
  }
  return location.name ?? "";
}

export function digitsOnly(value: string): string {
  return value.replace(/\D/g, "");
}

export function formatPostalCode(value: string): string {
  const digits = digitsOnly(value).slice(0, 8);
  if (digits.length <= 5) return digits;
  return `${digits.slice(0, 5)}-${digits.slice(5)}`;
}
