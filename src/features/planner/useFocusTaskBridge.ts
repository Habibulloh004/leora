import { create } from 'zustand';

import { usePlannerTasksStore, type FocusStartOptions } from '@/features/planner/useTasksStore';

type FocusBridgeState = {
  focusedTaskId?: string;
  lastCompletedTaskId?: string;
  startFocusForTask: (taskId: string, options?: FocusStartOptions) => void;
  completeFocusedTask: (outcome: 'done' | 'move') => void;
  clearFocusedTask: () => void;
};

export const usePlannerFocusBridge = create<FocusBridgeState>((set) => ({
  focusedTaskId: undefined,
  lastCompletedTaskId: undefined,
  startFocusForTask: (taskId, options) => {
    usePlannerTasksStore.getState().startFocus(taskId, options);
    set({ focusedTaskId: taskId });
  },
  completeFocusedTask: (outcome) =>
    set((state) => {
      if (state.focusedTaskId) {
        usePlannerTasksStore.getState().completeFocus(state.focusedTaskId, outcome);
      }
      return {
        focusedTaskId: undefined,
        lastCompletedTaskId: state.focusedTaskId ?? state.lastCompletedTaskId,
      };
    }),
  clearFocusedTask: () => set({ focusedTaskId: undefined }),
}));
