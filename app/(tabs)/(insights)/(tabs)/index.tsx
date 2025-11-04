import React, { useMemo } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import {
  AlertTriangle,
  ArrowRight,
  Brain,
  Coffee,
  Lightbulb,
  Play,
  Target,
  TrendingUp,
  type LucideIcon,
} from 'lucide-react-native';

import { AdaptiveGlassView } from '@/components/ui/AdaptiveGlassView';
import type { Theme } from '@/constants/theme';
import { useAppTheme } from '@/constants/theme';

type ComponentMetric = {
  key: string;
  icon: LucideIcon;
  label: string;
  score: number;
  strong: string;
  growth: string;
  progress: number;
};

type ChangeGroup = {
  key: string;
  title: string;
  icon: LucideIcon;
  bullets: string[];
};

type QuickWin = {
  key: string;
  icon: LucideIcon;
  title: string;
  impact: string;
  meta: string;
};

const COMPONENTS: ComponentMetric[] = [
  {
    key: 'financial',
    icon: Target,
    label: 'Financial health',
    score: 8.2,
    strong: 'Saving, budgeting',
    growth: 'Investment',
    progress: 0.82,
  },
  {
    key: 'productivity',
    icon: Brain,
    label: 'Productivity',
    score: 6.5,
    strong: 'Focus sessions',
    growth: 'Morning productivity',
    progress: 0.65,
  },
  {
    key: 'balance',
    icon: Lightbulb,
    label: 'Work-life balance',
    score: 7.0,
    strong: 'Night rest',
    growth: 'Weekends',
    progress: 0.7,
  },
  {
    key: 'goals',
    icon: TrendingUp,
    label: 'Achieving goals',
    score: 9.1,
    strong: 'Consistency',
    growth: 'Completion speed',
    progress: 0.91,
  },
  {
    key: 'discipline',
    icon: Coffee,
    label: 'Discipline',
    score: 8.0,
    strong: 'Habits',
    growth: 'Weekends',
    progress: 0.8,
  },
];

const CHANGE_GROUPS: ChangeGroup[] = [
  {
    key: 'upgrades',
    title: 'Upgrades',
    icon: TrendingUp,
    bullets: [
      'Saving +35% vs December',
      'Focus time +2h/day',
      'Workout streak: 12 days',
      '3 new habits',
    ],
  },
  {
    key: 'attention',
    title: 'Need attention',
    icon: AlertTriangle,
    bullets: [
      'Productivity after break -20%',
      'Skipped 3 days of meditation',
      'Overspend for food',
      'Tasks postponed until evening',
    ],
  },
];

