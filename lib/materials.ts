import * as THREE from 'three';
import type { Mood } from './tour';
import {
  planksTexture,
  grainTexture,
  marbleTexture,
  tileTexture,
  fabricTexture,
  rugTexture,
  artTexture,
} from './textures';

export type MoodKey = Exclude<keyof Mood, 'id' | 'name' | 'swatch'>;

function std(p: THREE.MeshStandardMaterialParameters) {
  return new THREE.MeshStandardMaterial(p);
}

function create() {
  const M = {
    floor: std({ map: planksTexture(), roughness: 0.42, metalness: 0 }),
    tile: std({ map: tileTexture(), roughness: 0.28 }),
    wall: std({ color: '#e6dccd', roughness: 0.92 }),
    accentWall: std({ color: '#a8654a', roughness: 0.95 }),
    wood: std({ map: grainTexture(), roughness: 0.48 }),
    woodDark: std({ map: grainTexture(), roughness: 0.5 }),
    cabinet: std({ color: '#3f3229', roughness: 0.62 }),
    fabric: std({ map: fabricTexture(), roughness: 0.97 }),
    fabric2: std({ map: fabricTexture(), roughness: 0.92 }),
    linen: std({ map: fabricTexture(), roughness: 0.95 }),
    stone: new THREE.MeshPhysicalMaterial({ map: marbleTexture(), roughness: 0.18, clearcoat: 0.4, clearcoatRoughness: 0.25 }),
    metal: std({ color: '#c9a05f', metalness: 1, roughness: 0.28 }),
    rug: std({ map: rugTexture(), roughness: 1 }),
    rug2: std({ map: rugTexture(), roughness: 1 }),
    // constant materials
    black: std({ color: '#141210', metalness: 0.5, roughness: 0.45 }),
    screen: std({ color: '#050505', metalness: 0.2, roughness: 0.08 }),
    glass: new THREE.MeshStandardMaterial({ color: '#cfd8dc', transparent: true, opacity: 0.12, roughness: 0.04, metalness: 0.6, depthWrite: false }),
    sheer: new THREE.MeshStandardMaterial({ color: '#f4ebe0', transparent: true, opacity: 0.5, roughness: 1, side: THREE.DoubleSide }),
    frame: std({ color: '#1d1916', metalness: 0.4, roughness: 0.5 }),
    cap: std({ color: '#17120f', roughness: 0.9 }),
    slab: std({ color: '#1e1814', roughness: 0.85 }),
    leaf: std({ color: '#4c6a3c', roughness: 0.65, flatShading: true }),
    leafDark: std({ color: '#33502c', roughness: 0.7, flatShading: true }),
    ceramic: std({ color: '#b46a47', roughness: 0.75 }),
    ceramicLight: std({ color: '#e8e2d8', roughness: 0.4 }),
    leather: std({ color: '#8a4f2a', roughness: 0.55 }),
    art: std({ map: artTexture(), roughness: 0.85 }),
    books: ['#7a3a2a', '#c49a5a', '#2f3b39', '#d9cbb3', '#5a4a6a', '#8c6a4f', '#2b2420', '#a5653f'].map((c) =>
      std({ color: c, roughness: 0.8 }),
    ),
    // emissive light sources (colour driven by kelvin)
    shade: std({ color: '#fff3e0', emissive: '#ffb46b', emissiveIntensity: 3, roughness: 0.9, side: THREE.DoubleSide }),
    bulb: std({ color: '#ffffff', emissive: '#ffcf8f', emissiveIntensity: 8 }),
    led: std({ color: '#000000', emissive: '#ffb46b', emissiveIntensity: 6 }),
  };
  return M;
}

export type Materials = ReturnType<typeof create>;

let M: Materials | null = null;
export function getMaterials(): Materials {
  if (!M) M = create();
  return M;
}

/** Material key → mood palette key, for smooth colour transitions. */
export const TINTED: [keyof Materials, MoodKey][] = [
  ['floor', 'floor'],
  ['tile', 'tile'],
  ['wall', 'wall'],
  ['accentWall', 'accentWall'],
  ['wood', 'wood'],
  ['woodDark', 'woodDark'],
  ['cabinet', 'cabinet'],
  ['fabric', 'fabric'],
  ['fabric2', 'fabric2'],
  ['linen', 'linen'],
  ['stone', 'stone'],
  ['metal', 'metal'],
  ['rug', 'rug'],
  ['rug2', 'rug2'],
];

/** Tanner Helland's colour-temperature approximation. */
export function kelvinToColor(k: number, target = new THREE.Color()) {
  const t = k / 100;
  let r: number, g: number, b: number;
  if (t <= 66) {
    r = 255;
    g = 99.4708025861 * Math.log(t) - 161.1195681661;
    b = t <= 19 ? 0 : 138.5177312231 * Math.log(t - 10) - 305.0447927307;
  } else {
    r = 329.698727446 * Math.pow(t - 60, -0.1332047592);
    g = 288.1221695283 * Math.pow(t - 60, -0.0755148492);
    b = 255;
  }
  const c = (v: number) => Math.min(255, Math.max(0, v)) / 255;
  return target.setRGB(c(r), c(g), c(b), THREE.SRGBColorSpace);
}
