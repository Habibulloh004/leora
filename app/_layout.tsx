import 'react-native-reanimated';
import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';
import { DarkTheme, DefaultTheme, ThemeProvider as NavigationThemeProvider } from '@react-navigation/native';
import { Stack, useRouter, useSegments } from 'expo-router';
import { useCallback, useEffect, useMemo, useState, type ReactElement } from 'react';
import { Platform } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { enableFreeze, enableScreens } from 'react-native-screens';
import { Asset } from 'expo-asset';
import * as Font from 'expo-font';
import { SafeAreaProvider, initialWindowMetrics } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import Constants from 'expo-constants';
import { ThemeProvider, useTheme } from '@/contexts/ThemeContext';
import { getTheme } from '@/constants/theme';
import { useAuthStore } from '@/stores/useAuthStore';
import LeoraSplashScreen from '@/components/screens/splash/LeoraSplashScreen';
import { useLockStore } from '@/stores/useLockStore';
import UserInactiveProvider from '@/providers/UserInactiveProvider';
import useFocusLiveActivitySync from '@/features/focus/live-activity/useFocusLiveActivitySync';
import { useFocusSettingsStore } from '@/features/focus/useFocusSettingsStore';
import { TECHNIQUES } from '@/features/focus/types';
import { useFocusTimerStore } from '@/features/focus/useFocusTimerStore';
import * as Linking from 'expo-linking';

enableScreens(true);
enableFreeze(true);

export const unstable_settings = {
  anchor: '(tabs)',
};

