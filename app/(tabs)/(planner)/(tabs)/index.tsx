// app/(tabs)/(planner)/(tabs)/index.tsx
import React, { useMemo, useCallback, useRef, useState } from 'react';
import {
  LayoutAnimation,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  UIManager,
  View,
  GestureResponderEvent,
} from 'react-native';
import { Swipeable } from 'react-native-gesture-handler';
import {
  CheckSquare,
  Square,
  Zap,
  AlarmClock,
  CalendarDays,
  Heart,
  Bell,
  ClipboardList,
  Trash2,
  Filter,
  Sun,
  SunMedium,
  Moon,
  RotateCcw,
  Pencil,
  ChevronDown,
} from 'lucide-react-native';

import { AdaptiveGlassView } from '@/components/ui/AdaptiveGlassView';
import { useAppTheme } from '@/constants/theme';
import { useLocalization } from '@/localization/useLocalization';
import type { AppTranslations } from '@/localization/strings';
import { useRouter } from 'expo-router';

import {
  PlannerTask,
  PlannerTaskSection,
  PlannerTaskStatus,
  usePlannerTasksStore,
} from '@/features/planner/useTasksStore';
import { useSelectedDayStore } from '@/stores/selectedDayStore';
import { usePlannerFocusBridge } from '@/features/planner/useFocusTaskBridge';
import { usePlannerHabitsStore } from '@/features/planner/useHabitsStore';
import { startOfDay } from '@/utils/calendar';
import { useModalStore } from '@/stores/useModalStore';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

// -----------------------------
// Helpers
// -----------------------------
const energyIcons = (n: 1 | 2 | 3, color: string) =>
  Array.from({ length: n }).map((_, i) => <Zap key={i} size={14} color={color} />);
const SWIPE_ACTIVATION_RATIO = 0.8;

const sectionMeta = (
  theme: ReturnType<typeof useAppTheme>,
  id: PlannerTaskSection,
  sectionLabels: AppTranslations['plannerScreens']['tasks']['sections'],
) => {
  const copy = sectionLabels[id];
  switch (id) {
    case 'morning':
      return { icon: <Sun size={14} color={theme.colors.textSecondary} />, title: copy.title, time: copy.time };
    case 'afternoon':
      return { icon: <SunMedium size={14} color={theme.colors.textSecondary} />, title: copy.title, time: copy.time };
    case 'evening':
      return { icon: <Moon size={14} color={theme.colors.textSecondary} />, title: copy.title, time: copy.time };
  }
};

const isTaskOverdue = (task: PlannerTask) => {
  if (!task.dueAt) return false;
  if (task.status === 'done' || task.status === 'moved') return false;
  return task.status === 'overdue' || task.dueAt < Date.now();
};

const stripeColor = (theme: ReturnType<typeof useAppTheme>, task: PlannerTask) => {
  if (task.status === 'done') return theme.colors.success;
  if (task.status === 'in_progress') return theme.colors.primary;
  if (task.status === 'moved') return theme.colors.warning ?? theme.colors.textSecondary;
  if (task.status === 'overdue' || isTaskOverdue(task)) return theme.colors.danger;
  return theme.colors.textTertiary;
};

const statusBadgeColors = (
  theme: ReturnType<typeof useAppTheme>,
  status: PlannerTaskStatus,
) => {
  switch (status) {
    case 'done':
      return { bg: `${theme.colors.success}1A`, text: theme.colors.success };
    case 'in_progress':
      return { bg: `${theme.colors.primary}1A`, text: theme.colors.primary };
    case 'moved':
      return { bg: `${(theme.colors.warning ?? theme.colors.textSecondary)}1A`, text: theme.colors.warning ?? theme.colors.textSecondary };
    case 'overdue':
      return { bg: `${theme.colors.danger}1A`, text: theme.colors.danger };
    default:
      return { bg: theme.colors.surfaceMuted, text: theme.colors.textSecondary };
  }
};

type TaskMenuLabels = {
  edit: string;
  archive: string;
  delete: string;
};

const durationToMinutes = (value?: string): number | undefined => {
  if (!value) return undefined;
  const normalized = value.toLowerCase();
  const minuteMatch = normalized.match(/(\d+)\s*(?:min|m)\b/);
  if (minuteMatch) {
    return Number(minuteMatch[1]);
  }
  const hourMatch = normalized.match(/(\d+)\s*(?:hour|h)\b/);
  if (hourMatch) {
    return Number(hourMatch[1]) * 60;
  }
  return undefined;
};

