import { type CSSProperties, useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { FloorBackdrop } from '../components/FloorBackdrop';
import { FloorPlan } from '../components/FloorPlan';
import { LiveStatus } from '../components/LiveStatus';
import { Wordmark } from '../components/Logo';
import { PeakHoursCharts } from '../components/PeakHoursCharts';
import { useFloors } from '../lib/floors';
import { themeForFloor } from '../lib/floorThemes';
import { useDocumentTitle, useMediaQuery, useNow } from '../lib/hooks';
import {
  bestZoneIndex,
  dbWord,
  EMPTY,
  type Floor,
  fmtClock,
  GOLD,
  GREEN,
  lastUpdatedText,
  litSegments,
  mapOrder,
  MONO,
  type Need,
  NEEDS,
  noiseMeter,
  pickFor,
  RED,
  RED_TEXT,
  recommend,
  seatColor,
  seatsFreeText,
  STALE,
  stairsMin,
  statusWord,
  VIBE_PILL,
  ZONE_TILE,
  zoneStatus,
} from '../lib/logic';

const label = (size = 12, extra: CSSProperties = {}): CSSProperties => ({
  fontFamily: MONO,
  fontVariantLigatures: 'none',
  fontSize: size,
  letterSpacing: '0.06em',
  color: '#C9D6EE',
  ...extra,
});

const card: CSSProperties = {
  flex: '1 1 200px',
  display: 'flex',
  flexDirection: 'column',
  gap: 6,
  padding: '18px 22px',
  background: '#122851',
  border: '1px solid rgba(117,173,234,0.2)',
  borderRadius: 14,
};

const navLink: CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  minHeight: 44,
  padding: '0 14px',
  borderRadius: 10,
  fontWeight: 700,
  fontSize: 15,
  color: '#FFFFFF',
  textDecoration: 'none',
};

