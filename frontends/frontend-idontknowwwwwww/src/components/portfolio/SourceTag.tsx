import { cn } from "@/lib/utils";
import type { DataSource } from "@/services/api";

/** Small per-section marker telling where the displayed data comes from. */
export function SourceTag({ source, className }: { source: DataSource; className?: string }) {
  const live = source === "api";
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider",
        live
          ? "border-primary/30 text-primary"
          : "border-warning/40 bg-warning/10 text-warning",
        className,
      )}
      title={live ? "Données servies par l'API" : "Données locales de secours"}
    >
      <span className={cn("size-1.5 rounded-full", live ? "bg-primary" : "bg-warning")} />
      {live ? "API" : "Secours local"}
    </span>
  );
}
