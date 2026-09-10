import {
  CircleNotch,
  Keyboard,
  MapPin,
  NavigationArrow,
} from "@phosphor-icons/react";
import L from "leaflet";
import { useEffect, useRef, useState } from "react";
import { TextField } from "@/shared/components/TextField";
import { messages } from "@/shared/i18n/pt-BR";
import { useThemeStore, type ResolvedTheme } from "@/shared/theme/themeStore";
import { lookupPostalCode, reverseGeocode } from "@/shared/utils/geocode";
import {
  DEFAULT_MAP_CENTER,
  digitsOnly,
  formatLocationName,
  formatPostalCode,
  type LocationFormValue,
} from "@/shared/utils/location";

type Props = {
  value: LocationFormValue;
  onChange?: (value: LocationFormValue) => void;
  errors?: {
    street?: string;
    neighborhood?: string;
    coordinates?: string;
    name?: string;
  };
  readOnly?: boolean;
};

const LIGHT_TILES = "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png";
const DARK_TILES =
  "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png";

const LIGHT_ATTRIBUTION =
  '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>';
const DARK_ATTRIBUTION =
  '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>';

function tileOptions(theme: ResolvedTheme) {
  const dark = theme === "dark";
  return {
    url: dark ? DARK_TILES : LIGHT_TILES,
    attribution: dark ? DARK_ATTRIBUTION : LIGHT_ATTRIBUTION,
    maxZoom: 19,
  };
}

const pinIcon = L.divIcon({
  className: "colab-map-pin",
  html: `<span class="colab-map-pin-dot"></span>`,
  iconSize: [16, 16],
  iconAnchor: [8, 8],
});

function hasTypedAddress(value: LocationFormValue): boolean {
  return Boolean(
    value.street.trim() ||
      value.neighborhood.trim() ||
      value.postalCode.trim() ||
      value.number.trim() ||
      value.reference.trim(),
  );
}

