// app/(tabs)/(insights)/_layout.tsx
import React from 'react';
import { Stack } from 'expo-router';
import { StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import InsightsHeader from '@/components/insights/InsightsHeader';
import UniversalFAB from '@/components/UniversalFAB';
import InsightsModals from '@/components/insights/InsightsModals';

const InsightsLayout = () => {
  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <InsightsHeader />
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
      <InsightsModals />
    </SafeAreaView>
  );
};

export default InsightsLayout;

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
