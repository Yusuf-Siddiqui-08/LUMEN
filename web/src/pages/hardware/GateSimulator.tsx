import { useEffect, useRef, useState } from 'react';
import { MONO } from '../../lib/logic';

/**
 * "Try it: walk through the gate". Same states and timing as the prototype:
 * five steps, 520 ms apart, then the running totals the node would advertise.
 */
const CAPACITY = 60;
const POS_IN = [15, 40, 50, 60, 85];
const BEAMS_IN = [
  [0, 0],
  [1, 0],
  [1, 1],
  [0, 1],
  [0, 0],
];
const PHASE_IN = ['Ready. Both beams on.', 'Beam A broken (hallway side)', 'Both beams broken', 'Only beam B broken', 'Clear: A first, B last. +1 IN'];
const BEAMS_OUT = [
  [0, 0],
  [0, 1],
  [1, 1],
  [1, 0],
  [0, 0],
];
const PHASE_OUT = ['Ready. Both beams on.', 'Beam B broken (floor side)', 'Both beams broken', 'Only beam A broken', 'Clear: B first, A last. +1 OUT'];
const POS_BACK = [15, 40, 50, 40, 15];
const BEAMS_BACK = [
  [0, 0],
  [1, 0],
  [1, 1],
  [1, 0],
  [0, 0],
];
const PHASE_BACK = [
  'Ready. Both beams on.',
  'Beam A broken (hallway side)',
  'Both beams broken',
  'Backing out: only A broken',
  'Clear: A first, A last. Turned back, no count',
];

type Mode = 'in' | 'out' | 'back';

function beam(blocked: boolean) {
  return blocked ? { color: '#3A2F55', glow: 'none' } : { color: '#FF6B6B', glow: '0 0 12px rgba(255,107,107,0.85)' };
}

const btn = {
  minHeight: 44,
  padding: '0 18px',
  borderRadius: 10,
  border: 'none',
  color: '#0B1B3A',
  fontWeight: 900,
  fontSize: 15,
  cursor: 'pointer',
} as const;

