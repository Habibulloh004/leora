// app/(tabs)/(finance)/(tabs)/transactions.tsx
import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import {
  ArrowDownLeft,
  ArrowUpRight,
  BarChart2,
  CalendarRange,
  Dot,
  ReceiptText,
} from 'lucide-react-native';

import { Colors } from '@/constants/Colors';

type TransactionType = 'income' | 'expense';

interface WeeklySpendingPoint {
  id: string;
  label: string;
  amount: number;
}

interface CategoryBreakdown {
  id: string;
  label: string;
  amount: number;
  share: number;
  tone: string;
}

interface RecentTransaction {
  id: string;
  title: string;
  category: string;
  amount: number;
  currency: string;
  time: string;
  type: TransactionType;
}

const CASHFLOW = {
  period: 'January 2025',
  income: 5400,
  expenses: 3225,
};

const WEEKLY_SPENDING: WeeklySpendingPoint[] = [
  { id: 'mon', label: 'Mon', amount: 420 },
  { id: 'tue', label: 'Tue', amount: 360 },
  { id: 'wed', label: 'Wed', amount: 510 },
  { id: 'thu', label: 'Thu', amount: 280 },
  { id: 'fri', label: 'Fri', amount: 640 },
  { id: 'sat', label: 'Sat', amount: 720 },
  { id: 'sun', label: 'Sun', amount: 380 },
];

const CATEGORY_BREAKDOWN: CategoryBreakdown[] = [
  { id: 'food', label: 'Food & Dining', amount: 680, share: 24, tone: Colors.danger },
  { id: 'transport', label: 'Transport', amount: 210, share: 7, tone: Colors.info },
  { id: 'leisure', label: 'Leisure', amount: 420, share: 15, tone: Colors.secondary },
  { id: 'shopping', label: 'Shopping', amount: 520, share: 18, tone: Colors.primary },
  { id: 'bills', label: 'Bills & Utilities', amount: 690, share: 24, tone: Colors.warning },
];

const RECENT_TRANSACTIONS: RecentTransaction[] = [
  {
    id: 'txn-1',
    title: 'Little Italy',
    category: 'Dining',
    amount: -48.2,
    currency: 'USD',
    time: '12:40',
    type: 'expense',
  },
  {
    id: 'txn-2',
    title: 'Upwork Payout',
    category: 'Freelance',
    amount: 1250,
    currency: 'USD',
    time: '09:05',
    type: 'income',
  },
  {
    id: 'txn-3',
    title: 'Spotify',
    category: 'Subscription',
    amount: -9.99,
    currency: 'USD',
    time: 'Yesterday',
    type: 'expense',
  },
  {
    id: 'txn-4',
    title: 'Taxi',
    category: 'Transport',
    amount: -7.4,
    currency: 'USD',
    time: 'Yesterday',
    type: 'expense',
  },
];

const formatCurrency = (value: number) =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: value % 1 === 0 ? 0 : 2,
  }).format(Math.abs(value));

