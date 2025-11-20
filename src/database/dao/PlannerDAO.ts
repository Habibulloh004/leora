import Realm, { BSON } from 'realm';

import type { Goal, Habit, Task, FocusSession, GoalMilestone, GoalStats, HabitCompletionStatus } from '@/domain/planner/types';
import { fromObjectId, toISODate, toObjectId } from './helpers';

const defaultUserId = 'local-user';

const hasRealmInstance = (realm: Realm | null): realm is Realm => Boolean(realm && !realm.isClosed);

const mapGoal = (record: any): Goal => ({
  id: fromObjectId(record._id)!,
  userId: record.userId ?? defaultUserId,
  title: record.title,
  description: record.description ?? undefined,
  goalType: record.goalType,
  status: record.status,
  metricType: record.metricType,
  unit: record.unit ?? undefined,
  initialValue: record.initialValue ?? undefined,
  targetValue: record.targetValue ?? undefined,
  financeMode: record.financeMode ?? undefined,
  currency: record.currency ?? undefined,
  linkedBudgetId: fromObjectId(record.linkedBudgetId),
  startDate: toISODate(record.startDate) ?? undefined,
  targetDate: toISODate(record.targetDate) ?? undefined,
  completedDate: toISODate(record.completedDate) ?? undefined,
  progressPercent: record.progressPercent ?? 0,
  stats: {
    financialProgressPercent: record.stats?.financialProgressPercent ?? undefined,
    habitsProgressPercent: record.stats?.habitsProgressPercent ?? undefined,
    tasksProgressPercent: record.stats?.tasksProgressPercent ?? undefined,
    focusMinutesLast30: record.stats?.focusMinutesLast30 ?? undefined,
  } satisfies GoalStats,
  milestones:
    record.milestones?.map(
      (milestone: any): GoalMilestone => ({
        id: fromObjectId(milestone.milestoneId)!,
        title: milestone.title,
        description: milestone.description ?? undefined,
        targetPercent: milestone.targetPercent,
        dueDate: toISODate(milestone.dueDate) ?? undefined,
        completedAt: toISODate(milestone.completedAt) ?? undefined,
      }),
    ) ?? [],
  createdAt: toISODate(record.createdAt)!,
  updatedAt: toISODate(record.updatedAt)!,
});

const mapHabitCompletion = (record: any) => ({
  dateKey: record.dateKey,
  status: record.status as HabitCompletionStatus,
});

const mapHabit = (record: any): Habit => ({
  id: fromObjectId(record._id)!,
  userId: record.userId ?? defaultUserId,
  title: record.title,
  description: record.description ?? undefined,
  iconId: record.iconId ?? undefined,
  habitType: record.habitType,
  status: record.status,
  goalId: fromObjectId(record.goalId),
  linkedGoalIds: record.linkedGoalIds?.map((id: BSON.ObjectId) => id.toHexString()) ?? [],
  frequency: record.frequency,
  daysOfWeek: record.daysOfWeek ?? [],
  timesPerWeek: record.timesPerWeek ?? undefined,
  timeOfDay: record.timeOfDay ?? undefined,
  completionMode: record.completionMode,
  targetPerDay: record.targetPerDay ?? undefined,
  unit: record.unit ?? undefined,
  financeRule: record.financeRule ?? undefined,
  challengeLengthDays: record.challengeLengthDays ?? undefined,
  streakCurrent: record.streakCurrent ?? 0,
  streakBest: record.streakBest ?? 0,
  completionRate30d: record.completionRate30d ?? 0,
  completionHistory: record.completionHistory?.map(mapHabitCompletion).reduce<Record<string, HabitCompletionStatus>>((acc, entry) => {
    acc[entry.dateKey] = entry.status;
    return acc;
  }, {}) ?? {},
  createdAt: toISODate(record.createdAt)!,
  updatedAt: toISODate(record.updatedAt)!,
});

