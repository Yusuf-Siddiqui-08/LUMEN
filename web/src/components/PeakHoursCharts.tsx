import type { CSSProperties } from 'react';
import type { FloorTheme } from '../lib/floorThemes';
import { BLUE, GOLD, GREEN, MONO, MUTED, MUTED_2, RED, RED_TEXT, seatColor } from '../lib/logic';
import {
  busiestHour,
  busiestIndex,
  type FloorPeakData,
  formatHour,
  PEAK_HOURS,
  PEAK_HOURS_DATA,
  peakFor,
  quietestHour,
  quietestIndex,
  shortHour,
  trendNoiseFor,
  trendPeopleFor,
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

const cardStyle = (compact: boolean, theme?: FloorTheme): CSSProperties => ({
  background: theme ? theme.cardBg : '#132952',
  border: `1px solid ${theme ? theme.cardBorder : 'rgba(117,173,234,0.24)'}`,
  backdropFilter: theme ? 'blur(12px)' : undefined,
  WebkitBackdropFilter: theme ? 'blur(12px)' : undefined,
  borderRadius: 14,
  padding: compact ? '12px 12px 10px' : '14px 16px 12px',
  display: 'flex',
  flexDirection: 'column',
  gap: 6,
  minWidth: 0,
  boxSizing: 'border-box',
  transition: theme ? 'background-color 0.45s ease, border-color 0.45s ease' : undefined,
});

const monoLabel = (size = 12, color = MUTED): CSSProperties => ({
  fontFamily: MONO,
  fontVariantLigatures: 'none',
  fontSize: size,
  letterSpacing: '0.05em',
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
  theme,
}: {
  kicker: string;
  sentence: string;
  theme?: FloorTheme;
}) {
  const badgeText =
    PEAK_HOURS_DATA.source === 'measured' ? 'Typical weekday · MATLAB measured' : 'Typical weekday · sample (MATLAB)';
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '2px 8px' }}>
        <span style={monoLabel(11.5, theme ? theme.muted2 : MUTED_2)}>{kicker}</span>
        <span
          style={{
            ...monoLabel(11, theme ? theme.badgeText : GOLD),
            letterSpacing: '0.03em',
            padding: '1px 7px',
            borderRadius: 999,
            border: `1px solid ${theme ? theme.badgeBorder : 'rgba(244,182,1,0.45)'}`,
            background: theme ? theme.badgeBg : 'rgba(244,182,1,0.08)',
          }}
        >
          {badgeText}
        </span>
      </div>
      <p style={{ margin: 0, fontSize: 15.5, fontWeight: 700, lineHeight: 1.3, color: '#FFFFFF' }}>{sentence}</p>
    </div>
  );
}

