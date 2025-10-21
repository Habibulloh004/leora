// stores/useFinanceStore.ts
import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { Colors } from '@/constants/theme';
import { Account } from '@/types/finance';
import { Debt, Transaction } from '@/types/store.types';

type TransactionInput = Omit<Transaction, 'id' | 'createdAt'>;
type DebtInput = Omit<Debt, 'id' | 'createdAt' | 'remainingAmount' | 'status'> & {
  remainingAmount?: number;
  status?: Debt['status'];
};

interface FinanceStore {
  transactions: Transaction[];
  debts: Debt[];
  accounts: Account[];
  categories: string[];

  // Account actions
  setAccounts: (accounts: Account[]) => void;
  addAccount: (account: Account) => void;
  updateAccount: (id: string, updates: Partial<Account>) => void;
  getAccountById: (id: string) => Account | undefined;

  // Transaction actions
  addTransaction: (transaction: TransactionInput) => void;
  updateTransaction: (id: string, updates: Partial<Transaction>) => void;
  deleteTransaction: (id: string) => void;

  // Debt actions
  addDebt: (debt: DebtInput) => void;
  updateDebt: (id: string, updates: Partial<Debt>) => void;
  deleteDebt: (id: string) => void;
  payDebt: (id: string, amount: number) => void;

  // Category actions
  addCategory: (category: string) => void;
  deleteCategory: (category: string) => void;
  renameCategory: (prev: string, next: string) => void;

  // Computed values
  getTotalIncome: () => number;
  getTotalExpenses: () => number;
  getBalance: () => number;
  getTotalDebt: () => number;
  getTransactionsByType: (type: Transaction['type']) => Transaction[];
  getTransactionsByCategory: (category: string) => Transaction[];
  getMonthlyTransactions: (month: number, year: number) => Transaction[];
  getMonthlyReport: (month: number, year: number) => {
    income: number;
    expenses: number;
    balance: number;
  };
}

type FinancePersistedShape = Pick<
  FinanceStore,
  'transactions' | 'debts' | 'accounts' | 'categories'
>;

const DEFAULT_ACCOUNTS: Account[] = [
  {
    id: 'acc-cash',
    name: 'Cash',
    type: 'cash',
    balance: 10_000_000,
    currency: 'UZS',
    isHidden: false,
    color: Colors.primary,
  },
  {
    id: 'acc-usd-wallet',
    name: 'USD Wallet',
    type: 'cash',
    balance: 5_000,
    currency: 'USD',
    isHidden: false,
    color: Colors.secondary,
  },
  {
    id: 'acc-card',
    name: 'Humo Card',
    type: 'card',
    balance: 25_000_000,
    currency: 'UZS',
    isHidden: false,
    color: Colors.info,
  },
];

const DEFAULT_CATEGORIES = [
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
];

