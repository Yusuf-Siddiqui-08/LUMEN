import { describe, expect, it } from 'vitest';
import { areaBox, bounds, FLOOR_PLANS, PLAN_FLOORS, planFor, wrapLabel } from '../src/lib/floorPlans';

type B = { x: number; y: number; w: number; h: number };
const inside = (b: B, outer: B) => b.x >= outer.x && b.y >= outer.y && b.x + b.w <= outer.x + outer.w && b.y + b.h <= outer.y + outer.h;

describe('SLC floor plans', () => {
  it('has a plan for levels 3 to 8, top floor first', () => {
    expect(PLAN_FLOORS).toEqual([8, 7, 6, 5, 4, 3]);
  });

  it('returns no plan for floor 2 or floors outside the SLC', () => {
    expect(planFor(2)).toBeNull();
    expect(planFor(9)).toBeNull();
  });

  it('keeps every plan keyed by its own floor number and titled to match', () => {
    for (const [n, plan] of Object.entries(FLOOR_PLANS)) {
      expect(plan.floor).toBe(Number(n));
      expect(plan.title).toBe(`Level ${n}`);
    }
  });

  it('marks only levels 3 and 4 as approximate, since they have no architectural drawing', () => {
    const schematic = Object.values(FLOOR_PLANS)
      .filter((p) => p.schematic)
      .map((p) => p.floor);
    expect(schematic).toEqual([3, 4]);
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

  it('lists the floor map spaces for each level', () => {
    expect(planFor(3)?.facts).toContain('Launch Zone');
    expect(planFor(5)?.facts).toContain('Seminar rooms');
    expect(planFor(7)?.facts).toContain('Silent study space');
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
