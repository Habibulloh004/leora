import type { GoalProgressSnapshot } from './types';
import { useInsightsExperienceStore } from '@/stores/useInsightsExperienceStore';

export const publishGoalSnapshotToInsights = (snapshot: GoalProgressSnapshot) => {
  useInsightsExperienceStore.getState().recordGoalSnapshot(snapshot);
};
