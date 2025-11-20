/* eslint-disable react/no-unescaped-entities */
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Modal,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Svg, { Path, Circle, G, Rect } from 'react-native-svg';
import DateTimePicker, {
  DateTimePickerAndroid,
  DateTimePickerEvent,
} from '@react-native-community/datetimepicker';

import CustomModal, { CustomModalProps } from '@/components/modals/CustomModal';
import { BottomSheetHandle } from '@/components/modals/BottomSheet';
import DateChangeModal from '@/components/modals/DateChangeModal';
import { AdaptiveGlassView } from '@/components/ui/AdaptiveGlassView';
import { useAppTheme } from '@/constants/theme';
import { useModalStore } from '@/stores/useModalStore';
import { useShallow } from 'zustand/react/shallow';
import { usePlannerDomainStore } from '@/stores/usePlannerDomainStore';
import { useSelectedDayStore } from '@/stores/selectedDayStore';
import type { Habit, HabitType } from '@/domain/planner/types';
import { useLocalization } from '@/localization/useLocalization';
import type { CalendarIndicatorsMap } from '@/types/home';

// Custom SVG Icons with more detail
const RunningIcon = ({ size = 24, color = '#fff' }: { size?: number; color?: string }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Circle cx="13.5" cy="5.5" r="2.5" fill={color} />
    <Path
      d="M13.49 5.48c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm-3.6 13.9l1-4.4 2.1 2v6h2v-7.5l-2.1-2 .6-3c1.3 1.5 3.3 2.5 5.5 2.5v-2c-1.9 0-3.5-1-4.3-2.4l-1-1.6c-.4-.6-1-1-1.7-1-.3 0-.5.1-.8.1l-5.2 2.2v4.7h2v-3.4l1.8-.7-1.6 8.1-4.9-1-.4 2 7 1.4z"
      fill={color}
    />
  </Svg>
);

const WaterIcon = ({ size = 24, color = '#fff' }: { size?: number; color?: string }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M12 2.5l5.5 5.5c2.8 2.8 2.8 7.4 0 10.2-2.8 2.8-7.4 2.8-10.2 0-2.8-2.8-2.8-7.4 0-10.2L12 2.5z"
      fill={color}
      opacity="0.9"
    />
    <Path
      d="M12 4.5l4.5 4.5c2.2 2.2 2.2 5.8 0 8-2.2 2.2-5.8 2.2-8 0-2.2-2.2-2.2-5.8 0-8L12 4.5z"
      fill={color}
    />
  </Svg>
);

const MeditationIcon = ({ size = 24, color = '#fff' }: { size?: number; color?: string }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M9 11c0 1.66 1.34 3 3 3s3-1.34 3-3-1.34-3-3-3-3 1.34-3 3z"
      fill={color}
    />
    <Path
      d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"
      fill={color}
      opacity="0.6"
    />
    <Circle cx="12" cy="12" r="2" fill={color} />
  </Svg>
);

const NoSmokingIcon = ({ size = 24, color = '#fff' }: { size?: number; color?: string }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <G opacity="0.9">
      <Path
        d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zM4 12c0-4.42 3.58-8 8-8 1.85 0 3.55.63 4.9 1.69L5.69 16.9C4.63 15.55 4 13.85 4 12zm8 8c-1.85 0-3.55-.63-4.9-1.69L18.31 7.1C19.37 8.45 20 10.15 20 12c0 4.42-3.58 8-8 8z"
        fill={color}
      />
      <Rect x="16" y="15" width="6" height="4" rx="1" fill={color} opacity="0.8" />
      <Rect x="18.5" y="11" width="1" height="3" rx="0.5" fill={color} opacity="0.6" />
      <Rect x="20.5" y="10" width="1" height="4" rx="0.5" fill={color} opacity="0.6" />
    </G>
  </Svg>
);

const TrophyIcon = ({ size = 24, color = '#fff' }: { size?: number; color?: string }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M19 5h-2V3H7v2H5c-1.1 0-2 .9-2 2v1c0 2.55 1.92 4.63 4.39 4.94.63 1.5 1.98 2.63 3.61 2.96V19H8v2h8v-2h-3v-3.1c1.63-.33 2.98-1.46 3.61-2.96C19.08 12.63 21 10.55 21 8V7c0-1.1-.9-2-2-2zM5 8V7h2v3.82C5.84 10.4 5 9.3 5 8zm14 0c0 1.3-.84 2.4-2 2.82V7h2v1z"
      fill={color}
    />
  </Svg>
);

const BookIcon = ({ size = 24, color = '#fff' }: { size?: number; color?: string }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M18 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zM6 4h5v8l-2.5-1.5L6 12V4z"
      fill={color}
    />
  </Svg>
);

const DumbbellIcon = ({ size = 24, color = '#fff' }: { size?: number; color?: string }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M20.57 14.86L22 13.43 20.57 12 17 15.57 8.43 7 12 3.43 10.57 2 9.14 3.43 7.71 2 5.57 4.14 4.14 2.71 2.71 4.14l1.43 1.43L2 7.71l1.43 1.43L2 10.57 3.43 12 7 8.43 15.57 17 12 20.57 13.43 22l1.43-1.43L16.29 22l2.14-2.14 1.43 1.43 1.43-1.43-1.43-1.43L22 16.29z"
      fill={color}
    />
  </Svg>
);

const ForkKnifeIcon = ({ size = 24, color = '#fff' }: { size?: number; color?: string }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M8.1 13.34l2.83-2.83L3.91 3.5c-1.56 1.56-1.56 4.09 0 5.66l4.19 4.18zm6.78-1.81c1.53.71 3.68.21 5.27-1.38 1.91-1.91 2.28-4.65.81-6.12-1.46-1.46-4.2-1.1-6.12.81-1.59 1.59-2.09 3.74-1.38 5.27L3.7 19.87l1.41 1.41L12 14.41l6.88 6.88 1.41-1.41L13.41 13l1.47-1.47z"
      fill={color}
    />
  </Svg>
);

const HeartPulseIcon = ({ size = 24, color = '#fff' }: { size?: number; color?: string }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M16.5 3c-1.74 0-3.41.81-4.5 2.09C10.91 3.81 9.24 3 7.5 3 4.42 3 2 5.42 2 8.5c0 3.78 3.4 6.86 8.55 11.54L12 21.35l1.45-1.32C18.6 15.36 22 12.28 22 8.5 22 5.42 19.58 3 16.5 3zm-4.4 15.55l-.1.1-.1-.1C7.14 14.24 4 11.39 4 8.5 4 6.5 5.5 5 7.5 5c1.54 0 3.04.99 3.57 2.36h1.87C13.46 5.99 14.96 5 16.5 5c2 0 3.5 1.5 3.5 3.5 0 2.89-3.14 5.74-7.9 10.05z"
      fill={color}
    />
  </Svg>
);

