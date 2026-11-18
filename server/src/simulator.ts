import type { FloorConfig, LumenConfig } from './config.js';

/**
 * SIMULATE=1: fake gate nodes, noise nodes and floor hubs, running in-process.
 * They publish the exact topics and payloads real hardware would, through the
 * same ingest path (or through the broker, when MQTT_URL is also set).
 *
 * People walk in and out at random, drifting around each floor's sample
 * occupancy from the floors config. Floor 4's sample is "full", so it stays
 * at or just over capacity most of the time.
 */

export type Publish = (topic: string, payload: string) => void;

export interface SimOptions {
  /** Floors whose hub goes quiet after silentAfterMs, to demo stale screens. */
  silentFloors?: number[];
  silentAfterMs?: number;
  tickMs?: number;
  rng?: () => number;
  setElevatorWait?: (min: number) => void;
}

interface SimGate {
  name: string;
  node: string;
  share: number; // chance a crossing uses this door
  inTotal: number;
  outTotal: number;
  seq: number;
  dirty: boolean;
  sinceSend: number;
}

interface SimMic {
  name: string;
  node: string;
  offset: number;
  seq: number;
}

interface SimFloor {
  cfg: FloorConfig;
  people: number;
  baseTarget: number;
  phase: number;
  drift: number;
  gates: SimGate[];
  mics: SimMic[];
  baseDb: number;
}

const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));

export function startSimulator(cfg: LumenConfig, publish: Publish, opts: SimOptions = {}) {
  const rng = opts.rng ?? Math.random;
  const tickMs = opts.tickMs ?? 1000;
  const silent = new Set(opts.silentFloors ?? []);
  const silentAfterMs = opts.silentAfterMs ?? 30_000;
  const site = cfg.site.code;
  const startedAt = Date.now();
  const randInt = (lo: number, hi: number) => lo + Math.floor(rng() * (hi - lo + 1));

  const floors: SimFloor[] = cfg.floors.map((f) => {
    const sampleFree = f.simulator?.seats_free ?? Math.round(f.capacity * 0.4);
    // A "full" sample floor sits a few people over capacity (people standing, waiting
    // for a seat) so it reads FULL most of the time and only now and then frees a seat.
    const full = sampleFree === 0;
    const target = full ? f.capacity + 3 : f.capacity - sampleFree;
    const gateCount = Math.max(1, f.gates.length);
    const gates: SimGate[] = f.gates.map((g, i) => ({
      name: g.name,
      node: g.node,
      share: i === 0 ? (gateCount === 1 ? 1 : 0.7) : 0.3 / (gateCount - 1),
      inTotal: 0,
      outTotal: 0,
      seq: randInt(1000, 20000),
      dirty: true,
      sinceSend: 0,
    }));
    // Split today's people across the doors, on top of a long running history.
    let left = target;
    gates.forEach((g, i) => {
      const net = i === gates.length - 1 ? left : Math.round(target * g.share);
      left -= net;
      g.inTotal = randInt(600, 1500) + Math.max(0, net);
      g.outTotal = g.inTotal - net;
    });
    const mics: SimMic[] = f.mics.map((m, i) => ({
      name: m.name,
      node: m.node,
      offset: f.mics.length === 1 ? 0 : i === 0 ? -2.5 : 2.5,
      seq: randInt(1000, 9000),
    }));
    return {
      cfg: f,
      people: target,
      baseTarget: target,
      phase: rng() * Math.PI * 2,
      drift: full ? 1 : 3,
      gates,
      mics,
      baseDb: f.simulator?.noise_db ?? 50,
    };
  });

  const topic = (n: number, kind: string, name: string) => `lumen/${site}/f${n}/${kind}/${name}`;

  const sendGate = (f: SimFloor, g: SimGate) => {
    g.seq = (g.seq + 1) % 65536;
    g.dirty = false;
    g.sinceSend = 0;
    publish(
      topic(f.cfg.floor, 'gate', g.name),
      JSON.stringify({ node: g.node, seq: g.seq, in_total: g.inTotal, out_total: g.outTotal, flags: [], rssi: -randInt(55, 72) }),
    );
  };

  const sendMic = (f: SimFloor, m: SimMic) => {
    m.seq = (m.seq + 1) % 65536;
    const leq = Math.round((f.baseDb + m.offset + (rng() - 0.5) * 2.4) * 10) / 10;
    const peak = Math.round((leq + 8 + rng() * 7) * 10) / 10;
    publish(topic(f.cfg.floor, 'noise', m.name), JSON.stringify({ node: m.node, seq: m.seq, leq_db: leq, peak_db: peak, window_s: 60 }));
  };

  const sendHub = (f: SimFloor) => {
    publish(
      topic(f.cfg.floor, 'hub', 'status'),
      JSON.stringify({ status: 'online', uptime_s: Math.round((Date.now() - startedAt) / 1000), nodes: f.gates.length + f.mics.length }),
    );
  };

  const isSilent = (f: SimFloor) => silent.has(f.cfg.floor) && Date.now() - startedAt > silentAfterMs;

  // Everyone reports straight away so the screens fill in at once.
  for (const f of floors) {
    sendHub(f);
    f.gates.forEach((g) => sendGate(f, g));
    f.mics.forEach((m) => sendMic(f, m));
  }

  let tick = 0;
  const waits = [5, 6, 6, 6, 7];
  const timer = setInterval(() => {
    tick++;
    const tSec = (tick * tickMs) / 1000;
    for (const f of floors) {
      if (isSilent(f)) continue;
      const cap = f.cfg.capacity;
      // Slow drift of a few people around the sample value.
      const target = f.baseTarget + Math.round(f.drift * Math.sin(tSec / 240 + f.phase));
      // On average one person crosses a floor's doors every 4 to 5 seconds.
      if (rng() < 0.22) {
        const pIn = clamp(0.5 + 0.12 * (target - f.people), 0.08, 0.92);
        const goingIn = f.people <= 0 ? true : f.people >= cap + 5 ? false : rng() < pIn;
        let r = rng();
        const g = f.gates.find((x) => (r -= x.share) < 0) ?? f.gates[0];
        if (g) {
          if (goingIn) g.inTotal++;
          else g.outTotal++;
          f.people += goingIn ? 1 : -1;
          g.dirty = true;
        }
      }
      for (const g of f.gates) {
        g.sinceSend += tickMs;
        // Hubs relay a gate when its totals change, and at least every 5 s anyway.
        if (g.dirty || g.sinceSend >= 5000) sendGate(f, g);
      }
      if (tick % 10 === 0) f.mics.forEach((m) => sendMic(f, m));
      if (tick % 30 === 0) sendHub(f);
    }
    if (tick % 30 === 0 && opts.setElevatorWait) opts.setElevatorWait(waits[Math.floor(rng() * waits.length)]);
  }, tickMs);
  timer.unref?.();

  return {
    stop: () => clearInterval(timer),
    /** Current simulated headcount per floor (for tests and logs). */
    people: () => Object.fromEntries(floors.map((f) => [f.cfg.floor, f.people])),
  };
}
