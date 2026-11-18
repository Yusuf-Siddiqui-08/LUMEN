import { describe, expect, it } from 'vitest';
import { compareSeq, estimateZones, GateCounter, onFloor, seatsFree } from '../src/occupancy.js';

const msg = (seq: number, inT: number, outT: number) => ({ node: 'f7-gate-elevator', seq, in_total: inT, out_total: outT, flags: [] });

describe('running totals', () => {
  it('on_floor is ins minus outs (the hardware page example: 1240 - 1202 = 38)', () => {
    const g = new GateCounter('f7-gate-elevator');
    expect(g.apply(msg(18342, 1240, 1202), 0)).toBe('accepted');
    expect(onFloor([g])).toBe(38);
    expect(seatsFree(60, onFloor([g]))).toBe(22);
  });

  it('a missed message is fixed by the next running total', () => {
    const g = new GateCounter('n');
    g.apply(msg(1, 10, 2), 0);
    // seq 2 and 3 never arrive; seq 4 carries the latest totals
    g.apply(msg(4, 15, 4), 1);
    expect(g.net()).toBe(11);
  });

  it('sums every gate on the floor, and one gate can be negative', () => {
    const elevator = new GateCounter('a');
    const stairs = new GateCounter('b');
    elevator.apply(msg(1, 100, 60), 0); // +40
    stairs.apply(msg(1, 20, 35), 0); // -15: people came up by elevator, left by the stairs
    expect(onFloor([elevator, stairs])).toBe(25);
  });

  it('clamps on_floor at 0 and seats_free between 0 and capacity', () => {
    const g = new GateCounter('n');
    g.apply(msg(1, 5, 9), 0);
    expect(g.net()).toBe(-4);
    expect(onFloor([g])).toBe(0);
    expect(seatsFree(40, onFloor([g]))).toBe(40);
    expect(seatsFree(40, 47)).toBe(0);
  });
});

describe('duplicates and out-of-order messages', () => {
  it('ignores a duplicate sequence number', () => {
    const g = new GateCounter('n');
    g.apply(msg(10, 50, 20), 0);
    expect(g.apply(msg(10, 50, 20), 1)).toBe('duplicate');
    expect(g.net()).toBe(30);
  });

  it('ignores an older message that arrives late', () => {
    const g = new GateCounter('n');
    g.apply(msg(10, 50, 20), 0);
    g.apply(msg(12, 53, 20), 1);
    expect(g.apply(msg(11, 51, 20), 2)).toBe('out_of_order');
    expect(g.net()).toBe(33);
    expect(g.lastSeq).toBe(12);
  });

  it('handles the 16-bit sequence number wrapping around', () => {
    expect(compareSeq(65535, 0)).toBe('newer');
    expect(compareSeq(0, 65535)).toBe('older');
    const g = new GateCounter('n');
    g.apply(msg(65534, 100, 90), 0);
    expect(g.apply(msg(65535, 101, 90), 1)).toBe('accepted');
    expect(g.apply(msg(0, 102, 90), 2)).toBe('accepted');
    expect(g.apply(msg(65535, 101, 90), 3)).toBe('out_of_order');
    expect(g.net()).toBe(12);
  });

  it('drops a very late copy whose totals are close to the current ones', () => {
    const g = new GateCounter('n');
    g.apply(msg(500, 1240, 1202), 0);
    // 200 messages behind, totals barely lower: not a reboot, just old news
    expect(g.apply(msg(300, 1236, 1199), 1)).toBe('out_of_order');
    expect(g.net()).toBe(38);
  });
});

describe('node reboot (totals go down)', () => {
  it('keeps the people counted so far and re-baselines that gate', () => {
    const g = new GateCounter('n');
    g.apply(msg(18342, 1240, 1202), 0); // 38 on the floor
    // Node reboots: seq and totals restart near zero. 3 more in, 1 out since boot.
    expect(g.apply(msg(1, 3, 1), 1)).toBe('reboot');
    expect(g.net()).toBe(40);
    g.apply(msg(2, 5, 1), 2);
    expect(g.net()).toBe(42);
  });

  it('detects a reboot even when the new sequence number looks newer', () => {
    const g = new GateCounter('n');
    g.apply(msg(40000, 300, 280), 0); // 20
    // seq 0 is "ahead" of 40000 in 16-bit arithmetic, but totals dropped
    expect(g.apply(msg(0, 0, 0), 1)).toBe('reboot');
    expect(g.net()).toBe(20);
  });

  it('survives two reboots in a row', () => {
    const g = new GateCounter('n');
    g.apply(msg(900, 100, 90), 0); // 10
    g.apply(msg(1, 4, 0), 1); // reboot, 14
    g.apply(msg(1000, 2, 1), 2); // second reboot (seq looks newer), 15
    expect(g.net()).toBe(15);
  });
});

describe('nightly reset', () => {
  it('zeroes the count, then counts from the totals at reset time', () => {
    const g = new GateCounter('n');
    g.apply(msg(1, 1240, 1202), 0);
    g.resetBaseline();
    expect(g.net()).toBe(0);
    g.apply(msg(2, 1245, 1203), 1);
    expect(g.net()).toBe(4);
  });

  it('clears people carried over from a reboot', () => {
    const g = new GateCounter('n');
    g.apply(msg(500, 100, 50), 0);
    g.apply(msg(1, 2, 0), 1); // reboot: 52
    g.resetBaseline();
    expect(g.net()).toBe(0);
    g.apply(msg(2, 3, 0), 2);
    expect(g.net()).toBe(1);
  });

  it('uses the first totals as the baseline for a gate that was silent at reset time', () => {
    const g = new GateCounter('n');
    g.resetBaseline();
    g.apply(msg(77, 900, 880), 0);
    expect(g.net()).toBe(0);
    g.apply(msg(78, 902, 880), 1);
    expect(g.net()).toBe(2);
  });

  it('a fresh server with no saved state trusts the node net since boot', () => {
    const g = new GateCounter('n');
    g.apply(msg(77, 900, 880), 0);
    expect(g.net()).toBe(20);
  });
});

describe('zone estimates', () => {
  const zones = [
    { name: 'Quiet Study', estimate_pct: 34 },
    { name: 'Group Tables', estimate_pct: 82 },
  ];
  it('returns the configured values at the reference occupancy, marked estimated', () => {
    const z = estimateZones(zones, 63.3, 38, 60);
    expect(z).toEqual([
      { name: 'Quiet Study', pct: 34, estimated: true },
      { name: 'Group Tables', pct: 82, estimated: true },
    ]);
  });
  it('scales with occupancy, caps at 100, and a full floor is full everywhere', () => {
    expect(estimateZones(zones, 63.3, 19, 60).map((z) => z.pct)).toEqual([17, 41]);
    expect(estimateZones(zones, 63.3, 55, 60).map((z) => z.pct)).toEqual([49, 100]);
    expect(estimateZones(zones, 63.3, 60, 60).map((z) => z.pct)).toEqual([100, 100]);
    expect(estimateZones(zones, 63.3, 0, 60).map((z) => z.pct)).toEqual([0, 0]);
  });
});
