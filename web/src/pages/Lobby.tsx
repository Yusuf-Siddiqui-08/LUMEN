import { KioskFrame } from '../components/KioskFrame';
import { LiveStatus } from '../components/LiveStatus';
import { LogoMark } from '../components/Logo';
import { QrCode } from '../components/QrCode';
import { useFloors } from '../lib/floors';
import { useDocumentTitle, useNow } from '../lib/hooks';
import { EMPTY, fmtClock, GOLD, GREEN, lastUpdatedText, litSegments, MONO, RED, RED_TEXT, seatColor, STALE } from '../lib/logic';

/** Portrait elevator-lobby display, designed at 540 x 960 and scaled to fit any portrait screen. */
export default function Lobby() {
  useDocumentTitle('LUMEN lobby elevator display');
  const live = useFloors(5000);
  const clock = useNow(1000);
  const homeUrl = live.payload?.public_url || `${window.location.origin}/`;
  const mono = { fontFamily: MONO, fontVariantLigatures: 'none' } as const;

  return (
    <KioskFrame width={540} height={960}>
      <div
        style={{
          width: 540,
          height: 960,
          boxSizing: 'border-box',
          padding: '26px 24px 24px',
          display: 'flex',
          flexDirection: 'column',
          gap: 12,
          background: '#0A2150',
          color: '#FFFFFF',
          overflow: 'hidden',
          position: 'relative',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <LogoMark width={46} height={54} />
            <h1 style={{ margin: 0, fontSize: 56, fontWeight: 900, lineHeight: 1, letterSpacing: '0.01em', color: '#75ADEA' }}>LUMEN</h1>
          </div>
          <span style={{ fontSize: 40, fontWeight: 900, fontVariantNumeric: 'tabular-nums' }}>{fmtClock(clock)}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, ...mono, fontSize: 16, letterSpacing: '0.04em' }}>
          <span style={{ color: '#DDE6F7' }}>STUDENT LEARNING CENTRE</span>
          <LiveStatus status={live.status} fontSize={16} dot={9} />
          {live.simulated && <span style={{ marginLeft: 'auto', fontSize: 12, color: GOLD }}>SAMPLE DATA</span>}
        </div>
        <div style={{ marginTop: 4, padding: '12px 18px', border: '2px solid #F4B601', borderRadius: 12, background: '#2F3755' }}>
          <span style={{ fontSize: 31, fontWeight: 900 }}>
            Decide <span style={{ color: GOLD }}>before</span> you ride.
          </span>
        </div>
        <div aria-hidden="true" style={{ display: 'flex', gap: 14, padding: '0 16px', ...mono, fontSize: 13, letterSpacing: '0.04em', color: '#9FB3DA' }}>
          <span style={{ width: 44 }}>FLOOR</span>
          <span style={{ flex: 1 }}>VIBE + OCCUPANCY</span>
          <span>SEATS FREE</span>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {!live.loaded && (
            <div style={{ height: 72, display: 'flex', alignItems: 'center', padding: '0 16px', borderRadius: 8, background: '#19356B', fontSize: 22 }}>
              {live.status === 'offline' ? 'Cannot reach LUMEN. Retrying…' : 'Connecting…'}
            </div>
          )}
          {live.floors.map((f) => {
            const full = f.free === 0;
            const st = f.stale;
            const c = st ? STALE.seg : full ? RED : seatColor(f.free);
            const lit = litSegments(f);
            return (
              <div
                key={f.n}
                style={{
                  height: 72,
                  boxSizing: 'border-box',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 14,
                  padding: '0 16px',
                  borderRadius: 8,
                  background: st ? STALE.bg : full ? '#2F284F' : '#19356B',
                  border: `2px ${st ? 'dashed' : 'solid'} ${st ? STALE.border : full ? RED : 'transparent'}`,
                }}
              >
                <span style={{ width: 44, fontSize: 46, fontWeight: 900, lineHeight: 1 }}>{f.n}</span>
                <span style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 10 }}>
                  <span style={{ ...mono, fontSize: 18, fontWeight: 700, letterSpacing: '0.04em', whiteSpace: 'nowrap' }}>
                    {f.vibe.toUpperCase()}
                    {st && (
                      <span style={{ marginLeft: 10, fontSize: 12, fontWeight: 700, color: STALE.text }}>
                        {lastUpdatedText(f.ageS).toUpperCase()}
                      </span>
                    )}
                  </span>
                  <span aria-hidden="true" style={{ display: 'flex', gap: 4 }}>
                    {Array.from({ length: 14 }, (_, k) => (
                      <span key={k} style={{ width: 16, height: 10, borderRadius: 3, background: k < lit ? c : EMPTY }} />
                    ))}
                  </span>
                </span>
                <span
                  style={{
                    minWidth: 70,
                    textAlign: 'right',
                    fontSize: 44,
                    fontWeight: 900,
                    lineHeight: 1,
                    color: st ? STALE.text : full ? RED_TEXT : c,
                    fontVariantNumeric: 'tabular-nums',
                  }}
                >
                  {full ? 'FULL' : f.free}
                </span>
              </div>
            );
          })}
        </div>
        <div style={{ marginTop: 'auto', display: 'flex', gap: 10, height: 118 }}>
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 8, padding: '0 16px', borderRadius: 10, background: '#122851' }}>
            <span style={{ ...mono, fontSize: 14, color: '#DDE6F7' }}>ELEVATOR WAIT</span>
            <span style={{ fontSize: 40, fontWeight: 900, lineHeight: 1, color: GOLD }}>
              {live.elevatorWait === null ? '…' : `~${live.elevatorWait} min`}
            </span>
          </div>
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 8, padding: '0 16px', borderRadius: 10, background: '#122851' }}>
            <span style={{ ...mono, fontSize: 14, color: '#DDE6F7' }}>STAIRS 2–3 FLRS</span>
            <span style={{ fontSize: 40, fontWeight: 900, lineHeight: 1, color: GREEN }}>~1 min</span>
          </div>
          <a
            href={homeUrl}
            aria-label="Scan to open LUMEN on your phone"
            style={{
              flex: 'none',
              width: 118,
              height: 118,
              boxSizing: 'border-box',
              padding: 8,
              borderRadius: 10,
              background: '#FFFFFF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <QrCode text={homeUrl} size={102} />
          </a>
        </div>
      </div>
    </KioskFrame>
  );
}
