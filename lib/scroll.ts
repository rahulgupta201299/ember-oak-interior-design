import type Lenis from 'lenis';

let lenis: Lenis | null = null;
export const setLenis = (l: Lenis | null) => {
  lenis = l;
};
export const getLenis = () => lenis;

/** Height of one walkthrough step, as a multiple of the viewport height. */
export const STEP_VH = 1.25;

export function scrollToId(id: string) {
  const el = document.getElementById(id);
  if (!el) return;
  if (lenis) lenis.scrollTo(el, { duration: 1.8 });
  else el.scrollIntoView({ behavior: 'smooth' });
}

/** Scroll so the camera lands on walkthrough step i. */
export function scrollToStep(i: number) {
  const y = i * window.innerHeight * STEP_VH;
  if (lenis) lenis.scrollTo(y, { duration: 2.2 });
  else window.scrollTo({ top: y, behavior: 'smooth' });
}
