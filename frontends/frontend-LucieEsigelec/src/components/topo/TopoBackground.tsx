import { motion, useMotionValue, useReducedMotion, useSpring, useTransform, type MotionValue } from "framer-motion";
import { useEffect, useMemo } from "react";
import { contourPath } from "./contours";

const INKS = ["var(--petrol)", "var(--terracotta)", "var(--sage)", "var(--coral)", "var(--cyan)"];

interface Peak {
  cx: number;
  cy: number;
  rings: number;
  rMax: number;
  seed: number;
  depth: number;
  inkOffset: number;
}

const FULL: Peak[] = [
  { cx: 1180, cy: 170, rings: 11, rMax: 440, seed: 1.3, depth: 38, inkOffset: 0 },
  { cx: 160, cy: 820, rings: 10, rMax: 400, seed: 4.1, depth: 24, inkOffset: 2 },
  { cx: 720, cy: 560, rings: 6, rMax: 210, seed: 2.6, depth: 56, inkOffset: 3 },
  { cx: 1400, cy: 880, rings: 7, rMax: 300, seed: 5.4, depth: 30, inkOffset: 1 },
];

const LIGHT: Peak[] = [
  { cx: 1250, cy: 120, rings: 8, rMax: 360, seed: 3.2, depth: 20, inkOffset: 1 },
  { cx: 80, cy: 420, rings: 6, rMax: 260, seed: 0.7, depth: 14, inkOffset: 3 },
];

function PeakGroup({
  peak,
  mx,
  my,
  animate,
  index,
}: {
  peak: Peak;
  mx: MotionValue<number>;
  my: MotionValue<number>;
  animate: boolean;
  index: number;
}) {
  const x = useTransform(mx, (v) => v * peak.depth);
  const y = useTransform(my, (v) => v * peak.depth);
  const rings = useMemo(
    () =>
      Array.from({ length: peak.rings }, (_, i) => {
        const r = peak.rMax * (1 - i / (peak.rings + 0.6));
        const s = peak.seed + i * 0.07;
        return {
          d0: contourPath(peak.cx, peak.cy, r, s, 0),
          d1: contourPath(peak.cx, peak.cy, r, s, 1.6),
          d2: contourPath(peak.cx, peak.cy, r, s, 3.1),
          ink: INKS[(i + peak.inkOffset) % INKS.length] as string,
        };
      }),
    [peak],
  );

  return (
    <motion.g style={{ x, y }}>
      {rings.map((ring, i) => (
        <motion.path
          key={i}
          d={ring.d0}
          fill={ring.ink}
          fillOpacity={i % 3 === 0 ? 0.07 : 0.025}
          stroke={ring.ink}
          strokeWidth={i % 4 === 0 ? 2.2 : 1.4}
          strokeOpacity={0.75}
          animate={animate ? { d: [ring.d0, ring.d1, ring.d2, ring.d0] } : { d: ring.d0 }}
          transition={{
            duration: 16 + index * 3 + i * 0.6,
            ease: "easeInOut",
            repeat: Infinity,
          }}
        />
      ))}
    </motion.g>
  );
}

/** Full-bleed animated topographic contour lines with mouse parallax. */
export function TopoBackground({ variant = "full" }: { variant?: "full" | "light" }) {
  const reduce = useReducedMotion();
  const rawX = useMotionValue(0);
  const rawY = useMotionValue(0);
  const mx = useSpring(rawX, { stiffness: 40, damping: 18 });
  const my = useSpring(rawY, { stiffness: 40, damping: 18 });

  useEffect(() => {
    if (reduce) return;
    const onMove = (e: PointerEvent) => {
      rawX.set(e.clientX / window.innerWidth - 0.5);
      rawY.set(e.clientY / window.innerHeight - 0.5);
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => window.removeEventListener("pointermove", onMove);
  }, [reduce, rawX, rawY]);

  const peaks = variant === "full" ? FULL : LIGHT;

  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      <svg
        className={variant === "full" ? "h-full w-full opacity-90" : "h-full w-full opacity-60"}
        viewBox="0 0 1440 900"
        preserveAspectRatio="xMidYMid slice"
      >
        {peaks.map((p, i) => (
          <PeakGroup key={i} peak={p} mx={mx} my={my} animate={!reduce} index={i} />
        ))}
      </svg>
      {/* soft cream veil so text stays readable on the left */}
      <div className="absolute inset-0 bg-gradient-to-r from-background via-background/70 to-transparent" />
    </div>
  );
}
