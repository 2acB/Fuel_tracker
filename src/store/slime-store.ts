import { create } from 'zustand';

export interface SlimeParticle {
  id: string;
  x: number;
  y: number;
  emojis: string[];
}

interface SlimeStore {
  particles: SlimeParticle[];
  triggerSlime: (x: number, y: number, emojis: string[]) => void;
  removeParticle: (id: string) => void;
}

export const useSlimeStore = create<SlimeStore>((set) => ({
  particles: [],
  triggerSlime: (x, y, emojis) => {
    const id = `${Date.now()}-${Math.random()}`;
    set((state) => ({
      particles: [...state.particles, { id, x, y, emojis }],
    }));
    // Auto-remove after animation
    setTimeout(() => {
      set((state) => ({
        particles: state.particles.filter((p) => p.id !== id),
      }));
    }, 1200);
  },
  removeParticle: (id) =>
    set((state) => ({
      particles: state.particles.filter((p) => p.id !== id),
    })),
}));
