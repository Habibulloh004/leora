// app/(tabs)/(finance)/(tabs)/budgets.tsx
import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import {
  AlertTriangle,
  BarChart2,
  CalendarRange,
  Target,
  TrendingDown,
  TrendingUp,
  Wallet,
} from 'lucide-react-native';

import { Colors } from '@/constants/Colors';

interface HealthIndicator {
  id: string;
  label: string;
  value: string;
  tone: string;
}

interface MonthlyOverview {
  id: string;
  label: string;
  spent: number;
  limit: number;
}

interface ActiveBudget {
  id: string;
  name: string;
  spent: number;
  limit: number;
  trend: number;
  tone: string;
}

const BUDGET_SUMMARY = {
  period: 'January 2025',
  allocated: 4200,
  spent: 3610,
  dailyAverage: 117,
};

const HEALTH_INDICATORS: HealthIndicator[] = [
  { id: 'on-track', label: 'On track', value: '68%', tone: Colors.success },
  { id: 'at-risk', label: 'At risk', value: '2 categories', tone: Colors.warning },
  { id: 'unused', label: 'Unused', value: '$340', tone: Colors.info },
];

const MONTHLY_OVERVIEW: MonthlyOverview[] = [
  { id: 'sep', label: 'Sep', spent: 3380, limit: 3600 },
  { id: 'oct', label: 'Oct', spent: 3525, limit: 3600 },
  { id: 'nov', label: 'Nov', spent: 3650, limit: 3600 },
  { id: 'dec', label: 'Dec', spent: 3740, limit: 3900 },
  { id: 'jan', label: 'Jan', spent: 3610, limit: 4200 },
];

const ACTIVE_BUDGETS: ActiveBudget[] = [
  { id: 'groceries', name: 'Groceries', spent: 420, limit: 620, trend: -6, tone: Colors.warning },
  { id: 'commute', name: 'Transport', spent: 185, limit: 260, trend: -2, tone: Colors.info },
  { id: 'wellness', name: 'Wellness', spent: 280, limit: 320, trend: 4, tone: Colors.secondary },
  { id: 'subscriptions', name: 'Subscriptions', spent: 96, limit: 120, trend: 3, tone: Colors.primary },
  { id: 'dining', name: 'Dining out', spent: 310, limit: 280, trend: 8, tone: Colors.danger },
];

const formatCurrency = (value: number) =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: value % 1 === 0 ? 0 : 2,
  }).format(value);

