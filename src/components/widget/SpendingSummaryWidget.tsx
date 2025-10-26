import React from 'react';
import { Platform, StyleSheet, Text, View } from 'react-native';
import { AdaptiveGlassView } from '@/components/ui/AdaptiveGlassView';
import { useAppTheme } from '@/constants/theme';

const mockCategories = [
  { label: 'Food & Dining', amount: 245 },
  { label: 'Transport', amount: 120 },
  { label: 'Shopping', amount: 98 },
];

export default function SpendingSummaryWidget() {
  const theme = useAppTheme();

  return (
    <View style={styles.container}>
      <AdaptiveGlassView style={[styles.card, { backgroundColor:   theme.colors.card }]}>
        <View style={styles.header}>
          <Text style={[styles.title, { color: theme.colors.textPrimary }]}>Spending Summary</Text>
          <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>This month</Text>
        </View>

        <View style={styles.body}>
          {mockCategories.map((item) => (
            <View key={item.label} style={styles.row}>
              <Text style={[styles.rowLabel, { color: theme.colors.textSecondary }]}>{item.label}</Text>
              <Text style={[styles.rowValue, { color: theme.colors.danger }]}>-${item.amount}</Text>
            </View>
          ))}
        </View>

        <View style={[styles.footer, { borderTopColor: theme.colors.border }]}>
          <Text style={[styles.footerLabel, { color: theme.colors.textSecondary }]}>Total spent</Text>
          <Text style={[styles.footerValue, { color: theme.colors.textPrimary }]}>-$463</Text>
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
