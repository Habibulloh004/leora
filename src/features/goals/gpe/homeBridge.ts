import type { GoalProgressSnapshot, GoalWidgetItem } from './types';
import type { Goal } from '@/types/home';
import { getGoalWidgetItems } from './engine';

let latestSnapshots: Record<string, GoalProgressSnapshot> = {};

export const updateGoalsWidgetProjection = (snapshot: GoalProgressSnapshot) => {
  latestSnapshots = { ...latestSnapshots, [snapshot.goalId]: snapshot };
};

export const getLatestGoalSnapshot = (goalId: string) => latestSnapshots[goalId];

const mapCategory = (category: GoalWidgetItem['category']): Goal['category'] => {
  if (category === 'financial') return 'financial';
  if (category === 'health') return 'health';
  return category === 'personal' ? 'personal' : 'professional';
};

const toHomeGoal = (item: GoalWidgetItem): Goal => ({
  id: item.id,
  title: item.title,
  progress: item.progress,
  current: item.current,
  target: item.target,
  unit: item.unit,
  category: mapCategory(item.category),
  status: item.status,
  eta: item.etaLabel,
  paceActual: item.paceActual,
  paceRequired: item.paceRequired,
});

export const buildGoalsWidgetState = (limit = 3): { hasData: boolean; goals: Goal[] } => {
  const goals = getGoalWidgetItems(limit).map(toHomeGoal);
  return {
    hasData: goals.length > 0,
    goals,
  };
};
