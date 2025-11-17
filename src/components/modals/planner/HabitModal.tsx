/* eslint-disable react/no-unescaped-entities */
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  FlatList,
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
import Svg, { Path, Circle, G, Rect, Line } from 'react-native-svg';
import DateTimePicker, {
  DateTimePickerAndroid,
  DateTimePickerEvent,
} from '@react-native-community/datetimepicker';

import CustomModal, { CustomModalProps } from '@/components/modals/CustomModal';
import { BottomSheetHandle } from '@/components/modals/BottomSheet';
import { AdaptiveGlassView } from '@/components/ui/AdaptiveGlassView';
import { useModalStore } from '@/stores/useModalStore';
import { useShallow } from 'zustand/react/shallow';
import { useLocalization } from '@/localization/useLocalization';
import type { HabitCardModel } from '@/features/planner/habits/data';
import { usePlannerHabitsStore, type HabitFormInput, type PlannerHabitEntity } from '@/features/planner/useHabitsStore';
import type { PlannerHabitId } from '@/types/planner';

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
  { id: 'morning-workout', icon: 'running', title: 'Morning workout', time: '07:00' },
  { id: 'meditation', icon: 'meditation', title: 'Meditation', time: '06:30' },
  { id: 'drink-water', icon: 'water', title: 'Drink water', time: '08:00' },
  { id: 'quit-smoking', icon: 'no-smoking', title: 'Quit smoking', time: '00:00' },
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

const DIFFICULTY = [
  { id: 'easy', label: 'Easy', emoji: '🍃' },
  { id: 'medium', label: 'Medium', emoji: '🔥' },
  { id: 'hard', label: 'Hard', emoji: '❓' },
];

const STREAK_GOALS = [7, 21, 30, 66, 100];

const modalProps: Partial<CustomModalProps> = {
  variant: 'form',
  enableDynamicSizing: false,
  fallbackSnapPoint: '96%',
  scrollable: true,
  scrollProps: { keyboardShouldPersistTaps: 'handled' },
  contentContainerStyle: { paddingHorizontal: 20, paddingTop: 12, paddingBottom: 32 },
};

