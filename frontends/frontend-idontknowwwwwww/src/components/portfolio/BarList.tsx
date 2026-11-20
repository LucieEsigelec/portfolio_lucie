import { Link } from "@tanstack/react-router";

export interface BarItem {
  key: string;
  label: string;
  value: number;
  /** When set, the row links to the skill page. */
  skillSlug?: string;
  hint?: string;
}

export function BarList({ items, unit }: { items: BarItem[]; unit: (n: number) => string }) {
  const max = Math.max(1, ...items.map((i) => i.value));
  return (
    <ol className="space-y-3">
      {items.map((item, index) => {
        const content = (
          <>
            <div className="mb-1.5 flex items-baseline justify-between gap-3 text-sm">
              <span className="flex min-w-0 items-baseline gap-2">
                <span className="w-6 shrink-0 font-mono text-xs text-muted-foreground">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <span className="truncate font-medium text-foreground group-hover:text-primary">
                  {item.label}
                </span>
                {item.hint ? (
                  <span className="hidden truncate text-xs text-muted-foreground sm:inline">
                    {item.hint}
                  </span>
                ) : null}
              </span>
              <span className="shrink-0 font-mono text-xs text-muted-foreground">
                {unit(item.value)}
              </span>
            </div>
            <div className="ml-8 h-1.5 overflow-hidden rounded-full bg-muted">
              <div
                className="h-full origin-left-grow animate-grow-x rounded-full bg-gradient-accent"
                style={{ width: `${(item.value / max) * 100}%`, animationDelay: `${index * 60}ms` }}
              />
            </div>
          </>
        );
        return (
          <li key={item.key}>
            {item.skillSlug ? (
              <Link
                to="/competences/$slug"
                params={{ slug: item.skillSlug }}
                className="group block rounded-md p-1 -m-1 transition-colors hover:bg-secondary/40"
              >
                {content}
              </Link>
            ) : (
              <div className="p-1 -m-1">{content}</div>
            )}
          </li>
        );
      })}
    </ol>
  );
}
