// app/(tabs)/(planner)/(tabs)/habits.tsx
import React, { useCallback, useMemo, useState } from 'react';
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
import { AlarmClock, Award, Check, Flame, Sparkles, Trophy, X, ChevronDown } from 'lucide-react-native';

import { AdaptiveGlassView } from '@/components/ui/AdaptiveGlassView';
import { createThemedStyles, useAppTheme } from '@/constants/theme';
import { useLocalization } from '@/localization/useLocalization';
import type { AppTranslations } from '@/localization/strings';
import { useSelectedDayStore } from '@/stores/selectedDayStore';
import { buildHabits, type HabitCardModel, type HabitDayStatus } from '@/features/planner/habits/data';
import { useModalStore } from '@/stores/useModalStore';
import { usePlannerHabitsStore } from '@/features/planner/useHabitsStore';
import type { PlannerHabitId } from '@/types/planner';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

// -------------------------------------
// Date helpers
// -------------------------------------
const pct = (a: number, b: number) => Math.round((a / Math.max(b, 1)) * 100);

// -------------------------------------
// Main Screen
// -------------------------------------
export default function PlannerHabitsTab() {
  const styles = useStyles();
  const { strings, locale } = useLocalization();
  const habitStrings = strings.plannerScreens.habits;
  const goalTitleMap = strings.plannerScreens.goals.data;
  const habitEntities = usePlannerHabitsStore((state) => state.habits);
  const deleteHabit = usePlannerHabitsStore((state) => state.deleteHabit);
  const archiveHabit = usePlannerHabitsStore((state) => state.toggleArchiveHabit);
  const openHabitModal = useModalStore((state) => state.openPlannerHabitModal);
  const storedSelectedDate = useSelectedDayStore((state) => state.selectedDate);
  const selectedDate = storedSelectedDate;
  const [expandedIds, setExpandedIds] = useState<Record<string, boolean>>({});

  const habits = useMemo(() => {
    const localized = buildHabits(habitStrings.data, habitEntities);
    return localized.map((habit) => ({
      ...habit,
      expanded: expandedIds[habit.id] ?? habit.expanded ?? false,
    }));
  }, [expandedIds, habitEntities, habitStrings.data]);

  const monthYearFormatter = useMemo(
    () =>
      new Intl.DateTimeFormat(locale, {
        month: 'long',
        year: 'numeric',
      }),
    [locale],
  );

  const topMonthLabel = useMemo(() => monthYearFormatter.format(selectedDate), [monthYearFormatter, selectedDate]);

  const toggleExpand = useCallback((id: string) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpandedIds((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  }, []);

  const handleEditHabit = useCallback(
    (habit: HabitCardModel) => {
      openHabitModal({ mode: 'edit', habitId: habit.id, habit });
    },
    [openHabitModal],
  );

  const handleDeleteHabit = useCallback(
    (id: string) => {
      deleteHabit(id as PlannerHabitId);
    },
    [deleteHabit],
  );
  const handleArchiveHabit = useCallback(
    (id: string) => {
      archiveHabit(id as PlannerHabitId, true);
    },
    [archiveHabit],
  );
  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      {/* Top Bar */}
      <View style={styles.topBar}>
        <Text style={styles.topTitle}>{habitStrings.headerTitle}</Text>
        <Text style={styles.monthText}>{topMonthLabel}</Text>
      </View>


      {/* Habits list */}
      <View style={{ gap: 12 }}>
        {habits.map((habit) => (
            <HabitCard
              key={habit.id}
              data={habit}
              onToggleExpand={() => toggleExpand(habit.id)}
              strings={habitStrings}
              goalTitles={goalTitleMap}
              onEdit={() => handleEditHabit(habit)}
              onArchive={() => handleArchiveHabit(habit.id)}
              onDelete={() => handleDeleteHabit(habit.id)}
            />
        ))}
      </View>

      <View style={{ height: 120 }} />
    </ScrollView>
  );
}

