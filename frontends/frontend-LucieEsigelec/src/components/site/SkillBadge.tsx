import { cn } from "@/lib/utils";
import { categoryStyle } from "@/lib/categories";

interface SkillBadgeProps {
  nom: string;
  categorie?: string | null | undefined;
  variant?: "solid" | "outline";
  className?: string;
}

/** Monospace skill tag coloured by its category. */
export function SkillBadge({ nom, categorie, variant = "solid", className }: SkillBadgeProps) {
  const style = categoryStyle(categorie);
  return (
    <span
      title={categorie ?? undefined}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border-ink px-2.5 py-0.5 font-mono text-[11px] font-medium leading-5",
        variant === "solid" ? style.badge : "bg-card text-ink",
        className,
      )}
    >
      {variant === "outline" && <span className={cn("size-1.5 rounded-full", style.dot)} />}
      {nom}
    </span>
  );
}
