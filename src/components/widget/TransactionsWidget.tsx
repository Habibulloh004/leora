// src/components/widget/TransactionsWidget.tsx
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { ArrowDownLeft, ArrowUpRight, Dot } from 'lucide-react-native';

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

export default function TransactionsWidget() {
  return (
    <View style={styles.container}>
      <View style={styles.widget}>
        <View style={styles.header}>
          <View style={styles.titleContainer}>
            <Text style={styles.title}>Transactions</Text>
            <Dot color="#7E8491" />
            <Text style={styles.title}>Recent</Text>
          </View>
          <TouchableOpacity activeOpacity={0.7}>
            <Text style={styles.menu}>⋯</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.transactionsContainer}>
          {MOCK_TRANSACTIONS.map(transaction => (
            <View key={transaction.id} style={styles.transactionItem}>
              <View style={[
                styles.iconContainer,
                { backgroundColor: transaction.type === 'income' ? '#4CAF5020' : '#F4433620' }
              ]}>
                {transaction.type === 'income' ? (
                  <ArrowDownLeft size={20} color="#4CAF50" />
                ) : (
                  <ArrowUpRight size={20} color="#F44336" />
                )}
              </View>
              <View style={styles.transactionContent}>
                <Text style={styles.transactionCategory}>{transaction.category}</Text>
                <Text style={styles.transactionDate}>{transaction.date}</Text>
              </View>
              <Text style={[
                styles.transactionAmount,
                { color: transaction.type === 'income' ? '#4CAF50' : '#F44336' }
              ]}>
                {transaction.type === 'income' ? '+' : '-'}
                {transaction.amount.toLocaleString()} {transaction.currency}
              </Text>
            </View>
          ))}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#34343D',
  },
  widget: {
    backgroundColor: '#25252B',
    borderRadius: 16,
    marginTop: 6,
    padding: 12,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    borderBottomWidth: 2,
    borderBottomColor: '#34343D',
    paddingBottom: 8,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: '#7E8491',
  },
  menu: {
    fontSize: 20,
    color: '#888888',
  },
  transactionsContainer: {
    gap: 8,
  },
  transactionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 2,
    borderBottomColor: '#34343D',
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
    color: '#FFFFFF',
    fontWeight: '500',
  },
  transactionDate: {
    fontSize: 12,
    color: '#7E8491',
    marginTop: 2,
  },
  transactionAmount: {
    fontSize: 16,
    fontWeight: '600',
  },
});