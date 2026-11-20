import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { Hero } from "@/components/hero/Hero";
import { ProjectGallery } from "@/components/projets/ProjectGallery";
import { WaveDivider } from "@/components/topo/WaveDivider";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Lucie Reichardt — Data Engineering & Développement d'applications" },
      {
        name: "description",
        content: "Portfolio de Lucie Reichardt : pipelines de données, dashboards et applications, de Renault au laboratoire UTFPR.",
      },
      { property: "og:title", content: "Lucie Reichardt — Data Engineering & Développement" },
      {
        property: "og:description",
        content: "Étudiante ingénieure ESIGELEC, apprentie data chez Renault : projets, parcours et compétences.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

const TEASERS = [
  { to: "/parcours", kicker: "01", title: "Parcours", text: "Alternance, stages et formations sur une frise organique.", ink: "bg-sage" },
  { to: "/projets", kicker: "02", title: "Projets", text: "Une galerie filtrable par compétence, avec les projets similaires.", ink: "bg-terracotta" },
  { to: "/competences", kicker: "03", title: "Compétences", text: "Répartition par catégorie et top des compétences les plus utilisées.", ink: "bg-cyan" },
] as const;

function Index() {
  return (
    <>
      <Hero />
      <WaveDivider />

      <section className="mx-auto max-w-6xl px-5 py-20">
        <div className="grid gap-6 md:grid-cols-3">
          {TEASERS.map((t) => (
            <Link key={t.to} to={t.to} className="card-topo card-lift group flex flex-col p-6">
              <span className={`grid size-11 place-items-center rounded-full border-ink font-mono text-sm font-bold text-ink ${t.ink}`}>
                {t.kicker}
              </span>
              <h2 className="mt-6 font-display text-2xl font-bold text-petrol">{t.title}</h2>
              <p className="mt-2 flex-1 text-sm text-ink/75">{t.text}</p>
              <span className="mt-6 inline-flex items-center gap-2 font-mono text-xs font-semibold text-terracotta">
                Explorer <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-1" />
              </span>
            </Link>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-5">
        <div className="mb-10 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="font-mono text-xs uppercase tracking-[0.25em] text-terracotta">Sélection</p>
            <h2 className="mt-2 font-display text-4xl font-extrabold text-petrol sm:text-5xl">Projets récents</h2>
          </div>
          <Button asChild variant="paper">
            <Link to="/projets">
              Tous les projets <ArrowRight />
            </Link>
          </Button>
        </div>
        <ProjectGallery limit={3} />
      </section>
    </>
  );
}
