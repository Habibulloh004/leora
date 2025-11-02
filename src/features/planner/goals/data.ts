// src/features/planner/goals/data.ts
export type GoalSummaryRow = {
  label: string;
  value: string;
};

export type GoalMilestone = {
  percent: number;
  label: string;
};

export type GoalHistoryEntry = {
  id: string;
  label: string;
  delta: string;
};

export type Goal = {
  id: string;
  title: string;
  progress: number;
  currentAmount: string;
  targetAmount: string;
  summary: GoalSummaryRow[];
  milestones: GoalMilestone[];
  history: GoalHistoryEntry[];
  aiTip: string;
  aiTipHighlight?: string;
};

export type GoalSection = {
  id: string;
  title: string;
  subtitle: string;
  data: Goal[];
};

const createMilestones = (labels: string[]): GoalMilestone[] => {
  const steps = [25, 50, 75, 100];
  return steps.map((percent, index) => ({
    percent,
    label: labels[index] ?? '—',
  }));
};

const createHistory = (entries: Array<{ label: string; delta: string }>): GoalHistoryEntry[] =>
  entries.map((entry, index) => ({
    ...entry,
    id: `${entry.label}-${index}`,
  }));

export const GOAL_SECTIONS: GoalSection[] = [
  {
    id: 'financial',
    title: 'Financial goals',
    subtitle: 'Investment focus and savings priorities',
    data: [
      {
        id: 'dream-car',
        title: 'Dream car',
        progress: 0.82,
        currentAmount: '4.1M UZS',
        targetAmount: '5M UZS',
        summary: [
          { label: 'Left', value: '900 000 UZS remaining' },
          { label: 'Temp', value: '450 000 UZS / Mon.' },
          { label: 'Prediction', value: 'On track · March 2025' },
        ],
        milestones: createMilestones(['Jan 2025', 'Feb 2025', 'Mar 2025', 'Apr 2025']),
        history: createHistory([
          { label: 'Dec', delta: '+450 000 UZS' },
          { label: 'Nov', delta: '+320 000 UZS' },
          { label: 'Oct', delta: '+280 000 UZS' },
        ]),
        aiTip: 'At the current pace, you will reach your goal in March.',
        aiTipHighlight: 'Increase monthly contributions by 100k to hit February.',
      },
      {
        id: 'emergency-fund',
        title: 'Emergency fund',
        progress: 0.58,
        currentAmount: '3.5M UZS',
        targetAmount: '6M UZS',
        summary: [
          { label: 'Left', value: '2.5M UZS remaining' },
          { label: 'Temp', value: '300 000 UZS / Mon.' },
          { label: 'Prediction', value: 'Forecast · June 2025' },
        ],
        milestones: createMilestones(['Nov 2024', 'Jan 2025', 'Mar 2025', 'Jun 2025']),
        history: createHistory([
          { label: 'Dec', delta: '+300 000 UZS' },
          { label: 'Nov', delta: '+300 000 UZS' },
          { label: 'Oct', delta: '+250 000 UZS' },
        ]),
        aiTip: 'Adjusting contributions to 350k keeps you inside your comfort buffer.',
      },
    ],
  },
  {
    id: 'personal',
    title: 'Personal goals',
    subtitle: 'Lifestyle upgrades and wellness wins',
    data: [
      {
        id: 'fitness',
        title: 'Peak fitness plan',
        progress: 0.44,
        currentAmount: '92 / 210 sessions',
        targetAmount: '210 sessions',
        summary: [
          { label: 'Left', value: '118 sessions remaining' },
          { label: 'Temp', value: '4 sessions / Week' },
          { label: 'Prediction', value: 'On track · August 2025' },
        ],
        milestones: createMilestones(['Nov 2024', 'Jan 2025', 'Apr 2025', 'Aug 2025']),
        history: createHistory([
          { label: 'Week 48', delta: '+4 sessions' },
          { label: 'Week 47', delta: '+5 sessions' },
          { label: 'Week 46', delta: '+3 sessions' },
        ]),
        aiTip: 'Consistency is improving. Add one extra cardio day to accelerate results.',
      },
      {
        id: 'language',
        title: 'Spanish language immersion',
        progress: 0.68,
        currentAmount: '34 / 50 lessons',
        targetAmount: '50 lessons',
        summary: [
          { label: 'Left', value: '16 lessons remaining' },
          { label: 'Temp', value: '3 lessons / Week' },
          { label: 'Prediction', value: 'Arriving · February 2025' },
        ],
        milestones: createMilestones(['Oct 2024', 'Dec 2024', 'Jan 2025', 'Mar 2025']),
        history: createHistory([
          { label: 'Week 48', delta: '+3 lessons' },
          { label: 'Week 47', delta: '+4 lessons' },
          { label: 'Week 46', delta: '+3 lessons' },
        ]),
        aiTip: 'Pair each lesson with a 15 min conversational recap to reach fluency sooner.',
      },
    ],
  },
];

const GOAL_MAP = new Map<string, Goal>();
GOAL_SECTIONS.forEach((section) => {
  section.data.forEach((goal) => {
    GOAL_MAP.set(goal.id, goal);
  });
});

export const getGoalById = (id: string | null | undefined): Goal | undefined => {
  if (!id) return undefined;
  return GOAL_MAP.get(id);
};