export default function PlannerHabitModal() {
  const { plannerHabitModal, closePlannerHabitModal } = useModalStore(
    useShallow((state) => ({
      plannerHabitModal: state.plannerHabitModal,
      closePlannerHabitModal: state.closePlannerHabitModal,
    }))
  );
  const modalRef = useRef<BottomSheetHandle>(null);
  const hasHydratedRef = useRef(false);
  const { strings } = useLocalization();
  const habitAiStrings = strings.plannerScreens.habits.ai;
  const habitContentStrings = strings.plannerScreens.habits.data;
  const habits = usePlannerHabitsStore((state) => state.habits);
  const createHabit = usePlannerHabitsStore((state) => state.createHabit);
  const updateHabit = usePlannerHabitsStore((state) => state.updateHabit);

  // Form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [selectedIconId, setSelectedIconId] = useState('trophy');
  const [countingType, setCountingType] = useState<'create' | 'quit'>('create');
  const [category, setCategory] = useState('health');
  const [difficulty, setDifficulty] = useState('medium');
  const [reminderEnabled, setReminderEnabled] = useState(false);
  const [reminderTime, setReminderTime] = useState('07:00');
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [streakEnabled, setStreakEnabled] = useState(false);
  const [streakDays, setStreakDays] = useState(21);
  const [editingHabitId, setEditingHabitId] = useState<string | null>(null);
  const editingHabit = useMemo(
    () => habits.find((habit) => habit.id === plannerHabitModal.habitId) ?? null,
    [habits, plannerHabitModal.habitId],
  );

  const hydrateHabit = useCallback(
    (habit?: PlannerHabitEntity | null) => {
      if (!habit) {
        setEditingHabitId(null);
        return;
      }
      setEditingHabitId(habit.id);
      const localized = habit.contentKey ? habitContentStrings[habit.contentKey] : undefined;
      setTitle(habit.titleOverride ?? localized?.title ?? '');
      setDescription(habit.description ?? '');
      setSelectedIconId(habit.iconId ?? habit.contentKey ?? 'trophy');
      setCountingType(habit.countingType ?? 'create');
      setCategory(habit.category ?? 'health');
      setDifficulty(habit.difficulty ?? 'medium');
      setReminderEnabled(habit.reminderEnabled ?? false);
      setReminderTime(habit.reminderTime ?? '07:00');
      setStreakEnabled(habit.streakEnabled ?? false);
      setStreakDays(habit.streakDays ?? habit.badgeDays ?? 21);
    },
    [habitContentStrings],
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

  useEffect(() => {
    if (!plannerHabitModal.isOpen) {
      setTitle('');
      setDescription('');
      setSelectedIconId('trophy');
      setCountingType('create');
      setCategory('health');
      setDifficulty('medium');
      setReminderEnabled(false);
      setReminderTime('07:00');
      setStreakEnabled(false);
      setStreakDays(21);
      setShowTimePicker(false);
      setEditingHabitId(null);
      return;
    }
    if (plannerHabitModal.mode === 'edit') {
      hydrateHabit(editingHabit);
    } else {
      setEditingHabitId(null);
    }
  }, [editingHabit, hydrateHabit, plannerHabitModal.isOpen, plannerHabitModal.mode]);

  const handleTemplatePress = (template: typeof TEMPLATES[0]) => {
    setTitle(template.title);
    setReminderTime(template.time);
    setReminderEnabled(true);
    setSelectedIconId(template.icon);
  };

  const reminderDateValue = useMemo(() => {
    const [hours, minutes] = reminderTime.split(':');
    const date = new Date();
    date.setHours(parseInt(hours, 10));
    date.setMinutes(parseInt(minutes, 10));
    date.setSeconds(0);
    date.setMilliseconds(0);
    return date;
  }, [reminderTime]);

  const applyReminderTime = useCallback((value: Date) => {
    const hours = value.getHours().toString().padStart(2, '0');
    const minutes = value.getMinutes().toString().padStart(2, '0');
    setReminderTime(`${hours}:${minutes}`);
  }, []);

  const handleOpenTimePicker = useCallback(() => {
    if (Platform.OS === 'android') {
      DateTimePickerAndroid.open({
        value: reminderDateValue,
        mode: 'time',
        is24Hour: true,
        display: 'clock',
        onChange: (event, selected) => {
          if (event.type === 'set' && selected) {
            applyReminderTime(selected);
          }
        },
      });
      return;
    }
    setShowTimePicker(true);
  }, [applyReminderTime, reminderDateValue]);

  const handleIosTimeChange = useCallback(
    (event: DateTimePickerEvent, selected?: Date) => {
      if (event.type === 'dismissed') {
        setShowTimePicker(false);
        return;
      }
      if (selected) {
        applyReminderTime(selected);
      }
      setShowTimePicker(false);
    },
    [applyReminderTime],
  );

  const handleApplyAiSuggestion = () => {
    setDifficulty('easy');
    setStreakDays(7);
    setCategory('health');
  };

  const handleSubmit = useCallback(
    (options?: { keepOpen?: boolean }) => {
    const payload: HabitFormInput = {
      title,
      description,
      iconId: selectedIconId,
      countingType,
      category,
      difficulty: difficulty as HabitFormInput['difficulty'],
      reminderEnabled,
      reminderTime,
      streakEnabled,
      streakDays,
      weeklyTarget: editingHabit?.weeklyTarget ?? 7,
      weeklyCompleted: editingHabit?.weeklyCompleted ?? 0,
      chips: editingHabit?.chips,
      cta: editingHabit?.cta,
      linkedGoalIds: editingHabit?.linkedGoalIds,
    };
      if (editingHabitId) {
        updateHabit(editingHabitId as PlannerHabitId, payload);
      } else {
        createHabit(payload);
      }
      if (!options?.keepOpen) {
        closePlannerHabitModal();
      }
    },
    [
      category,
      closePlannerHabitModal,
      countingType,
    createHabit,
    description,
    difficulty,
    editingHabit,
    editingHabitId,
    reminderEnabled,
    reminderTime,
    selectedIconId,
      streakDays,
      streakEnabled,
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
              <Text style={styles.headerTitle}>NEW HABIT</Text>
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
                        {renderHabitIcon(template.icon, 36, '#FFFFFF')}
                      </View>
                      <Text style={styles.popularHabitLabel}>{template.title}</Text>
                      <Text style={styles.popularHabitTime}>⏰ {template.time}</Text>
                    </AdaptiveGlassView>
                  </Pressable>
                ))}
              </ScrollView>
            </View>

            {/* Goal title */}
            <View style={[styles.section, styles.sectionPadding]}>
              <Text style={styles.sectionLabel}>Goal title</Text>
              <View style={styles.titleRow}>
                <Pressable style={({ pressed }) => [styles.iconSelector, pressed && styles.pressed]}>
                  <AdaptiveGlassView style={styles.iconSelectorInner}>
                    {renderHabitIcon(selectedIconId, 24, '#FFFFFF')}
                  </AdaptiveGlassView>
                </Pressable>
                <AdaptiveGlassView style={styles.titleInput}>
                  <TextInput
                    value={title}
                    onChangeText={setTitle}
                    placeholder="Title"
                    placeholderTextColor="#7E8B9A"
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
                  placeholder="Description (not necessary)"
                  placeholderTextColor="#7E8B9A"
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
                        {renderHabitIcon(item.id, 24, isActive ? '#FFFFFF' : '#7E8B9A')}
                      </AdaptiveGlassView>
                    </Pressable>
                  );
                })}
              </ScrollView>
            </View>

            {/* Counting type */}
            <View style={[styles.section, styles.sectionPadding]}>
              <Text style={styles.sectionLabel}>Counting type</Text>
              <View style={styles.countingTypeRow}>
                <Pressable
                  onPress={() => setCountingType('create')}
                  style={({ pressed }) => [styles.countingButton, pressed && styles.pressed]}
                >
                  <AdaptiveGlassView
                    style={[
                      styles.countingButtonInner,
                      { opacity: countingType === 'create' ? 1 : 0.6 },
                    ]}
                  >
                    <Ionicons
                      name="add"
                      size={20}
                      color={countingType === 'create' ? '#FFFFFF' : '#7E8B9A'}
                    />
                    <Text
                      style={[
                        styles.countingButtonText,
                        { color: countingType === 'create' ? '#FFFFFF' : '#7E8B9A' },
                      ]}
                    >
                      Create
                    </Text>
                  </AdaptiveGlassView>
                </Pressable>
                <Pressable
                  onPress={() => setCountingType('quit')}
                  style={({ pressed }) => [styles.countingButton, pressed && styles.pressed]}
                >
                  <AdaptiveGlassView
                    style={[
                      styles.countingButtonInner,
                      { opacity: countingType === 'quit' ? 1 : 0.6 },
                    ]}
                  >
                    <Text
                      style={[
                        styles.countingButtonText,
                        { color: countingType === 'quit' ? '#FFFFFF' : '#7E8B9A' },
                      ]}
                    >
                      —  Quit
                    </Text>
                  </AdaptiveGlassView>
                </Pressable>
              </View>
            </View>

            {/* Categories */}
            <View style={[styles.section, styles.sectionPadding]}>
              <Text style={styles.sectionLabel}>Categories</Text>
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
                        {renderHabitIcon(cat.id, 20, isActive ? '#FFFFFF' : '#7E8B9A')}
                        <Text
                          style={[
                            styles.categoryButtonText,
                            { color: isActive ? '#FFFFFF' : '#7E8B9A' },
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

            {/* Difficulty */}
            <View style={[styles.section, styles.sectionPadding]}>
              <Text style={styles.sectionLabel}>Difficulty</Text>
              <View style={styles.difficultyRow}>
                {DIFFICULTY.map((level) => {
                  const isActive = difficulty === level.id;
                  return (
                    <Pressable
                      key={level.id}
                      onPress={() => setDifficulty(level.id)}
                      style={({ pressed }) => [styles.difficultyButton, pressed && styles.pressed]}
                    >
                      <AdaptiveGlassView
                        style={[
                          styles.difficultyButtonInner,
                          { opacity: isActive ? 1 : 0.6 },
                        ]}
                      >
                        <Text style={styles.difficultyIcon}>{level.emoji}</Text>
                        <Text
                          style={[
                            styles.difficultyButtonText,
                            { color: isActive ? '#FFFFFF' : '#7E8B9A' },
                          ]}
                        >
                          {level.label}
                        </Text>
                      </AdaptiveGlassView>
                    </Pressable>
                  );
                })}
              </View>
            </View>

            {/* Reminder */}
            <View style={[styles.section, styles.sectionPadding]}>
              <View style={styles.reminderHeader}>
                <Text style={styles.sectionLabel}>Reminder</Text>
                <Switch
                  value={reminderEnabled}
                  onValueChange={setReminderEnabled}
                  trackColor={{ true: '#FFFFFF', false: '#2C2C2E' }}
                  thumbColor="#000000"
                  ios_backgroundColor="#2C2C2E"
                />
              </View>
              {reminderEnabled && (
                <>
                  <Pressable
                    onPress={handleOpenTimePicker}
                    style={({ pressed }) => [pressed && styles.pressed]}
                  >
                    <AdaptiveGlassView style={styles.reminderTimeRow}>
                      <Ionicons name="alarm-outline" size={18} color="#7E8B9A" />
                      <Text style={styles.reminderTimeText}>{reminderTime}</Text>
                      <View style={styles.reminderRight}>
                        <Switch
                          value={true}
                          onValueChange={() => { }}
                          trackColor={{ true: '#FFFFFF', false: '#2C2C2E' }}
                          thumbColor="#000000"
                          ios_backgroundColor="#2C2C2E"
                        />
                        <Pressable>
                          <Ionicons name="trash-outline" size={18} color="#7E8B9A" />
                        </Pressable>
                      </View>
                    </AdaptiveGlassView>
                  </Pressable>
                  <Pressable style={({ pressed }) => [pressed && styles.pressed]}>
                    <AdaptiveGlassView style={styles.addReminderButton}>
                      <Ionicons name="add" size={18} color="#7E8B9A" />
                      <Text style={styles.addReminderText}>Add reminder</Text>
                    </AdaptiveGlassView>
                  </Pressable>
                </>
              )}
            </View>

            {/* Streak */}
            <View style={[styles.section, styles.sectionPadding]}>
              <View style={styles.streakHeader}>
                <Text style={styles.sectionLabel}>Streak</Text>
                <Switch
                  value={streakEnabled}
                  onValueChange={setStreakEnabled}
                  trackColor={{ true: '#FFFFFF', false: '#2C2C2E' }}
                  thumbColor="#000000"
                  ios_backgroundColor="#2C2C2E"
                />
              </View>
              {streakEnabled && (
                <View style={styles.streakDaysRow}>
                  {STREAK_GOALS.map((days) => {
                    const isActive = streakDays === days;
                    return (
                      <Pressable
                        key={days}
                        onPress={() => setStreakDays(days)}
                        style={({ pressed }) => [styles.streakDayButton, pressed && styles.pressed]}
                      >
                        <AdaptiveGlassView
                          style={[
                            styles.streakDayButtonInner,
                            { opacity: isActive ? 1 : 0.6 },
                          ]}
                        >
                          <Text
                            style={[
                              styles.streakDayNumber,
                              { color: isActive ? '#FFFFFF' : '#7E8B9A' },
                            ]}
                          >
                            {days}
                          </Text>
                          <Text
                            style={[
                              styles.streakDayLabel,
                              { color: isActive ? '#FFFFFF' : '#7E8B9A' },
                            ]}
                          >
                            Days
                          </Text>
                        </AdaptiveGlassView>
                      </Pressable>
                    );
                  })}
                </View>
              )}
            </View>

            {/* Streak message */}
            {streakEnabled && (
              <View style={styles.streakMessage}>
                <Text style={styles.streakMessageIcon}>🔥</Text>
                <Text style={styles.streakMessageText}>
                  Complete habit {streakDays} days straight to pin
                </Text>
              </View>
            )}

            {/* AI Suggestions */}
            <View style={styles.aiSuggestion}>
              <Text style={styles.aiSuggestionIcon}>💡</Text>
              <View style={styles.aiTextContainer}>
                <Text style={styles.aiText}>
                  AI:{' '}
                  <Text style={{ color: '#FFFFFF' }}>
                    "At the current pace, you will reach your goal in March. If you increase
                    contributions by 100k per month
                  </Text>
                </Text>
              </View>
            </View>

            <View style={styles.aiSuggestion}>
              <Text style={styles.aiSuggestionIcon}>💡</Text>
              <View style={styles.aiTextContainer}>
                <Text style={styles.aiText}>
                  AI:{' '}
                  <Text style={{ color: '#FFFFFF' }}>
                    "At the current pace, you will reach your goal in March. If you increase
                    contributions by 100k per month
                  </Text>
                </Text>
              </View>
            </View>

            {/* Action Buttons */}
            <View style={styles.actionButtons}>
              <Pressable
                onPress={() => handleSubmit({ keepOpen: true })}
                style={({ pressed }) => [styles.secondaryButton, pressed && styles.pressed]}
              >
                <Text style={styles.secondaryButtonText}>Create and more</Text>
              </Pressable>
              <Pressable
                disabled={disablePrimary}
                style={({ pressed }) => [
                  styles.primaryButton,
                  pressed && !disablePrimary && styles.pressed,
                ]}
                onPress={() => handleSubmit()}
              >
                <AdaptiveGlassView
                  style={[
                    styles.primaryButtonInner,
                    { opacity: disablePrimary ? 0.4 : 1 },
                  ]}
                >
                  <Text
                    style={[
                      styles.primaryButtonText,
                      { color: disablePrimary ? '#7E8B9A' : '#FFFFFF' },
                    ]}
                  >
                    Create goal
                  </Text>
                </AdaptiveGlassView>
              </Pressable>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </CustomModal>

      {Platform.OS === 'ios' && showTimePicker && (
        <Modal transparent visible animationType="fade" onRequestClose={() => setShowTimePicker(false)}>
          <View style={styles.timePickerModal}>
            <Pressable style={styles.timePickerBackdrop} onPress={() => setShowTimePicker(false)} />
            <AdaptiveGlassView style={styles.timePickerCard}>
              <DateTimePicker
                value={reminderDateValue}
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

const styles = StyleSheet.create({
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
    color: '#7E8B9A',
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
    color: '#7E8B9A',
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
    color: '#FFFFFF',
  },
  popularHabitTime: {
    fontSize: 11,
    fontWeight: '400',
    color: '#A0A0A0',
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
    color: '#FFFFFF',
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
    color: '#FFFFFF',
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
  countingTypeRow: {
    flexDirection: 'row',
    gap: 12,
  },
  countingButton: {
    flex: 1,
    borderRadius: 16,
  },
  countingButtonInner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 16,
  },
  countingButtonText: {
    fontSize: 14,
    fontWeight: '500',
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
  difficultyRow: {
    flexDirection: 'row',
    gap: 12,
  },
  difficultyButton: {
    flex: 1,
    borderRadius: 16,
  },
  difficultyButtonInner: {
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 16,
    borderRadius: 16,
  },
  difficultyIcon: {
    fontSize: 24,
  },
  difficultyButtonText: {
    fontSize: 13,
    fontWeight: '500',
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
    color: '#FFFFFF',
  },
  reminderRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
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
    color: '#7E8B9A',
  },
  streakHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  streakDaysRow: {
    flexDirection: 'row',
    gap: 10,
  },
  streakDayButton: {
    flex: 1,
    borderRadius: 16,
  },
  streakDayButtonInner: {
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 16,
  },
  streakDayNumber: {
    fontSize: 18,
    fontWeight: '600',
  },
  streakDayLabel: {
    fontSize: 11,
    fontWeight: '400',
  },
  streakMessage: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 20,
  },
  streakMessageIcon: {
    fontSize: 20,
  },
  streakMessageText: {
    fontSize: 13,
    fontWeight: '400',
    color: '#7E8B9A',
  },
  aiSuggestion: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    marginBottom: 16,
    paddingHorizontal: 20
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
    color: '#7E8B9A',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
    paddingHorizontal: 20
  },
  secondaryButton: {
    flex: 1,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryButtonText: {
    fontSize: 15,
    fontWeight: '400',
    color: '#7E8B9A',
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
  },
  primaryButtonText: {
    fontSize: 15,
    fontWeight: '600',
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
    color: '#FFFFFF',
  },
});
