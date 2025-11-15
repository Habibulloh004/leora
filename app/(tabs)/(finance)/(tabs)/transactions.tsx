import React, { useCallback, useMemo, useRef, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SlidersHorizontal } from 'lucide-react-native';

import FilterTransactionSheet, {
  FilterState,
  FilterTransactionSheetHandle,
} from '@/components/modals/finance/FilterTransactionSheet';
import CustomModal from '@/components/modals/CustomModal';
import { BottomSheetHandle } from '@/components/modals/BottomSheet';
import { useAppTheme } from '@/constants/theme';
import TransactionGroup from '@/components/screens/finance/transactions/TransactionGroup';
import { useLocalization } from '@/localization/useLocalization';
import { useFinanceStore } from '@/stores/useFinanceStore';
import { useModalStore } from '@/stores/useModalStore';
import type { Transaction } from '@/types/store.types';

const BASE_CURRENCY = 'UZS';

const DEFAULT_FILTERS: FilterState = {
  period: 'today',
  category: 'all',
  account: 'all',
  type: 'all',
  minAmount: '',
  maxAmount: '',
};

const formatCurrencyDisplay = (value: number, currency?: string) => {
  const resolvedCurrency = currency ?? BASE_CURRENCY;
  try {
    return new Intl.NumberFormat(resolvedCurrency === 'UZS' ? 'uz-UZ' : 'en-US', {
      style: 'currency',
      currency: resolvedCurrency,
      maximumFractionDigits: resolvedCurrency === 'UZS' ? 0 : 2,
    }).format(Math.abs(value));
  } catch {
    return `${resolvedCurrency} ${Math.abs(value).toFixed(2)}`;
  }
};

const periodToDate = (period: string) => {
  const now = new Date();
  switch (period) {
    case 'today':
      return new Date(now.getFullYear(), now.getMonth(), now.getDate());
    case 'week': {
      const start = new Date(now);
      const day = start.getDay();
      start.setDate(start.getDate() - day);
      start.setHours(0, 0, 0, 0);
      return start;
    }
    case 'month':
      return new Date(now.getFullYear(), now.getMonth(), 1);
    case 'year':
      return new Date(now.getFullYear(), 0, 1);
    default:
      return new Date(0);
  }
};

const withinPeriod = (date: Date, period: string) => {
  const start = periodToDate(period);
  return date.getTime() >= start.getTime();
};

const matchesFilters = (transaction: Transaction, filters: FilterState) => {
  const date = new Date(transaction.date);
  if (filters.period !== 'all' && !withinPeriod(date, filters.period)) {
    return false;
  }
  if (filters.type !== 'all' && transaction.type !== filters.type) {
    return false;
  }
  if (filters.category !== 'all' && transaction.category !== filters.category) {
    return false;
  }
  if (filters.account !== 'all' && transaction.accountId !== filters.account) {
    return false;
  }
  const min = parseFloat(filters.minAmount);
  if (!Number.isNaN(min) && transaction.amount < min) {
    return false;
  }
  const max = parseFloat(filters.maxAmount);
  if (!Number.isNaN(max) && transaction.amount > max) {
    return false;
  }
  return true;
};

