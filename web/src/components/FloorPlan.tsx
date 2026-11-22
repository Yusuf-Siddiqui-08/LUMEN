import type { CSSProperties, ReactNode } from 'react';
import { type Area, type AreaKind, areaBox, type Box, bounds, type FloorPlan as Plan, planFor, wrapLabel } from '../lib/floorPlans';
import { BLUE, GOLD, INK, MONO } from '../lib/logic';

const FLOOR_BG = '#0E2250';
const ELEVATOR = '#1B3B78';

type KindStyle = { fill: string; opacity: number; stroke?: string; dash?: string; name: string };

/** Drawing order for the legend; the plan draws areas in data order (open floor first). */
const KIND: Record<AreaKind, KindStyle> = {
  studyRoom: { fill: GOLD, opacity: 0.55, stroke: GOLD, dash: '4 3', name: 'Group study rooms' },
  open: { fill: BLUE, opacity: 0.15, stroke: BLUE, dash: '6 4', name: 'Open study space' },
  casual: { fill: GOLD, opacity: 0.22, stroke: GOLD, dash: '2 3', name: 'Casual seating' },
  computers: { fill: '#9CC4F2', opacity: 0.35, stroke: '#9CC4F2', dash: '2 3', name: 'Computers' },
  room: { fill: '#2E4F8F', opacity: 1, name: 'Rooms, labs and offices' },
  service: { fill: '#3A4F78', opacity: 1, name: 'Washrooms and storage' },
};

/** Text that fits inside a box: shrink until it fits, or leave it off (it is still in the screen-reader list). */
function FitLabel({ text, box }: { text: string; box: Box }) {
  for (const size of [11, 10, 9, 8]) {
    const charW = size * 0.56;
    const lines = wrapLabel(text, box.w - 4, charW);
    const lh = size * 1.15;
    const tooWide = lines.some((l) => l.length * charW > box.w - 2);
    if (lines.length * lh <= box.h - 2 && !tooWide) {
      const top = box.y + box.h / 2 - (lines.length * lh) / 2 + size * 0.85;
      return (
        <text x={box.x + box.w / 2} y={top} fontSize={size} fontWeight={700} fill="#FFFFFF" textAnchor="middle" fontFamily="Lato, sans-serif">
          {lines.map((l, i) => (
            <tspan key={i} x={box.x + box.w / 2} dy={i === 0 ? 0 : lh}>
              {l}
            </tspan>
          ))}
        </text>
      );
    }
  }
  return null;
}

function AreaShape({ a }: { a: Area }) {
  const k = KIND[a.kind];
  const common = {
    fill: k.fill,
    fillOpacity: k.opacity,
    stroke: k.stroke,
    strokeWidth: k.stroke ? 1.2 : 0,
    strokeDasharray: k.dash,
  };
  const box = a.labelBox ?? areaBox(a);
  return (
    <g>
      {a.pts ? (
        <polygon points={a.pts.map((p) => p.join(',')).join(' ')} {...common} />
      ) : (
        <rect x={a.x} y={a.y} width={a.w} height={a.h} rx={3} {...common} />
      )}
      {a.label && <FitLabel text={a.label} box={box} />}
    </g>
  );
}

function PlanSvg({ plan }: { plan: Plan }) {
  const b = bounds(plan.plate);
  const pad = 10;
  const titleId = `plan-title-${plan.floor}`;
  return (
    <svg
      role="img"
      aria-labelledby={titleId}
      viewBox={`${b.x - pad} ${b.y - pad} ${b.w + pad * 2} ${b.h + pad * 2}`}
      style={{ display: 'block', width: '100%', height: 'auto' }}
    >
      <title id={titleId}>{`${plan.title} floor plan of the Student Learning Centre`}</title>
      <polygon points={plan.plate.map((p) => p.join(',')).join(' ')} fill={FLOOR_BG} stroke={BLUE} strokeWidth={2.5} strokeLinejoin="round" />
      {plan.areas.map((a, i) => (
        <AreaShape key={i} a={a} />
      ))}
      {plan.elevators.map((e, i) => {
        const gap = 4;
        const dw = Math.min((e.w - 12 - (e.doors - 1) * gap) / e.doors, 24);
        const total = e.doors * dw + (e.doors - 1) * gap;
        const dh = e.doors > 1 ? 13 : e.h - 8;
        return (
          <g key={`e${i}`}>
            <rect x={e.x} y={e.y} width={e.w} height={e.h} rx={3} fill={ELEVATOR} stroke={BLUE} strokeWidth={1.2} />
            {e.doors > 1 && (
              <text x={e.x + e.w / 2} y={e.y + 10} fontSize={8} fontWeight={700} fill="#FFFFFF" textAnchor="middle" fontFamily={MONO}>
                ELEVATORS
              </text>
            )}
            {Array.from({ length: e.doors }, (_, j) => (
              <rect
                key={j}
                x={e.x + (e.w - total) / 2 + j * (dw + gap)}
                y={e.y + e.h - dh - 4}
                width={dw}
                height={dh}
                rx={1}
                fill="none"
                stroke="#FFFFFF"
                strokeWidth={1}
              />
            ))}
          </g>
        );
      })}
      {plan.stairs.map((s, i) => (
        <g key={`s${i}`}>
          <rect x={s.x} y={s.y} width={s.w} height={s.h} rx={3} fill={GOLD} />
          <text x={s.x + s.w / 2} y={s.y + s.h / 2 + 3} fontSize={8} fontWeight={700} fill={INK} textAnchor="middle" fontFamily={MONO}>
            STAIRS
          </text>
        </g>
      ))}
    </svg>
  );
}

