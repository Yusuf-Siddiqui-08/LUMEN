import { describe, expect, it } from 'vitest';
import { validateConfig } from '../src/config.js';
import { createIngest, parseHubStatus } from '../src/ingest.js';
import { floorNoise, median, MicReading, staleState } from '../src/occupancy.js';
import { LumenStore } from '../src/store.js';
import { resetDue } from '../src/time.js';

const config = validateConfig({
  site: { code: 'slc', name: 'Student Learning Centre' },
  timezone: 'America/Toronto',
  nightly_reset_hour: 3,
  stale_after_s: 120,
  elevator_wait_min: 6,
  floors: [
    {
      floor: 7,
      vibe: 'Quiet',
      capacity: 60,
      gates: [
        { name: 'elevator', node: 'f7-gate-elevator' },
        { name: 'stairs', node: 'f7-gate-stairs' },
      ],
      mics: [
        { name: 'quiet-side', node: 'f7-mic-quiet' },
        { name: 'social-side', node: 'f7-mic-social' },
        { name: 'middle', node: 'f7-mic-middle' },
      ],
      zones: [{ name: 'Quiet Study', estimate_pct: 34 }],
      zones_at_occupancy_pct: 63.3,
    },
    {
      floor: 4,
      vibe: 'Social',
      capacity: 56,
      gates: [{ name: 'elevator', node: 'f4-gate-elevator' }],
      mics: [{ name: 'quiet-side', node: 'f4-mic-quiet' }],
      zones: [],
      zones_at_occupancy_pct: 100,
    },
  ],
});

function setup(start = Date.UTC(2026, 10, 18, 16, 0, 0)) {
  let t = start;
  const store = new LumenStore(config, { now: () => t, log: () => {} });
  const ingest = createIngest(store, () => {});
  return {
    store,
    ingest,
    advance: (ms: number) => {
      t += ms;
    },
    gate: (floor: number, name: string, node: string, seq: number, inT: number, outT: number) =>
      ingest(`lumen/slc/f${floor}/gate/${name}`, JSON.stringify({ node, seq, in_total: inT, out_total: outT, flags: [], rssi: -61 })),
    noise: (floor: number, name: string, node: string, seq: number, leq: number) =>
      ingest(`lumen/slc/f${floor}/noise/${name}`, JSON.stringify({ node, seq, leq_db: leq, peak_db: leq + 10, window_s: 60 })),
  };
}

