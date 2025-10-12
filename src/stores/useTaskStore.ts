// stores/useTaskStore.ts
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Task } from '@/types/store.types';

interface TaskStore {
  tasks: Task[];
  
  // Actions
  addTask: (task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateTask: (id: string, updates: Partial<Task>) => void;
  deleteTask: (id: string) => void;
  toggleTask: (id: string) => void;
  clearCompletedTasks: () => void;
  
  // Selectors
  getTaskById: (id: string) => Task | undefined;
  getTasksByPriority: (priority: 'low' | 'medium' | 'high') => Task[];
  getActiveTasks: () => Task[];
  getCompletedTasks: () => Task[];
  getTasksCount: () => { total: number; completed: number; active: number };
}

export const useTaskStore = create<TaskStore>()(
  persist(
    (set, get) => ({
      tasks: [],
      
      addTask: (taskData) => set((state) => ({
        tasks: [
          {
            ...taskData,
            id: `task-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
          ...state.tasks,
        ],
      })),
      
      updateTask: (id, updates) => set((state) => ({
        tasks: state.tasks.map((task) =>
          task.id === id
            ? { ...task, ...updates, updatedAt: new Date() }
            : task
        ),
      })),
      
      deleteTask: (id) => set((state) => ({
        tasks: state.tasks.filter((task) => task.id !== id),
      })),
      
      toggleTask: (id) => set((state) => ({
        tasks: state.tasks.map((task) =>
          task.id === id
            ? { ...task, completed: !task.completed, updatedAt: new Date() }
            : task
        ),
      })),
      
      clearCompletedTasks: () => set((state) => ({
        tasks: state.tasks.filter((task) => !task.completed),
      })),
      
      // Selectors
      getTaskById: (id) => {
        return get().tasks.find((task) => task.id === id);
      },
      
      getTasksByPriority: (priority) => {
        return get().tasks.filter((task) => task.priority === priority);
      },
      
      getActiveTasks: () => {
        return get().tasks.filter((task) => !task.completed);
      },
      
      getCompletedTasks: () => {
        return get().tasks.filter((task) => task.completed);
      },
      
      getTasksCount: () => {
        const tasks = get().tasks;
        return {
          total: tasks.length,
          completed: tasks.filter((t) => t.completed).length,
          active: tasks.filter((t) => !t.completed).length,
        };
      },
    }),
    {
      name: 'task-storage',
      storage: createJSONStorage(() => AsyncStorage),
      // Optional: Migrate old data if schema changes
      version: 1,
    }
  )
);