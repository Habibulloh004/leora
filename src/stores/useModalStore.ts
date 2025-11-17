import { create } from 'zustand';
import type { StateCreator } from 'zustand';

import type { Debt, Transaction } from '@/types/store.types';
import type { Goal } from '@/features/planner/goals/data';
import type { HabitCardModel } from '@/features/planner/habits/data';
import type { AddTaskPayload } from '@/types/planner';

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
  goalId?: string | null;
  initialPayload?: Partial<AddTaskPayload> | null;
}

interface PlannerGoalModalState extends PlannerModalState {
  goalId?: string | null;
  goal?: Goal | null;
}

interface PlannerHabitModalState extends PlannerModalState {
  habitId?: string | null;
  habit?: HabitCardModel | null;
}

interface ModalStore {
  incomeOutcome: IncomeOutcomeState;
  transferModal: TransferState;
  debtModal: DebtState;
  plannerTaskModal: PlannerTaskModalState;
  plannerGoalModal: PlannerGoalModalState;
  plannerHabitModal: PlannerHabitModalState;
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

  openPlannerTaskModal: (options?: {
    mode?: ModalMode;
    taskId?: string;
    goalId?: string;
    initialPayload?: Partial<AddTaskPayload>;
  }) => void;
  closePlannerTaskModal: () => void;
  openPlannerGoalModal: (options?: { mode?: ModalMode; goalId?: string; goal?: Goal }) => void;
  closePlannerGoalModal: () => void;
  openPlannerHabitModal: (options?: { mode?: ModalMode; habitId?: string; habit?: HabitCardModel }) => void;
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
  goalId: null,
  initialPayload: null,
};

const initialPlannerGoalState: PlannerGoalModalState = {
  isOpen: false,
  mode: 'create',
  goalId: null,
  goal: null,
};

const initialPlannerHabitState: PlannerHabitModalState = {
  isOpen: false,
  mode: 'create',
  habitId: null,
  habit: null,
};

const createModalStore: StateCreator<ModalStore> = (set) => ({
  incomeOutcome: initialIncomeOutcome,
  transferModal: initialTransferState,
  debtModal: initialDebtState,
  plannerTaskModal: initialPlannerTaskState,
  plannerGoalModal: initialPlannerGoalState,
  plannerHabitModal: initialPlannerHabitState,
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
        goalId: options?.goalId ?? null,
        initialPayload: options?.initialPayload ?? null,
      },
    }),
  closePlannerTaskModal: () => set({ plannerTaskModal: initialPlannerTaskState }),
  openPlannerGoalModal: (options) =>
    set({
      plannerGoalModal: {
        isOpen: true,
        mode: options?.mode ?? 'create',
        goalId: options?.goalId ?? null,
        goal: options?.goal ?? null,
      },
    }),
  closePlannerGoalModal: () => set({ plannerGoalModal: initialPlannerGoalState }),
  openPlannerHabitModal: (options) =>
    set({
      plannerHabitModal: {
        isOpen: true,
        mode: options?.mode ?? 'create',
        habitId: options?.habitId ?? null,
        habit: options?.habit ?? null,
      },
    }),
  closePlannerHabitModal: () => set({ plannerHabitModal: initialPlannerHabitState }),
  openPlannerFocusModal: () => set({ plannerFocusModal: { isOpen: true, mode: 'create' } }),
  closePlannerFocusModal: () => set({ plannerFocusModal: { isOpen: false, mode: 'create' } }),
  openFocusSettingsModal: () => set({ focusSettingsModal: { isOpen: true } }),
  closeFocusSettingsModal: () => set({ focusSettingsModal: { isOpen: false } }),
  openInsightsReportModal: () => set({ insightsReportModal: { isOpen: true, mode: 'create' } }),
  closeInsightsReportModal: () => set({ insightsReportModal: { isOpen: false, mode: 'create' } }),
});

export const useModalStore = create<ModalStore>(createModalStore);