const BriefcaseIcon = ({ size = 24, color = '#fff' }: { size?: number; color?: string }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M20 6h-4V4c0-1.1-.9-2-2-2h-4c-1.1 0-2 .9-2 2v2H4c-1.1 0-2 .9-2 2v11c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2zM10 4h4v2h-4V4zm10 15H4V8h16v11z"
      fill={color}
    />
  </Svg>
);

const TEMPLATES = [
  { id: 'morning-workout', icon: 'running', title: 'Morning workout', time: '07:00', type: 'binary' as const, category: 'health' },
  { id: 'meditation', icon: 'meditation', title: 'Meditation', time: '06:30', type: 'binary' as const, category: 'health' },
  { id: 'drink-water', icon: 'water', title: 'Drink water', time: '08:00', type: 'numerical' as const, target: 8, unit: 'glasses', category: 'health' },
  { id: 'quit-smoking', icon: 'no-smoking', title: 'Quit smoking', time: '00:00', type: 'negative' as const, category: 'health' },
];

const HABIT_ICONS = [
  { id: 'trophy', custom: true },
  { id: 'running', custom: true },
  { id: 'water', custom: true },
  { id: 'book', custom: true },
  { id: 'meditation', custom: true },
  { id: 'dumbbell', custom: true },
  { id: 'no-smoking', custom: true },
  { id: 'fork-knife', custom: true },
];

const CATEGORIES = [
  { id: 'health', label: 'Health', custom: true },
  { id: 'work', label: 'Work', custom: true },
  { id: 'food', label: 'Food', custom: true },
];

// Типы привычек
const HABIT_TYPES = [
  { id: 'binary', label: 'Yes/No', description: 'Simple completion', emoji: '✓' },
  { id: 'numerical', label: 'Target', description: 'With a goal', emoji: '🎯' },
  { id: 'negative', label: 'Quit', description: 'Break a habit', emoji: '🚫' },
];

// Частота повторения
const FREQUENCY_OPTIONS = [
  { id: 'daily', label: 'Daily' },
  { id: 'specific', label: 'Specific days' },
  { id: 'weekly', label: 'X times/week' },
];

const WEEKDAYS = [
  { id: 0, short: 'Su', full: 'Sunday' },
  { id: 1, short: 'Mo', full: 'Monday' },
  { id: 2, short: 'Tu', full: 'Tuesday' },
  { id: 3, short: 'We', full: 'Wednesday' },
  { id: 4, short: 'Th', full: 'Thursday' },
  { id: 5, short: 'Fr', full: 'Friday' },
  { id: 6, short: 'Sa', full: 'Saturday' },
];

const CHALLENGE_DURATIONS = [
  { id: '21', label: '21 days', description: 'Habit forming' },
  { id: '30', label: '30 days', description: 'Monthly challenge' },
  { id: '66', label: '66 days', description: 'Scientific proven' },
  { id: '90', label: '90 days', description: 'Life changing' },
  { id: 'forever', label: 'Forever', description: 'No end date' },
  { id: 'custom', label: 'Custom', description: 'Set your own' },
];

const HABIT_CATEGORY_MAP: Record<string, HabitType> = {
  health: 'health',
  work: 'productivity',
  food: 'personal',
};

const HABIT_TYPE_TO_CATEGORY: Partial<Record<HabitType, string>> = {
  health: 'health',
  productivity: 'work',
  education: 'work',
  finance: 'work',
  personal: 'food',
};

const modalProps: Partial<CustomModalProps> = {
  variant: 'form',
  enableDynamicSizing: false,
  fallbackSnapPoint: '96%',
  scrollable: true,
  scrollProps: { keyboardShouldPersistTaps: 'handled' },
  contentContainerStyle: { paddingHorizontal: 20, paddingTop: 12, paddingBottom: 32 },
};

type Reminder = {
  id: string;
  time: string;
};

