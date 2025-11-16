import type { PlannerGoalId, PlannerHabitId } from '@/types/planner';
import type { FinanceCurrency } from '@/stores/useFinancePreferencesStore';

export type GoalProgressType = 'financial' | 'quantitative' | 'skill' | 'project' | 'streak';
export type GoalTrackType = 'money' | 'time' | 'milestone' | 'streak' | 'tasks';
export type GoalStatus = 'on_track' | 'at_risk' | 'behind';
export type PaceCadence = 'none' | 'daily' | 'weekly' | 'monthly';

export interface GoalMilestoneConfig {
  id: string;
  title: string;
  weight?: number;
  targetValue?: number;
  autoCompleteFromTask?: boolean;
}

interface GoalTrackBase<T extends GoalTrackType> {
  id: string;
  type: T;
  target: number;
  baseline?: number;
  unit?: string;
  weight?: number;
}

export interface MoneyTrackConfig extends GoalTrackBase<'money'> {
  currency: FinanceCurrency;
  allowNegative?: boolean;
}

export interface TimeTrackConfig extends GoalTrackBase<'time'> {
  cadence: Exclude<PaceCadence, 'none'>;
  minutesPerUnit?: number;
  xpRatio?: number; // XP awarded per minute for skill goals
}

export interface MilestoneTrackConfig extends GoalTrackBase<'milestone'> {
  milestones: GoalMilestoneConfig[];
}

export interface StreakTrackConfig extends GoalTrackBase<'streak'> {
  cadence: 'daily' | 'weekly';
  targetDays: number; // per cadence window
  graceDays?: number;
}

export interface TasksTrackConfig extends GoalTrackBase<'tasks'> {
  scope: 'count' | 'duration';
  cadence?: Exclude<PaceCadence, 'none'>;
}

export type GoalTrackConfig =
  | MoneyTrackConfig
  | TimeTrackConfig
  | MilestoneTrackConfig
  | StreakTrackConfig
  | TasksTrackConfig;

export interface GoalDefinition {
  id: PlannerGoalId;
  type: GoalProgressType;
  title: string;
  category: 'financial' | 'personal' | 'career' | 'health' | 'education';
  description?: string;
  baseline: number;
  target: number;
  unit: string;
  currency?: FinanceCurrency;
  cadence?: PaceCadence;
  deadline?: string; // ISO
  tracks: GoalTrackConfig[];
  pacingWindowDays?: number;
  sources?: {
    tasks?: boolean;
    habits?: boolean;
    finance?: boolean;
    manual?: boolean;
    focus?: boolean;
  };
}

export interface GoalTrackContribution {
  timestamp: string;
  value: number;
  source: GoalProgressEvent['type'];
  refId?: string;
  note?: string;
}

export interface GoalTrackState {
  config: GoalTrackConfig;
  contributions: GoalTrackContribution[];
  current: number;
  percent: number;
  streak?: {
    current: number;
    best: number;
    graceUsed: number;
    lastCompletion?: string;
  };
  completedMilestones?: string[];
}

export interface GoalProgressRecord {
  goalId: PlannerGoalId;
  definition: GoalDefinition;
  tracks: Record<string, GoalTrackState>;
  percent: number;
  current: number;
  remaining: number;
  paceRequired: number | null;
  paceActual: number | null;
  paceCadence: PaceCadence;
  etaDate?: string;
  status: GoalStatus;
  confidence: number;
  updatedAt: string;
}

export interface GoalProgressSnapshot {
  goalId: PlannerGoalId;
  date: string; // ISO day key
  currentValue: number;
  percentComplete: number;
  onTrack: boolean;
  paceRequired: number | null;
  paceActual: number | null;
  etaDate?: string;
  status: GoalStatus;
  confidence: number;
}

interface GoalProgressBaseEvent {
  goalId: PlannerGoalId;
  timestamp: string;
  trackId?: string;
  sourceId?: string;
}

export interface FinanceEvent extends GoalProgressBaseEvent {
  type: 'finance_transaction';
  amount: number;
  currency: FinanceCurrency;
  direction: 'inflow' | 'outflow';
}

export interface TaskCompletedEvent extends GoalProgressBaseEvent {
  type: 'task_completed';
  taskId: string;
  durationMinutes?: number;
  milestoneId?: string;
}

export interface HabitMarkedEvent extends GoalProgressBaseEvent {
  type: 'habit_marked';
  habitId: PlannerHabitId;
  completed: boolean;
  minutes?: number;
}

export interface FocusSessionEvent extends GoalProgressBaseEvent {
  type: 'focus_session';
  sessionId: string;
  minutes: number;
  quality?: 'low' | 'medium' | 'high';
}

export interface ManualUpdateEvent extends GoalProgressBaseEvent {
  type: 'manual_update';
  value: number;
  note?: string;
}

export type GoalProgressEvent =
  | FinanceEvent
  | TaskCompletedEvent
  | HabitMarkedEvent
  | FocusSessionEvent
  | ManualUpdateEvent;

export interface GoalWidgetItem {
  id: PlannerGoalId;
  title: string;
  progress: number; // percent 0-100
  current: number;
  target: number;
  unit: string;
  category: GoalDefinition['category'];
  status: GoalStatus;
  etaLabel?: string;
  paceActual?: number | null;
  paceRequired?: number | null;
}

export interface GoalSummaryMetrics {
  remainingLabel: string;
  paceLabel: string;
  forecastLabel: string;
}
