import { useQuery, useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Github, Linkedin, Mail, Network } from "lucide-react";

import { NiveauMeter } from "@/components/portfolio/NiveauMeter";
import { ProjetCard } from "@/components/portfolio/ProjetCard";
import { SectionHeading } from "@/components/portfolio/SectionHeading";
import { SourceTag } from "@/components/portfolio/SourceTag";
import {
  EmptyState,
  InlineError,
  NotFoundState,
  RouteErrorState,
  SectionLoader,
} from "@/components/portfolio/states";
import { ExperienceTimeline, FormationTimeline } from "@/components/portfolio/Timeline";
import { Button } from "@/components/ui/button";
import { pluralize } from "@/lib/format";
import type { Competence, Contact } from "@/types/api";
import { personneQuery, personnesQuery, projetsQuery } from "@/services/queries";

export const Route = createFileRoute("/")({
  // Data is fetched from the browser: VITE_API_URL usually points to an API the visitor can reach.
  ssr: false,
  loader: ({ context }) => {
    void context.queryClient.prefetchQuery(projetsQuery());
    return context.queryClient.ensureQueryData(personneQuery());
  },
  head: ({ loaderData }) => {
    const profil = loaderData?.data.profil;
    const title = profil
      ? `${profil.prenom} ${profil.nom} — ${profil.titre}`
      : "Portfolio — Profil et parcours";
    const description = profil?.bio ?? "Profil, formations, expériences et compétences issues du graphe.";
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        { property: "og:type", content: "profile" },
        { name: "twitter:card", content: "summary_large_image" },
      ],
    };
  },
  component: ProfilPage,
  errorComponent: RouteErrorState,
  notFoundComponent: () => <NotFoundState title="Profil introuvable" />,
});

function ContactLinks({ contacts }: { contacts?: Contact | undefined }) {
  const items = [
    contacts?.email
      ? { key: "email", href: `mailto:${contacts.email}`, label: contacts.email, icon: Mail }
      : null,
    contacts?.github
      ? { key: "github", href: contacts.github, label: "GitHub", icon: Github }
      : null,
    contacts?.linkedin
      ? { key: "linkedin", href: contacts.linkedin, label: "LinkedIn", icon: Linkedin }
      : null,
  ].filter((i) => i !== null);

  if (items.length === 0) {
    return <p className="text-sm italic text-muted-foreground">Aucun contact renseigné.</p>;
  }
  return (
    <div className="flex flex-wrap gap-2">
      {items.map(({ key, href, label, icon: Icon }) => (
        <Button key={key} variant="glass" size="sm" asChild>
          <a href={href} target={key === "email" ? undefined : "_blank"} rel="noreferrer">
            <Icon /> {label}
          </a>
        </Button>
      ))}
    </div>
  );
}

