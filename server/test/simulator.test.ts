import { readFileSync } from 'node:fs';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { validateConfig } from '../src/config.js';
import { createIngest } from '../src/ingest.js';
import { startSimulator } from '../src/simulator.js';
import { LumenStore } from '../src/store.js';

/** Small seeded random generator so the test is repeatable. */
function mulberry32(seed: number) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const config = validateConfig(JSON.parse(readFileSync(new URL('../config/floors.json', import.meta.url), 'utf8')));

describe('simulator', () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it('feeds the real ingest path and drifts around the sample values', () => {
    vi.useFakeTimers({ now: Date.UTC(2026, 10, 18, 16, 0, 0) });
    const store = new LumenStore(config, { simulated: true, log: () => {} });
    const ingest = createIngest(store, () => {});
    const results: string[] = [];
    const sim = startSimulator(config, (topic, payload) => results.push(ingest(topic, payload)), { rng: mulberry32(2026) });

    // Straight away every floor has data that matches the prototype's sample.
    const first = Object.fromEntries(store.floorViews().map((f) => [f.floor, f]));
    expect(first[7]).toMatchObject({ seats_free: 22, stale: false });
    expect(first[4].seats_free).toBe(0);

    let fullSamples = 0;
    const samples = 60;
    for (let i = 0; i < samples; i++) {
      vi.advanceTimersByTime(10_000);
      const views = store.floorViews();
      for (const f of views) {
        expect(f.stale).toBe(false);
        expect(f.on_floor).toBeGreaterThanOrEqual(0);
        expect(f.seats_free).toBeLessThanOrEqual(f.capacity);
        expect(f.noise_db).not.toBeNull();
      }
      const f7 = views.find((f) => f.floor === 7)!;
      expect(Math.abs(f7.seats_free - 22)).toBeLessThanOrEqual(12);
      if (views.find((f) => f.floor === 4)!.seats_free === 0) fullSamples++;
    }
    // Floor 4 is "mostly full".
    expect(fullSamples / samples).toBeGreaterThan(0.6);
    // Every message the fake nodes sent was well formed and accepted.
    expect(results.every((r) => r === 'ok')).toBe(true);
    expect(store.stats.duplicate + store.stats.out_of_order + store.stats.rejected).toBe(0);
    sim.stop();
  });

  it('can make a floor go silent so the stale path can be demoed', () => {
    vi.useFakeTimers({ now: Date.UTC(2026, 10, 18, 16, 0, 0) });
    const store = new LumenStore(config, { simulated: true, log: () => {} });
    const ingest = createIngest(store, () => {});
    const sim = startSimulator(config, (t, p) => void ingest(t, p), {
      silentFloors: [2],
      silentAfterMs: 10_000,
      rng: mulberry32(7),
    });
    vi.advanceTimersByTime(10_000 + config.stale_after_s * 1000 + 5_000);
    expect(store.floorView(2)).toMatchObject({ stale: true, stale_reason: 'silent' });
    expect(store.floorView(3)!.stale).toBe(false);
    sim.stop();
  });
});
