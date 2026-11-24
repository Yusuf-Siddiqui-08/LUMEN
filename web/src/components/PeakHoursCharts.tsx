import type { CSSProperties } from 'react';
import { BLUE, GOLD, GREEN, MONO, MUTED, MUTED_2, RED, RED_TEXT, seatColor } from '../lib/logic';
import {
  busiestHour,
  busiestIndex,
  type FloorPeakData,
  formatHour,
  PEAK_HOURS,
  peakFor,
  quietestHour,
  quietestIndex,
  shortHour,
} from '../lib/peakHours';

/** Fallback capacities matching server/config/floors.json if a caller omits seats. */
const DEFAULT_SEATS: Record<number, number> = {
  8: 62,
  7: 60,
  6: 48,
  5: 30,
  4: 56,
  3: 40,
  2: 44,
};

const LATO = "Lato, 'Helvetica Neue', Arial, sans-serif";

const cardStyle: CSSProperties = {
  background: '#132952',
  border: '1px solid rgba(117,173,234,0.24)',
  borderRadius: 16,
  padding: '18px 18px 16px',
  display: 'flex',
  flexDirection: 'column',
  gap: 10,
  minWidth: 0,
  boxSizing: 'border-box',
};

const monoLabel = (size = 12, color = MUTED): CSSProperties => ({
  fontFamily: MONO,
  fontVariantLigatures: 'none',
  fontSize: size,
  letterSpacing: '0.06em',
  color,
});

function bandColor(db: number): string {
  if (db < 45) return GREEN;
  if (db <= 60) return GOLD;
  return RED_TEXT;
}

function bandName(db: number): string {
  if (db < 45) return 'Quiet';
  if (db <= 60) return 'Low chatter';
  return 'Social';
}

function clampAnchor(index: number, count: number, x: number, plotLeft: number, plotRight: number) {
  if (index <= 1) return { x: Math.max(plotLeft, x - 6), anchor: 'start' as const };
  if (index >= count - 2) return { x: Math.min(plotRight, x + 6), anchor: 'end' as const };
  return { x, anchor: 'middle' as const };
}

function ChartHeader({
  kicker,
  sentence,
}: {
  kicker: string;
  sentence: string;
}) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '4px 10px' }}>
        <span style={monoLabel(12, MUTED_2)}>{kicker}</span>
        <span
          style={{
            ...monoLabel(11, GOLD),
            letterSpacing: '0.04em',
            padding: '2px 8px',
            borderRadius: 999,
            border: '1px solid rgba(244,182,1,0.45)',
            background: 'rgba(244,182,1,0.08)',
          }}
        >
          Typical weekday · sample data
        </span>
      </div>
      <p style={{ margin: 0, fontSize: 16, fontWeight: 700, lineHeight: 1.35, color: '#FFFFFF' }}>{sentence}</p>
    </div>
  );
}

