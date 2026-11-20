import { Link } from "@tanstack/react-router";
import { ArrowUpRight, Calendar, Users } from "lucide-react";

import { formatMonth } from "@/lib/format";
import type { Projet } from "@/types/api";
import { SkillTag } from "./SkillChip";

export function ProjetCard({
  projet,
  index = 0,
  skillNames,
  personNames,
}: {
  projet: Projet;
  index?: number;
  skillNames: Map<string, string>;
  personNames: Map<string, string>;
}) {
  const personnes = projet.personne_slugs ?? [];
  const skills = projet.skills_slugs ?? [];
  return (
    <Link
      to="/projets/$slug"
      params={{ slug: projet.slug }}
      className="group surface hover-lift flex h-full flex-col p-6 animate-rise"
      style={{ animationDelay: `${index * 60}ms` }}
    >
      <div className="mb-4 flex items-center justify-between gap-3 text-xs text-muted-foreground">
        <span className="inline-flex items-center gap-1.5 font-mono">
          <Calendar className="size-3.5" />
          {formatMonth(projet.date_realisation) ?? "Date non renseignée"}
        </span>
        <ArrowUpRight className="size-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-primary" />
      </div>
      <h3 className="text-lg font-semibold text-foreground transition-colors group-hover:text-primary">
        {projet.titre}
      </h3>
      <p className="mt-2 line-clamp-3 flex-1 text-sm text-muted-foreground">
        {projet.description?.trim() || (
          <span className="italic">Aucune description fournie.</span>
        )}
      </p>
      <div className="mt-5 space-y-3">
        {skills.length > 0 ? (
          <div className="flex flex-wrap gap-1.5">
            {skills.map((s) => (
              <SkillTag key={s} label={skillNames.get(s) ?? s} />
            ))}
          </div>
        ) : (
          <p className="text-xs italic text-muted-foreground">Aucune compétence liée</p>
        )}
        <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Users className="size-3.5 shrink-0" />
          {personnes.length > 0
            ? personnes.map((p) => personNames.get(p) ?? p).join(", ")
            : "Contributeurs non renseignés"}
        </p>
      </div>
    </Link>
  );
}
