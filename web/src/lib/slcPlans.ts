/**
 * High-detail architectural floor plans for TMU's Student Learning Centre (SLC), Levels 2 to 8.
 *
 * Traced directly from the genuine SLC architectural drawings (Levels 2–8, aligned on the shared
 * North Service Core [190..440, 60..170] and South-East Core [334..416, 404..470]).
 * Every floor preserves the building footprint, south curtain-wall glazing band, atrium voids,
 * terraced amphitheatre steps, bridges, partition walls, structural columns, washrooms, elevators,
 * stairwells, rooms, tables, desks, counters, lounge pods, beanbags, and individual seats.
 */

import type { Pt } from './floorPlans';

export type ZoneKey = 'Quiet Study' | 'Group Tables' | 'Lounge Area' | 'Computer Area';

export type SeatShape = 'chair' | 'pouf' | 'stool' | 'sofa';

export interface SeatItem {
  id: string;
  cx: number;
  cy: number;
  r: number;
  angle?: number;
  shape: SeatShape;
  zone: ZoneKey;
  /** Table or lounge unit this seat belongs to (for cohesive occupancy filling). */
  unitId: string;
  /** Enclosing room id if this seat is inside a room. */
  roomId?: string;
}

export interface TableItem {
  id: string;
  shape: 'rect' | 'circle' | 'polygon';
  cx: number;
  cy: number;
  w?: number;
  h?: number;
  r?: number;
  angle?: number;
  pts?: Pt[];
  zone: ZoneKey;
  unitId: string;
  roomId?: string;
  seatIds: string[];
  kind?: 'table' | 'desk' | 'counter' | 'pod' | 'sofa';
}

export interface RoomItem {
  id: string;
  pts: Pt[];
  kind: 'studyRoom' | 'room' | 'computers';
  zone: ZoneKey;
  label?: string;
  labelPos?: Pt;
  seatIds: string[];
  tableIds: string[];
}

export interface StairBlock {
  x: number;
  y: number;
  w: number;
  h: number;
  /** Orientation of step treads. */
  treads: 'vertical' | 'horizontal';
  split?: boolean;
}

export interface ElevatorShaft {
  x: number;
  y: number;
  w: number;
  h: number;
  dashed?: boolean;
}

export interface TerraceBench {
  x: number;
  y: number;
  w: number;
  h: number;
  angle: number;
}

export interface HatchBand {
  pts: Pt[];
  /** Line angle in degrees for parallel step / louver hatch lines. */
  angle: number;
  spacing: number;
  opacity?: number;
}

export interface FloorCore {
  northBox: { x: number; y: number; w: number; h: number };
  seBox: { x: number; y: number; w: number; h: number };
  elevators: ElevatorShaft[];
  stairs: StairBlock[];
  /** Lower-level shuttle elevator present on Levels 2 and 3. */
  lowerLift?: ElevatorShaft;
  /** Secondary service rooms (storage, mechanical) drawn in neutral core fill. */
  serviceRooms: { x: number; y: number; w: number; h: number; label?: string }[];
  /** Washroom main block + accessible WC. */
  washroom: { x: number; y: number; w: number; h: number };
  accessibleWc: { x: number; y: number; w: number; h: number };
}

export interface DetailedFloorPlan {
  floor: number;
  title: string;
  nickname: string;
  plate: Pt[];
  /** Iconic sloped south curtain-wall glazing apron (Levels 3–8). */
  southGlazing?: Pt[];
  /** Open atrium voids / lightwells (Levels 2–3). */
  voids?: { pts: Pt[]; label?: string }[];
  /** Pedestrian bridge or bridge roof on the east edge (Levels 2–4). */
  bridge?: { pts: Pt[]; label?: string; roofOnly?: boolean };
  /** Architectural shaded zones (e.g. NW terrace on L2, SW sloped bluff on L3). */
  shadedZones?: { pts: Pt[]; label?: string; opacity?: number }[];
  /** Parallel step runs, grand atrium stairs, escalators, and amphitheatre tier lines. */
  hatchBands?: HatchBand[];
  /** Crisp architectural lines (terrace risers, ramp edges, balustrades). */
  featureLines?: { pts: Pt[]; dashed?: boolean; width?: number }[];
  /** Built-in timber benches (e.g. Level 6 Beach tiers). */
  benches?: TerraceBench[];
  /** Interior architectural partition walls. */
  walls?: [Pt, Pt][];
  /** Structural square columns. */
  columns: Pt[];
  core: FloorCore;
  rooms: RoomItem[];
  tables: TableItem[];
  seats: SeatItem[];
  /** Subtle zone micro-labels placed in open circulation spaces. */
  annotations?: { x: number; y: number; text: string; angle?: number }[];
}

/* ============================================================================
 * Geometry & Architectural Furniture Builder
 * ============================================================================ */

const DEG = Math.PI / 180;

function rot(cx: number, cy: number, dx: number, dy: number, deg: number): Pt {
  if (!deg) return [round1(cx + dx), round1(cy + dy)];
  const rad = deg * DEG;
  const c = Math.cos(rad);
  const s = Math.sin(rad);
  return [round1(cx + dx * c - dy * s), round1(cy + dx * s + dy * c)];
}

function round1(n: number): number {
  return Math.round(n * 10) / 10;
}

function rectPts(x: number, y: number, w: number, h: number): Pt[] {
  return [
    [x, y],
    [x + w, y],
    [x + w, y + h],
    [x, y + h],
  ];
}

function polyCentroid(pts: Pt[]): Pt {
  let sx = 0;
  let sy = 0;
  for (const [x, y] of pts) {
    sx += x;
    sy += y;
  }
  return [round1(sx / pts.length), round1(sy / pts.length)];
}

/** Shared structural service core aligned identically across Levels 2–8. */
function makeCore(seY = 404, lowerLift = false): FloorCore {
  return {
    northBox: { x: 190, y: 60, w: 250, h: 110 },
    seBox: { x: 334, y: seY, w: 82, h: 66 },
    elevators: [
      { x: 217, y: 141, w: 29, h: 27 },
      { x: 248, y: 141, w: 29, h: 27 },
      { x: 279, y: 141, w: 29, h: 27 },
      { x: 310, y: 141, w: 29, h: 27 },
      // East mechanical / double-X shaft
      { x: 362, y: 141, w: 76, h: 27, dashed: true },
      // South-east elevator shaft
      { x: 336, y: seY + 2, w: 78, h: 26, dashed: true },
    ],
    stairs: [
      { x: 205, y: 62, w: 66, h: 38, treads: 'vertical', split: true },
      { x: 400, y: 62, w: 38, h: 38, treads: 'vertical', split: true },
      { x: 342, y: seY + 30, w: 66, h: 34, treads: 'vertical', split: true },
    ],
    lowerLift: lowerLift ? { x: 366, y: seY + 69, w: 26, h: 28 } : undefined,
    serviceRooms: [
      { x: 214, y: 102, w: 58, h: 37, label: '16' },
      { x: 362, y: 117, w: 30, h: 22, label: '15' },
      { x: 394, y: 102, w: 44, h: 37, label: '16' },
    ],
    washroom: { x: 274, y: 62, w: 66, h: 77 },
    accessibleWc: { x: 344, y: 62, w: 30, h: 40 },
  };
}

class PlanBuilder {
  readonly rooms: RoomItem[] = [];
  readonly tables: TableItem[] = [];
  readonly seats: SeatItem[] = [];
  private seq = 0;

  constructor(private readonly floor: number) {}

  private uid(prefix: string): string {
    this.seq += 1;
    return `f${this.floor}-${prefix}-${this.seq}`;
  }

  /** Add a rectangular table with configurable chairs around its 4 edges. */
  rectTable(opts: {
    cx: number;
    cy: number;
    w: number;
    h: number;
    angle?: number;
    top?: number;
    bottom?: number;
    left?: number;
    right?: number;
    seatR?: number;
    seatGap?: number;
    zone: ZoneKey;
    roomId?: string;
    unitId?: string;
    kind?: TableItem['kind'];
    seatShape?: SeatShape;
  }): TableItem {
    const angle = opts.angle ?? 0;
    const seatR = opts.seatR ?? 2.7;
    const gap = opts.seatGap ?? seatR + 2.0;
    const tid = this.uid('tbl');
    const unitId = opts.unitId ?? opts.roomId ?? tid;
    const shape = opts.seatShape ?? 'chair';
    const seatIds: string[] = [];

    const addEdge = (count: number, fn: (t: number) => [number, number, number]) => {
      for (let i = 0; i < count; i++) {
        const t = (i + 0.5) / count - 0.5;
        const [dx, dy, sAng] = fn(t);
        const [sx, sy] = rot(opts.cx, opts.cy, dx, dy, angle);
        const sid = this.uid('s');
        this.seats.push({
          id: sid,
          cx: sx,
          cy: sy,
          r: seatR,
          angle: angle + sAng,
          shape,
          zone: opts.zone,
          unitId,
          roomId: opts.roomId,
        });
        seatIds.push(sid);
      }
    };

    if (opts.top) addEdge(opts.top, (t) => [t * opts.w, -(opts.h / 2 + gap), 0]);
    if (opts.bottom) addEdge(opts.bottom, (t) => [t * opts.w, opts.h / 2 + gap, 180]);
    if (opts.left) addEdge(opts.left, (t) => [-(opts.w / 2 + gap), t * opts.h, 270]);
    if (opts.right) addEdge(opts.right, (t) => [opts.w / 2 + gap, t * opts.h, 90]);

    const tbl: TableItem = {
      id: tid,
      shape: 'rect',
      cx: round1(opts.cx),
      cy: round1(opts.cy),
      w: round1(opts.w),
      h: round1(opts.h),
      angle,
      zone: opts.zone,
      unitId,
      roomId: opts.roomId,
      seatIds,
      kind: opts.kind ?? 'table',
    };
    this.tables.push(tbl);
    return tbl;
  }

  /** Add a circular table with evenly spaced chairs around it. */
  roundTable(opts: {
    cx: number;
    cy: number;
    r: number;
    seats: number;
    angleOffset?: number;
    seatR?: number;
    zone: ZoneKey;
    roomId?: string;
    unitId?: string;
  }): TableItem {
    const tid = this.uid('rtbl');
    const unitId = opts.unitId ?? opts.roomId ?? tid;
    const seatR = opts.seatR ?? 2.6;
    const dist = opts.r + seatR + 1.8;
    const offset = opts.angleOffset ?? 45;
    const seatIds: string[] = [];

    for (let i = 0; i < opts.seats; i++) {
      const deg = offset + (360 / opts.seats) * i;
      const rad = deg * DEG;
      const sid = this.uid('s');
      this.seats.push({
        id: sid,
        cx: round1(opts.cx + Math.cos(rad) * dist),
        cy: round1(opts.cy + Math.sin(rad) * dist),
        r: seatR,
        angle: deg + 90,
        shape: 'chair',
        zone: opts.zone,
        unitId,
        roomId: opts.roomId,
      });
      seatIds.push(sid);
    }

    const tbl: TableItem = {
      id: tid,
      shape: 'circle',
      cx: round1(opts.cx),
      cy: round1(opts.cy),
      r: round1(opts.r),
      zone: opts.zone,
      unitId,
      roomId: opts.roomId,
      seatIds,
      kind: 'table',
    };
    this.tables.push(tbl);
    return tbl;
  }

  /**
   * Add a bank of modular rectangular study tables laid end-to-end along an angle.
   * Each modular bay is its own TableItem & unit so realistic clusters of seats flip together.
   */
  tableBank(opts: {
    x: number;
    y: number;
    bays: number;
    bayW: number;
    bayH: number;
    gap?: number;
    angle?: number;
    topPerBay?: number;
    bottomPerBay?: number;
    seatR?: number;
    zone: ZoneKey;
    roomId?: string;
    kind?: TableItem['kind'];
  }): TableItem[] {
    const angle = opts.angle ?? 0;
    const gap = opts.gap ?? 1.5;
    const step = opts.bayW + gap;
    const out: TableItem[] = [];
    for (let i = 0; i < opts.bays; i++) {
      const [cx, cy] = rot(opts.x, opts.y, i * step + opts.bayW / 2, 0, angle);
      out.push(
        this.rectTable({
          cx,
          cy,
          w: opts.bayW,
          h: opts.bayH,
          angle,
          top: opts.topPerBay ?? 2,
          bottom: opts.bottomPerBay ?? 2,
          seatR: opts.seatR ?? 2.45,
          seatGap: (opts.seatR ?? 2.45) + 1.7,
          zone: opts.zone,
          roomId: opts.roomId,
          kind: opts.kind ?? 'table',
        }),
      );
    }
    return out;
  }

