import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { Colors } from '@/constants/theme';

const mockCategories = [
  { label: 'Food & Dining', amount: 245 },
  { label: 'Transport', amount: 120 },
  { label: 'Shopping', amount: 98 },
];

export default function SpendingSummaryWidget() {
  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.title}>Spending Summary</Text>
        <Text style={styles.subtitle}>This month</Text>
      </View>

      <View style={styles.body}>
        {mockCategories.map((item) => (
          <View key={item.label} style={styles.row}>
            <Text style={styles.rowLabel}>{item.label}</Text>
            <Text style={styles.rowValue}>-${item.amount}</Text>
          </View>
        ))}
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerLabel}>Total spent</Text>
        <Text style={styles.footerValue}>-$463</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    marginHorizontal: 16,
    backgroundColor: Colors.background,
    borderRadius: 16,
    padding: 16,
    gap: 16,
    borderWidth: 2,
    borderColor: Colors.border,
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
  body: {
    gap: 10,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  rowLabel: {
    color: Colors.textSecondary,
    fontSize: 14,
  },
  rowValue: {
    color: Colors.danger,
    fontSize: 14,
    fontWeight: '600',
  },
  footer: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: Colors.border,
    paddingTop: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  footerLabel: {
    color: Colors.textSecondary,
    fontSize: 13,
  },
  footerValue: {
    color: Colors.textPrimary,
    fontSize: 15,
    fontWeight: '700',
  },
});
