import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, {
  useSharedValue,
  withTiming,
  useAnimatedStyle,
  Easing,
  FadeInDown,
} from 'react-native-reanimated';
import { AdaptiveGlassView } from '@/components/ui/AdaptiveGlassView';
import { createThemedStyles, useAppTheme } from '@/constants/theme';
import {
  ChevronDown,
  ChevronRight,
  Trophy,
} from 'lucide-react-native';

/* ------------------------------- Static data ------------------------------ */
const completion = {
  done: 23,
  total: 50,
  percent: 46,
  last: {
    title: 'Marathoner',
    subtitle: '42 days streak',
    details: '+500 XP   Rare   (15% users)',
  },
};

const recentlyUnlocked = [
  {
    title: 'Marathoner',
    time: '3 days ago',
    subtitle: '42‑Day Streak Without Breaks',
    details: '+500 XP   Rare   (15% users)',
  },
  {
    title: 'Financial GURU',
    time: 'Week ago',
    subtitle: 'Budget kept 3 Months in a Row',
    details: '+300 XP   Unusual   (13% users)',
  },
  {
    title: 'Goal Sniper',
    time: '2 weeks ago',
    subtitle: '10 goals accomplished',
    details: '+200 XP   Casual   (35% users)',
  },
];

const closeToUnlocking = [
  {
    title: 'Hot Streak',
    progress: '95% (46/50)',
    subtitle: 'Active 50 days straight',
    details: '+1000 XP   Epic   (2% users)',
  },
  {
    title: 'Habit master',
    progress: '80% (4/5)',
    subtitle: '5 Habits for 30 Days',
    details: '+750 XP   Rare   (18% users)',
  },
];

const categoriesTabs = ['All', 'Financial', 'Efficiency', 'Habits', 'Social', 'Spec'] as const;

const categoriesList = [
  { name: 'Finance', count: '8/15' },
  { name: 'Efficiency', count: '6/12' },
  { name: 'Habits', count: '5/10' },
  { name: 'Social', count: '2/8' },
  { name: 'Special', count: '2/5' },
  { name: 'Hidden', count: '???' },
];

/* --------------------------------- Styles -------------------------------- */
const useStyles = createThemedStyles((theme) => ({
  safe: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  scroll: {
    padding: theme.spacing.xl,
    paddingBottom: theme.spacing.xxxl * 2,
    gap: theme.spacing.lg,
  },
  card: {
    borderRadius: 16,
    backgroundColor: theme.colors.card,
  },
  cardInner: {
    padding: theme.spacing.xxl,
    gap: theme.spacing.lg,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: theme.colors.textPrimary,
    letterSpacing: -0.2,
  },
  hr: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: theme.mode === 'dark'
      ? 'rgba(255,255,255,0.08)'
      : 'rgba(15,23,42,0.08)',
  },

  // Header (Completion)
  capSmall: {
    fontSize: 12,
    color: theme.colors.textMuted,
    marginBottom: 6,
  },
  completionRow: {
    flexDirection: 'row',
    gap: theme.spacing.xl,
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  completionLeft: {
    flex: 1,
    gap: 10,
  },
  completionNumber: {
    fontSize: 24,
    fontWeight: '800',
    letterSpacing: 0.2,
    color: '#f4d24b',
  },
  completionSub: {
    fontSize: 13,
    color: theme.colors.textMuted,
    marginTop: 2,
  },
  trophyWrap: {
    width: 110,
    height: 110,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Accordion
  accHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
  },
  accTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: theme.colors.textPrimary,
  },

  // Achievement rows
  item: {
    paddingVertical: 12,
  },
  itemTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 2,
  },
  itemTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: theme.colors.textPrimary,
  },
  itemRight: {
    fontSize: 12,
    color: theme.colors.textMuted,
  },
  itemSub: {
    fontSize: 13,
    color: theme.colors.textSecondary,
  },
  itemDetails: {
    marginTop: 4,
    fontSize: 12,
    color: theme.colors.textMuted,
  },

  // Tabs
  tabsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.lg,
  },
  tabText: {
    fontSize: 14,
    color: theme.colors.textSecondary,
  },
  tabActive: {
    color: theme.colors.textPrimary,
    fontWeight: '700',
  },
  tabUnderline: {
    height: 2,
    marginTop: 6,
    borderRadius: 2,
  },

  // Category lines
  catRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
  },
  catLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  catText: {
    fontSize: 15,
    color: theme.colors.textPrimary,
    fontWeight: '600',
  },
  catCount: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    fontWeight: '600',
  },
  showAll: {
    alignSelf: 'center',
    marginTop: 8,
    fontSize: 14,
    color: theme.colors.textSecondary,
    textDecorationLine: 'underline',
  },
}));

