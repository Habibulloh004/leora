// stores/useFocusStore.ts
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { FocusSession } from '@/types/store.types';

interface FocusStore {
  sessions: FocusSession[];
  currentSession: FocusSession | null;
  totalFocusTime: number; // in minutes
  
  // Actions
  startSession: (duration: number) => void;
  endSession: (completed: boolean) => void;
  pauseSession: () => void;
  resumeSession: () => void;
  
  // Selectors
  getTodaySessions: () => FocusSession[];
  getWeeklySessions: () => FocusSession[];
  getTotalFocusTimeToday: () => number;
  getCompletedSessionsCount: () => number;
}

export const useFocusStore = create<FocusStore>()(
  persist(
    (set, get) => ({
      sessions: [],
      currentSession: null,
      totalFocusTime: 0,
      
      startSession: (duration) => {
        const newSession: FocusSession = {
          id: `focus-${Date.now()}`,
          duration,
          startedAt: new Date(),
          completed: false,
        };
        set({ currentSession: newSession });
      },
      
      endSession: (completed) => set((state) => {
        if (!state.currentSession) return state;
        
        const endedSession = {
          ...state.currentSession,
          endedAt: new Date(),
          completed,
        };
        
        const actualDuration = completed
          ? state.currentSession.duration
          : Math.floor(
              (new Date().getTime() - state.currentSession.startedAt.getTime()) / 60000
            );
        
        return {
          sessions: [endedSession, ...state.sessions],
          currentSession: null,
          totalFocusTime: state.totalFocusTime + actualDuration,
        };
      }),
      
      pauseSession: () => {
        // Implement pause logic
      },
      
      resumeSession: () => {
        // Implement resume logic
      },
      
      getTodaySessions: () => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        return get().sessions.filter((session) => {
          const sessionDate = new Date(session.startedAt);
          sessionDate.setHours(0, 0, 0, 0);
          return sessionDate.getTime() === today.getTime();
        });
      },
      
      getWeeklySessions: () => {
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        
        return get().sessions.filter(
          (session) => new Date(session.startedAt) >= weekAgo
        );
      },
      
      getTotalFocusTimeToday: () => {
        const todaySessions = get().getTodaySessions();
        return todaySessions
          .filter((s) => s.completed)
          .reduce((sum, s) => sum + s.duration, 0);
      },
      
      getCompletedSessionsCount: () => {
        return get().sessions.filter((s) => s.completed).length;
      },
    }),
    {
      name: 'focus-storage',
      storage: createJSONStorage(() => AsyncStorage),
      version: 1,
    }
  )
);