const mono = (size: number, color = '#C9D6EE'): CSSProperties => ({
  fontFamily: MONO,
  fontVariantLigatures: 'none',
  fontSize: size,
  letterSpacing: '0.06em',
  color,
});

function Legend({ plan }: { plan: Plan }) {
  const has = new Set(plan.areas.map((a) => a.kind));
  const icon = (children: ReactNode) => (
    <svg width={28} height={18} aria-hidden="true">
      {children}
    </svg>
  );
  const items: [ReactNode, string][] = [
    ...(Object.keys(KIND) as AreaKind[])
      .filter((k) => has.has(k))
      .map((k): [ReactNode, string] => [
        icon(
          <rect x={1} y={1} width={26} height={16} rx={3} fill={KIND[k].fill} fillOpacity={KIND[k].opacity} stroke={KIND[k].stroke} strokeDasharray={KIND[k].dash} />,
        ),
        KIND[k].name,
      ]),
    [icon(<rect x={1} y={1} width={26} height={16} rx={3} fill={GOLD} />), 'Stairs'],
    [icon(<rect x={1} y={1} width={26} height={16} rx={3} fill={ELEVATOR} stroke={BLUE} />), 'Elevators'],
  ];
  return (
    <ul aria-label="Map legend" style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexWrap: 'wrap', gap: '8px 18px' }}>
      {items.map(([svg, text]) => (
        <li key={text} style={{ display: 'inline-flex', alignItems: 'center', gap: 8, fontSize: 14 }}>
          {svg}
          {text}
        </li>
      ))}
    </ul>
  );
}

/**
 * The SLC floor plan for one floor, with a legend and what is on the floor.
 * Floors without a plan get a short note instead, so the panel never just disappears.
 */
export function FloorPlan({ floor, compact = false }: { floor: number; compact?: boolean }) {
  const plan = planFor(floor);
  const wrap: CSSProperties = { display: 'flex', flexDirection: 'column', gap: 12 };
  if (!plan) {
    return (
      <section aria-label={`Floor ${floor} plan`} style={wrap}>
        <span style={mono(12)}>FLOOR PLAN</span>
        <p style={{ margin: 0, padding: '14px 16px', borderRadius: 12, background: '#19356B', fontSize: 15, color: '#C9D6EE' }}>
          There is no floor plan for floor {floor} yet. Plans cover levels 3 to 8.
        </p>
      </section>
    );
  }
  const labelled = plan.areas.filter((a) => a.label);
  const side = (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <Legend plan={plan} />
      <div>
        <span style={mono(12)}>ON THIS FLOOR</span>
        <ul style={{ margin: '8px 0 0', paddingLeft: 20, display: 'flex', flexDirection: 'column', gap: 6, fontSize: 15, color: '#DDE6F7' }}>
          {plan.facts.map((f) => (
            <li key={f}>{f}</li>
          ))}
        </ul>
      </div>
      <span style={{ fontSize: 12, color: '#9FB3DA' }}>
        Traced from the SLC architectural plans and the SLC floor map. Room shapes and positions are approximate.
      </span>
    </div>
  );
  return (
    <section aria-label={`${plan.title} plan`} style={wrap} data-testid="floor-plan">
      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '8px 14px' }}>
        <span style={mono(12)}>FLOOR PLAN · SLC {plan.title.toUpperCase()}</span>
        {plan.schematic && (
          <span style={{ ...mono(11, GOLD), padding: '3px 10px', borderRadius: 999, border: `1px solid ${GOLD}` }}>
            APPROXIMATE LAYOUT
          </span>
        )}
      </div>
      {plan.schematic && (
        <p style={{ margin: 0, fontSize: 13, color: '#C9D6EE' }}>
          There is no architectural drawing for this level, so the spaces from the SLC floor map are placed around the shared core.
        </p>
      )}
      <div style={{ display: 'grid', gridTemplateColumns: compact ? 'minmax(0, 1fr)' :'minmax(0, 520px) minmax(0, 1fr)', gap: 20, alignItems: 'start' }}>
        <div>
          <div style={{ overflowX: 'auto', borderRadius: 14, background: '#19356B', padding: 12 }}>
            <div style={{ minWidth: compact ? 480 : 0 }}>
              <PlanSvg plan={plan} />
            </div>
          </div>
          {compact && (
            <span aria-hidden="true" style={{ display: 'block', marginTop: 8, fontSize: 13, color: '#9FB3DA' }}>
              Scroll sideways to see the whole floor →
            </span>
          )}
        </div>
        {side}
      </div>
      <ul className="sr-only">
        {labelled.map((a, i) => (
          <li key={i}>
            {KIND[a.kind].name}: {a.label}
          </li>
        ))}
      </ul>
    </section>
  );
}
