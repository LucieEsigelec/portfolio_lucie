import { afterEach, describe, expect, it, vi } from "vitest";
import { api, normalizeTop, withFallback } from "@/services/api";
import { demoProjets } from "@/services/demo-data";
import { categoryFamily } from "@/lib/categories";

afterEach(() => vi.unstubAllGlobals());

describe("API fallback", () => {
  it("returns demo data when the FastAPI server is unreachable", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new TypeError("Failed to fetch")));
    const res = await api.projets();
    expect(res.source).toBe("demo");
    expect(res.data).toHaveLength(demoProjets.length);
  });

  it("returns demo data when the server answers with an error status", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response("boom", { status: 500 })));
    const res = await withFallback("/api/competences", () => ["demo"]);
    expect(res).toEqual({ data: ["demo"], source: "demo" });
  });

  it("uses live data when the server answers", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(new Response(JSON.stringify([{ slug: "x", titre: "X" }]), { status: 200 })),
    );
    const res = await api.projets();
    expect(res.source).toBe("api");
    expect(res.data[0]?.slug).toBe("x");
  });

  it("filters demo projects by skill slug", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new TypeError("offline")));
    const res = await api.projets("neo4j");
    expect(res.data.every((p) => p.skills_slugs?.includes("neo4j"))).toBe(true);
    expect(res.data.length).toBeGreaterThan(0);
  });
});

describe("top competences normalisation", () => {
  it("reads common Cypher result shapes", () => {
    expect(normalizeTop([{ slug: "python", nom: "Python", nb_usages: 7 }])).toEqual([
      { slug: "python", nom: "Python", usages: 7 },
    ]);
    expect(normalizeTop([{ competence: "SQL", count: 3 }])).toEqual([{ slug: "SQL", nom: "SQL", usages: 3 }]);
  });
});

describe("skill family indicator (Data / Dev)", () => {
  it("classifies API categories", () => {
    expect(categoryFamily("Data / IA")).toBe("Data");
    expect(categoryFamily("Bases de données")).toBe("Data");
    expect(categoryFamily("Langages")).toBe("Dev");
    expect(categoryFamily("DevOps")).toBe("Dev");
  });
});
