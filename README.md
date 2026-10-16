# Ember & Oak Interiors: 3D walkthrough prototype

A Next.js site for an interior design studio. As you scroll, the camera moves through a warm-lit 3D apartment: from an aerial "dollhouse" view, into the living room, kitchen, bedroom and study, and back out. Visitors can tap any piece to see its finish, size, lead time and price. They can also switch the design mood, light colour, dimmer and time of day live, and share the exact design with a link.

Ember & Oak is a fictional brand. Change `lib/site.ts` to rebrand the site for a real studio.

## Run it

```bash
npm install
npm run dev        # http://localhost:3000
npm run build && npm start   # production
```

You need Node 18.17 or newer. The site uses no external 3D models or images. Every material, texture and the sky are generated in code, so the first load is small and fast.

## What's inside

| Feature | Client pain point it solves | Where |
|---|---|---|
| Scroll-driven camera tour through 4 rooms | "I can't picture it from a 2D plan" | `lib/tour.ts` (`STOPS`), `components/three/CameraRig.tsx` |
| Hotspot pins with finish, size, lead time and installed price | "The final bill never matches the quote" | `lib/tour.ts` (`HOTSPOTS`), `components/three/Hotspots.tsx` |
| Live mood switch (Walnut / Japandi / Noir), Kelvin slider, dimmer, golden hour / night / day | "Revisions take weeks" | `components/ui/DesignDock.tsx`, `lib/tour.ts` (`MOODS`, `TIMES`) |
| Share-design link (`?mood=noir&t=night&k=3000`) | "I never know what's being built" | `DesignDock.tsx`, `SmoothScroll.tsx` |
| Free-orbit Explore mode with jump-to-room buttons | Lets the client explore at their own pace | `CameraRig.tsx`, `Overlays.tsx` |
| Instant budget estimator (INR, lakh/crore) | Sets budget expectations before the first meeting | `components/ui/Sections.tsx` |
| Process timeline + consult form | Turns visitors into leads | `Sections.tsx` |

## Customising for a client

- **Brand, city and contact details:** `lib/site.ts`
- **Room copy, camera angles and hotspot prices:** `lib/tour.ts`
- **Colour palettes per mood:** `MOODS` in `lib/tour.ts`
- **Estimator rates:** `TIERS` and `EXTRAS` in `components/ui/Sections.tsx`
- **Contact form:** it currently shows a confirmation without sending anything. To receive leads, wire `onSubmit` to Formspree, Resend or an API route.
- **Using a real project:** replace `components/three/Apartment.tsx` and `Furniture.tsx` with a GLB exported from SketchUp, Blender or 3ds Max (load it with `useGLTF` from `@react-three/drei`). Then update the camera `STOPS` to match the new rooms.

## Stack

Next.js 14 (App Router) · React Three Fiber · drei · postprocessing (N8AO ambient occlusion, bloom, ACES tone mapping) · Lenis smooth scroll · Zustand.

Performance: the scene drops to a lighter pipeline on slow GPUs (`PerformanceMonitor`). Rendering pauses once the 3D section has scrolled out of view. Visitors with reduced motion enabled get instant camera cuts instead of animated moves.
