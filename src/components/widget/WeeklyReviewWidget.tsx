import React from 'react';
import { Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Dot, Flame } from 'lucide-react-native';
import { AdaptiveGlassView } from '@/components/ui/AdaptiveGlassView';
import { useAppTheme } from '@/constants/theme';

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
  const theme = useAppTheme();
  const completionRate = Math.round((MOCK_STATS.tasksCompleted / MOCK_STATS.totalTasks) * 100);

  return (
    <View style={styles.container}>
      <AdaptiveGlassView style={[styles.widget, { backgroundColor: Platform.OS === "ios" ? "transparent" : theme.colors.card }]}>
        <View style={[styles.header, { borderBottomColor: theme.colors.border }]}>
          <View style={styles.titleContainer}>
            <Text style={[styles.title, { color: theme.colors.textSecondary }]}>Weekly Review</Text>
            <Dot color={theme.colors.textSecondary} />
            <Text style={[styles.title, { color: theme.colors.textSecondary }]}>Jan 6-12</Text>
          </View>
          <TouchableOpacity activeOpacity={0.7}>
            <Text style={[styles.menu, { color: theme.colors.textSecondary }]}>⋯</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.statsGrid}>
          <View style={[styles.statCard, { backgroundColor: theme.colors.cardItem }]}>
            <Text style={[styles.statValue, { color: theme.colors.textPrimary }]}>{completionRate}%</Text>
            <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>Completion</Text>
          </View>

          <View style={[styles.statCard, { backgroundColor: theme.colors.cardItem }]}>
            <Text style={[styles.statValue, { color: theme.colors.textPrimary }]}>{MOCK_STATS.focusHours}h</Text>
            <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>Focus Time</Text>
          </View>

          <View style={[styles.statCard, styles.fullWidth, { backgroundColor: theme.colors.cardItem }]}>
            <View style={styles.streakRow}>
              <Flame size={16} color={theme.colors.warning} />
              <Text style={[styles.statValue, { color: theme.colors.textPrimary }]}>{MOCK_STATS.streak} days</Text>
            </View>
            <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>Current streak</Text>
          </View>
        </View>

        <Text style={[styles.summary, { color: theme.colors.textSecondary }]}>
          Great week! You completed {MOCK_STATS.tasksCompleted} of {MOCK_STATS.totalTasks} tasks.
        </Text>
      </AdaptiveGlassView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 16,
    marginBottom: 16,
  },
  widget: {
    borderRadius: 16,
    padding: 12,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    borderBottomWidth: 1,
    paddingBottom: 8,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
  },
  menu: {
    fontSize: 20,
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
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
  },
  summary: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
  streakRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
});
