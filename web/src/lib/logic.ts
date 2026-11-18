import type { FloorsPayload, Vibe } from './types';

/* ---------- Design tokens ---------- */
export const GREEN = '#3DDB96';
export const GOLD = '#F4B601';
export const RED = '#F25E5E';
export const RED_TEXT = '#FF7A72';
export const BLUE = '#75ADEA';
export const LAVENDER = '#C3B1FF';
export const INK = '#0B1B3A';
export const EMPTY = '#334C81';
export const MUTED = '#C9D6EE';
export const MUTED_2 = '#9FB3DA';
/** Greyed-out look for floors whose sensors stopped reporting. */
export const STALE = { bg: '#1C2A47', border: '#6B7BA0', text: '#B4C0D9', seg: '#5B6A8C' };

export const MONO = "'JetBrains Mono', ui-monospace, Menlo, monospace";

export const ZONE_NAMES = ['Quiet Study', 'Group Tables', 'Lounge Area', 'Computer Area'];
/**
 * Floor map tile colours. The green and blue are a shade darker than the prototype
 * (#2D8862, #3E7ABC) so small white text on them passes 4.5:1.
 */
export const ZONE_TILE = ['#2B805C', '#C74E4C', '#6B4DA2', '#3B75B5'];
/** Floor map grid order: Quiet Study, Group Tables / Computer Area, Lounge Area. */
export const MAP_ORDER = [0, 1, 3, 2];
export const VIBE_PILL: Record<Vibe, string> = { Quiet: GREEN, Collab: BLUE, Social: GOLD, 'Group rooms': LAVENDER };

export type Need = 'All' | Vibe;
export const NEEDS: { id: Need; label: string }[] = [
  { id: 'All', label: 'All floors' },
  { id: 'Quiet', label: 'Quiet' },
  { id: 'Collab', label: 'Collab' },
  { id: 'Social', label: 'Social' },
  { id: 'Group rooms', label: 'Group rooms' },
];
export const ASK: Record<Need, string> = {
  All: 'Best bet right now:',
  Quiet: 'Want quiet?',
  Collab: 'Want to collab?',
  Social: 'Want to hang out?',
  'Group rooms': 'Need a group room?',
};

/* ---------- The floor model every screen uses ---------- */
export interface Zone {
  name: string;
  pct: number;
}

export interface Floor {
  n: number;
  vibe: Vibe;
  cap: number;
  free: number;
  onFloor: number;
  db: number | null;
  zones: Zone[];
  stale: boolean;
  /** Seconds since the floor last reported, or null if it never has. */
  ageS: number | null;
}

/**
 * Turn the API payload into floors, re-checking staleness against the local clock.
 * clockOffsetMs = server time minus local time, so a kiosk with a wrong clock still
 * greys out floors correctly. If the server itself is unreachable the ages keep growing.
 */
export function toFloors(p: FloorsPayload, nowMs: number, clockOffsetMs = 0): Floor[] {
  const serverNow = nowMs + clockOffsetMs;
  return p.floors.map((f) => {
    const ageS = f.updated_at ? Math.max(0, (serverNow - Date.parse(f.updated_at)) / 1000) : null;
    const stale = f.stale || ageS === null || ageS > p.stale_after_s;
    return {
      n: f.floor,
      vibe: f.vibe,
      cap: f.capacity,
      free: f.seats_free,
      onFloor: f.on_floor,
      db: f.noise_db,
      zones: f.zones.map((z) => ({ name: z.name, pct: z.pct })),
      stale,
      ageS,
    };
  });
}

export function seatColor(free: number): string {
  return free === 0 ? RED : free < 10 ? GOLD : GREEN;
}

export function zoneStatus(p: number): [string, string] {
  if (p >= 100) return ['Full', RED];
  if (p >= 75) return ['Busy', RED];
  if (p >= 50) return ['Moderate', GOLD];
  return ['Available', GREEN];
}

export function stairsMin(n: number): number {
  return n <= 3 ? 1 : n <= 5 ? 2 : 3;
}

/** "3:40", the clock style on every LUMEN screen. */
export function fmtClock(t: number): string {
  const d = new Date(t);
  const h = d.getHours() % 12 || 12;
  return `${h}:${String(d.getMinutes()).padStart(2, '0')}`;
}