  /** Add a linear counter/window bar with stools or chairs along one side. */
  counter(opts: {
    x1: number;
    y1: number;
    x2: number;
    y2: number;
    depth?: number;
    seats: number;
    side?: 1 | -1;
    seatR?: number;
    seatShape?: SeatShape;
    zone: ZoneKey;
    roomId?: string;
  }): TableItem {
    const dx = opts.x2 - opts.x1;
    const dy = opts.y2 - opts.y1;
    const len = Math.hypot(dx, dy);
    const angle = Math.atan2(dy, dx) / DEG;
    const cx = (opts.x1 + opts.x2) / 2;
    const cy = (opts.y1 + opts.y2) / 2;
    const depth = opts.depth ?? 5.5;
    const side = opts.side ?? 1;
    return this.rectTable({
      cx,
      cy,
      w: len,
      h: depth,
      angle,
      top: side === -1 ? opts.seats : 0,
      bottom: side === 1 ? opts.seats : 0,
      seatR: opts.seatR ?? 2.5,
      seatGap: (opts.seatR ?? 2.5) + 1.8,
      seatShape: opts.seatShape ?? 'stool',
      zone: opts.zone,
      roomId: opts.roomId,
      kind: 'counter',
    });
  }

  /** Add tiered seminar / lecture rows of individual desks & chairs (Level 5 seminar rooms & lab). */
  seminarBlock(opts: {
    x: number;
    y: number;
    rows: number;
    cols: number;
    rowGap: number;
    colGap: number;
    angle: number;
    deskW?: number;
    deskH?: number;
    seatR?: number;
    zone: ZoneKey;
    roomId?: string;
    pairRows?: boolean;
  }): TableItem[] {
    const out: TableItem[] = [];
    const deskW = opts.deskW ?? opts.colGap - 1.2;
    const deskH = opts.deskH ?? 4.2;
    const seatR = opts.seatR ?? 2.2;
    for (let r = 0; r < opts.rows; r++) {
      // Group each row into 2–3 bay desks so tables read clearly like real seminar desks
      const bayCount = opts.cols <= 4 ? 1 : 2;
      const perBay = Math.ceil(opts.cols / bayCount);
      for (let b = 0; b < bayCount; b++) {
        const startC = b * perBay;
        const count = Math.min(perBay, opts.cols - startC);
        if (count <= 0) continue;
        const midC = startC + (count - 1) / 2;
        const localX = midC * opts.colGap;
        const localY = r * opts.rowGap;
        const [cx, cy] = rot(opts.x, opts.y, localX, localY, opts.angle);
        const w = count * opts.colGap - 1.4;
        out.push(
          this.rectTable({
            cx,
            cy,
            w: Math.max(deskW, w),
            h: deskH,
            angle: opts.angle,
            top: opts.pairRows && r % 2 === 1 ? count : 0,
            bottom: opts.pairRows && r % 2 === 1 ? 0 : count,
            seatR,
            seatGap: seatR + 1.4,
            zone: opts.zone,
            roomId: opts.roomId,
            kind: 'desk',
          }),
        );
      }
    }
    return out;
  }

  /** Add individual beanbags / poufs / stools (Level 6 Beach, Level 8 SE lounge, etc.). */
  poufCluster(items: [number, number, number?][], zone: ZoneKey, shape: SeatShape = 'pouf', roomId?: string): SeatItem[] {
    const out: SeatItem[] = [];
    for (const [cx, cy, r] of items) {
      const sid = this.uid('p');
      const seat: SeatItem = {
        id: sid,
        cx: round1(cx),
        cy: round1(cy),
        r: r ?? 4.2,
        shape,
        zone,
        unitId: roomId ?? sid,
        roomId,
      };
      this.seats.push(seat);
      out.push(seat);
    }
    return out;
  }

  /**
   * Add a Snøhetta organic modular seating/workstation pod (Levels 3 & 6):
   * connected hexagonal/rounded core tables with individual seats hugging the outer arc.
   */
  organicPod(opts: {
    nodes: { cx: number; cy: number; r?: number; seats: number; startDeg?: number; spanDeg?: number }[];
    zone: ZoneKey;
    seatR?: number;
  }): TableItem[] {
    const out: TableItem[] = [];
    const seatR = opts.seatR ?? 2.65;
    for (const n of opts.nodes) {
      const r = n.r ?? 6.2;
      const tid = this.uid('pod');
      const unitId = tid;
      const seatIds: string[] = [];
      const span = n.spanDeg ?? 360;
      const start = n.startDeg ?? 0;
      const fullCircle = span >= 359;
      for (let i = 0; i < n.seats; i++) {
        const deg = fullCircle ? start + (360 / n.seats) * i : start + (span / Math.max(1, n.seats - 1)) * i;
        const rad = deg * DEG;
        const dist = r + seatR + 1.6;
        const sid = this.uid('s');
        this.seats.push({
          id: sid,
          cx: round1(n.cx + Math.cos(rad) * dist),
          cy: round1(n.cy + Math.sin(rad) * dist),
          r: seatR,
          angle: deg + 90,
          shape: 'chair',
          zone: opts.zone,
          unitId,
        });
        seatIds.push(sid);
      }
      const tbl: TableItem = {
        id: tid,
        shape: 'circle',
        cx: round1(n.cx),
        cy: round1(n.cy),
        r: round1(r),
        zone: opts.zone,
        unitId,
        seatIds,
        kind: 'pod',
      };
      this.tables.push(tbl);
      out.push(tbl);
    }
    return out;
  }

  /** Add an enclosed room (group study room, office, seminar room, lab) and populate its interior. */
  room(
    opts: {
      pts: Pt[];
      kind: RoomItem['kind'];
      zone: ZoneKey;
      label?: string;
      labelPos?: Pt;
    },
    populate?: (roomId: string, center: Pt) => void,
  ): RoomItem {
    const id = this.uid('rm');
    const seatStart = this.seats.length;
    const tableStart = this.tables.length;
    const center = polyCentroid(opts.pts);
    if (populate) populate(id, center);
    const seatIds = this.seats.slice(seatStart).map((s) => s.id);
    const tableIds = this.tables.slice(tableStart).map((t) => t.id);
    const rm: RoomItem = {
      id,
      pts: opts.pts,
      kind: opts.kind,
      zone: opts.zone,
      label: opts.label,
      labelPos: opts.labelPos ?? center,
      seatIds,
      tableIds,
    };
    this.rooms.push(rm);
    return rm;
  }
}

/* ============================================================================
 * Shared Building Footprint Geometry (Levels 5, 6, 7, 8)
 * ============================================================================ */

const STD_SOUTH_GLAZING: Pt[] = [
  [78, 530],
  [440, 530],
  [440, 542],
  [412, 550],
  [120, 548],
  [78, 536],
];

/* ============================================================================
 * LEVEL 2 — THE VALLEY (Bridge to TMU Library, Atrium Stairs, SE Cafe/Lounge)
 * ============================================================================ */

function buildLevel2(): DetailedFloorPlan {
  const b = new PlanBuilder(2);

  // Bridge gallery cafe / study bar along the central walkway & escalators (x: 378..410, y: 295..412)
  b.tableBank({ x: 393, y: 304, bays: 3, bayW: 15, bayH: 9, gap: 4, angle: 90, topPerBay: 2, bottomPerBay: 2, seatR: 2.4, zone: 'Group Tables' });
  b.tableBank({ x: 393, y: 368, bays: 2, bayW: 15, bayH: 9, gap: 4, angle: 90, topPerBay: 2, bottomPerBay: 2, seatR: 2.4, zone: 'Group Tables' });

  // South-East Cafe / Study Lounge (Room 12, below SE core, x: 345..438, y: 484..566)
  b.room(
    {
      pts: [
        [342, 514],
        [406, 514],
        [406, 484],
        [434, 484],
        [434, 532],
        [412, 564],
        [342, 564],
      ],
      kind: 'room',
      zone: 'Lounge Area',
      label: 'Cafe Lounge',
      labelPos: [388, 536],
    },
    (rmId) => {
      // Main 10-seat communal table (bottom-left of lounge)
      b.rectTable({ cx: 376, cy: 545, w: 36, h: 11, top: 5, bottom: 5, seatR: 2.5, zone: 'Group Tables', roomId: rmId });
      // Cozy armchair & coffee table grouping (top-right)
      b.rectTable({ cx: 416, cy: 500, w: 12, h: 10, left: 2, right: 2, seatR: 2.5, zone: 'Lounge Area', roomId: rmId, kind: 'sofa' });
      b.poufCluster(
        [
          [401, 521, 3.6],
          [414, 521, 3.6],
        ],
        'Lounge Area',
        'sofa',
        rmId,
      );
      // Window counter stools facing inward inside the angled SE glazing
      b.counter({ x1: 429, y1: 492, x2: 429, y2: 526, seats: 4, side: 1, depth: 4.5, seatR: 2.3, zone: 'Quiet Study', roomId: rmId });
      b.counter({ x1: 425, y1: 529, x2: 407, y2: 556, seats: 4, side: 1, depth: 4.5, seatR: 2.3, zone: 'Quiet Study', roomId: rmId });
    },
  );

  // Valley stepped amphitheatre casual seating spots along the west stepped terrace (x: 78..185, y: 150..340)
  b.poufCluster(
    [
      [100, 174, 3.4],
      [126, 174, 3.4],
      [152, 174, 3.4],
      [112, 206, 3.4],
      [138, 206, 3.4],
      [164, 206, 3.4],
      [96, 245, 3.4],
      [116, 282, 3.4],
      [104, 320, 3.4],
      [130, 326, 3.4],
    ],
    'Lounge Area',
    'pouf',
  );

  // Computer / info kiosk pods near the north elevator lobby (x: 205..265, y: 184)
  b.counter({ x1: 210, y1: 184, x2: 264, y2: 184, seats: 4, side: 1, depth: 5, seatR: 2.4, zone: 'Computer Area' });

  return {
    floor: 2,
    title: 'Level 2',
    nickname: 'The Bridge',
    plate: [
      [62, 122],
      [190, 122],
      [190, 60],
      [440, 60],
      [440, 170],
      [512, 204],
      [512, 384],
      [436, 418],
      [436, 534],
      [412, 566],
      [252, 566],
      [230, 434],
      [204, 430],
      [78, 356],
    ],
    bridge: {
      pts: [
        [440, 170],
        [512, 204],
        [512, 384],
        [436, 418],
        [436, 295],
      ],
      label: 'Pedestrian Bridge → TMU Library',
    },
    shadedZones: [
      // North-west exterior roof / terrace (17)
      {
        pts: [
          [38, 62],
          [188, 62],
          [188, 102],
          [38, 102],
        ],
        label: 'Roof Terrace',
        opacity: 0.25,
      },
      // South-west lower atrium void / stairs to Yonge St.
      {
        pts: [
          [232, 436],
          [320, 386],
          [348, 424],
          [332, 480],
          [306, 482],
          [310, 564],
          [252, 564],
        ],
        opacity: 0.16,
      },
    ],
    voids: [
      // Open double-height valley atrium
      {
        pts: [
          [190, 198],
          [358, 198],
          [400, 224],
          [378, 344],
          [324, 368],
          [202, 248],
        ],
        label: 'Open to Level 1',
      },
    ],
    hatchBands: [
      // Central grand wooden amphitheatre stairs
      {
        pts: [
          [292, 232],
          [354, 206],
          [354, 304],
          [292, 330],
        ],
        angle: 90,
        spacing: 5.5,
        opacity: 0.55,
      },
      // East escalator / stair run
      {
        pts: [
          [378, 214],
          [408, 226],
          [408, 296],
          [378, 296],
        ],
        angle: 90,
        spacing: 5.5,
        opacity: 0.5,
      },
      // Diagonal stair bridge crossing over escalators
      {
        pts: [
          [346, 356],
          [432, 314],
          [446, 342],
          [360, 384],
        ],
        angle: 45,
        spacing: 5.5,
        opacity: 0.45,
      },
      // West valley terraced steps
      {
        pts: [
          [66, 128],
          [186, 128],
          [186, 174],
          [116, 174],
          [116, 344],
          [78, 344],
        ],
        angle: 90,
        spacing: 9,
        opacity: 0.25,
      },
      // South-west stairs to Level 1
      {
        pts: [
          [250, 538],
          [314, 538],
          [314, 562],
          [250, 562],
        ],
        angle: 90,
        spacing: 5,
        opacity: 0.5,
      },
    ],
    featureLines: [
      { pts: [[190, 170], [190, 198], [418, 198], [510, 304]], dashed: true, width: 1.0 },
      { pts: [[64, 126], [120, 174], [186, 174]], width: 1.0 },
      { pts: [[78, 336], [196, 354], [204, 430]], width: 1.8 },
    ],
    walls: [
      [[306, 482], [352, 482]],
      [[306, 482], [312, 526]],
      [[342, 514], [406, 514]],
    ],
    columns: [
      [74, 168],
      [82, 300],
      [204, 300],
      [212, 424],
      [322, 300],
      [412, 300],
      [338, 538],
    ],
    core: makeCore(416, true),
    rooms: b.rooms,
    tables: b.tables,
    seats: b.seats,
    annotations: [
      { x: 145, y: 265, text: 'THE VALLEY' },
      { x: 472, y: 295, text: 'BRIDGE TO LIBRARY' },
    ],
  };
}

