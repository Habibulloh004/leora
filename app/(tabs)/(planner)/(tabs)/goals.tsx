// app/(tabs)/(planner)/(tabs)/goals.tsx
import React, { useCallback, useMemo } from 'react';
import { SectionList, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';

import { AdaptiveGlassView } from '@/components/ui/AdaptiveGlassView';
import GoalCard from '@/components/planner/goals/GoalCard';
import { createThemedStyles } from '@/constants/theme';
import { createGoalSections, type Goal, type GoalSection } from '@/features/planner/goals/data';
import { useLocalization } from '@/localization/useLocalization';
import { usePlannerTasksStore, type PlannerTask } from '@/features/planner/useTasksStore';
import { getHabitTemplates } from '@/features/planner/habits/data';
import type { PlannerGoalId } from '@/types/planner';

const GoalsPage: React.FC = () => {
  const styles = useStyles();
  const router = useRouter();
  const { strings, locale } = useLocalization();
  const goalStrings = strings.plannerScreens.goals;
  const tasks = usePlannerTasksStore((state) => state.tasks);
  const habitTemplates = useMemo(() => getHabitTemplates(), []);
  const goalTaskMap = useMemo(() => {
    const map = new Map<PlannerGoalId, PlannerTask[]>();
    tasks.forEach((task) => {
      if (!task.goalId) return;
      const goalId = task.goalId as PlannerGoalId;
      const current = map.get(goalId) ?? [];
      current.push(task);
      map.set(goalId, current);
    });
    return map;
  }, [tasks]);
  const goalHabitMap = useMemo(() => {
    const map = new Map<PlannerGoalId, number>();
    habitTemplates.forEach((habit) => {
      habit.linkedGoalIds.forEach((goalId) => {
        const current = map.get(goalId as PlannerGoalId) ?? 0;
        map.set(goalId as PlannerGoalId, current + 1);
      });
    });
    return map;
  }, [habitTemplates]);
  const dateFormatter = useMemo(
    () => new Intl.DateTimeFormat(locale, { month: 'short', day: 'numeric' }),
    [locale],
  );

  const sections = useMemo(() => createGoalSections(goalStrings), [goalStrings]);

  const renderSectionHeader = useCallback(
    ({ section }: { section: GoalSection }) => (
      <View style={styles.sectionHeaderContainer}>
        <View style={styles.sectionHeader}>
          <View>
            <Text style={styles.sectionTitle}>{section.title}</Text>
            <Text style={styles.sectionSubtitle}>{section.subtitle}</Text>
          </View>
        </View>
        <View style={styles.sectionDivider} />
      </View>
    ),
    [styles],
  );

  const handleOpenGoal = useCallback(
    (goalId: string) => {
      router.push({ pathname: '/(modals)/goal-details', params: { goalId } });
    },
    [router],
  );

  const renderItem = useCallback(
    ({ item }: { item: Goal }) => {
      const goalId = item.id as PlannerGoalId;
      const goalTasks = goalTaskMap.get(goalId) ?? [];
      const pendingTasks = [...goalTasks].filter((task) => task.status !== 'done');
      pendingTasks.sort((a, b) => (a.dueAt ?? Number.POSITIVE_INFINITY) - (b.dueAt ?? Number.POSITIVE_INFINITY));
      const nextTask = pendingTasks[0];
      const relationSummary = {
        tasks: goalTasks.length,
        habits: goalHabitMap.get(goalId) ?? 0,
      };
      const nextStep = nextTask
        ? {
            title: nextTask.title,
            dueDate: nextTask.dueAt ? dateFormatter.format(new Date(nextTask.dueAt)) : undefined,
          }
        : undefined;

      return (
        <GoalCard
          goal={item}
          nextStep={nextStep}
          relationSummary={relationSummary}
          onAddStep={() => router.push({ pathname: '/(modals)/add-task', params: { goalId: item.id } })}
          onPress={() => handleOpenGoal(item.id)}
          onAddValue={() => router.push('/(modals)/add-goal')}
          onRefresh={() => {}}
          onEdit={() => router.push('/(modals)/add-goal')}
        />
      );
    },
    [dateFormatter, goalHabitMap, goalTaskMap, handleOpenGoal, router],
  );

  return (
    <View style={styles.screen}>
      <SectionList
        sections={sections}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        stickySectionHeadersEnabled
        renderSectionHeader={renderSectionHeader}
        renderItem={renderItem}
        ListHeaderComponent={
          <View style={styles.pageHeader}>
            <View>
              <Text style={styles.pageTitle}>{goalStrings.header.title}</Text>
              <Text style={styles.pageSubtitle}>{goalStrings.header.subtitle}</Text>
            </View>
          </View>
        }
        ListEmptyComponent={
          <View style={styles.emptyStateWrapper}>
            <AdaptiveGlassView style={styles.emptyStateCard}>
              <Text style={styles.emptyTitle}>{goalStrings.empty.title}</Text>
              <Text style={styles.emptySubtitle}>{goalStrings.empty.subtitle}</Text>
            </AdaptiveGlassView>
          </View>
        }
      />
    </View>
  );
};

const useStyles = createThemedStyles((theme) => ({
  screen: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 80,
    gap: 18,
  },
  pageHeader: {
    paddingTop: 20,
    paddingBottom: 12,
    gap: 18,
  },
  pageTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: theme.colors.textPrimary,
    letterSpacing: 0.4,
  },
  pageSubtitle: {
    marginTop: 6,
    fontSize: 14,
    color: theme.colors.textSecondary,
    fontWeight: '600',
  },
  sectionHeaderContainer: {
    paddingTop: 12,
    paddingBottom: 8,
    backgroundColor: theme.colors.background,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: theme.colors.textPrimary,
    letterSpacing: 0.3,
  },
  sectionSubtitle: {
    marginTop: 4,
    fontSize: 13,
    fontWeight: '500',
    color: theme.colors.textMuted,
  },
  sectionDivider: {
    marginTop: 12,
    height: StyleSheet.hairlineWidth,
    backgroundColor: theme.colors.border,
  },
  emptyStateWrapper: {
    paddingVertical: 40,
  },
  emptyStateCard: {
    borderRadius: 20,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: theme.colors.border,
    padding: 24,
    gap: 14,
    backgroundColor: theme.colors.card,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: theme.colors.textPrimary,
  },
  emptySubtitle: {
    fontSize: 14,
    fontWeight: '500',
    color: theme.colors.textMuted,
    lineHeight: 20,
  },
}));

export default GoalsPage;
