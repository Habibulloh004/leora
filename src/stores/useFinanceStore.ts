// stores/useFinanceStore.ts
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Transaction, Debt } from '@/types/store.types';

interface FinanceStore {
  transactions: Transaction[];
  debts: Debt[];
  categories: string[];
  
  // Transaction Actions
  addTransaction: (transaction: Omit<Transaction, 'id' | 'createdAt'>) => void;
  updateTransaction: (id: string, updates: Partial<Transaction>) => void;
  deleteTransaction: (id: string) => void;
  
  // Debt Actions
  addDebt: (debt: Omit<Debt, 'id' | 'createdAt'>) => void;
  updateDebt: (id: string, updates: Partial<Debt>) => void;
  deleteDebt: (id: string) => void;
  payDebt: (id: string, amount: number) => void;
  
  // Category Actions
  addCategory: (category: string) => void;
  deleteCategory: (category: string) => void;
  
  // Computed Values
  getTotalIncome: () => number;
  getTotalExpenses: () => number;
  getBalance: () => number;
  getTotalDebt: () => number;
  getTransactionsByType: (type: 'income' | 'outcome' | 'debt') => Transaction[];
  getTransactionsByCategory: (category: string) => Transaction[];
  getMonthlyTransactions: (month: number, year: number) => Transaction[];
  getMonthlyReport: (month: number, year: number) => {
    income: number;
    expenses: number;
    balance: number;
  };
}

export const useFinanceStore = create<FinanceStore>()(
  persist(
    (set, get) => ({
      transactions: [],
      debts: [],
      categories: [
        'Food & Dining',
        'Transportation',
        'Shopping',
        'Entertainment',
        'Bills & Utilities',
        'Healthcare',
        'Education',
        'Salary',
        'Business',
        'Other',
      ],
      
      // Transaction Actions
      addTransaction: (transactionData) => set((state) => ({
        transactions: [
          {
            ...transactionData,
            id: `txn-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            createdAt: new Date(),
          },
          ...state.transactions,
        ],
      })),
      
      updateTransaction: (id, updates) => set((state) => ({
        transactions: state.transactions.map((txn) =>
          txn.id === id ? { ...txn, ...updates } : txn
        ),
      })),
      
      deleteTransaction: (id) => set((state) => ({
        transactions: state.transactions.filter((txn) => txn.id !== id),
      })),
      
      // Debt Actions
      addDebt: (debtData) => set((state) => ({
        debts: [
          {
            ...debtData,
            id: `debt-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            createdAt: new Date(),
          },
          ...state.debts,
        ],
      })),
      
      updateDebt: (id, updates) => set((state) => ({
        debts: state.debts.map((debt) =>
          debt.id === id ? { ...debt, ...updates } : debt
        ),
      })),
      
      deleteDebt: (id) => set((state) => ({
        debts: state.debts.filter((debt) => debt.id !== id),
      })),
      
      payDebt: (id, amount) => set((state) => ({
        debts: state.debts.map((debt) => {
          if (debt.id !== id) return debt;
          
          const newRemainingAmount = debt.remainingAmount - amount;
          return {
            ...debt,
            remainingAmount: Math.max(0, newRemainingAmount),
            status: newRemainingAmount <= 0 ? 'paid' : debt.status,
          };
        }),
      })),
      
      // Category Actions
      addCategory: (category) => set((state) => ({
        categories: [...state.categories, category],
      })),
      
      deleteCategory: (category) => set((state) => ({
        categories: state.categories.filter((cat) => cat !== category),
      })),
      
      // Computed Values
      getTotalIncome: () => {
        return get()
          .transactions.filter((t) => t.type === 'income')
          .reduce((sum, t) => sum + t.amount, 0);
      },
      
      getTotalExpenses: () => {
        return get()
          .transactions.filter((t) => t.type === 'outcome')
          .reduce((sum, t) => sum + t.amount, 0);
      },
      
      getBalance: () => {
        const income = get().getTotalIncome();
        const expenses = get().getTotalExpenses();
        return income - expenses;
      },
      
      getTotalDebt: () => {
        return get()
          .debts.filter((d) => d.status === 'active')
          .reduce((sum, d) => sum + d.remainingAmount, 0);
      },
      
      getTransactionsByType: (type) => {
        return get().transactions.filter((t) => t.type === type);
      },
      
      getTransactionsByCategory: (category) => {
        return get().transactions.filter((t) => t.category === category);
      },
      
      getMonthlyTransactions: (month, year) => {
        return get().transactions.filter((t) => {
          const date = new Date(t.date);
          return date.getMonth() === month && date.getFullYear() === year;
        });
      },
      
      getMonthlyReport: (month, year) => {
        const monthlyTransactions = get().getMonthlyTransactions(month, year);
        
        const income = monthlyTransactions
          .filter((t) => t.type === 'income')
          .reduce((sum, t) => sum + t.amount, 0);
        
        const expenses = monthlyTransactions
          .filter((t) => t.type === 'outcome')
          .reduce((sum, t) => sum + t.amount, 0);
        
        return {
          income,
          expenses,
          balance: income - expenses,
        };
      },
    }),
    {
      name: 'finance-storage',
      storage: createJSONStorage(() => AsyncStorage),
      version: 1,
    }
  )
);