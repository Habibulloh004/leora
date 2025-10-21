// app/(tabs)/(finance)/(tabs)/analytics.tsx
import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import {
  CalendarRange,
  Clock3,
  LineChart,
  PiggyBank,
  Sparkles,
  TrendingDown,
  TrendingUp,
} from 'lucide-react-native';

import { Colors } from '@/constants/theme';

type IconComponent = typeof LineChart;

interface KpiCard {
  id: string;
  label: string;
  value: string;
  deltaLabel: string;
  trend: 'up' | 'down';
  tone: string;
  icon: IconComponent;
}

interface PerformancePoint {
  id: string;
  label: string;
  income: number;
  expense: number;
}

interface Insight {
  id: string;
  title: string;
  detail: string;
  tone: string;
}

const KPI_CARDS: KpiCard[] = [
  {
    id: 'net-worth',
    label: 'Net worth',
    value: '$178,450',
    deltaLabel: '+12.4%',
    trend: 'up',
    tone: Colors.success,
    icon: LineChart,
  },
  {
    id: 'savings-rate',
    label: 'Savings rate',
    value: '38%',
    deltaLabel: '+4.1%',
    trend: 'up',
    tone: Colors.info,
    icon: PiggyBank,
  },
  {
    id: 'runway',
    label: 'Runway',
    value: '9.4 months',
    deltaLabel: '-0.3 mo',
    trend: 'down',
    tone: Colors.warning,
    icon: Clock3,
  },
];

const PERFORMANCE_TREND: PerformancePoint[] = [
  { id: 'sep', label: 'Sep', income: 5.4, expense: 3.8 },
  { id: 'oct', label: 'Oct', income: 5.1, expense: 3.6 },
  { id: 'nov', label: 'Nov', income: 5.9, expense: 4.1 },
  { id: 'dec', label: 'Dec', income: 6.2, expense: 4.4 },
  { id: 'jan', label: 'Jan', income: 6.4, expense: 4.7 },
];

const INSIGHTS: Insight[] = [
  {
    id: 'insight-1',
    title: 'Recurring costs cooled',
    detail: 'Subscriptions down 8% after pruning unused services.',
    tone: Colors.success,
  },
  {
    id: 'insight-2',
    title: 'Dining trending hot',
    detail: 'Restaurant spend is 12% above the monthly cap.',
    tone: Colors.danger,
  },
  {
    id: 'insight-3',
    title: 'Automation boost',
    detail: 'An extra $450 redirected into the USD wallet last week.',
    tone: Colors.info,
  },
];

const FORECAST = {
  horizon: 'Next 90 days',
  projection: 12400,
  confidence: 82,
  guidance: 'Keep variable spend under $4.2k to hit the target.',
};

const formatCurrency = (value: number) =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: value % 1 === 0 ? 0 : 2,
  }).format(value);

