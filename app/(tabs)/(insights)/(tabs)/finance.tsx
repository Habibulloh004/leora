import React, { useMemo } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import {
  AlertCircle,
  AlertTriangle,
  ArrowRight,
  Ban,
  CalendarRange,
  Check,
  ChefHat,
  Clock,
  Coffee,
  CreditCard,
  Play,
  PiggyBank,
  Route,
  Target,
  TrendingUp,
  UtensilsCrossed,
  Wallet,
  type LucideIcon,
} from 'lucide-react-native';

import { AdaptiveGlassView } from '@/components/ui/AdaptiveGlassView';
import type { Theme } from '@/constants/theme';
import { useAppTheme } from '@/constants/theme';

type Indicator = {
  key: string;
  label: string;
  metric: string;
  status: string;
  score: number;
  Icon: LucideIcon;
};

type WeeklyPattern = {
  key: string;
  label: string;
  percent: number;
  note: string;
};

type DayPartPattern = {
  key: string;
  label: string;
  range: string;
  percent: number;
  note: string;
};

type Anomaly = {
  key: string;
  title: string;
  summary: string;
  recommendation: string;
  meta: string;
};

type SavingEntry = {
  key: string;
  title: string;
  impact: string;
  detail: string;
  alternative: string;
  bullets: string[];
  actions: Array<{
    key: string;
    label: string;
    Icon: LucideIcon;
  }>;
};

const INDICATORS: Indicator[] = [
  {
    key: 'liquidity',
    label: 'Liquidity',
    metric: '3.5 month reserve',
    status: 'Excellent',
    score: 0.82,
    Icon: Wallet,
  },
  {
    key: 'savings',
    label: 'Savings level',
    metric: '3.5 month reserve',
    status: 'Okay',
    score: 0.64,
    Icon: PiggyBank,
  },
  {
    key: 'debt',
    label: 'Debt burden',
    metric: '3.5 month reserve',
    status: 'Low',
    score: 0.42,
    Icon: CreditCard,
  },
  {
    key: 'capital',
    label: 'Capital growth',
    metric: '3.5 month reserve',
    status: 'Okay',
    score: 0.66,
    Icon: TrendingUp,
  },
  {
    key: 'goals',
    label: 'Goals progress',
    metric: '3.5 month reserve',
    status: 'Excellent',
    score: 0.88,
    Icon: Target,
  },
];

const WEEKLY_SPENDING: WeeklyPattern[] = [
  { key: 'mon', label: 'Mon', percent: 0.12, note: 'Minimum Spending' },
  { key: 'tue', label: 'Tue', percent: 0.11, note: 'Stable' },
  { key: 'wed', label: 'Wed', percent: 0.15, note: 'Peak: Groceries' },
  { key: 'thu', label: 'Thu', percent: 0.1, note: 'Frugal Day' },
  { key: 'fri', label: 'Fri', percent: 0.22, note: 'Entertainment' },
  { key: 'sat', label: 'Sat', percent: 0.25, note: 'Weekly Maximum' },
  { key: 'sun', label: 'Sun', percent: 0.05, note: 'Rest Day' },
];

const DAY_PART_SPENDING: DayPartPattern[] = [
  { key: 'morning', label: 'Morning', range: '6-12', percent: 0.15, note: 'Transport, Coffee' },
  { key: 'day', label: 'Day', range: '12-18', percent: 0.35, note: 'Lunch, Shopping' },
  { key: 'evening', label: 'Evening', range: '18-22', percent: 0.4, note: 'Dinner, Entertainment' },
  { key: 'night', label: 'Night', range: '22-6', percent: 0.1, note: 'Spending – Impulsive' },
];

const ANOMALIES: Anomaly[] = [
  {
    key: 'food',
    title: 'Food spending +35% vs last month',
    summary: 'Recommendation: Return to home-cooked meals',
    recommendation: 'Potential savings: 2 hours',
    meta: 'Action Plan',
  },
  {
    key: 'night',
    title: 'Night purchases >200k (3 times)',
    summary: 'Pattern: After 22:00 on Fridays',
    recommendation: 'Recommendation: Set a night limit',
    meta: 'Set rule',
  },
];

