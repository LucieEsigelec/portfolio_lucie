// React Query wrappers. Data is fetched in the browser (the API runs on the visitor's machine),
// so the server render shows demo data as a placeholder until the live call resolves.
import { useQuery } from "@tanstack/react-query";
import { api } from "./api";
import {
  demoCompetences,
  demoPersonne,
  demoProjetDetail,
  demoProjets,
  demoStatsCategories,
  demoTopCompetences,
} from "./demo-data";
import type { Sourced } from "./types";

const demo = <T,>(data: T): Sourced<T> => ({ data, source: "demo" });
const common = { staleTime: 60_000, retry: false, refetchOnWindowFocus: false } as const;

export const useHealth = () =>
  useQuery({ queryKey: ["health"], queryFn: api.health, ...common, staleTime: 15_000 });

export const usePersonne = () =>
  useQuery({ queryKey: ["personne"], queryFn: api.personne, placeholderData: demo(demoPersonne), ...common });

export const useCompetences = () =>
  useQuery({
    queryKey: ["competences"],
    queryFn: api.competences,
    placeholderData: demo(demoCompetences),
    ...common,
  });

export const useStatsCategories = () =>
  useQuery({
    queryKey: ["stats", "categories"],
    queryFn: api.statsCategories,
    placeholderData: demo(demoStatsCategories()),
    ...common,
  });

export const useTopCompetences = (limit = 8) =>
  useQuery({
    queryKey: ["stats", "top", limit],
    queryFn: () => api.topCompetences(limit),
    placeholderData: demo(demoTopCompetences(limit)),
    ...common,
  });

export const useProjets = (competence?: string) =>
  useQuery({
    queryKey: ["projets", competence ?? "all"],
    queryFn: () => api.projets(competence),
    placeholderData: (prev) =>
      prev ?? demo(competence ? demoProjets.filter((p) => p.skills_slugs?.includes(competence)) : demoProjets),
    ...common,
  });

export const useProjet = (slug: string | null) =>
  useQuery({
    queryKey: ["projet", slug],
    queryFn: () => api.projet(slug as string),
    enabled: !!slug,
    placeholderData: () => (slug ? demo(demoProjetDetail(slug)) : undefined),
    ...common,
  });
