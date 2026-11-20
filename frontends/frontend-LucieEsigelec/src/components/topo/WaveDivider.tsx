import { wavePath } from "./contours";

const LINES = [
  { ink: "var(--petrol)", y: 30, amp: 10, phase: 0, w: 2 },
  { ink: "var(--terracotta)", y: 42, amp: 12, phase: 0.6, w: 1.6 },
  { ink: "var(--sage)", y: 54, amp: 9, phase: 1.2, w: 1.6 },
  { ink: "var(--coral)", y: 66, amp: 11, phase: 1.9, w: 1.6 },
  { ink: "var(--cyan)", y: 78, amp: 8, phase: 2.5, w: 1.4 },
];

/** Section separator: parallel flowing contour lines drifting horizontally (seamless loop). */
export function WaveDivider({ className = "" }: { className?: string }) {
  // Path spans 2× the view width with whole periods so translating -50% loops seamlessly.
  return (
    <div aria-hidden className={`relative h-24 w-full overflow-hidden ${className}`}>
      <svg className="animate-wave-slide absolute left-0 top-0 h-full w-[200%]" viewBox="0 0 2880 110" preserveAspectRatio="none">
        {LINES.map((l, i) => (
          <path
            key={i}
            d={wavePath(2880, l.y, l.amp, 6, l.phase)}
            fill="none"
            stroke={l.ink}
            strokeWidth={l.w}
            vectorEffect="non-scaling-stroke"
            strokeLinecap="round"
          />
        ))}
      </svg>
    </div>
  );
}
