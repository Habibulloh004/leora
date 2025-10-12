import React from 'react';
import DailyTasksWidget from '@/components/widget/DailyTasksWidget';
import GoalsWidget from '@/components/widget/GoalsWidget';
import HabitsWidget from '@/components/widget/HabitsWidget';
import WeeklyReviewWidget from '@/components/widget/WeeklyReviewWidget';

export type WidgetType = 'daily-tasks' | 'goals' | 'habits' | 'weekly-review';

export interface WidgetConfig {
  id: WidgetType;
  title: string;
  icon: string;
  description: string;
  component: React.ComponentType<any>;
  category: 'planner' | 'finance' | 'ai' | 'health';
  defaultProps?: any;
}

export const AVAILABLE_WIDGETS: Record<WidgetType, WidgetConfig> = {
  'daily-tasks': {
    id: 'daily-tasks',
    title: 'Daily Tasks',
    icon: '✓',
    description: "Today's task list",
    component: DailyTasksWidget,
    category: 'planner',
  },
  'goals': {
    id: 'goals',
    title: 'Goals',
    icon: '🎯',
    description: 'Track your goals',
    component: GoalsWidget,
    category: 'planner',
  },
  'habits': {
    id: 'habits',
    title: 'Habits',
    icon: '✨',
    description: 'Daily habits tracker',
    component: HabitsWidget,
    category: 'planner',
  },
  'weekly-review': {
    id: 'weekly-review',
    title: 'Weekly Review',
    icon: '📊',
    description: 'Week progress overview',
    component: WeeklyReviewWidget,
    category: 'planner',
  },
};