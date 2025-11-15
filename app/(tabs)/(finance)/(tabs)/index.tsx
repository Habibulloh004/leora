// app/(tabs)/(finance)/(tabs)/index.tsx
import React, { useEffect, useMemo, useRef } from 'react';
import {
  Animated,
  Dimensions,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {
  Clock,
  Wallet,
  AlertCircle,
  TrendingUp,
  TrendingDown,
} from 'lucide-react-native';
import { PieChart } from 'react-native-chart-kit';
import * as Progress from 'react-native-progress';
import { AdaptiveGlassView } from '@/components/ui/AdaptiveGlassView';

import { useAppTheme } from '@/constants/theme';
import { Table, TableColumn } from '@/components/ui/Table';
import { useLocalization } from '@/localization/useLocalization';
import { useFinanceStore } from '@/stores/useFinanceStore';
import type { Transaction } from '@/types/store.types';
import { useFinanceCurrency } from '@/hooks/useFinanceCurrency';
import { normalizeFinanceCurrency } from '@/utils/financeCurrency';

const { width: screenWidth } = Dimensions.get('window');

const CATEGORY_COLORS = ['#8B5CF6', '#EF4444', '#10B981', '#F59E0B', '#3B82F6', '#EAB308'];

const formatRelativeTime = (date: Date) => {
  const now = new Date();
  const todayKey = now.toDateString();
  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  const shortTime = new Intl.DateTimeFormat('en-US', {
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);

  if (date.toDateString() === todayKey) {
    return `Today ${shortTime}`;
  }
  if (date.toDateString() === yesterday.toDateString()) {
    return `Yesterday ${shortTime}`;
  }

  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
};

const describeDueDate = (target?: Date) => {
  if (!target) {
    return 'No period';
  }
  const today = new Date();
  const diffDays = Math.ceil((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  if (diffDays === 0) return 'Due today';
  if (diffDays > 0) return `In ${diffDays} day${diffDays === 1 ? '' : 's'}`;
  return `${Math.abs(diffDays)} day${Math.abs(diffDays) === 1 ? '' : 's'} overdue`;
};

interface RecentTransactionRow {
  id: string;
  title: string;
  subtitle: string;
  amount: number;
  isIncome: boolean;
  time: string;
}

type EventIcon = 'wallet' | 'clock' | 'alert';

interface FinanceEvent {
  id: string;
  icon: EventIcon;
  title: string;
  description: string;
  time: string;
}

export default function FinanceReviewScreen() {
  const theme = useAppTheme();
  const { strings } = useLocalization();
  const reviewStrings = strings.financeScreens.review;
  const styles = createStyles(theme);
  const accounts = useFinanceStore((state) => state.accounts);
  const transactions = useFinanceStore((state) => state.transactions);
  const debts = useFinanceStore((state) => state.debts);
  const budgets = useFinanceStore((state) => state.budgets);
  const {
    convertAmount,
    formatCurrency: formatFinanceCurrency,
    globalCurrency,
    baseCurrency,
  } = useFinanceCurrency();

  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 400,
      useNativeDriver: true,
    }).start();
  }, [fadeAnim]);

  const summary = useMemo(() => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    const previousMonth = currentMonth === 0 ? 11 : currentMonth - 1;
    const previousYear = currentMonth === 0 ? currentYear - 1 : currentYear;

    const accountCurrencyMap = new Map(
      accounts.map((account) => [account.id, normalizeFinanceCurrency(account.currency)]),
    );
    const accountNameMap = new Map(accounts.map((account) => [account.id, account.name]));

    const resolveTransactionCurrency = (transaction: Transaction) =>
      transaction.currency
        ? normalizeFinanceCurrency(transaction.currency)
        : accountCurrencyMap.get(transaction.accountId) ?? 'USD';

    const filterByDate = (month: number, year: number) =>
      transactions.filter((transaction) => {
        const date = new Date(transaction.date);
        return date.getMonth() === month && date.getFullYear() === year;
      });

    const currentMonthTransactions = filterByDate(currentMonth, currentYear);
    const previousMonthTransactions = filterByDate(previousMonth, previousYear);

    const sumByType = (list: typeof transactions, type: Transaction['type']) =>
      list
        .filter((transaction) => transaction.type === type)
        .reduce(
          (sum, item) =>
            sum + convertAmount(item.amount, resolveTransactionCurrency(item), globalCurrency),
          0,
        );

    const incomeCurrent = sumByType(currentMonthTransactions, 'income');
    const incomePrev = sumByType(previousMonthTransactions, 'income');
    const outcomeCurrent = sumByType(currentMonthTransactions, 'outcome');
    const outcomePrev = sumByType(previousMonthTransactions, 'outcome');

    const calcChange = (current: number, prev: number) => {
      if (prev === 0) return current > 0 ? 100 : 0;
      return Number((((current - prev) / prev) * 100).toFixed(1));
    };

    const totalBalanceGlobal = accounts.reduce(
      (sum, account) => sum + convertAmount(account.balance, normalizeFinanceCurrency(account.currency), globalCurrency),
      0,
    );
    const totalBalanceBase = accounts.reduce(
      (sum, account) => sum + convertAmount(account.balance, normalizeFinanceCurrency(account.currency), baseCurrency),
      0,
    );

    const budgetsTotals = budgets.reduce(
      (acc, budget) => {
        acc.limit += budget.limit;
        acc.spent += budget.spent;
        return acc;
      },
      { limit: 0, spent: 0 },
    );

    const progressPercentage = budgetsTotals.limit
      ? Math.min(Math.round((budgetsTotals.spent / budgetsTotals.limit) * 100), 125)
      : 0;
    const progressUsedGlobal = budgetsTotals.spent
      ? convertAmount(budgetsTotals.spent, 'UZS', globalCurrency)
      : outcomeCurrent;

    const recentTransactions: RecentTransactionRow[] = transactions
      .filter((transaction) => transaction.type !== 'transfer')
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 5)
      .map((transaction) => {
        const currency = resolveTransactionCurrency(transaction);
        const convertedAmount = convertAmount(transaction.amount, currency, globalCurrency);
        return {
          id: transaction.id,
          title: transaction.category ?? (transaction.type === 'income' ? 'Income' : 'Expense'),
          subtitle: accountNameMap.get(transaction.accountId) ?? 'Unknown account',
          amount: convertedAmount,
          isIncome: transaction.type === 'income',
          time: formatRelativeTime(new Date(transaction.date)),
        };
      });

    const categoryTotals = transactions
      .filter((transaction) => transaction.type === 'outcome')
      .reduce<Record<string, number>>((acc, transaction) => {
        const key = transaction.category ?? 'Other';
        const currency = resolveTransactionCurrency(transaction);
        const converted = convertAmount(transaction.amount, currency, globalCurrency);
        acc[key] = (acc[key] ?? 0) + converted;
        return acc;
      }, {});

    const expenseChartData = Object.entries(categoryTotals).map(([name, value], index) => ({
      name,
      population: value,
      color: CATEGORY_COLORS[index % CATEGORY_COLORS.length],
      legendFontColor: theme.colors.textSecondary,
      legendFontSize: 13,
    }));

    const formatValue = (value: number) =>
      formatFinanceCurrency(value, { fromCurrency: globalCurrency, convert: false });

    const upcomingDebts: FinanceEvent[] = debts
      .filter((debt) => debt.status !== 'settled')
      .sort((a, b) => {
        const aTime = a.expectedReturnDate ? new Date(a.expectedReturnDate).getTime() : Number.MAX_SAFE_INTEGER;
        const bTime = b.expectedReturnDate ? new Date(b.expectedReturnDate).getTime() : Number.MAX_SAFE_INTEGER;
        return aTime - bTime;
      })
      .slice(0, 3)
      .map((debt) => {
        const converted = formatValue(
          convertAmount(debt.remainingAmount, normalizeFinanceCurrency(debt.currency), globalCurrency),
        );
        const description = debt.note ? `${converted} • ${debt.note}` : converted;
        return {
          id: debt.id,
          icon: debt.type === 'lent' ? 'wallet' : 'alert',
          title: debt.type === 'lent' ? `${debt.person} owes you` : `You owe ${debt.person}`,
          description,
          time: describeDueDate(debt.expectedReturnDate ? new Date(debt.expectedReturnDate) : undefined),
        };
      });

    const fallbackEvents = budgets
      .filter((budget) => budget.state !== 'within')
      .slice(0, 2)
      .map((budget) => {
        const spent = formatValue(convertAmount(budget.spent, 'UZS', globalCurrency));
        const limit = formatValue(convertAmount(budget.limit, 'UZS', globalCurrency));
        return {
          id: budget.id,
          icon: budget.state === 'exceeding' ? 'alert' : 'clock',
          title: budget.name,
          description: `${spent} / ${limit}`,
          time: budget.state === 'exceeding' ? 'Limit exceeded' : 'On track',
        };
      });

    return {
      balanceGlobal: totalBalanceGlobal,
      balanceBase: totalBalanceBase,
      incomeCard: { amount: incomeCurrent, change: calcChange(incomeCurrent, incomePrev) },
      outcomeCard: { amount: outcomeCurrent, change: calcChange(outcomeCurrent, outcomePrev) },
      progress: { used: progressUsedGlobal, percentage: progressPercentage },
      pie: expenseChartData.length
        ? expenseChartData
        : CATEGORY_COLORS.map((color, index) => ({
            name: `Category ${index + 1}`,
            population: 1,
            color,
            legendFontColor: theme.colors.textSecondary,
            legendFontSize: 13,
          })),
      recentTransactions,
      events: upcomingDebts.length ? upcomingDebts : fallbackEvents,
    };
  }, [
    accounts,
    baseCurrency,
    budgets,
    convertAmount,
    debts,
    formatFinanceCurrency,
    globalCurrency,
    theme.colors.textSecondary,
    transactions,
  ]);

  const transactionColumns: TableColumn<RecentTransactionRow>[] = [
    {
      key: 'title',
      title: reviewStrings.table.type,
      flex: 2,
      align: 'left',
      renderText: (item) => item.title,
    },
    {
      key: 'amount',
      title: reviewStrings.table.amount,
      flex: 3,
      align: 'right',
      render: (item) => (
        <Text
          style={[
            styles.transactionAmount,
            { color: item.isIncome ? theme.colors.success : theme.colors.danger },
          ]}
        >
          {item.isIncome ? '+' : '−'}
          {formatFinanceCurrency(item.amount, { fromCurrency: globalCurrency, convert: false })}
        </Text>
      ),
    },
    {
      key: 'time',
      title: reviewStrings.table.date,
      flex: 2,
      align: 'right',
      renderText: (item) => item.time,
      style: styles.transactionTime,
    },
  ];

  const getEventIcon = (iconType: 'wallet' | 'clock' | 'alert') => {
    const iconProps = { size: 20, color: theme.colors.iconText };
    switch (iconType) {
      case 'wallet':
        return <Wallet {...iconProps} />;
      case 'clock':
        return <Clock {...iconProps} />;
      case 'alert':
        return <AlertCircle {...iconProps} />;
    }
  };

  const pieChartData = summary.pie;


  const chartConfig = {
    backgroundGradientFrom: theme.colors.surface,
    backgroundGradientTo: theme.colors.surface,
    color: () => theme.colors.textPrimary,
    strokeWidth: 2,
    barPercentage: 0.5,
    useShadowColorFromDataset: false,
  };

  return (
    <ScrollView
      style={styles.container}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.contentContainer}
    >
      <Animated.View style={{ opacity: fadeAnim }}>
        {/* 1. Balance Section */}
        <View style={styles.balanceSection}>
          {/* Main Balance Card */}
          <AdaptiveGlassView style={styles.mainBalanceCard}>
            <Text style={styles.balanceLabel}>{reviewStrings.totalBalance}</Text>
            <Text style={styles.balanceAmount}>
              {formatFinanceCurrency(summary.balanceGlobal, { fromCurrency: globalCurrency, convert: false })}
            </Text>
            <Text style={styles.balanceConverted}>
              Base ·{' '}
              {formatFinanceCurrency(summary.balanceBase, { fromCurrency: baseCurrency, convert: false })}
            </Text>
          </AdaptiveGlassView>

          {/* Income & Outcome Cards */}
          <View style={styles.inOutRow}>
            {/* Income Card */}
            <AdaptiveGlassView style={styles.inOutCard}>
              <View style={styles.inOutHeader}>
                <Text style={styles.inOutLabel}>{reviewStrings.income}</Text>
                <TrendingUp size={16} color={theme.colors.success} />
              </View>
              <Text style={[styles.inOutAmount, { color: theme.colors.success }]}>
                {formatFinanceCurrency(summary.incomeCard.amount, { fromCurrency: globalCurrency, convert: false })}
              </Text>
              <Text style={styles.inOutChange}>
                {summary.incomeCard.change >= 0 ? '+' : ''}
                {summary.incomeCard.change}%
              </Text>
            </AdaptiveGlassView>

            {/* Outcome Card */}
            <AdaptiveGlassView style={styles.inOutCard}>
              <View style={styles.inOutHeader}>
                <Text style={styles.inOutLabel}>{reviewStrings.outcome}</Text>
                <TrendingDown size={16} color={theme.colors.danger} />
              </View>
              <Text style={[styles.inOutAmount, { color: theme.colors.danger }]}>
                {formatFinanceCurrency(summary.outcomeCard.amount, { fromCurrency: globalCurrency, convert: false })}
              </Text>
              <Text style={styles.inOutChange}>
                {summary.outcomeCard.change >= 0 ? '+' : ''}
                {summary.outcomeCard.change}%
              </Text>
            </AdaptiveGlassView>
          </View>
        </View>

        {/* 2. Monthly Progress Indicator */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{reviewStrings.monthBalance}</Text>
          <View style={styles.progressWrapper}>
            <Progress.Bar
              progress={summary.progress.percentage / 100}
              width={screenWidth - 32}
              height={16}
              color={theme.colors.textSecondary}
              unfilledColor={theme.colors.surfaceElevated}
              borderWidth={0}
              borderRadius={999}
              animated={true}
              animationType="spring"
              animationConfig={{ bounciness: 8 }}
            />
            <View style={styles.progressLabelsRow}>
              <AdaptiveGlassView style={styles.progressLabelItem}>
                <Text style={styles.progressLabel}>{reviewStrings.used}</Text>
                <Text style={styles.progressValue}>
                  –{formatFinanceCurrency(summary.progress.used, { fromCurrency: globalCurrency, convert: false })}
                </Text>
              </AdaptiveGlassView>
              <AdaptiveGlassView style={[styles.progressLabelItem, styles.progressLabelRight]}>
                <Text style={styles.progressLabel}>{reviewStrings.progress}</Text>
                <Text style={[styles.progressValue, { color: theme.colors.textSecondary }]}>
                  {summary.progress.percentage}%
                </Text>
              </AdaptiveGlassView>
            </View>
          </View>
        </View>

        {/* 3. Expense Structure */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{reviewStrings.expenseStructure}</Text>
          <AdaptiveGlassView style={styles.expenseContainer}>
            <PieChart
              data={pieChartData}
              width={screenWidth - 64}
              height={220}
              chartConfig={chartConfig}
              accessor="population"
              backgroundColor="transparent"
              paddingLeft="15"
              center={[10, 0]}
              absolute={false}
              hasLegend={true}
              style={styles.pieChart}
            />
          </AdaptiveGlassView>
        </View>

        {/* 4. Expense History */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>{reviewStrings.recentTransactions}</Text>
            <TouchableOpacity>
              <Text style={styles.seeAllButton}>{reviewStrings.seeAll}</Text>
            </TouchableOpacity>
          </View>

            <Table
              data={summary.recentTransactions}
              columns={transactionColumns}
              showHeader={true}
              keyExtractor={(item) => item.id}
            />
        </View>

        {/* 5. Important Events */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{reviewStrings.importantEvents}</Text>
          <View style={styles.eventsList}>
            {summary.events.map((event) => (
              <AdaptiveGlassView key={event.id} style={styles.eventCard}>
                <View style={styles.eventIconContainer}>{getEventIcon(event.icon)}</View>
                <View style={styles.eventContent}>
                  <Text style={styles.eventTitle}>{event.title}</Text>
                  <Text style={styles.eventDescription}>{event.description}</Text>
                </View>
                <Text style={styles.eventTime}>{event.time}</Text>
              </AdaptiveGlassView>
            ))}
          </View>
        </View>

        <View style={styles.bottomSpacer} />
      </Animated.View>
    </ScrollView>
  );
}

const createStyles = (theme: ReturnType<typeof useAppTheme>) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    contentContainer: {
      paddingHorizontal: 16,
      paddingTop: 16,
    },

    // Balance Section
    balanceSection: {
      marginBottom: 24,
    },
    mainBalanceCard: {
      backgroundColor:theme.colors.card,
      borderRadius: 20,
      padding: 24,
      marginBottom: 12,
    },
    balanceLabel: {
      fontSize: 13,
      fontWeight: '600',
      color: theme.colors.textSecondary,
      marginBottom: 8,
      letterSpacing: 0.5,
    },
    balanceAmount: {
      fontSize: 36,
      fontWeight: '800',
      color: theme.colors.textSecondary,
      letterSpacing: -1,
    },
    balanceConverted: {
      fontSize: 14,
      color: theme.colors.textSecondary,
      opacity: 0.7,
      marginTop: 4,
    },
    inOutRow: {
      flexDirection: 'row',
      gap: 12,
    },
    inOutCard: {
      flex: 1,
      borderRadius: 16,
      padding: 16,
      backgroundColor:theme.colors.card,
    },
    inOutHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 8,
    },
    inOutLabel: {
      fontSize: 12,
      fontWeight: '600',
      color: theme.colors.textSecondary,
      letterSpacing: 0.3,
    },
    inOutAmount: {
      fontSize: 20,
      fontWeight: '700',
      marginBottom: 4,
      letterSpacing: -0.5,
    },
    inOutChange: {
      fontSize: 11,
      color: theme.colors.textMuted,
      fontWeight: '500',
    },

    // Section styles
    section: {
      marginBottom: 24,
    },
    sectionHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 12,
    },
    sectionTitle: {
      fontSize: 17,
      fontWeight: '600',
      color: theme.colors.textSecondary,
      marginBottom: 12,
      letterSpacing: -0.2,
    },
    seeAllButton: {
      fontSize: 12,
      color: theme.colors.textSecondary,
      fontWeight: '600',
    },

    // Progress Bar
    progressWrapper: {
      gap: 12,
    },
    progressLabelsRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      gap: 16,
    },
    progressLabelItem: {
      flex: 1,
      borderRadius: 12,
      padding: 12,
    },
    progressLabelRight: {
      alignItems: 'flex-end',
    },
    progressLabel: {
      fontSize: 11,
      fontWeight: '600',
      color: theme.colors.textSecondary,
      marginBottom: 4,
      letterSpacing: 0.3,
    },
    progressValue: {
      fontSize: 15,
      fontWeight: '700',
      color: theme.colors.textSecondary,
      letterSpacing: -0.2,
    },

    // Expense Structure
    expenseContainer: {
      alignItems: 'center',
      borderRadius: 16,
      padding: 16,
    },
    pieChart: {
      borderRadius: 16,
    },

    // Transactions (styles used by Table component)
    tableContainer: {
      borderRadius: 16,
    },
    transactionAmount: {
      fontSize: 14,
      fontWeight: '700',
    },
    transactionTime: {
      fontSize: 12,
      color: theme.colors.textSecondary,
    },

    // Events
    eventsList: {
      gap: 12,
    },
    eventCard: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: 16,
      borderRadius: 14,
      gap: 12,
    },
    eventIconContainer: {
      width: 40,
      height: 40,
      borderRadius: 12,
      backgroundColor: theme.colors.icon,
      justifyContent: 'center',
      alignItems: 'center',
    },
    eventContent: {
      flex: 1,
      gap: 4,
    },
    eventTitle: {
      fontSize: 14,
      fontWeight: '700',
      color: theme.colors.textSecondary,
    },
    eventDescription: {
      fontSize: 12,
      color: theme.colors.textSecondary,
      lineHeight: 16,
    },
    eventTime: {
      fontSize: 11,
      color: theme.colors.textMuted,
      fontWeight: '500',
    },

    bottomSpacer: {
      height: 100,
    },
  });
