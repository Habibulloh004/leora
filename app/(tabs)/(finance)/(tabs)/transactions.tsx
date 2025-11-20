import React, { useCallback, useMemo, useRef, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { SlidersHorizontal } from 'lucide-react-native';
import { useRouter } from 'expo-router';

import CustomModal from '@/components/modals/CustomModal';
import { AdaptiveGlassView } from '@/components/ui/AdaptiveGlassView';
import { BottomSheetHandle } from '@/components/modals/BottomSheet';
import { useAppTheme } from '@/constants/theme';
import TransactionGroup from '@/components/screens/finance/transactions/TransactionGroup';
import type { TransactionGroupData } from '@/components/screens/finance/transactions/types';
import { useLocalization } from '@/localization/useLocalization';
import { useFinanceDomainStore } from '@/stores/useFinanceDomainStore';
import { useModalStore } from '@/stores/useModalStore';
import { normalizeFinanceCurrency } from '@/utils/financeCurrency';
import type { FinanceCurrency } from '@/stores/useFinancePreferencesStore';
import type { Transaction as LegacyTransaction, Debt as LegacyDebt } from '@/types/store.types';
import type { Transaction as DomainTransaction } from '@/domain/finance/types';
import { mapDomainDebtToLegacy } from '@/utils/finance/debtMappers';
import { useShallow } from 'zustand/react/shallow';
import { type FilterState, useTransactionFilterStore } from '@/stores/useTransactionFilterStore';

const BASE_CURRENCY = 'UZS';

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

type LegacyTransactionType = 'income' | 'outcome' | 'transfer';

const toLegacyTransactionType = (type: DomainTransaction['type']): LegacyTransactionType =>
  type === 'expense' ? 'outcome' : type;

const mapDomainTransactionToLegacy = (transaction: DomainTransaction): LegacyTransaction[] => {
  const legacyType = toLegacyTransactionType(transaction.type);
  const fallbackAccount = transaction.accountId ?? transaction.fromAccountId ?? 'local-account';
  const baseRecord: Omit<LegacyTransaction, 'id' | 'amount' | 'accountId' | 'currency'> = {
    type: legacyType,
    category: transaction.categoryId,
    toAccountId: transaction.toAccountId,
    note: transaction.description,
    description: transaction.description,
    date: new Date(transaction.date),
    currency: transaction.currency,
    createdAt: new Date(transaction.createdAt),
    updatedAt: new Date(transaction.updatedAt),
    relatedDebtId: transaction.debtId,
    sourceTransactionId: transaction.id,
  };

  if (legacyType !== 'transfer') {
    return [
      {
        ...baseRecord,
        id: transaction.id,
        amount: transaction.amount,
        accountId: fallbackAccount,
        currency: transaction.currency,
      },
    ];
  }

  const fromAccountId = transaction.accountId ?? transaction.fromAccountId ?? fallbackAccount;
  const toAccountId = transaction.toAccountId ?? fallbackAccount;
  const incomingAmount = transaction.toAmount ?? transaction.amount;
  const incomingCurrency = transaction.toCurrency ?? transaction.currency;

  return [
    {
      ...baseRecord,
      id: `${transaction.id}-from`,
      amount: transaction.amount,
      accountId: fromAccountId,
      currency: transaction.currency,
      transferDirection: 'outgoing',
    },
    {
      ...baseRecord,
      id: `${transaction.id}-to`,
      amount: incomingAmount,
      accountId: toAccountId,
      currency: incomingCurrency,
      transferDirection: 'incoming',
    },
  ];
};

const matchesFilters = (transaction: LegacyTransaction, filters: FilterState) => {
  const date = new Date(transaction.date);
  if (filters.type !== 'all') {
    if (filters.type === 'debt') {
      if (!transaction.relatedDebtId) {
        return false;
      }
    } else if (transaction.type !== filters.type) {
      return false;
    }
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
  if (filters.dateFrom) {
    const from = new Date(filters.dateFrom);
    if (date < from) {
      return false;
    }
  }
  if (filters.dateTo) {
    const to = new Date(filters.dateTo);
    if (date > to) {
      return false;
    }
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

type DetailRowProps = {
  label: string;
  value: string;
};

const DetailRow = ({ label, value }: DetailRowProps) => {
  const theme = useAppTheme();

  return (
    <View style={styles.detailField}>
      <Text style={[styles.detailLabel, { color: theme.colors.textSecondary }]}>{label}</Text>
      <Text
        style={[styles.detailValue, { color: theme.colors.textPrimary }]}
        numberOfLines={2}
        ellipsizeMode="tail"
      >
        {value}
      </Text>
    </View>
  );
};

const TransactionsPage: React.FC = () => {
  const router = useRouter();
  const theme = useAppTheme();
  const { strings } = useLocalization();
  const transactionsStrings = strings.financeScreens.transactions;
  const filterSheetStrings = transactionsStrings.filterSheet;
  const { accounts, transactions: domainTransactions, debts: domainDebts } = useFinanceDomainStore(
    useShallow((state) => ({
      accounts: state.accounts,
      transactions: state.transactions,
      debts: state.debts,
    })),
  );
  const transactions = useMemo<LegacyTransaction[]>(
    () => domainTransactions.flatMap(mapDomainTransactionToLegacy),
    [domainTransactions],
  );
  const debts = useMemo<LegacyDebt[]>(() => domainDebts.map(mapDomainDebtToLegacy), [domainDebts]);
  const filters = useTransactionFilterStore((state) => state.filters);
  const openIncomeOutcome = useModalStore((state) => state.openIncomeOutcome);
  const openTransferModal = useModalStore((state) => state.openTransferModal);
  const detailModalRef = useRef<BottomSheetHandle>(null);
  const [selectedTransactionId, setSelectedTransactionId] = useState<string | null>(null);

  const openFilters = useCallback(() => {
    router.push('/(modals)/finance-filter');
  }, [router]);

  const groupedTransactions = useMemo(() => {
    const accountMap = new Map(accounts.map((account) => [account.id, account.name]));
    const filtered = transactions.filter((transaction) => matchesFilters(transaction, filters));
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
          transferDirection: transaction.transferDirection,
        });
      });

    return Array.from(groups.values())
      .sort((a, b) => b.timestamp - a.timestamp)
      .map(({ timestamp, ...rest }) => rest);
  }, [accounts, filters, transactions]);

  const selectedTransaction = useMemo(
    () => transactions.find((txn) => txn.id === selectedTransactionId) ?? null,
    [selectedTransactionId, transactions],
  );

  const selectedDomainTransaction = useMemo(() => {
    if (!selectedTransaction) {
      return null;
    }
    return domainTransactions.find((txn) => txn.id === (selectedTransaction.sourceTransactionId ?? selectedTransaction.id)) ?? null;
  }, [domainTransactions, selectedTransaction]);

  const relatedDebt = useMemo(() => {
    if (!selectedTransaction?.relatedDebtId) {
      return null;
    }
    return debts.find((debt) => debt.id === selectedTransaction.relatedDebtId) ?? null;
  }, [debts, selectedTransaction]);

  const selectedTransactionTypeLabel = useMemo(() => {
    if (!selectedTransaction) {
      return null;
    }
    if (selectedTransaction.relatedDebtId) {
      return filterSheetStrings.typeOptions.debt ?? 'Debt';
    }
    if (selectedTransaction.type === 'income') {
      return filterSheetStrings.typeOptions.income;
    }
    if (selectedTransaction.type === 'outcome') {
      return filterSheetStrings.typeOptions.expense;
    }
    if (selectedTransaction.type === 'transfer') {
      return filterSheetStrings.typeOptions.transfer;
    }
    return null;
  }, [filterSheetStrings.typeOptions, selectedTransaction]);

  const closeDetails = useCallback(() => {
    detailModalRef.current?.dismiss();
    setSelectedTransactionId(null);
  }, []);

  const handleEditTransaction = useCallback(() => {
    if (!selectedTransaction) {
      return;
    }
    closeDetails();

    if (selectedTransaction.type === 'transfer') {
      const original = selectedDomainTransaction;
      if (!original) {
        return;
      }
      openTransferModal({ mode: 'edit', transaction: original });
      return;
    }

    openIncomeOutcome({
      mode: 'edit',
      tab: (selectedTransaction.type ?? 'income') as 'income' | 'outcome',
      transaction: selectedTransaction,
    });
  }, [closeDetails, openIncomeOutcome, openTransferModal, selectedDomainTransaction, selectedTransaction]);

  const handleTransactionPress = useCallback((transactionId: string) => {
    setSelectedTransactionId(transactionId);
    detailModalRef.current?.present();
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
      <CustomModal
        ref={detailModalRef}
        variant="form"
        fallbackSnapPoint="80%"
        scrollable={false}
        onDismiss={closeDetails}
      >
        <SafeAreaView edges={['bottom']} style={styles.detailSafeArea}>
          {selectedTransaction ? (
            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.detailScroll}
            >
              <Text style={[styles.detailTitle, { color: theme.colors.textPrimary }]}>
                {transactionsStrings.details.title}
              </Text>

              <AdaptiveGlassView style={[styles.glassSurface, styles.detailCard]}>
                {selectedTransactionTypeLabel ? (
                  <DetailRow
                    label={transactionsStrings.details.type}
                    value={selectedTransactionTypeLabel}
                  />
                ) : null}
                <DetailRow
                  label={transactionsStrings.details.amount}
                  value={`${selectedTransaction.type === 'income'
                    ? '+'
                    : selectedTransaction.type === 'outcome'
                      ? '−'
                      : selectedTransaction.transferDirection === 'incoming'
                        ? '+'
                        : selectedTransaction.transferDirection === 'outgoing'
                          ? '−'
                          : ''}${formatCurrencyDisplay(selectedTransaction.amount, selectedTransaction.currency)}`}
                />
                <DetailRow
                  label={transactionsStrings.details.account}
                  value={
                    accounts.find((account) => account.id === selectedTransaction.accountId)?.name ??
                    transactionsStrings.details.account
                  }
                />
                <DetailRow
                  label={transactionsStrings.details.category}
                  value={selectedTransaction.category ?? '—'}
                />
                <DetailRow
                  label={transactionsStrings.details.date}
                  value={new Date(selectedTransaction.date).toLocaleString()}
                />
              </AdaptiveGlassView>

              <AdaptiveGlassView style={[styles.glassSurface, styles.detailCard]}>
                <Text style={[styles.detailLabel, { color: theme.colors.textSecondary }]}>
                  {transactionsStrings.details.note}
                </Text>
                <Text style={[styles.detailNote, { color: theme.colors.textPrimary }]}>
                  {selectedTransaction.note ?? selectedTransaction.description ?? '—'}
                </Text>
              </AdaptiveGlassView>

              {relatedDebt && (
                <AdaptiveGlassView style={[styles.glassSurface, styles.detailCard]}>
                  <DetailRow
                    label={transactionsStrings.details.relatedDebt}
                    value={relatedDebt.person}
                  />
                </AdaptiveGlassView>
              )}

              <View style={styles.detailButtons}>
                <Pressable
                  style={({ pressed }) => [
                    styles.detailPrimaryButton,
                    { backgroundColor: theme.colors.primary },
                    pressed && styles.pressedOpacity,
                  ]}
                  onPress={handleEditTransaction}
                >
                  <Text style={[styles.detailPrimaryText, { color: theme.colors.onPrimary }]}>
                    {strings.financeScreens.accounts.actions.edit}
                  </Text>
                </Pressable>
                <Pressable
                  style={({ pressed }) => [styles.detailSecondaryButton, pressed && styles.pressedOpacity]}
                  onPress={closeDetails}
                >
                  <Text style={[styles.detailSecondaryText, { color: theme.colors.textPrimary }]}>
                    {transactionsStrings.details.close}
                  </Text>
                </Pressable>
              </View>
            </ScrollView>
          ) : (
            <View style={styles.detailEmpty}>
              <Text style={[styles.detailLabel, { color: theme.colors.textSecondary }]}>
                {transactionsStrings.details.close}
              </Text>
            </View>
          )}
        </SafeAreaView>
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
  detailSafeArea: {
    flex: 1,
    paddingHorizontal: 20,
  },
  detailScroll: {
    paddingTop: 18,
    paddingBottom: 32,
    gap: 16,
  },
  glassSurface: {
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(255,255,255,0.18)',
    backgroundColor: 'rgba(16,16,22,0.82)',
  },
  detailCard: {
    borderRadius: 24,
    paddingVertical: 18,
    paddingHorizontal: 20,
    gap: 12,
  },
  detailTitle: {
    fontSize: 20,
    fontWeight: '700',
    letterSpacing: -0.3,
  },
  detailLabel: {
    fontSize: 13,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.7,
  },
  detailValue: {
    fontSize: 15,
    fontWeight: '600',
    textAlign: 'right',
  },
  detailField: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  detailNote: {
    fontSize: 14,
    lineHeight: 20,
    marginTop: 6,
  },
  detailButtons: {
    marginTop: 8,
    gap: 12,
  },
  detailPrimaryButton: {
    borderRadius: 18,
    paddingVertical: 14,
    alignItems: 'center',
  },
  detailPrimaryText: {
    fontSize: 16,
    fontWeight: '600',
  },
  detailSecondaryButton: {
    borderRadius: 18,
    paddingVertical: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.18)',
  },
  detailSecondaryText: {
    fontSize: 16,
    fontWeight: '600',
  },
  detailEmpty: {
    paddingVertical: 32,
    alignItems: 'center',
  },
  bottomSpacer: {
    height: 40,
  },
});
