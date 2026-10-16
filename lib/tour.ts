import type { MoodId, TimeId } from './store';

export type Vec3 = [number, number, number];

export interface Stop {
  id: string;
  label: string;
  pos: Vec3;
  target: Vec3;
  /** how far the camera lifts on the way to the next stop (to clear walls) */
  lift: number;
  /** distance multiplier on portrait screens */
  portrait: number;
  /** sideways framing shift on wide screens (negative = subject sits right of centre) */
  shift?: number;
  /** on portrait screens, raise the subject in frame (copy sits at the bottom) */
  pUp?: number;
}

export const STOPS: Stop[] = [
  { id: 'overview', label: 'Overview', pos: [6.5, 14.5, 15.5], target: [0, 0, -0.4], lift: 0, portrait: 1.45, shift: -3.4, pUp: 4.2 },
  { id: 'living', label: 'Living', pos: [-0.35, 2.15, -0.05], target: [-4.6, 0.85, -3.2], lift: 1.2, portrait: 1.15, pUp: 0.5 },
  { id: 'kitchen', label: 'Kitchen', pos: [0.9, 2.2, -0.15], target: [4.8, 0.95, -3.3], lift: 4.2, portrait: 1.15, pUp: 0.5 },
  { id: 'bedroom', label: 'Bedroom', pos: [-1.6, 2.45, 7.0], target: [-4.3, 0.75, 1.7], lift: 1.6, portrait: 1.2, pUp: 0.5 },
  { id: 'study', label: 'Study', pos: [3.6, 2.7, 7.7], target: [3.6, 0.85, 2.6], lift: 3.5, portrait: 1.2, pUp: 0.5 },
  { id: 'outro', label: 'Overview', pos: [-11.5, 12.5, 12.5], target: [0, 0, -0.2], lift: 0, portrait: 1.5, shift: -4.6, pUp: 4.2 },
];

export interface Room {
  id: string;
  index: string;
  name: string;
  title: string;
  body: string;
  specs: string[];
  solves: string;
}

export const ROOMS: Room[] = [
  {
    id: 'living',
    index: '01',
    name: 'Living Room',
    title: 'Layered light, not just more light.',
    body: 'An arc lamp over the conversation, a warm wash under the walnut media wall, and evening sun through floor-to-ceiling glass. Tap any pin to see the piece, its finish and its price.',
    specs: ['24 m²', 'Fluted walnut media wall', '2700K ambient'],
    solves: 'I can’t picture it from a 2D plan',
  },
  {
    id: 'kitchen',
    index: '02',
    name: 'Kitchen & Dining',
    title: 'Built around the island.',
    body: 'A stone-topped island that seats three, a full-height pantry wall that hides every appliance, and a brass pendant that makes the dining table the warmest spot in the house.',
    specs: ['28 m²', 'Quartz + walnut', 'Hidden appliances'],
    solves: 'The final bill never matches the quote',
  },
  {
    id: 'bedroom',
    index: '03',
    name: 'Primary Bedroom',
    title: 'A room that winds you down.',
    body: 'An upholstered headboard wall, bedside light at reading height and a full-height wardrobe in matched veneer. Switch the mood in the dock below — oak, walnut or noir — in a second.',
    specs: ['18 m²', 'Upholstered headboard', 'Dimmable bedside'],
    solves: 'Revisions take weeks of back-and-forth',
  },
  {
    id: 'study',
    index: '04',
    name: 'Study',
    title: 'Work that ends at six.',
    body: 'Desk turned to the window for daylight, a wall of books behind for video calls, and a reading chair with its own lamp for when the laptop closes.',
    specs: ['14 m²', 'Built-in library', 'Task + reading light'],
    solves: 'I never know what’s actually being built',
  },
];

export interface Hotspot {
  id: string;
  room: string;
  position: Vec3;
  title: string;
  material: string;
  size: string;
  lead: string;
  price: number;
}

