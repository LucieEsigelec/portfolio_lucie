import { ArrowUpRight } from "lucide-react";
import { motion } from "framer-motion";
import { SkillBadge } from "@/components/site/SkillBadge";
import { useCompetenceMap } from "@/hooks/use-competence-map";
import type { Projet } from "@/services/types";

function excerpt(md: string | null | undefined, max = 140) {
  const text = (md ?? "")
    .replace(/```[\s\S]*?```/g, "")
    .replace(/^#+\s.*$/gm, "")
    .replace(/[*_`>#-]/g, "")
    .replace(/\s+/g, " ")
    .trim();
  return text.length > max ? `${text.slice(0, max).trimEnd()}…` : text;
}

const STRIPES = ["bg-petrol", "bg-terracotta", "bg-sage", "bg-coral", "bg-cyan"];

export function ProjectCard({ projet, index, onOpen }: { projet: Projet; index: number; onOpen: (slug: string) => void }) {
  const comp = useCompetenceMap();
  return (
    <motion.button
      layout
      type="button"
      onClick={() => onOpen(projet.slug)}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.96 }}
      transition={{ duration: 0.35, delay: Math.min(index, 6) * 0.05 }}
      className="card-topo card-lift group flex h-full flex-col overflow-hidden text-left"
    >
      <span className={`h-2 w-full ${STRIPES[index % STRIPES.length]}`} />
      <div className="flex flex-1 flex-col p-6">
        <div className="flex items-center justify-between font-mono text-[11px] text-muted-foreground">
          <span>{projet.date_realisation}</span>
          <span className="grid size-8 place-items-center rounded-full border-ink bg-background text-petrol transition-transform group-hover:rotate-45">
            <ArrowUpRight className="size-4" />
          </span>
        </div>
        <h3 className="mt-3 font-display text-xl font-bold leading-tight text-petrol">{projet.titre}</h3>
        <p className="mt-2 flex-1 text-sm leading-relaxed text-ink/75">{excerpt(projet.description)}</p>
        <div className="mt-5 flex flex-wrap gap-1.5">
          {(projet.skills_slugs ?? []).slice(0, 5).map((s) => {
            const c = comp.get(s);
            return <SkillBadge key={s} nom={c.nom} categorie={c.categorie} />;
          })}
        </div>
      </div>
    </motion.button>
  );
}
