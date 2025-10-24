import React from 'react';
import { Platform, StyleSheet, Text, View } from 'react-native';
import { AdaptiveGlassView } from '@/components/ui/AdaptiveGlassView';
import { useAppTheme } from '@/constants/theme';

const mockMetrics = [
  { label: 'Focus score', value: '82', suffix: '/100' },
  { label: 'Tasks completed', value: '14', suffix: '/18' },
  { label: 'Deep work hrs', value: '6.5', suffix: 'h' },
];

const mockTrend = [
  { label: 'Mon', value: 68 },
  { label: 'Tue', value: 74 },
  { label: 'Wed', value: 80 },
  { label: 'Thu', value: 85 },
  { label: 'Fri', value: 89 },
];

export default function ProductivityInsightsWidget() {
  const theme = useAppTheme();

  return (
    <View style={styles.container}>
      <AdaptiveGlassView style={[styles.card, { backgroundColor: Platform.OS === "ios" ? "transparent" : theme.colors.card }]}>
        <Text style={[styles.title, { color: theme.colors.textPrimary }]}>Productivity Insights</Text>

        <View style={styles.metricsRow}>
          {mockMetrics.map((metric) => (
            <View key={metric.label} style={[styles.metric, {
              backgroundColor: theme.colors.surfaceElevated,
              borderColor: theme.colors.border
            }]}>
              <Text style={[styles.metricLabel, { color: theme.colors.textSecondary }]}>{metric.label}</Text>
              <Text style={[styles.metricValue, { color: theme.colors.textPrimary }]}>
                {metric.value}
                <Text style={[styles.metricSuffix, { color: theme.colors.textSecondary }]}>{metric.suffix}</Text>
              </Text>
            </View>
          ))}
        </View>

        <View style={styles.trendHeader}>
          <Text style={[styles.trendTitle, { color: theme.colors.textPrimary }]}>Focus trend</Text>
          <Text style={[styles.trendHint, { color: theme.colors.success }]}>+7 vs last week</Text>
        </View>

        <View style={styles.trendBars}>
          {mockTrend.map((point) => (
            <View key={point.label} style={styles.trendItem}>
              <View style={[styles.trendBarContainer, {
                backgroundColor: theme.colors.surfaceElevated,
                borderColor: theme.colors.border
              }]}>
                <View style={[styles.trendBar, {
                  height: `${point.value}%`,
                  backgroundColor: theme.colors.primary
                }]} />
              </View>
              <Text style={[styles.trendLabel, { color: theme.colors.textSecondary }]}>{point.label}</Text>
            </View>
          ))}
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
  metricsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  metric: {
    flex: 1,
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderWidth: 1,
  },
  metricLabel: {
    fontSize: 12,
    marginBottom: 4,
  },
  metricValue: {
    fontSize: 18,
    fontWeight: '700',
  },
  metricSuffix: {
    fontSize: 12,
    fontWeight: '500',
  },
  trendHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  trendTitle: {
    fontSize: 14,
    fontWeight: '600',
  },
  trendHint: {
    fontSize: 12,
  },
  trendBars: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    gap: 12,
  },
  trendItem: {
    alignItems: 'center',
    flex: 1,
  },
  trendBarContainer: {
    width: '100%',
    height: 80,
    borderRadius: 8,
    justifyContent: 'flex-end',
    overflow: 'hidden',
    borderWidth: 1,
  },
  trendBar: {
    width: '100%',
    borderRadius: 8,
  },
  trendLabel: {
    marginTop: 6,
    fontSize: 12,
  },
});