/* ------------------------------- Utilities ------------------------------- */
const HR = () => {
  const styles = useStyles();
  return <View style={styles.hr} />;
};

type AccProps = {
  title: string;
  defaultOpen?: boolean;
  children: React.ReactNode;
};
/** Measure‑based accordion with smooth height animation */
const Accordion: React.FC<AccProps> = ({ title, defaultOpen = true, children }) => {
  const styles = useStyles();
  const theme = useAppTheme();

  const [contentH, setContentH] = useState(0);
  const open = useSharedValue(defaultOpen ? 1 : 0);

  const animated = useAnimatedStyle(() => {
    return {
      height: withTiming(open.value ? contentH : 0, {
        duration: 260,
        easing: Easing.out(Easing.quad),
      }),
      opacity: withTiming(open.value ? 1 : 0.4, { duration: 240 }),
    };
  }, [contentH]);

  const toggle = useCallback(() => {
    open.value = open.value ? 0 : 1;
  }, []);

  const chevronStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: withTiming(open.value ? '180deg' : '0deg', { duration: 220 }) }],
  }));

  return (
    <View>
      <Pressable onPress={toggle} style={({ pressed }) => [{ opacity: pressed ? 0.8 : 1 }, styles.accHeader]}>
        <Text style={styles.accTitle}>{title}</Text>
        <Animated.View style={chevronStyle}>
          <ChevronDown size={18} color={theme.colors.icon} />
        </Animated.View>
      </Pressable>

      <Animated.View style={[{ overflow: 'hidden' }, animated]}>
        {/* measure box */}
        <View
          onLayout={(e) => setContentH(e.nativeEvent.layout.height)}
        >
          {children}
        </View>
      </Animated.View>
    </View>
  );
};

type RowProps = {
  title: string;
  subtitle: string;
  details: string;
  right?: string; // time or progress
};
const AchievementRow: React.FC<RowProps> = ({ title, subtitle, details, right }) => {
  const styles = useStyles();
  const theme = useAppTheme();
  return (
    <View style={styles.item}>
      <View style={styles.itemTop}>
        <Text style={styles.itemTitle}>{title}</Text>
        {right ? <Text style={styles.itemRight}>{right}</Text> : null}
      </View>
      <Text style={styles.itemSub}>{subtitle}</Text>
      <Text style={styles.itemDetails}>{details}</Text>
    </View>
  );
};

