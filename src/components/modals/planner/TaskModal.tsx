import React, { useEffect, useRef, useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import CustomModal, { CustomModalProps } from '@/components/modals/CustomModal';
import { BottomSheetHandle } from '@/components/modals/BottomSheet';
import { useModalStore } from '@/stores/useModalStore';
import { useShallow } from 'zustand/react/shallow';

const DURATION_CHIPS = ['15m', '30m', '45m', '60m', '90m', '120m', 'Custom'];
const CONTEXT_CHIPS = ['@home', '@work', '@street', '@online'];
const PRIORITY_LEVELS = ['Critical', 'High', 'Medium', 'Low'] as const;
const ENERGY_LEVELS = [1, 2, 3];

const modalProps: Partial<CustomModalProps> = {
  variant: 'form',
  enableDynamicSizing: true,
  fallbackSnapPoint: '88%',
  scrollable: true,
  scrollProps: { keyboardShouldPersistTaps: 'handled' },
  contentContainerStyle: { paddingHorizontal: 20, paddingTop: 12, paddingBottom: 32 },
};

export default function PlannerTaskModal() {
  const { plannerTaskModal, closePlannerTaskModal } = useModalStore(
    useShallow((state) => ({
      plannerTaskModal: state.plannerTaskModal,
      closePlannerTaskModal: state.closePlannerTaskModal,
    }))
  );
  const modalRef = useRef<BottomSheetHandle>(null);
  const [duration, setDuration] = useState('45m');
  const [context, setContext] = useState<string[]>(['@work']);
  const [priority, setPriority] = useState<typeof PRIORITY_LEVELS[number]>('Medium');
  const [energy, setEnergy] = useState(2);

  useEffect(() => {
    if (plannerTaskModal.isOpen) {
      modalRef.current?.present();
    } else {
      modalRef.current?.dismiss();
    }
  }, [plannerTaskModal.isOpen]);

  useEffect(() => {
    if (!plannerTaskModal.isOpen) {
      setDuration('45m');
      setContext(['@work']);
      setPriority('Medium');
      setEnergy(2);
    }
  }, [plannerTaskModal.isOpen]);

  const toggleContext = (value: string) => {
    setContext((prev) => (prev.includes(value) ? prev.filter((item) => item !== value) : [...prev, value]));
  };

  const renderChip = (label: string, selected: boolean, onPress: () => void) => (
    <Pressable key={label} onPress={onPress} style={[styles.chip, selected && styles.chipSelected]}>
      <Text style={[styles.chipText, selected && styles.chipTextSelected]}>{label}</Text>
    </Pressable>
  );

  return (
    <CustomModal ref={modalRef} onDismiss={closePlannerTaskModal} {...modalProps}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
          <View style={styles.header}>
            <Pressable onPress={closePlannerTaskModal} style={styles.iconButton}>
              <Ionicons name="close" size={24} color="#FFFFFF" />
            </Pressable>
            <Text style={styles.headerTitle}>{plannerTaskModal.mode === 'edit' ? 'Edit task' : 'New task'}</Text>
            <Pressable style={styles.iconButton}>
              <Ionicons name="sparkles-outline" size={20} color="#FFD60A" />
            </Pressable>
          </View>

          <Text style={styles.sectionLabel}>Task name</Text>
          <TextInput
            placeholder="What do you want to accomplish?"
            placeholderTextColor="#7E8B9A"
            style={styles.nameInput}
            autoFocus
          />

          <Text style={styles.sectionLabel}>Description</Text>
          <TextInput
            placeholder="Add optional context"
            placeholderTextColor="#7E8B9A"
            multiline
            numberOfLines={3}
            style={styles.descriptionInput}
          />

          <View style={styles.row}>
            <View style={styles.flex}>
              <Text style={styles.sectionLabel}>Date</Text>
              <Pressable style={styles.inputButton}>
                <Ionicons name="calendar-outline" size={18} color="#FFFFFF" style={{ marginRight: 8 }} />
                <Text style={styles.inputButtonText}>Today</Text>
              </Pressable>
            </View>
            <View style={styles.flex}>
              <Text style={styles.sectionLabel}>Time</Text>
              <Pressable style={styles.inputButton}>
                <Ionicons name="time-outline" size={18} color="#FFFFFF" style={{ marginRight: 8 }} />
                <Text style={styles.inputButtonText}>14:00</Text>
              </Pressable>
            </View>
          </View>

          <Text style={styles.sectionLabel}>Duration</Text>
          <View style={styles.chipGroup}>
            {DURATION_CHIPS.map((chip) => renderChip(chip, duration === chip, () => setDuration(chip)))}
          </View>

          <Text style={styles.sectionLabel}>Context</Text>
          <View style={styles.chipGroup}>
            {CONTEXT_CHIPS.map((chip) =>
              renderChip(chip, context.includes(chip), () => toggleContext(chip))
            )}
          </View>

          <Text style={styles.sectionLabel}>Priority</Text>
          <View style={styles.chipGroup}>
            {PRIORITY_LEVELS.map((level) =>
              renderChip(level, priority === level, () => setPriority(level))
            )}
          </View>

          <Text style={styles.sectionLabel}>Energy level</Text>
          <View style={styles.chipGroup}>
            {ENERGY_LEVELS.map((value) =>
              renderChip(`${value} bolt${value > 1 ? 's' : ''}`, energy === value, () => setEnergy(value))
            )}
          </View>

          <View style={styles.separator} />

          <Pressable style={styles.saveButton}>
            <Text style={styles.saveButtonText}>
              {plannerTaskModal.mode === 'edit' ? 'Save changes' : 'Create task'}
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
    minHeight: 72,
    borderRadius: 16,
    backgroundColor: '#111111',
    padding: 16,
    color: '#FFFFFF',
    textAlignVertical: 'top',
    marginBottom: 20,
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
  separator: {
    height: 1,
    backgroundColor: '#1F1F22',
    marginBottom: 24,
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
