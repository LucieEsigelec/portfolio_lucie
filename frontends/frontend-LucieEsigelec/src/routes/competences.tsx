import { createFileRoute } from "@tanstack/react-router";
import { Dashboard } from "@/components/competences/Dashboard";
import { PageIntro } from "@/components/site/PageIntro";

export const Route = createFileRoute("/competences")({
  head: () => ({
    meta: [
      { title: "Compétences — Lucie Reichardt" },
      { name: "description", content: "Tableau de bord des compétences de Lucie Reichardt : répartition par catégorie et top des plus utilisées." },
      { property: "og:title", content: "Compétences — Lucie Reichardt" },
      { property: "og:description", content: "Data, bases de données, langages, DevOps : le dashboard des compétences." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: CompetencesPage,
});

function CompetencesPage() {
  return (
    <>
      <PageIntro kicker="Data & compétences" title="Le dashboard des compétences">
        Statistiques calculées par l'API : agrégations MongoDB et requêtes Cypher dans Neo4j.
      </PageIntro>
      <div className="mx-auto max-w-6xl px-5 py-16">
        <Dashboard />
      </div>
    </>
  );
}
