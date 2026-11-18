/**
 * Core counting logic. Pure: no timers, no I/O. Time is always passed in.
 *
 * Gate nodes send RUNNING TOTALS (in_total, out_total since the node booted),
 * not +1/-1 events. A missed message is fixed by the next one. The server keeps,
 * per gate, the totals at the last nightly reset (the baseline):
 *
 *   gate net    = carried + (in_total - base_in) - (out_total - base_out)
 *   on_floor    = max(0, sum of gate nets on the floor)
 *   seats_free  = max(0, capacity - on_floor)
 *
 * "carried" keeps people counted before a node reboot (its totals restart at 0).
 */

export const SEQ_MOD = 65536; // BLE adverts carry a 2-byte sequence number
/** A sequence number at most this far behind the last one is a late (out-of-order) copy. */
export const REORDER_WINDOW = 64;

export type SeqVerdict = 'first' | 'newer' | 'duplicate' | 'older' | 'restart';

/**
 * Compare an incoming sequence number with the last accepted one, with 16-bit wraparound.
 * A number far behind the last one means the node restarted its counter (reboot).
 */
export function compareSeq(last: number | null, seq: number): SeqVerdict {
  if (last === null) return 'first';
  const diff = (((seq - last) % SEQ_MOD) + SEQ_MOD) % SEQ_MOD;
  if (diff === 0) return 'duplicate';
  if (diff < SEQ_MOD / 2) return 'newer';
  const behind = SEQ_MOD - diff;
  return behind <= REORDER_WINDOW ? 'older' : 'restart';
}

export interface GateMessage {
  node: string;
  seq: number;
  in_total: number;
  out_total: number;
  flags?: string[];
  rssi?: number;
}

export interface NoiseMessage {
  node: string;
  seq: number;
  leq_db: number;
  peak_db?: number;
  window_s?: number;
}

export type GateResult = 'accepted' | 'duplicate' | 'out_of_order' | 'reboot';

export interface GateSnapshot {
  node: string;
  lastSeq: number | null;
  inTotal: number;
  outTotal: number;
  baseIn: number;
  baseOut: number;
  carried: number;
  hasData: boolean;
  baselineOnFirst: boolean;
  lastSeen: number | null;
  flags: string[];
  rssi: number | null;
}

export class GateCounter {
  readonly node: string;
  lastSeq: number | null = null;
  inTotal = 0;
  outTotal = 0;
  baseIn = 0;
  baseOut = 0;
  /** Net people counted before the node's totals last restarted. */
  carried = 0;
  hasData = false;
  /**
   * True after a nightly reset that happened before this gate ever reported:
   * its first totals then become the baseline. Otherwise, on a fresh server with no
   * saved state, the baseline is 0 (trust the node's own net since it booted).
   */
  baselineOnFirst = false;
  lastSeen: number | null = null;
  flags: string[] = [];
  rssi: number | null = null;

  constructor(node: string) {
    this.node = node;
  }

  apply(msg: GateMessage, now: number): GateResult {
    const verdict = compareSeq(this.lastSeq, msg.seq);
    if (verdict === 'duplicate') return 'duplicate';
    if (verdict === 'older') return 'out_of_order';

    let result: GateResult = 'accepted';
    if (!this.hasData) {
      if (this.baselineOnFirst) {
        this.baseIn = msg.in_total;
        this.baseOut = msg.out_total;
        this.baselineOnFirst = false;
      }
    } else if (msg.in_total < this.inTotal || msg.out_total < this.outTotal) {
      // Totals went down. A rebooted node counts from zero again, so its totals
      // are small. A sequence number far behind with totals close to the current
      // ones is a very late copy of an old message instead: drop it.
      const looksRestarted = msg.in_total + msg.out_total < (this.inTotal + this.outTotal) / 2;
      if (verdict === 'restart' && !looksRestarted) return 'out_of_order';
      // Keep everyone counted so far, then re-baseline this gate at zero.
      this.carried = this.net();
      this.baseIn = 0;
      this.baseOut = 0;
      result = 'reboot';
    }

    this.inTotal = msg.in_total;
    this.outTotal = msg.out_total;
    this.lastSeq = msg.seq;
    this.hasData = true;
    this.lastSeen = now;
    this.flags = Array.isArray(msg.flags) ? msg.flags.map(String) : [];
    this.rssi = typeof msg.rssi === 'number' ? msg.rssi : null;
    return result;
  }

  /** People this gate has let onto the floor since the last reset (can be negative). */
  net(): number {
    if (!this.hasData) return this.carried;
    return this.carried + (this.inTotal - this.baseIn) - (this.outTotal - this.baseOut);
  }

