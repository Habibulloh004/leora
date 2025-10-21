import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Dot, Flame } from 'lucide-react-native';

import { Colors } from '@/constants/theme';

interface WeeklyStats {
  tasksCompleted: number;
  totalTasks: number;
  focusHours: number;
  streak: number;
}

const MOCK_STATS: WeeklyStats = {
  tasksCompleted: 34,
  totalTasks: 42,
  focusHours: 28.5,
  streak: 7,
};

export default function WeeklyReviewWidget() {
  const completionRate = Math.round((MOCK_STATS.tasksCompleted / MOCK_STATS.totalTasks) * 100);

  return (
    <View style={styles.container}>
      <View style={styles.widget}>
        <View style={styles.header}>
          <View style={styles.titleContainer}>
            <Text style={styles.title}>Weekly Review</Text>
            <Dot color="#7E8491" />
            <Text style={styles.title}>Jan 6-12</Text>
          </View>
          <TouchableOpacity activeOpacity={0.7}>
            <Text style={styles.menu}>⋯</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{completionRate}%</Text>
            <Text style={styles.statLabel}>Completion</Text>
          </View>

          <View style={styles.statCard}>
            <Text style={styles.statValue}>{MOCK_STATS.focusHours}h</Text>
            <Text style={styles.statLabel}>Focus Time</Text>
          </View>

          <View style={[styles.statCard, styles.fullWidth]}>
            <View style={styles.streakRow}>
              <Flame size={16} color={Colors.warning} />
              <Text style={styles.statValue}>{MOCK_STATS.streak} days</Text>
            </View>
            <Text style={styles.statLabel}>Current streak</Text>
          </View>
        </View>

        <Text style={styles.summary}>
          Great week! You completed {MOCK_STATS.tasksCompleted} of {MOCK_STATS.totalTasks} tasks.
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#34343D',
  },
  widget: {
    backgroundColor: '#25252B',
    borderRadius: 16,
    marginTop: 6,
    padding: 12,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    borderBottomWidth: 2,
    borderBottomColor: '#34343D',
    paddingBottom: 8,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: '#7E8491',
  },
  menu: {
    fontSize: 20,
    color: '#888888',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 12,
  },
  statCard: {
    flex: 1,
    minWidth: '47%',
    backgroundColor: '#34343D',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  fullWidth: {
    minWidth: '100%',
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#7E8491',
  },
  summary: {
    fontSize: 14,
    color: '#A6A6B9',
    textAlign: 'center',
    lineHeight: 20,
  },
  streakRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
});
