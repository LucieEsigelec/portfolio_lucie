import { Link } from "@tanstack/react-router";
import { Menu, X } from "lucide-react";
import { useState } from "react";
import { ApiStatus } from "./ApiStatus";

const NAV = [
  { to: "/", label: "Accueil" },
  { to: "/parcours", label: "Parcours" },
  { to: "/projets", label: "Projets" },
  { to: "/competences", label: "Compétences" },
] as const;

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  return (
    <header className="sticky top-0 z-40 border-b-[1.5px] border-petrol bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-5">
        <Link to="/" className="group flex items-center gap-3" onClick={() => setOpen(false)}>
          <span className="grid size-9 place-items-center rounded-full border-ink bg-petrol font-display text-sm font-extrabold text-cream shadow-hard-accent transition-transform group-hover:-rotate-12">
            LR
          </span>
          <span className="hidden font-display text-base font-bold text-petrol sm:block">Lucie Reichardt</span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {NAV.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              activeOptions={{ exact: item.to === "/" }}
              className="rounded-full px-4 py-1.5 text-sm font-semibold text-ink transition-colors hover:bg-paper data-[status=active]:bg-petrol data-[status=active]:text-cream"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <ApiStatus className="hidden sm:inline-flex" />
          <button
            type="button"
            aria-label={open ? "Fermer le menu" : "Ouvrir le menu"}
            onClick={() => setOpen((v) => !v)}
            className="grid size-10 place-items-center rounded-full border-ink bg-card text-petrol md:hidden"
          >
            {open ? <X className="size-4" /> : <Menu className="size-4" />}
          </button>
        </div>
      </div>
      {open && (
        <nav className="flex flex-col gap-1 border-t-[1.5px] border-petrol bg-background px-5 py-4 md:hidden">
          {NAV.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              activeOptions={{ exact: item.to === "/" }}
              onClick={() => setOpen(false)}
              className="rounded-xl px-4 py-2.5 font-display text-lg font-bold text-ink data-[status=active]:bg-petrol data-[status=active]:text-cream"
            >
              {item.label}
            </Link>
          ))}
          <ApiStatus className="mt-2 self-start" />
        </nav>
      )}
    </header>
  );
}
