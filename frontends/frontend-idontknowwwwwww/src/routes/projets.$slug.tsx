import { useQuery, useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ArrowLeft, ArrowUpRight, Calendar, FolderTree, Users } from "lucide-react";

import { PageHeader } from "@/components/portfolio/PageHeader";
import { RelationGraph } from "@/components/portfolio/RelationGraph";
import { SectionHeading } from "@/components/portfolio/SectionHeading";
import { SourceTag } from "@/components/portfolio/SourceTag";
import {
  EmptyState,
  InlineError,
  NotFoundState,
  RouteErrorState,
  SectionLoader,
} from "@/components/portfolio/states";
import { formatMonth } from "@/lib/format";
import { ApiError } from "@/services/api";
import { personnesQuery, projetQuery, projetsSimilairesQuery } from "@/services/queries";
import type { ProjetSimilaire } from "@/types/api";

export const Route = createFileRoute("/projets/$slug")({
  ssr: false,
  loader: async ({ context, params }) => {
    void context.queryClient.prefetchQuery(personnesQuery());
    try {
      return await context.queryClient.ensureQueryData(projetQuery(params.slug));
    } catch (error) {
      if (error instanceof ApiError && error.status === 404) throw notFound();
      throw error;
    }
  },
  head: ({ loaderData }) => {
    const projet = loaderData?.data;
    const title = projet ? `${projet.titre} — Projet` : "Projet — Portfolio";
    const description =
      projet?.description ?? "Détail d'un projet, compétences mobilisées et projets similaires.";
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        { property: "og:type", content: "article" },
        { name: "twitter:card", content: "summary_large_image" },
      ],
    };
  },
  component: ProjetPage,
  errorComponent: RouteErrorState,
  notFoundComponent: () => (
    <NotFoundState title="Projet introuvable">
      Aucun projet ne porte ce slug dans l'API.{" "}
      <Link to="/projets" className="text-primary hover:underline">
        Revenir à la galerie
      </Link>
    </NotFoundState>
  ),
});

function SimilarList({ items }: { items: ProjetSimilaire[] }) {
  const max = Math.max(1, ...items.map((s) => s.score));
  return (
    <ul className="space-y-3">
      {items.map((s, i) => (
        <li key={s.slug}>
          <Link
            to="/projets/$slug"
            params={{ slug: s.slug }}
            className="group surface hover-lift block p-4 animate-rise"
            style={{ animationDelay: `${i * 70}ms` }}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="truncate font-medium text-foreground group-hover:text-primary">
                  {s.titre}
                </p>
                <p className="font-mono text-xs text-muted-foreground">
                  {s.annee ?? "Année non renseignée"}
                </p>
              </div>
              <ArrowUpRight className="size-4 shrink-0 text-muted-foreground group-hover:text-primary" />
            </div>
            <div className="mt-3 flex items-center gap-3">
              <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full origin-left-grow animate-grow-x rounded-full bg-accent"
                  style={{ width: `${(s.score / max) * 100}%` }}
                />
              </div>
              <span className="font-mono text-[11px] text-muted-foreground">
                score {Number.isInteger(s.score) ? s.score : s.score.toFixed(2)}
              </span>
            </div>
          </Link>
        </li>
      ))}
    </ul>
  );
}

