import { describe, expect, it } from 'vitest';
import { computeFloorOccupancy } from '../src/lib/floorOccupancy';
import { areaBox, bounds, FLOOR_PLANS, PLAN_FLOORS, planFor, type Pt, wrapLabel } from '../src/lib/floorPlans';
import type { Floor } from '../src/lib/logic';
import { DETAILED_PLANS, detailedPlanFor } from '../src/lib/slcPlans';

type B = { x: number; y: number; w: number; h: number };
const inside = (b: B, outer: B) => b.x >= outer.x && b.y >= outer.y && b.x + b.w <= outer.x + outer.w && b.y + b.h <= outer.y + outer.h;

function pointInPoly(px: number, py: number, poly: Pt[]): boolean {
  let hit = false;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const [xi, yi] = poly[i];
    const [xj, yj] = poly[j];
    const intersect = yi > py !== yj > py && px < ((xj - xi) * (py - yi)) / (yj - yi) + xi;
    if (intersect) hit = !hit;
  }
  return hit;
}

function pointInBox(px: number, py: number, b: B): boolean {
  return px > b.x && px < b.x + b.w && py > b.y && py < b.y + b.h;
}

const sampleFloor = (n: number, cap: number, free: number, stale = false): Floor => ({
  n,
  vibe: n >= 7 ? 'Quiet' : n === 5 ? 'Group rooms' : n === 3 ? 'Collab' : 'Social',
  cap,
  free,
  onFloor: cap - free,
  db: 48,
  stale,
  ageS: 5,
  zones: [
    { name: 'Quiet Study', pct: free === 0 ? 100 : Math.round(((cap - free) / cap) * 80) },
    { name: 'Group Tables', pct: free === 0 ? 100 : Math.min(100, Math.round(((cap - free) / cap) * 115)) },
    { name: 'Lounge Area', pct: free === 0 ? 100 : Math.round(((cap - free) / cap) * 95) },
    { name: 'Computer Area', pct: free === 0 ? 100 : Math.round(((cap - free) / cap) * 100) },
  ],
});

describe('SLC floor plans (Levels 2 to 8)', () => {
  it('has a plan for levels 2 to 8, top floor first, and disregards level 1', () => {
    expect(PLAN_FLOORS).toEqual([8, 7, 6, 5, 4, 3, 2]);
    expect(planFor(1)).toBeNull();
    expect(planFor(9)).toBeNull();
    expect(detailedPlanFor(1)).toBeNull();
    expect(detailedPlanFor(9)).toBeNull();
  });

  it('keeps every plan keyed by its own floor number and titled to match', () => {
    for (const [n, plan] of Object.entries(FLOOR_PLANS)) {
      expect(plan.floor).toBe(Number(n));
      expect(plan.title).toBe(`Level ${n}`);
      expect(plan.schematic).toBe(false);
    }
  });

  it('gives every floor the shared core: four-door elevator bank, south-east elevator, three stairs, washrooms', () => {
    for (const plan of Object.values(FLOOR_PLANS)) {
      expect(plan.elevators.map((e) => e.doors)).toEqual([4, 1]);
      expect(plan.stairs).toHaveLength(3);
      expect(plan.areas.some((a) => a.kind === 'service' && a.label === 'Washrooms')).toBe(true);
      expect(plan.facts.length).toBeGreaterThan(0);
    }
  });

  it('puts open study space first so rooms draw on top of it', () => {
    for (const plan of Object.values(FLOOR_PLANS)) expect(plan.areas[0].kind).toBe('open');
  });

  it('draws every area, label, elevator and stair inside the floorplate outline', () => {
    for (const plan of Object.values(FLOOR_PLANS)) {
      const plate = bounds(plan.plate);
      for (const a of plan.areas) {
        expect(inside(areaBox(a), plate), `${plan.title}: ${a.label ?? a.kind}`).toBe(true);
        if (a.labelBox) expect(inside(a.labelBox, plate), `${plan.title}: ${a.label} label`).toBe(true);
      }
      for (const s of [...plan.elevators, ...plan.stairs]) expect(inside(s, plate), plan.title).toBe(true);
    }
  });

  it('provides detailed architectural seats, tables, and rooms inside each floorplate for Levels 2 to 8', () => {
    for (const fl of [2, 3, 4, 5, 6, 7, 8]) {
      const d = DETAILED_PLANS[fl];
      expect(d, `Level ${fl} detailed plan`).toBeDefined();
      expect(d.seats.length).toBeGreaterThan(40);
      expect(d.tables.length).toBeGreaterThan(5);
      for (const s of d.seats) {
        expect(pointInPoly(s.cx, s.cy, d.plate), `Level ${fl} seat ${s.id} (${s.cx},${s.cy}) inside plate`).toBe(true);
        expect(pointInBox(s.cx, s.cy, d.core.northBox), `Level ${fl} seat ${s.id} clear of north core`).toBe(false);
        expect(pointInBox(s.cx, s.cy, d.core.seBox), `Level ${fl} seat ${s.id} clear of SE core`).toBe(false);
      }
    }
  });

  it('lists key spaces for each level', () => {
    expect(planFor(2)?.facts.some((f) => f.includes('TMU Library'))).toBe(true);
    expect(planFor(3)?.facts.some((f) => f.includes('Launch Zone'))).toBe(true);
    expect(planFor(5)?.facts.some((f) => f.includes('seminar'))).toBe(true);
    expect(planFor(7)?.facts.some((f) => f.includes('Silent study'))).toBe(true);
  });
});

