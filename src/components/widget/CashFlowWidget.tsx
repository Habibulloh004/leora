import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { Colors } from '@/constants/theme';

const mockCashFlow = [
  { label: 'Mon', income: 220, expense: 180 },
  { label: 'Tue', income: 180, expense: 210 },
  { label: 'Wed', income: 260, expense: 190 },
  { label: 'Thu', income: 150, expense: 170 },
  { label: 'Fri', income: 200, expense: 140 },
];

export default function CashFlowWidget() {
  const totalIncome = mockCashFlow.reduce((sum, day) => sum + day.income, 0);
  const totalExpense = mockCashFlow.reduce((sum, day) => sum + day.expense, 0);
  const net = totalIncome - totalExpense;

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.title}>Cash Flow</Text>
        <Text style={styles.subtitle}>Last 5 days</Text>
      </View>

      <View style={styles.summaryRow}>
        <View style={styles.summaryItem}>
          <Text style={styles.summaryLabel}>Income</Text>
          <Text style={[styles.summaryValue, styles.incomeValue]}>${totalIncome}</Text>
        </View>
        <View style={styles.summaryItem}>
          <Text style={styles.summaryLabel}>Expenses</Text>
          <Text style={[styles.summaryValue, styles.expenseValue]}>${totalExpense}</Text>
        </View>
        <View style={styles.summaryItem}>
          <Text style={styles.summaryLabel}>Net</Text>
          <Text style={[styles.summaryValue, net >= 0 ? styles.incomeValue : styles.expenseValue]}>
            ${net}
          </Text>
        </View>
      </View>

      <View style={styles.table}>
        {mockCashFlow.map((day) => (
          <View key={day.label} style={styles.tableRow}>
            <Text style={styles.dayLabel}>{day.label}</Text>
            <Text style={[styles.tableValue, styles.incomeValue]}>+${day.income}</Text>
            <Text style={[styles.tableValue, styles.expenseValue]}>-${day.expense}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.background,
    borderRadius: 16,
    padding: 16,
    gap: 16,
    borderWidth: 2,
    borderColor: Colors.border,
    marginHorizontal: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    color: Colors.textPrimary,
    fontSize: 16,
    fontWeight: '700',
  },
  subtitle: {
    color: Colors.textSecondary,
    fontSize: 13,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  summaryItem: {
    flex: 1,
    backgroundColor: Colors.surfaceElevated,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  summaryLabel: {
    color: Colors.textSecondary,
    fontSize: 12,
    marginBottom: 4,
  },
  summaryValue: {
    fontSize: 15,
    fontWeight: '700',
  },
  incomeValue: {
    color: Colors.success,
  },
  expenseValue: {
    color: Colors.danger,
  },
  table: {
    gap: 8,
  },
  tableRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
  },
  dayLabel: {
    flex: 1,
    color: Colors.textSecondary,
    fontSize: 13,
  },
  tableValue: {
    fontSize: 13,
    fontWeight: '600',
  },
});
