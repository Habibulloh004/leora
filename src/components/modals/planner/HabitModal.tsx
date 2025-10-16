import React, { useEffect, useRef, useState } from 'react';
import { FlatList, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import CustomModal, { CustomModalProps } from '@/components/modals/CustomModal';
import { BottomSheetHandle } from '@/components/modals/BottomSheet';
import { useModalStore } from '@/stores/useModalStore';
import { useShallow } from 'zustand/react/shallow';

const TEMPLATES = [
  { title: 'Morning exercise', time: '07:00' },
  { title: 'Meditation', time: '06:30' },
  { title: 'Drink water', time: '08:00' },
  { title: 'Reading', time: '21:00' },
  { title: 'Journaling', time: '22:00' },
];

const CATEGORIES = ['Personal', 'Health', 'Career', 'Finance', 'Education', 'Productivity'];
const DIFFICULTY = ['Easy', 'Medium', 'Hard'] as const;
const STREAK_GOALS = ['7 days', '21 days', '30 days', '66 days', '100 days'];

const modalProps: Partial<CustomModalProps> = {
  variant: 'form',
  enableDynamicSizing: true,
  fallbackSnapPoint: '88%',
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
  const [difficulty, setDifficulty] = useState<typeof DIFFICULTY[number]>('Medium');
  const [streakGoal, setStreakGoal] = useState(STREAK_GOALS[1]);
  const [category, setCategory] = useState(CATEGORIES[0]);

  useEffect(() => {
    if (plannerHabitModal.isOpen) {
      modalRef.current?.present();
    } else {
      modalRef.current?.dismiss();
    }
  }, [plannerHabitModal.isOpen]);

  useEffect(() => {
    if (!plannerHabitModal.isOpen) {
      setDifficulty('Medium');
      setStreakGoal(STREAK_GOALS[1]);
      setCategory(CATEGORIES[0]);
    }
  }, [plannerHabitModal.isOpen]);

  const renderChip = (label: string, selected: boolean, onPress: () => void) => (
    <Pressable key={label} onPress={onPress} style={[styles.chip, selected && styles.chipSelected]}>
      <Text style={[styles.chipText, selected && styles.chipTextSelected]}>{label}</Text>
    </Pressable>
  );

  return (
    <CustomModal ref={modalRef} onDismiss={closePlannerHabitModal} {...modalProps}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
          <View style={styles.header}>
            <Pressable onPress={closePlannerHabitModal} style={styles.iconButton}>
              <Ionicons name="close" size={24} color="#FFFFFF" />
            </Pressable>
            <Text style={styles.headerTitle}>{plannerHabitModal.mode === 'edit' ? 'Edit habit' : 'New habit'}</Text>
            <Pressable style={styles.iconButton}>
              <Ionicons name="bulb-outline" size={20} color="#FFD60A" />
            </Pressable>
          </View>

          <Text style={styles.sectionTitle}>Popular templates</Text>
          <FlatList
            data={TEMPLATES}
            keyExtractor={(item) => item.title}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingVertical: 12, gap: 16 }}
            renderItem={({ item }) => (
              <View style={styles.templateCard}>
                <Text style={styles.templateTitle}>{item.title}</Text>
                <Text style={styles.templateTime}>{item.time}</Text>
              </View>
            )}
          />

          <Text style={styles.sectionLabel}>Habit name</Text>
          <TextInput
            placeholder="Name your habit"
            placeholderTextColor="#7E8B9A"
            style={styles.nameInput}
            autoFocus
          />

          <Text style={styles.sectionLabel}>Motivation</Text>
          <TextInput
            placeholder="Add a reason to stay consistent"
            placeholderTextColor="#7E8B9A"
            multiline
            style={styles.descriptionInput}
          />

          <Text style={styles.sectionLabel}>Difficulty</Text>
          <View style={styles.chipGroup}>
            {DIFFICULTY.map((level) => renderChip(level, difficulty === level, () => setDifficulty(level)))}
          </View>

          <Text style={styles.sectionLabel}>Streak goal</Text>
          <View style={styles.chipGroup}>
            {STREAK_GOALS.map((goal) => renderChip(goal, streakGoal === goal, () => setStreakGoal(goal)))}
          </View>

          <Text style={styles.sectionLabel}>Category</Text>
          <View style={styles.chipGroup}>
            {CATEGORIES.map((cat) => renderChip(cat, category === cat, () => setCategory(cat)))}
          </View>

          <Text style={styles.sectionLabel}>Reminder</Text>
          <Pressable style={styles.inputButton}>
            <Ionicons name="alarm-outline" size={18} color="#FFFFFF" style={{ marginRight: 8 }} />
            <Text style={styles.inputButtonText}>08:00</Text>
          </Pressable>

          <View style={styles.aiBox}>
            <Text style={styles.aiTitle}>AI recommendations</Text>
            <View style={styles.aiRow}>
              <Ionicons name="time-outline" size={16} color="#FFD60A" style={{ marginRight: 8 }} />
              <Text style={styles.aiText}>Best adherence recorded between 06:30 and 07:00.</Text>
            </View>
            <View style={styles.aiRow}>
              <Ionicons name="trail-sign-outline" size={16} color="#FFD60A" style={{ marginRight: 8 }} />
              <Text style={styles.aiText}>Stack with hydration reminders for higher consistency.</Text>
            </View>
          </View>

          <Pressable style={styles.saveButton}>
            <Text style={styles.saveButtonText}>{plannerHabitModal.mode === 'edit' ? 'Save changes' : 'Create habit'}</Text>
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>
    </CustomModal>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '700',
  },
  sectionTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
    marginTop: 8,
    marginBottom: 12,
  },
  sectionLabel: {
    color: '#9AA0A6',
    fontSize: 15,
    fontWeight: '600',
    marginTop: 12,
    marginBottom: 8,
  },
  nameInput: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '600',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#1F1F22',
    marginBottom: 16,
  },
  descriptionInput: {
    minHeight: 72,
    borderRadius: 16,
    backgroundColor: '#111111',
    padding: 16,
    color: '#FFFFFF',
    textAlignVertical: 'top',
    marginBottom: 20,
  },
  templateCard: {
    width: 140,
    height: 120,
    borderRadius: 16,
    backgroundColor: '#111111',
    borderWidth: 1,
    borderColor: '#1F1F22',
    padding: 16,
    justifyContent: 'space-between',
  },
  templateTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  templateTime: {
    color: '#7E8B9A',
    fontSize: 14,
  },
  chipGroup: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 16,
  },
  chip: {
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#2C2C2E',
    paddingHorizontal: 14,
    paddingVertical: 8,
    backgroundColor: '#111111',
  },
  chipSelected: {
    backgroundColor: '#FFFFFF',
    borderColor: '#FFFFFF',
  },
  chipText: {
    color: '#9AA0A6',
    fontSize: 14,
  },
  chipTextSelected: {
    color: '#000000',
    fontWeight: '600',
  },
  inputButton: {
    height: 48,
    borderRadius: 12,
    backgroundColor: '#111111',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  inputButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
  },
  aiBox: {
    backgroundColor: '#121212',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#1F1F22',
    marginBottom: 28,
  },
  aiTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFD60A',
    marginBottom: 10,
  },
  aiRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  aiText: {
    color: '#F4F4F4',
    fontSize: 14,
    flex: 1,
  },
  saveButton: {
    height: 54,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#000000',
  },
});