/* ============================================================================
 * LEVEL 3 — THE BLUFF (Atrium Balcony, Organic Collaborative Pods, Meeting Room, SE Bar)
 * ============================================================================ */

function buildLevel3(): DetailedFloorPlan {
  const b = new PlanBuilder(3);

  // Two small enclosed support/DME rooms adjacent to North Core (x: 148..188, y: 110..176)
  b.room(
    {
      pts: rectPts(148, 110, 40, 33),
      kind: 'room',
      zone: 'Quiet Study',
      label: '11',
    },
    (rmId) => {
      b.rectTable({ cx: 172, cy: 126, w: 12, h: 8, left: 1, top: 1, bottom: 1, seatR: 2.2, zone: 'Quiet Study', roomId: rmId, kind: 'desk' });
    },
  );
  b.room(
    {
      pts: rectPts(148, 143, 40, 33),
      kind: 'studyRoom',
      zone: 'Group Tables',
      label: '12',
    },
    (rmId) => {
      b.rectTable({ cx: 168, cy: 159, w: 16, h: 9, top: 2, bottom: 2, seatR: 2.2, zone: 'Group Tables', roomId: rmId });
    },
  );

  // Mid-West enclosed DME Meeting Room + adjacent office (11) (x: 54..162, y: 274..322)
  b.room(
    {
      pts: [
        [54, 282],
        [86, 279],
        [89, 322],
        [57, 325],
      ],
      kind: 'room',
      zone: 'Quiet Study',
      label: '11',
    },
    (rmId) => {
      b.rectTable({ cx: 72, cy: 300, w: 11, h: 12, left: 1, right: 1, seatR: 2.1, zone: 'Quiet Study', roomId: rmId, kind: 'desk' });
    },
  );
  b.room(
    {
      pts: [
        [86, 279],
        [160, 272],
        [164, 316],
        [89, 322],
      ],
      kind: 'studyRoom',
      zone: 'Group Tables',
      label: 'DME Lab',
    },
    (rmId) => {
      b.rectTable({ cx: 125, cy: 296, w: 46, h: 11, angle: -5, top: 6, bottom: 6, seatR: 2.3, zone: 'Group Tables', roomId: rmId });
    },
  );

  // NW Collaborative Zone (x: 42..156, y: 114..274): 6 organic multi-seat Snøhetta workstation pods!
  b.organicPod({
    nodes: [
      { cx: 70, cy: 140, r: 7, seats: 5, startDeg: 20 },
      { cx: 120, cy: 132, r: 6.5, seats: 5, startDeg: 0 },
      { cx: 122, cy: 168, r: 7, seats: 5, startDeg: 18 },
      { cx: 80, cy: 204, r: 7.5, seats: 6, startDeg: 0 },
      { cx: 126, cy: 214, r: 6.5, seats: 5, startDeg: 10 },
      { cx: 118, cy: 242, r: 7.5, seats: 6, startDeg: 20 },
      { cx: 88, cy: 252, r: 7, seats: 5, startDeg: 15 },
    ],
    zone: 'Computer Area',
    seatR: 2.5,
  });

  // Central Atrium Balcony Promenade (overlooking Level 2 grand stairs!)
  // Two 4-seat tables along the west edge of the atrium void (x: 192, y: 218 & 250)
  b.rectTable({ cx: 192, cy: 218, w: 16, h: 12, top: 2, bottom: 2, seatR: 2.4, zone: 'Group Tables' });
  b.rectTable({ cx: 194, cy: 250, w: 16, h: 12, top: 2, bottom: 2, seatR: 2.4, zone: 'Group Tables' });
  // Four angled pairs of study tables marching SE along the diagonal atrium balcony railing
  const balcStarts: [number, number][] = [
    [220, 294],
    [238, 312],
    [262, 336],
    [282, 356],
  ];
  for (const [bx, by] of balcStarts) {
    b.rectTable({ cx: bx, cy: by, w: 15, h: 9, angle: -44, top: 2, bottom: 2, seatR: 2.3, zone: 'Group Tables' });
    b.rectTable({ cx: bx - 14, cy: by + 15, w: 15, h: 9, angle: -44, top: 2, bottom: 2, seatR: 2.3, zone: 'Group Tables' });
  }

  // SW & South Large Bluff Collaborative Zone (x: 74..350, y: 332..534):
  // Iconic Snøhetta clover & S-curve collaborative pods + 2 round 5-seat tables!
  b.roundTable({ cx: 120, cy: 356, r: 6.5, seats: 5, zone: 'Lounge Area' });
  b.roundTable({ cx: 218, cy: 472, r: 6.5, seats: 5, zone: 'Lounge Area' });

  b.organicPod({
    nodes: [
      // Upper-left S-curve cluster
      { cx: 102, cy: 386, r: 7.5, seats: 6, startDeg: 0 },
      { cx: 120, cy: 408, r: 7.5, seats: 6, startDeg: 30 },
      { cx: 146, cy: 422, r: 7.5, seats: 6, startDeg: 15 },
      // Mid-upper cluster
      { cx: 156, cy: 368, r: 7, seats: 5, startDeg: 20 },
      { cx: 178, cy: 378, r: 7, seats: 5, startDeg: 0 },
      // Mid-center cluster
      { cx: 196, cy: 418, r: 7.5, seats: 6, startDeg: 10 },
      // Lower-center clusters
      { cx: 244, cy: 446, r: 7, seats: 5, startDeg: 25 },
      { cx: 298, cy: 454, r: 6.5, seats: 5, startDeg: 10 },
      { cx: 236, cy: 500, r: 7, seats: 5, startDeg: 0 },
      // Large SE curved pod cluster
      { cx: 278, cy: 484, r: 7.5, seats: 6, startDeg: 15 },
      { cx: 296, cy: 504, r: 7.5, seats: 6, startDeg: 30 },
      { cx: 318, cy: 506, r: 7, seats: 5, startDeg: 0 },
    ],
    zone: 'Lounge Area',
    seatR: 2.5,
  });

  // Small lounge chairs near SE core entrance (clean clearance left of SE core at x=334)
  b.poufCluster(
    [
      [318, 444, 3.6],
      [321, 456, 3.6],
      [317, 469, 3.6],
    ],
    'Lounge Area',
    'sofa',
  );

  // South-East Window Study Bar / Counter (wrapping south & east glazing!)
  b.counter({ x1: 356, y1: 550, x2: 426, y2: 550, seats: 7, side: -1, depth: 4.5, seatR: 2.4, zone: 'Quiet Study' });
  b.counter({ x1: 432, y1: 492, x2: 432, y2: 544, seats: 5, side: -1, depth: 4.5, seatR: 2.4, zone: 'Quiet Study' });
  // Small counter below SE lower lift
  b.counter({ x1: 352, y1: 516, x2: 400, y2: 516, seats: 4, side: 1, depth: 4.5, seatR: 2.3, zone: 'Computer Area' });

  return {
    floor: 3,
    title: 'Level 3',
    nickname: 'The Bluffs',
    plate: [
      [42, 110],
      [190, 110],
      [190, 60],
      [440, 60],
      [440, 170],
      [512, 206],
      [512, 384],
      [440, 414],
      [440, 554],
      [424, 560],
      [118, 558],
      [74, 480],
    ],
    southGlazing: [
      [118, 554],
      [436, 554],
      [422, 564],
      [126, 562],
    ],
    bridge: {
      pts: [
        [440, 170],
        [512, 206],
        [512, 384],
        [440, 414],
      ],
      label: 'Bridge Atrium',
      roofOnly: true,
    },
    voids: [
      // Huge central atrium void overlooking Level 2 Valley & Grand Stairs
      {
        pts: [
          [206, 204],
          [420, 204],
          [510, 314],
          [440, 414],
          [332, 418],
          [208, 250],
        ],
        label: 'Atrium Void',
      },
    ],
    shadedZones: [
      // NW Bluff collaborative floor zone
      {
        pts: [
          [44, 112],
          [148, 112],
          [160, 272],
          [54, 282],
        ],
        opacity: 0.14,
      },
      // SW triangular sloped amphitheatre/bluff feature
      {
        pts: [
          [72, 466],
          [198, 434],
          [222, 556],
          [118, 556],
          [76, 486],
        ],
        opacity: 0.2,
      },
    ],
    hatchBands: [
      // Grand atrium wooden stair visible inside void
      {
        pts: [
          [296, 232],
          [358, 206],
          [358, 304],
          [296, 332],
        ],
        angle: 90,
        spacing: 5.5,
        opacity: 0.4,
      },
      // East stair run inside void
      {
        pts: [
          [380, 214],
          [410, 226],
          [410, 296],
          [380, 296],
        ],
        angle: 90,
        spacing: 5.5,
        opacity: 0.38,
      },
      // Diagonal stair bridge across void
      {
        pts: [
          [352, 356],
          [434, 314],
          [448, 342],
          [366, 384],
        ],
        angle: 45,
        spacing: 5.5,
        opacity: 0.42,
      },
      // South recessed bench/step terrace along south glass (x: 244..324, y: 534..554)
      {
        pts: rectPts(244, 534, 80, 20),
        angle: 90,
        spacing: 6.5,
        opacity: 0.42,
      },
    ],
    featureLines: [
      { pts: [[160, 272], [164, 316], [280, 424], [332, 424]], width: 1.5 },
      { pts: [[198, 434], [122, 554]], width: 1.0, dashed: true },
    ],
    columns: [
      [74, 178],
      [216, 412],
      [226, 530],
      [346, 530],
      [414, 530],
    ],
    core: makeCore(422, true),
    rooms: b.rooms,
    tables: b.tables,
    seats: b.seats,
    annotations: [
      { x: 100, y: 186, text: 'DME LAB' },
      { x: 266, y: 472, text: 'THE BLUFFS' },
    ],
  };
}

/* ============================================================================
 * LEVEL 4 — THE GARDEN (Perimeter Support Offices, Classrooms, Diagonal Study Hall)
 * ============================================================================ */

