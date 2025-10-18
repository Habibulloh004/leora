import { create } from 'zustand';

interface HomeScrollState {
  scrollY: number;
  setScrollY: (value: number) => void;
}

export const useHomeScrollStore = create<HomeScrollState>((set) => ({
  scrollY: 0,
  setScrollY: (value) => set({ scrollY: value }),
}));
