import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { AppState, Platform } from 'react-native';
import * as Notifications from 'expo-notifications';

import { FocusLiveActivityModule } from './FocusLiveActivityModule';
import type { FocusLiveActivityEndReason } from './FocusLiveActivity.types';
import { useFocusSettingsStore } from '../useFocusSettingsStore';
import { type FocusTimerState, useFocusTimerStore } from '../useFocusTimerStore';
import { formatTimer } from '../utils';

const APP_NAME = 'LEORA';
const ANDROID_CHANNEL_ID = 'focus-progress';
const ANDROID_NOTIFICATION_ID = 'focus-mode-progress';

const resolveEndReason = (elapsedSeconds: number, totalSeconds: number): FocusLiveActivityEndReason => {
  if (totalSeconds > 0 && elapsedSeconds >= totalSeconds) return 'completed';
  return 'cancelled';
};

/**
 * Synchronises the focus timer state with the native Live Activity (ActivityKit).
 * The hook is a no-op on non-iOS platforms.
 */
export const useFocusLiveActivitySync = ({ taskName }: { taskName: string }) => {
  const dynamicIslandEnabled = useFocusSettingsStore((state) => state.toggles.dynamicIsland);
  const notificationsEnabled = useFocusSettingsStore((state) => state.toggles.notifications);
  const breakMinutes = useFocusSettingsStore((state) => state.breakMinutes);
  const sessionsUntilBigBreak = useFocusSettingsStore((state) => state.sessionsUntilBigBreak);
  const stats = useFocusSettingsStore((state) => state.stats);
  const isSoundEnabled = useFocusSettingsStore((state) => state.motivation.sound);

  const timerState = useFocusTimerStore((state) => state.timerState);
  const elapsedSeconds = useFocusTimerStore((state) => state.elapsedSeconds);
  const totalSeconds = useFocusTimerStore((state) => state.totalSeconds);

  const [isForeground, setIsForeground] = useState(AppState.currentState === 'active');

  const availabilityRef = useRef({ checked: Platform.OS !== 'ios', supported: Platform.OS !== 'ios' });
  const hasActiveActivityRef = useRef(false);
  const startInFlightRef = useRef(false);
  const previousStateRef = useRef<FocusTimerState>('ready');
  const androidPayloadKeyRef = useRef<string | null>(null);
  const androidNotificationVisibleRef = useRef(false);
  const androidPermissionRequestedRef = useRef(false);
  const androidChannelRegisteredRef = useRef(false);

  const sessionIndex = useMemo(() => Math.max(1, stats.sessionsCompleted + 1), [stats.sessionsCompleted]);
  const sessionCount = useMemo(() => Math.max(1, sessionsUntilBigBreak), [sessionsUntilBigBreak]);
  const breakAfterSeconds = useMemo(() => Math.max(0, Math.round(breakMinutes * 60)), [breakMinutes]);
  const isMuted = useMemo(() => !isSoundEnabled, [isSoundEnabled]);

  useEffect(() => {
    const listener = AppState.addEventListener('change', (nextState) => {
      setIsForeground(nextState === 'active');
    });

    return () => listener.remove();
  }, []);

  useEffect(() => {
    if (Platform.OS !== 'ios') return;
    if (availabilityRef.current.checked) return;

    let cancelled = false;
    (async () => {
      const supported = await FocusLiveActivityModule.isAvailable();
      if (!cancelled) {
        availabilityRef.current = { checked: true, supported };
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (Platform.OS !== 'ios') return;
    if (!availabilityRef.current.checked) return;
    if (!availabilityRef.current.supported) return;

    let cancelled = false;

    const sync = async () => {
      if (cancelled) return;

      const stopActivity = async (reason: FocusLiveActivityEndReason) => {
        await FocusLiveActivityModule.stopActivity(reason);
        hasActiveActivityRef.current = false;
      };

      if (!dynamicIslandEnabled) {
        if (hasActiveActivityRef.current) {
          await stopActivity('disabled');
        }
        previousStateRef.current = timerState;
        return;
      }

      if (isForeground) {
        if (hasActiveActivityRef.current) {
          await stopActivity('cancelled');
        }
        previousStateRef.current = timerState;
        return;
      }

      const nextTotalSeconds = Math.max(totalSeconds, 0);
      const nextElapsedSeconds = Math.max(0, Math.min(elapsedSeconds, nextTotalSeconds > 0 ? nextTotalSeconds : elapsedSeconds));
      const isTimerActive = timerState === 'running' || timerState === 'paused';

      if (nextTotalSeconds <= 0) {
        if (hasActiveActivityRef.current) {
          await stopActivity('cancelled');
        }
        previousStateRef.current = timerState;
        return;
      }

      if (!isTimerActive) {
        if (hasActiveActivityRef.current && previousStateRef.current !== 'ready') {
          const reason = resolveEndReason(nextElapsedSeconds, nextTotalSeconds);
          await stopActivity(reason);
        }
        previousStateRef.current = timerState;
        return;
      }

      if (!hasActiveActivityRef.current && !startInFlightRef.current) {
        startInFlightRef.current = true;

        try {
          const started = await FocusLiveActivityModule.startActivity({
            appName: APP_NAME,
            taskName,
            sessionIndex,
            sessionCount,
            totalSeconds: nextTotalSeconds,
            elapsedSeconds: nextElapsedSeconds,
            breakAfterSeconds,
            isMuted,
          });

          if (cancelled) return;

          hasActiveActivityRef.current = started;

          if (!started) {
            previousStateRef.current = timerState;
            return;
          }
        } finally {
          startInFlightRef.current = false;
        }
      }

      if (hasActiveActivityRef.current) {
        await FocusLiveActivityModule.updateActivity({
          taskName,
          sessionIndex,
          sessionCount,
          totalSeconds: nextTotalSeconds,
          elapsedSeconds: nextElapsedSeconds,
          breakAfterSeconds,
          isMuted,
          isPaused: timerState === 'paused',
        });
      }

      previousStateRef.current = timerState;
    };

    sync();

    return () => {
      cancelled = true;
    };
  }, [
    dynamicIslandEnabled,
    timerState,
    elapsedSeconds,
    totalSeconds,
    sessionIndex,
    sessionCount,
    breakAfterSeconds,
    isMuted,
    taskName,
    isForeground,
  ]);

  useEffect(() => {
    return () => {
      if (Platform.OS !== 'ios') return;
      if (!hasActiveActivityRef.current) return;
      FocusLiveActivityModule.stopActivity('cancelled').finally(() => {
        hasActiveActivityRef.current = false;
      });
    };
  }, []);

  useEffect(() => {
    if (Platform.OS !== 'android') return;
    if (androidChannelRegisteredRef.current) return;
    androidChannelRegisteredRef.current = true;
    Notifications.setNotificationChannelAsync(ANDROID_CHANNEL_ID, {
      name: 'Focus Progress',
      importance: Notifications.AndroidImportance.MAX,
      lockscreenVisibility: Notifications.AndroidNotificationVisibility.PUBLIC,
      sound: null,
      showBadge: false,
    }).catch(() => {
      androidChannelRegisteredRef.current = false;
    });
  }, []);

  const dismissAndroidNotification = useCallback(() => {
    if (Platform.OS !== 'android') return;
    if (!androidNotificationVisibleRef.current) return;
    Notifications.dismissNotificationAsync(ANDROID_NOTIFICATION_ID).catch(() => undefined);
    androidNotificationVisibleRef.current = false;
    androidPayloadKeyRef.current = null;
  }, []);

  useEffect(() => {
    if (Platform.OS !== 'android') return;
    if (!notificationsEnabled) {
      dismissAndroidNotification();
      return;
    }
    if (androidPermissionRequestedRef.current) return;
    androidPermissionRequestedRef.current = true;
    let cancelled = false;
    (async () => {
      const settings = await Notifications.getPermissionsAsync();
      if (cancelled) return;
      if (!settings.granted) {
        await Notifications.requestPermissionsAsync();
      }
    })().catch(() => undefined);
    return () => {
      cancelled = true;
    };
  }, [notificationsEnabled, dismissAndroidNotification]);

  useEffect(() => {
    if (Platform.OS !== 'android') return;

    const shouldShow =
      notificationsEnabled &&
      !isForeground &&
      (timerState === 'running' || timerState === 'paused') &&
      totalSeconds > 0;

    if (!shouldShow) {
      dismissAndroidNotification();
      return;
    }

    const remainingSeconds = Math.max(totalSeconds - elapsedSeconds, 0);
    const statusLabel = timerState === 'paused' ? 'Paused' : 'In progress';
    const sessionLabel = `Session ${sessionIndex}/${sessionCount}`;
    const baseSegments = [`${formatTimer(remainingSeconds)} left`, sessionLabel];
    if (breakAfterSeconds > 0) {
      baseSegments.push(`Break after ${formatTimer(breakAfterSeconds)}`);
    }
    const body = `${taskName} • ${baseSegments.join(' • ')}`;
    const payloadKey = `${statusLabel}-${body}-${elapsedSeconds}-${totalSeconds}`;

    if (androidPayloadKeyRef.current === payloadKey) {
      return;
    }
    androidPayloadKeyRef.current = payloadKey;

    (async () => {
      await Notifications.dismissNotificationAsync(ANDROID_NOTIFICATION_ID).catch(() => undefined);
      await Notifications.scheduleNotificationAsync({
        identifier: ANDROID_NOTIFICATION_ID,
        content: {
          title: 'Focus Mode',
          subtitle: statusLabel,
          body,
          data: { scope: 'focus-session' },
          sticky: true,
          autoDismiss: false,
          priority: Notifications.AndroidNotificationPriority.MAX,
        },
        trigger: { channelId: ANDROID_CHANNEL_ID },
      });
      androidNotificationVisibleRef.current = true;
    })().catch(() => undefined);

    return () => {
      // noop cleanup for async fire-and-forget
    };
  }, [
    notificationsEnabled,
    timerState,
    isForeground,
    totalSeconds,
    elapsedSeconds,
    sessionIndex,
    sessionCount,
    breakAfterSeconds,
    taskName,
    dismissAndroidNotification,
  ]);

  useEffect(() => {
    return () => {
      dismissAndroidNotification();
    };
  }, [dismissAndroidNotification]);
};

export default useFocusLiveActivitySync;
