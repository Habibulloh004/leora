import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { Colors } from '@/constants/theme';

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
  return (
    <View style={styles.card}>
      <Text style={styles.title}>Productivity Insights</Text>

      <View style={styles.metricsRow}>
        {mockMetrics.map((metric) => (
          <View key={metric.label} style={styles.metric}>
            <Text style={styles.metricLabel}>{metric.label}</Text>
            <Text style={styles.metricValue}>
              {metric.value}
              <Text style={styles.metricSuffix}>{metric.suffix}</Text>
            </Text>
          </View>
        ))}
      </View>

      <View style={styles.trendHeader}>
        <Text style={styles.trendTitle}>Focus trend</Text>
        <Text style={styles.trendHint}>+7 vs last week</Text>
      </View>

      <View style={styles.trendBars}>
        {mockTrend.map((point) => (
          <View key={point.label} style={styles.trendItem}>
            <View style={styles.trendBarContainer}>
              <View style={[styles.trendBar, { height: `${point.value}%` }]} />
            </View>
            <Text style={styles.trendLabel}>{point.label}</Text>
          </View>
        ))}
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
  title: {
    color: Colors.textPrimary,
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
    backgroundColor: Colors.surfaceElevated,
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  metricLabel: {
    color: Colors.textSecondary,
    fontSize: 12,
    marginBottom: 4,
  },
  metricValue: {
    color: Colors.textPrimary,
    fontSize: 18,
    fontWeight: '700',
  },
  metricSuffix: {
    fontSize: 12,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  trendHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  trendTitle: {
    color: Colors.textPrimary,
    fontSize: 14,
    fontWeight: '600',
  },
  trendHint: {
    color: Colors.success,
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
    backgroundColor: Colors.surfaceElevated,
    justifyContent: 'flex-end',
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  trendBar: {
    width: '100%',
    backgroundColor: Colors.primary,
    borderRadius: 8,
  },
  trendLabel: {
    marginTop: 6,
    fontSize: 12,
    color: Colors.textSecondary,
  },
});
