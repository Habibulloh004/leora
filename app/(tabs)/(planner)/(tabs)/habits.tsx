// app/(tabs)/(planner)/(tabs)/habits.tsx
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  LayoutAnimation,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  UIManager,
  View,
} from 'react-native';
import {
  AlarmClock,
  Award,
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  Flame,
  MoreHorizontal,
  Sparkles,
  Trophy,
  X,
} from 'lucide-react-native';

import { AdaptiveGlassView } from '@/components/ui/AdaptiveGlassView';
import { createThemedStyles, useAppTheme } from '@/constants/theme';
import { useLocalization } from '@/localization/useLocalization';
import type { AppTranslations, PlannerHabitId } from '@/localization/strings';
import {
  addDays,
  addMonths,
  buildCalendarDays,
  buildWeekStrip,
  startOfDay,
  startOfMonth,
  startOfWeek,
  useCalendarWeeks,
} from '@/utils/calendar';
import { useSelectedDayStore } from '@/stores/selectedDayStore';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

// -------------------------------------
// Types & Mock Data
// -------------------------------------
type DayStatus = 'done' | 'miss' | 'none';
type Habit = {
  id: string;
  title: string;
  streak: number;
  record: number;
  weeklyCompleted: number;
  weeklyTarget: number;
  daysRow: DayStatus[];
  aiNote?: string;
  badgeDays?: number;
  cta?: { kind: 'check' | 'timer' | 'chips' | 'dual' };
  chips?: string[];
  expanded?: boolean;
};

type HabitTemplate = Omit<Habit, 'title' | 'aiNote' | 'chips'> & { contentKey: PlannerHabitId };

const HABIT_TEMPLATES: HabitTemplate[] = [
  {
    contentKey: 'h1',
    id: 'h1',
    streak: 12,
    record: 45,
    weeklyCompleted: 6,
    weeklyTarget: 7,
    daysRow: ['done', 'done', 'done', 'done', 'done', 'done', 'none', 'none', 'none', 'none'],
    badgeDays: 12,
    cta: { kind: 'check' },
  },
  {
    contentKey: 'h2',
    id: 'h2',
    streak: 1,
    record: 21,
    weeklyCompleted: 4,
    weeklyTarget: 7,
    daysRow: ['done', 'none', 'miss', 'none', 'none', 'none', 'none', 'none', 'none', 'none'],
    badgeDays: 5,
    cta: { kind: 'check' },
  },
  {
    contentKey: 'h3',
    id: 'h3',
    streak: 5,
    record: 30,
    weeklyCompleted: 5,
    weeklyTarget: 7,
    daysRow: ['done', 'done', 'miss', 'done', 'done', 'none', 'none', 'none', 'none', 'none'],
    badgeDays: 8,
    cta: { kind: 'timer' },
  },
  {
    contentKey: 'h4',
    id: 'h4',
    streak: 30,
    record: 30,
    weeklyCompleted: 7,
    weeklyTarget: 7,
    daysRow: ['done', 'done', 'done', 'done', 'done', 'done', 'done', 'done', 'done', 'done'],
    badgeDays: 30,
    cta: { kind: 'chips' },
  },
  {
    contentKey: 'h5',
    id: 'h5',
    streak: 3,
    record: 7,
    weeklyCompleted: 3,
    weeklyTarget: 5,
    daysRow: ['done', 'miss', 'miss', 'done', 'done', 'none', 'none', 'none', 'none', 'none'],
    badgeDays: 8,
    cta: { kind: 'dual' },
  },
];

const buildHabits = (
  content: AppTranslations['plannerScreens']['habits']['data'],
): Habit[] =>
  HABIT_TEMPLATES.map((template) => {
    const localized = content[template.contentKey];
    return {
      ...template,
      title: localized.title,
      aiNote: localized.aiNote,
      chips: localized.chips,
    };
  });

// -------------------------------------
// Date helpers
// -------------------------------------
const pct = (a: number, b: number) => Math.round((a / Math.max(b, 1)) * 100);


