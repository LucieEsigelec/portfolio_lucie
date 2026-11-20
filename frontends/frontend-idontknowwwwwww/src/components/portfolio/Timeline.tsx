import { Briefcase, GraduationCap } from "lucide-react";
import type { ReactNode } from "react";

import { formatPeriod, sortByStartDesc } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { Experience, Formation } from "@/types/api";
import { SkillChip } from "./SkillChip";

function TimelineItem({
  id,
  period,
  title,
  subtitle,
  badge,
  tone,
  index,
  children,
}: {
  id: string;
  period: string;
  title: string;
  subtitle: string;
  badge?: string | undefined;
  tone: "formation" | "experience";
  index: number;
  children?: ReactNode;
}) {
  return (
    <li
      id={`parcours-${id}`}
      className="relative scroll-mt-24 pb-10 pl-8 last:pb-0 animate-rise"
      style={{ animationDelay: `${index * 80}ms` }}
    >
      <span
        aria-hidden
        className={cn(
          "absolute left-0 top-1.5 size-3 rounded-full border-2 border-background ring-4 ring-background",
          tone === "formation" ? "bg-usage-formation" : "bg-usage-experience",
        )}
      />
      <p className="font-mono text-xs text-muted-foreground">{period}</p>
      <div className="mt-1 flex flex-wrap items-center gap-2">
        <h3 className="text-lg font-semibold text-foreground">{title}</h3>
        {badge ? (
          <span
            className={cn(
              "rounded-full px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider",
              tone === "formation"
                ? "bg-usage-formation/15 text-usage-formation"
                : "bg-usage-experience/15 text-usage-experience",
            )}
          >
            {badge}
          </span>
        ) : null}
      </div>
      <p className="text-sm text-muted-foreground">{subtitle}</p>
      {children}
    </li>
  );
}

function Rail({ children }: { children: ReactNode }) {
  return (
    <ol className="relative before:absolute before:left-[5px] before:top-2 before:bottom-2 before:w-px before:bg-border">
      {children}
    </ol>
  );
}

function SkillRow({ slugs, names }: { slugs?: string[] | undefined; names: Map<string, string> }) {
  if (!slugs || slugs.length === 0) return null;
  return (
    <div className="mt-3 flex flex-wrap gap-1.5">
      {slugs.map((s) => (
        <SkillChip key={s} slug={s} label={names.get(s) ?? s} />
      ))}
    </div>
  );
}

function EmptyTimeline({ label }: { label: string }) {
  return <p className="text-sm italic text-muted-foreground">{label}</p>;
}

export function FormationTimeline({
  formations,
  skillNames,
}: {
  formations: Formation[];
  skillNames: Map<string, string>;
}) {
  return (
    <div className="surface p-6 sm:p-8">
      <div className="mb-6 flex items-center gap-2 text-usage-formation">
        <GraduationCap className="size-5" />
        <h3 className="text-base font-semibold text-foreground">Formations</h3>
      </div>
      {formations.length === 0 ? (
        <EmptyTimeline label="Aucune formation renseignée." />
      ) : (
        <Rail>
          {sortByStartDesc(formations).map((f, i) => (
            <TimelineItem
              key={f.id}
              id={f.id}
              index={i}
              tone="formation"
              period={formatPeriod(f.debut, f.fin)}
              title={f.diplome}
              subtitle={f.ecole}
            >
              <SkillRow slugs={f.competences} names={skillNames} />
            </TimelineItem>
          ))}
        </Rail>
      )}
    </div>
  );
}

export function ExperienceTimeline({
  experiences,
  skillNames,
}: {
  experiences: Experience[];
  skillNames: Map<string, string>;
}) {
  return (
    <div className="surface p-6 sm:p-8">
      <div className="mb-6 flex items-center gap-2 text-usage-experience">
        <Briefcase className="size-5" />
        <h3 className="text-base font-semibold text-foreground">Expériences</h3>
      </div>
      {experiences.length === 0 ? (
        <EmptyTimeline label="Aucune expérience renseignée." />
      ) : (
        <Rail>
          {sortByStartDesc(experiences).map((e, i) => (
            <TimelineItem
              key={e.id}
              id={e.id}
              index={i}
              tone="experience"
              period={formatPeriod(e.debut, e.fin)}
              title={e.poste}
              subtitle={e.structure}
              badge={e.type}
            >
              {e.missions && e.missions.length > 0 ? (
                <ul className="mt-3 space-y-1 text-sm text-foreground/85">
                  {e.missions.map((m) => (
                    <li key={m} className="flex gap-2">
                      <span className="mt-2 size-1 shrink-0 rounded-full bg-usage-experience" />
                      {m}
                    </li>
                  ))}
                </ul>
              ) : null}
              <SkillRow slugs={e.competences} names={skillNames} />
            </TimelineItem>
          ))}
        </Rail>
      )}
    </div>
  );
}
