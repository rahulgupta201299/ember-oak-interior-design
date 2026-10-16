'use client';
import { useEffect, useState } from 'react';
import { useStore } from '@/lib/store';
import { HOTSPOTS, MOODS, STOPS } from '@/lib/tour';
import { formatMoney, SITE } from '@/lib/site';
import { Logo } from './Nav';

export function HotspotCard() {
  const id = useStore((s) => s.hotspot);
  const setHotspot = useStore((s) => s.setHotspot);
  const mood = useStore((s) => s.mood);
  const h = HOTSPOTS.find((x) => x.id === id);
  return (
    <aside className={`spot ${h ? 'is-open' : ''}`} aria-live="polite">
      {h && (
        <>
          <button className="spot__close" onClick={() => setHotspot(null)} aria-label="Close">
            ×
          </button>
          <p className="eyebrow">{STOPS.find((s) => s.id === h.room)?.label}</p>
          <h3>{h.title}</h3>
          <dl>
            <div>
              <dt>Finish</dt>
              <dd>{h.material}</dd>
            </div>
            <div>
              <dt>Size</dt>
              <dd>{h.size}</dd>
            </div>
            <div>
              <dt>Lead time</dt>
              <dd>{h.lead}</dd>
            </div>
            <div>
              <dt>Shown in</dt>
              <dd>{MOODS[mood].name}</dd>
            </div>
          </dl>
          <div className="spot__price">
            <span>Supplied &amp; installed</span>
            <strong>{formatMoney(h.price)}</strong>
          </div>
          <p className="spot__note">Indicative price, GST extra. Locked in writing once you approve the design.</p>
        </>
      )}
    </aside>
  );
}

export function ExploreBar() {
  const mode = useStore((s) => s.mode);
  const setMode = useStore((s) => s.setMode);
  const setFlyTo = useStore((s) => s.setFlyTo);
  if (mode !== 'explore') return null;
  const rooms = STOPS.filter((s) => s.id !== 'outro');
  return (
    <div className="explore">
      <div className="explore__hint">
        <strong>Explore mode</strong>
        <span>Drag to orbit · scroll or pinch to zoom · right-drag to pan · tap the pins</span>
      </div>
      <div className="explore__rooms">
        {rooms.map((r) => (
          <button key={r.id} onClick={() => setFlyTo(r.id)}>
            {r.label}
          </button>
        ))}
      </div>
      <button className="btn btn--small" onClick={() => setMode('tour')}>
        Back to the tour
      </button>
    </div>
  );
}

export function Toast() {
  const toast = useStore((s) => s.toast);
  return <div className={`toast ${toast ? 'is-on' : ''}`}>{toast}</div>;
}

export function Loader() {
  const ready = useStore((s) => s.ready);
  const [gone, setGone] = useState(false);
  useEffect(() => {
    if (!ready) return;
    const t = setTimeout(() => setGone(true), 1100);
    return () => clearTimeout(t);
  }, [ready]);
  if (gone) return null;
  return (
    <div className={`loader ${ready ? 'is-done' : ''}`}>
      <Logo />
      <div className="loader__bar">
        <i />
      </div>
      <p>Lighting the rooms…</p>
      <span className="sr-only">{SITE.fullName}</span>
    </div>
  );
}