// -------------------------------------
// Main Screen
// -------------------------------------
export default function PlannerHabitsTab() {
  const theme = useAppTheme();
  const styles = useStyles();
  const { strings, locale } = useLocalization();
  const habitStrings = strings.plannerScreens.habits;
  const [habits, setHabits] = useState<Habit[]>(() => buildHabits(habitStrings.data));
  const storedSelectedDate = useSelectedDayStore((state) => state.selectedDate);
  const normalizedInitialDate = useMemo(
    () => startOfDay(storedSelectedDate ?? new Date()),
    [storedSelectedDate],
  );
  const [selectedDate, setSelectedDate] = useState<Date>(normalizedInitialDate);
  const [visibleMonth, setVisibleMonth] = useState<Date>(() => startOfMonth(normalizedInitialDate));
  const [showCalendar, setShowCalendar] = useState(false);

  useEffect(() => {
    const normalized = startOfDay(storedSelectedDate ?? new Date());
    setSelectedDate((prev) => (prev.getTime() === normalized.getTime() ? prev : normalized));
    setVisibleMonth((prev) => {
      const month = startOfMonth(normalized);
      return prev.getTime() === month.getTime() ? prev : month;
    });
  }, [storedSelectedDate]);

  useEffect(() => {
    setHabits((prev) => {
      const expandedMap = new Map(prev.map((habit) => [habit.id, habit.expanded]));
      return buildHabits(habitStrings.data).map((habit) => ({
        ...habit,
        expanded: expandedMap.get(habit.id),
      }));
    });
  }, [habitStrings.data]);

  const weekDays = useMemo(() => {
    const weekdayFormatter = new Intl.DateTimeFormat(locale, { weekday: 'short' });
    const dayFormatter = new Intl.DateTimeFormat(locale, { day: '2-digit' });
    return buildWeekStrip(selectedDate).map((day) => ({
      ...day,
      label: weekdayFormatter.format(day.date),
      number: dayFormatter.format(day.date),
    }));
  }, [locale, selectedDate]);
  const calendarDays = useMemo(() => {
    const dayFormatter = new Intl.DateTimeFormat(locale, { day: '2-digit' });
    return buildCalendarDays(visibleMonth, selectedDate).map((day) => ({
      ...day,
      label: dayFormatter.format(day.date),
    }));
  }, [locale, selectedDate, visibleMonth]);

  const monthYearFormatter = useMemo(
    () =>
      new Intl.DateTimeFormat(locale, {
        month: 'long',
        year: 'numeric',
      }),
    [locale],
  );
  const monthNameFormatter = useMemo(
    () =>
      new Intl.DateTimeFormat(locale, {
        month: 'long',
      }),
    [locale],
  );
  const monthShortFormatter = useMemo(
    () =>
      new Intl.DateTimeFormat(locale, {
        month: 'short',
      }),
    [locale],
  );

  const topMonthLabel = useMemo(() => monthYearFormatter.format(selectedDate), [monthYearFormatter, selectedDate]);
  const monthName = useMemo(() => monthNameFormatter.format(visibleMonth), [monthNameFormatter, visibleMonth]);
  const yearNumber = useMemo(() => visibleMonth.getFullYear(), [visibleMonth]);
  const calendarWeekLabels = useMemo(() => {
    const formatter = new Intl.DateTimeFormat(locale, { weekday: 'short' });
    const start = startOfWeek(new Date());
    return Array.from({ length: 7 }).map((_, idx) => formatter.format(addDays(start, idx)));
  }, [locale]);
  const monthShortLabels = useMemo(
    () => Array.from({ length: 12 }).map((_, idx) => monthShortFormatter.format(new Date(2000, idx, 1))),
    [monthShortFormatter],
  );

  const toggleExpand = useCallback((id: string) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setHabits((prev) =>
      prev.map((habit) => (habit.id === id ? { ...habit, expanded: !habit.expanded } : habit)),
    );
  }, []);

  const toggleCalendar = useCallback(() => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setShowCalendar((prev) => !prev);
  }, []);

  const handleWeekDayPress = useCallback(
    (date: Date) => {
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
      const normalized = startOfDay(date);
      setSelectedDate(normalized);
      setVisibleMonth(startOfMonth(normalized));
      setShowCalendar(true);
    },
    [],
  );

  const handleSelectDate = useCallback((date: Date) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    const normalized = startOfDay(date);
    setSelectedDate(normalized);
    setVisibleMonth(startOfMonth(normalized));
    setShowCalendar(false);
  }, []);

  const handleMonthChange = useCallback((direction: 'prev' | 'next') => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setVisibleMonth((prev) => addMonths(prev, direction === 'prev' ? -1 : 1));
  }, []);

  // ➕ Add these near other useState/useMemo hooks
  const [pickerMode, setPickerMode] = useState<'days' | 'months' | 'years'>('days');

  // yillar grid boshlanish nuqtasi (12 yillik sahifalash)
  const initYear = new Date().getFullYear();
  const [yearGridStart, setYearGridStart] = useState<number>(initYear - (initYear % 12));

  // 42 kunni 6 haftaga bo‘lib qo‘yamiz: 7 ta ustun har doim chiqadi (yakshanba ham!)
  const weeks = useCalendarWeeks(calendarDays);

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      {/* Top Bar */}
      <View style={styles.topBar}>
        <Text style={styles.topTitle}>{habitStrings.headerTitle}</Text>
        <Pressable onPress={toggleCalendar} style={styles.topRight}>
          <Text style={styles.monthText}>{topMonthLabel}</Text>
          {showCalendar ? (
            <ChevronUp size={16} color={theme.colors.textSecondary} />
          ) : (
            <ChevronDown size={16} color={theme.colors.textSecondary} />
          )}
        </Pressable>
      </View>

      {/* Week strip */}
      <AdaptiveGlassView style={styles.weekGlass}>
        <View style={styles.weekRow}>
          {weekDays.map((day) => (
            <Pressable
              key={day.key}
              onPress={() => handleWeekDayPress(day.date)}
              style={({ pressed }) => [styles.weekItem, pressed && { opacity: 0.85 }]}
            >
              {(() => {
                const highlight = theme.mode === 'dark' ? theme.colors.white : theme.colors.primary;
                const weekDayColor = day.isSelected ? theme.colors.textPrimary : theme.colors.textSecondary;
                const badgeTextColor = day.isSelected
                  ? theme.mode === 'dark'
                    ? theme.colors.background
                    : theme.colors.onPrimary
                  : theme.colors.textSecondary;
                return (
                  <>
                    <Text style={[styles.weekDay, { color: weekDayColor }]}>{day.label}</Text>
                    <View
                      style={[
                        styles.weekBadge,
                        {
                          backgroundColor: day.isSelected ? `${highlight}1A` : 'transparent',
                          borderColor: day.isSelected ? highlight : theme.colors.border,
                        },
                      ]}
                    >
                      <Text style={[styles.weekNum, { color: badgeTextColor }]}>{day.number}</Text>
                    </View>
                  </>
                );
              })()}
              <View style={styles.dotRow}>
                <View style={[styles.dot, { backgroundColor: theme.colors.success }]} />
                <View style={[styles.dot, { backgroundColor: theme.colors.danger }]} />
                <View style={[styles.dot, { backgroundColor: theme.colors.border }]} />
              </View>
            </Pressable>
          ))}
        </View>
      </AdaptiveGlassView>

      {/* Inline calendar */}
      {showCalendar && (
        <AdaptiveGlassView style={styles.calendarGlass}>
          {/* Header */}
          <View style={styles.calendarHeader}>
            <Pressable
              style={({ pressed }) => [
                {
                  width: 40,
                  height: 40,
                  borderRadius: 12,
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderWidth: StyleSheet.hairlineWidth,
                  borderColor: theme.colors.border,
                  backgroundColor: pressed
                    ? theme.mode === 'dark'
                      ? 'rgba(255,255,255,0.08)'
                      : 'rgba(15,23,42,0.08)'
                    : 'transparent',
                },
              ]}
              onPress={() => {
                // rejimga qarab navigatsiya
                if (pickerMode === 'years') setYearGridStart((s) => s - 12);
                else if (pickerMode === 'months') {
                  LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
                  setVisibleMonth((prev) => new Date(prev.getFullYear() - 1, prev.getMonth(), 1));
                } else {
                  handleMonthChange('prev');
                }
              }}
            >
              <ChevronLeft size={18} color={theme.colors.textSecondary} />
            </Pressable>

            <View style={{ alignItems: 'center' }}>
              {/* Month -> months grid */}
              <Pressable onPress={() => setPickerMode((m) => (m === 'months' ? 'days' : 'months'))}>
                <Text style={{ color: theme.colors.textPrimary, fontSize: 20, fontWeight: '800' }}>
                  {monthName}
                </Text>
              </Pressable>
              {/* Year -> years grid */}
              <Pressable
                onPress={() => {
                  setYearGridStart(yearNumber - (yearNumber % 12));
                  setPickerMode((m) => (m === 'years' ? 'days' : 'years'));
                }}
              >
                <Text style={{ color: theme.colors.textTertiary, fontSize: 13, fontWeight: '700', marginTop: -2 }}>
                  {yearNumber}
                </Text>
              </Pressable>
            </View>

            <Pressable
              style={({ pressed }) => [
                {
                  width: 40,
                  height: 40,
                  borderRadius: 12,
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderWidth: StyleSheet.hairlineWidth,
                  borderColor: theme.colors.border,
                  backgroundColor: pressed
                    ? theme.mode === 'dark'
                      ? 'rgba(255,255,255,0.08)'
                      : 'rgba(15,23,42,0.08)'
                    : 'transparent',
                },
              ]}
              onPress={() => {
                if (pickerMode === 'years') setYearGridStart((s) => s + 12);
                else if (pickerMode === 'months') {
                  LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
                  setVisibleMonth((prev) => new Date(prev.getFullYear() + 1, prev.getMonth(), 1));
                } else {
                  handleMonthChange('next');
                }
              }}
            >
              <ChevronRight size={18} color={theme.colors.textSecondary} />
            </Pressable>
          </View>

          {/* Weekday names */}
          {pickerMode === 'days' && (
            <View style={styles.calendarWeeknames}>
              {calendarWeekLabels.map((label, idx) => (
                <Text key={`${label}-${idx}`} style={styles.calWeek}>
                  {label}
                </Text>
              ))}
            </View>
          )}

          {/* ====== DAYS GRID (7×6) ====== */}
          {pickerMode === 'days' && (
            <View style={{ marginTop: 8 }}>
              {weeks.map((week, wi) => (
                <View key={wi} style={{ flexDirection: 'row' }}>
                  {week.map((day) => {
                    const isDim = !day.isCurrentMonth;
                    const isSelected = day.isSelected;
                    const textColor = isSelected
                      ? theme.mode === 'dark'
                        ? theme.colors.background
                        : theme.colors.onPrimary
                      : isDim
                        ? theme.colors.textTertiary
                        : theme.colors.textSecondary;
                    const label = String(parseInt(day.label, 10)); // remove leading zero

                    // demo dots (o‘rningizga real hisob-kitob qo‘ying)
                    const d = day.date.getDate();
                    const dots: string[] = [];
                    if (d % 2 === 0) dots.push(theme.colors.success);
                    if (d % 3 === 0) dots.push(theme.colors.danger);
                    if (d % 5 === 0) dots.push(theme.colors.success);

                    return (
                      <Pressable
                        key={day.key}
                        onPress={() => handleSelectDate(day.date)}
                        style={({ pressed }) => [
                          { flex: 1, alignItems: 'center', paddingVertical: 6, opacity: pressed ? 0.75 : 1 },
                        ]}
                      >
                        <View
                          style={{
                            width: 32, height: 32, borderRadius: 10,
                            alignItems: 'center', justifyContent: 'center',
                            backgroundColor: isSelected
                              ? `${theme.colors.primary}1A`
                              : 'transparent',
                            borderWidth: isSelected ? StyleSheet.hairlineWidth : 0,
                            borderColor: isSelected ? theme.colors.primary : 'transparent',
                          }}
                        >
                          <Text style={{ color: textColor, fontSize: 15, fontWeight: isSelected ? '800' : '700' }}>
                            {label}
                          </Text>
                        </View>

                        <View style={{ flexDirection: 'row', marginTop: 4, opacity: isDim ? 0.4 : 1 }}>
                          {[0, 1, 2].map((i) => (
                            <View
                              key={i}
                              style={{
                                width: 3, height: 3, borderRadius: 2, marginHorizontal: 2,
                                backgroundColor: dots[i] ?? 'transparent',
                                borderWidth: dots[i] ? 0 : StyleSheet.hairlineWidth,
                                borderColor: theme.colors.border,
                              }}
                            />
                          ))}
                        </View>
                      </Pressable>
                    );
                  })}
                </View>
              ))}
            </View>
          )}

          {/* ====== MONTHS GRID (custom) ====== */}
          {pickerMode === 'months' && (
            <View style={{ marginTop: 12, flexDirection: 'row', flexWrap: 'wrap' }}>
              {monthShortLabels.map((m, idx) => {
                const active = idx === visibleMonth.getMonth();
                return (
                  <Pressable
                    key={`${m}-${idx}`}
                    onPress={() => {
                      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
                      setVisibleMonth(new Date(yearNumber, idx, 1));
                      setPickerMode('days');
                    }}
                    style={({ pressed }) => [
                      { width: '25%', paddingVertical: 10, alignItems: 'center', opacity: pressed ? 0.8 : 1 },
                    ]}
                  >
                    <View
                      style={{
                        paddingVertical: 6,
                        paddingHorizontal: 10,
                        borderRadius: 10,
                        borderWidth: active ? StyleSheet.hairlineWidth : StyleSheet.hairlineWidth,
                        borderColor: active ? theme.colors.primary : theme.colors.border,
                        backgroundColor: active ? `${theme.colors.primary}1A` : 'transparent',
                      }}
                    >
                      <Text
                        style={{
                          color: active
                            ? theme.mode === 'dark'
                              ? theme.colors.textPrimary
                              : theme.colors.onPrimary
                            : theme.colors.textSecondary,
                          fontWeight: active ? '800' : '700',
                        }}
                      >
                        {m}
                      </Text>
                    </View>
                  </Pressable>
                );
              })}
            </View>
          )}

          {/* ====== YEARS GRID (12 yillik sahifa) ====== */}
          {pickerMode === 'years' && (
            <View style={{ marginTop: 12, flexDirection: 'row', flexWrap: 'wrap' }}>
              {Array.from({ length: 12 }).map((_, i) => {
                const y = yearGridStart + i;
                const active = y === yearNumber;
                return (
                  <Pressable
                    key={y}
                    onPress={() => {
                      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
                      setVisibleMonth(new Date(y, visibleMonth.getMonth(), 1));
                      setPickerMode('months'); // yil tanlangach oy tanlash qulay
                    }}
                    style={({ pressed }) => [
                      { width: '25%', paddingVertical: 10, alignItems: 'center', opacity: pressed ? 0.8 : 1 },
                    ]}
                  >
                    <View
                      style={{
                        paddingVertical: 6,
                        paddingHorizontal: 10,
                        borderRadius: 10,
                        borderWidth: active ? StyleSheet.hairlineWidth : StyleSheet.hairlineWidth,
                        borderColor: active ? theme.colors.primary : theme.colors.border,
                        backgroundColor: active ? `${theme.colors.primary}1A` : 'transparent',
                      }}
                    >
                      <Text
                        style={{
                          color: active
                            ? theme.mode === 'dark'
                              ? theme.colors.textPrimary
                              : theme.colors.onPrimary
                            : theme.colors.textSecondary,
                          fontWeight: active ? '800' : '700',
                        }}
                      >
                        {y}
                      </Text>
                    </View>
                  </Pressable>
                );
              })}
            </View>
          )}
        </AdaptiveGlassView>
      )}

      {/* Habits list */}
      <View style={{ gap: 12 }}>
        {habits.map((habit) => (
          <HabitCard
            key={habit.id}
            data={habit}
            onToggleExpand={() => toggleExpand(habit.id)}
            strings={habitStrings}
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
}: {
  data: Habit;
  onToggleExpand: () => void;
  strings: AppTranslations['plannerScreens']['habits'];
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

  return (
    <AdaptiveGlassView style={styles.card}>
      <Pressable onPress={onToggleExpand} style={styles.cardPress}>
        <View style={styles.headerRow}>
          <View style={styles.headerLeft}>
            <Text style={styles.cardTitle}>{data.title}</Text>
            <MoreHorizontal size={16} color={theme.colors.textSecondary} />
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
              <GlassButton label={strings.ctas.edit} compact />
              <GlassButton label={strings.ctas.delete} compact variant="danger" />
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
function DayBubble({ status }: { status: DayStatus }) {
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
}: {
  label: string;
  icon?: React.ReactNode;
  compact?: boolean;
  variant?: 'default' | 'danger';
}) {
  const theme = useAppTheme();
  const styles = useStyles();
  const danger = variant === 'danger';
  const paddingStyle = { paddingVertical: compact ? 8 : 10 };
  const borderColor = danger ? theme.colors.danger : theme.colors.border;
  const textColor = danger ? theme.colors.danger : theme.colors.textSecondary;
  return (
    <AdaptiveGlassView style={[styles.glassBtn, paddingStyle, { borderColor }]}>
      <View style={styles.glassBtnRow}>
        {icon}
        <Text style={[styles.glassBtnText, { color: textColor }]}>{label}</Text>
      </View>
    </AdaptiveGlassView>
  );
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
  topRight: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  monthText: { fontSize: 13, fontWeight: '600', color: theme.colors.textSecondary },

  weekGlass: {
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: 16,
    paddingVertical: 10,
    paddingHorizontal: 8,
    overflow: 'hidden',
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.card,
  },
  weekRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end' },
  weekItem: { alignItems: 'center', gap: 6, width: 42 },
  weekDay: { fontSize: 11, fontWeight: '600', color: theme.colors.textSecondary },
  weekBadge: {
    minWidth: 34,
    height: 24,
    borderRadius: 12,
    borderWidth: StyleSheet.hairlineWidth,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
    borderColor: theme.colors.border,
    backgroundColor: 'transparent',
  },
  weekNum: { fontSize: 12, fontWeight: '800', letterSpacing: 0.3, color: theme.colors.textSecondary },
  dotRow: { flexDirection: 'row', gap: 3, marginTop: 4 },
  dot: { width: 3, height: 3, borderRadius: 2 },

  calendarGlass: {
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: 16,
    padding: 14,
    gap: 10,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.card,
  },
  calendarHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  calendarTitle: { fontSize: 16, fontWeight: '700', color: theme.colors.textPrimary },
  navBtn: { padding: 6, borderRadius: 12 },
  calendarWeeknames: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 2,
    marginTop: 2,
  },
  calWeek: { fontSize: 11, fontWeight: '600', color: theme.colors.textTertiary },
  calendarGrid: {
    marginTop: 6,
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  calCell: {
    width: `${100 / 7}%`,
    aspectRatio: 1.25,
    borderWidth: StyleSheet.hairlineWidth,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    borderColor: theme.colors.border,
  },

  card: {
    borderRadius: 16,
    borderWidth: StyleSheet.hairlineWidth,
    overflow: 'hidden',
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.card,
  },
  cardPress: { padding: 12 },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 8, flex: 1 },
  cardTitle: { fontSize: 15, fontWeight: '700', color: theme.colors.textPrimary },
  badgeRight: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  badgeText: { fontSize: 12, fontWeight: '700', color: theme.colors.textSecondary },

  statsCol: { gap: 3, marginBottom: 6, paddingLeft: 2 },
  statLine: { fontSize: 12, fontWeight: '600', color: theme.colors.textSecondary },
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
