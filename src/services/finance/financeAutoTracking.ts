import type { BudgetFlowType, Transaction } from '@/domain/finance/types';
import type { Goal } from '@/domain/planner/types';
import { useFinanceDomainStore } from '@/stores/useFinanceDomainStore';
import { useFinancePreferencesStore } from '@/stores/useFinancePreferencesStore';

type GoalFinanceEvent = 'goal-progress' | 'goal-completed';

type GoalFinanceTransactionInput = {
  goal: Goal;
  amount: number;
  budgetId?: string;
  note?: string;
  eventType: GoalFinanceEvent;
};

const getBaseCurrency = () => useFinancePreferencesStore.getState().baseCurrency;

const resolveFlowDirection = (goal?: Goal): BudgetFlowType => {
  if (!goal) {
    return 'expense';
  }
  if (goal.financeMode === 'save') {
    return 'income';
  }
  return 'expense';
};

const ensureBudgetLinked = (budgetId: string, goalId?: string) => {
  if (!goalId) return;
  const financeStore = useFinanceDomainStore.getState();
  const target = financeStore.budgets.find((budget) => budget.id === budgetId);
  if (!target || target.linkedGoalId === goalId) return;
  financeStore.updateBudget(budgetId, { linkedGoalId: goalId });
};

export const createGoalFinanceTransaction = ({
  goal,
  amount,
  budgetId,
  note,
  eventType,
}: GoalFinanceTransactionInput): Transaction | undefined => {
  const financeStore = useFinanceDomainStore.getState();
  const budgetFromLink =
    budgetId ??
    goal?.linkedBudgetId ??
    financeStore.budgets.find((b) => b.linkedGoalId === goal?.id)?.id;
  if (!goal || !budgetFromLink || !(amount > 0)) {
    return undefined;
  }
  const budget = financeStore.budgets.find((item) => item.id === budgetFromLink);
  const accountId = budget?.accountId ?? financeStore.accounts[0]?.id;
  const currency = budget?.currency ?? goal.currency ?? getBaseCurrency();
  const flow = resolveFlowDirection(goal);
  const today = new Date().toISOString();
  const financeCategory = (goal as any).financeCategoryId ?? (goal as any).financeCategory ?? (goal as any).categoryId;
  const descriptionBudgetPart = budget?.name ? ` · Budget: ${budget.name}` : '';

  const transaction = financeStore.createTransaction({
    type: flow === 'income' ? 'income' : 'expense',
    goalId: goal.id,
    budgetId: budgetFromLink,
    accountId,
    amount: Math.abs(amount),
    currency,
    baseCurrency: currency,
    rateUsedToBase: 1,
    convertedAmountToBase: Math.abs(amount),
    categoryId: financeCategory,
    description: note ?? `Goal: ${goal.title}${descriptionBudgetPart}`,
    tags: ['goal', eventType, goal.title],
    date: today,
    createdAt: today,
    updatedAt: today,
  });

  ensureBudgetLinked(budgetFromLink, goal.id);
  return transaction;
};