export const HOTSPOTS: Hotspot[] = [
  { id: 'sofa', room: 'living', position: [-2.0, 1.05, -2.5], title: 'Three-seat lounge sofa', material: 'Bouclé upholstery, solid oak frame, brass feet', size: '260 × 95 × 78 cm', lead: '5–6 weeks', price: 184000 },
  { id: 'coffee', room: 'living', position: [-3.7, 0.62, -2.5], title: 'Drum coffee table', material: 'Honed travertine-look quartz', size: 'Ø 110 × 36 cm', lead: '3 weeks', price: 62000 },
  { id: 'media', room: 'living', position: [-6.75, 2.35, -3.6], title: 'Fluted media wall', material: 'Walnut veneer flutes, concealed LED, floating console', size: '340 × 290 cm', lead: '4 weeks, built on site', price: 236000 },
  { id: 'arc', room: 'living', position: [-3.3, 2.35, -3.1], title: 'Arc floor lamp', material: 'Brushed brass, marble base, opal diffuser', size: 'H 210 cm, reach 180 cm', lead: 'In stock', price: 38500 },
  { id: 'island', room: 'kitchen', position: [4.5, 1.25, -2.4], title: 'Kitchen island', material: 'Calacatta-look quartz top, fluted walnut base', size: '260 × 105 × 92 cm', lead: '6 weeks', price: 312000 },
  { id: 'pendants', room: 'kitchen', position: [3.7, 2.3, -2.4], title: 'Opal globe pendants ×3', material: 'Hand-blown opal glass, brass ceiling rose', size: 'Ø 28 cm each', lead: '2 weeks', price: 54000 },
  { id: 'pantry', room: 'kitchen', position: [6.5, 1.95, -2.9], title: 'Pantry & appliance wall', material: 'Matte lacquer shutters, integrated fridge + oven tower', size: '270 × 250 × 60 cm', lead: '6 weeks', price: 268000 },
  { id: 'dining', room: 'kitchen', position: [1.6, 1.05, -2.5], title: 'Round dining set', material: 'Solid walnut pedestal table, 4 woven-back chairs', size: 'Ø 120 cm', lead: '5 weeks', price: 146000 },
  { id: 'bed', room: 'bedroom', position: [-4.2, 0.95, 2.2], title: 'Upholstered king bed', material: 'Linen-blend headboard wall, oak platform', size: '195 × 215 cm', lead: '5 weeks', price: 168000 },
  { id: 'wardrobe', room: 'bedroom', position: [-0.45, 1.85, 3.3], title: 'Full-height wardrobe', material: 'Matched veneer, soft-close, brass pulls', size: '280 × 250 × 60 cm', lead: '6 weeks, built on site', price: 296000 },
  { id: 'art', room: 'bedroom', position: [-4.2, 2.15, 0.8], title: 'Commissioned artwork', material: 'Acrylic on canvas, oak float frame', size: '120 × 80 cm', lead: '4 weeks', price: 45000 },
  { id: 'library', room: 'study', position: [0.35, 2.05, 3.1], title: 'Built-in library', material: 'Oak veneer carcass, 5 adjustable shelves', size: '300 × 220 × 35 cm', lead: '4 weeks, built on site', price: 132000 },
  { id: 'desk', room: 'study', position: [6.3, 1.05, 3.0], title: 'Window desk', material: 'Walnut top, powder-coated steel legs', size: '170 × 70 × 75 cm', lead: '3 weeks', price: 58000 },
  { id: 'reader', room: 'study', position: [1.7, 1.15, 4.1], title: 'Reading chair + lamp', material: 'Cognac leather, oak frame; brass floor lamp', size: '82 × 86 × 78 cm', lead: '4 weeks', price: 96000 },
];

export interface Mood {
  id: MoodId;
  name: string;
  swatch: [string, string, string];
  floor: string;
  wall: string;
  accentWall: string;
  wood: string;
  woodDark: string;
  fabric: string;
  fabric2: string;
  linen: string;
  stone: string;
  metal: string;
  rug: string;
  rug2: string;
  cabinet: string;
  tile: string;
}

export const MOODS: Record<MoodId, Mood> = {
  walnut: {
    id: 'walnut',
    name: 'Warm Walnut',
    swatch: ['#6b4329', '#d8cbb8', '#c8a165'],
    floor: '#a87650',
    wall: '#e6dccd',
    accentWall: '#a8654a',
    wood: '#7a4c2f',
    woodDark: '#4a2e1d',
    fabric: '#ddd0bd',
    fabric2: '#9a5e3c',
    linen: '#efe7da',
    stone: '#ece6dc',
    metal: '#c9a05f',
    rug: '#cdbba3',
    rug2: '#8c6a4f',
    cabinet: '#3f3229',
    tile: '#d9cfc2',
  },
  japandi: {
    id: 'japandi',
    name: 'Japandi Oak',
    swatch: ['#b58d62', '#e7e1d5', '#2b2b2b'],
    floor: '#caa77c',
    wall: '#ece7de',
    accentWall: '#9c9a84',
    wood: '#b8915f',
    woodDark: '#7d6343',
    fabric: '#e9e3d7',
    fabric2: '#7c7f66',
    linen: '#f3efe8',
    stone: '#f2eee7',
    metal: '#2a2a2a',
    rug: '#ddd5c6',
    rug2: '#a9a28f',
    cabinet: '#d9d1c3',
    tile: '#e6e0d6',
  },
  noir: {
    id: 'noir',
    name: 'Noir Brass',
    swatch: ['#2c2622', '#6f5847', '#d4a85a'],
    floor: '#5a4030',
    wall: '#4a413a',
    accentWall: '#26201c',
    wood: '#3d2a1f',
    woodDark: '#211611',
    fabric: '#7a6250',
    fabric2: '#3a2f29',
    linen: '#cfc3b2',
    stone: '#3a3633',
    metal: '#d8ac5c',
    rug: '#5c4a3d',
    rug2: '#2a221d',
    cabinet: '#1d1916',
    tile: '#4a4440',
  },
};

export interface TimePreset {
  id: TimeId;
  name: string;
  sunColor: string;
  sunIntensity: number;
  sunPos: Vec3;
  hemi: number;
  env: number;
  lamps: number;
  bg: string;
  sky: number;
}

export const TIMES: Record<TimeId, TimePreset> = {
  golden: { id: 'golden', name: 'Golden hour', sunColor: '#ffae63', sunIntensity: 3.2, sunPos: [-7, 5.2, -15], hemi: 0.22, env: 0.35, lamps: 1, bg: '#0d0907', sky: 1.5 },
  night: { id: 'night', name: 'Night', sunColor: '#7f95d6', sunIntensity: 0.35, sunPos: [-6, 9, -14], hemi: 0.06, env: 0.16, lamps: 1.35, bg: '#07060a', sky: 1.1 },
  day: { id: 'day', name: 'Daylight', sunColor: '#fff0da', sunIntensity: 4.2, sunPos: [-6, 13, -11], hemi: 0.75, env: 0.9, lamps: 0.25, bg: '#171310', sky: 1.25 },
};
