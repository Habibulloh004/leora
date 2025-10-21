import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { Colors } from '@/constants/theme';

const mockWellness = [
  { label: 'Energy', value: 76 },
  { label: 'Mood', value: 82 },
  { label: 'Sleep quality', value: 71 },
];

export default function WellnessOverviewWidget() {
  return (
    <View style={styles.card}>
      <Text style={styles.title}>Wellness Overview</Text>
      <Text style={styles.subtitle}>Self-reported in the last 7 days</Text>

      <View style={styles.scores}>
        {mockWellness.map((item) => (
          <View key={item.label} style={styles.scoreCard}>
            <Text style={styles.scoreValue}>{item.value}</Text>
            <Text style={styles.scoreLabel}>{item.label}</Text>
          </View>
        ))}
      </View>

      <View style={styles.footer}>
        <View style={styles.footerIndicator} />
        <Text style={styles.footerText}>Balanced week — keep up the routines</Text>
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
  subtitle: {
    color: Colors.textSecondary,
    fontSize: 13,
  },
  scores: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  scoreCard: {
    flex: 1,
    backgroundColor: Colors.surfaceElevated,
    borderRadius: 12,
    paddingVertical: 18,
    alignItems: 'center',
    gap: 6,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  scoreValue: {
    color: Colors.primary,
    fontSize: 24,
    fontWeight: '700',
  },
  scoreLabel: {
    color: Colors.textSecondary,
    fontSize: 12,
    textAlign: 'center',
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: Colors.surfaceElevated,
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  footerIndicator: {
    width: 8,
    height: 8,
    borderRadius: 8,
    backgroundColor: Colors.success,
  },
  footerText: {
    color: Colors.textSecondary,
    fontSize: 13,
    flex: 1,
  },
});
