// app/(tabs)/(finance)/_layout.tsx
import React from 'react';
import { Stack } from 'expo-router';
import { StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import UniversalFAB from '@/components/UniversalFAB';

const FinanceLayout = () => {
  return (
    <SafeAreaView style={styles.container} edges={['left', 'right', 'bottom']}>
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: '#25252B' },
        }}
      >
        <Stack.Screen name="(tabs)" />
      </Stack>
      <UniversalFAB />
    </SafeAreaView>
  );
};

export default FinanceLayout;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#25252B',
  },
});
