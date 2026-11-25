import peakData from '../data/peakHours.json';

export interface FloorMatlabAnalytics {
  trend_people: readonly number[];
  trend_noise_db: readonly number[];
  peak_hour: number;
  peak_people: number;
  peak_utilization_pct: number;
  quietest_hour: number;
  quietest_db: number;
  loudest_hour: number;
  loudest_db: number;
  traffic_noise_r2: number;
  noise_slope_db_per_person: number;
}

export interface FloorPeakData {
  people: readonly number[];
  noise_db: readonly number[];
  matlab?: FloorMatlabAnalytics;
}

export interface PeakHoursPipelineInfo {
  engine: string;
  script: string;
  timezone: string;
  sample_count: number;
  people_method: string;
  noise_method: string;
  trend_method: string;
}

export interface PeakHoursDataset {
  source: string;
  description: string;
  pipeline?: PeakHoursPipelineInfo;
  hours: readonly number[];
  floors: Record<string, FloorPeakData>;
}

export const PEAK_HOURS_DATA: PeakHoursDataset = peakData;
export const PEAK_HOURS: readonly number[] = peakData.hours;

/** Typical-weekday hourly data for a floor, or null if the floor has none. */
export function peakFor(floor: number): FloorPeakData | null {
  const key = String(floor);
  if (!Object.prototype.hasOwnProperty.call(peakData.floors, key)) return null;
  return (peakData.floors as Record<string, FloorPeakData>)[key];
}

/** 3-point centered moving average matching MATLAB's `movmean(x, 3)` ('Endpoints', 'shrink'). */
export function movingMean3(values: readonly number[]): number[] {
  return values.map((_, i) => {
    const lo = Math.max(0, i - 1);
    const hi = Math.min(values.length, i + 2);
    let sum = 0;
    for (let j = lo; j < hi; j++) sum += values[j];
    const scaled = Number(((sum / (hi - lo)) * 10).toFixed(9));
    return Math.round(scaled) / 10;
  });
}

/** 3-hour occupancy trend computed by MATLAB (or exact fallback if omitted). */
export function trendPeopleFor(floor: Pick<FloorPeakData, 'people' | 'matlab'>): readonly number[] {
  if (floor.matlab?.trend_people && floor.matlab.trend_people.length === floor.people.length) {
    return floor.matlab.trend_people;
  }
  return movingMean3(floor.people);
}

/** 3-hour noise trend computed by MATLAB (or exact fallback if omitted). */
export function trendNoiseFor(floor: Pick<FloorPeakData, 'noise_db' | 'matlab'>): readonly number[] {
  if (floor.matlab?.trend_noise_db && floor.matlab.trend_noise_db.length === floor.noise_db.length) {
    return floor.matlab.trend_noise_db;
  }
  return movingMean3(floor.noise_db);
}

/** Index of the hour with the most people (first match on ties). */
export function busiestIndex(floor: Pick<FloorPeakData, 'people'>): number {
  let best = 0;
  for (let i = 1; i < floor.people.length; i++) {
    if (floor.people[i] > floor.people[best]) best = i;
  }
  return best;
}

/** Hour (24-hour clock) with the most people. */
export function busiestHour(floor: Pick<FloorPeakData, 'people'>, hours: readonly number[] = PEAK_HOURS): number {
  if (floor.people.length === 0) return hours[0] ?? 0;
  const idx = busiestIndex(floor);
  return hours[idx] ?? idx;
}

/** Index of the hour with the lowest noise level in dB (first match on ties). */
export function quietestIndex(floor: Pick<FloorPeakData, 'noise_db'>): number {
  let best = 0;
  for (let i = 1; i < floor.noise_db.length; i++) {
    if (floor.noise_db[i] < floor.noise_db[best]) best = i;
  }
  return best;
}

/** Hour (24-hour clock) with the lowest noise level in dB. */
export function quietestHour(floor: Pick<FloorPeakData, 'noise_db'>, hours: readonly number[] = PEAK_HOURS): number {
  if (floor.noise_db.length === 0) return hours[0] ?? 0;
  const idx = quietestIndex(floor);
  return hours[idx] ?? idx;
}

/** Formats a 24-hour integer (0–23) as "12 AM", "7 AM", "12 PM", "1 PM", etc. */
export function formatHour(h: number): string {
  const hour24 = ((Math.trunc(h) % 24) + 24) % 24;
  const period = hour24 >= 12 ? 'PM' : 'AM';
  const hour12 = hour24 % 12 || 12;
  return `${hour12} ${period}`;
}

/** Short hour label for dense chart axes, e.g. "7a", "12p", "1p". */
export function shortHour(h: number): string {
  const hour24 = ((Math.trunc(h) % 24) + 24) % 24;
  const period = hour24 >= 12 ? 'p' : 'a';
  const hour12 = hour24 % 12 || 12;
  return `${hour12}${period}`;
}