const QUICK_WINS: QuickWin[] = [
  {
    key: 'tasks',
    icon: Target,
    title: 'Complete 3 tasks before lunch',
    impact: 'Impact: +15% productivity',
    meta: 'Time: 2 hours',
  },
  {
    key: 'coffee',
    icon: Coffee,
    title: 'No more coffee to go',
    impact: 'Impact: 150k saved per month',
    meta: 'Difficulty: Easy',
  },
  {
    key: 'meditation',
    icon: Lightbulb,
    title: '5 minutes of meditation now',
    impact: 'Impact: +10% focus',
    meta: 'Time: 5 minutes',
  },
  {
    key: 'reading',
    icon: Brain,
    title: 'Read 10 pages',
    impact: 'Impact: Goal progression +2%',
    meta: 'Time: 15 minutes',
  },
];

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    root: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    content: {
      paddingHorizontal: theme.spacing.lg,
      paddingTop: theme.spacing.lg,
      paddingBottom: theme.spacing.xxxl+32,
      gap: theme.spacing.xxl,
    },
    section: {
      gap: theme.spacing.md,
    },
    sectionTitle: {
      fontSize: 14,
      fontWeight: '600',
      color: theme.colors.textMuted,
      textTransform: 'uppercase',
      letterSpacing: 0.4,
    },
    surfaceCard: {
      borderRadius: theme.radius.xxl,
      padding: theme.spacing.lg,
      gap: theme.spacing.md,
      backgroundColor:
        theme.mode === 'dark'
          ? 'rgba(148,163,184,0.08)'
          : 'rgba(15,23,42,0.04)',
    },
    scoreRow: {
      flexDirection: 'row',
      alignItems: 'flex-end',
      gap: theme.spacing.sm,
    },
    scoreValue: {
      fontSize: 28,
      fontWeight: '700',
      color: theme.colors.textPrimary,
    },
    scoreDenominator: {
      fontSize: 14,
      color: theme.colors.textSecondary,
      marginBottom: 4,
    },
    progressTrack: {
      height: 16,
      borderRadius: theme.radius.full,
      backgroundColor:
        theme.mode === 'dark'
          ? 'rgba(148,163,184,0.14)'
          : 'rgba(15,23,42,0.12)',
      overflow: 'hidden',
    },
    progressFill: {
      height: '100%',
      borderRadius: theme.radius.full,
      backgroundColor:
        theme.mode === 'dark'
          ? 'rgba(226,232,240,0.5)'
          : 'rgba(71,85,105,0.35)',
    },
    deltaRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.xs,
    },
    deltaText: {
      fontSize: 12,
      color: theme.colors.textSecondary,
    },
    componentList: {
      borderRadius: theme.radius.xxl,
      paddingHorizontal: theme.spacing.lg,
      paddingVertical: theme.spacing.md,
      backgroundColor:
        theme.mode === 'dark'
          ? 'rgba(148,163,184,0.08)'
          : 'rgba(15,23,42,0.04)',
    },
    componentRow: {
      gap: theme.spacing.sm,
      paddingVertical: theme.spacing.md,
    },
    componentHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      gap: theme.spacing.md,
    },
    componentTitle: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.sm,
      flexShrink: 1,
    },
    componentLabel: {
      fontSize: 14,
      fontWeight: '600',
      color: theme.colors.textPrimary,
    },
    componentScore: {
      fontSize: 14,
      fontWeight: '600',
      color: theme.colors.textSecondary,
    },
    componentMeta: {
      fontSize: 12,
      color: theme.colors.textSecondary,
    },
    divider: {
      height: StyleSheet.hairlineWidth,
      backgroundColor: theme.colors.border,
    },
    analysisButton: {
      alignSelf: 'flex-start',
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.xs,
      paddingHorizontal: theme.spacing.lg,
      paddingVertical: theme.spacing.sm,
      borderRadius: theme.radius.full,
      backgroundColor:
        theme.mode === 'dark'
          ? 'rgba(148,163,184,0.12)'
          : 'rgba(15,23,42,0.08)',
    },
    analysisText: {
      fontSize: 12,
      fontWeight: '600',
      color: theme.colors.textSecondary,
    },
    changesCard: {
      borderRadius: theme.radius.xxl,
      padding: theme.spacing.lg,
      gap: theme.spacing.lg,
      backgroundColor:
        theme.mode === 'dark'
          ? 'rgba(148,163,184,0.08)'
          : 'rgba(15,23,42,0.04)',
    },
    changeHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.sm,
    },
    changeTitle: {
      fontSize: 13,
      fontWeight: '600',
      color: theme.colors.textPrimary,
    },
    bulletText: {
      fontSize: 12,
      color: theme.colors.textSecondary,
      lineHeight: 18,
      marginLeft: theme.spacing.md,
    },
    recommendationBlock: {
      borderTopWidth: StyleSheet.hairlineWidth,
      borderTopColor: theme.colors.border,
      paddingTop: theme.spacing.md,
      gap: theme.spacing.sm,
    },
    recommendationHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.sm,
    },
    recommendationTitle: {
      fontSize: 13,
      fontWeight: '600',
      color: theme.colors.textPrimary,
    },
    recommendationItem: {
      fontSize: 12,
      color: theme.colors.textSecondary,
      lineHeight: 18,
    },
    recommendationLink: {
      fontSize: 12,
      fontWeight: '600',
      color: theme.colors.textSecondary,
    },
    quickHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    quickTitle: {
      fontSize: 14,
      fontWeight: '600',
      color: theme.colors.textMuted,
    },
    quickAction: {
      fontSize: 12,
      fontWeight: '600',
      color: theme.colors.textSecondary,
    },
    quickList: {
      gap: theme.spacing.sm,
    },
    quickCard: {
      padding: theme.spacing.lg,
      borderRadius: theme.radius.xxl,
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.md,
    },
    quickIconWrapper: {
      width: 40,
      height: 40,
      borderRadius: theme.radius.full,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor:
        theme.mode === 'dark'
          ? 'rgba(148,163,184,0.18)'
          : 'rgba(15,23,42,0.08)',
    },
    quickContent: {
      flex: 1,
      gap: 4,
    },
    quickTitleText: {
      fontSize: 14,
      fontWeight: '600',
      color: theme.colors.textPrimary,
    },
    quickMetaText: {
      fontSize: 12,
      color: theme.colors.textSecondary,
    },
    quickCta: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.xs,
    },
    quickCtaText: {
      fontSize: 12,
      fontWeight: '600',
      color: theme.colors.textSecondary,
    },
  });