export default function Home() {
  useDocumentTitle('LUMEN · Decide before you ride');
  const live = useFloors(5000);
  const clock = useNow(1000);
  const isPhone = useMediaQuery('(max-width: 639px)');
  const [sel, setSel] = useState(7);
  const [need, setNeed] = useState<Need>('All');
  const [phoneDetail, setPhoneDetail] = useState(false);
  const [announce, setAnnounce] = useState('');
  const sectionRef = useRef<HTMLElement>(null);
  const backRef = useRef<HTMLButtonElement>(null);
  const rowRefs = useRef(new Map<number, HTMLButtonElement>());

  const floors = live.floors;
  const elev = live.elevatorWait;
  const fresh = floors.filter((f) => !f.stale);
  const staleFloors = floors.filter((f) => f.stale);
  const totalFree = fresh.reduce((s, f) => s + f.free, 0);
  const selected = floors.find((f) => f.n === sel) ?? floors[1] ?? floors[0] ?? null;
  const activeFloor = selected?.n ?? sel;
  const theme = themeForFloor(activeFloor);
  const rec = recommend(need, floors);
  const showList = !isPhone || !phoneDetail;
  const showDetail = !isPhone || phoneDetail;

  // If the phone layout turns off (rotate, resize), go back to side-by-side.
  useEffect(() => {
    if (!isPhone) setPhoneDetail(false);
  }, [isPhone]);

  const openFloor = (n: number) => {
    setSel(n);
    setAnnounce(`Showing floor ${n}`);
    if (isPhone) {
      setPhoneDetail(true);
      requestAnimationFrame(() => {
        sectionRef.current?.scrollIntoView({ block: 'start' });
        backRef.current?.focus({ preventScroll: true });
      });
    }
  };
  const closeDetail = () => {
    setPhoneDetail(false);
    requestAnimationFrame(() => rowRefs.current.get(sel)?.focus());
  };
  const chooseNeed = (id: Need) => {
    setNeed(id);
    const p = pickFor(id, floors);
    if (p) setSel(p.n);
  };

  return (
    <div className="grid-bg">
      <a className="skip-link" href="#floors">
        Skip to live floors
      </a>
      <div className="page">
        <header
          className="site-header"
          style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 16, padding: '24px 0' }}
        >
          <Link to="/" aria-label="LUMEN home" style={{ textDecoration: 'none' }}>
            <Wordmark />
          </Link>
          <nav aria-label="Site" style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 4 }}>
            <a className="nav-link" href="#floors" style={navLink}>
              Live floors
            </a>
            <Link className="nav-link" to="/hardware" style={{ ...navLink, border: '1px solid rgba(117,173,234,0.35)' }}>
              How it works: Hardware
            </Link>
          </nav>
          <div className="header-meta" style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 16 }}>
            <span style={label(12)}>STUDENT LEARNING CENTRE</span>
            <LiveStatus status={live.status} />
            <span style={{ fontSize: 26, fontWeight: 900, fontVariantNumeric: 'tabular-nums' }}>
              <span className="sr-only">Time </span>
              {fmtClock(clock)}
            </span>
            {live.simulated && (
              <span
                title="The server is running with SIMULATE=1: these numbers come from simulated sensors, not the SLC."
                style={{
                  ...label(11),
                  background: '#0A2150',
                  border: '1px solid rgba(244,182,1,0.6)',
                  borderRadius: 8,
                  padding: '6px 10px',
                  color: '#F4B601',
                }}
              >
                SAMPLE DATA · SIMULATED SENSORS
              </span>
            )}
          </div>
        </header>

        <main>
          <section style={{ padding: '40px 0 36px', display: 'flex', flexDirection: 'column', gap: 20 }}>
            <h1 style={{ margin: 0, fontSize: 'clamp(2.75rem, 6vw, 5rem)', fontWeight: 900, lineHeight: 1.02, letterSpacing: '-0.015em' }}>
              Decide <span style={{ color: GOLD }}>before</span> you ride.
            </h1>
            <p style={{ margin: 0, maxWidth: '40rem', fontSize: '1.25rem', lineHeight: 1.5, color: '#C9D6EE' }}>
              Live seats and vibe for every floor of the Student Learning Centre, so you know where to go before you line up for
              the elevator.
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16, marginTop: 8 }}>
              <div style={card}>
                <span style={label(12, { letterSpacing: '0.08em', color: '#9FB3DA' })}>SEATS FREE IN THE SLC</span>
                <span style={{ fontSize: 40, fontWeight: 900, lineHeight: 1, color: GREEN, fontVariantNumeric: 'tabular-nums' }}>
                  {live.loaded ? (fresh.length ? totalFree : '–') : '…'}
                </span>
                {staleFloors.length > 0 && (
                  <span style={{ fontSize: 13, color: '#C9D6EE' }}>
                    {fresh.length === 0
                      ? 'No floor is reporting right now.'
                      : `Not counting floor${staleFloors.length > 1 ? 's' : ''} ${staleFloors.map((f) => f.n).join(', ')}: no signal.`}
                  </span>
                )}
              </div>
              <div style={card}>
                <span style={label(12, { letterSpacing: '0.08em', color: '#9FB3DA' })}>ELEVATOR WAIT</span>
                <span style={{ fontSize: 40, fontWeight: 900, lineHeight: 1, color: GOLD }}>{elev === null ? '…' : `~${elev} min`}</span>
              </div>
              <div style={card}>
                <span style={label(12, { letterSpacing: '0.08em', color: '#9FB3DA' })}>STAIRS 2–3 FLOORS</span>
                <span style={{ fontSize: 40, fontWeight: 900, lineHeight: 1, color: GREEN }}>~1 min</span>
              </div>
            </div>
          </section>

          <section
            id="floors"
            ref={sectionRef}
            className="floors-section"
            aria-label="Live floors"
            style={{
              background: '#0A2150',
              border: '1px solid rgba(117,173,234,0.22)',
              borderRadius: 22,
              padding: 20,
              display: 'flex',
              flexDirection: 'column',
              gap: 16,
              scrollMarginTop: 12,
            }}
          >
            <div className="sr-only" aria-live="polite">
              {announce}
            </div>
            {showList && (
              <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  <h2 id="need-title" style={{ margin: 0, fontSize: '1.5rem', fontWeight: 900 }}>
                    What do you need?
                  </h2>
                  <div role="group" aria-label="Filter floors by vibe" style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                    {NEEDS.map((nd) => {
                      const on = nd.id === need;
                      return (
                        <button
                          key={nd.id}
                          type="button"
                          aria-pressed={on}
                          onClick={() => chooseNeed(nd.id)}
                          style={{
                            minHeight: 44,
                            padding: '0 18px',
                            borderRadius: 999,
                            border: `1px solid ${on ? GOLD : 'rgba(117,173,234,0.3)'}`,
                            background: on ? GOLD : '#19356B',
                            color: on ? '#0B1B3A' : '#FFFFFF',
                            fontWeight: 700,
                            fontSize: 15,
                            cursor: 'pointer',
                          }}
                        >
                          {nd.label}
                        </button>
                      );
                    })}
                  </div>
                </div>
                {live.loaded && (
                  <div
                    style={{
                      flex: '1 1 320px',
                      maxWidth: 540,
                      display: 'flex',
                      flexWrap: 'wrap',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: '12px 16px',
                      padding: '14px 18px',
                      border: `2px solid ${rec.floor ? GREEN : GOLD}`,
                      background: rec.floor ? 'rgba(61,219,150,0.08)' : 'rgba(244,182,1,0.08)',
                      borderRadius: 14,
                    }}
                  >
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                      <span aria-live="polite" style={{ fontSize: '1.375rem', fontWeight: 900 }}>
                        {rec.title}
                      </span>
                      <span style={{ fontSize: 15, color: '#C9D6EE' }}>{rec.sub}</span>
                    </div>
                    {rec.floor && (
                      <button
                        type="button"
                        onClick={() => openFloor(rec.floor!.n)}
                        style={{
                          minHeight: 44,
                          padding: '0 16px',
                          borderRadius: 10,
                          border: 'none',
                          background: GREEN,
                          color: '#0B1B3A',
                          fontWeight: 900,
                          fontSize: 15,
                          cursor: 'pointer',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        Show floor {rec.floor.n}
                      </button>
                    )}
                  </div>
                )}
              </div>
            )}

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16, alignItems: 'flex-start' }}>
              {showList && (
                <div style={{ flex: '1 1 440px', minWidth: 0, display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <div aria-hidden="true" style={{ display: 'flex', gap: 16, padding: '0 20px', ...label(12, { color: '#9FB3DA' }) }}>
                    <span style={{ width: 40 }}>FLOOR</span>
                    <span style={{ flex: 1 }}>VIBE + OCCUPANCY</span>
                    <span>SEATS FREE</span>
                  </div>
                  {!live.loaded && (
                    <p style={{ margin: 0, padding: '18px 20px', borderRadius: 12, background: '#19356B', color: '#C9D6EE' }}>
                      {live.status === 'offline' ? 'Cannot reach the LUMEN server. Retrying…' : 'Connecting to LUMEN…'}
                    </p>
                  )}
                  {floors.map((f) => (
                    <FloorRow
                      key={f.n}
                      f={f}
                      selected={!isPhone && f.n === selected?.n}
                      need={need}
                      isPhone={isPhone}
                      onPick={() => openFloor(f.n)}
                      buttonRef={(el) => {
                        if (el) rowRefs.current.set(f.n, el);
                        else rowRefs.current.delete(f.n);
                      }}
                    />
                  ))}
                  <span style={{ padding: '6px 4px 0', ...label(12, { letterSpacing: '0.04em', color: '#9FB3DA' }) }}>
                    Tap a floor for details. Counts refresh every few seconds.
                  </span>
                </div>
              )}

              {showDetail && selected && (
                <FloorDetail
                  f={selected}
                  floors={floors}
                  elev={elev}
                  isPhone={isPhone}
                  backRef={backRef}
                  onBack={closeDetail}
                />
              )}
            </div>
          </section>

          {showDetail && selected && (
            <section
              id="floor-theme-panel"
              className="floors-section floor-theme-section"
              data-floor={selected.n}
              data-floor-theme={theme.nickname}
              aria-label={`Floor ${selected.n}, ${theme.nickname} peak hours and floor plan`}
              style={{
                position: 'relative',
                overflow: 'hidden',
                marginTop: 16,
                background: theme.sectionBg,
                border: `1px solid ${theme.sectionBorder}`,
                boxShadow: theme.sectionShadow,
                borderRadius: 22,
                padding: 20,
                display: 'flex',
                flexDirection: 'column',
                gap: 16,
                transition: 'border-color 0.45s ease, box-shadow 0.45s ease',
              }}
            >
              <FloorBackdrop activeFloor={activeFloor} />
              <div style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'baseline', justifyContent: 'space-between', gap: '6px 16px' }}>
                  <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'baseline', gap: '8px 12px' }}>
                    <h2 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 900, textShadow: theme.textShadow }}>
                      Floor {selected.n} · {theme.nickname}
                    </h2>
                    <span
                      style={{
                        ...label(11.5, { color: theme.badgeText, fontWeight: 700, letterSpacing: '0.06em' }),
                        padding: '3px 10px',
                        borderRadius: 999,
                        border: `1px solid ${theme.badgeBorder}`,
                        background: theme.badgeBg,
                        backdropFilter: 'blur(8px)',
                        WebkitBackdropFilter: 'blur(8px)',
                      }}
                    >
                      SLC LEVEL {selected.n}
                    </span>
                  </div>
                  <span style={{ fontSize: 14, color: theme.muted, textShadow: theme.textShadow }}>{theme.tagline}</span>
                </div>

                <PeakHoursCharts floor={selected.n} seats={selected.cap} compact={isPhone} theme={theme} />

                <FloorPlan floor={selected.n} compact={isPhone} theme={theme} />
              </div>
            </section>
          )}

          <section style={{ padding: '72px 0 24px', display: 'flex', flexDirection: 'column', gap: 28 }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14, maxWidth: '46rem' }}>
              <span style={label(13, { letterSpacing: '0.14em', color: GOLD })}>WHY LUMEN</span>
              <h2 style={{ margin: 0, fontSize: 'clamp(2rem, 4vw, 3rem)', fontWeight: 900, lineHeight: 1.05 }}>One screen. Every floor.</h2>
              <p style={{ margin: 0, fontSize: '1.125rem', lineHeight: 1.55, color: '#C9D6EE' }}>
                Right now, SLC students can't see which floors have open seats or the right vibe until they ride there. So they
                crowd the elevators and lose 5–15 minutes of every break searching.
              </p>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16 }}>
              <Stat big="1" unit="glance" color={GOLD}>
                Every floor, one screen. Seats and vibe for floors 2 to 8, in the lobby or on your phone.
              </Stat>
              <Stat big="1" unit="ride" color={GOLD}>
                Straight to the right floor. No more stopping at every floor just to look around.
              </Stat>
              <Stat big="5–15" unit="min back" color={GREEN}>
                Every break. That's the time students told us they lose hunting for a seat.
              </Stat>
            </div>
          </section>

          <section
            style={{
              marginTop: 24,
              display: 'flex',
              flexWrap: 'wrap',
              gap: 32,
              alignItems: 'center',
              padding: 32,
              background: '#0A2150',
              border: '1px solid rgba(117,173,234,0.22)',
              borderRadius: 22,
            }}
          >
            <div style={{ flex: '1 1 340px', minWidth: 0, display: 'flex', flexDirection: 'column', gap: 12 }}>
              <span style={label(13, { letterSpacing: '0.14em', color: GOLD })}>HOW IT COUNTS</span>
              <h2 style={{ margin: 0, fontSize: 'clamp(2rem, 4vw, 3rem)', fontWeight: 900, lineHeight: 1.05 }}>Counts people, not faces.</h2>
              <p style={{ margin: 0, fontSize: '1.0625rem', lineHeight: 1.55, color: '#C9D6EE' }}>
                Infrared counters at each floor's entrance add one when someone walks in and subtract one when they walk out. Seats
                free is the floor's capacity minus the people on it. No cameras, no images, no accounts.
              </p>
              <Link
                to="/hardware"
                style={{
                  alignSelf: 'flex-start',
                  display: 'inline-flex',
                  alignItems: 'center',
                  minHeight: 44,
                  padding: '0 18px',
                  borderRadius: 10,
                  background: GOLD,
                  color: '#0B1B3A',
                  fontWeight: 900,
                  fontSize: 15,
                  textDecoration: 'none',
                }}
              >
                See the hardware plan →
              </Link>
            </div>
            <ul style={{ flex: '1 1 340px', minWidth: 0, listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: 12 }}>
              <HowItem
                title="Infrared entry and exit counters"
                text="In +1 and out −1 at every floor door, so the count stays live."
                icon={
                  <>
                    <path d="M5 21V4h9v17" />
                    <path d="M3 21h18" />
                    <path d="M17 9h4" />
                    <path d="M19 7l2 2-2 2" />
                    <path d="M11 13h.01" />
                  </>
                }
              />
              <HowItem
                title="Decibel-only noise sensors"
                text="A sound level, never a recording. No audio is kept."
                icon={
                  <>
                    <path d="M4 14v-4" />
                    <path d="M8 17V7" />
                    <path d="M12 20V4" />
                    <path d="M16 16V8" />
                    <path d="M20 13v-2" />
                  </>
                }
              />
              <HowItem
                title="Same data, three places"
                text="The lobby screen, this site, and a screen on every floor."
                icon={
                  <>
                    <rect x="2" y="4" width="13" height="10" rx="2" />
                    <rect x="17" y="8" width="5" height="12" rx="1.5" />
                    <path d="M6 18h5" />
                    <path d="M8.5 14v4" />
                  </>
                }
              />
            </ul>
          </section>

          <section style={{ padding: '64px 0 24px', display: 'flex', flexDirection: 'column', gap: 20 }}>
            <h2 style={{ margin: 0, fontSize: 'clamp(1.75rem, 3vw, 2.25rem)', fontWeight: 900 }}>See it around the SLC</h2>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16 }}>
              <ScreenCard to="/lobby" kicker="FLOOR 1 · BY THE ELEVATORS" title="Lobby display">
                Every floor on one screen, with the elevator wait and a QR code.
              </ScreenCard>
              <ScreenCard to="/mobile" kicker="ANYWHERE · SCAN ONCE" title="On your phone">
                Pick a floor, then see seats, noise and zones before you leave class.
              </ScreenCard>
              <ScreenCard to="/floor/7" kicker="EVERY FLOOR" title="Floor screens">
                Occupancy, study zones and a floor map, right where you step out.
              </ScreenCard>
            </div>
          </section>
        </main>

        <footer
          style={{
            marginTop: 40,
            paddingTop: 24,
            borderTop: '1px solid rgba(117,173,234,0.2)',
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            gap: 16,
          }}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <span style={{ fontSize: 22, fontWeight: 900, color: '#75ADEA', letterSpacing: '0.02em' }}>LUMEN</span>
            <span style={label(11, { letterSpacing: '0.08em' })}>
              A STUDENT DESIGN CONCEPT FOR THE SLC{live.simulated ? ' · SAMPLE DATA' : ''}
            </span>
          </div>
          <p style={{ margin: 0, maxWidth: '38rem', fontSize: 13, lineHeight: 1.55, color: '#C9D6EE' }}>
            CEN100 Engineering Innovation Challenge, Fall 2026. Vathusan Udayakumaran, Aisha Salek, Yusuf Siddiqui, Dilan
            Sellathurai, Aarav Rajanikanthan, Iunos Valizada, Namirah Tasniim, Shanthosh Suthaharan, Stavan Shelat.
          </p>
        </footer>
      </div>
    </div>
  );
}

