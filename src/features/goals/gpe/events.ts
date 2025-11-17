import type {
  FinanceEvent,
  TaskCompletedEvent,
  HabitMarkedEvent,
  FocusSessionEvent,
  ManualUpdateEvent,
  GoalProgressEvent,
} from './types';
import { ingestGoalEvent } from './engine';

const withTimestamp = <T extends GoalProgressEvent>(event: T): T => {
  if (event.timestamp) {
    return event;
  }
  return { ...event, timestamp: new Date().toISOString() } as T;
};

export const handleFinanceTransactionEvent = (event: Omit<FinanceEvent, 'timestamp'>) =>
  ingestGoalEvent(withTimestamp({ ...event, type: 'finance_transaction' } as FinanceEvent));

export const handleTaskCompletedEvent = (event: Omit<TaskCompletedEvent, 'timestamp'>) =>
  ingestGoalEvent(withTimestamp({ ...event, type: 'task_completed' } as TaskCompletedEvent));

export const handleHabitMarkedEvent = (event: Omit<HabitMarkedEvent, 'timestamp'>) =>
  ingestGoalEvent(withTimestamp({ ...event, type: 'habit_marked' } as HabitMarkedEvent));

export const handleFocusSessionEvent = (event: Omit<FocusSessionEvent, 'timestamp'>) =>
  ingestGoalEvent(withTimestamp({ ...event, type: 'focus_session' } as FocusSessionEvent));

export const handleManualGoalUpdateEvent = (event: Omit<ManualUpdateEvent, 'timestamp'>) =>
  ingestGoalEvent(withTimestamp({ ...event, type: 'manual_update' } as ManualUpdateEvent));