function FootTrafficChart({
  floor,
  seats,
  data,
  compact,
  theme,
}: {
  floor: number;
  seats: number;
  data: FloorPeakData;
  compact: boolean;
  theme?: FloorTheme;
}) {
  const muted = theme ? theme.muted : MUTED;
  const gridColor = theme ? theme.chartGrid : 'rgba(117,173,234,0.18)';
  const gridCapColor = theme ? theme.chartGridCap : 'rgba(117,173,234,0.4)';
  const hours = PEAK_HOURS;
  const peakIdx = busiestIndex(data);
  const peakH = busiestHour(data, hours);
  const peakPeople = data.people[peakIdx] ?? 0;
  const sentence = `Busiest around ${formatHour(peakH)}, about ${peakPeople} of ${seats} seats taken`;

  const W = compact ? 286 : 500;
  const H = compact ? 176 : 188;
  const plotLeft = compact ? 28 : 36;
  const plotRight = W - (compact ? 6 : 10);
  const plotTop = 24;
  const plotBottom = H - 20;
  const plotW = plotRight - plotLeft;
  const plotH = plotBottom - plotTop;

  const yMax = Math.max(seats, ...data.people, 1);
  const yMid = Math.round(yMax / 2);
  const yTicks = [0, yMid, yMax];
  const yOf = (v: number) => plotBottom - (v / yMax) * plotH;

  const slotW = plotW / hours.length;
  const barW = Math.max(8, Math.min(20, slotW * 0.68));
  const peakCenter = plotLeft + (peakIdx + 0.5) * slotW;
  const peakPos = clampAnchor(peakIdx, hours.length, peakCenter, plotLeft, plotRight);
  const peakY = yOf(peakPeople);

  const trend = trendPeopleFor(data);
  const trendPolyline = trend
    .map((val, i) => `${(plotLeft + (i + 0.5) * slotW).toFixed(1)},${yOf(val).toFixed(1)}`)
    .join(' ');
  const haloColor = theme ? theme.chartBadgeBg : '#132952';

  const fontSize = 11.5;
  const unitOnRight = peakIdx <= 2;

  return (
    <article style={cardStyle(compact, theme)}>
      <ChartHeader kicker="FOOT TRAFFIC BY HOUR" sentence={sentence} theme={theme} />
      <svg
        role="img"
        aria-label={sentence}
        viewBox={`0 0 ${W} ${H}`}
        width="100%"
        style={{ display: 'block', width: '100%', height: 'auto' }}
      >
        <text
          x={unitOnRight ? plotRight : plotLeft}
          y={13}
          fontFamily={MONO}
          fontSize={fontSize}
          fill={muted}
          textAnchor={unitOnRight ? 'end' : 'start'}
        >
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
                stroke={isCap ? gridCapColor : gridColor}
                strokeDasharray={isCap ? '4 4' : undefined}
                strokeWidth={1}
              />
              <text x={plotLeft - 5} y={y + 4} fontFamily={MONO} fontSize={fontSize} fill={muted} textAnchor="end">
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
            <rect
              key={hours[i]}
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
              <title>{`${formatHour(hours[i])}: ${count} of ${seats} seats taken (3-hr trend ${trend[i].toFixed(1)})`}</title>
            </rect>
          );
        })}

        {/* 3-hour centered moving average computed in MATLAB (movmean) */}
        <polyline
          points={trendPolyline}
          fill="none"
          stroke={haloColor}
          strokeOpacity={0.78}
          strokeWidth={3.2}
          strokeLinejoin="round"
          strokeLinecap="round"
        />
        <polyline
          points={trendPolyline}
          fill="none"
          stroke="#FFFFFF"
          strokeOpacity={0.9}
          strokeWidth={1.7}
          strokeDasharray="4 3"
          strokeLinejoin="round"
          strokeLinecap="round"
        />

        <text
          x={peakPos.x}
          y={Math.max(12, peakY - 7)}
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
              y={H - 5}
              fontFamily={LATO}
              fontSize={fontSize}
              fontWeight={i === peakIdx ? 700 : 400}
              fill={i === peakIdx ? '#FFFFFF' : muted}
              textAnchor={anchor}
            >
              {shortHour(h)}
            </text>
          );
        })}
      </svg>

      <div aria-hidden="true" style={{ display: 'flex', flexWrap: 'wrap', gap: '4px 12px', fontSize: 12, color: muted }}>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}>
          <span style={{ width: 9, height: 9, borderRadius: 2, background: GREEN }} />
          10+ free
        </span>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}>
          <span style={{ width: 9, height: 9, borderRadius: 2, background: GOLD }} />
          Under 10 free
        </span>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}>
          <span style={{ width: 9, height: 9, borderRadius: 2, background: RED }} />
          Full ({seats})
        </span>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}>
          <svg width="15" height="8" viewBox="0 0 15 8">
            <line x1="0" y1="4" x2="15" y2="4" stroke="#FFFFFF" strokeOpacity={0.9} strokeWidth="1.7" strokeDasharray="4 2.5" />
          </svg>
          3-hr trend
        </span>
      </div>

      <div className="sr-only" style={{ left: 0 }}>
        <table>
          <caption>{`Typical weekday foot traffic by hour on Floor ${floor} (MATLAB ${PEAK_HOURS_DATA.source} averages)`}</caption>
          <thead>
            <tr>
              <th scope="col">Hour</th>
              <th scope="col">People on floor</th>
              <th scope="col">3-hr trend</th>
              <th scope="col">Seats capacity</th>
            </tr>
          </thead>
          <tbody>
            {hours.map((h, i) => (
              <tr key={h}>
                <td>{formatHour(h)}</td>
                <td>{data.people[i]}</td>
                <td>{trend[i].toFixed(1)}</td>
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
  theme,
}: {
  floor: number;
  data: FloorPeakData;
  compact: boolean;
  theme?: FloorTheme;
}) {
  const muted = theme ? theme.muted : MUTED;
  const gridColor = theme ? theme.chartGrid : 'rgba(117,173,234,0.22)';
  const lineColor = theme ? theme.chartLine : BLUE;
  const badgeBg = theme ? theme.chartBadgeBg : '#132952';
  const hours = PEAK_HOURS;
  const quietIdx = quietestIndex(data);
  const quietH = quietestHour(data, hours);
  const quietDb = data.noise_db[quietIdx] ?? 0;
  const sentence = `Quietest around ${formatHour(quietH)}, about ${Math.round(quietDb)} dB`;

  const W = compact ? 286 : 500;
  const H = compact ? 176 : 188;
  const plotLeft = compact ? 28 : 36;
  const plotRight = W - (compact ? 6 : 10);
  const plotTop = 24;
  const plotBottom = H - 20;
  const plotW = plotRight - plotLeft;
  const plotH = plotBottom - plotTop;

  const minDb = Math.min(...data.noise_db);
  const maxDb = Math.max(...data.noise_db);
  const yMin = Math.max(25, Math.min(40, Math.floor((minDb - 6) / 5) * 5));
  const yMax = Math.max(65, Math.ceil((maxDb + 4) / 5) * 5);
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
  const trend = trendNoiseFor(data);
  const trendPolyline = trend
    .map((db, i) => `${points[i].x.toFixed(1)},${yOf(db).toFixed(1)}`)
    .join(' ');
  const r2 = data.matlab?.traffic_noise_r2;

  const quietPt = points[quietIdx];
  const quietPos = clampAnchor(quietIdx, hours.length, quietPt.x, plotLeft, plotRight);
  const quietLabelY = quietPt.y + 16 <= yBot - 4 ? quietPt.y + 16 : quietPt.y - 11;

  const fontSize = 11.5;

  return (
    <article style={cardStyle(compact, theme)}>
      <ChartHeader kicker="NOISE BY HOUR" sentence={sentence} theme={theme} />
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

        <text x={plotLeft} y={13} fontFamily={MONO} fontSize={fontSize} fill={muted} textAnchor="start">
          dB
        </text>

        {/* Bottom and top bounds */}
        <line x1={plotLeft} y1={yBot} x2={plotRight} y2={yBot} stroke={gridColor} strokeWidth={1} />
        <text x={plotLeft - 5} y={yBot + 4} fontFamily={MONO} fontSize={fontSize} fill={muted} textAnchor="end">
          {yMin}
        </text>
        <line x1={plotLeft} y1={yTop} x2={plotRight} y2={yTop} stroke={gridColor} strokeOpacity={0.75} strokeWidth={1} />
        <text x={plotLeft - 5} y={yTop + 4} fontFamily={MONO} fontSize={fontSize} fill={muted} textAnchor="end">
          {yMax}
        </text>

        {/* Reference lines at 45 dB and 60 dB */}
        <line x1={plotLeft} y1={y45} x2={plotRight} y2={y45} stroke={GREEN} strokeOpacity={0.8} strokeDasharray="5 4" strokeWidth={1.3} />
        <text x={plotLeft - 5} y={y45 + 4} fontFamily={MONO} fontSize={fontSize} fontWeight={700} fill={GREEN} textAnchor="end">
          45
        </text>

        <line x1={plotLeft} y1={y60} x2={plotRight} y2={y60} stroke={RED_TEXT} strokeOpacity={0.85} strokeDasharray="5 4" strokeWidth={1.3} />
        <text x={plotLeft - 5} y={y60 + 4} fontFamily={MONO} fontSize={fontSize} fontWeight={700} fill={RED_TEXT} textAnchor="end">
          60
        </text>

        {/* Band labels placed inside clear zones of each band */}
        <g>
          <rect x={plotLeft + 4} y={y60 - 17} width={44} height={14} rx={3} fill={badgeBg} fillOpacity={0.92} />
          <text x={plotLeft + 8} y={y60 - 6} fontFamily={LATO} fontSize={fontSize} fontWeight={700} fill={RED_TEXT} textAnchor="start">
            Social
          </text>
        </g>
        <g>
          <rect x={plotRight - 76} y={y60 + 3} width={72} height={15} rx={3} fill={badgeBg} fillOpacity={0.92} />
          <text x={plotRight - 8} y={y60 + 14} fontFamily={LATO} fontSize={fontSize} fontWeight={700} fill={GOLD} textAnchor="end">
            Low chatter
          </text>
        </g>
        <g>
          <rect x={plotLeft + plotW / 2 - 22} y={yBot - 17} width={44} height={14} rx={3} fill={badgeBg} fillOpacity={0.92} />
          <text x={plotLeft + plotW / 2} y={yBot - 6} fontFamily={LATO} fontSize={fontSize} fontWeight={700} fill={GREEN} textAnchor="middle">
            Quiet
          </text>
        </g>

        {/* 3-hour centered moving average (MATLAB movmean) + hourly Leq curve */}
        <polyline
          points={trendPolyline}
          fill="none"
          stroke="#FFFFFF"
          strokeOpacity={0.78}
          strokeWidth={1.6}
          strokeDasharray="4 3"
          strokeLinejoin="round"
          strokeLinecap="round"
        />
        <polyline points={polyline} fill="none" stroke={lineColor} strokeWidth={2.5} strokeLinejoin="round" strokeLinecap="round" />

        {points.map((p, i) => {
          const isQuiet = i === quietIdx;
          const color = bandColor(p.db);
          return (
            <circle
              key={p.h}
              cx={p.x}
              cy={p.y}
              r={isQuiet ? (compact ? 5.2 : 5.8) : compact ? 3 : 3.5}
              fill={color}
              stroke={isQuiet ? '#FFFFFF' : badgeBg}
              strokeWidth={isQuiet ? 2 : 1.2}
            >
              <title>{`${formatHour(p.h)}: ${p.db.toFixed(1)} dB (${bandName(p.db)}, 3-hr trend ${trend[i].toFixed(1)} dB)`}</title>
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
              y={H - 5}
              fontFamily={LATO}
              fontSize={fontSize}
              fontWeight={i === quietIdx ? 700 : 400}
              fill={i === quietIdx ? '#FFFFFF' : muted}
              textAnchor={anchor}
            >
              {shortHour(h)}
            </text>
          );
        })}
      </svg>

      <div aria-hidden="true" style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '4px 10px', fontSize: 12, color: muted }}>
        <span style={{ color: GREEN }}>&lt;45 dB Quiet</span>
        <span style={{ color: GOLD }}>45–60 Low chatter</span>
        <span style={{ color: RED_TEXT }}>&gt;60 dB Social</span>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}>
          <svg width="15" height="8" viewBox="0 0 15 8">
            <line x1="0" y1="4" x2="15" y2="4" stroke="#FFFFFF" strokeOpacity={0.82} strokeWidth="1.6" strokeDasharray="4 2.5" />
          </svg>
          3-hr trend
        </span>
        {r2 !== undefined && (
          <span style={{ ...monoLabel(11, muted), letterSpacing: '0.02em' }}>
            {`R² ${r2.toFixed(2)}`}
          </span>
        )}
      </div>

      <div className="sr-only" style={{ left: 0 }}>
        <table>
          <caption>{`Typical weekday noise level by hour on Floor ${floor} (MATLAB ${PEAK_HOURS_DATA.source} Leq averages)`}</caption>
          <thead>
            <tr>
              <th scope="col">Hour</th>
              <th scope="col">Noise level (dB)</th>
              <th scope="col">3-hr trend (dB)</th>
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
                  <td>{`${trend[i].toFixed(1)} dB`}</td>
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
 * Uses MATLAB-computed typical-weekday data and 3-hour moving averages from
 * web/src/data/peakHours.json (never live sensor data).
 */
