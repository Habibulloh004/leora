// app/(tabs)/_layout.tsx
import 'react-native-gesture-handler';
import React, { memo, useMemo, useRef } from 'react';
import { Animated, Dimensions, Platform, Pressable, StyleSheet, View } from 'react-native';
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Tabs } from 'expo-router';

import { HapticTab } from '@/components/haptic-tab';
import { TabProvider, useTab } from '@/contexts/TabContext';
import { FinanceIcon, HomeIcon, InsightsIcon, MoreIcon, PlannerIcon } from '@assets/icons';

const { width } = Dimensions.get('window');
const TAB_COUNT = 5 as const;

type IconProps = { color?: string; size?: number; strokeWidth?: number };
type IconType = React.ComponentType<IconProps>;

type TabItem = {
  name: 'index' | 'finance' | 'planner' | 'insights' | 'more';
  label: string;
  icon: IconType;
};

const TABS: readonly TabItem[] = [
  { name: 'index', label: 'Home', icon: HomeIcon },
  { name: 'finance', label: 'Finance', icon: FinanceIcon },
  { name: 'planner', label: 'Planner', icon: PlannerIcon },
  { name: 'insights', label: 'Insights', icon: InsightsIcon },
  { name: 'more', label: 'More', icon: MoreIcon },
] as const;

/* ----------------------------- Tab Button ----------------------------- */
interface TabButtonProps {
  isFocused: boolean;
  label: string;
  Icon: IconType;
  onPress: () => void;
  onLongPress: () => void;
}

const TabButton = memo(function TabButton({
  isFocused,
  label,
  Icon,
  onPress,
  onLongPress,
}: TabButtonProps) {
  const pressAnim = useRef(new Animated.Value(0)).current;

  const scale = pressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 0.9],
  });

  const iconScale = isFocused ? 1.05 : 0.9;
  const opacity = isFocused ? 1 : 0.5;
  const color = isFocused ? '#FFFFFF' : '#666666';

  const handlePressIn = () =>
    Animated.timing(pressAnim, { toValue: 1, duration: 120, useNativeDriver: true }).start();

  const handlePressOut = () =>
    Animated.timing(pressAnim, { toValue: 0, duration: 120, useNativeDriver: true }).start();

  return (
    <Pressable
      onPress={onPress}
      onLongPress={onLongPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={styles.tabButton}
      android_ripple={{ color: 'rgba(255,255,255,0.1)', borderless: true }}
    >
      <Animated.View style={[styles.tabContent, { transform: [{ scale }] }]}>
        <View style={[styles.iconContainer, { opacity, transform: [{ scale: iconScale }] }]}>
          <Icon color={color} size={24} strokeWidth={isFocused ? 2.5 : 2} />
        </View>
        <Animated.Text style={[styles.tabLabel, { color, opacity }]}>{label}</Animated.Text>
      </Animated.View>
    </Pressable>
  );
});
TabButton.displayName = 'TabButton';

/* --------------------------- Glow Indicator --------------------------- */
interface GlowIndicatorProps {
  translateX: Animated.Value;
  width: number;
}

const GlowIndicator = memo(function GlowIndicator({ translateX, width }: GlowIndicatorProps) {
  return (
    <Animated.View
      pointerEvents="none"
      style={{
        position: 'absolute',
        top: 0,
        left: -6,
        width: width + 12,
        transform: [{ translateX }],
        overflow: 'hidden',
      }}
    >
      {/* HALO */}
      <LinearGradient
        colors={['rgba(255,255,255,0)', 'rgba(255,255,255,0.22)', 'rgba(255,255,255,0)']}
        start={{ x: 0.5, y: 0.0 }}
        end={{ x: 0.5, y: 1.0 }}
        style={{ position: 'absolute', top: -12, left: -10, right: -10, height: 24, borderRadius: 100 }}
      />
      {/* CORE LINE */}
      <LinearGradient
        colors={['rgba(255,255,255,0)', '#FFFFFF', 'rgba(255,255,255,0)']}
        start={{ x: 0, y: 0.5 }}
        end={{ x: 1, y: 0.5 }}
        style={{ height: 1, borderRadius: 1 }}
      />
    </Animated.View>
  );
});
GlowIndicator.displayName = 'GlowIndicator';

