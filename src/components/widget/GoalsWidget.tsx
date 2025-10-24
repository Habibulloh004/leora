import type { Goal } from '@/types/home';
import React from 'react';
import { Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Dot } from 'lucide-react-native';
import { AdaptiveGlassView } from '@/components/ui/AdaptiveGlassView';
import { useAppTheme } from '@/constants/theme';

interface GoalsWidgetProps {
  goals?: Goal[];
  onMenuPress?: () => void;
}

interface GoalItemProps {
  goal: Goal;
}

const MOCK_GOALS: Goal[] = [
  {
    id: '1',
    title: 'Buy a car',
    progress: 82,
    current: 4100000,
    target: 5000000,
    unit: 'UZS',
    category: 'financial',
  },
  {
    id: '2',
    title: 'Read 24 books',
    progress: 45,
    current: 11,
    target: 24,
    unit: 'books',
    category: 'personal',
  },
  {
    id: '3',
    title: 'Learn Spanish',
    progress: 30,
    current: 30,
    target: 100,
    unit: '%',
    category: 'personal',
  },
];

const GoalItem = ({ goal }: GoalItemProps) => {
  const theme = useAppTheme();

  return (
    <View style={styles.goalItem}>
      <View style={styles.goalHeader}>
        <Text style={[styles.goalTitle, { color: theme.colors.textPrimary }]}>{goal.title}</Text>
        <Text style={[styles.goalProgress, { color: theme.colors.textSecondary }]}>{goal.progress}%</Text>
      </View>

      <View style={[styles.progressBarContainer, { backgroundColor: theme.colors.surfaceElevated }]}>
        <View style={[styles.progressBar, { width: `${goal.progress}%`, backgroundColor: theme.colors.primary }]} />
      </View>

      <Text style={[styles.goalTarget, { color: theme.colors.textMuted }]}>
        {goal.current.toLocaleString()} / {goal.target.toLocaleString()} {goal.unit}
      </Text>
    </View>
  );
};

export default function GoalsWidget({ goals = MOCK_GOALS, onMenuPress }: GoalsWidgetProps) {
  const theme = useAppTheme();

  return (
    <View style={styles.container}>
      <AdaptiveGlassView style={[styles.widget, { backgroundColor: Platform.OS === "ios" ? "transparent" : theme.colors.card }]}>
        <View style={[styles.header, { borderBottomColor: theme.colors.border }]}>
          <View style={styles.titleContainer}>
            <Text style={[styles.title, { color: theme.colors.textSecondary }]}>Goals</Text>
            <Dot color={theme.colors.textSecondary} />
            <Text style={[styles.title, { color: theme.colors.textSecondary }]}>2025</Text>
          </View>
          <TouchableOpacity onPress={onMenuPress} activeOpacity={0.7}>
            <Text style={[styles.menu, { color: theme.colors.textSecondary }]}>⋯</Text>
          </TouchableOpacity>
        </View>

        {goals.map((goal) => (
          <GoalItem key={goal.id} goal={goal} />
        ))}
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
  titleContainer: {
    justifyContent: 'flex-start',
    alignItems: 'center',
    flexDirection: 'row',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    borderBottomWidth: 1,
    paddingBottom: 8,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
  },
  menu: {
    fontSize: 20,
  },
  goalItem: {
    marginBottom: 16,
  },
  goalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  goalTitle: {
    fontSize: 16,
    fontWeight: '500',
  },
  goalProgress: {
    fontSize: 14,
    fontWeight: '400',
  },
  progressBarContainer: {
    height: 4,
    borderRadius: 2,
    marginBottom: 8,
  },
  progressBar: {
    height: '100%',
    borderRadius: 2,
  },
  goalTarget: {
    fontSize: 12,
  },
});
