export interface PersonalDevelopmentIndex {
  overall: number;
  financial: number;
  productivity: number;
  workLife: number;
  goals: number;
  discipline: number;
}

export interface Insight {
  id: string;
  type: 'pattern' | 'opportunity' | 'warning' | 'achievement';
  icon: string;
  title: string;
  description: string;
  date: Date;
}

export interface FinancialMetric {
  label: string;
  value: number;
  change: number;
  trend: 'up' | 'down' | 'stable';
}

export type InsightCategory = 'overview' | 'finance' | 'productivity' | 'wisdom';

export type InsightActionType =
  | 'review_budget'
  | 'open_exchange'
  | 'quick_add'
  | 'open_debt'
  | 'open_budgets'
  | 'open_tasks'
  | 'open_habits'
  | 'open_history'
  | 'open_questions';

export type InsightStatus = 'new' | 'viewed' | 'completed' | 'dismissed';

export interface InsightCta {
  label: string;
  action: InsightActionType;
  targetId?: string;
  note?: string;
}

export interface InsightCardEntity {
  id: string;
  title: string;
  body: string;
  tone?: 'friend' | 'strict' | 'polite';
  category: InsightCategory;
  priority: number;
  createdAt: string;
  cta: InsightCta;
  explain?: string;
  push?: string;
  payload?: Record<string, unknown>;
  isMain?: boolean;
}

export interface InsightHistorySnapshot {
  id: string;
  date: string;
  status: InsightStatus;
}

export interface InsightHistoryItem extends InsightHistorySnapshot {
  title: string;
  summary: string;
  category: InsightCategory;
}

export interface InsightQuestionOption {
  id: string;
  label: string;
}

export interface InsightQuestion {
  id: string;
  prompt: string;
  description?: string;
  options?: InsightQuestionOption[];
  allowFreeText?: boolean;
  customLabel?: string;
  category: InsightCategory;
}

export interface InsightQuestionAnswer {
  questionId: string;
  optionId?: string;
  customAnswer?: string;
  answeredAt: string;
}