function buildLevel4(): DetailedFloorPlan {
  const b = new PlanBuilder(4);

  // 1. North-West perimeter offices & meeting rooms (y: 110..158)
  b.room(
    { pts: rectPts(46, 110, 48, 46), kind: 'room', zone: 'Quiet Study' },
    (rmId) => {
      b.rectTable({ cx: 70, cy: 132, w: 22, h: 10, top: 2, bottom: 2, seatR: 2.1, zone: 'Quiet Study', roomId: rmId, kind: 'desk' });
    },
  );
  b.room(
    { pts: rectPts(94, 110, 56, 46), kind: 'studyRoom', zone: 'Group Tables', label: 'Meeting' },
    (rmId) => {
      b.rectTable({ cx: 122, cy: 133, w: 30, h: 12, top: 3, bottom: 3, left: 1, right: 1, seatR: 2.2, zone: 'Group Tables', roomId: rmId });
    },
  );
  b.room(
    { pts: rectPts(150, 110, 38, 46), kind: 'studyRoom', zone: 'Group Tables' },
    (rmId) => {
      b.rectTable({ cx: 169, cy: 133, w: 16, h: 12, top: 2, bottom: 2, seatR: 2.1, zone: 'Group Tables', roomId: rmId });
    },
  );

  // Reception / One-Stop Computer Counter outside NW offices (x: 104..178, y: 168)
  b.counter({ x1: 104, y1: 170, x2: 180, y2: 170, seats: 6, side: -1, depth: 5.5, seatR: 2.2, zone: 'Computer Area' });

  // 2. West Perimeter Column of 9 Private Support / Consultation Offices (y: 156..450)
  for (let i = 0; i < 9; i++) {
    const y0 = 156 + i * 32.5;
    const y1 = y0 + 32.5;
    const xLeft0 = round1(48 + i * 2.8);
    const xLeft1 = round1(48 + (i + 1) * 2.8);
    const xRight0 = round1(xLeft0 + 42);
    const xRight1 = round1(xLeft1 + 42);
    b.room(
      {
        pts: [
          [xLeft0, round1(y0)],
          [xRight0, round1(y0)],
          [xRight1, round1(y1)],
          [xLeft1, round1(y1)],
        ],
        kind: 'room',
        zone: 'Quiet Study',
      },
      (rmId, [cx, cy]) => {
        b.rectTable({ cx, cy, w: 16, h: 9, top: 1, bottom: 2, seatR: 2.0, zone: 'Quiet Study', roomId: rmId, kind: 'desk' });
      },
    );
  }

  // SW Waiting / Lounge nook (cleanly inside angled SW corner)
  b.rectTable({ cx: 98, cy: 464, w: 10, h: 7, angle: -42, top: 1, bottom: 1, seatR: 2.1, zone: 'Lounge Area', kind: 'sofa' });
  b.rectTable({ cx: 109, cy: 484, w: 10, h: 7, angle: -32, top: 1, bottom: 1, seatR: 2.1, zone: 'Lounge Area', kind: 'sofa' });
  b.rectTable({ cx: 118, cy: 504, w: 10, h: 7, angle: -30, top: 1, bottom: 1, seatR: 2.1, zone: 'Lounge Area', kind: 'sofa' });

  // 3. South Perimeter Row of 11 Support Offices & Study Booths (x: 132..434, y: 486..534)
  const sWidth = (434 - 132) / 11;
  for (let i = 0; i < 11; i++) {
    const x0 = round1(132 + i * sWidth);
    b.room(
      {
        pts: rectPts(x0, 486, sWidth, 47),
        kind: i % 3 === 0 ? 'studyRoom' : 'room',
        zone: i % 3 === 0 ? 'Group Tables' : 'Quiet Study',
      },
      (rmId, [cx, cy]) => {
        b.rectTable({ cx, cy: cy + 1, w: 11, h: 13, left: 1, right: 2, seatR: 1.9, zone: i % 3 === 0 ? 'Group Tables' : 'Quiet Study', roomId: rmId, kind: 'desk' });
      },
    );
  }

  // 4. Inner-West North Block (x: 108..224, y: 192..324): 3 small rooms + boardroom + workshop room
  b.room({ pts: [[108, 194], [138, 192], [142, 250], [112, 252]], kind: 'room', zone: 'Quiet Study', label: '12' }, (rmId, [cx, cy]) => {
    b.rectTable({ cx, cy, w: 12, h: 12, top: 1, bottom: 1, seatR: 2.0, zone: 'Quiet Study', roomId: rmId, kind: 'desk' });
  });
  b.room({ pts: [[112, 252], [142, 250], [145, 290], [115, 292]], kind: 'room', zone: 'Quiet Study', label: '12' }, (rmId, [cx, cy]) => {
    b.rectTable({ cx, cy, w: 12, h: 10, top: 1, bottom: 1, seatR: 2.0, zone: 'Quiet Study', roomId: rmId, kind: 'desk' });
  });
  b.room({ pts: [[115, 292], [145, 290], [147, 322], [117, 324]], kind: 'room', zone: 'Computer Area', label: '10' }, (rmId, [cx, cy]) => {
    b.rectTable({ cx, cy, w: 14, h: 8, top: 2, seatR: 2.0, zone: 'Computer Area', roomId: rmId, kind: 'desk' });
  });
  // Boardroom (x: 138..216, y: 192..236)
  b.room(
    { pts: [[138, 192], [214, 190], [217, 234], [141, 238]], kind: 'studyRoom', zone: 'Group Tables', label: 'Boardroom' },
    (rmId) => {
      b.rectTable({ cx: 178, cy: 214, w: 42, h: 14, angle: -2, top: 5, bottom: 5, left: 1, right: 1, seatR: 2.2, zone: 'Group Tables', roomId: rmId });
    },
  );
  // Workshop / Learning Support Room (x: 141..222, y: 236..320)
  b.room(
    { pts: [[141, 238], [217, 234], [223, 318], [147, 322]], kind: 'room', zone: 'Group Tables', label: 'Learning Support' },
    (rmId) => {
      b.tableBank({ x: 156, y: 256, bays: 3, bayW: 16, bayH: 9, gap: 4, topPerBay: 2, bottomPerBay: 2, seatR: 2.0, zone: 'Group Tables', roomId: rmId });
      b.tableBank({ x: 158, y: 294, bays: 3, bayW: 16, bayH: 9, gap: 4, topPerBay: 2, bottomPerBay: 2, seatR: 2.0, zone: 'Group Tables', roomId: rmId });
    },
  );

  // 5. Inner-West South Block (x: 118..240, y: 340..476): 4 small offices + round-table room + angled-row room
  for (let i = 0; i < 4; i++) {
    const y0 = 342 + i * 33;
    b.room(
      { pts: [[119 + i * 2, y0], [148 + i * 2, y0 - 2], [150 + i * 2, y0 + 31], [121 + i * 2, y0 + 33]], kind: 'room', zone: 'Quiet Study' },
      (rmId, [cx, cy]) => {
        b.rectTable({ cx, cy, w: 12, h: 10, left: 1, right: 1, seatR: 2.0, zone: 'Quiet Study', roomId: rmId, kind: 'desk' });
      },
    );
  }
  // Round-table Collaborative Room (x: 148..232, y: 338..410)
  b.room(
    { pts: [[148, 340], [226, 336], [233, 408], [154, 412]], kind: 'studyRoom', zone: 'Group Tables', label: 'Workshop' },
    (rmId) => {
      b.roundTable({ cx: 168, cy: 356, r: 5.5, seats: 5, seatR: 2.0, zone: 'Group Tables', roomId: rmId });
      b.roundTable({ cx: 198, cy: 354, r: 5.5, seats: 5, seatR: 2.0, zone: 'Group Tables', roomId: rmId });
      b.roundTable({ cx: 212, cy: 378, r: 5.5, seats: 5, seatR: 2.0, zone: 'Group Tables', roomId: rmId });
      b.roundTable({ cx: 176, cy: 388, r: 5.5, seats: 5, seatR: 2.0, zone: 'Group Tables', roomId: rmId });
      b.roundTable({ cx: 202, cy: 400, r: 5.0, seats: 4, seatR: 2.0, zone: 'Group Tables', roomId: rmId });
    },
  );
  // Diagonal-desk Study Room (x: 154..240, y: 408..476)
  b.room(
    { pts: [[154, 412], [233, 408], [240, 474], [160, 476]], kind: 'room', zone: 'Quiet Study', label: 'Study Hall' },
    (rmId) => {
      b.tableBank({ x: 184, y: 422, bays: 2, bayW: 16, bayH: 7, gap: 4, angle: -24, topPerBay: 2, bottomPerBay: 0, seatR: 2.0, zone: 'Quiet Study', roomId: rmId });
      b.tableBank({ x: 174, y: 462, bays: 2, bayW: 15, bayH: 7, gap: 3, angle: -50, topPerBay: 2, bottomPerBay: 2, seatR: 2.0, zone: 'Quiet Study', roomId: rmId });
      b.tableBank({ x: 200, y: 466, bays: 2, bayW: 15, bayH: 7, gap: 3, angle: -50, topPerBay: 2, bottomPerBay: 2, seatR: 2.0, zone: 'Quiet Study', roomId: rmId });
    },
  );

  // 6. South-Central Low-Sensory Study Lounge (SLC-451) + 4 Accommodation Booths + 2 Group Rooms + Counter
  b.room(
    { pts: rectPts(246, 366, 82, 72), kind: 'room', zone: 'Quiet Study', label: 'Low-Sensory' },
    (rmId) => {
      // 4 staggered rows of individual low-sensory pods
      for (let r = 0; r < 4; r++) {
        for (let c = 0; c < 4; c++) {
          b.rectTable({
            cx: 258 + c * 18 + (r % 2) * 5,
            cy: 377 + r * 15.5,
            w: 9,
            h: 6,
            angle: (r % 2 === 0 ? -12 : 10),
            bottom: 1,
            seatR: 2.0,
            zone: 'Quiet Study',
            roomId: rmId,
            kind: 'desk',
          });
        }
      }
    },
  );
  // 4 Private Individual Study / Testing Booths right below Low-Sensory Lounge (clean clearance left of SE core at x=334)
  for (let i = 0; i < 4; i++) {
    b.room(
      { pts: rectPts(248 + i * 19.5, 438, 19.5, 36), kind: 'studyRoom', zone: 'Quiet Study' },
      (rmId, [cx, cy]) => {
        b.rectTable({ cx, cy: cy - 2, w: 10, h: 7, bottom: 1, seatR: 2.0, zone: 'Quiet Study', roomId: rmId, kind: 'desk' });
      },
    );
  }
  // Small Group Study Room (12) (x: 328..378, y: 366..404)
  b.room(
    { pts: rectPts(328, 366, 50, 38), kind: 'studyRoom', zone: 'Group Tables', label: '12' },
    (rmId) => {
      b.roundTable({ cx: 342, cy: 386, r: 4.8, seats: 4, seatR: 2.0, zone: 'Group Tables', roomId: rmId });
      b.roundTable({ cx: 366, cy: 381, r: 4.8, seats: 4, seatR: 2.0, zone: 'Group Tables', roomId: rmId });
    },
  );
  // Print / Computer Booth Room (10) (x: 378..412, y: 366..404)
  b.room(
    { pts: rectPts(378, 366, 34, 38), kind: 'computers', zone: 'Computer Area', label: '10' },
    (rmId) => {
      b.counter({ x1: 403, y1: 371, x2: 403, y2: 398, seats: 3, side: 1, depth: 4.5, seatR: 2.0, zone: 'Computer Area', roomId: rmId });
    },
  );

  // 7. Central Open Garden Hall (x: 234..432, y: 184..358):
  // Iconic 45°-angled diagonal collaborative study banks + round tables + east carrel column!
  b.tableBank({ x: 252, y: 256, bays: 3, bayW: 18, bayH: 11, gap: 4, angle: 44, topPerBay: 2, bottomPerBay: 2, seatR: 2.2, zone: 'Group Tables' });
  b.tableBank({ x: 294, y: 296, bays: 3, bayW: 18, bayH: 11, gap: 4, angle: 44, topPerBay: 2, bottomPerBay: 2, seatR: 2.2, zone: 'Group Tables' });
  b.tableBank({ x: 274, y: 214, bays: 4, bayW: 18, bayH: 11, gap: 4, angle: 44, topPerBay: 2, bottomPerBay: 2, seatR: 2.2, zone: 'Group Tables' });
  b.tableBank({ x: 340, y: 278, bays: 3, bayW: 18, bayH: 11, gap: 4, angle: 44, topPerBay: 2, bottomPerBay: 2, seatR: 2.2, zone: 'Group Tables' });
  // Upper-right diagonal lounge tables (near NE)
  b.tableBank({ x: 368, y: 188, bays: 2, bayW: 16, bayH: 10, gap: 4, angle: 44, topPerBay: 2, bottomPerBay: 2, seatR: 2.2, zone: 'Lounge Area' });
  b.rectTable({ cx: 392, cy: 230, w: 18, h: 10, angle: -46, top: 2, bottom: 2, seatR: 2.2, zone: 'Lounge Area' });
  // Round 5-seat tables flanking the diagonal banks
  b.roundTable({ cx: 252, cy: 296, r: 5.8, seats: 5, seatR: 2.2, zone: 'Lounge Area' });
  b.roundTable({ cx: 278, cy: 318, r: 5.8, seats: 5, seatR: 2.2, zone: 'Lounge Area' });
  b.roundTable({ cx: 356, cy: 232, r: 5.8, seats: 5, seatR: 2.2, zone: 'Lounge Area' });
  b.roundTable({ cx: 394, cy: 288, r: 4.5, seats: 3, seatR: 2.1, zone: 'Lounge Area' });
  b.roundTable({ cx: 396, cy: 318, r: 4.5, seats: 3, seatR: 2.1, zone: 'Lounge Area' });
  // East wall column of 8 two-person carrel desks (clean clearance inside east wall at x=440)
  for (let i = 0; i < 8; i++) {
    b.rectTable({ cx: 419, cy: 204 + i * 19.5, w: 14, h: 8, top: 1, bottom: 1, seatR: 2.0, zone: 'Computer Area', kind: 'desk' });
  }
  // Help desk bar south of central hall (x: 262..322, y: 348)
  b.counter({ x1: 262, y1: 350, x2: 320, y2: 350, seats: 4, side: 1, depth: 5, seatR: 2.2, zone: 'Computer Area' });

  return {
    floor: 4,
    title: 'Level 4',
    nickname: 'The Garden',
    plate: [
      [44, 110],
      [190, 110],
      [190, 60],
      [440, 60],
      [440, 538],
      [414, 544],
      [118, 540],
      [76, 476],
    ],
    southGlazing: [
      [118, 536],
      [440, 536],
      [414, 550],
      [126, 548],
    ],
    bridge: {
      pts: [
        [440, 170],
        [512, 206],
        [512, 376],
        [440, 408],
      ],
      label: 'Bridge Roof (17)',
      roofOnly: true,
    },
    columns: [
      [82, 286],
      [104, 456],
      [224, 504],
      [296, 504],
      [352, 504],
      [410, 294],
      [410, 504],
    ],
    core: makeCore(408, false),
    rooms: b.rooms,
    tables: b.tables,
    seats: b.seats,
    annotations: [{ x: 320, y: 200, text: 'THE GARDEN' }],
  };
}

