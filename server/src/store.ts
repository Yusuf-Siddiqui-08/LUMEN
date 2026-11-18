import { EventEmitter } from 'node:events';
import type { FloorConfig, LumenConfig, Vibe } from './config.js';
import {
  estimateZones,
  floorNoise,
  GateCounter,
  type GateMessage,
  type GateSnapshot,
  MicReading,
  type NoiseMessage,
  onFloor,
  seatsFree,
  staleState,
  type StaleReason,
} from './occupancy.js';
import { clockString } from './time.js';

export interface ZoneView {
  name: string;
  pct: number;
  estimated: true;
}

/** One floor, as served by GET /api/floors/:n and inside GET /api/floors. */
export interface FloorView {
  floor: number;
  vibe: Vibe;
  capacity: number;
  on_floor: number;
  seats_free: number;
  noise_db: number | null;
  /** Local time of the last message from this floor, "HH:MM:SS" in the site's time zone. */
  updated: string | null;
  updated_at: string | null;
  age_s: number | null;
  stale: boolean;
  stale_reason: StaleReason;
  zones: ZoneView[];
  elevator_wait_min: number;
  faults: string[];
}

export interface FloorsPayload {
  site: string;
  simulated: boolean;
  public_url: string | null;
  server_time: string;
  stale_after_s: number;
  elevator_wait_min: number;
  elevator_wait_estimated: true;
  floors: FloorView[];
}

export interface PersistedState {
  version: 1;
  last_reset_date: string | null;
  gates: GateSnapshot[];
}

interface FloorState {
  cfg: FloorConfig;
  gates: Map<string, GateCounter>;
  mics: Map<string, MicReading>;
  lastMessageAt: number | null;
  hubOnline: boolean | null;
}

export interface StoreOptions {
  now?: () => number;
  simulated?: boolean;
  log?: (msg: string) => void;
}

/**
 * Holds the live state of every floor. Ingest calls the handle* methods;
 * the API reads views. Emits "change" whenever something visible may have changed.
 */
export class LumenStore extends EventEmitter {
  readonly config: LumenConfig;
  readonly simulated: boolean;
  private readonly now: () => number;
  private readonly log: (msg: string) => void;
  private readonly floors = new Map<number, FloorState>();
  private readonly nodeToFloor = new Map<string, number>();
  private readonly warned = new Set<string>();
  elevatorWaitMin: number;
  lastResetDate: string | null = null;
  readonly stats = { accepted: 0, duplicate: 0, out_of_order: 0, reboot: 0, rejected: 0 };

  constructor(config: LumenConfig, opts: StoreOptions = {}) {
    super();
    this.config = config;
    this.simulated = Boolean(opts.simulated);
    this.now = opts.now ?? Date.now;
    this.log = opts.log ?? ((m) => console.log(m));
    this.elevatorWaitMin = config.elevator_wait_min;
    for (const f of config.floors) {
      const gates = new Map(f.gates.map((g) => [g.node, new GateCounter(g.node)]));
      const mics = new Map(f.mics.map((m) => [m.node, new MicReading(m.node)]));
      for (const id of [...gates.keys(), ...mics.keys()]) this.nodeToFloor.set(id, f.floor);
      this.floors.set(f.floor, { cfg: f, gates, mics, lastMessageAt: null, hubOnline: null });
    }
  }

  get staleAfterMs(): number {
    return this.config.stale_after_s * 1000;
  }

  floorNumbers(): number[] {
    return this.config.floors.map((f) => f.floor);
  }

  private warnOnce(key: string, msg: string): void {
    if (this.warned.has(key)) return;
    this.warned.add(key);
    this.log(`[lumen] ${msg}`);
  }

  private touch(fs: FloorState): void {
    fs.lastMessageAt = this.now();
    fs.hubOnline = true; // any message from the floor proves its hub is relaying
  }

  handleGate(floor: number, msg: GateMessage): boolean {
    const fs = this.floors.get(floor);
    const gate = fs?.gates.get(msg.node);
    if (!fs || !gate) {
      this.stats.rejected++;
      this.warnOnce(`gate:${floor}:${msg.node}`, `ignoring gate node "${msg.node}" on floor ${floor}: not in floors config`);
      return false;
    }
    const r = gate.apply(msg, this.now());
    this.stats[r === 'accepted' ? 'accepted' : r]++;
    if (r === 'duplicate' || r === 'out_of_order') return false;
    if (r === 'reboot') this.log(`[lumen] ${msg.node} totals went down: node restarted, re-baselined that gate`);
    this.touch(fs);
    this.emit('change', { floor, kind: 'gate', reboot: r === 'reboot' });
    return true;
  }

  handleNoise(floor: number, msg: NoiseMessage): boolean {
    const fs = this.floors.get(floor);
    const mic = fs?.mics.get(msg.node);
    if (!fs || !mic) {
      this.stats.rejected++;
      this.warnOnce(`mic:${floor}:${msg.node}`, `ignoring mic node "${msg.node}" on floor ${floor}: not in floors config`);
      return false;
    }
    const r = mic.apply(msg, this.now());
    this.stats[r === 'accepted' ? 'accepted' : r]++;
    if (r !== 'accepted') return false;
    this.touch(fs);
    this.emit('change', { floor, kind: 'noise' });
    return true;
  }

