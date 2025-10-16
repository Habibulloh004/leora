// app/(tabs)/index.tsx
import React, { useCallback, useState } from 'react';
import { RefreshControl, StyleSheet, View } from 'react-native';
import Animated, {
  useAnimatedScrollHandler,
  useSharedValue,
} from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

import UniversalWidget from '@/components/widget/UniversalWidget';
import GreetingCard from '@/components/screens/home/GreetingCard';
import Header from '@/components/screens/home/Header';
import ProgressIndicators from '@/components/screens/home/ProgressIndicators';
import UniversalFAB from '@/components/UniversalFAB';
import { useWidgetStore } from '@/stores/widgetStore';
import { useRouter } from 'expo-router';

export default function HomeScreen() {
  const scrollY = useSharedValue(0);
  const [refreshing, setRefreshing] = useState(false);
  const router = useRouter();

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
      scrollY.value = event.contentOffset.y;
    },
  });

  const handleEditModeChange = (isEditMode: boolean) => {
    console.log('Edit mode toggled:', isEditMode);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Header
        onNotificationPress={() => router.navigate('/(modals)/notifications')}
        scrollY={scrollY}
        onSearchPress={() => router.navigate('/(modals)/search')}
      />
      <Animated.ScrollView
        onScroll={onScroll}
        scrollEventThrottle={16}
        showsVerticalScrollIndicator={false}
        stickyHeaderIndices={[0]}
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
        <ProgressIndicators scrollY={scrollY} tasks={50} budget={90} focus={75} />
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
    paddingTop: 64,
    paddingBottom: 40,
  },
  bottomSpacer: {
    height: 200,
  },
});
