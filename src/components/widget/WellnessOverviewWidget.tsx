import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { AdaptiveGlassView } from '@/components/ui/AdaptiveGlassView';
import { useAppTheme } from '@/constants/theme';

interface WellnessMetric {
  label: string;
  value: number;
}

interface WellnessOverviewWidgetProps {
  metrics?: WellnessMetric[];
  statusMessage?: string;
  hasData?: boolean;
  dateLabel?: string;
}

const MOCK_WELLNESS: WellnessMetric[] = [
  { label: 'Energy', value: 76 },
  { label: 'Mood', value: 82 },
  { label: 'Sleep quality', value: 71 },
];

const PLACEHOLDER_WELLNESS: WellnessMetric[] = [
  { label: 'Energy', value: 0 },
  { label: 'Mood', value: 0 },
  { label: 'Sleep quality', value: 0 },
];

export default function WellnessOverviewWidget({
  metrics,
  statusMessage,
  hasData = true,
  dateLabel = '',
}: WellnessOverviewWidgetProps) {
  const theme = useAppTheme();
  const metricList = hasData ? (metrics ?? MOCK_WELLNESS) : PLACEHOLDER_WELLNESS;
  const footerText = hasData
    ? statusMessage ?? 'Balanced week — keep up the routines'
    : 'Log your wellness check-ins to unlock insights';
  const valueColor = hasData ? theme.colors.textSecondary : theme.colors.textMuted;

  return (
    <View style={styles.container}>
      <AdaptiveGlassView style={[styles.card, { backgroundColor:   theme.colors.card }]}>
        <Text style={[styles.title, { color: theme.colors.textPrimary }]}>Wellness Overview</Text>
        <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>
          {dateLabel || (hasData ? new Intl.DateTimeFormat('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
          }).format(new Date()) : '—')}
        </Text>

        <View style={styles.scores}>
          {metricList.map((item) => (
            <View key={item.label} style={[styles.scoreCard, {
              backgroundColor: theme.colors.cardItem,
              borderColor: theme.colors.border
            }]}>
              <Text style={[styles.scoreValue, { color: valueColor }]}>
                {hasData ? item.value : '--'}
              </Text>
              <Text style={[styles.scoreLabel, { color: theme.colors.textSecondary }]}>{item.label}</Text>
            </View>
          ))}
        </View>

        <View style={[styles.footer, {
          backgroundColor: theme.colors.cardItem,
          borderColor: theme.colors.border
        }]}>
          <View style={[styles.footerIndicator, {
            backgroundColor: hasData ? theme.colors.textSecondary : theme.colors.textMuted,
          }]} />
          <Text style={[styles.footerText, { color: theme.colors.textSecondary }]}>{footerText}</Text>
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
  subtitle: {
    fontSize: 13,
  },
  scores: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  scoreCard: {
    flex: 1,
    borderRadius: 12,
    paddingVertical: 18,
    alignItems: 'center',
    gap: 6,
    borderWidth: 1,
  },
  scoreValue: {
    fontSize: 24,
    fontWeight: '700',
  },
  scoreLabel: {
    fontSize: 12,
    textAlign: 'center',
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
  },
  footerIndicator: {
    width: 8,
    height: 8,
    borderRadius: 8,
  },
  footerText: {
    fontSize: 13,
    flex: 1,
  },
});
