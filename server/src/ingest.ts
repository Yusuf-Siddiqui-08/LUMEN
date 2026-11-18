import type { GateMessage, NoiseMessage } from './occupancy.js';
import type { LumenStore } from './store.js';

/**
 * Topics (site code from the floors config, "slc" by default):
 *   lumen/slc/f{n}/gate/{name}   {"node","seq","in_total","out_total","flags","rssi"}
 *   lumen/slc/f{n}/noise/{name}  {"node","seq","leq_db","peak_db","window_s"}
 *   lumen/slc/f{n}/hub/status    "online" | "offline" (MQTT last will) | {"status": "online", ...}
 */
export function topicFilter(siteCode: string): string {
  return `lumen/${siteCode}/#`;
}

const isNum = (v: unknown): v is number => typeof v === 'number' && Number.isFinite(v);
const isCount = (v: unknown): v is number => isNum(v) && Number.isInteger(v) && v >= 0;

export function parseGate(p: unknown): GateMessage | null {
  if (!p || typeof p !== 'object') return null;
  const o = p as Record<string, unknown>;
  if (typeof o.node !== 'string' || !isCount(o.seq) || !isCount(o.in_total) || !isCount(o.out_total)) return null;
  return {
    node: o.node,
    seq: o.seq,
    in_total: o.in_total,
    out_total: o.out_total,
    flags: Array.isArray(o.flags) ? o.flags.map(String) : [],
    rssi: isNum(o.rssi) ? o.rssi : undefined,
  };
}

export function parseNoise(p: unknown): NoiseMessage | null {
  if (!p || typeof p !== 'object') return null;
  const o = p as Record<string, unknown>;
  if (typeof o.node !== 'string' || !isCount(o.seq) || !isNum(o.leq_db)) return null;
  if (o.leq_db < 0 || o.leq_db > 150) return null;
  return {
    node: o.node,
    seq: o.seq,
    leq_db: o.leq_db,
    peak_db: isNum(o.peak_db) ? o.peak_db : undefined,
    window_s: isNum(o.window_s) ? o.window_s : undefined,
  };
}

export function parseHubStatus(raw: string): 'online' | 'offline' | null {
  const t = raw.trim();
  if (t === '') return null;
  let status: unknown = t;
  if (t.startsWith('{')) {
    try {
      status = (JSON.parse(t) as Record<string, unknown>).status ?? 'online';
    } catch {
      return null;
    }
  } else if (t.startsWith('"')) {
    try {
      status = JSON.parse(t);
    } catch {
      return null;
    }
  }
  const s = String(status).toLowerCase();
  if (s === 'offline') return 'offline';
  if (s === 'online') return 'online';
  return null;
}

export type IngestResult = 'ok' | 'ignored' | 'bad_topic' | 'bad_payload';

export function createIngest(store: LumenStore, log: (m: string) => void = console.warn) {
  const site = store.config.site.code;
  const re = new RegExp(`^lumen/${site}/f(\\d+)/(gate|noise|hub)/([A-Za-z0-9_-]+)$`);
  let badCount = 0;
  const bad = (msg: string) => {
    badCount++;
    if (badCount <= 20 || badCount % 100 === 0) log(`[lumen] ${msg} (bad messages so far: ${badCount})`);
  };

  return function handle(topic: string, payload: Buffer | string): IngestResult {
    const m = re.exec(topic);
    if (!m) return 'bad_topic';
    const floor = Number(m[1]);
    const kind = m[2];
    const name = m[3];
    const text = typeof payload === 'string' ? payload : payload.toString('utf8');

    if (kind === 'hub') {
      if (name !== 'status') return 'bad_topic';
      const st = parseHubStatus(text);
      if (!st) {
        bad(`unreadable hub status on ${topic}`);
        return 'bad_payload';
      }
      return store.handleHubStatus(floor, st) ? 'ok' : 'ignored';
    }

    let json: unknown;
    try {
      json = JSON.parse(text);
    } catch {
      bad(`not JSON on ${topic}`);
      return 'bad_payload';
    }
    if (kind === 'gate') {
      const msg = parseGate(json);
      if (!msg) {
        bad(`gate payload missing node/seq/in_total/out_total on ${topic}`);
        return 'bad_payload';
      }
      return store.handleGate(floor, msg) ? 'ok' : 'ignored';
    }
    const msg = parseNoise(json);
    if (!msg) {
      bad(`noise payload missing node/seq/leq_db on ${topic}`);
      return 'bad_payload';
    }
    return store.handleNoise(floor, msg) ? 'ok' : 'ignored';
  };
}

export type Ingest = ReturnType<typeof createIngest>;
