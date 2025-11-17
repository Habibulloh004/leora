import { create } from 'zustand';

import type {
  InsightHistorySnapshot,
  InsightQuestionAnswer,
  InsightStatus,
} from '@/types/insights';
import type { GoalProgressSnapshot } from '@/features/goals/gpe/types';

type QuestionsMap = Record<string, InsightQuestionAnswer>;

interface InsightsExperienceState {
  answers: QuestionsMap;
  history: InsightHistorySnapshot[];
  goalSnapshots: GoalProgressSnapshot[];
  answerQuestion: (questionId: string, payload: { optionId?: string; customAnswer?: string }) => void;
  markInsightStatus: (insightId: string, status: InsightStatus) => void;
  recordGoalSnapshot: (snapshot: GoalProgressSnapshot) => void;
}

const isoDaysAgo = (days: number) => {
  const date = new Date();
  date.setHours(9, 0, 0, 0);
  date.setDate(date.getDate() - days);
  return date.toISOString();
};

const initialHistory: InsightHistorySnapshot[] = [
  { id: 'delivery-limit', date: isoDaysAgo(1), status: 'completed' },
  { id: 'focus-sprint', date: isoDaysAgo(2), status: 'viewed' },
  { id: 'debt-shift', date: isoDaysAgo(5), status: 'dismissed' },
];

export const useInsightsExperienceStore = create<InsightsExperienceState>((set) => ({
  answers: {},
  history: initialHistory,
  goalSnapshots: [],
  answerQuestion: (questionId, payload) =>
    set((state) => ({
      answers: {
        ...state.answers,
        [questionId]: {
          questionId,
          optionId: payload.optionId,
          customAnswer: payload.customAnswer?.trim() ? payload.customAnswer.trim() : undefined,
          answeredAt: new Date().toISOString(),
        },
      },
    })),
  markInsightStatus: (insightId, status) =>
    set((state) => {
      const existingIndex = state.history.findIndex((item) => item.id === insightId);
      const updatedDate = new Date().toISOString();
      if (existingIndex >= 0) {
        const nextHistory = [...state.history];
        nextHistory[existingIndex] = {
          ...nextHistory[existingIndex],
          status,
          date: updatedDate,
        };
        return { history: nextHistory };
      }
      return {
        history: [{ id: insightId, status, date: updatedDate }, ...state.history],
      };
    }),
  recordGoalSnapshot: (snapshot) =>
    set((state) => {
      const filtered = state.goalSnapshots.filter(
        (item) => !(item.goalId === snapshot.goalId && item.date === snapshot.date),
      );
      return {
        goalSnapshots: [snapshot, ...filtered],
      };
    }),
}));

export default useInsightsExperienceStore;
