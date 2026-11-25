import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import floorsConfig from '../../server/config/floors.json';
import { PeakHoursCharts } from '../src/components/PeakHoursCharts';
import { themeForFloor } from '../src/lib/floorThemes';
import {
  busiestHour,
  formatHour,
  movingMean3,
  PEAK_HOURS,
  PEAK_HOURS_DATA,
  peakFor,
  quietestHour,
  trendNoiseFor,
  trendPeopleFor,
} from '../src/lib/peakHours';

const FLOOR_NUMBERS = [2, 3, 4, 5, 6, 7, 8];
const SEATS_BY_FLOOR = new Map(floorsConfig.floors.map((f) => [f.floor, f.capacity]));

const torontoParts = new Intl.DateTimeFormat('en-US', {
  timeZone: 'America/Toronto',
  weekday: 'short',
  hour: '2-digit',
  hourCycle: 'h23',
});

function torontoWeekdayAndHour(utcIso: string): { isWeekend: boolean; hour: number } {
  const parts: Record<string, string> = {};
  for (const p of torontoParts.formatToParts(new Date(utcIso))) {
    parts[p.type] = p.value;
  }
  const wd = parts.weekday;
  return {
    isWeekend: wd === 'Sat' || wd === 'Sun',
    hour: Number(parts.hour) % 24,
  };
}

describe('peak hours MATLAB dataset', () => {
  it('covers 7 AM to 11 PM (17 hours) with source and MATLAB pipeline metadata', () => {
    expect(PEAK_HOURS_DATA.source).toBe('sample');
    expect(PEAK_HOURS_DATA.pipeline?.engine).toBe('MATLAB');
    expect(PEAK_HOURS_DATA.pipeline?.script).toBe('matlab/run_lumen_peak_hours.m');
    expect(PEAK_HOURS).toEqual([7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23]);
    expect(PEAK_HOURS).toHaveLength(17);
  });

  it('has data and MATLAB analytics for floors 2 to 8', () => {
    for (const n of FLOOR_NUMBERS) {
      const floor = peakFor(n);
      expect(floor, `floor ${n}`).not.toBeNull();
      expect(floor!.people).toHaveLength(17);
      expect(floor!.noise_db).toHaveLength(17);
      expect(floor!.matlab, `floor ${n} matlab metadata`).toBeDefined();
      expect(floor!.matlab!.trend_people).toEqual(movingMean3(floor!.people));
      expect(floor!.matlab!.trend_noise_db).toEqual(movingMean3(floor!.noise_db));
      expect(floor!.matlab!.peak_hour).toBe(busiestHour(floor!));
      expect(floor!.matlab!.quietest_hour).toBe(quietestHour(floor!));
      expect(floor!.matlab!.traffic_noise_r2).toBeGreaterThanOrEqual(0);
      expect(floor!.matlab!.traffic_noise_r2).toBeLessThanOrEqual(1);
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

  it('matches the MATLAB aggregation math applied to matlab/sample_snapshots.csv', () => {
    const csvPath = resolve(__dirname, '../../matlab/sample_snapshots.csv');
    const lines = readFileSync(csvPath, 'utf8').trim().split('\n').slice(1);

    const buckets = new Map<string, { occ: number[]; db: number[] }>();
    let validRows = 0;

    for (const line of lines) {
      const [minute, floorStr, onFloorStr, , , noiseStr, staleStr] = line.split(',');
      const floor = Number(floorStr);
      const stale = Number(staleStr);
      if (stale !== 0) continue;

      const { isWeekend, hour } = torontoWeekdayAndHour(minute);
      if (isWeekend || !PEAK_HOURS.includes(hour)) continue;

      const cap = SEATS_BY_FLOOR.get(floor);
      if (cap === undefined) continue;

      validRows++;
      const key = `${floor}:${hour}`;
      let bucket = buckets.get(key);
      if (!bucket) {
        bucket = { occ: [], db: [] };
        buckets.set(key, bucket);
      }
      bucket.occ.push(Math.min(cap, Math.max(0, Number(onFloorStr))));
      bucket.db.push(Number(noiseStr));
    }

    expect(PEAK_HOURS_DATA.pipeline?.sample_count).toBe(validRows);

    for (const n of FLOOR_NUMBERS) {
      const computedPeople: number[] = [];
      const computedNoise: number[] = [];
      for (const h of PEAK_HOURS) {
        const b = buckets.get(`${n}:${h}`);
        expect(b, `floor ${n} hour ${h}`).toBeDefined();
        const meanOcc = b!.occ.reduce((s, v) => s + v, 0) / b!.occ.length;
        computedPeople.push(Math.round(meanOcc));
        const meanEnergy = b!.db.reduce((s, d) => s + 10 ** (d / 10), 0) / b!.db.length;
        computedNoise.push(Math.round(10 * Math.log10(meanEnergy) * 10) / 10);
      }
      const floor = peakFor(n)!;
      expect(floor.people, `floor ${n} people`).toEqual(computedPeople);
      expect(floor.noise_db, `floor ${n} noise_db`).toEqual(computedNoise);
    }
  });
});

describe('peak hour helpers', () => {
  it('finds the busiest and quietest hours and computes 3-hr moving means', () => {
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

    // Fallback moving-mean calculation matches MATLAB movmean(..., 3) ('Endpoints', 'shrink').
    expect(trendPeopleFor(sample)).toEqual([7.5, 14.3, 19.7, 23.7, 16.3, 15]);
    expect(trendNoiseFor(sample)).toEqual([39.4, 41.2, 42.1, 43, 39.8, 39.3]);
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

describe('PeakHoursCharts rendering', () => {
  it('renders both MATLAB-backed graphs, trend polylines, and accessible tables for floors 2 to 8', () => {
    for (const n of FLOOR_NUMBERS) {
      const seats = SEATS_BY_FLOOR.get(n)!;
      const desktopHtml = renderToStaticMarkup(
        createElement(PeakHoursCharts, { floor: n, seats, compact: false, theme: themeForFloor(n) }),
      );
      expect(desktopHtml).toContain('FOOT TRAFFIC BY HOUR');
      expect(desktopHtml).toContain('NOISE BY HOUR');
      expect(desktopHtml).toContain('Typical weekday · sample (MATLAB)');
      expect(desktopHtml).toContain('3-hr trend');
      expect(desktopHtml).toContain('R²');
      // Foot traffic draws 2 polylines (halo + dashed 3-hr trend) and Noise draws 2 (3-hr trend + hourly Leq curve)
      expect(desktopHtml.match(/<polyline\b/g)?.length).toBe(4);
      expect(desktopHtml.match(/<table\b/g)?.length).toBe(2);

      const compactHtml = renderToStaticMarkup(
        createElement(PeakHoursCharts, { floor: n, seats, compact: true }),
      );
      expect(compactHtml).toContain('FOOT TRAFFIC BY HOUR');
      expect(compactHtml).toContain('NOISE BY HOUR');
      expect(compactHtml).toContain('3-hr trend');
    }
  });
});
