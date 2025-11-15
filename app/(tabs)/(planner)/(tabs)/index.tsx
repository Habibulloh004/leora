// app/(tabs)/(planner)/(tabs)/index.tsx
import React, { useMemo, useRef, useCallback } from 'react';
import {
  Dimensions,
  LayoutAnimation,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  UIManager,
  View,
} from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  Extrapolate,
  interpolate,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
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
  MoreHorizontal,
  RotateCcw,
} from 'lucide-react-native';

import { AdaptiveGlassView } from '@/components/ui/AdaptiveGlassView';
import { useAppTheme } from '@/constants/theme';
import { useLocalization } from '@/localization/useLocalization';
import type { AppTranslations } from '@/localization/strings';
import AddTaskSheet, {
  AddTaskSheetHandle,
  AddTaskPayload,
} from '@/components/modals/planner/AddTaskSheet';
import {
  PlannerTask,
  PlannerTaskSection,
  usePlannerTasksStore,
} from '@/features/planner/useTasksStore';
import { useSelectedDayStore } from '@/stores/selectedDayStore';
import { startOfDay } from '@/utils/calendar';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const SWIPE_TRIGGER = SCREEN_WIDTH * 0.24;
const MAX_SWIPE_DISTANCE = SCREEN_WIDTH * 0.85;

// -----------------------------
// Helpers
// -----------------------------
const energyIcons = (n: 1 | 2 | 3, color: string) =>
  Array.from({ length: n }).map((_, i) => <Zap key={i} size={14} color={color} />);

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

const computeDueAtFromPayload = (payload: AddTaskPayload): number | null => {
  try {
    const now = new Date();
    let date = new Date(now);

    if (payload.dateMode === 'tomorrow') {
      date.setDate(date.getDate() + 1);
    } else if (payload.dateMode === 'pick' && payload.date) {
      const parsed = new Date(payload.date);
      if (!Number.isNaN(parsed.getTime())) {
        date = parsed;
      }
    }

    if (payload.time) {
      const [hours, minutes] = payload.time.split(':').map(Number);
      if (!Number.isNaN(hours) && !Number.isNaN(minutes)) {
        date.setHours(hours, minutes, 0, 0);
        return date.getTime();
      }
    }

    // No explicit time — treat end of selected day as deadline
    date.setHours(23, 59, 0, 0);
    return date.getTime();
  } catch (error) {
    console.warn('[planner/tasks] Unable to compute due date from payload.', error);
    return null;
  }
};

const isTaskOverdue = (task: PlannerTask) => {
  if (!task.dueAt) return false;
  if (task.status === 'completed' || task.status === 'deleted') return false;
  return task.dueAt < Date.now();
};

const stripeColor = (theme: ReturnType<typeof useAppTheme>, task: PlannerTask) => {
  if (task.status === 'completed') return theme.colors.success;
  if (task.status === 'deleted' || isTaskOverdue(task)) return theme.colors.danger;
  return theme.colors.textTertiary;
};

// -----------------------------
// Components
// -----------------------------
export default function PlannerTasksTab() {
  const theme = useAppTheme();
  const { strings, locale } = useLocalization();
  const tasksStrings = strings.plannerScreens.tasks;
  const addTaskRef = useRef<AddTaskSheetHandle>(null);

  const tasks = usePlannerTasksStore((state) => state.tasks);
  const history = usePlannerTasksStore((state) => state.history);
  const addTask = usePlannerTasksStore((state) => state.addTask);
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

  const doneCount = (arr: PlannerTask[]) => arr.filter((t) => t.status === 'completed').length;

  const handleToggleDone = useCallback(
    (id: string) => {
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
      toggleDone(id);
    },
    [toggleDone],
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

  const handleCreate = useCallback(
    (payload: AddTaskPayload) => {
      const section: PlannerTaskSection =
        payload.time && Number(payload.time.split(':')[0]) < 12
          ? 'morning'
          : payload.time && Number(payload.time.split(':')[0]) < 18
          ? 'afternoon'
          : 'evening';

      const startLabel =
        payload.time ||
        (payload.dateMode === 'today'
          ? tasksStrings.defaults.startToday
          : payload.dateMode === 'tomorrow'
          ? tasksStrings.defaults.startTomorrow
          : tasksStrings.defaults.startPick);

      const dueAt = computeDueAtFromPayload(payload);

      addTask({
        title: payload.title || tasksStrings.defaults.newTaskTitle,
        desc: payload.description,
        start: startLabel,
        duration: '—',
        context: payload.context || tasksStrings.defaults.defaultContext,
        energy: payload.energy === 'high' ? 3 : payload.energy === 'low' ? 1 : 2,
        projectHeart: payload.needFocus ? true : undefined,
        section,
        afterWork: startLabel.toLowerCase() === 'after work',
        dueAt,
      });
    },
    [
      addTask,
      tasksStrings.defaults.defaultContext,
      tasksStrings.defaults.newTaskTitle,
      tasksStrings.defaults.startPick,
      tasksStrings.defaults.startToday,
      tasksStrings.defaults.startTomorrow,
    ],
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
            onComplete={handleToggleDone}
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
            onComplete={handleToggleDone}
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
            onComplete={handleToggleDone}
            tasksStrings={tasksStrings}
          />
        )}

        {sortedHistory.length > 0 && (
          <HistorySection
            items={sortedHistory}
            theme={theme}
            onRestore={handleRestore}
            onRemove={handleRemoveFromHistory}
            tasksStrings={tasksStrings}
          />
        )}

        <View style={{ height: 100 }} />
      </ScrollView>
      {/* Add Task Modal */}
      <AddTaskSheet ref={addTaskRef} onCreate={(p) => handleCreate(p)} />
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
  onComplete,
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
  onComplete: (id: string) => void;
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
            onComplete={() => onComplete(t.id)}
            tasksStrings={tasksStrings}
          />
        ))}
      </View>
    </>
  );
}

