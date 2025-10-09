import React from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  useAnimatedScrollHandler,
  useSharedValue,
} from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

import DailyTasksWidget from '@/components/screens/home/DailyTasksWidget';
import GoalsWidget from '@/components/screens/home/GoalsWidget';
import GreetingCard from '@/components/screens/home/GreetingCard';
import Header from '@/components/screens/home/Header';
import ProgressIndicators from '@/components/screens/home/ProgressIndicators';

export default function HomeScreen() {
  const scrollY = useSharedValue(0);

  const onScroll = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollY.value = event.contentOffset.y;
    },
  });

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Header scrollY={scrollY} />

      <Animated.ScrollView
        onScroll={onScroll}
        scrollEventThrottle={16}
        showsVerticalScrollIndicator={false}
        stickyHeaderIndices={[0]} // 👈 keep ProgressIndicators pinned
        contentContainerStyle={styles.scrollContent}
      >
        <ProgressIndicators scrollY={scrollY} tasks={50} budget={90} focus={75} />
        <GreetingCard />
        <DailyTasksWidget />
        <GoalsWidget />
        <View style={styles.bottomSpacer} />
      </Animated.ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#25252B',
  },
  scrollContent: {
    paddingTop: 64, // allow space for header above
    paddingBottom: 40,
  },
  bottomSpacer: {
    height: 200,
  },
});
