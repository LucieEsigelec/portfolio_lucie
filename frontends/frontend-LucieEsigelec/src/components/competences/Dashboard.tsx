import { motion } from "framer-motion";
import { Bar, BarChart, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { categoryStyle } from "@/lib/categories";
import { cn } from "@/lib/utils";
import { SkillBadge } from "@/components/site/SkillBadge";
import { useCompetenceMap } from "@/hooks/use-competence-map";
import { useCompetences, usePersonne, useProjets, useStatsCategories, useTopCompetences } from "@/services/queries";
import type { Niveau } from "@/services/types";

const LEVELS: Niveau[] = ["Débutant", "Intermédiaire", "Avancé", "Expert"];

function Kpi({ label, value, ink }: { label: string; value: number; ink: string }) {
  return (
    <div className="card-topo p-5">
      <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">{label}</p>
      <p className={cn("mt-2 font-display text-5xl font-extrabold", ink)}>{value}</p>
    </div>
  );
}

function ChartTooltip({ active, payload }: { active?: boolean; payload?: Array<{ name?: string; value?: number }> }) {
  const row = payload?.[0];
  if (!active || !row) return null;
  return (
    <div className="rounded-lg border-ink bg-background px-3 py-1.5 font-mono text-xs text-petrol shadow-hard">
      {row.name} · <b>{row.value}</b>
    </div>
  );
}

export function Dashboard() {
  const { data: cats } = useStatsCategories();
  const { data: top } = useTopCompetences(8);
  const { data: competences } = useCompetences();
  const { data: projets } = useProjets();
  const { data: personne } = usePersonne();
  const comp = useCompetenceMap();

  const catData = (cats?.data ?? []).map((c) => ({ name: c.categorie, value: c.total, color: categoryStyle(c.categorie).color }));
  const total = catData.reduce((s, c) => s + c.value, 0) || 1;
  const topData = (top?.data ?? []).map((t) => ({
    name: t.nom,
    value: t.usages,
    color: categoryStyle(comp.get(t.slug).categorie).color,
  }));
  const profil = personne?.data.profil;

  const grouped = new Map<string, typeof comp.all>();
  (competences?.data ?? []).forEach((c) => grouped.set(c.categorie, [...(grouped.get(c.categorie) ?? []), c]));

  return (
    <div className="space-y-10">
      <div className="grid grid-cols-2 gap-5 lg:grid-cols-4">
        <Kpi label="Compétences" value={competences?.data.length ?? 0} ink="text-petrol" />
        <Kpi label="Catégories" value={catData.length} ink="text-terracotta" />
        <Kpi label="Projets" value={projets?.data.length ?? 0} ink="text-sage" />
        <Kpi
          label="Expériences & formations"
          value={(profil?.experiences?.length ?? 0) + (profil?.formations?.length ?? 0)}
          ink="text-coral"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_1.3fr]">
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="card-topo p-6"
        >
          <h2 className="font-display text-2xl font-bold text-petrol">Répartition par catégorie</h2>
          <p className="mt-1 font-mono text-[11px] text-muted-foreground">agrégation MongoDB · /competences/stats/categories</p>
          <div className="mt-4 h-60">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={catData} dataKey="value" nameKey="name" innerRadius="55%" outerRadius="90%" paddingAngle={3} stroke="var(--petrol)" strokeWidth={1.5}>
                  {catData.map((c) => (
                    <Cell key={c.name} fill={c.color} />
                  ))}
                </Pie>
                <Tooltip content={<ChartTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <ul className="mt-4 space-y-2.5">
            {catData.map((c) => (
              <li key={c.name} className="grid grid-cols-[1fr_auto] items-center gap-3 text-sm">
                <span className="flex items-center gap-2 font-semibold text-ink">
                  <span className="size-3 rounded-full border border-petrol" style={{ background: c.color }} />
                  {c.name}
                </span>
                <span className="font-mono text-xs text-muted-foreground">
                  {c.value} · {Math.round((c.value / total) * 100)}%
                </span>
              </li>
            ))}
          </ul>
        </motion.section>

        <motion.section
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
          className="card-topo p-6"
        >
          <h2 className="font-display text-2xl font-bold text-petrol">Les plus utilisées</h2>
          <p className="mt-1 font-mono text-[11px] text-muted-foreground">requête Cypher Neo4j · /competences/stats/top</p>
          <div className="mt-4" style={{ height: Math.max(240, topData.length * 40) }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={topData} layout="vertical" margin={{ left: 8, right: 16, top: 4, bottom: 4 }}>
                <XAxis type="number" hide allowDecimals={false} />
                <YAxis
                  type="category"
                  dataKey="name"
                  width={96}
                  tickLine={false}
                  axisLine={false}
                  tick={{ fill: "var(--ink)", fontSize: 12, fontFamily: "var(--font-mono)" }}
                />
                <Tooltip content={<ChartTooltip />} cursor={{ fill: "var(--paper)" }} />
                <Bar dataKey="value" radius={[0, 999, 999, 0]} stroke="var(--petrol)" strokeWidth={1.5} barSize={22}>
                  {topData.map((t) => (
                    <Cell key={t.name} fill={t.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.section>
      </div>

      <section>
        <h2 className="font-display text-3xl font-bold text-petrol">Toutes les compétences</h2>
        <div className="mt-6 grid gap-5 md:grid-cols-2">
          {[...grouped.entries()].map(([cat, list]) => {
            const style = categoryStyle(cat);
            return (
              <div key={cat} className="card-topo p-5">
                <div className="flex items-center justify-between">
                  <h3 className="flex items-center gap-2 font-display text-lg font-bold text-ink">
                    <span className={cn("size-3 rounded-full border border-petrol", style.dot)} />
                    {cat}
                  </h3>
                  <span className="rounded-full border-ink bg-background px-2 py-0.5 font-mono text-[10px] text-petrol">
                    {style.family}
                  </span>
                </div>
                <ul className="mt-4 space-y-2.5">
                  {list.map((c) => {
                    const lvl = c.niveau ? LEVELS.indexOf(c.niveau) + 1 : 0;
                    return (
                      <li key={c.slug} className="flex items-center justify-between gap-3">
                        <SkillBadge nom={c.nom} categorie={c.categorie} />
                        {lvl > 0 && (
                          <span className="flex items-center gap-2 font-mono text-[10px] text-muted-foreground">
                            {c.niveau}
                            <span className="flex gap-1">
                              {LEVELS.map((_, i) => (
                                <span
                                  key={i}
                                  className={cn("size-2 rounded-full border border-petrol", i < lvl ? style.dot : "bg-background")}
                                />
                              ))}
                            </span>
                          </span>
                        )}
                      </li>
                    );
                  })}
                </ul>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
