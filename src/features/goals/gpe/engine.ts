import { DEFAULT_GOAL_DEFINITIONS } from './initialGoals';
import type {
  GoalDefinition,
  GoalProgressEvent,
  GoalProgressRecord,
  GoalProgressSnapshot,
  GoalTrackConfig,
  GoalTrackContribution,
  GoalTrackState,
  GoalWidgetItem,
  GoalStatus,
  MoneyTrackConfig,
  ManualUpdateEvent,
} from './types';
import {
  calculateTrackState,
  cadenceToDays,
  seriesConfidence,
} from './trackCalculators';
import {
  useGoalProgressEngineStore,
  getGoalDefinition,
  getGoalRecord,
  getGoalTrackContributions,
} from '@/stores/useGoalProgressEngineStore';
import { toISODateKey, startOfDay } from '@/utils/calendar';
import { useFinancePreferencesStore } from '@/stores/useFinancePreferencesStore';
import type { PlannerGoalId } from '@/types/planner';
import { publishGoalSnapshotToInsights } from './insightsBridge';
import { updateGoalsWidgetProjection } from './homeBridge';

const DAY_MS = 24 * 60 * 60 * 1000;
const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

const DEFAULT_GOAL_SEEDS: { goalId: PlannerGoalId; value: number }[] = [
  { goalId: 'dream-car', value: 4_100_000 },
  { goalId: 'emergency-fund', value: 3_500_000 },
  { goalId: 'fitness', value: 92 },
  { goalId: 'language', value: 34 },
];

let initialized = false;

export const ensureGoalProgressEngine = () => {
  if (initialized) return;
  initialized = true;
  DEFAULT_GOAL_DEFINITIONS.forEach((goal) => {
    registerGoalDefinition(goal);
    updateGoalProgress(goal.id);
  });
  DEFAULT_GOAL_SEEDS.forEach((seed) => {
    ingestGoalEvent({
      type: 'manual_update',
      goalId: seed.goalId,
      timestamp: new Date().toISOString(),
      value: seed.value,
    });
  });
};

export const registerGoalDefinition = (definition: GoalDefinition) => {
  useGoalProgressEngineStore.getState().registerGoal(definition);
};

const selectTrack = (definition: GoalDefinition, type: GoalTrackConfig['type'], trackId?: string) => {
  if (trackId) {
    return definition.tracks.find((track) => track.id === trackId);
  }
  return definition.tracks.find((track) => track.type === type);
};

const appendContribution = (
  goalId: PlannerGoalId,
  track: GoalTrackConfig,
  contribution: GoalTrackContribution,
) => {
  const prev = getGoalTrackContributions(goalId, track.id);
  const next = [...prev, contribution];
  useGoalProgressEngineStore.getState().upsertTrackContributions(goalId, track.id, next);
};

const convertAmount = (amount: number, from?: string, to?: string) => {
  if (!from || !to || from === to) {
    return amount;
  }
  const { convertAmount: convert } = useFinancePreferencesStore.getState();
  return convert(amount, from as any, to as any);
};

const handleFinanceEvent = (definition: GoalDefinition, event: GoalProgressEvent) => {
  if (event.type !== 'finance_transaction') return false;
  const track = selectTrack(definition, 'money', event.trackId) as MoneyTrackConfig | undefined;
  if (!track) return false;
  const currency = track.currency ?? definition.currency ?? event.currency;
  const normalized = convertAmount(
    event.amount * (event.direction === 'outflow' ? -1 : 1),
    event.currency,
    currency,
  );
  appendContribution(event.goalId, track, {
    timestamp: event.timestamp,
    value: normalized,
    source: event.type,
    refId: event.sourceId,
  });
  return true;
};

const handleTaskEvent = (definition: GoalDefinition, event: GoalProgressEvent) => {
  if (event.type !== 'task_completed') return false;
  const updatedTracks: GoalTrackConfig[] = [];
  definition.tracks.forEach((track) => {
    if (track.type === 'tasks') {
      const delta = track.scope === 'duration' ? event.durationMinutes ?? 0 : 1;
      appendContribution(event.goalId, track, {
        timestamp: event.timestamp,
        value: delta,
        source: event.type,
        refId: event.taskId,
      });
      updatedTracks.push(track);
    }
    if (track.type === 'milestone' && event.milestoneId) {
      const milestone = track.milestones.find((item) => item.id === event.milestoneId);
      if (milestone) {
        appendContribution(event.goalId, track, {
          timestamp: event.timestamp,
          value: milestone.weight ?? 1,
          source: event.type,
          refId: event.milestoneId,
        });
        updatedTracks.push(track);
      }
    }
  });
  return updatedTracks.length > 0;
};

