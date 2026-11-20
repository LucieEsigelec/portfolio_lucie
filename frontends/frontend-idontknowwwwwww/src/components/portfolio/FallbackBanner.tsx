import { useQueryClient } from "@tanstack/react-query";
import { ChevronDown, RefreshCw, WifiOff } from "lucide-react";
import { useState } from "react";

import { useFallbackStatus } from "@/hooks/use-fallback-status";
import { cn } from "@/lib/utils";

/** Discreet but always visible notice whenever fallback data is displayed. */
export function FallbackBanner() {
  const errors = useFallbackStatus();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [retrying, setRetrying] = useState(false);

  if (errors.length === 0) return null;
  const first = errors[0];

  return (
    <div role="status" className="border-b border-warning/30 bg-warning/10 animate-fade">
      <div className="mx-auto max-w-6xl px-4 py-2 sm:px-6">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs">
          <span className="inline-flex items-center gap-1.5 font-semibold text-warning">
            <WifiOff className="size-3.5" />
            Données locales de secours
          </span>
          <span className="min-w-0 flex-1 truncate text-muted-foreground">{first?.message}</span>
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            className="inline-flex items-center gap-1 text-muted-foreground transition-colors hover:text-foreground"
            aria-expanded={open}
          >
            Détails
            <ChevronDown className={cn("size-3.5 transition-transform", open && "rotate-180")} />
          </button>
          <button
            type="button"
            disabled={retrying}
            onClick={async () => {
              setRetrying(true);
              await queryClient.refetchQueries({ type: "active" });
              setRetrying(false);
            }}
            className="inline-flex items-center gap-1 font-medium text-warning transition-opacity hover:opacity-80 disabled:opacity-50"
          >
            <RefreshCw className={cn("size-3.5", retrying && "animate-spin")} />
            Réessayer l'API
          </button>
        </div>
        {open ? (
          <ul className="mt-2 space-y-1 border-t border-warning/20 pt-2 font-mono text-[11px] text-muted-foreground">
            {errors.map((e) => (
              <li key={e.path}>
                <span className="text-warning">GET {e.path}</span> — {e.message}
              </li>
            ))}
            <li className="pt-1 font-sans">
              Les données réelles de l'API remplaceront automatiquement ces données dès qu'elle
              répondra (nouvelle tentative toutes les 30 s).
            </li>
          </ul>
        ) : null}
      </div>
    </div>
  );
}