/* ---------------------------- Custom TabBar --------------------------- */
/** We avoid useEffect. We trigger springs only when targetX actually changes. */
const CustomTabBar = memo(function CustomTabBar({ state, navigation }: any) {
  const insets = useSafeAreaInsets();
  const tabWidth = width / TAB_COUNT;
  const indicatorWidth = tabWidth * 0.5;
  const indicatorOffset = (tabWidth - indicatorWidth) / 2;

  const translateX = useRef(new Animated.Value(state.index * tabWidth + indicatorOffset)).current;
  const lastTargetRef = useRef<number>(state.index * tabWidth + indicatorOffset);

  // Compute current targetX and animate only if it changed:
  const targetX = state.index * tabWidth + indicatorOffset;
  if (lastTargetRef.current !== targetX) {
    lastTargetRef.current = targetX;
    Animated.spring(translateX, {
      toValue: targetX,
      useNativeDriver: true,
      friction: 10,
      tension: 120,
    }).start();
  }

  const totalHeight = (Platform.OS === 'ios' ? 49 : 56) + insets.bottom;

  return (
    <View style={[styles.tabBar, { height: totalHeight, paddingBottom: Platform.OS === 'ios' ? insets.bottom : 8 }]}>
      <GlowIndicator translateX={translateX} width={indicatorWidth} />

      <View style={styles.tabContainer}>
        {TABS.map((tab, index) => {
          const isFocused = state.index === index;
          const route = state.routes[index];

          const onPress = () => {
            const event = navigation.emit({ type: 'tabPress', target: route.key, canPreventDefault: true });
            if (!isFocused && !event.defaultPrevented) navigation.navigate(route.name, route.params);
          };

          const onLongPress = () => {
            navigation.emit({ type: 'tabLongPress', target: route.key });
          };

          return (
            <TabButton
              key={tab.name}
              isFocused={isFocused}
              label={tab.label}
              Icon={tab.icon}
              onPress={onPress}
              onLongPress={onLongPress}
            />
          );
        })}
      </View>
    </View>
  );
});
CustomTabBar.displayName = 'CustomTabBar';

/* ---------------------------- Tabs Container -------------------------- */
function TabsContent() {
  const { setActiveTab } = useTab();

  const screenListeners = useMemo(
    () => ({
      state: (e: any) => {
        const s = e.data.state;
        if (s) {
          const currentRoute = s.routes[s.index].name;
          setActiveTab(currentRoute);
        }
      },
    }),
    [setActiveTab],
  );

  return (
    <View style={{ flex: 1 }}>
      <Tabs
        detachInactiveScreens
        screenListeners={screenListeners}
        tabBar={(props) => <CustomTabBar {...props} />}
        screenOptions={{
          headerShown: false,
          freezeOnBlur: true,
          tabBarButton: HapticTab,
        }}
        backBehavior="order"
      >
        <Tabs.Screen name="index" />
        <Tabs.Screen name="(finance)" />
        <Tabs.Screen name="(planner)" />
        <Tabs.Screen name="(insights)" />
        <Tabs.Screen name="more" />
      </Tabs>
    </View>
  );
}

/* ------------------------------ Root Export --------------------------- */
export default function TabsLayout() {
  return (
    <SafeAreaProvider>
      <TabProvider>
        <TabsContent />
      </TabProvider>
    </SafeAreaProvider>
  );
}

/* -------------------------------- Styles ------------------------------ */
const styles = StyleSheet.create({
  tabBar: {
    position: 'absolute',
    bottom: 0, left: 0, right: 0,
    backgroundColor: '#25252B',
    borderTopWidth: 1,
    borderTopColor: '#1A1A1A',
    paddingTop: 8,
    overflow: 'visible',
  },
  tabContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
  },
  tabButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
  },
  tabContent: { alignItems: 'center', justifyContent: 'center' },
  iconContainer: { marginBottom: 4 },
  tabLabel: { fontSize: 11, letterSpacing: 0.3 },
});
