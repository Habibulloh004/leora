// src/store/widgetStore.ts
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { WidgetType } from '@/config/widgetConfig';

interface WidgetStore {
  activeWidgets: WidgetType[];
  _hasHydrated: boolean;
  setHasHydrated: (state: boolean) => void;
  setActiveWidgets: (widgets: WidgetType[]) => void;
  addWidget: (widgetId: WidgetType) => void;
  removeWidget: (widgetId: WidgetType) => void;
  reorderWidgets: (fromIndex: number, toIndex: number) => void;
  resetWidgets: () => void;
}

const DEFAULT_WIDGETS: WidgetType[] = [
  'daily-tasks',
  'goals',
  'habits',
  'weekly-review',
];

export const useWidgetStore = create<WidgetStore>()(
  persist(
    (set, get) => ({
      activeWidgets: DEFAULT_WIDGETS,
      _hasHydrated: false,

      setHasHydrated: (state) => {
        set({ _hasHydrated: state });
      },

      setActiveWidgets: (widgets) => 
        set({ activeWidgets: widgets }),

      addWidget: (widgetId) =>
        set((state) => {
          if (state.activeWidgets.includes(widgetId)) {
            return state;
          }
          return { activeWidgets: [...state.activeWidgets, widgetId] };
        }),

      removeWidget: (widgetId) =>
        set((state) => ({
          activeWidgets: state.activeWidgets.filter((id) => id !== widgetId),
        })),

      reorderWidgets: (fromIndex, toIndex) =>
        set((state) => {
          const newOrder = [...state.activeWidgets];
          const [removed] = newOrder.splice(fromIndex, 1);
          newOrder.splice(toIndex, 0, removed);
          return { activeWidgets: newOrder };
        }),

      resetWidgets: () =>
        set({ activeWidgets: DEFAULT_WIDGETS }),
    }),
    {
      name: 'widget-storage',
      storage: createJSONStorage(() => AsyncStorage),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    }
  )
);

// Hook to check if store is ready
export const useWidgetStoreHydrated = () => {
  return useWidgetStore((state) => state._hasHydrated);
};