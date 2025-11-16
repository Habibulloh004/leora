import { useCallback, useEffect, useMemo, useState } from 'react';

import type { WidgetType } from '@/config/widgetConfig';
import { HOME_DASHBOARD_DATA } from '@/data/homeDashboardData';
import type { CalendarIndicatorsMap, HomeDataStatus, ProgressData } from '@/types/home';
import { startOfDay, toISODateKey } from '@/utils/calendar';
import { buildGoalsWidgetState } from '@/features/goals/gpe/homeBridge';
import { ensureGoalProgressEngine } from '@/features/goals/gpe/engine';

ensureGoalProgressEngine();

type WidgetDailyState = {
  hasData: boolean;
  props?: Record<string, unknown>;
};

interface UseHomeDashboardResult {
  selectedDate: Date;
  selectDate: (date: Date) => void;
  progress: ProgressData | null;
  widgetData: Partial<Record<WidgetType, WidgetDailyState>>;
  loading: boolean;
  refreshing: boolean;
  calendarIndicators: CalendarIndicatorsMap;
  refresh: () => void;
}

const METRICS_ORDER: (keyof ProgressData)[] = ['tasks', 'budget', 'focus'];

const mapValueToStatus = (value?: number | null): HomeDataStatus => {
  if (value == null) return 'muted';
  if (value >= 70) return 'success';
  if (value >= 40) return 'warning';
  return 'danger';
};

const buildIndicators = (progress: ProgressData | null | undefined): HomeDataStatus[] => {
  return METRICS_ORDER.map((key) => mapValueToStatus(progress?.[key]));
};

export function useHomeDashboard(initialDate?: Date): UseHomeDashboardResult {
  const [selectedDate, setSelectedDate] = useState<Date>(() => startOfDay(initialDate ?? new Date()));
  const [progress, setProgress] = useState<ProgressData | null>(null);
  const [widgetData, setWidgetData] = useState<Partial<Record<WidgetType, WidgetDailyState>>>({});
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [reloadToken, setReloadToken] = useState(0);

  const calendarIndicators = useMemo<CalendarIndicatorsMap>(() => {
    const entries: CalendarIndicatorsMap = {};
    Object.entries(HOME_DASHBOARD_DATA).forEach(([dateKey, snapshot]) => {
      entries[dateKey] = buildIndicators(snapshot?.progress);
    });
    return entries;
  }, []);

  const runFetch = useCallback((target: Date) => {
    const isoKey = toISODateKey(target);
    const snapshot = HOME_DASHBOARD_DATA[isoKey];
    const goalsBridge = buildGoalsWidgetState();

    setProgress(snapshot?.progress ?? null);
    setWidgetData({
      ...snapshot?.widgets,
      goals: { hasData: goalsBridge.hasData, props: { goals: goalsBridge.goals } },
    });
  }, []);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setProgress(null);
    setWidgetData({});

    const timer = setTimeout(() => {
      if (cancelled) {
        return;
      }
      runFetch(selectedDate);
      setLoading(false);
      setRefreshing(false);
    }, 280);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [reloadToken, runFetch, selectedDate]);

  const selectDate = useCallback((date: Date) => {
    const normalized = startOfDay(date);
    setRefreshing(true);
    setSelectedDate(normalized);
  }, []);

  const refresh = useCallback(() => {
    setRefreshing(true);
    setReloadToken((prev) => prev + 1);
  }, []);

  return {
    selectedDate,
    selectDate,
    progress,
    widgetData,
    loading,
    refreshing,
    calendarIndicators,
    refresh,
  };
}
