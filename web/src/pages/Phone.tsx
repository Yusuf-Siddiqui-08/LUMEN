import { useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { FloorPlan } from '../components/FloorPlan';
import { LiveStatus } from '../components/LiveStatus';
import { PeakHoursCharts } from '../components/PeakHoursCharts';
import { useFloors } from '../lib/floors';
import { useDocumentTitle, useNow } from '../lib/hooks';
import {
  type Floor,
  fmtClock,
  GOLD,
  GREEN,
  lastUpdatedText,
  MONO,
  noiseMeter,
  pickFor,
  RED,
  RED_TEXT,
  seatColor,
  seatsFreeText,
  STALE,
  stairsMin,
  VIBE_PILL,
  zoneStatus,
} from '../lib/logic';

const mono = { fontFamily: MONO, fontVariantLigatures: 'none' } as const;
const tile = { flex: 1, display: 'flex', flexDirection: 'column', gap: 6, padding: '14px 16px', borderRadius: 14, background: '#19356B' } as const;

/** The phone flow from the prototype: pick a floor, then see its details. */
export default function Phone() {
  useDocumentTitle('LUMEN on your phone');
  const live = useFloors(5000);
  const clock = useNow(1000);
  const [sel, setSel] = useState<number | null>(null);
  const rowRefs = useRef(new Map<number, HTMLButtonElement>());
  const backRef = useRef<HTMLButtonElement>(null);
  const f = sel === null ? null : (live.floors.find((x) => x.n === sel) ?? null);

  const open = (n: number) => {
    setSel(n);
    window.scrollTo(0, 0);
    requestAnimationFrame(() => backRef.current?.focus());
  };
  const back = () => {
    const was = sel;
    setSel(null);
    requestAnimationFrame(() => (was !== null ? rowRefs.current.get(was)?.focus() : undefined));
  };

  return (
    <div style={{ minHeight: '100vh', background: '#132952' }}>
      <main
        style={{
          maxWidth: 480,
          boxSizing: 'border-box',
          minHeight: '100vh',
          margin: '0 auto',
          padding: '28px 20px 24px',
          display: 'flex',
          flexDirection: 'column',
          color: '#FFFFFF',
        }}
      >
        {!f ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16, flex: 1 }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <h1 style={{ margin: 0, fontSize: 36, fontWeight: 900, lineHeight: 1.1 }}>Pick a floor</h1>
              <span style={{ ...mono, fontSize: 14, letterSpacing: '0.04em', color: '#DDE6F7', display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                SLC · <LiveStatus status={live.status} fontSize={14} dot={0} /> · {fmtClock(clock)}
                {live.simulated && <span style={{ color: GOLD }}>· SAMPLE DATA</span>}
              </span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {!live.loaded && <p style={{ margin: 0, color: '#DDE6F7' }}>{live.status === 'offline' ? 'Cannot reach LUMEN. Retrying…' : 'Connecting…'}</p>}
              {live.floors.map((x) => (
                <PhoneRow
                  key={x.n}
                  f={x}
                  onPick={() => open(x.n)}
                  buttonRef={(el) => {
                    if (el) rowRefs.current.set(x.n, el);
                    else rowRefs.current.delete(x.n);
                  }}
                />
              ))}
            </div>
            <div style={{ marginTop: 'auto', paddingTop: 16, display: 'flex', gap: 10 }}>
              <div style={tile}>
                <span style={{ ...mono, fontSize: 12, color: '#DDE6F7' }}>ELEVATOR WAIT</span>
                <span style={{ fontSize: 28, fontWeight: 900, lineHeight: 1, color: GOLD }}>
                  {live.elevatorWait === null ? '…' : `~${live.elevatorWait} min`}
                </span>
              </div>
              <div style={tile}>
                <span style={{ ...mono, fontSize: 12, color: '#DDE6F7' }}>STAIRS 2–3 FLRS</span>
                <span style={{ fontSize: 28, fontWeight: 900, lineHeight: 1, color: GREEN }}>~1 min</span>
              </div>
            </div>
            <Link to="/" style={{ alignSelf: 'center', display: 'inline-flex', alignItems: 'center', minHeight: 44, fontWeight: 700 }}>
              Full site
            </Link>
          </div>
        ) : (
          <PhoneDetail f={f} floors={live.floors} elev={live.elevatorWait} backRef={backRef} onBack={back} />
        )}
      </main>
    </div>
  );
}

function PhoneRow({ f, onPick, buttonRef }: { f: Floor; onPick: () => void; buttonRef: (el: HTMLButtonElement | null) => void }) {
  const full = f.free === 0;
  const st = f.stale;
  return (
    <button
      ref={buttonRef}
      type="button"
      className="lu-row"
      onClick={onPick}
      aria-label={`Floor ${f.n}, ${f.vibe}, ${full ? 'full' : seatsFreeText(f.free)}${st ? `. ${lastUpdatedText(f.ageS)}` : ''}`}
      style={{
        minHeight: 66,
        display: 'flex',
        alignItems: 'center',
        gap: 14,
        padding: '0 18px',
        borderRadius: 14,
        border: `2px ${st ? 'dashed' : 'solid'} ${st ? STALE.border : full ? RED : 'transparent'}`,
        background: st ? STALE.bg : full ? '#2F284F' : '#19356B',
        color: '#FFFFFF',
        textAlign: 'left',
        cursor: 'pointer',
      }}
    >
      <span style={{ width: 30, fontSize: 32, fontWeight: 900, lineHeight: 1 }}>{f.n}</span>
      <span style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
        <span style={{ ...mono, fontSize: 15, fontWeight: 700, letterSpacing: '0.04em' }}>{f.vibe.toUpperCase()}</span>
        {st && <span style={{ fontSize: 13, color: STALE.text }}>{lastUpdatedText(f.ageS)}</span>}
      </span>
      <span
        style={{
          fontSize: 30,
          fontWeight: 900,
          lineHeight: 1,
          color: st ? STALE.text : full ? RED_TEXT : seatColor(f.free),
          fontVariantNumeric: 'tabular-nums',
        }}
      >
        {full ? 'FULL' : f.free}
      </span>
    </button>
  );
}

function PhoneDetail({
  f,
  floors,
  elev,
  backRef,
  onBack,
}: {
  f: Floor;
  floors: Floor[];
  elev: number | null;
  backRef: React.RefObject<HTMLButtonElement | null>;
  onBack: () => void;
}) {
  const full = f.free === 0;
  const st = f.stale;
  const accent = st ? STALE.text : full ? RED_TEXT : seatColor(f.free);
  const accentBg = st ? 'rgba(107,123,160,0.12)' : full ? 'rgba(242,94,94,0.12)' : accent === GOLD ? 'rgba(244,182,1,0.10)' : 'rgba(61,219,150,0.10)';
  const best = pickFor('All', floors.filter((x) => x.n !== f.n));
  const meter = f.db === null ? null : noiseMeter(f.db);
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <button
        ref={backRef}
        type="button"
        onClick={onBack}
        style={{
          alignSelf: 'flex-start',
          minHeight: 44,
          padding: '0 4px',
          border: 'none',
          background: 'transparent',
          color: '#75ADEA',
          ...mono,
          fontSize: 15,
          fontWeight: 700,
          letterSpacing: '0.04em',
          cursor: 'pointer',
        }}
      >
        ‹ ALL FLOORS
      </button>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
        <h1 style={{ margin: 0, fontSize: 50, fontWeight: 900, lineHeight: 1 }}>Floor {f.n}</h1>
        <span
          style={{
            padding: '8px 16px',
            borderRadius: 999,
            background: VIBE_PILL[f.vibe],
            color: '#0B1B3A',
            ...mono,
            fontSize: 15,
            fontWeight: 700,
            letterSpacing: '0.04em',
          }}
        >
          {f.vibe.toUpperCase()}
        </span>
      </div>
      {st && (
        <div role="status" style={{ padding: '12px 16px', borderRadius: 14, border: `2px dashed ${STALE.border}`, background: STALE.bg, fontSize: 16, fontWeight: 700 }}>
          {lastUpdatedText(f.ageS)}. This floor's sensors are not reporting.
        </div>
      )}
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, padding: 20, borderRadius: 18, border: `2px solid ${accent}`, background: accentBg }}>
        <span style={{ fontSize: 80, fontWeight: 900, lineHeight: 0.9, color: accent, fontVariantNumeric: 'tabular-nums' }}>{full ? 'FULL' : f.free}</span>
        <span style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <span style={{ fontSize: 24, fontWeight: 700 }}>{full ? 'Skip this floor' : f.free === 1 ? 'seat free' : 'seats free'}</span>
          <span style={{ fontSize: 17, color: '#DDE6F7' }}>
            {full ? (best ? `Try floor ${best.n}: ${seatsFreeText(best.free)}.` : 'Every floor is busy right now.') : `of ${f.cap} on this floor`}
          </span>
        </span>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, padding: '16px 18px', borderRadius: 16, background: '#19356B' }}>
        <span style={{ ...mono, fontSize: 13, letterSpacing: '0.04em', color: '#DDE6F7' }}>NOISE LEVEL</span>
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
          <span style={{ fontSize: 38, fontWeight: 900, lineHeight: 1 }}>{f.db === null ? '–' : `${f.db} dB`}</span>
          {meter && (
            <span aria-hidden="true" style={{ display: 'flex', alignItems: 'flex-end', gap: 4 }}>
              {Array.from({ length: 10 }, (_, j) => (
                <span
                  key={j}
                  style={{ width: 9, height: Math.round(8 + j * 2.6), borderRadius: 2, background: j < meter.lit ? (st ? STALE.seg : meter.color) : '#2E4A7E' }}
                />
              ))}
            </span>
          )}
        </div>
      </div>
      <div style={{ display: 'flex', gap: 10 }}>
        <div style={{ ...tile, padding: '16px 18px', borderRadius: 16 }}>
          <span style={{ ...mono, fontSize: 13, letterSpacing: '0.04em', color: '#DDE6F7' }}>ELEVATOR WAIT</span>
          <span style={{ fontSize: 32, fontWeight: 900, lineHeight: 1, color: GOLD }}>{elev === null ? '…' : `~${elev} min`}</span>
        </div>
        <div style={{ ...tile, padding: '16px 18px', borderRadius: 16 }}>
          <span style={{ ...mono, fontSize: 13, letterSpacing: '0.04em', color: '#DDE6F7' }}>STAIRS</span>
          <span style={{ fontSize: 32, fontWeight: 900, lineHeight: 1, color: GREEN }}>~{stairsMin(f.n)} min</span>
        </div>
      </div>
      {f.zones.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <span style={{ ...mono, fontSize: 13, letterSpacing: '0.04em', color: '#DDE6F7' }}>ZONES · ESTIMATED</span>
          {f.zones.map((z) => {
            const [word, color] = zoneStatus(z.pct);
            return (
              <div key={z.name} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <span aria-hidden="true" style={{ width: 14, height: 14, borderRadius: '50%', background: color }} />
                <span style={{ flex: 1, fontSize: 19 }}>{z.name}</span>
                <span style={{ fontSize: 15, fontWeight: 700, color: '#DDE6F7' }}>{word}</span>
              </div>
            );
          })}
        </div>
      )}
      <PeakHoursCharts floor={f.n} seats={f.cap} compact />
      <FloorPlan floor={f.n} compact />
    </div>
  );
}
