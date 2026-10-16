import { create } from 'zustand';

export type MoodId = 'walnut' | 'japandi' | 'noir';
export type TimeId = 'golden' | 'night' | 'day';
export type Mode = 'tour' | 'explore';

interface State {
  mood: MoodId;
  kelvin: number;
  dimmer: number;
  time: TimeId;
  mode: Mode;
  activeRoom: string | null;
  hotspot: string | null;
  flyTo: string | null;
  ready: boolean;
  canvasActive: boolean;
  toast: string | null;
  setMood: (m: MoodId) => void;
  setKelvin: (k: number) => void;
  setDimmer: (d: number) => void;
  setTime: (t: TimeId) => void;
  setMode: (m: Mode) => void;
  setActiveRoom: (r: string | null) => void;
  setHotspot: (h: string | null) => void;
  setFlyTo: (r: string | null) => void;
  setReady: (r: boolean) => void;
  setCanvasActive: (a: boolean) => void;
  showToast: (t: string) => void;
}

let toastTimer: ReturnType<typeof setTimeout> | undefined;

export const useStore = create<State>((set) => ({
  mood: 'walnut',
  kelvin: 2700,
  dimmer: 1,
  time: 'golden',
  mode: 'tour',
  activeRoom: null,
  hotspot: null,
  flyTo: null,
  ready: false,
  canvasActive: true,
  toast: null,
  setMood: (mood) => set({ mood }),
  setKelvin: (kelvin) => set({ kelvin }),
  setDimmer: (dimmer) => set({ dimmer }),
  setTime: (time) => set({ time }),
  setMode: (mode) => set({ mode, hotspot: null }),
  setActiveRoom: (activeRoom) => set({ activeRoom }),
  setHotspot: (hotspot) => set({ hotspot }),
  setFlyTo: (flyTo) => set({ flyTo }),
  setReady: (ready) => set({ ready }),
  setCanvasActive: (canvasActive) => set({ canvasActive }),
  showToast: (toast) => {
    if (toastTimer) clearTimeout(toastTimer);
    set({ toast });
    toastTimer = setTimeout(() => set({ toast: null }), 2600);
  },
}));

/** Mutable, non-reactive state written by scroll/pointer listeners and read every frame. */
export const tourState = {
  progress: 0,
  pointer: { x: 0, y: 0 },
  /** snap the camera instead of easing (reduced-motion users) */
  snap: false,
};