  /** Hub heartbeat ("online", or JSON with status) or its MQTT last will ("offline"). */
  handleHubStatus(floor: number, status: 'online' | 'offline'): boolean {
    const fs = this.floors.get(floor);
    if (!fs) {
      this.stats.rejected++;
      this.warnOnce(`hub:${floor}`, `ignoring hub status for floor ${floor}: not in floors config`);
      return false;
    }
    if (status === 'offline') {
      fs.hubOnline = false;
    } else {
      this.touch(fs);
    }
    this.emit('change', { floor, kind: 'hub' });
    return true;
  }

  setElevatorWait(min: number): void {
    if (min === this.elevatorWaitMin) return;
    this.elevatorWaitMin = min;
    this.emit('change', { kind: 'elevator' });
  }

  /** Nightly reset: every gate starts counting from its current totals. */
  nightlyReset(localDate: string | null): void {
    for (const fs of this.floors.values()) for (const g of fs.gates.values()) g.resetBaseline();
    this.lastResetDate = localDate;
    this.log(`[lumen] nightly reset done${localDate ? ` for ${localDate}` : ''}`);
    this.emit('change', { kind: 'reset' });
    this.emit('reset');
  }

  floorView(n: number): FloorView | null {
    const fs = this.floors.get(n);
    if (!fs) return null;
    const now = this.now();
    const gates = [...fs.gates.values()];
    const people = onFloor(gates);
    const st = staleState(fs.lastMessageAt, fs.hubOnline, now, this.staleAfterMs);
    // Median of mics heard recently; if every mic is quiet (a stale floor), the last known level.
    const mics = [...fs.mics.values()];
    const noise = floorNoise(mics, now, this.staleAfterMs) ?? floorNoise(mics, now, Number.POSITIVE_INFINITY);
    const faults = new Set<string>();
    for (const g of gates) for (const fl of g.flags) faults.add(`${g.node}:${fl}`);
    return {
      floor: n,
      vibe: fs.cfg.vibe,
      capacity: fs.cfg.capacity,
      on_floor: people,
      seats_free: seatsFree(fs.cfg.capacity, people),
      noise_db: noise === null ? null : Math.round(noise),
      updated: fs.lastMessageAt === null ? null : clockString(fs.lastMessageAt, this.config.timezone),
      updated_at: fs.lastMessageAt === null ? null : new Date(fs.lastMessageAt).toISOString(),
      age_s: fs.lastMessageAt === null ? null : Math.max(0, Math.round((now - fs.lastMessageAt) / 1000)),
      stale: st.stale,
      stale_reason: st.reason,
      zones: estimateZones(fs.cfg.zones, fs.cfg.zones_at_occupancy_pct, people, fs.cfg.capacity),
      elevator_wait_min: this.elevatorWaitMin,
      faults: [...faults],
    };
  }

  /** Per-node detail for debugging a floor (GET /api/floors/:n?nodes=1). */
  nodeDetail(n: number) {
    const fs = this.floors.get(n);
    if (!fs) return null;
    const iso = (t: number | null) => (t === null ? null : new Date(t).toISOString());
    return {
      gates: [...fs.gates.values()].map((g) => ({
        node: g.node,
        seq: g.lastSeq,
        in_total: g.inTotal,
        out_total: g.outTotal,
        net_since_reset: g.net(),
        last_seen: iso(g.lastSeen),
        flags: g.flags,
        rssi: g.rssi,
      })),
      mics: [...fs.mics.values()].map((m) => ({
        node: m.node,
        seq: m.lastSeq,
        leq_db: m.leqDb,
        peak_db: m.peakDb,
        last_seen: iso(m.lastSeen),
      })),
      hub_online: fs.hubOnline,
    };
  }

  floorViews(): FloorView[] {
    return this.floorNumbers().map((n) => this.floorView(n) as FloorView);
  }

  payload(): FloorsPayload {
    return {
      site: this.config.site.name,
      simulated: this.simulated,
      public_url: this.config.site.public_url,
      server_time: new Date(this.now()).toISOString(),
      stale_after_s: this.config.stale_after_s,
      elevator_wait_min: this.elevatorWaitMin,
      elevator_wait_estimated: true,
      floors: this.floorViews(),
    };
  }

  exportState(): PersistedState {
    const gates: GateSnapshot[] = [];
    for (const fs of this.floors.values()) for (const g of fs.gates.values()) gates.push(g.snapshot());
    return { version: 1, last_reset_date: this.lastResetDate, gates };
  }

  importState(s: PersistedState): void {
    if (!s || s.version !== 1 || !Array.isArray(s.gates)) return;
    this.lastResetDate = typeof s.last_reset_date === 'string' ? s.last_reset_date : null;
    for (const snap of s.gates) {
      const floor = this.nodeToFloor.get(snap.node);
      const g = floor === undefined ? undefined : this.floors.get(floor)?.gates.get(snap.node);
      if (g) g.restore(snap);
    }
  }
}
