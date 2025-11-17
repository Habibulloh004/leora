/* eslint-disable react/no-unescaped-entities */
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Slider from '@react-native-community/slider';
import Svg, { Path, Circle, Rect, G, Line } from 'react-native-svg';
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
import type { Goal } from '@/features/planner/goals/data';
import {
  usePlannerGoalsStore,
  type GoalFormInput,
  type PlannerGoalEntity,
} from '@/features/planner/useGoalsStore';
import type { PlannerGoalId } from '@/types/planner';
import { LightIcon } from '@assets/icons';

// SVG Icons
const WalletIcon = ({ size = 24, color = '#fff' }: { size?: number; color?: string }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M21 18v1c0 1.1-.9 2-2 2H5c-1.11 0-2-.9-2-2V5c0-1.1.89-2 2-2h14c1.1 0 2 .9 2 2v1h-9c-1.11 0-2 .9-2 2v8c0 1.1.89 2 2 2h9zm-9-2h10V8H12v8zm4-2.5c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5z"
      fill={color}
    />
  </Svg>
);

const ChartIcon = ({ size = 24, color = '#fff' }: { size?: number; color?: string }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M3.5 18.49l6-6.01 4 4L22 6.92l-1.41-1.41-7.09 7.97-4-4L2 16.99z"
      fill={color}
    />
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

const PersonIcon = ({ size = 24, color = '#fff' }: { size?: number; color?: string }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"
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

const HeartPulseIcon = ({ size = 24, color = '#fff' }: { size?: number; color?: string }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M16.5 3c-1.74 0-3.41.81-4.5 2.09C10.91 3.81 9.24 3 7.5 3 4.42 3 2 5.42 2 8.5c0 3.78 3.4 6.86 8.55 11.54L12 21.35l1.45-1.32C18.6 15.36 22 12.28 22 8.5 22 5.42 19.58 3 16.5 3zm-4.4 15.55l-.1.1-.1-.1C7.14 14.24 4 11.39 4 8.5 4 6.5 5.5 5 7.5 5c1.54 0 3.04.99 3.57 2.36h1.87C13.46 5.99 14.96 5 16.5 5c2 0 3.5 1.5 3.5 3.5 0 2.89-3.14 5.74-7.9 10.05z"
      fill={color}
    />
  </Svg>
);

const DollarIcon = ({ size = 24, color = '#fff' }: { size?: number; color?: string }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M11.8 10.9c-2.27-.59-3-1.2-3-2.15 0-1.09 1.01-1.85 2.7-1.85 1.78 0 2.44.85 2.5 2.1h2.21c-.07-1.72-1.12-3.3-3.21-3.81V3h-3v2.16c-1.94.42-3.5 1.68-3.5 3.61 0 2.31 1.91 3.46 4.7 4.13 2.5.6 3 1.48 3 2.41 0 .69-.49 1.79-2.7 1.79-2.06 0-2.87-.92-2.98-2.1h-2.2c.12 2.19 1.76 3.42 3.68 3.83V21h3v-2.15c1.95-.37 3.5-1.5 3.5-3.55 0-2.84-2.43-3.81-4.7-4.4z"
      fill={color}
    />
  </Svg>
);

const GraduationCapIcon = ({ size = 24, color = '#fff' }: { size?: number; color?: string }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M5 13.18v4L12 21l7-3.82v-4L12 17l-7-3.82zM12 3L1 9l11 6 9-4.91V17h2V9L12 3z"
      fill={color}
    />
  </Svg>
);

const StarIcon = ({ size = 24, color = '#fff' }: { size?: number; color?: string }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"
      fill={color}
    />
  </Svg>
);

const GOAL_TYPES = [
  { id: 'financial', label: 'Financial', subtitle: '(savings, investments)', icon: 'wallet' },
  { id: 'quantitative', label: 'Quantitative', subtitle: '(numerical indicators)', icon: 'chart' },
  { id: 'quality', label: 'Quality', subtitle: '(Skills, achievements)', icon: 'trophy' },
];

const GOAL_CATEGORIES = [
  { id: 'personal', label: 'Personal', icon: 'person' },
  { id: 'career', label: 'Career', icon: 'briefcase' },
  { id: 'health', label: 'Health', icon: 'health' },
  { id: 'financial', label: 'Financial', icon: 'dollar' },
  { id: 'educational', label: 'Educational', icon: 'graduation' },
  { id: 'other', label: 'Other', icon: 'star' },
];

const COUNTING_TYPES = ['Sum', 'Kg', 'Km', 'Hours'];

const modalProps: Partial<CustomModalProps> = {
  variant: 'form',
  enableDynamicSizing: false,
  fallbackSnapPoint: '96%',
  scrollable: true,
  scrollProps: { keyboardShouldPersistTaps: 'handled' },
  contentContainerStyle: { paddingHorizontal: 20, paddingTop: 12, paddingBottom: 32 },
};

export default function PlannerGoalModal() {
  const { plannerGoalModal, closePlannerGoalModal } = useModalStore(
    useShallow((state) => ({
      plannerGoalModal: state.plannerGoalModal,
      closePlannerGoalModal: state.closePlannerGoalModal,
    }))
  );
  const modalRef = useRef<BottomSheetHandle>(null);
  const hasHydratedRef = useRef(false);
  const { strings, locale } = useLocalization();
  const goalAiStrings = strings.plannerScreens.goals.ai;
  const goalContentStrings = strings.plannerScreens.goals.data;
  const goals = usePlannerGoalsStore((state) => state.goals);
  const createGoal = usePlannerGoalsStore((state) => state.createGoal);
  const updateGoal = usePlannerGoalsStore((state) => state.updateGoal);

  // Form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [goalType, setGoalType] = useState('financial');
  const [category, setCategory] = useState('personal');
  const [amount, setAmount] = useState('');
  const [countingType, setCountingType] = useState('Sum');
  const [progress, setProgress] = useState(0);
  const [deadline, setDeadline] = useState<Date | undefined>(undefined);
  const [pickerMode, setPickerMode] = useState<'date' | 'time' | null>(null);
  const [milestones, setMilestones] = useState<string[]>([]);
  const [editingGoalId, setEditingGoalId] = useState<string | null>(null);
  const editingGoal = useMemo(
    () => goals.find((goal) => goal.id === plannerGoalModal.goalId) ?? null,
    [goals, plannerGoalModal.goalId],
  );

  const hydrateGoal = useCallback(
    (goal?: PlannerGoalEntity | null) => {
      if (!goal) {
        setEditingGoalId(null);
        return;
      }
      setEditingGoalId(goal.id);
      const localized = goal.contentKey ? goalContentStrings[goal.contentKey] : undefined;
      setTitle(goal.customTitle ?? localized?.title ?? '');
      setDescription(goal.customDescription ?? '');
      setGoalType(goal.type ?? 'financial');
      setCategory(goal.category ?? 'personal');
      setAmount(goal.targetAmount ?? localized?.targetAmount ?? '');
      setProgress(goal.progress ?? 0);
      setDeadline(goal.deadline ? new Date(goal.deadline) : undefined);
      setMilestones(goal.milestoneLabels ?? localized?.milestones ?? []);
    },
    [goalContentStrings],
  );

  useEffect(() => {
    if (!hasHydratedRef.current) {
      hasHydratedRef.current = true;
      if (plannerGoalModal.isOpen) {
        closePlannerGoalModal();
      }
      return;
    }

    if (plannerGoalModal.isOpen) {
      modalRef.current?.present();
    } else {
      modalRef.current?.dismiss();
    }
  }, [closePlannerGoalModal, plannerGoalModal.isOpen]);

  useEffect(() => {
    if (!plannerGoalModal.isOpen) {
      setTitle('');
      setDescription('');
      setGoalType('financial');
      setCategory('personal');
      setAmount('');
      setCountingType('Sum');
      setProgress(0);
      setDeadline(undefined);
      setMilestones([]);
      setPickerMode(null);
      setEditingGoalId(null);
      return;
    }
    if (plannerGoalModal.mode === 'edit') {
      hydrateGoal(editingGoal);
    } else {
      setEditingGoalId(null);
    }
  }, [editingGoal, hydrateGoal, plannerGoalModal.isOpen, plannerGoalModal.mode]);

  const applyDeadlinePart = useCallback((mode: 'date' | 'time', value: Date) => {
    setDeadline((prev) => {
      const next = prev ? new Date(prev) : new Date();
      if (mode === 'date') {
        next.setFullYear(value.getFullYear(), value.getMonth(), value.getDate());
      } else {
        next.setHours(value.getHours(), value.getMinutes(), 0, 0);
      }
      return next;
    });
  }, []);

  const openDeadlinePicker = useCallback(
    (mode: 'date' | 'time') => {
      const baseValue = deadline ? new Date(deadline) : new Date();
      if (Platform.OS === 'android') {
        DateTimePickerAndroid.open({
          value: baseValue,
          mode,
          is24Hour: true,
          display: mode === 'date' ? 'calendar' : 'clock',
          onChange: (event, selected) => {
            if (event.type === 'set' && selected) {
              applyDeadlinePart(mode, selected);
            }
          },
        });
        return;
      }
      setPickerMode(mode);
    },
    [applyDeadlinePart, deadline],
  );

  const handleIosPickerChange = useCallback(
    (event: DateTimePickerEvent, selected?: Date) => {
      if (event.type === 'dismissed') {
        setPickerMode(null);
        return;
      }
      if (selected && pickerMode) {
        applyDeadlinePart(pickerMode, selected);
      }
    },
    [applyDeadlinePart, pickerMode],
  );

  const closePicker = useCallback(() => setPickerMode(null), []);

  const pickerValue = useMemo(() => (deadline ? new Date(deadline) : new Date()), [deadline]);
  const deadlineDateLabel = useMemo(() => {
    if (!deadline) return 'Pick a date';
    try {
      return new Intl.DateTimeFormat(locale, {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      }).format(deadline);
    } catch {
      return deadline.toLocaleDateString();
    }
  }, [deadline, locale]);
  const deadlineTimeLabel = useMemo(() => {
    if (!deadline) return 'Pick a time';
    try {
      return new Intl.DateTimeFormat(locale, {
        hour: '2-digit',
        minute: '2-digit',
      }).format(deadline);
    } catch {
      return deadline.toLocaleTimeString();
    }
  }, [deadline, locale]);

  const handleApplyAiSuggestion = () => {
    setGoalType('quantitative');
    setCategory('career');
  };

  const handleSubmit = useCallback(
    (options?: { keepOpen?: boolean }) => {
      const payload: GoalFormInput = {
        title,
        description,
        type: goalType as GoalFormInput['type'],
        category: category as GoalFormInput['category'],
        amount,
        countingType,
        progressPercent: typeof progress === 'number' ? progress * 100 : 0,
        deadline,
        milestones,
      };
      if (editingGoalId) {
        updateGoal(editingGoalId as PlannerGoalId, payload);
      } else {
        createGoal(payload);
      }
      if (!options?.keepOpen) {
        closePlannerGoalModal();
      }
    },
    [
      amount,
      category,
      closePlannerGoalModal,
      countingType,
      createGoal,
      deadline,
      description,
      editingGoalId,
      goalType,
      milestones,
      progress,
      title,
      updateGoal,
    ],
  );

  const renderGoalTypeIcon = (iconId: string, size: number, color: string) => {
    switch (iconId) {
      case 'wallet':
        return <WalletIcon size={size} color={color} />;
      case 'chart':
        return <ChartIcon size={size} color={color} />;
      case 'trophy':
        return <TrophyIcon size={size} color={color} />;
      default:
        return <WalletIcon size={size} color={color} />;
    }
  };

  const renderCategoryIcon = (iconId: string, size: number, color: string) => {
    switch (iconId) {
      case 'person':
        return <PersonIcon size={size} color={color} />;
      case 'briefcase':
        return <BriefcaseIcon size={size} color={color} />;
      case 'health':
        return <HeartPulseIcon size={size} color={color} />;
      case 'dollar':
        return <DollarIcon size={size} color={color} />;
      case 'graduation':
        return <GraduationCapIcon size={size} color={color} />;
      case 'star':
        return <StarIcon size={size} color={color} />;
      default:
        return <PersonIcon size={size} color={color} />;
    }
  };

  const disablePrimary = !title.trim();

  return (
    <>
      <CustomModal ref={modalRef} onDismiss={closePlannerGoalModal} {...modalProps}>
        <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
            {/* Header */}
            <View style={styles.header}>
              <Text style={styles.headerTitle}>NEW GOAL</Text>
            </View>

            {/* Goal title */}
            <View style={styles.section}>
              <Text style={styles.sectionLabel}>Goal title</Text>
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

            {/* Description */}
            <View style={styles.section}>
              <Text style={styles.sectionLabel}>Description</Text>
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

            {/* Type */}
            <View style={styles.section}>
              <Text style={styles.sectionLabel}>Type</Text>
              <AdaptiveGlassView style={styles.typeContainer}>
                {GOAL_TYPES.map((type, idx) => {
                  const isActive = goalType === type.id;
                  return (
                    <Pressable
                      key={type.id}
                      onPress={() => setGoalType(type.id)}
                      style={({ pressed }) => [
                        styles.typeOption,
                        pressed && styles.pressed,
                        idx !== 2 && { borderBottomWidth: 1 }
                      ]}
                    >
                      <View style={styles.typeOptionContent}>
                        {renderGoalTypeIcon(type.icon, 24, isActive ? '#FFFFFF' : '#7E8B9A')}
                        <View style={styles.typeTextContainer}>
                          <Text style={[styles.typeLabel, { color: isActive ? '#FFFFFF' : '#B0B0B0' }]}>
                            {type.label} {type.subtitle}
                          </Text>
                        </View>
                      </View>
                    </Pressable>
                  );
                })}
              </AdaptiveGlassView>
            </View>

            <View style={[styles.section, { paddingHorizontal: 0 }]}>
              <Text style={[styles.sectionLabel, { paddingHorizontal: 20 }]}>Categories</Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.categoriesScroll}
              >
                {GOAL_CATEGORIES.map((cat) => {
                  const isActive = category === cat.id;
                  return (
                    <Pressable
                      key={cat.id}
                      onPress={() => setCategory(cat.id)}
                      style={({ pressed }) => [styles.categoryCard, pressed && styles.pressed]}
                    >
                      <AdaptiveGlassView
                        style={[
                          styles.categoryCardInner,
                          { opacity: isActive ? 1 : 0.6 },
                        ]}
                      >
                        {renderCategoryIcon(cat.icon, 28, isActive ? '#FFFFFF' : '#9E9E9E')}
                        <Text
                          style={[
                            styles.categoryCardText,
                            { color: isActive ? '#FFFFFF' : '#9E9E9E' },
                          ]}
                        >
                          {cat.label}
                        </Text>
                      </AdaptiveGlassView>
                    </Pressable>
                  );
                })}
              </ScrollView>
            </View>

            {/* Amount */}
            <View style={styles.section}>
              <Text style={styles.sectionLabel}>Amount</Text>
              <AdaptiveGlassView style={styles.amountInput}>
                <TextInput
                  value={amount}
                  onChangeText={setAmount}
                  placeholder="Amount"
                  placeholderTextColor="#7E8B9A"
                  keyboardType="numeric"
                  style={styles.textInput}
                />
              </AdaptiveGlassView>
            </View>

            {/* Counting type */}
            <View style={styles.section}>
              <Text style={styles.sectionLabel}>Counting type</Text>
              <View style={styles.countingTypeRow}>
                {COUNTING_TYPES.map((type) => {
                  const isActive = countingType === type;
                  return (
                    <Pressable
                      key={type}
                      onPress={() => setCountingType(type)}
                      style={({ pressed }) => [styles.countingButton, pressed && styles.pressed]}
                    >
                      <AdaptiveGlassView
                        style={[
                          styles.countingButtonInner,
                          { opacity: isActive ? 1 : 0.5 },
                        ]}
                      >
                        <Text
                          style={[
                            styles.countingButtonText,
                            { color: isActive ? '#FFFFFF' : '#7E8B9A' },
                          ]}
                        >
                          {type}
                        </Text>
                      </AdaptiveGlassView>
                    </Pressable>
                  );
                })}
              </View>
            </View>

            {/* Progress */}
            <View style={styles.section}>
              <View style={styles.progressHeader}>
                <Text style={styles.sectionLabel}>Progress</Text>
                <Text style={styles.progressValue}>{Math.round(progress * 100)}%</Text>
              </View>
              <AdaptiveGlassView style={styles.progressContainer}>
                <Slider
                  value={progress}
                  onValueChange={setProgress}
                  minimumValue={0}
                  maximumValue={1}
                  minimumTrackTintColor="#FFFFFF"
                  maximumTrackTintColor="#4A4A4A"
                  thumbTintColor="#FFFFFF"
                  style={styles.slider}
                />
              </AdaptiveGlassView>
            </View>

            {/* Deadline */}
            <View style={styles.section}>
              <View style={styles.deadlineHeader}>
                <Text style={styles.sectionLabel}>Deadline</Text>
                <Pressable onPress={() => setDeadline(undefined)} disabled={!deadline}>
                  <Text
                    style={[
                      styles.removeText,
                      !deadline && styles.removeTextDisabled,
                    ]}
                  >
                    Remove
                  </Text>
                </Pressable>
              </View>
              <View style={styles.deadlineRow}>
                <Pressable
                  onPress={() => openDeadlinePicker('date')}
                  style={({ pressed }) => [styles.deadlineButton, pressed && styles.pressed]}
                >
                  <AdaptiveGlassView style={styles.deadlineChip}>
                    <Ionicons name="calendar-outline" size={18} color="#7E8B9A" />
                    <Text
                      style={[
                        styles.deadlineText,
                        { color: deadline ? '#FFFFFF' : '#7E8B9A' },
                      ]}
                    >
                      {deadlineDateLabel}
                    </Text>
                  </AdaptiveGlassView>
                </Pressable>
                <Pressable
                  onPress={() => openDeadlinePicker('time')}
                  style={({ pressed }) => [styles.deadlineButton, pressed && styles.pressed]}
                >
                  <AdaptiveGlassView style={styles.deadlineChip}>
                    <Ionicons name="time-outline" size={18} color="#7E8B9A" />
                    <Text
                      style={[
                        styles.deadlineText,
                        { color: deadline ? '#FFFFFF' : '#7E8B9A' },
                      ]}
                    >
                      {deadlineTimeLabel}
                    </Text>
                  </AdaptiveGlassView>
                </Pressable>
              </View>
            </View>

            {/* Milestones */}
            <View style={styles.section}>
              <View style={styles.milestonesHeader}>
                <Text style={styles.sectionLabel}>Milestones</Text>
                <Pressable>
                  <Text style={styles.addText}>Add</Text>
                </Pressable>
              </View>
              <Pressable style={({ pressed }) => [pressed && styles.pressed]}>
                <AdaptiveGlassView style={styles.milestonesContainer}>
                  <Ionicons name="add" size={24} color="#7E8B9A" />
                  <Text style={styles.milestonesText}>
                    Add milestone goal for monitor your progress
                  </Text>
                </AdaptiveGlassView>
              </Pressable>
            </View>

            {/* AI Suggestions */}
            <View style={styles.aiSuggestion}>
              <Text style={styles.aiSuggestionIcon}>💡</Text>
              <LightIcon/>
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

      {Platform.OS === 'ios' && pickerMode && (
        <Modal transparent visible onRequestClose={closePicker} animationType="fade">
          <View style={styles.pickerModal}>
            <Pressable style={styles.pickerBackdrop} onPress={closePicker} />
            <AdaptiveGlassView style={styles.pickerCard}>
              <DateTimePicker
                value={pickerValue}
                mode={pickerMode}
                display={pickerMode === 'date' ? 'inline' : 'spinner'}
                onChange={handleIosPickerChange}
                is24Hour
              />
              <Pressable onPress={closePicker} style={styles.pickerDoneButton}>
                <Text style={styles.pickerDoneText}>Done</Text>
              </Pressable>
            </AdaptiveGlassView>
          </View>
        </Modal>
      )}
    </>
  );
}

const styles = StyleSheet.create({
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
    marginBottom: 8,
    paddingHorizontal: 20
  },
  sectionLabel: {
    fontSize: 14,
    fontWeight: '400',
    color: '#7E8B9A',
    marginBottom: 12,
  },
  titleInput: {
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 16,
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
    minHeight: 80,
  },
  descriptionInput: {
    fontSize: 15,
    fontWeight: '400',
    textAlignVertical: 'top',
    color: '#FFFFFF',
  },
  typeContainer: {
    borderRadius: 16,
  },
  typeOption: {
    borderBottomColor: 'rgba(255,255,255,0.1)',
  },
  typeOptionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    gap: 12,
  },
  typeTextContainer: {
    flex: 1,
  },
  typeLabel: {
    fontSize: 14,
    fontWeight: '400',
  },
  categoriesScroll: {
    gap: 12,
    paddingHorizontal: 20,
    paddingVertical: 10
  },
  categoryCard: {
    borderRadius: 16,
  },
  categoryCardInner: {
    width: 90,
    height: 90,
    borderRadius: 16,
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  categoryCardText: {
    fontSize: 12,
    fontWeight: '500',
    textAlign: 'center',
  },
  amountInput: {
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  countingTypeRow: {
    flexDirection: 'row',
    gap: 10,
  },
  countingButton: {
    flex: 1,
    borderRadius: 16,
  },
  countingButtonInner: {
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 16,
  },
  countingButtonText: {
    fontSize: 14,
    fontWeight: '500',
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  progressValue: {
    fontSize: 14,
    fontWeight: '400',
    color: '#7E8B9A',
  },
  progressContainer: {
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  slider: {
    width: '100%',
    height: 40,
  },
  deadlineHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  removeText: {
    fontSize: 14,
    fontWeight: '400',
    color: '#7E8B9A',
  },
  deadlineRow: {
    flexDirection: 'row',
    gap: 12,
  },
  deadlineButton: {
    flex: 1,
    borderRadius: 16,
  },
  deadlineChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderRadius: 16,
  },
  deadlineText: {
    fontSize: 15,
    fontWeight: '400',
  },
  removeTextDisabled: {
    opacity: 0.4,
  },
  milestonesHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  addText: {
    fontSize: 14,
    fontWeight: '400',
    color: '#7E8B9A',
  },
  milestonesContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 20,
    borderRadius: 16,
  },
  milestonesText: {
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
  pickerModal: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  pickerBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.35)',
  },
  pickerCard: {
    marginHorizontal: 20,
    marginBottom: 24,
    borderRadius: 24,
    padding: 16,
    gap: 12,
  },
  pickerDoneButton: {
    alignSelf: 'flex-end',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
  },
  pickerDoneText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});
