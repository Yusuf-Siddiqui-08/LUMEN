import { type CSSProperties, type ReactNode, useMemo, useState } from 'react';
import { computeFloorOccupancy, type FloorOccupancyMap } from '../lib/floorOccupancy';
import { bounds, planFor, type Pt } from '../lib/floorPlans';
import type { FloorTheme } from '../lib/floorThemes';
import { type Floor, GOLD, GREEN, MONO, RED, STALE } from '../lib/logic';
import { type DetailedFloorPlan, detailedPlanFor, type RoomItem, type SeatItem, type StairBlock, type TableItem } from '../lib/slcPlans';

const FLOOR_BG = '#0B1D42';
const CORE_FILL = '#16284A';
const WALL_STROKE = '#75ADEA';

const VACANT_FILL = GREEN; // #3DDB96
const VACANT_STROKE = '#062C1E';
const VACANT_SURFACE = 'rgba(61, 219, 150, 0.25)';
const VACANT_ROOM = 'rgba(61, 219, 150, 0.14)';

const OCCUPIED_FILL = RED; // #F25E5E
const OCCUPIED_STROKE = '#470D12';
const OCCUPIED_SURFACE = 'rgba(242, 94, 94, 0.30)';
const OCCUPIED_ROOM = 'rgba(242, 94, 94, 0.20)';

const STALE_FILL = '#7A8AB0';
const STALE_SURFACE = 'rgba(122, 138, 176, 0.22)';
const STALE_ROOM = 'rgba(122, 138, 176, 0.13)';

const ptsStr = (pts: Pt[]) => pts.map((p) => p.join(',')).join(' ');

interface PlanPalette {
  plateBg: string;
  plateStroke: string;
  coreBg: string;
  coreStroke: string;
  stairsAccent: string;
  labelColor: string;
  subtleLine: string;
  columnFill: string;
  benchFill: string;
  benchStroke: string;
  pillBg: string;
  pillBorder: string;
}

function planPalette(theme?: FloorTheme): PlanPalette {
  if (!theme) {
    return {
      plateBg: FLOOR_BG,
      plateStroke: WALL_STROKE,
      coreBg: CORE_FILL,
      coreStroke: '#9CC4F2',
      stairsAccent: GOLD,
      labelColor: '#DCE8FA',
      subtleLine: '#9CC4F2',
      columnFill: '#9FB3DA',
      benchFill: 'rgba(244, 182, 1, 0.14)',
      benchStroke: 'rgba(244, 182, 1, 0.55)',
      pillBg: 'rgba(8, 19, 40, 0.52)',
      pillBorder: 'rgba(117, 173, 234, 0.28)',
    };
  }
  return {
    plateBg: theme.plan.plateBg,
    plateStroke: theme.plan.plateStroke,
    coreBg: theme.plan.elevatorBg,
    coreStroke: theme.plan.elevatorStroke,
    stairsAccent: theme.plan.stairsBg,
    labelColor: theme.muted,
    subtleLine: theme.accentText,
    columnFill: theme.muted2,
    benchFill: `${theme.plan.stairsBg}24`,
    benchStroke: theme.plan.stairsBg,
    pillBg: theme.innerTileBg,
    pillBorder: theme.innerTileBorder,
  };
}

interface HoverInfo {
  title: string;
  detail: string;
  occupied: boolean | null;
}

const mono = (size: number, color = '#C9D6EE'): CSSProperties => ({
  fontFamily: MONO,
  fontVariantLigatures: 'none',
  fontSize: size,
  letterSpacing: '0.06em',
  color,
});

/** Architectural stairwell with parallel step treads tinted in the floor's stair accent colour. */
function StairSvg({ s, accent, stroke }: { s: StairBlock; accent: string; stroke: string }) {
  const treads: ReactNode[] = [];
  const step = 4.6;
  if (s.treads === 'vertical') {
    const count = Math.max(3, Math.floor((s.w - 10) / step));
    for (let i = 0; i <= count; i++) {
      const x = s.x + 5 + i * step;
      treads.push(<line key={i} x1={x} y1={s.y + 2} x2={x} y2={s.y + s.h - 2} stroke={accent} strokeWidth={0.7} opacity={0.72} />);
    }
    if (s.split) {
      treads.push(
        <line key="mid" x1={s.x + 4} y1={s.y + s.h / 2} x2={s.x + s.w - 4} y2={s.y + s.h / 2} stroke={accent} strokeWidth={1.1} opacity={0.9} />,
      );
    }
  } else {
    const count = Math.max(3, Math.floor((s.h - 10) / step));
    for (let i = 0; i <= count; i++) {
      const y = s.y + 5 + i * step;
      treads.push(<line key={i} x1={s.x + 2} y1={y} x2={s.x + s.w - 2} y2={y} stroke={accent} strokeWidth={0.7} opacity={0.72} />);
    }
  }
  return (
    <g>
      <rect x={s.x} y={s.y} width={s.w} height={s.h} fill={accent} fillOpacity={0.14} stroke={stroke} strokeWidth={1.1} />
      {treads}
    </g>
  );
}