/* ============================================================================
 * LEVEL 5 — THE SUN (45° Diamond: 3 Tiered Seminar Rooms + Multimedia Lab + 11 Group Rooms + Open Desks)
 * ============================================================================ */

function buildLevel5(): DetailedFloorPlan {
  const b = new PlanBuilder(5);

  // 1. North Window Carrels (top-left glass, x: 56..182, y: 115)
  for (let i = 0; i < 6; i++) {
    b.rectTable({ cx: 64 + i * 21, cy: 115, w: 12, h: 5.5, bottom: 1, seatR: 2.0, zone: 'Quiet Study', kind: 'desk' });
  }

  // 2. North-West Open Study Desk Field: 5 long horizontal rows of modular study tables!
  b.tableBank({ x: 58, y: 134, bays: 6, bayW: 19, bayH: 9, gap: 1.5, topPerBay: 2, bottomPerBay: 2, seatR: 2.2, zone: 'Quiet Study' });
  b.tableBank({ x: 76, y: 161, bays: 5, bayW: 19, bayH: 9, gap: 1.5, topPerBay: 2, bottomPerBay: 2, seatR: 2.2, zone: 'Quiet Study' });
  b.tableBank({ x: 66, y: 188, bays: 5, bayW: 19, bayH: 9, gap: 1.5, topPerBay: 2, bottomPerBay: 2, seatR: 2.2, zone: 'Quiet Study' });
  b.tableBank({ x: 66, y: 215, bays: 5, bayW: 19, bayH: 9, gap: 1.5, topPerBay: 2, bottomPerBay: 2, seatR: 2.2, zone: 'Quiet Study' });
  b.tableBank({ x: 68, y: 242, bays: 3, bayW: 19, bayH: 9, gap: 1.5, topPerBay: 2, bottomPerBay: 2, seatR: 2.2, zone: 'Quiet Study' });

  // 3. North-East Collaborative Lounge & Study Tables (x: 330..434, y: 196..278)
  // Row of 3 sofa benches
  b.rectTable({ cx: 344, cy: 202, w: 22, h: 9, bottom: 2, seatR: 2.3, zone: 'Lounge Area', kind: 'sofa', seatShape: 'sofa' });
  b.rectTable({ cx: 382, cy: 202, w: 22, h: 9, bottom: 2, seatR: 2.3, zone: 'Lounge Area', kind: 'sofa', seatShape: 'sofa' });
  b.rectTable({ cx: 418, cy: 202, w: 22, h: 9, bottom: 2, seatR: 2.3, zone: 'Lounge Area', kind: 'sofa', seatShape: 'sofa' });
  // 5 four-seat square collaborative tables
  for (const [tx, ty] of [
    [344, 226],
    [382, 226],
    [418, 226],
    [382, 254],
    [418, 254],
  ]) {
    b.rectTable({ cx: tx, cy: ty, w: 18, h: 14, top: 2, bottom: 2, seatR: 2.2, zone: 'Group Tables' });
  }
  // Casual pouf / armchair trios
  b.poufCluster(
    [
      [340, 248, 3.2],
      [350, 248, 3.2],
      [345, 241, 2.8],
      [386, 274, 3.2],
      [396, 274, 3.2],
      [414, 274, 3.2],
      [424, 274, 3.2],
    ],
    'Lounge Area',
    'sofa',
  );

  // 4. Iconic Central Rotated Diamond Complex (exact architectural angle 55°, completely clear of SE Core!)
  // Origin O=(274, 194): u runs SE along +55°, v runs SW along +145° (perpendicular)
  const diamondPt = (u: number, v: number): Pt => {
    const ang = 55 * DEG;
    const cu = Math.cos(ang);
    const su = Math.sin(ang);
    return [round1(274 + u * cu - v * su), round1(194 + u * su + v * cu)];
  };
  const diamondBox = (u0: number, v0: number, u1: number, v1: number): Pt[] => [
    diamondPt(u0, v0),
    diamondPt(u1, v0),
    diamondPt(u1, v1),
    diamondPt(u0, v1),
  ];

  // 4A. NE Top Diamond — Multimedia / Computer Lab (9): u: 0..96, v: 0..76
  b.room(
    {
      pts: diamondBox(0, 0, 96, 76),
      kind: 'computers',
      zone: 'Computer Area',
      label: 'Multimedia Lab',
    },
    (rmId) => {
      const [sx, sy] = diamondPt(14, 14);
      b.seminarBlock({ x: sx, y: sy, rows: 4, cols: 8, rowGap: 13.5, colGap: 9.0, angle: 55, deskH: 4.2, seatR: 1.9, zone: 'Computer Area', roomId: rmId, pairRows: true });
    },
  );

  // 4B. Center Spine — 4 Group Study Rooms (SW of Multimedia Lab): v: 76..108, u: 0..136
  for (let i = 0; i < 4; i++) {
    const u0 = i * 34;
    const u1 = u0 + 34;
    b.room(
      { pts: diamondBox(u0, 76, u1, 108), kind: 'studyRoom', zone: 'Group Tables' },
      (rmId, [cx, cy]) => {
        b.rectTable({ cx, cy, w: 13, h: 9.5, angle: 55, top: 2, bottom: 2, seatR: 2.0, zone: 'Group Tables', roomId: rmId });
      },
    );
  }

  // 4C. Mid-SE Spine — 3 Small Group Study Rooms (SE of Multimedia Lab): u: 96..130, v: 0..76
  for (let i = 0; i < 3; i++) {
    const v0 = i * 25.3;
    const v1 = v0 + 25.3;
    b.room(
      { pts: diamondBox(96, v0, 130, v1), kind: 'studyRoom', zone: 'Group Tables' },
      (rmId, [cx, cy]) => {
        b.rectTable({ cx, cy, w: 11, h: 9, angle: 55, top: 2, bottom: 2, seatR: 1.9, zone: 'Group Tables', roomId: rmId });
      },
    );
  }

  // 4D. Outer-SE Wing — 3 Larger Collaborative Group Rooms + 1 corner room (stops cleanly above SE Core y=404!)
  for (let i = 0; i < 3; i++) {
    const v0 = i * 30;
    const v1 = v0 + 30;
    b.room(
      { pts: diamondBox(144, v0, 178, v1), kind: 'studyRoom', zone: 'Group Tables' },
      (rmId, [cx, cy]) => {
        b.roundTable({ cx, cy, r: 6.5, seats: 6, seatR: 2.0, zone: 'Group Tables', roomId: rmId });
      },
    );
  }
  b.room(
    { pts: diamondBox(144, 90, 174, 118), kind: 'studyRoom', zone: 'Group Tables' },
    (rmId, [cx, cy]) => {
      b.rectTable({ cx, cy, w: 11, h: 9, angle: 55, top: 2, bottom: 2, seatR: 1.9, zone: 'Group Tables', roomId: rmId });
    },
  );

  // 4E. SW Face — 3 Large Tiered Seminar / Lecture Rooms (v: 120..210, u: 0..216, clean convex geometry!)
  // Seminar Room 1 (upper-left)
  b.room(
    { pts: diamondBox(0, 120, 68, 210), kind: 'room', zone: 'Group Tables', label: 'Seminar 1' },
    (rmId) => {
      const [sx, sy] = diamondPt(12, 136);
      b.seminarBlock({ x: sx, y: sy, rows: 4, cols: 6, rowGap: 14.5, colGap: 8.8, angle: 55, deskH: 3.6, seatR: 1.9, zone: 'Group Tables', roomId: rmId });
    },
  );
  // Seminar Room 2 (middle)
  b.room(
    { pts: diamondBox(68, 120, 136, 210), kind: 'room', zone: 'Group Tables', label: 'Seminar 2' },
    (rmId) => {
      const [sx, sy] = diamondPt(80, 136);
      b.seminarBlock({ x: sx, y: sy, rows: 4, cols: 6, rowGap: 14.5, colGap: 8.8, angle: 55, deskH: 3.6, seatR: 1.9, zone: 'Group Tables', roomId: rmId });
    },
  );
  // Seminar Room 3 (large lower-south convex polygonal seminar hall)
  b.room(
    {
      pts: [
        diamondPt(136, 120),
        diamondPt(218, 120),
        [306, 464],
        [170, 486],
        diamondPt(136, 210),
      ],
      kind: 'room',
      zone: 'Group Tables',
      label: 'Seminar 3',
    },
    (rmId) => {
      const [sx, sy] = diamondPt(148, 134);
      b.seminarBlock({ x: sx, y: sy, rows: 5, cols: 7, rowGap: 14, colGap: 9.0, angle: 55, deskH: 3.6, seatR: 1.9, zone: 'Group Tables', roomId: rmId });
    },
  );

  // 5. West Perimeter Open Study Tables & SW Casual Cluster (x: 68..126, y: 344..518)
  b.tableBank({ x: 64, y: 356, bays: 2, bayW: 16, bayH: 9, gap: 3, topPerBay: 2, bottomPerBay: 2, seatR: 2.1, zone: 'Quiet Study' });
  b.tableBank({ x: 66, y: 386, bays: 2, bayW: 16, bayH: 9, gap: 3, topPerBay: 2, bottomPerBay: 2, seatR: 2.1, zone: 'Quiet Study' });
  b.tableBank({ x: 68, y: 416, bays: 2, bayW: 19, bayH: 9, gap: 3, topPerBay: 2, bottomPerBay: 2, seatR: 2.1, zone: 'Quiet Study' });
  b.tableBank({ x: 70, y: 444, bays: 2, bayW: 19, bayH: 9, gap: 3, topPerBay: 2, bottomPerBay: 2, seatR: 2.1, zone: 'Quiet Study' });
  // SW corner casual round tables / poufs
  b.poufCluster(
    [
      [78, 474, 3.6],
      [94, 474, 3.6],
      [108, 474, 3.6],
      [84, 492, 3.6],
      [100, 494, 3.6],
      [94, 512, 3.8],
      [112, 514, 3.8],
    ],
    'Lounge Area',
    'pouf',
  );

  // 6. South Facade Open Study Table Columns (9 vertical columns along the sunlit south glass!)
  const southCols: [number, number, number][] = [
    [136, 488, 2],
    [164, 510, 1],
    [194, 510, 1],
    [244, 502, 2],
    [274, 502, 2],
    [304, 488, 2],
    [332, 488, 2],
    [360, 488, 2],
    [388, 488, 2],
  ];
  for (const [cx, yStart, bays] of southCols) {
    b.tableBank({ x: cx, y: yStart, bays, bayW: 18, bayH: 9, gap: 2, angle: 90, topPerBay: 2, bottomPerBay: 2, seatR: 2.1, zone: 'Quiet Study' });
  }

  // 7. East Wall Individual / Pair Window Desks (x: 422..434, y: 294..526)
  for (let i = 0; i < 9; i++) {
    b.rectTable({ cx: 427, cy: 298 + i * 27, w: 9, h: 14, left: 1, seatR: 2.1, zone: 'Quiet Study', kind: 'desk' });
  }
  // Small casual seating nook east of diamond near SE core
  b.poufCluster(
    [
      [402, 376, 3.4],
      [410, 392, 3.4],
      [392, 394, 3.4],
    ],
    'Lounge Area',
    'pouf',
  );

  return {
    floor: 5,
    title: 'Level 5',
    nickname: 'The Sun',
    plate: [
      [44, 110],
      [190, 110],
      [190, 60],
      [440, 60],
      [440, 534],
      [412, 542],
      [100, 536],
      [78, 506],
    ],
    southGlazing: STD_SOUTH_GLAZING,
    columns: [
      [88, 286],
      [164, 496],
      [218, 496],
      [304, 496],
      [404, 286],
      [404, 496],
    ],
    core: makeCore(404, false),
    rooms: b.rooms,
    tables: b.tables,
    seats: b.seats,
    annotations: [{ x: 280, y: 188, text: 'THE SUN' }],
  };
}