function FootTrafficChart({
  floor,
  seats,
  data,
  compact,
}: {
  floor: number;
  seats: number;
  data: FloorPeakData;
  compact: boolean;
}) {
  const hours = PEAK_HOURS;
  const peakIdx = busiestIndex(data);
  const peakH = busiestHour(data, hours);
  const peakPeople = data.people[peakIdx] ?? 0;
  const sentence = `Busiest around ${formatHour(peakH)}, about ${peakPeople} of ${seats} seats taken`;

  const W = compact ? 284 : 500;
  const H = compact ? 216 : 226;
  const plotLeft = compact ? 30 : 40;
  const plotRight = W - (compact ? 8 : 12);
  const plotTop = 32;
  const plotBottom = H - 28;
  const plotW = plotRight - plotLeft;
  const plotH = plotBottom - plotTop;

  const yMax = Math.max(seats, ...data.people, 1);
  const yMid = Math.round(yMax / 2);
  const yTicks = [0, yMid, yMax];
  const yOf = (v: number) => plotBottom - (v / yMax) * plotH;

  const slotW = plotW / hours.length;
  const barW = Math.max(8, Math.min(20, slotW * 0.66));
  const peakCenter = plotLeft + (peakIdx + 0.5) * slotW;
  const peakPos = clampAnchor(peakIdx, hours.length, peakCenter, plotLeft, plotRight);
  const peakY = yOf(peakPeople);

  const fontSize = 11.5;

  return (
    <article style={cardStyle}>
      <ChartHeader kicker="FOOT TRAFFIC BY HOUR" sentence={sentence} />
      <svg
        role="img"
        aria-label={sentence}
        viewBox={`0 0 ${W} ${H}`}
        width="100%"
        style={{ display: 'block', width: '100%', height: 'auto' }}
      >
        <text x={plotLeft} y={14} fontFamily={MONO} fontSize={fontSize} fill={MUTED} textAnchor="start">
          people
        </text>

        {yTicks.map((tick) => {
          const y = yOf(tick);
          const isCap = tick === yMax;
          return (
            <g key={tick}>
              <line
                x1={plotLeft}
                y1={y}
                x2={plotRight}
                y2={y}
                stroke={isCap ? 'rgba(117,173,234,0.4)' : 'rgba(117,173,234,0.18)'}
                strokeDasharray={isCap ? '4 4' : undefined}
                strokeWidth={1}
              />
              <text x={plotLeft - 6} y={y + 4} fontFamily={MONO} fontSize={fontSize} fill={MUTED} textAnchor="end">
                {tick}
              </text>
            </g>
          );
        })}

        {data.people.map((count, i) => {
          const cx = plotLeft + (i + 0.5) * slotW;
          const x = cx - barW / 2;
          const y = yOf(count);
          const h = Math.max(2, plotBottom - y);
          const free = Math.max(0, seats - count);
          const color = seatColor(free);
          const isPeak = i === peakIdx;
          return (
            <g key={hours[i]}>
              <rect
                x={x}
                y={y}
                width={barW}
                height={h}
                rx={2.5}
                fill={color}
                fillOpacity={isPeak ? 1 : 0.88}
                stroke={isPeak ? '#FFFFFF' : undefined}
                strokeWidth={isPeak ? 1.8 : 0}
              >
                <title>{`${formatHour(hours[i])}: ${count} of ${seats} seats taken`}</title>
              </rect>
            </g>
          );
        })}

        <text
          x={peakPos.x}
          y={Math.max(15, peakY - 9)}
          fontFamily={LATO}
          fontSize={fontSize}
          fontWeight={900}
          fill="#FFFFFF"
          textAnchor={peakPos.anchor}
        >
          {`Peak, ${peakPeople}`}
        </text>

        {hours.map((h, i) => {
          if (compact && i % 2 !== 0) return null;
          const cx = plotLeft + (i + 0.5) * slotW;
          const isLast = i === hours.length - 1;
          const isFirst = i === 0;
          const anchor = isFirst ? 'start' : isLast ? 'end' : 'middle';
          const tx = isFirst ? Math.max(plotLeft, cx - barW / 2) : isLast ? Math.min(plotRight, cx + barW / 2) : cx;
          return (
            <text
              key={h}
              x={tx}
              y={H - 8}
              fontFamily={LATO}
              fontSize={fontSize}
              fontWeight={i === peakIdx ? 700 : 400}
              fill={i === peakIdx ? '#FFFFFF' : MUTED}
              textAnchor={anchor}
            >
              {shortHour(h)}
            </text>
          );
        })}
      </svg>

      <div aria-hidden="true" style={{ display: 'flex', flexWrap: 'wrap', gap: '6px 14px', fontSize: 12, color: MUTED }}>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
          <span style={{ width: 10, height: 10, borderRadius: 2, background: GREEN }} />
          10+ seats free
        </span>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
          <span style={{ width: 10, height: 10, borderRadius: 2, background: GOLD }} />
          Under 10 free
        </span>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
          <span style={{ width: 10, height: 10, borderRadius: 2, background: RED }} />
          Full ({seats} seats)
        </span>
      </div>

      <div className="sr-only" style={{ left: 0 }}>
        <table>
          <caption>{`Typical weekday foot traffic by hour on Floor ${floor} (sample data)`}</caption>
          <thead>
            <tr>
              <th scope="col">Hour</th>
              <th scope="col">People on floor</th>
              <th scope="col">Seats capacity</th>
            </tr>
          </thead>
          <tbody>
            {hours.map((h, i) => (
              <tr key={h}>
                <td>{formatHour(h)}</td>
                <td>{data.people[i]}</td>
                <td>{seats}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </article>
  );
}

function NoiseChart({
  floor,
  data,
  compact,
}: {
  floor: number;
  data: FloorPeakData;
  compact: boolean;
}) {
  const hours = PEAK_HOURS;
  const quietIdx = quietestIndex(data);
  const quietH = quietestHour(data, hours);
  const quietDb = data.noise_db[quietIdx] ?? 0;
  const sentence = `Quietest around ${formatHour(quietH)}, about ${Math.round(quietDb)} dB`;

  const W = compact ? 284 : 500;
  const H = compact ? 216 : 226;
  const plotLeft = compact ? 30 : 40;
  const plotRight = W - (compact ? 8 : 12);
  const plotTop = 32;
  const plotBottom = H - 28;
  const plotW = plotRight - plotLeft;
  const plotH = plotBottom - plotTop;

  const yMin = 25;
  const maxDb = Math.max(...data.noise_db, 65);
  const yMax = Math.max(70, Math.ceil(maxDb / 5) * 5);
  const yOf = (db: number) => plotBottom - ((db - yMin) / (yMax - yMin)) * plotH;

  const y45 = yOf(45);
  const y60 = yOf(60);
  const yTop = yOf(yMax);
  const yBot = yOf(yMin);

  const slotW = plotW / hours.length;
  const points = data.noise_db.map((db, i) => ({
    db,
    h: hours[i],
    x: plotLeft + (i + 0.5) * slotW,
    y: yOf(db),
  }));
  const polyline = points.map((p) => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ');

  const quietPt = points[quietIdx];
  const quietPos = clampAnchor(quietIdx, hours.length, quietPt.x, plotLeft, plotRight);
  const quietLabelY = quietPt.y + 17 <= yBot - 5 ? quietPt.y + 17 : quietPt.y - 12;

  const fontSize = 11.5;

  return (
    <article style={cardStyle}>
      <ChartHeader kicker="NOISE BY HOUR" sentence={sentence} />
      <svg
        role="img"
        aria-label={sentence}
        viewBox={`0 0 ${W} ${H}`}
        width="100%"
        style={{ display: 'block', width: '100%', height: 'auto' }}
      >
        {/* Noise band shading */}
        <rect x={plotLeft} y={yTop} width={plotW} height={y60 - yTop} fill={RED} fillOpacity={0.08} />
        <rect x={plotLeft} y={y60} width={plotW} height={y45 - y60} fill={GOLD} fillOpacity={0.07} />
        <rect x={plotLeft} y={y45} width={plotW} height={yBot - y45} fill={GREEN} fillOpacity={0.08} />

        <text x={plotLeft} y={14} fontFamily={MONO} fontSize={fontSize} fill={MUTED} textAnchor="start">
          dB
        </text>

        {/* Bottom and top bounds */}
        <line x1={plotLeft} y1={yBot} x2={plotRight} y2={yBot} stroke="rgba(117,173,234,0.22)" strokeWidth={1} />
        <text x={plotLeft - 6} y={yBot + 4} fontFamily={MONO} fontSize={fontSize} fill={MUTED} textAnchor="end">
          {yMin}
        </text>
        <line x1={plotLeft} y1={yTop} x2={plotRight} y2={yTop} stroke="rgba(117,173,234,0.16)" strokeWidth={1} />
        <text x={plotLeft - 6} y={yTop + 4} fontFamily={MONO} fontSize={fontSize} fill={MUTED} textAnchor="end">
          {yMax}
        </text>

        {/* Reference lines at 45 dB and 60 dB */}
        <line x1={plotLeft} y1={y45} x2={plotRight} y2={y45} stroke={GREEN} strokeOpacity={0.8} strokeDasharray="5 4" strokeWidth={1.3} />
        <text x={plotLeft - 6} y={y45 + 4} fontFamily={MONO} fontSize={fontSize} fontWeight={700} fill={GREEN} textAnchor="end">
          45
        </text>

        <line x1={plotLeft} y1={y60} x2={plotRight} y2={y60} stroke={RED_TEXT} strokeOpacity={0.85} strokeDasharray="5 4" strokeWidth={1.3} />
        <text x={plotLeft - 6} y={y60 + 4} fontFamily={MONO} fontSize={fontSize} fontWeight={700} fill={RED_TEXT} textAnchor="end">
          60
        </text>

        {/* Band labels placed inside clear corners of each band */}
        <g>
          <rect x={plotLeft + 4} y={y60 - 20} width={44} height={16} rx={3} fill="#132952" fillOpacity={0.9} />
          <text x={plotLeft + 8} y={y60 - 8} fontFamily={LATO} fontSize={fontSize} fontWeight={700} fill={RED_TEXT} textAnchor="start">
            Social
          </text>
        </g>
        <g>
          <rect x={plotRight - 76} y={y60 + 2} width={72} height={16} rx={3} fill="#132952" fillOpacity={0.9} />
          <text x={plotRight - 8} y={y60 + 14} fontFamily={LATO} fontSize={fontSize} fontWeight={700} fill={GOLD} textAnchor="end">
            Low chatter
          </text>
        </g>
        <g>
          <rect x={plotLeft + plotW / 2 - 22} y={yBot - 20} width={44} height={16} rx={3} fill="#132952" fillOpacity={0.9} />
          <text x={plotLeft + plotW / 2} y={yBot - 8} fontFamily={LATO} fontSize={fontSize} fontWeight={700} fill={GREEN} textAnchor="middle">
            Quiet
          </text>
        </g>

        {/* Noise curve */}
        <polyline points={polyline} fill="none" stroke={BLUE} strokeWidth={2.5} strokeLinejoin="round" strokeLinecap="round" />

        {points.map((p, i) => {
          const isQuiet = i === quietIdx;
          const color = bandColor(p.db);
          return (
            <circle
              key={p.h}
              cx={p.x}
              cy={p.y}
              r={isQuiet ? (compact ? 5.5 : 6) : compact ? 3.1 : 3.6}
              fill={color}
              stroke={isQuiet ? '#FFFFFF' : '#132952'}
              strokeWidth={isQuiet ? 2 : 1.2}
            >
              <title>{`${formatHour(p.h)}: ${p.db.toFixed(1)} dB (${bandName(p.db)})`}</title>
            </circle>
          );
        })}

        <text
          x={quietPos.x}
          y={quietLabelY}
          fontFamily={LATO}
          fontSize={fontSize}
          fontWeight={900}
          fill="#FFFFFF"
          textAnchor={quietPos.anchor}
        >
          {`Quietest, ${quietDb.toFixed(1)} dB`}
        </text>

        {hours.map((h, i) => {
          if (compact && i % 2 !== 0) return null;
          const cx = plotLeft + (i + 0.5) * slotW;
          const isLast = i === hours.length - 1;
          const isFirst = i === 0;
          const anchor = isFirst ? 'start' : isLast ? 'end' : 'middle';
          const tx = isFirst ? Math.max(plotLeft, cx - 6) : isLast ? Math.min(plotRight, cx + 6) : cx;
          return (
            <text
              key={h}
              x={tx}
              y={H - 8}
              fontFamily={LATO}
              fontSize={fontSize}
              fontWeight={i === quietIdx ? 700 : 400}
              fill={i === quietIdx ? '#FFFFFF' : MUTED}
              textAnchor={anchor}
            >
              {shortHour(h)}
            </text>
          );
        })}
      </svg>

      <div aria-hidden="true" style={{ display: 'flex', flexWrap: 'wrap', gap: '6px 14px', fontSize: 12, color: MUTED }}>
        <span style={{ color: GREEN }}>Below 45 dB: Quiet</span>
        <span style={{ color: GOLD }}>45–60 dB: Low chatter</span>
        <span style={{ color: RED_TEXT }}>Above 60 dB: Social</span>
      </div>

      <div className="sr-only" style={{ left: 0 }}>
        <table>
          <caption>{`Typical weekday noise level by hour on Floor ${floor} (sample data)`}</caption>
          <thead>
            <tr>
              <th scope="col">Hour</th>
              <th scope="col">Noise level (dB)</th>
              <th scope="col">Band</th>
            </tr>
          </thead>
          <tbody>
            {hours.map((h, i) => {
              const db = data.noise_db[i];
              return (
                <tr key={h}>
                  <td>{formatHour(h)}</td>
                  <td>{`${db.toFixed(1)} dB`}</td>
                  <td>{bandName(db)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </article>
  );
}

/**
 * Typical-weekday hourly foot traffic and noise charts for the selected floor.
 * Uses sample data from web/src/data/peakHours.json (never live sensor data).
 */
export function PeakHoursCharts({
  floor,
  seats,
  compact = false,
}: {
  floor: number;
  seats?: number;
  compact?: boolean;
}) {
  const data = peakFor(floor);
  if (!data) {
    return (
      <section aria-label={`Floor ${floor} typical weekday charts`} style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        <span style={monoLabel(12)}>TYPICAL WEEKDAY · SAMPLE DATA</span>
        <p style={{ margin: 0, padding: '14px 16px', borderRadius: 12, background: '#132952', border: '1px solid rgba(117,173,234,0.24)', fontSize: 15, color: MUTED }}>
          No typical-day data for this floor yet.
        </p>
      </section>
    );
  }

  const cap = seats ?? DEFAULT_SEATS[floor] ?? Math.max(...data.people);

  return (
    <section aria-label={`Floor ${floor} typical weekday charts`} data-testid="peak-hours-charts" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div style={{ display: 'grid', gridTemplateColumns: compact ? 'minmax(0, 1fr)' : 'repeat(2, minmax(0, 1fr))', gap: 16 }}>
        <FootTrafficChart floor={floor} seats={cap} data={data} compact={compact} />
        <NoiseChart floor={floor} data={data} compact={compact} />
      </div>
    </section>
  );
}
