import { Theme, useAppTheme } from '@/constants/theme';
import { Stack } from 'expo-router';
import { useMemo } from 'react';
import { StyleSheet } from 'react-native';

export default function ProfileLayout() {
  const theme = useAppTheme();
  const { colors } = theme;
  const styles = useMemo(() => createStyles(theme), [theme]);
  return (
    <Stack
      screenOptions={{
        headerTintColor: colors.background,
        headerStyle: { backgroundColor: '#1E1E24' },
        contentStyle: { backgroundColor: '#25252B' },
        headerShadowVisible: false,
      }}
    >
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen
        name="edit"
        options={{
          title: 'Edit Profile',
          headerBackTitle: 'Back',
        }}
      />
      <Stack.Screen
        name="security"
        options={{
          title: 'Security',
          headerBackTitle: 'Back',
        }}
      />
    </Stack>
  );
}

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    
  })