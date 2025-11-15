// app/(modals)/add-goal.tsx
import React, { useMemo, useState, useCallback } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import {  SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { CalendarDays, Lightbulb, PlusCircle, X } from 'lucide-react-native';
import { AdaptiveGlassView } from '@/components/ui/AdaptiveGlassView';
import { useAppTheme } from '@/constants/theme';

const GOAL_TYPES = [
  { id: 'financial', title: 'Financial', subtitle: 'Savings, investments' },
  { id: 'quantitative', title: 'Quantitative', subtitle: 'Numerical indicators' },
  { id: 'quality', title: 'Quality', subtitle: 'Skills, achievements' },
] as const;

const CATEGORIES = ['Personal', 'Career', 'Health', 'Financial', 'Educational', 'Other'] as const;

const COUNTING_TYPES = ['Sum', 'Kg', 'Km', 'Hours'] as const;

const AI_TIPS = [
  'Try adding a milestone every 10% to keep motivation steady.',
  'AI can adjust your plan if the market shifts — keep data fresh weekly.',
];

const clampProgress = (value: number) => Math.min(100, Math.max(0, value));

export default function AddGoalModal() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const theme = useAppTheme();

  const [goalType, setGoalType] = useState<string>('financial');
  const [selectedCategories, setSelectedCategories] = useState<string[]>(['Financial']);
  const [countingType, setCountingType] = useState<string>('Sum');
  const [progress, setProgress] = useState<number>(72);
  const [deadline, setDeadline] = useState<string>('2025-03-01');

  const deadlineDisplay = useMemo(() => {
    if (!deadline) return 'No deadline';
    try {
      return new Date(deadline).toLocaleDateString();
    } catch {
      return deadline;
    }
  }, [deadline]);

  const toggleCategory = useCallback(
    (value: string) => {
      setSelectedCategories((prev) =>
        prev.includes(value) ? prev.filter((item) => item !== value) : [...prev, value],
      );
    },
    [setSelectedCategories],
  );

  const adjustProgress = useCallback(
    (delta: number) => {
      setProgress((prev) => clampProgress(prev + delta));
    },
    [],
  );

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.colors.background }]} edges={['top']}>
      <View style={[styles.container, { paddingBottom: Math.max(insets.bottom, 16) }]}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Create new goal</Text>
          <Pressable style={styles.headerAction} onPress={() => router.back()} accessibilityRole="button">
            <X size={20} color="#E2E8F0" />
          </Pressable>
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.section}>
            <Text style={styles.label}>Goal title</Text>
            <TextInput
              placeholder="Dream car fund"
              placeholderTextColor="rgba(226,232,240,0.4)"
              style={[styles.input, { color: theme.colors.textPrimary }]}
            />
          </View>

          <View style={styles.section}>
            <Text style={styles.label}>Description</Text>
            <TextInput
              placeholder="Add a short note about why this matters"
              placeholderTextColor="rgba(226,232,240,0.4)"
              multiline
              textAlignVertical="top"
              numberOfLines={4}
              style={[styles.textArea, { color: theme.colors.textPrimary }]}
            />
          </View>

          <View style={styles.section}>
            <Text style={styles.label}>Type</Text>
            <View style={styles.segmentedRow}>
              {GOAL_TYPES.map((option) => {
                const selected = option.id === goalType;
                return (
                  <Pressable
                    key={option.id}
                    style={[styles.segmentedItem, selected && styles.segmentedItemSelected]}
                    onPress={() => setGoalType(option.id)}
                  >
                    <Text style={[styles.segmentedTitle, selected && styles.segmentedTitleSelected]}>{option.title}</Text>
                    <Text style={[styles.segmentedSubtitle, selected && styles.segmentedSubtitleSelected]}>
                      {option.subtitle}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.label}>Categories</Text>
            <View style={styles.chipGrid}>
              {CATEGORIES.map((item) => {
                const selected = selectedCategories.includes(item);
                return (
                  <Pressable
                    key={item}
                    style={[styles.chip, selected && styles.chipSelected]}
                    onPress={() => toggleCategory(item)}
                  >
                    <Text style={[styles.chipLabel, selected && styles.chipLabelSelected]}>{item}</Text>
                  </Pressable>
                );
              })}
            </View>
          </View>

          <View style={[styles.section, styles.rowSection]}>
            <View style={styles.column}>
              <Text style={styles.label}>Amount</Text>
              <TextInput
                placeholder="5 000 000"
                keyboardType="numeric"
                placeholderTextColor="rgba(226,232,240,0.4)"
                style={[styles.input, { color: theme.colors.textPrimary }]}
              />
            </View>
            <View style={styles.column}>
              <Text style={styles.label}>Counting type</Text>
              <View style={styles.countTypeRow}>
                {COUNTING_TYPES.map((type) => {
                  const selected = countingType === type;
                  return (
                    <Pressable
                      key={type}
                      style={[styles.countTypeChip, selected && styles.countTypeChipSelected]}
                      onPress={() => setCountingType(type)}
                    >
                      <Text style={[styles.countTypeText, selected && styles.countTypeTextSelected]}>{type}</Text>
                    </Pressable>
                  );
                })}
              </View>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.label}>Progress</Text>
            <View style={styles.progressInteractive}>
              <Pressable style={styles.progressControl} onPress={() => adjustProgress(-5)}>
                <Text style={styles.progressControlLabel}>-</Text>
              </Pressable>
              <View style={styles.progressSlider}>
                <View style={styles.progressTrack} />
                <View style={[styles.progressIndicator, { width: `${progress}%` }]}>
                  <View style={styles.progressHandle} />
                </View>
              </View>
              <Pressable style={styles.progressControl} onPress={() => adjustProgress(5)}>
                <Text style={styles.progressControlLabel}>+</Text>
              </Pressable>
              <Text style={styles.progressValue}>{progress}%</Text>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.label}>Deadline</Text>
            <View style={styles.deadlineRow}>
              <View style={styles.deadlinePill}>
                <CalendarDays size={16} color="#E0E7FF" />
                <Text style={styles.deadlineText}>{deadlineDisplay}</Text>
              </View>
              <Pressable onPress={() => setDeadline('')} style={styles.deadlineRemove}>
                <Text style={styles.deadlineRemoveText}>Remove</Text>
              </Pressable>
            </View>
          </View>

          <AdaptiveGlassView
            style={[
              styles.milestoneGlass,
              {
                borderColor: 'rgba(255,255,255,0.08)',
                backgroundColor: 'rgba(255,255,255,0.04)',
              },
            ]}
          >
            <Pressable style={styles.milestoneInner}>
              <PlusCircle size={18} color="#C7D2FE" />
              <Text style={styles.milestoneLabel}>Add milestone goal</Text>
            </Pressable>
          </AdaptiveGlassView>

          <View style={styles.aiTipsSection}>
            {AI_TIPS.map((tip, index) => (
              <AdaptiveGlassView
                key={tip}
                style={[
                  styles.aiTipCard,
                  {
                    borderColor: 'rgba(255,255,255,0.08)',
                    backgroundColor: 'rgba(255,255,255,0.05)',
                  },
                ]}
              >
                <View style={styles.aiTipRow}>
                  <Lightbulb size={18} color="#FACC15" />
                  <Text style={styles.aiTipText}>
                    {index === 0 ? tip : 'Keep momentum by increasing contributions after each milestone.'}
                  </Text>
                </View>
              </AdaptiveGlassView>
            ))}
          </View>
        </ScrollView>

        <View style={styles.footer}>
          <Pressable style={[styles.footerButton, styles.footerButtonSecondary]} onPress={() => router.back()}>
            <Text style={styles.footerSecondaryLabel}>Create and more</Text>
          </Pressable>
          <Pressable style={[styles.footerButton, styles.footerButtonPrimary]} onPress={() => router.back()}>
            <Text style={styles.footerPrimaryLabel}>Create goal</Text>
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    paddingHorizontal: 16,
  },
  container: {
    flex: 1,
    paddingTop: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 8,
    paddingBottom: 16,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#F8FAFC',
    letterSpacing: 0.2,
  },
  headerAction: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  scrollContent: {
    paddingBottom: 24,
    gap: 24,
  },
  section: {
    gap: 12,
  },
  rowSection: {
    flexDirection: 'row',
    gap: 16,
  },
  column: {
    flex: 1,
    gap: 12,
  },
  label: {
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 0.3,
    color: '#E2E8F0',
    textTransform: 'uppercase',
  },
  input: {
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    backgroundColor: 'rgba(15,17,19,0.8)',
    paddingHorizontal: 14,
    paddingVertical: 14,
    fontSize: 15,
    fontWeight: '600',
  },
  textArea: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    backgroundColor: 'rgba(15,17,19,0.8)',
    paddingHorizontal: 14,
    paddingVertical: 14,
    minHeight: 120,
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '500',
  },
  segmentedRow: {
    flexDirection: 'row',
    gap: 12,
  },
  segmentedItem: {
    flex: 1,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    backgroundColor: 'rgba(15,18,20,0.6)',
    gap: 6,
  },
  segmentedItemSelected: {
    borderColor: 'rgba(139,92,246,0.5)',
    backgroundColor: 'rgba(139,92,246,0.18)',
  },
  segmentedTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#CBD5F5',
  },
  segmentedTitleSelected: {
    color: '#E0E7FF',
  },
  segmentedSubtitle: {
    fontSize: 12,
    fontWeight: '600',
    color: 'rgba(148,163,184,0.8)',
  },
  segmentedSubtitleSelected: {
    color: '#F1F5F9',
  },
  chipGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  chipSelected: {
    borderColor: 'rgba(139,92,246,0.6)',
    backgroundColor: 'rgba(139,92,246,0.16)',
  },
  chipLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#CBD5F5',
  },
  chipLabelSelected: {
    color: '#F8FAFC',
  },
  countTypeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  countTypeChip: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  countTypeChipSelected: {
    backgroundColor: 'rgba(139,92,246,0.2)',
  },
  countTypeText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#CBD5F5',
  },
  countTypeTextSelected: {
    color: '#F8FAFC',
  },
  progressInteractive: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  progressControl: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  progressControlLabel: {
    fontSize: 18,
    fontWeight: '700',
    color: '#E0E7FF',
  },
  progressSlider: {
    flex: 1,
    height: 32,
    justifyContent: 'center',
  },
  progressTrack: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 6,
    borderRadius: 6,
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  progressIndicator: {
    height: 6,
    borderRadius: 6,
    backgroundColor: '#8B5CF6',
  },
  progressHandle: {
    position: 'absolute',
    right: -6,
    top: -7,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#F8FAFC',
    borderWidth: 2,
    borderColor: '#8B5CF6',
  },
  progressValue: {
    fontSize: 15,
    fontWeight: '700',
    color: '#E0E7FF',
    minWidth: 52,
    textAlign: 'right',
  },
  deadlineRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  deadlinePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 999,
    backgroundColor: 'rgba(139,92,246,0.18)',
  },
  deadlineText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#F8FAFC',
  },
  deadlineRemove: {
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  deadlineRemoveText: {
    fontSize: 13,
    fontWeight: '600',
    color: 'rgba(248,250,252,0.6)',
    textDecorationLine: 'underline',
  },
  milestoneGlass: {
    borderRadius: 16,
    borderWidth: 1,
    overflow: 'hidden',
  },
  milestoneInner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  milestoneLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#E0E7FF',
  },
  aiTipsSection: {
    gap: 12,
  },
  aiTipCard: {
    borderWidth: 1,
    borderRadius: 16,
    padding: 16,
  },
  aiTipRow: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'flex-start',
  },
  aiTipText: {
    flex: 1,
    fontSize: 13,
    fontWeight: '500',
    color: '#F1F5F9',
    lineHeight: 18,
  },
  footer: {
    flexDirection: 'row',
    gap: 12,
    paddingTop: 4,
    paddingBottom: 4,
  },
  footerButton: {
    flex: 1,
    minHeight: 52,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  footerButtonSecondary: {
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  footerButtonPrimary: {
    backgroundColor: '#8B5CF6',
  },
  footerSecondaryLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: '#E0E7FF',
  },
  footerPrimaryLabel: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0B1120',
  },
});