// -------------------------------------
// Habit Card
// -------------------------------------
function HabitCard({
  data,
  onToggleExpand,
  strings,
  goalTitles,
  onEdit,
  onArchive,
  onDelete,
}: {
  data: HabitCardModel;
  onToggleExpand: () => void;
  strings: AppTranslations['plannerScreens']['habits'];
  goalTitles: AppTranslations['plannerScreens']['goals']['data'];
  onEdit?: () => void;
  onArchive?: () => void;
  onDelete?: () => void;
}) {
  const theme = useAppTheme();
  const styles = useStyles();
  const completion = useMemo(
    () => pct(data.weeklyCompleted, data.weeklyTarget),
    [data.weeklyCompleted, data.weeklyTarget],
  );
  const streakText = strings.stats.streak.replace('{days}', String(data.streak));
  const recordText = strings.stats.record.replace('{days}', String(data.record));
  const completionText = strings.stats.completion
    .replace('{percent}', String(completion))
    .replace('{completed}', String(data.weeklyCompleted))
    .replace('{target}', String(data.weeklyTarget));
  const badgeText = `${data.badgeDays ?? data.streak} ${strings.badgeSuffix}`;
  const goalLabels =
    data.linkedGoalIds?.map((goalId) => goalTitles[goalId as keyof typeof goalTitles]?.title ?? goalId) ?? [];
  const handleCardPress = useCallback(() => {
    onToggleExpand();
  }, [onToggleExpand]);

  const handleChevronPress = useCallback(
    (event: GestureResponderEvent) => {
      event.stopPropagation();
      handleCardPress();
    },
    [handleCardPress],
  );

  return (
    <AdaptiveGlassView style={styles.card}>
      <Pressable onPress={handleCardPress} style={styles.cardPress}>
        <View style={styles.headerRow}>
          <View style={styles.headerLeft}>
            <Text style={styles.cardTitle}>{data.title}</Text>
          </View>
          <View style={styles.headerRight}>
            <Pressable hitSlop={10} onPress={handleChevronPress}>
              <ChevronDown
                size={16}
                color={theme.colors.textSecondary}
                style={{ transform: [{ rotate: data.expanded ? '180deg' : '0deg' }] }}
              />
            </Pressable>
          </View>
          <View style={styles.badgeRight}>
            <Flame size={14} color={theme.colors.textSecondary} />
            <Text style={styles.badgeText}>
              {badgeText}
            </Text>
          </View>
        </View>

        <View style={styles.statsCol}>
          <Text style={styles.statLine}>{streakText}</Text>
          <Text style={styles.statLine}>{recordText}</Text>
          <Text style={styles.statLine}>{completionText}</Text>
        </View>

        {goalLabels.length > 0 && (
          <Text style={[styles.supportsText, { color: theme.colors.textTertiary }]}>
            {strings.supportsGoals.replace('{goals}', goalLabels.join(', '))}
          </Text>
        )}

        <View style={styles.daysRow}>
          {data.daysRow.map((status, idx) => (
            <DayBubble key={idx} status={status} />
          ))}
        </View>

        {!!data.aiNote && (
          <View style={styles.aiRow}>
            <Sparkles size={14} color={theme.colors.textSecondary} />
            <Text style={styles.aiText} numberOfLines={1}>
              {data.aiNote}
            </Text>
          </View>
        )}

        <View style={{ marginTop: 12 }}>
          {data.cta?.kind === 'check' && <GlassButton label={strings.ctas.checkIn} />}
          {data.cta?.kind === 'timer' && (
            <GlassButton
              icon={<AlarmClock size={14} color={theme.colors.textSecondary} />}
              label={strings.ctas.startTimer}
            />
          )}
          {data.cta?.kind === 'chips' && (
            <View style={styles.chipsRow}>
              {(data.chips ?? []).map((chip) => (
                <GlassChip key={chip} label={chip} />
              ))}
            </View>
          )}
          {data.cta?.kind === 'dual' && (
            <View style={styles.dualRow}>
              <GlassButton label={strings.ctas.completed} compact />
              <GlassButton label={strings.ctas.failed} compact variant="danger" />
            </View>
          )}
        </View>

        {data.expanded && (
          <View style={styles.expandArea}>
            <View style={styles.sectionBlock}>
              <Text style={styles.blockTitle}>{strings.expand.titles.statistics}</Text>
              <Text style={styles.blockLine}>{strings.expand.lines.overallCompletion}</Text>
              <Text style={styles.blockLine}>{strings.expand.lines.successPercentile}</Text>
              <Text style={styles.blockLine}>{strings.expand.lines.averageStreak}</Text>
              <Text style={styles.blockLine}>{strings.expand.lines.bestMonth}</Text>
            </View>

            <View style={styles.sectionBlock}>
              <Text style={styles.blockTitle}>{strings.expand.titles.pattern}</Text>
              <Text style={styles.blockLine}>{strings.expand.lines.bestTime}</Text>
              <Text style={styles.blockLine}>{strings.expand.lines.worstTime}</Text>
              <Text style={styles.blockLine}>{strings.expand.lines.afterWeekends}</Text>
            </View>

            <View style={styles.sectionBlock}>
              <Text style={styles.blockTitle}>{strings.expand.titles.achievements}</Text>
              <BlockBadge
                icon={<Trophy size={14} color={theme.colors.textSecondary} />}
                text={strings.expand.badges.firstWeek}
              />
              <BlockBadge
                icon={<Award size={14} color={theme.colors.textSecondary} />}
                text={strings.expand.badges.monthNoBreak}
              />
              <BlockBadge
                icon={<Award size={14} color={theme.colors.textSecondary} />}
                text={strings.expand.badges.hundredCompletions}
              />
              <BlockBadge
                icon={<Trophy size={14} color={theme.colors.textSecondary} />}
                text={strings.expand.badges.marathoner}
              />
            </View>

            <View style={styles.dualRow}>
              <GlassButton label={strings.ctas.edit} compact onPress={onEdit} />
              <GlassButton label={strings.ctas.delete} compact variant="danger" onPress={onDelete} />
            </View>
          </View>
          )}
      </Pressable>
    </AdaptiveGlassView>
  );
}

