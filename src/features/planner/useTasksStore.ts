import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { addDays, startOfDay } from '@/utils/calendar';
import { mmkvStorageAdapter } from '@/utils/storage';
import type {
  PlannerGoalId,
  PlannerHabitId,
  PlannerTask,
  PlannerTaskSection,
  PlannerTaskStatus,
} from '@/types/planner';

export type { PlannerTask, PlannerTaskStatus, PlannerTaskSection } from '@/types/planner';

export type PlannerTaskInput = Omit<
  PlannerTask,
  'id' | 'status' | 'createdAt' | 'updatedAt' | 'deletedAt' | 'focusMeta'
> & {
  status?: PlannerTaskStatus;
};

export type FocusStartOptions = {
  technique?: string;
  durationMinutes?: number;
};

type PlannerTaskStore = {
  tasks: PlannerTask[];
  history: PlannerTask[];
  addTask: (task: PlannerTaskInput) => void;
  updateTask: (id: string, task: PlannerTaskInput) => void;
  toggleDone: (id: string) => void;
  toggleExpand: (id: string) => void;
  deleteTask: (id: string) => void;
  restoreTask: (id: string) => void;
  removeFromHistory: (id: string) => void;
  overwriteTasks: (tasks: PlannerTask[]) => void;
  startFocus: (id: string, options?: FocusStartOptions) => void;
  completeFocus: (id: string, outcome?: 'done' | 'move') => void;
  rescheduleTask: (id: string, newDate: Date) => void;
  linkTaskToGoal: (id: string, goalId?: PlannerGoalId | null) => void;
  linkTaskToHabit: (id: string, habitId?: string) => void;
  syncStatuses: () => void;
};

const STORAGE_ID = 'planner-tasks-storage';
const storage = createJSONStorage(() => mmkvStorageAdapter);
const now = Date.now();
const hoursFromNow = (hours: number) => now + hours * 60 * 60 * 1000;
const KNOWN_GOAL_IDS: PlannerGoalId[] = ['dream-car', 'emergency-fund', 'fitness', 'language'];
const KNOWN_HABIT_IDS: PlannerHabitId[] = ['h1', 'h2', 'h3', 'h4', 'h5'];

const sanitizeGoalId = (value?: string | PlannerGoalId | null): PlannerGoalId | undefined => {
  if (!value) return undefined;
  if (KNOWN_GOAL_IDS.includes(value as PlannerGoalId)) {
    return value as PlannerGoalId;
  }
  if ((value as string).startsWith('goal-')) {
    return value as PlannerGoalId;
  }
  return undefined;
};

const sanitizeHabitId = (value?: string | PlannerHabitId | null): PlannerHabitId | undefined => {
  if (!value) return undefined;
  if (KNOWN_HABIT_IDS.includes(value as PlannerHabitId)) {
    return value as PlannerHabitId;
  }
  if ((value as string).startsWith('habit-')) {
    return value as PlannerHabitId;
  }
  return undefined;
};

const normalizeStoredTask = (task: PlannerTask, nowTs?: number): PlannerTask => {
  return normalizeTask(
    {
      ...task,
      goalId: sanitizeGoalId(task.goalId),
      linkedHabitId: sanitizeHabitId(task.linkedHabitId),
    },
    nowTs,
  );
};

const deriveSectionFromDueAt = (dueAt?: number | null): PlannerTaskSection => {
  if (!dueAt) {
    return 'morning';
  }
  const hour = new Date(dueAt).getHours();
  if (hour < 12) return 'morning';
  if (hour < 18) return 'afternoon';
  return 'evening';
};

const ensureSection = (section?: PlannerTaskSection, dueAt?: number | null): PlannerTaskSection =>
  section ?? deriveSectionFromDueAt(dueAt);

const normalizeTask = (task: PlannerTask, nowTs = Date.now()): PlannerTask => {
  const section = ensureSection(task.section, task.dueAt);
  if (task.status === 'done' || task.status === 'moved' || task.status === 'in_progress') {
    return { ...task, section };
  }
  if (task.dueAt != null && task.dueAt < nowTs) {
    return { ...task, status: 'overdue', section };
  }
  return { ...task, status: 'planned', section };
};

const shiftDueAtByDays = (task: PlannerTask, days: number) => {
  if (task.dueAt != null) {
    return task.dueAt + days * 24 * 60 * 60 * 1000;
  }
  const base = addDays(startOfDay(new Date()), days);
  base.setHours(9, 0, 0, 0);
  return base.getTime();
};

