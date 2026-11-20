/**
 * Simplified floor plans for the TMU Library building (350 Victoria Street), floors 2 and 4 to 8.
 * Traced from the official plans in the TMU Libraries directory:
 * https://library.torontomu.ca/visit-us/library-directory/
 *
 * Coordinates are in "plan units" (the pixel space of the 650 px library plan images).
 * The renderer fits the floorplate to its own viewBox, so only relative positions matter.
 */

export type Pt = [number, number];

export type AreaKind = 'room' | 'group' | 'individual' | 'computers';

export interface Box {
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface Area extends Partial<Box> {
  kind: AreaKind;
  label?: string;
  /** Polygon instead of a box, for L-shaped areas. */
  pts?: Pt[];
  /** Where to put the label for a polygon area. */
  labelBox?: Box;
}

export interface Stacks extends Box {
  /** h: rows run left to right. v: rows run top to bottom. */
  dir: 'h' | 'v';
  count: number;
}

export interface Note {
  text: string;
  x: number;
  y: number;
  w: number;
}

export interface FloorPlan {
  floor: number;
  title: string;
  plate: Pt[];
  areas: Area[];
  elevators: Box[];
  stairs: Box[];
  fountains: Pt[];
  stacks: Stacks[];
  notes: Note[];
  facts: string[];
}

export const PLAN_SOURCE_URL = 'https://library.torontomu.ca/visit-us/library-directory/';

export const FLOOR_PLANS: Record<number, FloorPlan> = {
  2: {
    floor: 2,
    title: '2nd Floor (Main)',
    plate: [[28, 98], [65, 98], [65, 58], [293, 58], [293, 83], [475, 83], [475, 235], [120, 235], [120, 296], [28, 296]],
    areas: [
      { kind: 'room', x: 80, y: 76, w: 42, h: 44, label: 'Research Help' },
      { kind: 'room', x: 186, y: 62, w: 52, h: 56, label: 'Teaching & Computer Lab LIB 272A' },
      { kind: 'room', x: 243, y: 65, w: 38, h: 64, label: 'Materials ConneXion LIB 272B' },
      { kind: 'group', x: 285, y: 95, w: 20, h: 18 },
      {
        kind: 'computers',
        pts: [[248, 160], [320, 160], [320, 110], [400, 110], [400, 195], [248, 195]],
        label: 'Desktop Computers',
        labelBox: { x: 325, y: 130, w: 70, h: 30 },
      },
      { kind: 'room', x: 410, y: 112, w: 58, h: 83, label: 'Geospatial, Map & Data Centre' },
      { kind: 'room', x: 35, y: 178, w: 23, h: 14 },
      { kind: 'room', x: 32, y: 198, w: 26, h: 94, label: 'Circulation' },
      { kind: 'room', x: 193, y: 158, w: 35, h: 42, label: 'Help & Printers' },
      { kind: 'group', x: 190, y: 210, w: 210, h: 12 },
    ],
    elevators: [{ x: 35, y: 130, w: 70, h: 40 }],
    stairs: [{ x: 105, y: 130, w: 20, h: 40 }],
    fountains: [[322, 112], [73, 282]],
    stacks: [],
    notes: [
      { text: 'Entrance from SLC', x: 126, y: 64, w: 56 },
      { text: 'Book Return', x: 60, y: 179, w: 42 },
      { text: 'Exit only', x: 140, y: 198, w: 50 },
      { text: 'Entrance from Library building', x: 66, y: 250, w: 52 },
    ],
    facts: [
      'Main floor with two entrances: east (from Nelson Mandela Way) and west (from the Student Learning Centre)',
      'Circulation Desk by the east entrance, Research Help Desk by the west entrance',
      'Information Desk and the Ronald D. Besse Information and Learning Commons in the central area',
      'Geospatial, Map and Data Centre and Material ConneXion',
      'Washrooms next to the central staircase, two bottle-filling fountains',
    ],
  },
  4: {
    floor: 4,
    title: '4th Floor',
    plate: [[148, 20], [458, 20], [458, 272], [268, 272], [268, 305], [148, 305]],
    areas: [
      { kind: 'room', x: 170, y: 32, w: 54, h: 22, label: 'Washroom' },
      { kind: 'room', x: 229, y: 32, w: 36, h: 22, label: 'WC' },
      { kind: 'room', x: 270, y: 30, w: 52, h: 26, label: 'Accessible WC' },
      { kind: 'room', x: 332, y: 78, w: 110, h: 127, label: 'Special Collections (by appointment)' },
      { kind: 'room', x: 160, y: 153, w: 102, h: 132, label: 'Archives & Special Collections Reading Room' },
      { kind: 'individual', x: 272, y: 152, w: 41, h: 126, label: 'Individual study' },
      {
        kind: 'group',
        pts: [[327, 235], [440, 205], [452, 262], [327, 262]],
        label: 'Group study',
        labelBox: { x: 335, y: 228, w: 105, h: 30 },
      },
    ],
    elevators: [{ x: 168, y: 88, w: 90, h: 40 }],
    stairs: [{ x: 258, y: 88, w: 27, h: 40 }],
    fountains: [[183, 73]],
    stacks: [],
    notes: [],
    facts: [
      'A quiet floor with open seating, windows and natural light',
      'TMU Archives and Special Collections, including the reading room',
      'No group study rooms here, bookable rooms are on floors 5 to 9',
      'Swivel chairs, collaborative tables with built-in outlets and two height-adjustable tables',
      "Men's, women's and all-gender accessible washrooms",
    ],
  },
  5: {
    floor: 5,
    title: '5th Floor',
    plate: [[198, 22], [445, 22], [445, 100], [482, 100], [482, 182], [445, 182], [445, 268], [250, 268], [250, 318], [115, 318], [115, 195], [198, 195]],
    areas: [
      { kind: 'room', x: 205, y: 32, w: 46, h: 20, label: 'Washroom' },
      { kind: 'room', x: 255, y: 32, w: 46, h: 20, label: 'Washroom' },
      { kind: 'room', x: 390, y: 30, w: 42, h: 60, label: 'Group Study Rooms' },
      { kind: 'room', x: 390, y: 200, w: 42, h: 62, label: 'Group Study Rooms' },
      { kind: 'individual', x: 410, y: 108, w: 68, h: 24, label: 'Individual study' },
      { kind: 'individual', x: 125, y: 200, w: 60, h: 92, label: 'Individual study' },
      { kind: 'group', x: 325, y: 32, w: 20, h: 18 },
      { kind: 'group', x: 243, y: 135, w: 29, h: 15 },
    ],
    elevators: [{ x: 207, y: 83, w: 65, h: 35 }],
    stairs: [{ x: 272, y: 83, w: 33, h: 35 }],
    fountains: [[217, 68]],
    stacks: [
      { x: 355, y: 30, w: 30, h: 70, dir: 'h', count: 9 },
      { x: 290, y: 158, w: 95, h: 82, dir: 'h', count: 9 },
      { x: 245, y: 158, w: 40, h: 82, dir: 'h', count: 9 },
      { x: 420, y: 140, w: 55, h: 30, dir: 'h', count: 3 },
      { x: 190, y: 218, w: 38, h: 72, dir: 'v', count: 5 },
    ],
    notes: [],
    facts: [
      'Quiet individual and group study',
      'Books A to HC, audiovisual collection, microforms and back issues',
      'Six bookable group study rooms for 4, 6 or 8 people',
      'Study carrels with outlets and lamps, plus armchairs',
      'FCS Academic Support Centre and learning strategist offices',
    ],
  },
  6: {
    floor: 6,
    title: '6th Floor',
    plate: [[150, 28], [470, 28], [470, 285], [285, 285], [285, 305], [150, 305]],
    areas: [
      { kind: 'individual', x: 163, y: 48, w: 52, h: 67, label: 'Individual study' },
      { kind: 'room', x: 230, y: 34, w: 46, h: 20, label: 'Washroom' },
      { kind: 'room', x: 280, y: 34, w: 46, h: 20, label: 'Washroom' },
      { kind: 'group', x: 350, y: 35, w: 18, h: 18 },
      { kind: 'room', x: 440, y: 35, w: 30, h: 87, label: 'Group Rooms' },
      { kind: 'individual', x: 160, y: 215, w: 165, h: 77, label: 'Individual study' },
      { kind: 'room', x: 345, y: 215, w: 85, h: 28, label: 'Teaching Lab LIB 667A' },
    ],
    elevators: [{ x: 233, y: 85, w: 72, h: 33 }],
    stairs: [{ x: 305, y: 85, w: 27, h: 33 }],
    fountains: [[238, 70]],
    stacks: [
      { x: 392, y: 38, w: 40, h: 90, dir: 'h', count: 8 },
      { x: 168, y: 140, w: 262, h: 55, dir: 'v', count: 22 },
    ],
    notes: [],
    facts: [
      'Individual, quiet study floor with windows and natural light',
      'Books with call numbers HD to HT',
      'Computer lab LIB667A with 25 drop-in computers',
      'Three bookable group study rooms',
      'Study carrels with outlets and USB ports, plus enclosed study pods',
    ],
  },
  7: {
    floor: 7,
    title: '7th Floor',
    plate: [[140, 22], [470, 22], [470, 195], [425, 195], [425, 300], [140, 300]],
    areas: [
      { kind: 'individual', x: 152, y: 32, w: 53, h: 63, label: 'Individual study' },
      { kind: 'room', x: 225, y: 34, w: 40, h: 18, label: 'Washroom' },
      { kind: 'room', x: 268, y: 34, w: 40, h: 18, label: 'Washroom' },
      { kind: 'group', x: 350, y: 35, w: 18, h: 17 },
      { kind: 'room', x: 432, y: 38, w: 23, h: 84, label: 'Group Rooms' },
      { kind: 'individual', x: 150, y: 215, w: 270, h: 80, label: 'Individual study' },
    ],
    elevators: [{ x: 222, y: 85, w: 76, h: 33 }],
    stairs: [{ x: 298, y: 85, w: 24, h: 33 }],
    fountains: [[225, 70]],
    stacks: [
      { x: 352, y: 38, w: 63, h: 90, dir: 'h', count: 8 },
      { x: 155, y: 140, w: 265, h: 55, dir: 'v', count: 24 },
    ],
    notes: [],
    facts: [
      'Individual, quiet study floor with varied seating',
      'Books with call numbers HV to PN1995',
      'Four bookable group study rooms, LIB762 has an LCD monitor',
      'Individual carrels with outlets and USB ports, plus countertop seating',
      'Accessible pod in the southwest quadrant, near the all-gender washroom',
    ],
  },
  8: {
    floor: 8,
    title: '8th Floor',
    plate: [[145, 22], [462, 22], [462, 300], [250, 300], [250, 312], [145, 312]],
    areas: [
      { kind: 'room', x: 186, y: 32, w: 46, h: 24, label: 'Accessible WC' },
      { kind: 'room', x: 236, y: 32, w: 44, h: 24, label: 'Washroom' },
      { kind: 'room', x: 284, y: 32, w: 44, h: 24, label: 'Washroom' },
      { kind: 'room', x: 345, y: 35, w: 110, h: 24, label: 'Group Study Rooms' },
      { kind: 'room', x: 318, y: 270, w: 137, h: 28, label: 'Group Study Rooms' },
      { kind: 'individual', x: 153, y: 66, w: 22, h: 219 },
      { kind: 'group', x: 190, y: 165, w: 75, h: 105, label: 'Group study' },
    ],
    elevators: [{ x: 188, y: 95, w: 74, h: 37 }],
    stairs: [{ x: 262, y: 95, w: 23, h: 37 }],
    fountains: [[197, 76]],
    stacks: [
      { x: 350, y: 82, w: 80, h: 70, dir: 'h', count: 6 },
      { x: 280, y: 170, w: 140, h: 85, dir: 'v', count: 10 },
    ],
    notes: [],
    facts: [
      'Group study floor with a green (plant) wall and natural light',
      '12 bookable group study rooms for 4, 6 or 8 people, with LCD monitors',
      'Books with call numbers PN1996 to PS7999',
      'Study carrels with outlets, USB ports and LED lamps',
      'Collaborative tables with built-in outlets in the central area',
    ],
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
