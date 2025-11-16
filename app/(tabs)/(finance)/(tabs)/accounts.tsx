// app/(tabs)/(finance)/(tabs)/accounts.tsx
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Animated,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import type { LucideIcon } from 'lucide-react-native';
import {
  Archive,
  Banknote,
  Bitcoin,
  Briefcase,
  Building,
  Coins,
  CreditCard,
  DollarSign,
  Edit3,
  PiggyBank,
  Plus,
  Shield,
  Sparkles,
  Trash2,
  TrendingUp,
  Wallet,
} from 'lucide-react-native';

import { useAppTheme } from '@/constants/theme';
import { AdaptiveGlassView } from '@/components/ui/AdaptiveGlassView';
import AddAccountSheet, {
  AddAccountSheetHandle,
} from '@/components/modals/finance/AddAccountSheet';
import { useFinanceStore } from '@/stores/useFinanceStore';
import type {
  AccountItem,
  AccountTransaction,
  AddAccountPayload,
  AccountIconId,
} from '@/types/accounts';
import type { Transaction } from '@/types/store.types';
import { useLocalization } from '@/localization/useLocalization';

type AccountsStrings = ReturnType<typeof useLocalization>['strings']['financeScreens']['accounts'];

// ===========================
// Helper Functions
// ===========================

const formatCurrency = (amount: number, currency: string = 'UZS'): string => {
  if (currency === 'UZS') {
    return new Intl.NumberFormat('en-US').format(amount);
  }
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
  }).format(amount);
};

const CUSTOM_ICON_MAP: Record<AccountIconId, LucideIcon> = {
  wallet: Wallet,
  'credit-card': CreditCard,
  'piggy-bank': PiggyBank,
  bank: Building,
  briefcase: Briefcase,
  coins: Coins,
  sparkles: Sparkles,
  bitcoin: Bitcoin,
  shield: Shield,
  'trending-up': TrendingUp,
};

const getIconForAccount = (account: AccountItem) => {
  if (account.type === 'custom' && account.customIcon) {
    return CUSTOM_ICON_MAP[account.customIcon] ?? Wallet;
  }

  switch (account.type) {
    case 'cash':
      return Wallet;
    case 'card':
      return CreditCard;
    case 'savings':
      return PiggyBank;
    case 'usd':
      return DollarSign;
    case 'crypto':
      return Bitcoin;
    case 'other':
      return Banknote;
    default:
      return Wallet;
  }
};

const formatTransactionTime = (date: Date) => {
  const now = new Date();
  const todayKey = now.toDateString();
  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  const formatter = new Intl.DateTimeFormat('en-US', {
    hour: '2-digit',
    minute: '2-digit',
  });

  if (date.toDateString() === todayKey) {
    return `Today ${formatter.format(date)}`;
  }
  if (date.toDateString() === yesterday.toDateString()) {
    return `Yesterday ${formatter.format(date)}`;
  }

  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
};

const getTransactionTimestamp = (transaction: Transaction): number => {
  if (!transaction?.date) {
    return 0;
  }
  const date = transaction.date instanceof Date ? transaction.date : new Date(transaction.date);
  return Number.isNaN(date.getTime()) ? 0 : date.getTime();
};

const buildAccountHistory = (accountId: string, list: Transaction[]): AccountTransaction[] => {
  return list
    .filter((txn) => txn.accountId === accountId || txn.toAccountId === accountId)
    .sort((a, b) => getTransactionTimestamp(b) - getTransactionTimestamp(a))
    .slice(0, 4)
    .map((txn) => {
      let type: AccountTransaction['type'] = 'income';
      if (txn.type === 'transfer') {
        type = txn.accountId === accountId ? 'outcome' : 'income';
      } else {
        type = txn.type === 'income' ? 'income' : 'outcome';
      }

      return {
        id: txn.id,
        type,
        amount: txn.amount,
        time: formatTransactionTime(new Date(txn.date)),
        description: txn.description,
      };
    });
};

// ===========================
// Transaction Row Component with Staggered Animation
// ===========================

interface TransactionRowProps {
  transaction: AccountTransaction;
  theme: ReturnType<typeof useAppTheme>;
  index: number;
  isVisible: boolean;
  labels: {
    income: string;
    outcome: string;
  };
}

