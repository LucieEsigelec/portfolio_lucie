/**
 * Single entry point for every HTTP call of the app.
 *
 * - Base URL comes exclusively from import.meta.env.VITE_API_URL.
 * - Read-only: only GET requests exist here. No POST, PATCH or DELETE.
 * - Every call has a timeout and typed error handling.
 * - When the API is not configured or unreachable (network error, timeout, 5xx,
 *   invalid JSON), a minimal local fallback is returned TOGETHER WITH the error,
 *   so the UI can always show that fallback data is in use. 4xx errors (e.g. 404)
 *   are never masked by the fallback.
 */
import type {
  Competence,
  CompetenceDetail,
  HealthResponse,
  Personne,
  PersonneDetail,
  Projet,
  ProjetDetail,
  ProjetSimilaire,
  StatCategorieCompetence,
  StatCompetenceProjet,
  TopCompetence,
} from "@/types/api";
import { API_TIMEOUT_MS, PROFILE_SLUG } from "./constants";
import * as fallback from "./fallback";

export { API_TIMEOUT_MS, PROFILE_SLUG } from "./constants";

export type ApiErrorKind = "config" | "timeout" | "network" | "http" | "parse";
export type DataSource = "api" | "fallback";

export interface ApiErrorInfo {
  kind: ApiErrorKind;
  message: string;
  status: number | null;
  path: string;
}

export class ApiError extends Error {
  readonly kind: ApiErrorKind;
  readonly status: number | null;
  readonly path: string;
  /** True when the API was unavailable AND no local fallback exists for this resource. */
  readonly fallbackMissing: boolean;

  constructor(
    kind: ApiErrorKind,
    message: string,
    path: string,
    status: number | null = null,
    fallbackMissing = false,
  ) {
    super(message);
    this.name = "ApiError";
    this.kind = kind;
    this.status = status;
    this.path = path;
    this.fallbackMissing = fallbackMissing;
  }

  toInfo(): ApiErrorInfo {
    return { kind: this.kind, message: this.message, status: this.status, path: this.path };
  }
}

export interface ApiResult<T> {
  data: T;
  source: DataSource;
  /** Non-null whenever `source` is "fallback": the error that triggered it. */
  error: ApiErrorInfo | null;
}

export function getApiBaseUrl(): string | null {
  const raw = import.meta.env.VITE_API_URL;
  if (typeof raw !== "string") return null;
  const trimmed = raw.trim().replace(/\/+$/, "");
  return trimmed.length > 0 ? trimmed : null;
}

async function readErrorDetail(res: Response): Promise<string | null> {
  try {
    const body: unknown = await res.json();
    if (body && typeof body === "object" && "detail" in body) {
      const detail = (body as { detail: unknown }).detail;
      if (typeof detail === "string") return detail;
    }
  } catch {
    // Body is not JSON: ignore, the status code is enough.
  }
  return null;
}

/** Low-level GET with timeout. Throws ApiError on any failure. */
export async function apiGet<T>(path: string, timeoutMs: number = API_TIMEOUT_MS): Promise<T> {
  const base = getApiBaseUrl();
  if (!base) {
    throw new ApiError("config", "VITE_API_URL n'est pas renseigné : aucune API configurée.", path);
  }

  const controller = new AbortController();
  let timedOut = false;
  const timer = setTimeout(() => {
    timedOut = true;
    controller.abort();
  }, timeoutMs);

  try {
    let res: Response;
    try {
      res = await fetch(`${base}${path}`, {
        method: "GET",
        headers: { Accept: "application/json" },
        signal: controller.signal,
      });
    } catch (e) {
      if (timedOut) {
        throw new ApiError(
          "timeout",
          `Délai dépassé (${Math.round(timeoutMs / 1000)} s) pour ${path}.`,
          path,
        );
      }
      const reason = e instanceof Error ? e.message : String(e);
      throw new ApiError("network", `API injoignable pour ${path} (${reason}).`, path);
    }

    if (!res.ok) {
      const detail = await readErrorDetail(res);
      throw new ApiError(
        "http",
        `Erreur HTTP ${res.status} sur ${path}${detail ? ` : ${detail}` : ""}.`,
        path,
        res.status,
      );
    }

    try {
      return (await res.json()) as T;
    } catch {
      if (timedOut) {
        throw new ApiError("timeout", `Délai dépassé pendant la lecture de ${path}.`, path);
      }
      throw new ApiError("parse", `Réponse invalide (JSON attendu) pour ${path}.`, path);
    }
  } finally {
    clearTimeout(timer);
  }
}

/** Errors that mean "API unavailable" and therefore allow the local fallback. */
export function isUnavailable(error: ApiError): boolean {
  if (error.kind === "http") return error.status !== null && error.status >= 500;
  return true;
}

async function withFallback<T>(path: string, getFallback: () => T | null): Promise<ApiResult<T>> {
  try {
    const data = await apiGet<T>(path);
    return { data, source: "api", error: null };
  } catch (e) {
    const error =
      e instanceof ApiError
        ? e
        : new ApiError("network", e instanceof Error ? e.message : String(e), path);
    if (!isUnavailable(error)) throw error;

    const local = getFallback();
    if (local === null) {
      throw new ApiError(
        error.kind,
        `${error.message} Cette ressource n'existe pas dans les données locales de secours.`,
        path,
        error.status,
        true,
      );
    }
    console.warn(`[api] ${error.message} → données locales de secours utilisées.`);
    return { data: local, source: "fallback", error: error.toInfo() };
  }
}

