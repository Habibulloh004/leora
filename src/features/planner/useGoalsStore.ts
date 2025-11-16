import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import type { GoalSummaryKey, PlannerGoalId } from '@/types/planner';
import { mmkvStorageAdapter } from '@/utils/storage';
import type { GoalHistoryEntry } from '@/features/planner/goals/data';
import {
  ensureGoalProgressEngine,
  registerGoalDefinition,
  updateGoalProgress,
} from '@/features/goals/gpe/engine';
import { handleManualGoalUpdateEvent } from '@/features/goals/gpe/events';
import type { GoalDefinition } from '@/features/goals/gpe/types';
import { getGoalDefinition } from '@/stores/useGoalProgressEngineStore';
import { normalizeFinanceCurrency, isFinanceCurrencyCode } from '@/utils/financeCurrency';

ensureGoalProgressEngine();

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

const parseNumericValue = (raw?: string): number | undefined => {
  if (!raw) return undefined;
  const trimmed = raw.replace(/,/g, '.').trim();
  const multiplier = trimmed.toLowerCase().includes('m')
    ? 1_000_000
    : trimmed.toLowerCase().includes('k')
    ? 1_000
    : 1;
  const numeric = parseFloat(trimmed.replace(/[^0-9.\\-]/g, ''));
  if (!Number.isFinite(numeric)) {
    return undefined;
  }
  return Math.round(numeric * multiplier);
};

const inferUnitFromAmount = (value?: string): string | undefined => {
  if (!value) return undefined;
  const parts = value.trim().split(/\\s+/);
  if (parts.length <= 1) {
    return undefined;
  }
  return parts[parts.length - 1];
};

const mapCategory = (category: PlannerGoalCategory): GoalDefinition['category'] => {
  if (category === 'educational') return 'education';
  if (category === 'career') return 'career';
  if (category === 'health') return 'health';
  if (category === 'financial') return 'financial';
  return 'personal';
};

const mapType = (type: PlannerGoalEntity['type']): GoalDefinition['type'] => {
  if (type === 'financial') return 'financial';
  if (type === 'quantitative') return 'quantitative';
  return 'skill';
};

const buildTracksForGoal = (
  entity: PlannerGoalEntity,
  target: number,
  unit: string,
  currency?: string,
) => {
  if (entity.type === 'financial') {
    return [
      {
        id: `${entity.id}-money`,
        type: 'money',
        target,
        unit,
        currency: normalizeFinanceCurrency(currency),
      } as GoalDefinition['tracks'][number],
    ];
  }
  return [
    {
      id: `${entity.id}-tasks`,
      type: 'tasks',
      target,
      unit: unit || 'units',
      scope: 'count',
    } as GoalDefinition['tracks'][number],
  ];
};

const convertPlannerGoalToDefinition = (entity: PlannerGoalEntity): GoalDefinition | null => {
  const targetValue = parseNumericValue(entity.targetAmount) ?? 100;
  const unit = entity.countingType ?? inferUnitFromAmount(entity.targetAmount) ?? '%';
  const currency = isFinanceCurrencyCode(unit) ? unit : undefined;
  const definition: GoalDefinition = {
    id: entity.id,
    type: mapType(entity.type),
    title: entity.customTitle ?? entity.contentKey ?? entity.id,
    category: mapCategory(entity.category),
    baseline: 0,
    target: targetValue,
    unit,
    currency: currency ? normalizeFinanceCurrency(currency) : undefined,
    cadence: entity.type === 'financial' ? 'monthly' : 'weekly',
    deadline: entity.deadline,
    tracks: buildTracksForGoal(entity, targetValue, unit, currency),
    pacingWindowDays: entity.type === 'financial' ? 90 : 45,
    sources: {
      finance: entity.type === 'financial',
      tasks: entity.type !== 'financial',
      manual: true,
    },
  };
  return definition;
};

const syncGoalDefinition = (entity: PlannerGoalEntity) => {
  const existing = getGoalDefinition(entity.id);
  const needsOverride =
    !existing ||
    Boolean(entity.customTitle) ||
    Boolean(entity.targetAmount) ||
    Boolean(entity.countingType);
  if (!needsOverride) {
    return;
  }
  const definition = convertPlannerGoalToDefinition(entity);
  if (!definition) return;
  registerGoalDefinition(definition);
  updateGoalProgress(entity.id);
};

export const usePlannerGoalsStore = create<PlannerGoalsStore>()(
  persist(
    (set) => ({
      goals: goalSeeds,
      createGoal: (input) => {
        const id = (`goal-${Date.now()}`) as PlannerGoalId;
        const entity: PlannerGoalEntity = {
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
        };
        set((state) => ({
          goals: [entity, ...state.goals],
        }));
        syncGoalDefinition(entity);
        return id;
      },
      updateGoal: (id, input) => {
        let updatedGoal: PlannerGoalEntity | undefined;
        set((state) => ({
          goals: state.goals.map((goal) => {
            if (goal.id !== id) {
              return goal;
            }
            updatedGoal = {
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
            };
            return updatedGoal;
          }),
        }));
        if (updatedGoal) {
          syncGoalDefinition(updatedGoal);
        }
      },
      deleteGoal: (id) =>
        set((state) => ({
          goals: state.goals.filter((goal) => goal.id !== id),
        })),
      toggleArchiveGoal: (id, archived = true) =>
        set((state) => ({
          goals: state.goals.map((goal) => (goal.id === id ? { ...goal, archived } : goal)),
        })),
      setProgress: (id, percent) => {
        const normalized = clampPercent(percent) / 100;
        set((state) => ({
          goals: state.goals.map((goal) => (goal.id === id ? { ...goal, progress: normalized } : goal)),
        }));
        const definition = getGoalDefinition(id);
        if (definition) {
          const newValue = definition.baseline + normalized * (definition.target - definition.baseline);
          handleManualGoalUpdateEvent({ goalId: id, value: newValue, note: 'planner_manual_adjust' });
        }
      },
    }),
    {
      name: STORAGE_ID,
      storage,
    },
  ),
);