const seedTasks: PlannerTask[] = [
  {
    id: '1',
    title: 'Morning workout',
    desc: 'Strength + mobility circuit',
    start: '07:00',
    duration: '30 min',
    context: '@home',
    energy: 3,
    projectHeart: true,
    section: 'morning',
    status: 'done',
    createdAt: now - 1000 * 60 * 60 * 6,
    dueAt: hoursFromNow(-6),
    goalId: 'fitness',
    linkedHabitId: 'h1',
  },
  {
    id: '2',
    title: 'Check the mail',
    start: '09:00',
    duration: '15 min',
    context: '@work',
    energy: 2,
    section: 'morning',
    status: 'planned',
    createdAt: now - 1000 * 60 * 60 * 5,
    dueAt: hoursFromNow(-2),
  },
  {
    id: '3',
    title: 'Team collaboration',
    start: '10:00',
    duration: '1 hour',
    context: '@work',
    energy: 3,
    section: 'morning',
    status: 'planned',
    createdAt: now - 1000 * 60 * 60 * 4,
    dueAt: hoursFromNow(1),
    goalId: 'dream-car',
  },
  {
    id: '4',
    title: 'Prototype: LEORA automation',
    start: '14:00',
    duration: '2 hours',
    context: '@work',
    energy: 3,
    aiNote: 'Best deep-focus slot to finish the sprint deliverable',
    projectHeart: true,
    section: 'afternoon',
    status: 'in_progress',
    createdAt: now - 1000 * 60 * 60 * 3,
    dueAt: hoursFromNow(4),
    goalId: 'dream-car',
    focusMeta: { isActive: true, startedAt: now - 15 * 60 * 1000, technique: 'pomodoro', durationMinutes: 50 },
  },
  {
    id: '5',
    title: 'Meet with Aziz',
    start: '13:00',
    duration: '30 min',
    context: '@cafe',
    energy: 2,
    section: 'afternoon',
    status: 'planned',
    createdAt: now - 1000 * 60 * 60 * 2.5,
    dueAt: hoursFromNow(2),
    goalId: 'dream-car',
  },
  {
    id: '6',
    title: 'Buy groceries',
    start: 'After work',
    duration: '1 hour',
    context: '@market',
    energy: 2,
    afterWork: true,
    section: 'afternoon',
    status: 'planned',
    createdAt: now - 1000 * 60 * 60 * 2,
    dueAt: null,
  },
  {
    id: '7',
    title: 'Top up emergency fund',
    start: '10:00',
    duration: '20 min',
    context: '@home',
    energy: 1,
    costUZS: '280 000 UZS',
    section: 'afternoon',
    status: 'planned',
    createdAt: now - 1000 * 60 * 60,
    dueAt: hoursFromNow(-1),
    goalId: 'emergency-fund',
  },
  {
    id: '8',
    title: 'Evening workout',
    start: '19:00',
    duration: '30 min',
    context: '@park',
    energy: 3,
    section: 'evening',
    status: 'planned',
    createdAt: now - 1000 * 60 * 30,
    dueAt: hoursFromNow(6),
    goalId: 'fitness',
    linkedHabitId: 'h1',
  },
  {
    id: '9',
    title: 'Review language notes',
    start: '21:00',
    duration: '15 min',
    context: '@home',
    energy: 2,
    section: 'evening',
    status: 'planned',
    createdAt: now - 1000 * 60 * 15,
    dueAt: hoursFromNow(8),
    goalId: 'language',
    linkedHabitId: 'h3',
  },
];

const initialTasks: PlannerTask[] = seedTasks.map((task) => normalizeStoredTask(task, now));

