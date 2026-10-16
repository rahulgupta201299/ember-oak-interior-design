import * as THREE from 'three';
import type { TimeId } from './store';

// Procedural canvas textures — no external assets, so the scene loads instantly
// and can be re-tinted per mood through material colour.

function rng(seed: number) {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function canvas(w: number, h: number) {
  const c = document.createElement('canvas');
  c.width = w;
  c.height = h;
  return [c, c.getContext('2d')!] as const;
}

function toTexture(c: HTMLCanvasElement, srgb = true, repeat = true) {
  const t = new THREE.CanvasTexture(c);
  if (srgb) t.colorSpace = THREE.SRGBColorSpace;
  if (repeat) t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.anisotropy = 8;
  t.needsUpdate = true;
  return t;
}

const cache = new Map<string, THREE.Texture>();
function memo(key: string, make: () => THREE.Texture) {
  if (!cache.has(key)) cache.set(key, make());
  return cache.get(key)!;
}

function grain(ctx: CanvasRenderingContext2D, r: () => number, x: number, y: number, w: number, h: number, lines: number, alpha: number) {
  for (let k = 0; k < lines; k++) {
    const yy = y + r() * h;
    const amp = 1 + r() * 3;
    const freq = 0.004 + r() * 0.01;
    const ph = r() * 10;
    ctx.strokeStyle = `rgba(40,25,15,${alpha * (0.3 + r())})`;
    ctx.lineWidth = 0.6 + r() * 1.8;
    ctx.beginPath();
    for (let xx = x; xx <= x + w; xx += 8) {
      const yv = yy + Math.sin(xx * freq + ph) * amp + Math.sin(xx * freq * 3.1 + ph) * amp * 0.3;
      if (xx === x) ctx.moveTo(xx, yv);
      else ctx.lineTo(xx, yv);
    }
    ctx.stroke();
  }
}

/** Wide-plank engineered wood floor. 1 texture unit = 1.6 m. */
export const planksTexture = () =>
  memo('planks', () => {
    const S = 1024;
    const [c, ctx] = canvas(S, S);
    const r = rng(7);
    const rows = 8;
    const ph = S / rows;
    for (let row = 0; row < rows; row++) {
      let x = -r() * S * 0.5;
      while (x < S) {
        const len = S * (0.38 + r() * 0.5);
        const [pc, pctx] = canvas(Math.ceil(len), Math.ceil(ph));
        const L = 196 + r() * 44;
        pctx.fillStyle = `rgb(${L},${L - 4},${L - 10})`;
        pctx.fillRect(0, 0, len, ph);
        // tonal streaks
        for (let s = 0; s < 6; s++) {
          pctx.fillStyle = `rgba(${r() > 0.5 ? '255,245,230' : '60,40,25'},${0.04 + r() * 0.05})`;
          pctx.fillRect(0, r() * ph, len, 4 + r() * 18);
        }
        grain(pctx, r, 0, 0, len, ph, 26, 0.09);
        if (r() > 0.75) {
          const kx = r() * len;
          const ky = ph * (0.3 + r() * 0.4);
          const g = pctx.createRadialGradient(kx, ky, 0, kx, ky, 14);
          g.addColorStop(0, 'rgba(50,30,15,0.45)');
          g.addColorStop(1, 'rgba(50,30,15,0)');
          pctx.fillStyle = g;
          pctx.beginPath();
          pctx.ellipse(kx, ky, 22, 8, 0, 0, Math.PI * 2);
          pctx.fill();
        }
        pctx.fillStyle = 'rgba(25,15,8,0.55)';
        pctx.fillRect(0, 0, 2, ph);
        pctx.fillRect(0, 0, len, 2);
        for (const off of [-S, 0, S]) ctx.drawImage(pc, x + off, row * ph);
        x += len;
      }
    }
    return toTexture(c);
  });

/** Lengthwise grain for furniture veneers. */
export const grainTexture = () =>
  memo('grain', () => {
    const S = 1024;
    const [c, ctx] = canvas(S, S);
    const r = rng(21);
    ctx.fillStyle = 'rgb(222,216,206)';
    ctx.fillRect(0, 0, S, S);
    for (let s = 0; s < 30; s++) {
      ctx.fillStyle = `rgba(${r() > 0.5 ? '255,250,240' : '70,45,25'},${0.03 + r() * 0.05})`;
      ctx.fillRect(0, r() * S, S, 6 + r() * 40);
    }
    grain(ctx, r, 0, 0, S, S, 220, 0.08);
    return toTexture(c);
  });

/** Calacatta-style stone with soft veins. */
export const marbleTexture = () =>
  memo('marble', () => {
    const S = 1024;
    const [c, ctx] = canvas(S, S);
    const r = rng(3);
    ctx.fillStyle = 'rgb(246,243,238)';
    ctx.fillRect(0, 0, S, S);
    for (let i = 0; i < 4000; i++) {
      ctx.fillStyle = `rgba(150,140,130,${r() * 0.05})`;
      ctx.fillRect(r() * S, r() * S, 2 + r() * 6, 2 + r() * 6);
    }
    const veins = (n: number, width: number, a: number, blur: number) => {
      ctx.filter = `blur(${blur}px)`;
      for (let v = 0; v < n; v++) {
        let x = r() * S;
        let y = -20;
        let ang = Math.PI / 2 + (r() - 0.5) * 1.2;
        ctx.strokeStyle = `rgba(118,104,92,${a * (0.5 + r())})`;
        ctx.lineWidth = width * (0.4 + r());
        ctx.beginPath();
        ctx.moveTo(x, y);
        while (y < S + 20 && x > -50 && x < S + 50) {
          ang += (r() - 0.5) * 0.5;
          ang = Math.max(0.3, Math.min(Math.PI - 0.3, ang));
          x += Math.cos(ang) * 12;
          y += Math.sin(ang) * 12;
          ctx.lineTo(x, y);
        }
        ctx.stroke();
      }
      ctx.filter = 'none';
    };
    veins(6, 9, 0.12, 6);
    veins(10, 2.5, 0.28, 1);
    veins(18, 1, 0.22, 0);
    return toTexture(c);
  });

/** Large-format 60 cm porcelain tiles. 1 texture unit = 1.2 m. */
export const tileTexture = () =>
  memo('tile', () => {
    const S = 1024;
    const [c, ctx] = canvas(S, S);
    const r = rng(11);
    const n = 2;
    const t = S / n;
    for (let i = 0; i < n; i++)
      for (let j = 0; j < n; j++) {
        const L = 228 + r() * 14;
        ctx.fillStyle = `rgb(${L},${L - 2},${L - 6})`;
        ctx.fillRect(i * t, j * t, t, t);
        for (let k = 0; k < 900; k++) {
          ctx.fillStyle = `rgba(120,110,100,${r() * 0.06})`;
          ctx.fillRect(i * t + r() * t, j * t + r() * t, 1 + r() * 4, 1 + r() * 4);
        }
      }
    ctx.fillStyle = 'rgba(70,60,52,0.7)';
    for (let i = 0; i <= n; i++) {
      ctx.fillRect(i * t - 2, 0, 4, S);
      ctx.fillRect(0, i * t - 2, S, 4);
    }
    return toTexture(c);
  });

/** Fine woven fabric (bouclé / linen feel). */
export const fabricTexture = () =>
  memo('fabric', () => {
    const S = 512;
    const [c, ctx] = canvas(S, S);
    const r = rng(5);
    ctx.fillStyle = 'rgb(226,224,220)';
    ctx.fillRect(0, 0, S, S);
    for (let i = 0; i < 9000; i++) {
      const dark = r() > 0.5;
      ctx.fillStyle = dark ? `rgba(60,50,40,${r() * 0.12})` : `rgba(255,255,255,${r() * 0.18})`;
      const x = r() * S;
      const y = r() * S;
      if (r() > 0.5) ctx.fillRect(x, y, 3 + r() * 5, 1.2);
      else ctx.fillRect(x, y, 1.2, 3 + r() * 5);
    }
    for (let i = 0; i < 1400; i++) {
      ctx.fillStyle = `rgba(80,70,60,${r() * 0.15})`;
      ctx.beginPath();
      ctx.arc(r() * S, r() * S, 1 + r() * 2, 0, Math.PI * 2);
      ctx.fill();
    }
    return toTexture(c);
  });

/** Hand-loomed wool rug with a double border. */
export const rugTexture = () =>
  memo('rug', () => {
    const S = 1024;
    const [c, ctx] = canvas(S, S);
    const r = rng(9);
    ctx.fillStyle = 'rgb(232,228,222)';
    ctx.fillRect(0, 0, S, S);
    for (let i = 0; i < 26000; i++) {
      ctx.fillStyle = r() > 0.5 ? `rgba(70,55,45,${r() * 0.08})` : `rgba(255,255,255,${r() * 0.12})`;
      ctx.fillRect(r() * S, r() * S, 2, 2 + r() * 3);
    }
    ctx.strokeStyle = 'rgba(60,45,35,0.35)';
    ctx.lineWidth = 14;
    ctx.strokeRect(40, 40, S - 80, S - 80);
    ctx.lineWidth = 4;
    ctx.strokeRect(78, 78, S - 156, S - 156);
    return toTexture(c, true, false);
  });

/** Original abstract artwork — warm arcs. */
export const artTexture = () =>
  memo('art', () => {
    const W = 900;
    const H = 600;
    const [c, ctx] = canvas(W, H);
    ctx.fillStyle = '#e9dccb';
    ctx.fillRect(0, 0, W, H);
    const arc = (x: number, y: number, rad: number, col: string, w: number) => {
      ctx.strokeStyle = col;
      ctx.lineWidth = w;
      ctx.beginPath();
      ctx.arc(x, y, rad, Math.PI, 0);
      ctx.stroke();
    };
    ctx.fillStyle = '#c9773f';
    ctx.beginPath();
    ctx.arc(620, 230, 95, 0, Math.PI * 2);
    ctx.fill();
    arc(300, 520, 240, '#2d2420', 46);
    arc(300, 520, 170, '#a9583a', 46);
    arc(300, 520, 100, '#d9a35f', 46);
    ctx.fillStyle = '#2d2420';
    ctx.fillRect(0, 520, W, 80);
    ctx.fillStyle = '#7c7f66';
    ctx.fillRect(560, 400, 260, 120);
    const r = rng(2);
    for (let i = 0; i < 5000; i++) {
      ctx.fillStyle = `rgba(80,60,40,${r() * 0.05})`;
      ctx.fillRect(r() * W, r() * H, 2, 2);
    }
    return toTexture(c, true, false);
  });

/** Sky + skyline seen through the windows. */
export const skyTexture = (time: TimeId) =>
  memo(`sky-${time}`, () => {
    const W = 2048;
    const H = 768;
    const [c, ctx] = canvas(W, H);
    const g = ctx.createLinearGradient(0, 0, 0, H);
    if (time === 'golden') {
      g.addColorStop(0, '#2a2342');
      g.addColorStop(0.45, '#9b5a4a');
      g.addColorStop(0.72, '#f0a35e');
      g.addColorStop(1, '#ffd9a0');
    } else if (time === 'night') {
      g.addColorStop(0, '#04050c');
      g.addColorStop(0.6, '#121a33');
      g.addColorStop(1, '#3a2c3c');
    } else {
      g.addColorStop(0, '#7da6d4');
      g.addColorStop(0.6, '#c6dbec');
      g.addColorStop(1, '#f1ede4');
    }
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, W, H);
    // sun / moon glow
    const sx = W * 0.32;
    const sy = time === 'golden' ? H * 0.7 : H * 0.25;
    const sg = ctx.createRadialGradient(sx, sy, 0, sx, sy, time === 'night' ? 90 : 420);
    const sc = time === 'golden' ? '255,220,160' : time === 'night' ? '220,225,255' : '255,255,245';
    sg.addColorStop(0, `rgba(${sc},${time === 'night' ? 0.9 : 0.85})`);
    sg.addColorStop(time === 'night' ? 0.15 : 0.08, `rgba(${sc},0.6)`);
    sg.addColorStop(1, `rgba(${sc},0)`);
    ctx.fillStyle = sg;
    ctx.fillRect(0, 0, W, H);
    // skyline
    const r = rng(42);
    const layers = [
      { base: H * 0.84, max: 110, col: time === 'day' ? '#9fb0bf' : time === 'night' ? '#0d0f1a' : '#5a3a3a', lights: 0.04 },
      { base: H * 0.92, max: 140, col: time === 'day' ? '#7e8d99' : time === 'night' ? '#08080f' : '#2e1e1e', lights: 0.12 },
    ];
    for (const L of layers) {
      let x = 0;
      while (x < W) {
        const bw = 40 + r() * 120;
        const bh = 40 + r() * L.max;
        ctx.fillStyle = L.col;
        ctx.fillRect(x, L.base - bh, bw, H);
        if (time !== 'day') {
          for (let wy = L.base - bh + 10; wy < H; wy += 14)
            for (let wx = x + 6; wx < x + bw - 6; wx += 12)
              if (r() < L.lights * (time === 'night' ? 2.2 : 1)) {
                ctx.fillStyle = `rgba(255,${190 + r() * 40},${110 + r() * 50},${0.6 + r() * 0.4})`;
                ctx.fillRect(wx, wy, 5, 7);
              }
        }
        x += bw + r() * 6;
      }
    }
    // stars
    if (time === 'night')
      for (let i = 0; i < 220; i++) {
        ctx.fillStyle = `rgba(255,255,255,${r() * 0.7})`;
        ctx.fillRect(r() * W, r() * H * 0.5, 1.5, 1.5);
      }
    return toTexture(c, true, false);
  });

/** Soft radial fade for the ground disc under the model. */
export const groundTexture = () =>
  memo('ground', () => {
    const S = 512;
    const [c, ctx] = canvas(S, S);
    const g = ctx.createRadialGradient(S / 2, S / 2, 0, S / 2, S / 2, S / 2);
    g.addColorStop(0, 'rgba(255,255,255,1)');
    g.addColorStop(0.55, 'rgba(255,255,255,0.55)');
    g.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, S, S);
    return toTexture(c, false, false);
  });

/** Scale a geometry's UVs so 1 UV unit = `meters` in world space (for planes w×h). */
export function worldUV(geo: THREE.BufferGeometry, w: number, h: number, meters: number) {
  const uv = geo.attributes.uv as THREE.BufferAttribute;
  for (let i = 0; i < uv.count; i++) uv.setXY(i, (uv.getX(i) * w) / meters, (uv.getY(i) * h) / meters);
  uv.needsUpdate = true;
  return geo;
}