// -----------------------------
// Components
// -----------------------------
export default function PlannerTasksTab() {
  const theme = useAppTheme();
  const { strings, locale } = useLocalization();
  const tasksStrings = strings.plannerScreens.tasks;
  const taskMenuLabels = useMemo(
    () => ({
      edit: strings.plannerScreens.goals.cards.actions.edit,
      archive: tasksStrings.actions.remove,
      delete: tasksStrings.actions.delete,
    }),
    [strings.plannerScreens.goals.cards.actions.edit, tasksStrings.actions.delete, tasksStrings.actions.remove],
  );
  const router = useRouter();
  const startFocusForTask = usePlannerFocusBridge((state) => state.startFocusForTask);
  const habitEntities = usePlannerHabitsStore((state) => state.habits);
  const openPlannerTaskModal = useModalStore((state) => state.openPlannerTaskModal);
  const handleEditTask = useCallback(
    (task: PlannerTask) => {
      openPlannerTaskModal({ mode: 'edit', taskId: task.id });
    },
    [openPlannerTaskModal],
  );

  const tasks = usePlannerTasksStore((state) => state.tasks);
  const history = usePlannerTasksStore((state) => state.history);
  const toggleDone = usePlannerTasksStore((state) => state.toggleDone);
  const toggleExpand = usePlannerTasksStore((state) => state.toggleExpand);
  const deleteTask = usePlannerTasksStore((state) => state.deleteTask);
  const restoreTask = usePlannerTasksStore((state) => state.restoreTask);
  const removeFromHistory = usePlannerTasksStore((state) => state.removeFromHistory);

  const selectedDay = useSelectedDayStore((state) => state.selectedDate);
  const normalizedSelectedDay = useMemo(() => startOfDay(selectedDay ?? new Date()), [selectedDay]);
  const dayStart = normalizedSelectedDay.getTime();
  const dayEnd = dayStart + 24 * 60 * 60 * 1000;

  const tasksForDay = useMemo(() => {
    return tasks.filter((task) => {
      if (task.dueAt == null) return true;
      return task.dueAt >= dayStart && task.dueAt < dayEnd;
    });
  }, [dayEnd, dayStart, tasks]);

  const historyForDay = useMemo(() => {
    return history.filter((task) => {
      const reference = task.dueAt ?? task.deletedAt;
      if (!reference) return false;
      return reference >= dayStart && reference < dayEnd;
    });
  }, [dayEnd, dayStart, history]);

  const grouped = useMemo(() => {
    const base: Record<PlannerTaskSection, PlannerTask[]> = {
      morning: [],
      afternoon: [],
      evening: [],
    };
    tasksForDay.forEach((task) => {
      base[task.section].push(task);
    });
    return base;
  }, [tasksForDay]);

  const sortedHistory = useMemo(
    () =>
      [...historyForDay].sort(
        (a, b) => (b.deletedAt ?? 0) - (a.deletedAt ?? 0),
      ),
    [historyForDay],
  );

  const doneCount = (arr: PlannerTask[]) => arr.filter((t) => t.status === 'done').length;
  const dayOfWeek = normalizedSelectedDay.getDay();
  const habitsDueToday = useMemo(
    () => habitEntities.filter((habit) => habit.scheduleDays.includes(dayOfWeek)).length,
    [habitEntities, dayOfWeek],
  );
  const goalStepsToday = useMemo(() => {
    const goalIds = new Set<string>();
    tasksForDay.forEach((task) => {
      if (task.goalId) {
        goalIds.add(task.goalId);
      }
    });
    return goalIds.size;
  }, [tasksForDay]);

  const handleToggleDone = useCallback(
    (id: string) => {
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
      toggleDone(id);
    },
    [toggleDone],
  );

  const handleStartFocus = useCallback(
    (task: PlannerTask) => {
      const durationMinutes = durationToMinutes(task.duration);
      startFocusForTask(task.id, durationMinutes ? { durationMinutes } : undefined);
      router.push({ pathname: '/focus-mode', params: { taskId: task.id } });
    },
    [router, startFocusForTask],
  );
  const handleEditTask = useCallback(
    (task: PlannerTask) => {
      openPlannerTaskModal({ mode: 'edit', taskId: task.id });
    },
    [openPlannerTaskModal],
  );

  const handleToggleExpand = useCallback(
    (id: string) => {
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
      toggleExpand(id);
    },
    [toggleExpand],
  );

  const handleDelete = useCallback(
    (id: string) => {
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
      deleteTask(id);
    },
    [deleteTask],
  );

  const handleRestore = useCallback(
    (id: string) => {
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
      restoreTask(id);
    },
    [restoreTask],
  );

  const handleRemoveFromHistory = useCallback(
    (id: string) => {
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
      removeFromHistory(id);
    },
    [removeFromHistory],
  );

  const dateFormatter = useMemo(
    () =>
      new Intl.DateTimeFormat(locale, {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
      }),
    [locale],
  );

  const plansLabel = useMemo(() => {
    const today = startOfDay(new Date());
    if (normalizedSelectedDay.getTime() === today.getTime()) {
      return tasksStrings.todayLabel;
    }
    return dateFormatter.format(normalizedSelectedDay);
  }, [dateFormatter, normalizedSelectedDay, tasksStrings.todayLabel]);

  const plansTitle = useMemo(
    () => tasksStrings.headerTemplate.replace('{date}', plansLabel),
    [plansLabel, tasksStrings.headerTemplate],
  );
  const summaryLabel = useMemo(
    () =>
      tasksStrings.dailySummary
        .replace('{tasks}', String(tasksForDay.length))
        .replace('{habits}', String(habitsDueToday))
        .replace('{goals}', String(goalStepsToday)),
    [goalStepsToday, habitsDueToday, tasksForDay, tasksStrings.dailySummary],
  );

  return (
    <>
      <ScrollView
        style={[styles.container, { backgroundColor: theme.colors.background }]}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Top bar */}
        <View style={styles.topBar}>
          <Text style={[styles.topTitle, { color: theme.colors.textSecondary }]}>{plansTitle}</Text>
          <Pressable style={styles.filterBtn}>
            <Text style={[styles.filterText, { color: theme.colors.textSecondary }]}>{tasksStrings.filter}</Text>
            <Filter size={14} color={theme.colors.textSecondary} />
          </Pressable>
        </View>

        <View style={[styles.separator, { backgroundColor: theme.colors.border }]} />

        <View style={[styles.dailySummary, { backgroundColor: theme.colors.surface }]}>
          <Text style={[styles.dailySummaryText, { color: theme.colors.textPrimary }]}>{summaryLabel}</Text>
        </View>

        {/* Sections */}
        {grouped.morning.length > 0 && (
          <Section
            id="morning"
            items={grouped.morning}
            theme={theme}
            done={doneCount(grouped.morning)}
            total={grouped.morning.length}
            onToggleDone={handleToggleDone}
            onToggleExpand={handleToggleExpand}
            onDelete={handleDelete}
            onFocusTask={handleStartFocus}
            onEditTask={handleEditTask}
            menuLabels={taskMenuLabels}
            tasksStrings={tasksStrings}
          />
        )}

        {grouped.afternoon.length > 0 && (
          <Section
            id="afternoon"
            items={grouped.afternoon}
            theme={theme}
            done={doneCount(grouped.afternoon)}
            total={grouped.afternoon.length}
            onToggleDone={handleToggleDone}
            onToggleExpand={handleToggleExpand}
            onDelete={handleDelete}
            onFocusTask={handleStartFocus}
            onEditTask={handleEditTask}
            menuLabels={taskMenuLabels}
            tasksStrings={tasksStrings}
          />
        )}

        {grouped.evening.length > 0 && (
          <Section
            id="evening"
            items={grouped.evening}
            theme={theme}
            done={doneCount(grouped.evening)}
            total={grouped.evening.length}
            onToggleDone={handleToggleDone}
            onToggleExpand={handleToggleExpand}
            onDelete={handleDelete}
            onFocusTask={handleStartFocus}
            onEditTask={handleEditTask}
            menuLabels={taskMenuLabels}
            tasksStrings={tasksStrings}
          />
        )}

        {sortedHistory.length > 0 && (
          <HistorySection
            items={sortedHistory}
            theme={theme}
            onRestore={handleRestore}
            onRemove={handleRemoveFromHistory}
            menuLabels={taskMenuLabels}
            tasksStrings={tasksStrings}
            onEditTask={handleEditTask}
          />
        )}

        <View style={{ height: 100 }} />
      </ScrollView>
    </>
  );
}

