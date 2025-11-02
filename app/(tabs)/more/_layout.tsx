import React from 'react';
import { View } from 'react-native';
import { Stack } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useAppTheme, useThemeColors } from '@/constants/theme';
import MoreHeader from './_components/MoreHeader';

const TabHeaderFrame: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const insets = useSafeAreaInsets();
  const theme = useAppTheme();
  return (
    <View style={{ paddingTop: insets.top, backgroundColor: theme.colors.background }}>{children}</View>
  );
};

const MoreHeaderComponent = () => (
  <TabHeaderFrame>
    <MoreHeader />
  </TabHeaderFrame>
);

export default function MoreLayout() {
  const colors = useThemeColors();

  return (
    <Stack
      screenOptions={{
        contentStyle: { backgroundColor: colors.background },
      }}
    >
      <Stack.Screen
        name="index"
        options={{
          header: () => <MoreHeaderComponent />,
        }}
      />
      <Stack.Screen 
        name="account"
        options={{
          headerShown:false
        }}
      />
      <Stack.Screen 
        name="settings"
        options={{
          headerShown:false
        }}
      />
    </Stack>
  );
}
