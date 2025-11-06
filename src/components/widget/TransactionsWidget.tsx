// src/components/widget/TransactionsWidget.tsx
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { ArrowDownLeft, ArrowUpRight, Dot } from 'lucide-react-native';
import { AdaptiveGlassView } from '@/components/ui/AdaptiveGlassView';
import { useAppTheme } from '@/constants/theme';

interface Transaction {
  id: string;
  type: 'income' | 'expense';
  amount: number;
  currency: string;
  category: string;
  date: string;
}

const MOCK_TRANSACTIONS: Transaction[] = [
  { id: '1', type: 'expense', amount: 45000, currency: 'UZS', category: 'Food', date: '14:30' },
  { id: '2', type: 'income', amount: 500, currency: 'USD', category: 'Salary', date: '09:00' },
  { id: '3', type: 'expense', amount: 15000, currency: 'UZS', category: 'Transport', date: 'Yesterday' },
];

const PLACEHOLDER_TRANSACTIONS: Transaction[] = [
  { id: 'placeholder-1', type: 'expense', amount: 0, currency: '', category: 'No activity logged', date: '--' },
  { id: 'placeholder-2', type: 'income', amount: 0, currency: '', category: 'Start tracking transactions', date: '--' },
];

interface TransactionsWidgetProps {
  transactions?: Transaction[];
  hasData?: boolean;
  dateLabel?: string;
}

export default function TransactionsWidget({
  transactions,
  hasData = true,
  dateLabel = '',
}: TransactionsWidgetProps) {
  const theme = useAppTheme();
  const list = hasData ? (transactions ?? MOCK_TRANSACTIONS) : PLACEHOLDER_TRANSACTIONS;
  const resolvedLabel = dateLabel || (hasData ? new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date()) : '—');

  return (
    <View style={styles.container}>
      <AdaptiveGlassView style={[styles.widget, { backgroundColor:   theme.colors.card }]}>
        <View style={[styles.header, { borderBottomColor: theme.colors.border }]}>
          <View style={styles.titleContainer}>
            <Text style={[styles.title, { color: theme.colors.textSecondary }]}>Transactions</Text>
            <Dot color={theme.colors.textSecondary} />
            <Text style={[styles.title, { color: theme.colors.textSecondary }]}>{resolvedLabel}</Text>
          </View>
          <TouchableOpacity activeOpacity={0.7}>
            <Text style={[styles.menu, { color: theme.colors.textSecondary }]}>⋯</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.transactionsContainer}>
          {list.map((transaction) => (
            <View key={transaction.id} style={[styles.transactionItem, { borderBottomColor: theme.colors.border }]}>
              <View style={[
                styles.iconContainer,
                {
                  backgroundColor: transaction.type === 'income'
                    ? (theme.mode === 'dark' ? '#4CAF5020' : '#4CAF5030')
                    : (theme.mode === 'dark' ? '#F4433620' : '#F4433630'),
                }
              ]}>
                {transaction.type === 'income' ? (
                  <ArrowDownLeft size={20} color={theme.colors.success} />
                ) : (
                  <ArrowUpRight size={20} color={theme.colors.danger} />
                )}
              </View>
              <View style={styles.transactionContent}>
                <Text style={[styles.transactionCategory, { color: theme.colors.textPrimary }]}>
                  {transaction.category}
                </Text>
                <Text style={[styles.transactionDate, { color: theme.colors.textSecondary }]}>
                  {transaction.date}
                </Text>
              </View>
              <Text style={[
                styles.transactionAmount,
                {
                  color: hasData
                    ? transaction.type === 'income'
                      ? theme.colors.success
                      : theme.colors.danger
                    : theme.colors.textMuted,
                }
              ]}>
                {hasData
                  ? `${transaction.type === 'income' ? '+' : '-'}${transaction.amount.toLocaleString()} ${transaction.currency}`
                  : '--'}
              </Text>
            </View>
          ))}
        </View>
      </AdaptiveGlassView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 16,
    marginBottom: 16,
  },
  widget: {
    borderRadius: 16,
    padding: 12,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    borderBottomWidth: 1,
    paddingBottom: 8,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
  },
  menu: {
    fontSize: 20,
  },
  transactionsContainer: {
    gap: 8,
  },
  transactionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    gap: 12,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  transactionContent: {
    flex: 1,
  },
  transactionCategory: {
    fontSize: 16,
    fontWeight: '500',
  },
  transactionDate: {
    fontSize: 12,
    marginTop: 2,
  },
  transactionAmount: {
    fontSize: 16,
    fontWeight: '600',
  },
});
