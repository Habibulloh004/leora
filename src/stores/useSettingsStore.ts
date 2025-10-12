// stores/useSettingsStore.ts
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface SettingsStore {
  theme: 'light' | 'dark' | 'auto';
  currency: string;
  currencySymbol: string;
  language: string;
  notifications: {
    enabled: boolean;
    taskReminders: boolean;
    billReminders: boolean;
    focusModeAlerts: boolean;
  };
  focusMode: {
    defaultDuration: number; // in minutes
    breakDuration: number;
    longBreakDuration: number;
    sessionsBeforeLongBreak: number;
  };
  
  // Actions
  setTheme: (theme: 'light' | 'dark' | 'auto') => void;
  setCurrency: (currency: string, symbol: string) => void;
  setLanguage: (language: string) => void;
  updateNotificationSettings: (settings: Partial<SettingsStore['notifications']>) => void;
  updateFocusModeSettings: (settings: Partial<SettingsStore['focusMode']>) => void;
  resetToDefaults: () => void;
}

const defaultSettings = {
  theme: 'auto' as const,
  currency: 'USD',
  currencySymbol: '$',
  language: 'en',
  notifications: {
    enabled: true,
    taskReminders: true,
    billReminders: true,
    focusModeAlerts: true,
  },
  focusMode: {
    defaultDuration: 25,
    breakDuration: 5,
    longBreakDuration: 15,
    sessionsBeforeLongBreak: 4,
  },
};

export const useSettingsStore = create<SettingsStore>()(
  persist(
    (set) => ({
      ...defaultSettings,
      
      setTheme: (theme) => set({ theme }),
      
      setCurrency: (currency, symbol) => set({ 
        currency, 
        currencySymbol: symbol 
      }),
      
      setLanguage: (language) => set({ language }),
      
      updateNotificationSettings: (settings) => set((state) => ({
        notifications: { ...state.notifications, ...settings },
      })),
      
      updateFocusModeSettings: (settings) => set((state) => ({
        focusMode: { ...state.focusMode, ...settings },
      })),
      
      resetToDefaults: () => set(defaultSettings),
    }),
    {
      name: 'settings-storage',
      storage: createJSONStorage(() => AsyncStorage),
      version: 1,
    }
  )
);