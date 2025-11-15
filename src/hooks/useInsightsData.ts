import { useMemo } from 'react';

import {
  type DayPartKey,
  type IndicatorKey,
  type OverviewComponentKey,
  type OverviewQuickWinKey,
  type WeeklyDayKey,
  type SavingKey,
  type OverviewChangeGroupKey,
} from '@/localization/insightsContent';
import { useInsightsContent } from '@/localization/useInsightsContent';
import { useFinanceStore } from '@/stores/useFinanceStore';
import {
  type FinanceCurrency,
  useFinancePreferencesStore,
} from '@/stores/useFinancePreferencesStore';
import { useTaskStore } from '@/stores/useTaskStore';
import { normalizeFinanceCurrency } from '@/utils/financeCurrency';
import { useLocalization } from '@/localization/useLocalization';
import type { InsightCardEntity } from '@/types/insights';

const WEEK_KEYS: WeeklyDayKey[] = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'];
const DAY_PART_KEYS: DayPartKey[] = ['morning', 'day', 'evening', 'night'];

const clamp01 = (value: number) => Math.max(0, Math.min(1, value));

const getWeekdayKey = (date: Date): WeeklyDayKey => WEEK_KEYS[(date.getDay() + 6) % 7]!;

const getDayPartKey = (date: Date): DayPartKey => {
  const hours = date.getHours();
  if (hours < 11) {
    return 'morning';
  }
  if (hours < 17) {
    return 'day';
  }
  if (hours < 22) {
    return 'evening';
  }
  return 'night';
};

type ComponentScoreMap = Partial<Record<OverviewComponentKey, { score: number; progress: number }>>;
type IndicatorScoreMap = Partial<Record<IndicatorKey, { score: number; metric: string }>>;
type WeeklyPatternMap = Partial<Record<WeeklyDayKey, number>>;
type DayPatternMap = Partial<Record<DayPartKey, number>>;
type SavingsMap = Partial<Record<SavingKey, { impactValue: number }>>;
type QuickWinMap = Partial<Record<OverviewQuickWinKey, { impact: string; meta: string }>>;
type ChangeSignalMap = Partial<Record<OverviewChangeGroupKey, string[]>>;

export type InsightCard = InsightCardEntity;

