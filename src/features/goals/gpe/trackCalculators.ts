import { startOfDay, startOfWeek } from '@/utils/calendar';
import type {
  GoalTrackConfig,
  GoalTrackContribution,
  GoalTrackState,
  MoneyTrackConfig,
  TimeTrackConfig,
  MilestoneTrackConfig,
  StreakTrackConfig,
  TasksTrackConfig,
  PaceCadence,
} from './types';

const clamp01 = (value: number) => Math.max(0, Math.min(1, value));
const DAY_MS = 24 * 60 * 60 * 1000;
const MAX_CONTRIBUTIONS = 360;

const keepRecent = (entries: GoalTrackContribution[]): GoalTrackContribution[] => {
  if (entries.length <= MAX_CONTRIBUTIONS) {
    return entries;
  }
  return entries.slice(entries.length - MAX_CONTRIBUTIONS);
};

const sumValues = (entries: GoalTrackContribution[]) => entries.reduce((sum, entry) => sum + entry.value, 0);

const percentForTrack = (config: GoalTrackConfig, current: number) => {
  const range = (config.target ?? 0) - (config.baseline ?? 0);
  if (range <= 0) {
    return current >= config.target ? 1 : 0;
  }
  return clamp01((current - (config.baseline ?? 0)) / range);
};

const computeMilestoneState = (
  config: MilestoneTrackConfig,
  contributions: GoalTrackContribution[],
): GoalTrackState => {
  const normalized = keepRecent(contributions);
  const completedIds = new Set<string>();
  let totalWeight = config.baseline ?? 0;
  normalized.forEach((entry) => {
    totalWeight += entry.value;
    if (entry.refId && entry.value > 0) {
      completedIds.add(entry.refId);
    }
  });
  return {
    config,
    contributions: normalized,
    current: totalWeight,
    percent: percentForTrack(config, totalWeight),
    completedMilestones: Array.from(completedIds),
  };
};

const computeMoneyState = (
  config: MoneyTrackConfig,
  contributions: GoalTrackContribution[],
): GoalTrackState => {
  const normalized = keepRecent(contributions);
  const total = (config.baseline ?? 0) + sumValues(normalized);
  return {
    config,
    contributions: normalized,
    current: total,
    percent: percentForTrack(config, total),
  };
};

const computeTimeState = (
  config: TimeTrackConfig,
  contributions: GoalTrackContribution[],
): GoalTrackState => {
  const normalized = keepRecent(contributions);
  const total = (config.baseline ?? 0) + sumValues(normalized);
  return {
    config,
    contributions: normalized,
    current: total,
    percent: percentForTrack(config, total),
  };
};

const computeTasksState = (
  config: TasksTrackConfig,
  contributions: GoalTrackContribution[],
): GoalTrackState => {
  const normalized = keepRecent(contributions);
  const total = (config.baseline ?? 0) + sumValues(normalized);
  return {
    config,
    contributions: normalized,
    current: total,
    percent: percentForTrack(config, total),
  };
};

const calculateStreakMeta = (
  config: StreakTrackConfig,
  contributions: GoalTrackContribution[],
) => {
  const sorted = [...contributions].sort(
    (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime(),
  );
  const seenDays = new Set<string>();
  let current = 0;
  let best = 0;
  let graceUsed = 0;
  let lastCompletion: string | undefined;
  sorted.forEach((entry) => {
    const dayKey = entry.timestamp.split('T')[0] ?? entry.timestamp;
    if (seenDays.has(dayKey)) {
      return;
    }
    seenDays.add(dayKey);
    if (entry.value > 0) {
      current += 1;
      best = Math.max(best, current);
      lastCompletion = entry.timestamp;
      return;
    }
    if ((config.graceDays ?? 0) > graceUsed) {
      graceUsed += 1;
      return;
    }
    current = 0;
    graceUsed = 0;
  });
  return { current, best, graceUsed, lastCompletion };
};

const weekWindowStart = (now: Date) => startOfWeek(now);

const dayWindowStart = (now: Date) => startOfDay(now);

const computeStreakState = (
  config: StreakTrackConfig,
  contributions: GoalTrackContribution[],
  now: Date,
): GoalTrackState => {
  const normalized = keepRecent(contributions);
  const windowStart = config.cadence === 'weekly' ? weekWindowStart(now) : dayWindowStart(now);
  const currentValue = normalized
    .filter((entry) => new Date(entry.timestamp).getTime() >= windowStart.getTime())
    .reduce((sum, entry) => sum + entry.value, 0);
  const total = (config.baseline ?? 0) + currentValue;
  return {
    config,
    contributions: normalized,
    current: total,
    percent: percentForTrack(config, total),
    streak: calculateStreakMeta(config, normalized),
  };
};

export const calculateTrackState = (
  config: GoalTrackConfig,
  contributions: GoalTrackContribution[],
  now: Date,
): GoalTrackState => {
  switch (config.type) {
    case 'money':
      return computeMoneyState(config, contributions);
    case 'time':
      return computeTimeState(config, contributions);
    case 'milestone':
      return computeMilestoneState(config, contributions);
    case 'streak':
      return computeStreakState(config, contributions, now);
    case 'tasks':
      return computeTasksState(config, contributions);
    default:
      return {
        config,
        contributions,
        current: 0,
        percent: 0,
      };
  }
};

export const cadenceToDays = (cadence: PaceCadence): number => {
  if (cadence === 'daily') return 1;
  if (cadence === 'weekly') return 7;
  if (cadence === 'monthly') return 30;
  return 0;
};

export const seriesConfidence = (values: number[]): number => {
  if (!values.length) return 0.4;
  if (values.length === 1) return 0.6;
  const mean = values.reduce((sum, value) => sum + value, 0) / values.length;
  if (mean === 0) return 0.4;
  const variance = values.reduce((sum, value) => sum + (value - mean) ** 2, 0) / values.length;
  const stdDev = Math.sqrt(variance);
  const cov = stdDev / Math.abs(mean);
  return clamp01(1 - Math.min(cov, 1));
};