const mapTask = (record: any): Task => ({
  id: fromObjectId(record._id)!,
  userId: record.userId ?? defaultUserId,
  title: record.title,
  status: record.status,
  priority: record.priority,
  goalId: fromObjectId(record.goalId),
  habitId: fromObjectId(record.habitId),
  financeLink: record.financeLink ?? undefined,
  dueDate: toISODate(record.dueDate) ?? undefined,
  startDate: toISODate(record.startDate) ?? undefined,
  timeOfDay: record.timeOfDay ?? undefined,
  estimatedMinutes: record.estimatedMinutes ?? undefined,
  energyLevel: record.energyLevel ?? undefined,
  checklist:
    record.checklist?.map((item: any) => ({
      id: fromObjectId(item.itemId)!,
      title: item.title,
      completed: Boolean(item.completed),
    })) ?? [],
  dependencies:
    record.dependencies?.map((dep: any) => ({
      id: fromObjectId(dep.dependencyId)!,
      taskId: fromObjectId(dep.taskId)!,
      status: dep.status,
    })) ?? [],
  lastFocusSessionId: fromObjectId(record.lastFocusSessionId),
  focusTotalMinutes: record.focusTotalMinutes ?? 0,
  context: record.context ?? undefined,
  notes: record.notes ?? undefined,
  createdAt: toISODate(record.createdAt)!,
  updatedAt: toISODate(record.updatedAt)!,
});

const mapFocusSession = (record: any): FocusSession => ({
  id: fromObjectId(record._id)!,
  userId: record.userId ?? defaultUserId,
  taskId: fromObjectId(record.taskId),
  goalId: fromObjectId(record.goalId),
  plannedMinutes: record.plannedMinutes ?? 0,
  actualMinutes: record.actualMinutes ?? 0,
  status: record.status,
  startedAt: toISODate(record.startedAt)!,
  endedAt: toISODate(record.endedAt) ?? undefined,
  interruptionsCount: record.interruptionsCount ?? 0,
  notes: record.notes ?? undefined,
  createdAt: toISODate(record.createdAt)!,
  updatedAt: toISODate(record.updatedAt)!,
});

export class GoalDAO {
  constructor(private realm: Realm) {}

  list(): Goal[] {
    if (!hasRealmInstance(this.realm)) {
      return [];
    }
    return this.realm.objects('Goal').map(mapGoal);
  }

  create(input: Omit<Goal, 'id' | 'createdAt' | 'updatedAt' | 'milestones' | 'stats'> & { stats?: GoalStats; milestones?: GoalMilestone[] }): Goal {
    const now = new Date();
    let created: any;
    this.realm.write(() => {
      created = this.realm.create('Goal', {
        _id: new BSON.ObjectId(),
        userId: input.userId ?? defaultUserId,
        title: input.title,
        description: input.description ?? null,
        goalType: input.goalType,
        status: input.status,
        metricType: input.metricType,
        unit: input.unit ?? null,
        initialValue: input.initialValue ?? null,
        targetValue: input.targetValue ?? null,
        financeMode: input.financeMode ?? null,
        currency: input.currency ?? null,
        linkedBudgetId: toObjectId(input.linkedBudgetId),
        startDate: input.startDate ? new Date(input.startDate) : null,
        targetDate: input.targetDate ? new Date(input.targetDate) : null,
        completedDate: input.completedDate ? new Date(input.completedDate) : null,
        progressPercent: input.progressPercent ?? 0,
        stats: {
          financialProgressPercent: input.stats?.financialProgressPercent ?? 0,
          habitsProgressPercent: input.stats?.habitsProgressPercent ?? 0,
          tasksProgressPercent: input.stats?.tasksProgressPercent ?? 0,
          focusMinutesLast30: input.stats?.focusMinutesLast30 ?? 0,
        },
        milestones:
          input.milestones?.map((milestone) => ({
            milestoneId: new BSON.ObjectId(),
            title: milestone.title,
            description: milestone.description ?? null,
            targetPercent: milestone.targetPercent,
            dueDate: milestone.dueDate ? new Date(milestone.dueDate) : null,
            completedAt: milestone.completedAt ? new Date(milestone.completedAt) : null,
          })) ?? [],
        createdAt: now,
        updatedAt: now,
        syncStatus: 'local',
      });
    });
    return mapGoal(created);
  }
}

export class HabitDAO {
  constructor(private realm: Realm) {}

  list(): Habit[] {
    if (!hasRealmInstance(this.realm)) {
      return [];
    }
    return this.realm.objects('Habit').map(mapHabit);
  }
}

export class TaskDAO {
  constructor(private realm: Realm) {}

  list(): Task[] {
    if (!hasRealmInstance(this.realm)) {
      return [];
    }
    return this.realm.objects('Task').map(mapTask);
  }
}

export class FocusSessionDAO {
  constructor(private realm: Realm) {}

  list(): FocusSession[] {
    if (!hasRealmInstance(this.realm)) {
      return [];
    }
    return this.realm.objects('FocusSession').map(mapFocusSession);
  }
}
