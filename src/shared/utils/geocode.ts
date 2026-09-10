import { digitsOnly, formatPostalCode } from "@/shared/utils/location";

export type ReverseGeocodeResult = {
  street: string;
  number: string;
  neighborhood: string;
  postalCode: string;
  name: string;
};

export type PostalCodeLookup = {
  street: string;
  neighborhood: string;
  coordinates: [number, number] | null;
};

type BrasilCepResponse = {
  street?: string;
  neighborhood?: string;
  location?: {
    coordinates?: {
      longitude?: string | number;
      latitude?: string | number;
    };
  };
};

type ViaCepResponse = {
  erro?: boolean;
  logradouro?: string;
  bairro?: string;
};

type NominatimResponse = {
  display_name?: string;
  address?: {
    road?: string;
    pedestrian?: string;
    footway?: string;
    residential?: string;
    house_number?: string;
    suburb?: string;
    neighbourhood?: string;
    neighborhood?: string;
    quarter?: string;
    city_district?: string;
    suburb_name?: string;
    postcode?: string;
  };
};

function parseCoord(value: string | number | undefined): number | null {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value.trim()) {
    const parsed = Number.parseFloat(value);
    return Number.isFinite(parsed) ? parsed : null;
  }
  return null;
}

export async function lookupPostalCode(
  cep: string,
): Promise<PostalCodeLookup | null> {
  const digits = digitsOnly(cep);
  if (digits.length !== 8) return null;

  try {
    const response = await fetch(`https://brasilapi.com.br/api/cep/v2/${digits}`);
    if (response.ok) {
      const data = (await response.json()) as BrasilCepResponse;
      const lng = parseCoord(data.location?.coordinates?.longitude);
      const lat = parseCoord(data.location?.coordinates?.latitude);
      return {
        street: data.street ?? "",
        neighborhood: data.neighborhood ?? "",
        coordinates: lng !== null && lat !== null ? [lng, lat] : null,
      };
    }
  } catch {
    // fallback below
  }

  try {
    const response = await fetch(`https://viacep.com.br/ws/${digits}/json/`);
    if (!response.ok) return null;
    const data = (await response.json()) as ViaCepResponse;
    if (data.erro) return null;
    return {
      street: data.logradouro ?? "",
      neighborhood: data.bairro ?? "",
      coordinates: null,
    };
  } catch {
    return null;
  }
}

export async function reverseGeocode(
  lat: number,
  lng: number,
): Promise<ReverseGeocodeResult | null> {
  const params = new URLSearchParams({
    format: "jsonv2",
    lat: String(lat),
    lon: String(lng),
    zoom: "18",
    addressdetails: "1",
    "accept-language": "pt-BR",
  });

  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?${params.toString()}`,
    );
    if (!response.ok) return null;
    const data = (await response.json()) as NominatimResponse;
    const address = data.address;
    if (!address) return null;

    const street =
      address.road ||
      address.pedestrian ||
      address.footway ||
      address.residential ||
      "";
    const neighborhood =
      address.suburb ||
      address.neighbourhood ||
      address.neighborhood ||
      address.quarter ||
      address.city_district ||
      "";

    return {
      street,
      number: address.house_number ?? "",
      neighborhood,
      postalCode: formatPostalCode(address.postcode ?? ""),
      name: data.display_name ?? "",
    };
  } catch {
    return null;
  }
}
