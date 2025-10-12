import '../global.css'; // Add this import at the top
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
          <Stack.Screen name="(modals)/add-task"
            options={{
              presentation:"transparentModal",
              headerShown:false
            }} />
          <Stack.Screen name="(modals)/voice-ai"
            options={{
              presentation:"modal",
              headerTitle:"Voice Mode",
              headerStyle:{
                backgroundColor:"#25252B"
              },
              headerTintColor:"#fff"
            }} />
          <Stack.Screen name="(modals)/menage-widget"
            options={{
              presentation:"modal",
              headerTitle:"Menage Widget",
              headerStyle:{
                backgroundColor:"#25252B"
              },
              headerTintColor:"#fff"
            }} />
          <Stack.Screen name="focus-mode"
            options={{
              headerTitle:"Focus Mode",
              headerBackButtonDisplayMode:"minimal",
              headerStyle:{
                backgroundColor:"#25252B"
              },
              headerTintColor:"#fff"
            }} />
          <Stack.Screen
            name="modal-with-stack"
            options={{
              presentation: "modal",
              headerShown: false,
              headerStyle: {
                backgroundColor: "#000"
              },
              headerTintColor:"#fff"
            }}
          />
        </Stack>
        <StatusBar style="auto" />
      </ThemeProvider>
    </GestureHandlerRootView>

  );
}