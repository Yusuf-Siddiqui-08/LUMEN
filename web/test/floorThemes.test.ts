import { describe, expect, it } from 'vitest';
import floorsConfig from '../../server/config/floors.json';
import { ALL_FLOOR_THEME_NUMBERS, FLOOR_THEMES, themeForFloor } from '../src/lib/floorThemes';

const EXPECTED_NICKNAMES: Record<number, string> = {
  1: 'The Valley',
  2: 'The Bridge',
  3: 'The Bluffs',
  4: 'The Garden',
  5: 'The Sun',
  6: 'The Beach',
  7: 'The Forest',
  8: 'The Sky',
};

describe('SLC floor artistic themes', () => {
  it('defines themes for all 8 SLC floors with official nicknames', () => {
    expect([...ALL_FLOOR_THEME_NUMBERS]).toEqual([1, 2, 3, 4, 5, 6, 7, 8]);
    for (const [n, nickname] of Object.entries(EXPECTED_NICKNAMES)) {
      const floor = Number(n);
      const theme = FLOOR_THEMES[floor];
      expect(theme, `floor ${floor}`).toBeDefined();
      expect(theme.floor).toBe(floor);
      expect(theme.nickname).toBe(nickname);
      expect(theme.tagline.length).toBeGreaterThan(0);
    }
  });

  it('covers every floor configured in server/config/floors.json', () => {
    for (const f of floorsConfig.floors) {
      expect(FLOOR_THEMES[f.floor], `configured floor ${f.floor}`).toBeDefined();
      expect(themeForFloor(f.floor).floor).toBe(f.floor);
    }
  });

  it('gives every floor a distinct active button colour and complete floor-plan palette', () => {
    const activeButtons = new Set<string>();
    for (const n of ALL_FLOOR_THEME_NUMBERS) {
      const t = FLOOR_THEMES[n];
      activeButtons.add(t.pillActiveBg);
      expect(t.sectionBg).toContain('linear-gradient');
      expect(t.plan.plateBg).toBeTruthy();
      expect(t.plan.plateStroke).toBeTruthy();
      expect(Object.keys(t.plan.kinds).sort()).toEqual(['casual', 'computers', 'open', 'room', 'service', 'studyRoom']);
    }
    expect(activeButtons.size).toBe(8);
  });

  it('falls back safely to Floor 7 (The Forest) for out-of-range floors', () => {
    expect(themeForFloor(0)).toEqual(FLOOR_THEMES[7]);
    expect(themeForFloor(99)).toEqual(FLOOR_THEMES[7]);
  });
});
