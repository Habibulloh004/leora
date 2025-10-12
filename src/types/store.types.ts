// types/store.types.ts
export interface Task {
  id: string;
  title: string;
  description?: string;
  completed: boolean;
  priority: 'low' | 'medium' | 'high';
  dueDate?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface Transaction {
  id: string;
  type: 'income' | 'outcome' | 'debt';
  amount: number;
  category: string;
  description: string;
  date: Date;
  createdAt: Date;
}

export interface Debt {
  id: string;
  creditorName: string;
  amount: number;
  remainingAmount: number;
  dueDate?: Date;
  status: 'active' | 'paid' | 'overdue';
  createdAt: Date;
}

export interface FocusSession {
  id: string;
  duration: number; // in minutes
  startedAt: Date;
  endedAt?: Date;
  completed: boolean;
}