/* ============================================================================
 * LEVEL 6 — THE BEACH (5 Diagonal Stepped Amphitheatre Terraces, Timber Benches, Poufs, Lounge Pods)
 * ============================================================================ */

function buildLevel6(): DetailedFloorPlan {
  const b = new PlanBuilder(6);

  // 1. North-West Corner Organic Curved Lounge Pod Cluster (x: 68..184, y: 118..154)
  b.organicPod({
    nodes: [
      { cx: 88, cy: 132, r: 6.5, seats: 5, startDeg: 0 },
      { cx: 112, cy: 132, r: 6.5, seats: 5, startDeg: 35 },
      { cx: 138, cy: 152, r: 6.5, seats: 5, startDeg: 15 },
      { cx: 162, cy: 132, r: 6.5, seats: 5, startDeg: 0 },
    ],
    zone: 'Lounge Area',
    seatR: 2.4,
  });

  // 2. North-East Flat Collaborative Sofa Booths & Round Tables (x: 230..375, y: 192..310)
  // Angled modular sofa / study booths
  b.rectTable({ cx: 244, cy: 236, w: 24, h: 11, angle: -48, top: 2, bottom: 2, seatR: 2.3, zone: 'Group Tables', kind: 'sofa', seatShape: 'sofa' });
  b.rectTable({ cx: 274, cy: 214, w: 28, h: 11, angle: 42, top: 3, bottom: 3, seatR: 2.3, zone: 'Group Tables', kind: 'sofa', seatShape: 'sofa' });
  b.rectTable({ cx: 304, cy: 238, w: 22, h: 12, angle: -48, top: 2, bottom: 2, seatR: 2.3, zone: 'Group Tables', kind: 'sofa', seatShape: 'sofa' });
  b.rectTable({ cx: 282, cy: 266, w: 32, h: 10, angle: 42, top: 3, bottom: 3, seatR: 2.3, zone: 'Group Tables', kind: 'sofa', seatShape: 'sofa' });
  b.rectTable({ cx: 332, cy: 210, w: 28, h: 10, angle: -46, top: 3, bottom: 2, seatR: 2.3, zone: 'Group Tables', kind: 'sofa', seatShape: 'sofa' });
  b.rectTable({ cx: 354, cy: 246, w: 26, h: 12, angle: -48, top: 2, bottom: 2, seatR: 2.3, zone: 'Group Tables', kind: 'sofa', seatShape: 'sofa' });
  // Two iconic round 5-seat tables in NE lounge
  b.roundTable({ cx: 322, cy: 262, r: 6.5, seats: 5, seatR: 2.3, zone: 'Group Tables' });
  b.roundTable({ cx: 364, cy: 288, r: 6.5, seats: 5, seatR: 2.3, zone: 'Group Tables' });

  // 3. East Wall Giant Snøhetta Branched Modular Lounge Pods (upper-east & lower-east!)
  b.organicPod({
    nodes: [
      { cx: 406, cy: 202, r: 6.8, seats: 5, startDeg: -60, spanDeg: 240 },
      { cx: 394, cy: 224, r: 6.8, seats: 5, startDeg: 60, spanDeg: 240 },
      { cx: 406, cy: 246, r: 6.8, seats: 5, startDeg: -60, spanDeg: 240 },
      { cx: 394, cy: 268, r: 6.8, seats: 5, startDeg: 60, spanDeg: 240 },
    ],
    zone: 'Computer Area',
    seatR: 2.4,
  });
  b.organicPod({
    nodes: [
      { cx: 368, cy: 324, r: 6.8, seats: 5, startDeg: 90, spanDeg: 240 },
      { cx: 392, cy: 324, r: 6.8, seats: 5, startDeg: -90, spanDeg: 240 },
      { cx: 416, cy: 320, r: 6.8, seats: 5, startDeg: -60, spanDeg: 240 },
      { cx: 404, cy: 348, r: 6.8, seats: 5, startDeg: 40, spanDeg: 260 },
      { cx: 414, cy: 374, r: 6.8, seats: 5, startDeg: -20, spanDeg: 240 },
    ],
    zone: 'Computer Area',
    seatR: 2.4,
  });

  // 4. Built-in Timber Terrace Benches along the 5 Diagonal Beach Slopes (each bench seats 3–4 people!)
  const benches: TerraceBench[] = [
    { x: 158, y: 184, w: 68, h: 11, angle: 26 },
    { x: 114, y: 226, w: 64, h: 11, angle: 44 },
    { x: 194, y: 332, w: 66, h: 11, angle: 40 },
    { x: 274, y: 422, w: 70, h: 11, angle: 40 },
    { x: 162, y: 458, w: 64, h: 11, angle: 43 },
    { x: 268, y: 486, w: 72, h: 11, angle: 31 },
  ];
  for (const bn of benches) {
    b.rectTable({
      cx: bn.x,
      cy: bn.y,
      w: bn.w,
      h: bn.h,
      angle: bn.angle,
      top: 3,
      bottom: 2,
      seatR: 2.6,
      seatGap: 3.4,
      zone: 'Quiet Study',
      kind: 'sofa',
      seatShape: 'pouf',
    });
  }

  // 5. The Iconic Scattered Beach Beanbags & Poufs across all 5 Diagonal Amphitheatre Tiers + SE Ramps!
  b.poufCluster(
    [
      // Upper NW edge & Terrace 1 (uppermost diagonal tier)
      [62, 162, 3.8],
      [74, 174, 3.8],
      [94, 174, 3.8],
      [164, 172, 3.8],
      [176, 180, 3.8],
      [148, 214, 4.0],
      [162, 218, 4.0],
      [154, 228, 4.0],
      [168, 232, 4.0],
      [144, 234, 3.8],
      // Terrace 1 mid-SE Pouf clusters
      [216, 260, 4.0],
      [226, 272, 4.0],
      [238, 276, 4.0],
      [228, 286, 4.0],
      [240, 294, 4.0],
      [280, 304, 4.0],
      [292, 314, 4.0],
      [278, 318, 4.0],
      [286, 330, 4.0],
      [314, 296, 3.8],
      [326, 302, 3.8],
      [338, 306, 3.8],
      [348, 368, 4.0],
      [360, 374, 4.0],
      [366, 386, 4.0],
      // Terrace 2 poufs (NW -> SE)
      [68, 214, 3.8],
      [74, 226, 3.8],
      [82, 238, 3.8],
      [76, 266, 3.8],
      [88, 274, 3.8],
      [108, 288, 4.0],
      [114, 300, 4.0],
      [164, 336, 4.0],
      [174, 344, 4.0],
      [182, 354, 4.0],
      [230, 384, 4.0],
      [242, 392, 4.0],
      [292, 370, 4.0],
      [304, 380, 4.0],
      [326, 394, 4.0],
      [338, 404, 4.0],
      // Terrace 3 poufs (mid-SW -> SE)
      [80, 314, 3.8],
      [94, 322, 3.8],
      [112, 330, 3.8],
      [168, 376, 4.0],
      [180, 386, 4.0],
      [174, 396, 4.0],
      [188, 404, 4.0],
      [242, 424, 4.0],
      [256, 434, 4.0],
      [274, 448, 4.0],
      [288, 456, 4.0],
      [264, 456, 3.8],
      // Terrace 4 poufs (lower SW)
      [84, 354, 3.8],
      [96, 364, 3.8],
      [104, 374, 3.8],
      [148, 412, 4.0],
      [160, 418, 4.0],
      [172, 428, 4.0],
      [192, 444, 4.0],
      [204, 450, 4.0],
      [196, 458, 4.0],
      // Terrace 5 SW flat shore pouf clusters (cleanly inside west glazing wall)
      [88, 404, 3.8],
      [96, 416, 3.8],
      [90, 426, 3.8],
      [100, 434, 3.8],
      [92, 448, 3.8],
      [96, 464, 3.8],
      [112, 514, 4.0],
      [126, 514, 4.0],
      [138, 514, 4.0],
      [144, 492, 4.0],
      [158, 496, 4.0],
      [168, 506, 4.0],
      [176, 516, 4.0],
      [226, 514, 4.0],
      [246, 498, 4.0],
      [260, 506, 4.0],
      [250, 516, 4.0],
      // SE Beach Entry Ramps / Timber Strips poufs (x: 330..432, y: 472..520)
      [330, 492, 3.8],
      [336, 506, 3.8],
      [348, 516, 3.8],
      [366, 492, 3.8],
      [374, 510, 3.8],
      [394, 498, 3.8],
      [404, 512, 3.8],
      [426, 494, 3.8],
      [430, 510, 3.8],
    ],
    'Lounge Area',
    'pouf',
  );

  return {
    floor: 6,
    title: 'Level 6',
    nickname: 'The Beach',
    plate: [
      [44, 110],
      [190, 110],
      [190, 60],
      [440, 60],
      [440, 534],
      [412, 542],
      [80, 534],
    ],
    southGlazing: STD_SOUTH_GLAZING,
    benches,
    // Iconic 5 diagonal Beach amphitheatre tier step lines (NW → SE!) + SE entry ramp dividers
    featureLines: [
      { pts: [[52, 146], [192, 206], [404, 404]], width: 1.5 },
      { pts: [[54, 154], [186, 214], [388, 404]], width: 0.9, dashed: true },
      { pts: [[58, 198], [334, 424]], width: 1.5 },
      { pts: [[60, 210], [334, 438]], width: 0.9 },
      { pts: [[66, 286], [334, 488]], width: 1.5 },
      { pts: [[68, 296], [334, 500]], width: 0.9 },
      { pts: [[72, 368], [262, 532]], width: 1.5 },
      { pts: [[74, 380], [244, 532]], width: 0.9 },
      { pts: [[78, 456], [156, 532]], width: 1.2 },
      // SE vertical beach ramp strips below SE core
      { pts: [[342, 470], [352, 532]], width: 1.3 },
      { pts: [[364, 470], [378, 532]], width: 1.3 },
      { pts: [[386, 470], [402, 532]], width: 1.3 },
      { pts: [[408, 470], [426, 532]], width: 1.3 },
    ],
    hatchBands: [
      // Small steps east of SE core
      { pts: rectPts(416, 404, 22, 16), angle: 0, spacing: 4, opacity: 0.45 },
      { pts: rectPts(416, 444, 22, 16), angle: 0, spacing: 4, opacity: 0.45 },
    ],
    columns: [
      [88, 282],
      [204, 282],
      [322, 282],
      [412, 282],
      [100, 496],
      [220, 496],
      [342, 496],
      [412, 496],
    ],
    core: makeCore(404, false),
    rooms: b.rooms,
    tables: b.tables,
    seats: b.seats,
    annotations: [{ x: 266, y: 186, text: 'THE BEACH' }],
  };
}

/* ============================================================================
 * LEVEL 7 — THE FOREST (29 Radial Forest-Grove Group Study Rooms + Quiet Long-Table Halls)
 * ============================================================================ */

