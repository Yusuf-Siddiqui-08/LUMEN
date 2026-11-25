/**
 * Architectural floor plan metadata and bounds for the Student Learning Centre (SLC), levels 2 to 8.
 *
 * All 7 levels (Level 2 The Valley through Level 8 The Sky) are now traced directly from the
 * genuine SLC architectural drawings (see `slcPlans.ts` for full room, table, desk, pod, bench,
 * and seat-level geometry, and `floorOccupancy.ts` for live red/green occupancy mapping).
 *
 * Coordinates are aligned to the shared North Service Core ([190..440, 60..170]) and South-East
 * Core ([334..416, 404..470]). Level 1 is intentionally excluded as LUMEN tracks Floors 2 to 8.
 */

export type Pt = [number, number];

/** service: washrooms and storage. room: labs, offices, seminar rooms. studyRoom: bookable group rooms. */
export type AreaKind = 'service' | 'room' | 'studyRoom' | 'open' | 'casual' | 'computers';

export interface Box {
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface Area extends Partial<Box> {
  kind: AreaKind;
  label?: string;
  /** Polygon instead of a box, for angled areas. */
  pts?: Pt[];
  /** Where to put the label for a polygon area. */
  labelBox?: Box;
}

export interface Elevator extends Box {
  doors: number;
}

export interface FloorPlan {
  floor: number;
  title: string;
  /** True when there is no architectural drawing and the layout is approximate. */
  schematic: boolean;
  plate: Pt[];
  areas: Area[];
  elevators: Elevator[];
  stairs: Box[];
  facts: string[];
}

const CORE_ROOMS: Area[] = [
  { kind: 'service', x: 274, y: 62, w: 66, h: 77, label: 'Washrooms' },
  { kind: 'service', x: 344, y: 62, w: 30, h: 40, label: 'WC' },
  { kind: 'service', x: 214, y: 102, w: 58, h: 37, label: 'Storage' },
];

const CORE_ELEVATORS = (seY = 404): Elevator[] => [
  { x: 217, y: 141, w: 122, h: 27, doors: 4 },
  { x: 336, y: seY + 2, w: 78, h: 26, doors: 1 },
];

const CORE_STAIRS = (seY = 404): Box[] => [
  { x: 205, y: 62, w: 66, h: 38 },
  { x: 400, y: 62, w: 38, h: 38 },
  { x: 342, y: seY + 30, w: 66, h: 34 },
];

const TYPICAL_PLATE: Pt[] = [
  [44, 110],
  [190, 110],
  [190, 60],
  [440, 60],
  [440, 534],
  [412, 542],
  [80, 534],
];

const TYPICAL_OPEN: Pt[] = [
  [46, 112],
  [188, 112],
  [188, 172],
  [438, 172],
  [438, 532],
  [82, 532],
];

export const FLOOR_PLANS: Record<number, FloorPlan> = {
  2: {
    floor: 2,
    title: 'Level 2',
    schematic: false,
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
    areas: [
      {
        kind: 'open',
        pts: [
          [66, 126],
          [188, 126],
          [188, 174],
          [438, 174],
          [508, 208],
          [508, 380],
          [434, 414],
          [434, 530],
          [410, 562],
          [256, 562],
          [232, 432],
          [82, 352],
        ],
        label: 'The Valley & Pedestrian Bridge',
        labelBox: { x: 110, y: 245, w: 140, h: 40 },
      },
      ...CORE_ROOMS,
      { kind: 'casual', x: 342, y: 486, w: 90, h: 76, label: 'Cafe & Lounge' },
      { kind: 'computers', x: 205, y: 174, w: 66, h: 20, label: 'Info Kiosks' },
    ],
    elevators: CORE_ELEVATORS(416),
    stairs: CORE_STAIRS(416),
    facts: [
      'The Valley: double-height atrium & grand wooden stairs',
      'Pedestrian skybridge connecting directly to the TMU Library Building',
      'Bridge gallery seating, pop-up booths & south-east cafe lounge',
    ],
  },
  3: {
    floor: 3,
    title: 'Level 3',
    schematic: false,
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
    areas: [
      {
        kind: 'open',
        pts: [
          [46, 114],
          [188, 114],
          [188, 174],
          [438, 174],
          [438, 550],
          [120, 554],
          [78, 478],
        ],
        label: 'Open study space',
        labelBox: { x: 180, y: 440, w: 150, h: 40 },
      },
      ...CORE_ROOMS,
      { kind: 'computers', x: 48, y: 116, w: 104, h: 156, label: 'Digital Media Experience' },
      { kind: 'studyRoom', x: 86, y: 274, w: 76, h: 46, label: 'DME Lab' },
      { kind: 'casual', x: 80, y: 340, w: 250, h: 185, label: 'Launch Zone & Bluff Pods' },
    ],
    elevators: CORE_ELEVATORS(422),
    stairs: CORE_STAIRS(422),
    facts: [
      'Digital Media Experience (DME) Lab & meeting room',
      'Launch Zone & organic curved collaborative seating pods',
      'Atrium balcony study tables overlooking the grand stairs & SE window bar',
    ],
  },
  4: {
    floor: 4,
    title: 'Level 4',
    schematic: false,
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
    areas: [
      {
        kind: 'open',
        pts: [
          [48, 114],
          [188, 114],
          [188, 172],
          [438, 172],
          [438, 534],
          [120, 536],
          [80, 474],
        ],
        label: 'Open study space',
        labelBox: { x: 250, y: 230, w: 140, h: 40 },
      },
      ...CORE_ROOMS,
      { kind: 'room', x: 48, y: 112, w: 54, h: 338, label: 'Student Learning Support offices' },
      { kind: 'room', x: 138, y: 190, w: 86, h: 132, label: 'Learning Support & Boardroom' },
      { kind: 'studyRoom', x: 148, y: 336, w: 88, h: 76, label: 'Workshop room' },
      { kind: 'room', x: 248, y: 366, w: 82, h: 74, label: 'Low-Sensory Study Lounge' },
      { kind: 'studyRoom', x: 330, y: 366, w: 50, h: 40, label: 'Group rooms' },
      { kind: 'computers', x: 380, y: 366, w: 34, h: 40, label: 'Computers' },
    ],
    elevators: CORE_ELEVATORS(408),
    stairs: CORE_STAIRS(408),
    facts: [
      'Student Learning Support: academic accommodation, English language, math and writing support',
      'Low-Sensory Study Lounge (SLC-451) & private accommodation study booths',
      'Central diagonal study hall, workshop rooms & perimeter consultation offices',
      'One-Stop reception & east wall computer carrels',
    ],
  },
  5: {
    floor: 5,
    title: 'Level 5',
    schematic: false,
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
    areas: [
      {
        kind: 'open',
        pts: [
          [46, 112],
          [188, 112],
          [188, 172],
          [438, 172],
          [438, 532],
          [102, 534],
          [80, 504],
        ],
        label: 'Open study space',
        labelBox: { x: 280, y: 492, w: 140, h: 36 },
      },
      ...CORE_ROOMS,
      { kind: 'computers', x: 235, y: 205, w: 105, h: 85, label: 'Multimedia lab' },
      { kind: 'room', x: 96, y: 285, w: 185, h: 195, label: 'Seminar rooms' },
      { kind: 'studyRoom', x: 205, y: 268, w: 175, h: 135, label: 'Group rooms' },
      { kind: 'casual', x: 332, y: 196, w: 98, h: 82, label: 'Casual seating' },
    ],
    elevators: CORE_ELEVATORS(404),
    stairs: CORE_STAIRS(404),
    facts: [
      '3 tiered seminar rooms & Multimedia Computer Lab inside the central 45° diamond',
      '11 bookable collaborative and group work rooms (CGWRs)',
      'North-west & south sunlit rows of collaborative study desks',
      'North-east lounge booths & east window desks',
    ],
  },
  6: {
    floor: 6,
    title: 'Level 6',
    schematic: false,
    plate: TYPICAL_PLATE,
    areas: [
      {
        kind: 'open',
        pts: TYPICAL_OPEN,
        label: 'Open study space',
        labelBox: { x: 235, y: 200, w: 160, h: 40 },
      },
      ...CORE_ROOMS,
      { kind: 'casual', x: 64, y: 150, w: 270, h: 370, label: 'The Beach tiered amphitheatre' },
      { kind: 'computers', x: 360, y: 190, w: 72, h: 195, label: 'Modular lounge pods' },
    ],
    elevators: CORE_ELEVATORS(404),
    stairs: CORE_STAIRS(404),
    facts: [
      'The Beach: 5 diagonal stepped amphitheatre tiers with built-in timber benches',
      'Beanbags, poufs & south-east timber ramp lounges',
      'North-east sofa booths, round tables & giant modular seating pods',
    ],
  },
  7: {
    floor: 7,
    title: 'Level 7',
    schematic: false,
    plate: TYPICAL_PLATE,
    areas: [
      {
        kind: 'open',
        pts: TYPICAL_OPEN,
        label: 'Silent study space',
        labelBox: { x: 100, y: 420, w: 140, h: 40 },
      },
      ...CORE_ROOMS,
      { kind: 'studyRoom', x: 108, y: 110, w: 80, h: 70, label: 'NW Group rooms' },
      { kind: 'studyRoom', x: 142, y: 198, w: 132, h: 100, label: 'Center Group rooms' },
      { kind: 'studyRoom', x: 76, y: 302, w: 178, h: 118, label: 'West Group rooms' },
      { kind: 'studyRoom', x: 282, y: 184, w: 140, h: 122, label: 'East Group rooms' },
      { kind: 'studyRoom', x: 250, y: 344, w: 86, h: 168, label: 'South Group rooms' },
      { kind: 'computers', x: 356, y: 310, w: 72, h: 24, label: 'Computers' },
    ],
    elevators: CORE_ELEVATORS(404),
    stairs: CORE_STAIRS(404),
    facts: [
      '30 bookable collaborative & group work rooms arranged in radial forest groves',
      'Silent study halls (NW & SW angled quiet study banks + perimeter carrels)',
      'Graduate study space & south-east quiet desk rows',
    ],
  },
  8: {
    floor: 8,
    title: 'Level 8',
    schematic: false,
    plate: TYPICAL_PLATE,
    areas: [
      {
        kind: 'open',
        pts: TYPICAL_OPEN,
        label: 'Open study space',
        labelBox: { x: 110, y: 410, w: 150, h: 40 },
      },
      ...CORE_ROOMS,
      { kind: 'studyRoom', x: 70, y: 134, w: 175, h: 165, label: 'NW Group room spine' },
      { kind: 'studyRoom', x: 234, y: 290, w: 180, h: 114, label: 'SE Group room spine' },
      { kind: 'computers', x: 228, y: 204, w: 115, h: 52, label: 'Collaborative desks' },
      { kind: 'casual', x: 354, y: 484, w: 78, h: 42, label: 'Casual study space' },
    ],
    elevators: CORE_ELEVATORS(404),
    stairs: CORE_STAIRS(404),
    facts: [
      '16 bookable group study rooms along two 45° diagonal spines',
      '28 round 4-seat Sky tables & whiteboard pods across the south-west open floor',
      'Angled north-east study table banks, perimeter window carrels & SE lounge corner',
    ],
  },
};

/** Floors that have a plan, top floor first (matches the building: Levels 8 down to 2). */
export const PLAN_FLOORS = Object.keys(FLOOR_PLANS)
  .map(Number)
  .sort((a, b) => b - a);

export function planFor(floor: number): FloorPlan | null {
  return FLOOR_PLANS[floor] ?? null;
}

export function bounds(pts: Pt[]): Box {
  const xs = pts.map((p) => p[0]);
  const ys = pts.map((p) => p[1]);
  const x = Math.min(...xs);
  const y = Math.min(...ys);
  return { x, y, w: Math.max(...xs) - x, h: Math.max(...ys) - y };
}

/** The box an area covers, whether it is a box or a polygon. */
export function areaBox(a: Area): Box {
  if (a.pts) return bounds(a.pts);
  return { x: a.x ?? 0, y: a.y ?? 0, w: a.w ?? 0, h: a.h ?? 0 };
}

/**
 * Split a label into lines that fit a width, for SVG text (which does not wrap).
 * charW is the average character width in plan units at the label's font size.
 */
export function wrapLabel(text: string, width: number, charW: number): string[] {
  const max = Math.max(1, Math.floor(width / charW));
  const lines: string[] = [];
  let line = '';
  for (const word of text.split(/\s+/).filter(Boolean)) {
    const next = line ? `${line} ${word}` : word;
    if (next.length <= max || !line) line = next;
    else {
      lines.push(line);
      line = word;
    }
  }
  if (line) lines.push(line);
  return lines;
}
