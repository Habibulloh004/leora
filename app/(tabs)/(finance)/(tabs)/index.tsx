// app/(tabs)/(finance)/(tabs)/index.tsx
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Animated,
  Dimensions,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import DateTimePicker, {
  DateTimePickerAndroid,
  DateTimePickerEvent,
} from '@react-native-community/datetimepicker';
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
import { useFinanceDomainStore } from '@/stores/useFinanceDomainStore';
import type { Transaction as FinanceTransaction } from '@/domain/finance/types';
import { useFinanceCurrency } from '@/hooks/useFinanceCurrency';
import { normalizeFinanceCurrency } from '@/utils/financeCurrency';
import { useShallow } from 'zustand/react/shallow';
import {
  AVAILABLE_FINANCE_CURRENCIES,
  type FinanceCurrency,
  useFinancePreferencesStore,
} from '@/stores/useFinancePreferencesStore';
import type { FxProviderId } from '@/services/fx/providers';

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

interface PieDatum {
  name: string;
  population: number;
  color: string;
  legendFontColor: string;
  legendFontSize: number;
}

interface FinanceSummaryView {
  balanceGlobal: number;
  balanceBase: number;
  incomeCard: { amount: number; change: number };
  outcomeCard: { amount: number; change: number };
  progress: { used: number; percentage: number };
  pie: PieDatum[];
  recentTransactions: RecentTransactionRow[];
  events: FinanceEvent[];
}