const SAVINGS: SavingEntry[] = [
  {
    key: 'subscriptions',
    title: '1. Subscriptions',
    impact: '-180k/month',
    detail: '5 unused services',
    alternative: '',
    bullets: [
      'Netflix (inactive for 2 months)',
      'Spotify (duplicate of YouTube Music)',
      'Gym (visited 3 times/month)',
    ],
    actions: [
      { key: 'cancel', label: 'Cancel All', Icon: Ban },
      { key: 'select', label: 'Select', Icon: Check },
    ],
  },
  {
    key: 'food',
    title: '2. Food delivery',
    impact: '-350k/month',
    detail: 'Average: 12 orders/month',
    alternative: 'Alternative: Meal prep on Sundays',
    bullets: [],
    actions: [
      { key: 'meal', label: 'Meal Plan', Icon: UtensilsCrossed },
      { key: 'recipes', label: 'Recipes', Icon: ChefHat },
    ],
  },
  {
    key: 'transport',
    title: '3. Transport',
    impact: '-150k/month',
    detail: 'Frequent short taxi rides',
    alternative: 'Alternative: Bike / Metro',
    bullets: [],
    actions: [
      { key: 'routes', label: 'Routes', Icon: Route },
      { key: 'pass', label: 'Buy pass', Icon: CreditCard },
    ],
  },
  {
    key: 'coffee',
    title: '4. Coffee',
    impact: '-100k/month',
    detail: 'Daily takeaway coffee',
    alternative: 'Alternative: Home coffee machine',
    bullets: [],
    actions: [
      { key: 'recipes', label: 'Recipes', Icon: ChefHat },
      { key: 'equipment', label: 'Equipment', Icon: Coffee },
    ],
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
      fontSize: 16,
      fontWeight: '600',
      color: theme.colors.textPrimary,
    },
    divider: {
      height: StyleSheet.hairlineWidth,
      backgroundColor: theme.colors.border,
    },
    scoreRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    scoreLabel: {
      fontSize: 14,
      color: theme.colors.textSecondary,
    },
    scoreValue: {
      fontSize: 16,
      fontWeight: '700',
      color: theme.colors.textPrimary,
      letterSpacing: 0.2,
    },
    scoreBarTrack: {
      marginTop: theme.spacing.sm,
      height: 18,
      borderRadius: theme.radius.full,
      backgroundColor:
        theme.mode === 'dark'
          ? 'rgba(148,163,184,0.18)'
          : 'rgba(15,23,42,0.12)',
      overflow: 'hidden',
    },
    scoreBarFill: {
      height: '100%',
      borderRadius: theme.radius.full,
      backgroundColor: theme.colors.success,
    },
    indicatorBlock: {
      borderRadius: theme.radius.lg,
      backgroundColor:theme.colors.card,
      paddingHorizontal: theme.spacing.lg,
      paddingVertical: theme.spacing.sm,
    },
    indicatorRow: {
      flexDirection: 'row',
      gap: theme.spacing.md,
      paddingVertical: theme.spacing.md,
      borderTopWidth: StyleSheet.hairlineWidth,
      borderTopColor: theme.colors.border,
    },
    indicatorRowFirst: {
      borderTopWidth: 0,
    },
    indicatorIconWrapper: {
      width: 32,
      height: 32,
      borderRadius: theme.radius.full,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor:
        theme.mode === 'dark'
          ? 'rgba(148,163,184,0.08)'
          : 'rgba(15,23,42,0.08)',
    },
    indicatorContent: {
      flex: 1,
      gap: theme.spacing.xs,
    },
    indicatorHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.md,
    },
    indicatorTitle: {
      flexShrink: 0,
      fontSize: 14,
      fontWeight: '600',
      color: theme.colors.textPrimary,
    },
    indicatorBar: {
      flex: 1,
      height: 12,
      borderRadius: theme.radius.full,
      backgroundColor:
        theme.mode === 'dark'
          ? 'rgba(148,163,184,0.14)'
          : 'rgba(15,23,42,0.08)',
      overflow: 'hidden',
    },
    indicatorBarFill: {
      height: '100%',
      borderRadius: theme.radius.full,
      backgroundColor:
        theme.mode === 'dark'
          ? 'rgba(226,232,240,0.38)'
          : 'rgba(71,85,105,0.32)',
    },
    indicatorFooter: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    indicatorMetric: {
      fontSize: 12,
      color: theme.colors.textSecondary,
    },
    indicatorStatus: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.xs,
    },
    indicatorStatusText: {
      fontSize: 12,
      color: theme.colors.textSecondary,
    },
    alertBlock: {
      gap: theme.spacing.sm,
    },
    alertHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.sm,
    },
    alertTitle: {
      fontSize: 14,
      fontWeight: '600',
      color: theme.colors.warning,
    },
    bulletList: {
      gap: theme.spacing.xs,
      marginLeft: theme.spacing.xl,
    },
    bulletText: {
      fontSize: 12,
      color: theme.colors.textSecondary,
    },
    patternSection: {
      gap: theme.spacing.md,
    },
    patternCard: {
      borderRadius: theme.radius.lg,
      backgroundColor:theme.colors.card,
      paddingHorizontal: theme.spacing.lg,
      paddingVertical: theme.spacing.lg,
      gap: theme.spacing.md,
    },
    patternTitleRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.sm,
    },
    patternTitle: {
      fontSize: 14,
      fontWeight: '600',
      color: theme.colors.textPrimary,
    },
    patternRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.md,
    },
    patternLabel: {
      width: 42,
      fontSize: 12,
      color: theme.colors.textSecondary,
    },
    patternPill: {
      flex: 1,
      height: 12,
      borderRadius: theme.radius.full,
      backgroundColor:
        theme.mode === 'dark'
          ? 'rgba(148,163,184,0.12)'
          : 'rgba(15,23,42,0.08)',
      overflow: 'hidden',
    },
    patternPillFill: {
      height: '100%',
      borderRadius: theme.radius.full,
      backgroundColor:
        theme.mode === 'dark'
          ? 'rgba(226,232,240,0.36)'
          : 'rgba(71,85,105,0.3)',
    },
    patternPercent: {
      width: 48,
      fontSize: 12,
      color: theme.colors.textPrimary,
    },
    patternNote: {
      flex: 1,
      fontSize: 12,
      color: theme.colors.textSecondary,
    },
    anomaliesSection: {
      gap: theme.spacing.md,
    },
    anomaliesTitleRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.sm,
    },
    anomaliesTitle: {
      fontSize: 14,
      fontWeight: '600',
      color: theme.colors.textPrimary,
    },
    anomalyCard: {
      borderRadius: theme.radius.xxl,
      padding: theme.spacing.lg,
      gap: theme.spacing.sm,
    },
    anomalyHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    anomalyTitle: {
      flex: 1,
      fontSize: 14,
      fontWeight: '600',
      color: theme.colors.textPrimary,
    },
    anomalyTag: {
      fontSize: 12,
      color: theme.colors.textSecondary,
    },
    anomalyBody: {
      gap: theme.spacing.xs,
    },
    anomalyMeta: {
      fontSize: 12,
      color: theme.colors.textSecondary,
    },
    anomalyFooter: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    savingsHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    savingsSubtitle: {
      fontSize: 12,
      color: theme.colors.textSecondary,
    },
    savingsList: {
      gap: theme.spacing.xl,
    },
    savingsItem: {
      gap: theme.spacing.sm,
    },
    savingsTitleRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    savingsTitle: {
      fontSize: 14,
      fontWeight: '600',
      color: theme.colors.textPrimary,
    },
    savingsImpact: {
      fontSize: 12,
      color: theme.colors.textSecondary,
    },
    savingsDetail: {
      fontSize: 12,
      color: theme.colors.textSecondary,
    },
    savingsBullet: {
      fontSize: 12,
      color: theme.colors.textSecondary,
      marginLeft: theme.spacing.lg,
    },
    savingsActionRow: {
      flexDirection: 'row',
      gap: theme.spacing.md,
      flexWrap: 'wrap',
    },
    actionChip: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.xs,
      paddingVertical: 6,
      paddingHorizontal: theme.spacing.md,
      borderRadius: theme.radius.full,
      backgroundColor:
        theme.mode === 'dark'
          ? 'rgba(148,163,184,0.12)'
          : 'rgba(15,23,42,0.05)',
    },
    actionChipLabel: {
      fontSize: 12,
      color: theme.colors.textPrimary,
    },
    footerActions: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      gap: theme.spacing.md,
      marginTop: theme.spacing.lg,
    },
    footerButton: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.sm,
      paddingVertical: 10,
      paddingHorizontal: theme.spacing.lg,
      borderRadius: theme.radius.full,
      backgroundColor:
        theme.mode === 'dark'
          ? 'rgba(148,163,184,0.12)'
          : 'rgba(15,23,42,0.05)',
    },
    footerButtonLabel: {
      fontSize: 13,
      fontWeight: '500',
      color: theme.colors.textPrimary,
    },
  });

