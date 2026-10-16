'use client';
import { ROOMS } from '@/lib/tour';
import { useStore } from '@/lib/store';
import { SITE } from '@/lib/site';
import { scrollToId, scrollToStep } from '@/lib/scroll';

export default function TourOverlay() {
  const setMode = useStore((s) => s.setMode);
  const active = useStore((s) => s.activeRoom);

  return (
    <div className="tour">
      {/* 0 — hero */}
      <section className="tour-step" id="top">
        <div className="tour-step__inner hero">
          <div className="hero__copy">
            <p className="eyebrow">Interior architecture · {SITE.city}</p>
            <h1>
              Walk through your home <em>before</em> it’s built.
            </h1>
            <p className="lede">
              Every {SITE.name} project starts as a lit, furnished 3D model you can explore, price and change — so the home you approve is the
              home you get.
            </p>
            <div className="hero__cta">
              <button className="btn" onClick={() => scrollToStep(1)}>
                Start the walkthrough
              </button>
              <button className="btn btn--ghost" onClick={() => setMode('explore')}>
                Explore freely
              </button>
            </div>
          </div>
          <div className="scroll-hint" aria-hidden>
            <span>Scroll to step inside</span>
            <i />
          </div>
        </div>
      </section>

      {/* 1–4 — rooms */}
      {ROOMS.map((room, i) => (
        <section className="tour-step" key={room.id} id={i === 0 ? 'walkthrough' : undefined}>
          <div className={`tour-step__inner ${i % 2 ? 'is-right' : ''}`}>
            <article className={`room-card ${active === room.id ? 'is-active' : ''}`}>
              <div className="room-card__head">
                <span className="room-card__index">{room.index}</span>
                <span className="room-card__of">/ 04 · {room.name}</span>
              </div>
              <h2>{room.title}</h2>
              <p>{room.body}</p>
              <ul className="chips">
                {room.specs.map((s) => (
                  <li key={s}>{s}</li>
                ))}
              </ul>
              <div className="solves">
                <span>Solves</span>“{room.solves}”
              </div>
            </article>
          </div>
        </section>
      ))}

      {/* 5 — outro */}
      <section className="tour-step">
        <div className="tour-step__inner hero outro">
          <div className="hero__copy">
            <p className="eyebrow">Your turn</p>
            <h2>
              Four rooms, every finish, every price — <em>before a single wall is painted.</em>
            </h2>
            <p className="lede">Pick a mood, warm or cool the lights, and wander the whole floor plan yourself.</p>
            <div className="hero__cta">
              <button className="btn" onClick={() => setMode('explore')}>
                Explore the model
              </button>
              <button className="btn btn--ghost" onClick={() => scrollToId('estimate')}>
                Estimate my home
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