const handleHabitEvent = (definition: GoalDefinition, event: GoalProgressEvent) => {
  if (event.type !== 'habit_marked') return false;
  let handled = false;
  definition.tracks.forEach((track) => {
    if (track.type === 'streak') {
      appendContribution(event.goalId, track, {
        timestamp: event.timestamp,
        value: event.completed ? 1 : 0,
        source: event.type,
        refId: event.habitId,
      });
      handled = true;
    }
    if (track.type === 'time' && event.minutes) {
      appendContribution(event.goalId, track, {
        timestamp: event.timestamp,
        value: event.minutes,
        source: event.type,
        refId: event.habitId,
      });
      handled = true;
    }
  });
  return handled;
};

const handleFocusEvent = (definition: GoalDefinition, event: GoalProgressEvent) => {
  if (event.type !== 'focus_session') return false;
  const track = selectTrack(definition, 'time', event.trackId);
  if (!track) return false;
  appendContribution(event.goalId, track, {
    timestamp: event.timestamp,
    value: event.minutes,
    source: event.type,
    refId: event.sessionId,
  });
  return true;
};

const handleManualEvent = (definition: GoalDefinition, event: ManualUpdateEvent) => {
  const targetTrack = definition.tracks.find((track) => track.id === event.trackId) ?? definition.tracks[0];
  if (!targetTrack) {
    return false;
  }
  const prevState = calculateTrackState(targetTrack, getGoalTrackContributions(event.goalId, targetTrack.id), new Date(event.timestamp));
  const delta = event.value - prevState.current;
  appendContribution(event.goalId, targetTrack, {
    timestamp: event.timestamp,
    value: delta,
    source: event.type,
    refId: event.sourceId,
    note: event.note,
  });
  return true;
};

const aggregateTracks = (definition: GoalDefinition, now: Date) => {
  const trackStates: Record<string, GoalTrackState> = {};
  definition.tracks.forEach((track) => {
    const contributions = getGoalTrackContributions(definition.id, track.id);
    trackStates[track.id] = calculateTrackState(track, contributions, now);
  });
  return trackStates;
};

const buildSeries = (contributions: GoalTrackContribution[], cadence: GoalDefinition['cadence']) => {
  if (!cadence || cadence === 'none') {
    return [];
  }
  const bucketDays = cadenceToDays(cadence) || 7;
  if (!contributions.length) return [];
  const buckets = new Map<string, number>();
  contributions.forEach((entry) => {
    const timestamp = new Date(entry.timestamp).getTime();
    const bucketKey = startOfDay(new Date(Math.floor(timestamp / DAY_MS) * DAY_MS)).toISOString();
    const value = buckets.get(bucketKey) ?? 0;
    buckets.set(bucketKey, value + entry.value);
  });
  return Array.from(buckets.entries())
    .sort((a, b) => new Date(a[0]).getTime() - new Date(b[0]).getTime())
    .slice(-bucketDays)
    .map(([, value]) => value);
};

const computePaceActual = (
  contributions: GoalTrackContribution[] | undefined,
  cadence: GoalDefinition['cadence'],
  windowDays: number,
) => {
  if (!contributions || cadence === 'none') return null;
  const now = Date.now();
  const windowStart = now - windowDays * DAY_MS;
  const windowValues = contributions.filter((entry) => new Date(entry.timestamp).getTime() >= windowStart);
  if (!windowValues.length) return 0;
  const total = windowValues.reduce((sum, entry) => sum + entry.value, 0);
  const cadenceDays = cadenceToDays(cadence) || windowDays;
  const pace = (total / windowDays) * cadenceDays;
  return pace;
};

const computePaceRequired = (definition: GoalDefinition, current: number, now: Date) => {
  if (!definition.deadline || definition.cadence === 'none') return null;
  const deadline = new Date(definition.deadline);
  if (deadline.getTime() <= now.getTime()) return null;
  const remaining = Math.max(0, definition.target - current);
  const cadenceDays = cadenceToDays(definition.cadence ?? 'monthly') || 30;
  const periodsRemaining = Math.max(remaining > 0 ? (deadline.getTime() - now.getTime()) / (cadenceDays * DAY_MS) : 0, 0.1);
  if (periodsRemaining === 0) {
    return null;
  }
  return remaining / periodsRemaining;
};

const computeEtaDate = (
  remaining: number,
  cadence: GoalDefinition['cadence'],
  paceActual: number | null,
  deadline?: string,
) => {
  if (!paceActual || paceActual <= 0 || !cadence || cadence === 'none') {
    return deadline;
  }
  const cadenceDays = cadenceToDays(cadence) || 30;
  const periods = remaining / paceActual;
  if (periods <= 0) return deadline;
  const eta = new Date(Date.now() + periods * cadenceDays * DAY_MS);
  return eta.toISOString();
};

