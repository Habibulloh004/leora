import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { Colors } from '@/constants/theme';

const mockBudgets = [
  { label: 'Housing', used: 820, total: 1000 },
  { label: 'Groceries', used: 310, total: 400 },
  { label: 'Entertainment', used: 140, total: 250 },
];

function ProgressBar({ progress }: { progress: number }) {
  return (
    <View style={styles.progressBackground}>
      <View style={[styles.progressFill, { width: `${Math.min(progress * 100, 100)}%` }]} />
    </View>
  );
}

export default function BudgetProgressWidget() {
  return (
    <View style={styles.card}>
      <Text style={styles.title}>Budget Progress</Text>
      <View style={styles.list}>
        {mockBudgets.map((item) => {
          const progress = item.used / item.total;
          return (
            <View key={item.label} style={styles.row}>
              <View style={styles.rowHeader}>
                <Text style={styles.rowLabel}>{item.label}</Text>
                <Text style={styles.rowValue}>
                  ${item.used} / ${item.total}
                </Text>
              </View>
              <ProgressBar progress={progress} />
            </View>
          );
        })}
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
  title: {
    color: Colors.textPrimary,
    fontSize: 16,
    fontWeight: '700',
  },
  list: {
    gap: 14,
  },
  row: {
    gap: 8,
  },
  rowHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  rowLabel: {
    color: Colors.textSecondary,
    fontSize: 14,
  },
  rowValue: {
    color: Colors.textPrimary,
    fontSize: 13,
    fontWeight: '600',
  },
  progressBackground: {
    height: 8,
    borderRadius: 8,
    backgroundColor: Colors.surfaceElevated,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 8,
    backgroundColor: Colors.success,
  },
});