function FloorRow({
  f,
  selected,
  need,
  isPhone,
  onPick,
  buttonRef,
}: {
  f: Floor;
  selected: boolean;
  need: Need;
  isPhone: boolean;
  onPick: () => void;
  buttonRef: (el: HTMLButtonElement | null) => void;
}) {
  const full = f.free === 0;
  const c = seatColor(f.free);
  const lit = litSegments(f);
  const st = f.stale;
  const bg = st ? STALE.bg : full ? (selected ? '#3D2F5A' : '#2F284F') : selected ? '#1D4A6E' : '#19356B';
  const border = st ? STALE.border : selected ? (full ? RED : c) : full ? RED : 'transparent';
  const segColor = st ? STALE.seg : c;
  const numColor = st ? STALE.text : full ? RED_TEXT : c;
  const match = need !== 'All' && f.vibe === need;
  const aria =
    `Floor ${f.n}, ${f.vibe}, ` +
    (full ? 'full' : seatsFreeText(f.free)) +
    (st ? `. ${lastUpdatedText(f.ageS)}` : '') +
    (isPhone ? '. Show details' : '');
  return (
    <button
      ref={buttonRef}
      type="button"
      className="lu-row floor-row"
      aria-pressed={isPhone ? undefined : selected}
      aria-label={aria}
      onClick={onPick}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 16,
        width: '100%',
        boxSizing: 'border-box',
        padding: '12px 18px',
        borderRadius: 12,
        border: `2px ${st ? 'dashed' : 'solid'} ${border}`,
        background: bg,
        color: '#FFFFFF',
        textAlign: 'left',
        cursor: 'pointer',
      }}
    >
      <span style={{ width: 40, flex: 'none', fontSize: 36, fontWeight: 900, lineHeight: 1 }}>{f.n}</span>
      <span style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 8 }}>
        <span style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 8 }}>
          <span style={{ fontFamily: MONO, fontSize: 14, fontWeight: 700, letterSpacing: '0.06em' }}>{f.vibe.toUpperCase()}</span>
          {match && (
            <span
              style={{
                fontFamily: MONO,
                fontSize: 10,
                fontWeight: 700,
                letterSpacing: '0.06em',
                background: GOLD,
                color: '#0B1B3A',
                padding: '2px 6px',
                borderRadius: 4,
              }}
            >
              YOUR VIBE
            </span>
          )}
          {st && (
            <span
              style={{
                fontFamily: MONO,
                fontSize: 10,
                fontWeight: 700,
                letterSpacing: '0.06em',
                border: `1px solid ${STALE.text}`,
                color: STALE.text,
                padding: '1px 6px',
                borderRadius: 4,
              }}
            >
              NO SIGNAL
            </span>
          )}
          <span style={{ fontSize: 13, color: st ? STALE.text : selected ? '#C9D6EE' : '#9FB3DA' }}>{statusWord(f)}</span>
        </span>
        <span aria-hidden="true" style={{ display: 'flex', gap: 4, maxWidth: 320 }}>
          {Array.from({ length: 14 }, (_, i) => (
            <span key={i} style={{ flex: 1, height: 9, borderRadius: 3, background: i < lit ? segColor : EMPTY }} />
          ))}
        </span>
      </span>
      <span
        style={{
          flex: 'none',
          minWidth: 64,
          textAlign: 'right',
          fontSize: 34,
          fontWeight: 900,
          lineHeight: 1,
          color: numColor,
          fontVariantNumeric: 'tabular-nums',
        }}
      >
        {full ? 'FULL' : f.free}
      </span>
    </button>
  );
}

