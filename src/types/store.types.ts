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
  type: 'income' | 'outcome' | 'transfer';
  amount: number;
  category?: string;
  accountId: string;
  toAccountId?: string;
  note?: string;
  description?: string;
  date: Date;
  currency?: string;
  createdAt: Date;
}

export interface Debt {
  id: string;
  person: string;
  amount: number;
  remainingAmount: number;
  type: 'borrowed' | 'lent';
  currency: string;
  date: Date;
  expectedReturnDate?: Date;
  note?: string;
  status: 'active' | 'settled' | 'overdue';
  createdAt: Date;
}

export interface FocusSession {
  id: string;
  duration: number; // in minutes
  startedAt: Date;
  endedAt?: Date;
  completed: boolean;
}
