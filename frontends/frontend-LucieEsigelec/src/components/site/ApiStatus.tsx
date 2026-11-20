import { API_URL } from "@/services/api";
import { useHealth } from "@/services/queries";
import { cn } from "@/lib/utils";

/** Small pill telling whether data comes from the live FastAPI server or the demo fallback. */
export function ApiStatus({ className }: { className?: string }) {
  const { data, isPending } = useHealth();
  const live = data?.source === "api";
  const label = isPending ? "Connexion…" : live ? "API connectée" : "Mode démo";
  return (
    <span
      title={live ? `Données live depuis ${API_URL}` : `API injoignable (${API_URL}) — données de démonstration`}
      className={cn(
        "inline-flex items-center gap-2 rounded-full border-ink bg-card px-3 py-1 font-mono text-[11px] text-petrol",
        className,
      )}
    >
      <span className="relative flex size-2">
        {live && <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-sage opacity-70" />}
        <span className={cn("relative inline-flex size-2 rounded-full", live ? "bg-sage" : isPending ? "bg-cyan" : "bg-terracotta")} />
      </span>
      {label}
    </span>
  );
}
