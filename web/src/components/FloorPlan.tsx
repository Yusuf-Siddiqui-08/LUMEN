import type { CSSProperties } from 'react';
import {
  type Area,
  type AreaKind,
  areaBox,
  type Box,
  bounds,
  type FloorPlan as Plan,
  PLAN_SOURCE_URL,
  planFor,
  wrapLabel,
} from '../lib/floorPlans';
import { BLUE, GOLD, INK, MONO } from '../lib/logic';

const FLOOR_BG = '#0E2250';
const ROOM = '#2E4F8F';
const STACK = '#6E8CC0';
const NOTE = '#CFE0F7';

const KIND: Record<AreaKind, { fill: string; opacity: number; stroke?: string; dash?: string; name: string }> = {
  room: { fill: ROOM, opacity: 1, name: 'Room' },
  group: { fill: GOLD, opacity: 0.5, stroke: GOLD, dash: '4 3', name: 'Group seating' },
  individual: { fill: BLUE, opacity: 0.5, stroke: BLUE, dash: '4 3', name: 'Individual seating' },
  computers: { fill: '#9CC4F2', opacity: 0.3, stroke: '#9CC4F2', dash: '2 3', name: 'Desktop computers' },
};

/** Text that fits inside a box: shrink until it fits, or leave it off (it is still in the screen-reader list). */
function FitLabel({ text, box, color = '#FFFFFF', weight = 700 }: { text: string; box: Box; color?: string; weight?: number }) {
  for (const size of [8, 7, 6]) {
    const lines = wrapLabel(text, box.w - 4, size * 0.56);
    const lh = size * 1.15;
    const tooWide = lines.some((l) => l.length * size * 0.56 > box.w - 2);
    if (lines.length * lh <= box.h - 2 && !tooWide) {
      const top = box.y + box.h / 2 - (lines.length * lh) / 2 + size * 0.85;
      return (
        <text x={box.x + box.w / 2} y={top} fontSize={size} fontWeight={weight} fill={color} textAnchor="middle" fontFamily="Lato, sans-serif">
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
    strokeWidth: k.stroke ? 1 : 0,
    strokeDasharray: k.dash,
  };
  const box = a.pts ? (a.labelBox ?? areaBox(a)) : areaBox(a);
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
      <title id={titleId}>{`${plan.title} floor plan of the TMU Library`}</title>
      <polygon points={plan.plate.map((p) => p.join(',')).join(' ')} fill={FLOOR_BG} stroke={BLUE} strokeWidth={2} strokeLinejoin="round" />
      {plan.areas.map((a, i) => (
        <AreaShape key={i} a={a} />
      ))}
      {plan.stacks.flatMap((s, i) =>
        Array.from({ length: s.count }, (_, j) => {
          const step = (s.dir === 'h' ? s.h : s.w) / s.count;
          const t = step * 0.5;
          return s.dir === 'h' ? (
            <rect key={`${i}-${j}`} x={s.x} y={s.y + j * step + (step - t) / 2} width={s.w} height={t} rx={1} fill={STACK} />
          ) : (
            <rect key={`${i}-${j}`} x={s.x + j * step + (step - t) / 2} y={s.y} width={t} height={s.h} rx={1} fill={STACK} />
          );
        }),
      )}
      {plan.elevators.map((e, i) => (
        <g key={`e${i}`}>
          <rect x={e.x} y={e.y} width={e.w} height={e.h} rx={3} fill="#1B3B78" stroke={BLUE} strokeWidth={1} />
          <text x={e.x + e.w / 2} y={e.y + 8} fontSize={6} fontWeight={700} fill="#FFFFFF" textAnchor="middle" fontFamily={MONO}>
            ELEVATORS
          </text>
          {Array.from({ length: 4 }, (_, j) => {
            const dw = (e.w - 16) / 4;
            return (
              <rect key={j} x={e.x + 5 + j * (dw + 2)} y={e.y + e.h - 16} width={dw} height={12} rx={1} fill="none" stroke="#FFFFFF" strokeWidth={0.8} />
            );
          })}
        </g>
      ))}
      {plan.stairs.map((s, i) => (
        <g key={`s${i}`}>
          <rect x={s.x} y={s.y} width={s.w} height={s.h} rx={3} fill={GOLD} />
          <text
            x={s.x + s.w / 2}
            y={s.y + s.h / 2 + 2}
            fontSize={5.5}
            fontWeight={700}
            fill={INK}
            textAnchor="middle"
            fontFamily={MONO}
          >
            STAIRS
          </text>
        </g>
      ))}
      {plan.fountains.map(([x, y], i) => (
        <circle key={`f${i}`} cx={x} cy={y} r={5} fill={BLUE} stroke="#FFFFFF" strokeWidth={1} />
      ))}
      {plan.notes.map((n, i) => (
        <FitLabel key={`n${i}`} text={n.text} box={{ x: n.x, y: n.y, w: n.w, h: 30 }} color={NOTE} weight={400} />
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
  const swatch = (k: AreaKind) => (
    <svg width={28} height={18} aria-hidden="true">
      <rect
        x={1}
        y={1}
        width={26}
        height={16}
        rx={3}
        fill={KIND[k].fill}
        fillOpacity={KIND[k].opacity}
        stroke={KIND[k].stroke}
        strokeDasharray={KIND[k].dash}
      />
    </svg>
  );
  const kinds: [AreaKind, string][] = [
    ['group', 'Group seating'],
    ['individual', 'Individual seating'],
    ['computers', 'Desktop computers'],
    ['room', 'Room'],
  ];
  const items: [React.ReactNode, string][] = [
    ...kinds.filter(([k]) => has.has(k)).map(([k, t]): [React.ReactNode, string] => [swatch(k), t]),
    ...(plan.stacks.length === 0 ? [] : [[
      <svg width={28} height={18} aria-hidden="true">
        {[2, 8, 14].map((y) => (
          <rect key={y} x={1} y={y} width={26} height={3} rx={1} fill={STACK} />
        ))}
      </svg>,
      'Book stacks',
    ] as [React.ReactNode, string]]),
    [
      <svg width={28} height={18} aria-hidden="true">
        <circle cx={14} cy={9} r={7} fill={BLUE} stroke="#FFFFFF" strokeWidth={1.5} />
      </svg>,
      'Water fountain',
    ],
    [
      <svg width={28} height={18} aria-hidden="true">
        <rect x={1} y={1} width={26} height={16} rx={3} fill={GOLD} />
      </svg>,
      'Stairs',
    ],
  ];
  return (
    <ul aria-label="Map legend" style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexWrap: 'wrap', gap: '8px 18px' }}>
      {items.map(([icon, text]) => (
        <li key={text} style={{ display: 'inline-flex', alignItems: 'center', gap: 8, fontSize: 14 }}>
          {icon}
          {text}
        </li>
      ))}
    </ul>
  );
}

/**
 * The library floor plan for one floor, with a legend and a few facts.
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
          There is no library floor plan for floor {floor}. Plans are available for floors 2 and 4 to 8.
        </p>
      </section>
    );
  }
  const labelled = plan.areas.filter((a) => a.label);
  return (
    <section aria-label={`${plan.title} plan`} style={wrap} data-testid="floor-plan">
      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'baseline', justifyContent: 'space-between', gap: 8 }}>
        <span style={mono(12)}>FLOOR PLAN · TMU LIBRARY {plan.title.toUpperCase()}</span>
        <a href={PLAN_SOURCE_URL} target="_blank" rel="noreferrer" style={{ fontSize: 13, color: BLUE, minHeight: 24 }}>
          Official plans
        </a>
      </div>
      <div style={{ overflowX: 'auto', borderRadius: 14, background: '#19356B', padding: 12 }}>
        <div style={{ minWidth: compact ? 520 : 600 }}>
          <PlanSvg plan={plan} />
        </div>
      </div>
      {compact && (
        <span aria-hidden="true" style={{ fontSize: 13, color: '#9FB3DA' }}>
          Scroll sideways to see the whole floor →
        </span>
      )}
      <ul className="sr-only">
        {labelled.map((a, i) => (
          <li key={i}>
            {KIND[a.kind].name}: {a.label}
          </li>
        ))}
      </ul>
      <Legend plan={plan} />
      <ul style={{ margin: 0, paddingLeft: 20, display: 'flex', flexDirection: 'column', gap: 6, fontSize: 15, color: '#DDE6F7' }}>
        {plan.facts.map((f) => (
          <li key={f}>{f}</li>
        ))}
      </ul>
      <span style={{ fontSize: 12, color: '#9FB3DA' }}>Simplified recreation. Room shapes and positions are approximate.</span>
    </section>
  );
}