// -----------------------------
// Task Card (swipe actions, expand)
// -----------------------------
function TaskCard({
  task,
  theme,
  onToggleDone,
  onToggleExpand,
  onDelete,
  onComplete,
  onRestore,
  mode = 'active',
  tasksStrings,
}: {
  task: PlannerTask;
  theme: ReturnType<typeof useAppTheme>;
  onToggleDone: () => void;
  onToggleExpand: () => void;
  onDelete: () => void;
  onComplete: () => void;
  onRestore?: () => void;
  mode?: 'active' | 'history';
  tasksStrings: AppTranslations['plannerScreens']['tasks'];
}) {
  const translateX = useSharedValue(0);

  const isHistory = mode === 'history';
  const isCompleted = task.status === 'completed';
  const allowComplete = !isHistory && !isCompleted;
  const allowDelete = isHistory ? !!onDelete : true;
  const allowRestore = isHistory;
  const hasSwipe = allowComplete || allowDelete || allowRestore;
  const rightAction: 'complete' | 'restore' | null = allowRestore
    ? 'restore'
    : allowComplete
    ? 'complete'
    : null;

  const animatedCardStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  const rightBackgroundStyle = useAnimatedStyle(() => {
    if (!rightAction) return { opacity: 0 };
    const progress = interpolate(
      Math.max(translateX.value, 0),
      [0, SWIPE_TRIGGER],
      [0, 1],
      Extrapolate.CLAMP,
    );
    return { opacity: progress };
  });

  const rightContentStyle = useAnimatedStyle(() => {
    if (!rightAction) return { opacity: 0, transform: [{ scale: 0.9 }] };
    const progress = interpolate(
      Math.max(translateX.value, 0),
      [0, SWIPE_TRIGGER],
      [0, 1],
      Extrapolate.CLAMP,
    );
    return {
      opacity: progress,
      transform: [{ scale: 0.88 + progress * 0.22 }],
    };
  });

  const leftBackgroundStyle = useAnimatedStyle(() => {
    if (!allowDelete) return { opacity: 0 };
    const progress = interpolate(
      Math.max(-translateX.value, 0),
      [0, SWIPE_TRIGGER],
      [0, 1],
      Extrapolate.CLAMP,
    );
    return { opacity: progress };
  });

  const leftContentStyle = useAnimatedStyle(() => {
    if (!allowDelete) return { opacity: 0, transform: [{ scale: 0.9 }] };
    const progress = interpolate(
      Math.max(-translateX.value, 0),
      [0, SWIPE_TRIGGER],
      [0, 1],
      Extrapolate.CLAMP,
    );
    return {
      opacity: progress,
      transform: [{ scale: 0.88 + progress * 0.22 }],
    };
  });

  const gesture = useMemo(() => {
    if (!hasSwipe) {
      return Gesture.Pan().enabled(false);
    }

    return Gesture.Pan()
      .activateAfterLongPress(300)
      .onUpdate((event) => {
        let translation = event.translationX;

        if (!allowDelete && translation < 0) translation = 0;
        if (!rightAction && translation > 0) translation = 0;

        const min = allowDelete ? -MAX_SWIPE_DISTANCE : 0;
        const max = rightAction ? MAX_SWIPE_DISTANCE : 0;
        translateX.value = Math.max(min, Math.min(translation, max));
      })
      .onEnd(() => {
        const currentX = translateX.value;

        if (allowDelete && currentX < -SWIPE_TRIGGER) {
          translateX.value = withTiming(-SCREEN_WIDTH, { duration: 220 }, () => {
            runOnJS(onDelete)();
          });
          return;
        }

        if (rightAction && currentX > SWIPE_TRIGGER) {
          const action = rightAction === 'restore' ? onRestore : onComplete;
          translateX.value = withTiming(SWIPE_TRIGGER * 1.1, { duration: 180 }, (finished) => {
            if (finished && action) {
              runOnJS(action)();
            }
            translateX.value = withTiming(0, { duration: 220 });
          });
          return;
        }

        translateX.value = withTiming(0, { duration: 200 });
      })
      .onFinalize(() => {
        if (!hasSwipe) {
          translateX.value = 0;
        }
      });
  }, [allowDelete, allowRestore, hasSwipe, onComplete, onDelete, onRestore, rightAction, translateX]);

  const successBgColor = theme.colors.successBg ?? 'rgba(16,185,129,0.18)';
  const deleteBgColor = theme.colors.dangerBg ?? 'rgba(239,68,68,0.18)';
  const restoreColor = theme.colors.primary ?? '#3b82f6';
  const restoreBgColor = `${restoreColor}1A`;

  const checkboxDisabled = isHistory;
  const checkboxPress = checkboxDisabled ? undefined : onToggleDone;

  return (
    <View style={styles.swipeContainer}>
      {rightAction && (
        <Animated.View
          pointerEvents="none"
          style={[
            styles.actionBackground,
            styles.actionBackgroundLeft,
            {
              backgroundColor: rightAction === 'restore' ? restoreBgColor : successBgColor,
              borderColor: theme.colors.border,
            },
            rightBackgroundStyle,
          ]}
        >
          <Animated.View style={[styles.actionContent, rightContentStyle]}>
            {rightAction === 'restore' ? (
              <>
                <RotateCcw size={18} color={restoreColor} />
                <Text style={[styles.actionText, { color: restoreColor }]}>{tasksStrings.actions.restore}</Text>
              </>
            ) : (
              <>
                <CheckSquare size={18} color={theme.colors.success} />
                <Text style={[styles.actionText, { color: theme.colors.success }]}>
                  {tasksStrings.actions.complete}
                </Text>
              </>
            )}
          </Animated.View>
        </Animated.View>
      )}

      {allowDelete && (
        <Animated.View
          pointerEvents="none"
          style={[
            styles.actionBackground,
            styles.actionBackgroundRight,
            { backgroundColor: deleteBgColor, borderColor: theme.colors.border },
            leftBackgroundStyle,
          ]}
        >
          <Animated.View style={[styles.actionContent, leftContentStyle]}>
            <Trash2 size={18} color={theme.colors.danger} />
            <Text style={[styles.actionText, { color: theme.colors.danger }]}>
              {isHistory ? tasksStrings.actions.remove : tasksStrings.actions.delete}
            </Text>
          </Animated.View>
        </Animated.View>
      )}

      <GestureDetector gesture={gesture}>
        <Animated.View style={animatedCardStyle}>
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
            <Pressable style={styles.cardPress} onPress={onToggleExpand} disabled={isHistory}>
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
                onPress={checkboxPress}
                disabled={!checkboxPress}
                style={styles.checkboxWrap}
              >
                {task.status === 'completed' ? (
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
                <View style={styles.energyRow}>
                  {energyIcons(task.energy, theme.colors.textSecondary)}
                </View>
                {!isHistory && <MoreHorizontal size={16} color={theme.colors.textSecondary} />}
              </View>

              <View style={styles.titleRow}>
                <Text
                  numberOfLines={1}
                  style={[
                    styles.title,
                    {
                      color: theme.colors.white,
                      textDecorationLine: task.status === 'completed' ? 'line-through' : 'none',
                      opacity: task.status === 'completed' ? 0.6 : 1,
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
        </Animated.View>
      </GestureDetector>
    </View>
  );
}
function HistorySection({
  items,
  theme,
  onRestore,
  onRemove,
  tasksStrings,
}: {
  items: PlannerTask[];
  theme: ReturnType<typeof useAppTheme>;
  onRestore: (id: string) => void;
  onRemove: (id: string) => void;
  tasksStrings: AppTranslations['plannerScreens']['tasks'];
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
            onComplete={() => {}}
            onRestore={() => onRestore(task.id)}
            mode="history"
            tasksStrings={tasksStrings}
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

  swipeContainer: {
    position: 'relative',
    borderRadius: 16,
    overflow: 'hidden',
  },
  actionBackground: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    borderRadius: 16,
    borderWidth: 1,
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  actionBackgroundLeft: {
    alignItems: 'flex-start',
  },
  actionBackgroundRight: {
    alignItems: 'flex-end',
  },
  actionContent: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  actionText: { fontSize: 12, fontWeight: '700' },

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
