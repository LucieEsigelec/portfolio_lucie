import { Link } from "@tanstack/react-router";

import { cn } from "@/lib/utils";

const base =
  "inline-flex items-center gap-1.5 rounded-md border border-border bg-secondary/60 px-2 py-1 font-mono text-xs text-secondary-foreground";

/** Clickable skill chip leading to /competences/{slug}. */
export function SkillChip({
  slug,
  label,
  className,
}: {
  slug: string;
  label?: string;
  className?: string;
}) {
  return (
    <Link
      to="/competences/$slug"
      params={{ slug }}
      className={cn(
        base,
        "transition-colors hover:border-primary/50 hover:bg-primary/10 hover:text-primary",
        className,
      )}
    >
      <span className="size-1 rounded-full bg-primary" aria-hidden />
      {label ?? slug}
    </Link>
  );
}

/** Non-interactive variant, for use inside an already clickable card. */
export function SkillTag({ label, className }: { label: string; className?: string }) {
  return <span className={cn(base, className)}>{label}</span>;
}
