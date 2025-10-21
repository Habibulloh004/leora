import 'react-native-reanimated';
import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';
import { DarkTheme, DefaultTheme, ThemeProvider as NavigationThemeProvider } from '@react-navigation/native';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Platform } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { enableFreeze, enableScreens } from 'react-native-screens';
import { Asset } from 'expo-asset';
import * as Font from 'expo-font';
import { SafeAreaProvider, initialWindowMetrics } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { ThemeProvider, useTheme } from '@/contexts/ThemeContext';
import { getTheme } from '@/constants/theme';
import { useAuthStore } from '@/stores/useAuthStore';
import LeoraSplashScreen from '@/components/screens/splash/LeoraSplashScreen';
import { useLockStore } from '@/stores/useLockStore';
import UserInactiveProvider from '@/providers/UserInactiveProvider';

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

function RootNavigator({
  hasBooted,
  assetsReady,
  onSplashComplete,
}: {
  hasBooted: boolean;
  assetsReady: boolean;
  onSplashComplete: () => void;
}) {
  const { theme } = useTheme();
  const { isAuthenticated } = useAuthStore();
  const setLoggedIn = useLockStore((state) => state.setLoggedIn);
  const setLocked = useLockStore((state) => state.setLocked);
  const updateLastActive = useLockStore((state) => state.updateLastActive);
  const router = useRouter();
  const segments = useSegments();

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

  if (!hasBooted) {
    return <LeoraSplashScreen ready={assetsReady} onAnimationComplete={onSplashComplete} />;
  }

  return (
    <NavigationThemeProvider value={navigationTheme}>
      <UserInactiveProvider >
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
              headerStyle: { backgroundColor: '#25252B' },
              headerTintColor: '#fff',
            }}
          />
          <Stack.Screen
            name="(modals)/quick-exp"
            options={{
              presentation: 'modal',
              headerTitle: 'Quick Expence',
              headerStyle: { backgroundColor: '#25252B' },
              headerTintColor: '#fff',
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
              headerStyle: { backgroundColor: '#25252B' },
              headerTintColor: '#fff',
            }}
          />
          <Stack.Screen
            name="(modals)/menage-widget"
            options={{
              headerShown: false,
              presentation: 'modal',
              headerTitle: 'Menage Widget',
              headerStyle: { backgroundColor: '#25252B' },
              headerTintColor: '#fff',
            }}
          />
          <Stack.Screen
            name="(modals)/inactive"
            options={{
              headerShown: false,
              animation: "none"
            }}
          />
          <Stack.Screen
            name="(modals)/lock"
            options={{
              headerShown: false,
              animation: "none"
            }}
          />
          <Stack.Screen
            name="focus-mode"
            options={{
              headerTitle: 'Focus Mode',
              headerBackButtonDisplayMode: 'default',
              headerStyle: { backgroundColor: '#25252B' },
              headerBackTitle: 'Back',
              headerTintColor: '#fff',
            }}
          />
          <Stack.Screen
            name="modal-with-stack"
            options={{
              presentation: 'modal',
              headerShown: false,
              headerStyle: { backgroundColor: '#000' },
              headerTintColor: '#fff',
            }}
          />
        </Stack>
        <StatusBar style={statusBarStyle} backgroundColor={palette.background} animated />
      </UserInactiveProvider>
    </NavigationThemeProvider>
  );
}
