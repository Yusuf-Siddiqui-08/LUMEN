import { describe, expect, it } from 'vitest';
import {
  bestZoneIndex,
  type Floor,
  lastUpdatedText,
  litSegments,
  noiseMeter,
  ordinal,
  pickFor,
  recommend,
  statusWord,
  toFloors,
} from '../src/lib/logic';
import type { FloorsPayload, Vibe } from '../src/lib/types';

/** The sample floors from the prototype (Main.dc.html BASE). */
const BASE: [number, Vibe, number, number][] = [
  [8, 'Quiet', 62, 31],
  [7, 'Quiet', 60, 22],
  [6, 'Social', 48, 3],
  [5, 'Group rooms', 30, 2],
  [4, 'Social', 56, 0],
  [3, 'Collab', 40, 14],
  [2, 'Social', 44, 5],
];
const sample = (): Floor[] =>
  BASE.map(([n, vibe, cap, free]) => ({ n, vibe, cap, free, onFloor: cap - free, db: 50, zones: [], stale: false, ageS: 3 }));

describe('recommendation rule (pickFor)', () => {
  it('picks the closest floor with at least 15 free seats', () => {
    expect(pickFor('All', sample())?.n).toBe(7); // 7 (22) beats 8 (31): closer to the lobby
    expect(pickFor('Quiet', sample())?.n).toBe(7);
  });

  it('otherwise picks the matching floor with the most free seats', () => {
    expect(pickFor('Social', sample())?.n).toBe(2); // 2 has 5, 6 has 3, 4 is full
    expect(pickFor('Collab', sample())?.n).toBe(3); // 14 free, under 15
    expect(pickFor('Group rooms', sample())?.n).toBe(5);
  });

  it('never picks a full floor, and returns null when every match is full', () => {
    const floors = sample().map((f) => (f.vibe === 'Social' ? { ...f, free: 0 } : f));
    expect(pickFor('Social', floors)).toBeNull();
  });

  it('breaks ties toward the closer floor', () => {
    const floors = sample().map((f) => (f.vibe === 'Social' ? { ...f, free: 4 } : f));
    expect(pickFor('Social', floors)?.n).toBe(2);
  });

  it('skips floors whose data is stale', () => {
    const floors = sample().map((f) => (f.n === 7 ? { ...f, stale: true } : f));
    expect(pickFor('All', floors)?.n).toBe(8);
    expect(pickFor('Quiet', floors)?.n).toBe(8);
  });

  it('builds the prototype copy', () => {
    expect(recommend('Quiet', sample())).toMatchObject({
      title: 'Want quiet? Floor 7.',
      sub: '22 seats free. Closest floor with plenty of room.',
    });
    expect(recommend('All', sample()).title).toBe('Best bet right now: Floor 7.');
    expect(recommend('Social', sample())).toMatchObject({ title: 'Want to hang out? Floor 2.', sub: '5 seats free. Most open seats for that vibe.' });
    const full = sample().map((f) => (f.vibe === 'Collab' ? { ...f, free: 0 } : f));
    expect(recommend('Collab', full)).toMatchObject({ title: 'Every collab floor is full.', sub: 'Try another vibe for now.', floor: null });
    const dark = sample().map((f) => (f.vibe === 'Group rooms' ? { ...f, stale: true } : f));
    expect(recommend('Group rooms', dark).title).toBe('No live count for any group rooms floor right now.');
  });
});

describe('display helpers', () => {
  it('lights 14 segments by occupancy, like the prototype', () => {
    expect(litSegments({ cap: 60, free: 22 })).toBe(9);
    expect(litSegments({ cap: 56, free: 0 })).toBe(14);
    expect(litSegments({ cap: 62, free: 31 })).toBe(7);
  });

  it('says why a floor looks the way it does, in words', () => {
    const [f8, , f6, , f4] = sample();
    expect(statusWord(f8)).toBe('Plenty of room');
    expect(statusWord(f6)).toBe('Filling up');
    expect(statusWord(f4)).toBe('Full, skip this floor');
    expect(statusWord({ ...f8, stale: true, ageS: 185 })).toBe('Last updated 3 min ago');
  });

  it('formats "last updated"', () => {
    expect(lastUpdatedText(null)).toBe('No data yet');
    expect(lastUpdatedText(121)).toBe('Last updated 2 min ago');
    expect(lastUpdatedText(30)).toBe('Last updated 1 min ago');
    expect(lastUpdatedText(3 * 3600)).toBe('Last updated 3 h ago');
  });

  it('noise meter and zones', () => {
    expect(noiseMeter(42)).toEqual({ lit: 3, color: '#3DDB96' });
    expect(noiseMeter(66).color).toBe('#F25E5E');
    expect(bestZoneIndex([{ name: 'a', pct: 34 }, { name: 'b', pct: 82 }])).toBe(0);
    expect(bestZoneIndex([{ name: 'a', pct: 100 }, { name: 'b', pct: 100 }])).toBe(-1);
    expect([1, 2, 3, 4, 7, 11, 12, 13, 21, 22].map(ordinal)).toEqual(['1st', '2nd', '3rd', '4th', '7th', '11th', '12th', '13th', '21st', '22nd']);
  });
});

describe('client-side staleness', () => {
  const payload = (updatedAt: string | null, stale = false): FloorsPayload => ({
    site: 'Student Learning Centre',
    simulated: true,
    public_url: null,
    server_time: '2026-11-18T16:00:00.000Z',
    stale_after_s: 120,
    elevator_wait_min: 6,
    elevator_wait_estimated: true,
    floors: [
      {
        floor: 7,
        vibe: 'Quiet',
        capacity: 60,
        on_floor: 38,
        seats_free: 22,
        noise_db: 42,
        updated: '11:00:00',
        updated_at: updatedAt,
        age_s: 0,
        stale,
        stale_reason: stale ? 'silent' : null,
        zones: [],
        elevator_wait_min: 6,
        faults: [],
      },
    ],
  });
  const t0 = Date.parse('2026-11-18T16:00:00.000Z');

  it('greys a floor once its last update is older than the limit, even if the server is unreachable', () => {
    const p = payload('2026-11-18T16:00:00.000Z');
    expect(toFloors(p, t0 + 60_000)[0].stale).toBe(false);
    const later = toFloors(p, t0 + 181_000)[0];
    expect(later.stale).toBe(true);
    expect(Math.round(later.ageS!)).toBe(181);
  });

  it('corrects for a kiosk clock that is wrong', () => {
    const p = payload('2026-11-18T16:00:00.000Z');
    // kiosk clock is 10 minutes slow; offset = server - local = +10 min
    expect(toFloors(p, t0 - 600_000 + 30_000, 600_000)[0].stale).toBe(false);
  });

  it('trusts the server when it says stale, and treats "never reported" as stale', () => {
    expect(toFloors(payload('2026-11-18T16:00:00.000Z', true), t0)[0].stale).toBe(true);
    expect(toFloors(payload(null), t0)[0]).toMatchObject({ stale: true, ageS: null });
  });
});
