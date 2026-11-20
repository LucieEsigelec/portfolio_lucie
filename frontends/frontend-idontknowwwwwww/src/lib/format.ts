const MONTHS = [
  "janv.",
  "févr.",
  "mars",
  "avr.",
  "mai",
  "juin",
  "juil.",
  "août",
  "sept.",
  "oct.",
  "nov.",
  "déc.",
];

/** "2024-09" → "sept. 2024", "2026" → "2026". Unknown formats are returned unchanged. */
export function formatMonth(value?: string | null): string | null {
  if (!value) return null;
  const match = /^(\d{4})(?:-(\d{1,2}))?/.exec(value.trim());
  if (!match) return value;
  const year = match[1] ?? value;
  const month = match[2] ? Number(match[2]) : null;
  if (month && month >= 1 && month <= 12) return `${MONTHS[month - 1]} ${year}`;
  return year;
}

export function formatPeriod(debut?: string | null, fin?: string | null): string {
  const start = formatMonth(debut) ?? "Date inconnue";
  const end = fin ? (formatMonth(fin) ?? fin) : "aujourd'hui";
  return `${start} — ${end}`;
}

export function sortByStartDesc<T extends { debut: string }>(items: T[]): T[] {
  return [...items].sort((a, b) => b.debut.localeCompare(a.debut));
}

export type UsageKind = "projet" | "formation" | "experience" | "autre";

export function usageKind(type: string): UsageKind {
  const n = type
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
  if (n.startsWith("proj")) return "projet";
  if (n.startsWith("form")) return "formation";
  if (n.startsWith("exp")) return "experience";
  return "autre";
}

export const NIVEAUX = ["Débutant", "Intermédiaire", "Avancé", "Expert"] as const;

/** 0 when unknown, 1..4 otherwise. */
export function niveauLevel(niveau?: string | null): number {
  if (!niveau) return 0;
  const index = NIVEAUX.findIndex((n) => n.toLowerCase() === niveau.toLowerCase());
  return index + 1;
}

export function humanizeSlug(slug: string): string {
  const text = slug.replace(/[-_]+/g, " ").trim();
  return text.charAt(0).toUpperCase() + text.slice(1);
}

export function pluralize(count: number, singular: string, plural = `${singular}s`): string {
  return `${count} ${count > 1 ? plural : singular}`;
}