export const usePlannerTasksStore = create<PlannerTaskStore>()(
  persist(
    (set, get) => ({
      tasks: initialTasks,
      history: [],
      overwriteTasks: (tasks) =>
        set({
          tasks: tasks.map((task) => normalizeStoredTask(task)),
        }),
      addTask: (input) => {
        const createdAt = Date.now();
        const goalId = sanitizeGoalId(input.goalId);
        const newTask: PlannerTask = normalizeTask(
          {
            ...input,
            id: `task-${createdAt}`,
            status: input.status ?? 'planned',
            createdAt,
            updatedAt: createdAt,
            dueAt: input.dueAt ?? null,
            expanded: input.expanded ?? false,
            goalId,
            linkedHabitId: sanitizeHabitId(input.linkedHabitId),
            metadata: input.metadata,
          },
          createdAt,
        );
        set((state) => ({
          tasks: [newTask, ...state.tasks],
        }));
      },
      updateTask: (id, input) =>
        set((state) => {
          const nowTs = Date.now();
          return {
            tasks: state.tasks.map((task) => {
              if (task.id !== id) return task;
              return normalizeTask(
                {
                  ...task,
                  ...input,
                  id,
                  status: input.status ?? task.status,
                  updatedAt: nowTs,
                  dueAt: input.dueAt ?? task.dueAt ?? null,
                  goalId: sanitizeGoalId(input.goalId) ?? task.goalId,
                  linkedHabitId: sanitizeHabitId(input.linkedHabitId) ?? task.linkedHabitId,
                  metadata: input.metadata ?? task.metadata,
                },
                nowTs,
              );
            }),
          };
        }),
      toggleDone: (id) =>
        set((state) => {
          const nowTs = Date.now();
          return {
            tasks: state.tasks.map((task) => {
              if (task.id !== id) return task;
              if (task.status === 'done') {
                return normalizeTask(
                  {
                    ...task,
                    status: 'planned',
                    updatedAt: nowTs,
                    focusMeta: task.focusMeta ? { ...task.focusMeta, isActive: false, lastResult: 'done' } : undefined,
                  },
                  nowTs,
                );
              }
              return {
                ...task,
                status: 'done',
                updatedAt: nowTs,
                focusMeta: task.focusMeta
                  ? { ...task.focusMeta, isActive: false, lastSessionEndedAt: nowTs, lastResult: 'done' }
                  : { isActive: false, lastSessionEndedAt: nowTs, lastResult: 'done' },
              };
            }),
          };
        }),
      toggleExpand: (id) =>
        set((state) => ({
          tasks: state.tasks.map((task) =>
            task.id === id ? { ...task, expanded: !task.expanded } : task,
          ),
          history: state.history.map((task) =>
            task.id === id ? { ...task, expanded: !task.expanded } : task,
          ),
        })),
      deleteTask: (id) =>
        set((state) => {
          const task = state.tasks.find((t) => t.id === id);
          if (!task) return state;
          const updatedTask: PlannerTask = {
            ...task,
            expanded: false,
            deletedAt: Date.now(),
            status: task.status === 'done' ? 'done' : 'moved',
            focusMeta: task.focusMeta ? { ...task.focusMeta, isActive: false } : undefined,
          };

          return {
            tasks: state.tasks.filter((t) => t.id !== id),
            history: [updatedTask, ...state.history],
          };
        }),
      restoreTask: (id) =>
        set((state) => {
          const task = state.history.find((t) => t.id === id);
          if (!task) return state;

          const restored: PlannerTask = normalizeStoredTask(
            {
              ...task,
              deletedAt: null,
              expanded: false,
              status: task.status === 'done' ? 'done' : 'planned',
            },
            Date.now(),
          );

          return {
            tasks: [restored, ...state.tasks],
            history: state.history.filter((t) => t.id !== id),
          };
        }),
      removeFromHistory: (id) =>
        set((state) => ({
          history: state.history.filter((t) => t.id !== id),
        })),
      startFocus: (id, options) =>
        set((state) => ({
          tasks: state.tasks.map((task) =>
            task.id === id
              ? {
                  ...task,
                  status: 'in_progress',
                  focusMeta: {
                    ...task.focusMeta,
                    isActive: true,
                    startedAt: Date.now(),
                    technique: options?.technique ?? task.focusMeta?.technique,
                    durationMinutes: options?.durationMinutes ?? task.focusMeta?.durationMinutes,
                  },
                }
              : task,
          ),
        })),
      completeFocus: (id, outcome = 'done') =>
        set((state) => ({
          tasks: state.tasks.map((task) => {
            if (task.id !== id) return task;
            const base: PlannerTask = {
              ...task,
              focusMeta: {
                ...task.focusMeta,
                isActive: false,
                lastSessionEndedAt: Date.now(),
                lastResult: outcome,
              },
            };
            if (outcome === 'done') {
              return { ...base, status: 'done' };
            }
            if (outcome === 'move') {
              const nextDueAt = shiftDueAtByDays(task, 1);
              return {
                ...base,
                status: 'moved',
                dueAt: nextDueAt,
                section: deriveSectionFromDueAt(nextDueAt),
              };
            }
            return normalizeTask(base);
          }),
        })),
      rescheduleTask: (id, newDate) =>
        set((state) => ({
          tasks: state.tasks.map((task) => {
            if (task.id !== id) return task;
            const dueAt = newDate.getTime();
            return normalizeTask({
              ...task,
              status: 'moved',
              dueAt,
              section: deriveSectionFromDueAt(dueAt),
              updatedAt: Date.now(),
            });
          }),
        })),
      linkTaskToGoal: (id, goalId) =>
        set((state) => ({
          tasks: state.tasks.map((task) =>
            task.id === id ? { ...task, goalId: sanitizeGoalId(goalId) } : task,
          ),
        })),
      linkTaskToHabit: (id, habitId) =>
        set((state) => ({
          tasks: state.tasks.map((task) =>
            task.id === id ? { ...task, linkedHabitId: sanitizeHabitId(habitId) } : task,
          ),
        })),
      syncStatuses: () =>
        set((state) => ({
          tasks: state.tasks.map((task) => normalizeStoredTask(task)),
        })),
    }),
    {
      name: STORAGE_ID,
      storage,
      partialize: (state) => ({
        tasks: state.tasks.map((task) => normalizeStoredTask(task)),
        history: state.history,
      }),
    },
  ),
);

export const selectTasksState = () =>
  usePlannerTasksStore.getState();