/** Architectural washrooms block: toilet stalls along left wall + vanity counter & sinks along right wall. */
function WashroomSvg({ x, y, w, h, stroke, labelColor }: { x: number; y: number; w: number; h: number; stroke: string; labelColor: string }) {
  const stallW = 19;
  const stallH = h / 4;
  return (
    <g>
      <rect x={x} y={y} width={w} height={h} fill="rgba(255,255,255,0.03)" stroke={stroke} strokeWidth={1.1} strokeOpacity={0.72} />
      <line x1={x} y1={y + h * 0.52} x2={x + w * 0.7} y2={y + h * 0.52} stroke={stroke} strokeWidth={1} opacity={0.75} />
      {[0, 1, 2, 3].map((i) => {
        const sy = y + i * stallH;
        return (
          <g key={i}>
            {i > 0 && <line x1={x} y1={sy} x2={x + stallW} y2={sy} stroke={stroke} strokeWidth={0.65} opacity={0.65} />}
            <ellipse cx={x + 6} cy={sy + stallH / 2} rx={3.5} ry={2.4} fill="none" stroke={stroke} strokeWidth={0.6} opacity={0.7} />
          </g>
        );
      })}
      <rect x={x + w - 13} y={y + 8} width={8} height={h - 16} rx={1} fill="none" stroke={stroke} strokeWidth={0.7} opacity={0.7} />
      {[0, 1, 2, 3].map((i) => (
        <circle key={`sk-${i}`} cx={x + w - 9} cy={y + 16 + i * 14.5} r={2.2} fill="none" stroke={stroke} strokeWidth={0.65} opacity={0.75} />
      ))}
      <text x={x + w * 0.45} y={y + h * 0.5 + 3} fontSize={7.5} fontWeight={700} fill={labelColor} textAnchor="middle" fontFamily={MONO} opacity={0.82}>
        WC
      </text>
    </g>
  );
}

/** Architectural hatch band (grand stairs, amphitheatre steps, skylights, escalators, south glazing). */
function HatchBandSvg({ id, pts, angle, spacing, opacity = 0.4, stroke }: { id: string; pts: Pt[]; angle: number; spacing: number; opacity?: number; stroke: string }) {
  const b = bounds(pts);
  const diag = Math.hypot(b.w, b.h) + 20;
  const cx = b.x + b.w / 2;
  const cy = b.y + b.h / 2;
  const lines: ReactNode[] = [];
  for (let d = -diag / 2; d <= diag / 2; d += spacing) {
    lines.push(<line key={d} x1={cx - diag / 2} y1={cy + d} x2={cx + diag / 2} y2={cy + d} stroke={stroke} strokeWidth={0.75} opacity={opacity} />);
  }
  return (
    <g>
      <defs>
        <clipPath id={id}>
          <polygon points={ptsStr(pts)} />
        </clipPath>
      </defs>
      <polygon points={ptsStr(pts)} fill={stroke} fillOpacity={0.07} stroke={stroke} strokeWidth={0.9} strokeOpacity={0.72} />
      <g clipPath={`url(#${id})`}>
        <g transform={`rotate(${angle} ${cx} ${cy})`}>{lines}</g>
      </g>
    </g>
  );
}

/** Single architectural seat (chair with backrest arc, pouf/beanbag, stool, or sofa cushion). */
function SeatSvg({
  s,
  occupied,
  stale,
  onHover,
}: {
  s: SeatItem;
  occupied: boolean;
  stale: boolean;
  onHover: (info: HoverInfo | null) => void;
}) {
  const fill = stale ? STALE_FILL : occupied ? OCCUPIED_FILL : VACANT_FILL;
  const stroke = stale ? '#273552' : occupied ? OCCUPIED_STROKE : VACANT_STROKE;
  const statusLabel = stale ? 'Sensors offline' : occupied ? 'Occupied' : 'Vacant';
  const shapeLabel = s.shape === 'pouf' ? 'Beanbag / Pouf' : s.shape === 'stool' ? 'Counter Stool' : s.shape === 'sofa' ? 'Lounge Seat' : 'Seat';

  return (
    <g
      style={{ cursor: 'pointer', transition: 'opacity 0.2s ease' }}
      onMouseEnter={() => onHover({ title: `${shapeLabel} · ${s.zone}`, detail: statusLabel, occupied: stale ? null : occupied })}
      onMouseLeave={() => onHover(null)}
    >
      <title>{`${shapeLabel} (${s.zone}) — ${statusLabel}`}</title>
      {s.shape === 'sofa' ? (
        <rect
          x={s.cx - s.r}
          y={s.cy - s.r * 0.85}
          width={s.r * 2}
          height={s.r * 1.7}
          rx={1.5}
          transform={s.angle ? `rotate(${s.angle} ${s.cx} ${s.cy})` : undefined}
          fill={fill}
          stroke={stroke}
          strokeWidth={0.55}
          style={{ transition: 'fill 0.35s ease, stroke 0.35s ease' }}
        />
      ) : s.shape === 'pouf' ? (
        <>
          <circle
            cx={s.cx}
            cy={s.cy}
            r={s.r}
            fill={fill}
            stroke={stroke}
            strokeWidth={0.65}
            style={{ transition: 'fill 0.35s ease, stroke 0.35s ease' }}
          />
          <circle cx={s.cx} cy={s.cy} r={s.r * 0.48} fill="none" stroke="rgba(255,255,255,0.32)" strokeWidth={0.5} pointerEvents="none" />
        </>
      ) : (
        <>
          <circle
            cx={s.cx}
            cy={s.cy}
            r={s.r}
            fill={fill}
            stroke={stroke}
            strokeWidth={0.55}
            style={{ transition: 'fill 0.35s ease, stroke 0.35s ease' }}
          />
          {s.shape === 'chair' && s.angle !== undefined && (
            <path
              d={`M ${s.cx - s.r * 0.85} ${s.cy - s.r * 0.5} A ${s.r * 1.05} ${s.r * 1.05} 0 0 1 ${s.cx + s.r * 0.85} ${s.cy - s.r * 0.5}`}
              transform={`rotate(${s.angle} ${s.cx} ${s.cy})`}
              fill="none"
              stroke="rgba(255,255,255,0.58)"
              strokeWidth={0.65}
              strokeLinecap="round"
              pointerEvents="none"
            />
          )}
        </>
      )}
    </g>
  );
}

