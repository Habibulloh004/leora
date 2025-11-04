import React, { useMemo } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import {
  AlertTriangle,
  ArrowRight,
  Briefcase,
  Clock,
  Coffee,
  HeartPulse,
  Layers,
  Sun,
  type LucideIcon,
} from 'lucide-react-native';

import { AdaptiveGlassView } from '@/components/ui/AdaptiveGlassView';
import type { Theme } from '@/constants/theme';
import { useAppTheme } from '@/constants/theme';

type TimeDistribution = {
  key: string;
  label: string;
  hours: number;
  percent: number;
  progress: number;
};

type ProductivityPeak = {
  key: string;
  label: string;
  range: string;
  efficiency: number;
  note: string;
};

type FocusMetric = {
  key: string;
  label: string;
  value: string;
};

type TaskStat = {
  key: string;
  label: string;
  completed: number;
  duration: string;
};

type ContextStat = {
  key: string;
  context: string;
  completion: number;
};

type Recommendation = {
  key: string;
  text: string;
};

const TIME_DISTRIBUTION: TimeDistribution[] = [
  { key: 'work', label: 'Work', hours: 25, percent: 27, progress: 0.75 },
  { key: 'sleep', label: 'Sleep', hours: 49, percent: 29, progress: 0.9 },
  { key: 'personal', label: 'Personal', hours: 35, percent: 21, progress: 0.68 },
  { key: 'transport', label: 'Transport', hours: 10, percent: 6, progress: 0.32 },
  { key: 'house', label: 'Household', hours: 12, percent: 7, progress: 0.38 },
  { key: 'dev', label: 'Development', hours: 8, percent: 5, progress: 0.28 },
  { key: 'rest', label: 'Rest', hours: 9, percent: 5, progress: 0.3 },
];

const PRODUCTIVITY_PEAKS: ProductivityPeak[] = [
  { key: 'peak1', label: 'Peak 1', range: '10:00-12:00', efficiency: 85, note: 'Highly efficient' },
  { key: 'peak2', label: 'Peak 2', range: '15:00-17:00', efficiency: 72, note: 'Good for collaboration' },
  { key: 'low', label: 'Low', range: '13:00-14:00', efficiency: 58, note: 'Recovery after break' },
];

const FOCUS_METRICS: FocusMetric[] = [
  { key: 'avg', label: 'Average focus time', value: '45 minutes' },
  { key: 'best', label: 'Best day', value: 'Tuesday (3.5 hours)' },
  { key: 'worst', label: 'Worst day', value: 'Monday (1 hour)' },
  { key: 'interrupt', label: 'Interruptions', value: '12/day on average' },
];

const TASK_STATS: TaskStat[] = [
  { key: 'creative', label: 'Creative', completed: 65, duration: '2.5h' },
  { key: 'routine', label: 'Routine', completed: 95, duration: '15m' },
  { key: 'communication', label: 'Communication', completed: 88, duration: '30m' },
  { key: 'planning', label: 'Planning', completed: 55, duration: '1h' },
];

const TASK_CONTEXTS: ContextStat[] = [
  { key: 'work', context: '@work', completion: 92 },
  { key: 'home', context: '@home', completion: 78 },
  { key: 'outside', context: '@outside', completion: 54 },
];

const RECOMMENDATIONS: Recommendation[] = [
  { key: 'block', text: 'Block 10:00-12:00 for important tasks' },
  { key: 'routine', text: 'Schedule routine work at 13:00-14:00' },
  { key: 'notifications', text: 'Turn off notifications during focus time' },
  { key: 'meetings', text: 'Limit meetings to 2 per afternoon block' },
];

