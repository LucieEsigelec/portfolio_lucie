import { motion } from "framer-motion";
import { ContactActions } from "@/components/site/ContactActions";
import { TopoBackground } from "@/components/topo/TopoBackground";
import { useCompetences, usePersonne, useProjets } from "@/services/queries";
import { LaptopSkills } from "./LaptopSkills";

const rise = (delay: number) => ({
  initial: { opacity: 0, y: 24 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.7, delay, ease: [0.22, 1, 0.36, 1] as const },
});

export function Hero() {
  const { data: personne } = usePersonne();
  const { data: competences } = useCompetences();
  const { data: projets } = useProjets();
  const profil = personne?.data.profil;

  return (
    <section className="relative isolate overflow-hidden">
      <TopoBackground />
      <div className="relative mx-auto grid min-h-[calc(100svh-4rem)] max-w-6xl items-center gap-12 px-5 py-16 lg:grid-cols-[1.25fr_1fr] lg:py-10">
        <div className="min-w-0">
          <motion.span
            {...rise(0)}
            className="inline-flex items-center gap-2 rounded-full border-ink bg-card px-3 py-1 font-mono text-xs text-petrol shadow-hard backdrop-blur"
          >
            <span className="size-1.5 rounded-full bg-terracotta" />
            Data Engineering & Software Dev
          </motion.span>

          <motion.h1
            {...rise(0.1)}
            className="mt-7 font-display text-[11.5vw] font-extrabold leading-[0.92] text-petrol sm:text-7xl lg:text-[min(5rem,5.6vw)]"
          >
            {profil?.prenom ?? "Lucie"}
            <span className="relative block text-ink">
              {profil?.nom ?? "Reichardt"}
              <svg
                aria-hidden
                viewBox="0 0 300 20"
                className="absolute -bottom-3 left-0 h-4 w-[85%]"
                preserveAspectRatio="none"
              >
                <motion.path
                  d="M2,12 C40,2 70,20 110,10 S180,2 220,12 S280,16 298,6"
                  fill="none"
                  stroke="var(--terracotta)"
                  strokeWidth="5"
                  strokeLinecap="round"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ delay: 0.7, duration: 1.1, ease: "easeInOut" }}
                />
              </svg>
            </span>
          </motion.h1>

          <motion.p {...rise(0.25)} className="mt-9 max-w-xl text-lg leading-relaxed text-ink/80">
            {profil?.bio}
          </motion.p>

          <motion.div {...rise(0.35)} className="mt-8">
            <ContactActions />
          </motion.div>

          <motion.dl {...rise(0.45)} className="mt-10 flex flex-wrap gap-x-8 gap-y-3 font-mono text-xs text-muted-foreground">
            <div>
              <dt className="inline">compétences </dt>
              <dd className="inline font-bold text-petrol">{competences?.data.length ?? 0}</dd>
            </div>
            <div>
              <dt className="inline">projets </dt>
              <dd className="inline font-bold text-terracotta">{projets?.data.length ?? 0}</dd>
            </div>
            <div>
              <dt className="inline">expériences </dt>
              <dd className="inline font-bold text-sage">{profil?.experiences?.length ?? 0}</dd>
            </div>
          </motion.dl>
        </div>

        <LaptopSkills />
      </div>
    </section>
  );
}
