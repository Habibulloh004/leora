import React, { useEffect, useMemo, useState } from 'react';
import { Pressable, SafeAreaView, StyleSheet, Text, View } from 'react-native';
import Slider from '@react-native-community/slider';
import { useLocalSearchParams, useRouter } from 'expo-router';

import { useAppTheme } from '@/constants/theme';
import { usePlannerTasksStore } from '@/features/planner/useTasksStore';
import { usePlannerHabitsStore } from '@/features/planner/useHabitsStore';
import { usePlannerGoalsStore } from '@/features/planner/useGoalsStore';

const clamp = (value: number) => Math.min(100, Math.max(0, value));

export default function PlannerStatusModal() {
  const { type, id } = useLocalSearchParams<{ type?: string; id?: string }>();
  const router = useRouter();
  const theme = useAppTheme();
  const tasks = usePlannerTasksStore((state) => state.tasks);
  const updateTask = usePlannerTasksStore((state) => state.updateTask);
  const habits = usePlannerHabitsStore((state) => state.habits);
  const setHabitCompletion = usePlannerHabitsStore((state) => state.setWeeklyCompletion);
  const goals = usePlannerGoalsStore((state) => state.goals);
  const setGoalProgress = usePlannerGoalsStore((state) => state.setProgress);
  const [statusValue, setStatusValue] = useState(() => 0);

  const entity = useMemo(() => {
    if (!id) return undefined;
    if (type === 'habit') {
      return habits.find((item) => item.id === id);
    }
    if (type === 'goal') {
      return goals.find((item) => item.id === id);
    }
    return tasks.find((t) => t.id === id);
  }, [goals, habits, id, tasks, type]);

  useEffect(() => {
    if (!entity || !type) return;
    if (type === 'habit' && 'weeklyCompleted' in entity) {
      const habit = entity as (typeof habits)[number];
      const start = (habit.weeklyCompleted / Math.max(habit.weeklyTarget || 1, 1)) * 100;
      setStatusValue(clamp(start));
      return;
    }
    if (type === 'goal' && 'progress' in entity) {
      const goal = entity as (typeof goals)[number];
      setStatusValue(clamp((goal.progress ?? 0) * 100));
      return;
    }
    if (type === 'task' && 'status' in entity) {
      const task = entity as (typeof tasks)[number];
      const initial =
        task.status === 'done'
          ? 100
          : task.status === 'in_progress'
          ? 50
          : task.status === 'moved'
          ? 25
          : 0;
      setStatusValue(initial);
    }
  }, [entity, goals, habits, tasks, type]);

  if (!type || !id || !entity) {
    return null;
  }

  const title =
    typeof entity === 'object' && 'title' in entity
      ? (entity as { title?: string }).title ?? ''
      : id;

  const handleSave = () => {
    if (type === 'task') {
      if (statusValue >= 100) {
        updateTask(id, { status: 'done' });
      } else if (statusValue > 0) {
        updateTask(id, { status: 'in_progress' });
      } else {
        updateTask(id, { status: 'planned' });
      }
    } else if (type === 'habit') {
      setHabitCompletion(id, statusValue);
    } else if (type === 'goal') {
      setGoalProgress(id, statusValue);
    }
    router.back();
  };

  const description =
    type === 'task'
      ? 'Adjust completion to mark the task status.'
      : type === 'habit'
      ? 'Track how much of today’s habit is complete.'
      : 'Update how far you are towards this goal.';

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.inner}>
        <Text style={[styles.title, { color: theme.colors.textPrimary }]}>{title}</Text>
        <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>{description}</Text>

        <View style={styles.sliderBlock}>
          <Text style={[styles.valueLabel, { color: theme.colors.textPrimary }]}>{`${Math.round(statusValue)}%`}</Text>
          <Slider
            value={statusValue}
            onValueChange={(next) => setStatusValue(clamp(next))}
            minimumValue={0}
            maximumValue={100}
            step={5}
            minimumTrackTintColor={theme.colors.primary}
            maximumTrackTintColor={theme.colors.border}
            thumbTintColor={theme.colors.primary}
          />
        </View>

        <Pressable style={({ pressed }) => [styles.primaryButton, pressed && styles.pressed]} onPress={handleSave}>
          <Text style={styles.primaryText}>Save progress</Text>
        </Pressable>
        <Pressable style={styles.secondaryButton} onPress={() => router.back()}>
          <Text style={[styles.secondaryText, { color: theme.colors.textSecondary }]}>Cancel</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
  },
  inner: {
    flex: 1,
    justifyContent: 'center',
    gap: 24,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
  },
  subtitle: {
    fontSize: 14,
    fontWeight: '500',
    opacity: 0.7,
  },
  sliderBlock: {
    gap: 18,
  },
  valueLabel: {
    fontSize: 32,
    fontWeight: '800',
    textAlign: 'center',
  },
  primaryButton: {
    height: 52,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#000',
  },
  secondaryButton: {
    height: 52,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryText: {
    fontSize: 16,
    fontWeight: '600',
  },
  pressed: {
    opacity: 0.8,
  },
});
