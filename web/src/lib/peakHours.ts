import peakData from '../data/peakHours.json';

export interface FloorPeakData {
  people: readonly number[];
  noise_db: readonly number[];
}

export interface PeakHoursDataset {
  source: string;
  description: string;
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
