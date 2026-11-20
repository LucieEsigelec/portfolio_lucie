import { afterEach, describe, expect, it, vi } from "vitest";

import {
  API_TIMEOUT_MS,
  ApiError,
  getCompetence,
  getPersonne,
  getProjet,
  getProjets,
  normalizeTopCompetences,
} from "./api";

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

afterEach(() => {
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
  vi.useRealTimers();
  vi.restoreAllMocks();
});

describe("API disponible", () => {
  it("renvoie exactement les données de l'API, sans fallback", async () => {
    vi.stubEnv("VITE_API_URL", "http://api.test/");
    const real = {
      profil: { slug: "akim-lamtamri", prenom: "A", nom: "B", titre: "T", bio: "Bio API" },
      competences_graphe: [],
    };
    const fetchMock = vi.fn().mockResolvedValue(jsonResponse(real));
    vi.stubGlobal("fetch", fetchMock);

    const result = await getPersonne();

    expect(result.source).toBe("api");
    expect(result.error).toBeNull();
    expect(result.data).toEqual(real);
    expect(fetchMock).toHaveBeenCalledWith(
      "http://api.test/api/personnes/akim-lamtamri",
      expect.objectContaining({ method: "GET" }),
    );
  });

  it("transmet le filtre ?competence={slug}", async () => {
    vi.stubEnv("VITE_API_URL", "http://api.test");
    const fetchMock = vi.fn().mockResolvedValue(jsonResponse([]));
    vi.stubGlobal("fetch", fetchMock);

    const result = await getProjets("neo4j");

    expect(fetchMock.mock.calls[0]?.[0]).toBe("http://api.test/api/projets?competence=neo4j");
    expect(result.data).toEqual([]);
    expect(result.source).toBe("api");
  });

  it("ne masque pas un 404 avec le fallback", async () => {
    vi.stubEnv("VITE_API_URL", "http://api.test");
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(jsonResponse({ detail: "absent" }, 404)));

    await expect(getProjet("portfolio-polyglotte-api")).rejects.toMatchObject({
      kind: "http",
      status: 404,
    });
  });
});

describe("API indisponible", () => {
  it("VITE_API_URL absent : fallback signalé, aucun appel réseau", async () => {
    vi.stubEnv("VITE_API_URL", "");
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);
    vi.spyOn(console, "warn").mockImplementation(() => {});

    const result = await getPersonne();

    expect(fetchMock).not.toHaveBeenCalled();
    expect(result.source).toBe("fallback");
    expect(result.error?.kind).toBe("config");
    expect(result.data.profil.slug).toBe("akim-lamtamri");
  });

  it("erreur réseau : fallback avec l'erreur exposée", async () => {
    vi.stubEnv("VITE_API_URL", "http://api.test");
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new TypeError("Failed to fetch")));
    vi.spyOn(console, "warn").mockImplementation(() => {});

    const result = await getProjets();

    expect(result.source).toBe("fallback");
    expect(result.error).toMatchObject({ kind: "network", path: "/api/projets" });
    expect(result.data.length).toBeGreaterThan(0);
  });

  it("erreur 503 : fallback", async () => {
    vi.stubEnv("VITE_API_URL", "http://api.test");
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(jsonResponse({}, 503)));
    vi.spyOn(console, "warn").mockImplementation(() => {});

    const result = await getCompetence("neo4j");

    expect(result.source).toBe("fallback");
    expect(result.error?.status).toBe(503);
  });

  it(`timeout après ${API_TIMEOUT_MS} ms : fallback`, async () => {
    vi.useFakeTimers();
    vi.stubEnv("VITE_API_URL", "http://api.test");
    vi.spyOn(console, "warn").mockImplementation(() => {});
    vi.stubGlobal(
      "fetch",
      vi.fn(
        (_url: string, init: RequestInit) =>
          new Promise((_resolve, reject) => {
            init.signal?.addEventListener("abort", () => reject(new Error("aborted")));
          }),
      ),
    );

    const pending = getProjets();
    await vi.advanceTimersByTimeAsync(API_TIMEOUT_MS + 10);
    const result = await pending;

    expect(result.source).toBe("fallback");
    expect(result.error?.kind).toBe("timeout");
  });

  it("ressource absente du fallback : erreur explicite", async () => {
    vi.stubEnv("VITE_API_URL", "");
    await expect(getProjet("projet-inconnu")).rejects.toBeInstanceOf(ApiError);
    await expect(getProjet("projet-inconnu")).rejects.toMatchObject({ fallbackMissing: true });
  });
});

describe("normalizeTopCompetences", () => {
  it("accepte plusieurs formes de réponse", () => {
    expect(
      normalizeTopCompetences([
        { slug: "python", nom: "Python", usages: 7 },
        { competence_slug: "sql", nb_projets: 3 },
      ]),
    ).toEqual([
      { slug: "python", nom: "Python", categorie: null, total: 7 },
      { slug: "sql", nom: "sql", categorie: null, total: 3 },
    ]);
  });
});
