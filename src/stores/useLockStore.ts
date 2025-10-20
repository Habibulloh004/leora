import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const LOCK_TIMEOUT_MS = 3 * 1000; // 20 seconds
let mmkvInstance: any = null;
try {
  const { MMKV } = require('react-native-mmkv');
  mmkvInstance = new MMKV({ id: 'lock-storage' });
} catch (error) {
  console.warn('[LockStore] MMKV unavailable, falling back to AsyncStorage.');
}

const storage = createJSONStorage(() => ({
  getItem: (name: string) => {
    if (mmkvInstance) {
      return mmkvInstance.getString(name) ?? null;
    }
    return AsyncStorage.getItem(name);
  },
  setItem: (name: string, value: string) => {
    if (mmkvInstance) {
      mmkvInstance.set(name, value);
      return Promise.resolve();
    }
    return AsyncStorage.setItem(name, value);
  },
  removeItem: (name: string) => {
    if (mmkvInstance) {
      mmkvInstance.delete(name);
      return Promise.resolve();
    }
    return AsyncStorage.removeItem(name);
  },
}));

interface LockState {
  isLocked: boolean;
  isLoggedIn: boolean;
  lastActive: number;
  pin: string | null;
  isInactive: boolean;
  lastBackgrounded: number | null;
  lockEnabled: boolean;
  biometricsEnabled: boolean;
  setLocked: (locked: boolean) => void;
  lockNow: () => void;
  setLoggedIn: (loggedIn: boolean) => void;
  updateLastActive: (options?: { keepInactive?: boolean }) => void;
  verifyPin: (input: string) => boolean;
  setInactive: (inactive: boolean) => void;
  setLastBackgrounded: (value: number | null) => void;
  setPin: (pin: string) => void;
  resetPin: () => void;
  setLockEnabled: (enabled: boolean) => void;
  setBiometricsEnabled: (enabled: boolean) => void;
}

export const useLockStore = create<LockState>()(
  persist(
    (set, get) => ({
      isLocked: false,
      isLoggedIn: false,
      lastActive: Date.now(),
      pin: null,
      isInactive: false,
      lastBackgrounded: null,
      lockEnabled: false,
      biometricsEnabled: false,
      setLocked: (locked) =>
        set((state) => ({
          isLocked: state.lockEnabled ? locked : false,
          isInactive: locked ? false : state.isInactive,
          lastActive: locked ? state.lastActive : Date.now(),
        })),
      lockNow: () =>
        set((state) =>
          state.lockEnabled
            ? { isLocked: true, isInactive: false }
            : { isLocked: state.isLocked, isInactive: false }
        ),
      setLoggedIn: (loggedIn) =>
        set((state) => ({
          isLoggedIn: loggedIn,
          isLocked: loggedIn ? state.isLocked : false,
          isInactive: loggedIn ? state.isInactive : false,
          lastActive: Date.now(),
          lastBackgrounded: null,
        })),
      updateLastActive: ({ keepInactive = false } = {}) =>
        set((state) => ({
          lastActive: Date.now(),
          isInactive: keepInactive ? state.isInactive : false,
        })),
      verifyPin: (input) => {
        const currentPin = get().pin;
        if (!currentPin) return false;
        return input === currentPin;
      },
      setInactive: (inactive) => set({ isInactive: inactive }),
      setLastBackgrounded: (value) => set({ lastBackgrounded: value }),
      setPin: (pin) => set({ pin }),
      resetPin: () =>
        set({
          pin: null,
          lockEnabled: false,
          isLocked: false,
          isInactive: false,
          lastBackgrounded: null,
          biometricsEnabled: false,
        }),
      setLockEnabled: (enabled) =>
        set((state) => ({
          lockEnabled: enabled,
          isLocked: enabled ? state.isLocked : false,
          isInactive: enabled ? state.isInactive : false,
          biometricsEnabled: enabled ? state.biometricsEnabled : false,
          lastActive: enabled ? Date.now() : state.lastActive,
        })),
      setBiometricsEnabled: (enabled) =>
        set((state) => ({
          biometricsEnabled: state.lockEnabled ? enabled : false,
        })),
    }),
    {
      name: 'lock-storage',
      storage,
      partialize: (state) => ({
        isLocked: state.isLocked,
        isLoggedIn: state.isLoggedIn,
        lastActive: state.lastActive,
        pin: state.pin,
        lockEnabled: state.lockEnabled,
        biometricsEnabled: state.biometricsEnabled,
      }),
    }
  )
);

const evaluateLockHydration = () => {
  const { lockEnabled, lastActive } = useLockStore.getState();

  if (!lockEnabled) {
    useLockStore.setState({ isLocked: false });
    return;
  }

  if (typeof lastActive === 'number') {
    const shouldLock = Date.now() - lastActive >= LOCK_TIMEOUT_MS;
    if (shouldLock) {
      useLockStore.setState({ isLocked: true });
      return;
    }
  }

  useLockStore.setState({ isLocked: false });
};

useLockStore.persist?.onFinishHydration(() => {
  evaluateLockHydration();
});
