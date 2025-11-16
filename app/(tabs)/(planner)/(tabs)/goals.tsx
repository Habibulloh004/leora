// app/(tabs)/(planner)/(tabs)/goals.tsx
import React, { useCallback, useMemo } from 'react';
import { SectionList, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';

import { AdaptiveGlassView } from '@/components/ui/AdaptiveGlassView';
import GoalCard from '@/components/planner/goals/GoalCard';
import { createThemedStyles } from '@/constants/theme';
import { type Goal, type GoalSection } from '@/features/planner/goals/data';
import { useLocalization } from '@/localization/useLocalization';
import { usePlannerTasksStore, type PlannerTask } from '@/features/planner/useTasksStore';
import { usePlannerHabitsStore } from '@/features/planner/useHabitsStore';
import type { PlannerGoalId, GoalSummaryKey } from '@/types/planner';
import { useModalStore } from '@/stores/useModalStore';
import { usePlannerGoalsStore, type PlannerGoalEntity } from '@/features/planner/useGoalsStore';
import { useShallow } from 'zustand/react/shallow';

const SUMMARY_ORDER: GoalSummaryKey[] = ['left', 'pace', 'prediction'];

const GoalsPage: React.FC = () => {
  const styles = useStyles();
  const router = useRouter();
  const { strings, locale } = useLocalization();
  const goalStrings = strings.plannerScreens.goals;
  const tasks = usePlannerTasksStore((state) => state.tasks);
  const habitEntities = usePlannerHabitsStore((state) => state.habits);
  const goalEntities = usePlannerGoalsStore((state) => state.goals);
  const { openGoalModal, openPlannerTaskModal } = useModalStore(
    useShallow((state) => ({
      openGoalModal: state.openPlannerGoalModal,
      openPlannerTaskModal: state.openPlannerTaskModal,
    })),
  );
  const goalTaskMap = useMemo(() => {
    const map = new Map<string, PlannerTask[]>();
    tasks.forEach((task) => {
      if (!task.goalId) return;
      const goalId = task.goalId;
      const current = map.get(goalId) ?? [];
      current.push(task);
      map.set(goalId, current);
    });
    return map;
  }, [tasks]);
  const goalHabitMap = useMemo(() => {
    const map = new Map<string, number>();
    habitEntities.forEach((habit) => {
      habit.linkedGoalIds.forEach((goalId) => {
        const current = map.get(goalId) ?? 0;
        map.set(goalId, current + 1);
      });
    });
    return map;
  }, [habitEntities]);
  const dateFormatter = useMemo(
    () => new Intl.DateTimeFormat(locale, { month: 'short', day: 'numeric' }),
    [locale],
  );

  const convertGoalEntity = useCallback(
    (entity: PlannerGoalEntity): Goal => {
      const localized = entity.contentKey ? goalStrings.data[entity.contentKey] : undefined;
      const summary = SUMMARY_ORDER.map((key) => ({
        label: goalStrings.cards.summaryLabels[key],
        value: entity.summaryOverrides?.[key] ?? localized?.summary?.[key] ?? '—',
      }));
      const milestoneLabels = entity.milestoneLabels ?? localized?.milestones ?? ['25%', '50%', '75%', '100%'];
      const historySource = entity.historyOverrides ?? localized?.history ?? [];
      return {
        id: entity.id,
        title: entity.customTitle ?? localized?.title ?? goalStrings.header.title,
        progress: entity.progress,
        currentAmount: entity.currentAmount ?? localized?.currentAmount ?? '',
        targetAmount: entity.targetAmount ?? localized?.targetAmount ?? '',
        summary,
        milestones: milestoneLabels.map((label, index) => ({
          percent: (index + 1) * 25,
          label,
        })),
        history: historySource.map((entry, index) => ({
          ...entry,
          id: `${entity.id}-history-${index}`,
        })),
        aiTip: entity.aiTipOverride ?? localized?.aiTip ?? '',
        aiTipHighlight: entity.aiTipHighlightOverride ?? localized?.aiTipHighlight,
      };
    },
    [goalStrings],
  );

  const localizedGoals = useMemo(
    () =>
      goalEntities
        .filter((goal) => !goal.archived)
        .map((entity) => ({ entity, goal: convertGoalEntity(entity) })),
    [convertGoalEntity, goalEntities],
  );

  const sections = useMemo(() => {
    const grouped = {
      financial: [] as Goal[],
      personal: [] as Goal[],
    };
    localizedGoals.forEach(({ entity, goal }) => {
      const key = entity.category === 'financial' ? 'financial' : 'personal';
      grouped[key].push(goal);
    });
    return [
      {
        id: 'financial',
        title: goalStrings.sections.financial.title,
        subtitle: goalStrings.sections.financial.subtitle,
        data: grouped.financial,
      },
      {
        id: 'personal',
        title: goalStrings.sections.personal.title,
        subtitle: goalStrings.sections.personal.subtitle,
        data: grouped.personal,
      },
    ];
  }, [goalStrings.sections, localizedGoals]);

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
      const goalId = item.id;
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
          onAddStep={() => openPlannerTaskModal({ mode: 'create', goalId: item.id })}
          onPress={() => handleOpenGoal(item.id)}
          onAddValue={() => openGoalModal({ mode: 'create' })}
          onRefresh={() => {}}
          onEdit={() => openGoalModal({ mode: 'edit', goalId: item.id, goal: item })}
        />
      );
    },
    [dateFormatter, goalHabitMap, goalTaskMap, handleOpenGoal, openGoalModal, openPlannerTaskModal],
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
