import { createFileRoute } from "@tanstack/react-router";
import { ProjectGallery } from "@/components/projets/ProjectGallery";
import { PageIntro } from "@/components/site/PageIntro";

export const Route = createFileRoute("/projets")({
  head: () => ({
    meta: [
      { title: "Projets — Lucie Reichardt" },
      { name: "description", content: "Projets data et applications de Lucie Reichardt, filtrables par compétence." },
      { property: "og:title", content: "Projets — Lucie Reichardt" },
      { property: "og:description", content: "Dashboards, pipelines, applications mobiles et graphes : la galerie de projets." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ProjetsPage,
});

function ProjetsPage() {
  return (
    <>
      <PageIntro kicker="Galerie" title="Projets">
        Filtre par compétence, ouvre une fiche pour le détail et découvre les projets voisins dans le graphe.
      </PageIntro>
      <div className="mx-auto max-w-6xl px-5 py-16">
        <ProjectGallery />
      </div>
    </>
  );
}