const PROCRASTINATION_PATTERNS: Recommendation[] = [
  { key: 'deadlines', text: 'Tasks without deadlines: 45% completion' },
  { key: 'large', text: 'Large tasks (>2h): postponed 3+ times' },
  { key: 'friday', text: 'Friday tasks: 50% rescheduled' },
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
      paddingBottom: theme.spacing.xxxl + 32,
      gap: theme.spacing.xxl,
    },
    section: {
      gap: theme.spacing.md,
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: '600',
      color: theme.colors.textPrimary,
    },
    subtitle: {
      fontSize: 13,
      color: theme.colors.textSecondary,
    },
    divider: {
      height: StyleSheet.hairlineWidth,
      backgroundColor: theme.colors.border,
    },
    timeRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.sm,
      paddingVertical: 8,
    },
    timeLabel: {
      width: 90,
      fontSize: 14,
      color: theme.colors.textPrimary,
    },
    progressTrack: {
      flex: 1,
      height: 14,
      borderRadius: theme.radius.full,
      backgroundColor:
        theme.mode === 'dark'
          ? 'rgba(148,163,184,0.12)'
          : 'rgba(15,23,42,0.08)',
      overflow: 'hidden',
    },
    progressFill: {
      height: '100%',
      borderRadius: theme.radius.full,
      backgroundColor:
        theme.mode === 'dark'
          ? 'rgba(226,232,240,0.4)'
          : 'rgba(71,85,105,0.3)',
    },
    timeMeta: {
      width: 90,
      fontSize: 12,
      color: theme.colors.textSecondary,
      textAlign: 'right',
    },
    timePercent: {
      width: 52,
      fontSize: 12,
      color: theme.colors.textSecondary,
      textAlign: 'right',
    },
    peaksCard: {
      borderRadius: theme.radius.xxl,
      padding: theme.spacing.lg,
      gap: theme.spacing.sm,
      backgroundColor:theme.colors.card,
    },
    peakRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    peakLabel: {
      fontSize: 13,
      color: theme.colors.textPrimary,
    },
    peakNote: {
      fontSize: 12,
      color: theme.colors.textSecondary,
      flex: 1,
      marginLeft: theme.spacing.md,
    },
    efficiency: {
      fontSize: 12,
      color: theme.colors.textSecondary,
      width: 110,
      textAlign: 'right',
    },
    focusCard: {
      borderRadius: theme.radius.xxl,
      padding: theme.spacing.lg,
      gap: theme.spacing.sm,
      backgroundColor:theme.colors.card,
    },
    focusRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    focusLabel: {
      fontSize: 12,
      color: theme.colors.textSecondary,
    },
    focusValue: {
      fontSize: 13,
      color: theme.colors.textPrimary,
    },
    statsCard: {
      borderRadius: theme.radius.xxl,
      padding: theme.spacing.lg,
      gap: theme.spacing.md,
      backgroundColor:theme.colors.card,
    },
    statsHeader: {
      fontSize: 13,
      fontWeight: '600',
      color: theme.colors.textPrimary,
    },
    statRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      gap: theme.spacing.md,
    },
    statLabel: {
      width: 110,
      fontSize: 12,
      color: theme.colors.textSecondary,
    },
    statValue: {
      fontSize: 12,
      color: theme.colors.textPrimary,
      width: 80,
      textAlign: 'right',
    },
    contextRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.sm,
      paddingVertical: 6,
    },
    contextLabel: {
      width: 70,
      fontSize: 12,
      color: theme.colors.textSecondary,
    },
    recommendationList: {
      gap: 6,
    },
    recommendationText: {
      fontSize: 12,
      color: theme.colors.textSecondary,
    },
    footerButton: {
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
    footerText: {
      fontSize: 12,
      fontWeight: '600',
      color: theme.colors.textSecondary,
    },
  });

