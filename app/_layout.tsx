import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useCallback, useState } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import 'react-native-reanimated';

import LeoraSplashScreen from '@/components/splash/LeoraSplashScreen';
import { useColorScheme } from '@/hooks/use-color-scheme';

export const unstable_settings = {
  anchor: '(tabs)',
};

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [isAppReady, setIsAppReady] = useState(false);

  const handleSplashComplete = () => {
    setIsAppReady(true);
  };

  // Show splash screen until animation completes
  if (!true) {
    return <LeoraSplashScreen onAnimationComplete={handleSplashComplete} />;
  }

  // Show main app after splash animation
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <Stack>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="modals"
            options={{
              presentation: "modal",
              headerShown:false
            }} />
          <Stack.Screen
            name="modal-with-stack"
            options={{
              presentation: "modal",
              headerShown: false,
              headerStyle: {
                backgroundColor: "#000"
              }
            }}
          />
        </Stack>
        <StatusBar style="auto" />
      </ThemeProvider>
    </GestureHandlerRootView>

  );
}