export default function GateSimulator() {
  const [mode, setMode] = useState<Mode>('in');
  const [step, setStep] = useState(0);
  const [busy, setBusy] = useState(false);
  const [phase, setPhase] = useState('Ready. Both beams on.');
  const [counts, setCounts] = useState({ inC: 1240, outC: 1202, seq: 18342 });
  const timers = useRef<number[]>([]);

  useEffect(() => () => timers.current.forEach((t) => window.clearTimeout(t)), []);

  const run = (m: Mode) => {
    if (busy) return;
    const phases = m === 'in' ? PHASE_IN : m === 'out' ? PHASE_OUT : PHASE_BACK;
    setMode(m);
    setBusy(true);
    setStep(0);
    setPhase(phases[0]);
    [1, 2, 3, 4].forEach((s) => {
      timers.current.push(
        window.setTimeout(() => {
          setStep(s);
          setPhase(phases[s]);
          if (s === 4) {
            setBusy(false);
            setCounts((c) => ({
              seq: c.seq + 1,
              inC: m === 'in' ? c.inC + 1 : c.inC,
              outC: m === 'out' ? c.outC + 1 : c.outC,
            }));
          }
        }, s * 520),
      );
    });
  };

  const pos = mode === 'out' ? POS_IN.slice().reverse() : mode === 'back' ? POS_BACK : POS_IN;
  const beams = mode === 'out' ? BEAMS_OUT : mode === 'back' ? BEAMS_BACK : BEAMS_IN;
  const b = beams[step];
  const beamA = beam(b[0] === 1);
  const beamB = beam(b[1] === 1);
  const seats = Math.max(0, CAPACITY - (counts.inC - counts.outC));
  const lastMsg = `lumen/slc/f7/gate/elevator  seq ${counts.seq}  in_total ${counts.inC}  out_total ${counts.outC}`;

  const statLabel = { fontFamily: MONO, fontSize: 11, color: '#C9D6EE' } as const;
  const statBox = { display: 'flex', flexDirection: 'column', gap: 4, padding: 12, background: '#19356B', borderRadius: 12 } as const;

  return (
    <div
      style={{
        padding: 24,
        background: '#0A2150',
        border: '1px solid rgba(117,173,234,0.22)',
        borderRadius: 18,
        display: 'flex',
        flexDirection: 'column',
        gap: 16,
      }}
    >
      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <h3 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 900 }}>Try it: walk through the gate</h3>
          <span style={{ fontSize: 15, color: '#C9D6EE' }}>Watch the beams break in order, then see the count the node would send.</span>
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          <button type="button" onClick={() => run('in')} disabled={busy} style={{ ...btn, background: '#3DDB96' }}>
            Walk in →
          </button>
          <button type="button" onClick={() => run('out')} disabled={busy} style={{ ...btn, background: '#75ADEA' }}>
            ← Walk out
          </button>
          <button
            type="button"
            onClick={() => run('back')}
            disabled={busy}
            style={{ ...btn, border: '1px solid rgba(117,173,234,0.45)', background: 'transparent', color: '#FFFFFF', fontWeight: 700 }}
          >
            Step in, turn back
          </button>
        </div>
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16, alignItems: 'stretch' }}>
        <div style={{ flex: '3 1 420px', minWidth: 0, position: 'relative', height: 180, borderRadius: 14, background: '#122851', overflow: 'hidden' }}>
          <span style={{ position: 'absolute', left: 16, top: 12, fontFamily: MONO, fontSize: 12, fontWeight: 700, color: '#C9D6EE' }}>HALLWAY</span>
          <span style={{ position: 'absolute', right: 16, top: 12, fontFamily: MONO, fontSize: 12, fontWeight: 700, color: '#C9D6EE' }}>FLOOR 7</span>
          <span
            className="hw-beam"
            style={{ position: 'absolute', left: '45%', top: 30, bottom: 30, width: 4, marginLeft: -2, borderRadius: 2, background: beamA.color, boxShadow: beamA.glow }}
          />
          <span
            className="hw-beam"
            style={{ position: 'absolute', left: '55%', top: 30, bottom: 30, width: 4, marginLeft: -2, borderRadius: 2, background: beamB.color, boxShadow: beamB.glow }}
          />
          <span style={{ position: 'absolute', left: '45%', bottom: 8, transform: 'translateX(-50%)', fontFamily: MONO, fontSize: 12, fontWeight: 700 }}>A</span>
          <span style={{ position: 'absolute', left: '55%', bottom: 8, transform: 'translateX(-50%)', fontFamily: MONO, fontSize: 12, fontWeight: 700 }}>B</span>
          <span
            className={step > 0 ? 'hw-person' : ''}
            aria-hidden="true"
            style={{
              position: 'absolute',
              top: '50%',
              left: `${pos[step]}%`,
              width: 52,
              height: 92,
              transform: 'translate(-50%, -50%)',
              borderRadius: 26,
              background: '#75ADEA',
              border: '3px solid #0A2150',
            }}
          />
        </div>
        <div style={{ flex: '2 1 280px', minWidth: 0, display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: 8 }}>
            <div style={statBox}>
              <span style={statLabel}>IN TOTAL</span>
              <span style={{ fontSize: 26, fontWeight: 900, color: '#3DDB96', fontVariantNumeric: 'tabular-nums' }}>{counts.inC}</span>
            </div>
            <div style={statBox}>
              <span style={statLabel}>OUT TOTAL</span>
              <span style={{ fontSize: 26, fontWeight: 900, color: '#75ADEA', fontVariantNumeric: 'tabular-nums' }}>{counts.outC}</span>
            </div>
            <div style={statBox}>
              <span style={statLabel}>SEATS FREE</span>
              <span style={{ fontSize: 26, fontWeight: 900, color: '#F4B601', fontVariantNumeric: 'tabular-nums' }}>{seats}</span>
            </div>
          </div>
          <span aria-live="polite" style={{ fontSize: 16, fontWeight: 700 }}>
            {phase}
          </span>
          <code
            tabIndex={0}
            style={{
              display: 'block',
              padding: '10px 12px',
              borderRadius: 10,
              background: '#071A40',
              color: '#C9D6EE',
              fontFamily: MONO,
              fontSize: 12,
              lineHeight: 1.5,
              overflowX: 'auto',
              whiteSpace: 'nowrap',
            }}
          >
            {lastMsg}
          </code>
        </div>
      </div>
    </div>
  );
}
