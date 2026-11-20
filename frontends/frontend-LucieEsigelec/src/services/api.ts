// Centralised, read-only client for the FastAPI "Portfolio Polyglotte API".
// Every call falls back to demonstration data when the server is unreachable.
import { OWNER_SLUG } from "@/config/site";
import {
  demoCompetences,
  demoPersonne,
  demoProjetDetail,
  demoProjets,
  demoSimilaires,
  demoStatsCategories,
  demoTopCompetences,
} from "./demo-data";
import type {
  Competence,
  Personne,
  PersonneDetail,
  Projet,
  ProjetDetail,
  ProjetSimilaire,
  Sourced,
  StatCategorieCompetence,
  TopCompetence,
} from "./types";

export const API_URL: string = (import.meta.env["VITE_API_URL"] as string | undefined) || "http://localhost:8000";

const TIMEOUT_MS = 3500;

async function getJson<T>(path: string): Promise<T> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const res = await fetch(`${API_URL}${path}`, {
      signal: controller.signal,
      headers: { Accept: "application/json" },
    });
    if (!res.ok) throw new Error(`HTTP ${res.status} on ${path}`);
    return (await res.json()) as T;
  } finally {
    clearTimeout(timer);
  }
}

/** Fetch `path`; on any network/HTTP error, return the demo value instead. */
export async function withFallback<T>(path: string, demo: () => T): Promise<Sourced<T>> {
  try {
    const data = await getJson<T>(path);
    return { data, source: "api" };
  } catch {
    return { data: demo(), source: "demo" };
  }
}

export const api = {
  health: () => withFallback<{ status: string }>("/api/health", () => ({ status: "demo" })),

  competences: () => withFallback<Competence[]>("/api/competences", () => demoCompetences),

  statsCategories: () =>
    withFallback<StatCategorieCompetence[]>("/api/competences/stats/categories", demoStatsCategories),

  topCompetences: async (limit = 8): Promise<Sourced<TopCompetence[]>> => {
    const res = await withFallback<unknown>(`/api/competences/stats/top?limit=${limit}`, () =>
      demoTopCompetences(limit),
    );
    return { source: res.source, data: normalizeTop(res.data) };
  },

  personne: async (): Promise<Sourced<PersonneDetail>> => {
    const direct = await withFallback<PersonneDetail | null>(`/api/personnes/${OWNER_SLUG}`, () => null);
    if (direct.data?.profil) return direct as Sourced<PersonneDetail>;
    const list = await withFallback<Personne[]>("/api/personnes", () => []);
    const owner =
      list.data.find((p) => p.prenom?.toLowerCase() === "lucie") ?? list.data[0];
    if (list.source === "api" && owner) {
      const detail = await withFallback<PersonneDetail | null>(`/api/personnes/${owner.slug}`, () => ({
        profil: owner,
      }));
      if (detail.data?.profil) return detail as Sourced<PersonneDetail>;
    }
    return { data: demoPersonne, source: "demo" };
  },

  projets: (competence?: string) =>
    withFallback<Projet[]>(
      competence ? `/api/projets?competence=${encodeURIComponent(competence)}` : "/api/projets",
      () => (competence ? demoProjets.filter((p) => p.skills_slugs?.includes(competence)) : demoProjets),
    ),

  projet: async (slug: string): Promise<Sourced<ProjetDetail | null>> => {
    const res = await withFallback<ProjetDetail | null>(`/api/projets/${encodeURIComponent(slug)}`, () =>
      demoProjetDetail(slug),
    );
    if (res.source === "api" && res.data && !(res.data.projets_similaires?.length)) {
      const sim = await api.similaires(slug);
      if (sim.source === "api") res.data = { ...res.data, projets_similaires: sim.data };
    }
    return res;
  },

  similaires: (slug: string, limit = 3) =>
    withFallback<ProjetSimilaire[]>(
      `/api/graph/projets/${encodeURIComponent(slug)}/similaires?limit=${limit}`,
      () => demoSimilaires(slug, limit),
    ),
};

/** /api/competences/stats/top has an untyped schema: accept the common shapes a Cypher query returns. */
export function normalizeTop(raw: unknown): TopCompetence[] {
  const rows: unknown[] = Array.isArray(raw)
    ? raw
    : raw && typeof raw === "object" && Array.isArray((raw as Record<string, unknown>)["items"])
      ? ((raw as Record<string, unknown>)["items"] as unknown[])
      : [];
  return rows
    .map((row): TopCompetence | null => {
      if (!row || typeof row !== "object") return null;
      const r = row as Record<string, unknown>;
      const slug = String(r["slug"] ?? r["competence_slug"] ?? r["competence"] ?? r["nom"] ?? "");
      const nom = String(r["nom"] ?? r["name"] ?? r["competence"] ?? slug);
      const n = Number(
        r["usages"] ?? r["nb_usages"] ?? r["count"] ?? r["total"] ?? r["utilisations"] ?? r["nb"] ?? r["score"] ?? 0,
      );
      if (!slug) return null;
      return { slug, nom, usages: Number.isFinite(n) ? n : 0 };
    })
    .filter((x): x is TopCompetence => x !== null);
}
