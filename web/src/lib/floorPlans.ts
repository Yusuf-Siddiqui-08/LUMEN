/**
 * Simplified floor plans for the Student Learning Centre (SLC), levels 3 to 8.
 *
 * Levels 5 to 8 are traced from the SLC architectural floor plans (+5 to +8). Their room types match
 * the SLC floor map: group study rooms, seminar rooms, the multimedia lab, computers and open study.
 * Levels 3 and 4 have no architectural drawing, so they reuse the typical floorplate and core with an
 * approximate layout of the spaces the SLC floor map lists for them (marked `schematic`).
 *
 * Coordinates are in "plan units" (pixels of the source drawings). Every floor shares the north
 * service core (stairs, washrooms, four elevators) and the south-east stair with one elevator.
 * The renderer fits the floorplate to its own viewBox, so only relative positions matter.
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
  { kind: 'service', x: 290, y: 25, w: 88, h: 75, label: 'Washrooms' },
  { kind: 'service', x: 380, y: 25, w: 45, h: 40, label: 'WC' },
  { kind: 'service', x: 225, y: 68, w: 62, h: 38, label: 'Storage' },
];

const CORE_ELEVATORS: Elevator[] = [
  { x: 240, y: 108, w: 125, h: 37, doors: 4 },
  { x: 362, y: 414, w: 78, h: 26, doors: 1 },
];

const CORE_STAIRS: Box[] = [
  { x: 205, y: 22, w: 82, h: 44 },
  { x: 427, y: 22, w: 51, h: 44 },
  { x: 362, y: 442, w: 78, h: 36 },
];

export const FLOOR_PLANS: Record<number, FloorPlan> = {
  3: {
    floor: 3,
    title: 'Level 3',
    schematic: true,
    plate: [
      [35, 72],
      [200, 45],
      [200, 18],
      [478, 18],
      [478, 548],
      [75, 556],
    ],
    areas: [
      {
        kind: 'open',
        pts: [
          [38, 75],
          [198, 48],
          [198, 150],
          [476, 150],
          [476, 546],
          [77, 553],
        ],
        label: 'Open study space',
        labelBox: { x: 120, y: 470, w: 200, h: 40 },
      },
      ...CORE_ROOMS,
      {
        kind: 'room',
        x: 70,
        y: 170,
        w: 150,
        h: 120,
        label: 'Digital Media Experience',
      },
      { kind: 'room', x: 260, y: 200, w: 180, h: 110, label: 'Launch Zone' },
      {
        kind: 'casual',
        x: 120,
        y: 340,
        w: 200,
        h: 70,
        label: 'Open study tables',
      },
    ],
    elevators: CORE_ELEVATORS,
    stairs: CORE_STAIRS,
    facts: ['Digital Media Experience', 'Launch Zone', 'Open study space'],
  },
  4: {
    floor: 4,
    title: 'Level 4',
    schematic: true,
    plate: [
      [35, 72],
      [200, 45],
      [200, 18],
      [478, 18],
      [478, 548],
      [75, 556],
    ],
    areas: [
      {
        kind: 'open',
        pts: [
          [38, 75],
          [198, 48],
          [198, 150],
          [476, 150],
          [476, 546],
          [77, 553],
        ],
        label: 'Open study space',
        labelBox: { x: 150, y: 490, w: 180, h: 40 },
      },
      ...CORE_ROOMS,
      {
        kind: 'room',
        x: 230,
        y: 165,
        w: 120,
        h: 50,
        label: 'One-Stop reception',
      },
      {
        kind: 'room',
        x: 60,
        y: 170,
        w: 150,
        h: 150,
        label: 'Student Learning Support offices',
      },
      { kind: 'room', x: 370, y: 190, w: 100, h: 70, label: 'Writing support' },
      { kind: 'room', x: 370, y: 270, w: 100, h: 70, label: 'Math support' },
      {
        kind: 'room',
        x: 230,
        y: 240,
        w: 120,
        h: 90,
        label: 'Library learning services',
      },
      {
        kind: 'room',
        x: 95,
        y: 360,
        w: 230,
        h: 60,
        label: 'Study skills and transitions',
      },
    ],
    elevators: CORE_ELEVATORS,
    stairs: CORE_STAIRS,
    facts: [
      'Student Learning Support: academic accommodation, English language, math and writing support',
      'Help for graduate students, study skills and transitions support',
      'One-Stop reception and Student Learning Support offices',
      'Library learning services',
    ],
  },
  5: {
    floor: 5,
    title: 'Level 5',
    schematic: false,
    plate: [
      [35, 66],
      [200, 66],
      [200, 18],
      [478, 18],
      [478, 551],
      [92, 554],
    ],
    areas: [
      {
        kind: 'open',
        pts: [
          [38, 69],
          [198, 69],
          [198, 150],
          [475, 150],
          [475, 549],
          [94, 551],
        ],
        label: 'Open study space',
        labelBox: { x: 300, y: 490, w: 150, h: 40 },
      },
      ...CORE_ROOMS,
      { kind: 'computers', x: 60, y: 180, w: 110, h: 60, label: 'Computers' },
      {
        kind: 'room',
        pts: [
          [90, 304],
          [175, 254],
          [300, 429],
          [170, 509],
        ],
        label: 'Seminar rooms',
        labelBox: { x: 135, y: 380, w: 110, h: 40 },
      },
      {
        kind: 'room',
        pts: [
          [230, 214],
          [277, 171],
          [368, 254],
          [330, 289],
        ],
        label: 'Multimedia lab',
        labelBox: { x: 255, y: 220, w: 90, h: 36 },
      },
      {
        kind: 'studyRoom',
        pts: [
          [180, 249],
          [212, 226],
          [338, 399],
          [305, 424],
        ],
        label: 'Group rooms',
        labelBox: { x: 215, y: 320, w: 60, h: 36 },
      },
      {
        kind: 'studyRoom',
        pts: [
          [300, 319],
          [368, 259],
          [430, 349],
          [362, 399],
        ],
        label: 'Group rooms',
        labelBox: { x: 330, y: 325, w: 70, h: 36 },
      },
      { kind: 'casual', x: 95, y: 470, w: 70, h: 50, label: 'Casual seating' },
    ],
    elevators: CORE_ELEVATORS,
    stairs: CORE_STAIRS,
    facts: ['Casual seating', 'Collaborative and group work rooms', 'Open study space', 'Seminar rooms'],
  },
  6: {
    floor: 6,
    title: 'Level 6',
    schematic: false,
    plate: [
      [35, 72],
      [200, 45],
      [200, 18],
      [478, 18],
      [478, 548],
      [75, 556],
    ],
    areas: [
      {
        kind: 'open',
        pts: [
          [38, 75],
          [198, 48],
          [198, 150],
          [476, 150],
          [476, 546],
          [77, 553],
        ],
        label: 'Open study space',
        labelBox: { x: 280, y: 200, w: 170, h: 40 },
      },
      ...CORE_ROOMS,
      {
        kind: 'casual',
        pts: [
          [50.8, 129.2],
          [200.8, 279.2],
          [219.2, 260.8],
          [69.2, 110.8],
        ],
        label: 'Casual seating',
        labelBox: { x: 95, y: 180, w: 80, h: 30 },
      },
      {
        kind: 'casual',
        pts: [
          [46.6, 214.9],
          [321.6, 449.9],
          [338.4, 430.1],
          [63.4, 195.1],
        ],
      },
      {
        kind: 'casual',
        pts: [
          [51.2, 309.6],
          [291.2, 529.6],
          [308.8, 510.4],
          [68.8, 290.4],
        ],
      },
      {
        kind: 'casual',
        pts: [
          [71.0, 409.4],
          [191.0, 524.4],
          [209.0, 505.6],
          [89.0, 390.6],
        ],
      },
      {
        kind: 'casual',
        pts: [
          [104.6, 167.2],
          [229.6, 262.2],
          [240.4, 247.8],
          [115.4, 152.8],
        ],
      },
    ],
    elevators: CORE_ELEVATORS,
    stairs: CORE_STAIRS,
    facts: ['Casual seating', 'Collaborative work space', 'Open study space'],
  },
  7: {
    floor: 7,
    title: 'Level 7',
    schematic: false,
    plate: [
      [35, 70],
      [200, 70],
      [200, 18],
      [478, 18],
      [478, 548],
      [78, 548],
    ],
    areas: [
      {
        kind: 'open',
        pts: [
          [38, 73],
          [198, 73],
          [198, 150],
          [476, 150],
          [476, 546],
          [80, 546],
        ],
        label: 'Open study space',
        labelBox: { x: 90, y: 440, w: 150, h: 40 },
      },
      ...CORE_ROOMS,
      {
        kind: 'studyRoom',
        pts: [
          [148, 182],
          [205, 168],
          [285, 285],
          [228, 305],
        ],
        label: 'Group rooms',
        labelBox: { x: 180, y: 215, w: 70, h: 40 },
      },
      {
        kind: 'studyRoom',
        pts: [
          [318, 235],
          [470, 180],
          [476, 245],
          [330, 300],
        ],
        label: 'Group rooms',
        labelBox: { x: 350, y: 225, w: 100, h: 36 },
      },
      {
        kind: 'studyRoom',
        pts: [
          [80, 300],
          [240, 290],
          [255, 350],
          [90, 395],
        ],
        label: 'Group rooms',
        labelBox: { x: 110, y: 315, w: 110, h: 40 },
      },
      {
        kind: 'studyRoom',
        pts: [
          [225, 350],
          [290, 340],
          [355, 505],
          [285, 525],
        ],
        label: 'Group rooms',
        labelBox: { x: 255, y: 410, w: 60, h: 40 },
      },
      { kind: 'computers', x: 262, y: 168, w: 80, h: 50, label: 'Computers' },
      { kind: 'computers', x: 340, y: 312, w: 110, h: 70, label: 'Computers' },
    ],
    elevators: CORE_ELEVATORS,
    stairs: CORE_STAIRS,
    facts: [
      'Collaborative and group work rooms',
      'Collaborative work space',
      'Graduate study space',
      'Open study space',
      'Silent study space',
    ],
  },
  8: {
    floor: 8,
    title: 'Level 8',
    schematic: false,
    plate: [
      [32, 70],
      [200, 70],
      [200, 18],
      [478, 18],
      [478, 505],
      [445, 540],
      [75, 540],
    ],
    areas: [
      {
        kind: 'open',
        pts: [
          [35, 73],
          [198, 73],
          [198, 150],
          [475, 150],
          [475, 503],
          [443, 538],
          [77, 538],
        ],
        label: 'Open study space',
        labelBox: { x: 110, y: 430, w: 150, h: 40 },
      },
      ...CORE_ROOMS,
      {
        kind: 'casual',
        x: 128,
        y: 74,
        w: 70,
        h: 36,
        label: 'Casual study space',
      },
      {
        kind: 'studyRoom',
        pts: [
          [75, 128],
          [110, 95],
          [245, 235],
          [212, 275],
        ],
        label: 'Group rooms',
        labelBox: { x: 125, y: 165, w: 70, h: 40 },
      },
      {
        kind: 'studyRoom',
        pts: [
          [248, 305],
          [285, 268],
          [405, 370],
          [370, 410],
        ],
        label: 'Group rooms',
        labelBox: { x: 295, y: 315, w: 70, h: 40 },
      },
      { kind: 'computers', x: 262, y: 180, w: 75, h: 55, label: 'Computers' },
    ],
    elevators: CORE_ELEVATORS,
    stairs: CORE_STAIRS,
    facts: ['Casual study space', 'Collaborative and group work rooms', 'Collaborative work space', 'Open study areas'],
  },
};

/** Floors that have a plan, top floor first (matches the building). */
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