/** Single architectural table, desk, counter, or organic pod hub. */
function TableSvg({
  t,
  occupied,
  usedSeats,
  totalSeats,
  stale,
  onHover,
}: {
  t: TableItem;
  occupied: boolean;
  usedSeats: number;
  totalSeats: number;
  stale: boolean;
  onHover: (info: HoverInfo | null) => void;
}) {
  const fill = stale ? STALE_SURFACE : occupied ? OCCUPIED_SURFACE : VACANT_SURFACE;
  const stroke = stale ? STALE_FILL : occupied ? OCCUPIED_FILL : VACANT_FILL;
  const kindWord =
    t.kind === 'desk'
      ? 'Study Desk'
      : t.kind === 'counter'
        ? 'Study Counter'
        : t.kind === 'pod'
          ? 'Modular Pod'
          : t.kind === 'sofa'
            ? 'Lounge Bench'
            : 'Table';
  const statusDetail = stale
    ? 'Sensors offline'
    : `${occupied ? 'In use' : 'Vacant'} · ${usedSeats}/${totalSeats} seats occupied`;

  const common = {
    fill,
    stroke,
    strokeWidth: 0.9,
    style: { cursor: 'pointer', transition: 'fill 0.35s ease, stroke 0.35s ease' } as CSSProperties,
    onMouseEnter: () => onHover({ title: `${kindWord} · ${t.zone}`, detail: statusDetail, occupied: stale ? null : occupied }),
    onMouseLeave: () => onHover(null),
  };

  return (
    <g>
      <title>{`${kindWord} (${t.zone}) — ${statusDetail}`}</title>
      {t.shape === 'circle' ? (
        <circle cx={t.cx} cy={t.cy} r={t.r ?? 5} {...common} />
      ) : t.shape === 'polygon' && t.pts ? (
        <polygon points={ptsStr(t.pts)} {...common} />
      ) : (
        <rect
          x={t.cx - (t.w ?? 12) / 2}
          y={t.cy - (t.h ?? 8) / 2}
          width={t.w ?? 12}
          height={t.h ?? 8}
          rx={t.kind === 'sofa' ? 2.5 : 1.2}
          transform={t.angle ? `rotate(${t.angle} ${t.cx} ${t.cy})` : undefined}
          {...common}
        />
      )}
    </g>
  );
}

/** Enclosed architectural room (group study room, private office, seminar hall, lab). */
function RoomSvg({
  rm,
  occupied,
  usedSeats,
  totalSeats,
  stale,
  wallHairline,
  onHover,
}: {
  rm: RoomItem;
  occupied: boolean;
  usedSeats: number;
  totalSeats: number;
  stale: boolean;
  wallHairline: string;
  onHover: (info: HoverInfo | null) => void;
}) {
  const fill = stale ? STALE_ROOM : occupied ? OCCUPIED_ROOM : VACANT_ROOM;
  const statusStroke = stale ? STALE_FILL : occupied ? OCCUPIED_FILL : VACANT_FILL;
  const name = rm.label ?? (rm.kind === 'studyRoom' ? 'Group Study Room' : rm.kind === 'computers' ? 'Computer Room' : 'Study / Support Room');
  const statusDetail = stale
    ? 'Sensors offline'
    : `${occupied ? 'Occupied' : 'Available'} · ${usedSeats}/${totalSeats} seats in use`;

  return (
    <g
      style={{ cursor: 'pointer' }}
      onMouseEnter={() => onHover({ title: `${name} · ${rm.zone}`, detail: statusDetail, occupied: stale ? null : occupied })}
      onMouseLeave={() => onHover(null)}
    >
      <title>{`${name} (${rm.zone}) — ${statusDetail}`}</title>
      <polygon
        points={ptsStr(rm.pts)}
        fill={fill}
        stroke={statusStroke}
        strokeWidth={1.35}
        strokeLinejoin="round"
        style={{ transition: 'fill 0.35s ease, stroke 0.35s ease' }}
      />
      <polygon points={ptsStr(rm.pts)} fill="none" stroke={wallHairline} strokeWidth={0.55} strokeOpacity={0.45} strokeLinejoin="round" pointerEvents="none" />
    </g>
  );
}