export function PeakHoursCharts({
  floor,
  seats,
  compact = false,
  theme,
}: {
  floor: number;
  seats?: number;
  compact?: boolean;
  theme?: FloorTheme;
}) {
  const data = peakFor(floor);
  if (!data) {
    return (
      <section aria-label={`Floor ${floor} typical weekday charts`} style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <span style={monoLabel(12, theme ? theme.muted : MUTED)}>TYPICAL WEEKDAY · SAMPLE DATA</span>
        <p
          style={{
            margin: 0,
            padding: '12px 14px',
            borderRadius: 12,
            background: theme ? theme.cardBg : '#132952',
            border: `1px solid ${theme ? theme.cardBorder : 'rgba(117,173,234,0.24)'}`,
            backdropFilter: theme ? 'blur(12px)' : undefined,
            WebkitBackdropFilter: theme ? 'blur(12px)' : undefined,
            fontSize: 15,
            color: theme ? theme.muted : MUTED,
          }}
        >
          No typical-day data for this floor yet.
        </p>
      </section>
    );
  }

  const cap = seats ?? DEFAULT_SEATS[floor] ?? Math.max(...data.people);

  return (
    <section aria-label={`Floor ${floor} typical weekday charts`} data-testid="peak-hours-charts">
      <div style={{ display: 'grid', gridTemplateColumns: compact ? 'minmax(0, 1fr)' : 'repeat(2, minmax(0, 1fr))', gap: 12 }}>
        <FootTrafficChart floor={floor} seats={cap} data={data} compact={compact} theme={theme} />
        <NoiseChart floor={floor} data={data} compact={compact} theme={theme} />
      </div>
    </section>
  );
}