export default function AnalyticsTab() {
  const trendPeak = Math.max(
    ...PERFORMANCE_TREND.flatMap((point) => [point.income, point.expense]),
  );

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.sectionCard}>
        <View style={styles.sectionHeader}>
          <View style={styles.sectionTitleRow}>
            <LineChart size={18} color={Colors.textSecondary} />
            <Text style={styles.sectionTitle}>Portfolio snapshot</Text>
          </View>
          <View style={styles.pill}>
            <CalendarRange size={14} color={Colors.textSecondary} />
            <Text style={styles.pillText}>Jan 2025</Text>
          </View>
        </View>

        <View style={styles.kpiGrid}>
          {KPI_CARDS.map((card) => {
            const Icon = card.icon;
            const trendUp = card.trend === 'up';

            return (
              <View key={card.id} style={styles.kpiCard}>
                <View style={[styles.kpiIconBadge, { backgroundColor: card.tone + '1A' }]}>
                  <Icon size={18} color={card.tone} />
                </View>
                <Text style={styles.kpiLabel}>{card.label}</Text>
                <Text style={styles.kpiValue}>{card.value}</Text>
                <View style={styles.kpiDeltaRow}>
                  {trendUp ? (
                    <TrendingUp size={14} color={Colors.success} />
                  ) : (
                    <TrendingDown size={14} color={Colors.danger} />
                  )}
                  <Text
                    style={[
                      styles.kpiDelta,
                      trendUp ? styles.positiveText : styles.negativeText,
                    ]}
                  >
                    {card.deltaLabel}
                  </Text>
                </View>
              </View>
            );
          })}
        </View>
      </View>

      <View style={styles.sectionCard}>
        <View style={styles.sectionHeader}>
          <View style={styles.sectionTitleRow}>
            <TrendingUp size={18} color={Colors.textSecondary} />
            <Text style={styles.sectionTitle}>Income vs expenses</Text>
          </View>
          <Text style={styles.secondaryLabel}>Last 5 months</Text>
        </View>

        <View style={styles.trendLegend}>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: Colors.success }]} />
            <Text style={styles.legendLabel}>Income</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: Colors.danger }]} />
            <Text style={styles.legendLabel}>Expenses</Text>
          </View>
        </View>

        <View style={styles.trendChart}>
          {PERFORMANCE_TREND.map((point) => (
            <View key={point.id} style={styles.trendColumn}>
              <View style={styles.barGroup}>
                <View
                  style={[
                    styles.trendBar,
                    styles.expenseBar,
                    {
                      height: (point.expense / trendPeak) * 112,
                    },
                  ]}
                />
                <View
                  style={[
                    styles.trendBar,
                    styles.incomeBar,
                    {
                      height: (point.income / trendPeak) * 112,
                    },
                  ]}
                />
              </View>
              <Text style={styles.trendLabel}>{point.label}</Text>
              <Text style={styles.trendValue}>{point.income.toFixed(1)}k</Text>
            </View>
          ))}
        </View>

        <View style={styles.trendSummary}>
          <Text style={styles.trendSummaryText}>
            Momentum stays positive: income grew 5% month-over-month while expenses are
            flat. Keep pushing the reduction initiatives for February.
          </Text>
        </View>
      </View>

      <View style={styles.sectionCard}>
        <View style={styles.sectionHeader}>
          <View style={styles.sectionTitleRow}>
            <Sparkles size={18} color={Colors.textSecondary} />
            <Text style={styles.sectionTitle}>Forecast & insights</Text>
          </View>
          <Text style={styles.secondaryLabel}>{FORECAST.horizon}</Text>
        </View>

        <View style={styles.forecastCard}>
          <View style={styles.forecastRow}>
            <Text style={styles.forecastLabel}>Projected surplus</Text>
            <Text style={styles.forecastValue}>{formatCurrency(FORECAST.projection)}</Text>
          </View>
          <View style={styles.confidenceRow}>
            <Text style={styles.confidenceLabel}>Confidence</Text>
            <Text style={styles.confidenceValue}>{FORECAST.confidence}%</Text>
          </View>
          <View style={styles.confidenceTrack}>
            <View
              style={[
                styles.confidenceFill,
                { width: `${FORECAST.confidence}%` },
              ]}
            />
          </View>
          <Text style={styles.guidanceText}>{FORECAST.guidance}</Text>
        </View>

        <View style={styles.insightList}>
          {INSIGHTS.map((insight) => (
            <View key={insight.id} style={styles.insightRow}>
              <View style={[styles.insightDot, { backgroundColor: insight.tone }]} />
              <View style={styles.insightCopy}>
                <Text style={styles.insightTitle}>{insight.title}</Text>
                <Text style={styles.insightDetail}>{insight.detail}</Text>
              </View>
            </View>
          ))}
        </View>
      </View>

      <View style={styles.bottomSpacer} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    gap: 16,
  },
  sectionCard: {
    borderRadius: 18,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 18,
    gap: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  secondaryLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
    backgroundColor: Colors.surfaceElevated,
  },
  pillText: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  kpiGrid: {
    flexDirection: 'row',
    gap: 12,
    flexWrap: 'wrap',
  },
  kpiCard: {
    flexBasis: '30%',
    flexGrow: 1,
    minWidth: 120,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.surfaceElevated,
    padding: 14,
    gap: 10,
  },
  kpiIconBadge: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  kpiLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  kpiValue: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  kpiDeltaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  kpiDelta: {
    fontSize: 12,
    fontWeight: '600',
  },
  trendLegend: {
    flexDirection: 'row',
    gap: 16,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 6,
  },
  legendLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  trendChart: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 14,
  },
  trendColumn: {
    flex: 1,
    alignItems: 'center',
    gap: 8,
  },
  barGroup: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 4,
    height: 120,
  },
  trendBar: {
    width: 16,
    borderRadius: 8,
    backgroundColor: Colors.surfaceElevated,
  },
  incomeBar: {
    backgroundColor: Colors.success,
  },
  expenseBar: {
    backgroundColor: Colors.danger,
    opacity: 0.85,
  },
  trendLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  trendValue: {
    fontSize: 12,
    color: Colors.textTertiary,
  },
  trendSummary: {
    padding: 12,
    borderRadius: 14,
    backgroundColor: Colors.surfaceElevated,
  },
  trendSummaryText: {
    fontSize: 12,
    color: Colors.textSecondary,
    lineHeight: 18,
  },
  forecastCard: {
    borderRadius: 16,
    backgroundColor: Colors.surfaceElevated,
    padding: 16,
    gap: 12,
  },
  forecastRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  forecastLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  forecastValue: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  confidenceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  confidenceLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  confidenceValue: {
    fontSize: 12,
    color: Colors.textPrimary,
    fontWeight: '600',
  },
  confidenceTrack: {
    height: 8,
    borderRadius: 999,
    backgroundColor: Colors.surface,
    overflow: 'hidden',
  },
  confidenceFill: {
    height: '100%',
    borderRadius: 999,
    backgroundColor: Colors.primary,
  },
  guidanceText: {
    fontSize: 12,
    color: Colors.textSecondary,
    lineHeight: 18,
  },
  insightList: {
    gap: 14,
  },
  insightRow: {
    flexDirection: 'row',
    gap: 12,
  },
  insightDot: {
    width: 10,
    height: 10,
    borderRadius: 6,
    marginTop: 4,
  },
  insightCopy: {
    flex: 1,
    gap: 4,
  },
  insightTitle: {
    fontSize: 14,
    color: Colors.textPrimary,
    fontWeight: '500',
  },
  insightDetail: {
    fontSize: 12,
    color: Colors.textSecondary,
    lineHeight: 18,
  },
  positiveText: {
    color: Colors.success,
  },
  negativeText: {
    color: Colors.danger,
  },
  bottomSpacer: {
    height: 80,
  },
});
