import type { AppTranslations } from '@/localization/strings';
import { addDays, startOfDay } from '@/utils/calendar';
import type {
  AddTaskDateMode,
  AddTaskPayload,
  PlannerTask,
  PlannerTaskCategoryId,
  PlannerTaskSection,
  TaskEnergyLevel,
} from '@/types/planner';
import type { PlannerTaskInput } from './useTasksStore';

export const computeDueAtFromPayload = (payload: AddTaskPayload): number | null => {
  try {
    const now = new Date();
    let date = new Date(now);

    if (payload.dateMode === 'tomorrow') {
      date.setDate(date.getDate() + 1);
    } else if (payload.dateMode === 'pick' && payload.date) {
      const parsed = new Date(payload.date);
      if (!Number.isNaN(parsed.getTime())) {
        date = parsed;
      }
    }

    if (payload.time) {
      const [hours, minutes] = payload.time.split(':').map(Number);
      if (!Number.isNaN(hours) && !Number.isNaN(minutes)) {
        date.setHours(hours, minutes, 0, 0);
        return date.getTime();
      }
    }

    date.setHours(23, 59, 0, 0);
    return date.getTime();
  } catch (error) {
    console.warn('[planner/tasks] Unable to compute due date from payload.', error);
    return null;
  }
};

const getSectionFromPayload = (payload: AddTaskPayload): PlannerTaskSection => {
  if (payload.time) {
    const hour = Number(payload.time.split(':')[0]);
    if (!Number.isNaN(hour)) {
      if (hour < 12) return 'morning';
      if (hour < 18) return 'afternoon';
    }
  }
  return 'evening';
};

export const buildTaskInputFromPayload = (
  payload: AddTaskPayload,
  tasksStrings: AppTranslations['plannerScreens']['tasks'],
): PlannerTaskInput => {
  const section = getSectionFromPayload(payload);

  const startLabel =
    payload.time ||
    (payload.dateMode === 'today'
      ? tasksStrings.defaults.startToday
      : payload.dateMode === 'tomorrow'
      ? tasksStrings.defaults.startTomorrow
      : tasksStrings.defaults.startPick);

  const dueAt = computeDueAtFromPayload(payload);

  return {
    title: payload.title || tasksStrings.defaults.newTaskTitle,
    desc: payload.description,
    start: startLabel,
    duration: '—',
    context: payload.context || tasksStrings.defaults.defaultContext,
    energy: payload.energy === 'high' ? 3 : payload.energy === 'low' ? 1 : 2,
    projectHeart: payload.needFocus ? true : undefined,
    section,
    afterWork: startLabel.toLowerCase() === 'after work',
    dueAt,
    metadata: {
      sourcePayload: payload,
    },
  };
};

const deriveDateModeFromDueAt = (dueAt?: number | null): { mode: AddTaskDateMode; iso?: string } => {
  if (dueAt == null) {
    return { mode: 'today', iso: undefined };
  }
  const dueDate = new Date(dueAt);
  const today = startOfDay(new Date());
  const tomorrow = startOfDay(addDays(new Date(today), 1));
  const dueDay = startOfDay(dueDate);

  if (dueDay.getTime() === today.getTime()) {
    return { mode: 'today', iso: dueDate.toISOString() };
  }
  if (dueDay.getTime() === tomorrow.getTime()) {
    return { mode: 'tomorrow', iso: dueDate.toISOString() };
  }
  return { mode: 'pick', iso: dueDate.toISOString() };
};

const numberToEnergy = (value?: number): TaskEnergyLevel => {
  if (value === 1) return 'low';
  if (value === 3) return 'high';
  return 'medium';
};

const CONTEXT_CATEGORY_MAP: Record<string, PlannerTaskCategoryId> = {
  '@home': 'personal',
  '@work': 'work',
  '@health': 'health',
  '@learning': 'learning',
  '@city': 'errands',
};

const deriveCategoryFromContext = (context?: string): PlannerTaskCategoryId => {
  if (!context) return 'work';
  return CONTEXT_CATEGORY_MAP[context] ?? 'work';
};

const deriveTimeFromTask = (task: PlannerTask): string | undefined => {
  if (task.start) {
    const match = task.start.match(/(\d{1,2}):(\d{2})/);
    if (match) {
      const hours = match[1].padStart(2, '0');
      const minutes = match[2];
      return `${hours}:${minutes}`;
    }
  }
  if (task.dueAt != null) {
    const date = new Date(task.dueAt);
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
  }
  return undefined;
};

export const buildPayloadFromTask = (
  task: PlannerTask,
  tasksStrings: AppTranslations['plannerScreens']['tasks'],
): AddTaskPayload => {
  if (task.metadata?.sourcePayload) {
    return task.metadata.sourcePayload;
  }

  const { mode, iso } = deriveDateModeFromDueAt(task.dueAt);
  return {
    title: task.title,
    dateMode: mode,
    date: iso,
    time: deriveTimeFromTask(task),
    description: task.desc,
    project: undefined,
    context: task.context || tasksStrings.defaults.defaultContext,
    energy: numberToEnergy(task.energy),
    priority: 'medium',
    categoryId: deriveCategoryFromContext(task.context),
    reminderEnabled: false,
    remindBeforeMin: 15,
    repeatEnabled: false,
    repeatRule: 'Everyday',
    needFocus: !!task.projectHeart,
    subtasks: [],
  };
};