function ProjetPage() {
  const { slug } = Route.useParams();
  const { data: result } = useSuspenseQuery(projetQuery(slug));
  const projet = result.data;
  const personnes = useQuery(personnesQuery());
  const embedded = projet.projets_similaires ?? [];
  // The detail endpoint usually embeds similar projects; otherwise ask the graph endpoint.
  const graph = useQuery({ ...projetsSimilairesQuery(slug, 3), enabled: embedded.length === 0 });
  const similaires = embedded.length > 0 ? embedded : (graph.data?.data ?? []);

  const personNames = new Map(
    (personnes.data?.data ?? []).map((p) => [p.slug, `${p.prenom} ${p.nom}`]),
  );
  const detailed =
    projet.competences_detaillees && projet.competences_detaillees.length > 0
      ? projet.competences_detaillees
      : (projet.skills_slugs ?? []).map((s) => ({ slug: s, nom: s, categorie: null }));
  const contributors = projet.personne_slugs ?? [];

  return (
    <>
      <PageHeader
        kicker={
          <>
            <Link
              to="/projets"
              className="inline-flex items-center gap-1 text-muted-foreground transition-colors hover:text-primary"
            >
              <ArrowLeft className="size-3.5" /> Projets
            </Link>
            <span className="text-border">/</span>
            <span>{projet.slug}</span>
            <SourceTag source={result.source} />
          </>
        }
        title={projet.titre}
        description={
          projet.description?.trim() || (
            <span className="italic">Aucune description fournie pour ce projet.</span>
          )
        }
      />

      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-12 sm:px-6 lg:grid-cols-[1fr_380px]">
        <div className="space-y-14">
          <dl className="grid gap-3 sm:grid-cols-3">
            {[
              {
                icon: Calendar,
                label: "Réalisation",
                value: formatMonth(projet.date_realisation) ?? "Non renseignée",
              },
              { icon: FolderTree, label: "Contexte", value: projet.contexte_id || "Non renseigné" },
              {
                icon: Users,
                label: "Contributeurs",
                value:
                  contributors.length > 0
                    ? contributors.map((p) => personNames.get(p) ?? p).join(", ")
                    : "Non renseignés",
              },
            ].map(({ icon: Icon, label, value }) => (
              <div key={label} className="surface p-4">
                <dt className="mb-1 flex items-center gap-1.5 text-[10px] uppercase tracking-wider text-muted-foreground">
                  <Icon className="size-3.5 text-primary" /> {label}
                </dt>
                <dd className="break-words font-mono text-sm text-foreground">{value}</dd>
              </div>
            ))}
          </dl>

          <section>
            <SectionHeading
              kicker="Relation UTILISE"
              title="Compétences mobilisées"
              description="Chaque compétence ouvre sa fiche et ses autres usages."
            />
            {detailed.length === 0 ? (
              <EmptyState title="Aucune compétence liée à ce projet" />
            ) : (
              <div className="grid gap-3 sm:grid-cols-2">
                {detailed.map((c, i) => (
                  <Link
                    key={c.slug}
                    to="/competences/$slug"
                    params={{ slug: c.slug }}
                    className="group surface hover-lift flex items-center justify-between gap-3 p-4 animate-rise"
                    style={{ animationDelay: `${i * 50}ms` }}
                  >
                    <span className="min-w-0">
                      <span className="block truncate font-medium text-foreground group-hover:text-primary">
                        {c.nom}
                      </span>
                      <span className="block text-xs text-muted-foreground">
                        {c.categorie ?? "Catégorie non renseignée"}
                      </span>
                    </span>
                    <ArrowUpRight className="size-4 shrink-0 text-muted-foreground group-hover:text-primary" />
                  </Link>
                ))}
              </div>
            )}
          </section>
        </div>

        <aside className="space-y-8">
          <div className="surface p-4">
            <p className="mb-2 px-2 font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
              Voisinage dans le graphe
            </p>
            <RelationGraph
              center={projet.titre}
              skills={detailed.map((c) => ({ id: c.slug, label: c.nom }))}
              similar={similaires.map((s) => ({ id: s.slug, label: s.titre }))}
            />
            <div className="mt-2 flex flex-wrap gap-4 px-2 text-[11px] text-muted-foreground">
              <span className="inline-flex items-center gap-1.5">
                <span className="size-2 rounded-full bg-primary" /> Compétence
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span className="size-2 rounded-sm bg-accent" /> Projet similaire
              </span>
            </div>
          </div>

          <section>
            <h2 className="mb-1 text-lg font-semibold text-foreground">Projets similaires</h2>
            <p className="mb-4 text-xs text-muted-foreground">
              Calculés dans Neo4j à partir des compétences partagées.
            </p>
            {embedded.length === 0 && graph.isPending ? (
              <SectionLoader rows={3} />
            ) : embedded.length === 0 && graph.isError ? (
              <InlineError error={graph.error} onRetry={() => void graph.refetch()} />
            ) : similaires.length === 0 ? (
              <EmptyState title="Aucun projet similaire">
                Le graphe ne relie ce projet à aucun autre pour l'instant.
              </EmptyState>
            ) : (
              <SimilarList items={similaires} />
            )}
          </section>
        </aside>
      </div>
    </>
  );
}
