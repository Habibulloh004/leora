import { create } from 'zustand';

import type { FocusSession, Goal, Habit, Task, TaskDependency, TaskStatus } from '@/domain/planner/types';
import { addDays, startOfDay } from '@/utils/calendar';

export type PlannerHistoryItem = {
  historyId: string;
  taskId: string;
  title: string;
  status: TaskStatus;
  action: 'created' | 'completed' | 'deleted' | 'moved';
  timestamp: string;
  snapshot?: Task;
};

interface PlannerDomainState {
  goals: Goal[];
  habits: Habit[];
  tasks: Task[];
  focusSessions: FocusSession[];
  taskHistory: PlannerHistoryItem[];
  createGoal: (payload: Omit<Goal, 'id' | 'createdAt' | 'updatedAt' | 'progressPercent' | 'stats'> & { progressPercent?: number; stats?: Goal['stats'] }) => Goal;
  updateGoal: (id: string, updates: Partial<Goal>) => void;
  setGoalStatus: (id: string, status: Goal['status']) => void;
  completeGoal: (id: string, completedDate?: string) => void;
  archiveGoal: (id: string) => void;
  pauseGoal: (id: string) => void;
  resumeGoal: (id: string) => void;
  createHabit: (payload: Omit<Habit, 'id' | 'createdAt' | 'updatedAt' | 'streakCurrent' | 'streakBest' | 'completionRate30d'>) => Habit;
  updateHabit: (id: string, updates: Partial<Habit>) => void;
  logHabitCompletion: (id: string, completed: boolean, options?: { date?: Date | string; clear?: boolean }) => void;
  pauseHabit: (id: string) => void;
  resumeHabit: (id: string) => void;
  archiveHabit: (id: string) => void;
  createTask: (payload: Omit<Task, 'id' | 'createdAt' | 'updatedAt' | 'status' | 'focusTotalMinutes'> & { status?: TaskStatus }) => Task;
  updateTask: (id: string, updates: Partial<Task>) => void;
  completeTask: (id: string, options?: { actualMinutes?: number }) => void;
  cancelTask: (id: string) => void;
  scheduleTask: (id: string, schedule: { dueDate: string; timeOfDay?: string }) => void;
  toggleTaskChecklist: (taskId: string, itemId: string) => void;
  addTaskDependency: (taskId: string, dependency: TaskDependency) => void;
  setTaskStatus: (taskId: string, status: TaskStatus) => void;
  deleteTask: (taskId: string) => void;
  restoreTaskFromHistory: (historyId: string) => void;
  removeHistoryEntry: (historyId: string) => void;
  createFocusSession: (payload: Omit<FocusSession, 'id' | 'status' | 'createdAt' | 'updatedAt'> & { status?: FocusSession['status'] }) => FocusSession;
  updateFocusSession: (id: string, updates: Partial<FocusSession>) => void;
  startFocus: (payload: { taskId?: string; goalId?: string; plannedMinutes?: number; notes?: string }) => FocusSession;
  pauseFocus: (sessionId: string) => void;
  resumeFocus: (sessionId: string) => void;
  finishFocus: (sessionId: string, options?: { actualMinutes?: number }) => void;
  cancelFocus: (sessionId: string) => void;
  hydrateFromRealm: (payload: Partial<Pick<PlannerDomainState, 'goals' | 'habits' | 'tasks' | 'focusSessions'>>) => void;
}