/* --------------------------------- Screen -------------------------------- */
export default function Achievements() {
  const styles = useStyles();
  const theme = useAppTheme();
  const [activeTab, setActiveTab] = useState<(typeof categoriesTabs)[number]>('All');

  const underlineWidth = useMemo(() => {
    // simple underline width approximation by label length
    const base = 16;
    return (label: string) => Math.max(base, Math.min(80, label.length * 7));
  }, []);

  return (
    <SafeAreaView style={styles.safe} edges={["bottom"]}>
      <Animated.ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scroll}
      >
        <AdaptiveGlassView style={styles.card}>
          <Animated.View entering={FadeInDown.duration(400)}>
            <View style={styles.cardInner}>
              <Text style={styles.sectionTitle}>Achievements</Text>
              <HR />

              <View style={styles.completionRow}>
                <View style={styles.completionLeft}>
                  <View>
                    <Text style={styles.capSmall}>Completion:</Text>
                    <Text style={styles.completionNumber}>
                      {completion.done}/{completion.total} ({completion.percent}%)
                    </Text>
                  </View>

                  <View>
                    <Text style={styles.capSmall}>Last achievement:</Text>
                    <Text style={[styles.itemTitle, { marginBottom: 2 }]}>{completion.last.title}</Text>
                    <Text style={styles.itemSub}>{completion.last.subtitle}</Text>
                    <Text style={styles.itemDetails}>{completion.last.details}</Text>
                  </View>
                </View>

                <View style={[styles.trophyWrap]}>
                  <Image source={require('@assets/images/achievements.png')} style={{ width: 96, height: 96 }} />
                </View>
              </View>
            </View>
          </Animated.View>
        </AdaptiveGlassView>

        {/* ---------------------------- RECENTLY UNLOCKED --------------------------- */}
        <AdaptiveGlassView style={styles.card}>
          <View style={styles.cardInner}>
            <Accordion title="Recently unlocked" defaultOpen>
              <HR />
              {recentlyUnlocked.map((a, i) => (
                <View key={a.title}>
                  <AchievementRow
                    title={a.title}
                    subtitle={a.subtitle}
                    details={a.details}
                    right={a.time}
                  />
                  {i < recentlyUnlocked.length - 1 ? <HR /> : null}
                </View>
              ))}
            </Accordion>
          </View>
        </AdaptiveGlassView>

        {/* --------------------------- CLOSE TO UNLOCKING --------------------------- */}
        <AdaptiveGlassView style={styles.card}>
          <View style={styles.cardInner}>
            <Accordion title="Close to Unlocking" defaultOpen>
              <HR />
              {closeToUnlocking.map((a, i) => (
                <View key={a.title}>
                  <AchievementRow
                    title={a.title}
                    subtitle={a.subtitle}
                    details={a.details}
                    right={a.progress}
                  />
                  {i < closeToUnlocking.length - 1 ? <HR /> : null}
                </View>
              ))}
            </Accordion>
          </View>
        </AdaptiveGlassView>

        {/* -------------------------------- CATEGORIES ------------------------------ */}
        <AdaptiveGlassView style={styles.card}>
          <View style={styles.cardInner}>
            <Text style={styles.sectionTitle}>Categories</Text>
            <HR />

            {/* Tabs */}
            <View style={[styles.tabsRow, { marginTop: 8 }]}>
              {categoriesTabs.map((tab) => {
                const isActive = tab === activeTab;
                return (
                  <Pressable
                    key={tab}
                    onPress={() => setActiveTab(tab)}
                    style={({ pressed }) => [{ opacity: pressed ? 0.8 : 1 }]}
                  >
                    <View>
                      <Text style={[styles.tabText, isActive && styles.tabActive]}>{tab}</Text>
                      {isActive ? (
                        <View
                          style={[
                            styles.tabUnderline,
                            {
                              width: underlineWidth(tab),
                              backgroundColor: theme.colors.textPrimary,
                            },
                          ]}
                        />
                      ) : (
                        <View style={[styles.tabUnderline, { width: underlineWidth(tab), backgroundColor: 'transparent' }]} />
                      )}
                    </View>
                  </Pressable>
                );
              })}
            </View>

            <HR />

            {/* Category list (static like in mock) */}
            {categoriesList.map((c, i) => (
              <View key={c.name}>
                <View style={styles.catRow}>
                  <View style={styles.catLeft}>
                    <Image source={require('@assets/images/achievementItem.png')} style={{ width: 24, height: 24 }} />
                    <Text style={styles.catText}>{c.name}</Text>
                  </View>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                    <Text style={styles.catCount}>{c.count}</Text>
                    <ChevronRight size={16} color={theme.colors.icon} />
                  </View>
                </View>
                {i < categoriesList.length - 1 ? <HR /> : null}
              </View>
            ))}

            <Pressable style={({ pressed }) => [{ opacity: pressed ? 0.8 : 1 }]}>
              <Text style={styles.showAll}>Show all</Text>
            </Pressable>
          </View>
        </AdaptiveGlassView>
      </Animated.ScrollView>
    </SafeAreaView>
  );
}
