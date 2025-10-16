import type { LucideIcon } from 'lucide-react-native';
import {
  Activity,
  ArrowDownCircle,
  ArrowUpCircle,
  Briefcase,
  Bus,
  CalendarCheck,
  DollarSign,
  Film,
  GraduationCap,
  Heart,
  PiggyBank,
  ShoppingBag,
  Sparkles,
  UtensilsCrossed,
  Wallet,
} from 'lucide-react-native';

import { Colors } from '@/constants/Colors';

export type FinanceCategoryType = 'income' | 'outcome' | 'both';

export interface FinanceCategory {
  id: string;
  name: string;
  icon: LucideIcon;
  type: FinanceCategoryType;
  color: string;
}

export const FINANCE_CATEGORIES: FinanceCategory[] = [
  {
    id: 'income-salary',
    name: 'Salary',
    icon: Briefcase,
    type: 'income',
    color: Colors.success,
  },
  {
    id: 'income-business',
    name: 'Business',
    icon: DollarSign,
    type: 'income',
    color: Colors.primary,
  },
  {
    id: 'income-investment',
    name: 'Investment',
    icon: ArrowUpCircle,
    type: 'income',
    color: Colors.info,
  },
  {
    id: 'income-gift',
    name: 'Gift',
    icon: Sparkles,
    type: 'income',
    color: Colors.secondary,
  },
  {
    id: 'outcome-food',
    name: 'Food & Dining',
    icon: UtensilsCrossed,
    type: 'outcome',
    color: Colors.danger,
  },
  {
    id: 'outcome-transport',
    name: 'Transportation',
    icon: Bus,
    type: 'outcome',
    color: Colors.info,
  },
  {
    id: 'outcome-shopping',
    name: 'Shopping',
    icon: ShoppingBag,
    type: 'outcome',
    color: Colors.secondary,
  },
  {
    id: 'outcome-entertainment',
    name: 'Entertainment',
    icon: Film,
    type: 'outcome',
    color: Colors.primary,
  },
  {
    id: 'outcome-bills',
    name: 'Bills & Utilities',
    icon: Wallet,
    type: 'outcome',
    color: Colors.warning,
  },
  {
    id: 'outcome-health',
    name: 'Healthcare',
    icon: Activity,
    type: 'outcome',
    color: Colors.success,
  },
  {
    id: 'outcome-education',
    name: 'Education',
    icon: GraduationCap,
    type: 'outcome',
    color: Colors.info,
  },
  {
    id: 'outcome-charity',
    name: 'Charity',
    icon: Heart,
    type: 'outcome',
    color: Colors.secondary,
  },
  {
    id: 'transfer',
    name: 'Transfer',
    icon: ArrowDownCircle,
    type: 'both',
    color: Colors.textSecondary,
  },
  {
    id: 'savings',
    name: 'Savings',
    icon: PiggyBank,
    type: 'both',
    color: Colors.primary,
  },
  {
    id: 'other',
    name: 'Other',
    icon: CalendarCheck,
    type: 'both',
    color: Colors.textSecondary,
  },
];

export const getCategoriesForType = (type: 'income' | 'outcome') =>
  FINANCE_CATEGORIES.filter((category) => category.type === type || category.type === 'both');

export const findCategoryByName = (name: string) =>
  FINANCE_CATEGORIES.find((category) => category.name === name);
