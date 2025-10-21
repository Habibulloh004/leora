import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';

import CustomModal from '@/components/modals/CustomModal';
import DateChangeModal from '@/components/modals/DateChangeModal';
import { BottomSheetHandle } from '@/components/modals/BottomSheet';
import { Colors } from '@/constants/theme';
import { useFinanceStore } from '@/stores/useFinanceStore';
import { useModalStore } from '@/stores/useModalStore';
import { useSettingsStore } from '@/stores/useSettingsStore';
import { useTranslation } from '../../../utils/localization';
type DebtType = 'borrowed' | 'lent';
type ActiveDateField = 'date' | 'expected' | null;

export default function DebtModal() {
  const modalRef = useRef<BottomSheetHandle>(null);
  const dateModalRef = useRef<BottomSheetHandle>(null);

  const { t } = useTranslation();
  const currency = useSettingsStore((state) => state.currency);

  const debtModal = useModalStore((state) => state.debtModal);
  const closeDebtModal = useModalStore((state) => state.closeDebtModal);

  const addDebt = useFinanceStore((state) => state.addDebt);
  const updateDebt = useFinanceStore((state) => state.updateDebt);

  const [person, setPerson] = useState('');
  const [amount, setAmount] = useState('');
  const [activeType, setActiveType] = useState<DebtType>('borrowed');
  const [note, setNote] = useState('');
  const [startDate, setStartDate] = useState(new Date());
  const [expectedDate, setExpectedDate] = useState<Date | undefined>(undefined);
  const [activeDateField, setActiveDateField] = useState<ActiveDateField>(null);

  const isEditing = Boolean(debtModal.mode === 'edit' && debtModal.debt);
  const editingDebt = debtModal.debt;

  const indicatorProgress = useSharedValue(0);
  const toggleSegment = useSharedValue(0);

  useEffect(() => {
    if (debtModal.isOpen) {
      modalRef.current?.present();
    } else {
      modalRef.current?.dismiss();
    }
  }, [debtModal.isOpen]);

  const resetForm = useCallback(() => {
    setPerson('');
    setAmount('');
    setActiveType('borrowed');
    setNote('');
    setStartDate(new Date());
    setExpectedDate(undefined);
    setActiveDateField(null);
  }, []);

  useEffect(() => {
    if (debtModal.isOpen && editingDebt) {
      setPerson(editingDebt.person);
      setAmount(editingDebt.amount.toString());
      setActiveType(editingDebt.type);
      setNote(editingDebt.note ?? '');
      setStartDate(new Date(editingDebt.date));
      setExpectedDate(editingDebt.expectedReturnDate ? new Date(editingDebt.expectedReturnDate) : undefined);
    } else if (debtModal.isOpen) {
      resetForm();
    }
  }, [debtModal.isOpen, editingDebt, resetForm]);

  useEffect(() => {
    indicatorProgress.value = withTiming(activeType === 'borrowed' ? 0 : 1, {
      duration: 220,
      easing: Easing.out(Easing.cubic),
    });
  }, [activeType, indicatorProgress]);

  const indicatorStyle = useAnimatedStyle(() => ({
    width: toggleSegment.value,
    transform: [{ translateX: indicatorProgress.value * toggleSegment.value }],
  }));

  const statusColor = useMemo(
    () => (activeType === 'lent' ? Colors.success : Colors.danger),
    [activeType]
  );

  const amountNumber = useMemo(() => {
    const parsed = parseFloat(amount.replace(/,/g, '.'));
    return Number.isFinite(parsed) ? parsed : 0;
  }, [amount]);

  const isSaveDisabled =
    !person.trim() ||
    amountNumber <= 0 ||
    !startDate;

  const handleAmountChange = useCallback((value: string) => {
    const sanitized = value.replace(/[^0-9.,]/g, '').replace(/,/g, '.');
    const parts = sanitized.split('.');
    if (parts.length > 2) {
      const [integer, fraction] = parts;
      setAmount(`${integer}.${fraction}`);
      return;
    }
    setAmount(sanitized);
  }, []);

  const handleSelectDate = useCallback((dateString: string) => {
    const selected = new Date(dateString);
    if (Number.isNaN(selected.getTime())) {
      dateModalRef.current?.dismiss();
      return;
    }

    if (activeDateField === 'expected') {
      setExpectedDate(selected);
    } else {
      setStartDate(selected);
    }

    setActiveDateField(null);
    dateModalRef.current?.dismiss();
  }, [activeDateField]);

  const handleOpenDate = useCallback((field: ActiveDateField) => {
    setActiveDateField(field);
    dateModalRef.current?.present();
  }, []);

  const handleClose = useCallback(() => {
    closeDebtModal();
  }, [closeDebtModal]);

  const handleSubmit = useCallback(() => {
    if (isSaveDisabled) {
      return;
    }

    const baseDebt = {
      person: person.trim(),
      amount: amountNumber,
      type: activeType,
      currency: currency ?? 'USD',
      date: startDate,
      expectedReturnDate: expectedDate,
      note: note.trim() || undefined,
    };

    if (isEditing && editingDebt) {
      updateDebt(editingDebt.id, baseDebt);
    } else {
      addDebt({
        ...baseDebt,
        remainingAmount: amountNumber,
      });
    }

    closeDebtModal();
  }, [
    activeType,
    addDebt,
    amountNumber,
    closeDebtModal,
    currency,
    editingDebt,
    expectedDate,
    isEditing,
    isSaveDisabled,
    note,
    person,
    startDate,
    updateDebt,
  ]);

  const handleClearExpected = useCallback(() => {
    setExpectedDate(undefined);
  }, []);

  return (
    <>
      <CustomModal
        ref={modalRef}
        variant="form"
        scrollable
        scrollProps={{ keyboardShouldPersistTaps: 'handled' }}
        onDismiss={handleClose}
        fallbackSnapPoint="88%"
        enableDynamicSizing
      >
        <KeyboardAvoidingView behavior={Platform.select({ ios: 'padding' })}>
          <View style={styles.header}>
            <View>
              <Text style={styles.title}>{t('finance.debtTitle')}</Text>
              <Text style={styles.subtitle}>{t('finance.debtSubtitle')}</Text>
            </View>
            <Pressable onPress={handleClose} hitSlop={12}>
              <Ionicons name="close" size={24} color={Colors.textSecondary} />
            </Pressable>
          </View>

          <View style={[styles.statusBadge, { backgroundColor: statusColor + '1A' }]}>
            <Text style={[styles.statusText, { color: statusColor }]}>
              {activeType === 'lent'
                ? t('finance.debtStatusLent')
                : t('finance.debtStatusBorrowed')}
            </Text>
          </View>

          <View style={styles.typeToggle} onLayout={(event) => {
            toggleSegment.value = event.nativeEvent.layout.width / 2;
          }}>
            <TouchableOpacity
              style={[
                styles.typeButton,
                activeType === 'borrowed' && styles.typeButtonActive,
              ]}
              onPress={() => setActiveType('borrowed')}
              activeOpacity={0.85}
            >
              <Text
                style={[
                  styles.typeLabel,
                  activeType === 'borrowed' && styles.typeLabelActive,
                ]}
              >
                {t('finance.borrowed')}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.typeButton,
                activeType === 'lent' && styles.typeButtonActive,
              ]}
              onPress={() => setActiveType('lent')}
              activeOpacity={0.85}
            >
              <Text
                style={[
                  styles.typeLabel,
                  activeType === 'lent' && styles.typeLabelActive,
                ]}
              >
                {t('finance.lent')}
              </Text>
            </TouchableOpacity>

            <Animated.View style={[styles.typeIndicator, indicatorStyle]} />
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{t('finance.person')}</Text>
            <View style={styles.inputWrapper}>
              <TextInput
                value={person}
                onChangeText={setPerson}
                placeholder={t('finance.personPlaceholder')}
                placeholderTextColor={Colors.textTertiary}
                style={styles.textInput}
              />
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{t('finance.amount')}</Text>
            <View style={styles.inputWrapper}>
              <TextInput
                value={amount}
                onChangeText={handleAmountChange}
                keyboardType="numeric"
                placeholder="0"
                placeholderTextColor={Colors.textTertiary}
                style={[styles.textInput, styles.amountInput]}
              />
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{t('finance.date')}</Text>
            <TouchableOpacity
              style={styles.dateCard}
              onPress={() => handleOpenDate('date')}
              activeOpacity={0.85}
            >
              <View>
                <Text style={styles.dateLabel}>{startDate.toLocaleDateString()}</Text>
                <Text style={styles.dateHint}>{t('finance.changeDate')}</Text>
              </View>
              <Ionicons name="calendar-outline" size={18} color={Colors.textSecondary} />
            </TouchableOpacity>
          </View>

          <View style={styles.section}>
            <View style={styles.expectedHeader}>
              <Text style={styles.sectionTitle}>{t('finance.expectedReturn')}</Text>

              {expectedDate && (
                <Pressable onPress={handleClearExpected} hitSlop={8}>
                  <Text style={styles.clearButton}>{t('finance.clear')}</Text>
                </Pressable>
              )}
            </View>

            <TouchableOpacity
              style={styles.dateCard}
              onPress={() => handleOpenDate('expected')}
              activeOpacity={0.85}
            >
              <View>
                <Text style={styles.dateLabel}>
                  {expectedDate
                    ? expectedDate.toLocaleDateString()
                    : t('finance.expectedPlaceholder')}
                </Text>
                <Text style={styles.dateHint}>{t('finance.selectDate')}</Text>
              </View>
              <Ionicons name="calendar-outline" size={18} color={Colors.textSecondary} />
            </TouchableOpacity>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{t('finance.note')}</Text>
            <View style={styles.noteInputWrapper}>
              <TextInput
                value={note}
                onChangeText={setNote}
                placeholder={t('finance.notePlaceholder')}
                placeholderTextColor={Colors.textTertiary}
                style={styles.noteInput}
                multiline
              />
            </View>
          </View>

          <TouchableOpacity
            style={[styles.saveButton, isSaveDisabled && styles.saveButtonDisabled]}
            onPress={handleSubmit}
            activeOpacity={0.9}
            disabled={isSaveDisabled}
          >
            <Text style={styles.saveButtonText}>
              {isEditing ? t('finance.saveChanges') : t('finance.save')}
            </Text>
          </TouchableOpacity>
        </KeyboardAvoidingView>
      </CustomModal>

      <DateChangeModal ref={dateModalRef} onSelectDate={handleSelectDate} />
    </>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  subtitle: {
    marginTop: 4,
    fontSize: 13,
    color: Colors.textSecondary,
  },
  statusBadge: {
    marginTop: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  typeToggle: {
    marginTop: 20,
    flexDirection: 'row',
    backgroundColor: Colors.surfaceElevated,
    borderRadius: 14,
    padding: 4,
    position: 'relative',
  },
  typeButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 12,
    zIndex: 2,
  },
  typeButtonActive: {
    zIndex: 3,
  },
  typeLabel: {
    fontSize: 13,
    fontWeight: '500',
    color: Colors.textSecondary,
  },
  typeLabelActive: {
    color: Colors.textPrimary,
  },
  typeIndicator: {
    position: 'absolute',
    top: 4,
    bottom: 4,
    left: 4,
    width: 120,
    backgroundColor: Colors.surface,
    borderRadius: 12,
  },
  section: {
    marginTop: 20,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  inputWrapper: {
    marginTop: 12,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.surfaceElevated,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  textInput: {
    fontSize: 15,
    color: Colors.textPrimary,
  },
  amountInput: {
    fontSize: 28,
    textAlign: 'center',
  },
  dateCard: {
    marginTop: 12,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.surfaceElevated,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dateLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  dateHint: {
    marginTop: 4,
    fontSize: 13,
    color: Colors.textSecondary,
  },
  expectedHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  clearButton: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  noteInputWrapper: {
    marginTop: 12,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.surfaceElevated,
    padding: 14,
  },
  noteInput: {
    minHeight: 60,
    color: Colors.textPrimary,
    fontSize: 14,
    textAlignVertical: 'top',
  },
  saveButton: {
    marginTop: 24,
    borderRadius: 16,
    paddingVertical: 16,
    backgroundColor: Colors.primary,
    alignItems: 'center',
  },
  saveButtonDisabled: {
    backgroundColor: Colors.textTertiary,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
});
