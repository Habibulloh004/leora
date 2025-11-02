// app/(tabs)/(finance)/(tabs)/analytics.tsx
import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import {
  CalendarRange,
  ChevronDown,
  ArrowRight,
  TrendingUp,
  TrendingDown,
  Lightbulb,
} from 'lucide-react-native';

import { useAppTheme } from '@/constants/theme';
import { AdaptiveGlassView } from '@/components/ui/AdaptiveGlassView';

// -------------------------
// Mock data (rasmdagi qiymatlar)
// -------------------------
const STATS = {
  peak: { label: 'PEAK', value: '340k', extra: '(6 jan)' },
  average: { label: 'AVERAGE', value: '145k', extra: '(day)' },
  trend: { label: 'TREND', value: '+12%' },
};

const COMPARISON = {
  period: { from: 'December', to: 'January' },
  rows: [
    { id: 'inc', label: 'Income:', from: '10.8M', to: '12.5M', delta: '+15%', direction: 'up' as const },
    { id: 'out', label: 'Outcome:', from: '9.5M', to: '8.7M', delta: '-8%', direction: 'down' as const },
    { id: 'sav', label: 'Savings:', from: '1.3M', to: '3.8M', delta: '+192%', direction: 'up' as const },
  ],
};

const TOP_EXPENSES = [
  { id: '1', name: 'Food', amount: '3.2M', share: '37%' },
  { id: '2', name: 'Transport', amount: '2.2M', share: '25%' },
  { id: '3', name: 'Living', amount: '1.7M', share: '20%' },
  { id: '4', name: 'Shopping', amount: '1.3M', share: '25%' },
  { id: '5', name: 'Entertainment', amount: '0.3M', share: '3%' },
];

const INSIGHTS = [
  {
    id: 'i1',
    title: 'Spends on food increased',
    detail: 'Suggestion: Cook more at home',
  },
  {
    id: 'i2',
    title: 'Transport spends decreased',
    detail: 'Suggestion: Keep using bicycle',
  },
  {
    id: 'i3',
    title: 'Optimal shopping day: Wednesday',
    detail: 'Prices less 8–12%',
  },
];

