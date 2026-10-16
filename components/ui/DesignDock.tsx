'use client';
import { useState } from 'react';
import { useStore, type MoodId, type TimeId } from '@/lib/store';
import { MOODS, TIMES } from '@/lib/tour';

export default function DesignDock() {
  const s = useStore();
  const [open, setOpen] = useState(false);
  const visible = s.ready && (s.canvasActive || s.mode === 'explore');

  const share = async () => {
    const url = new URL(window.location.href);
    url.search = new URLSearchParams({ mood: s.mood, t: s.time, k: String(s.kelvin), d: s.dimmer.toFixed(2) }).toString();
    try {
      await navigator.clipboard.writeText(url.toString());
      s.showToast('Link copied — this exact design opens for whoever you send it to.');
    } catch {
      window.history.replaceState(null, '', url.toString());
      s.showToast('Design saved to the address bar — copy it to share.');
    }
  };

  return (
    <aside className={`dock ${visible ? 'is-visible' : ''} ${open ? 'is-open' : ''}`} aria-label="Design controls">
      <button className="dock__toggle" onClick={() => setOpen(!open)} aria-expanded={open}>
        <span className="dock__spark" /> {open ? 'Close' : 'Customise'}
      </button>
      <div className="dock__body">
        <div className="dock__group">
          <label>Mood</label>
          <div className="swatches">
            {(Object.keys(MOODS) as MoodId[]).map((id) => (
              <button
                key={id}
                className={`swatch ${s.mood === id ? 'is-on' : ''}`}
                onClick={() => s.setMood(id)}
                title={MOODS[id].name}
                aria-label={MOODS[id].name}
              >
                <span style={{ background: `conic-gradient(${MOODS[id].swatch[0]} 0 50%, ${MOODS[id].swatch[1]} 0 80%, ${MOODS[id].swatch[2]} 0)` }} />
              </button>
            ))}
          </div>
          <small>{MOODS[s.mood].name}</small>
        </div>

        <div className="dock__group dock__group--grow">
          <label>
            Light colour <b>{s.kelvin}K</b>
          </label>
          <input
            className="range range--kelvin"
            type="range"
            min={2200}
            max={4500}
            step={100}
            value={s.kelvin}
            onChange={(e) => s.setKelvin(Number(e.target.value))}
            aria-label="Light colour temperature"
          />
          <small>{s.kelvin <= 2700 ? 'Candle-warm' : s.kelvin <= 3300 ? 'Soft white' : 'Neutral'}</small>
        </div>

        <div className="dock__group dock__group--grow">
          <label>
            Dimmer <b>{Math.round(s.dimmer * 100)}%</b>
          </label>
          <input
            className="range"
            type="range"
            min={0.2}
            max={1.6}
            step={0.05}
            value={s.dimmer}
            onChange={(e) => s.setDimmer(Number(e.target.value))}
            aria-label="Lamp brightness"
          />
          <small>Lamps &amp; pendants</small>
        </div>

        <div className="dock__group">
          <label>Time of day</label>
          <div className="seg">
            {(Object.keys(TIMES) as TimeId[]).map((id) => (
              <button key={id} className={s.time === id ? 'is-on' : ''} onClick={() => s.setTime(id)}>
                {TIMES[id].name}
              </button>
            ))}
          </div>
        </div>

        <button className="dock__share" onClick={share} title="Copy a link to this design">
          <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden>
            <path d="M14 4h6v6M20 4l-9 9M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
          </svg>
          Share design
        </button>
      </div>
    </aside>
  );
}