describe('floorOccupancy red/green mapping', () => {
  it('marks every seat, table, and room occupied when a floor is FULL (free === 0)', () => {
    const plan = DETAILED_PLANS[4];
    const occ = computeFloorOccupancy(plan, sampleFloor(4, 56, 0));
    expect(occ.summary.occupancyPct).toBe(100);
    expect(occ.summary.occupiedSeats).toBe(plan.seats.length);
    expect(occ.summary.vacantSeats).toBe(0);
    expect(occ.summary.occupiedTables).toBe(plan.tables.length);
    expect(occ.summary.occupiedRooms).toBe(plan.rooms.length);
  });

  it('marks every seat, table, and room vacant when occupancy is 0', () => {
    const plan = DETAILED_PLANS[8];
    const occ = computeFloorOccupancy(plan, sampleFloor(8, 62, 62));
    expect(occ.summary.occupancyPct).toBe(0);
    expect(occ.summary.occupiedSeats).toBe(0);
    expect(occ.summary.vacantSeats).toBe(plan.seats.length);
    expect(occ.summary.occupiedTables).toBe(0);
    expect(occ.summary.occupiedRooms).toBe(0);
  });

  it('distributes partial occupancy deterministically across seats, tables, and rooms', () => {
    const plan = DETAILED_PLANS[8];
    const f = sampleFloor(8, 62, 31);
    const a = computeFloorOccupancy(plan, f);
    const b = computeFloorOccupancy(plan, f);
    expect(a.summary.occupiedSeats).toBeGreaterThan(0);
    expect(a.summary.vacantSeats).toBeGreaterThan(0);
    expect(a.summary.occupiedSeats).toBe(b.summary.occupiedSeats);
    for (const s of plan.seats) {
      expect(a.seatOccupied.get(s.id)).toBe(b.seatOccupied.get(s.id));
    }
  });

  it('marks stale floors offline without reporting occupied seats', () => {
    const plan = DETAILED_PLANS[7];
    const occ = computeFloorOccupancy(plan, sampleFloor(7, 60, 20, true));
    expect(occ.summary.stale).toBe(true);
    expect(occ.summary.occupiedSeats).toBe(0);
    expect(occ.summary.occupiedRooms).toBe(0);
  });
});

describe('wrapLabel', () => {
  it('breaks words onto lines that fit the width', () => {
    expect(wrapLabel('Group Study Rooms', 40, 5)).toEqual(['Group', 'Study', 'Rooms']);
    expect(wrapLabel('Group Study Rooms', 100, 5)).toEqual(['Group Study Rooms']);
  });

  it('never drops a word that is longer than the line', () => {
    expect(wrapLabel('Washroom', 10, 5)).toEqual(['Washroom']);
  });
});
