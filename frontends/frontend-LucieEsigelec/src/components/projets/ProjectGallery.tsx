import { AnimatePresence } from "framer-motion";
import { useMemo, useState } from "react";
import { categoryStyle } from "@/lib/categories";
import { cn } from "@/lib/utils";
import { useCompetenceMap } from "@/hooks/use-competence-map";
import { useProjets } from "@/services/queries";
import { ProjectCard } from "./ProjectCard";
import { ProjectModal } from "./ProjectModal";

export function ProjectGallery({ limit }: { limit?: number }) {
  const [filter, setFilter] = useState<string | undefined>(undefined);
  const [open, setOpen] = useState<string | null>(null);
  const comp = useCompetenceMap();
  const { data: all } = useProjets();
  const { data: filtered, isFetching } = useProjets(filter);

  // Filter chips: every skill used by at least one project, most used first.
  const chips = useMemo(() => {
    const counts = new Map<string, number>();
    all?.data.forEach((p) => p.skills_slugs?.forEach((s) => counts.set(s, (counts.get(s) ?? 0) + 1)));
    return [...counts.entries()].sort((a, b) => b[1] - a[1]).map(([slug, n]) => ({ ...comp.get(slug), n }));
  }, [all, comp]);

  const projets = (filter ? filtered?.data : all?.data) ?? [];
  const shown = limit ? projets.slice(0, limit) : projets;

  return (
    <div>
      {!limit && (
        <div className="mb-10 flex flex-wrap gap-2" role="toolbar" aria-label="Filtrer par compétence">
          <button
            type="button"
            onClick={() => setFilter(undefined)}
            aria-pressed={!filter}
            className={cn(
              "rounded-full border-ink px-4 py-1.5 font-mono text-xs font-semibold transition-all",
              !filter ? "bg-petrol text-cream shadow-hard-accent" : "bg-card text-petrol hover:bg-paper",
            )}
          >
            Tous · {all?.data.length ?? 0}
          </button>
          {chips.map((c) => {
            const active = filter === c.slug;
            const style = categoryStyle(c.categorie);
            return (
              <button
                key={c.slug}
                type="button"
                aria-pressed={active}
                onClick={() => setFilter(active ? undefined : c.slug)}
                className={cn(
                  "inline-flex items-center gap-2 rounded-full border-ink px-3.5 py-1.5 font-mono text-xs font-medium transition-all",
                  active ? cn(style.badge, "shadow-hard") : "bg-card text-ink hover:bg-paper",
                )}
              >
                {!active && <span className={cn("size-2 rounded-full", style.dot)} />}
                {c.nom}
                <span className="opacity-60">{c.n}</span>
              </button>
            );
          })}
        </div>
      )}

      <div className={cn("grid gap-6 sm:grid-cols-2 lg:grid-cols-3 transition-opacity", isFetching && filter && "opacity-60")}>
        <AnimatePresence mode="popLayout">
          {shown.map((p, i) => (
            <ProjectCard key={p.slug} projet={p} index={i} onOpen={setOpen} />
          ))}
        </AnimatePresence>
      </div>
      {shown.length === 0 && (
        <p className="card-topo p-8 text-center font-mono text-sm text-muted-foreground">
          Aucun projet n'utilise encore cette compétence.
        </p>
      )}

      <ProjectModal slug={open} onSelect={setOpen} />
    </div>
  );
}
