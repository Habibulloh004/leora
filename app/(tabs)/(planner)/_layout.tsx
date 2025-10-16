// app/(tabs)/(planner)/_layout.tsx
import React from 'react';
import { StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack } from 'expo-router';

import UniversalFAB from '@/components/UniversalFAB';
import PlannerHeader from '@/components/planner/PlannerHeader';
import PlannerModals from '@/components/planner/PlannerModals';

const PlannerLayout = () => {
  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <PlannerHeader />
      <View style={styles.contentWrapper}>
        <Stack
          screenOptions={{
            headerShown: false,
            contentStyle: styles.content,
          }}
        >
          <Stack.Screen name="(tabs)" />
        </Stack>
        <UniversalFAB />
      </View>
      <PlannerModals />
    </SafeAreaView>
  );
};

export default PlannerLayout;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#25252B',
  },
  contentWrapper: {
    flex: 1,
    position: 'relative',
  },
  content: {
    backgroundColor: '#25252B',
  },
});
