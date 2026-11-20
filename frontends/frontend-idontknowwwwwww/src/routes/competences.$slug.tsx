import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ArrowLeft, ArrowRight, Briefcase, FolderGit2, GraduationCap, Tag } from "lucide-react";
import type { ComponentType } from "react";

import { NiveauMeter } from "@/components/portfolio/NiveauMeter";
import { PageHeader } from "@/components/portfolio/PageHeader";
import { SectionHeading } from "@/components/portfolio/SectionHeading";
import { SourceTag } from "@/components/portfolio/SourceTag";
import { EmptyState, NotFoundState, RouteErrorState } from "@/components/portfolio/states";
import { Button } from "@/components/ui/button";
import { pluralize, usageKind, type UsageKind } from "@/lib/format";
import { cn } from "@/lib/utils";
import { ApiError } from "@/services/api";
import { competenceQuery } from "@/services/queries";
import type { CompetenceUsage } from "@/types/api";

export const Route = createFileRoute("/competences/$slug")({
  ssr: false,
  loader: async ({ context, params }) => {
    try {
      return await context.queryClient.ensureQueryData(competenceQuery(params.slug));
    } catch (error) {
      if (error instanceof ApiError && error.status === 404) throw notFound();
      throw error;
    }
  },
  head: ({ loaderData }) => {
    const c = loaderData?.data;
    const title = c ? `${c.nom} — Compétence` : "Compétence — Portfolio";
    const description = c
      ? `${c.nom} (${c.categorie}) : projets, formations et expériences où elle est mobilisée.`
      : "Fiche compétence et ses usages dans le portfolio.";
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
  component: CompetencePage,
  errorComponent: RouteErrorState,
  notFoundComponent: () => (
    <NotFoundState title="Compétence introuvable">
      Aucune compétence ne porte ce slug dans l'API.{" "}
      <Link to="/competences" className="text-primary hover:underline">
        Voir toutes les compétences
      </Link>
    </NotFoundState>
  ),
});

const KINDS: Record<
  UsageKind,
  { label: string; icon: ComponentType<{ className?: string }>; tone: string; dot: string }
> = {
  projet: {
    label: "Projets",
    icon: FolderGit2,
    tone: "text-usage-projet border-usage-projet/30 bg-usage-projet/10",
    dot: "bg-usage-projet",
  },
  formation: {
    label: "Formations",
    icon: GraduationCap,
    tone: "text-usage-formation border-usage-formation/30 bg-usage-formation/10",
    dot: "bg-usage-formation",
  },
  experience: {
    label: "Expériences",
    icon: Briefcase,
    tone: "text-usage-experience border-usage-experience/30 bg-usage-experience/10",
    dot: "bg-usage-experience",
  },
  autre: {
    label: "Autres usages",
    icon: Tag,
    tone: "text-muted-foreground border-border bg-muted/40",
    dot: "bg-muted-foreground",
  },
};

const ORDER: UsageKind[] = ["projet", "experience", "formation", "autre"];

function UsageLink({ usage, kind }: { usage: CompetenceUsage; kind: UsageKind }) {
  const cls =
    "group surface hover-lift flex items-center justify-between gap-3 p-4 text-sm";
  const body = (
    <>
      <span className="min-w-0">
        <span className="block truncate font-medium text-foreground group-hover:text-primary">
          {usage.titre || usage.ref}
        </span>
        <span className="block truncate font-mono text-[11px] text-muted-foreground">
          {usage.ref}
        </span>
      </span>
      <ArrowRight className="size-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-primary" />
    </>
  );
  if (kind === "projet") {
    return (
      <Link to="/projets/$slug" params={{ slug: usage.ref }} className={cls}>
        {body}
      </Link>
    );
  }
  if (kind === "formation" || kind === "experience") {
    return (
      <Link to="/" hash={`parcours-${usage.ref}`} className={cls}>
        {body}
      </Link>
    );
  }
  return <div className={cls}>{body}</div>;
}

function CompetencePage() {
  const { slug } = Route.useParams();
  const { data: result } = useSuspenseQuery(competenceQuery(slug));
  const c = result.data;
  const usages = c.usages ?? [];
  const groups = new Map<UsageKind, CompetenceUsage[]>();
  for (const u of usages) {
    const kind = usageKind(u.type);
    groups.set(kind, [...(groups.get(kind) ?? []), u]);
  }

  return (
    <>
      <PageHeader
        kicker={
          <>
            <Link
              to="/competences"
              className="inline-flex items-center gap-1 text-muted-foreground transition-colors hover:text-primary"
            >
              <ArrowLeft className="size-3.5" /> Compétences
            </Link>
            <span className="text-border">/</span>
            <span>{c.categorie || "Sans catégorie"}</span>
            <SourceTag source={result.source} />
          </>
        }
        title={c.nom}
        description={
          <div className="flex flex-wrap items-center gap-4">
            <NiveauMeter niveau={c.niveau} />
            <span className="text-sm">{pluralize(usages.length, "usage")} dans le graphe</span>
          </div>
        }
        aside={
          <Button variant="hero" asChild>
            <Link to="/projets" search={{ competence: c.slug }}>
              Projets utilisant {c.nom} <ArrowRight />
            </Link>
          </Button>
        }
      />

      <div className="mx-auto max-w-6xl space-y-14 px-4 py-12 sm:px-6">
        <section className="grid gap-3 sm:grid-cols-3">
          {(["projet", "experience", "formation"] as const).map((k) => {
            const meta = KINDS[k];
            const Icon = meta.icon;
            const count = groups.get(k)?.length ?? 0;
            return (
              <div key={k} className={cn("rounded-xl border p-4", meta.tone)}>
                <Icon className="mb-2 size-5" />
                <p className="font-display text-3xl font-semibold">{count}</p>
                <p className="text-xs uppercase tracking-wider opacity-80">{meta.label}</p>
              </div>
            );
          })}
        </section>

        <section>
          <SectionHeading kicker="Mots-clés" title="Contexte" />
          {c.mots_cles && c.mots_cles.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {c.mots_cles.map((m) => (
                <span
                  key={m}
                  className="rounded-md border border-border bg-secondary/60 px-2.5 py-1 font-mono text-xs text-secondary-foreground"
                >
                  #{m}
                </span>
              ))}
            </div>
          ) : (
            <p className="text-sm italic text-muted-foreground">Aucun mot-clé renseigné.</p>
          )}
        </section>

        <section>
          <SectionHeading
            kicker="Relations du graphe"
            title="Usages"
            description="Projets, expériences et formations reliés à cette compétence."
          />
          {usages.length === 0 ? (
            <EmptyState title="Aucun usage enregistré">
              Cette compétence n'est encore reliée à aucun projet, formation ou expérience.
            </EmptyState>
          ) : (
            <div className="space-y-10">
              {ORDER.filter((k) => groups.has(k)).map((k) => {
                const meta = KINDS[k];
                const Icon = meta.icon;
                const list = groups.get(k) ?? [];
                return (
                  <div key={k}>
                    <h3 className="mb-4 flex items-center gap-2 text-sm font-semibold text-foreground">
                      <span
                        className={cn(
                          "flex size-7 items-center justify-center rounded-md border",
                          meta.tone,
                        )}
                      >
                        <Icon className="size-3.5" />
                      </span>
                      {meta.label}
                      <span className="font-mono text-xs text-muted-foreground">{list.length}</span>
                    </h3>
                    <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                      {list.map((u, i) => (
                        <li
                          key={`${u.type}-${u.ref}`}
                          className="relative animate-rise"
                          style={{ animationDelay: `${i * 50}ms` }}
                        >
                          <span
                            aria-hidden
                            className={cn("absolute left-0 top-4 bottom-4 w-0.5 rounded-full", meta.dot)}
                          />
                          <UsageLink usage={u} kind={k} />
                        </li>
                      ))}
                    </ul>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </>
  );
}
