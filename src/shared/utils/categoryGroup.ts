const GROUP_LABELS: Record<string, string> = {
  ROADS_AND_SIDEWALKS: "Vias e calçadas",
  LIGHTING: "Iluminação",
  SANITATION: "Saneamento",
  URBAN_CLEANING: "Limpeza urbana",
  GREEN_AREAS: "Áreas verdes",
  PUBLIC_SAFETY: "Segurança pública",
  MOBILITY: "Mobilidade",
  WATER_AND_SEWAGE: "Água e esgoto",
  ELECTRICITY: "Energia",
  OTHERS: "Outros",
  OTHER: "Outros",
};

export function formatCategoryGroup(group: string): string {
  if (GROUP_LABELS[group]) return GROUP_LABELS[group];
  return group
    .replaceAll("_", " ")
    .toLowerCase()
    .replace(/(^|\s)\S/g, (char) => char.toUpperCase());
}
