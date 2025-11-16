import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import type { GoalSummaryKey, PlannerGoalId } from '@/types/planner';
import { mmkvStorageAdapter } from '@/utils/storage';
import type { GoalHistoryEntry } from '@/features/planner/goals/data';

export type PlannerGoalCategory = 'financial' | 'personal' | 'career' | 'health' | 'educational' | 'other';

export interface PlannerGoalEntity {
  id: PlannerGoalId;
  contentKey?: PlannerGoalId;
  type: 'financial' | 'quantitative' | 'quality';
  category: PlannerGoalCategory;
  progress: number;
  currentAmount?: string;
  targetAmount?: string;
  summaryOverrides?: Partial<Record<GoalSummaryKey, string>>;
  milestoneLabels?: string[];
  historyOverrides?: GoalHistoryEntry[];
  aiTipOverride?: string;
  aiTipHighlightOverride?: string;
  customTitle?: string;
  customDescription?: string;
  countingType?: string;
  deadline?: string;
  archived?: boolean;
}

export interface GoalFormInput {
  title: string;
  description?: string;
  type: 'financial' | 'quantitative' | 'quality';
  category: PlannerGoalCategory;
  amount?: string;
  countingType?: string;
  progressPercent: number;
  deadline?: Date;
  milestones: string[];
}

type PlannerGoalsStore = {
  goals: PlannerGoalEntity[];
  createGoal: (input: GoalFormInput) => PlannerGoalId;
  updateGoal: (id: PlannerGoalId, input: GoalFormInput) => void;
  deleteGoal: (id: PlannerGoalId) => void;
  toggleArchiveGoal: (id: PlannerGoalId, archived?: boolean) => void;
  setProgress: (id: PlannerGoalId, percent: number) => void;
};

const STORAGE_ID = 'planner-goals';
const storage = createJSONStorage(() => mmkvStorageAdapter);

const goalSeeds: PlannerGoalEntity[] = [
  { id: 'dream-car', contentKey: 'dream-car', type: 'financial', category: 'financial', progress: 0.82 },
  { id: 'emergency-fund', contentKey: 'emergency-fund', type: 'financial', category: 'financial', progress: 0.58 },
  { id: 'fitness', contentKey: 'fitness', type: 'quality', category: 'personal', progress: 0.44 },
  { id: 'language', contentKey: 'language', type: 'quantitative', category: 'personal', progress: 0.68 },
];

const clampPercent = (value: number) => Math.max(0, Math.min(100, value));

export const usePlannerGoalsStore = create<PlannerGoalsStore>()(
  persist(
    (set) => ({
      goals: goalSeeds,
      createGoal: (input) => {
        const id = (`goal-${Date.now()}`) as PlannerGoalId;
        set((state) => ({
          goals: [
            {
              id,
              type: input.type,
              category: input.category,
              progress: clampPercent(input.progressPercent) / 100,
              targetAmount: input.amount,
              countingType: input.countingType,
              customTitle: input.title,
              customDescription: input.description,
              milestoneLabels: input.milestones,
              deadline: input.deadline?.toISOString(),
            },
            ...state.goals,
          ],
        }));
        return id;
      },
      updateGoal: (id, input) =>
        set((state) => ({
          goals: state.goals.map((goal) =>
            goal.id === id
              ? {
                  ...goal,
                  type: input.type,
                  category: input.category,
                  progress: clampPercent(input.progressPercent) / 100,
                  targetAmount: input.amount,
                  countingType: input.countingType,
                  customTitle: input.title,
                  customDescription: input.description,
                  milestoneLabels: input.milestones,
                  deadline: input.deadline?.toISOString(),
                }
              : goal,
          ),
        })),
      deleteGoal: (id) =>
        set((state) => ({
          goals: state.goals.filter((goal) => goal.id !== id),
        })),
      toggleArchiveGoal: (id, archived = true) =>
        set((state) => ({
          goals: state.goals.map((goal) => (goal.id === id ? { ...goal, archived } : goal)),
        })),
      setProgress: (id, percent) =>
        set((state) => ({
          goals: state.goals.map((goal) =>
            goal.id === id ? { ...goal, progress: clampPercent(percent) / 100 } : goal,
          ),
        })),
    }),
    {
      name: STORAGE_ID,
      storage,
    },
  ),
);