export default function RootLayout() {
  const [assetsReady, setAssetsReady] = useState(false);
  const [animationFinished, setAnimationFinished] = useState(false);
  const [hasBooted, setHasBooted] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const loadAssets = async () => {
      try {
        const assetPromise = Asset.loadAsync([
          require('@assets/images/icon.png'),
          require('@assets/images/authBackground.png'),
          require('@assets/images/backgroundModal.png'),
          require('@assets/images/notifImage.jpg'),
          require('@assets/images/bg.png'),
        ]);

        const fontPromise = Font.loadAsync({
          ...Ionicons.font,
          ...MaterialCommunityIcons.font,
        });

        await Promise.all([assetPromise, fontPromise]);
      } catch (error) {
        console.warn('[RootLayout] Failed to preload assets', error);
      } finally {
        if (isMounted) {
          setAssetsReady(true);
        }
      }
    };

    loadAssets();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (assetsReady && animationFinished) {
      setHasBooted(true);
    }
  }, [assetsReady, animationFinished]);

  const handleSplashComplete = useCallback(() => {
    setAnimationFinished(true);
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider initialMetrics={initialWindowMetrics}>
        <BottomSheetModalProvider>
          <ThemeProvider>
            <RootNavigator
              hasBooted={hasBooted}
              assetsReady={assetsReady}
              onSplashComplete={handleSplashComplete}
            />
          </ThemeProvider>
        </BottomSheetModalProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

type RootNavigatorProps = {
  hasBooted: boolean;
  assetsReady: boolean;
  onSplashComplete: () => void;
};

function RootNavigator({
  hasBooted,
  assetsReady,
  onSplashComplete,
}: RootNavigatorProps): ReactElement {
  const { theme } = useTheme();
  const { isAuthenticated } = useAuthStore();
  const setLoggedIn = useLockStore((state) => state.setLoggedIn);
  const setLocked = useLockStore((state) => state.setLocked);
  const updateLastActive = useLockStore((state) => state.updateLastActive);
  const router = useRouter();
  const segments = useSegments();
  const techniqueKey = useFocusSettingsStore((state) => state.techniqueKey);
  const recordSession = useFocusSettingsStore((state) => state.recordSession);
  const focusSegments = segments.join('/');

  const ensureRoute = useCallback(
    (target: string) => {
      const normalized = target.replace(/^\//, '');
      if (focusSegments === normalized) return;
      router.push(target as any);
    },
    [focusSegments, router],
  );

  const focusTaskName = useMemo(() => {
    const technique = TECHNIQUES.find((item) => item.key === techniqueKey) ?? TECHNIQUES[0];
    const label = technique.label.trim();
    if (!label) return 'Focus session';
    if (label.toLowerCase().includes('focus')) return label;
    return `Working on ${label}`;
  }, [techniqueKey]);

  useFocusLiveActivitySync({ taskName: focusTaskName });

  const handleRemoteCompletion = useCallback(
    (completed: boolean) => {
      const timerStore = useFocusTimerStore.getState();
      const elapsed = timerStore.syncElapsed();
      const focusSeconds = Math.min(elapsed, timerStore.totalSeconds);
      recordSession(focusSeconds, completed);
      timerStore.reset();
    },
    [recordSession],
  );

  const handleFocusAction = useCallback(
    (action?: string) => {
      if (!action) return;
      const timerStore = useFocusTimerStore.getState();

      switch (action) {
        case 'pause':
          if (timerStore.timerState === 'running') {
            timerStore.pause();
          }
          ensureRoute('/focus-mode');
          break;
        case 'resume':
          if (timerStore.timerState === 'paused') {
            timerStore.resume();
          }
          ensureRoute('/focus-mode');
          break;
        case 'start':
          if (timerStore.timerState === 'ready') {
            timerStore.start();
          }
          ensureRoute('/focus-mode');
          break;
        case 'stop':
          handleRemoteCompletion(false);
          ensureRoute('/focus-mode');
          break;
        case 'finish':
          handleRemoteCompletion(true);
          ensureRoute('/focus-mode');
          break;
        default:
          break;
      }
    },
    [ensureRoute, handleRemoteCompletion],
  );

  const processIncomingUrl = useCallback(
    (incomingUrl?: string | null) => {
      if (!incomingUrl) return;
      const parsed = Linking.parse(incomingUrl);
      const route = parsed.path ?? parsed.hostname ?? '';
      const action = typeof parsed.queryParams?.action === 'string' ? parsed.queryParams.action : undefined;

      if (route === 'focus-settings') {
        ensureRoute('/(modals)/focus-settings');
        return;
      }

      if (route === 'focus-action') {
        handleFocusAction(action);
        return;
      }

      if (route === 'focus-mode') {
        ensureRoute('/focus-mode');
      }
    },
    [ensureRoute, handleFocusAction],
  );

  useEffect(() => {
    const subscription = Linking.addEventListener('url', ({ url }) => processIncomingUrl(url));
    Linking.getInitialURL().then(processIncomingUrl).catch(() => undefined);
    return () => subscription.remove();
  }, [processIncomingUrl]);

  // Protect routes based on authentication status
  useEffect(() => {
    if (!hasBooted) return;

    const inAuthGroup = segments[0] === '(auth)';

    if (!isAuthenticated && !inAuthGroup) {
      // Redirect to login if not authenticated and trying to access protected routes
      router.replace('/(auth)/login');
    } else if (isAuthenticated && inAuthGroup) {
      // Redirect to main app if authenticated and on auth screens
      router.replace('/(tabs)');
    }
  }, [isAuthenticated, segments, hasBooted]);

  useEffect(() => {
    if (!hasBooted) return;

    if (isAuthenticated) {
      setLoggedIn(true);
      updateLastActive({ keepInactive: true });
    } else {
      setLoggedIn(false);
      setLocked(false);
    }
  }, [hasBooted, isAuthenticated, setLoggedIn, setLocked, updateLastActive]);

  const palette = useMemo(() => getTheme(theme).colors, [theme]);
  const navigationTheme = useMemo(() => {
    if (theme === 'dark') {
      return {
        ...DarkTheme,
        dark: true,
        colors: {
          ...DarkTheme.colors,
          background: palette.background,
          card: palette.surface,
          border: palette.border,
          primary: palette.primary,
          text: palette.textPrimary,
        },
      };
    }

    return {
      ...DefaultTheme,
      dark: false,
      colors: {
        ...DefaultTheme.colors,
        background: palette.background,
        card: palette.surface,
        border: palette.border,
        primary: palette.primary,
        text: palette.textPrimary,
      },
    };
  }, [palette, theme]);

  const statusBarStyle = theme === 'dark' ? 'light' : 'dark';

  if (!hasBooted && !isAuthenticated) {
    return <LeoraSplashScreen ready={assetsReady} onAnimationComplete={onSplashComplete} />;
  }

  const navigatorContent: ReactElement = (
    <UserInactiveProvider>
      <Stack
        screenOptions={{
          headerShadowVisible: false,
          contentStyle: { backgroundColor: palette.background },
          fullScreenGestureEnabled: true,
          ...(Platform.OS === 'android' ? { statusBarStyle } : {}),
        }}
      >
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="(auth)" options={{ headerShown: false }} />
        <Stack.Screen name="profile" options={{ headerShown: false }} />
        <Stack.Screen
          name="(modals)/add-task"
          options={{
            presentation: 'modal',
            headerTitle: 'Add Task',
            headerStyle: { backgroundColor: palette.surface },
            headerTintColor: palette.textPrimary,
          }}
        />
        <Stack.Screen
          name="(modals)/add-goal"
          options={{
            presentation: 'modal',
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="(modals)/quick-exp"
          options={{
            presentation: 'modal',
            headerTitle: 'Quick Expence',
            headerStyle: { backgroundColor: palette.surface },
            headerTintColor: palette.textPrimary,
          }}
        />
        <Stack.Screen
          name="(modals)/search"
          options={{
            presentation: 'modal',
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="(modals)/notifications"
          options={{
            presentation: 'modal',
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="(modals)/calendar"
          options={{
            presentation: 'modal',
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="(modals)/voice-ai"
          options={{
            presentation: 'modal',
            headerTitle: 'Voice Mode',
            headerShown: false,
            headerStyle: { backgroundColor: palette.surface },
            headerTintColor: palette.textPrimary,
          }}
        />
        <Stack.Screen
          name="(modals)/goal-details"
          options={{
            presentation: 'modal',
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="(modals)/menage-widget"
          options={{
            headerShown: false,
            presentation: 'modal',
            headerTitle: 'Menage Widget',
            headerStyle: { backgroundColor: palette.surface },
            headerTintColor: palette.textPrimary,
          }}
        />
        <Stack.Screen
          name="(modals)/focus-settings"
          options={{
            presentation: 'modal',
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="(modals)/inactive"
          options={{
            headerShown: false,
            animation: 'none',
          }}
        />
        <Stack.Screen
          name="(modals)/lock"
          options={{
            headerShown: false,
            animation: 'none',
          }}
        />
        <Stack.Screen
          name="focus-mode"
          options={{
            headerShown: false
          }}
        />
        <Stack.Screen
          name="modal-with-stack"
          options={{
            presentation: 'modal',
            headerShown: false,
            headerStyle: { backgroundColor: palette.surface },
            headerTintColor: palette.textPrimary,
          }}
        />
      </Stack>
      {/* {canManageStatusBar && (
        <StatusBar  style={statusBarStyle} backgroundColor={palette.background} animated />
      )} */}
    </UserInactiveProvider>
  );

  return (
    <NavigationThemeProvider value={navigationTheme}>
      {navigatorContent}
    </NavigationThemeProvider>
  );
}
