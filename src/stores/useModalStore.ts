import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { mmkvStorageAdapter } from '@/utils/storage';

import type { Debt, Transaction } from '@/types/store.types';

type ModalMode = 'create' | 'edit';

interface IncomeOutcomeState {
  isOpen: boolean;
  mode: ModalMode;
  initialTab?: 'income' | 'outcome';
  transaction?: Transaction;
}

interface TransferState {
  isOpen: boolean;
  mode: ModalMode;
  transaction?: Transaction;
}

interface DebtState {
  isOpen: boolean;
  mode: ModalMode;
  debt?: Debt;
}

interface PlannerModalState {
  isOpen: boolean;
  mode: ModalMode;
}

interface ModalStore {
  incomeOutcome: IncomeOutcomeState;
  transferModal: TransferState;
  debtModal: DebtState;
  plannerTaskModal: PlannerModalState;
  plannerGoalModal: PlannerModalState;
  plannerHabitModal: PlannerModalState;
  plannerFocusModal: PlannerModalState;
  insightsReportModal: PlannerModalState;

  openIncomeOutcome: (options?: {
    mode?: ModalMode;
    tab?: 'income' | 'outcome';
    transaction?: Transaction;
  }) => void;
  closeIncomeOutcome: () => void;

  openTransferModal: (options?: { mode?: ModalMode; transaction?: Transaction }) => void;
  closeTransferModal: () => void;

  openDebtModal: (options?: { mode?: ModalMode; debt?: Debt }) => void;
  closeDebtModal: () => void;

  openPlannerTaskModal: (mode?: ModalMode) => void;
  closePlannerTaskModal: () => void;
  openPlannerGoalModal: (mode?: ModalMode) => void;
  closePlannerGoalModal: () => void;
  openPlannerHabitModal: (mode?: ModalMode) => void;
  closePlannerHabitModal: () => void;
  openPlannerFocusModal: () => void;
  closePlannerFocusModal: () => void;
  openInsightsReportModal: () => void;
  closeInsightsReportModal: () => void;
}

const initialIncomeOutcome: IncomeOutcomeState = {
  isOpen: false,
  mode: 'create',
  initialTab: 'income',
};

const initialTransferState: TransferState = {
  isOpen: false,
  mode: 'create',
};

const initialDebtState: DebtState = {
  isOpen: false,
  mode: 'create',
};

const initialPlannerState: PlannerModalState = {
  isOpen: false,
  mode: 'create',
};

export const useModalStore = create<ModalStore>()(
  persist(
    (set) => ({
      incomeOutcome: initialIncomeOutcome,
      transferModal: initialTransferState,
      debtModal: initialDebtState,
      plannerTaskModal: initialPlannerState,
      plannerGoalModal: initialPlannerState,
      plannerHabitModal: initialPlannerState,
      plannerFocusModal: { isOpen: false, mode: 'create' },
      insightsReportModal: { isOpen: false, mode: 'create' },

      openIncomeOutcome: (options) =>
        set({
          incomeOutcome: {
            isOpen: true,
            mode: options?.mode ?? (options?.transaction ? 'edit' : 'create'),
            initialTab: options?.tab ?? initialIncomeOutcome.initialTab,
            transaction: options?.transaction,
          },
        }),
      closeIncomeOutcome: () =>
        set({
          incomeOutcome: initialIncomeOutcome,
        }),

      openTransferModal: (options) =>
        set({
          transferModal: {
            isOpen: true,
            mode: options?.mode ?? (options?.transaction ? 'edit' : 'create'),
            transaction: options?.transaction,
          },
        }),
      closeTransferModal: () =>
        set({
          transferModal: initialTransferState,
        }),

      openDebtModal: (options) =>
        set({
          debtModal: {
            isOpen: true,
            mode: options?.mode ?? (options?.debt ? 'edit' : 'create'),
            debt: options?.debt,
          },
        }),
      closeDebtModal: () =>
        set({
          debtModal: initialDebtState,
        }),

      openPlannerTaskModal: (mode = 'create') => set({ plannerTaskModal: { isOpen: true, mode } }),
      closePlannerTaskModal: () => set({ plannerTaskModal: initialPlannerState }),
      openPlannerGoalModal: (mode = 'create') => set({ plannerGoalModal: { isOpen: true, mode } }),
      closePlannerGoalModal: () => set({ plannerGoalModal: initialPlannerState }),
      openPlannerHabitModal: (mode = 'create') => set({ plannerHabitModal: { isOpen: true, mode } }),
      closePlannerHabitModal: () => set({ plannerHabitModal: initialPlannerState }),
      openPlannerFocusModal: () => set({ plannerFocusModal: { isOpen: true, mode: 'create' } }),
      closePlannerFocusModal: () => set({ plannerFocusModal: { isOpen: false, mode: 'create' } }),
      openInsightsReportModal: () => set({ insightsReportModal: { isOpen: true, mode: 'create' } }),
      closeInsightsReportModal: () => set({ insightsReportModal: { isOpen: false, mode: 'create' } }),
    }),
    {
      name: 'modal-storage',
      storage: createJSONStorage(() => mmkvStorageAdapter),
    }
  )
);
