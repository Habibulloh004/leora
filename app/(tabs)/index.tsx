// app/(tabs)/index.tsx
import React, { useCallback, useState } from 'react';
import { RefreshControl, StyleSheet, View } from 'react-native';
import Animated, { runOnJS, useAnimatedScrollHandler, useSharedValue } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

import UniversalWidget from '@/components/widget/UniversalWidget';
import GreetingCard from '@/components/screens/home/GreetingCard';
import UniversalFAB from '@/components/UniversalFAB';
import { useWidgetStore } from '@/stores/widgetStore';
import { useHomeScrollStore } from '@/stores/useHomeScrollStore';

export default function HomeScreen() {
  const scrollY = useSharedValue(0);
  const lastReported = useSharedValue(0);
  const [refreshing, setRefreshing] = useState(false);
  const setScrollY = useHomeScrollStore((state) => state.setScrollY);

  // Subscribe to Zustand store - will automatically re-render when activeWidgets changes
  const activeWidgets = useWidgetStore((state) => state.activeWidgets);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    // Simulate refresh
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  }, []);

  const onScroll = useAnimatedScrollHandler({
    onScroll: (event) => {
      const value = Math.max(event.contentOffset.y, 0);
      scrollY.value = value;

      if (Math.abs(value - lastReported.value) > 2) {
        lastReported.value = value;
        runOnJS(setScrollY)(value);
      }
    },
  });

  const handleEditModeChange = (isEditMode: boolean) => {
    console.log('Edit mode toggled:', isEditMode);
  };

  return (
    <SafeAreaView style={styles.container} edges={['left', 'right', 'bottom']}>
      <Animated.ScrollView
        onScroll={onScroll}
        scrollEventThrottle={16}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            progressBackgroundColor="#acacadff"
            progressViewOffset={56}
            refreshing={refreshing}
            onRefresh={onRefresh}
          />
        }
      >
        <GreetingCard onEditModeChange={handleEditModeChange} />

        {/* Render active widgets from Zustand store - will update in real-time */}
        {activeWidgets.map((widgetId) => (
          <UniversalWidget
            key={widgetId}
            widgetId={widgetId}
          />
        ))}

        <View style={styles.bottomSpacer} />
      </Animated.ScrollView>
      <UniversalFAB />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#25252B',
  },
  scrollContent: {
    paddingTop: 140,
    paddingBottom: 40,
  },
  bottomSpacer: {
    height: 200,
  },
});