export function LocationPicker({
  value,
  onChange,
  errors,
  readOnly = false,
}: Props) {
  const mapNodeRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);
  const placeMarkerRef = useRef<(lat: number, lng: number) => void>(
    () => undefined,
  );
  const fillFromLatLngRef = useRef<(lat: number, lng: number) => void>(
    () => undefined,
  );
  const onChangeRef = useRef(onChange);
  const valueRef = useRef(value);
  const abortRef = useRef<AbortController | null>(null);
  const tileLayerRef = useRef<L.TileLayer | null>(null);
  const resolvedTheme = useThemeStore((state) => state.resolved);
  const [locating, setLocating] = useState(false);
  const [geocoding, setGeocoding] = useState(false);
  const [geoError, setGeoError] = useState<string | undefined>();
  const [manualOpen, setManualOpen] = useState(
    () => readOnly || hasTypedAddress(value),
  );

  onChangeRef.current = onChange;
  valueRef.current = value;

  const emit = (patch: Partial<LocationFormValue>) => {
    if (!onChangeRef.current) return;
    const next = { ...valueRef.current, ...patch };
    if (!patch.name) {
      next.name = formatLocationName(next);
    }
    onChangeRef.current(next);
  };

  const fillFromLatLng = async (lat: number, lng: number) => {
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;
    setGeocoding(true);
    setGeoError(undefined);
    emit({ coordinates: [lng, lat] });

    const result = await reverseGeocode(lat, lng);
    if (controller.signal.aborted) return;
    setGeocoding(false);

    if (!result) {
      setGeoError(messages.create.reverseGeoFailed);
      setManualOpen(true);
      return;
    }

    emit({
      coordinates: [lng, lat],
      street: result.street,
      number: result.number,
      neighborhood: result.neighborhood,
      postalCode: result.postalCode,
      name: result.name,
    });
    setManualOpen(true);
  };

  fillFromLatLngRef.current = fillFromLatLng;

  useEffect(() => {
    const node = mapNodeRef.current;
    if (!node) return;

    const start = valueRef.current.coordinates
      ? ([valueRef.current.coordinates[1], valueRef.current.coordinates[0]] as [
          number,
          number,
        ])
      : DEFAULT_MAP_CENTER;

    const map = L.map(node, {
      zoomControl: true,
      attributionControl: true,
      dragging: !readOnly,
      scrollWheelZoom: !readOnly,
      doubleClickZoom: !readOnly,
      boxZoom: !readOnly,
      keyboard: !readOnly,
    }).setView(start, valueRef.current.coordinates ? 16 : 13);

    const initialTiles = tileOptions(useThemeStore.getState().resolved);
    tileLayerRef.current = L.tileLayer(initialTiles.url, {
      attribution: initialTiles.attribution,
      maxZoom: initialTiles.maxZoom,
    }).addTo(map);

    const placeMarker = (lat: number, lng: number) => {
      if (markerRef.current) {
        markerRef.current.setLatLng([lat, lng]);
      } else {
        markerRef.current = L.marker([lat, lng], {
          icon: pinIcon,
          draggable: !readOnly,
        }).addTo(map);
        if (!readOnly) {
          markerRef.current.on("dragend", () => {
            const pos = markerRef.current?.getLatLng();
            if (!pos) return;
            void fillFromLatLngRef.current(pos.lat, pos.lng);
          });
        }
      }
      map.panTo([lat, lng]);
    };

    if (valueRef.current.coordinates) {
      placeMarker(
        valueRef.current.coordinates[1],
        valueRef.current.coordinates[0],
      );
    }

    if (!readOnly) {
      map.on("click", (event: L.LeafletMouseEvent) => {
        placeMarker(event.latlng.lat, event.latlng.lng);
        void fillFromLatLngRef.current(event.latlng.lat, event.latlng.lng);
      });
    }

    mapRef.current = map;
    placeMarkerRef.current = placeMarker;

    const invalidate = window.setTimeout(() => map.invalidateSize(), 80);

    return () => {
      window.clearTimeout(invalidate);
      abortRef.current?.abort();
      map.remove();
      mapRef.current = null;
      markerRef.current = null;
      tileLayerRef.current = null;
    };
  }, [readOnly]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    const next = tileOptions(resolvedTheme);
    tileLayerRef.current?.remove();
    const layer = L.tileLayer(next.url, {
      attribution: next.attribution,
      maxZoom: next.maxZoom,
    }).addTo(map);
    layer.bringToBack();
    tileLayerRef.current = layer;
  }, [resolvedTheme]);

  useEffect(() => {
    if (!value.coordinates || !mapRef.current) return;
    placeMarkerRef.current(value.coordinates[1], value.coordinates[0]);
  }, [value.coordinates]);

  useEffect(() => {
    if (!manualOpen || !mapRef.current) return;
    const timer = window.setTimeout(() => mapRef.current?.invalidateSize(), 80);
    return () => window.clearTimeout(timer);
  }, [manualOpen]);

  useEffect(() => {
    if (errors?.street || errors?.neighborhood) {
      setManualOpen(true);
    }
  }, [errors?.street, errors?.neighborhood]);

  const useMyLocation = () => {
    if (!navigator.geolocation) {
      setGeoError(messages.create.geoDenied);
      return;
    }
    setLocating(true);
    setGeoError(undefined);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocating(false);
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        placeMarkerRef.current(lat, lng);
        void fillFromLatLng(lat, lng);
      },
      () => {
        setLocating(false);
        setGeoError(messages.create.geoDenied);
      },
      { enableHighAccuracy: true, timeout: 10_000 },
    );
  };

  const applyCep = async (cep: string) => {
    const data = await lookupPostalCode(cep);
    if (!data) return;
    emit({
      postalCode: formatPostalCode(cep),
      street: data.street || valueRef.current.street,
      neighborhood: data.neighborhood || valueRef.current.neighborhood,
      ...(data.coordinates ? { coordinates: data.coordinates } : {}),
    });
  };

  const openManualForm = () => {
    setManualOpen(true);
    window.requestAnimationFrame(() => {
      document.getElementById("location-postalCode")?.focus();
    });
  };

  const busy = locating || geocoding;
  const coordinatesErrorId = errors?.coordinates
    ? "location-coordinates-error"
    : undefined;
  const summary = formatLocationName(value);

  return (
    <fieldset className="min-w-0 rounded-xl border border-border bg-card p-4">
      <legend className="px-1 text-sm font-bold text-foreground">
        {messages.create.locationLabel}
        {readOnly ? null : <span className="text-destructive"> *</span>}
      </legend>

      {readOnly ? (
        <div className="mt-3 space-y-1 text-sm text-foreground">
          {value.name || summary ? (
            <p className="font-bold">{value.name || summary}</p>
          ) : null}
          {value.reference ? (
            <p className="text-muted-foreground">{value.reference}</p>
          ) : null}
        </div>
      ) : (
        <div className="mt-3 flex flex-col gap-2">
          <button
            type="button"
            onClick={useMyLocation}
            disabled={busy}
            className="inline-flex min-h-11 w-fit cursor-pointer items-center gap-2 rounded-lg px-3 text-sm font-bold text-accent transition-opacity duration-200 hover:underline disabled:cursor-not-allowed disabled:opacity-60"
          >
            {busy ? (
              <CircleNotch className="size-4 animate-spin" aria-hidden="true" />
            ) : (
              <NavigationArrow className="size-4" aria-hidden="true" />
            )}
            {locating
              ? messages.create.locating
              : geocoding
                ? messages.create.fillingAddress
                : messages.create.useMyLocation}
          </button>

          {manualOpen ? (
            <button
              type="button"
              onClick={() => setManualOpen(false)}
              className="inline-flex min-h-11 w-fit cursor-pointer items-center gap-2 rounded-lg px-3 text-sm font-bold text-muted-foreground transition-colors duration-200 hover:text-foreground"
            >
              {messages.create.hideAddressForm}
            </button>
          ) : (
            <button
              type="button"
              onClick={openManualForm}
              className="inline-flex min-h-11 w-fit cursor-pointer items-center gap-2 rounded-lg px-3 text-sm font-bold text-accent transition-opacity duration-200 hover:underline"
            >
              <Keyboard className="size-4" aria-hidden="true" />
              {messages.create.enterAddressManually}
            </button>
          )}

          {!manualOpen && hasTypedAddress(value) ? (
            <p className="text-sm text-muted-foreground">{summary}</p>
          ) : null}
        </div>
      )}

      {readOnly || !manualOpen ? null : (
        <div className="mt-3 flex flex-col gap-1">
          <TextField
            id="location-postalCode"
            label={messages.create.postalCode}
            value={value.postalCode}
            inputMode="numeric"
            autoComplete="postal-code"
            onChange={(event) => {
              const next = formatPostalCode(event.target.value);
              emit({ postalCode: next });
              if (digitsOnly(next).length === 8) {
                void applyCep(next);
              }
            }}
            onBlur={() => {
              void applyCep(value.postalCode);
            }}
          />
          <div className="grid gap-3 sm:grid-cols-2">
            <TextField
              id="location-street"
              label={messages.create.street}
              value={value.street}
              error={errors?.street}
              autoComplete="address-line1"
              onChange={(event) => emit({ street: event.target.value })}
            />
            <TextField
              id="location-number"
              label={messages.create.number}
              value={value.number}
              autoComplete="address-line2"
              onChange={(event) => emit({ number: event.target.value })}
            />
          </div>
          <TextField
            id="location-neighborhood"
            label={messages.create.neighborhood}
            value={value.neighborhood}
            error={errors?.neighborhood}
            onChange={(event) => emit({ neighborhood: event.target.value })}
          />
          <TextField
            id="location-reference"
            label={messages.create.reference}
            value={value.reference}
            placeholder={messages.create.referencePlaceholder}
            onChange={(event) => emit({ reference: event.target.value })}
          />
        </div>
      )}

      {readOnly ? null : (
        <p id="location-map-hint" className="mt-3 mb-2 text-sm text-muted-foreground">
          {messages.create.mapHint}
        </p>
      )}

      <div
        className={`mt-3 h-64 overflow-hidden rounded-xl border bg-muted ${
          errors?.coordinates ? "border-destructive" : "border-border"
        }`}
        aria-describedby={
          [!readOnly ? "location-map-hint" : undefined, coordinatesErrorId]
            .filter(Boolean)
            .join(" ") || undefined
        }
      >
        <div ref={mapNodeRef} className="h-full w-full" />
      </div>

      {value.coordinates ? (
        <p className="mt-2 flex items-center gap-1.5 text-sm text-muted-foreground">
          <MapPin className="size-4 shrink-0" aria-hidden="true" />
          <span>
            {value.coordinates[1].toFixed(5)}, {value.coordinates[0].toFixed(5)}{" "}
            (lat, lng)
          </span>
        </p>
      ) : null}

      <p
        id={coordinatesErrorId}
        role={errors?.coordinates || geoError ? "alert" : undefined}
        aria-live="polite"
        className="min-h-5 text-sm text-destructive"
      >
        {errors?.coordinates ?? geoError ?? ""}
      </p>
    </fieldset>
  );
}
