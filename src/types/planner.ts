export interface PlannerTask {
  id: string;
  title: string;
  description?: string;
  date: Date;
  time: string;
  duration: number;
  context: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  energy: 'low' | 'medium' | 'high';
  completed: boolean;
  timeBlock: 'morning' | 'afternoon' | 'evening';
}

export interface PlannerGoal {
  id: string;
  title: string;
  description: string;
  type: 'financial' | 'quantitative' | 'qualitative';
  category: string;
  progress: number;
  target: number;
  current: number;
  deadline?: Date;
  milestones: Milestone[];
}

export interface Milestone {
  id: string;
  title: string;
  completed: boolean;
  date?: Date;
}

export interface Habit {
  id: string;
  name: string;
  icon: string;
  category: string;
  streak: number;
  bestStreak: number;
  completionRate: number;
  schedule: boolean[];
  reminderTime?: string;
}

