type Unit = Intl.RelativeTimeFormatUnit;

const UNITS: Array<[Unit, number]> = [
  ["year", 31_536_000],
  ["month", 2_592_000],
  ["week", 604_800],
  ["day", 86_400],
  ["hour", 3_600],
  ["minute", 60],
  ["second", 1],
];

export function relativeDate(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) {
    return "";
  }

  const now = new Date();
  const diffSeconds = (date.getTime() - now.getTime()) / 1_000;
  const absSeconds = Math.abs(diffSeconds);

  for (const [unit, seconds] of UNITS) {
    if (absSeconds >= seconds || unit === "second") {
      const value = Math.round(diffSeconds / seconds);
      const rtf = new Intl.RelativeTimeFormat("pt-BR", { numeric: "auto" });
      return rtf.format(value, unit);
    }
  }

  return "";
}

export function absoluteDate(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) {
    return iso;
  }

  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}
