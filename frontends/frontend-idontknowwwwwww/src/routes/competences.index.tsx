import { useSuspenseQueries } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";

import { BarList } from "@/components/portfolio/BarList";
import { NiveauMeter } from "@/components/portfolio/NiveauMeter";
import { PageHeader } from "@/components/portfolio/PageHeader";
import { SectionHeading } from "@/components/portfolio/SectionHeading";
import { SourceTag } from "@/components/portfolio/SourceTag";
import { EmptyState, NotFoundState, RouteErrorState } from "@/components/portfolio/states";
import { pluralize } from "@/lib/format";
import type { DataSource } from "@/services/api";
import {
  competencesQuery,
  competencesStatsCategoriesQuery,
  topCompetencesQuery,
} from "@/services/queries";
import type { Competence } from "@/types/api";

const CHART_TONES = ["bg-chart-1", "bg-chart-2", "bg-chart-3", "bg-chart-4", "bg-chart-5"];

export const Route = createFileRoute("/competences/")({
  ssr: false,
  loader: async ({ context }) => {
    // The three endpoints are loaded in parallel.
    await Promise.all([
      context.queryClient.ensureQueryData(competencesQuery()),
      context.queryClient.ensureQueryData(competencesStatsCategoriesQuery()),
      context.queryClient.ensureQueryData(topCompetencesQuery(10)),
    ]);
  },
  head: () => ({
    meta: [
      { title: "Compétences — Catégories et usages" },
      {
        name: "description",
        content: "Compétences organisées par catégorie et classement des plus utilisées dans le graphe.",
      },
      { property: "og:title", content: "Compétences — Catégories et usages" },
      {
        property: "og:description",
        content: "Compétences par catégorie et les plus utilisées dans le portfolio.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: CompetencesPage,
  errorComponent: RouteErrorState,
  notFoundComponent: () => <NotFoundState title="Compétences introuvables" />,
});

function CompetencesPage() {
  const [all, categories, top] = useSuspenseQueries({
    queries: [competencesQuery(), competencesStatsCategoriesQuery(), topCompetencesQuery(10)],
  });
  const competences = all.data.data;
  const stats = [...categories.data.data].sort((a, b) => b.total - a.total);
  const topList = top.data.data;
  const sources: DataSource[] = [all.data.source, categories.data.source, top.data.source];
  const source: DataSource = sources.includes("fallback") ? "fallback" : "api";
  const totalStats = stats.reduce((sum, s) => sum + s.total, 0);

  const grouped = new Map<string, Competence[]>();
  for (const c of competences) {
    const key = c.categorie || "Autres";
    grouped.set(key, [...(grouped.get(key) ?? []), c]);
  }
  const nameBySlug = new Map(competences.map((c) => [c.slug, c]));

  return (
    <>
      <PageHeader
        kicker={
          <>
            <span>Compétences</span>
            <SourceTag source={source} />
          </>
        }
        title={
          <>
            Ce que je <span className="text-gradient">maîtrise</span>
          </>
        }
        description={`${pluralize(competences.length, "compétence")} réparties en ${pluralize(grouped.size, "catégorie")}.`}
      />

      <div className="mx-auto max-w-6xl space-y-20 px-4 py-12 sm:px-6">
        <section className="grid gap-6 lg:grid-cols-2">
          <div className="surface p-6 sm:p-8">
            <SectionHeading
              kicker="Agrégation MongoDB"
              title="Répartition par catégorie"
            />
            {stats.length === 0 ? (
              <EmptyState title="Aucune statistique de catégorie" />
            ) : (
              <>
                <div className="mb-6 flex h-3 overflow-hidden rounded-full bg-muted" aria-hidden>
                  {stats.map((s, i) => (
                    <div
                      key={s.categorie}
                      className={`${CHART_TONES[i % CHART_TONES.length]} h-full origin-left-grow animate-grow-x`}
                      style={{
                        width: `${(s.total / Math.max(totalStats, 1)) * 100}%`,
                        animationDelay: `${i * 80}ms`,
                      }}
                      title={`${s.categorie} : ${s.total}`}
                    />
                  ))}
                </div>
                <ul className="space-y-2.5">
                  {stats.map((s, i) => (
                    <li key={s.categorie} className="flex items-center gap-3 text-sm">
                      <span
                        className={`size-2.5 shrink-0 rounded-sm ${CHART_TONES[i % CHART_TONES.length]}`}
                      />
                      <span className="flex-1 text-foreground">{s.categorie}</span>
                      <span className="font-mono text-xs text-muted-foreground">
                        {s.total} · {Math.round((s.total / Math.max(totalStats, 1)) * 100)}%
                      </span>
                    </li>
                  ))}
                </ul>
              </>
            )}
          </div>

          <div className="surface p-6 sm:p-8">
            <SectionHeading kicker="Requête Cypher Neo4j" title="Les plus utilisées" />
            {topList.length === 0 ? (
              <EmptyState title="Aucun usage enregistré dans le graphe" />
            ) : (
              <BarList
                items={topList.map((t) => ({
                  key: t.slug,
                  label: t.nom !== t.slug ? t.nom : (nameBySlug.get(t.slug)?.nom ?? t.slug),
                  value: t.total,
                  skillSlug: t.slug,
                  hint: t.categorie ?? nameBySlug.get(t.slug)?.categorie ?? "",
                }))}
                unit={(n) => pluralize(n, "usage")}
              />
            )}
          </div>
        </section>

        <section>
          <SectionHeading
            kicker="Catalogue"
            title="Toutes les compétences"
            description="Cliquez sur une compétence pour voir où elle a été mobilisée."
          />
          {grouped.size === 0 ? (
            <EmptyState title="Aucune compétence publiée" />
          ) : (
            <div className="space-y-10">
              {[...grouped.entries()].map(([categorie, list]) => (
                <div key={categorie}>
                  <h3 className="mb-4 flex items-center gap-3 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                    {categorie}
                    <span className="h-px flex-1 bg-border" />
                    <span className="font-mono text-xs">{list.length}</span>
                  </h3>
                  <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    {list.map((c, i) => (
                      <Link
                        key={c.slug}
                        to="/competences/$slug"
                        params={{ slug: c.slug }}
                        className="group surface hover-lift flex flex-col gap-3 p-4 animate-rise"
                        style={{ animationDelay: `${i * 40}ms` }}
                      >
                        <span className="font-medium text-foreground group-hover:text-primary">
                          {c.nom}
                        </span>
                        <NiveauMeter niveau={c.niveau} />
                        {c.mots_cles && c.mots_cles.length > 0 ? (
                          <span className="flex flex-wrap gap-1">
                            {c.mots_cles.slice(0, 3).map((m) => (
                              <span
                                key={m}
                                className="rounded bg-muted px-1.5 py-0.5 text-[10px] text-muted-foreground"
                              >
                                {m}
                              </span>
                            ))}
                          </span>
                        ) : null}
                      </Link>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </>
  );
}