// -----------------------------
// Section Component
// -----------------------------
function Section({
  id,
  items,
  theme,
  done,
  total,
  onToggleDone,
  onToggleExpand,
  onDelete,
  onFocusTask,
  onEditTask,
  menuLabels,
  tasksStrings,
}: {
  id: PlannerTaskSection;
  items: PlannerTask[];
  theme: ReturnType<typeof useAppTheme>;
  done: number;
  total: number;
  onToggleDone: (id: string) => void;
  onToggleExpand: (id: string) => void;
  onDelete: (id: string) => void;
  onFocusTask: (task: PlannerTask) => void;
  onEditTask: (task: PlannerTask) => void;
  menuLabels: TaskMenuLabels;
  tasksStrings: AppTranslations['plannerScreens']['tasks'];
}) {
  const meta = sectionMeta(theme, id, tasksStrings.sections);
  return (
    <>
      <View style={styles.sectionHeader}>
        <View style={styles.sectionLeft}>
          {meta.icon}
          <Text style={[styles.sectionTitle, { color: theme.colors.textSecondary }]}>{meta.title}</Text>
          <Text style={[styles.sectionTime, { color: theme.colors.textTertiary }]}>{meta.time}</Text>
        </View>
        <Text style={[styles.sectionCount, { color: theme.colors.textSecondary }]}>
          {done}/{total} {tasksStrings.sectionCountLabel}
        </Text>
      </View>
      <Text style={[styles.sectionTip, { color: theme.colors.textTertiary }]}>{tasksStrings.sectionTip}</Text>

      <View style={{ gap: 10 }}>
        {items.map((t) => (
          <TaskCard
            key={t.id}
            task={t}
            theme={theme}
            onToggleDone={() => onToggleDone(t.id)}
            onToggleExpand={() => onToggleExpand(t.id)}
            onDelete={() => onDelete(t.id)}
            onFocusTask={() => onFocusTask(t)}
            onEditTask={() => onEditTask(t)}
            menuLabels={menuLabels}
            tasksStrings={tasksStrings}
          />
        ))}
      </View>
    </>
  );
}