const generateId = (prefix: string) =>
  `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;

const resolveDebtStatus = (debt: Pick<Debt, 'remainingAmount' | 'expectedReturnDate'>): Debt['status'] => {
  if (debt.remainingAmount <= 0) {
    return 'settled';
  }
  if (debt.expectedReturnDate) {
    const now = new Date();
    const expected = new Date(debt.expectedReturnDate);
    if (expected.getTime() < now.setHours(0, 0, 0, 0)) {
      return 'overdue';
    }
  }
  return 'active';
};

const applyTransactionToAccounts = (
  accounts: Account[],
  transaction: Transaction,
  direction: 1 | -1
) => {
  return accounts.map((account) => {
    if (transaction.type === 'transfer') {
      if (account.id === transaction.accountId) {
        return { ...account, balance: account.balance - direction * transaction.amount };
      }
      if (transaction.toAccountId && account.id === transaction.toAccountId) {
        return { ...account, balance: account.balance + direction * transaction.amount };
      }
      return account;
    }

    if (account.id !== transaction.accountId) {
      return account;
    }

    const delta = transaction.type === 'income' ? transaction.amount : -transaction.amount;
    return {
      ...account,
      balance: account.balance + direction * delta,
    };
  });
};

export const useFinanceStore = create<FinanceStore>()(
  persist(
    (set, get) => ({
      transactions: [],
      debts: [],
      accounts: DEFAULT_ACCOUNTS,
      categories: DEFAULT_CATEGORIES,

      // Account actions
      setAccounts: (accounts) => set(() => ({ accounts })),
      addAccount: (account) => set((state) => ({ accounts: [...state.accounts, account] })),
      updateAccount: (id, updates) =>
        set((state) => ({
          accounts: state.accounts.map((account) =>
            account.id === id ? { ...account, ...updates } : account
          ),
        })),
      getAccountById: (id) => get().accounts.find((account) => account.id === id),

      // Transaction actions
      addTransaction: (transactionData) =>
        set((state) => {
          const account = state.accounts.find((acc) => acc.id === transactionData.accountId);
          const tx: Transaction = {
            ...transactionData,
            id: generateId('txn'),
            createdAt: new Date(),
            currency: transactionData.currency ?? account?.currency ?? 'USD',
          };

          const updatedAccounts = applyTransactionToAccounts(state.accounts, tx, 1);

          return {
            transactions: [tx, ...state.transactions],
            accounts: updatedAccounts,
          };
        }),

      updateTransaction: (id, updates) =>
        set((state) => {
          const existing = state.transactions.find((txn) => txn.id === id);
          if (!existing) {
            return state;
          }

          const revertedAccounts = applyTransactionToAccounts(state.accounts, existing, -1);
          const merged: Transaction = {
            ...existing,
            ...updates,
            currency:
              updates.currency ??
              existing.currency ??
              get().getAccountById(updates.accountId ?? existing.accountId)?.currency ??
              'USD',
          };
          const accountsWithMerged = applyTransactionToAccounts(revertedAccounts, merged, 1);

          return {
            transactions: state.transactions.map((txn) => (txn.id === id ? merged : txn)),
            accounts: accountsWithMerged,
          };
        }),

      deleteTransaction: (id) =>
        set((state) => {
          const existing = state.transactions.find((txn) => txn.id === id);
          if (!existing) {
            return state;
          }

          const updatedAccounts = applyTransactionToAccounts(state.accounts, existing, -1);

          return {
            transactions: state.transactions.filter((txn) => txn.id !== id),
            accounts: updatedAccounts,
          };
        }),

      // Debt actions
      addDebt: (debtData) =>
        set((state) => {
          const remainingAmount = debtData.remainingAmount ?? debtData.amount;
          const nextDebt: Debt = {
            ...debtData,
            id: generateId('debt'),
            createdAt: new Date(),
            remainingAmount,
            status: debtData.status ?? resolveDebtStatus({ remainingAmount, expectedReturnDate: debtData.expectedReturnDate }),
          };

          return {
            debts: [nextDebt, ...state.debts],
          };
        }),

      updateDebt: (id, updates) =>
        set((state) => ({
          debts: state.debts.map((debt) => {
            if (debt.id !== id) {
              return debt;
            }

            const nextAmount = updates.amount ?? debt.amount;
            const alreadyPaid = debt.amount - debt.remainingAmount;
            const nextRemaining =
              updates.remainingAmount ?? Math.max(0, nextAmount - alreadyPaid);

            const merged: Debt = {
              ...debt,
              ...updates,
              amount: nextAmount,
              remainingAmount: nextRemaining,
            };

            return {
              ...merged,
              status: resolveDebtStatus(merged),
            };
          }),
        })),

      deleteDebt: (id) =>
        set((state) => ({
          debts: state.debts.filter((debt) => debt.id !== id),
        })),

      payDebt: (id, amount) =>
        set((state) => ({
          debts: state.debts.map((debt) => {
            if (debt.id !== id) {
              return debt;
            }

            const nextRemaining = Math.max(0, debt.remainingAmount - amount);
            const updated: Debt = {
              ...debt,
              remainingAmount: nextRemaining,
            };

            return {
              ...updated,
              status: resolveDebtStatus(updated),
            };
          }),
        })),

      // Category actions
      addCategory: (category) =>
        set((state) => ({
          categories: state.categories.includes(category)
            ? state.categories
            : [...state.categories, category],
        })),

      deleteCategory: (category) =>
        set((state) => ({
          categories: state.categories.filter((cat) => cat !== category),
        })),

      renameCategory: (prev, next) =>
        set((state) => {
          if (!next.trim() || prev === next) {
            return state;
          }

          const nextCategories = state.categories.map((category) =>
            category === prev ? next : category
          );

          return {
            categories: nextCategories,
            transactions: state.transactions.map((transaction) =>
              transaction.category === prev ? { ...transaction, category: next } : transaction
            ),
          };
        }),

      // Computed values
      getTotalIncome: () =>
        get()
          .transactions.filter((t) => t.type === 'income')
          .reduce((sum, t) => sum + t.amount, 0),

      getTotalExpenses: () =>
        get()
          .transactions.filter((t) => t.type === 'outcome')
          .reduce((sum, t) => sum + t.amount, 0),

      getBalance: () => {
        const income = get().getTotalIncome();
        const expenses = get().getTotalExpenses();
        return income - expenses;
      },

      getTotalDebt: () =>
        get()
          .debts.filter((debt) => debt.status !== 'settled')
          .reduce((sum, debt) => sum + debt.remainingAmount, 0),

      getTransactionsByType: (type) =>
        get().transactions.filter((transaction) => transaction.type === type),

      getTransactionsByCategory: (category) =>
        get().transactions.filter((transaction) => transaction.category === category),

      getMonthlyTransactions: (month, year) =>
        get().transactions.filter((transaction) => {
          const date = new Date(transaction.date);
          return date.getMonth() === month && date.getFullYear() === year;
        }),

      getMonthlyReport: (month, year) => {
        const monthlyTransactions = get().getMonthlyTransactions(month, year);

        const income = monthlyTransactions
          .filter((transaction) => transaction.type === 'income')
          .reduce((sum, transaction) => sum + transaction.amount, 0);

        const expenses = monthlyTransactions
          .filter((transaction) => transaction.type === 'outcome')
          .reduce((sum, transaction) => sum + transaction.amount, 0);

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
      version: 2,
      migrate: (persistedState: FinancePersistedShape | undefined, version) => {
        if (!persistedState) {
          return {
            transactions: [],
            debts: [],
            accounts: DEFAULT_ACCOUNTS,
            categories: DEFAULT_CATEGORIES,
          };
        }

        let state: FinancePersistedShape = {
          transactions: persistedState.transactions ?? [],
          debts: persistedState.debts ?? [],
          accounts: persistedState.accounts ?? [],
          categories: persistedState.categories ?? [],
        };

        if (version < 2) {
          const accounts = state.accounts?.length ? state.accounts : DEFAULT_ACCOUNTS;

          const transactions = (state.transactions ?? []).map((transaction) => {
            const accountId = transaction.accountId ?? accounts[0]?.id ?? 'acc-cash';
            const updated: Transaction = {
              ...transaction,
              id: transaction.id ?? generateId('txn'),
              type:
                (transaction.type as Transaction['type']) === 'transfer'
                  ? 'transfer'
                  : transaction.type === 'income'
                  ? 'income'
                  : 'outcome',
              accountId,
              date: new Date(transaction.date ?? new Date()),
              createdAt: new Date(transaction.createdAt ?? new Date()),
            };

            return updated;
          });

          const debts = (state.debts ?? []).map((debt) => {
            const transformed: Debt = {
              id: debt.id ?? generateId('debt'),
              person: (debt as any).creditorName ?? (debt as any).person ?? 'Unknown',
              amount: debt.amount,
              remainingAmount: debt.remainingAmount ?? debt.amount,
              type: (debt as any).type === 'lent' ? 'lent' : 'borrowed',
              currency: (debt as any).currency ?? 'USD',
              date: new Date((debt as any).date ?? new Date()),
              expectedReturnDate: (debt as any).dueDate
                ? new Date((debt as any).dueDate)
                : undefined,
              note: (debt as any).note,
              status:
                (debt as any).status === 'paid'
                  ? 'settled'
                  : resolveDebtStatus({
                      remainingAmount: debt.remainingAmount ?? debt.amount,
                      expectedReturnDate: (debt as any).dueDate,
                    }),
              createdAt: new Date((debt as any).createdAt ?? new Date()),
            };

            return transformed;
          });

          state = {
            ...state,
            accounts,
            transactions,
            debts,
            categories: state.categories?.length ? state.categories : DEFAULT_CATEGORIES,
          };
        } else {
          state = {
            ...state,
            transactions: (state.transactions ?? []).map((transaction) => ({
              ...transaction,
              date: new Date(transaction.date ?? new Date()),
              createdAt: new Date(transaction.createdAt ?? new Date()),
            })),
            debts: (state.debts ?? []).map((debt) => ({
              ...debt,
              date: new Date(debt.date ?? new Date()),
              createdAt: new Date(debt.createdAt ?? new Date()),
              expectedReturnDate: debt.expectedReturnDate
                ? new Date(debt.expectedReturnDate)
                : undefined,
            })),
            accounts: state.accounts?.length ? state.accounts : DEFAULT_ACCOUNTS,
            categories: state.categories?.length ? state.categories : DEFAULT_CATEGORIES,
          };
        }

        return state;
      },
    }
  )
);
