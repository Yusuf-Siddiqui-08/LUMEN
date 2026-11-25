/**
 * Deterministic seat, table, and room occupancy mapper for the detailed SLC architectural plans.
 *
 * LUMEN counts people per floor via entrance gates and computes live estimated zone occupancy
 * percentages (`Quiet Study`, `Group Tables`, `Lounge Area`, `Computer Area`). This module maps
 * those live/simulated numbers onto every individual seat, table, and room of the architectural
 * plan so:
 *  - Occupied seats, tables, and rooms render in RED (`#F25E5E`).
 *  - Vacant seats, tables, and rooms render in GREEN (`#3DDB96`).
 *  - Occupancy fills cohesive units (rooms and modular table bays) in a deterministic organic
 *    spatial order, so when live headcount ticks up/down by ±1 person, only the boundary seats
 *    smoothly flip state rather than reshuffling the entire floor.
 */

import type { Floor } from './logic';
import type { DetailedFloorPlan, TableItem, ZoneKey } from './slcPlans';

export interface RoomOccupancy {
  occupied: boolean;
  usedSeats: number;
  totalSeats: number;
}

export interface TableOccupancy {
  occupied: boolean;
  usedSeats: number;
  totalSeats: number;
}

export interface FloorOccupancySummary {
  stale: boolean;
  hasLiveData: boolean;
  occupancyPct: number;
  totalSeats: number;
  occupiedSeats: number;
  vacantSeats: number;
  totalTables: number;
  occupiedTables: number;
  vacantTables: number;
  totalRooms: number;
  occupiedRooms: number;
  vacantRooms: number;
}

export interface FloorOccupancyMap {
  seatOccupied: Map<string, boolean>;
  tableStatus: Map<string, TableOccupancy>;
  roomStatus: Map<string, RoomOccupancy>;
  summary: FloorOccupancySummary;
}

/** Stable 32-bit FNV-1a hash for deterministic, spatially scattered unit ordering. */
function hashStr(s: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return h >>> 0;
}

function clamp(v: number, lo: number, hi: number): number {
  return Math.max(lo, Math.min(hi, v));
}

interface OccupancyCluster {
  key: string;
  zone: ZoneKey;
  rank: number;
  seatIds: string[];
}

/**
 * Group seats into realistic occupancy clusters (enclosed rooms fill cohesively, individual table
 * bays fill cohesively, and loose beanbags/poufs fill individually) ordered deterministically so
 * partial occupancy spreads naturally across the floorplate.
 */
function buildClusters(plan: DetailedFloorPlan): Map<ZoneKey, OccupancyCluster[]> {
  const byZone = new Map<ZoneKey, OccupancyCluster[]>([
    ['Quiet Study', []],
    ['Group Tables', []],
    ['Lounge Area', []],
    ['Computer Area', []],
  ]);

  const claimedSeats = new Set<string>();

  // 1. Enclosed rooms: small/medium study rooms & offices fill as one cohesive unit;
  //    large seminar halls / labs (>12 seats) fill by individual desk rows/bays inside the room
  //    so partial occupancy inside a large lecture hall looks realistic too.
  const tableById = new Map<string, TableItem>(plan.tables.map((t) => [t.id, t]));
  for (const rm of plan.rooms) {
    if (rm.seatIds.length === 0) continue;
    if (rm.seatIds.length <= 12) {
      byZone.get(rm.zone)!.push({
        key: rm.id,
        zone: rm.zone,
        rank: hashStr(`${plan.floor}:rm:${rm.id}`),
        seatIds: rm.seatIds,
      });
      for (const sid of rm.seatIds) claimedSeats.add(sid);
    } else {
      // Sub-group large rooms by their interior table bays
      for (const tid of rm.tableIds) {
        const tbl = tableById.get(tid);
        if (!tbl || tbl.seatIds.length === 0) continue;
        byZone.get(tbl.zone)!.push({
          key: tbl.id,
          zone: tbl.zone,
          rank: hashStr(`${plan.floor}:rtbl:${tbl.id}`),
          seatIds: tbl.seatIds,
        });
        for (const sid of tbl.seatIds) claimedSeats.add(sid);
      }
    }
  }

  // 2. Open-floor tables / desks / pods
  for (const tbl of plan.tables) {
    const remaining = tbl.seatIds.filter((sid) => !claimedSeats.has(sid));
    if (remaining.length === 0) continue;
    byZone.get(tbl.zone)!.push({
      key: tbl.id,
      zone: tbl.zone,
      rank: hashStr(`${plan.floor}:tbl:${tbl.id}`),
      seatIds: remaining,
    });
    for (const sid of remaining) claimedSeats.add(sid);
  }

  // 3. Standalone seats (beanbags, poufs, loose chairs)
  for (const s of plan.seats) {
    if (claimedSeats.has(s.id)) continue;
    byZone.get(s.zone)!.push({
      key: s.id,
      zone: s.zone,
      rank: hashStr(`${plan.floor}:seat:${s.id}`),
      seatIds: [s.id],
    });
    claimedSeats.add(s.id);
  }

  for (const list of byZone.values()) {
    list.sort((a, b) => a.rank - b.rank || a.key.localeCompare(b.key));
  }

  return byZone;
}