function buildLevel7(): DetailedFloorPlan {
  const b = new PlanBuilder(7);

  // 1. NW Quiet Corner (4 square tables + 4 angled long quiet study table banks)
  for (const [tx, ty] of [
    [68, 134],
    [98, 138],
    [82, 158],
    [60, 122],
  ]) {
    b.rectTable({ cx: tx, cy: ty, w: 11, h: 9, top: 2, bottom: 2, seatR: 2.0, zone: 'Quiet Study' });
  }
  b.tableBank({ x: 70, y: 194, bays: 2, bayW: 19, bayH: 9, gap: 1.5, angle: -22, topPerBay: 2, bottomPerBay: 2, seatR: 2.0, zone: 'Quiet Study' });
  b.tableBank({ x: 72, y: 226, bays: 3, bayW: 19, bayH: 9, gap: 1.5, angle: -22, topPerBay: 2, bottomPerBay: 2, seatR: 2.0, zone: 'Quiet Study' });
  b.tableBank({ x: 80, y: 256, bays: 3, bayW: 19, bayH: 9, gap: 1.5, angle: -22, topPerBay: 2, bottomPerBay: 2, seatR: 2.0, zone: 'Quiet Study' });
  b.tableBank({ x: 96, y: 282, bays: 3, bayW: 19, bayH: 9, gap: 1.5, angle: -22, topPerBay: 2, bottomPerBay: 2, seatR: 2.0, zone: 'Quiet Study' });

  // 2. Forest Grove Cluster A (Far NW north of corridor: 3 Group Study Rooms)
  b.room(
    { pts: [[108, 110], [150, 110], [162, 146], [122, 156]], kind: 'studyRoom', zone: 'Group Tables' },
    (rmId, [cx, cy]) => {
      b.roundTable({ cx, cy, r: 6.5, seats: 6, seatR: 2.0, zone: 'Group Tables', roomId: rmId });
    },
  );
  b.room(
    { pts: [[150, 110], [188, 110], [188, 168], [168, 168]], kind: 'studyRoom', zone: 'Group Tables' },
    (rmId, [cx, cy]) => {
      b.roundTable({ cx: cx + 2, cy, r: 6.0, seats: 5, seatR: 2.0, zone: 'Group Tables', roomId: rmId });
    },
  );
  b.room(
    { pts: [[122, 156], [162, 146], [170, 174], [132, 180]], kind: 'studyRoom', zone: 'Group Tables' },
    (rmId, [cx, cy]) => {
      b.rectTable({ cx, cy, w: 12, h: 9, angle: -15, top: 2, bottom: 2, seatR: 1.9, zone: 'Group Tables', roomId: rmId });
    },
  );

  // 3. Forest Grove Cluster B (Upper-center-west wedge: 6 non-overlapping Group Study Rooms!) + Open Computer Table East
  b.room(
    { pts: [[142, 198], [174, 198], [184, 226], [152, 236]], kind: 'studyRoom', zone: 'Group Tables' },
    (rmId, [cx, cy]) => {
      b.rectTable({ cx, cy, w: 11, h: 9, angle: -20, top: 2, bottom: 2, seatR: 1.9, zone: 'Group Tables', roomId: rmId });
    },
  );
  b.room(
    { pts: [[174, 198], [214, 198], [228, 236], [184, 226]], kind: 'studyRoom', zone: 'Group Tables' },
    (rmId, [cx, cy]) => {
      b.roundTable({ cx, cy, r: 6.0, seats: 5, seatR: 2.0, zone: 'Group Tables', roomId: rmId });
    },
  );
  b.room(
    { pts: [[152, 236], [184, 226], [194, 256], [162, 266]], kind: 'studyRoom', zone: 'Group Tables' },
    (rmId, [cx, cy]) => {
      b.rectTable({ cx, cy, w: 11, h: 9, angle: -20, top: 2, bottom: 2, seatR: 1.9, zone: 'Group Tables', roomId: rmId });
    },
  );
  b.room(
    { pts: [[162, 266], [194, 256], [204, 286], [174, 290]], kind: 'studyRoom', zone: 'Group Tables' },
    (rmId, [cx, cy]) => {
      b.rectTable({ cx, cy, w: 11, h: 9, angle: -18, top: 2, bottom: 2, seatR: 1.9, zone: 'Group Tables', roomId: rmId });
    },
  );
  b.room(
    { pts: [[184, 226], [228, 236], [238, 274], [204, 286], [194, 256]], kind: 'studyRoom', zone: 'Group Tables' },
    (rmId, [cx, cy]) => {
      b.rectTable({ cx, cy, w: 12, h: 10, angle: -18, top: 2, bottom: 2, seatR: 1.9, zone: 'Group Tables', roomId: rmId });
    },
  );
  b.room(
    { pts: [[238, 258], [274, 246], [262, 298], [226, 290]], kind: 'studyRoom', zone: 'Group Tables' },
    (rmId, [cx, cy]) => {
      b.roundTable({ cx, cy, r: 6.0, seats: 6, seatR: 2.0, zone: 'Group Tables', roomId: rmId });
    },
  );
  // Open angled Computer / Study table bank just east of Cluster B (x: 234..252, y: 196..244)
  b.tableBank({ x: 236, y: 198, bays: 2, bayW: 20, bayH: 9, gap: 2, angle: 68, topPerBay: 2, bottomPerBay: 2, seatR: 2.0, zone: 'Computer Area' });

  // 4. Forest Grove Cluster C (Mid-west wedge: 7 strictly non-overlapping Group Study Rooms sharing clean walls!)
  b.room(
    { pts: [[78, 314], [112, 302], [124, 344], [86, 356]], kind: 'studyRoom', zone: 'Group Tables' },
    (rmId, [cx, cy]) => {
      b.roundTable({ cx, cy, r: 6.0, seats: 5, seatR: 2.0, zone: 'Group Tables', roomId: rmId });
    },
  );
  b.room(
    { pts: [[112, 302], [164, 310], [160, 336], [124, 344]], kind: 'studyRoom', zone: 'Group Tables' },
    (rmId, [cx, cy]) => {
      b.roundTable({ cx, cy, r: 5.8, seats: 5, seatR: 2.0, zone: 'Group Tables', roomId: rmId });
    },
  );
  b.room(
    { pts: [[86, 356], [124, 344], [136, 382], [92, 396]], kind: 'studyRoom', zone: 'Group Tables' },
    (rmId, [cx, cy]) => {
      b.roundTable({ cx, cy, r: 6.0, seats: 5, seatR: 2.0, zone: 'Group Tables', roomId: rmId });
    },
  );
  b.room(
    { pts: [[124, 344], [168, 334], [180, 368], [136, 382]], kind: 'studyRoom', zone: 'Group Tables' },
    (rmId, [cx, cy]) => {
      b.roundTable({ cx, cy, r: 6.2, seats: 6, seatR: 2.0, zone: 'Group Tables', roomId: rmId });
    },
  );
  b.room(
    { pts: [[164, 310], [208, 320], [198, 362], [180, 368], [168, 334]], kind: 'studyRoom', zone: 'Group Tables' },
    (rmId, [cx, cy]) => {
      b.roundTable({ cx, cy, r: 5.6, seats: 5, seatR: 1.9, zone: 'Group Tables', roomId: rmId });
    },
  );
  b.room(
    { pts: [[208, 320], [254, 330], [244, 368], [198, 362]], kind: 'studyRoom', zone: 'Group Tables' },
    (rmId, [cx, cy]) => {
      b.roundTable({ cx, cy, r: 6.2, seats: 6, seatR: 2.0, zone: 'Group Tables', roomId: rmId });
    },
  );
  b.room(
    { pts: [[198, 362], [244, 368], [232, 422]], kind: 'studyRoom', zone: 'Group Tables' },
    (rmId, [cx, cy]) => {
      b.rectTable({ cx: cx + 2, cy: cy - 3, w: 11, h: 9, top: 2, bottom: 2, seatR: 1.9, zone: 'Group Tables', roomId: rmId });
    },
  );

  // 5. Forest Grove Cluster D (East-center wedge: 8 Group Study Rooms in 2 angled rows!)
  // Top row (4 rooms running WSW → ENE, x: 294..424, y: 194..258)
  const dTop: [Pt[], number][] = [
    [[[296, 232], [334, 218], [344, 246], [306, 260]], 4],
    [[[334, 218], [364, 206], [374, 234], [344, 246]], 4],
    [[[364, 206], [394, 194], [404, 222], [374, 234]], 4],
    [[[394, 194], [422, 184], [422, 214], [404, 222]], 4],
  ];
  for (const [pts] of dTop) {
    b.room({ pts, kind: 'studyRoom', zone: 'Group Tables' }, (rmId, [cx, cy]) => {
      b.rectTable({ cx, cy, w: 12, h: 9, angle: -21, top: 2, bottom: 2, seatR: 1.9, zone: 'Group Tables', roomId: rmId });
    });
  }
  // Bottom row (4 larger rooms, x: 282..424, y: 214..314)
  const dBot: Pt[][] = [
    [[296, 260], [326, 250], [316, 306], [282, 298]],
    [[326, 250], [356, 238], [368, 286], [316, 306]],
    [[356, 238], [388, 226], [402, 274], [368, 286]],
    [[388, 226], [422, 214], [422, 264], [402, 274]],
  ];
  for (const pts of dBot) {
    b.room({ pts, kind: 'studyRoom', zone: 'Group Tables' }, (rmId, [cx, cy]) => {
      b.roundTable({ cx, cy, r: 6.2, seats: 6, seatR: 1.9, zone: 'Group Tables', roomId: rmId });
    });
  }

  // 6. Forest Grove Cluster E (South-center triangular wedge left of SE Core: 6 Group Study Rooms!)
  b.room({ pts: [[274, 344], [294, 396], [262, 408]], kind: 'studyRoom', zone: 'Group Tables' }, (rmId, [cx, cy]) => {
    b.rectTable({ cx, cy: cy + 5, w: 10, h: 8, top: 1, bottom: 2, seatR: 1.8, zone: 'Group Tables', roomId: rmId });
  });
  b.room({ pts: [[262, 408], [294, 396], [306, 434], [270, 444]], kind: 'studyRoom', zone: 'Group Tables' }, (rmId, [cx, cy]) => {
    b.rectTable({ cx, cy, w: 11, h: 9, angle: -18, top: 2, bottom: 2, seatR: 1.9, zone: 'Group Tables', roomId: rmId });
  });
  b.room({ pts: [[250, 448], [274, 442], [286, 480], [254, 486]], kind: 'studyRoom', zone: 'Group Tables' }, (rmId, [cx, cy]) => {
    b.rectTable({ cx, cy, w: 11, h: 9, angle: -16, top: 2, bottom: 2, seatR: 1.9, zone: 'Group Tables', roomId: rmId });
  });
  b.room({ pts: [[274, 442], [306, 434], [320, 472], [286, 480]], kind: 'studyRoom', zone: 'Group Tables' }, (rmId, [cx, cy]) => {
    b.rectTable({ cx, cy, w: 12, h: 9, angle: -16, top: 2, bottom: 2, seatR: 1.9, zone: 'Group Tables', roomId: rmId });
  });
  b.room({ pts: [[254, 486], [292, 478], [300, 512], [264, 512]], kind: 'studyRoom', zone: 'Group Tables' }, (rmId, [cx, cy]) => {
    b.rectTable({ cx, cy, w: 12, h: 9, angle: -12, top: 2, bottom: 2, seatR: 1.9, zone: 'Group Tables', roomId: rmId });
  });
  b.room({ pts: [[292, 478], [322, 472], [336, 512], [300, 512]], kind: 'studyRoom', zone: 'Group Tables' }, (rmId, [cx, cy]) => {
    b.roundTable({ cx, cy, r: 5.8, seats: 5, seatR: 1.9, zone: 'Group Tables', roomId: rmId });
  });

  // 7. South-West Silent Study Hall (4 angled long banks of quiet study tables!)
  b.tableBank({ x: 106, y: 446, bays: 3, bayW: 19, bayH: 9, gap: 1.5, angle: 68, topPerBay: 2, bottomPerBay: 2, seatR: 2.0, zone: 'Quiet Study' });
  b.tableBank({ x: 116, y: 404, bays: 5, bayW: 19, bayH: 9, gap: 1.5, angle: 68, topPerBay: 2, bottomPerBay: 2, seatR: 2.0, zone: 'Quiet Study' });
  b.tableBank({ x: 144, y: 394, bays: 5, bayW: 19, bayH: 9, gap: 1.5, angle: 68, topPerBay: 2, bottomPerBay: 2, seatR: 2.0, zone: 'Quiet Study' });
  b.tableBank({ x: 172, y: 384, bays: 4, bayW: 19, bayH: 9, gap: 1.5, angle: 68, topPerBay: 2, bottomPerBay: 2, seatR: 2.0, zone: 'Quiet Study' });

  // 8. South-East Open Study Desk Rows (above SE Core: 3 horizontal rows!)
  b.tableBank({ x: 360, y: 318, bays: 3, bayW: 21, bayH: 9, gap: 1.5, topPerBay: 2, bottomPerBay: 2, seatR: 2.1, zone: 'Computer Area' });
  b.tableBank({ x: 294, y: 348, bays: 6, bayW: 21, bayH: 9, gap: 1.5, topPerBay: 2, bottomPerBay: 2, seatR: 2.1, zone: 'Quiet Study' });
  b.tableBank({ x: 306, y: 378, bays: 5, bayW: 21, bayH: 9, gap: 1.5, topPerBay: 2, bottomPerBay: 2, seatR: 2.1, zone: 'Quiet Study' });

  // 9. West & South Perimeter Individual Study Carrels
  for (const [cx, cy] of [
    [82, 424],
    [84, 448],
    [86, 474],
    [90, 502],
  ]) {
    b.rectTable({ cx, cy, w: 14, h: 9, top: 1, bottom: 1, seatR: 1.9, zone: 'Quiet Study', kind: 'desk' });
  }
  for (const [cx, cy] of [
    [186, 514],
    [212, 514],
    [238, 514],
    [358, 504],
    [386, 504],
  ]) {
    b.rectTable({ cx, cy, w: 14, h: 10, top: 2, bottom: 1, seatR: 1.9, zone: 'Lounge Area', kind: 'desk' });
  }

  return {
    floor: 7,
    title: 'Level 7',
    nickname: 'The Forest',
    plate: [
      [44, 110],
      [190, 110],
      [190, 60],
      [440, 60],
      [440, 534],
      [412, 542],
      [80, 534],
    ],
    southGlazing: STD_SOUTH_GLAZING,
    featureLines: [
      // Forest path dashed zone dividers from drawing
      { pts: [[126, 178], [156, 200]], dashed: true, width: 0.9 },
      { pts: [[212, 178], [234, 240]], dashed: true, width: 0.9 },
      { pts: [[274, 248], [312, 232]], dashed: true, width: 0.9 },
      { pts: [[268, 336], [316, 306]], dashed: true, width: 0.9 },
    ],
    columns: [
      [88, 286],
      [204, 286],
      [322, 286],
      [412, 286],
      [104, 496],
      [224, 496],
      [340, 496],
      [412, 496],
    ],
    core: makeCore(404, false),
    rooms: b.rooms,
    tables: b.tables,
    seats: b.seats,
    annotations: [
      { x: 292, y: 192, text: 'THE FOREST' },
      { x: 140, y: 472, text: 'SILENT STUDY' },
    ],
  };
}