export default function PlannerHabitModal() {
  const { plannerHabitModal, closePlannerHabitModal } = useModalStore(
    useShallow((state) => ({
      plannerHabitModal: state.plannerHabitModal,
      closePlannerHabitModal: state.closePlannerHabitModal,
    })),
  );
  const modalRef = useRef<BottomSheetHandle>(null);
  const hasHydratedRef = useRef(false);
  const { createHabit, updateHabit, habits, goals } = usePlannerDomainStore(
    useShallow((state) => ({
      createHabit: state.createHabit,
      updateHabit: state.updateHabit,
      habits: state.habits,
      goals: state.goals,
    })),
  );
  const selectedDay = useSelectedDayStore((state) => state.selectedDate);
  const { strings } = useLocalization();
  const addTaskStrings = strings.addTask;
  const habitStrings = strings.plannerScreens.habits;
  const theme = useAppTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);

  // Form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [selectedIconId, setSelectedIconId] = useState('trophy');
  const [habitType, setHabitType] = useState<'binary' | 'numerical' | 'negative'>('binary');
  const [category, setCategory] = useState('health');
  const [frequency, setFrequency] = useState<'daily' | 'specific' | 'weekly'>('daily');
  const [selectedDays, setSelectedDays] = useState<number[]>([1, 2, 3, 4, 5]); // Default: weekdays
  const [timesPerWeek, setTimesPerWeek] = useState(3);
  const [targetValue, setTargetValue] = useState('1');
  const [targetUnit, setTargetUnit] = useState('times');
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [editingReminderId, setEditingReminderId] = useState<string | null>(null);
  const [linkedGoalId, setLinkedGoalId] = useState<string | undefined>(undefined);
  const [challengeDuration, setChallengeDuration] = useState<string>('30');
  const [customDuration, setCustomDuration] = useState('');
  const [startDate, setStartDate] = useState<Date>(new Date());
  
  const referenceDate = useMemo(() => selectedDay ?? new Date(), [selectedDay]);
  const historyCalendarRef = useRef<BottomSheetHandle>(null);
  
  const editingHabit: Habit | undefined = useMemo(() => {
    if (plannerHabitModal.mode !== 'edit' || !plannerHabitModal.habitId) {
      return undefined;
    }
    return habits.find((habit) => habit.id === plannerHabitModal.habitId);
  }, [habits, plannerHabitModal.habitId, plannerHabitModal.mode]);
  
  const habitCalendarIndicators = useMemo<CalendarIndicatorsMap>(() => {
    if (!editingHabit?.completionHistory) {
      return {};
    }
    const map: CalendarIndicatorsMap = {};
    Object.entries(editingHabit.completionHistory).forEach(([key, status]) => {
      map[key] = [status === 'done' ? 'success' : 'danger'];
    });
    return map;
  }, [editingHabit?.completionHistory]);
  
  const isEditing = plannerHabitModal.mode === 'edit' && Boolean(editingHabit);

  const goalOptions = useMemo(
    () =>
      goals.map((goal) => ({
        id: goal.id,
        title: goal.title,
      })),
    [goals],
  );

  useEffect(() => {
    if (!hasHydratedRef.current) {
      hasHydratedRef.current = true;
      if (plannerHabitModal.isOpen) {
        closePlannerHabitModal();
      }
      return;
    }

    if (plannerHabitModal.isOpen) {
      modalRef.current?.present();
    } else {
      modalRef.current?.dismiss();
    }
  }, [closePlannerHabitModal, plannerHabitModal.isOpen]);

  const resetForm = useCallback(() => {
    setTitle('');
    setDescription('');
    setSelectedIconId('trophy');
    setHabitType('binary');
    setCategory('health');
    setFrequency('daily');
    setSelectedDays([1, 2, 3, 4, 5]);
    setTimesPerWeek(3);
    setTargetValue('1');
    setTargetUnit('times');
    setReminders([]);
    setShowTimePicker(false);
    setEditingReminderId(null);
    setLinkedGoalId(undefined);
    setChallengeDuration('30');
    setCustomDuration('');
    setStartDate(new Date());
  }, []);

  useEffect(() => {
    if (!plannerHabitModal.isOpen) {
      resetForm();
    }
  }, [plannerHabitModal.isOpen, resetForm]);

  useEffect(() => {
    if (!plannerHabitModal.isOpen || plannerHabitModal.mode !== 'edit' || !editingHabit) {
      return;
    }
    setTitle(editingHabit.title);
    setDescription(editingHabit.description ?? '');
    setSelectedIconId(editingHabit.iconId ?? 'trophy');
    
    // Определяем тип привычки
    if (!editingHabit.unit) {
      setHabitType('negative');
    } else if (editingHabit.completionMode === 'boolean') {
      setHabitType('binary');
    } else {
      setHabitType('numerical');
      setTargetValue(String(editingHabit.targetPerDay ?? 1));
      setTargetUnit(editingHabit.unit ?? 'times');
    }
    
    setCategory(HABIT_TYPE_TO_CATEGORY[editingHabit.habitType] ?? 'health');
    
    // Определяем частоту
    if (editingHabit.frequency === 'daily' && editingHabit.daysOfWeek?.length === 7) {
      setFrequency('daily');
    } else if (editingHabit.daysOfWeek && editingHabit.daysOfWeek.length > 0) {
      setFrequency('specific');
      setSelectedDays(editingHabit.daysOfWeek);
    } else {
      setFrequency('weekly');
      setTimesPerWeek(editingHabit.timesPerWeek ?? 3);
    }
    
    // Напоминания
    if (editingHabit.timeOfDay) {
      setReminders([{ id: '1', time: editingHabit.timeOfDay }]);
    }
    
    // Challenge duration
    if (editingHabit.challengeLengthDays) {
      const durationStr = String(editingHabit.challengeLengthDays);
      if (['21', '30', '66', '90'].includes(durationStr)) {
        setChallengeDuration(durationStr);
      } else {
        setChallengeDuration('custom');
        setCustomDuration(durationStr);
      }
    } else {
      setChallengeDuration('forever');
    }
    
    setLinkedGoalId(editingHabit.goalId ?? editingHabit.linkedGoalIds?.[0]);
  }, [editingHabit, plannerHabitModal.isOpen, plannerHabitModal.mode]);

  useEffect(() => {
    if (plannerHabitModal.isOpen) {
      setLinkedGoalId(plannerHabitModal.goalId ?? undefined);
    }
  }, [plannerHabitModal.goalId, plannerHabitModal.isOpen]);

  const handleTemplatePress = (template: typeof TEMPLATES[0]) => {
    setTitle(template.title);
    setSelectedIconId(template.icon);
    setHabitType(template.type);
    setCategory(template.category);
    
    if (template.type === 'numerical' && 'target' in template) {
      setTargetValue(String(template.target));
      setTargetUnit(template.unit || 'times');
    }
    
    if (template.time !== '00:00') {
      setReminders([{ id: Date.now().toString(), time: template.time }]);
    }
  };

  const handleAddReminder = () => {
    const newReminder: Reminder = {
      id: Date.now().toString(),
      time: '08:00',
    };
    setReminders([...reminders, newReminder]);
  };

  const handleRemoveReminder = (id: string) => {
    setReminders(reminders.filter((r) => r.id !== id));
  };

  const handleUpdateReminderTime = (id: string, time: string) => {
    setReminders(reminders.map((r) => (r.id === id ? { ...r, time } : r)));
  };

  const handleOpenTimePicker = (reminderId: string, currentTime: string) => {
    setEditingReminderId(reminderId);
    if (Platform.OS === 'android') {
      const [hours, minutes] = currentTime.split(':');
      const date = new Date();
      date.setHours(parseInt(hours, 10));
      date.setMinutes(parseInt(minutes, 10));
      
      DateTimePickerAndroid.open({
        value: date,
        mode: 'time',
        is24Hour: true,
        display: 'clock',
        onChange: (event, selected) => {
          if (event.type === 'set' && selected) {
            const hours = selected.getHours().toString().padStart(2, '0');
            const minutes = selected.getMinutes().toString().padStart(2, '0');
            handleUpdateReminderTime(reminderId, `${hours}:${minutes}`);
          }
          setEditingReminderId(null);
        },
      });
      return;
    }
    setShowTimePicker(true);
  };

  const currentReminderTime = useMemo(() => {
    if (!editingReminderId) return new Date();
    const reminder = reminders.find((r) => r.id === editingReminderId);
    if (!reminder) return new Date();
    const [hours, minutes] = reminder.time.split(':');
    const date = new Date();
    date.setHours(parseInt(hours, 10));
    date.setMinutes(parseInt(minutes, 10));
    date.setSeconds(0);
    date.setMilliseconds(0);
    return date;
  }, [editingReminderId, reminders]);

  const handleIosTimeChange = useCallback(
    (event: DateTimePickerEvent, selected?: Date) => {
      if (event.type === 'dismissed') {
        setShowTimePicker(false);
        setEditingReminderId(null);
        return;
      }
      if (selected && editingReminderId) {
        const hours = selected.getHours().toString().padStart(2, '0');
        const minutes = selected.getMinutes().toString().padStart(2, '0');
        handleUpdateReminderTime(editingReminderId, `${hours}:${minutes}`);
      }
      setShowTimePicker(false);
      setEditingReminderId(null);
    },
    [editingReminderId],
  );

  const toggleWeekday = (dayId: number) => {
    if (selectedDays.includes(dayId)) {
      // Не позволяем убрать все дни
      if (selectedDays.length > 1) {
        setSelectedDays(selectedDays.filter((d) => d !== dayId));
      }
    } else {
      setSelectedDays([...selectedDays, dayId].sort());
    }
  };

  const buildHabitPayload = useCallback(() => {
    const normalizedTitle = title.trim();
    const normalizedDescription = description.trim();
    const habitTypeCategory = HABIT_CATEGORY_MAP[category] ?? 'personal';
    
    let daysOfWeek: number[];
    let timesPerWeekValue: number;
    let frequencyValue: 'daily' | 'weekly';
    
    if (frequency === 'daily') {
      daysOfWeek = [0, 1, 2, 3, 4, 5, 6];
      timesPerWeekValue = 7;
      frequencyValue = 'daily';
    } else if (frequency === 'specific') {
      daysOfWeek = selectedDays;
      timesPerWeekValue = selectedDays.length;
      frequencyValue = 'daily';
    } else {
      daysOfWeek = [];
      timesPerWeekValue = timesPerWeek;
      frequencyValue = 'weekly';
    }
    
    let completionMode: 'boolean' | 'numeric';
    let targetPerDay: number;
    let unit: string | undefined;
    
    if (habitType === 'binary') {
      completionMode = 'boolean';
      targetPerDay = 1;
      unit = 'count';
    } else if (habitType === 'numerical') {
      completionMode = 'numeric';
      targetPerDay = parseInt(targetValue, 10) || 1;
      unit = targetUnit;
    } else {
      // negative
      completionMode = 'boolean';
      targetPerDay = 0;
      unit = undefined;
    }
    
    // Calculate challenge length
    let challengeLengthDays: number | undefined;
    if (challengeDuration === 'forever') {
      challengeLengthDays = undefined;
    } else if (challengeDuration === 'custom') {
      challengeLengthDays = parseInt(customDuration, 10) || 30;
    } else {
      challengeLengthDays = parseInt(challengeDuration, 10);
    }
    
    // Calculate end date if challenge has duration
    let endDate: Date | undefined;
    if (challengeLengthDays) {
      endDate = new Date(startDate);
      endDate.setDate(endDate.getDate() + challengeLengthDays);
    }
    
    return {
      userId: 'local-user',
      title: normalizedTitle || 'New habit',
      description: normalizedDescription || undefined,
      iconId: selectedIconId,
      habitType: habitTypeCategory,
      status: 'active' as const,
      frequency: frequencyValue,
      daysOfWeek,
      timesPerWeek: timesPerWeekValue,
      timeOfDay: reminders.length > 0 ? reminders[0].time : undefined,
      completionMode,
      targetPerDay,
      unit,
      streakCurrent: 0,
      streakBest: 0,
      challengeLengthDays,
      startDate: startDate.toISOString(),
      endDate: endDate?.toISOString(),
      completionRate30d: 0,
      goalId: linkedGoalId,
      linkedGoalIds: linkedGoalId ? [linkedGoalId] : undefined,
    };
  }, [
    category,
    description,
    frequency,
    habitType,
    linkedGoalId,
    reminders,
    selectedDays,
    selectedIconId,
    targetUnit,
    targetValue,
    timesPerWeek,
    title,
    challengeDuration,
    customDuration,
    startDate,
  ]);

  const handleSubmit = useCallback(
    (options?: { keepOpen?: boolean }) => {
      if (!title.trim()) {
        return;
      }
      const payload = buildHabitPayload();
      if (isEditing && editingHabit) {
        updateHabit(editingHabit.id, {
          ...payload,
          completionHistory: editingHabit.completionHistory,
        });
      } else {
        createHabit(payload);
      }
      if (options?.keepOpen) {
        resetForm();
        return;
      }
      closePlannerHabitModal();
    },
    [
      buildHabitPayload,
      closePlannerHabitModal,
      createHabit,
      editingHabit,
      isEditing,
      resetForm,
      title,
      updateHabit,
    ],
  );

  const renderHabitIcon = (iconId: string, size: number, color: string) => {
    switch (iconId) {
      case 'trophy':
        return <TrophyIcon size={size} color={color} />;
      case 'running':
        return <RunningIcon size={size} color={color} />;
      case 'water':
        return <WaterIcon size={size} color={color} />;
      case 'book':
        return <BookIcon size={size} color={color} />;
      case 'meditation':
        return <MeditationIcon size={size} color={color} />;
      case 'dumbbell':
        return <DumbbellIcon size={size} color={color} />;
      case 'no-smoking':
        return <NoSmokingIcon size={size} color={color} />;
      case 'fork-knife':
        return <ForkKnifeIcon size={size} color={color} />;
      case 'health':
        return <HeartPulseIcon size={size} color={color} />;
      case 'work':
        return <BriefcaseIcon size={size} color={color} />;
      case 'food':
        return <ForkKnifeIcon size={size} color={color} />;
      default:
        return <TrophyIcon size={size} color={color} />;
    }
  };

  const disablePrimary = !title.trim();

  return (
    <>
      <CustomModal ref={modalRef} onDismiss={closePlannerHabitModal} {...modalProps}>
        <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <ScrollView
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={styles.scrollContent}
          >
            {/* Header */}
            <View style={[styles.header, styles.sectionPadding]}>
              <Text style={styles.headerTitle}>{isEditing ? 'EDIT HABIT' : 'NEW HABIT'}</Text>
            </View>

            {/* Popular habits */}
            <View style={[styles.section, styles.sectionNoPadding]}>
              <Text style={[styles.sectionLabel, { paddingHorizontal: 20 }]}>Popular habits</Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.popularHabitsScroll}
              >
                {TEMPLATES.map((template) => (
                  <Pressable
                    key={template.id}
                    onPress={() => handleTemplatePress(template)}
                    style={({ pressed }) => [styles.popularHabitCard, pressed && styles.pressed]}
                  >
                    <AdaptiveGlassView style={styles.popularHabitInner}>
                      <View style={styles.popularHabitIcon}>
                        {renderHabitIcon(template.icon, 36, theme.colors.textPrimary)}
                      </View>
                      <Text style={styles.popularHabitLabel}>{template.title}</Text>
                      {template.time !== '00:00' && (
                        <Text style={styles.popularHabitTime}>⏰ {template.time}</Text>
                      )}
                    </AdaptiveGlassView>
                  </Pressable>
                ))}
              </ScrollView>
            </View>

            {/* Habit name */}
            <View style={[styles.section, styles.sectionPadding]}>
              <Text style={styles.sectionLabel}>Habit name</Text>
              <View style={styles.titleRow}>
                <Pressable style={({ pressed }) => [styles.iconSelector, pressed && styles.pressed]}>
                  <AdaptiveGlassView style={styles.iconSelectorInner}>
                    {renderHabitIcon(selectedIconId, 24, theme.colors.textPrimary)}
                  </AdaptiveGlassView>
                </Pressable>
                <AdaptiveGlassView style={styles.titleInput}>
                  <TextInput
                    value={title}
                    onChangeText={setTitle}
                    placeholder="Title"
                    placeholderTextColor={theme.colors.textMuted}
                    style={styles.textInput}
                  />
                </AdaptiveGlassView>
              </View>
            </View>

            {/* Description */}
            <View style={[styles.section, styles.sectionPadding]}>
              <AdaptiveGlassView style={styles.descriptionContainer}>
                <TextInput
                  value={description}
                  onChangeText={setDescription}
                  placeholder="Description (optional)"
                  placeholderTextColor={theme.colors.textMuted}
                  multiline
                  style={styles.descriptionInput}
                />
              </AdaptiveGlassView>
            </View>

            {/* Icon selector */}
            <View style={[styles.section, styles.sectionNoPadding]}>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.iconsList}
              >
                {HABIT_ICONS.map((item) => {
                  const isActive = selectedIconId === item.id;
                  return (
                    <Pressable
                      key={item.id}
                      onPress={() => setSelectedIconId(item.id)}
                      style={({ pressed }) => [styles.iconButton, pressed && styles.pressed]}
                    >
                      <AdaptiveGlassView
                        style={[
                          styles.iconButtonInner,
                          { opacity: isActive ? 1 : 0.6 },
                        ]}
                      >
                        {renderHabitIcon(
                          item.id,
                          24,
                          isActive ? theme.colors.textPrimary : theme.colors.textSecondary,
                        )}
                      </AdaptiveGlassView>
                    </Pressable>
                  );
                })}
              </ScrollView>
            </View>

            {/* Habit type */}
            <View style={[styles.section, styles.sectionPadding]}>
              <Text style={styles.sectionLabel}>Habit type</Text>
              <View style={styles.habitTypeRow}>
                {HABIT_TYPES.map((type) => {
                  const isActive = habitType === type.id;
                  return (
                    <Pressable
                      key={type.id}
                      onPress={() => setHabitType(type.id as any)}
                      style={({ pressed }) => [styles.habitTypeButton, pressed && styles.pressed]}
                    >
                      <AdaptiveGlassView
                        style={[
                          styles.habitTypeButtonInner,
                          { opacity: isActive ? 1 : 0.6 },
                        ]}
                      >
                        <Text style={styles.habitTypeIcon}>{type.emoji}</Text>
                        <Text
                          style={[
                            styles.habitTypeLabel,
                            { color: isActive ? theme.colors.textPrimary : theme.colors.textSecondary },
                          ]}
                        >
                          {type.label}
                        </Text>
                        <Text style={styles.habitTypeDescription}>{type.description}</Text>
                      </AdaptiveGlassView>
                    </Pressable>
                  );
                })}
              </View>
            </View>

            {/* Target (только для numerical) */}
            {habitType === 'numerical' && (
              <View style={[styles.section, styles.sectionPadding]}>
                <Text style={styles.sectionLabel}>Daily goal</Text>
                <View style={styles.targetRow}>
                  <AdaptiveGlassView style={styles.targetInput}>
                    <TextInput
                      value={targetValue}
                      onChangeText={setTargetValue}
                      placeholder="0"
                      placeholderTextColor={theme.colors.textMuted}
                      keyboardType="numeric"
                      style={styles.textInput}
                    />
                  </AdaptiveGlassView>
                  <AdaptiveGlassView style={styles.unitInput}>
                    <TextInput
                      value={targetUnit}
                      onChangeText={setTargetUnit}
                      placeholder="times"
                      placeholderTextColor={theme.colors.textMuted}
                      style={styles.textInput}
                    />
                  </AdaptiveGlassView>
                </View>
              </View>
            )}

            {/* Categories */}
            <View style={[styles.section, styles.sectionPadding]}>
              <Text style={styles.sectionLabel}>Category</Text>
              <View style={styles.categoriesRow}>
                {CATEGORIES.map((cat) => {
                  const isActive = category === cat.id;
                  return (
                    <Pressable
                      key={cat.id}
                      onPress={() => setCategory(cat.id)}
                      style={({ pressed }) => [styles.categoryButton, pressed && styles.pressed]}
                    >
                      <AdaptiveGlassView
                        style={[
                          styles.categoryButtonInner,
                          { opacity: isActive ? 1 : 0.6 },
                        ]}
                      >
                        {renderHabitIcon(
                          cat.id,
                          20,
                          isActive ? theme.colors.textPrimary : theme.colors.textSecondary,
                        )}
                        <Text
                          style={[
                            styles.categoryButtonText,
                            { color: isActive ? theme.colors.textPrimary : theme.colors.textSecondary },
                          ]}
                        >
                          {cat.label}
                        </Text>
                      </AdaptiveGlassView>
                    </Pressable>
                  );
                })}
              </View>
            </View>

            {/* Frequency */}
            <View style={[styles.section, styles.sectionPadding]}>
              <Text style={styles.sectionLabel}>Frequency</Text>
              <View style={styles.frequencyRow}>
                {FREQUENCY_OPTIONS.map((freq) => {
                  const isActive = frequency === freq.id;
                  return (
                    <Pressable
                      key={freq.id}
                      onPress={() => setFrequency(freq.id as any)}
                      style={({ pressed }) => [styles.frequencyButton, pressed && styles.pressed]}
                    >
                      <AdaptiveGlassView
                        style={[
                          styles.frequencyButtonInner,
                          { opacity: isActive ? 1 : 0.6 },
                        ]}
                      >
                        <Text
                          style={[
                            styles.frequencyButtonText,
                            { color: isActive ? theme.colors.textPrimary : theme.colors.textSecondary },
                          ]}
                        >
                          {freq.label}
                        </Text>
                      </AdaptiveGlassView>
                    </Pressable>
                  );
                })}
              </View>
            </View>

            {/* Specific days selector */}
            {frequency === 'specific' && (
              <View style={[styles.section, styles.sectionPadding]}>
                <Text style={styles.sectionLabel}>Select days</Text>
                <View style={styles.weekdaysRow}>
                  {WEEKDAYS.map((day) => {
                    const isActive = selectedDays.includes(day.id);
                    return (
                      <Pressable
                        key={day.id}
                        onPress={() => toggleWeekday(day.id)}
                        style={({ pressed }) => [styles.weekdayButton, pressed && styles.pressed]}
                      >
                        <AdaptiveGlassView
                          style={[
                            styles.weekdayButtonInner,
                            { opacity: isActive ? 1 : 0.5 },
                          ]}
                        >
                          <Text
                            style={[
                              styles.weekdayText,
                              { color: isActive ? theme.colors.textPrimary : theme.colors.textSecondary },
                            ]}
                          >
                            {day.short}
                          </Text>
                        </AdaptiveGlassView>
                      </Pressable>
                    );
                  })}
                </View>
              </View>
            )}

            {/* Times per week */}
            {frequency === 'weekly' && (
              <View style={[styles.section, styles.sectionPadding]}>
                <Text style={styles.sectionLabel}>Times per week</Text>
                <View style={styles.timesPerWeekRow}>
                  {[1, 2, 3, 4, 5, 6, 7].map((num) => {
                    const isActive = timesPerWeek === num;
                    return (
                      <Pressable
                        key={num}
                        onPress={() => setTimesPerWeek(num)}
                        style={({ pressed }) => [styles.timesButton, pressed && styles.pressed]}
                      >
                        <AdaptiveGlassView
                          style={[
                            styles.timesButtonInner,
                            { opacity: isActive ? 1 : 0.5 },
                          ]}
                        >
                        <Text
                          style={[
                            styles.timesButtonText,
                            { color: isActive ? theme.colors.textPrimary : theme.colors.textSecondary },
                          ]}
                        >
                          {num}
                        </Text>
                        </AdaptiveGlassView>
                      </Pressable>
                    );
                  })}
                </View>
              </View>
            )}

            {/* Challenge Duration */}
            <View style={[styles.section, styles.sectionPadding]}>
              <Text style={styles.sectionLabel}>Challenge duration</Text>
              <Text style={styles.sectionDescription}>
                How long do you want to commit to this habit?
              </Text>
              <View style={styles.challengeGrid}>
                {CHALLENGE_DURATIONS.map((duration) => {
                  const isActive = challengeDuration === duration.id;
                  return (
                    <Pressable
                      key={duration.id}
                      onPress={() => setChallengeDuration(duration.id)}
                      style={({ pressed }) => [
                        styles.challengeButton,
                        pressed && styles.pressed,
                      ]}
                    >
                      <AdaptiveGlassView
                        style={[
                          styles.challengeButtonInner,
                          { opacity: isActive ? 1 : 0.6 },
                        ]}
                      >
                        <Text
                          style={[
                            styles.challengeButtonLabel,
                            { color: isActive ? theme.colors.textPrimary : theme.colors.textSecondary },
                          ]}
                        >
                          {duration.label}
                        </Text>
                        <Text style={styles.challengeButtonDescription}>
                          {duration.description}
                        </Text>
                      </AdaptiveGlassView>
                    </Pressable>
                  );
                })}
              </View>
              
              {/* Custom duration input */}
              {challengeDuration === 'custom' && (
                <View style={styles.customDurationRow}>
                  <AdaptiveGlassView style={styles.customDurationInput}>
                    <TextInput
                      value={customDuration}
                      onChangeText={setCustomDuration}
                      placeholder="Enter days"
                      placeholderTextColor={theme.colors.textMuted}
                      keyboardType="numeric"
                      style={styles.textInput}
                    />
                  </AdaptiveGlassView>
                  <Text style={styles.customDurationLabel}>days</Text>
                </View>
              )}
              
              {/* Duration summary */}
              {challengeDuration !== 'forever' && (
                <View style={styles.durationSummary}>
                  <Ionicons name="calendar-outline" size={14} color={theme.colors.textSecondary} />
                  <Text style={styles.durationSummaryText}>
                    Starting {startDate.toLocaleDateString()} • Ending{' '}
                    {(() => {
                      const days =
                        challengeDuration === 'custom'
                          ? parseInt(customDuration, 10) || 0
                          : parseInt(challengeDuration, 10) || 0;
                      const endDate = new Date(startDate);
                      endDate.setDate(endDate.getDate() + days);
                      return endDate.toLocaleDateString();
                    })()}
                  </Text>
                </View>
              )}
            </View>

            {goalOptions.length > 0 && (
              <View style={[styles.section, styles.sectionPadding]}>
                <Text style={styles.sectionLabel}>{addTaskStrings.goalLabel}</Text>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.goalScroll}
                >
                  <Pressable onPress={() => setLinkedGoalId(undefined)}>
                    <AdaptiveGlassView
                      style={[
                        styles.goalChip,
                        styles.glassSurface,
                        { opacity: linkedGoalId ? 0.5 : 1 },
                      ]}
                    >
                      <Text
                        style={[
                          styles.goalChipLabel,
                          { color: linkedGoalId ? theme.colors.textMuted : theme.colors.textPrimary },
                        ]}
                      >
                        {addTaskStrings.goalUnset}
                      </Text>
                    </AdaptiveGlassView>
                  </Pressable>
                  {goalOptions.map((goal) => {
                    const active = goal.id === linkedGoalId;
                    return (
                      <Pressable key={goal.id} onPress={() => setLinkedGoalId(goal.id)}>
                        <AdaptiveGlassView
                          style={[
                            styles.goalChip,
                            styles.glassSurface,
                            { opacity: active ? 1 : 0.6 },
                          ]}
                        >
                          <Text
                            style={[
                              styles.goalChipLabel,
                              { color: active ? theme.colors.textPrimary : theme.colors.textMuted },
                            ]}
                            numberOfLines={1}
                          >
                            {goal.title}
                          </Text>
                        </AdaptiveGlassView>
                      </Pressable>
                    );
                  })}
                </ScrollView>
                <Text style={styles.goalHelper}>{addTaskStrings.goalHelper}</Text>
              </View>
            )}

            {/* Reminders */}
            <View style={[styles.section, styles.sectionPadding]}>
              <View style={styles.reminderHeader}>
                <Text style={styles.sectionLabel}>Reminders</Text>
              </View>
              {reminders.map((reminder) => (
                <Pressable
                  key={reminder.id}
                  onPress={() => handleOpenTimePicker(reminder.id, reminder.time)}
                  style={({ pressed }) => [pressed && styles.pressed]}
                >
                  <AdaptiveGlassView style={styles.reminderTimeRow}>
                    <Ionicons name="alarm-outline" size={18} color={theme.colors.textSecondary} />
                    <Text style={styles.reminderTimeText}>{reminder.time}</Text>
                    <Pressable
                      onPress={() => handleRemoveReminder(reminder.id)}
                      hitSlop={8}
                    >
                      <Ionicons name="trash-outline" size={18} color={theme.colors.textSecondary} />
                    </Pressable>
                  </AdaptiveGlassView>
                </Pressable>
              ))}
              <Pressable
                onPress={handleAddReminder}
                style={({ pressed }) => [pressed && styles.pressed]}
              >
                <AdaptiveGlassView style={styles.addReminderButton}>
                  <Ionicons name="add" size={18} color={theme.colors.textSecondary} />
                  <Text style={styles.addReminderText}>Add reminder</Text>
                </AdaptiveGlassView>
              </Pressable>
            </View>

            {/* Calendar button */}
            {isEditing && (
              <View style={[styles.section, styles.sectionPadding]}>
                <Pressable
                  onPress={() => historyCalendarRef.current?.present()}
                  style={({ pressed }) => [pressed && styles.pressed]}
                >
                  <AdaptiveGlassView style={styles.calendarOpenButton}>
                    <Ionicons name="calendar-outline" size={16} color={theme.colors.textSecondary} />
                    <Text style={styles.calendarOpenText}>{habitStrings.calendarButton}</Text>
                  </AdaptiveGlassView>
                </Pressable>
              </View>
            )}

            {/* AI Suggestions */}
            <View style={styles.aiSuggestion}>
              <Text style={styles.aiSuggestionIcon}>💡</Text>
              <View style={styles.aiTextContainer}>
                <Text style={styles.aiText}>
                  AI:{' '}
                  <Text style={{ color: theme.colors.textPrimary }}>
                    Start with small goals. For new habits, it's better to aim for consistency rather than intensity.
                  </Text>
                </Text>
              </View>
            </View>

            {habitType === 'numerical' && (
              <View style={styles.aiSuggestion}>
                <Text style={styles.aiSuggestionIcon}>💡</Text>
                <View style={styles.aiTextContainer}>
                <Text style={styles.aiText}>
                  AI:{' '}
                  <Text style={{ color: theme.colors.textPrimary }}>
                    Track your progress daily. Studies show that tracking increases success rate by 42%.
                  </Text>
                </Text>
                </View>
              </View>
            )}

            {/* Action Buttons */}
            <View style={styles.actionButtons}>
              <Pressable
                disabled={disablePrimary}
                onPress={() => handleSubmit({ keepOpen: true })}
                style={({ pressed }) => [
                  styles.secondaryButton,
                  pressed && !disablePrimary && styles.pressed,
                  disablePrimary && { opacity: 0.4 },
                ]}
              >
                <Text style={styles.secondaryButtonText}>Create and more</Text>
              </Pressable>
              <Pressable
                disabled={disablePrimary}
                onPress={() => handleSubmit()}
                style={({ pressed }) => [
                  styles.primaryButton,
                  pressed && !disablePrimary && styles.pressed,
                ]}
              >
                <AdaptiveGlassView
                  style={[
                    styles.primaryButtonInner,
                    { opacity: disablePrimary ? 0.4 : 1 },
                  ]}
                >
                  <Text style={styles.primaryButtonText}>
                    {isEditing ? 'Save changes' : 'Create habit'}
                  </Text>
                </AdaptiveGlassView>
              </Pressable>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </CustomModal>

      <DateChangeModal
        ref={historyCalendarRef}
        selectedDate={referenceDate}
        indicators={habitCalendarIndicators}
        onSelectDate={() => historyCalendarRef.current?.dismiss()}
      />

      {Platform.OS === 'ios' && showTimePicker && editingReminderId && (
        <Modal transparent visible animationType="fade" onRequestClose={() => setShowTimePicker(false)}>
          <View style={styles.timePickerModal}>
            <Pressable style={styles.timePickerBackdrop} onPress={() => setShowTimePicker(false)} />
            <AdaptiveGlassView style={styles.timePickerCard}>
              <DateTimePicker
                value={currentReminderTime}
                mode="time"
                is24Hour
                display="spinner"
                onChange={handleIosTimeChange}
              />
              <Pressable style={styles.timePickerDoneButton} onPress={() => setShowTimePicker(false)}>
                <Text style={styles.timePickerDoneText}>Done</Text>
              </Pressable>
            </AdaptiveGlassView>
          </View>
        </Modal>
      )}
    </>
  );
}

