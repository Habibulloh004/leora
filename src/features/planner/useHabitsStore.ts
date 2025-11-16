import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { mmkvStorageAdapter } from '@/utils/storage';
import type { PlannerGoalId, PlannerHabitId } from '@/types/planner';
import {
  HabitCTAType,
  HabitDayStatus,
  HabitTemplate,
  getHabitTemplates,
} from '@/features/planner/habits/data';

export interface PlannerHabitEntity extends HabitTemplate {
  description?: string;
}

export interface HabitFormInput {
  title: string;
  description?: string;
  iconId: string;
  countingType: 'create' | 'quit';
  category: string;
  difficulty: 'easy' | 'medium' | 'hard';
  reminderEnabled: boolean;
  reminderTime: string;
  streakEnabled: boolean;
  streakDays: number;
  weeklyCompleted?: number;
  weeklyTarget?: number;
  linkedGoalIds?: PlannerGoalId[];
  chips?: string[];
  cta?: HabitCTAType;
}

type PlannerHabitsStore = {
  habits: PlannerHabitEntity[];
  createHabit: (input: HabitFormInput) => PlannerHabitId;
  updateHabit: (id: PlannerHabitId, input: HabitFormInput) => void;
  deleteHabit: (id: PlannerHabitId) => void;
  toggleArchiveHabit: (id: PlannerHabitId, archived?: boolean) => void;
  setWeeklyCompletion: (id: PlannerHabitId, completionPct: number) => void;
};

const STORAGE_ID = 'planner-habits';
const storage = createJSONStorage(() => mmkvStorageAdapter);

const withDefaults = (template: HabitTemplate): PlannerHabitEntity => ({
  ...template,
  countingType: template.countingType ?? 'create',
  category: template.category ?? 'health',
  difficulty: template.difficulty ?? 'medium',
  reminderEnabled: template.reminderEnabled ?? false,
  reminderTime: template.reminderTime ?? '07:00',
  streakEnabled: template.streakEnabled ?? false,
  streakDays: template.streakDays ?? template.badgeDays ?? 21,
});

const seedHabits: PlannerHabitEntity[] = getHabitTemplates().map(withDefaults);

export const usePlannerHabitsStore = create<PlannerHabitsStore>()(
  persist(
    (set) => ({
      habits: seedHabits,
      createHabit: (input) => {
        const id = (`habit-${Date.now()}`) as PlannerHabitId;
        const daysRow: HabitDayStatus[] = Array.from({ length: 10 }, () => 'none');
        set((state) => ({
          habits: [
            {
              id,
              streak: 0,
              record: 0,
              weeklyCompleted: input.weeklyCompleted ?? 0,
              weeklyTarget: input.weeklyTarget ?? 7,
              daysRow,
              contentKey: undefined,
              badgeDays: input.streakDays,
              cta: input.cta ?? { kind: 'check' },
              chips: input.chips,
              linkedGoalIds: input.linkedGoalIds ?? [],
              scheduleDays: [],
              titleOverride: input.title,
              description: input.description,
              countingType: input.countingType,
              category: input.category,
              difficulty: input.difficulty,
              reminderEnabled: input.reminderEnabled,
              reminderTime: input.reminderTime,
              streakEnabled: input.streakEnabled,
              streakDays: input.streakDays,
              iconId: input.iconId,
            },
            ...state.habits,
          ],
        }));
        return id;
      },
      updateHabit: (id, input) =>
        set((state) => ({
          habits: state.habits.map((habit) => {
            if (habit.id !== id) {
              return habit;
            }
            return {
              ...habit,
              titleOverride: input.title,
              description: input.description,
              countingType: input.countingType,
              category: input.category,
              difficulty: input.difficulty,
              reminderEnabled: input.reminderEnabled,
              reminderTime: input.reminderTime,
              streakEnabled: input.streakEnabled,
              streakDays: input.streakDays,
              weeklyTarget: input.weeklyTarget ?? habit.weeklyTarget,
              weeklyCompleted: input.weeklyCompleted ?? habit.weeklyCompleted,
              chips: input.chips ?? habit.chips,
              cta: input.cta ?? habit.cta,
              iconId: input.iconId,
            };
          }),
        })),
      deleteHabit: (id) =>
        set((state) => ({
          habits: state.habits.filter((habit) => habit.id !== id),
        })),
      toggleArchiveHabit: (id, archived = true) =>
        set((state) => ({
          habits: state.habits.map((habit) =>
            habit.id === id
              ? {
                  ...habit,
                  archived,
                }
              : habit,
          ),
        })),
      setWeeklyCompletion: (id, completionPct) =>
        set((state) => ({
          habits: state.habits.map((habit) =>
            habit.id === id
              ? {
                  ...habit,
                  weeklyCompleted: Math.round(
                    ((habit.weeklyTarget || 1) * completionPct) / 100,
                  ),
                }
              : habit,
          ),
        })),
    }),
    {
      name: STORAGE_ID,
      storage,
    },
  ),
);
