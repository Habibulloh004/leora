// src/config/widgetConfig.tsx
import React from 'react';
import {
  Activity,
  BarChart3,
  CheckSquare,
  CreditCard,
  Target,
  Timer,
} from 'lucide-react-native';

import DailyTasksWidget from '@/components/widget/DailyTasksWidget';
import GoalsWidget from '@/components/widget/GoalsWidget';
import HabitsWidget from '@/components/widget/HabitsWidget';
import WeeklyReviewWidget from '@/components/widget/WeeklyReviewWidget';
import FocusSessionsWidget from '@/components/widget/FocusSessionsWidget';
import TransactionsWidget from '@/components/widget/TransactionsWidget';

export type WidgetType = 
  | 'daily-tasks' 
  | 'goals' 
  | 'habits' 
  | 'weekly-review'
  | 'focus-sessions'
  | 'transactions';

type WidgetIcon = React.ComponentType<{ size?: number; color?: string }>;

export interface WidgetConfig {
  id: WidgetType;
  title: string;
  icon: WidgetIcon;
  description: string;
  component: React.ComponentType<any>;
  category: 'planner' | 'finance' | 'ai' | 'health';
  defaultProps?: any;
}

export const AVAILABLE_WIDGETS: Record<WidgetType, WidgetConfig> = {
  'daily-tasks': {
    id: 'daily-tasks',
    title: 'Daily Tasks',
    icon: CheckSquare,
    description: "Today's task list",
    component: DailyTasksWidget,
    category: 'planner',
  },
  'goals': {
    id: 'goals',
    title: 'Goals',
    icon: Target,
    description: 'Track your goals',
    component: GoalsWidget,
    category: 'planner',
  },
  'habits': {
    id: 'habits',
    title: 'Habits',
    icon: Activity,
    description: 'Daily habits tracker',
    component: HabitsWidget,
    category: 'planner',
  },
  'weekly-review': {
    id: 'weekly-review',
    title: 'Weekly Review',
    icon: BarChart3,
    description: 'Week progress overview',
    component: WeeklyReviewWidget,
    category: 'planner',
  },
  'focus-sessions': {
    id: 'focus-sessions',
    title: 'Focus Sessions',
    icon: Timer,
    description: 'Pomodoro timer & tracking',
    component: FocusSessionsWidget,
    category: 'planner',
  },
  'transactions': {
    id: 'transactions',
    title: 'Transactions',
    icon: CreditCard,
    description: 'Recent financial activity',
    component: TransactionsWidget,
    category: 'finance',
  },
};