function TaskCard({
  task,
  theme,
  onToggleDone,
  onToggleExpand,
  onDelete,
  onRestore,
  mode = 'active',
  onFocusTask,
  onEditTask,
  menuLabels,
  tasksStrings,
}: {
  task: PlannerTask;
  theme: ReturnType<typeof useAppTheme>;
  onToggleDone: () => void;
  onToggleExpand: () => void;
  onDelete: () => void;
  onRestore?: () => void;
  mode?: 'active' | 'history';
  onFocusTask?: (task: PlannerTask) => void;
  onEditTask?: (task: PlannerTask) => void;
  menuLabels: TaskMenuLabels;
  tasksStrings: AppTranslations['plannerScreens']['tasks'];
}) {
  const swipeRef = useRef<Swipeable | null>(null);
  const isHistory = mode === 'history';
  const badgeColors = statusBadgeColors(theme, task.status);
  const statusLabel = tasksStrings.statuses[task.status];
  const canFocus = !isHistory && task.status !== 'done' && typeof onFocusTask === 'function';
  const focusLabel =
    task.status === 'in_progress' ? tasksStrings.focus.inProgress : tasksStrings.focus.cta;
  const checkboxDisabled = isHistory;
  const checkboxPress = checkboxDisabled ? undefined : onToggleDone;
  const deleteLabel = isHistory ? tasksStrings.actions.remove : menuLabels.delete;
  const editBg = theme.colors.warning ?? '#f59e0b';
  const deleteBg = theme.colors.danger ?? '#ef4444';
  const restoreBg = theme.colors.surface;

  const actionButtons = (
    [
      !isHistory && onEditTask
        ? {
            id: 'edit',
            label: menuLabels.edit,
            icon: <Pencil size={18} color="#fff" />,
            background: editBg,
            color: '#fff',
            onPress: () => onEditTask(task),
          }
        : null,
      isHistory && onRestore
        ? {
            id: 'restore',
            label: tasksStrings.actions.restore,
            icon: <RotateCcw size={18} color={theme.colors.textSecondary} />,
            background: restoreBg,
            color: theme.colors.textSecondary,
            onPress: onRestore,
          }
        : null,
      {
        id: 'delete',
        label: deleteLabel,
        icon: <Trash2 size={18} color="#fff" />,
        background: deleteBg,
        color: '#fff',
        onPress: onDelete,
      },
    ] as const
  ).filter(Boolean) as {
    id: string;
    label: string;
    icon: React.ReactNode;
    background: string;
    color: string;
    onPress: () => void;
  }[];
  const canSwipe = actionButtons.length > 0;
  const [swipeEnabled, setSwipeEnabled] = useState(true);
  const [isSwipeOpen, setIsSwipeOpen] = useState(false);
  const cardWidthRef = useRef(0);

  const handleContainerLayout = useCallback((event: { nativeEvent: { layout: { width: number } } }) => {
    cardWidthRef.current = event.nativeEvent.layout.width ?? 0;
  }, []);

  const handleTouchStart = useCallback(
    (event: GestureResponderEvent) => {
      if (isSwipeOpen) {
        setSwipeEnabled(true);
        return false;
      }
      const width = cardWidthRef.current;
      if (!width) {
        setSwipeEnabled(false);
        return false;
      }
      const startX = event.nativeEvent.locationX ?? 0;
      const allow = startX >= width * SWIPE_ACTIVATION_RATIO;
      setSwipeEnabled(allow);
      return false;
    },
    [isSwipeOpen],
  );

  const handleTouchEnd = useCallback(() => {
    if (!isSwipeOpen) {
      setSwipeEnabled(true);
    }
  }, [isSwipeOpen]);

  const handleActionPress = useCallback(
    (handler: () => void) => () => {
      swipeRef.current?.close();
      handler();
    },
    [],
  );

  const handleCardPress = useCallback(() => {
    swipeRef.current?.close();
    onToggleExpand();
  }, [onToggleExpand]);

  const handleCheckboxPress = useCallback(() => {
    swipeRef.current?.close();
    checkboxPress?.();
  }, [checkboxPress]);

  const handleFocusPress = useCallback(() => {
    swipeRef.current?.close();
    onFocusTask?.(task);
  }, [onFocusTask, task]);

  const handleChevronPress = useCallback(
    (event: GestureResponderEvent) => {
      event.stopPropagation();
      handleCardPress();
    },
    [handleCardPress],
  );

  return (
    <View
      onLayout={handleContainerLayout}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onTouchCancel={handleTouchEnd}
    >
      <Swipeable
        ref={swipeRef}
        enabled={(canSwipe && swipeEnabled) || isSwipeOpen}
        overshootRight={false}
        rightThreshold={80}
        onSwipeableOpen={() => {
          setIsSwipeOpen(true);
          setSwipeEnabled(true);
        }}
        onSwipeableClose={() => {
          setIsSwipeOpen(false);
          setSwipeEnabled(true);
        }}
        renderRightActions={
          canSwipe
            ? () => (
                <View style={styles.taskSwipeActions}>
                  {actionButtons.map((action) => (
                    <Pressable
                      key={action.id}
                      style={[styles.taskSwipeButton, { backgroundColor: action.background }]}
                      onPress={handleActionPress(action.onPress)}
                    >
                      {action.icon}
                      <Text style={[styles.taskSwipeLabel, { color: action.color }]}>{action.label}</Text>
                    </Pressable>
                  ))}
                </View>
              )
            : undefined
        }
      >
      <AdaptiveGlassView
        style={[
          styles.card,
          {
            backgroundColor: theme.colors.card,
            borderColor: theme.colors.border,
            shadowOpacity: 0,
          },
        ]}
      >
        <Pressable style={styles.cardPress} onPress={handleCardPress}>
              {isHistory && task.deletedAt && (
                <View style={[styles.historyBadge, { borderColor: theme.colors.danger }]}>
                  <Text style={[styles.historyBadgeText, { color: theme.colors.danger }]}>
                    {tasksStrings.history.deletedBadge}
                  </Text>
                </View>
              )}

              <View
                style={[
                  styles.stripe,
                  { backgroundColor: stripeColor(theme, task) },
                ]}
              />

              <Pressable
                onPress={handleCheckboxPress}
                disabled={!checkboxPress}
                style={styles.checkboxWrap}
              >
                {task.status === 'done' ? (
                  <CheckSquare size={16} color={theme.colors.success} />
                ) : task.deletedAt ? (
                  <Trash2 size={16} color={theme.colors.danger} />
                ) : (
                  <Square size={16} color={theme.colors.textSecondary} />
                )}
              </Pressable>

              <View style={styles.metaRow}>
                <AlarmClock size={14} color={theme.colors.textSecondary} />
                <Text style={[styles.metaText, { color: theme.colors.textSecondary }]}>{task.start}</Text>
                <Text style={[styles.metaDot, { color: theme.colors.textSecondary }]}>•</Text>
                <Text style={[styles.metaText, { color: theme.colors.textSecondary }]}>{task.duration}</Text>
                <Text style={[styles.metaDot, { color: theme.colors.textSecondary }]}>•</Text>
                <Text style={[styles.metaText, { color: theme.colors.textSecondary }]}>{task.context}</Text>

                <View style={{ flex: 1 }} />
                <View style={styles.energyRow}>{energyIcons(task.energy, theme.colors.textSecondary)}</View>
                {!isHistory && (
                  <Pressable hitSlop={10} onPress={handleChevronPress}>
                    <ChevronDown
                      size={16}
                      color={theme.colors.textSecondary}
                      style={{ transform: [{ rotate: task.expanded ? '180deg' : '0deg' }] }}
                    />
                  </Pressable>
                )}
              </View>

              <View style={styles.statusRow}>
                <View style={[styles.statusPill, { backgroundColor: badgeColors.bg }]}>
                  <Text style={[styles.statusPillText, { color: badgeColors.text }]}>{statusLabel}</Text>
                </View>
                {!isHistory && canFocus && (
                  <Pressable
                    onPress={handleFocusPress}
                    style={[styles.focusButton, { borderColor: theme.colors.border }]}
                  >
                    <Zap size={12} color={theme.colors.textSecondary} />
                    <Text style={[styles.focusButtonText, { color: theme.colors.textSecondary }]}>
                      {focusLabel}
                    </Text>
                  </Pressable>
                )}
              </View>

              <View style={styles.titleRow}>
                <Text
                  numberOfLines={1}
                  style={[
                    styles.title,
                    {
                      color: theme.colors.white,
                      textDecorationLine: task.status === 'done' ? 'line-through' : 'none',
                      opacity: task.status === 'done' ? 0.6 : 1,
                    },
                  ]}
                >
                  {task.title}
                </Text>

                {task.projectHeart && <Heart size={16} color={theme.colors.textSecondary} />}

                <Text style={[styles.timeRight, { color: theme.colors.textSecondary }]}>
                  {task.afterWork ? '' : task.costUZS ?? ''}
                </Text>
              </View>

              {task.expanded && !isHistory && (
                <View style={styles.expandArea}>
                  {task.desc ? (
                    <Text style={[styles.desc, { color: theme.colors.textSecondary }]} numberOfLines={3}>
                      {task.desc}
                    </Text>
                  ) : null}

                  <View style={styles.iconBar}>
                    <Bell size={16} color={theme.colors.textSecondary} />
                    <ClipboardList size={16} color={theme.colors.textSecondary} />
                    <Heart size={16} color={theme.colors.textSecondary} />
                    <CalendarDays size={16} color={theme.colors.textSecondary} />
                    <Trash2 size={16} color={theme.colors.textSecondary} />
                  </View>
                </View>
              )}

              {task.aiNote && !isHistory && (
                <View style={styles.aiRow}>
                  <SunMedium size={14} color={theme.colors.textSecondary} />
                  <Text numberOfLines={1} style={[styles.aiText, { color: theme.colors.textSecondary }]}>
                    {tasksStrings.aiPrefix} {task.aiNote}
                  </Text>
                </View>
              )}
        </Pressable>
      </AdaptiveGlassView>
    </Swipeable>
  </View>
  );
}
function HistorySection({
  items,
  theme,
  onRestore,
  onRemove,
  menuLabels,
  tasksStrings,
  onEditTask,
}: {
  items: PlannerTask[];
  theme: ReturnType<typeof useAppTheme>;
  onRestore: (id: string) => void;
  onRemove: (id: string) => void;
  menuLabels: TaskMenuLabels;
  tasksStrings: AppTranslations['plannerScreens']['tasks'];
  onEditTask: (task: PlannerTask) => void;
}) {
  return (
    <>
      <View style={styles.historyHeader}>
        <Text style={[styles.historyLabel, { color: theme.colors.textSecondary }]}>
          {tasksStrings.history.title}
        </Text>
        <Text style={[styles.historyHint, { color: theme.colors.textTertiary }]}>{tasksStrings.history.subtitle}</Text>
      </View>
      <Text style={[styles.sectionTip, { color: theme.colors.textTertiary }]}>{tasksStrings.history.tip}</Text>

      <View style={{ gap: 10 }}>
        {items.map((task) => (
          <TaskCard
            key={task.id}
            task={task}
            theme={theme}
            onToggleDone={() => {}}
            onToggleExpand={() => {}}
            onDelete={() => onRemove(task.id)}
            onRestore={() => onRestore(task.id)}
            mode="history"
            menuLabels={menuLabels}
            tasksStrings={tasksStrings}
            onEditTask={() => onEditTask(task)}
          />
        ))}
      </View>
    </>
  );
}

