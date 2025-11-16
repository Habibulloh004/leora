import type { AppTranslations } from '@/localization/strings';
import type { Goal, GoalHistoryEntry } from './data';
import type { PlannerGoalEntity } from '@/features/planner/useGoalsStore';
import type { GoalSummaryKey } from '@/types/planner';
import { getGoalRecord } from '@/stores/useGoalProgressEngineStore';
import { useFinancePreferencesStore } from '@/stores/useFinancePreferencesStore';
import type { GoalProgressRecord } from '@/features/goals/gpe/types';

const SUMMARY_ORDER: GoalSummaryKey[] = ['left', 'pace', 'prediction'];

const STATUS_LABELS: Record<GoalProgressRecord['status'], string> = {
  on_track: 'On track',
  at_risk: 'At risk',
  behind: 'Behind',
};

const CADENCE_SUFFIX: Record<Required<GoalProgressRecord>['paceCadence'], string> = {
  daily: '/day',
  weekly: '/wk',
  monthly: '/mo',
  none: '',
};

const formatNumber = (value: number, locale: string, fractionDigits = 0) =>
  new Intl.NumberFormat(locale, { maximumFractionDigits: fractionDigits, minimumFractionDigits: 0 }).format(value);

const formatValue = (record: GoalProgressRecord, value: number, locale: string) => {
  if (record.definition.currency) {
    const { formatCurrency } = useFinancePreferencesStore.getState();
    return formatCurrency(value, {
      toCurrency: record.definition.currency,
      maximumFractionDigits: value >= 1000 ? 0 : 1,
    });
  }
  const unit = record.definition.unit ?? '';
  const digits = value >= 100 ? 0 : 1;
  return `${formatNumber(value, locale, digits)}${unit ? ` ${unit}` : ''}`.trim();
};

const formatSummary = (
  record: GoalProgressRecord,
  strings: AppTranslations['plannerScreens']['goals'],
  locale: string,
  fallback: Record<GoalSummaryKey, string>,
): Goal['summary'] => {
  const paceSuffix = CADENCE_SUFFIX[record.paceCadence ?? 'monthly'];
  const etaLabel = record.etaDate
    ? new Intl.DateTimeFormat(locale, { month: 'short', year: 'numeric' }).format(new Date(record.etaDate))
    : '—';
  const summaryValues: Record<GoalSummaryKey, string> = {
    left: `${formatValue(record, record.remaining, locale)} left`,
    pace:
      record.paceActual != null
        ? `${formatValue(record, Math.max(record.paceActual, 0), locale)} ${paceSuffix}`.trim()
        : fallback.pace,
    prediction: `${STATUS_LABELS[record.status]} · ${etaLabel}`,
  };
  return SUMMARY_ORDER.map((key) => ({
    label: strings.cards.summaryLabels[key],
    value: summaryValues[key] ?? fallback[key],
  }));
};

export const buildGoalViewModel = (
  entity: PlannerGoalEntity,
  strings: AppTranslations['plannerScreens']['goals'],
  locale: string,
): Goal => {
  const localized = entity.contentKey ? strings.data[entity.contentKey] : undefined;
  const record = getGoalRecord(entity.id);
  const historySource: GoalHistoryEntry[] = entity.historyOverrides ?? localized?.history ?? [];
  const milestonesSource = entity.milestoneLabels ?? localized?.milestones ?? ['25%', '50%', '75%', '100%'];
  const summaryOverrides = entity.summaryOverrides
    ? { ...(localized?.summary ?? {}), ...entity.summaryOverrides }
    : localized?.summary;
  const summaryFallback = summaryOverrides ?? {
    left: '—',
    pace: '—',
    prediction: '—',
  };
  const progress = record?.percent ?? entity.progress ?? 0;
  const currentAmount = record
    ? formatValue(record, record.current, locale)
    : entity.currentAmount ?? localized?.currentAmount ?? '';
  const targetAmount = record
    ? formatValue(record, record.definition.target, locale)
    : entity.targetAmount ?? localized?.targetAmount ?? '';

  return {
    id: entity.id,
    title: entity.customTitle ?? localized?.title ?? entity.id,
    progress,
    currentAmount,
    targetAmount,
    summary: record ? formatSummary(record, strings, locale, summaryFallback) : SUMMARY_ORDER.map((key) => ({
      label: strings.cards.summaryLabels[key],
      value: summaryFallback[key],
    })),
    milestones: milestonesSource.map((label, index) => ({
      percent: (index + 1) * 25,
      label,
    })),
    history: historySource.map((entry, index) => ({
      ...entry,
      id: `${entity.id}-history-${index}`,
    })),
    aiTip: entity.aiTipOverride ?? localized?.aiTip ?? '',
    aiTipHighlight: entity.aiTipHighlightOverride ?? localized?.aiTipHighlight,
  };
};
