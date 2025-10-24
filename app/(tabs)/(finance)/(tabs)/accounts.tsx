// app/(tabs)/(finance)/(tabs)/accounts.tsx
import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {
  Archive,
  CreditCard,
  DollarSign,
  Edit3,
  PiggyBank,
  Plus,
  Trash2,
  Wallet,
} from 'lucide-react-native';

import { useAppTheme } from '@/constants/theme';
import { AdaptiveGlassView } from '@/components/ui/AdaptiveGlassView';

// ===========================
// Types & Interfaces
// ===========================

type AccountType = 'cash' | 'card' | 'savings' | 'usd';
type TransactionType = 'income' | 'outcome';

interface Transaction {
  id: string;
  type: TransactionType;
  amount: number;
  time: string;
  description?: string;
}

interface Account {
  id: string;
  name: string;
  type: AccountType;
  balance: number;
  currency: string;
  subtitle: string;
  iconColor: string;
  // Special properties
  progress?: number; // For savings accounts (0-100)
  goal?: number; // For savings accounts
  usdRate?: number; // For USD conversion
  transactions?: Transaction[];
}

// ===========================
// Mock Data
// ===========================

const MOCK_ACCOUNTS: Account[] = [
  {
    id: '1',
    name: 'CASH',
    type: 'cash',
    balance: 1_500_000,
    currency: 'UZS',
    subtitle: 'MAIN BALANCE',
    iconColor: '#3b82f6',
    transactions: [
      { id: 't1', type: 'income', amount: 500000, time: 'Today 14:30' },
      { id: 't2', type: 'outcome', amount: 150000, time: 'Today 10:15' },
      { id: 't3', type: 'income', amount: 300000, time: 'Yesterday' },
      { id: 't4', type: 'outcome', amount: 75000, time: '2 Jan 19:45' },
    ],
  },
  {
    id: '2',
    name: 'PLASTIC CARD',
    type: 'card',
    balance: 3_200_000,
    currency: 'UZS',
    subtitle: 'CREDIT CARD',
    iconColor: '#8b5cf6',
    transactions: [
      { id: 't5', type: 'outcome', amount: 250000, time: 'Today 16:22' },
      { id: 't6', type: 'income', amount: 1000000, time: 'Yesterday' },
      { id: 't7', type: 'outcome', amount: 125000, time: '3 days ago' },
    ],
  },
  {
    id: '3',
    name: 'SAVINGS',
    type: 'savings',
    balance: 8_000_000,
    currency: 'UZS',
    subtitle: 'FOR DREAM CAR',
    iconColor: '#10b981',
    progress: 80,
    goal: 10_000_000,
    transactions: [
      { id: 't7', type: 'income', amount: 500000, time: '3 days ago' },
      { id: 't8', type: 'income', amount: 1000000, time: '1 week ago' },
    ],
  },
  {
    id: '4',
    name: 'USD BALANCE',
    type: 'usd',
    balance: 6_225_000,
    currency: 'UZS',
    subtitle: '1 USD = 12,450 UZS',
    iconColor: '#f59e0b',
    usdRate: 12450,
    transactions: [
      { id: 't9', type: 'income', amount: 1245000, time: 'Today 09:00' },
      { id: 't10', type: 'outcome', amount: 622500, time: 'Yesterday' },
      { id: 't11', type: 'income', amount: 498000, time: '2 days ago' },
    ],
  },
];

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

const getIconForType = (type: AccountType) => {
  switch (type) {
    case 'cash':
      return Wallet;
    case 'card':
      return CreditCard;
    case 'savings':
      return PiggyBank;
    case 'usd':
      return DollarSign;
    default:
      return Wallet;
  }
};

// ===========================
// Transaction Row Component with Staggered Animation
// ===========================

interface TransactionRowProps {
  transaction: Transaction;
  theme: ReturnType<typeof useAppTheme>;
  index: number;
  isVisible: boolean;
}

const TransactionRow: React.FC<TransactionRowProps> = ({
  transaction,
  theme,
  index,
  isVisible,
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
        {transaction.type === 'income' ? 'Income' : 'Outcome'}
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
  account: Account;
  isExpanded: boolean;
  isActionMode: boolean;
  onPress: () => void;
  onLongPress: () => void;
  onEdit: () => void;
  onArchive: () => void;
  onDelete: () => void;
  theme: ReturnType<typeof useAppTheme>;
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
}) => {
  const Icon = getIconForType(account.type);

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
                { backgroundColor: account.iconColor + '20' },
              ]}
            >
              <Icon size={24} color={account.iconColor} strokeWidth={2} />
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
                    {account.progress}% of the goal
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
                { backgroundColor: theme.colors.infoBg },
              ]}
              onPress={onEdit}
              activeOpacity={0.7}
            >
              <Edit3 size={18} color={theme.colors.info} strokeWidth={2} />
              <Text style={[styles.actionText, { color: theme.colors.info }]}>Edit</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.actionButton,
                { backgroundColor: theme.colors.warningBg },
              ]}
              onPress={onArchive}
              activeOpacity={0.7}
            >
              <Archive size={18} color={theme.colors.warning} strokeWidth={2} />
              <Text style={[styles.actionText, { color: theme.colors.warning }]}>
                Archive
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.actionButton,
                { backgroundColor: theme.colors.dangerBg },
              ]}
              onPress={onDelete}
              activeOpacity={0.7}
            >
              <Trash2 size={18} color={theme.colors.danger} strokeWidth={2} />
              <Text style={[styles.actionText, { color: theme.colors.danger }]}>
                Delete
              </Text>
            </TouchableOpacity>
          </Animated.View>

          {/* Transaction History Section - Inside Card */}
          {isExpanded && account.transactions && !isActionMode && (
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
                TRANSACTION HISTORY
              </Text>

              <View style={styles.transactionTable}>
                <View
                  style={[
                    styles.transactionsHeader,
                    { backgroundColor: theme.colors.background },
                  ]}
                >
                  <Text style={[styles.headerText, { color: theme.colors.textMuted }]}>
                    Type
                  </Text>
                  <Text style={[styles.headerText, { color: theme.colors.textMuted }]}>
                    Amount
                  </Text>
                  <Text style={[styles.headerText, { color: theme.colors.textMuted }]}>
                    Time
                  </Text>
                </View>

                <View style={styles.transactionsList}>
                  {account.transactions.map((transaction, index) => (
                    <View key={transaction.id}>
                      <TransactionRow
                        transaction={transaction}
                        theme={theme}
                        index={index}
                        isVisible={isExpanded}
                      />
                      {index < account.transactions!.length - 1 && (
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
  const [accounts] = useState<Account[]>(MOCK_ACCOUNTS);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [actionModeId, setActionModeId] = useState<string | null>(null);

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

  const handleEdit = (id: string) => {
    console.log('Edit account:', id);
    setActionModeId(null);
  };

  const handleArchive = (id: string) => {
    console.log('Archive account:', id);
    setActionModeId(null);
  };

  const handleDelete = (id: string) => {
    console.log('Delete account:', id);
    setActionModeId(null);
  };

  const handleAddNew = () => {
    console.log('Add new account');
  };

  return (
    <ScrollView
      style={styles.scrollView}
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
    >
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <View style={[styles.header, { backgroundColor: theme.colors.background }]}>
          <Text style={[styles.headerTitle, { color: theme.colors.textSecondary }]}>
            My accounts
          </Text>
        </View>


        {accounts.map((account) => (
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
    </ScrollView >
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
