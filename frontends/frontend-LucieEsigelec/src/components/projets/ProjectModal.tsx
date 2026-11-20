import ReactMarkdown from "react-markdown";
import { CalendarDays, Link2, MapPin } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { SkillBadge } from "@/components/site/SkillBadge";
import { useCompetenceMap } from "@/hooks/use-competence-map";
import { usePersonne, useProjet } from "@/services/queries";

export function ProjectModal({ slug, onSelect }: { slug: string | null; onSelect: (slug: string | null) => void }) {
  const { data, isFetching } = useProjet(slug);
  const { data: personne } = usePersonne();
  const comp = useCompetenceMap();
  const projet = data?.data;

  const contexte = (() => {
    if (!projet) return null;
    const p = personne?.data.profil;
    const f = p?.formations?.find((x) => x.id === projet.contexte_id);
    if (f) return `${f.diplome} · ${f.ecole}`;
    const e = p?.experiences?.find((x) => x.id === projet.contexte_id);
    if (e) return `${e.poste} · ${e.structure}`;
    return projet.contexte_id;
  })();

  const skills =
    projet?.competences_detaillees?.length
      ? projet.competences_detaillees
      : (projet?.skills_slugs ?? []).map((s) => comp.get(s));

  return (
    <Dialog open={!!slug} onOpenChange={(o) => !o && onSelect(null)}>
      <DialogContent className="max-h-[88vh] max-w-2xl overflow-y-auto p-0">
        {projet ? (
          <div>
            <div className="paper-grain border-b-[1.5px] border-petrol bg-paper px-7 pb-6 pt-8">
              <div className="flex flex-wrap gap-x-5 gap-y-1 font-mono text-[11px] text-muted-foreground">
                <span className="inline-flex items-center gap-1.5">
                  <CalendarDays className="size-3.5" /> {projet.date_realisation}
                </span>
                {contexte && (
                  <span className="inline-flex items-center gap-1.5">
                    <MapPin className="size-3.5" /> {contexte}
                  </span>
                )}
              </div>
              <DialogTitle className="mt-3 font-display text-3xl font-extrabold leading-tight text-petrol">
                {projet.titre}
              </DialogTitle>
              <DialogDescription className="sr-only">Détail du projet {projet.titre}</DialogDescription>
              <div className="mt-4 flex flex-wrap gap-1.5">
                {skills.map((c) => (
                  <SkillBadge key={c.slug} nom={c.nom} categorie={c.categorie ?? comp.get(c.slug).categorie} />
                ))}
              </div>
            </div>

            <div className="markdown px-7 py-4">
              <ReactMarkdown>{projet.description || "_Pas encore de description pour ce projet._"}</ReactMarkdown>
            </div>

            {!!projet.projets_similaires?.length && (
              <div className="border-t-[1.5px] border-petrol px-7 py-6">
                <p className="flex items-center gap-2 font-mono text-xs uppercase tracking-[0.2em] text-terracotta">
                  <Link2 className="size-3.5" /> Projets similaires
                </p>
                <ul className="mt-4 grid gap-3">
                  {projet.projets_similaires.map((s) => {
                    const pct = Math.round(Math.min(1, s.score > 1 ? s.score / 10 : s.score) * 100);
                    return (
                      <li key={s.slug}>
                        <button
                          type="button"
                          onClick={() => onSelect(s.slug)}
                          className="card-lift flex w-full items-center gap-4 rounded-xl border-ink bg-card px-4 py-3 text-left"
                        >
                          <span className="flex-1">
                            <span className="block font-display font-bold text-petrol">{s.titre}</span>
                            {s.annee && <span className="font-mono text-[11px] text-muted-foreground">{s.annee}</span>}
                          </span>
                          <span className="w-24">
                            <span className="block h-2 overflow-hidden rounded-full border border-petrol bg-background">
                              <span className="block h-full bg-sage" style={{ width: `${pct}%` }} />
                            </span>
                            <span className="mt-1 block text-right font-mono text-[10px] text-muted-foreground">
                              score {Number.isInteger(s.score) ? s.score : s.score.toFixed(2)}
                            </span>
                          </span>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </div>
            )}
          </div>
        ) : (
          <div className="p-10 text-center font-mono text-sm text-muted-foreground">
            {isFetching ? "Chargement du projet…" : "Projet introuvable."}
            <DialogTitle className="sr-only">Projet</DialogTitle>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