const FinanceTab: React.FC = () => {
  const theme = useAppTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);

  return (
    <ScrollView
      style={styles.root}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Financial health</Text>
        <View>
          <View style={styles.scoreRow}>
            <Text style={styles.scoreLabel}>Score</Text>
            <Text style={styles.scoreValue}>8.2 / 10</Text>
          </View>
          <View style={styles.scoreBarTrack}>
            <View style={[styles.scoreBarFill, { width: '82%' }]} />
          </View>
        </View>
      </View>

      <View style={styles.divider} />

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Health indicators</Text>
        <View style={styles.indicatorBlock}>
          {INDICATORS.map((item, index) => {
            const Icon = item.Icon;
            return (
              <View
                key={item.key}
                style={[
                  styles.indicatorRow,
                  index === 0 && styles.indicatorRowFirst,
                ]}
              >
                <View style={styles.indicatorIconWrapper}>
                  <Icon size={18} color={theme.colors.textSecondary} />
                </View>
                <View style={styles.indicatorContent}>
                  <View style={styles.indicatorHeader}>
                    <Text style={styles.indicatorTitle}>{item.label}</Text>
                    <View style={styles.indicatorBar}>
                      <View
                        style={[
                          styles.indicatorBarFill,
                          { width: `${Math.round(item.score * 100)}%` },
                        ]}
                      />
                    </View>
                  </View>
                  <View style={styles.indicatorFooter}>
                    <Text style={styles.indicatorMetric}>{item.metric}</Text>
                    <View style={styles.indicatorStatus}>
                      <Text style={styles.indicatorStatusText}>{item.status}</Text>
                      <Check size={14} color={theme.colors.success} />
                    </View>
                  </View>
                </View>
              </View>
            );
          })}
        </View>

        <View style={styles.alertBlock}>
          <View style={styles.alertHeader}>
            <AlertTriangle size={18} color={theme.colors.warning} />
            <Text style={styles.alertTitle}>Work-life balance</Text>
          </View>
          <View style={styles.bulletList}>
            {[
              'Investments: only 2% of income',
              'Subscriptions: 5 unused',
              'Impulsive purchases: +40%',
            ].map((item) => (
              <Text key={item} style={styles.bulletText}>
                • {item}
              </Text>
            ))}
          </View>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Patterns and anomalies</Text>

        <View style={styles.patternSection}>
          <View style={styles.patternCard}>
            <View style={styles.patternTitleRow}>
              <CalendarRange size={18} color={theme.colors.textSecondary} />
              <Text style={styles.patternTitle}>Weekly pattern</Text>
            </View>
            {WEEKLY_SPENDING.map((entry) => (
              <View key={entry.key} style={styles.patternRow}>
                <Text style={styles.patternLabel}>{entry.label}</Text>
                <View style={styles.patternPill}>
                  <View
                    style={[
                      styles.patternPillFill,
                      { width: `${Math.round(entry.percent * 100)}%` },
                    ]}
                  />
                </View>
                <Text style={styles.patternPercent}>
                  {Math.round(entry.percent * 100)}%
                </Text>
                <Text style={styles.patternNote}>{entry.note}</Text>
              </View>
            ))}
          </View>

          <View style={styles.patternCard}>
            <View style={styles.patternTitleRow}>
              <Clock size={18} color={theme.colors.textSecondary} />
              <Text style={styles.patternTitle}>Daily pattern</Text>
            </View>
            {DAY_PART_SPENDING.map((entry) => (
              <View key={entry.key} style={styles.patternRow}>
                <Text style={styles.patternLabel}>
                  {entry.label}{' '}
                  <Text style={styles.patternNote}>({entry.range})</Text>
                </Text>
                <View style={styles.patternPill}>
                  <View
                    style={[
                      styles.patternPillFill,
                      { width: `${Math.round(entry.percent * 100)}%` },
                    ]}
                  />
                </View>
                <Text style={styles.patternPercent}>
                  {Math.round(entry.percent * 100)}%
                </Text>
                <Text style={styles.patternNote}>{entry.note}</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.anomaliesSection}>
          <View style={styles.anomaliesTitleRow}>
            <AlertCircle size={18} color={theme.colors.textSecondary} />
            <Text style={styles.anomaliesTitle}>Anomalies detected</Text>
          </View>
          {ANOMALIES.map((anomaly) => (
            <AdaptiveGlassView key={anomaly.key} style={styles.anomalyCard}>
              <View style={styles.anomalyHeader}>
                <Text style={styles.anomalyTitle}>{anomaly.title}</Text>
                <Text style={styles.anomalyTag}>{anomaly.meta}</Text>
              </View>
              <View style={styles.anomalyBody}>
                <Text style={styles.anomalyMeta}>{anomaly.summary}</Text>
                <Text style={styles.anomalyMeta}>{anomaly.recommendation}</Text>
              </View>
              <View style={styles.anomalyFooter}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: theme.spacing.sm }}>
                  <AlertCircle size={18} color={theme.colors.textSecondary} />
                  <Text style={styles.anomalyMeta}>Review insights</Text>
                </View>
                <Play size={18} color={theme.colors.textSecondary} />
              </View>
            </AdaptiveGlassView>
          ))}
        </View>
      </View>

      <View style={styles.section}>
        <View style={styles.savingsHeader}>
          <Text style={styles.sectionTitle}>Saving potentials</Text>
          <Text style={styles.savingsSubtitle}>Potential: 780k</Text>
        </View>

        <View style={styles.savingsList}>
          {SAVINGS.map((entry) => (
            <View key={entry.key} style={styles.savingsItem}>
              <View style={styles.savingsTitleRow}>
                <Text style={styles.savingsTitle}>{entry.title}</Text>
                <Text style={styles.savingsImpact}>{entry.impact}</Text>
              </View>
              <Text style={styles.savingsDetail}>{entry.detail}</Text>
              {entry.alternative ? (
                <Text style={styles.savingsDetail}>{entry.alternative}</Text>
              ) : null}
              {entry.bullets.map((bullet) => (
                <Text key={bullet} style={styles.savingsBullet}>
                  • {bullet}
                </Text>
              ))}
              <View style={styles.savingsActionRow}>
                {entry.actions.map((action) => {
                  const Icon = action.Icon;
                  return (
                    <View key={action.key} style={styles.actionChip}>
                      <Icon size={16} color={theme.colors.textSecondary} />
                      <Text style={styles.actionChipLabel}>{action.label}</Text>
                      <ArrowRight size={14} color={theme.colors.textSecondary} />
                    </View>
                  );
                })}
              </View>
            </View>
          ))}
        </View>

        <View style={styles.footerActions}>
          <View style={styles.footerButton}>
            <Check size={16} color={theme.colors.textSecondary} />
            <Text style={styles.footerButtonLabel}>Apply all</Text>
            <ArrowRight size={16} color={theme.colors.textSecondary} />
          </View>
          <View style={styles.footerButton}>
            <UtensilsCrossed size={16} color={theme.colors.textSecondary} />
            <Text style={styles.footerButtonLabel}>Adjust plan</Text>
            <ArrowRight size={16} color={theme.colors.textSecondary} />
          </View>
        </View>
      </View>
    </ScrollView>
  );
};

export default FinanceTab;