export default function AnalyticsTab() {
  const theme = useAppTheme();

  return (
    <ScrollView
      style={[styles.scroll, { backgroundColor: theme.colors.background }]}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <View style={styles.headerRow}>
        <Text style={[styles.headerTitle, { color: theme.colors.textSecondary }]}>
          Financial analytics
        </Text>

        <View style={[
          styles.monthPill,
          { backgroundColor: theme.colors.card, borderColor: theme.colors.border }
        ]}>
          <Text style={[styles.monthText, { color: theme.colors.textSecondary }]}>January</Text>
          <ChevronDown size={14} color={theme.colors.textSecondary} />
          <CalendarRange size={16} color={theme.colors.textSecondary} />
        </View>
      </View>

      {/* Expense dynamics */}
      <AdaptiveGlassView style={[styles.glassCard, { backgroundColor: theme.colors.card }]}>
        <Text style={[styles.sectionTitle, { color: theme.colors.textSecondary }]}>
          Expense dynamics
        </Text>

        <View style={styles.statsRow}>
          {/* Peak */}
          <View style={styles.statsCol}>
            <Text style={[styles.metaLabel, { color: theme.colors.textSecondary }]}>{STATS.peak.label}:</Text>
            <Text style={[styles.metaValue, { color: theme.colors.textPrimary }]}>{STATS.peak.value}</Text>
            <Text style={[styles.metaSub, { color: theme.colors.textMuted }]}>{STATS.peak.extra}</Text>
          </View>

          {/* Average */}
          <View style={styles.statsCol}>
            <Text style={[styles.metaLabel, { color: theme.colors.textSecondary }]}>{STATS.average.label}:</Text>
            <Text style={[styles.metaValue, { color: theme.colors.textPrimary }]}>{STATS.average.value}</Text>
            <Text style={[styles.metaSub, { color: theme.colors.textMuted }]}>{STATS.average.extra}</Text>
          </View>

          {/* Trend */}
          <View style={styles.statsCol}>
            <Text style={[styles.metaLabel, { color: theme.colors.textSecondary }]}>{STATS.trend.label}:</Text>
            <View style={styles.trendChip}>
              <TrendingUp size={14} color={theme.colors.success} />
              <Text style={[styles.trendText, { color: theme.colors.success }]}>{STATS.trend.value}</Text>
            </View>
          </View>
        </View>
      </AdaptiveGlassView>

      {/* Comparison with the previous month */}
      <AdaptiveGlassView style={[styles.glassCard, { backgroundColor: theme.colors.card }]}>
        <Text style={[styles.sectionTitle, { color: theme.colors.textSecondary }]}>
          Comparison with the previous month
        </Text>

        <View style={styles.periodRow}>
          <Text style={[styles.periodText, { color: theme.colors.textSecondary }]}>{COMPARISON.period.from}</Text>
          <ArrowRight size={14} color={theme.colors.textSecondary} />
          <Text style={[styles.periodText, { color: theme.colors.textSecondary }]}>{COMPARISON.period.to}</Text>
        </View>

        <View>
          {COMPARISON.rows.map((row, idx) => {
            const isUp = row.direction === 'up';
            return (
              <View key={row.id} style={styles.compRow}>
                <Text style={[styles.compLabel, { color: theme.colors.textSecondary }]}>
                  {row.label}
                </Text>

                <View style={styles.compMid}>
                  <Text style={[styles.compValue, { color: theme.colors.textPrimary }]}>{row.from}</Text>
                  <ArrowRight size={14} color={theme.colors.textMuted} />
                  <Text style={[styles.compValue, { color: theme.colors.textPrimary }]}>{row.to}</Text>
                </View>

                <View
                  style={[
                    styles.deltaPill,
                    {
                      backgroundColor:
                        isUp
                          ? (theme.mode === 'dark' ? 'rgba(16,185,129,0.18)' : 'rgba(16,185,129,0.12)')
                          : (theme.mode === 'dark' ? 'rgba(239,68,68,0.18)' : 'rgba(239,68,68,0.12)'),
                      borderColor: theme.colors.border,
                    },
                  ]}
                >
                  {isUp ? (
                    <TrendingUp size={12} color={theme.colors.success} />
                  ) : (
                    <TrendingDown size={12} color={theme.colors.danger} />
                  )}
                  <Text
                    style={[
                      styles.deltaText,
                      { color: isUp ? theme.colors.success : theme.colors.danger },
                    ]}
                  >
                    {row.delta}
                  </Text>
                </View>
              </View>
            );
          })}

          {/* Divider lines like in the mock */}
          <View style={[styles.divider, { backgroundColor: theme.colors.border }]} />
        </View>
      </AdaptiveGlassView>

      {/* Top 5 categories of expenses */}
      <AdaptiveGlassView style={[styles.glassCard, { backgroundColor: theme.colors.card }]}>
        <Text style={[styles.sectionTitle, { color: theme.colors.textSecondary }]}>
          Top 5 categories of expenses
        </Text>

        <View style={styles.categoryList}>
          {TOP_EXPENSES.map((item, index) => (
            <View key={item.id} style={styles.categoryRow}>
              <View style={styles.categoryLeft}>
                <Text style={[styles.categoryIndex, { color: theme.colors.textSecondary }]}>
                  {index + 1}.
                </Text>
                <Text style={[styles.categoryName, { color: theme.colors.textPrimary }]}>
                  {item.name}
                </Text>
              </View>

              <Text style={[styles.categoryRight, { color: theme.colors.textSecondary }]}>
                {item.amount}{' '}
                <Text style={{ color: theme.colors.textMuted }}>({item.share})</Text>
              </Text>
            </View>
          ))}
        </View>
      </AdaptiveGlassView>

      {/* AI Insights */}
      <Text style={[styles.sectionHeaderStandalone, { color: theme.colors.textSecondary }]}>
        AI Insights
      </Text>

      {INSIGHTS.map((insight) => (
        <AdaptiveGlassView
          key={insight.id}
          style={[
            styles.insightCard,
            {
              backgroundColor: theme.colors.card,
              borderColor: theme.colors.border,
            },
          ]}
        >
          <View style={[styles.bulbCircle, { backgroundColor: theme.colors.icon }]}>
            <Lightbulb size={18} color={theme.colors.iconText} />
          </View>

          <View style={styles.insightCopy}>
            <Text style={[styles.insightTitle, { color: theme.colors.textPrimary }]}>
              {insight.title}
            </Text>
            <Text style={[styles.insightDetail, { color: theme.colors.textSecondary }]}>
              {insight.detail}
            </Text>
          </View>
        </AdaptiveGlassView>
      ))}

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

// -------------------------
// Styles
// -------------------------
const styles = StyleSheet.create({
  scroll: { flex: 1 },
  content: {
    paddingHorizontal: 16,
    paddingBottom: 100,
    gap: 14,
  },

  // Header
  headerRow: {
    paddingTop: 16,
    paddingBottom: 6,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '300',
    letterSpacing: -0.5,
  },
  monthPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
    borderWidth: 1,
  },
  monthText: {
    fontSize: 12,
    fontWeight: '500',
  },

  // Generic glass section
  glassCard: {
    borderRadius: 24,
    padding: 16,
    gap: 16,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1,
    textTransform: 'uppercase',
    opacity: 0.8,
  },

  // Expense dynamics
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  statsCol: {
    flex: 1,
    gap: 6,
  },
  metaLabel: {
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.4,
    opacity: 0.9,
  },
  metaValue: {
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: -0.2,
  },
  metaSub: {
    fontSize: 12,
    fontWeight: '500',
  },
  trendChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 2,
  },
  trendText: {
    fontSize: 14,
    fontWeight: '700',
  },

  // Comparison
  periodRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  periodText: {
    fontSize: 12,
    fontWeight: '600',
  },
  compRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    gap: 10,
  },
  compLabel: {
    width: 82,
    fontSize: 14,
    fontWeight: '500',
  },
  compMid: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  compValue: {
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: -0.2,
  },
  deltaPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
  },
  deltaText: {
    fontSize: 12,
    fontWeight: '700',
  },
  divider: {
    height: 1,
    marginTop: 8,
  },

  // Categories
  categoryList: { gap: 4 },
  categoryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  categoryLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  categoryIndex: {
    width: 18,
    textAlign: 'right',
    fontSize: 14,
    fontWeight: '600',
    opacity: 0.8,
  },
  categoryName: {
    fontSize: 14,
    fontWeight: '500',
  },
  categoryRight: {
    fontSize: 13,
    fontWeight: '500',
  },

  // AI insights
  sectionHeaderStandalone: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginTop: 6,
    opacity: 0.8,
  },
  insightCard: {
    borderRadius: 20,
    padding: 14,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  bulbCircle: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  insightCopy: {
    flex: 1,
    gap: 4,
  },
  insightTitle: {
    fontSize: 14,
    fontWeight: '600',
  },
  insightDetail: {
    fontSize: 12,
    fontWeight: '500',
    opacity: 0.9,
  },
});
