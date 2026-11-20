import type { ReactNode } from "react";

export function SectionHeading({
  kicker,
  title,
  description,
  aside,
}: {
  kicker: string;
  title: ReactNode;
  description?: ReactNode;
  aside?: ReactNode;
}) {
  return (
    <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div className="max-w-2xl">
        <p className="mb-2 font-mono text-xs uppercase tracking-[0.2em] text-primary">{kicker}</p>
        <h2 className="text-2xl font-semibold text-foreground sm:text-3xl">{title}</h2>
        {description ? <p className="mt-2 text-sm text-muted-foreground">{description}</p> : null}
      </div>
      {aside ? <div className="shrink-0">{aside}</div> : null}
    </div>
  );
}
