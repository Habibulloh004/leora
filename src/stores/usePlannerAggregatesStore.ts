import { create } from 'zustand';

import type { Goal, Habit, Task } from '@/domain/planner/types';
import { plannerEventBus } from '@/events/plannerEventBus';
import { usePlannerDomainStore } from '@/stores/usePlannerDomainStore';
import type { GoalSummary, HabitSummary, HomeSnapshot, TaskSummary } from '@/types/plannerSummaries';
import { startOfDay } from '@/utils/calendar';

interface PlannerAggregatesState {
  taskSummaries: TaskSummary[];
  goalSummaries: GoalSummary[];
  habitSummaries: HabitSummary[];
  homeSnapshot: HomeSnapshot;
  recompute: () => void;
}

const todayKey = () => startOfDay(new Date()).toISOString().slice(0, 10);

const computeTaskSummary = (task: Task): TaskSummary => {
  const subtasksTotal = task.checklist?.length ?? 0;
  const subtasksDone = task.checklist?.filter((item) => item.completed).length ?? 0;
  const due = task.dueDate ? new Date(task.dueDate) : null;
  const badges = {
    overdue: Boolean(due && due.getTime() < Date.now() && task.status !== 'completed'),
    today: Boolean(due && due.toISOString().slice(0, 10) === todayKey()),
    planned: task.status === 'planned',
  };
  return {
    taskId: task.id,
    title: task.title,
    status: task.status,
    priority: task.priority,
    dueDate: task.dueDate,
    timeOfDay: task.timeOfDay,
    estimatedMin: task.estimatedMinutes,
    goalId: task.goalId,
    habitId: task.habitId,
    financeLink: task.financeLink,
    focusTotalMin: task.focusTotalMinutes ?? 0,
    nextAction: undefined,
    badges,
    subtasksDone,
    subtasksTotal,
  };
};

const computeGoalSummary = (goal: Goal, tasks: Task[], habits: Habit[]): GoalSummary => {
  const milestonesTotal = goal.milestones?.length ?? 0;
  const milestonesDone = goal.milestones?.filter((m) => m.completedAt).length ?? 0;
  const habitsLinked = habits.filter((h) => h.goalId === goal.id);
  const tasksLinked = tasks.filter((t) => t.goalId === goal.id && t.status !== 'completed');
  return {
    goalId: goal.id,
    title: goal.title,
    type: goal.goalType,
    unit: goal.unit,
    currency: goal.currency,
    target: goal.targetValue,
    current: goal.initialValue,
    progressPercent: goal.progressPercent ?? 0,
    deadline: goal.targetDate,
    eta: undefined,
    riskFlags: [],
    milestonesDone,
    milestonesTotal,
    badges: {
      habitsToday: habitsLinked.length ? habitsLinked.length : undefined,
      nextTask: tasksLinked[0]?.title ?? null,
      financeLink: goal.financeMode ?? null,
    },
    nextAction: tasksLinked[0]?.title,
  };
};

const computeHabitSummary = (habit: Habit): HabitSummary => {
  const today = todayKey();
  const todayCompletion = habit.completionHistory?.find((entry) => entry.date === today);
  const todayStatus: HabitSummary['todayStatus'] = todayCompletion
    ? todayCompletion.completed
      ? 'done'
      : 'failed'
    : undefined;

  const remainingValue =
    habit.completionMode === 'numeric' && habit.targetPerDay && todayCompletion?.value
      ? Math.max(0, habit.targetPerDay - todayCompletion.value)
      : undefined;

  return {
    habitId: habit.id,
    title: habit.title,
    frequency: habit.frequency,
    completionMode: habit.completionMode,
    targetPerDay: habit.targetPerDay,
    unit: habit.unit,
    todayStatus,
    remainingValue,
    streakCurrent: habit.streakCurrent,
    streakBest: habit.streakBest,
    completionRate30d: habit.completionRate30d,
    goalId: habit.goalId,
    financeRule: habit.financeRule,
  };
};