/**
 * Compute live red/green occupancy across every seat, table, and room on a floor plan.
 *
 * When `liveFloor` is null/undefined (e.g. before data loads or in static contexts), all seats
 * default to vacant (`hasLiveData: false`). When `liveFloor.stale` is true, `summary.stale` is
 * true so the renderer draws muted slate instead of misleading red/green.
 */
export function computeFloorOccupancy(plan: DetailedFloorPlan, liveFloor?: Floor | null): FloorOccupancyMap {
  const seatOccupied = new Map<string, boolean>();
  const tableStatus = new Map<string, TableOccupancy>();
  const roomStatus = new Map<string, RoomOccupancy>();

  const totalSeats = plan.seats.length;
  const totalTables = plan.tables.length;
  const totalRooms = plan.rooms.length;

  const hasLiveData = Boolean(liveFloor);
  const stale = Boolean(liveFloor?.stale);

  // Initialize every seat as vacant
  for (const s of plan.seats) seatOccupied.set(s.id, false);

  if (liveFloor && !stale && totalSeats > 0) {
    const isFull = liveFloor.free === 0;
    const floorRatio = isFull ? 1 : liveFloor.cap > 0 ? clamp((liveFloor.cap - liveFloor.free) / liveFloor.cap, 0, 1) : 0;

    // Look up live zone percentages from the floor payload
    const zonePctMap = new Map<string, number>();
    for (const z of liveFloor.zones) zonePctMap.set(z.name, clamp(z.pct, 0, 100));

    const clustersByZone = buildClusters(plan);
    const zoneSeatCounts = new Map<ZoneKey, number>();
    for (const [z, list] of clustersByZone.entries()) {
      zoneSeatCounts.set(
        z,
        list.reduce((sum, c) => sum + c.seatIds.length, 0),
      );
    }

    // Target occupied seats per zone, scaled gently so the sum matches overall floor occupancy
    // while preserving the relative busyness between zones (e.g. busy group rooms vs quiet hall).
    const rawTargets = new Map<ZoneKey, number>();
    let rawSum = 0;
    for (const [z, count] of zoneSeatCounts.entries()) {
      if (count === 0) {
        rawTargets.set(z, 0);
        continue;
      }
      const pct = isFull ? 100 : (zonePctMap.get(z) ?? floorRatio * 100);
      const t = (count * pct) / 100;
      rawTargets.set(z, t);
      rawSum += t;
    }

    const desiredTotal = isFull ? totalSeats : Math.round(totalSeats * floorRatio);
    const scale = !isFull && rawSum > 0 && desiredTotal > 0 ? desiredTotal / rawSum : 1;

    // Fill each zone's deterministically ordered clusters up to its target seat count
    for (const [z, list] of clustersByZone.entries()) {
      const zCap = zoneSeatCounts.get(z) ?? 0;
      if (zCap === 0) continue;
      let target = isFull ? zCap : Math.round(clamp((rawTargets.get(z) ?? 0) * scale, 0, zCap));
      for (const cluster of list) {
        if (target <= 0) break;
        const take = Math.min(target, cluster.seatIds.length);
        for (let i = 0; i < take; i++) {
          seatOccupied.set(cluster.seatIds[i], true);
        }
        target -= take;
      }
    }
  }

  // Derive table occupancy from its seats:
  // A table is occupied (Red) when at least half its seats are in use (or any seat for 1–2 seat desks).
  let occupiedTables = 0;
  for (const tbl of plan.tables) {
    let used = 0;
    for (const sid of tbl.seatIds) {
      if (seatOccupied.get(sid)) used += 1;
    }
    const threshold = tbl.seatIds.length <= 2 ? 1 : Math.ceil(tbl.seatIds.length * 0.5);
    const occupied = !stale && tbl.seatIds.length > 0 && used >= threshold;
    if (occupied) occupiedTables += 1;
    tableStatus.set(tbl.id, { occupied, usedSeats: used, totalSeats: tbl.seatIds.length });
  }

  // Derive room occupancy from its seats:
  // A group room / office is occupied (Red) once someone is using it (or >= 35% for large seminar halls).
  let occupiedRooms = 0;
  for (const rm of plan.rooms) {
    let used = 0;
    for (const sid of rm.seatIds) {
      if (seatOccupied.get(sid)) used += 1;
    }
    const threshold = rm.seatIds.length <= 12 ? 1 : Math.ceil(rm.seatIds.length * 0.35);
    const occupied = !stale && rm.seatIds.length > 0 && used >= threshold;
    if (occupied) occupiedRooms += 1;
    roomStatus.set(rm.id, { occupied, usedSeats: used, totalSeats: rm.seatIds.length });
  }

  let occupiedSeats = 0;
  for (const occ of seatOccupied.values()) {
    if (occ) occupiedSeats += 1;
  }

  const occupancyPct =
    liveFloor && !stale
      ? liveFloor.free === 0
        ? 100
        : liveFloor.cap > 0
          ? Math.round(((liveFloor.cap - liveFloor.free) / liveFloor.cap) * 100)
          : 0
      : 0;

  return {
    seatOccupied,
    tableStatus,
    roomStatus,
    summary: {
      stale,
      hasLiveData,
      occupancyPct,
      totalSeats,
      occupiedSeats,
      vacantSeats: totalSeats - occupiedSeats,
      totalTables,
      occupiedTables,
      vacantTables: totalTables - occupiedTables,
      totalRooms,
      occupiedRooms,
      vacantRooms: totalRooms - occupiedRooms,
    },
  };
}
