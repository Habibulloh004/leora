export interface PersonalDevelopmentIndex {
  overall: number;
  financial: number;
  productivity: number;
  workLife: number;
  goals: number;
  discipline: number;
}

export interface Insight {
  id: string;
  type: 'pattern' | 'opportunity' | 'warning' | 'achievement';
  icon: string;
  title: string;
  description: string;
  date: Date;
}

export interface FinancialMetric {
  label: string;
  value: number;
  change: number;
  trend: 'up' | 'down' | 'stable';
}

