const MOIS = ["janv.", "févr.", "mars", "avr.", "mai", "juin", "juil.", "août", "sept.", "oct.", "nov.", "déc."];

/** "2026-04" → "avr. 2026"; "2026" → "2026". Locale-independent so SSR and client match. */
export function formatMonth(value: string | null | undefined): string {
  if (!value) return "aujourd'hui";
  const [y, m] = value.split("-");
  const idx = Number(m) - 1;
  return m && MOIS[idx] ? `${MOIS[idx]} ${y}` : (y ?? value);
}

export function formatRange(debut: string, fin?: string | null): string {
  return `${formatMonth(debut)} — ${formatMonth(fin)}`;
}