const InsightsIndexScreen: React.FC = () => {
  const theme = useAppTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);

  return (
    <ScrollView
      style={styles.root}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Personal performance index</Text>
        <View style={styles.surfaceCard}>
          <View style={styles.scoreRow}>
            <Text style={styles.scoreValue}>7.8</Text>
            <Text style={styles.scoreDenominator}>/ 10</Text>
          </View>
          <View style={styles.progressTrack}>
            <View style={[styles.progressFill, { width: '78%' }]} />
          </View>
          <View style={styles.deltaRow}>
            <TrendingUp size={14} color={theme.colors.textSecondary} />
            <Text style={styles.deltaText}>+0.5 compared to last month</Text>
          </View>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Index components</Text>
        <View style={styles.componentList}>
          {COMPONENTS.map((component, index) => {
            const Icon = component.icon;
            return (
              <View key={component.key}>
                {index > 0 ? <View style={styles.divider} /> : null}
                <View style={styles.componentRow}>
                  <View style={styles.componentHeader}>
                    <View style={styles.componentTitle}>
                      <Icon size={16} color={theme.colors.textSecondary} />
                      <Text style={styles.componentLabel}>{component.label}</Text>
                    </View>
                    <Text style={styles.componentScore}>
                      {component.score.toFixed(1)} / 10
                    </Text>
                  </View>
                  <View style={styles.progressTrack}>
                    <View
                      style={[styles.progressFill, { width: `${component.progress * 100}%` }]}
                    />
                  </View>
                  <Text style={styles.componentMeta}>
                    Strong sides: {component.strong}
                  </Text>
                  <Text style={styles.componentMeta}>
                    Growth zone: {component.growth}
                  </Text>
                </View>
              </View>
            );
          })}
        </View>
        <View style={styles.analysisButton}>
          <Lightbulb size={14} color={theme.colors.textSecondary} />
          <Text style={styles.analysisText}>Detailed analysis</Text>
          <ArrowRight size={14} color={theme.colors.textSecondary} />
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Key changes over the month</Text>
        <View style={styles.changesCard}>
          {CHANGE_GROUPS.map((group) => {
            const Icon = group.icon;
            return (
              <View key={group.key} style={{ gap: theme.spacing.xs }}>
                <View style={styles.changeHeader}>
                  <Icon size={16} color={theme.colors.textSecondary} />
                  <Text style={styles.changeTitle}>{group.title}</Text>
                </View>
                {group.bullets.map((item) => (
                  <Text key={item} style={styles.bulletText}>
                    • {item}
                  </Text>
                ))}
              </View>
            );
          })}

          <View style={styles.recommendationBlock}>
            <View style={styles.recommendationHeader}>
              <Lightbulb size={16} color={theme.colors.warning} />
              <Text style={styles.recommendationTitle}>AI recommendation</Text>
            </View>
            <Text style={styles.recommendationItem}>
              1. Move important tasks to the morning
            </Text>
            <Text style={styles.recommendationItem}>2. Set a limit on delivery</Text>
            <Text style={styles.recommendationItem}>
              3. Meditation after charging = 85% success
            </Text>
            <Text style={styles.recommendationLink}>Show all 7 recommendations</Text>
          </View>
        </View>
      </View>

      <View style={styles.section}>
        <View style={styles.quickHeader}>
          <Text style={styles.quickTitle}>Quick wins</Text>
          <Text style={styles.quickAction}>Refresh</Text>
        </View>
        <View style={styles.quickList}>
          {QUICK_WINS.map((item) => {
            const Icon = item.icon;
            return (
              <AdaptiveGlassView key={item.key} style={styles.quickCard}>
                <View style={styles.quickIconWrapper}>
                  <Icon size={18} color={theme.colors.textSecondary} />
                </View>
                <View style={styles.quickContent}>
                  <Text style={styles.quickTitleText}>{item.title}</Text>
                  <Text style={styles.quickMetaText}>{item.impact}</Text>
                  <Text style={styles.quickMetaText}>{item.meta}</Text>
                </View>
                <View style={styles.quickCta}>
                  <Text style={styles.quickCtaText}>Start now</Text>
                  <Play size={16} color={theme.colors.textSecondary} />
                </View>
              </AdaptiveGlassView>
            );
          })}
        </View>
      </View>
    </ScrollView>
  );
};

export default InsightsIndexScreen;