function FloorDetail({
  f,
  floors,
  elev,
  isPhone,
  backRef,
  onBack,
}: {
  f: Floor;
  floors: Floor[];
  elev: number | null;
  isPhone: boolean;
  backRef: React.RefObject<HTMLButtonElement | null>;
  onBack: () => void;
}) {
  const full = f.free === 0;
  const st = f.stale;
  const accent = st ? STALE.text : full ? RED_TEXT : seatColor(f.free);
  const accentBg = st
    ? 'rgba(107,123,160,0.12)'
    : full
      ? 'rgba(242,94,94,0.12)'
      : accent === GOLD
        ? 'rgba(244,182,1,0.10)'
        : 'rgba(61,219,150,0.10)';
  const best = pickFor('All', floors.filter((x) => x.n !== f.n));
  const meter = f.db === null ? null : noiseMeter(f.db);
  const stairs = stairsMin(f.n);
  const bestZone = bestZoneIndex(f.zones);
  return (
    <aside
      aria-label={`Floor ${f.n} details`}
      className="floor-detail"
      style={{
        flex: '1 1 360px',
        minWidth: 0,
        boxSizing: 'border-box',
        background: '#132952',
        border: '1px solid rgba(117,173,234,0.22)',
        borderRadius: 18,
        padding: 20,
        display: 'flex',
        flexDirection: 'column',
        gap: 12,
      }}
    >
      {isPhone && (
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
            fontFamily: MONO,
            fontSize: 15,
            fontWeight: 700,
            letterSpacing: '0.04em',
            cursor: 'pointer',
          }}
        >
          ‹ ALL FLOORS
        </button>
      )}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
        <h3 className="detail-title" style={{ margin: 0, fontSize: 44, fontWeight: 900, lineHeight: 1 }}>
          Floor {f.n}
        </h3>
        <span
          style={{
            padding: '6px 14px',
            borderRadius: 999,
            background: VIBE_PILL[f.vibe],
            color: '#0B1B3A',
            fontFamily: MONO,
            fontSize: 14,
            fontWeight: 700,
            letterSpacing: '0.06em',
          }}
        >
          {f.vibe.toUpperCase()}
        </span>
      </div>

      {st && (
        <div
          role="status"
          style={{ padding: '12px 16px', borderRadius: 12, border: `2px dashed ${STALE.border}`, background: STALE.bg, display: 'flex', flexDirection: 'column', gap: 4 }}
        >
          <span style={{ fontSize: 16, fontWeight: 700 }}>{lastUpdatedText(f.ageS)}</span>
          <span style={{ fontSize: 14, color: '#C9D6EE' }}>
            This floor's sensors are not reporting. The numbers below are the last ones we received.
          </span>
        </div>
      )}

      <div style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '14px 18px', borderRadius: 16, border: `2px solid ${accent}`, background: accentBg }}>
        <span style={{ fontSize: 64, fontWeight: 900, lineHeight: 0.9, color: accent, fontVariantNumeric: 'tabular-nums' }}>
          {full ? 'FULL' : f.free}
        </span>
        <span style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <span style={{ fontSize: 22, fontWeight: 700 }}>{full ? 'Skip this floor' : f.free === 1 ? 'seat free' : 'seats free'}</span>
          <span style={{ fontSize: 16, color: '#C9D6EE' }}>
            {full
              ? best
                ? `Try floor ${best.n}: ${seatsFreeText(best.free)}.`
                : 'Every floor is busy right now.'
              : `of ${f.cap} on this floor`}
          </span>
        </span>
      </div>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
        <div style={{ flex: '1 1 150px', display: 'flex', flexDirection: 'column', gap: 6, padding: '12px 14px', background: '#19356B', borderRadius: 14 }}>
          <span style={label(12)}>NOISE LEVEL</span>
          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 10 }}>
            <span style={{ fontSize: 30, fontWeight: 900, lineHeight: 1 }}>{f.db === null ? '–' : `${f.db} dB`}</span>
            {meter && (
              <span aria-hidden="true" style={{ display: 'flex', alignItems: 'flex-end', gap: 3 }}>
                {Array.from({ length: 10 }, (_, j) => (
                  <span
                    key={j}
                    style={{
                      width: 6,
                      height: Math.round(8 + j * 2.2),
                      borderRadius: 2,
                      background: j < meter.lit ? (st ? STALE.seg : meter.color) : '#2E4A7E',
                    }}
                  />
                ))}
              </span>
            )}
          </div>
          <span style={{ fontSize: 13, color: '#C9D6EE' }}>{f.db === null ? 'No reading yet' : dbWord(f.db)}</span>
        </div>
        <div style={{ flex: '1 1 150px', display: 'flex', flexDirection: 'column', gap: 6, padding: '12px 14px', background: '#19356B', borderRadius: 14 }}>
          <span style={label(12)}>GETTING THERE</span>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
            <span style={{ fontSize: 15 }}>Elevator</span>
            <span style={{ fontSize: 22, fontWeight: 900, color: GOLD }}>{elev === null ? '…' : `~${elev} min`}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 15 }}>
              Stairs
              {elev !== null && stairs < elev && (
                <span
                  style={{ fontFamily: MONO, fontSize: 10, fontWeight: 700, background: GREEN, color: '#0B1B3A', padding: '2px 6px', borderRadius: 4 }}
                >
                  FASTER
                </span>
              )}
            </span>
            <span style={{ fontSize: 22, fontWeight: 900, color: GREEN }}>~{stairs} min</span>
          </div>
        </div>
      </div>

      {f.zones.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <span style={label(12)}>
            ZONES <span style={{ color: '#9FB3DA' }}>· ESTIMATED</span>
          </span>
          {f.zones.map((z) => {
            const [word, color] = zoneStatus(z.pct);
            return (
              <div key={z.name} style={{ display: 'flex', alignItems: 'center', gap: 10, minHeight: 30 }}>
                <span aria-hidden="true" style={{ width: 10, height: 10, borderRadius: '50%', flex: 'none', background: color }} />
                <span style={{ flex: 1, fontSize: 16 }}>{z.name}</span>
                <span style={{ fontSize: 16, fontWeight: 700, fontVariantNumeric: 'tabular-nums' }}>{z.pct}%</span>
                <span
                  style={{
                    minWidth: 84,
                    textAlign: 'center',
                    padding: '3px 10px',
                    borderRadius: 999,
                    background: color,
                    color: '#0B1B3A',
                    fontFamily: MONO,
                    fontSize: 12,
                    fontWeight: 700,
                  }}
                >
                  {word}
                </span>
              </div>
            );
          })}
        </div>
      )}

      {f.zones.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'baseline', justifyContent: 'space-between', gap: 8 }}>
            <span style={label(12)}>FLOOR MAP</span>
            <span style={{ fontSize: 12, color: '#C9D6EE' }}>Gold outline: best spot right now</span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 8 }}>
            {mapOrder(f.zones).map((k) => {
              const z = f.zones[k];
              const isBest = k === bestZone;
              return (
                <div
                  key={z.name}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    gap: 2,
                    minHeight: 50,
                    padding: '8px 12px',
                    borderRadius: 10,
                    background: ZONE_TILE[k % ZONE_TILE.length],
                    border: `3px solid ${isBest ? GOLD : 'transparent'}`,
                  }}
                >
                  <span style={{ fontSize: 15, fontWeight: 700 }}>
                    {z.name}
                    {isBest && <span className="sr-only"> (best spot right now)</span>}
                  </span>
                  <span style={{ fontSize: 13 }}>{z.pct}% full</span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </aside>
  );
}