export const useInsightsData = () => {
  const transactions = useFinanceStore((state) => state.transactions);
  const debts = useFinanceStore((state) => state.debts);
  const budgets = useFinanceStore((state) => state.budgets);
  const accounts = useFinanceStore((state) => state.accounts);
  const tasks = useTaskStore((state) => state.tasks);
  const convertAmount = useFinancePreferencesStore((state) => state.convertAmount);
  const globalCurrency = useFinancePreferencesStore((state) => state.globalCurrency);
  const { locale } = useLocalization();
  const content = useInsightsContent();

  return useMemo(() => {
    const now = new Date();
    const thirtyDaysAgo = new Date(now);
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const sevenDaysAgo = new Date(now);
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);

    const currencyFormatter = new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: globalCurrency,
      maximumFractionDigits: globalCurrency === 'UZS' ? 0 : 2,
    });
    const formatCurrency = (value: number) => currencyFormatter.format(value);
    const toGlobal = (amount: number, currency?: string) =>
      convertAmount(amount, normalizeFinanceCurrency(currency as FinanceCurrency), globalCurrency);

    const outcomeTx = transactions.filter((txn) => txn.type === 'outcome');
    const incomeTx = transactions.filter((txn) => txn.type === 'income');
    const recentOutcome = outcomeTx.filter((txn) => new Date(txn.date) >= thirtyDaysAgo);
    const recentIncome = incomeTx.filter((txn) => new Date(txn.date) >= thirtyDaysAgo);

    const outcomeLast30 = recentOutcome.reduce((sum, txn) => sum + toGlobal(txn.amount, txn.currency), 0);
    const incomeLast30 = recentIncome.reduce((sum, txn) => sum + toGlobal(txn.amount, txn.currency), 0);

    const accountTotals = accounts.reduce(
      (acc, account) => {
        const value = toGlobal(account.balance, account.currency);
        acc.total += value;
        if (account.type === 'savings') {
          acc.savings += value;
        }
        if (account.currency?.toUpperCase() === 'USD') {
          acc.usd += value;
        }
        if (account.type === 'cash' || account.type === 'card') {
          acc.cash += value;
        }
        return acc;
      },
      { total: 0, savings: 0, cash: 0, usd: 0 },
    );

    const outstandingDebt = debts.reduce(
      (sum, debt) => sum + toGlobal(debt.remainingAmount, debt.currency),
      0,
    );

    const budgetsOverLimit = budgets.filter((budget) => budget.spent > budget.limit).length;
    const goalScore = budgets.length
      ? clamp01(1 - budgetsOverLimit / budgets.length)
      : 0.75;

    const liquidityScore = clamp01(accountTotals.cash / Math.max(outcomeLast30 || 1, 1));
    const savingsScore = clamp01(accountTotals.savings / Math.max(accountTotals.total || 1, 1));
    const debtScore = clamp01(1 - outstandingDebt / Math.max(accountTotals.total + outstandingDebt || 1, 1));
    const capitalScore = clamp01((accountTotals.total - outstandingDebt) / Math.max(accountTotals.total || 1, 1));

    const componentScores: ComponentScoreMap = {
      financial: { score: +(liquidityScore * 10).toFixed(1), progress: liquidityScore },
      productivity: {
        score: +(clamp01(incomeLast30 > 0 ? incomeLast30 / (outcomeLast30 + 1) : 0.6) * 10).toFixed(1),
        progress: clamp01(incomeLast30 > 0 ? incomeLast30 / (outcomeLast30 + incomeLast30) : 0.5),
      },
      balance: {
        score: +(clamp01((accountTotals.cash + accountTotals.savings) / Math.max(outstandingDebt + accountTotals.total, 1)) * 10).toFixed(1),
        progress: clamp01(accountTotals.savings / Math.max(accountTotals.total, 1)),
      },
      goals: { score: +(goalScore * 10).toFixed(1), progress: goalScore },
      discipline: {
        score: +(
          clamp01(
            1 -
              Math.min(
                5,
                (tasks.filter((task) => !task.completed).length || 0) /
                  Math.max(tasks.length || 1, 1),
              ),
          ) *
          10
        ).toFixed(1),
        progress: clamp01(tasks.length ? tasks.filter((task) => task.completed).length / tasks.length : 0.6),
      },
    };

    const weeklyTotals = new Map<WeeklyDayKey, number>();
    const dayPartTotals = new Map<DayPartKey, number>();
    let nightSpending = 0;
    let totalRecentSpending = 0;
    recentOutcome.forEach((txn) => {
      const txnDate = new Date(txn.date);
      if (txnDate < sevenDaysAgo) {
        return;
      }
      const value = toGlobal(txn.amount, txn.currency);
      const weekday = getWeekdayKey(txnDate);
      weeklyTotals.set(weekday, (weeklyTotals.get(weekday) ?? 0) + value);
      const part = getDayPartKey(txnDate);
      dayPartTotals.set(part, (dayPartTotals.get(part) ?? 0) + value);
      totalRecentSpending += value;
      if (part === 'night') {
        nightSpending += value;
      }
    });

    const weeklyPattern: WeeklyPatternMap = {};
    WEEK_KEYS.forEach((key) => {
      weeklyPattern[key] =
        totalRecentSpending > 0 ? (weeklyTotals.get(key) ?? 0) / totalRecentSpending : 1 / WEEK_KEYS.length;
    });

    const dayPattern: DayPatternMap = {};
    DAY_PART_KEYS.forEach((key) => {
      dayPattern[key] =
        totalRecentSpending > 0 ? (dayPartTotals.get(key) ?? 0) / totalRecentSpending : 1 / DAY_PART_KEYS.length;
    });

    const indicatorScores: IndicatorScoreMap = {
      liquidity: { score: liquidityScore, metric: formatCurrency(accountTotals.cash) },
      savings: { score: savingsScore, metric: formatCurrency(accountTotals.savings) },
      debt: { score: debtScore, metric: outstandingDebt ? formatCurrency(outstandingDebt) : content.finance.indicators.debt.metric },
      capital: { score: capitalScore, metric: formatCurrency(accountTotals.total) },
      goals: { score: goalScore, metric: `${Math.round(goalScore * 100)}%` },
    };

    const savingsMap: SavingsMap = {};
    budgets.forEach((budget) => {
      const over = Math.max(0, budget.spent - budget.limit);
      if (!over) {
        return;
      }
      if (budget.name.toLowerCase().includes('subscription')) {
        savingsMap.subscriptions = { impactValue: (savingsMap.subscriptions?.impactValue ?? 0) + over };
      } else if (budget.name.toLowerCase().includes('food')) {
        savingsMap.food = { impactValue: (savingsMap.food?.impactValue ?? 0) + over };
      } else if (budget.name.toLowerCase().includes('transport')) {
        savingsMap.transport = { impactValue: (savingsMap.transport?.impactValue ?? 0) + over };
      } else if (budget.name.toLowerCase().includes('coffee')) {
        savingsMap.coffee = { impactValue: (savingsMap.coffee?.impactValue ?? 0) + over };
      }
    });

    const quickWinMap: QuickWinMap = {
      tasks: {
        impact: `${tasks.filter((task) => task.priority === 'high').length} high-priority`,
        meta: `${tasks.filter((task) => !task.completed).length} open`,
      },
      coffee: {
        impact: formatCurrency(savingsMap.coffee?.impactValue ?? 0),
        meta: content.overview.quickWins.items.coffee.meta,
      },
      meditation: {
        impact: content.overview.quickWins.items.meditation.impact,
        meta: content.overview.quickWins.items.meditation.meta,
      },
      reading: {
        impact: content.overview.quickWins.items.reading.impact,
        meta: content.overview.quickWins.items.reading.meta,
      },
    };

    const changeSignals: ChangeSignalMap = {
      upgrades: budgets
        .filter((budget) => budget.state === 'within')
        .map((budget) => `${budget.name}: ${Math.round((1 - budget.spent / budget.limit) * 100)}% free`),
      attention: budgets
        .filter((budget) => budget.state === 'exceeding')
        .map((budget) => `${budget.name}: ${formatCurrency(budget.spent - budget.limit)} over`),
    };

    const cards: InsightCard[] = [];
    const nightShare = totalRecentSpending > 0 ? nightSpending / totalRecentSpending : 0;
    if (nightShare > 0.35 && content.scenarios?.nightSpending) {
      const scenario = content.scenarios.nightSpending;
      cards.push({
        id: 'night-spending',
        title: scenario.title,
        body: scenario.tones.friend.replace('{percent}', `${Math.round(nightShare * 100)}%`),
        tone: 'friend',
        category: 'finance',
        priority: 4,
        createdAt: new Date().toISOString(),
        cta: { label: scenario.cta, action: 'review_budget' },
        push: scenario.push,
        explain: scenario.explain,
      });
    }

    const lastExpense = outcomeTx[0] ? new Date(outcomeTx[0].date) : null;
    const daysSinceLastExpense = lastExpense
      ? Math.floor((now.getTime() - lastExpense.getTime()) / (24 * 60 * 60 * 1000))
      : 10;
    if (daysSinceLastExpense >= 2 && content.scenarios?.missingExpense) {
      const scenario = content.scenarios.missingExpense;
      cards.push({
        id: 'missing-expense',
        title: scenario.title,
        body: scenario.tones.polite.replace('{days}', `${daysSinceLastExpense}`),
        tone: 'polite',
        category: 'finance',
        priority: 3,
        createdAt: new Date().toISOString(),
        cta: { label: scenario.cta, action: 'quick_add' },
        push: scenario.push,
        explain: scenario.explain.replace('{days}', `${daysSinceLastExpense}`),
      });
    }

    const usdDebt = debts.find((debt) => {
      if (!debt.expectedReturnDate) {
        return false;
      }
      const diff =
        new Date(debt.expectedReturnDate).setHours(0, 0, 0, 0) -
        now.setHours(0, 0, 0, 0);
      return (
        Math.round(diff / (24 * 60 * 60 * 1000)) <= 3 &&
        normalizeFinanceCurrency(debt.currency) === 'USD'
      );
    });
    if (usdDebt && content.scenarios?.usdPayment) {
      const scenario = content.scenarios.usdPayment;
      const debitNeeded = toGlobal(usdDebt.remainingAmount, usdDebt.currency);
      if (accountTotals.usd < debitNeeded) {
        cards.push({
          id: `usd-payment-${usdDebt.id}`,
          title: scenario.title,
          body: scenario.tones.strict.replace(
            '{amount}',
            formatCurrency(debitNeeded - accountTotals.usd),
          ),
          tone: 'strict',
          category: 'finance',
          priority: 5,
          createdAt: new Date().toISOString(),
          cta: { label: scenario.cta, action: 'open_exchange' },
          push: scenario.push,
          explain: scenario.explain.replace(
            '{balance}',
            formatCurrency(accountTotals.usd),
          ),
        });
      }
    }

    const dueTomorrow = debts.find((debt) => {
      if (!debt.expectedReturnDate) {
        return false;
      }
      const due = new Date(debt.expectedReturnDate);
      const diffDays = Math.round(
        (due.setHours(0, 0, 0, 0) - now.setHours(0, 0, 0, 0)) /
          (24 * 60 * 60 * 1000),
      );
      return diffDays === 1;
    });
    if (dueTomorrow && content.scenarios?.debtDueTomorrow) {
      const scenario = content.scenarios.debtDueTomorrow;
      cards.push({
        id: `debt-due-${dueTomorrow.id}`,
        title: scenario.title,
        body: scenario.tones.friend.replace('{name}', dueTomorrow.person),
        tone: 'friend',
        category: 'finance',
        priority: 6,
        createdAt: new Date().toISOString(),
        cta: { label: scenario.cta, action: 'open_debt', targetId: dueTomorrow.id },
        payload: { debtId: dueTomorrow.id },
        push: scenario.push,
        explain: scenario.explain.replace(
          '{amount}',
          formatCurrency(toGlobal(dueTomorrow.remainingAmount, dueTomorrow.currency)),
        ),
      });
    }

    const healthScore = +(
      ((liquidityScore + savingsScore + debtScore + capitalScore + goalScore) / 5) *
      10
    ).toFixed(1);

    return {
      overviewData: {
        score: healthScore,
        components: componentScores,
        quickWins: quickWinMap,
        changeSignals,
      },
      financeData: {
        healthScore,
        indicators: indicatorScores,
        weeklyPattern,
        dayPattern,
        savings: savingsMap,
        formatCurrency,
      },
      cards,
    };
  }, [
    accounts,
    budgets,
    content,
    convertAmount,
    debts,
    globalCurrency,
    locale,
    tasks,
    transactions,
  ]);
};

export default useInsightsData;
