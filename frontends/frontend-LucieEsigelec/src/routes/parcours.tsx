import { createFileRoute } from "@tanstack/react-router";
import { Timeline } from "@/components/parcours/Timeline";
import { PageIntro } from "@/components/site/PageIntro";

export const Route = createFileRoute("/parcours")({
  head: () => ({
    meta: [
      { title: "Parcours — Lucie Reichardt" },
      { name: "description", content: "Expériences et formations de Lucie Reichardt : Renault, UTFPR, SOPANO et ESIGELEC." },
      { property: "og:title", content: "Parcours — Lucie Reichardt" },
      { property: "og:description", content: "Alternance data chez Renault, stage de recherche au Brésil et cycle ingénieur ESIGELEC." },
      { property: "og:type", content: "profile" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ParcoursPage,
});

function ParcoursPage() {
  return (
    <>
      <PageIntro kicker="Expériences & formations" title="Le parcours, courbe après courbe">
        De l'usine Renault de Cléon à un laboratoire de recherche à Curitiba : là où la donnée devient utile.
      </PageIntro>
      <div className="mx-auto max-w-5xl px-5 py-20">
        <Timeline />
      </div>
    </>
  );
}
