// app/(tabs)/index.tsx
import React, { useCallback, useEffect, useState } from 'react';
import { RefreshControl, StyleSheet, View } from 'react-native';
import Animated, {
  useAnimatedScrollHandler,
  useSharedValue,
} from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';

import UniversalWidget from '@/components/widget/UniversalWidget';
import GreetingCard from '@/components/screens/home/GreetingCard';
import Header from '@/components/screens/home/Header';
import ProgressIndicators from '@/components/screens/home/ProgressIndicators';
import UniversalFAB from '@/components/UniversalFAB';
import SearchModal from '@/components/modals/SearchModal';
import NotificationModal from '@/components/modals/NotificationModal';
import { WidgetType } from '@/config/widgetConfig';

const STORAGE_KEY = '@active_widgets';
const DEFAULT_WIDGETS: WidgetType[] = [
  'daily-tasks',
  'goals',
  'habits',
  'weekly-review',
];

export default function HomeScreen() {
  const scrollY = useSharedValue(0);
  const [refreshing, setRefreshing] = useState(false);
  const [searchVisible, setSearchVisible] = useState(false);
  const [notifVisible, setNotifVisible] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [activeWidgets, setActiveWidgets] = useState<WidgetType[]>(DEFAULT_WIDGETS);

  // Load widgets from storage on mount
  useEffect(() => {
    loadWidgets();
  }, []);

  const loadWidgets = async () => {
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      if (stored) {
        setActiveWidgets(JSON.parse(stored));
      }
    } catch (error) {
      console.error('Error loading widgets:', error);
    }
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadWidgets();
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
    setEditMode(isEditMode);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Header
        onNotificationPress={() => setNotifVisible(true)}
        scrollY={scrollY}
        onSearchPress={() => setSearchVisible(true)}
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

        {/* Render active widgets dynamically */}
        {activeWidgets.map((widgetId) => (
          <UniversalWidget
            key={widgetId}
            widgetId={widgetId}
            editMode={editMode}
            onRemove={() => {
              setActiveWidgets(prev => prev.filter(id => id !== widgetId));
            }}
          />
        ))}

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
    paddingTop: 64,
    paddingBottom: 40,
  },
  bottomSpacer: {
    height: 200,
  },
});