function DetailedPlanSvg({
  plan,
  occ,
  theme,
  onHover,
}: {
  plan: DetailedFloorPlan;
  occ: FloorOccupancyMap;
  theme?: FloorTheme;
  onHover: (info: HoverInfo | null) => void;
}) {
  const allPts: Pt[] = [
    ...plan.plate,
    ...(plan.southGlazing ?? []),
    ...(plan.bridge?.pts ?? []),
    ...(plan.shadedZones?.flatMap((z) => z.pts) ?? []),
  ];
  const b = bounds(allPts);
  const pad = 14;
  const titleId = `plan-title-${plan.floor}`;
  const gridId = `arch-grid-${plan.floor}`;
  const glowId = `plate-glow-${plan.floor}`;
  const pal = planPalette(theme);

  return (
    <svg
      role="img"
      aria-labelledby={titleId}
      viewBox={`${b.x - pad} ${b.y - pad} ${b.w + pad * 2} ${b.h + pad * 2}`}
      style={{ display: 'block', width: '100%', height: 'auto' }}
    >
      <title id={titleId}>{`${plan.title} (${plan.nickname}) architectural floor plan of the Student Learning Centre`}</title>
      <defs>
        <pattern id={gridId} width={20} height={20} patternUnits="userSpaceOnUse">
          <path d="M 20 0 L 0 0 0 20" fill="none" stroke={pal.plateStroke} strokeOpacity={0.1} strokeWidth={0.65} />
        </pattern>
        <radialGradient id={glowId} cx="42%" cy="38%" r="65%">
          <stop offset="0%" stopColor={pal.plateStroke} stopOpacity={0.11} />
          <stop offset="100%" stopColor={pal.plateBg} stopOpacity={0} />
        </radialGradient>
      </defs>

      {/* Layer 1: Exterior context (shaded terraces, pedestrian bridge, sloped south curtain wall) */}
      {plan.shadedZones?.map((sz, i) => (
        <g key={`sz-${i}`}>
          <polygon
            points={ptsStr(sz.pts)}
            fill={pal.plateStroke}
            fillOpacity={0.07}
            stroke={pal.coreStroke}
            strokeOpacity={0.6}
            strokeWidth={1.1}
            strokeDasharray="4 3"
          />
        </g>
      ))}

      {plan.bridge && (
        <g>
          <polygon
            points={ptsStr(plan.bridge.pts)}
            fill={plan.bridge.roofOnly ? pal.plateStroke : pal.plateBg}
            fillOpacity={plan.bridge.roofOnly ? 0.08 : 1}
            stroke={pal.plateStroke}
            strokeWidth={plan.bridge.roofOnly ? 1.2 : 2.0}
            strokeDasharray={plan.bridge.roofOnly ? '5 3' : undefined}
          />
        </g>
      )}

      {plan.southGlazing && (
        <HatchBandSvg id={`glaze-${plan.floor}`} pts={plan.southGlazing} angle={90} spacing={8} opacity={0.5} stroke={pal.plateStroke} />
      )}

      {/* Main Building Floorplate with floor-themed surface & subtle blueprint grid */}
      <polygon points={ptsStr(plan.plate)} fill={pal.plateBg} stroke={pal.plateStroke} strokeWidth={2.4} strokeLinejoin="round" />
      <polygon points={ptsStr(plan.plate)} fill={`url(#${glowId})`} pointerEvents="none" />
      <polygon points={ptsStr(plan.plate)} fill={`url(#${gridId})`} pointerEvents="none" />

      {/* Layer 2: Atrium Voids, Architectural Stairs/Escalators, Terrace Risers, Built-in Benches */}
      {plan.voids?.map((v, i) => {
        const vb = bounds(v.pts);
        return (
          <g key={`void-${i}`}>
            <polygon
              points={ptsStr(v.pts)}
              fill="rgba(4, 10, 20, 0.56)"
              stroke={pal.plateStroke}
              strokeOpacity={0.58}
              strokeWidth={1.3}
              strokeDasharray="5 3"
            />
            {v.label && (
              <text
                x={vb.x + vb.w * 0.36}
                y={vb.y + vb.h * 0.42}
                fontSize={8.5}
                fontWeight={700}
                fill={pal.labelColor}
                opacity={0.65}
                textAnchor="middle"
                fontFamily={MONO}
              >
                {v.label.toUpperCase()}
              </text>
            )}
          </g>
        );
      })}

      {plan.hatchBands?.map((hb, i) => (
        <HatchBandSvg
          key={`hb-${i}`}
          id={`hb-${plan.floor}-${i}`}
          pts={hb.pts}
          angle={hb.angle}
          spacing={hb.spacing}
          opacity={hb.opacity}
          stroke={pal.subtleLine}
        />
      ))}

      {plan.featureLines?.map((fl, i) => (
        <polyline
          key={`fl-${i}`}
          points={ptsStr(fl.pts)}
          fill="none"
          stroke={pal.plateStroke}
          strokeOpacity={0.52}
          strokeWidth={fl.width ?? 1.1}
          strokeDasharray={fl.dashed ? '4 3' : undefined}
        />
      ))}

      {plan.walls?.map(([p1, p2], i) => (
        <line key={`w-${i}`} x1={p1[0]} y1={p1[1]} x2={p2[0]} y2={p2[1]} stroke={pal.plateStroke} strokeOpacity={0.72} strokeWidth={1.35} />
      ))}

      {/* Built-in wooden terrace benches (Level 6 Beach) tinted in the floor's warm sand/stair accent */}
      {plan.benches?.map((bn, i) => (
        <rect
          key={`bn-${i}`}
          x={bn.x - bn.w / 2}
          y={bn.y - bn.h / 2}
          width={bn.w}
          height={bn.h}
          rx={1.5}
          transform={`rotate(${bn.angle} ${bn.x} ${bn.y})`}
          fill={pal.benchFill}
          stroke={pal.benchStroke}
          strokeOpacity={0.55}
          strokeWidth={0.9}
          pointerEvents="none"
        />
      ))}

      {/* Layer 3: Shared North Service Core & South-East Core styled in the floor's theme */}
      <g>
        <rect
          x={plan.core.northBox.x}
          y={plan.core.northBox.y}
          width={plan.core.northBox.w}
          height={plan.core.northBox.h}
          fill={pal.coreBg}
          stroke={pal.plateStroke}
          strokeWidth={1.85}
        />
        <rect
          x={plan.core.seBox.x}
          y={plan.core.seBox.y}
          width={plan.core.seBox.w}
          height={plan.core.seBox.h}
          fill={pal.coreBg}
          stroke={pal.plateStroke}
          strokeWidth={1.75}
        />
        {plan.core.serviceRooms.map((sr, i) => (
          <g key={`sr-${i}`}>
            <rect
              x={sr.x}
              y={sr.y}
              width={sr.w}
              height={sr.h}
              fill={pal.plateStroke}
              fillOpacity={0.07}
              stroke={pal.coreStroke}
              strokeOpacity={0.62}
              strokeWidth={0.95}
            />
          </g>
        ))}
        <WashroomSvg
          x={plan.core.washroom.x}
          y={plan.core.washroom.y}
          w={plan.core.washroom.w}
          h={plan.core.washroom.h}
          stroke={pal.coreStroke}
          labelColor={pal.labelColor}
        />
        <g>
          <rect
            x={plan.core.accessibleWc.x}
            y={plan.core.accessibleWc.y}
            width={plan.core.accessibleWc.w}
            height={plan.core.accessibleWc.h}
            fill="rgba(255,255,255,0.03)"
            stroke={pal.coreStroke}
            strokeOpacity={0.68}
            strokeWidth={1}
          />
          <ellipse
            cx={plan.core.accessibleWc.x + 8}
            cy={plan.core.accessibleWc.y + 18}
            rx={3.5}
            ry={2.5}
            fill="none"
            stroke={pal.coreStroke}
            strokeOpacity={0.72}
            strokeWidth={0.65}
          />
        </g>
        {plan.core.stairs.map((st, i) => (
          <StairSvg key={`st-${i}`} s={st} accent={pal.stairsAccent} stroke={pal.coreStroke} />
        ))}
        {[...plan.core.elevators, ...(plan.core.lowerLift ? [plan.core.lowerLift] : [])].map((el, i) => (
          <g key={`el-${i}`}>
            <rect x={el.x} y={el.y} width={el.w} height={el.h} fill={pal.plateBg} fillOpacity={0.72} stroke={pal.coreStroke} strokeWidth={1.15} />
            <line
              x1={el.x + 2}
              y1={el.y + 2}
              x2={el.x + el.w - 2}
              y2={el.y + el.h - 2}
              stroke={pal.coreStroke}
              strokeOpacity={0.72}
              strokeWidth={0.8}
              strokeDasharray={el.dashed ? '4 3' : undefined}
            />
            <line
              x1={el.x + el.w - 2}
              y1={el.y + 2}
              x2={el.x + 2}
              y2={el.y + el.h - 2}
              stroke={pal.coreStroke}
              strokeOpacity={0.72}
              strokeWidth={0.8}
              strokeDasharray={el.dashed ? '4 3' : undefined}
            />
          </g>
        ))}
        <text x={278} y={136} fontSize={6.8} fontWeight={700} fill={pal.labelColor} textAnchor="middle" fontFamily={MONO} opacity={0.88}>
          ELEVATORS
        </text>
      </g>

      {/* Structural Columns */}
      {plan.columns.map(([cx, cy], i) => (
        <rect
          key={`col-${i}`}
          x={cx - 3.6}
          y={cy - 3.6}
          width={7.2}
          height={7.2}
          fill={pal.columnFill}
          stroke={pal.plateBg}
          strokeWidth={0.75}
          opacity={0.72}
          pointerEvents="none"
        />
      ))}

      {/* Layer 4: Occupiable Rooms (Red = Occupied, Green = Vacant) */}
      {plan.rooms.map((rm) => {
        const st = occ.roomStatus.get(rm.id) ?? { occupied: false, usedSeats: 0, totalSeats: rm.seatIds.length };
        return (
          <RoomSvg
            key={rm.id}
            rm={rm}
            occupied={st.occupied}
            usedSeats={st.usedSeats}
            totalSeats={st.totalSeats}
            stale={occ.summary.stale}
            wallHairline={pal.labelColor}
            onHover={onHover}
          />
        );
      })}

      {/* Layer 5: Tables, Desks, Counters & Organic Pods (Red = Occupied, Green = Vacant) */}
      {plan.tables.map((tbl) => {
        const st = occ.tableStatus.get(tbl.id) ?? { occupied: false, usedSeats: 0, totalSeats: tbl.seatIds.length };
        return (
          <TableSvg
            key={tbl.id}
            t={tbl}
            occupied={st.occupied}
            usedSeats={st.usedSeats}
            totalSeats={st.totalSeats}
            stale={occ.summary.stale}
            onHover={onHover}
          />
        );
      })}

      {/* Layer 6: Individual Seats, Chairs, Beanbags, Stools & Sofas (Red = Occupied, Green = Vacant) */}
      {plan.seats.map((s) => (
        <SeatSvg
          key={s.id}
          s={s}
          occupied={Boolean(occ.seatOccupied.get(s.id))}
          stale={occ.summary.stale}
          onHover={onHover}
        />
      ))}

      {/* Layer 7: Subtle Architectural Space Labels + North Compass */}
      {plan.annotations?.map((a, i) => (
        <text
          key={`ann-${i}`}
          x={a.x}
          y={a.y}
          fontSize={8.5}
          fontWeight={800}
          fill={pal.subtleLine}
          stroke={pal.plateBg}
          strokeWidth={3.2}
          paintOrder="stroke"
          textAnchor="middle"
          fontFamily={MONO}
          letterSpacing="0.08em"
          opacity={0.9}
          pointerEvents="none"
        >
          {a.text}
        </text>
      ))}

      {/* Architectural North Arrow styled in the floor's palette */}
      <g transform={`translate(${b.x + b.w - 16}, ${b.y + b.h - 14})`} opacity={0.8} pointerEvents="none">
        <circle cx={0} cy={0} r={10} fill={pal.coreBg} fillOpacity={0.78} stroke={pal.coreStroke} strokeWidth={0.95} />
        <line x1={-2} y1={7} x2={2} y2={-7} stroke={pal.subtleLine} strokeWidth={1.25} />
        <polygon points="2,-8 -1,-2 4,-1" fill={pal.stairsAccent} />
        <text x={0} y={-13} fontSize={7} fontWeight={700} fill={pal.labelColor} textAnchor="middle" fontFamily={MONO}>
          N
        </text>
      </g>
    </svg>
  );
}

