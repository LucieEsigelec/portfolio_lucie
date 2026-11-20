import { motion, useReducedMotion } from "framer-motion";
import { useMemo } from "react";
import { categoryStyle } from "@/lib/categories";
import { cn } from "@/lib/utils";
import { useCompetences } from "@/services/queries";

const FEATURED = ["python", "sql", "pyspark", "react", "neo4j", "docker", "power-bi", "react-native"];

// Final bubble positions (percent of the illustration box), arranged around the screen.
const SPOTS = [
  { left: 4, top: 8 },
  { left: 40, top: -6 },
  { left: 78, top: 4 },
  { left: 88, top: 34 },
  { left: -4, top: 40 },
  { left: 80, top: 64 },
  { left: 2, top: 70 },
  { left: 46, top: 82 },
];

const ORIGIN = { left: 44, top: 32 };

export function LaptopSkills() {
  const reduce = useReducedMotion();
  const { data } = useCompetences();

  const bubbles = useMemo(() => {
    const all = data?.data ?? [];
    const picked = FEATURED.map((slug) => all.find((c) => c.slug === slug)).filter((c) => !!c);
    const rest = all.filter((c) => !FEATURED.includes(c.slug));
    return [...picked, ...rest].slice(0, SPOTS.length);
  }, [data]);

  return (
    <div className="relative mx-auto aspect-[5/4] w-full min-w-0 max-w-[560px]">
      {/* Laptop */}
      <motion.div
        initial={{ opacity: 0, y: 30, rotate: -2 }}
        animate={{ opacity: 1, y: 0, rotate: 0 }}
        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        className="absolute left-[7%] top-[16%] w-[86%]"
      >
        <div className="rounded-t-2xl border-ink bg-petrol p-2 shadow-hard-lg">
          <div className="relative flex aspect-[16/10] flex-col overflow-hidden rounded-lg bg-ink p-3 font-mono text-[9px] leading-relaxed text-cream sm:p-4 sm:text-[11px]">
            <div className="mb-2 flex gap-1.5">
              <span className="size-2 rounded-full bg-terracotta" />
              <span className="size-2 rounded-full bg-coral" />
              <span className="size-2 rounded-full bg-sage" />
            </div>
            <p>
              <span className="text-coral">from</span> lucie <span className="text-coral">import</span> pipeline
            </p>
            <p>
              <span className="text-cyan">graph</span> = neo4j.<span className="text-terracotta">match</span>(
              <span className="text-sage">"(p)-[:UTILISE]-&gt;(c)"</span>)
            </p>
            <p>
              df = spark.<span className="text-terracotta">read</span>.parquet(<span className="text-sage">"lake/"</span>)
            </p>
            <p className="text-cream/60"># data &amp; dev · Renault · UTFPR</p>
            <p>
              &gt; pipeline.<span className="text-terracotta">run</span>()<span className="animate-blink">▍</span>
            </p>
            <div className="mt-auto flex h-[26%] items-end gap-1 self-end pt-2">
              {[40, 70, 55, 90, 65, 100].map((h, i) => (
                <motion.span
                  key={i}
                  className={cn(
                    "w-2 rounded-sm sm:w-2.5",
                    ["bg-cyan", "bg-terracotta", "bg-sage", "bg-coral", "bg-cyan", "bg-terracotta"][i],
                  )}
                  initial={{ height: 0 }}
                  animate={{ height: `${h}%` }}
                  transition={{ delay: 0.5 + i * 0.08, duration: 0.6 }}
                />
              ))}
            </div>
          </div>
        </div>
        <div className="relative -mx-[7%] h-4 rounded-b-2xl border-ink bg-paper shadow-hard">
          <span className="absolute left-1/2 top-0 h-1.5 w-1/5 -translate-x-1/2 rounded-b-lg border-x-[1.5px] border-b-[1.5px] border-petrol bg-cream" />
        </div>
      </motion.div>

      {/* Skill bubbles popping out of the screen */}
      {bubbles.map((c, i) => {
        const spot = SPOTS[i] ?? ORIGIN;
        const style = categoryStyle(c.categorie);
        return (
          <motion.div
            key={c.slug}
            className="absolute z-10"
            initial={reduce ? false : { left: `${ORIGIN.left}%`, top: `${ORIGIN.top}%`, scale: 0, opacity: 0 }}
            animate={{ left: `${spot.left}%`, top: `${spot.top}%`, scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 140, damping: 12, delay: 0.9 + i * 0.12 }}
            style={reduce ? { left: `${spot.left}%`, top: `${spot.top}%` } : {}}
          >
            <motion.div
              animate={reduce ? { y: 0 } : { y: [0, -8, 0] }}
              transition={{ duration: 3.2 + (i % 3) * 0.7, repeat: Infinity, ease: "easeInOut", delay: i * 0.2 }}
            >
              <motion.button
                type="button"
                whileHover={{ scale: 1.18, rotate: i % 2 ? 3 : -3 }}
                whileTap={{ scale: 0.95 }}
                className={cn(
                  "group relative rounded-full border-ink px-3.5 py-1.5 font-mono text-xs font-semibold shadow-hard sm:text-sm",
                  style.badge,
                )}
                aria-label={`${c.nom} — ${style.family}`}
              >
                {c.nom}
                <span className="pointer-events-none absolute -top-7 left-1/2 -translate-x-1/2 translate-y-1 whitespace-nowrap rounded-md border-ink bg-background px-2 py-0.5 text-[10px] text-petrol opacity-0 transition-all group-hover:translate-y-0 group-hover:opacity-100 group-focus-visible:opacity-100">
                  {style.family} · {c.categorie}
                </span>
              </motion.button>
            </motion.div>
          </motion.div>
        );
      })}
    </div>
  );
}
