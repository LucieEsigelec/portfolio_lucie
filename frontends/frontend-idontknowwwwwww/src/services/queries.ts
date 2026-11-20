import { queryOptions } from "@tanstack/react-query";

import * as api from "./api";
import { FALLBACK_RETRY_MS, PROFILE_SLUG } from "./constants";

/** While a query is served by the fallback, keep retrying the real API. */
const retryApiWhileFallback = (query: {
  state: { data: { source: api.DataSource } | undefined };
}) => (query.state.data?.source === "fallback" ? FALLBACK_RETRY_MS : false);

export const healthQuery = () =>
  queryOptions({
    queryKey: ["health"],
    queryFn: () => api.getHealth(),
    refetchInterval: FALLBACK_RETRY_MS,
  });

export const personnesQuery = () =>
  queryOptions({
    queryKey: ["personnes"],
    queryFn: () => api.getPersonnes(),
    refetchInterval: retryApiWhileFallback,
  });

export const personneQuery = (slug: string = PROFILE_SLUG) =>
  queryOptions({
    queryKey: ["personne", slug],
    queryFn: () => api.getPersonne(slug),
    refetchInterval: retryApiWhileFallback,
  });

export const projetsQuery = (competence?: string) =>
  queryOptions({
    queryKey: ["projets", competence ?? null],
    queryFn: () => api.getProjets(competence),
    refetchInterval: retryApiWhileFallback,
  });

export const projetQuery = (slug: string) =>
  queryOptions({
    queryKey: ["projet", slug],
    queryFn: () => api.getProjet(slug),
    refetchInterval: retryApiWhileFallback,
  });

export const projetsSimilairesQuery = (slug: string, limit = 3) =>
  queryOptions({
    queryKey: ["projet", slug, "similaires", limit],
    queryFn: () => api.getProjetsSimilaires(slug, limit),
    refetchInterval: retryApiWhileFallback,
  });

export const projetsStatsCompetencesQuery = () =>
  queryOptions({
    queryKey: ["projets", "stats", "competences"],
    queryFn: () => api.getProjetsStatsCompetences(),
    refetchInterval: retryApiWhileFallback,
  });

export const competencesQuery = () =>
  queryOptions({
    queryKey: ["competences"],
    queryFn: () => api.getCompetences(),
    refetchInterval: retryApiWhileFallback,
  });

export const competenceQuery = (slug: string) =>
  queryOptions({
    queryKey: ["competence", slug],
    queryFn: () => api.getCompetence(slug),
    refetchInterval: retryApiWhileFallback,
  });

export const competencesStatsCategoriesQuery = () =>
  queryOptions({
    queryKey: ["competences", "stats", "categories"],
    queryFn: () => api.getCompetencesStatsCategories(),
    refetchInterval: retryApiWhileFallback,
  });

export const topCompetencesQuery = (limit = 10) =>
  queryOptions({
    queryKey: ["competences", "stats", "top", limit],
    queryFn: () => api.getTopCompetences(limit),
    refetchInterval: retryApiWhileFallback,
  });