function OccupancyStatPill({
  label,
  occupied,
  vacant,
  stale,
  pal,
  labelColor,
}: {
  label: string;
  occupied: number;
  vacant: number;
  stale: boolean;
  pal: PlanPalette;
  labelColor: string;
}) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 4,
        padding: '9px 11px',
        borderRadius: 10,
        background: pal.pillBg,
        border: `1px solid ${pal.pillBorder}`,
        flex: '1 1 88px',
        minWidth: 0,
      }}
    >
      <span style={mono(10.5, labelColor)}>{label}</span>
      {stale ? (
        <span style={{ fontSize: 13, fontWeight: 700, color: STALE.text }}>Offline</span>
      ) : (
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, flexWrap: 'wrap', fontVariantNumeric: 'tabular-nums' }}>
          <span style={{ fontSize: 14, fontWeight: 900, color: GREEN }}>{vacant} free</span>
          <span style={{ fontSize: 12.5, fontWeight: 700, color: '#FF8585' }}>{occupied} used</span>
        </div>
      )}
    </div>
  );
}

function Legend({ hasRooms, stale, pal }: { hasRooms: boolean; stale: boolean; pal: PlanPalette }) {
  const icon = (children: ReactNode) => (
    <svg width={24} height={18} viewBox="0 0 24 18" aria-hidden="true" style={{ flex: 'none' }}>
      {children}
    </svg>
  );
  const items: [ReactNode, string][] = [
    [
      icon(
        <>
          <rect x={4} y={5} width={16} height={8} rx={1.5} fill={VACANT_SURFACE} stroke={VACANT_FILL} strokeWidth={1.2} />
          <circle cx={8} cy={3} r={2.2} fill={VACANT_FILL} />
          <circle cx={16} cy={3} r={2.2} fill={VACANT_FILL} />
          <circle cx={8} cy={15} r={2.2} fill={VACANT_FILL} />
          <circle cx={16} cy={15} r={2.2} fill={VACANT_FILL} />
        </>,
      ),
      'Vacant seat & table',
    ],
    [
      icon(
        <>
          <rect x={4} y={5} width={16} height={8} rx={1.5} fill={OCCUPIED_SURFACE} stroke={OCCUPIED_FILL} strokeWidth={1.2} />
          <circle cx={8} cy={3} r={2.2} fill={OCCUPIED_FILL} />
          <circle cx={16} cy={3} r={2.2} fill={OCCUPIED_FILL} />
          <circle cx={8} cy={15} r={2.2} fill={OCCUPIED_FILL} />
          <circle cx={16} cy={15} r={2.2} fill={OCCUPIED_FILL} />
        </>,
      ),
      'Occupied seat & table',
    ],
    ...(hasRooms
      ? [
          [
            icon(
              <>
                <rect x={2} y={2} width={9} height={14} rx={1.5} fill={VACANT_ROOM} stroke={VACANT_FILL} strokeWidth={1.3} />
                <rect x={13} y={2} width={9} height={14} rx={1.5} fill={OCCUPIED_ROOM} stroke={OCCUPIED_FILL} strokeWidth={1.3} />
              </>,
            ),
            'Rooms (free / in use)',
          ] as [ReactNode, string],
        ]
      : []),
    ...(stale
      ? [
          [
            icon(<rect x={3} y={3} width={18} height={12} rx={2} fill={STALE_SURFACE} stroke={STALE_FILL} strokeWidth={1.2} />),
            'Sensors offline',
          ] as [ReactNode, string],
        ]
      : []),
    [
      icon(
        <>
          <rect x={2} y={2} width={20} height={14} fill={pal.plateBg} stroke={pal.coreStroke} strokeWidth={1.15} />
          <line x1={3} y1={3} x2={21} y2={15} stroke={pal.coreStroke} strokeWidth={0.9} />
          <line x1={21} y1={3} x2={3} y2={15} stroke={pal.coreStroke} strokeWidth={0.9} />
        </>,
      ),
      'Elevators',
    ],
    [
      icon(
        <>
          <rect x={2} y={2} width={20} height={14} fill={pal.stairsAccent} fillOpacity={0.18} stroke={pal.coreStroke} strokeWidth={1.1} />
          <line x1={6} y1={3} x2={6} y2={15} stroke={pal.stairsAccent} strokeWidth={0.95} />
          <line x1={10} y1={3} x2={10} y2={15} stroke={pal.stairsAccent} strokeWidth={0.95} />
          <line x1={14} y1={3} x2={14} y2={15} stroke={pal.stairsAccent} strokeWidth={0.95} />
          <line x1={18} y1={3} x2={18} y2={15} stroke={pal.stairsAccent} strokeWidth={0.95} />
        </>,
      ),
      'Stairs',
    ],
    [
      icon(
        <>
          <rect x={2} y={2} width={20} height={14} fill={pal.coreBg} stroke={pal.coreStroke} strokeWidth={1.1} />
          <text x={12} y={12} fontSize={7.5} fontWeight={700} fill={pal.labelColor} textAnchor="middle" fontFamily={MONO}>
            WC
          </text>
        </>,
      ),
      'Washrooms & Core',
    ],
  ];

  return (
    <ul aria-label="Map legend" style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexWrap: 'wrap', gap: '8px 16px' }}>
      {items.map(([svg, text]) => (
        <li key={text} style={{ display: 'inline-flex', alignItems: 'center', gap: 7, fontSize: 13.5 }}>
          {svg}
          {text}
        </li>
      ))}
    </ul>
  );
}

