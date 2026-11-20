import { useMemo } from "react";
import { useCompetences } from "@/services/queries";
import type { Competence } from "@/services/types";

/** slug → Competence lookup, so projects/experiences can show names and category colours. */
export function useCompetenceMap() {
  const { data } = useCompetences();
  return useMemo(() => {
    const map = new Map<string, Competence>();
    data?.data.forEach((c) => map.set(c.slug, c));
    return {
      get: (slug: string): Competence =>
        map.get(slug) ?? { slug, nom: slug.charAt(0).toUpperCase() + slug.slice(1), categorie: "" },
      all: data?.data ?? [],
    };
  }, [data]);
}
