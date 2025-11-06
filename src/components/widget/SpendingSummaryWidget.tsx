import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { AdaptiveGlassView } from '@/components/ui/AdaptiveGlassView';
import { useAppTheme } from '@/constants/theme';

interface SpendingCategory {
  label: string;
  amount: number;
}

interface SpendingSummaryWidgetProps {
  categories?: SpendingCategory[];
  total?: number;
  hasData?: boolean;
  dateLabel?: string;
}

const MOCK_CATEGORIES: SpendingCategory[] = [
  { label: 'Food & Dining', amount: 245 },
  { label: 'Transport', amount: 120 },
  { label: 'Shopping', amount: 98 },
];

const PLACEHOLDER_CATEGORIES: SpendingCategory[] = [
  { label: 'No spending tracked', amount: 0 },
  { label: 'Log a purchase to begin', amount: 0 },
];

export default function SpendingSummaryWidget({
  categories,
  total,
  hasData = true,
  dateLabel = '',
}: SpendingSummaryWidgetProps) {
  const theme = useAppTheme();
  const list = hasData ? (categories ?? MOCK_CATEGORIES) : PLACEHOLDER_CATEGORIES;
  const totalSpent = hasData
    ? total ?? list.reduce((sum, item) => sum + item.amount, 0)
    : 0;

  return (
    <View style={styles.container}>
      <AdaptiveGlassView style={[styles.card, { backgroundColor:   theme.colors.card }]}>
        <View style={styles.header}>
          <Text style={[styles.title, { color: theme.colors.textPrimary }]}>Spending Summary</Text>
          <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>
            {dateLabel || (hasData ? new Intl.DateTimeFormat('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
            }).format(new Date()) : '—')}
          </Text>
        </View>

        <View style={styles.body}>
          {list.map((item) => (
            <View key={item.label} style={styles.row}>
              <Text style={[styles.rowLabel, { color: theme.colors.textSecondary }]}>{item.label}</Text>
              <Text style={[styles.rowValue, { color: hasData ? theme.colors.danger : theme.colors.textMuted }]}>
                {hasData ? `-$${item.amount}` : '--'}
              </Text>
            </View>
          ))}
        </View>

        <View style={[styles.footer, { borderTopColor: theme.colors.border }]}>
          <Text style={[styles.footerLabel, { color: theme.colors.textSecondary }]}>Total spent</Text>
          <Text style={[styles.footerValue, { color: hasData ? theme.colors.textPrimary : theme.colors.textMuted }]}>
            {hasData ? `-$${totalSpent}` : '--'}
          </Text>
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
    fontSize: 14,
  },
  rowValue: {
    fontSize: 14,
    fontWeight: '600',
  },
  footer: {
    borderTopWidth: StyleSheet.hairlineWidth,
    paddingTop: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  footerLabel: {
    fontSize: 13,
  },
  footerValue: {
    fontSize: 15,
    fontWeight: '700',
  },
});
