// Deterministic organic contour generation (same output on server and client).

export interface Pt {
  x: number;
  y: number;
}

/** Closed Catmull-Rom spline through points → cubic Bézier path. */
export function smoothClosedPath(pts: Pt[]): string {
  const n = pts.length;
  if (n < 3) return "";
  const at = (i: number) => pts[((i % n) + n) % n] as Pt;
  const f = (v: number) => v.toFixed(1);
  let d = `M${f(at(0).x)},${f(at(0).y)}`;
  for (let i = 0; i < n; i++) {
    const p0 = at(i - 1);
    const p1 = at(i);
    const p2 = at(i + 1);
    const p3 = at(i + 2);
    const c1x = p1.x + (p2.x - p0.x) / 6;
    const c1y = p1.y + (p2.y - p0.y) / 6;
    const c2x = p2.x - (p3.x - p1.x) / 6;
    const c2y = p2.y - (p3.y - p1.y) / 6;
    d += `C${f(c1x)},${f(c1y)} ${f(c2x)},${f(c2y)} ${f(p2.x)},${f(p2.y)}`;
  }
  return `${d}Z`;
}

/** One organic "contour line" around (cx, cy). `phase` shifts the wobble for morphing. */
export function contourPath(cx: number, cy: number, r: number, seed: number, phase: number, points = 20): string {
  const pts: Pt[] = [];
  for (let k = 0; k < points; k++) {
    const t = (k / points) * Math.PI * 2;
    const wobble =
      0.16 * Math.sin(2 * t + seed + phase) +
      0.09 * Math.sin(3 * t + seed * 1.7 - phase * 0.8) +
      0.05 * Math.sin(5 * t + seed * 2.3 + phase * 1.3);
    const rr = r * (1 + wobble);
    pts.push({ x: cx + Math.cos(t) * rr * 1.18, y: cy + Math.sin(t) * rr });
  }
  return smoothClosedPath(pts);
}

/** Horizontal wave across `width`, `periods` full sine cycles, for seamless looping dividers. */
export function wavePath(width: number, y: number, amp: number, periods: number, phase = 0): string {
  const steps = periods * 32;
  const pts: string[] = [];
  for (let i = 0; i <= steps; i++) {
    const x = (i / steps) * width;
    const yy =
      y +
      amp * Math.sin((i / steps) * periods * Math.PI * 2 + phase) +
      amp * 0.35 * Math.sin((i / steps) * periods * 2 * Math.PI * 2 + phase * 2);
    pts.push(`${x.toFixed(1)},${yy.toFixed(1)}`);
  }
  return `M${pts.join(" L")}`;
}