function GraphSkills({ competences }: { competences: Competence[] }) {
  if (competences.length === 0) {
    return (
      <EmptyState title="Aucune compétence déduite du graphe">
        Le graphe Neo4j ne relie encore aucune compétence à ce profil.
      </EmptyState>
    );
  }
  const groups = new Map<string, Competence[]>();
  for (const c of competences) {
    const key = c.categorie || "Autres";
    groups.set(key, [...(groups.get(key) ?? []), c]);
  }
  return (
    <div className="grid gap-4 md:grid-cols-2">
      {[...groups.entries()].map(([categorie, list], gi) => (
        <div
          key={categorie}
          className="surface p-5 animate-rise"
          style={{ animationDelay: `${gi * 70}ms` }}
        >
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-foreground">{categorie}</h3>
            <span className="font-mono text-xs text-muted-foreground">{list.length}</span>
          </div>
          <ul className="divide-y divide-border/60">
            {list.map((c) => (
              <li key={c.slug}>
                <Link
                  to="/competences/$slug"
                  params={{ slug: c.slug }}
                  className="group flex items-center justify-between gap-3 py-2.5"
                >
                  <span className="flex items-center gap-2 text-sm text-foreground transition-colors group-hover:text-primary">
                    <span className="size-1.5 rounded-full bg-primary" />
                    {c.nom}
                  </span>
                  <NiveauMeter niveau={c.niveau} showLabel={false} />
                </Link>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}

function ProjetsTeaser({ skillNames }: { skillNames: Map<string, string> }) {
  const projets = useQuery(projetsQuery());
  const personnes = useQuery(personnesQuery());
  const personNames = new Map(
    (personnes.data?.data ?? []).map((p) => [p.slug, `${p.prenom} ${p.nom}`]),
  );

  if (projets.isPending) return <SectionLoader rows={2} />;
  if (projets.isError)
    return <InlineError error={projets.error} onRetry={() => void projets.refetch()} />;
  const list = projets.data.data.slice(0, 3);
  if (list.length === 0) return <EmptyState title="Aucun projet publié pour le moment" />;
  return (
    <div className="grid gap-4 md:grid-cols-3">
      {list.map((p, i) => (
        <ProjetCard
          key={p.slug}
          projet={p}
          index={i}
          skillNames={skillNames}
          personNames={personNames}
        />
      ))}
    </div>
  );
}

function ProfilPage() {
  const { data: result } = useSuspenseQuery(personneQuery());
  const { profil, competences_graphe } = result.data;
  const graphSkills = competences_graphe ?? [];
  const formations = profil.formations ?? [];
  const experiences = profil.experiences ?? [];
  const skillNames = new Map(graphSkills.map((c) => [c.slug, c.nom]));

  return (
    <>
      {/* Profil */}
      <section className="relative overflow-hidden border-b border-border/60">
        <div className="pointer-events-none absolute inset-0 bg-grid" aria-hidden />
        <div className="pointer-events-none absolute inset-0 bg-halo" aria-hidden />
        <div className="relative mx-auto grid max-w-6xl gap-10 px-4 py-16 sm:px-6 sm:py-24 lg:grid-cols-[1fr_320px] lg:items-end">
          <div className="animate-rise">
            <div className="mb-5 flex flex-wrap items-center gap-3">
              <span className="font-mono text-xs uppercase tracking-[0.2em] text-primary">
                {profil.titre}
              </span>
              <SourceTag source={result.source} />
            </div>
            <h1 className="text-5xl font-semibold leading-[1.02] text-foreground sm:text-7xl">
              {profil.prenom} <span className="text-gradient">{profil.nom}</span>
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-relaxed text-muted-foreground">
              {profil.bio?.trim() || <span className="italic">Biographie non renseignée.</span>}
            </p>
            <div className="mt-8">
              <ContactLinks contacts={profil.contacts} />
            </div>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button variant="hero" size="lg" asChild>
                <Link to="/projets">
                  Voir les projets <ArrowRight />
                </Link>
              </Button>
              <Button variant="glass" size="lg" asChild>
                <Link to="/competences">Explorer les compétences</Link>
              </Button>
            </div>
          </div>

          <aside className="surface p-6 animate-fade" aria-label="Résumé du nœud Personne">
            <p className="mb-4 flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
              <Network className="size-3.5 text-primary" /> Nœud Personne
            </p>
            <dl className="grid grid-cols-3 gap-3 text-center">
              {[
                { label: "Formations", value: formations.length },
                { label: "Expériences", value: experiences.length },
                { label: "Compétences", value: graphSkills.length },
              ].map((s) => (
                <div key={s.label} className="rounded-lg bg-secondary/50 px-2 py-3">
                  <dd className="font-display text-2xl font-semibold text-foreground">{s.value}</dd>
                  <dt className="mt-0.5 text-[10px] uppercase tracking-wider text-muted-foreground">
                    {s.label}
                  </dt>
                </div>
              ))}
            </dl>
            <p className="mt-4 font-mono text-[11px] text-muted-foreground">slug : {profil.slug}</p>
          </aside>
        </div>
      </section>

      {/* Parcours */}
      <section className="mx-auto max-w-6xl px-4 pt-20 sm:px-6" id="parcours">
        <SectionHeading
          kicker="Parcours"
          title="Formations & expériences"
          description="Chronologie issue du profil, avec les compétences mobilisées à chaque étape."
        />
        <div className="grid gap-6 lg:grid-cols-2">
          <FormationTimeline formations={formations} skillNames={skillNames} />
          <ExperienceTimeline experiences={experiences} skillNames={skillNames} />
        </div>
      </section>

      {/* Compétences du graphe */}
      <section className="mx-auto max-w-6xl px-4 pt-20 sm:px-6">
        <SectionHeading
          kicker="Graphe Neo4j"
          title="Compétences déduites du graphe"
          description={`${pluralize(graphSkills.length, "compétence")} reliée${graphSkills.length > 1 ? "s" : ""} à ce profil via ses projets, formations et expériences.`}
          aside={
            <Button variant="link" asChild>
              <Link to="/competences">
                Toutes les compétences <ArrowRight />
              </Link>
            </Button>
          }
        />
        <GraphSkills competences={graphSkills} />
      </section>

      {/* Projets */}
      <section className="mx-auto max-w-6xl px-4 pt-20 sm:px-6">
        <SectionHeading
          kicker="Réalisations"
          title="Projets récents"
          aside={
            <Button variant="link" asChild>
              <Link to="/projets">
                Galerie complète <ArrowRight />
              </Link>
            </Button>
          }
        />
        <ProjetsTeaser skillNames={skillNames} />
      </section>
    </>
  );
}