const ProductivityTab: React.FC = () => {
  const theme = useAppTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);

  return (
    <ScrollView
      style={styles.root}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Productivity analyst</Text>
        <View style={styles.divider} />

        <View>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: theme.spacing.sm, marginBottom: theme.spacing.sm }}>
            <Layers size={16} color={theme.colors.textSecondary} />
            <Text style={styles.subtitle}>Distribution of time (168 hours/week)</Text>
          </View>
          {TIME_DISTRIBUTION.map((item) => (
            <View key={item.key} style={styles.timeRow}>
              <Text style={styles.timeLabel}>{item.label}</Text>
              <View style={styles.progressTrack}>
                <View style={[styles.progressFill, { width: `${item.progress * 100}%` }]} />
              </View>
              <Text style={styles.timeMeta}>{item.hours}h</Text>
              <Text style={styles.timePercent}>({item.percent}%)</Text>
            </View>
          ))}
        </View>

        <View>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: theme.spacing.sm, marginTop: theme.spacing.lg, marginBottom: theme.spacing.sm }}>
            <Clock size={16} color={theme.colors.textSecondary} />
            <Text style={styles.subtitle}>Peak productivity</Text>
          </View>
          <View style={styles.peaksCard}>
            <Text style={styles.subtitle}>Productivity chart by hours</Text>
            {PRODUCTIVITY_PEAKS.map((peak) => (
              <View key={peak.key} style={styles.peakRow}>
                <Text style={styles.peakLabel}>{peak.label}:</Text>
                <Text style={styles.peakNote}>{peak.range}</Text>
                <Text style={styles.efficiency}>{peak.efficiency}% efficiency</Text>
              </View>
            ))}
          </View>
        </View>

        <View>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: theme.spacing.sm, marginTop: theme.spacing.lg, marginBottom: theme.spacing.sm }}>
            <HeartPulse size={16} color={theme.colors.textSecondary} />
            <Text style={styles.subtitle}>Focus metrics</Text>
          </View>
          <View style={styles.focusCard}>
            {FOCUS_METRICS.map((metric) => (
              <View key={metric.key} style={styles.focusRow}>
                <Text style={styles.focusLabel}>{metric.label}</Text>
                <Text style={styles.focusValue}>{metric.value}</Text>
              </View>
            ))}
          </View>
        </View>

        <View>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: theme.spacing.sm, marginTop: theme.spacing.lg, marginBottom: theme.spacing.sm }}>
            <Sun size={16} color={theme.colors.textSecondary} />
            <Text style={styles.subtitle}>Recommendation</Text>
          </View>
          <View style={styles.recommendationList}>
            {RECOMMENDATIONS.map((item) => (
              <Text key={item.key} style={styles.recommendationText}>
                • {item.text}
              </Text>
            ))}
          </View>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Task performance analysis</Text>
        <View style={styles.divider} />

        <AdaptiveGlassView style={styles.statsCard}>
          <Text style={styles.statsHeader}>Statistics</Text>
          <View style={styles.statRow}>
            <Text style={styles.statLabel}>Completed:</Text>
            <Text style={styles.statValue}>85% (102/120 tasks)</Text>
          </View>
          <View style={styles.statRow}>
            <Text style={styles.statLabel}>On time:</Text>
            <Text style={styles.statValue}>73%</Text>
          </View>
          <View style={styles.statRow}>
            <Text style={styles.statLabel}>Postponed:</Text>
            <Text style={styles.statValue}>18 tasks</Text>
          </View>
          <View style={styles.statRow}>
            <Text style={styles.statLabel}>Deleted:</Text>
            <Text style={styles.statValue}>5 tasks</Text>
          </View>
        </AdaptiveGlassView>

        <View style={styles.statsCard}>
          <Text style={styles.statsHeader}>By task type</Text>
          {TASK_STATS.map((task) => (
            <View key={task.key} style={{ gap: theme.spacing.xs }}>
              <View style={styles.statRow}>
                <Text style={styles.statLabel}>{task.label}:</Text>
                <Text style={styles.statValue}>{task.duration}</Text>
              </View>
              <View style={styles.progressTrack}>
                <View style={[styles.progressFill, { width: `${task.completed}%` }]} />
              </View>
            </View>
          ))}
        </View>

        <View style={styles.statsCard}>
          <Text style={styles.statsHeader}>By context</Text>
          {TASK_CONTEXTS.map((context) => (
            <View key={context.key} style={styles.contextRow}>
              <Text style={styles.contextLabel}>{context.context}:</Text>
              <View style={styles.progressTrack}>
                <View style={[styles.progressFill, { width: `${context.completion}%` }]} />
              </View>
              <Text style={styles.timePercent}>{context.completion}%</Text>
            </View>
          ))}
        </View>

        <View style={styles.statsCard}>
          <Text style={styles.statsHeader}>Procrastination patterns</Text>
          {PROCRASTINATION_PATTERNS.map((item) => (
            <Text key={item.key} style={styles.recommendationText}>
              • {item.text}
            </Text>
          ))}
        </View>

        <View style={styles.footerButton}>
          <Briefcase size={14} color={theme.colors.textSecondary} />
          <Text style={styles.footerText}>Optimize schedule</Text>
          <ArrowRight size={14} color={theme.colors.textSecondary} />
        </View>
      </View>
    </ScrollView>
  );
};

export default ProductivityTab;
