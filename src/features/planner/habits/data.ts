import type { AppTranslations } from '@/localization/strings';
import type { PlannerGoalId, PlannerHabitId } from '@/types/planner';

export type HabitDayStatus = 'done' | 'miss' | 'none';
export type HabitCTAType = 'check' | 'timer' | 'chips' | 'dual';

export interface HabitTemplate {
  id: PlannerHabitId;
  contentKey: PlannerHabitId;
  streak: number;
  record: number;
  weeklyCompleted: number;
  weeklyTarget: number;
  daysRow: HabitDayStatus[];
  badgeDays?: number;
  cta?: { kind: HabitCTAType };
  chips?: string[];
  linkedGoalIds: PlannerGoalId[];
  scheduleDays: number[]; // 0 (Sun) - 6 (Sat)
}

export interface HabitCardModel extends HabitTemplate {
  title: string;
  aiNote?: string;
  expanded?: boolean;
}

const HABIT_TEMPLATES: HabitTemplate[] = [
  {
    contentKey: 'h1',
    id: 'h1',
    streak: 12,
    record: 45,
    weeklyCompleted: 6,
    weeklyTarget: 7,
    daysRow: ['done', 'done', 'done', 'done', 'done', 'done', 'none', 'none', 'none', 'none'],
    badgeDays: 12,
    cta: { kind: 'check' },
    linkedGoalIds: ['fitness'],
    scheduleDays: [1, 2, 3, 4, 5],
  },
  {
    contentKey: 'h2',
    id: 'h2',
    streak: 1,
    record: 21,
    weeklyCompleted: 4,
    weeklyTarget: 7,
    daysRow: ['done', 'none', 'miss', 'none', 'none', 'none', 'none', 'none', 'none', 'none'],
    badgeDays: 5,
    cta: { kind: 'check' },
    linkedGoalIds: ['fitness'],
    scheduleDays: [0, 1, 2, 3, 4, 5, 6],
  },
  {
    contentKey: 'h3',
    id: 'h3',
    streak: 5,
    record: 30,
    weeklyCompleted: 5,
    weeklyTarget: 7,
    daysRow: ['done', 'done', 'miss', 'done', 'done', 'none', 'none', 'none', 'none', 'none'],
    badgeDays: 8,
    cta: { kind: 'timer' },
    linkedGoalIds: ['language'],
    scheduleDays: [1, 3, 5],
  },
  {
    contentKey: 'h4',
    id: 'h4',
    streak: 30,
    record: 30,
    weeklyCompleted: 7,
    weeklyTarget: 7,
    daysRow: ['done', 'done', 'done', 'done', 'done', 'done', 'done', 'done', 'done', 'done'],
    badgeDays: 30,
    cta: { kind: 'chips' },
    chips: ['+ 250ml', '+ 500ml', '+ 1l'],
    linkedGoalIds: ['fitness'],
    scheduleDays: [0, 1, 2, 3, 4, 5, 6],
  },
  {
    contentKey: 'h5',
    id: 'h5',
    streak: 3,
    record: 7,
    weeklyCompleted: 3,
    weeklyTarget: 5,
    daysRow: ['done', 'miss', 'miss', 'done', 'done', 'none', 'none', 'none', 'none', 'none'],
    badgeDays: 8,
    cta: { kind: 'dual' },
    linkedGoalIds: ['dream-car', 'language'],
    scheduleDays: [0, 6],
  },
];

export const buildHabits = (
  content: AppTranslations['plannerScreens']['habits']['data'],
): HabitCardModel[] =>
  HABIT_TEMPLATES.map((template) => {
    const localized = content[template.contentKey];
    return {
      ...template,
      title: localized.title,
      aiNote: localized.aiNote,
      chips: localized.chips ?? template.chips,
      expanded: false,
    };
  });

export const getHabitTemplates = () => HABIT_TEMPLATES;
