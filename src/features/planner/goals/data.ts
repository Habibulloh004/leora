// src/features/planner/goals/data.ts
import type { AppTranslations } from '@/localization/strings';
import type { PlannerGoalId, GoalSummaryKey } from '@/types/planner';

export type GoalSummaryRow = {
  label: string;
  value: string;
};

export type GoalMilestone = {
  percent: number;
  label: string;
};

export type GoalHistoryEntry = {
  id: string;
  label: string;
  delta: string;
};

export type Goal = {
  id: string;
  title: string;
  progress: number;
  currentAmount: string;
  targetAmount: string;
  summary: GoalSummaryRow[];
  milestones: GoalMilestone[];
  history: GoalHistoryEntry[];
  aiTip: string;
  aiTipHighlight?: string;
};

export type GoalSection = {
  id: string;
  title: string;
  subtitle: string;
  data: Goal[];
};

const SUMMARY_ORDER: GoalSummaryKey[] = ['left', 'pace', 'prediction'];

const createMilestones = (labels: string[]): GoalMilestone[] => {
  const steps = [25, 50, 75, 100];
  return steps.map((percent, index) => ({
    percent,
    label: labels[index] ?? '—',
  }));
};

const createHistory = (entries: { label: string; delta: string }[]): GoalHistoryEntry[] =>
  entries.map((entry, index) => ({
    ...entry,
    id: `${entry.label}-${index}`,
  }));

const GOAL_SECTION_TEMPLATES: {
  id: 'financial' | 'personal';
  goalIds: PlannerGoalId[];
}[] = [
  { id: 'financial', goalIds: ['dream-car', 'emergency-fund'] },
  { id: 'personal', goalIds: ['fitness', 'language'] },
];

const GOAL_META: Record<PlannerGoalId, { progress: number }> = {
  'dream-car': { progress: 0.82 },
  'emergency-fund': { progress: 0.58 },
  fitness: { progress: 0.44 },
  language: { progress: 0.68 },
};

export const createGoalSections = (
  strings: AppTranslations['plannerScreens']['goals'],
): GoalSection[] =>
  GOAL_SECTION_TEMPLATES.map((section) => ({
    id: section.id,
    title: strings.sections[section.id].title,
    subtitle: strings.sections[section.id].subtitle,
    data: section.goalIds.map((goalId) => {
      const meta = GOAL_META[goalId];
      const content = strings.data[goalId];
      return {
        id: goalId,
        title: content.title,
        progress: meta.progress,
        currentAmount: content.currentAmount,
        targetAmount: content.targetAmount,
        summary: SUMMARY_ORDER.map((key) => ({
          label: strings.cards.summaryLabels[key],
          value: content.summary[key],
        })),
        milestones: createMilestones(content.milestones),
        history: createHistory(content.history),
        aiTip: content.aiTip,
        aiTipHighlight: content.aiTipHighlight,
      };
    }),
  }));