export function statusWord(f: Floor): string {
  if (f.stale) return lastUpdatedText(f.ageS);
  if (f.free === 0) return 'Full, skip this floor';
  return f.free < 10 ? 'Filling up' : 'Plenty of room';
}

/** "Last updated 3 min ago", required whenever a floor's data is stale. */
export function lastUpdatedText(ageS: number | null): string {
  if (ageS === null) return 'No data yet';
  const min = Math.max(1, Math.floor(ageS / 60));
  if (min >= 120) return `Last updated ${Math.floor(min / 60)} h ago`;
  return `Last updated ${min} min ago`;
}

export function dbWord(db: number): string {
  return db < 45 ? 'Library quiet' : db < 55 ? 'Low chatter' : db < 62 ? 'Chatty' : 'Loud';
}

/** Ten-bar noise meter: how many bars are lit and in what colour. */
export function noiseMeter(db: number): { lit: number; color: string } {
  return {
    lit: Math.max(1, Math.min(10, Math.round((db - 30) / 4))),
    color: db < 50 ? GREEN : db < 60 ? GOLD : RED,
  };
}

/** How many of the 14 occupancy segments are lit. */
export function litSegments(f: Pick<Floor, 'cap' | 'free'>, total = 14): number {
  return Math.round(((f.cap - f.free) / f.cap) * total);
}

export function occupancyPct(f: Pick<Floor, 'cap' | 'free'>): number {
  return Math.round(((f.cap - f.free) / f.cap) * 100);
}

/** The zone with the most room (lowest % full, under 100). -1 if every zone is full. */
export function bestZoneIndex(zones: Zone[]): number {
  let best = -1;
  let bestPct = 101;
  zones.forEach((z, k) => {
    if (z.pct < 100 && z.pct < bestPct) {
      bestPct = z.pct;
      best = k;
    }
  });
  return best;
}

/** Map tiles in prototype order, falling back to list order for other zone sets. */
export function mapOrder(zones: Zone[]): number[] {
  return zones.length === 4 ? MAP_ORDER : zones.map((_, i) => i);
}

/**
 * The recommendation rule from the prototype: the closest floor (lowest number, nearest
 * the lobby) with at least 15 free seats; otherwise the matching floor with the most free
 * seats (ties go to the closer floor). Floors with stale data are never recommended.
 */
export function pickFor(need: Need, floors: Floor[]): Floor | null {
  const live = floors.filter((f) => !f.stale);
  const match = need === 'All' ? live : live.filter((f) => f.vibe === need);
  const open = match.filter((f) => f.free > 0);
  const plenty = open.filter((f) => f.free >= 15).sort((a, b) => a.n - b.n);
  if (plenty.length) return plenty[0];
  return open.slice().sort((a, b) => b.free - a.free || a.n - b.n)[0] ?? null;
}

export interface Recommendation {
  title: string;
  sub: string;
  floor: Floor | null;
}

export function seatsFreeText(free: number): string {
  return `${free} seat${free === 1 ? '' : 's'} free`;
}

export function recommend(need: Need, floors: Floor[]): Recommendation {
  const pick = pickFor(need, floors);
  if (pick) {
    return {
      title: `${ASK[need]} Floor ${pick.n}.`,
      sub: `${seatsFreeText(pick.free)}. ${pick.free >= 15 ? 'Closest floor with plenty of room.' : 'Most open seats for that vibe.'}`,
      floor: pick,
    };
  }
  const matching = need === 'All' ? floors : floors.filter((f) => f.vibe === need);
  const what = need === 'All' ? 'floor' : `${need.toLowerCase()} floor`;
  if (matching.length > 0 && matching.every((f) => f.stale)) {
    return { title: `No live count for any ${what} right now.`, sub: 'The sensors are not reporting. Try again in a few minutes.', floor: null };
  }
  return { title: `Every ${what} is full.`, sub: 'Try another vibe for now.', floor: null };
}

export function ordinal(n: number): string {
  const s = ['th', 'st', 'nd', 'rd'];
  const v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
}
