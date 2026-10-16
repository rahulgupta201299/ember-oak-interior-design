'use client';
import { SITE } from '@/lib/site';
import { scrollToId, scrollToStep } from '@/lib/scroll';

export function Logo() {
  return (
    <span className="logo">
      <svg viewBox="0 0 32 32" width="26" height="26" aria-hidden>
        <path d="M16 3c4 5 7 8.5 7 13a7 7 0 0 1-14 0c0-2.6 1.2-4.6 3-6.5.2 2.3 1.3 3.7 3 4.3-.6-3.8.3-7.2 1-10.8Z" fill="currentColor" />
        <path d="M5 29h22" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      </svg>
      <span>
        {SITE.name}
        <em>Interiors</em>
      </span>
    </span>
  );
}

export default function Nav() {
  return (
    <header className="nav">
      <button className="nav__brand" onClick={() => scrollToStep(0)} aria-label="Back to top">
        <Logo />
      </button>
      <nav className="nav__links">
        <button onClick={() => scrollToStep(1)}>Walkthrough</button>
        <button onClick={() => scrollToId('why')}>Why 3D</button>
        <button onClick={() => scrollToId('estimate')}>Estimate</button>
        <button onClick={() => scrollToId('process')}>Process</button>
      </nav>
      <button className="btn btn--small" onClick={() => scrollToId('contact')}>
        Book a 3D consult
      </button>
    </header>
  );
}