/* ------------------------------------------------------------------ */
/* Santé                                                               */
/* ------------------------------------------------------------------ */

export interface HealthStatus {
  state: "online" | "offline" | "unconfigured";
  status: string | null;
  error: ApiErrorInfo | null;
}

export async function getHealth(): Promise<HealthStatus> {
  try {
    const res = await apiGet<HealthResponse>("/api/health", 5000);
    return { state: "online", status: res.status ?? "ok", error: null };
  } catch (e) {
    const error = e instanceof ApiError ? e : new ApiError("network", String(e), "/api/health");
    return {
      state: error.kind === "config" ? "unconfigured" : "offline",
      status: null,
      error: error.toInfo(),
    };
  }
}

/* ------------------------------------------------------------------ */
/* Personnes                                                           */
/* ------------------------------------------------------------------ */

export function getPersonnes(): Promise<ApiResult<Personne[]>> {
  return withFallback("/api/personnes", () => fallback.fallbackPersonnes());
}

export function getPersonne(slug: string = PROFILE_SLUG): Promise<ApiResult<PersonneDetail>> {
  return withFallback(`/api/personnes/${encodeURIComponent(slug)}`, () =>
    fallback.fallbackPersonneDetail(slug),
  );
}

/* ------------------------------------------------------------------ */
/* Projets                                                             */
/* ------------------------------------------------------------------ */

export function getProjets(competence?: string): Promise<ApiResult<Projet[]>> {
  const query = competence ? `?competence=${encodeURIComponent(competence)}` : "";
  return withFallback(`/api/projets${query}`, () => fallback.fallbackProjets(competence));
}

export function getProjet(slug: string): Promise<ApiResult<ProjetDetail>> {
  return withFallback(`/api/projets/${encodeURIComponent(slug)}`, () =>
    fallback.fallbackProjet(slug),
  );
}

export function getProjetsStatsCompetences(): Promise<ApiResult<StatCompetenceProjet[]>> {
  return withFallback("/api/projets/stats/competences", () =>
    fallback.fallbackProjetsStatsCompetences(),
  );
}

export function getProjetsSimilaires(
  slug: string,
  limit = 3,
): Promise<ApiResult<ProjetSimilaire[]>> {
  return withFallback(
    `/api/graph/projets/${encodeURIComponent(slug)}/similaires?limit=${limit}`,
    () => fallback.fallbackSimilaires(slug, limit),
  );
}

/* ------------------------------------------------------------------ */
/* Compétences                                                         */
/* ------------------------------------------------------------------ */

export function getCompetences(): Promise<ApiResult<Competence[]>> {
  return withFallback("/api/competences", () => fallback.fallbackCompetences());
}

export function getCompetence(slug: string): Promise<ApiResult<CompetenceDetail>> {
  return withFallback(`/api/competences/${encodeURIComponent(slug)}`, () =>
    fallback.fallbackCompetence(slug),
  );
}

export function getCompetencesStatsCategories(): Promise<ApiResult<StatCategorieCompetence[]>> {
  return withFallback("/api/competences/stats/categories", () =>
    fallback.fallbackStatsCategories(),
  );
}

function pickString(obj: Record<string, unknown>, keys: string[]): string | null {
  for (const key of keys) {
    const v = obj[key];
    if (typeof v === "string" && v.length > 0) return v;
  }
  return null;
}

function pickNumber(obj: Record<string, unknown>, keys: string[]): number | null {
  for (const key of keys) {
    const v = obj[key];
    if (typeof v === "number" && Number.isFinite(v)) return v;
  }
  return null;
}

/** The top endpoint has an untyped schema: accept the common shapes a Cypher query returns. */
export function normalizeTopCompetences(raw: unknown): TopCompetence[] {
  let list: unknown = raw;
  if (list && typeof list === "object" && !Array.isArray(list)) {
    const obj = list as Record<string, unknown>;
    list = obj["items"] ?? obj["data"] ?? obj["competences"] ?? obj["results"] ?? [];
  }
  if (!Array.isArray(list)) return [];

  const result: TopCompetence[] = [];
  for (const item of list) {
    if (!item || typeof item !== "object") continue;
    const obj = item as Record<string, unknown>;
    const nested =
      obj["competence"] && typeof obj["competence"] === "object"
        ? (obj["competence"] as Record<string, unknown>)
        : {};
    const slug =
      pickString(obj, ["slug", "competence_slug"]) ??
      pickString(nested, ["slug"]) ??
      (typeof obj["competence"] === "string" ? (obj["competence"] as string) : null);
    if (!slug) continue;
    result.push({
      slug,
      nom: pickString(obj, ["nom", "name"]) ?? pickString(nested, ["nom", "name"]) ?? slug,
      categorie: pickString(obj, ["categorie"]) ?? pickString(nested, ["categorie"]),
      total:
        pickNumber(obj, [
          "total",
          "usages",
          "nb_usages",
          "utilisations",
          "nb_utilisations",
          "count",
          "nb",
          "nb_projets",
          "score",
        ]) ?? 0,
    });
  }
  return result;
}

export async function getTopCompetences(limit = 10): Promise<ApiResult<TopCompetence[]>> {
  const result = await withFallback<unknown>(`/api/competences/stats/top?limit=${limit}`, () =>
    fallback.fallbackTopCompetences(limit),
  );
  return { ...result, data: normalizeTopCompetences(result.data) };
}
