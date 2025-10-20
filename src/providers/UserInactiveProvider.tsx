import React, {
  PropsWithChildren,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
} from 'react';
import { AppState, AppStateStatus, StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';

import { LOCK_TIMEOUT_MS, useLockStore } from '@/stores/useLockStore';

const INACTIVE_ROUTE = '/(modals)/inactive';
const LOCK_ROUTE = '/(modals)/lock';

interface UserInactiveContextValue {
  registerActivity: () => void;
}

const UserInactiveContext = createContext<UserInactiveContextValue>({
  registerActivity: () => undefined,
});

export const useUserInactive = () => useContext(UserInactiveContext);

export function UserInactiveProvider({ children }: PropsWithChildren) {
  const router = useRouter();
  const isLoggedIn = useLockStore((state) => state.isLoggedIn);
  const isLocked = useLockStore((state) => state.isLocked);
  const isInactive = useLockStore((state) => state.isInactive);
  const setLocked = useLockStore((state) => state.setLocked);
  const setInactive = useLockStore((state) => state.setInactive);
  const updateLastActive = useLockStore((state) => state.updateLastActive);
  const setLastBackgrounded = useLockStore((state) => state.setLastBackgrounded);
  const lastBackgrounded = useLockStore((state) => state.lastBackgrounded);
  const lockEnabled = useLockStore((state) => state.lockEnabled);
  const lastActive = useLockStore((state) => state.lastActive);

  const currentModalRef = useRef<string | null>(null);
  const lastAppStateRef = useRef<AppStateStatus>(AppState.currentState ?? 'active');

  const dismissModal = useCallback(() => {
    if (currentModalRef.current) {
      if (router.canGoBack()) {
        router.back();
      }
      currentModalRef.current = null;
    }
  }, [router]);

  const presentModal = useCallback(
    (route: string) => {
      if (currentModalRef.current === route) return;

      dismissModal();
      router.push(route);
      currentModalRef.current = route;
    },
    [dismissModal, router]
  );

  const handleActivity = useCallback(() => {
    if (!isLoggedIn || isLocked) return;
    setInactive(false);
    updateLastActive();
    if (currentModalRef.current === INACTIVE_ROUTE) {
      dismissModal();
    }
  }, [dismissModal, isLocked, isLoggedIn, setInactive, updateLastActive]);

  useEffect(() => {
    if (!isLoggedIn) {
      dismissModal();
      setLocked(false);
      setInactive(false);
      setLastBackgrounded(null);
      return;
    }
  }, [dismissModal, isLoggedIn, setInactive, setLastBackgrounded, setLocked]);

  useEffect(() => {
    if (!isLoggedIn || !lockEnabled) {
      return;
    }

    const shouldLock =
      typeof lastActive === 'number' && Date.now() - lastActive >= LOCK_TIMEOUT_MS;

    if (shouldLock && !isLocked) {
      setLocked(true);
    }
  }, [isLoggedIn, isLocked, lastActive, lockEnabled, setLocked]);

  useEffect(() => {
    const handleAppStateChange = (nextState: AppStateStatus) => {
      if (!isLoggedIn) {
        lastAppStateRef.current = nextState;
        return;
      }

      const prevState = lastAppStateRef.current;

      if (nextState === 'inactive') {
        if (lockEnabled) {
          setInactive(true);
          updateLastActive({ keepInactive: true });
          presentModal(INACTIVE_ROUTE);
        } else {
          setInactive(false);
          dismissModal();
          updateLastActive({ keepInactive: true });
        }
      }

      if (nextState === 'background') {
        setLastBackgrounded(Date.now());
        if (lockEnabled) {
          setInactive(true);
        } else {
          setInactive(false);
        }
      }

      if (prevState === 'background' && nextState === 'active') {
        const elapsed = lastBackgrounded ? Date.now() - lastBackgrounded : 0;
        const shouldLock = lockEnabled && elapsed >= LOCK_TIMEOUT_MS;

        if (shouldLock) {
          setLocked(true);
          setInactive(false);
          presentModal(LOCK_ROUTE);
          setLastBackgrounded(null);
          updateLastActive({ keepInactive: true });
        } else {
          setLocked(false);
          setInactive(false);
          dismissModal();
          updateLastActive();
          setLastBackgrounded(null);
        }
      } else if (prevState === 'inactive' && nextState === 'active') {
        setInactive(false);
        dismissModal();
        updateLastActive();
      }

      lastAppStateRef.current = nextState;
    };

    const subscription = AppState.addEventListener('change', handleAppStateChange);
    return () => subscription.remove();
  }, [
    isLoggedIn,
    lastBackgrounded,
    lockEnabled,
    dismissModal,
    presentModal,
    setInactive,
    setLastBackgrounded,
    setLocked,
    updateLastActive,
  ]);

  useEffect(() => {
    if (!isLoggedIn) return;

    if (isLocked && lockEnabled) {
      presentModal(LOCK_ROUTE);
    } else if (isInactive && lockEnabled) {
      presentModal(INACTIVE_ROUTE);
    } else if (currentModalRef.current) {
      dismissModal();
    }

    if (isLocked && !lockEnabled) {
      setLocked(false);
    }
  }, [dismissModal, isInactive, isLoggedIn, isLocked, lockEnabled, presentModal, setLocked]);

  const value = useMemo(
    () => ({
      registerActivity: handleActivity,
    }),
    [handleActivity]
  );

  return (
    <UserInactiveContext.Provider value={value}>
      <View
        style={styles.container}
        onStartShouldSetResponderCapture={() => {
          handleActivity();
          return false;
        }}
        onTouchStart={handleActivity}
      >
        {children}
      </View>
    </UserInactiveContext.Provider>
  );
}

export default UserInactiveProvider;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