const formatRelativeTime = (date: Date) => {
  const now = new Date();
  const todayKey = now.toDateString();
  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  const time = new Intl.DateTimeFormat('en-US', { hour: '2-digit', minute: '2-digit' }).format(date);
  if (date.toDateString() === todayKey) return `Today ${time}`;
  if (date.toDateString() === yesterday.toDateString()) return `Yesterday ${time}`;
  return new Intl.DateTimeFormat('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
};

const TransactionsPage: React.FC = () => {
  const theme = useAppTheme();
  const { strings } = useLocalization();
  const transactionsStrings = strings.financeScreens.transactions;
  const filterSheetRef = useRef<FilterTransactionSheetHandle>(null);
  const accounts = useFinanceStore((state) => state.accounts);
  const transactions = useFinanceStore((state) => state.transactions);
  const debts = useFinanceStore((state) => state.debts);
  const categories = useFinanceStore((state) => state.categories);
  const openIncomeOutcome = useModalStore((state) => state.openIncomeOutcome);
  const openTransferModal = useModalStore((state) => state.openTransferModal);
  const detailModalRef = useRef<BottomSheetHandle>(null);
  const [activeFilters, setActiveFilters] = useState<FilterState>(DEFAULT_FILTERS);
  const [selectedTransactionId, setSelectedTransactionId] = useState<string | null>(null);

  const openFilters = useCallback(() => {
    filterSheetRef.current?.open();
  }, []);

  const accountOptions = useMemo(
    () => [{ id: 'all', label: 'All' }, ...accounts.map((account) => ({ id: account.id, label: account.name }))],
    [accounts],
  );

  const categoryOptions = useMemo(
    () => [{ id: 'all', label: 'All' }, ...categories.map((category) => ({ id: category, label: category }))],
    [categories],
  );

  const groupedTransactions = useMemo(() => {
    const accountMap = new Map(accounts.map((account) => [account.id, account.name]));
    const filtered = transactions.filter((transaction) => matchesFilters(transaction, activeFilters));
    const groups = new Map<string, TransactionGroupData & { timestamp: number }>();

    filtered
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .forEach((transaction) => {
        const date = new Date(transaction.date);
        const dayStart = new Date(date.getFullYear(), date.getMonth(), date.getDate());
        const key = dayStart.getTime().toString();
        const label = new Intl.DateTimeFormat('en-US', {
          weekday: 'long',
          day: 'numeric',
          month: 'long',
        }).format(date);

        if (!groups.has(key)) {
          groups.set(key, {
            id: key,
            label,
            dateLabel: label,
            timestamp: dayStart.getTime(),
            transactions: [],
          } as TransactionGroupData & { timestamp: number });
        }

        const group = groups.get(key)!;
        group.transactions.push({
          id: transaction.id,
          category: transaction.category ?? 'General',
          description: transaction.note ?? transaction.description ?? '-',
          account: accountMap.get(transaction.accountId) ?? 'Unknown account',
          time: formatRelativeTime(date),
          amount: transaction.amount,
          currency: transaction.currency ?? BASE_CURRENCY,
          type: transaction.type,
        });
      });

    return Array.from(groups.values())
      .sort((a, b) => b.timestamp - a.timestamp)
      .map(({ timestamp, ...rest }) => rest);
  }, [accounts, activeFilters, transactions]);

  const selectedTransaction = useMemo(
    () => transactions.find((txn) => txn.id === selectedTransactionId) ?? null,
    [selectedTransactionId, transactions],
  );

  const relatedDebt = useMemo(() => {
    if (!selectedTransaction?.relatedDebtId) {
      return null;
    }
    return debts.find((debt) => debt.id === selectedTransaction.relatedDebtId) ?? null;
  }, [debts, selectedTransaction]);

  const handleApplyFilters = useCallback((filters: FilterState) => {
    setActiveFilters(filters);
  }, []);

  const handleResetFilters = useCallback(() => {
    setActiveFilters(DEFAULT_FILTERS);
  }, []);

  const handleEditTransaction = useCallback(() => {
    if (!selectedTransaction) {
      return;
    }
    const transaction = selectedTransaction;
    closeDetails();

    if (transaction.type === 'transfer') {
      openTransferModal({ mode: 'edit', transaction });
      return;
    }

    openIncomeOutcome({
      mode: 'edit',
      tab: (transaction.type ?? 'income') as 'income' | 'outcome',
      transaction,
    });
  }, [closeDetails, openIncomeOutcome, openTransferModal, selectedTransaction]);

  const handleTransactionPress = useCallback((transactionId: string) => {
    setSelectedTransactionId(transactionId);
    detailModalRef.current?.present();
  }, []);

  const closeDetails = useCallback(() => {
    detailModalRef.current?.dismiss();
    setSelectedTransactionId(null);
  }, []);

  return (
    <>
      <ScrollView
        style={[styles.screen, { backgroundColor: theme.colors.background }]}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.headerRow}>
          <Text style={[styles.headerTitle, { color: theme.colors.textPrimary }]}>
            {transactionsStrings.header}
          </Text>

          <Pressable
            onPress={openFilters}
            style={({ pressed }) => [
              styles.filterButton,
              {
                backgroundColor: theme.colors.surface,
                borderColor: theme.colors.border,
              },
              pressed && styles.pressedOpacity,
            ]}
          >
            <SlidersHorizontal size={18} color={theme.colors.textSecondary} />
          </Pressable>
        </View>

        {groupedTransactions.map((group) => (
          <TransactionGroup
            key={group.id}
            group={group}
            onTransactionPress={handleTransactionPress}
          />
        ))}

        <View style={styles.bottomSpacer} />
      </ScrollView>

      <FilterTransactionSheet
        ref={filterSheetRef}
        onApply={handleApplyFilters}
        onReset={handleResetFilters}
        accountOptions={accountOptions}
        categoryOptions={categoryOptions}
      />
      <CustomModal
        ref={detailModalRef}
        variant="picker"
        fallbackSnapPoint="50%"
        onDismiss={closeDetails}
      >
        {selectedTransaction ? (
          <View style={styles.detailContainer}>
            <Text style={[styles.detailTitle, { color: theme.colors.textPrimary }]}>
              {transactionsStrings.details.title}
            </Text>

            <View style={styles.detailRow}>
              <Text style={[styles.detailLabel, { color: theme.colors.textSecondary }]}>
                {transactionsStrings.details.amount}
              </Text>
              <Text style={[styles.detailValue, { color: theme.colors.textPrimary }]}>
                {selectedTransaction.type === 'income'
                  ? '+'
                  : selectedTransaction.type === 'outcome'
                    ? '−'
                    : ''}
                {formatCurrencyDisplay(selectedTransaction.amount, selectedTransaction.currency)}
              </Text>
            </View>

            <View style={styles.detailRow}>
              <Text style={[styles.detailLabel, { color: theme.colors.textSecondary }]}>
                {transactionsStrings.details.account}
              </Text>
              <Text style={[styles.detailValue, { color: theme.colors.textPrimary }]}>
                {accounts.find((account) => account.id === selectedTransaction.accountId)?.name ??
                  transactionsStrings.details.account}
              </Text>
            </View>

            <View style={styles.detailRow}>
              <Text style={[styles.detailLabel, { color: theme.colors.textSecondary }]}>
                {transactionsStrings.details.category}
              </Text>
              <Text style={[styles.detailValue, { color: theme.colors.textPrimary }]}>
                {selectedTransaction.category ?? '—'}
              </Text>
            </View>

            <View style={styles.detailRow}>
              <Text style={[styles.detailLabel, { color: theme.colors.textSecondary }]}>
                {transactionsStrings.details.date}
              </Text>
              <Text style={[styles.detailValue, { color: theme.colors.textPrimary }]}>
                {new Date(selectedTransaction.date).toLocaleString()}
              </Text>
            </View>

            <View style={styles.detailRow}>
              <Text style={[styles.detailLabel, { color: theme.colors.textSecondary }]}>
                {transactionsStrings.details.note}
              </Text>
              <Text style={[styles.detailValue, { color: theme.colors.textPrimary }]} numberOfLines={2}>
                {selectedTransaction.note ?? selectedTransaction.description ?? '—'}
              </Text>
            </View>

            {relatedDebt && (
              <View style={styles.detailRow}>
                <Text style={[styles.detailLabel, { color: theme.colors.textSecondary }]}>
                  {transactionsStrings.details.relatedDebt}
                </Text>
                <Text style={[styles.detailValue, { color: theme.colors.textPrimary }]}>
                  {relatedDebt.person}
                </Text>
              </View>
            )}

            <Pressable
              style={[
                styles.detailActionButton,
                { backgroundColor: theme.colors.primary },
              ]}
              onPress={handleEditTransaction}
            >
              <Text style={[styles.detailActionText, { color: theme.colors.onPrimary }]}>
                {strings.financeScreens.accounts.actions.edit}
              </Text>
            </Pressable>

            <Pressable style={styles.detailCloseButton} onPress={closeDetails}>
              <Text style={[styles.detailCloseText, { color: theme.colors.primary }]}>
                {transactionsStrings.details.close}
              </Text>
            </Pressable>
          </View>
        ) : (
          <View style={styles.detailContainer}>
            <Text style={[styles.detailLabel, { color: theme.colors.textSecondary }]}>
              {transactionsStrings.details.close}
            </Text>
          </View>
        )}
      </CustomModal>
    </>
  );
};

export default TransactionsPage;

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 36,
    gap: 24,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    letterSpacing: -0.3,
  },
  filterButton: {
    width: 42,
    height: 42,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressedOpacity: {
    opacity: 0.85,
  },
  detailContainer: {
    gap: 14,
  },
  detailTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: 'rgba(255,255,255,0.04)',
  },
  detailLabel: {
    fontSize: 13,
    fontWeight: '600',
  },
  detailValue: {
    fontSize: 15,
    fontWeight: '600',
    textAlign: 'right',
  },
  detailActionButton: {
    marginTop: 8,
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  detailActionText: {
    fontSize: 15,
    fontWeight: '600',
  },
  detailCloseButton: {
    marginTop: 8,
    alignSelf: 'flex-end',
  },
  detailCloseText: {
    fontSize: 14,
    fontWeight: '600',
  },
  bottomSpacer: {
    height: 40,
  },
});