/* ============================================================================
 * LEVEL 8 — THE SKY (2 Diagonal Spines of 16 Group Rooms + 30 Round Sky Tables + NE Banks + Carrels)
 * ============================================================================ */

function buildLevel8(): DetailedFloorPlan {
  const b = new PlanBuilder(8);

  // 1. NW Corner Diagonal Skylight Alcove & North Tables (x: 52..182, y: 118..178)
  b.rectTable({ cx: 74, cy: 140, w: 12, h: 12, angle: 45, top: 2, bottom: 2, seatR: 2.0, zone: 'Quiet Study' });
  b.rectTable({ cx: 142, cy: 132, w: 14, h: 10, top: 2, bottom: 2, seatR: 2.0, zone: 'Quiet Study' });
  b.rectTable({ cx: 168, cy: 132, w: 16, h: 10, top: 2, bottom: 2, seatR: 2.0, zone: 'Quiet Study' });
  b.rectTable({ cx: 170, cy: 162, w: 14, h: 10, top: 2, bottom: 2, seatR: 2.0, zone: 'Quiet Study' });

  // 2. Iconic NW 45° Diagonal Spine of 9 Bookable Group Study Rooms!
  // Anchor at (84, 152), u runs SE at 45° (cos=sin=0.7071), v runs SW at 135° (-0.7071, 0.7071)
  const spinePt = (ox: number, oy: number, u: number, v: number): Pt => {
    const s = Math.SQRT1_2;
    return [round1(ox + (u - v) * s), round1(oy + (u + v) * s)];
  };
  const spineBox = (ox: number, oy: number, u0: number, v0: number, u1: number, v1: number): Pt[] => [
    spinePt(ox, oy, u0, v0),
    spinePt(ox, oy, u1, v0),
    spinePt(ox, oy, u1, v1),
    spinePt(ox, oy, u0, v1),
  ];

  // 4 pairs of 4-seat group rooms (NE side v: 0..30, SW side v: 30..60) + 1 large 8-seat SE end conference room!
  for (let i = 0; i < 4; i++) {
    const u0 = i * 32;
    const u1 = u0 + 32;
    // NE room
    b.room({ pts: spineBox(118, 138, u0, 0, u1, 30), kind: 'studyRoom', zone: 'Group Tables' }, (rmId, [cx, cy]) => {
      b.rectTable({ cx, cy, w: 11.5, h: 9.5, angle: 45, top: 2, bottom: 2, seatR: 2.0, zone: 'Group Tables', roomId: rmId });
    });
    // SW room
    b.room({ pts: spineBox(118, 138, u0, 30, u1, 60), kind: 'studyRoom', zone: 'Group Tables' }, (rmId, [cx, cy]) => {
      b.rectTable({ cx, cy, w: 11.5, h: 9.5, angle: 45, top: 2, bottom: 2, seatR: 2.0, zone: 'Group Tables', roomId: rmId });
    });
  }
  // Large 8-seat Conference Group Room at SE end of NW Spine!
  b.room(
    { pts: spineBox(118, 138, 128, 0, 170, 60), kind: 'studyRoom', zone: 'Group Tables', label: 'Group' },
    (rmId, [cx, cy]) => {
      b.roundTable({ cx, cy, r: 8.8, seats: 8, seatR: 2.1, zone: 'Group Tables', roomId: rmId });
    },
  );

  // 3. Iconic SE 45° Diagonal Spine of 6 Bookable Group Study Rooms + 1 Triangular Apex Room over SE Core!
  for (let i = 0; i < 3; i++) {
    const u0 = i * 31;
    const u1 = u0 + 31;
    // NE room
    b.room({ pts: spineBox(278, 290, u0, 0, u1, 30), kind: 'studyRoom', zone: 'Group Tables' }, (rmId, [cx, cy]) => {
      b.rectTable({ cx, cy, w: 11.5, h: 9.5, angle: 45, top: 2, bottom: 2, seatR: 2.0, zone: 'Group Tables', roomId: rmId });
    });
    // SW room
    b.room({ pts: spineBox(278, 290, u0, 30, u1, 60), kind: 'studyRoom', zone: 'Group Tables' }, (rmId, [cx, cy]) => {
      b.rectTable({ cx, cy, w: 11.5, h: 9.5, angle: 45, top: 2, bottom: 2, seatR: 2.0, zone: 'Group Tables', roomId: rmId });
    });
  }
  // Triangular Apex Group Room capping cleanly above the SE Core (y=404)!
  b.room(
    {
      pts: [
        [374, 364],
        [412, 401],
        [336, 401],
      ],
      kind: 'studyRoom',
      zone: 'Group Tables',
    },
    (rmId) => {
      b.rectTable({ cx: 374, cy: 389, w: 22, h: 8.5, top: 3, bottom: 3, left: 1, right: 1, seatR: 1.9, zone: 'Group Tables', roomId: rmId });
    },
  );

  // 4. North-East Angled Collaborative Study Table Field (x: 224..432, y: 194..376)!
  // Two smaller tables near elevator lobby
  b.rectTable({ cx: 242, cy: 218, w: 16, h: 10, angle: -45, top: 2, bottom: 2, seatR: 2.1, zone: 'Computer Area' });
  b.tableBank({ x: 258, y: 244, bays: 2, bayW: 16, bayH: 10, gap: 2, angle: -45, topPerBay: 2, bottomPerBay: 2, seatR: 2.1, zone: 'Computer Area' });

  // 6 parallel NE–SW diagonal study table banks across NE quadrant!
  b.tableBank({ x: 332, y: 234, bays: 2, bayW: 18, bayH: 10, gap: 2, angle: -45, topPerBay: 2, bottomPerBay: 2, seatR: 2.1, zone: 'Computer Area' });
  b.tableBank({ x: 360, y: 248, bays: 3, bayW: 18, bayH: 10, gap: 2, angle: -45, topPerBay: 2, bottomPerBay: 2, seatR: 2.1, zone: 'Quiet Study' });
  b.tableBank({ x: 382, y: 266, bays: 3, bayW: 18, bayH: 10, gap: 2, angle: -45, topPerBay: 2, bottomPerBay: 2, seatR: 2.1, zone: 'Quiet Study' });
  b.tableBank({ x: 294, y: 266, bays: 2, bayW: 18, bayH: 10, gap: 2, angle: -45, topPerBay: 2, bottomPerBay: 2, seatR: 2.1, zone: 'Quiet Study' });
  b.tableBank({ x: 320, y: 290, bays: 2, bayW: 18, bayH: 10, gap: 2, angle: -45, topPerBay: 2, bottomPerBay: 2, seatR: 2.1, zone: 'Quiet Study' });
  b.tableBank({ x: 344, y: 314, bays: 2, bayW: 18, bayH: 10, gap: 2, angle: -45, topPerBay: 2, bottomPerBay: 2, seatR: 2.1, zone: 'Quiet Study' });
  b.tableBank({ x: 368, y: 338, bays: 2, bayW: 18, bayH: 10, gap: 2, angle: -45, topPerBay: 2, bottomPerBay: 2, seatR: 2.1, zone: 'Quiet Study' });
  b.tableBank({ x: 392, y: 362, bays: 2, bayW: 18, bayH: 10, gap: 2, angle: -45, topPerBay: 2, bottomPerBay: 2, seatR: 2.1, zone: 'Quiet Study' });

  // 5. SW & West Iconic "Cloud Field" of 28 Round 4-Seat Sky Tables + Diagonal Study Carrel Pods!
  const skyRounds: [number, number][] = [
    [108, 286],
    [104, 314],
    [126, 304],
    [108, 344],
    [134, 336],
    [164, 334],
    [102, 376],
    [126, 366],
    [154, 366],
    [188, 356],
    [110, 408],
    [140, 396],
    [172, 394],
    [206, 386],
    [106, 442],
    [134, 428],
    [164, 424],
    [194, 420],
    [120, 474],
    [150, 464],
    [180, 456],
    [206, 450],
    [232, 446],
    [166, 492],
    [196, 488],
    [224, 480],
    [254, 472],
    [282, 464],
  ];
  for (const [rx, ry] of skyRounds) {
    b.roundTable({ cx: rx, cy: ry, r: 5.5, seats: 4, seatR: 2.1, zone: 'Quiet Study' });
  }
  // Diagonal whiteboard / 2-person carrel clusters interspersed along the SW face of both spines
  for (const [wx, wy] of [
    [108, 250],
    [142, 284],
    [176, 314],
    [232, 378],
    [264, 412],
    [298, 442],
  ]) {
    b.rectTable({ cx: wx, cy: wy, w: 22, h: 9, angle: 45, top: 2, bottom: 2, seatR: 2.0, zone: 'Group Tables', kind: 'desk' });
  }

  // 6. West & South Window Individual Study Carrels
  for (const [cx, cy] of [
    [66, 206],
    [68, 238],
    [72, 272],
    [74, 304],
    [78, 338],
    [82, 376],
    [84, 410],
    [88, 444],
    [90, 478],
  ]) {
    b.rectTable({ cx, cy, w: 10, h: 16, right: 2, seatR: 2.0, zone: 'Quiet Study', kind: 'desk' });
  }
  for (const cx of [106, 134, 162, 204, 230, 260, 290, 316, 344]) {
    b.rectTable({ cx, cy: 512, w: 15, h: 9, top: 2, seatR: 2.0, zone: 'Quiet Study', kind: 'desk' });
  }

  // 7. South-East Casual Beanbag / Pouf Lounge Corner (x: 356..432, y: 486..522)
  b.poufCluster(
    [
      [362, 496, 4.0],
      [376, 492, 4.0],
      [388, 496, 4.0],
      [372, 508, 4.2],
      [386, 514, 3.8],
      [406, 506, 4.0],
      [418, 496, 3.8],
      [428, 492, 3.6],
      [414, 518, 3.6],
    ],
    'Lounge Area',
    'pouf',
  );

  return {
    floor: 8,
    title: 'Level 8',
    nickname: 'The Sky',
    plate: [
      [44, 110],
      [190, 110],
      [190, 60],
      [440, 60],
      [440, 534],
      [412, 542],
      [80, 534],
    ],
    southGlazing: STD_SOUTH_GLAZING,
    hatchBands: [
      // NW skylight glass chamfer
      { pts: [[44, 110], [82, 110], [50, 148]], angle: 45, spacing: 6, opacity: 0.4 },
      // SE glass chamfer
      { pts: [[440, 494], [440, 534], [404, 534]], angle: -45, spacing: 6, opacity: 0.4 },
    ],
    columns: [
      [88, 286],
      [204, 286],
      [322, 286],
      [412, 286],
      [104, 496],
      [224, 496],
      [340, 496],
      [412, 496],
    ],
    core: makeCore(404, false),
    rooms: b.rooms,
    tables: b.tables,
    seats: b.seats,
    annotations: [{ x: 254, y: 192, text: 'THE SKY' }],
  };
}

export const DETAILED_PLANS: Record<number, DetailedFloorPlan> = {
  2: buildLevel2(),
  3: buildLevel3(),
  4: buildLevel4(),
  5: buildLevel5(),
  6: buildLevel6(),
  7: buildLevel7(),
  8: buildLevel8(),
};

export function detailedPlanFor(floor: number): DetailedFloorPlan | null {
  return DETAILED_PLANS[floor] ?? null;
}