const generateId = (prefix: string) => `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

const nowIso = () => new Date().toISOString();

const isoHoursFromNow = (hours: number) => new Date(Date.now() + hours * 60 * 60 * 1000).toISOString();

const ENABLE_PLANNER_SEED_DATA = false;

const dateKeyFromDate = (date: Date) => startOfDay(date).toISOString().split('T')[0]!;
const parseDateKey = (key: string) => new Date(`${key}T00:00:00.000Z`);

const recalcHabitStatsFromHistory = (history?: Record<string, 'done' | 'miss'>) => {
  const map = history ?? {};
  const today = startOfDay(new Date());
  let streakCurrent = 0;
  let cursor = today;
  while (true) {
    const key = dateKeyFromDate(cursor);
    if (map[key] === 'done') {
      streakCurrent += 1;
      cursor = addDays(cursor, -1);
      continue;
    }
    break;
  }

  let streakBest = 0;
  let bestChain = 0;
  let prevDate: Date | null = null;
  const sortedKeys = Object.keys(map).filter((key) => map[key] === 'done').sort();
  sortedKeys.forEach((key) => {
    const date = parseDateKey(key);
    if (prevDate) {
      const expectedNext = dateKeyFromDate(addDays(prevDate, 1));
      if (expectedNext === key) {
        bestChain += 1;
      } else {
        bestChain = 1;
      }
    } else {
      bestChain = 1;
    }
    prevDate = date;
    streakBest = Math.max(streakBest, bestChain);
  });
  streakBest = Math.max(streakBest, streakCurrent);

  const windowDays = 30;
  let doneCount = 0;
  for (let i = 0; i < windowDays; i += 1) {
    const key = dateKeyFromDate(addDays(today, -i));
    if (map[key] === 'done') {
      doneCount += 1;
    }
  }
  const completionRate30d = Number((doneCount / windowDays).toFixed(3));

  return { streakCurrent, streakBest, completionRate30d };
};

const createDefaultGoal = (params: Partial<Goal> & { id: string }): Goal => ({
  id: params.id,
  userId: 'local-user',
  title: params.title ?? params.id,
  goalType: params.goalType ?? 'personal',
  status: params.status ?? 'active',
  metricType: params.metricType ?? 'none',
  financeMode: params.financeMode,
  currency: params.currency,
  progressPercent: params.progressPercent ?? 0,
  stats: params.stats ?? {},
  milestones: params.milestones ?? [],
  startDate: params.startDate ?? nowIso(),
  targetDate: params.targetDate,
  createdAt: params.createdAt ?? nowIso(),
  updatedAt: params.updatedAt ?? nowIso(),
});

const SAMPLE_GOALS: Goal[] = [
  createDefaultGoal({
    id: 'dream-car',
    title: 'Dream Car',
    goalType: 'financial',
    metricType: 'amount',
    financeMode: 'save',
    currency: 'USD',
    progressPercent: 0.82,
    stats: { financialProgressPercent: 0.82 },
  }),
  createDefaultGoal({
    id: 'emergency-fund',
    title: 'Emergency Fund',
    goalType: 'financial',
    metricType: 'amount',
    financeMode: 'save',
    currency: 'USD',
    progressPercent: 0.58,
    stats: { financialProgressPercent: 0.58 },
  }),
  createDefaultGoal({
    id: 'fitness',
    title: 'Fitness Boost',
    goalType: 'health',
    metricType: 'custom',
    progressPercent: 0.44,
    stats: { tasksProgressPercent: 0.44 },
  }),
  createDefaultGoal({
    id: 'language',
    title: 'Language Mastery',
    goalType: 'education',
    metricType: 'custom',
    progressPercent: 0.68,
    stats: { habitsProgressPercent: 0.68 },
  }),
];

const DEFAULT_GOALS: Goal[] = ENABLE_PLANNER_SEED_DATA ? SAMPLE_GOALS : [];

const SAMPLE_HABITS: Habit[] = [
  {
    id: 'h1',
    userId: 'local-user',
    title: 'Morning workout',
    habitType: 'health',
    status: 'active',
    goalId: 'fitness',
    linkedGoalIds: ['fitness'],
    frequency: 'weekly',
    daysOfWeek: [1, 2, 3, 4, 5],
    completionMode: 'boolean',
    streakCurrent: 12,
    streakBest: 45,
    completionRate30d: 0.86,
    createdAt: nowIso(),
    updatedAt: nowIso(),
  },
  {
    id: 'h2',
    userId: 'local-user',
    title: 'Meditation',
    habitType: 'personal',
    status: 'active',
    frequency: 'daily',
    completionMode: 'boolean',
    streakCurrent: 1,
    streakBest: 21,
    completionRate30d: 0.6,
    createdAt: nowIso(),
    updatedAt: nowIso(),
  },
  {
    id: 'h3',
    userId: 'local-user',
    title: 'Language practice',
    habitType: 'education',
    status: 'active',
    goalId: 'language',
    linkedGoalIds: ['language'],
    frequency: 'weekly',
    daysOfWeek: [1, 3, 5],
    completionMode: 'timer',
    streakCurrent: 5,
    streakBest: 30,
    completionRate30d: 0.7,
    createdAt: nowIso(),
    updatedAt: nowIso(),
  },
  {
    id: 'h4',
    userId: 'local-user',
    title: 'Hydration',
    habitType: 'health',
    status: 'active',
    frequency: 'daily',
    completionMode: 'chips',
    streakCurrent: 30,
    streakBest: 30,
    completionRate30d: 1,
    createdAt: nowIso(),
    updatedAt: nowIso(),
  },
  {
    id: 'h5',
    userId: 'local-user',
    title: 'Dual habit',
    habitType: 'personal',
    status: 'active',
    frequency: 'weekly',
    daysOfWeek: [0, 6],
    completionMode: 'boolean',
    linkedGoalIds: ['dream-car', 'language'],
    streakCurrent: 3,
    streakBest: 7,
    completionRate30d: 0.55,
    createdAt: nowIso(),
    updatedAt: nowIso(),
  },
];

const DEFAULT_HABITS: Habit[] = ENABLE_PLANNER_SEED_DATA ? SAMPLE_HABITS : [];

const SAMPLE_TASKS: Task[] = [
  {
    id: 'task-morning-workout',
    userId: 'local-user',
    title: 'Morning workout',
    status: 'completed',
    priority: 'medium',
    goalId: 'fitness',
    habitId: 'h1',
    dueDate: isoHoursFromNow(-6),
    startDate: isoHoursFromNow(-6),
    timeOfDay: '07:00',
    estimatedMinutes: 30,
    energyLevel: 3,
    focusTotalMinutes: 60,
    context: '@home',
    notes: 'Strength + mobility circuit',
    createdAt: isoHoursFromNow(-8),
    updatedAt: isoHoursFromNow(-6),
  },
  {
    id: 'task-check-mail',
    userId: 'local-user',
    title: 'Check the mail',
    status: 'overdue',
    priority: 'low',
    dueDate: isoHoursFromNow(-2),
    startDate: isoHoursFromNow(-2),
    timeOfDay: '09:00',
    estimatedMinutes: 15,
    energyLevel: 2,
    context: '@work',
    createdAt: isoHoursFromNow(-12),
    updatedAt: isoHoursFromNow(-2),
  },
  {
    id: 'task-team-collaboration',
    userId: 'local-user',
    title: 'Team collaboration',
    status: 'planned',
    priority: 'high',
    goalId: 'dream-car',
    dueDate: isoHoursFromNow(1),
    startDate: isoHoursFromNow(1),
    timeOfDay: '10:00',
    estimatedMinutes: 60,
    energyLevel: 3,
    context: '@work',
    notes: 'Sprint planning sync',
    createdAt: isoHoursFromNow(-5),
    updatedAt: isoHoursFromNow(-1),
  },
  {
    id: 'task-leora-automation',
    userId: 'local-user',
    title: 'Prototype: LEORA automation',
    status: 'in_progress',
    priority: 'high',
    goalId: 'dream-car',
    dueDate: isoHoursFromNow(4),
    startDate: isoHoursFromNow(4),
    timeOfDay: '14:00',
    estimatedMinutes: 120,
    energyLevel: 3,
    context: '@work',
    notes: 'Best deep-focus slot to finish sprint deliverable',
    focusTotalMinutes: 90,
    lastFocusSessionId: 'focus-session-seed',
    createdAt: isoHoursFromNow(-4),
    updatedAt: isoHoursFromNow(0),
  },
  {
    id: 'task-meet-aziz',
    userId: 'local-user',
    title: 'Meet with Aziz',
    status: 'planned',
    priority: 'medium',
    dueDate: isoHoursFromNow(2),
    startDate: isoHoursFromNow(2),
    timeOfDay: '13:00',
    estimatedMinutes: 30,
    energyLevel: 2,
    context: '@cafe',
    notes: 'Roadmap sync over coffee',
    createdAt: isoHoursFromNow(-3),
    updatedAt: isoHoursFromNow(-1),
  },
  {
    id: 'task-buy-groceries',
    userId: 'local-user',
    title: 'Buy groceries',
    status: 'planned',
    priority: 'medium',
    dueDate: isoHoursFromNow(6),
    startDate: isoHoursFromNow(6),
    timeOfDay: '18:00',
    estimatedMinutes: 60,
    energyLevel: 2,
    context: '@market',
    notes: 'Restock essentials after work',
    createdAt: isoHoursFromNow(-1),
    updatedAt: isoHoursFromNow(-1),
  },
  {
    id: 'task-top-up-fund',
    userId: 'local-user',
    title: 'Top up emergency fund',
    status: 'overdue',
    priority: 'medium',
    goalId: 'emergency-fund',
    dueDate: isoHoursFromNow(-1),
    startDate: isoHoursFromNow(-1),
    timeOfDay: '10:00',
    estimatedMinutes: 20,
    energyLevel: 1,
    context: '@home',
    notes: 'Budget review + transfer',
    createdAt: isoHoursFromNow(-6),
    updatedAt: isoHoursFromNow(-1),
  },
  {
    id: 'task-evening-workout',
    userId: 'local-user',
    title: 'Evening workout',
    status: 'planned',
    priority: 'medium',
    goalId: 'fitness',
    habitId: 'h1',
    dueDate: isoHoursFromNow(8),
    startDate: isoHoursFromNow(8),
    timeOfDay: '19:00',
    estimatedMinutes: 30,
    energyLevel: 3,
    context: '@park',
    notes: 'Cardio reset outdoors',
    createdAt: isoHoursFromNow(-2),
    updatedAt: isoHoursFromNow(-2),
  },
  {
    id: 'task-language-review',
    userId: 'local-user',
    title: 'Review language notes',
    status: 'planned',
    priority: 'low',
    goalId: 'language',
    dueDate: isoHoursFromNow(10),
    startDate: isoHoursFromNow(10),
    timeOfDay: '21:00',
    estimatedMinutes: 15,
    energyLevel: 2,
    context: '@home',
    notes: 'Grammar deck + spaced repetition',
    createdAt: isoHoursFromNow(-1),
    updatedAt: isoHoursFromNow(-1),
  },
];

const clampPercent = (value?: number) => {
  if (typeof value !== 'number' || Number.isNaN(value)) {
    return undefined;
  }
  if (!Number.isFinite(value)) {
    return undefined;
  }
  if (value < 0) {
    return 0;
  }
  if (value > 1) {
    return 1;
  }
  return value;
};

const cloneTask = (task: Task): Task => ({
  ...task,
  checklist: task.checklist ? task.checklist.map((item) => ({ ...item })) : undefined,
  dependencies: task.dependencies ? task.dependencies.map((dep) => ({ ...dep })) : undefined,
});

const appendTaskHistoryEntry = (history: PlannerHistoryItem[], entry: PlannerHistoryItem) =>
  [entry, ...history].slice(0, 200);

const createHistoryEntry = (params: {
  id: string;
  title: string;
  status: TaskStatus;
  action: PlannerHistoryItem['action'];
  snapshot?: Task;
}): PlannerHistoryItem => ({
  historyId: generateId('history'),
  taskId: params.id,
  ...params,
  snapshot: params.snapshot ? cloneTask(params.snapshot) : undefined,
  timestamp: nowIso(),
});

const computeTaskProgress = (goalId: string, tasks: Task[]) => {
  const related = tasks.filter(
    (task) => task.goalId === goalId && task.status !== 'canceled',
  );
  if (!related.length) {
    return undefined;
  }
  const completed = related.filter((task) => task.status === 'completed').length;
  const inProgress = related.filter((task) => task.status === 'in_progress').length;
  const progress = (completed + inProgress * 0.5) / related.length;
  return clampPercent(progress);
};

const computeHabitProgress = (goalId: string, habits: Habit[]) => {
  const related = habits.filter(
    (habit) =>
      habit.goalId === goalId ||
      habit.linkedGoalIds?.includes(goalId),
  );
  if (!related.length) {
    return undefined;
  }
  const total = related.reduce(
    (sum, habit) => sum + (habit.completionRate30d ?? 0),
    0,
  );
  return clampPercent(total / related.length);
};

const buildTaskGoalMap = (tasks: Task[]) => {
  const map = new Map<string, string>();
  tasks.forEach((task) => {
    if (task.goalId) {
      map.set(task.id, task.goalId);
    }
  });
  return map;
};

const computeFocusMinutesLast30 = (
  goalId: string,
  focusSessions: FocusSession[],
  taskGoalMap: Map<string, string>,
) => {
  if (!focusSessions.length) {
    return 0;
  }
  const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000;
  const threshold = Date.now() - THIRTY_DAYS_MS;
  return focusSessions.reduce((sum, session) => {
    const sessionGoalId =
      session.goalId ?? (session.taskId ? taskGoalMap.get(session.taskId) : undefined);
    if (sessionGoalId !== goalId) {
      return sum;
    }
    const startedAt = new Date(session.startedAt).getTime();
    if (Number.isNaN(startedAt) || startedAt < threshold) {
      return sum;
    }
    const minutes = session.actualMinutes ?? session.plannedMinutes ?? 0;
    return sum + minutes;
  }, 0);
};

const recalcGoalProgress = (
  goals: Goal[],
  tasks: Task[],
  habits: Habit[],
  focusSessions: FocusSession[],
) => {
  if (!goals.length) {
    return goals;
  }
  const taskGoalMap = buildTaskGoalMap(tasks);
  return goals.map((goal) => {
    const tasksProgress = computeTaskProgress(goal.id, tasks);
    const habitsProgress = computeHabitProgress(goal.id, habits);
    const focusMinutesLast30 = computeFocusMinutesLast30(goal.id, focusSessions, taskGoalMap);
    const financialProgress = clampPercent(goal.stats?.financialProgressPercent);
    const stats: Goal['stats'] = {
      ...goal.stats,
      financialProgressPercent: financialProgress ?? goal.stats?.financialProgressPercent,
      tasksProgressPercent: tasksProgress ?? goal.stats?.tasksProgressPercent,
      habitsProgressPercent: habitsProgress ?? goal.stats?.habitsProgressPercent,
      focusMinutesLast30,
    };
    if (goal.status === 'completed') {
      return {
        ...goal,
        stats,
        progressPercent: 1,
      };
    }
    const components: number[] = [];
    if (typeof stats.financialProgressPercent === 'number') {
      components.push(stats.financialProgressPercent);
    }
    if (typeof stats.habitsProgressPercent === 'number') {
      components.push(stats.habitsProgressPercent);
    }
    if (typeof stats.tasksProgressPercent === 'number') {
      components.push(stats.tasksProgressPercent);
    }
    const progressPercent =
      components.length > 0
        ? Number(
            (components.reduce((sum, value) => sum + value, 0) / components.length).toFixed(4),
          )
        : goal.progressPercent;
    return {
      ...goal,
      stats,
      progressPercent,
    };
  });
};

const DEFAULT_TASKS: Task[] = ENABLE_PLANNER_SEED_DATA ? SAMPLE_TASKS : [];

const INITIAL_GOALS = recalcGoalProgress(DEFAULT_GOALS, DEFAULT_TASKS, DEFAULT_HABITS, []);

export const usePlannerDomainStore = create<PlannerDomainState>((set, get) => ({
      goals: INITIAL_GOALS,
      habits: DEFAULT_HABITS,
      tasks: DEFAULT_TASKS,
      focusSessions: [],
      taskHistory: [],

      createGoal: (payload) => {
        const goal: Goal = {
          ...payload,
          id: payload.id ?? generateId('goal'),
          progressPercent: payload.progressPercent ?? 0,
          stats: payload.stats ?? {},
          createdAt: nowIso(),
          updatedAt: nowIso(),
        };
        set((state) => {
          const goals = recalcGoalProgress([goal, ...state.goals], state.tasks, state.habits, state.focusSessions);
          return { goals };
        });
        return goal;
      },

      updateGoal: (id, updates) =>
        set((state) => {
          const goals = recalcGoalProgress(
            state.goals.map((goal) =>
              goal.id === id ? { ...goal, ...updates, updatedAt: nowIso() } : goal,
            ),
            state.tasks,
            state.habits,
            state.focusSessions,
          );
          return { goals };
        }),

      setGoalStatus: (id, status) =>
        set((state) => {
          const goals = recalcGoalProgress(
            state.goals.map((goal) =>
              goal.id === id ? { ...goal, status, updatedAt: nowIso() } : goal,
            ),
            state.tasks,
            state.habits,
            state.focusSessions,
          );
          return { goals };
        }),

      completeGoal: (id, completedDate) =>
        set((state) => {
          const goals = recalcGoalProgress(
            state.goals.map((goal) =>
              goal.id === id
                ? {
                    ...goal,
                    status: 'completed',
                    completedDate: completedDate ?? nowIso(),
                    progressPercent: 1,
                    updatedAt: nowIso(),
                  }
                : goal,
            ),
            state.tasks,
            state.habits,
            state.focusSessions,
          );
          return { goals };
        }),

      archiveGoal: (id) =>
        set((state) => {
          const goals = recalcGoalProgress(
            state.goals.map((goal) =>
              goal.id === id ? { ...goal, status: 'archived', updatedAt: nowIso() } : goal,
            ),
            state.tasks,
            state.habits,
            state.focusSessions,
          );
          return { goals };
        }),

      pauseGoal: (id) =>
        set((state) => {
          const goals = recalcGoalProgress(
            state.goals.map((goal) =>
              goal.id === id ? { ...goal, status: 'paused', updatedAt: nowIso() } : goal,
            ),
            state.tasks,
            state.habits,
            state.focusSessions,
          );
          return { goals };
        }),

      resumeGoal: (id) =>
        set((state) => {
          const goals = recalcGoalProgress(
            state.goals.map((goal) =>
              goal.id === id ? { ...goal, status: 'active', updatedAt: nowIso() } : goal,
            ),
            state.tasks,
            state.habits,
            state.focusSessions,
          );
          return { goals };
        }),

      createHabit: (payload) => {
        const habit: Habit = {
          ...payload,
          id: payload.id ?? generateId('habit'),
          streakCurrent: payload.streakCurrent ?? 0,
          streakBest: payload.streakBest ?? 0,
          completionRate30d: payload.completionRate30d ?? 0,
          completionHistory: payload.completionHistory ?? {},
          createdAt: nowIso(),
          updatedAt: nowIso(),
        };
        const stats = recalcHabitStatsFromHistory(habit.completionHistory);
        set((state) => {
          const habits = [{ ...habit, ...stats }, ...state.habits];
          return {
            habits,
            goals: recalcGoalProgress(state.goals, state.tasks, habits, state.focusSessions),
          };
        });
        return habit;
      },

      updateHabit: (id, updates) =>
        set((state) => {
          const habits = state.habits.map((habit) =>
            habit.id === id ? { ...habit, ...updates, updatedAt: nowIso() } : habit,
          );
          return {
            habits,
            goals: recalcGoalProgress(state.goals, state.tasks, habits, state.focusSessions),
          };
        }),

      logHabitCompletion: (id, completed, options) =>
        set((state) => {
          const habits = state.habits.map((habit) => {
            if (habit.id !== id) {
              return habit;
            }
            const history = { ...(habit.completionHistory ?? {}) };
            const targetDate = options?.date
              ? startOfDay(typeof options.date === 'string' ? new Date(options.date) : options.date)
              : startOfDay(new Date());
            const key = dateKeyFromDate(targetDate);

            if (options?.clear) {
              delete history[key];
            } else {
              history[key] = completed ? 'done' : 'miss';
            }

            const stats = recalcHabitStatsFromHistory(history);
            return {
              ...habit,
              completionHistory: history,
              ...stats,
              updatedAt: nowIso(),
            };
          });
          return {
            habits,
            goals: recalcGoalProgress(state.goals, state.tasks, habits, state.focusSessions),
          };
        }),

      pauseHabit: (id) =>
        set((state) => {
          const habits = state.habits.map((habit) =>
            habit.id === id ? { ...habit, status: 'paused', updatedAt: nowIso() } : habit,
          );
          return {
            habits,
            goals: recalcGoalProgress(state.goals, state.tasks, habits, state.focusSessions),
          };
        }),

      resumeHabit: (id) =>
        set((state) => {
          const habits = state.habits.map((habit) =>
            habit.id === id ? { ...habit, status: 'active', updatedAt: nowIso() } : habit,
          );
          return {
            habits,
            goals: recalcGoalProgress(state.goals, state.tasks, habits, state.focusSessions),
          };
        }),

      archiveHabit: (id) =>
        set((state) => {
          const habits = state.habits.map((habit) =>
            habit.id === id ? { ...habit, status: 'archived', updatedAt: nowIso() } : habit,
          );
          return {
            habits,
            goals: recalcGoalProgress(state.goals, state.tasks, habits, state.focusSessions),
          };
        }),

      createTask: (payload) => {
        const task: Task = {
          ...payload,
          id: payload.id ?? generateId('task'),
          status: payload.status ?? 'planned',
          focusTotalMinutes: payload.focusTotalMinutes ?? 0,
          checklist: payload.checklist ?? [],
          dependencies: payload.dependencies ?? [],
          createdAt: nowIso(),
          updatedAt: nowIso(),
        };
        set((state) => {
          const tasks = [task, ...state.tasks];
          const historyEntry = createHistoryEntry({
            id: task.id,
            title: task.title,
            status: task.status,
            action: 'created',
            snapshot: task,
          });
          return {
            tasks,
            goals: recalcGoalProgress(state.goals, tasks, state.habits, state.focusSessions),
            taskHistory: [historyEntry, ...state.taskHistory].slice(0, 200),
          };
        });
        return task;
      },

      updateTask: (id, updates) =>
        set((state) => {
          const tasks = state.tasks.map((task) =>
            task.id === id ? { ...task, ...updates, updatedAt: nowIso() } : task,
          );
          return {
            tasks,
            goals: recalcGoalProgress(state.goals, tasks, state.habits, state.focusSessions),
          };
        }),

      completeTask: (id, options) =>
        set((state) => {
          let completedTitle: string | undefined;
          const actualMinutes = options?.actualMinutes ?? 0;
          const tasks = state.tasks.map((task) => {
            if (task.id !== id) {
              return task;
            }
            completedTitle = task.title;
            return {
              ...task,
              status: 'completed',
              focusTotalMinutes: (task.focusTotalMinutes ?? 0) + actualMinutes,
              updatedAt: nowIso(),
            };
          });
          const completedTask = tasks.find((task) => task.id === id);
          const history = completedTitle && completedTask
            ? appendTaskHistoryEntry(
                state.taskHistory,
                createHistoryEntry({
                  id,
                  title: completedTitle,
                  status: 'completed',
                  action: 'completed',
                  snapshot: completedTask,
                }),
              )
            : state.taskHistory;
          return {
            tasks,
            goals: recalcGoalProgress(state.goals, tasks, state.habits, state.focusSessions),
            taskHistory: history,
          };
        }),

      cancelTask: (id) =>
        set((state) => {
          let canceledTitle: string | undefined;
          const tasks = state.tasks.map((task) => {
            if (task.id !== id) {
              return task;
            }
            canceledTitle = task.title;
            return {
              ...task,
              status: 'canceled',
              updatedAt: nowIso(),
            };
          });
          const canceledTask = tasks.find((task) => task.id === id);
          const history = canceledTitle && canceledTask
            ? appendTaskHistoryEntry(
                state.taskHistory,
                createHistoryEntry({
                  id,
                  title: canceledTitle,
                  status: 'canceled',
                  action: 'deleted',
                  snapshot: canceledTask,
                }),
              )
            : state.taskHistory;
          return {
            tasks,
            goals: recalcGoalProgress(state.goals, tasks, state.habits, state.focusSessions),
            taskHistory: history,
          };
        }),

      scheduleTask: (id, schedule) =>
        set((state) => {
          let scheduledTitle: string | undefined;
          const tasks = state.tasks.map((task) => {
            if (task.id !== id) {
              return task;
            }
            scheduledTitle = task.title;
            return {
              ...task,
              status: 'planned',
              dueDate: schedule.dueDate,
              startDate: schedule.dueDate,
              timeOfDay: schedule.timeOfDay ?? task.timeOfDay,
              updatedAt: nowIso(),
            };
          });
          const scheduledTask = tasks.find((task) => task.id === id);
          const history = scheduledTitle && scheduledTask
            ? appendTaskHistoryEntry(
                state.taskHistory,
                createHistoryEntry({
                  id,
                  title: scheduledTitle,
                  status: 'planned',
                  action: 'moved',
                  snapshot: scheduledTask,
                }),
              )
            : state.taskHistory;
          return {
            tasks,
            goals: recalcGoalProgress(state.goals, tasks, state.habits, state.focusSessions),
            taskHistory: history,
          };
        }),

      toggleTaskChecklist: (taskId, itemId) =>
        set((state) => ({
          tasks: state.tasks.map((task) => {
            if (task.id !== taskId || !task.checklist) {
              return task;
            }
            return {
              ...task,
              checklist: task.checklist.map((item) =>
                item.id === itemId ? { ...item, completed: !item.completed } : item,
              ),
            };
          }),
        })),

      addTaskDependency: (taskId, dependency) =>
        set((state) => ({
          tasks: state.tasks.map((task) =>
            task.id === taskId
              ? { ...task, dependencies: [...(task.dependencies ?? []), dependency] }
              : task,
          ),
        })),

      setTaskStatus: (taskId, status) =>
        set((state) => {
          const tasks = state.tasks.map((task) =>
            task.id === taskId ? { ...task, status, updatedAt: nowIso() } : task,
          );
          const updatedTask = tasks.find((task) => task.id === taskId);
          const historyEntry = createHistoryEntry({
            id: taskId,
            title: updatedTask?.title ?? state.tasks.find((task) => task.id === taskId)?.title ?? '',
            status,
            action: 'moved',
            snapshot: updatedTask,
          });
          return {
            tasks,
            goals: recalcGoalProgress(state.goals, tasks, state.habits, state.focusSessions),
            taskHistory: [historyEntry, ...state.taskHistory].slice(0, 200),
          };
        }),

      deleteTask: (taskId) =>
        set((state) => {
          const removedTask = state.tasks.find((task) => task.id === taskId);
          const tasks = state.tasks.filter((task) => task.id !== taskId);
          const historyEntry = createHistoryEntry({
            id: taskId,
            title: removedTask?.title ?? '',
            status: 'canceled',
            action: 'deleted',
            snapshot: removedTask,
          });
          return {
            tasks,
            goals: recalcGoalProgress(state.goals, tasks, state.habits, state.focusSessions),
            taskHistory: [historyEntry, ...state.taskHistory].slice(0, 200),
          };
        }),

      restoreTaskFromHistory: (historyId) =>
        set((state) => {
          const entryIndex = state.taskHistory.findIndex((item) => item.historyId === historyId);
          if (entryIndex === -1) {
            return state;
          }
          const entry = state.taskHistory[entryIndex];
          if (!entry.snapshot) {
            return {
              taskHistory: state.taskHistory.filter((item, idx) => idx !== entryIndex),
            };
          }
          const restored: Task = {
            ...entry.snapshot,
            status: entry.snapshot.status === 'canceled' ? 'planned' : entry.snapshot.status,
            updatedAt: nowIso(),
          };
          const tasks = [restored, ...state.tasks.filter((task) => task.id !== restored.id)];
          return {
            tasks,
            goals: recalcGoalProgress(state.goals, tasks, state.habits, state.focusSessions),
            taskHistory: state.taskHistory.filter((item, idx) => idx !== entryIndex),
          };
        }),

      removeHistoryEntry: (historyId) =>
        set((state) => ({
          taskHistory: state.taskHistory.filter((entry) => entry.historyId !== historyId),
        })),

      createFocusSession: (payload) => {
        const session: FocusSession = {
          ...payload,
          id: generateId('focus'),
          status: payload.status ?? 'in_progress',
          createdAt: nowIso(),
          updatedAt: nowIso(),
        };
        set((state) => {
          const focusSessions = [session, ...state.focusSessions];
          return {
            focusSessions,
            goals: recalcGoalProgress(state.goals, state.tasks, state.habits, focusSessions),
          };
        });
        return session;
      },

      updateFocusSession: (id, updates) =>
        set((state) => {
          const focusSessions = state.focusSessions.map((session) =>
            session.id === id ? { ...session, ...updates, updatedAt: nowIso() } : session,
          );
          return {
            focusSessions,
            goals: recalcGoalProgress(state.goals, state.tasks, state.habits, focusSessions),
          };
        }),

      startFocus: (payload) => {
        const plannedMinutes = payload.plannedMinutes ?? 25;
        const session = get().createFocusSession({
          userId: 'local-user',
          taskId: payload.taskId,
          goalId: payload.goalId,
          plannedMinutes,
          startedAt: nowIso(),
          notes: payload.notes,
        });
        if (payload.taskId) {
          set((state) => {
            const tasks = state.tasks.map((task) =>
              task.id === payload.taskId
                ? { ...task, status: 'in_progress', lastFocusSessionId: session.id, updatedAt: nowIso() }
                : task,
            );
            return {
              tasks,
              goals: recalcGoalProgress(state.goals, tasks, state.habits, state.focusSessions),
            };
          });
        }
        return session;
      },

      pauseFocus: (sessionId) =>
        set((state) => {
          const focusSessions = state.focusSessions.map((session) =>
            session.id === sessionId ? { ...session, status: 'paused', updatedAt: nowIso() } : session,
          );
          return {
            focusSessions,
            goals: recalcGoalProgress(state.goals, state.tasks, state.habits, focusSessions),
          };
        }),

      resumeFocus: (sessionId) =>
        set((state) => {
          const focusSessions = state.focusSessions.map((session) =>
            session.id === sessionId ? { ...session, status: 'in_progress', updatedAt: nowIso() } : session,
          );
          return {
            focusSessions,
            goals: recalcGoalProgress(state.goals, state.tasks, state.habits, focusSessions),
          };
        }),

      finishFocus: (sessionId, options) =>
        set((state) => {
          const targetSession = state.focusSessions.find((session) => session.id === sessionId);
          if (!targetSession) {
            return state;
          }
          const actualMinutes =
            options?.actualMinutes ?? targetSession.actualMinutes ?? targetSession.plannedMinutes ?? 0;
          const focusSessions = state.focusSessions.map((session) =>
            session.id === sessionId
              ? {
                  ...session,
                  status: 'completed',
                  actualMinutes,
                  endedAt: session.endedAt ?? nowIso(),
                  updatedAt: nowIso(),
                }
              : session,
          );
          let tasks = state.tasks;
          if (targetSession.taskId) {
            tasks = state.tasks.map((task) =>
              task.id === targetSession.taskId
                ? {
                    ...task,
                    focusTotalMinutes: (task.focusTotalMinutes ?? 0) + actualMinutes,
                    lastFocusSessionId: sessionId,
                    updatedAt: nowIso(),
                  }
                : task,
            );
          }
          return {
            focusSessions,
            tasks,
            goals: recalcGoalProgress(state.goals, tasks, state.habits, focusSessions),
          };
        }),

      cancelFocus: (sessionId) =>
        set((state) => {
          const focusSessions = state.focusSessions.map((session) =>
            session.id === sessionId ? { ...session, status: 'canceled', updatedAt: nowIso() } : session,
          );
          return {
            focusSessions,
            goals: recalcGoalProgress(state.goals, state.tasks, state.habits, focusSessions),
          };
        }),
      hydrateFromRealm: (payload) =>
        set((state) => ({
          ...state,
          ...payload,
        })),
}));