  /** Nightly reset: from now on, count from the current totals. */
  resetBaseline(): void {
    this.carried = 0;
    if (this.hasData) {
      this.baseIn = this.inTotal;
      this.baseOut = this.outTotal;
    } else {
      this.baselineOnFirst = true;
    }
  }

  snapshot(): GateSnapshot {
    return {
      node: this.node,
      lastSeq: this.lastSeq,
      inTotal: this.inTotal,
      outTotal: this.outTotal,
      baseIn: this.baseIn,
      baseOut: this.baseOut,
      carried: this.carried,
      hasData: this.hasData,
      baselineOnFirst: this.baselineOnFirst,
      lastSeen: this.lastSeen,
      flags: this.flags,
      rssi: this.rssi,
    };
  }

  restore(s: Partial<GateSnapshot>): void {
    const num = (v: unknown, d: number) => (typeof v === 'number' && Number.isFinite(v) ? v : d);
    this.lastSeq = typeof s.lastSeq === 'number' ? s.lastSeq : null;
    this.inTotal = num(s.inTotal, 0);
    this.outTotal = num(s.outTotal, 0);
    this.baseIn = num(s.baseIn, 0);
    this.baseOut = num(s.baseOut, 0);
    this.carried = num(s.carried, 0);
    this.hasData = Boolean(s.hasData);
    this.baselineOnFirst = Boolean(s.baselineOnFirst);
    // lastSeen is deliberately not restored: after a restart, freshness must be earned again.
  }
}

export class MicReading {
  readonly node: string;
  lastSeq: number | null = null;
  leqDb: number | null = null;
  peakDb: number | null = null;
  lastSeen: number | null = null;

  constructor(node: string) {
    this.node = node;
  }

  apply(msg: NoiseMessage, now: number): 'accepted' | 'duplicate' | 'out_of_order' {
    const verdict = compareSeq(this.lastSeq, msg.seq);
    if (verdict === 'duplicate') return 'duplicate';
    if (verdict === 'older') return 'out_of_order';
    this.lastSeq = msg.seq;
    this.leqDb = msg.leq_db;
    this.peakDb = typeof msg.peak_db === 'number' ? msg.peak_db : null;
    this.lastSeen = now;
    return 'accepted';
  }
}

export function median(values: number[]): number | null {
  if (values.length === 0) return null;
  const s = [...values].sort((a, b) => a - b);
  const mid = Math.floor(s.length / 2);
  return s.length % 2 ? s[mid] : (s[mid - 1] + s[mid]) / 2;
}

/** Floor noise = median of the latest Leq from each mic heard within maxAgeMs. */
export function floorNoise(mics: MicReading[], now: number, maxAgeMs: number): number | null {
  const fresh = mics
    .filter((m) => m.leqDb !== null && m.lastSeen !== null && now - m.lastSeen <= maxAgeMs)
    .map((m) => m.leqDb as number);
  return median(fresh);
}

export function onFloor(gates: GateCounter[]): number {
  return Math.max(0, gates.reduce((sum, g) => sum + g.net(), 0));
}

export function seatsFree(capacity: number, people: number): number {
  return Math.max(0, capacity - people);
}

export type StaleReason = 'no_data' | 'silent' | 'hub_offline' | null;

/** A floor is stale if nothing (message or heartbeat) arrived for staleAfterMs, or its hub said "offline". */
export function staleState(
  lastMessageAt: number | null,
  hubOnline: boolean | null,
  now: number,
  staleAfterMs: number,
): { stale: boolean; reason: StaleReason } {
  if (lastMessageAt === null) return { stale: true, reason: 'no_data' };
  if (hubOnline === false) return { stale: true, reason: 'hub_offline' };
  if (now - lastMessageAt > staleAfterMs) return { stale: true, reason: 'silent' };
  return { stale: false, reason: null };
}

/**
 * Zones cannot be measured with door counters. Each zone has a configured
 * estimate at a reference floor occupancy, scaled linearly with live occupancy.
 * A full floor shows every zone as full.
 */
export function estimateZones(
  zones: { name: string; estimate_pct: number }[],
  atOccupancyPct: number,
  people: number,
  capacity: number,
): { name: string; pct: number; estimated: true }[] {
  const occPct = capacity > 0 ? (people / capacity) * 100 : 0;
  return zones.map((z) => {
    const pct = people >= capacity ? 100 : Math.round((z.estimate_pct * occPct) / atOccupancyPct);
    return { name: z.name, pct: Math.max(0, Math.min(100, pct)), estimated: true as const };
  });
}
