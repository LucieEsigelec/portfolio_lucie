// Skill category → visual ink + Data/Dev family. Class names are literal so Tailwind keeps them.
export type Family = "Data" | "Dev";

export interface CategoryStyle {
  /** badge background + text */
  badge: string;
  /** small dot */
  dot: string;
  /** CSS colour for charts */
  color: string;
  family: Family;
}

const INKS = {
  petrol: { badge: "bg-petrol text-cream", dot: "bg-petrol", color: "var(--petrol)" },
  terracotta: { badge: "bg-terracotta text-ink", dot: "bg-terracotta", color: "var(--terracotta)" },
  cyan: { badge: "bg-cyan text-ink", dot: "bg-cyan", color: "var(--cyan)" },
  sage: { badge: "bg-sage text-ink", dot: "bg-sage", color: "var(--sage)" },
  coral: { badge: "bg-coral text-ink", dot: "bg-coral", color: "var(--coral)" },
} as const;

type InkName = keyof typeof INKS;
const ORDER: InkName[] = ["petrol", "terracotta", "sage", "cyan", "coral"];

function normalize(s: string) {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

export function categoryFamily(categorie: string | null | undefined): Family {
  const c = normalize(categorie ?? "");
  return /data|ia|\bai\b|base|bdd|donnee|machine|analyt|bi\b|big/.test(c) ? "Data" : "Dev";
}

function inkFor(categorie: string): InkName {
  const c = normalize(categorie);
  if (/langage/.test(c)) return "petrol";
  if (/data|ia|machine|analyt/.test(c)) return "terracotta";
  if (/base|bdd|donnee/.test(c)) return "cyan";
  if (/devops|cloud|outil|infra/.test(c)) return "sage";
  if (/web|dev|front|back|mobile|framework/.test(c)) return "coral";
  let h = 0;
  for (const ch of c) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  return ORDER[h % ORDER.length] ?? "petrol";
}

export function categoryStyle(categorie: string | null | undefined): CategoryStyle {
  const ink = INKS[inkFor(categorie ?? "")];
  return { ...ink, family: categoryFamily(categorie) };
}
