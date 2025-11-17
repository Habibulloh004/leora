import { create } from 'zustand';

import type { PlannerGoalId } from '@/types/planner';
import type {
  GoalDefinition,
  GoalProgressEvent,
  GoalProgressRecord,
  GoalProgressSnapshot,
  GoalTrackContribution,
} from '@/features/goals/gpe/types';

const MAX_EVENTS_PER_GOAL = 240;

interface GoalProgressEngineState {
  definitions: Record<PlannerGoalId, GoalDefinition>;
  trackContributions: Record<PlannerGoalId, Record<string, GoalTrackContribution[]>>;
  progress: Record<PlannerGoalId, GoalProgressRecord>;
  events: Record<PlannerGoalId, GoalProgressEvent[]>;
  snapshots: Record<string, GoalProgressSnapshot[]>;
  registerGoal: (definition: GoalDefinition) => void;
  upsertTrackContributions: (goalId: PlannerGoalId, trackId: string, entries: GoalTrackContribution[]) => void;
  persistRecord: (record: GoalProgressRecord) => void;
  appendEvent: (event: GoalProgressEvent) => void;
  appendSnapshot: (snapshot: GoalProgressSnapshot) => void;
}

export const useGoalProgressEngineStore = create<GoalProgressEngineState>((set, get) => ({
  definitions: {},
  trackContributions: {},
  progress: {},
  events: {},
  snapshots: {},
  registerGoal: (definition) =>
    set((state) => ({
      definitions: {
        ...state.definitions,
        [definition.id]: definition,
      },
      trackContributions: {
        ...state.trackContributions,
        [definition.id]: state.trackContributions[definition.id] ?? {},
      },
    })),
  upsertTrackContributions: (goalId, trackId, entries) =>
    set((state) => ({
      trackContributions: {
        ...state.trackContributions,
        [goalId]: {
          ...(state.trackContributions[goalId] ?? {}),
          [trackId]: entries,
        },
      },
    })),
  persistRecord: (record) =>
    set((state) => ({
      progress: {
        ...state.progress,
        [record.goalId]: record,
      },
    })),
  appendEvent: (event) =>
    set((state) => {
      const existing = state.events[event.goalId] ?? [];
      const updated = [...existing, event];
      if (updated.length > MAX_EVENTS_PER_GOAL) {
        updated.splice(0, updated.length - MAX_EVENTS_PER_GOAL);
      }
      return {
        events: {
          ...state.events,
          [event.goalId]: updated,
        },
      };
    }),
  appendSnapshot: (snapshot) =>
    set((state) => {
      const dayKey = snapshot.date;
      const dayEntries = state.snapshots[dayKey] ?? [];
      const existingIndex = dayEntries.findIndex((entry) => entry.goalId === snapshot.goalId);
      if (existingIndex >= 0) {
        const copy = [...dayEntries];
        copy[existingIndex] = snapshot;
        return {
          snapshots: { ...state.snapshots, [dayKey]: copy },
        };
      }
      return {
        snapshots: {
          ...state.snapshots,
          [dayKey]: [snapshot, ...dayEntries],
        },
      };
    }),
}));

export const getGoalDefinition = (goalId: PlannerGoalId): GoalDefinition | undefined =>
  useGoalProgressEngineStore.getState().definitions[goalId];

export const getGoalRecord = (goalId: PlannerGoalId): GoalProgressRecord | undefined =>
  useGoalProgressEngineStore.getState().progress[goalId];

export const getGoalTrackContributions = (
  goalId: PlannerGoalId,
  trackId: string,
): GoalTrackContribution[] => {
  const map = useGoalProgressEngineStore.getState().trackContributions[goalId] ?? {};
  return map[trackId] ?? [];
};

export const getSnapshotsForDate = (dateKey: string): GoalProgressSnapshot[] =>
  useGoalProgressEngineStore.getState().snapshots[dateKey] ?? [];
