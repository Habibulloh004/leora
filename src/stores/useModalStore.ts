import { create } from 'zustand';
import type { StateCreator } from 'zustand';

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

type DebtModalFocus = 'full' | 'partial' | 'schedule' | 'reminder' | null;

interface DebtState {
  isOpen: boolean;
  mode: ModalMode;
  debt?: Debt;
  initialFocus: DebtModalFocus;
  showPrimarySheet: boolean;
}

interface PlannerModalState {
  isOpen: boolean;
  mode: ModalMode;
}

interface PlannerTaskModalState extends PlannerModalState {
  taskId?: string | null;
}

interface ModalStore {
  incomeOutcome: IncomeOutcomeState;
  transferModal: TransferState;
  debtModal: DebtState;
  plannerTaskModal: PlannerTaskModalState;
  plannerGoalModal: PlannerModalState;
  plannerHabitModal: PlannerModalState;
  plannerFocusModal: PlannerModalState;
  focusSettingsModal: {
    isOpen: boolean;
  };
  insightsReportModal: PlannerModalState;

  openIncomeOutcome: (options?: {
    mode?: ModalMode;
    tab?: 'income' | 'outcome';
    transaction?: Transaction;
  }) => void;
  closeIncomeOutcome: () => void;

  openTransferModal: (options?: { mode?: ModalMode; transaction?: Transaction }) => void;
  closeTransferModal: () => void;

  openDebtModal: (options?: {
    mode?: ModalMode;
    debt?: Debt;
    focus?: DebtModalFocus;
    showPrimarySheet?: boolean;
  }) => void;
  closeDebtModal: () => void;
  consumeDebtModalFocus: () => void;

  openPlannerTaskModal: (options?: { mode?: ModalMode; taskId?: string }) => void;
  closePlannerTaskModal: () => void;
  openPlannerGoalModal: (mode?: ModalMode) => void;
  closePlannerGoalModal: () => void;
  openPlannerHabitModal: (mode?: ModalMode) => void;
  closePlannerHabitModal: () => void;
  openPlannerFocusModal: () => void;
  closePlannerFocusModal: () => void;
  openFocusSettingsModal: () => void;
  closeFocusSettingsModal: () => void;
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
  initialFocus: null,
  showPrimarySheet: false,
};

const initialPlannerState: PlannerModalState = {
  isOpen: false,
  mode: 'create',
};

const initialPlannerTaskState: PlannerTaskModalState = {
  isOpen: false,
  mode: 'create',
  taskId: null,
};

const createModalStore: StateCreator<ModalStore> = (set) => ({
  incomeOutcome: initialIncomeOutcome,
  transferModal: initialTransferState,
  debtModal: initialDebtState,
  plannerTaskModal: initialPlannerTaskState,
  plannerGoalModal: initialPlannerState,
  plannerHabitModal: initialPlannerState,
  plannerFocusModal: { isOpen: false, mode: 'create' },
  focusSettingsModal: { isOpen: false },
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
        initialFocus: options?.focus ?? null,
        showPrimarySheet: options?.showPrimarySheet ?? true,
      },
    }),
  closeDebtModal: () =>
    set({
      debtModal: initialDebtState,
    }),
  consumeDebtModalFocus: () =>
    set((state) => ({
      debtModal: {
        ...state.debtModal,
        initialFocus: null,
      },
    })),

  openPlannerTaskModal: (options) =>
    set({
      plannerTaskModal: {
        isOpen: true,
        mode: options?.mode ?? 'create',
        taskId: options?.taskId ?? null,
      },
    }),
  closePlannerTaskModal: () => set({ plannerTaskModal: initialPlannerTaskState }),
  openPlannerGoalModal: (mode = 'create') => set({ plannerGoalModal: { isOpen: true, mode } }),
  closePlannerGoalModal: () => set({ plannerGoalModal: initialPlannerState }),
  openPlannerHabitModal: (mode = 'create') => set({ plannerHabitModal: { isOpen: true, mode } }),
  closePlannerHabitModal: () => set({ plannerHabitModal: initialPlannerState }),
  openPlannerFocusModal: () => set({ plannerFocusModal: { isOpen: true, mode: 'create' } }),
  closePlannerFocusModal: () => set({ plannerFocusModal: { isOpen: false, mode: 'create' } }),
  openFocusSettingsModal: () => set({ focusSettingsModal: { isOpen: true } }),
  closeFocusSettingsModal: () => set({ focusSettingsModal: { isOpen: false } }),
  openInsightsReportModal: () => set({ insightsReportModal: { isOpen: true, mode: 'create' } }),
  closeInsightsReportModal: () => set({ insightsReportModal: { isOpen: false, mode: 'create' } }),
});

export const useModalStore = create<ModalStore>(createModalStore);
