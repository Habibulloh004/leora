import '../global.css';
import 'react-native-reanimated';
import { DarkTheme, DefaultTheme, ThemeProvider as NavigationThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useMemo } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { enableFreeze, enableScreens } from 'react-native-screens';

import LeoraSplashScreen from '@/components/splash/LeoraSplashScreen';
import { ThemeProvider, useTheme } from '@/contexts/ThemeContext';
import { Colors } from '@/constants/theme';

enableScreens(true);
enableFreeze(true);

export const unstable_settings = {
  anchor: '(tabs)',
};

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ThemeProvider>
        <RootNavigator />
      </ThemeProvider>
    </GestureHandlerRootView>
  );
}

function RootNavigator() {
  const { theme } = useTheme();
  const palette = theme === 'dark' ? Colors.dark : Colors.light;

  const navigationTheme = useMemo(() => {
    if (theme === 'dark') {
      return {
        ...DarkTheme,
        dark: true,
        colors: {
          ...DarkTheme.colors,
          background: palette.background,
          card: '#1E1E24',
          border: '#1E1E24',
          primary: palette.tint,
          text: palette.text,
        },
      };
    }

    return {
      ...DefaultTheme,
      dark: false,
      colors: {
        ...DefaultTheme.colors,
        background: palette.background,
        card: '#FFFFFF',
        border: '#E5E5EA',
        primary: palette.tint,
        text: palette.text,
      },
    };
  }, [palette, theme]);

  const statusBarStyle = theme === 'dark' ? 'light' : 'dark';

  if (!true) {
    return <LeoraSplashScreen onAnimationComplete={() => {}} />;
  }

  return (
    <NavigationThemeProvider value={navigationTheme}>
      <Stack
        screenOptions={{
          headerShadowVisible: false,
          animation: 'fade',
          contentStyle: {
            backgroundColor: palette.background,
          },
          statusBarStyle,
          navigationBarColor: palette.background,
          fullScreenGestureEnabled: true,
        }}
      >
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="(modals)/add-task"
          options={{
            presentation: "modal",
            headerTitle:"Add Task",
            headerStyle: {
              backgroundColor: "#25252B"
            },
            headerTintColor: "#fff"
          }} />
        <Stack.Screen name="(modals)/quick-exp"
          options={{
            presentation: "modal",
            headerTitle:"Quick Expence",
            headerStyle: {
              backgroundColor: "#25252B"
            },
            headerTintColor: "#fff"
          }} />
        <Stack.Screen name="(modals)/voice-ai"
          options={{
            presentation: "modal",
            headerTitle: "Voice Mode",
            headerStyle: {
              backgroundColor: "#25252B"
            },
            headerTintColor: "#fff"
          }} />
        <Stack.Screen name="(modals)/menage-widget"
          options={{
            headerShown: false,
            presentation: "modal",
            headerTitle: "Menage Widget",
            headerStyle: {
              backgroundColor: "#25252B"
            },
            headerTintColor: "#fff"
          }} />
        <Stack.Screen name="focus-mode"
          options={{
            headerTitle: "Focus Mode",
            headerBackButtonDisplayMode: "default",
            headerStyle: {
              backgroundColor: "#25252B"
            },
            headerBackTitle: "Back",
            headerTintColor: "#fff"
          }} />
        <Stack.Screen
          name="modal-with-stack"
          options={{
            presentation: "modal",
            headerShown: false,
            headerStyle: {
              backgroundColor: "#000"
            },
            headerTintColor: "#fff"
          }}
        />
      </Stack>
      <StatusBar style={statusBarStyle} />
    </NavigationThemeProvider>
  );
}