export default function TransactionsTab() {
  const netFlow = CASHFLOW.income - CASHFLOW.expenses;
  const peakSpending = Math.max(...WEEKLY_SPENDING.map((point) => point.amount));

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.sectionCard}>
        <View style={styles.sectionHeader}>
          <View style={styles.sectionTitleRow}>
            <ReceiptText size={18} color={Colors.textSecondary} />
            <Text style={styles.sectionTitle}>Cashflow</Text>
          </View>
          <View style={styles.pill}>
            <CalendarRange size={14} color={Colors.textSecondary} />
            <Text style={styles.pillText}>{CASHFLOW.period}</Text>
          </View>
        </View>

        <View style={styles.cashflowRow}>
          <View style={styles.cashflowColumn}>
            <View style={[styles.iconBadge, styles.incomeBadge]}>
              <ArrowDownLeft size={16} color={Colors.success} />
            </View>
            <Text style={styles.cashflowLabel}>Income</Text>
            <Text style={[styles.cashflowValue, styles.positiveText]}>
              +{formatCurrency(CASHFLOW.income)}
            </Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.cashflowColumn}>
            <View style={[styles.iconBadge, styles.expenseBadge]}>
              <ArrowUpRight size={16} color={Colors.danger} />
            </View>
            <Text style={styles.cashflowLabel}>Spent</Text>
            <Text style={[styles.cashflowValue, styles.negativeText]}>
              -{formatCurrency(CASHFLOW.expenses)}
            </Text>
          </View>
        </View>

        <View style={styles.netRow}>
          <Dot size={16} color={Colors.textTertiary} />
          <Text style={styles.netLabel}>Net this month</Text>
          <Text
            style={[
              styles.netValue,
              netFlow >= 0 ? styles.positiveText : styles.negativeText,
            ]}
          >
            {netFlow >= 0 ? '+' : '-'}
            {formatCurrency(netFlow)}
          </Text>
        </View>
      </View>

      <View style={styles.sectionCard}>
        <View style={styles.sectionHeader}>
          <View style={styles.sectionTitleRow}>
            <BarChart2 size={18} color={Colors.textSecondary} />
            <Text style={styles.sectionTitle}>Weekly spending</Text>
          </View>
          <Text style={styles.secondaryLabel}>Last 7 days</Text>
        </View>

        <View style={styles.chart}>
          {WEEKLY_SPENDING.map((point) => (
            <View key={point.id} style={styles.chartColumn}>
              <View style={styles.chartBarTrack}>
                <View
                  style={[
                    styles.chartBarFill,
                    {
                      height: (point.amount / peakSpending) * 120,
                    },
                  ]}
                />
              </View>
              <Text style={styles.chartLabel}>{point.label}</Text>
              <Text style={styles.chartValue}>${point.amount}</Text>
            </View>
          ))}
        </View>
      </View>

      <View style={styles.sectionCard}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Top categories</Text>
          <Text style={styles.secondaryLabel}>Tracked automatically</Text>
        </View>

        <View style={styles.categoryList}>
          {CATEGORY_BREAKDOWN.map((item) => (
            <View key={item.id} style={styles.categoryRow}>
              <View style={[styles.categoryMarker, { backgroundColor: item.tone }]} />
              <View style={styles.categoryInfo}>
                <Text style={styles.categoryLabel}>{item.label}</Text>
                <Text style={styles.categoryAmount}>${item.amount}</Text>
              </View>
              <View style={styles.progressTrack}>
                <View style={[styles.progressFill, { width: `${item.share}%`, backgroundColor: item.tone }]} />
              </View>
              <Text style={styles.categoryShare}>{item.share}%</Text>
            </View>
          ))}
        </View>
      </View>

      <View style={styles.sectionCard}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Recent activity</Text>
          <Text style={styles.secondaryLabel}>Synced accounts</Text>
        </View>

        <View style={styles.transactionList}>
          {RECENT_TRANSACTIONS.map((transaction) => {
            const isIncome = transaction.type === 'income';
            return (
              <View key={transaction.id} style={styles.transactionRow}>
                <View
                  style={[
                    styles.transactionIcon,
                    {
                      backgroundColor: isIncome
                        ? Colors.successBg
                        : Colors.dangerBg,
                    },
                  ]}
                >
                  {isIncome ? (
                    <ArrowDownLeft size={18} color={Colors.success} />
                  ) : (
                    <ArrowUpRight size={18} color={Colors.danger} />
                  )}
                </View>

                <View style={styles.transactionInfo}>
                  <Text style={styles.transactionTitle}>{transaction.title}</Text>
                  <Text style={styles.transactionMeta}>
                    {transaction.category} • {transaction.time}
                  </Text>
                </View>

                <Text
                  style={[
                    styles.transactionAmount,
                    isIncome ? styles.positiveText : styles.negativeText,
                  ]}
                >
                  {isIncome ? '+' : '-'}
                  {formatCurrency(transaction.amount)}
                </Text>
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
  cashflowRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  cashflowColumn: {
    flex: 1,
    gap: 6,
  },
  iconBadge: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  incomeBadge: {
    backgroundColor: Colors.successBg,
  },
  expenseBadge: {
    backgroundColor: Colors.dangerBg,
  },
  cashflowLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  cashflowValue: {
    fontSize: 20,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  divider: {
    width: 1,
    height: '100%',
    backgroundColor: Colors.border,
  },
  netRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  netLabel: {
    fontSize: 13,
    color: Colors.textSecondary,
  },
  netValue: {
    fontSize: 15,
    fontWeight: '600',
  },
  chart: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 12,
  },
  chartColumn: {
    flex: 1,
    alignItems: 'center',
    gap: 6,
  },
  chartBarTrack: {
    width: 18,
    height: 120,
    borderRadius: 10,
    backgroundColor: Colors.surfaceElevated,
    justifyContent: 'flex-end',
    overflow: 'hidden',
  },
  chartBarFill: {
    width: '100%',
    borderRadius: 10,
    backgroundColor: Colors.primary,
  },
  chartLabel: {
    fontSize: 11,
    color: Colors.textSecondary,
  },
  chartValue: {
    fontSize: 11,
    color: Colors.textTertiary,
  },
  categoryList: {
    gap: 14,
  },
  categoryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  categoryMarker: {
    width: 10,
    height: 10,
    borderRadius: 6,
  },
  categoryInfo: {
    flex: 1,
    gap: 2,
  },
  categoryLabel: {
    fontSize: 14,
    color: Colors.textPrimary,
    fontWeight: '500',
  },
  categoryAmount: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  progressTrack: {
    flex: 1.2,
    height: 6,
    borderRadius: 999,
    backgroundColor: Colors.surfaceElevated,
  },
  progressFill: {
    height: '100%',
    borderRadius: 999,
  },
  categoryShare: {
    width: 42,
    textAlign: 'right',
    fontSize: 12,
    color: Colors.textSecondary,
  },
  transactionList: {
    gap: 12,
  },
  transactionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 8,
  },
  transactionIcon: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  transactionInfo: {
    flex: 1,
    gap: 4,
  },
  transactionTitle: {
    fontSize: 15,
    fontWeight: '500',
    color: Colors.textPrimary,
  },
  transactionMeta: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  transactionAmount: {
    fontSize: 15,
    fontWeight: '600',
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
