import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { mmkvStorageAdapter } from '@/utils/storage';

export type PlannerTaskStatus = 'active' | 'completed' | 'deleted';
export type PlannerTaskSection = 'morning' | 'afternoon' | 'evening';

export type PlannerTask = {
  id: string;
  title: string;
  desc?: string;
  start: string;
  duration: string;
  context: string;
  energy: 1 | 2 | 3;
  projectHeart?: boolean;
  aiNote?: string;
  costUZS?: string;
  afterWork?: boolean;
  section: PlannerTaskSection;
  status: PlannerTaskStatus;
  done: boolean;
  expanded?: boolean;
  createdAt: number;
  dueAt?: number | null;
  deletedAt?: number | null;
};

type PlannerTaskInput = Omit<
  PlannerTask,
  'id' | 'status' | 'done' | 'createdAt' | 'deletedAt'
>;

type PlannerTaskStore = {
  tasks: PlannerTask[];
  history: PlannerTask[];
  addTask: (task: PlannerTaskInput) => void;
  toggleDone: (id: string) => void;
  toggleExpand: (id: string) => void;
  deleteTask: (id: string) => void;
  restoreTask: (id: string) => void;
  removeFromHistory: (id: string) => void;
  overwriteTasks: (tasks: PlannerTask[]) => void;
};

const STORAGE_ID = 'planner-tasks-storage';
const now = Date.now();
const hoursFromNow = (hours: number) => now + hours * 60 * 60 * 1000;
const storage = createJSONStorage(() => mmkvStorageAdapter);

const initialTasks: PlannerTask[] = [
  {
    id: '1',
    title: 'Morning workout',
    desc: 'Description',
    start: '07:00',
    duration: '30 min',
    context: '@home',
    energy: 3,
    projectHeart: true,
    section: 'morning',
    status: 'completed',
    done: true,
    createdAt: Date.now() - 1000 * 60 * 60 * 6,
    dueAt: hoursFromNow(-6),
  },
  {
    id: '2',
    title: 'Check the mail',
    start: '09:00',
    duration: '15 min',
    context: '@work',
    energy: 2,
    section: 'morning',
    status: 'active',
    done: false,
    createdAt: Date.now() - 1000 * 60 * 60 * 5,
    dueAt: hoursFromNow(-2),
  },
  {
    id: '3',
    title: 'Team Collaboration',
    start: '10:00',
    duration: '1 hour',
    context: '@work',
    energy: 3,
    section: 'morning',
    status: 'active',
    done: false,
    createdAt: Date.now() - 1000 * 60 * 60 * 4,
    dueAt: hoursFromNow(1),
  },
  {
    id: '4',
    title: 'Working on LEORA',
    start: '14:00',
    duration: '2 hours',
    context: '@work',
    energy: 3,
    aiNote: 'At: Best time for deep work',
    projectHeart: true,
    section: 'afternoon',
    status: 'active',
    done: false,
    createdAt: Date.now() - 1000 * 60 * 60 * 3,
    dueAt: hoursFromNow(4),
  },
  {
    id: '5',
    title: 'Meet with Aziz',
    start: '13:00',
    duration: '30 min',
    context: '@cafe',
    energy: 2,
    section: 'afternoon',
    status: 'active',
    done: false,
    createdAt: Date.now() - 1000 * 60 * 60 * 2.5,
    dueAt: hoursFromNow(2),
  },
  {
    id: '6',
    title: 'Buy groceries',
    start: 'After work',
    duration: '1 hour',
    context: '@work',
    energy: 2,
    afterWork: true,
    section: 'afternoon',
    status: 'active',
    done: false,
    createdAt: Date.now() - 1000 * 60 * 60 * 2,
    dueAt: null,
  },
  {
    id: '7',
    title: 'Pay for home internet',
    start: '10:00',
    duration: '1 hour',
    context: '@work',
    energy: 1,
    costUZS: '280 000 UZS',
    section: 'afternoon',
    status: 'active',
    done: false,
    createdAt: Date.now() - 1000 * 60 * 60,
    dueAt: hoursFromNow(-1),
  },
  {
    id: '8',
    title: 'Evening workout',
    start: '19:00',
    duration: '30 min',
    context: '@park',
    energy: 3,
    section: 'evening',
    status: 'active',
    done: false,
    createdAt: Date.now() - 1000 * 60 * 30,
    dueAt: hoursFromNow(6),
  },
  {
    id: '9',
    title: 'Check email',
    start: '21:00',
    duration: '15 min',
    context: '@home',
    energy: 2,
    section: 'evening',
    status: 'active',
    done: false,
    createdAt: Date.now() - 1000 * 60 * 15,
    dueAt: hoursFromNow(8),
  },
];

const computeStatus = (task: PlannerTask): PlannerTaskStatus => {
  if (task.status === 'deleted') return 'deleted';
  if (task.done) return 'completed';
  return 'active';
};

export const usePlannerTasksStore = create<PlannerTaskStore>()(
  persist(
    (set) => ({
      tasks: initialTasks,
      history: [],
      overwriteTasks: (tasks) =>
        set({
          tasks,
        }),
      addTask: (input) => {
        const newTask: PlannerTask = {
          ...input,
          id: String(Date.now()),
          status: 'active',
          done: false,
          createdAt: Date.now(),
          dueAt: input.dueAt ?? null,
          expanded: false,
        };
        set((state) => ({
          tasks: [newTask, ...state.tasks],
        }));
      },
      toggleDone: (id) =>
        set((state) => ({
          tasks: state.tasks.map((task) =>
            task.id === id
              ? {
                  ...task,
                  done: !task.done,
                  status: !task.done ? 'completed' : 'active',
                }
              : task,
          ),
        })),
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

          const restored: PlannerTask = {
            ...task,
            deletedAt: null,
            expanded: false,
            status: computeStatus(task),
          };

          return {
            tasks: [restored, ...state.tasks],
            history: state.history.filter((t) => t.id !== id),
          };
        }),
      removeFromHistory: (id) =>
        set((state) => ({
          history: state.history.filter((t) => t.id !== id),
        })),
    }),
    {
      name: STORAGE_ID,
      storage,
      partialize: (state) => ({
        tasks: state.tasks.map((task) => ({
          ...task,
          status: computeStatus(task),
        })),
        history: state.history,
      }),
    },
  ),
);

export const selectTasksState = () =>
  usePlannerTasksStore.getState();
