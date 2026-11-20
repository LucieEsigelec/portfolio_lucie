import { motion } from "framer-motion";
import type { ReactNode } from "react";
import { TopoBackground } from "@/components/topo/TopoBackground";

export function PageIntro({ kicker, title, children }: { kicker: string; title: ReactNode; children?: ReactNode }) {
  return (
    <section className="relative isolate overflow-hidden border-b-[1.5px] border-petrol">
      <TopoBackground variant="light" />
      <div className="relative mx-auto max-w-6xl px-5 pb-14 pt-16 sm:pt-20">
        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="font-mono text-xs uppercase tracking-[0.25em] text-terracotta"
        >
          {kicker}
        </motion.p>
        <motion.h1
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.08 }}
          className="mt-3 max-w-3xl font-display text-5xl font-extrabold leading-[0.95] text-petrol sm:text-6xl"
        >
          {title}
        </motion.h1>
        {children && (
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.16 }}
            className="mt-5 max-w-2xl text-lg text-ink/75"
          >
            {children}
          </motion.div>
        )}
      </div>
    </section>
  );
}
