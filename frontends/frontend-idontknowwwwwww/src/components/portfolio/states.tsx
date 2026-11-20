import { useQueryClient, useQueryErrorResetBoundary } from "@tanstack/react-query";
import { Link, useRouter, type ErrorComponentProps } from "@tanstack/react-router";
import { AlertTriangle, Inbox, RefreshCw, SearchX } from "lucide-react";
import type { ReactNode } from "react";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ApiError } from "@/services/api";

export function PageLoader() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6" aria-busy="true" aria-live="polite">
      <p className="mb-8 flex items-center gap-2 font-mono text-xs uppercase tracking-[0.2em] text-primary">
        <span className="size-2 animate-pulse rounded-full bg-primary" />
        Chargement des données…
      </p>
      <Skeleton className="mb-4 h-12 w-2/3 max-w-xl" />
      <Skeleton className="mb-10 h-5 w-1/2 max-w-md" />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }, (_, i) => (
          <Skeleton key={i} className="h-40 rounded-xl" />
        ))}
      </div>
    </div>
  );
}

export function SectionLoader({ rows = 3 }: { rows?: number }) {
  return (
    <div className="space-y-3" aria-busy="true">
      {Array.from({ length: rows }, (_, i) => (
        <Skeleton key={i} className="h-16 rounded-lg" />
      ))}
    </div>
  );
}

function describeError(error: unknown): { title: string; detail: string; meta: string | null } {
  if (error instanceof ApiError) {
    const titles: Record<ApiError["kind"], string> = {
      config: "API non configurée",
      timeout: "L'API ne répond pas",
      network: "API injoignable",
      http: `L'API a renvoyé une erreur${error.status ? ` ${error.status}` : ""}`,
      parse: "Réponse de l'API illisible",
    };
    return {
      title: error.fallbackMissing ? "Indisponible hors ligne" : titles[error.kind],
      detail: error.message,
      meta: `GET ${error.path}`,
    };
  }
  return {
    title: "Erreur inattendue",
    detail: error instanceof Error ? error.message : String(error),
    meta: null,
  };
}

/** Route-level error state: never hides the underlying API error. */
export function RouteErrorState({ error }: ErrorComponentProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { reset } = useQueryErrorResetBoundary();
  const { title, detail, meta } = describeError(error);

  return (
    <div className="mx-auto max-w-2xl px-4 py-24 sm:px-6">
      <div role="alert" className="surface p-8">
        <div className="mb-4 flex size-11 items-center justify-center rounded-full bg-destructive/15 text-destructive">
          <AlertTriangle className="size-5" />
        </div>
        <h1 className="text-2xl font-semibold text-foreground">{title}</h1>
        <p className="mt-2 text-sm text-muted-foreground">{detail}</p>
        {meta ? (
          <p className="mt-4 inline-block rounded-md bg-muted px-2 py-1 font-mono text-xs text-muted-foreground">
            {meta}
          </p>
        ) : null}
        <div className="mt-6 flex flex-wrap gap-2">
          <Button
            onClick={() => {
              reset();
              void queryClient.invalidateQueries();
              void router.invalidate();
            }}
          >
            <RefreshCw /> Réessayer
          </Button>
          <Button variant="glass" asChild>
            <Link to="/">Retour au profil</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}

export function NotFoundState({ title, children }: { title: string; children?: ReactNode }) {
  return (
    <div className="mx-auto max-w-2xl px-4 py-24 text-center sm:px-6">
      <div className="mx-auto mb-4 flex size-12 items-center justify-center rounded-full bg-secondary text-primary">
        <SearchX className="size-5" />
      </div>
      <h1 className="text-2xl font-semibold text-foreground">{title}</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        {children ?? "Cette ressource n'existe pas dans l'API."}
      </p>
    </div>
  );
}

export function EmptyState({
  title,
  children,
  action,
}: {
  title: string;
  children?: ReactNode;
  action?: ReactNode;
}) {
  return (
    <div className="rounded-xl border border-dashed border-border px-6 py-12 text-center">
      <Inbox className="mx-auto mb-3 size-6 text-muted-foreground" />
      <p className="font-medium text-foreground">{title}</p>
      {children ? <p className="mt-1 text-sm text-muted-foreground">{children}</p> : null}
      {action ? <div className="mt-4">{action}</div> : null}
    </div>
  );
}

/** Error state for a secondary section loaded with useQuery. */
export function InlineError({ error, onRetry }: { error: unknown; onRetry?: () => void }) {
  const { title, detail } = describeError(error);
  return (
    <div
      role="alert"
      className="flex flex-col gap-3 rounded-lg border border-destructive/40 bg-destructive/10 p-4 text-sm sm:flex-row sm:items-center sm:justify-between"
    >
      <div>
        <p className="font-medium text-destructive">{title}</p>
        <p className="text-muted-foreground">{detail}</p>
      </div>
      {onRetry ? (
        <Button size="sm" variant="glass" onClick={onRetry}>
          <RefreshCw /> Réessayer
        </Button>
      ) : null}
    </div>
  );
}
