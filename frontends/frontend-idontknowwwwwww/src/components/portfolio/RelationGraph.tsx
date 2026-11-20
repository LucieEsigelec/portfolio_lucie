export interface GraphNode {
  id: string;
  label: string;
}

function truncate(label: string, max = 16) {
  return label.length > max ? `${label.slice(0, max - 1)}…` : label;
}

/**
 * Decorative radial view of the Neo4j neighbourhood of a project:
 * skills on the inner ring, similar projects on the outer ring.
 * Navigation is provided by the lists next to it.
 */
export function RelationGraph({
  center,
  skills,
  similar,
}: {
  center: string;
  skills: GraphNode[];
  similar: GraphNode[];
}) {
  const size = 420;
  const c = size / 2;
  const place = (i: number, n: number, r: number, offset: number) => {
    const angle = (i / Math.max(n, 1)) * Math.PI * 2 + offset;
    return { x: c + Math.cos(angle) * r, y: c + Math.sin(angle) * r };
  };
  const skillNodes = skills.slice(0, 10).map((n, i, a) => ({
    ...n,
    ...place(i, a.length, 115, -Math.PI / 2),
  }));
  const similarNodes = similar.slice(0, 6).map((n, i, a) => ({
    ...n,
    ...place(i, a.length, 180, -Math.PI / 2 + Math.PI / Math.max(skillNodes.length, a.length, 1)),
  }));

  return (
    <svg
      viewBox={`0 0 ${size} ${size}`}
      className="h-auto w-full"
      role="img"
      aria-label={`Graphe de relations : ${skills.length} compétences et ${similar.length} projets similaires autour de ${center}`}
    >
      <circle cx={c} cy={c} r={115} className="fill-none stroke-border" strokeDasharray="2 6" />
      <circle cx={c} cy={c} r={180} className="fill-none stroke-border" strokeDasharray="2 6" />
      {skillNodes.map((n) => (
        <line key={`l-${n.id}`} x1={c} y1={c} x2={n.x} y2={n.y} className="stroke-primary/40" />
      ))}
      {similarNodes.map((n) => (
        <line
          key={`l-${n.id}`}
          x1={c}
          y1={c}
          x2={n.x}
          y2={n.y}
          className="stroke-accent/50"
          strokeDasharray="4 4"
        />
      ))}
      {skillNodes.map((n) => (
        <g key={n.id}>
          <circle cx={n.x} cy={n.y} r={6} className="fill-primary" />
          <text
            x={n.x}
            y={n.y - 12}
            textAnchor="middle"
            className="fill-foreground font-mono text-[10px]"
          >
            {truncate(n.label, 14)}
          </text>
        </g>
      ))}
      {similarNodes.map((n) => (
        <g key={n.id}>
          <rect
            x={n.x - 7}
            y={n.y - 7}
            width={14}
            height={14}
            rx={3}
            className="fill-accent"
          />
          <text
            x={n.x}
            y={n.y + 22}
            textAnchor="middle"
            className="fill-muted-foreground text-[10px]"
          >
            {truncate(n.label)}
          </text>
        </g>
      ))}
      <circle cx={c} cy={c} r={34} className="fill-card stroke-primary" strokeWidth={1.5} />
      <text x={c} y={c + 4} textAnchor="middle" className="fill-foreground text-[11px] font-semibold">
        {truncate(center, 12)}
      </text>
    </svg>
  );
}
