'use client';
import { useMemo, useState } from 'react';
import { SITE, formatLakh } from '@/lib/site';
import { useStore } from '@/lib/store';
import { scrollToId } from '@/lib/scroll';
import { Logo } from './Nav';

const PAINS = [
  {
    pain: '“I can’t picture it from a 2D drawing.”',
    fix: 'Walk the space in 3D',
    body: 'Floor plans and mood boards ask clients to imagine. A lit, furnished model lets them stand in the room — scale, light and flow included.',
  },
  {
    pain: '“The final bill never matches the quote.”',
    fix: 'Every piece is priced in the model',
    body: 'Tap any pin to see the finish, size, lead time and installed price. What you approve on screen is the line item on your invoice.',
  },
  {
    pain: '“Revisions take weeks of back-and-forth.”',
    fix: 'Change it live, in the meeting',
    body: 'Swap the mood, warm or cool the lights, flip day to night — and decide together in minutes instead of waiting for new renders.',
  },
  {
    pain: '“I never know what’s actually being built.”',
    fix: 'One shared link for the whole family',
    body: 'Share the exact design state with a link. Partners, parents and site teams all see the same approved version.',
  },
];

export function PainPoints() {
  return (
    <section className="section" id="why">
      <div className="wrap">
        <div className="section__head">
          <p className="eyebrow">Why we design in 3D</p>
          <h2>
            Most clients sign off on a drawing they don’t understand. <em>Ours walk through it first.</em>
          </h2>
        </div>
        <div className="pains">
          {PAINS.map((p, i) => (
            <article className="pain" key={p.fix}>
              <span className="pain__n">0{i + 1}</span>
              <p className="pain__q">{p.pain}</p>
              <h3>{p.fix}</h3>
              <p>{p.body}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

const HOMES = [
  { id: '1bhk', label: '1 BHK', area: 650, beds: 1 },
  { id: '2bhk', label: '2 BHK', area: 1100, beds: 2 },
  { id: '3bhk', label: '3 BHK', area: 1600, beds: 3 },
  { id: 'villa', label: 'Villa', area: 3000, beds: 4 },
];
const TIERS = [
  { id: 'essential', label: 'Essential', rate: 1400, note: 'Smart layouts, laminate finishes, ready furniture' },
  { id: 'signature', label: 'Signature', rate: 2200, note: 'Veneers, stone, custom joinery, layered lighting' },
  { id: 'bespoke', label: 'Bespoke', rate: 3400, note: 'Commissioned pieces, imported finishes, full styling' },
];
const EXTRAS = [
  { id: 'kitchen', label: 'Modular kitchen', cost: (_a: number, _b: number) => 350000 },
  { id: 'wardrobes', label: 'Wardrobes in every bedroom', cost: (_a: number, b: number) => 160000 * b },
  { id: 'ceiling', label: 'False ceiling + lighting design', cost: (a: number) => 190 * a },
  { id: 'smart', label: 'Smart home & automation', cost: () => 120000 },
];

export function Estimator() {
  const [home, setHome] = useState(HOMES[1]);
  const [area, setArea] = useState(1100);
  const [tier, setTier] = useState(TIERS[1]);
  const [extras, setExtras] = useState<string[]>(['kitchen', 'wardrobes']);

  const { low, high, weeks } = useMemo(() => {
    const base = area * tier.rate;
    const add = EXTRAS.filter((e) => extras.includes(e.id)).reduce((s, e) => s + e.cost(area, home.beds), 0);
    const total = base + add;
    const weeks = Math.round(8 + area / 250 + (tier.id === 'bespoke' ? 4 : tier.id === 'signature' ? 2 : 0));
    return { low: total * 0.92, high: total * 1.1, weeks };
  }, [area, tier, extras, home]);

  return (
    <section className="section section--alt" id="estimate">
      <div className="wrap estimator">
        <div className="section__head">
          <p className="eyebrow">Instant estimate</p>
          <h2>
            Know your budget <em>before</em> the first meeting.
          </h2>
          <p className="lede">Three questions, one honest range. Your 3D model then breaks it down piece by piece.</p>
        </div>

        <div className="est">
          <div className="est__form">
            <fieldset>
              <legend>Home</legend>
              <div className="seg seg--lg">
                {HOMES.map((h) => (
                  <button
                    key={h.id}
                    className={home.id === h.id ? 'is-on' : ''}
                    onClick={() => {
                      setHome(h);
                      setArea(h.area);
                    }}
                  >
                    {h.label}
                  </button>
                ))}
              </div>
            </fieldset>
            <fieldset>
              <legend>
                Carpet area <b>{area.toLocaleString(SITE.locale)} sq ft</b>
              </legend>
              <input className="range" type="range" min={400} max={4500} step={50} value={area} onChange={(e) => setArea(Number(e.target.value))} />
            </fieldset>
            <fieldset>
              <legend>Finish level</legend>
              <div className="tiers">
                {TIERS.map((t) => (
                  <button key={t.id} className={`tier ${tier.id === t.id ? 'is-on' : ''}`} onClick={() => setTier(t)}>
                    <strong>{t.label}</strong>
                    <span>{t.note}</span>
                  </button>
                ))}
              </div>
            </fieldset>
            <fieldset>
              <legend>Include</legend>
              <div className="checks">
                {EXTRAS.map((e) => (
                  <label key={e.id} className={`check ${extras.includes(e.id) ? 'is-on' : ''}`}>
                    <input
                      type="checkbox"
                      checked={extras.includes(e.id)}
                      onChange={() => setExtras((x) => (x.includes(e.id) ? x.filter((y) => y !== e.id) : [...x, e.id]))}
                    />
                    <i />
                    {e.label}
                  </label>
                ))}
              </div>
            </fieldset>
          </div>

          <div className="est__result">
            <p className="eyebrow">Estimated investment</p>
            <div className="est__range">
              {formatLakh(low)} <span>–</span> {formatLakh(high)}
            </div>
            <div className="est__meta">
              <div>
                <span>Timeline</span>
                <strong>{weeks} weeks</strong>
              </div>
              <div>
                <span>Per sq ft</span>
                <strong>₹{Math.round((low + high) / 2 / area).toLocaleString(SITE.locale)}</strong>
              </div>
            </div>
            <ul className="est__incl">
              <li>3D walkthrough of your actual floor plan</li>
              <li>Itemised quote linked to every piece in the model</li>
              <li>Two live revision sessions included</li>
            </ul>
            <button className="btn btn--block" onClick={() => scrollToId('contact')}>
              Get my 3D concept
            </button>
            <small>Indicative range for planning. GST and civil changes extra.</small>
          </div>
        </div>
      </div>
    </section>
  );
}

const STEPS = [
  { t: 'Discover', w: 'Week 1', d: 'A site visit, a long conversation and your floor plan. We measure how you live, not just the walls.' },
  { t: '3D concept', w: 'Weeks 2–3', d: 'Your home, modelled, furnished and lit — delivered as a link like this one, with every piece priced.' },
  { t: 'Refine live', w: 'Week 4', d: 'We change finishes, layouts and lighting with you in the room. You approve exactly what you see.' },
  { t: 'Build', w: 'Weeks 5–14', d: 'Our own carpentry and site team. Weekly photo updates matched against the approved model.' },
  { t: 'Handover', w: 'Final week', d: 'Styled, cleaned and snag-checked. A one-year service warranty on everything we build.' },
];

export function Process() {
  return (
    <section className="section" id="process">
      <div className="wrap">
        <div className="section__head">
          <p className="eyebrow">How it works</p>
          <h2>
            From first visit to keys, <em>no surprises.</em>
          </h2>
        </div>
        <ol className="steps">
          {STEPS.map((s, i) => (
            <li key={s.t}>
              <span className="steps__n">{String(i + 1).padStart(2, '0')}</span>
              <span className="steps__w">{s.w}</span>
              <h3>{s.t}</h3>
              <p>{s.d}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

export function Contact() {
  const [sent, setSent] = useState(false);
  const setMode = useStore((s) => s.setMode);
  return (
    <section className="section section--alt" id="contact">
      <div className="wrap contact">
        <div>
          <p className="eyebrow">Book a 3D consult</p>
          <h2>
            Bring your floor plan. <em>Leave with a home you can walk through.</em>
          </h2>
          <p className="lede">First consultation and a 3D concept of one room are free. We reply within one working day.</p>
          <ul className="contact__info">
            <li>
              <span>Studio</span>
              {SITE.address}
            </li>
            <li>
              <span>Call</span>
              {SITE.phone}
            </li>
            <li>
              <span>Email</span>
              {SITE.email}
            </li>
          </ul>
        </div>
        <form
          className="form"
          onSubmit={(e) => {
            e.preventDefault();
            setSent(true);
          }}
        >
          {sent ? (
            <div className="form__done">
              <h3>Thank you — we’ll call you within a day.</h3>
              <p>While you wait, try your favourite mood in the model.</p>
              <button type="button" className="btn btn--ghost" onClick={() => setMode('explore')}>
                Open the 3D model
              </button>
            </div>
          ) : (
            <>
              <label>
                Name
                <input required name="name" autoComplete="name" placeholder="Your name" />
              </label>
              <label>
                Phone
                <input required name="phone" type="tel" autoComplete="tel" placeholder="+91" />
              </label>
              <div className="form__row">
                <label>
                  Home type
                  <select name="home" defaultValue="2 BHK">
                    {['1 BHK', '2 BHK', '3 BHK', 'Villa', 'Office'].map((o) => (
                      <option key={o}>{o}</option>
                    ))}
                  </select>
                </label>
                <label>
                  Possession
                  <select name="when" defaultValue="0–3 months">
                    {['Ready now', '0–3 months', '3–6 months', '6+ months'].map((o) => (
                      <option key={o}>{o}</option>
                    ))}
                  </select>
                </label>
              </div>
              <label>
                Tell us about the space
                <textarea name="msg" rows={3} placeholder="Location, size, what you love, what isn’t working…" />
              </label>
              <button className="btn btn--block" type="submit">
                Request my free 3D concept
              </button>
            </>
          )}
        </form>
      </div>
    </section>
  );
}

export function Footer() {
  return (
    <footer className="footer">
      <div className="wrap footer__in">
        <Logo />
        <p>{SITE.tagline}</p>
        <p className="footer__small">
          © {new Date().getFullYear()} {SITE.fullName} · Concept prototype — brand, prices and projects are illustrative.
        </p>
      </div>
    </footer>
  );
}
