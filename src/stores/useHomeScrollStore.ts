import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { mmkvStorageAdapter } from '@/utils/storage';

interface HomeScrollState {
  scrollY: number;
  setScrollY: (value: number) => void;
}

export const useHomeScrollStore = create<HomeScrollState>()(
  persist(
    (set) => ({
      scrollY: 0,
      setScrollY: (value) => set({ scrollY: value }),
    }),
    {
      name: 'home-scroll-storage',
      storage: createJSONStorage(() => mmkvStorageAdapter),
    }
  )
);