// -------------------------------------
// Small UI parts
// -------------------------------------
function DayBubble({ status }: { status: HabitDayStatus }) {
  const theme = useAppTheme();
  const base = {
    width: 18,
    height: 18,
    borderRadius: 9,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: theme.colors.border,
    backgroundColor: 'transparent',
  };

  if (status === 'done') {
    const success = theme.colors.success;
    return (
      <View
        style={[
          base,
          { backgroundColor: `${success}26`, borderColor: `${success}80` },
        ]}
      >
        <Check size={12} color={success} />
      </View>
    );
  }
  if (status === 'miss') {
    const danger = theme.colors.danger;
    return (
      <View
        style={[
          base,
          { backgroundColor: `${danger}26`, borderColor: `${danger}80` },
        ]}
      >
        <X size={12} color={danger} />
      </View>
    );
  }
  return <View style={base} />;
}

function GlassButton({
  label,
  icon,
  compact,
  variant = 'default',
  onPress,
}: {
  label: string;
  icon?: React.ReactNode;
  compact?: boolean;
  variant?: 'default' | 'danger';
  onPress?: () => void;
}) {
  const theme = useAppTheme();
  const styles = useStyles();
  const danger = variant === 'danger';
  const paddingStyle = { paddingVertical: compact ? 8 : 10 };
  const borderColor = danger ? theme.colors.danger : theme.colors.border;
  const textColor = danger ? theme.colors.danger : theme.colors.textSecondary;
  const content = (
    <AdaptiveGlassView style={[styles.glassBtn, paddingStyle, { borderColor }]}>
      <View style={styles.glassBtnRow}>
        {icon}
        <Text style={[styles.glassBtnText, { color: textColor }]}>{label}</Text>
      </View>
    </AdaptiveGlassView>
  );
  if (onPress) {
    return (
      <Pressable onPress={onPress} style={{ borderRadius: 16 }}>
        {content}
      </Pressable>
    );
  }
  return content;
}

function GlassChip({ label }: { label: string }) {
  const styles = useStyles();
  return (
    <AdaptiveGlassView style={styles.chip}>
      <Text style={styles.chipText}>{label}</Text>
    </AdaptiveGlassView>
  );
}

function BlockBadge({ icon, text }: { icon: React.ReactNode; text: string }) {
  const styles = useStyles();
  return (
    <View style={styles.blockBadgeRow}>
      {icon}
      <Text style={styles.blockBadgeText}>{text}</Text>
    </View>
  );
}


// -------------------------------------
// Styles
// -------------------------------------
const useStyles = createThemedStyles((theme) => ({
  container: { flex: 1, backgroundColor: theme.colors.background },
  content: { paddingBottom: 40, gap: 16, paddingHorizontal: 12 },

  topBar: {
    paddingTop: 8,
    paddingBottom: 4,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  topTitle: { fontSize: 14, fontWeight: '700', letterSpacing: 0.3, color: theme.colors.textSecondary },
  monthText: { fontSize: 13, fontWeight: '600', color: theme.colors.textSecondary },

  card: {
    borderRadius: 16,
    borderWidth: StyleSheet.hairlineWidth,
    overflow: 'hidden',
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.card,
    position: 'relative',
  },
  cardPress: { padding: 12 },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 8, flex: 1 },
  headerRight: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  cardTitle: { fontSize: 15, fontWeight: '700', color: theme.colors.textPrimary },
  badgeRight: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  badgeText: { fontSize: 12, fontWeight: '700', color: theme.colors.textSecondary },

  statsCol: { gap: 3, marginBottom: 6, paddingLeft: 2 },
  statLine: { fontSize: 12, fontWeight: '600', color: theme.colors.textSecondary },
  supportsText: { fontSize: 12, fontWeight: '600', color: theme.colors.textTertiary, marginBottom: 6 },
  statKey: { fontWeight: '800', color: theme.colors.textPrimary },

  daysRow: { flexDirection: 'row', gap: 6, marginTop: 6 },

  aiRow: { marginTop: 8, flexDirection: 'row', alignItems: 'center', gap: 6 },
  aiText: { fontSize: 12, color: theme.colors.textSecondary },

  chipsRow: { flexDirection: 'row', gap: 12, marginTop: 2 },
  dualRow: { flexDirection: 'row', gap: 10 },

  glassBtn: {
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: 16,
    alignItems: 'center',
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.card,
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
  glassBtnRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  glassBtnText: { fontSize: 13, fontWeight: '700', color: theme.colors.textPrimary },

  chip: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: 12,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.card,
  },
  chipText: { fontSize: 12, fontWeight: '700', letterSpacing: 0.3, color: theme.colors.textSecondary },

  expandArea: { marginTop: 12, gap: 12 },
  sectionBlock: {
    padding: 10,
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: 12,
    gap: 6,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.card,
  },
  blockTitle: { fontSize: 14, fontWeight: '800', color: theme.colors.textPrimary },
  blockLine: { fontSize: 12, fontWeight: '600', color: theme.colors.textSecondary },
  blockBadgeRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  blockBadgeText: { color: theme.colors.textSecondary, fontSize: 13 },
}));
