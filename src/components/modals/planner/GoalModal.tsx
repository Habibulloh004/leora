import React, { useEffect, useRef, useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import CustomModal, { CustomModalProps } from '@/components/modals/CustomModal';
import { BottomSheetHandle } from '@/components/modals/BottomSheet';
import { useModalStore } from '@/stores/useModalStore';
import { useShallow } from 'zustand/react/shallow';

const GOAL_TYPES = ['Financial', 'Quantitative', 'Qualitative'];
const GOAL_CATEGORIES = ['Personal', 'Career', 'Health', 'Finance', 'Education', 'Other'];
const THEME_COLORS = ['#4CAF50', '#2196F3', '#FF9800', '#FF3B30', '#9C27B0', '#26C6DA', '#607D8B', '#FFD60A'];

const modalProps: Partial<CustomModalProps> = {
  variant: 'form',
  enableDynamicSizing: true,
  fallbackSnapPoint: '88%',
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
  const [goalType, setGoalType] = useState(GOAL_TYPES[0]);
  const [category, setCategory] = useState(GOAL_CATEGORIES[0]);
  const [theme, setTheme] = useState(THEME_COLORS[0]);

  useEffect(() => {
    if (plannerGoalModal.isOpen) {
      modalRef.current?.present();
    } else {
      modalRef.current?.dismiss();
    }
  }, [plannerGoalModal.isOpen]);

  useEffect(() => {
    if (!plannerGoalModal.isOpen) {
      setGoalType(GOAL_TYPES[0]);
      setCategory(GOAL_CATEGORIES[0]);
      setTheme(THEME_COLORS[0]);
    }
  }, [plannerGoalModal.isOpen]);

  const renderChip = (label: string, selected: boolean, onPress: () => void) => (
    <Pressable key={label} onPress={onPress} style={[styles.chip, selected && styles.chipSelected]}>
      <Text style={[styles.chipText, selected && styles.chipTextSelected]}>{label}</Text>
    </Pressable>
  );

  return (
    <CustomModal ref={modalRef} onDismiss={closePlannerGoalModal} {...modalProps}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
          <View style={styles.header}>
            <Pressable onPress={closePlannerGoalModal} style={styles.iconButton}>
              <Ionicons name="close" size={24} color="#FFFFFF" />
            </Pressable>
            <Text style={styles.headerTitle}>{plannerGoalModal.mode === 'edit' ? 'Edit goal' : 'New goal'}</Text>
            <Pressable style={styles.iconButton}>
              <Ionicons name="stats-chart-outline" size={20} color="#FFD60A" />
            </Pressable>
          </View>

          <Text style={styles.sectionLabel}>Goal name</Text>
          <TextInput
            placeholder="Define a clear goal"
            placeholderTextColor="#7E8B9A"
            style={styles.nameInput}
            autoFocus
          />

          <Text style={styles.sectionLabel}>Description & motivation</Text>
          <TextInput
            placeholder="Why is this important?"
            placeholderTextColor="#7E8B9A"
            multiline
            style={styles.descriptionInput}
          />

          <Text style={styles.sectionLabel}>Goal type</Text>
          <View style={styles.chipGroup}>
            {GOAL_TYPES.map((type) => renderChip(type, goalType === type, () => setGoalType(type)))}
          </View>

          <Text style={styles.sectionLabel}>Category</Text>
          <View style={styles.chipGroup}>
            {GOAL_CATEGORIES.map((cat) => renderChip(cat, category === cat, () => setCategory(cat)))}
          </View>

          <View style={styles.row}>
            <View style={styles.flex}>
              <Text style={styles.sectionLabel}>Deadline</Text>
              <Pressable style={styles.inputButton}>
                <Ionicons name="calendar-outline" size={18} color="#FFFFFF" style={{ marginRight: 8 }} />
                <Text style={styles.inputButtonText}>Select date</Text>
              </Pressable>
            </View>
            <View style={styles.flex}>
              <Text style={styles.sectionLabel}>Days remaining</Text>
              <View style={[styles.inputButton, { backgroundColor: '#111111' }]}>
                <Text style={styles.inputButtonText}>Calculated</Text>
              </View>
            </View>
          </View>

          <Text style={styles.sectionLabel}>Milestones</Text>
          <Pressable style={styles.milestoneCard}>
            <Ionicons name="add-outline" size={20} color="#FFFFFF" style={{ marginRight: 8 }} />
            <Text style={styles.milestoneText}>Add milestone (recommended 4-5)</Text>
          </Pressable>

          <Text style={styles.sectionLabel}>Theme color</Text>
          <View style={styles.colorRow}>
            {THEME_COLORS.map((color) => (
              <Pressable
                key={color}
                onPress={() => setTheme(color)}
                style={[styles.colorDot, { backgroundColor: color }, theme === color && styles.colorDotSelected]}
              />
            ))}
          </View>

          <View style={styles.aiBox}>
            <Text style={styles.aiTitle}>AI suggestions</Text>
            <View style={styles.aiRow}>
              <Ionicons name="trail-sign-outline" size={16} color="#FFD60A" style={{ marginRight: 8 }} />
              <Text style={styles.aiText}>Recommended milestones: kickoff → prototype → beta → launch → review.</Text>
            </View>
            <View style={styles.aiRow}>
              <Ionicons name="analytics-outline" size={16} color="#FFD60A" style={{ marginRight: 8 }} />
              <Text style={styles.aiText}>Estimated completion: 3-6 months with weekly review checkpoints.</Text>
            </View>
          </View>

          <Pressable style={styles.saveButton}>
            <Text style={styles.saveButtonText}>
              {plannerGoalModal.mode === 'edit' ? 'Save changes' : 'Create goal'}
            </Text>
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
  sectionLabel: {
    color: '#9AA0A6',
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 8,
  },
  nameInput: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: '600',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#1F1F22',
    marginBottom: 16,
  },
  descriptionInput: {
    minHeight: 80,
    borderRadius: 16,
    backgroundColor: '#111111',
    padding: 16,
    color: '#FFFFFF',
    textAlignVertical: 'top',
    marginBottom: 20,
  },
  chipGroup: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 20,
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
  row: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 20,
  },
  flex: {
    flex: 1,
  },
  inputButton: {
    height: 48,
    borderRadius: 12,
    backgroundColor: '#111111',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  inputButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
  },
  milestoneCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#2C2C2E',
    backgroundColor: '#111111',
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginBottom: 20,
  },
  milestoneText: {
    color: '#9AA0A6',
    fontSize: 14,
  },
  colorRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 24,
  },
  colorDot: {
    width: 36,
    height: 36,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  colorDotSelected: {
    borderColor: '#FFFFFF',
  },
  aiBox: {
    backgroundColor: '#121212',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#1F1F22',
    marginBottom: 24,
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
    marginBottom: 6,
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
