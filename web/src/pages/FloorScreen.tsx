import { useParams } from 'react-router-dom';
import { KioskFrame } from '../components/KioskFrame';
import { useFloors } from '../lib/floors';
import { useDocumentTitle, useNow } from '../lib/hooks';
import { bestZoneIndex, GOLD, GREEN, lastUpdatedText, mapOrder, occupancyPct, ordinal, RED, seatColor, ZONE_TILE, zoneStatus } from '../lib/logic';

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const R = 76;
const CIRC = 2 * Math.PI * R; // 477.5, as in the prototype

const card = {
  boxSizing: 'border-box',
  borderRadius: 20,
  border: '2px solid rgba(255,255,255,0.25)',
  background: 'rgba(8,28,72,0.28)',
} as const;

/** Per-floor screen, designed at 1280 x 720 and scaled to fit. /floor/7 shows floor 7. */
export default function FloorScreen() {
  const { n } = useParams();
  const floorN = Number(n);
  useDocumentTitle(`LUMEN floor screen · Floor ${n}`);
  const live = useFloors(5000);
  const now = useNow(1000);
  const f = live.floors.find((x) => x.n === floorN) ?? null;

  const d = new Date(now);
  const h = d.getHours();
  const time = `${h % 12 || 12}:${String(d.getMinutes()).padStart(2, '0')} ${h < 12 ? 'AM' : 'PM'}`;
  const date = `${DAYS[d.getDay()]}, ${MONTHS[d.getMonth()]} ${d.getDate()}`;

  const st = f?.stale ?? false;
  const occ = f ? Math.min(100, occupancyPct(f)) : 0;
  const color = !f ? 'rgba(255,255,255,0.5)' : st ? '#B4C0D9' : f.free === 0 ? RED : seatColor(f.free);
  const best = f ? bestZoneIndex(f.zones) : -1;
  const unknownFloor = live.loaded && !f;

  return (
    <KioskFrame width={1280} height={720} letterbox="#0B2350">
      <div
        style={{
          position: 'relative',
          width: 1280,
          height: 720,
          boxSizing: 'border-box',
          padding: '36px 48px',
          overflow: 'hidden',
          background: 'linear-gradient(180deg, #1E5BB8 0%, #3A78C6 100%)',
          color: '#FFFFFF',
        }}
      >
        <Clouds />

        <div style={{ position: 'relative', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontSize: 28, fontWeight: 900 }}>SLC</span>
            <h1 style={{ margin: 0, fontSize: 92, fontWeight: 900, lineHeight: 1, letterSpacing: '-0.01em' }}>
              {Number.isInteger(floorN) ? `${ordinal(floorN)} Floor` : 'Floor'}
            </h1>
            <span style={{ marginTop: 10, width: 176, height: 7, borderRadius: 4, background: GOLD }} />
          </div>
          {(st || live.simulated) && (
            <div style={{ alignSelf: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
              {st && (
                <span
                  role="status"
                  style={{
                    padding: '10px 18px',
                    borderRadius: 14,
                    background: 'rgba(8,28,72,0.55)',
                    border: '2px dashed rgba(255,255,255,0.6)',
                    fontSize: 22,
                    fontWeight: 700,
                  }}
                >
                  No signal. {f ? lastUpdatedText(f.ageS) : 'No data yet'}
                </span>
              )}
              {live.simulated && (
                <span style={{ padding: '4px 12px', borderRadius: 8, background: 'rgba(8,28,72,0.55)', fontSize: 16, fontWeight: 700, color: '#FFD75E' }}>
                  SAMPLE DATA
                </span>
              )}
            </div>
          )}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 2,
              padding: '12px 30px',
              borderRadius: 16,
              border: '2px solid rgba(255,255,255,0.45)',
              background: 'rgba(255,255,255,0.12)',
            }}
          >
            <span style={{ fontSize: 40, fontWeight: 900, fontVariantNumeric: 'tabular-nums' }}>{time}</span>
            <span style={{ fontSize: 20 }}>{date}</span>
          </div>
        </div>

        {unknownFloor ? (
          <div style={{ position: 'relative', marginTop: 60, ...card, padding: 40, fontSize: 32 }}>
            There is no floor {n} in LUMEN. Try {live.floors.map((x) => `/floor/${x.n}`).join(', ')}.
          </div>
        ) : (
          <div style={{ position: 'relative', marginTop: 26, display: 'flex', gap: 28, height: 474 }}>
            <div style={{ width: 380, display: 'flex', flexDirection: 'column', gap: 20 }}>
              <div style={{ ...card, height: 272, padding: '18px 24px', display: 'flex', flexDirection: 'column', gap: 6 }}>
                <span style={{ fontSize: 26, fontWeight: 700 }}>Floor Occupancy</span>
                <div style={{ position: 'relative', width: 196, height: 196, alignSelf: 'center' }}>
                  <svg width="196" height="196" viewBox="0 0 196 196" aria-hidden="true">
                    <circle cx="98" cy="98" r={R} fill="none" stroke="rgba(255,255,255,0.32)" style={{ strokeWidth: 24 }} />
                    <circle
                      cx="98"
                      cy="98"
                      r={R}
                      fill="none"
                      stroke={color}
                      transform="rotate(-90 98 98)"
                      style={{ strokeWidth: 24, strokeDasharray: `${((CIRC * occ) / 100).toFixed(1)} ${CIRC.toFixed(1)}`, transition: 'stroke-dasharray .6s ease' }}
                    />
                  </svg>
                  <span
                    style={{
                      position: 'absolute',
                      left: 0,
                      top: 0,
                      width: 196,
                      height: 196,
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <span style={{ fontSize: 48, fontWeight: 900, lineHeight: 1 }}>{f ? `${occ}%` : '…'}</span>
                    <span style={{ fontSize: 20 }}>{f && f.free === 0 ? 'Full' : 'Occupied'}</span>
                  </span>
                </div>
              </div>
              <div style={{ ...card, flex: 1, padding: '14px 24px 18px', display: 'flex', flexDirection: 'column', gap: 10 }}>
                <span style={{ fontSize: 26, fontWeight: 700 }}>Floor Map</span>
                <div style={{ flex: 1, display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 8 }}>
                  {f &&
                    mapOrder(f.zones).map((k) => (
                      <div
                        key={k}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          borderRadius: 8,
                          background: ZONE_TILE[k % ZONE_TILE.length],
                          border: `4px solid ${k === best ? GOLD : 'transparent'}`,
                          fontSize: 19,
                          fontWeight: 700,
                        }}
                      >
                        {f.zones[k].name.replace(' Area', '')}
                      </div>
                    ))}
                </div>
              </div>
            </div>
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div style={{ ...card, padding: '22px 28px', display: 'flex', flexDirection: 'column', gap: 12 }}>
                <span style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: 30, fontWeight: 700 }}>Study Space Availability</span>
                  <span style={{ fontSize: 16, color: '#E3ECFA' }}>Zone levels are estimates</span>
                </span>
                {f?.zones.map((z) => {
                  const [word, zc] = zoneStatus(z.pct);
                  return (
                    <div
                      key={z.name}
                      style={{ height: 56, display: 'flex', alignItems: 'center', gap: 16, padding: '0 22px', borderRadius: 10, background: 'rgba(8,28,72,0.35)' }}
                    >
                      <span style={{ flex: 1, fontSize: 26 }}>{z.name}</span>
                      <span style={{ width: 110, fontSize: 26, fontWeight: 900, fontVariantNumeric: 'tabular-nums' }}>{z.pct}%</span>
                      <span
                        style={{
                          width: 190,
                          height: 38,
                          borderRadius: 999,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          background: zc,
                          color: '#0B1B3A',
                          fontSize: 22,
                          fontWeight: 700,
                        }}
                      >
                        {word}
                      </span>
                    </div>
                  );
                })}
              </div>
              <div
                style={{
                  ...card,
                  padding: '18px 28px',
                  background: 'rgba(8,28,72,0.32)',
                  display: 'flex',
                  justifyContent: 'space-around',
                  gap: 20,
                  fontSize: 22,
                }}
              >
                <Legend color={GREEN}>Available (0–49%)</Legend>
                <Legend color={GOLD}>Moderate (50–74%)</Legend>
                <Legend color={RED}>Busy (75–100%)</Legend>
              </div>
            </div>
          </div>
        )}
      </div>
    </KioskFrame>
  );
}

function Legend({ color, children }: { color: string; children: string }) {
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 10 }}>
      <span aria-hidden="true" style={{ width: 22, height: 22, borderRadius: '50%', background: color }} />
      {children}
    </span>
  );
}

function Clouds() {
  const c = (left: number, top: number, size: number, a: number) => (
    <span
      key={`${left}-${top}`}
      aria-hidden="true"
      style={{ position: 'absolute', left, top, width: size, height: size, borderRadius: '50%', background: `rgba(255,255,255,${a})` }}
    />
  );
  return (
    <>
      {c(560, 76, 64, 0.22)}
      {c(600, 54, 90, 0.22)}
      {c(662, 72, 72, 0.22)}
      {c(720, 96, 44, 0.22)}
      {c(660, 600, 150, 0.16)}
      {c(760, 540, 210, 0.16)}
      {c(900, 590, 170, 0.16)}
      {c(1020, 630, 140, 0.16)}
    </>
  );
}
