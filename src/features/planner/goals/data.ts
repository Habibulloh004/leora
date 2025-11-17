// src/features/planner/goals/data.ts

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
