import { useQuery } from "@tanstack/react-query";
import { Link, useHydrated } from "@tanstack/react-router";

import { cn } from "@/lib/utils";
import { healthQuery, personneQuery } from "@/services/queries";

const NAV = [
  { to: "/", label: "Profil", exact: true },
  { to: "/projets", label: "Projets", exact: false },
  { to: "/competences", label: "Compétences", exact: false },
] as const;

function ApiStatusPill() {
  const hydrated = useHydrated();
  const { data, isPending } = useQuery(healthQuery());
  const state = !hydrated || isPending ? "checking" : (data?.state ?? "offline");
  const label = {
    checking: "Vérification…",
    online: "API en ligne",
    offline: "API indisponible",
    unconfigured: "API non configurée",
  }[state];
  return (
    <span
      className={cn(
        "hidden items-center gap-2 rounded-full border px-2.5 py-1 font-mono text-[10px] uppercase tracking-wider md:inline-flex",
        state === "online" && "border-success/30 text-success",
        state === "checking" && "border-border text-muted-foreground",
        (state === "offline" || state === "unconfigured") && "border-warning/40 text-warning",
      )}
      title={data?.error?.message ?? "GET /api/health"}
    >
      <span className="size-1.5 animate-pulse-dot rounded-full bg-current" />
      {label}
    </span>
  );
}

export function SiteHeader() {
  // Route loaders may fill the cache before hydration: render the name only once hydrated.
  const hydrated = useHydrated();
  const { data } = useQuery(personneQuery());
  const profil = hydrated ? data?.data.profil : undefined;
  const initials = profil ? `${profil.prenom.charAt(0)}${profil.nom.charAt(0)}` : "··";

  return (
    <header className="sticky top-0 z-40 border-b border-border/70 bg-background/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-6xl items-center gap-4 px-4 sm:px-6">
        <Link to="/" className="group flex min-w-0 items-center gap-3">
          <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-gradient-accent font-display text-sm font-bold text-primary-foreground">
            {initials}
          </span>
          <span className="hidden min-w-0 sm:block">
            <span className="block truncate font-display text-sm font-semibold text-foreground">
              {profil ? `${profil.prenom} ${profil.nom}` : "Portfolio"}
            </span>
            <span className="block font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
              CV augmenté · graphe
            </span>
          </span>
        </Link>

        <nav className="ml-auto flex items-center gap-1" aria-label="Navigation principale">
          {NAV.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              activeOptions={{ exact: item.exact }}
              className="rounded-md px-3 py-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
              activeProps={{ className: "bg-secondary text-foreground" }}
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <ApiStatusPill />
      </div>
    </header>
  );
}