/**
 * Genuine SLC architectural floor plan (Levels 2–8) styled in each floor's theme palette with
 * live red/green seat, table, and room occupancy visualization synced to LUMEN live/synthetic data.
 */
export function FloorPlan({
  floor,
  liveFloor,
  compact = false,
  theme,
}: {
  floor: number;
  liveFloor?: Floor | null;
  compact?: boolean;
  theme?: FloorTheme;
}) {
  const plan = planFor(floor);
  const detailed = detailedPlanFor(floor);
  const [zoom, setZoom] = useState(1);
  const [hover, setHover] = useState<HoverInfo | null>(null);

  const occ = useMemo(() => {
    if (!detailed) return null;
    return computeFloorOccupancy(detailed, liveFloor);
  }, [detailed, liveFloor]);

  const wrap: CSSProperties = { display: 'flex', flexDirection: 'column', gap: 12 };
  const muted = theme ? theme.muted : '#C9D6EE';
  const muted2 = theme ? theme.muted2 : '#9FB3DA';
  const pal = planPalette(theme);

  if (!plan || !detailed || !occ) {
    return (
      <section aria-label={`Floor ${floor} plan`} style={wrap}>
        <span
          style={{
            ...mono(12, muted),
            ...(theme
              ? {
                  alignSelf: 'flex-start',
                  padding: '4px 10px',
                  borderRadius: 8,
                  background: theme.headerBackingBg,
                  backdropFilter: 'blur(8px)',
                  WebkitBackdropFilter: 'blur(8px)',
                }
              : {}),
          }}
        >
          FLOOR PLAN
        </span>
        <p
          style={{
            margin: 0,
            padding: '14px 16px',
            borderRadius: 12,
            background: theme ? theme.cardBg : '#19356B',
            border: theme ? `1px solid ${theme.cardBorder}` : undefined,
            backdropFilter: theme ? 'blur(12px)' : undefined,
            WebkitBackdropFilter: theme ? 'blur(12px)' : undefined,
            fontSize: 15,
            color: muted,
            transition: theme ? 'background-color 0.45s ease, border-color 0.45s ease' : undefined,
          }}
        >
          There is no floor plan for floor {floor}. Architectural plans cover levels 2 to 8.
        </p>
      </section>
    );
  }

  const sideStyle: CSSProperties = theme
    ? {
        display: 'flex',
        flexDirection: 'column',
        gap: 14,
        background: theme.cardBg,
        border: `1px solid ${theme.cardBorder}`,
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        borderRadius: 14,
        padding: 16,
        transition: 'background-color 0.45s ease, border-color 0.45s ease',
      }
    : { display: 'flex', flexDirection: 'column', gap: 14 };

  const zoomBtn: CSSProperties = {
    minWidth: 32,
    height: 30,
    padding: '0 8px',
    borderRadius: 8,
    border: `1px solid ${theme ? theme.badgeBorder : 'rgba(117,173,234,0.35)'}`,
    background: theme ? theme.headerBackingBg : '#19356B',
    color: theme ? theme.accentText : '#FFFFFF',
    fontFamily: MONO,
    fontSize: 12,
    fontWeight: 700,
    cursor: 'pointer',
  };

  const s = occ.summary;

  return (
    <section aria-label={`${plan.title} architectural floor plan`} style={wrap} data-testid="floor-plan">
      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '8px 14px' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '8px 10px' }}>
          <span
            style={{
              ...mono(12, muted),
              ...(theme
                ? {
                    padding: '4px 10px',
                    borderRadius: 8,
                    background: theme.headerBackingBg,
                    backdropFilter: 'blur(8px)',
                    WebkitBackdropFilter: 'blur(8px)',
                  }
                : {}),
            }}
          >
            FLOOR PLAN · SLC {plan.title.toUpperCase()} · {detailed.nickname.toUpperCase()}
          </span>
          {s.hasLiveData && (
            <span
              style={{
                ...mono(11, s.stale ? STALE.text : s.occupancyPct >= 95 ? '#FF9090' : GREEN),
                padding: '3px 10px',
                borderRadius: 999,
                border: `1px solid ${s.stale ? STALE.border : s.occupancyPct >= 95 ? RED : GREEN}`,
                background: theme ? theme.headerBackingBg : 'rgba(8, 18, 38, 0.58)',
                backdropFilter: 'blur(8px)',
              }}
            >
              {s.stale ? 'SENSORS OFFLINE' : `${s.occupancyPct}% OCCUPIED · LIVE`}
            </span>
          )}
        </div>
        <div role="group" aria-label="Floor plan zoom controls" style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
          <button
            type="button"
            aria-label="Zoom out floor plan"
            onClick={() => setZoom((z) => Math.max(1, Math.round((z - 0.25) * 100) / 100))}
            disabled={zoom <= 1}
            style={{ ...zoomBtn, opacity: zoom <= 1 ? 0.45 : 1 }}
          >
            −
          </button>
          <button type="button" aria-label="Reset floor plan zoom" onClick={() => setZoom(1)} style={zoomBtn}>
            {Math.round(zoom * 100)}%
          </button>
          <button
            type="button"
            aria-label="Zoom in floor plan"
            onClick={() => setZoom((z) => Math.min(2.25, Math.round((z + 0.25) * 100) / 100))}
            disabled={zoom >= 2.25}
            style={{ ...zoomBtn, opacity: zoom >= 2.25 ? 0.45 : 1 }}
          >
            +
          </button>
        </div>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: compact ? 'minmax(0, 1fr)' : 'minmax(0, 620px) minmax(240px, 1fr)',
          gap: 18,
          alignItems: 'start',
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <div
            style={{
              overflow: 'auto',
              maxHeight: compact ? 520 : 680,
              borderRadius: 14,
              background: theme ? theme.plan.containerBg : '#132952',
              border: `1px solid ${theme ? theme.cardBorder : 'rgba(117,173,234,0.28)'}`,
              backdropFilter: theme ? 'blur(12px)' : undefined,
              WebkitBackdropFilter: theme ? 'blur(12px)' : undefined,
              padding: 10,
              transition: theme ? 'background-color 0.45s ease, border-color 0.45s ease' : undefined,
            }}
          >
            <div style={{ width: `${Math.round(zoom * 100)}%`, minWidth: compact ? 420 : 0, transition: 'width 0.2s ease' }}>
              <DetailedPlanSvg plan={detailed} occ={occ} theme={theme} onHover={setHover} />
            </div>
          </div>
          <div
            aria-live="polite"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 10,
              minHeight: 30,
              padding: '5px 12px',
              borderRadius: 10,
              background: theme ? theme.headerBackingBg : 'rgba(11, 27, 58, 0.72)',
              border: `1px solid ${theme ? theme.cardBorder : 'rgba(117,173,234,0.2)'}`,
              fontSize: 13,
              color: muted,
            }}
          >
            {hover ? (
              <>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8, fontWeight: 700, color: '#FFFFFF' }}>
                  <span
                    aria-hidden="true"
                    style={{
                      width: 9,
                      height: 9,
                      borderRadius: '50%',
                      background: hover.occupied === null ? STALE_FILL : hover.occupied ? RED : GREEN,
                    }}
                  />
                  {hover.title}
                </span>
                <span style={{ fontWeight: 700, color: hover.occupied === null ? STALE.text : hover.occupied ? '#FF8585' : GREEN }}>
                  {hover.detail}
                </span>
              </>
            ) : (
              <span>
                {compact
                  ? 'Scroll or zoom to inspect seats, tables & rooms.'
                  : 'Hover any seat, table, or room to inspect its live status. Use + / − to zoom in.'}
              </span>
            )}
          </div>
        </div>

        <div style={sideStyle}>
          <div>
            <span style={mono(12, muted)}>LIVE MAP OCCUPANCY</span>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 8 }}>
              <OccupancyStatPill label="SEATS" occupied={s.occupiedSeats} vacant={s.vacantSeats} stale={s.stale} pal={pal} labelColor={muted2} />
              <OccupancyStatPill label="TABLES" occupied={s.occupiedTables} vacant={s.vacantTables} stale={s.stale} pal={pal} labelColor={muted2} />
              {s.totalRooms > 0 && (
                <OccupancyStatPill label="ROOMS" occupied={s.occupiedRooms} vacant={s.vacantRooms} stale={s.stale} pal={pal} labelColor={muted2} />
              )}
            </div>
          </div>

          <Legend hasRooms={s.totalRooms > 0} stale={s.stale} pal={pal} />

          <div>
            <span style={mono(12, muted)}>ON THIS FLOOR</span>
            <ul style={{ margin: '8px 0 0', paddingLeft: 20, display: 'flex', flexDirection: 'column', gap: 6, fontSize: 14.5, color: theme ? '#FFFFFF' : '#DDE6F7' }}>
              {plan.facts.map((f) => (
                <li key={f}>{f}</li>
              ))}
            </ul>
          </div>

          <span style={{ fontSize: 12, lineHeight: 1.45, color: muted2 }}>
            Recreated from the SLC architectural drawings (Levels 2–8). Red indicates occupied seats, tables &amp; rooms; green indicates vacant spots synced to live floor and zone counts.
          </span>
        </div>
      </div>

      <ul className="sr-only">
        <li>
          {plan.title} ({detailed.nickname}): {s.vacantSeats} of {s.totalSeats} seats vacant, {s.occupiedSeats} occupied.
        </li>
        {s.totalRooms > 0 && (
          <li>
            Rooms: {s.vacantRooms} available, {s.occupiedRooms} occupied.
          </li>
        )}
      </ul>
    </section>
  );
}