const TransactionRow: React.FC<TransactionRowProps> = ({
  transaction,
  theme,
  index,
  isVisible,
  labels,
}) => {
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(15)).current;

  useEffect(() => {
    if (isVisible) {
      // Staggered animation - each row delayed by 50ms
      Animated.parallel([
        Animated.timing(opacity, {
          toValue: 1,
          duration: 300,
          delay: index * 50,
          useNativeDriver: true,
        }),
        Animated.timing(translateY, {
          toValue: 0,
          duration: 300,
          delay: index * 50,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      // Reset animation values
      opacity.setValue(0);
      translateY.setValue(15);
    }
  }, [isVisible, index, opacity, translateY]);

  const isIncome = transaction.type === 'income';
  const textColor = isIncome ? theme.colors.success : theme.colors.danger;
  const sign = isIncome ? '+' : '-';

  return (
    <Animated.View
      style={[
        styles.transactionRow,
        {
          opacity,
          transform: [{ translateY }],
        },
      ]}
    >
      <Text style={[styles.transactionType, { color: theme.colors.textSecondary }]}>
        {transaction.type === 'income' ? labels.income : labels.outcome}
      </Text>
      <Text style={[styles.transactionAmount, { color: textColor }]}>
        {sign} {formatCurrency(transaction.amount)}
      </Text>
      <Text style={[styles.transactionTime, { color: theme.colors.textMuted }]}>
        {transaction.time}
      </Text>
    </Animated.View>
  );
};

// ===========================
// Account Card Component
// ===========================

interface AccountCardProps {
  account: AccountItem;
  isExpanded: boolean;
  isActionMode: boolean;
  onPress: () => void;
  onLongPress: () => void;
  onEdit: () => void;
  onArchive: () => void;
  onDelete: () => void;
  theme: ReturnType<typeof useAppTheme>;
  strings: AccountsStrings;
}

const AccountCard: React.FC<AccountCardProps> = ({
  account,
  isExpanded,
  isActionMode,
  onPress,
  onLongPress,
  onEdit,
  onArchive,
  onDelete,
  theme,
  strings,
}) => {
  const Icon = getIconForAccount(account);
  const transactions = account.transactions ?? [];
  const transactionLabels = useMemo(
    () => ({ income: strings.income, outcome: strings.outcome }),
    [strings.income, strings.outcome],
  );

  // Animation values
  const historyOpacity = useRef(new Animated.Value(0)).current;
  const historyTranslateY = useRef(new Animated.Value(20)).current;
  const cardScale = useRef(new Animated.Value(1)).current;
  const shadowIntensity = useRef(new Animated.Value(0.08)).current;
  const actionOpacity = useRef(new Animated.Value(0)).current;
  const contentOpacity = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (isExpanded) {
      // Opening animation sequence
      Animated.parallel([
        // Card scale up slightly
        Animated.spring(cardScale, {
          toValue: 1.02,
          friction: 8,
          tension: 100,
          useNativeDriver: true,
        }),
        // Increase shadow intensity
        Animated.timing(shadowIntensity, {
          toValue: 0.18,
          duration: 250,
          useNativeDriver: false,
        }),
        // Transaction history fade + slide up
        Animated.parallel([
          Animated.timing(historyOpacity, {
            toValue: 1,
            duration: 300,
            delay: 50,
            useNativeDriver: true,
          }),
          Animated.spring(historyTranslateY, {
            toValue: 0,
            friction: 10,
            tension: 80,
            delay: 50,
            useNativeDriver: true,
          }),
        ]),
      ]).start();
    } else {
      // Closing animation sequence
      Animated.parallel([
        // Card scale back to normal
        Animated.spring(cardScale, {
          toValue: 1,
          friction: 8,
          tension: 100,
          useNativeDriver: true,
        }),
        // Restore shadow intensity
        Animated.timing(shadowIntensity, {
          toValue: 0.08,
          duration: 250,
          useNativeDriver: false,
        }),
        // Transaction history fade + slide down
        Animated.parallel([
          Animated.timing(historyOpacity, {
            toValue: 0,
            duration: 200,
            useNativeDriver: true,
          }),
          Animated.timing(historyTranslateY, {
            toValue: 20,
            duration: 200,
            useNativeDriver: true,
          }),
        ]),
      ]).start();
    }
  }, [isExpanded, cardScale, shadowIntensity, historyOpacity, historyTranslateY]);

  useEffect(() => {
    if (isActionMode) {
      // Fade to action mode
      Animated.parallel([
        Animated.timing(contentOpacity, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(actionOpacity, {
          toValue: 1,
          duration: 200,
          delay: 150,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      // Fade back to content
      Animated.parallel([
        Animated.timing(actionOpacity, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(contentOpacity, {
          toValue: 1,
          duration: 200,
          delay: 150,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [isActionMode, contentOpacity, actionOpacity]);


  return (
    <Animated.View
      style={[
        styles.cardContainer,
        {
          transform: [{ scale: cardScale }],
        },
      ]}
    >
      <AdaptiveGlassView style={[styles.glassAccountCard,
      {
        backgroundColor: theme.colors.card
      }
      ]}>
        <TouchableOpacity
          activeOpacity={0.95}
          onPress={onPress}
          onLongPress={onLongPress}
        >
          {/* Default Card Content */}
          <Animated.View
            style={[
              styles.cardContent,
              {
                opacity: contentOpacity,
              },
            ]}
            pointerEvents={isActionMode ? 'none' : 'auto'}
          >
            <View
              style={[
                styles.iconCircle,
                { backgroundColor: theme.colors.icon },
              ]}
            >
              <Icon size={24} color={theme.colors.iconText} strokeWidth={2} />
            </View>

            <View style={styles.cardInfo}>
              <Text style={[styles.accountName, { color: theme.colors.textPrimary }]}>
                {account.name}
              </Text>
              <Text style={[styles.accountSubtitle, { color: theme.colors.textMuted }]}>
                {account.subtitle}
              </Text>

              {/* Savings Progress Bar */}
              {account.type === 'savings' && account.progress !== undefined && (
                <View style={styles.progressContainer}>
                  <View
                    style={[
                      styles.progressBar,
                      { backgroundColor: theme.colors.border },
                    ]}
                  >
                    <View
                      style={[
                        styles.progressFill,
                        {
                          width: `${account.progress}%`,
                          backgroundColor: account.iconColor,
                        },
                      ]}
                    />
                  </View>
                  <Text
                    style={[
                      styles.progressText,
                      { color: theme.colors.textSecondary },
                    ]}
                  >
                    {strings.goalProgress.replace('{value}', `${account.progress}`)}
                  </Text>
                </View>
              )}
            </View>

            <View style={styles.balanceContainer}>
              <Text style={[styles.balance, { color: theme.colors.textPrimary }]}>
                {formatCurrency(account.balance)} {account.currency}
              </Text>
              {/* USD Conversion */}
              {account.type === 'usd' && account.usdRate && (
                <Text style={[styles.usdConversion, { color: theme.colors.textMuted }]}>
                  ${formatCurrency(Math.round(account.balance / account.usdRate), 'USD')}
                </Text>
              )}
            </View>
          </Animated.View>

          {/* Action Mode Buttons */}
          <Animated.View
            style={[
              styles.actionButtons,
              {
                opacity: actionOpacity,
              },
            ]}
            pointerEvents={isActionMode ? 'auto' : 'none'}
          >
            <TouchableOpacity
              style={[
                styles.actionButton,
                { backgroundColor: "transparent" },
              ]}
              onPress={onEdit}
              activeOpacity={0.7}
            >
              <Edit3 size={18} color={theme.colors.iconTextSecondary} strokeWidth={2} />
              <Text style={[styles.actionText, { color: theme.colors.iconTextSecondary }]}>
                {strings.actions.edit}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.actionButton,
                { backgroundColor: "transparent" },
              ]}
              onPress={onArchive}
              activeOpacity={0.7}
            >
              <Archive size={18} color={theme.colors.iconTextSecondary} strokeWidth={2} />
              <Text style={[styles.actionText, { color: theme.colors.iconTextSecondary }]}>
                {strings.actions.archive}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.actionButton,
                { backgroundColor: "transparent" },
              ]}
              onPress={onDelete}
              activeOpacity={0.7}
            >
              <Trash2 size={18} color={theme.colors.iconTextSecondary} strokeWidth={2} />
              <Text style={[styles.actionText, { color: theme.colors.iconTextSecondary }]}>
                {strings.actions.delete}
              </Text>
            </TouchableOpacity>
          </Animated.View>

          {/* Transaction History Section - Inside Card */}
          {isExpanded && !isActionMode && transactions.length > 0 && (
            <Animated.View
              style={[
                styles.transactionHistoryInner,
                {
                  backgroundColor:
                    theme.mode === 'dark'
                      ? 'rgba(0, 0, 0, 0.15)'
                      : 'rgba(0, 0, 0, 0.03)',
                  opacity: historyOpacity,
                  transform: [{ translateY: historyTranslateY }],
                },
              ]}
            >
              <Text
                style={[
                  styles.historyTitle,
                  { color: theme.colors.textSecondary },
                ]}
              >
                {strings.historyTitle}
              </Text>

              <View style={styles.transactionTable}>
                <View
                  style={[
                    styles.transactionsHeader,
                    { backgroundColor: theme.colors.background },
                  ]}
                >
                  <Text style={[styles.headerText, { color: theme.colors.textMuted }]}>
                    {strings.historyHeaders.type}
                  </Text>
                  <Text style={[styles.headerText, { color: theme.colors.textMuted }]}>
                    {strings.historyHeaders.amount}
                  </Text>
                  <Text style={[styles.headerText, { color: theme.colors.textMuted }]}>
                    {strings.historyHeaders.time}
                  </Text>
                </View>

                <View style={styles.transactionsList}>
                  {transactions.map((transaction, index) => (
                    <View key={transaction.id}>
                      <TransactionRow
                        transaction={transaction}
                        theme={theme}
                        index={index}
                        isVisible={isExpanded}
                        labels={transactionLabels}
                      />
                      {index < transactions.length - 1 && (
                        <View
                          style={[styles.divider, { backgroundColor: theme.colors.border }]}
                        />
                      )}
                    </View>
                  ))}
                </View>
              </View>
            </Animated.View>
          )}
        </TouchableOpacity>

        {/* Animated shadow overlay */}
        <Animated.View
          style={[
            StyleSheet.absoluteFill,
          ]}
          pointerEvents="none"
        />
      </AdaptiveGlassView>
    </Animated.View>
  );
};

// ===========================
// Main Component
// ===========================

export default function AccountsTab() {
  const theme = useAppTheme();
  const { strings } = useLocalization();
  const accountStrings = strings.financeScreens.accounts;
  const accounts = useFinanceStore((state) => state.accounts);
  const transactions = useFinanceStore((state) => state.transactions);
  const addAccount = useFinanceStore((state) => state.addAccount);
  const editAccount = useFinanceStore((state) => state.editAccount);
  const deleteAccount = useFinanceStore((state) => state.deleteAccount);
  const archiveAccount = useFinanceStore((state) => state.archiveAccount);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [actionModeId, setActionModeId] = useState<string | null>(null);
  const addAccountSheetRef = useRef<AddAccountSheetHandle>(null);
  const visibleAccounts = useMemo(
    () => accounts.filter((account) => !account.isArchived),
    [accounts],
  );
  const preparedAccounts = useMemo(
    () =>
      visibleAccounts.map((account) => ({
        ...account,
        transactions: buildAccountHistory(account.id, transactions),
      })),
    [transactions, visibleAccounts],
  );

  const handleCardPress = (id: string) => {
    if (actionModeId === id) {
      // Exit action mode
      setActionModeId(null);
    } else if (expandedId === id) {
      // Collapse current card
      setExpandedId(null);
    } else {
      // Expand new card (automatically collapses the previous one)
      setExpandedId(id);
      setActionModeId(null);
    }
  };

  const handleLongPress = (id: string) => {
    setActionModeId(id);
    setExpandedId(null);
  };

  const handleEdit = useCallback(
    (id: string) => {
      const account = accounts.find((item) => item.id === id && !item.isArchived);
      if (!account) {
        return;
      }
      setExpandedId(null);
      setActionModeId(null);
      addAccountSheetRef.current?.edit(account);
    },
    [accounts],
  );

  const handleArchive = useCallback(
    (id: string) => {
      archiveAccount(id);
      if (expandedId === id) {
        setExpandedId(null);
      }
      setActionModeId(null);
    },
    [archiveAccount, expandedId],
  );

  const handleDelete = useCallback(
    (id: string) => {
      deleteAccount(id);
      if (expandedId === id) {
        setExpandedId(null);
      }
      setActionModeId(null);
    },
    [deleteAccount, expandedId],
  );

  const handleAddAccountSubmit = useCallback(
    (payload: AddAccountPayload) => {
      addAccount(payload);
    },
    [addAccount],
  );

  const handleEditAccountSubmit = useCallback(
    (id: string, payload: AddAccountPayload) => {
      editAccount(id, payload);
    },
    [editAccount],
  );

  const handleAddNew = useCallback(() => {
    addAccountSheetRef.current?.expand();
  }, []);

  return (
    <>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
          <View style={[styles.header, { backgroundColor: theme.colors.background }]}>
            <Text style={[styles.headerTitle, { color: theme.colors.textSecondary }]}>
              {accountStrings.header}
            </Text>
          </View>


          {preparedAccounts.map((account) => (
            <AccountCard
              key={account.id}
              account={account}
              isExpanded={expandedId === account.id}
              isActionMode={actionModeId === account.id}
              onPress={() => handleCardPress(account.id)}
              onLongPress={() => handleLongPress(account.id)}
              onEdit={() => handleEdit(account.id)}
              onArchive={() => handleArchive(account.id)}
              onDelete={() => handleDelete(account.id)}
              theme={theme}
              strings={accountStrings}
            />
          ))}

          {/* Add New Button */}
          <AdaptiveGlassView style={styles.glass1}>
            <TouchableOpacity
              style={[
                styles.addNewButton,
                {
                  borderColor: theme.colors.border,
                  backgroundColor: 'transparent',
                },
              ]}

              onPress={handleAddNew}
              activeOpacity={0.7}
            >
              <Plus size={24} color={theme.colors.textSecondary} strokeWidth={2} />
            </TouchableOpacity>
          </AdaptiveGlassView>
          <View style={styles.bottomSpacer} />
        </View>
      </ScrollView>
      <AddAccountSheet
        ref={addAccountSheetRef}
        onSubmit={handleAddAccountSubmit}
        onEditSubmit={handleEditAccountSubmit}
      />
    </>
  );
}

// ===========================
// Styles
// ===========================

const styles = StyleSheet.create({
  glass1: {
    borderRadius: 24,
    borderWidth: 0,
  },
  glassAccountCard: {
    borderRadius: 24,
    padding: 2
  },
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 16,
    paddingBottom: 12,
    borderBottomWidth: 0,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '300',
    letterSpacing: -0.5,
  },
  addNewLink: {
    fontSize: 14,
    fontWeight: '500',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 100
  },
  cardContainer: {
    marginBottom: 18,
  },
  card: {
    borderRadius: 24,
    borderWidth: 1,
    overflow: 'hidden',
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 18,
    gap: 14,
  },
  iconCircle: {
    width: 52,
    height: 52,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardInfo: {
    flex: 1,
  },
  accountName: {
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: 0.3,
    marginBottom: 4,
  },
  accountSubtitle: {
    fontSize: 11,
    fontWeight: '500',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    opacity: 0.7,
  },
  progressContainer: {
    marginTop: 10,
  },
  progressBar: {
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 6,
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
    shadowColor: '#10b981',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 4,
  },
  progressText: {
    fontSize: 11,
    fontWeight: '500',
  },
  balanceContainer: {
    alignItems: 'flex-end',
  },
  balance: {
    fontSize: 20,
    fontWeight: '700',
    letterSpacing: -0.3,
  },
  usdConversion: {
    fontSize: 13,
    fontWeight: '500',
    marginTop: 4,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
    padding: 18,
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 14,
    borderRadius: 14,
  },
  actionText: {
    fontSize: 14,
    fontWeight: '600',
  },
  transactionHistoryInner: {
    marginTop: 8,
    paddingHorizontal: 18,
    paddingVertical: 16,
    borderRadius: 16,
    marginHorizontal: 12,
    marginBottom: 12,
  },
  historyTitle: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    marginBottom: 12,
    opacity: 0.7,
  },
  transactionTable: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  transactionsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 8,
  },
  headerText: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    flex: 1,
  },
  transactionsList: {
    marginTop: 4,
  },
  transactionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  transactionType: {
    fontSize: 14,
    fontWeight: '500',
    flex: 1,
  },
  transactionAmount: {
    fontSize: 14,
    fontWeight: '700',
    flex: 1,
    textAlign: 'center',
  },
  transactionTime: {
    fontSize: 13,
    fontWeight: '400',
    flex: 1,
    textAlign: 'right',
  },
  divider: {
    height: 1,
    marginHorizontal: 12,
  },
  addNewButton: {
    height: 80,
    borderRadius: 24,
    borderWidth: Platform.OS === "ios" ? 0 : 2,
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    width: "100%"
  },
  bottomSpacer: {
    height: 40,
  },
});
