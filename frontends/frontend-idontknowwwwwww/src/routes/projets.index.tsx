import { useQuery, useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { X } from "lucide-react";

import { PageHeader } from "@/components/portfolio/PageHeader";
import { ProjetCard } from "@/components/portfolio/ProjetCard";
import { SourceTag } from "@/components/portfolio/SourceTag";
import { EmptyState, NotFoundState, RouteErrorState } from "@/components/portfolio/states";
import { Button } from "@/components/ui/button";
import { pluralize } from "@/lib/format";
import { cn } from "@/lib/utils";
import {
  competencesQuery,
  personnesQuery,
  projetsQuery,
  projetsStatsCompetencesQuery,
} from "@/services/queries";

interface ProjetsSearch {
  competence?: string;
}

export const Route = createFileRoute("/projets/")({
  ssr: false,
  validateSearch: (search: Record<string, unknown>): ProjetsSearch => {
    const competence = search["competence"];
    return typeof competence === "string" && competence.trim() ? { competence } : {};
  },
  loaderDeps: ({ search }) => ({ competence: search.competence }),
  loader: async ({ context, deps }) => {
    void context.queryClient.prefetchQuery(competencesQuery());
    void context.queryClient.prefetchQuery(projetsStatsCompetencesQuery());
    void context.queryClient.prefetchQuery(personnesQuery());
    await context.queryClient.ensureQueryData(projetsQuery(deps.competence));
  },
  head: () => ({
    meta: [
      { title: "Projets — Galerie du portfolio" },
      {
        name: "description",
        content: "Galerie des projets, filtrable par compétence, avec contributeurs et technologies.",
      },
      { property: "og:title", content: "Projets — Galerie du portfolio" },
      { property: "og:description", content: "Galerie des projets filtrable par compétence." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ProjetsPage,
  errorComponent: RouteErrorState,
  notFoundComponent: () => <NotFoundState title="Projets introuvables" />,
});

function ProjetsPage() {
  const { competence } = Route.useSearch();
  const { data: result } = useSuspenseQuery(projetsQuery(competence));
  const competences = useQuery(competencesQuery());
  const stats = useQuery(projetsStatsCompetencesQuery());
  const personnes = useQuery(personnesQuery());

  const skillNames = new Map((competences.data?.data ?? []).map((c) => [c.slug, c.nom]));
  const personNames = new Map(
    (personnes.data?.data ?? []).map((p) => [p.slug, `${p.prenom} ${p.nom}`]),
  );
  const filters = [...(stats.data?.data ?? [])].sort((a, b) => b.nb_projets - a.nb_projets);
  const projets = result.data;
  const activeName = competence ? (skillNames.get(competence) ?? competence) : null;

  return (
    <>
      <PageHeader
        kicker={
          <>
            <span>Galerie</span>
            <SourceTag source={result.source} />
          </>
        }
        title={
          activeName ? (
            <>
              Projets · <span className="text-gradient">{activeName}</span>
            </>
          ) : (
            "Projets"
          )
        }
        description={`${pluralize(projets.length, "projet")}${activeName ? ` utilisant ${activeName}` : ""}.`}
      />

      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        <div className="mb-8">
          <p className="mb-3 font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground">
            Filtrer par compétence
          </p>
          <div className="flex flex-wrap gap-2">
            <Link
              to="/projets"
              className={cn(
                "rounded-full border px-3 py-1.5 text-xs transition-colors",
                !competence
                  ? "border-primary bg-primary/15 text-primary"
                  : "border-border text-muted-foreground hover:border-primary/50 hover:text-foreground",
              )}
            >
              Tous
            </Link>
            {stats.isError ? (
              <span className="text-xs text-destructive">
                Filtres indisponibles : {stats.error.message}
              </span>
            ) : null}
            {filters.map((f) => (
              <Link
                key={f.competence_slug}
                to="/projets"
                search={{ competence: f.competence_slug }}
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs transition-colors",
                  competence === f.competence_slug
                    ? "border-primary bg-primary/15 text-primary"
                    : "border-border text-muted-foreground hover:border-primary/50 hover:text-foreground",
                )}
              >
                {skillNames.get(f.competence_slug) ?? f.competence_slug}
                <span className="font-mono text-[10px] opacity-70">{f.nb_projets}</span>
              </Link>
            ))}
            {competence && !filters.some((f) => f.competence_slug === competence) ? (
              <span className="inline-flex items-center gap-1.5 rounded-full border border-primary bg-primary/15 px-3 py-1.5 text-xs text-primary">
                {activeName}
              </span>
            ) : null}
          </div>
        </div>

        {projets.length === 0 ? (
          <EmptyState
            title="Aucun projet ne correspond"
            action={
              competence ? (
                <Button variant="glass" size="sm" asChild>
                  <Link to="/projets">
                    <X /> Retirer le filtre
                  </Link>
                </Button>
              ) : null
            }
          >
            {activeName
              ? `Aucun projet n'utilise la compétence « ${activeName} ».`
              : "Aucun projet n'est encore publié."}
          </EmptyState>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {projets.map((p, i) => (
              <ProjetCard
                key={p.slug}
                projet={p}
                index={i}
                skillNames={skillNames}
                personNames={personNames}
              />
            ))}
          </div>
        )}
      </div>
    </>
  );
}
