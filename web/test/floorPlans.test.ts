import { describe, expect, it } from 'vitest';
import { areaBox, bounds, FLOOR_PLANS, PLAN_FLOORS, planFor, wrapLabel } from '../src/lib/floorPlans';

const inside = (b: { x: number; y: number; w: number; h: number }, outer: { x: number; y: number; w: number; h: number }) =>
  b.x >= outer.x && b.y >= outer.y && b.x + b.w <= outer.x + outer.w && b.y + b.h <= outer.y + outer.h;

describe('library floor plans', () => {
  it('has a plan for floors 2 and 4 to 8, top floor first', () => {
    expect(PLAN_FLOORS).toEqual([8, 7, 6, 5, 4, 2]);
  });

  it('returns no plan for floor 3 or floors outside the library', () => {
    expect(planFor(3)).toBeNull();
    expect(planFor(9)).toBeNull();
  });

  it('keeps every plan keyed by its own floor number', () => {
    for (const [n, plan] of Object.entries(FLOOR_PLANS)) expect(plan.floor).toBe(Number(n));
  });

  it('gives every floor elevators, stairs and five facts', () => {
    for (const plan of Object.values(FLOOR_PLANS)) {
      expect(plan.elevators.length).toBeGreaterThan(0);
      expect(plan.stairs.length).toBeGreaterThan(0);
      expect(plan.facts).toHaveLength(5);
    }
  });

  it('draws every area, stack, elevator and fountain inside the floorplate outline', () => {
    for (const plan of Object.values(FLOOR_PLANS)) {
      const plate = bounds(plan.plate);
      for (const a of plan.areas) expect(inside(areaBox(a), plate), `${plan.title}: ${a.label ?? a.kind}`).toBe(true);
      for (const s of [...plan.stacks, ...plan.elevators, ...plan.stairs]) expect(inside(s, plate), plan.title).toBe(true);
      for (const [x, y] of plan.fountains) expect(inside({ x, y, w: 0, h: 0 }, plate), plan.title).toBe(true);
    }
  });

  it('gives polygon areas at least three points', () => {
    for (const plan of Object.values(FLOOR_PLANS)) {
      expect(plan.plate.length).toBeGreaterThanOrEqual(3);
      for (const a of plan.areas) if (a.pts) expect(a.pts.length).toBeGreaterThanOrEqual(3);
    }
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
