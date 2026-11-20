import { motion } from "framer-motion";
import { Briefcase, GraduationCap } from "lucide-react";
import { SkillBadge } from "@/components/site/SkillBadge";
import { useCompetenceMap } from "@/hooks/use-competence-map";
import { formatRange } from "@/lib/dates";
import { cn } from "@/lib/utils";
import { usePersonne } from "@/services/queries";

interface Item {
  id: string;
  kind: "experience" | "formation";
  label: string;
  title: string;
  place: string;
  debut: string;
  fin?: string | null | undefined;
  missions: string[];
  competences: string[];
}

/** Vertical organic timeline mixing experiences and education, newest first. */
export function Timeline() {
  const { data } = usePersonne();
  const comp = useCompetenceMap();
  const p = data?.data.profil;

  const items: Item[] = [
    ...(p?.experiences ?? []).map((e) => ({
      id: e.id,
      kind: "experience" as const,
      label: e.type,
      title: e.poste,
      place: e.structure,
      debut: e.debut,
      fin: e.fin,
      missions: e.missions ?? [],
      competences: e.competences ?? [],
    })),
    ...(p?.formations ?? []).map((f) => ({
      id: f.id,
      kind: "formation" as const,
      label: "Formation",
      title: f.diplome,
      place: f.ecole,
      debut: f.debut,
      fin: f.fin,
      missions: [],
      competences: f.competences ?? [],
    })),
  ].sort((a, b) => b.debut.localeCompare(a.debut));

  return (
    <div className="relative">
      {/* organic spine */}
      <svg
        aria-hidden
        className="absolute left-5 top-0 h-full w-10 -translate-x-1/2 md:left-1/2"
        viewBox="0 0 40 1000"
        preserveAspectRatio="none"
      >
        <path
          d="M20,0 C40,80 0,160 20,240 S40,400 20,480 S0,640 20,720 S40,880 20,1000"
          fill="none"
          stroke="var(--petrol)"
          strokeWidth="2"
          vectorEffect="non-scaling-stroke"
        />
        <path
          d="M26,0 C46,80 6,160 26,240 S46,400 26,480 S6,640 26,720 S46,880 26,1000"
          fill="none"
          stroke="var(--terracotta)"
          strokeWidth="1.5"
          strokeDasharray="4 6"
          vectorEffect="non-scaling-stroke"
        />
      </svg>

      <ol className="relative space-y-12">
        {items.map((item, i) => {
          const left = i % 2 === 0;
          const Icon = item.kind === "experience" ? Briefcase : GraduationCap;
          return (
            <li key={item.id} className="relative md:grid md:grid-cols-2 md:gap-16">
              <span
                className={cn(
                  "absolute left-5 top-6 z-10 grid size-10 -translate-x-1/2 place-items-center rounded-full border-ink shadow-hard md:left-1/2",
                  item.kind === "experience" ? "bg-terracotta text-ink" : "bg-sage text-ink",
                )}
              >
                <Icon className="size-4" />
              </span>
              <motion.article
                initial={{ opacity: 0, x: left ? -30 : 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: "-80px" }}
                transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
                className={cn("card-topo card-lift ml-14 p-6 md:ml-0", left ? "md:col-start-1" : "md:col-start-2")}
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span
                    className={cn(
                      "rounded-full border-ink px-2.5 py-0.5 font-mono text-[11px] font-semibold",
                      item.kind === "experience" ? "bg-terracotta text-ink" : "bg-sage text-ink",
                    )}
                  >
                    {item.label}
                  </span>
                  <span className="font-mono text-[11px] text-muted-foreground">{formatRange(item.debut, item.fin)}</span>
                </div>
                <h3 className="mt-4 font-display text-xl font-bold leading-tight text-petrol">{item.title}</h3>
                <p className="mt-1 text-sm font-semibold text-ink/70">{item.place}</p>
                {item.missions.length > 0 && (
                  <ul className="mt-4 space-y-2 text-sm text-ink/80">
                    {item.missions.map((m) => (
                      <li key={m} className="flex gap-2.5">
                        <span className="mt-2 size-1.5 shrink-0 rounded-full bg-terracotta" />
                        {m}
                      </li>
                    ))}
                  </ul>
                )}
                {item.competences.length > 0 && (
                  <div className="mt-5 flex flex-wrap gap-1.5">
                    {item.competences.map((s) => {
                      const c = comp.get(s);
                      return <SkillBadge key={s} nom={c.nom} categorie={c.categorie} variant="outline" />;
                    })}
                  </div>
                )}
              </motion.article>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
