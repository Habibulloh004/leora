// ============================================
// app/(tabs)/_layout.tsx - With Universal FAB
// ============================================
import UniversalFAB from '@/components/UniversalFAB';
import { TabProvider, useTab } from '@/contexts/TabContext';
import { FinanceIcon, HomeIcon, InsightsIcon, MoreIcon, PlannerIcon } from '@assets/icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Tabs } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { Animated, Dimensions, Platform, Pressable, StyleSheet, View } from 'react-native';
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');
const TAB_COUNT = 5;

interface TabButtonProps {
  isFocused: boolean;
  label: string;
  icon: any;
  onPress: () => void;
  onLongPress: () => void;
}

const TabButton = ({ isFocused, label, icon: Icon, onPress, onLongPress }: TabButtonProps) => {
  const scale = useRef(new Animated.Value(1)).current;
  const opacity = useRef(new Animated.Value(isFocused ? 1 : 0.5)).current;
  const iconScale = useRef(new Animated.Value(isFocused ? 1 : 0.9)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: isFocused ? 1 : 0.5,
        duration: 250,
        useNativeDriver: true,
      }),
      Animated.spring(iconScale, {
        toValue: isFocused ? 1.05 : 0.9,
        useNativeDriver: true,
        friction: 8,
        tension: 100,
      }),
    ]).start();
  }, [isFocused]);

  const handlePressIn = () => {
    Animated.spring(scale, {
      toValue: 0.9,
      useNativeDriver: true,
      friction: 8,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scale, {
      toValue: 1,
      useNativeDriver: true,
      friction: 8,
    }).start();
  };

  return (
    <Pressable
      onPress={onPress}
      onLongPress={onLongPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={styles.tabButton}
      android_ripple={null}
      android_disableSound={true}
    >
      <Animated.View style={[styles.tabContent, { transform: [{ scale }] }]}>
        <Animated.View
          style={[
            styles.iconContainer,
            {
              opacity,
              transform: [{ scale: iconScale }],
            },
          ]}
        >
          <Icon
            color={isFocused ? '#FFFFFF' : '#666666'}
            size={24}
            strokeWidth={isFocused ? 2.5 : 2}
          />
        </Animated.View>
        <Animated.Text
          style={[
            styles.tabLabel,
            {
              color: isFocused ? '#FFFFFF' : '#666666',
              fontWeight: isFocused ? '600' : '500',
              opacity,
            },
          ]}
        >
          {label}
        </Animated.Text>
      </Animated.View>
    </Pressable>
  );
};

function CustomTabBar({ state, descriptors, navigation }: any) {
  const insets = useSafeAreaInsets();
  const tabWidth = width / TAB_COUNT;
  const indicatorWidth = tabWidth * 0.5;
  const indicatorOffset = (tabWidth - indicatorWidth) / 2;

  const translateX = useRef(new Animated.Value(state.index * tabWidth + indicatorOffset)).current;
  const [prevIndex, setPrevIndex] = useState(state.index);

  useEffect(() => {
    const toValue = state.index * tabWidth + indicatorOffset;

    Animated.spring(translateX, {
      toValue,
      useNativeDriver: true,
      friction: 10,
      tension: 100,
      velocity: Math.abs(state.index - prevIndex) * 2,
    }).start();

    setPrevIndex(state.index);
  }, [state.index]);

  const tabBarHeight = Platform.OS === 'ios' ? 49 : 56;
  const totalTabBarHeight = tabBarHeight + insets.bottom;

  const tabs = [
    { name: 'index', label: 'Home', icon: HomeIcon },
    { name: 'finance', label: 'Finance', icon: FinanceIcon },
    { name: 'planner', label: 'Planner', icon: PlannerIcon },
    { name: 'insights', label: 'Insights', icon: InsightsIcon },
    { name: 'more', label: 'More', icon: MoreIcon },
  ];

  return (
    <View
      style={[
        styles.tabBar,
        {
          height: totalTabBarHeight,
          paddingBottom: Platform.OS === 'ios' ? insets.bottom : 8,
        },
      ]}
    >
      {/* ===== Sticky Glow Indicator ===== */}
      <Animated.View
        pointerEvents="none"
        style={{
          position: 'absolute',
          top: 0,
          left: -6,
          width: indicatorWidth + 12,
          transform: [{ translateX }],
          overflow: 'hidden',
        }}
      >
        {/* HALO — soft glow expanding upward */}
        <LinearGradient
          colors={['rgba(255,255,255,0)', 'rgba(255,255,255,0.22)', 'rgba(255,255,255,0)']}
          start={{ x: 0.5, y: 0.0 }}
          end={{ x: 0.5, y: 1.0 }}
          style={{
            position: 'absolute',
            top: -12,
            left: -10,
            right: -10,
            height: 24,
            borderRadius: 100,
          }}
        />
        {/* CORE LINE — thin, bright specular line */}
        <LinearGradient
          colors={['rgba(255,255,255,0)', '#FFFFFF', 'rgba(255,255,255,0)']}
          start={{ x: 0, y: 0.5 }}
          end={{ x: 1, y: 0.5 }}
          style={{
            height: 1,
            borderRadius: 1,
          }}
        />
      </Animated.View>

      <View style={styles.tabContainer}>
        {tabs.map((tab, index) => {
          const isFocused = state.index === index;
          const route = state.routes[index];

          const onPress = () => {
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });

            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name, route.params);
            }
          };

          const onLongPress = () => {
            navigation.emit({ type: 'tabLongPress', target: route.key });
          };

          return (
            <TabButton
              key={tab.name}
              isFocused={isFocused}
              label={tab.label}
              icon={tab.icon}
              onPress={onPress}
              onLongPress={onLongPress}
            />
          );
        })}
      </View>
    </View>
  );
}

// Internal component that uses TabContext
function TabsContent() {
  const { setActiveTab } = useTab();

  return (
    <View style={{ flex: 1 }}>
      <Tabs
        screenListeners={{
          state: (e) => {
            // Track current tab for FAB
            const state = e.data.state;
            if (state) {
              const currentRoute = state.routes[state.index].name;
              setActiveTab(currentRoute);
            }
          },
        }}
        tabBar={(props) => <CustomTabBar {...props} />}
        screenOptions={{
          headerShown: false,
          sceneStyle: {
            backgroundColor: '#000000',
          },
        }}
      >
        <Tabs.Screen name="index" />
        <Tabs.Screen name="finance" />
        <Tabs.Screen name="planner" />
        <Tabs.Screen name="insights" />
        <Tabs.Screen name="more" />
      </Tabs>

      {/* Universal FAB - adapts to each tab */}
      <UniversalFAB />
    </View>
  );
}

// Main export wrapped with providers
export default function TabsLayout() {
  return (
    <SafeAreaProvider>
      <TabProvider>
        <TabsContent />
      </TabProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
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
  tabContent: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconContainer: {
    marginBottom: 4,
  },
  tabLabel: {
    fontSize: 11,
    letterSpacing: 0.3,
  },
});