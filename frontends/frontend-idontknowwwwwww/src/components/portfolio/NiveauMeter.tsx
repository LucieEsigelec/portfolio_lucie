import { NIVEAUX, niveauLevel } from "@/lib/format";
import { cn } from "@/lib/utils";

export function NiveauMeter({
  niveau,
  className,
  showLabel = true,
}: {
  niveau?: string | null | undefined;
  className?: string | undefined;
  showLabel?: boolean | undefined;
}) {
  const level = niveauLevel(niveau);
  if (level === 0) {
    return showLabel ? (
      <span className={cn("text-xs italic text-muted-foreground", className)}>
        Niveau non renseigné
      </span>
    ) : null;
  }
  return (
    <span className={cn("inline-flex items-center gap-2", className)} title={niveau ?? undefined}>
      <span className="flex gap-0.5" aria-hidden>
        {NIVEAUX.map((n, i) => (
          <span
            key={n}
            className={cn("h-1.5 w-4 rounded-full", i < level ? "bg-primary" : "bg-border")}
          />
        ))}
      </span>
      {showLabel ? <span className="text-xs text-muted-foreground">{niveau}</span> : null}
      <span className="sr-only">Niveau : {niveau}</span>
    </span>
  );
}