export default function FinanceReviewScreen() {
  const theme = useAppTheme();
  const { strings, locale } = useLocalization();
  const reviewStrings = strings.financeScreens.review;
  const fxStrings = reviewStrings.fxQuick;
  const styles = createStyles(theme);
  const { accounts, transactions, debts, budgets } = useFinanceDomainStore(
    useShallow((state) => ({
      accounts: state.accounts,
      transactions: state.transactions,
      debts: state.debts,
      budgets: state.budgets,
    })),
  );
  const { syncExchangeRates, overrideExchangeRate, baseCurrency: financePreferencesBaseCurrency } =
    useFinancePreferencesStore(
      useShallow((state) => ({
        syncExchangeRates: state.syncExchangeRates,
        overrideExchangeRate: state.overrideExchangeRate,
        baseCurrency: state.baseCurrency,
      })),
    );
  const {
    convertAmount,
    formatCurrency: formatFinanceCurrency,
    globalCurrency,
    baseCurrency,
  } = useFinanceCurrency();
  const [balanceCurrency, setBalanceCurrency] = useState<FinanceCurrency>(globalCurrency);
  const [accountFilterVisible, setAccountFilterVisible] = useState(false);
  const [monitoringVisible, setMonitoringVisible] = useState(false);
  const [selectedAccountIds, setSelectedAccountIds] = useState<string[]>([]);
  const [monitorAccountIds, setMonitorAccountIds] = useState<string[]>([]);
  const [monitorTypes, setMonitorTypes] = useState<('income' | 'expense' | 'transfer')[]>([]);
  const [monitorSearch, setMonitorSearch] = useState('');
  const [monitorDateFrom, setMonitorDateFrom] = useState<Date | null>(null);
  const [monitorDateTo, setMonitorDateTo] = useState<Date | null>(null);
  const [monitorDatePicker, setMonitorDatePicker] = useState<{
    target: 'from' | 'to';
    value: Date;
  } | null>(null);
  useEffect(() => {
    setBalanceCurrency(globalCurrency);
  }, [globalCurrency]);
  const convertToBalanceCurrency = useCallback(
    (value: number) => {
      if (balanceCurrency === globalCurrency) {
        return value;
      }
      return convertAmount(value, globalCurrency as FinanceCurrency, balanceCurrency);
    },
    [balanceCurrency, convertAmount, globalCurrency],
  );
  const formatBalanceValue = useCallback(
    (value: number) =>
      formatFinanceCurrency(convertToBalanceCurrency(value), {
        fromCurrency: balanceCurrency,
        convert: false,
      }),
    [balanceCurrency, convertToBalanceCurrency, formatFinanceCurrency],
  );
  const monitorTypeOptions: ('income' | 'expense' | 'transfer')[] = ['income', 'expense', 'transfer'];
  const monitorDateFormatter = useMemo(
    () => new Intl.DateTimeFormat(locale, { year: 'numeric', month: '2-digit', day: '2-digit' }),
    [locale],
  );
  const formatMonitorDate = useCallback(
    (date: Date | null) => (date ? monitorDateFormatter.format(date) : reviewStrings.monitorNoDate),
    [monitorDateFormatter, reviewStrings.monitorNoDate],
  );
  const applyMonitorDate = useCallback((target: 'from' | 'to', value: Date) => {
    if (target === 'from') {
      setMonitorDateFrom(value);
    } else {
      setMonitorDateTo(value);
    }
    setMonitorDatePicker(null);
  }, []);
  const openMonitorDatePicker = useCallback(
    (target: 'from' | 'to') => {
      const baseValue = (target === 'from' ? monitorDateFrom : monitorDateTo) ?? new Date();
      if (Platform.OS === 'android') {
        DateTimePickerAndroid.open({
          value: baseValue,
          mode: 'date',
          onChange: (event, selected) => {
            if (event.type === 'set' && selected) {
              applyMonitorDate(target, selected);
            }
          },
        });
        return;
      }
      setMonitorDatePicker({ target, value: baseValue });
    },
    [applyMonitorDate, monitorDateFrom, monitorDateTo],
  );
  const handleMonitorIosPicker = useCallback(
    (event: DateTimePickerEvent, selected?: Date) => {
      if (event.type === 'dismissed') {
        setMonitorDatePicker(null);
        return;
      }
      if (selected && monitorDatePicker) {
        applyMonitorDate(monitorDatePicker.target, selected);
      }
    },
    [applyMonitorDate, monitorDatePicker],
  );
  const filteredAccounts = useMemo(
    () => (selectedAccountIds.length ? accounts.filter((account) => selectedAccountIds.includes(account.id)) : accounts),
    [accounts, selectedAccountIds],
  );
  const filteredAccountIds = useMemo(() => new Set(filteredAccounts.map((account) => account.id)), [filteredAccounts]);
  const [selectedProvider, setSelectedProvider] = useState<FxProviderId>('central_bank_stub');
  const [fxSyncing, setFxSyncing] = useState(false);
  const [fxStatus, setFxStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [lastSyncAt, setLastSyncAt] = useState<Date | null>(null);
  const [overrideModalVisible, setOverrideModalVisible] = useState(false);
  const [overrideRateInput, setOverrideRateInput] = useState('');
  const [overrideError, setOverrideError] = useState<string | null>(null);
  const providerOptions = useMemo(
    () => [
      { id: 'central_bank_stub' as FxProviderId, label: fxStrings.providers.central_bank_stub },
      { id: 'market_stub' as FxProviderId, label: fxStrings.providers.market_stub },
    ],
    [fxStrings.providers],
  );
  const [overrideCurrency, setOverrideCurrency] = useState<FinanceCurrency>(() => {
    const fallback =
      AVAILABLE_FINANCE_CURRENCIES.find((code) => code !== financePreferencesBaseCurrency) ??
      financePreferencesBaseCurrency;
    return fallback as FinanceCurrency;
  });

  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 400,
      useNativeDriver: true,
    }).start();
  }, [fadeAnim]);

  useEffect(() => {
    if (overrideCurrency === financePreferencesBaseCurrency) {
      const fallback =
        AVAILABLE_FINANCE_CURRENCIES.find((code) => code !== financePreferencesBaseCurrency) ??
        financePreferencesBaseCurrency;
      setOverrideCurrency(fallback as FinanceCurrency);
    }
  }, [financePreferencesBaseCurrency, overrideCurrency]);

  const lastSyncLabel = useMemo(() => {
    if (!lastSyncAt) {
      return null;
    }
    return new Intl.DateTimeFormat(locale, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(lastSyncAt);
  }, [lastSyncAt, locale]);

  const handleQuickSync = useCallback(async () => {
    setFxStatus(null);
    try {
      setFxSyncing(true);
      await syncExchangeRates(selectedProvider);
      setLastSyncAt(new Date());
      const providerLabel = providerOptions.find((option) => option.id === selectedProvider)?.label ?? '';
      setFxStatus({
        type: 'success',
        message: fxStrings.syncSuccess.replace('{provider}', providerLabel),
      });
    } catch (error) {
      setFxStatus({ type: 'error', message: fxStrings.syncError });
    } finally {
      setFxSyncing(false);
    }
  }, [fxStrings.syncError, fxStrings.syncSuccess, providerOptions, selectedProvider, syncExchangeRates]);

  const handleOpenOverrideModal = useCallback(() => {
    setOverrideRateInput('');
    setOverrideError(null);
    setOverrideModalVisible(true);
  }, []);

  const closeOverrideModal = useCallback(() => {
    setOverrideModalVisible(false);
    setOverrideError(null);
  }, []);

  const handleApplyOverride = useCallback(() => {
    const normalizedValue = Number(overrideRateInput.replace(/\s+/g, '').replace(',', '.'));
    if (overrideCurrency === financePreferencesBaseCurrency) {
      setOverrideError(fxStrings.overrideBaseError);
      return;
    }
    if (!Number.isFinite(normalizedValue) || normalizedValue <= 0) {
      setOverrideError(fxStrings.overrideError);
      return;
    }
    overrideExchangeRate(overrideCurrency, normalizedValue);
    setFxStatus({
      type: 'success',
      message: fxStrings.overrideSuccess.replace('{currency}', overrideCurrency),
    });
    setOverrideRateInput('');
    closeOverrideModal();
  }, [
    closeOverrideModal,
    financePreferencesBaseCurrency,
    fxStrings.overrideBaseError,
    fxStrings.overrideError,
    fxStrings.overrideSuccess,
    overrideCurrency,
    overrideExchangeRate,
    overrideRateInput,
  ]);

  const overrideCurrencyOptions = useMemo(
    () => AVAILABLE_FINANCE_CURRENCIES.filter((code) => code !== financePreferencesBaseCurrency),
    [financePreferencesBaseCurrency],
  );

  const summary = useMemo<FinanceSummaryView>(() => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    const previousMonth = currentMonth === 0 ? 11 : currentMonth - 1;
    const previousYear = currentMonth === 0 ? currentYear - 1 : currentYear;

    const accountCurrencyMap = new Map(
      filteredAccounts.map((account) => [account.id, normalizeFinanceCurrency(account.currency)]),
    );
    const accountNameMap = new Map(filteredAccounts.map((account) => [account.id, account.name]));
    const resolveTransactionCurrency = (transaction: typeof transactions[number]) =>
      transaction.currency
        ? normalizeFinanceCurrency(transaction.currency)
        : transaction.accountId
        ? accountCurrencyMap.get(transaction.accountId) ?? 'USD'
        : 'USD';

    const includesSelectedAccount = (transaction: typeof transactions[number]) => {
      const candidates = [transaction.accountId, transaction.fromAccountId, transaction.toAccountId].filter(
        Boolean,
      ) as string[];
      if (!candidates.length) {
        return filteredAccounts.length === accounts.length;
      }
      return candidates.some((id) => filteredAccountIds.has(id));
    };

    const filterByDate = (month: number, year: number) =>
      transactions.filter((transaction) => {
        const date = new Date(transaction.date);
        return date.getMonth() === month && date.getFullYear() === year && includesSelectedAccount(transaction);
      });

    const currentMonthTransactions = filterByDate(currentMonth, currentYear);
    const previousMonthTransactions = filterByDate(previousMonth, previousYear);

    const sumByType = (list: typeof transactions, type: FinanceTransaction['type']) =>
      list
        .filter((transaction) => transaction.type === type)
        .reduce(
          (sum, item) =>
            sum + convertAmount(item.amount, resolveTransactionCurrency(item), globalCurrency),
          0,
        );

    const incomeCurrent = sumByType(currentMonthTransactions, 'income');
    const incomePrev = sumByType(previousMonthTransactions, 'income');
    const outcomeCurrent = sumByType(currentMonthTransactions, 'expense');
    const outcomePrev = sumByType(previousMonthTransactions, 'expense');

    const calcChange = (current: number, prev: number) => {
      if (prev === 0) return current > 0 ? 100 : 0;
      return Number((((current - prev) / prev) * 100).toFixed(1));
    };

    const totalBalanceGlobal = filteredAccounts.reduce(
      (sum, account) =>
        sum + convertAmount(account.currentBalance, normalizeFinanceCurrency(account.currency), globalCurrency),
      0,
    );
    const totalBalanceBase = filteredAccounts.reduce(
      (sum, account) =>
        sum + convertAmount(account.currentBalance, normalizeFinanceCurrency(account.currency), baseCurrency),
      0,
    );

    const enrichedBudgets = budgets.map((budget) => {
      const state = budget.limitAmount > 0 && budget.spentAmount > budget.limitAmount ? 'exceeding' : 'within';
      return {
        ...budget,
        state,
      };
    });

    const budgetsTotals = enrichedBudgets.reduce(
      (acc, budget) => {
        const limitValue = convertAmount(budget.limitAmount, normalizeFinanceCurrency(budget.currency), globalCurrency);
        const spentValue = convertAmount(budget.spentAmount, normalizeFinanceCurrency(budget.currency), globalCurrency);
        acc.limit += limitValue;
        acc.spent += spentValue;
        return acc;
      },
      { limit: 0, spent: 0 },
    );

    const progressPercentage = budgetsTotals.limit
      ? Math.min(Math.round((budgetsTotals.spent / budgetsTotals.limit) * 100), 125)
      : 0;
    const progressUsedGlobal = budgetsTotals.spent || outcomeCurrent;

    const recentTransactions: RecentTransactionRow[] = transactions
      .filter((transaction) => transaction.type !== 'transfer')
      .filter(includesSelectedAccount)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 5)
      .map((transaction) => {
        const currency = resolveTransactionCurrency(transaction);
        const convertedAmount = convertAmount(transaction.amount, currency, globalCurrency);
        const accountRef =
          transaction.accountId ??
          transaction.fromAccountId ??
          transaction.toAccountId ??
          (accounts[0]?.id ?? '');
        return {
          id: transaction.id,
          title:
            transaction.description ??
            transaction.categoryId ??
            (transaction.type === 'income' ? 'Income' : 'Expense'),
          subtitle: accountNameMap.get(accountRef) ?? 'Unknown account',
          amount: convertedAmount,
          isIncome: transaction.type === 'income',
          time: formatRelativeTime(new Date(transaction.date)),
        };
      });

    const categoryTotals = transactions
      .filter((transaction) => transaction.type === 'expense')
      .reduce<Record<string, number>>((acc, transaction) => {
        const key = transaction.categoryId ?? transaction.description ?? 'Other';
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
      .filter((debt) => debt.status !== 'paid')
      .sort((a, b) => {
        const aTime = a.dueDate ? new Date(a.dueDate).getTime() : Number.MAX_SAFE_INTEGER;
        const bTime = b.dueDate ? new Date(b.dueDate).getTime() : Number.MAX_SAFE_INTEGER;
        return aTime - bTime;
      })
      .slice(0, 3)
      .map((debt) => {
        const converted = formatValue(
          convertAmount(debt.principalAmount, normalizeFinanceCurrency(debt.principalCurrency), globalCurrency),
        );
        const description = debt.description ? `${converted} • ${debt.description}` : converted;
        return {
          id: debt.id,
          icon: debt.direction === 'they_owe_me' ? 'wallet' : 'alert',
          title: debt.direction === 'they_owe_me' ? `${debt.counterpartyName} owes you` : `You owe ${debt.counterpartyName}`,
          description,
          time: describeDueDate(debt.dueDate ? new Date(debt.dueDate) : undefined),
        };
      });

    const fallbackEvents: FinanceEvent[] = enrichedBudgets
      .filter((budget) => budget.state !== 'within')
      .slice(0, 2)
      .map((budget) => {
        const spent = formatValue(convertAmount(budget.spentAmount, normalizeFinanceCurrency(budget.currency), globalCurrency));
        const limit = formatValue(convertAmount(budget.limitAmount, normalizeFinanceCurrency(budget.currency), globalCurrency));
        return {
          id: budget.id,
          icon: (budget.state === 'exceeding' ? 'alert' : 'clock') as EventIcon,
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
    filteredAccounts,
    filteredAccountIds,
  ]);

  const monitorFilteredTransactions = useMemo(() => {
    return transactions
      .filter((transaction) => {
        if (monitorAccountIds.length) {
          const refs = [transaction.accountId, transaction.fromAccountId, transaction.toAccountId].filter(
            Boolean,
          ) as string[];
          if (!refs.some((id) => monitorAccountIds.includes(id))) {
            return false;
          }
        }
        if (monitorTypes.length && !monitorTypes.includes(transaction.type)) {
          return false;
        }
        if (monitorSearch.trim()) {
          const haystack = `${transaction.description ?? ''} ${transaction.categoryId ?? ''}`.toLowerCase();
          if (!haystack.includes(monitorSearch.trim().toLowerCase())) {
            return false;
          }
        }
        const txnDate = new Date(transaction.date);
        if (monitorDateFrom && txnDate < monitorDateFrom) {
          return false;
        }
        if (monitorDateTo && txnDate > monitorDateTo) {
          return false;
        }
        return true;
      })
      .slice(0, 20);
  }, [
    monitorAccountIds,
    monitorTypes,
    monitorDateFrom,
    monitorDateTo,
    monitorSearch,
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
              {formatBalanceValue(item.amount)}
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
    <>
      <ScrollView
        style={styles.container}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.contentContainer}
      >
        <Animated.View style={{ opacity: fadeAnim }}>
        {/* 1. Balance Section */}
        <View style={styles.balanceSection}>
          {/* Main Balance Card */}
          <Pressable onLongPress={() => setMonitoringVisible(true)} delayLongPress={350}>
            <AdaptiveGlassView style={[styles.glassSurface, styles.mainBalanceCard]}>
            <View style={styles.balanceHeaderRow}>
              <Text style={styles.balanceLabel}>{reviewStrings.totalBalance}</Text>
              <Pressable
                style={({ pressed }) => [styles.balanceFilterButton, pressed && styles.pressed]}
                onPress={() => setAccountFilterVisible(true)}
              >
                <Text style={[styles.balanceFilterLabel, { color: theme.colors.textSecondary }]}>
                  {selectedAccountIds.length
                    ? reviewStrings.accountFilterSelected.replace('{count}', String(selectedAccountIds.length))
                    : reviewStrings.accountFilterAll}
                </Text>
              </Pressable>
            </View>
            <Text style={styles.balanceAmount}>{formatBalanceValue(summary.balanceGlobal)}</Text>
            <Text style={styles.balanceConverted}>
              Base ·{' '}
              {formatFinanceCurrency(summary.balanceBase, { fromCurrency: baseCurrency, convert: false })}
            </Text>
            </AdaptiveGlassView>
          </Pressable>

          {/* Income & Outcome Cards */}
          <View style={styles.inOutRow}>
            {/* Income Card */}
            <AdaptiveGlassView style={[styles.glassSurface, styles.inOutCard]}>
              <View style={styles.inOutHeader}>
                <Text style={styles.inOutLabel}>{reviewStrings.income}</Text>
                <TrendingUp size={16} color={theme.colors.success} />
              </View>
              <Text style={[styles.inOutAmount, { color: theme.colors.success }]}>
                {formatBalanceValue(summary.incomeCard.amount)}
              </Text>
              <Text style={styles.inOutChange}>
                {summary.incomeCard.change >= 0 ? '+' : ''}
                {summary.incomeCard.change}%
              </Text>
            </AdaptiveGlassView>

            {/* Outcome Card */}
            <AdaptiveGlassView style={[styles.glassSurface, styles.inOutCard]}>
              <View style={styles.inOutHeader}>
                <Text style={styles.inOutLabel}>{reviewStrings.outcome}</Text>
                <TrendingDown size={16} color={theme.colors.danger} />
              </View>
              <Text style={[styles.inOutAmount, { color: theme.colors.danger }]}>
                {formatBalanceValue(summary.outcomeCard.amount)}
              </Text>
              <Text style={styles.inOutChange}>
                {summary.outcomeCard.change >= 0 ? '+' : ''}
                {summary.outcomeCard.change}%
              </Text>
            </AdaptiveGlassView>
          </View>
        </View>

        {/* FX Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{fxStrings.title}</Text>
          <AdaptiveGlassView style={[styles.glassSurface, styles.fxQuickCard]}>
            <Text style={styles.fxQuickLabel}>{fxStrings.providerLabel}</Text>
            <View style={styles.fxProviderRow}>
              {providerOptions.map((option) => {
                const isActive = option.id === selectedProvider;
                return (
                  <Pressable
                    key={option.id}
                    onPress={() => setSelectedProvider(option.id)}
                    style={({ pressed }) => [
                      styles.fxProviderChip,
                      {
                        borderColor: isActive ? theme.colors.primary : theme.colors.border,
                        backgroundColor: isActive ? `${theme.colors.primary}22` : theme.colors.card,
                      },
                      pressed && styles.pressed,
                    ]}
                  >
                    <Text
                      style={[
                        styles.fxProviderChipText,
                        { color: isActive ? theme.colors.primary : theme.colors.textSecondary },
                      ]}
                    >
                      {option.label}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
            <View style={styles.fxQuickRow}>
              <Pressable
                onPress={handleQuickSync}
                disabled={fxSyncing}
                style={({ pressed }) => [
                  styles.fxActionButton,
                  { borderColor: theme.colors.border, backgroundColor: theme.colors.card },
                  pressed && styles.pressed,
                ]}
              >
                <Text style={[styles.fxActionLabel, { color: theme.colors.textPrimary }]}>
                  {fxSyncing ? fxStrings.syncing : fxStrings.syncButton}
                </Text>
                {fxSyncing ? (
                  <ActivityIndicator color={theme.colors.primary} size="small" />
                ) : (
                  <Text style={[styles.fxActionDescription, { color: theme.colors.textSecondary }]}>
                    {fxStrings.syncDescription}
                  </Text>
                )}
              </Pressable>
              <Pressable
                onPress={handleOpenOverrideModal}
                style={({ pressed }) => [
                  styles.fxActionButton,
                  { borderColor: theme.colors.border, backgroundColor: theme.colors.card },
                  pressed && styles.pressed,
                ]}
              >
                <Text style={[styles.fxActionLabel, { color: theme.colors.textPrimary }]}>
                  {fxStrings.overrideButton}
                </Text>
                <Text style={[styles.fxActionDescription, { color: theme.colors.textSecondary }]}>
                  {fxStrings.overrideHint.replace('{base}', financePreferencesBaseCurrency)}
                </Text>
              </Pressable>
            </View>
            {fxStatus ? (
              <Text
                style={[
                  styles.fxStatusText,
                  { color: fxStatus.type === 'error' ? theme.colors.danger : theme.colors.success },
                ]}
              >
                {fxStatus.message}
              </Text>
            ) : null}
            {lastSyncLabel ? (
              <Text style={[styles.fxStatusMuted, { color: theme.colors.textSecondary }]}>
                {fxStrings.lastSync.replace('{value}', lastSyncLabel)}
              </Text>
            ) : null}
          </AdaptiveGlassView>
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
              <AdaptiveGlassView style={[styles.glassSurface, styles.progressLabelItem]}>
                <Text style={styles.progressLabel}>{reviewStrings.used}</Text>
                <Text style={styles.progressValue}>
                  –{formatBalanceValue(summary.progress.used)}
                </Text>
              </AdaptiveGlassView>
              <AdaptiveGlassView style={[styles.glassSurface, styles.progressLabelItem, styles.progressLabelRight]}>
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
          <AdaptiveGlassView style={[styles.glassSurface, styles.expenseContainer]}>
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
              <AdaptiveGlassView key={event.id} style={[styles.glassSurface, styles.eventCard]}>
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
      <Modal
        transparent
        animationType="fade"
        visible={overrideModalVisible}
        onRequestClose={closeOverrideModal}
      >
        <View style={styles.modalBackdrop}>
          <AdaptiveGlassView style={[styles.glassSurface, styles.modalCard]}> 
            <Text style={[styles.modalTitle, { color: theme.colors.textPrimary }]}>{fxStrings.overrideTitle}</Text>
            <Text style={[styles.modalSubtitle, { color: theme.colors.textSecondary }]}>
              {fxStrings.overrideHint.replace('{base}', financePreferencesBaseCurrency)}
            </Text>
            <View style={styles.currencyChipGrid}>
              {overrideCurrencyOptions.map((code) => {
                const isActive = code === overrideCurrency;
                return (
                  <Pressable
                    key={code}
                    onPress={() => setOverrideCurrency(code)}
                    style={({ pressed }) => [
                      styles.currencyChip,
                      {
                        borderColor: isActive ? theme.colors.primary : theme.colors.border,
                        backgroundColor: isActive ? `${theme.colors.primary}22` : theme.colors.card,
                      },
                      pressed && styles.pressed,
                    ]}
                  >
                    <Text
                      style={[
                        styles.currencyChipText,
                        { color: isActive ? theme.colors.primary : theme.colors.textSecondary },
                      ]}
                    >
                      {code}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
            <TextInput
              value={overrideRateInput}
              onChangeText={setOverrideRateInput}
              placeholder={fxStrings.overridePlaceholder}
              placeholderTextColor={theme.colors.textMuted}
              keyboardType="decimal-pad"
              style={[
                styles.modalInput,
                {
                  color: theme.colors.textPrimary,
                  borderColor: theme.colors.border,
                  backgroundColor: theme.colors.card,
                },
              ]}
            />
            {overrideError ? (
              <Text style={[styles.fxStatusText, { color: theme.colors.danger }]}>{overrideError}</Text>
            ) : null}
            <View style={styles.modalActions}>
              <Pressable
                style={({ pressed }) => [styles.modalSecondaryButton, pressed && styles.pressed]}
                onPress={closeOverrideModal}
              >
                <Text style={[styles.modalSecondaryLabel, { color: theme.colors.textSecondary }]}>
                  {fxStrings.overrideCancel}
                </Text>
              </Pressable>
              <Pressable
                style={({ pressed }) => [styles.modalPrimaryButton, { backgroundColor: theme.colors.primary }, pressed && styles.pressed]}
                onPress={handleApplyOverride}
              >
                <Text style={styles.modalPrimaryLabel}>{fxStrings.overrideConfirm}</Text>
              </Pressable>
            </View>
          </AdaptiveGlassView>
        </View>
      </Modal>
      <Modal
        transparent
        animationType="fade"
        visible={accountFilterVisible}
        onRequestClose={() => setAccountFilterVisible(false)}
      >
        <View style={styles.modalBackdrop}>
          <AdaptiveGlassView style={[styles.glassSurface, styles.modalCard]}>
            <Text style={[styles.modalTitle, { color: theme.colors.textPrimary }]}>
              {reviewStrings.accountFilterTitle}
            </Text>
            <Text style={[styles.accountFilterSectionTitle, { color: theme.colors.textSecondary }]}>
              {reviewStrings.accountFilterCurrencyLabel}
            </Text>
            <View style={styles.currencyChipGrid}>
              {AVAILABLE_FINANCE_CURRENCIES.map((code) => {
                const isActive = balanceCurrency === code;
                return (
                  <Pressable
                    key={code}
                    style={({ pressed }) => [
                      styles.currencyChip,
                      {
                        borderColor: isActive ? theme.colors.primary : theme.colors.border,
                        backgroundColor: isActive ? `${theme.colors.primary}22` : theme.colors.card,
                      },
                      pressed && styles.pressed,
                    ]}
                    onPress={() => setBalanceCurrency(code)}
                  >
                    <Text
                      style={[
                        styles.currencyChipText,
                        { color: isActive ? theme.colors.primary : theme.colors.textSecondary },
                      ]}
                    >
                      {code}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
            <ScrollView style={{ maxHeight: 320 }} showsVerticalScrollIndicator={false}>
              {accounts.map((account) => {
                const isSelected =
                  selectedAccountIds.length === 0 || selectedAccountIds.includes(account.id);
                return (
                  <Pressable
                    key={account.id}
                    style={({ pressed }) => [styles.accountFilterRow, pressed && styles.pressed]}
                    onPress={() =>
                      setSelectedAccountIds((prev) => {
                        if (!prev.length) {
                          return accounts.filter((acc) => acc.id !== account.id).map((acc) => acc.id);
                        }
                        if (prev.includes(account.id)) {
                          const next = prev.filter((id) => id !== account.id);
                          return next;
                        }
                        return [...prev, account.id];
                      })
                    }
                  >
                    <Text style={[styles.accountFilterName, { color: theme.colors.textPrimary }]}>
                      {account.name}
                    </Text>
                    <Text style={{ color: isSelected ? theme.colors.primary : theme.colors.textSecondary }}>
                      {isSelected ? '✓' : ''}
                    </Text>
                  </Pressable>
                );
              })}
            </ScrollView>
            <View style={styles.modalActions}>
              <Pressable
                style={({ pressed }) => [styles.modalSecondaryButton, pressed && styles.pressed]}
                onPress={() => setSelectedAccountIds([])}
              >
                <Text style={[styles.modalSecondaryLabel, { color: theme.colors.textSecondary }]}>
                  {reviewStrings.accountFilterSelectAll}
                </Text>
              </Pressable>
              <Pressable
                style={({ pressed }) => [
                  styles.modalPrimaryButton,
                  { backgroundColor: theme.colors.primary },
                  pressed && styles.pressed,
                ]}
                onPress={() => setAccountFilterVisible(false)}
              >
                <Text style={styles.modalPrimaryLabel}>{reviewStrings.accountFilterApply}</Text>
              </Pressable>
            </View>
          </AdaptiveGlassView>
        </View>
      </Modal>
      <Modal transparent animationType="slide" visible={monitoringVisible} onRequestClose={() => setMonitoringVisible(false)}>
        <SafeAreaView style={styles.modalBackdrop} edges={['bottom']}>
          <AdaptiveGlassView style={[styles.glassSurface, styles.monitorCard]}>
            <View style={styles.monitorHeader}>
              <Text style={[styles.modalTitle, { color: theme.colors.textPrimary }]}>{reviewStrings.monitorTitle}</Text>
              <TextInput
                value={monitorSearch}
                onChangeText={setMonitorSearch}
                placeholder={reviewStrings.monitorSearchPlaceholder}
                placeholderTextColor={theme.colors.textMuted}
                style={[styles.monitorInput, { borderColor: theme.colors.border, color: theme.colors.textPrimary }]}
              />
            </View>
            <ScrollView
              style={styles.monitorScroll}
              contentContainerStyle={styles.monitorScrollContent}
              showsVerticalScrollIndicator={false}
            >
              <View style={styles.monitorSection}>
                <Text style={[styles.accountFilterSectionTitle, { color: theme.colors.textSecondary }]}>
                  {reviewStrings.monitorAccounts}
                </Text>
                <View style={styles.monitorChipGrid}>
                  {accounts.map((account) => {
                    const isActive = monitorAccountIds.includes(account.id);
                    return (
                      <Pressable
                        key={account.id}
                        style={({ pressed }) => [
                          styles.monitorChip,
                          {
                            borderColor: isActive ? theme.colors.primary : theme.colors.border,
                            backgroundColor: isActive ? `${theme.colors.primary}22` : theme.colors.card,
                          },
                          pressed && styles.pressed,
                        ]}
                        onPress={() =>
                          setMonitorAccountIds((prev) =>
                            prev.includes(account.id) ? prev.filter((id) => id !== account.id) : [...prev, account.id],
                          )
                        }
                      >
                        <Text
                          style={[
                            styles.monitorChipText,
                            { color: isActive ? theme.colors.primary : theme.colors.textSecondary },
                          ]}
                        >
                          {account.name}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>
              </View>
              <View style={styles.monitorSection}>
                <Text style={[styles.accountFilterSectionTitle, { color: theme.colors.textSecondary }]}>
                  {reviewStrings.monitorTypesTitle}
                </Text>
                <View style={styles.monitorChipGrid}>
                  {monitorTypeOptions.map((type) => {
                    const isActive = monitorTypes.includes(type);
                    return (
                      <Pressable
                        key={type}
                        style={({ pressed }) => [
                          styles.monitorChip,
                          {
                            borderColor: isActive ? theme.colors.primary : theme.colors.border,
                            backgroundColor: isActive ? `${theme.colors.primary}22` : theme.colors.card,
                          },
                          pressed && styles.pressed,
                        ]}
                        onPress={() =>
                          setMonitorTypes((prev) =>
                            prev.includes(type) ? prev.filter((item) => item !== type) : [...prev, type],
                          )
                        }
                      >
                        <Text
                          style={[
                            styles.monitorChipText,
                            { color: isActive ? theme.colors.primary : theme.colors.textSecondary },
                          ]}
                        >
                          {reviewStrings.monitorTypes[type]}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>
              </View>
              <View style={[styles.monitorSection, styles.monitorDatesRow]}>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.accountFilterSectionTitle, { color: theme.colors.textSecondary }]}>
                    {reviewStrings.monitorDateFrom}
                  </Text>
                  <Pressable
                    style={[styles.monitorDateInput, { borderColor: theme.colors.border }]}
                    onPress={() => openMonitorDatePicker('from')}
                  >
                    <Text style={{ color: theme.colors.textPrimary }}>{formatMonitorDate(monitorDateFrom)}</Text>
                  </Pressable>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.accountFilterSectionTitle, { color: theme.colors.textSecondary }]}>
                    {reviewStrings.monitorDateTo}
                  </Text>
                  <Pressable
                    style={[styles.monitorDateInput, { borderColor: theme.colors.border }]}
                    onPress={() => openMonitorDatePicker('to')}
                  >
                    <Text style={{ color: theme.colors.textPrimary }}>{formatMonitorDate(monitorDateTo)}</Text>
                  </Pressable>
                </View>
              </View>
              <View style={styles.monitorSection}>
                <Text style={[styles.accountFilterSectionTitle, { color: theme.colors.textSecondary }]}>
                  {reviewStrings.monitorResults}
                </Text>
                {monitorFilteredTransactions.length ? (
                  monitorFilteredTransactions.map((transaction) => (
                    <View key={transaction.id} style={[styles.monitorTransactionCard, { borderColor: theme.colors.border }]}>
                      <Text style={[styles.monitorRowTitle, { color: theme.colors.textPrimary }]} numberOfLines={2}>
                        {transaction.description ?? transaction.categoryId ?? '—'}
                      </Text>
                      <Text
                        style={{ color: transaction.type === 'income' ? theme.colors.success : theme.colors.danger }}
                      >
                        {transaction.type === 'income' ? '+' : '−'}{' '}
                        {formatFinanceCurrency(transaction.amount, {
                          fromCurrency: transaction.currency ?? globalCurrency,
                          convert: false,
                        })}
                      </Text>
                      <Text style={[styles.monitorRowTime, { color: theme.colors.textMuted }]}>
                        {new Date(transaction.date).toLocaleString()}
                      </Text>
                    </View>
                  ))
                ) : (
                  <Text style={{ color: theme.colors.textSecondary }}>{reviewStrings.monitorEmpty}</Text>
                )}
              </View>
            </ScrollView>
            {monitorDatePicker && Platform.OS === 'ios' && (
              <DateTimePicker
                value={monitorDatePicker.value}
                mode="date"
                display="spinner"
                onChange={handleMonitorIosPicker}
              />
            )}
            <View style={styles.monitorFooter}>
              <Pressable
                style={({ pressed }) => [styles.modalSecondaryButton, pressed && styles.pressed]}
                onPress={() => {
                  setMonitorAccountIds([]);
                  setMonitorTypes([]);
                  setMonitorSearch('');
                  setMonitorDateFrom(null);
                  setMonitorDateTo(null);
                }}
              >
                <Text style={[styles.modalSecondaryLabel, { color: theme.colors.textSecondary }]}>
                  {reviewStrings.monitorReset}
                </Text>
              </Pressable>
              <Pressable
                style={({ pressed }) => [
                  styles.modalPrimaryButton,
                  { backgroundColor: theme.colors.primary },
                  pressed && styles.pressed,
                ]}
                onPress={() => setMonitoringVisible(false)}
              >
                <Text style={styles.modalPrimaryLabel}>{reviewStrings.monitorApply}</Text>
              </Pressable>
            </View>
          </AdaptiveGlassView>
        </SafeAreaView>
      </Modal>
    </>
  );
}

const createStyles = (theme: ReturnType<typeof useAppTheme>) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    glassSurface: {
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: theme.mode === 'dark' ? 'rgba(255,255,255,0.18)' : 'rgba(0,0,0,0.08)',
      backgroundColor: theme.mode === 'dark' ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.02)',
    },
    pressed: {
      opacity: 0.85,
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
    balanceHeaderRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 8,
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
    balanceFilterButton: {
      borderRadius: 12,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: theme.colors.border,
      paddingHorizontal: 12,
      paddingVertical: 6,
    },
    balanceFilterLabel: {
      fontSize: 11,
      fontWeight: '600',
      letterSpacing: 0.3,
      textTransform: 'uppercase',
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
    fxQuickCard: {
      borderRadius: 18,
      padding: 16,
      gap: 14,
    },
    fxQuickLabel: {
      fontSize: 12,
      fontWeight: '600',
      textTransform: 'uppercase',
      letterSpacing: 0.6,
      color: theme.colors.textSecondary,
    },
    fxProviderRow: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 8,
    },
    fxProviderChip: {
      borderWidth: StyleSheet.hairlineWidth,
      borderRadius: 14,
      paddingHorizontal: 12,
      paddingVertical: 6,
    },
    fxProviderChipText: {
      fontSize: 12,
      fontWeight: '600',
    },
    fxQuickRow: {
      flexDirection: 'row',
      gap: 12,
    },
    fxActionButton: {
      flex: 1,
      borderRadius: 16,
      padding: 14,
      borderWidth: StyleSheet.hairlineWidth,
      gap: 6,
    },
    fxActionLabel: {
      fontSize: 14,
      fontWeight: '700',
    },
    fxActionDescription: {
      fontSize: 12,
      lineHeight: 16,
    },
    fxStatusText: {
      fontSize: 12,
      fontWeight: '600',
    },
    fxStatusMuted: {
      fontSize: 11,
      marginTop: -2,
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

    modalBackdrop: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.5)',
      justifyContent: 'center',
      alignItems: 'center',
      padding: 24,
    },
    modalCard: {
      width: '100%',
      borderRadius: 20,
      padding: 20,
      gap: 16,
    },
    modalTitle: {
      fontSize: 18,
      fontWeight: '700',
    },
    modalSubtitle: {
      fontSize: 13,
      lineHeight: 20,
    },
    currencyChipGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 8,
    },
    currencyChip: {
      borderWidth: StyleSheet.hairlineWidth,
      borderRadius: 14,
      paddingHorizontal: 12,
      paddingVertical: 8,
    },
    currencyChipText: {
      fontSize: 13,
      fontWeight: '600',
    },
    modalInput: {
      borderWidth: StyleSheet.hairlineWidth,
      borderRadius: 16,
      paddingHorizontal: 14,
      paddingVertical: 12,
      fontSize: 16,
      fontWeight: '600',
    },
    modalActions: {
      flexDirection: 'row',
      gap: 12,
    },
    accountFilterRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: 10,
    },
    accountFilterName: {
      fontSize: 14,
      fontWeight: '600',
    },
    accountFilterSectionTitle: {
      fontSize: 12,
      fontWeight: '600',
      textTransform: 'uppercase',
      letterSpacing: 0.4,
      marginTop: 8,
      marginBottom: 4,
    },
    modalSecondaryButton: {
      flex: 1,
      borderRadius: 16,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: theme.colors.border,
      alignItems: 'center',
      paddingVertical: 12,
    },
    modalSecondaryLabel: {
      fontSize: 14,
      fontWeight: '600',
    },
    modalPrimaryButton: {
      flex: 1,
      borderRadius: 16,
      alignItems: 'center',
      paddingVertical: 12,
    },
    modalPrimaryLabel: {
      fontSize: 14,
      fontWeight: '700',
      color: theme.colors.onPrimary,
    },
    monitorCard: {
      width: '100%',
      borderRadius: 24,
      padding: 24,
      gap: 14,
      maxHeight: '90%',
    },
    monitorHeader: {
      gap: 10,
    },
    monitorScroll: {
      flexGrow: 0,
    },
    monitorScrollContent: {
      gap: 20,
      paddingBottom: 8,
    },
    monitorSection: {
      gap: 10,
    },
    monitorInput: {
      borderWidth: StyleSheet.hairlineWidth,
      borderRadius: 14,
      paddingHorizontal: 14,
      paddingVertical: 10,
      fontSize: 14,
    },
    monitorDateInput: {
      borderWidth: StyleSheet.hairlineWidth,
      borderRadius: 14,
      paddingHorizontal: 14,
      paddingVertical: 10,
      minHeight: 46,
      justifyContent: 'center',
    },
    monitorChipGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 8,
      marginBottom: 6,
    },
    monitorChip: {
      borderWidth: StyleSheet.hairlineWidth,
      borderRadius: 14,
      paddingHorizontal: 12,
      paddingVertical: 6,
    },
    monitorChipText: {
      fontSize: 12,
      fontWeight: '600',
    },
    monitorDatesRow: {
      flexDirection: 'row',
      gap: 12,
    },
    monitorTransactionCard: {
      borderWidth: StyleSheet.hairlineWidth,
      borderRadius: 16,
      padding: 12,
      backgroundColor: theme.colors.card,
      gap: 4,
    },
    monitorRowTitle: {
      fontSize: 14,
      fontWeight: '600',
    },
    monitorRowTime: {
      fontSize: 11,
    },
    monitorFooter: {
      flexDirection: 'row',
      gap: 12,
      paddingTop: 8,
    },

    bottomSpacer: {
      height: 100,
    },
  });