function Stat({ big, unit, color, children }: { big: string; unit: string; color: string; children: React.ReactNode }) {
  return (
    <div
      style={{
        flex: '1 1 260px',
        display: 'flex',
        flexDirection: 'column',
        gap: 10,
        padding: 24,
        background: '#122851',
        border: '1px solid rgba(117,173,234,0.2)',
        borderRadius: 16,
      }}
    >
      <span style={{ display: 'flex', alignItems: 'baseline', gap: 10 }}>
        <span style={{ fontSize: 64, fontWeight: 900, lineHeight: 1, color }}>{big}</span>
        <span style={{ fontSize: 24, fontWeight: 700 }}>{unit}</span>
      </span>
      <span style={{ fontSize: 16, lineHeight: 1.5, color: '#C9D6EE' }}>{children}</span>
    </div>
  );
}

function HowItem({ title, text, icon }: { title: string; text: string; icon: React.ReactNode }) {
  return (
    <li style={{ display: 'flex', gap: 14, alignItems: 'flex-start', padding: 16, background: '#122851', borderRadius: 14 }}>
      <svg
        width="28"
        height="28"
        viewBox="0 0 24 24"
        fill="none"
        stroke="#75ADEA"
        aria-hidden="true"
        style={{ flex: 'none', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round' }}
      >
        {icon}
      </svg>
      <span style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        <span style={{ fontSize: 17, fontWeight: 700 }}>{title}</span>
        <span style={{ fontSize: 15, lineHeight: 1.45, color: '#C9D6EE' }}>{text}</span>
      </span>
    </li>
  );
}

function ScreenCard({ to, kicker, title, children }: { to: string; kicker: string; title: string; children: React.ReactNode }) {
  return (
    <Link
      to={to}
      className="lu-card"
      style={{
        flex: '1 1 260px',
        display: 'flex',
        flexDirection: 'column',
        gap: 8,
        padding: 22,
        background: '#122851',
        border: '1px solid rgba(117,173,234,0.22)',
        borderRadius: 16,
        color: '#FFFFFF',
        textDecoration: 'none',
      }}
    >
      <span style={label(12, { letterSpacing: '0.08em', color: GOLD })}>{kicker}</span>
      <span style={{ fontSize: 22, fontWeight: 900 }}>{title}</span>
      <span style={{ fontSize: 15, lineHeight: 1.45, color: '#C9D6EE' }}>{children}</span>
      <span style={{ fontSize: 15, fontWeight: 700, color: '#75ADEA' }}>Open screen →</span>
    </Link>
  );
}
