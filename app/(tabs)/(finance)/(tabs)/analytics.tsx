import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { LineChart } from 'lucide-react-native';

import { Colors } from '@/constants/Colors';

export default function AnalyticsTab() {
  return (
    <ScrollView style={styles.container}>
      <View style={styles.placeholder}>
        <View style={styles.iconBadge}>
          <LineChart size={28} color={Colors.textPrimary} strokeWidth={2} />
        </View>
        <Text style={styles.placeholderTitle}>Analytics</Text>
        <Text style={styles.placeholderSubtitle}>Insights are on the way…</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  placeholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 100,
    gap: 12,
  },
  iconBadge: {
    width: 56,
    height: 56,
    borderRadius: 28,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeholderTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  placeholderSubtitle: {
    fontSize: 13,
    color: Colors.textSecondary,
  },
});
