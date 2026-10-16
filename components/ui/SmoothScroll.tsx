'use client';
import { useEffect } from 'react';
import Lenis from 'lenis';
import { useStore, tourState, type MoodId, type TimeId } from '@/lib/store';
import { MOODS, TIMES } from '@/lib/tour';
import { setLenis, getLenis, STEP_VH } from '@/lib/scroll';

/** Smooth scrolling + feeds scroll progress and pointer position to the 3D scene. */
export default function SmoothScroll() {
  const mode = useStore((s) => s.mode);

  useEffect(() => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    tourState.snap = reduce;
    const lenis = reduce ? null : new Lenis({ duration: 1.25, smoothWheel: true, wheelMultiplier: 0.9 });
    setLenis(lenis);
    let raf = 0;
    const loop = (t: number) => {
      lenis?.raf(t);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);

    const onScroll = () => {
      const y = window.scrollY;
      const step = window.innerHeight * STEP_VH;
      tourState.progress = y / step;
      const why = document.getElementById('why');
      const active = why ? y < why.offsetTop - window.innerHeight * 0.35 : true;
      const st = useStore.getState();
      if (active !== st.canvasActive) st.setCanvasActive(active);
    };
    const onPointer = (e: PointerEvent) => {
      tourState.pointer.x = (e.clientX / window.innerWidth) * 2 - 1;
      tourState.pointer.y = -((e.clientY / window.innerHeight) * 2 - 1);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    window.addEventListener('pointermove', onPointer, { passive: true });
    onScroll();

    // restore a shared design from the URL (?mood=noir&k=3000&t=night&d=1)
    const q = new URLSearchParams(window.location.search);
    const st = useStore.getState();
    const mood = q.get('mood');
    const t = q.get('t');
    const k = Number(q.get('k'));
    const d = Number(q.get('d'));
    if (mood && mood in MOODS) st.setMood(mood as MoodId);
    if (t && t in TIMES) st.setTime(t as TimeId);
    if (k >= 2000 && k <= 6500) st.setKelvin(k);
    if (d > 0 && d <= 1.6) st.setDimmer(d);

    return () => {
      cancelAnimationFrame(raf);
      lenis?.destroy();
      setLenis(null);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      window.removeEventListener('pointermove', onPointer);
    };
  }, []);

  useEffect(() => {
    const exploring = mode === 'explore';
    document.documentElement.classList.toggle('is-exploring', exploring);
    const l = getLenis();
    if (exploring) l?.stop();
    else l?.start();
  }, [mode]);

  return null;
}