const createStyles = (theme: ReturnType<typeof useAppTheme>) =>
  StyleSheet.create({
  glassSurface: {
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: theme.colors.border,
    backgroundColor: theme.mode === 'dark' ? 'rgba(255,255,255,0.04)' : 'rgba(15,23,42,0.04)',
  },
  scrollContent: {
    paddingTop: 12,
    paddingBottom: 32,
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
  },
  headerTitle: {
    fontSize: 13,
    fontWeight: '600',
    letterSpacing: 1.2,
    color: theme.colors.textSecondary,
  },
  section: {
    marginBottom: 20,
  },
  sectionPadding: {
    paddingHorizontal: 20,
  },
  sectionNoPadding: {
    paddingHorizontal: 0,
  },
  sectionLabel: {
    fontSize: 14,
    fontWeight: '400',
    color: theme.colors.textSecondary,
    marginBottom: 12,
  },
  sectionDescription: {
    fontSize: 12,
    color: theme.colors.textMuted,
    marginTop: -6,
    marginBottom: 12,
  },
  popularHabitsScroll: {
    gap: 12,
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  popularHabitCard: {
    borderRadius: 16,
  },
  popularHabitInner: {
    width: 120,
    height: 120,
    borderRadius: 16,
    padding: 12,
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  popularHabitIcon: {
    marginTop: 8,
  },
  popularHabitLabel: {
    fontSize: 13,
    fontWeight: '500',
    textAlign: 'center',
    color: theme.colors.textPrimary,
  },
  popularHabitTime: {
    fontSize: 11,
    fontWeight: '400',
    color: theme.colors.textMuted,
  },
  titleRow: {
    flexDirection: 'row',
    gap: 12,
  },
  iconSelector: {
    borderRadius: 16,
  },
  iconSelectorInner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 14,
    paddingVertical: 14,
    borderRadius: 16,
  },
  titleInput: {
    flex: 1,
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  textInput: {
    fontSize: 15,
    fontWeight: '400',
    color: theme.colors.textPrimary,
  },
  descriptionContainer: {
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 14,
    minHeight: 60,
  },
  descriptionInput: {
    fontSize: 15,
    fontWeight: '400',
    textAlignVertical: 'top',
    color: theme.colors.textPrimary,
  },
  iconsList: {
    gap: 12,
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  iconButton: {
    borderRadius: 24,
  },
  iconButtonInner: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  habitTypeRow: {
    flexDirection: 'row',
    gap: 12,
  },
  habitTypeButton: {
    flex: 1,
    borderRadius: 16,
  },
  habitTypeButtonInner: {
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    paddingVertical: 14,
    borderRadius: 16,
  },
  habitTypeIcon: {
    fontSize: 24,
  },
  habitTypeLabel: {
    fontSize: 13,
    fontWeight: '500',
  },
  habitTypeDescription: {
    fontSize: 10,
    color: theme.colors.textMuted,
  },
  targetRow: {
    flexDirection: 'row',
    gap: 12,
  },
  targetInput: {
    flex: 1,
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  unitInput: {
    flex: 2,
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  categoriesRow: {
    flexDirection: 'row',
    gap: 12,
  },
  categoryButton: {
    flex: 1,
    borderRadius: 16,
  },
  categoryButtonInner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 16,
  },
  categoryButtonText: {
    fontSize: 13,
    fontWeight: '500',
  },
  frequencyRow: {
    flexDirection: 'row',
    gap: 12,
  },
  frequencyButton: {
    flex: 1,
    borderRadius: 16,
  },
  frequencyButtonInner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 16,
  },
  frequencyButtonText: {
    fontSize: 13,
    fontWeight: '500',
  },
  weekdaysRow: {
    flexDirection: 'row',
    gap: 8,
  },
  weekdayButton: {
    flex: 1,
    borderRadius: 12,
  },
  weekdayButtonInner: {
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
  },
  weekdayText: {
    fontSize: 12,
    fontWeight: '600',
  },
  timesPerWeekRow: {
    flexDirection: 'row',
    gap: 8,
  },
  timesButton: {
    flex: 1,
    borderRadius: 12,
  },
  timesButtonInner: {
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
  },
  timesButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  challengeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  challengeButton: {
    width: '48%',
    borderRadius: 16,
  },
  challengeButtonInner: {
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderRadius: 16,
    alignItems: 'center',
    gap: 4,
  },
  challengeButtonLabel: {
    fontSize: 14,
    fontWeight: '600',
  },
  challengeButtonDescription: {
    fontSize: 11,
    color: theme.colors.textMuted,
    textAlign: 'center',
  },
  customDurationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginTop: 12,
  },
  customDurationInput: {
    flex: 1,
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  customDurationLabel: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    fontWeight: '500',
  },
  durationSummary: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: theme.mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(15,23,42,0.04)',
    borderRadius: 12,
  },
  durationSummaryText: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    flex: 1,
  },
  goalScroll: {
    gap: 10,
    paddingVertical: 6,
  },
  goalChip: {
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginRight: 10,
    minWidth: 120,
  },
  goalChipLabel: {
    fontSize: 13,
    fontWeight: '600',
  },
  goalHelper: {
    marginTop: 6,
    fontSize: 12,
    color: theme.colors.textMuted,
  },
  reminderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  reminderTimeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 16,
    marginBottom: 12,
  },
  reminderTimeText: {
    flex: 1,
    fontSize: 14,
    fontWeight: '400',
    color: theme.colors.textPrimary,
  },
  addReminderButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    borderRadius: 16,
  },
  addReminderText: {
    fontSize: 14,
    fontWeight: '400',
    color: theme.colors.textSecondary,
  },
  calendarOpenButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderRadius: 16,
    paddingVertical: 12,
  },
  calendarOpenText: {
    fontSize: 13,
    fontWeight: '600',
    color: theme.colors.textPrimary,
  },
  aiSuggestion: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    marginBottom: 16,
    paddingHorizontal: 20,
  },
  aiSuggestionIcon: {
    fontSize: 22,
  },
  aiTextContainer: {
    flex: 1,
  },
  aiText: {
    fontSize: 13,
    fontWeight: '400',
    lineHeight: 19,
    color: theme.colors.textSecondary,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
    paddingHorizontal: 20,
  },
  secondaryButton: {
    flex: 1,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 16,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
  },
  secondaryButtonText: {
    fontSize: 15,
    fontWeight: '400',
    color: theme.colors.textSecondary,
  },
  primaryButton: {
    flex: 1,
    borderRadius: 16,
  },
  primaryButtonInner: {
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 16,
    backgroundColor: theme.colors.primary,
  },
  primaryButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: theme.colors.onPrimary,
  },
  pressed: {
    opacity: 0.7,
  },
  timePickerModal: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  timePickerBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.35)',
  },
  timePickerCard: {
    marginHorizontal: 20,
    marginBottom: 24,
    borderRadius: 24,
    padding: 16,
    gap: 12,
  },
  timePickerDoneButton: {
    alignSelf: 'flex-end',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
  },
  timePickerDoneText: {
    fontSize: 15,
    fontWeight: '600',
    color: theme.colors.textPrimary,
  },
});
