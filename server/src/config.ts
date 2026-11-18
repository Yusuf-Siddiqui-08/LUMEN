import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

export type Vibe = 'Quiet' | 'Collab' | 'Social' | 'Group rooms';
export const VIBES: readonly Vibe[] = ['Quiet', 'Collab', 'Social', 'Group rooms'];

export interface NodeRef {
  /** Last part of the MQTT topic, e.g. "elevator" in lumen/slc/f7/gate/elevator */
  name: string;
  /** Node ID sent in the payload, e.g. "f7-gate-elevator" */
  node: string;
}

export interface ZoneConfig {
  name: string;
  /** How full this zone usually is when the whole floor is at zones_at_occupancy_pct. */
  estimate_pct: number;
}

export interface FloorConfig {
  floor: number;
  vibe: Vibe;
  capacity: number;
  gates: NodeRef[];
  mics: NodeRef[];
  zones: ZoneConfig[];
  zones_at_occupancy_pct: number;
  simulator?: { seats_free: number; noise_db: number };
}

export interface LumenConfig {
  site: { code: string; name: string; public_url: string | null };
  timezone: string;
  nightly_reset_hour: number;
  stale_after_s: number;
  elevator_wait_min: number;
  floors: FloorConfig[];
}

/** server/ folder (works from both src/ under tsx and dist/ after build). */
export const SERVER_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
export const DEFAULT_CONFIG_PATH = resolve(SERVER_ROOT, 'config/floors.json');

function fail(msg: string): never {
  throw new Error(`floors config: ${msg}`);
}

export function validateConfig(raw: unknown): LumenConfig {
  if (!raw || typeof raw !== 'object') fail('not an object');
  const c = raw as Record<string, unknown>;
  const site = (c.site ?? {}) as Record<string, unknown>;
  const code = typeof site.code === 'string' && site.code ? site.code : 'slc';
  if (!/^[a-z0-9-]+$/.test(code)) fail(`site.code "${code}" must be lowercase letters, digits or dashes`);
  const floors = c.floors;
  if (!Array.isArray(floors) || floors.length === 0) fail('floors must be a non-empty array');
  const seenNodes = new Set<string>();
  const seenFloors = new Set<number>();
  const outFloors: FloorConfig[] = floors.map((f: Record<string, unknown>, i: number) => {
    const where = `floors[${i}]`;
    const n = f.floor;
    if (!Number.isInteger(n)) fail(`${where}.floor must be an integer`);
    if (seenFloors.has(n as number)) fail(`floor ${n} is listed twice`);
    seenFloors.add(n as number);
    if (!VIBES.includes(f.vibe as Vibe)) fail(`${where}.vibe must be one of ${VIBES.join(', ')}`);
    if (!Number.isInteger(f.capacity) || (f.capacity as number) <= 0) fail(`${where}.capacity must be a positive integer`);
    const refs = (key: 'gates' | 'mics'): NodeRef[] => {
      const list = f[key];
      if (!Array.isArray(list)) fail(`${where}.${key} must be an array`);
      return list.map((r: Record<string, unknown>, j: number) => {
        if (typeof r.name !== 'string' || !/^[A-Za-z0-9_-]+$/.test(r.name)) fail(`${where}.${key}[${j}].name is invalid`);
        if (typeof r.node !== 'string' || !r.node) fail(`${where}.${key}[${j}].node is missing`);
        if (seenNodes.has(r.node)) fail(`node ID ${r.node} is used twice`);
        seenNodes.add(r.node);
        return { name: r.name, node: r.node };
      });
    };
    const zones = Array.isArray(f.zones) ? f.zones : [];
    const at = typeof f.zones_at_occupancy_pct === 'number' && f.zones_at_occupancy_pct > 0 ? f.zones_at_occupancy_pct : 50;
    return {
      floor: n as number,
      vibe: f.vibe as Vibe,
      capacity: f.capacity as number,
      gates: refs('gates'),
      mics: refs('mics'),
      zones: zones.map((z: Record<string, unknown>) => ({
        name: String(z.name),
        estimate_pct: Math.max(0, Math.min(100, Number(z.estimate_pct) || 0)),
      })),
      zones_at_occupancy_pct: at,
      simulator: f.simulator as FloorConfig['simulator'],
    };
  });
  // Highest floor first, the order every LUMEN screen uses.
  outFloors.sort((a, b) => b.floor - a.floor);
  const num = (v: unknown, d: number) => (typeof v === 'number' && Number.isFinite(v) ? v : d);
  return {
    site: {
      code,
      name: typeof site.name === 'string' ? site.name : 'Student Learning Centre',
      public_url: typeof site.public_url === 'string' && site.public_url ? site.public_url : null,
    },
    timezone: typeof c.timezone === 'string' ? c.timezone : 'America/Toronto',
    nightly_reset_hour: num(c.nightly_reset_hour, 3),
    stale_after_s: num(c.stale_after_s, 120),
    elevator_wait_min: num(c.elevator_wait_min, 6),
    floors: outFloors,
  };
}

/** Load the floors file, then let environment variables override the simple settings. */
export function loadConfig(env: NodeJS.ProcessEnv = process.env): LumenConfig {
  const path = env.FLOORS_CONFIG ? resolve(env.FLOORS_CONFIG) : DEFAULT_CONFIG_PATH;
  const cfg = validateConfig(JSON.parse(readFileSync(path, 'utf8')));
  const int = (v: string | undefined) => (v !== undefined && v !== '' && Number.isFinite(Number(v)) ? Number(v) : undefined);
  cfg.nightly_reset_hour = int(env.RESET_HOUR) ?? cfg.nightly_reset_hour;
  cfg.timezone = env.RESET_TZ || cfg.timezone;
  cfg.stale_after_s = int(env.STALE_AFTER_S) ?? cfg.stale_after_s;
  cfg.elevator_wait_min = int(env.ELEVATOR_WAIT_MIN) ?? cfg.elevator_wait_min;
  cfg.site.public_url = env.PUBLIC_URL || cfg.site.public_url;
  if (cfg.nightly_reset_hour < 0 || cfg.nightly_reset_hour > 23) throw new Error('RESET_HOUR must be 0 to 23');
  // Throws a RangeError early if the time zone name is wrong.
  new Intl.DateTimeFormat('en-CA', { timeZone: cfg.timezone });
  return cfg;
}
