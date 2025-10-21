// app/(tabs)/(finance)/(tabs)/index.tsx
import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { ArrowDownLeft, ArrowUpRight } from 'lucide-react-native';

import BalanceCard from '@/components/screens/finance/BalanceCard';
import { Colors } from '@/constants/theme';

const STATS = [
  { label: 'Accounts', value: '3', tone: Colors.info },
  { label: 'Budgets', value: '1', tone: Colors.success },
  { label: 'Debts', value: '2', tone: Colors.warning },
  { label: 'This Month', value: '-2,040', tone: Colors.danger },
];

const RECENT_TRANSACTIONS = [
  {
    id: '1',
    type: 'income',
    category: 'Salary',
    description: 'Monthly payment',
    amount: 1000000,
    currency: 'USD',
    date: 'Today, 09:00',
  },
  {
    id: '2',
    type: 'expense',
    category: 'Food',
    description: 'Korzinka Market',
    amount: 45000,
    currency: 'UZS',
    date: 'Today, 14:30',
  },
  {
    id: '3',
    type: 'expense',
    category: 'Transport',
    description: 'Yandex Taxi',
    amount: 15000,
    currency: 'UZS',
    date: 'Yesterday',
  },
];

export default function OverviewTab() {
  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <BalanceCard
        balance={101017960}
        currency="USD"
        change={100}
        period="30 days"
      />

      {/* Stats Grid */}
      <View style={styles.statsGrid}>
        {STATS.map((stat) => (
          <View key={stat.label} style={styles.statCard}>
            <View style={[styles.statDot, { backgroundColor: stat.tone }]} />
            <Text style={styles.statLabel}>{stat.label}</Text>
            <Text
              style={[
                styles.statValue,
                stat.value.startsWith('-') && styles.negativeValue,
              ]}
            >
              {stat.value}
            </Text>
          </View>
        ))}
      </View>

      {/* Recent Transactions */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Recent transactions</Text>
          <TouchableOpacity>
            <Text style={styles.seeAllButton}>See all</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.transactionsList}>
          {RECENT_TRANSACTIONS.map((transaction) => (
            <TouchableOpacity key={transaction.id} style={styles.transactionItem}>
              <View style={[
                styles.transactionIcon,
                { backgroundColor: transaction.type === 'income' ? Colors.successBg : Colors.dangerBg }
              ]}>
                {transaction.type === 'income' ? (
                  <ArrowDownLeft size={18} color={Colors.success} />
                ) : (
                  <ArrowUpRight size={18} color={Colors.danger} />
                )}
              </View>

              <View style={styles.transactionInfo}>
                <Text style={styles.transactionCategory}>{transaction.category}</Text>
                <Text style={styles.transactionDescription}>{transaction.description}</Text>
                <Text style={styles.transactionDate}>{transaction.date}</Text>
              </View>

              <View style={styles.transactionAmount}>
                <Text style={[
                  styles.amountText,
                  { color: transaction.type === 'income' ? Colors.success : Colors.danger }
                ]}>
                  {transaction.type === 'income' ? '+' : '-'}
                  {transaction.amount.toLocaleString()} {transaction.currency}
                </Text>
              </View>
            </TouchableOpacity>
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
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 16,
    gap: 12,
    marginBottom: 16,
  },
  statCard: {
    flex: 1,
    minWidth: '46%',
    backgroundColor: Colors.surface,
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: 6,
  },
  statLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  statValue: {
    fontSize: 22,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  negativeValue: {
    color: Colors.danger,
  },
  section: {
    paddingHorizontal: 16,
    marginBottom: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  seeAllButton: {
    fontSize: 12,
    color: Colors.textSecondary,
    fontWeight: '500',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  transactionsList: {
    gap: 12,
  },
  transactionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: 14,
    padding: 12,
    gap: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  transactionIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  transactionInfo: {
    flex: 1,
  },
  transactionCategory: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginBottom: 2,
  },
  transactionDescription: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginBottom: 2,
  },
  transactionDate: {
    fontSize: 11,
    color: Colors.textTertiary,
  },
  transactionAmount: {
    alignItems: 'flex-end',
  },
  amountText: {
    fontSize: 14,
    fontWeight: '600',
  },
  bottomSpacer: {
    height: 100,
  },
  statDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
});
