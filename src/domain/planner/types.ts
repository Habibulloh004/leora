export type GoalType = 'financial' | 'health' | 'education' | 'productivity' | 'personal';
export type GoalStatus = 'active' | 'paused' | 'completed' | 'archived';
export type MetricKind = 'none' | 'amount' | 'weight' | 'count' | 'duration' | 'custom';
export type FinanceMode = 'save' | 'spend' | 'debt_close';

export interface GoalStats {
  financialProgressPercent?: number;
  habitsProgressPercent?: number;
  tasksProgressPercent?: number;
  focusMinutesLast30?: number;
}

export interface GoalMilestone {
  id: string;
  title: string;
  description?: string;
  targetPercent: number;
  dueDate?: string;
  completedAt?: string;
}

export interface Goal {
  id: string;
  userId: string;
  title: string;
  description?: string;
  goalType: GoalType;
  status: GoalStatus;
  metricType: MetricKind;
  unit?: string;
  initialValue?: number;
  targetValue?: number;
  financeMode?: FinanceMode;
  currency?: string;
  linkedBudgetId?: string;
  startDate?: string;
  targetDate?: string;
  completedDate?: string;
  progressPercent: number;
  stats: GoalStats;
  milestones?: GoalMilestone[];
  createdAt: string;
  updatedAt: string;
}

export type HabitStatus = 'active' | 'paused' | 'archived';
export type HabitType = 'health' | 'finance' | 'productivity' | 'education' | 'personal';
export type Frequency = 'daily' | 'weekly' | 'custom';
export type CompletionMode = 'boolean' | 'numeric';

export interface HabitFinanceRule {
  rule: 'no_spend_in_categories' | 'spend_in_categories' | 'has_any_transactions';
  categories?: string[];
  thresholdAmount?: number;
  currency?: string;
}

export type HabitCompletionStatus = 'done' | 'miss';

export interface Habit {
  id: string;
  userId: string;
  title: string;
  description?: string;
  iconId?: string;
  habitType: HabitType;
  status: HabitStatus;
  goalId?: string;
  linkedGoalIds?: string[];
  completionHistory?: Record<string, HabitCompletionStatus>;
  frequency: Frequency;
  daysOfWeek?: number[];
  timesPerWeek?: number;
  timeOfDay?: string;
  completionMode: CompletionMode;
  targetPerDay?: number;
  unit?: string;
  financeRule?: HabitFinanceRule;
  challengeLengthDays?: number;
  streakCurrent: number;
  streakBest: number;
  completionRate30d: number;
  createdAt: string;
  updatedAt: string;
}

export type TaskStatus = 'inbox' | 'planned' | 'in_progress' | 'completed' | 'canceled' | 'moved' | 'overdue';
export type TaskPriority = 'low' | 'medium' | 'high';
export type TaskFinanceLink = 'record_expenses' | 'pay_debt' | 'review_budget' | 'transfer_money' | 'none';

export interface TaskChecklistItem {
  id: string;
  title: string;
  completed: boolean;
}

export interface TaskDependency {
  id: string;
  taskId: string;
  status: 'pending' | 'met';
}

export interface TaskFocusMeta {
  isActive: boolean;
  startedAt?: string;
  lastSessionEndedAt?: string;
  lastResult?: 'done' | 'move';
  technique?: string;
  durationMinutes?: number;
}

export interface Task {
  id: string;
  userId: string;
  title: string;
  status: TaskStatus;
  priority: TaskPriority;
  goalId?: string;
  habitId?: string;
  financeLink?: TaskFinanceLink;
  dueDate?: string;
  startDate?: string;
  timeOfDay?: string;
  estimatedMinutes?: number;
  energyLevel?: 1 | 2 | 3;
  checklist?: TaskChecklistItem[];
  dependencies?: TaskDependency[];
  lastFocusSessionId?: string;
  focusTotalMinutes?: number;
  context?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export type FocusStatus = 'in_progress' | 'completed' | 'canceled' | 'paused';

export interface FocusSession {
  id: string;
  userId: string;
  taskId?: string;
  goalId?: string;
  plannedMinutes: number;
  actualMinutes?: number;
  status: FocusStatus;
  startedAt: string;
  endedAt?: string;
  interruptionsCount?: number;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}