// -----------------------------
// Styles
// -----------------------------
const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { paddingHorizontal: 12, paddingBottom: 40, gap: 16 },

  topBar: {
    paddingTop: 10,
    paddingHorizontal: 4,
    paddingBottom: 6,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  topTitle: { fontSize: 14, fontWeight: '600', letterSpacing: 0.4 },
  filterBtn: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  filterText: { fontSize: 13, fontWeight: '600' },
  separator: { height: StyleSheet.hairlineWidth, opacity: 0.5 },
  dailySummary: {
    marginHorizontal: 4,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 14,
  },
  dailySummaryText: {
    fontSize: 13,
    fontWeight: '600',
  },

  sectionHeader: {
    paddingTop: 8,
    paddingBottom: 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sectionTip: {
    paddingLeft: 4,
    paddingBottom: 4,
    fontSize: 11,
    fontWeight: '500',
    opacity: 0.75,
  },
  sectionLeft: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  sectionTitle: { fontSize: 14, fontWeight: '700', letterSpacing: 0.3 },
  sectionTime: { fontSize: 12 },
  sectionCount: { fontSize: 12, fontWeight: '600' },
  historyHeader: {
    paddingTop: 18,
    paddingBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  historyLabel: { fontSize: 14, fontWeight: '700', letterSpacing: 0.3 },
  historyHint: { fontSize: 12, fontWeight: '500' },

  card: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 10,
    overflow: 'hidden',
  },
  cardPress: { padding: 6, position: 'relative' },
  historyBadge: {
    position: 'absolute',
    top: 30,
    right: 12,
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 4,
    backgroundColor: 'rgba(239,68,68,0.08)',
  },
  historyBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.4,
  },
  stripe: {
    position: 'absolute',
    left: 6,
    top: 8,
    bottom: 8,
    width: 6,
    borderRadius: 4,
  },
  checkboxWrap: {
    position: 'absolute',
    left: 18,
    top: 12,
  },

  metaRow: {
    paddingLeft: 38,
    paddingRight: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 6,
  },
  metaText: { fontSize: 12, fontWeight: '600' },
  metaDot: { fontSize: 12, opacity: 0.8 },

  energyRow: { flexDirection: 'row', gap: 4, marginRight: 8 },

  titleRow: {
    paddingLeft: 38,
    paddingRight: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 2,
  },
  title: { fontSize: 15, fontWeight: '700' },
  timeRight: { marginLeft: 'auto', fontSize: 12, fontWeight: '700' },
  statusRow: {
    paddingLeft: 38,
    paddingRight: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 6,
  },
  statusPill: {
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  statusPillText: {
    fontSize: 12,
    fontWeight: '600',
  },
  focusButton: {
    marginLeft: 'auto',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: StyleSheet.hairlineWidth,
  },
  focusButtonText: {
    fontSize: 12,
    fontWeight: '600',
  },

  expandArea: {
    paddingLeft: 38,
    paddingRight: 8,
    marginTop: 8,
    gap: 8,
  },
  desc: { fontSize: 12, lineHeight: 18 },
  iconBar: { flexDirection: 'row', gap: 12 },

  aiRow: { paddingLeft: 38, paddingRight: 8, marginTop: 6, flexDirection: 'row', alignItems: 'center', gap: 6 },
  aiText: { fontSize: 12 },
  taskSwipeActions: {
    flexDirection: 'row',
    alignItems: 'stretch',
    height: '100%',
  },
  taskSwipeButton: {
    width: 88,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 12,
  },
  taskSwipeLabel: {
    fontSize: 11,
    fontWeight: '700',
    textAlign: 'center',
  },

  fab: {
    position: 'absolute',
    right: 18,
    bottom: 24,
    width: 54,
    height: 54,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 6,
  },
});
