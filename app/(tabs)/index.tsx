import React, { useCallback, useState } from 'react';
import { RefreshControl, StyleSheet, View } from 'react-native';
import Animated, {
  useAnimatedScrollHandler,
  useSharedValue,
} from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

import DailyTasksWidget from '@/components/widget/DailyTasksWidget';
import GoalsWidget from '@/components/widget/GoalsWidget';
import GreetingCard from '@/components/screens/home/GreetingCard';
import Header from '@/components/screens/home/Header';
import ProgressIndicators from '@/components/screens/home/ProgressIndicators';
import UniversalFAB from '@/components/UniversalFAB';
import SearchModal from '@/components/modals/SearchModal';
import NotificationModal from '@/components/modals/NotificationModal';

export default function HomeScreen() {
  const scrollY = useSharedValue(0);
  const [refreshing, setRefreshing] = useState(false);
  const [searchVisible, setSearchVisible] = useState(false)
  const [notifVisible, setNotifVisible] = useState(false)
  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
    }, 2000);
  }, []);

  const onScroll = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollY.value = event.contentOffset.y;
    },
  });

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Header onNotificationPress={() => setNotifVisible(true)} scrollY={scrollY} onSearchPress={() => setSearchVisible(true)} />
      <Animated.ScrollView
        onScroll={onScroll}
        scrollEventThrottle={16}
        showsVerticalScrollIndicator={false}
        stickyHeaderIndices={[0]} // 👈 keep ProgressIndicators pinned
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl progressBackgroundColor={"#acacadff"} progressViewOffset={56} refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <ProgressIndicators scrollY={scrollY} tasks={50} budget={90} focus={75} />
        <GreetingCard />
        <DailyTasksWidget />
        <GoalsWidget />
        <View style={styles.bottomSpacer} />
      </Animated.ScrollView>
      <UniversalFAB />
      <SearchModal visible={searchVisible} onClose={() => setSearchVisible(false)} />
      <NotificationModal visible={notifVisible} onClose={() => setNotifVisible(false)} />
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
