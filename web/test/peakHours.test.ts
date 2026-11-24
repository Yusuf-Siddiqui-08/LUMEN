import { describe, expect, it } from 'vitest';
import floorsConfig from '../../server/config/floors.json';
import { busiestHour, formatHour, PEAK_HOURS, PEAK_HOURS_DATA, peakFor, quietestHour } from '../src/lib/peakHours';

const FLOOR_NUMBERS = [2, 3, 4, 5, 6, 7, 8];
const SEATS_BY_FLOOR = new Map(floorsConfig.floors.map((f) => [f.floor, f.capacity]));

describe('peak hours sample data', () => {
  it('covers 7 AM to 11 PM (17 hours) with source marked as sample', () => {
    expect(PEAK_HOURS_DATA.source).toBe('sample');
    expect(PEAK_HOURS).toEqual([7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23]);
    expect(PEAK_HOURS).toHaveLength(17);
  });

  it('has data for floors 2 to 8, each with 17 people and 17 noise_db values', () => {
    for (const n of FLOOR_NUMBERS) {
      const floor = peakFor(n);
      expect(floor, `floor ${n}`).not.toBeNull();
      expect(floor!.people).toHaveLength(17);
      expect(floor!.noise_db).toHaveLength(17);
    }
    expect(peakFor(1)).toBeNull();
    expect(peakFor(9)).toBeNull();
  });

  it('keeps people as whole numbers from 0 up to each floor seat capacity', () => {
    for (const n of FLOOR_NUMBERS) {
      const seats = SEATS_BY_FLOOR.get(n)!;
      const floor = peakFor(n)!;
      for (const count of floor.people) {
        expect(Number.isInteger(count), `floor ${n} people=${count}`).toBe(true);
        expect(count, `floor ${n}`).toBeGreaterThanOrEqual(0);
        expect(count, `floor ${n}`).toBeLessThanOrEqual(seats);
      }
    }
    // Floor 4 reaches its seat limit at peak, matching the live "full" floor sample.
    const floor4 = peakFor(4)!;
    expect(Math.max(...floor4.people)).toBe(SEATS_BY_FLOOR.get(4));
  });

  it('keeps noise between 30 and 80 dB', () => {
    for (const n of FLOOR_NUMBERS) {
      const floor = peakFor(n)!;
      for (const db of floor.noise_db) {
        expect(db, `floor ${n}`).toBeGreaterThanOrEqual(30);
        expect(db, `floor ${n}`).toBeLessThanOrEqual(80);
      }
    }
  });
});

describe('peak hour helpers', () => {
  it('finds the busiest and quietest hours on a hand-made example', () => {
    const sample = {
      people: [3, 12, 28, 19, 24, 6],
      noise_db: [38.2, 40.5, 44.8, 41.0, 43.1, 35.4],
    };
    const hours = [7, 10, 12, 14, 16, 22];

    expect(busiestHour(sample, hours)).toBe(12);
    expect(quietestHour(sample, hours)).toBe(22);

    // Also works with the default 7 AM–11 PM hour list.
    expect(busiestHour(sample)).toBe(9);
    expect(quietestHour(sample)).toBe(12);
  });

  it('formats 24-hour numbers into 12-hour clock labels', () => {
    expect(formatHour(0)).toBe('12 AM');
    expect(formatHour(7)).toBe('7 AM');
    expect(formatHour(11)).toBe('11 AM');
    expect(formatHour(12)).toBe('12 PM');
    expect(formatHour(13)).toBe('1 PM');
    expect(formatHour(23)).toBe('11 PM');
  });
});
