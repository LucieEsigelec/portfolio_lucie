import { WaveDivider } from "@/components/topo/WaveDivider";
import { ContactActions } from "./ContactActions";

export function SiteFooter() {
  return (
    <footer className="mt-24">
      <WaveDivider />
      <div className="bg-petrol text-cream">
        <div className="mx-auto flex max-w-6xl flex-col gap-8 px-5 py-14 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="font-mono text-xs uppercase tracking-[0.2em] text-cyan">On garde le contact</p>
            <p className="mt-3 max-w-md font-display text-3xl font-bold leading-tight">
              Une donnée à faire parler, une appli à construire&nbsp;?
            </p>
          </div>
          <ContactActions compact />
        </div>
        <div className="border-t border-cream/20">
          <p className="mx-auto max-w-6xl px-5 py-5 font-mono text-[11px] text-cream/70">
            © {new Date().getFullYear()} Lucie Reichardt · FastAPI · MongoDB · Neo4j · React
          </p>
        </div>
      </div>
    </footer>
  );
}