describe('store through the ingest path', () => {
  it('matches the API example on the hardware page', () => {
    const s = setup();
    expect(s.gate(7, 'elevator', 'f7-gate-elevator', 18342, 1240, 1202)).toBe('ok');
    s.noise(7, 'quiet-side', 'f7-mic-quiet', 5521, 42.3);
    const v = s.store.floorView(7)!;
    expect(v).toMatchObject({ floor: 7, vibe: 'Quiet', capacity: 60, on_floor: 38, seats_free: 22, noise_db: 42, stale: false });
    expect(v.updated).toBe('11:00:00'); // 16:00 UTC is 11:00 in Toronto in November
    expect(v.zones[0]).toEqual({ name: 'Quiet Study', pct: 34, estimated: true });
    expect(v.elevator_wait_min).toBe(6);
  });

  it('sums both doors of a floor', () => {
    const s = setup();
    s.gate(7, 'elevator', 'f7-gate-elevator', 1, 100, 70);
    s.gate(7, 'stairs', 'f7-gate-stairs', 1, 20, 25);
    expect(s.store.floorView(7)!.on_floor).toBe(25);
  });

  it('ignores duplicates, late copies and unknown nodes', () => {
    const s = setup();
    s.gate(7, 'elevator', 'f7-gate-elevator', 10, 50, 20);
    expect(s.gate(7, 'elevator', 'f7-gate-elevator', 10, 50, 20)).toBe('ignored');
    s.gate(7, 'elevator', 'f7-gate-elevator', 12, 52, 20);
    expect(s.gate(7, 'elevator', 'f7-gate-elevator', 11, 51, 20)).toBe('ignored');
    expect(s.gate(7, 'elevator', 'f9-gate-mystery', 1, 999, 0)).toBe('ignored');
    expect(s.store.floorView(7)!.on_floor).toBe(32);
    expect(s.store.stats.duplicate).toBe(1);
    expect(s.store.stats.out_of_order).toBe(1);
    expect(s.store.stats.rejected).toBe(1);
  });

  it('rejects bad topics and payloads', () => {
    const s = setup();
    expect(s.ingest('lumen/other/f7/gate/elevator', '{}')).toBe('bad_topic');
    expect(s.ingest('lumen/slc/f7/gate/elevator', 'not json')).toBe('bad_payload');
    expect(s.ingest('lumen/slc/f7/gate/elevator', JSON.stringify({ node: 'f7-gate-elevator', seq: 1, in_total: -3, out_total: 0 }))).toBe(
      'bad_payload',
    );
    expect(s.ingest('lumen/slc/f7/noise/quiet-side', JSON.stringify({ node: 'f7-mic-quiet', seq: 1 }))).toBe('bad_payload');
  });

  it('nightly reset zeroes every floor, and counting continues from there', () => {
    const s = setup();
    s.gate(7, 'elevator', 'f7-gate-elevator', 1, 1240, 1202);
    s.gate(4, 'elevator', 'f4-gate-elevator', 1, 500, 440);
    s.store.nightlyReset('2026-11-19');
    expect(s.store.floorView(7)!.on_floor).toBe(0);
    expect(s.store.floorView(4)!.seats_free).toBe(56);
    s.gate(7, 'elevator', 'f7-gate-elevator', 2, 1243, 1202);
    expect(s.store.floorView(7)!.on_floor).toBe(3);
    expect(s.store.lastResetDate).toBe('2026-11-19');
  });

  it('keeps baselines across a restart via exportState/importState', () => {
    const a = setup();
    a.gate(7, 'elevator', 'f7-gate-elevator', 5000, 1240, 1202);
    a.store.nightlyReset('2026-11-19');
    a.gate(7, 'elevator', 'f7-gate-elevator', 5001, 1250, 1202);
    const saved = a.store.exportState();
    const b = setup();
    b.store.importState(JSON.parse(JSON.stringify(saved)));
    b.gate(7, 'elevator', 'f7-gate-elevator', 5002, 1251, 1202);
    expect(b.store.floorView(7)!.on_floor).toBe(11);
    // and a node reboot during the downtime is still caught
    const c = setup();
    c.store.importState(JSON.parse(JSON.stringify(saved)));
    c.gate(7, 'elevator', 'f7-gate-elevator', 1, 2, 0);
    expect(c.store.floorView(7)!.on_floor).toBe(12);
  });
});

describe('stale detection', () => {
  it('is stale before any data arrives', () => {
    const s = setup();
    expect(s.store.floorView(7)).toMatchObject({ stale: true, stale_reason: 'no_data', updated: null, age_s: null });
  });

  it('goes stale after 2 minutes of silence, and a heartbeat keeps it fresh', () => {
    const s = setup();
    s.gate(7, 'elevator', 'f7-gate-elevator', 1, 10, 0);
    s.advance(119_000);
    expect(s.store.floorView(7)!.stale).toBe(false);
    s.advance(2_000);
    expect(s.store.floorView(7)).toMatchObject({ stale: true, stale_reason: 'silent', age_s: 121, on_floor: 10 });
    expect(s.ingest('lumen/slc/f7/hub/status', 'online')).toBe('ok');
    expect(s.store.floorView(7)!.stale).toBe(false);
  });

  it('goes stale at once when the hub last will says offline', () => {
    const s = setup();
    s.gate(7, 'elevator', 'f7-gate-elevator', 1, 10, 0);
    s.ingest('lumen/slc/f7/hub/status', 'offline');
    expect(s.store.floorView(7)).toMatchObject({ stale: true, stale_reason: 'hub_offline' });
    s.gate(7, 'elevator', 'f7-gate-elevator', 2, 11, 0);
    expect(s.store.floorView(7)!.stale).toBe(false);
  });

  it('only affects the floor that went quiet', () => {
    const s = setup();
    s.gate(7, 'elevator', 'f7-gate-elevator', 1, 10, 0);
    s.gate(4, 'elevator', 'f4-gate-elevator', 1, 10, 0);
    s.advance(100_000);
    s.ingest('lumen/slc/f4/hub/status', JSON.stringify({ status: 'online', uptime_s: 99 }));
    s.advance(30_000);
    expect(s.store.floorView(7)!.stale).toBe(true);
    expect(s.store.floorView(4)!.stale).toBe(false);
  });

  it('staleState covers each case directly', () => {
    expect(staleState(null, null, 0, 120_000)).toEqual({ stale: true, reason: 'no_data' });
    expect(staleState(0, true, 120_000, 120_000)).toEqual({ stale: false, reason: null });
    expect(staleState(0, true, 120_001, 120_000)).toEqual({ stale: true, reason: 'silent' });
    expect(staleState(0, false, 1, 120_000)).toEqual({ stale: true, reason: 'hub_offline' });
  });

  it('parses hub status in plain, quoted and JSON forms', () => {
    expect(parseHubStatus('online')).toBe('online');
    expect(parseHubStatus('"offline"')).toBe('offline');
    expect(parseHubStatus('{"status":"online","uptime_s":5}')).toBe('online');
    expect(parseHubStatus('OFFLINE')).toBe('offline');
    expect(parseHubStatus('rebooting')).toBeNull();
  });
});