export default function BudgetsTab() {
  const remaining = BUDGET_SUMMARY.allocated - BUDGET_SUMMARY.spent;
  const utilization = Math.round((BUDGET_SUMMARY.spent / BUDGET_SUMMARY.allocated) * 100);

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.sectionCard}>
        <View style={styles.sectionHeader}>
          <View style={styles.sectionTitleRow}>
            <Wallet size={18} color={Colors.textSecondary} />
            <Text style={styles.sectionTitle}>Budget overview</Text>
          </View>
          <View style={styles.pill}>
            <CalendarRange size={14} color={Colors.textSecondary} />
            <Text style={styles.pillText}>{BUDGET_SUMMARY.period}</Text>
          </View>
        </View>

        <View style={styles.summaryGrid}>
          <View style={styles.summaryCell}>
            <Text style={styles.summaryLabel}>Allocated</Text>
            <Text style={styles.summaryValue}>{formatCurrency(BUDGET_SUMMARY.allocated)}</Text>
          </View>

          <View style={styles.summaryCell}>
            <Text style={styles.summaryLabel}>Spent</Text>
            <Text style={[styles.summaryValue, styles.negativeText]}>
              {formatCurrency(BUDGET_SUMMARY.spent)}
            </Text>
          </View>

          <View style={styles.summaryCell}>
            <Text style={styles.summaryLabel}>Remaining</Text>
            <Text
              style={[
                styles.summaryValue,
                remaining >= 0 ? styles.positiveText : styles.negativeText,
              ]}
            >
              {remaining >= 0 ? formatCurrency(remaining) : `-${formatCurrency(Math.abs(remaining))}`}
            </Text>
          </View>

          <View style={styles.summaryCell}>
            <Text style={styles.summaryLabel}>Daily average</Text>
            <Text style={styles.summaryValue}>{formatCurrency(BUDGET_SUMMARY.dailyAverage)}</Text>
          </View>
        </View>

        <View style={styles.progressSection}>
          <View style={styles.progressHeader}>
            <View style={styles.progressTitleRow}>
              <BarChart2 size={16} color={Colors.textSecondary} />
              <Text style={styles.progressTitle}>Utilization</Text>
            </View>
            <Text style={styles.progressValue}>{utilization}%</Text>
          </View>
          <View style={styles.progressTrack}>
            <View
              style={[
                styles.progressFill,
                {
                  width: `${Math.min(utilization, 100)}%`,
                  backgroundColor: utilization > 100 ? Colors.danger : Colors.primary,
                },
              ]}
            />
          </View>
          {utilization > 100 ? (
            <View style={styles.alertRow}>
              <AlertTriangle size={14} color={Colors.danger} />
              <Text style={styles.alertText}>Spending above plan. Review categories below.</Text>
            </View>
          ) : null}
        </View>
      </View>

      <View style={styles.sectionCard}>
        <View style={styles.sectionHeader}>
          <View style={styles.sectionTitleRow}>
            <Target size={18} color={Colors.textSecondary} />
            <Text style={styles.sectionTitle}>Budget health</Text>
          </View>
          <Text style={styles.secondaryLabel}>Live metrics</Text>
        </View>

        <View style={styles.healthRow}>
          {HEALTH_INDICATORS.map((indicator) => (
            <View
              key={indicator.id}
              style={[styles.healthCard, { borderColor: indicator.tone }]}
            >
              <Text style={[styles.healthValue, { color: indicator.tone }]}>{indicator.value}</Text>
              <Text style={styles.healthLabel}>{indicator.label}</Text>
            </View>
          ))}
        </View>
      </View>

      <View style={styles.sectionCard}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Monthly burn rate</Text>
          <Text style={styles.secondaryLabel}>Last 5 months</Text>
        </View>

        <View style={styles.monthList}>
          {MONTHLY_OVERVIEW.map((month) => {
            const usage = Math.round((month.spent / month.limit) * 100);
            return (
              <View key={month.id} style={styles.monthRow}>
                <Text style={styles.monthLabel}>{month.label}</Text>
                <View style={styles.monthProgress}>
                  <View style={styles.monthTrack}>
                    <View
                      style={[
                        styles.monthFill,
                        {
                          width: `${Math.min(usage, 100)}%`,
                          backgroundColor: usage > 100 ? Colors.danger : Colors.primary,
                        },
                      ]}
                    />
                  </View>
                  <Text style={styles.monthAmount}>
                    {formatCurrency(month.spent)} / {formatCurrency(month.limit)}
                  </Text>
                </View>
                <Text
                  style={[
                    styles.monthPercentage,
                    usage > 100
                      ? styles.negativeText
                      : usage < 90
                        ? styles.positiveText
                        : styles.textDefault,
                  ]}
                >
                  {usage}%
                </Text>
              </View>
            );
          })}
        </View>
      </View>

      <View style={styles.sectionCard}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Active budgets</Text>
          <Text style={styles.secondaryLabel}>Auto-adjusted weekly</Text>
        </View>

        <View style={styles.budgetList}>
          {ACTIVE_BUDGETS.map((budget) => {
            const usage = Math.round((budget.spent / budget.limit) * 100);
            const remainingValue = budget.limit - budget.spent;
            const trendPositive = budget.trend >= 0;

            return (
              <View key={budget.id} style={styles.budgetRow}>
                <View style={[styles.budgetIcon, { backgroundColor: budget.tone + '1A' }]}>
                  <Target size={18} color={budget.tone} />
                </View>

                <View style={styles.budgetInfo}>
                  <Text style={styles.budgetName}>{budget.name}</Text>
                  <Text style={styles.budgetMeta}>
                    {formatCurrency(budget.spent)} / {formatCurrency(budget.limit)}
                  </Text>
                  <View style={styles.budgetProgressTrack}>
                    <View
                      style={[
                        styles.budgetProgressFill,
                        {
                          width: `${Math.min(usage, 100)}%`,
                          backgroundColor: budget.tone,
                        },
                      ]}
                    />
                  </View>
                </View>

                <View style={styles.budgetRight}>
                  <View style={styles.remainingPill}>
                    <Text
                      style={[
                        styles.remainingText,
                        remainingValue >= 0 ? styles.positiveText : styles.negativeText,
                      ]}
                    >
                      {remainingValue >= 0
                        ? `${formatCurrency(remainingValue)} left`
                        : `-${formatCurrency(Math.abs(remainingValue))} over`}
                    </Text>
                  </View>

                  <View style={styles.trendRow}>
                    {trendPositive ? (
                      <TrendingUp size={14} color={Colors.danger} />
                    ) : (
                      <TrendingDown size={14} color={Colors.success} />
                    )}
                    <Text
                      style={[
                        styles.trendText,
                        trendPositive ? styles.negativeText : styles.positiveText,
                      ]}
                    >
                      {trendPositive ? '+' : ''}
                      {budget.trend}%
                    </Text>
                  </View>
                </View>
              </View>
            );
          })}
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
    textTransform: 'capitalize',
  },
  summaryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  summaryCell: {
    width: '48%',
    gap: 6,
  },
  summaryLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  summaryValue: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  progressSection: {
    gap: 12,
  },
  progressHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  progressTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  progressTitle: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  progressValue: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  progressTrack: {
    height: 10,
    borderRadius: 999,
    backgroundColor: Colors.surfaceElevated,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 999,
  },
  alertRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  alertText: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  healthRow: {
    flexDirection: 'row',
    gap: 12,
    flexWrap: 'wrap',
  },
  healthCard: {
    flex: 1,
    minWidth: 120,
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderRadius: 16,
    borderWidth: 1,
    backgroundColor: Colors.surfaceElevated,
    gap: 4,
  },
  healthValue: {
    fontSize: 16,
    fontWeight: '600',
  },
  healthLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  monthList: {
    gap: 12,
  },
  monthRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  monthLabel: {
    width: 40,
    fontSize: 13,
    color: Colors.textSecondary,
  },
  monthProgress: {
    flex: 1,
    gap: 6,
  },
  monthTrack: {
    height: 8,
    borderRadius: 999,
    backgroundColor: Colors.surfaceElevated,
    overflow: 'hidden',
  },
  monthFill: {
    height: '100%',
    borderRadius: 999,
  },
  monthAmount: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  monthPercentage: {
    width: 48,
    textAlign: 'right',
    fontSize: 12,
    color: Colors.textSecondary,
  },
  budgetList: {
    gap: 14,
  },
  budgetRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  budgetIcon: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  budgetInfo: {
    flex: 1,
    gap: 4,
  },
  budgetName: {
    fontSize: 15,
    fontWeight: '500',
    color: Colors.textPrimary,
  },
  budgetMeta: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  budgetProgressTrack: {
    height: 6,
    borderRadius: 999,
    backgroundColor: Colors.surfaceElevated,
    overflow: 'hidden',
  },
  budgetProgressFill: {
    height: '100%',
    borderRadius: 999,
  },
  budgetRight: {
    alignItems: 'flex-end',
    gap: 8,
  },
  remainingPill: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    backgroundColor: Colors.surfaceElevated,
  },
  remainingText: {
    fontSize: 11,
    fontWeight: '600',
  },
  trendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  trendText: {
    fontSize: 12,
    fontWeight: '600',
  },
  positiveText: {
    color: Colors.success,
  },
  negativeText: {
    color: Colors.danger,
  },
  textDefault: {
    color: Colors.textSecondary,
  },
  bottomSpacer: {
    height: 80,
  },
});
