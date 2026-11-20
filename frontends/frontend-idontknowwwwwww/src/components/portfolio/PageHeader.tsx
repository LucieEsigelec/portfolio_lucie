import type { ReactNode } from "react";

export function PageHeader({
  kicker,
  title,
  description,
  aside,
}: {
  kicker: ReactNode;
  title: ReactNode;
  description?: ReactNode;
  aside?: ReactNode;
}) {
  return (
    <section className="relative overflow-hidden border-b border-border/60">
      <div className="pointer-events-none absolute inset-0 bg-grid" aria-hidden />
      <div className="pointer-events-none absolute inset-0 bg-halo" aria-hidden />
      <div className="relative mx-auto max-w-6xl px-4 py-14 sm:px-6 sm:py-20">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl animate-rise">
            <div className="mb-4 flex flex-wrap items-center gap-2 font-mono text-xs uppercase tracking-[0.2em] text-primary">
              {kicker}
            </div>
            <h1 className="text-4xl font-semibold text-foreground sm:text-5xl">{title}</h1>
            {description ? (
              <div className="mt-4 text-base text-muted-foreground sm:text-lg">{description}</div>
            ) : null}
          </div>
          {aside ? <div className="animate-fade">{aside}</div> : null}
        </div>
      </div>
    </section>
  );
}