describe('noise', () => {
  it('median of odd and even counts', () => {
    expect(median([])).toBeNull();
    expect(median([42.3])).toBe(42.3);
    expect(median([60, 40, 50])).toBe(50);
    expect(median([40, 44, 60, 70])).toBe(52);
  });

  it('floor noise is the median of each mic latest Leq, rounded in the API', () => {
    const s = setup();
    s.noise(7, 'quiet-side', 'f7-mic-quiet', 1, 41.2);
    s.noise(7, 'social-side', 'f7-mic-social', 1, 58.9);
    s.noise(7, 'middle', 'f7-mic-middle', 1, 47.6);
    expect(s.store.floorView(7)!.noise_db).toBe(48);
    // a newer reading from one mic replaces its old one
    s.noise(7, 'social-side', 'f7-mic-social', 2, 45.0);
    expect(s.store.floorView(7)!.noise_db).toBe(45);
  });

  it('a door slam in one mic does not move the median far, and stale mics are left out', () => {
    const now = 1_000_000;
    const mic = (leq: number, seen: number) => {
      const m = new MicReading('x');
      m.apply({ node: 'x', seq: 1, leq_db: leq }, seen);
      return m;
    };
    expect(floorNoise([mic(40, now), mic(42, now), mic(95, now)], now, 120_000)).toBe(42);
    expect(floorNoise([mic(40, now), mic(70, now - 200_000)], now, 120_000)).toBe(40);
    expect(floorNoise([mic(70, now - 200_000)], now, 120_000)).toBeNull();
  });

  it('a stale floor keeps showing its last known noise level', () => {
    const s = setup();
    s.noise(7, 'quiet-side', 'f7-mic-quiet', 1, 41.2);
    s.noise(7, 'social-side', 'f7-mic-social', 1, 47.0);
    s.advance(300_000);
    expect(s.store.floorView(7)).toMatchObject({ stale: true, noise_db: 44 });
  });
});

describe('nightly reset timing (America/Toronto)', () => {
  const tz = 'America/Toronto';
  it('fires once during the 3 a.m. hour in winter (EST, UTC-5)', () => {
    const at0300 = Date.UTC(2026, 11, 2, 8, 0, 0); // 03:00 EST
    expect(resetDue(at0300 - 60_000, tz, 3, null)).toBeNull(); // 02:59
    expect(resetDue(at0300, tz, 3, null)).toBe('2026-12-02');
    expect(resetDue(at0300 + 30 * 60_000, tz, 3, '2026-12-02')).toBeNull();
  });
  it('follows daylight saving time (EDT, UTC-4)', () => {
    const at0300 = Date.UTC(2026, 6, 15, 7, 0, 0); // 03:00 EDT
    expect(resetDue(at0300, tz, 3, '2026-07-14')).toBe('2026-07-15');
    expect(resetDue(at0300 - 60 * 60_000, tz, 3, '2026-07-14')).toBeNull();
  });
  it('does not reset in the middle of the day after missing the hour', () => {
    expect(resetDue(Date.UTC(2026, 10, 18, 16, 0, 0), tz, 3, '2026-11-17')).toBeNull();
  });
});