const resolveStatus = (
  percent: number,
  paceRequired: number | null,
  paceActual: number | null,
): GoalStatus => {
  if (paceRequired == null || paceActual == null) {
    if (percent >= 0.85) return 'on_track';
    if (percent >= 0.65) return 'at_risk';
    return 'behind';
  }
  if (paceActual <= 0) return 'behind';
  const ratio = paceActual / Math.max(paceRequired, 0.0001);
  if (ratio >= 0.95) return 'on_track';
  if (ratio >= 0.6) return 'at_risk';
  return 'behind';
};

const buildSnapshot = (record: GoalProgressRecord): GoalProgressSnapshot => ({
  goalId: record.goalId,
  date: toISODateKey(new Date()),
  currentValue: record.current,
  percentComplete: record.percent,
  onTrack: record.status === 'on_track',
  paceActual: record.paceActual,
  paceRequired: record.paceRequired,
  etaDate: record.etaDate,
  status: record.status,
  confidence: record.confidence,
});

export const updateGoalProgress = (goalId: PlannerGoalId): GoalProgressRecord | null => {
  const definition = getGoalDefinition(goalId);
  if (!definition) {
    return null;
  }
  const now = new Date();
  const tracks = aggregateTracks(definition, now);
  const primaryTrack = definition.tracks[0] ? tracks[definition.tracks[0].id] : undefined;
  const current = primaryTrack?.current ?? definition.baseline;
  const totalWeight = definition.tracks.reduce((sum, track) => sum + (track.weight ?? 1), 0) || 1;
  const percent = definition.tracks.reduce((sum, track) => {
    const state = tracks[track.id];
    return sum + (state?.percent ?? 0) * (track.weight ?? 1);
  }, 0) / totalWeight;
  const remaining = Math.max(0, definition.target - current);
  const cadence = definition.cadence ?? 'monthly';
  const paceActual = computePaceActual(primaryTrack?.contributions, cadence, definition.pacingWindowDays ?? 30);
  const paceRequired = computePaceRequired(definition, current, now);
  const etaDate = computeEtaDate(remaining, cadence, paceActual, definition.deadline);
  const series = buildSeries(primaryTrack?.contributions ?? [], cadence);
  const confidence = seriesConfidence(series);
  const status = resolveStatus(percent, paceRequired, paceActual);

  const record: GoalProgressRecord = {
    goalId,
    definition,
    tracks,
    percent: clamp(percent, 0, 1),
    current,
    remaining,
    paceActual,
    paceRequired,
    paceCadence: cadence,
    etaDate,
    status,
    confidence,
    updatedAt: new Date().toISOString(),
  };

  useGoalProgressEngineStore.getState().persistRecord(record);

  const snapshot = buildSnapshot(record);
  useGoalProgressEngineStore.getState().appendSnapshot(snapshot);
  publishGoalSnapshotToInsights(snapshot);
  updateGoalsWidgetProjection(snapshot);
  return record;
};

export const ingestGoalEvent = (event: GoalProgressEvent): GoalProgressRecord | null => {
  ensureGoalProgressEngine();
  const definition = getGoalDefinition(event.goalId);
  if (!definition) {
    return null;
  }
  let handled = false;
  handled = handleFinanceEvent(definition, event) || handled;
  handled = handleTaskEvent(definition, event) || handled;
  handled = handleHabitEvent(definition, event) || handled;
  handled = handleFocusEvent(definition, event) || handled;
  if (event.type === 'manual_update') {
    handled = handleManualEvent(definition, event) || handled;
  }

  if (!handled) {
    return getGoalRecord(event.goalId) ?? null;
  }

  useGoalProgressEngineStore.getState().appendEvent(event);
  return updateGoalProgress(event.goalId);
};

export const getGoalWidgetItems = (limit = 3): GoalWidgetItem[] => {
  ensureGoalProgressEngine();
  const records = Object.values(useGoalProgressEngineStore.getState().progress);
  if (!records.length) {
    return [];
  }
  return records
    .sort((a, b) => (b.percent - a.percent) || a.remaining - b.remaining)
    .slice(0, limit)
    .map((record) => ({
      id: record.goalId,
      title: record.definition.title,
      progress: Math.round(record.percent * 100),
      current: record.current,
      target: record.definition.target,
      unit: record.definition.unit,
      category: record.definition.category,
      status: record.status,
      etaLabel: record.etaDate,
      paceActual: record.paceActual,
      paceRequired: record.paceRequired,
    }));
};
