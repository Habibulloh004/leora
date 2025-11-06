import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { AdaptiveGlassView } from '@/components/ui/AdaptiveGlassView';
import { useAppTheme } from '@/constants/theme';

interface BudgetItem {
  label: string;
  used: number;
  total: number;
}

interface BudgetProgressWidgetProps {
  budgets?: BudgetItem[];
  hasData?: boolean;
  dateLabel?: string;
}

const MOCK_BUDGETS: BudgetItem[] = [
  { label: 'Housing', used: 820, total: 1000 },
  { label: 'Groceries', used: 310, total: 400 },
  { label: 'Entertainment', used: 140, total: 250 },
];

const PLACEHOLDER_BUDGETS: BudgetItem[] = [
  { label: 'No budgets configured', used: 0, total: 0 },
  { label: 'Add a budget to track', used: 0, total: 0 },
];

export default function BudgetProgressWidget({
  budgets,
  hasData = true,
  dateLabel = '',
}: BudgetProgressWidgetProps) {
  const theme = useAppTheme();
  const list = hasData ? (budgets ?? MOCK_BUDGETS) : PLACEHOLDER_BUDGETS;

  return (
    <View style={styles.container}>
      <AdaptiveGlassView
        style={[styles.card, { backgroundColor: theme.colors.card }]}>
        <View style={styles.header}>
          <Text style={[styles.title, { color: theme.colors.textPrimary }]}>Budget Progress</Text>
          <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>
            {dateLabel || (hasData ? new Intl.DateTimeFormat('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
            }).format(new Date()) : '—')}
          </Text>
        </View>
        <View style={styles.list}>
          {list.map((item) => {
            const progress = item.total > 0 ? item.used / item.total : 0;
            return (
              <View key={item.label} style={styles.row}>
                <View style={styles.rowHeader}>
                  <Text style={[styles.rowLabel, { color: theme.colors.textSecondary }]}>{item.label}</Text>
                  <Text style={[styles.rowValue, { color: hasData ? theme.colors.textPrimary : theme.colors.textMuted }]}>
                    {hasData ? `$${item.used} / $${item.total}` : '--'}
                  </Text>
                </View>
                <View style={[styles.progressBackground, { backgroundColor: theme.colors.surfaceElevated }]}>
                  <View
                    style={[
                      styles.progressFill,
                      {
                        width: hasData ? `${Math.min(progress * 100, 100)}%` : '6%',
                        backgroundColor: hasData ? theme.colors.success : `${theme.colors.textSecondary}30`,
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
  },
  subtitle: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
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