const computeHomeSnapshot = (
  goals: GoalSummary[],
  habits: HabitSummary[],
  tasks: TaskSummary[],
): HomeSnapshot => {
  // Goals% - средний прогресс активных целей
  const activeGoals = goals.filter((g) => g.progressPercent != null);
  const goalsProgress = activeGoals.length
    ? activeGoals.reduce((sum, g) => sum + (g.progressPercent || 0), 0) / activeGoals.length
    : 0;

  // Habits% - процент выполненных привычек за сегодня
  const habitsToday = habits.filter((h) => h.todayStatus !== undefined);
  const habitsCompleted = habitsToday.filter((h) => h.todayStatus === 'done').length;
  const habitsProgress = habitsToday.length ? habitsCompleted / habitsToday.length : 0;

  // Tasks for today
  const tasksToday = tasks.filter((t) => t.badges.today);
  const tasksDone = tasksToday.filter((t) => t.status === 'completed').length;

  // Productivity% - фокус минуты / 120 (дневная цель)
  const totalFocusMinutes = tasksToday.reduce((sum, t) => sum + (t.focusTotalMin || 0), 0);
  const productivityPercent = Math.min(1, totalFocusMinutes / 120);

  // Определяем at-risk цели (прогресс < 30% и дедлайн близок)
  const now = Date.now();
  const atRiskGoals = goals
    .filter((g) => {
      if (!g.deadline) return false;
      const deadlineTime = new Date(g.deadline).getTime();
      const daysUntilDeadline = (deadlineTime - now) / (1000 * 60 * 60 * 24);
      return g.progressPercent < 0.3 && daysUntilDeadline > 0 && daysUntilDeadline <= 7;
    })
    .map((g) => g.goalId);

  return {
    date: todayKey(),
    rings: {
      goals: Number(goalsProgress.toFixed(3)),
      habits: Number(habitsProgress.toFixed(3)),
      productivity: Number(productivityPercent.toFixed(3)),
      finance: 0, // Finance% будет обновляться из Finance модуля
    },
    today: {
      tasksDue: tasksToday.length,
      habitsDue: habitsToday.length,
      nextEvents: [],
    },
    alerts: {
      atRiskGoals,
      budgetRisk: [], // Будет заполняться из Finance
      debtDue: [], // Будет заполняться из Finance
    },
  };
};

export const usePlannerAggregatesStore = create<PlannerAggregatesState>((set) => {
  const recompute = () => {
    const domain = usePlannerDomainStore.getState();
    const taskSummaries = domain.tasks.map(computeTaskSummary);
    const goalSummaries = domain.goals.map((goal) =>
      computeGoalSummary(goal, domain.tasks, domain.habits),
    );
    const habitSummaries = domain.habits.map(computeHabitSummary);
    const homeSnapshot = computeHomeSnapshot(goalSummaries, habitSummaries, taskSummaries);
    set({ taskSummaries, goalSummaries, habitSummaries, homeSnapshot });
  };

  // Initial compute
  recompute();

  const plannerEvents: Parameters<typeof plannerEventBus.subscribe>[0][] = [
    'planner.task.created',
    'planner.task.updated',
    'planner.task.completed',
    'planner.task.canceled',
    'planner.goal.created',
    'planner.goal.updated',
    'planner.goal.completed',
    'planner.goal.archived',
    'planner.goal.progress_updated',
    'planner.habit.created',
    'planner.habit.updated',
    'planner.habit.day_evaluated',
    'planner.focus.started',
    'planner.focus.completed',
    'finance.tx.created',
    'finance.tx.updated',
    'finance.budget.spending_changed',
    'finance.debt.created',
    'finance.debt.payment_added',
    'finance.debt.status_changed',
    'insights.actions.apply',
  ];

  plannerEvents.forEach((eventName) => {
    plannerEventBus.subscribe(eventName, () => recompute());
  });

  return {
    taskSummaries: [],
    goalSummaries: [],
    habitSummaries: [],
    homeSnapshot: {
      date: todayKey(),
      rings: { goals: 0, habits: 0, productivity: 0, finance: 0 },
      today: { tasksDue: 0, habitsDue: 0, nextEvents: [] },
      alerts: { atRiskGoals: [], budgetRisk: [], debtDue: [] },
    },
    recompute,
  };
});
