import React from 'react';
import { Platform, StyleSheet, Text, View } from 'react-native';
import { AdaptiveGlassView } from '@/components/ui/AdaptiveGlassView';
import { useAppTheme } from '@/constants/theme';

const mockBudgets = [
  { label: 'Housing', used: 820, total: 1000 },
  { label: 'Groceries', used: 310, total: 400 },
  { label: 'Entertainment', used: 140, total: 250 },
];

export default function BudgetProgressWidget() {
  const theme = useAppTheme();

  return (
    <View style={styles.container}>
      <AdaptiveGlassView
        style={[styles.card, { backgroundColor: theme.colors.card }]}>
        <Text style={[styles.title, { color: theme.colors.textPrimary }]}>Budget Progress</Text>
        <View style={styles.list}>
          {mockBudgets.map((item) => {
            const progress = item.used / item.total;
            return (
              <View key={item.label} style={styles.row}>
                <View style={styles.rowHeader}>
                  <Text style={[styles.rowLabel, { color: theme.colors.textSecondary }]}>{item.label}</Text>
                  <Text style={[styles.rowValue, { color: theme.colors.textPrimary }]}>
                    ${item.used} / ${item.total}
                  </Text>
                </View>
                <View style={[styles.progressBackground, { backgroundColor: theme.colors.surfaceElevated }]}>
                  <View
                    style={[
                      styles.progressFill,
                      {
                        width: `${Math.min(progress * 100, 100)}%`,
                        backgroundColor: theme.colors.success,
                      },
                    ]}
                  />
                </View>
              </View>
            );
          })}
        </View>
      </AdaptiveGlassView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 16,
  },
  card: {
    borderRadius: 16,
    padding: 16,
    gap: 16,
  },
  title: {
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
    fontSize: 14,
  },
  rowValue: {
    fontSize: 13,
    fontWeight: '600',
  },
  progressBackground: {
    height: 8,
    borderRadius: 8,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 8,
  },
});
