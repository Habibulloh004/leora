import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Switch,
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
import { Wallet } from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import CustomModal from '@/components/modals/CustomModal';
import DateChangeModal from '@/components/modals/DateChangeModal';
import { BottomSheetHandle } from '@/components/modals/BottomSheet';
import { useAppTheme, type Theme } from '@/constants/theme';
import { useLocalization } from '@/localization/useLocalization';
import { useFinanceStore } from '@/stores/useFinanceStore';
import { useModalStore } from '@/stores/useModalStore';
import {
  AVAILABLE_FINANCE_CURRENCIES,
  type FinanceCurrency,
  useFinancePreferencesStore,
} from '@/stores/useFinancePreferencesStore';
import type { AccountItem } from '@/types/accounts';
import { applyOpacity } from '@/utils/color';

type DebtType = 'borrowed' | 'lent';
type ActiveDateField = 'date' | 'expected' | null;

const formatPresetAmount = (value: number) => {
  if (!Number.isFinite(value)) {
    return '';
  }

  const fraction = value % 1 === 0 ? 0 : 2;
  return value.toLocaleString('en-US', {
    minimumFractionDigits: fraction,
    maximumFractionDigits: fraction,
  });
};

const formatAmountInputValue = (value: string) => {
  const cleaned = value.replace(/[^0-9.,]/g, '').replace(/,/g, '');
  if (!cleaned) {
    return { formatted: '', numeric: 0 };
  }

  const [integerRaw, fractionRaw = ''] = cleaned.split('.');
  const integer = integerRaw.replace(/^0+(?=\d)/, '') || '0';
  const parsedInteger = Number.parseInt(integer, 10);
  const formattedInteger = Number.isFinite(parsedInteger)
    ? parsedInteger.toLocaleString('en-US')
    : '0';
  const hasTrailingDot = cleaned.endsWith('.');
  const sanitizedFraction = fractionRaw.replace(/[^0-9]/g, '').slice(0, 2);

  let formatted = formattedInteger;
  if (sanitizedFraction.length > 0) {
    formatted += `.${sanitizedFraction}`;
  } else if (hasTrailingDot) {
    formatted += '.';
  }

  const numeric = Number.parseFloat(
    sanitizedFraction.length > 0
      ? `${integer}.${sanitizedFraction}`
      : integer,
  );

  return {
    formatted,
    numeric: Number.isFinite(numeric) ? numeric : 0,
  };
};

const ensureCurrency = (value?: string): FinanceCurrency => {
  if (!value) {
    return 'USD';
  }
  const upper = value.toUpperCase();
  return AVAILABLE_FINANCE_CURRENCIES.includes(upper as FinanceCurrency)
    ? (upper as FinanceCurrency)
    : 'USD';
};

const getAccountCurrency = (account?: AccountItem | null) =>
  ensureCurrency(account?.currency);

const formatCurrencyValue = (value: number, currency: FinanceCurrency) => {
  const locale = currency === 'UZS' ? 'uz-UZ' : 'en-US';
  try {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency,
      maximumFractionDigits: currency === 'UZS' ? 0 : 2,
    }).format(value);
  } catch {
    return `${currency} ${value.toFixed(2)}`;
  }
};

export default function DebtModal() {
  const modalRef = useRef<BottomSheetHandle>(null);
  const dateModalRef = useRef<BottomSheetHandle>(null);
  const scheduleDateModalRef = useRef<BottomSheetHandle>(null);
  const accountModalRef = useRef<BottomSheetHandle>(null);
  const currencyModalRef = useRef<BottomSheetHandle>(null);
  const fullPaymentModalRef = useRef<BottomSheetHandle>(null);
  const paymentModalRef = useRef<BottomSheetHandle>(null);
  const scheduleModalRef = useRef<BottomSheetHandle>(null);
  const reminderModalRef = useRef<BottomSheetHandle>(null);

  const theme = useAppTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);

  const { strings } = useLocalization();
  const debtsStrings = strings.financeScreens.debts;
  const modalStrings = debtsStrings.modal;
  const paymentStrings = modalStrings.payment;
  const actionButtons =
    modalStrings.actionsBar ?? {
      pay: 'Pay debt',
      partial: 'Partial payment',
      notify: 'Notification',
      schedule: 'Manage dates',
    };

  const debtModal = useModalStore((state) => state.debtModal);
  const closeDebtModal = useModalStore((state) => state.closeDebtModal);
  const consumeDebtModalFocus = useModalStore((state) => state.consumeDebtModalFocus);

  const accounts = useFinanceStore((state) => state.accounts);
  const debts = useFinanceStore((state) => state.debts);
  const addDebt = useFinanceStore((state) => state.addDebt);
  const updateDebt = useFinanceStore((state) => state.updateDebt);
  const deleteDebt = useFinanceStore((state) => state.deleteDebt);
  const payDebt = useFinanceStore((state) => state.payDebt);

  const defaultDebtAccounts = useFinancePreferencesStore(
    (state) => state.defaultDebtAccounts,
  );
  const setDefaultDebtAccount = useFinancePreferencesStore(
    (state) => state.setDefaultDebtAccount,
  );
  const convertAmount = useFinancePreferencesStore((state) => state.convertAmount);

  const resolvedDebt = useMemo(() => {
    if (!debtModal.debt) {
      return null;
    }
    return debts.find((debt) => debt.id === debtModal.debt?.id) ?? debtModal.debt;
  }, [debtModal.debt, debts]);

  const editingDebt = resolvedDebt;
  const isEditing = Boolean(debtModal.mode === 'edit' && editingDebt);

  const [person, setPerson] = useState('');
  const [amountInput, setAmountInput] = useState('');
  const [amountValue, setAmountValue] = useState(0);
  const [activeType, setActiveType] = useState<DebtType>('borrowed');
  const [note, setNote] = useState('');
  const [startDate, setStartDate] = useState(new Date());
  const [expectedDate, setExpectedDate] = useState<Date | undefined>(undefined);
  const [activeDateField, setActiveDateField] = useState<ActiveDateField>(null);
  const [paymentAmountInput, setPaymentAmountInput] = useState('');
  const [paymentAmountValue, setPaymentAmountValue] = useState(0);
  const [paymentAccountId, setPaymentAccountId] = useState<string | null>(null);
  const [paymentCurrency, setPaymentCurrency] = useState<FinanceCurrency>('USD');
  const [paymentNote, setPaymentNote] = useState('');
  const [accountSelectorContext, setAccountSelectorContext] = useState<'debt' | 'payment'>('debt');
  const [currencySelectorContext, setCurrencySelectorContext] = useState<'debt' | 'payment'>('debt');
  const [selectedAccountId, setSelectedAccountId] = useState<string | null>(null);
  const [selectedCurrency, setSelectedCurrency] = useState<FinanceCurrency>('USD');
  const [scheduleDate, setScheduleDate] = useState<Date>(new Date());
  const [reminderEnabled, setReminderEnabled] = useState(false);
  const [reminderTime, setReminderTime] = useState('09:00');

  const indicatorProgress = useSharedValue(0);
  const toggleSegment = useSharedValue(0);

  useEffect(() => {
    if (debtModal.isOpen && debtModal.showPrimarySheet) {
      modalRef.current?.present();
    } else {
      modalRef.current?.dismiss();
    }
  }, [debtModal.isOpen, debtModal.showPrimarySheet]);

  const getDefaultAccountId = useCallback(
    (type: DebtType) => defaultDebtAccounts[type] ?? accounts[0]?.id ?? null,
    [accounts, defaultDebtAccounts],
  );

  const resetForm = useCallback(
    (type: DebtType = 'borrowed') => {
      setPerson('');
      setAmountInput('');
      setAmountValue(0);
      setActiveType(type);
      setNote('');
      setStartDate(new Date());
      setExpectedDate(undefined);
      setActiveDateField(null);
      const fallbackAccountId = getDefaultAccountId(type);
      setSelectedAccountId(fallbackAccountId);
      const defaultCurrency = fallbackAccountId
        ? getAccountCurrency(accounts.find((acc) => acc.id === fallbackAccountId))
        : 'USD';
      setSelectedCurrency(defaultCurrency);
      setPaymentAccountId(fallbackAccountId);
      setPaymentCurrency(defaultCurrency);
      setPaymentAmountInput('');
      setPaymentAmountValue(0);
      setPaymentNote('');
      setScheduleDate(new Date());
      setReminderEnabled(false);
      setReminderTime('09:00');
    },
    [accounts, getDefaultAccountId],
  );

  useEffect(() => {
    if (!debtModal.isOpen) {
      resetForm('borrowed');
      return;
    }

    if (editingDebt) {
      setActiveType(editingDebt.type);
      setPerson(editingDebt.person);
      setAmountInput(formatPresetAmount(editingDebt.amount));
      setAmountValue(editingDebt.amount);
      setNote(editingDebt.note ?? '');
      setStartDate(new Date(editingDebt.date));
      const expected = editingDebt.expectedReturnDate
        ? new Date(editingDebt.expectedReturnDate)
        : undefined;
      setExpectedDate(expected);
      setScheduleDate(expected ?? new Date());
      setReminderEnabled(editingDebt.reminderEnabled ?? false);
      setReminderTime(editingDebt.reminderTime ?? '09:00');
      const fallbackAccount = editingDebt.accountId ?? getDefaultAccountId(editingDebt.type);
      setSelectedAccountId(fallbackAccount);
      setSelectedCurrency(editingDebt.currency);
      setPaymentAccountId(fallbackAccount);
      setPaymentCurrency(editingDebt.currency);
      setPaymentAmountInput('');
      setPaymentAmountValue(0);
      setPaymentNote('');
      return;
    }

    resetForm('borrowed');
  }, [debtModal.isOpen, editingDebt, getDefaultAccountId, resetForm]);

  useEffect(() => {
    if (!debtModal.isOpen || isEditing) {
      return;
    }
    const defaultAccountId = getDefaultAccountId(activeType);
    setSelectedAccountId(defaultAccountId);
    if (defaultAccountId) {
      const defaultCurrency = getAccountCurrency(
        accounts.find((acc) => acc.id === defaultAccountId),
      );
      setSelectedCurrency(defaultCurrency);
    }
  }, [accounts, activeType, debtModal.isOpen, getDefaultAccountId, isEditing]);

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
    () => (activeType === 'lent' ? theme.colors.success : theme.colors.danger),
    [activeType, theme.colors.danger, theme.colors.success],
  );

  const selectedAccount = useMemo(
    () => accounts.find((acc) => acc.id === selectedAccountId) ?? null,
    [accounts, selectedAccountId],
  );
  const accountHelper = selectedAccount?.subtitle ?? modalStrings.accountHelper;
  const paymentAccount = useMemo(
    () => accounts.find((acc) => acc.id === paymentAccountId) ?? null,
    [accounts, paymentAccountId],
  );
  const paymentAccountHelper = paymentAccount?.subtitle ?? paymentStrings.helper;

  const isSaveDisabled =
    !person.trim() || amountValue <= 0 || !startDate || !selectedAccountId;
  const outstandingInPaymentCurrency = useMemo(() => {
    if (editingDebt) {
      return convertAmount(editingDebt.remainingAmount, editingDebt.currency, paymentCurrency);
    }
    return amountValue;
  }, [amountValue, convertAmount, editingDebt, paymentCurrency]);

  const isPaymentDisabled =
    !paymentAccountId || paymentAmountValue <= 0 || paymentAmountValue > outstandingInPaymentCurrency;

  const handleAmountChange = useCallback((value: string) => {
    const { formatted, numeric } = formatAmountInputValue(value);
    setAmountInput(formatted);
    setAmountValue(numeric);
  }, []);

  const handleSelectDate = useCallback(
    (selected: Date) => {
      if (!(selected instanceof Date) || Number.isNaN(selected.getTime())) {
        return;
      }
      if (activeDateField === 'expected') {
        setExpectedDate(selected);
      } else {
        setStartDate(selected);
      }
      setActiveDateField(null);
    },
    [activeDateField],
  );

  const handleOpenDate = useCallback((field: ActiveDateField) => {
    setActiveDateField(field);
    dateModalRef.current?.present();
  }, []);

  const handleCancel = useCallback(() => {
    resetForm(activeType);
    closeDebtModal();
  }, [activeType, closeDebtModal, resetForm]);

  const handleSubmit = useCallback(() => {
    if (isSaveDisabled || !selectedAccountId) {
      return;
    }

    const payload = {
      person: person.trim(),
      amount: amountValue,
      type: activeType,
      currency: selectedCurrency,
      date: startDate,
      expectedReturnDate: expectedDate,
      note: note.trim() || undefined,
      accountId: selectedAccountId,
    };

    if (isEditing && editingDebt) {
      updateDebt(editingDebt.id, payload);
    } else {
      addDebt(payload);
      setDefaultDebtAccount(activeType, selectedAccountId);
    }

    closeDebtModal();
  }, [
    activeType,
    addDebt,
    amountValue,
    closeDebtModal,
    editingDebt,
    expectedDate,
    isEditing,
    isSaveDisabled,
    note,
    person,
    selectedAccountId,
    selectedCurrency,
    setDefaultDebtAccount,
    startDate,
    updateDebt,
  ]);

  const handleClearExpected = useCallback(() => {
    setExpectedDate(undefined);
  }, []);

  const handleDelete = useCallback(() => {
    if (!isEditing || !editingDebt) {
      return;
    }
    Alert.alert(modalStrings.deleteTitle, modalStrings.deleteDescription, [
      {
        text: modalStrings.buttons.cancel,
        style: 'cancel',
      },
      {
        text: modalStrings.buttons.delete,
        style: 'destructive',
        onPress: () => {
          deleteDebt(editingDebt.id);
          closeDebtModal();
        },
      },
    ]);
  }, [closeDebtModal, deleteDebt, editingDebt, isEditing, modalStrings]);

  const handleSelectAccount = useCallback(
    (accountId: string) => {
      const account = accounts.find((acc) => acc.id === accountId);
      if (accountSelectorContext === 'payment') {
        setPaymentAccountId(accountId);
      } else {
        setSelectedAccountId(accountId);
        const accountCurrency = getAccountCurrency(account);
        setSelectedCurrency(accountCurrency);
        setPaymentCurrency(accountCurrency);
        if (!isEditing) {
          setDefaultDebtAccount(activeType, accountId);
        }
      }
      accountModalRef.current?.dismiss();
    },
    [accountSelectorContext, accounts, activeType, isEditing, setDefaultDebtAccount],
  );

  const handleSelectCurrency = useCallback(
    (currency: FinanceCurrency) => {
      if (currencySelectorContext === 'payment') {
        setPaymentCurrency(currency);
      } else {
        setSelectedCurrency(currency);
      }
      currencyModalRef.current?.dismiss();
    },
    [currencySelectorContext],
  );

  const handlePaymentAmountChange = useCallback((value: string) => {
    const { formatted, numeric } = formatAmountInputValue(value);
    setPaymentAmountInput(formatted);
    setPaymentAmountValue(numeric);
  }, []);

  const handleOpenFullPaymentModal = useCallback(() => {
    if (!isEditing || !editingDebt) {
      return;
    }
    fullPaymentModalRef.current?.present();
  }, [editingDebt, isEditing]);

  const shouldCloseContext = debtModal.isOpen && !debtModal.showPrimarySheet;

  const closeShortcutContext = useCallback(() => {
    if (shouldCloseContext) {
      closeDebtModal();
    }
  }, [closeDebtModal, shouldCloseContext]);

  const handleCloseFullPaymentModal = useCallback(() => {
    fullPaymentModalRef.current?.dismiss();
    closeShortcutContext();
  }, [closeShortcutContext]);

  const handleOpenPartialPaymentModal = useCallback(() => {
    if (!isEditing) {
      return;
    }
    paymentModalRef.current?.present();
  }, [isEditing]);

  const handleClosePaymentModal = useCallback(() => {
    paymentModalRef.current?.dismiss();
    closeShortcutContext();
  }, [closeShortcutContext]);

  const handleOpenScheduleModal = useCallback(() => {
    if (!isEditing) {
      return;
    }
    scheduleModalRef.current?.present();
  }, [isEditing]);

  const handleCloseScheduleModal = useCallback(() => {
    scheduleModalRef.current?.dismiss();
    closeShortcutContext();
  }, [closeShortcutContext]);

  const handleOpenReminderModal = useCallback(() => {
    if (!isEditing) {
      return;
    }
    reminderModalRef.current?.present();
  }, [isEditing]);

  const handleCloseReminderModal = useCallback(() => {
    reminderModalRef.current?.dismiss();
    closeShortcutContext();
  }, [closeShortcutContext]);

  const handleOpenScheduleDatePicker = useCallback(() => {
    scheduleDateModalRef.current?.present();
  }, []);

  const handleRecordPayment = useCallback(() => {
    if (!isEditing || !editingDebt || !paymentAccountId || paymentAmountValue <= 0) {
      return;
    }

    if (paymentAmountValue > outstandingInPaymentCurrency) {
      Alert.alert(
        paymentStrings.amount,
        paymentStrings.limitError ?? 'Payment exceeds remaining amount',
      );
      return;
    }

    payDebt({
      debtId: editingDebt.id,
      amount: paymentAmountValue,
      currency: paymentCurrency,
      accountId: paymentAccountId,
      note: paymentNote.trim() || undefined,
    });

    setPaymentAmountInput('');
    setPaymentAmountValue(0);
    setPaymentNote('');
    handleClosePaymentModal();
  }, [
    editingDebt,
    handleClosePaymentModal,
    isEditing,
    outstandingInPaymentCurrency,
    payDebt,
    paymentAccountId,
    paymentAmountValue,
    paymentCurrency,
    paymentNote,
    paymentStrings.amount,
    paymentStrings.limitError,
  ]);

  const fullPaymentCurrency = editingDebt?.currency ?? selectedCurrency;
  const formattedFullPaymentAmount = formatCurrencyValue(
    editingDebt?.remainingAmount ?? 0,
    fullPaymentCurrency,
  );
  const fullPaymentDescriptionText = (modalStrings.fullPaymentDescription ?? 'You will pay {amount}.').replace(
    '{amount}',
    formattedFullPaymentAmount,
  );

  const isFullPaymentDisabled =
    !editingDebt || editingDebt.remainingAmount <= 0 || !(paymentAccountId ?? selectedAccountId);

  const handleFullPayment = useCallback(() => {
    if (!isEditing || !editingDebt) {
      return;
    }
    const targetAccountId = paymentAccountId ?? selectedAccountId ?? accounts[0]?.id ?? null;
    if (!targetAccountId) {
      Alert.alert(modalStrings.accountLabel, modalStrings.accountHelper);
      return;
    }
    if (editingDebt.remainingAmount <= 0) {
      handleCloseFullPaymentModal();
      return;
    }

    payDebt({
      debtId: editingDebt.id,
      amount: editingDebt.remainingAmount,
      currency: editingDebt.currency,
      accountId: targetAccountId,
      note: fullPaymentDescriptionText,
    });

    handleCloseFullPaymentModal();
  }, [
    accounts,
    editingDebt,
    fullPaymentDescriptionText,
    handleCloseFullPaymentModal,
    isEditing,
    modalStrings.accountHelper,
    modalStrings.accountLabel,
    payDebt,
    paymentAccountId,
    selectedAccountId,
  ]);

  const handleScheduleDateChange = useCallback((date: Date) => {
    setScheduleDate(date);
  }, []);

  const handleReminderTimeChange = useCallback((value: string) => {
    const sanitized = value.replace(/[^0-9:]/g, '').slice(0, 5);
    setReminderTime(sanitized);
  }, []);

  const handleToggleReminder = useCallback((value: boolean) => {
    setReminderEnabled(value);
  }, []);

  const handleSaveSchedule = useCallback(() => {
    if (!isEditing || !editingDebt) {
      return;
    }
    updateDebt(editingDebt.id, { expectedReturnDate: scheduleDate });
    setExpectedDate(scheduleDate);
    handleCloseScheduleModal();
  }, [editingDebt, handleCloseScheduleModal, isEditing, scheduleDate, updateDebt]);

  const handleSaveReminder = useCallback(() => {
    if (!isEditing || !editingDebt) {
      return;
    }
    updateDebt(editingDebt.id, {
      reminderEnabled,
      reminderTime: reminderEnabled ? reminderTime : undefined,
    });
    handleCloseReminderModal();
  }, [
    editingDebt,
    handleCloseReminderModal,
    isEditing,
    reminderEnabled,
    reminderTime,
    updateDebt,
  ]);

  useEffect(() => {
    if (!debtModal.isOpen || !debtModal.initialFocus) {
      return;
    }

    switch (debtModal.initialFocus) {
      case 'full':
        handleOpenFullPaymentModal();
        break;
      case 'partial':
        handleOpenPartialPaymentModal();
        break;
      case 'schedule':
        handleOpenScheduleModal();
        break;
      case 'reminder':
        handleOpenReminderModal();
        break;
      default:
        break;
    }

    consumeDebtModalFocus();
  }, [
    consumeDebtModalFocus,
    debtModal.initialFocus,
    debtModal.isOpen,
    handleOpenFullPaymentModal,
    handleOpenPartialPaymentModal,
    handleOpenReminderModal,
    handleOpenScheduleModal,
  ]);

  return (
    <>
      <CustomModal
        ref={modalRef}
        variant="form"
        scrollable
        scrollProps={{ keyboardShouldPersistTaps: 'handled' }}
        onDismiss={handleCancel}
        fallbackSnapPoint="88%"
        enableDynamicSizing
      >
        <KeyboardAvoidingView behavior={Platform.select({ ios: 'padding' })}>
          <View style={styles.header}>
            <View>
              <Text style={styles.title}>
                {isEditing ? modalStrings.editTitle : modalStrings.title}
              </Text>
              <Text style={styles.subtitle}>{modalStrings.subtitle}</Text>
            </View>
            <Pressable onPress={handleCancel} hitSlop={12}>
              <Ionicons name="close" size={24} color={theme.colors.textSecondary} />
            </Pressable>
          </View>

          <View
            style={[
              styles.statusBadge,
              { backgroundColor: applyOpacity(statusColor, 0.12) },
            ]}
          >
            <Text style={[styles.statusText, { color: statusColor }]}>
              {activeType === 'lent'
                ? modalStrings.status.lent
                : modalStrings.status.borrowed}
            </Text>
          </View>

          <View
            style={styles.typeToggle}
            onLayout={(event) => {
              toggleSegment.value = event.nativeEvent.layout.width / 2;
            }}
          >
            <TouchableOpacity
              style={[styles.typeButton, activeType === 'borrowed' && styles.typeButtonActive]}
              onPress={() => setActiveType('borrowed')}
              activeOpacity={0.85}
            >
              <Text
                style={[
                  styles.typeLabel,
                  activeType === 'borrowed' && styles.typeLabelActive,
                ]}
              >
                {modalStrings.toggles.outgoing}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.typeButton, activeType === 'lent' && styles.typeButtonActive]}
              onPress={() => setActiveType('lent')}
              activeOpacity={0.85}
            >
              <Text
                style={[
                  styles.typeLabel,
                  activeType === 'lent' && styles.typeLabelActive,
                ]}
              >
                {modalStrings.toggles.incoming}
              </Text>
            </TouchableOpacity>

            <Animated.View style={[styles.typeIndicator, indicatorStyle]} />
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{modalStrings.person}</Text>
            <View style={styles.inputWrapper}>
              <TextInput
                value={person}
                onChangeText={setPerson}
                placeholder={modalStrings.personPlaceholder}
                placeholderTextColor={theme.colors.textMuted}
                style={styles.textInput}
              />
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{modalStrings.amount}</Text>
            <View style={styles.inputWrapper}>
              <TextInput
                value={amountInput}
                onChangeText={handleAmountChange}
                keyboardType="numeric"
                placeholder="0"
                placeholderTextColor={theme.colors.textMuted}
                style={[styles.textInput, styles.amountInput]}
              />
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{modalStrings.accountLabel}</Text>
            <TouchableOpacity
              style={styles.selectorCard}
              onPress={() => {
                setAccountSelectorContext('debt');
                accountModalRef.current?.present();
              }}
              activeOpacity={0.85}
            >
              <View>
                <Text style={styles.selectorValue}>
                  {selectedAccount?.name ?? modalStrings.selectAccount}
                </Text>
                <Text style={styles.selectorHint}>{accountHelper}</Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color={theme.colors.textSecondary} />
            </TouchableOpacity>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{modalStrings.currencyLabel}</Text>
            <TouchableOpacity
              style={styles.selectorCard}
              onPress={() => {
                setCurrencySelectorContext('debt');
                currencyModalRef.current?.present();
              }}
              activeOpacity={0.85}
            >
              <View>
                <Text style={styles.selectorValue}>{selectedCurrency}</Text>
                <Text style={styles.selectorHint}>{modalStrings.currencyHelper}</Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color={theme.colors.textSecondary} />
            </TouchableOpacity>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{modalStrings.dateLabel}</Text>
            <TouchableOpacity
              style={styles.dateCard}
              onPress={() => handleOpenDate('date')}
              activeOpacity={0.85}
            >
              <View>
                <Text style={styles.dateLabel}>{startDate.toLocaleDateString()}</Text>
                <Text style={styles.dateHint}>{modalStrings.changeDate}</Text>
              </View>
              <Ionicons name="calendar-outline" size={18} color={theme.colors.textSecondary} />
            </TouchableOpacity>
          </View>

          <View style={styles.section}>
            <View style={styles.expectedHeader}>
              <Text style={styles.sectionTitle}>{modalStrings.expectedReturn}</Text>
              {expectedDate && (
                <Pressable onPress={handleClearExpected} hitSlop={8}>
                  <Text style={styles.clearButton}>{modalStrings.clear}</Text>
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
                  {expectedDate ? expectedDate.toLocaleDateString() : modalStrings.expectedPlaceholder}
                </Text>
                <Text style={styles.dateHint}>{modalStrings.selectDate}</Text>
              </View>
              <Ionicons name="calendar-outline" size={18} color={theme.colors.textSecondary} />
            </TouchableOpacity>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{modalStrings.note}</Text>
            <View style={styles.noteInputWrapper}>
              <TextInput
                value={note}
                onChangeText={setNote}
                placeholder={modalStrings.notePlaceholder}
                placeholderTextColor={theme.colors.textMuted}
                style={styles.noteInput}
                multiline
              />
            </View>
          </View>

          {isEditing && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>{modalStrings.manageActions ?? 'Manage debt'}</Text>
              <View style={styles.actionsGrid}>
                <Pressable
                  style={({ pressed }) => [styles.actionCard, pressed && styles.actionCardPressed]}
                  onPress={(event) => {
                    event.stopPropagation();
                    handleOpenFullPaymentModal();
                  }}
                >
                  <View
                    style={[
                      styles.actionIcon,
                      { backgroundColor: applyOpacity(theme.colors.primary, 0.12) },
                    ]}
                  >
                    <Ionicons name="card" size={18} color={theme.colors.primary} />
                  </View>
                  <View style={styles.actionText}>
                    <Text style={styles.actionTitle}>{actionButtons.pay}</Text>
                    <Text style={styles.actionSubtitle}>{formattedFullPaymentAmount}</Text>
                  </View>
                  <Ionicons name="chevron-forward" size={18} color={theme.colors.textSecondary} />
                </Pressable>

                <Pressable
                  style={({ pressed }) => [styles.actionCard, pressed && styles.actionCardPressed]}
                  onPress={(event) => {
                    event.stopPropagation();
                    handleOpenPartialPaymentModal();
                  }}
                >
                  <View
                    style={[
                      styles.actionIcon,
                      { backgroundColor: applyOpacity(theme.colors.info, 0.12) },
                    ]}
                  >
                    <Ionicons name="swap-vertical" size={18} color={theme.colors.info} />
                  </View>
                  <View style={styles.actionText}>
                    <Text style={styles.actionTitle}>{actionButtons.partial}</Text>
                    <Text style={styles.actionSubtitle}>{paymentStrings.helper}</Text>
                  </View>
                  <Ionicons name="chevron-forward" size={18} color={theme.colors.textSecondary} />
                </Pressable>

                <Pressable
                  style={({ pressed }) => [styles.actionCard, pressed && styles.actionCardPressed]}
                  onPress={(event) => {
                    event.stopPropagation();
                    handleOpenScheduleModal();
                  }}
                >
                  <View
                    style={[
                      styles.actionIcon,
                      { backgroundColor: applyOpacity(theme.colors.warning, 0.12) },
                    ]}
                  >
                    <Ionicons name="calendar" size={18} color={theme.colors.warning} />
                  </View>
                  <View style={styles.actionText}>
                    <Text style={styles.actionTitle}>{actionButtons.schedule}</Text>
                    <Text style={styles.actionSubtitle}>{scheduleDate.toLocaleDateString()}</Text>
                  </View>
                  <Ionicons name="chevron-forward" size={18} color={theme.colors.textSecondary} />
                </Pressable>

                <Pressable
                  style={({ pressed }) => [styles.actionCard, pressed && styles.actionCardPressed]}
                  onPress={(event) => {
                    event.stopPropagation();
                    handleOpenReminderModal();
                  }}
                >
                  <View
                    style={[
                      styles.actionIcon,
                      { backgroundColor: applyOpacity(theme.colors.secondary, 0.12) },
                    ]}
                  >
                    <Ionicons name="notifications-outline" size={18} color={theme.colors.secondary} />
                  </View>
                  <View style={styles.actionText}>
                    <Text style={styles.actionTitle}>{actionButtons.notify}</Text>
                    <Text style={styles.actionSubtitle}>
                      {reminderEnabled
                        ? modalStrings.reminderEnabledLabel ?? 'Notifications on'
                        : modalStrings.reminderDisabledLabel ?? 'Notifications off'}
                    </Text>
                  </View>
                  <Ionicons name="chevron-forward" size={18} color={theme.colors.textSecondary} />
                </Pressable>
              </View>
            </View>
          )}

          <SafeAreaView edges={['bottom', 'left', 'right']} style={styles.footerSafeArea}>
            <View style={styles.footerButtons}>
              <TouchableOpacity
                style={styles.secondaryButton}
                onPress={handleCancel}
                activeOpacity={0.9}
              >
                <Text style={styles.secondaryButtonText}>{modalStrings.buttons.cancel}</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.saveButton, isSaveDisabled && styles.saveButtonDisabled]}
                onPress={handleSubmit}
                activeOpacity={0.9}
                disabled={isSaveDisabled}
              >
                <Text style={styles.saveButtonText}>
                  {isEditing ? modalStrings.buttons.saveChanges : modalStrings.buttons.save}
                </Text>
              </TouchableOpacity>
            </View>

            {isEditing && (
              <TouchableOpacity
                style={styles.deleteButton}
                onPress={handleDelete}
                activeOpacity={0.85}
              >
                <Text style={styles.deleteButtonText}>{modalStrings.buttons.delete}</Text>
              </TouchableOpacity>
            )}
          </SafeAreaView>
        </KeyboardAvoidingView>
      </CustomModal>

      <CustomModal
        ref={fullPaymentModalRef}
        variant="form"
        fallbackSnapPoint="50%"
        onDismiss={handleCloseFullPaymentModal}
      >
        <View style={styles.modalHeader}>
          <Text style={styles.modalTitle}>{modalStrings.fullPaymentTitle ?? 'Pay debt in full'}</Text>
          <Pressable onPress={handleCloseFullPaymentModal} hitSlop={10}>
            <Ionicons name="close" size={20} color={theme.colors.textSecondary} />
          </Pressable>
        </View>
        <Text style={styles.fullPaymentDescription}>{fullPaymentDescriptionText}</Text>

        <TouchableOpacity
          style={styles.selectorCard}
          onPress={() => {
            setAccountSelectorContext('payment');
            accountModalRef.current?.present();
          }}
          activeOpacity={0.85}
        >
          <View>
            <Text style={styles.selectorValue}>
              {paymentAccount?.name ?? modalStrings.selectAccount}
            </Text>
            <Text style={styles.selectorHint}>{paymentAccountHelper}</Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color={theme.colors.textSecondary} />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.selectorCard}
          onPress={() => {
            setCurrencySelectorContext('payment');
            currencyModalRef.current?.present();
          }}
          activeOpacity={0.85}
        >
          <View>
            <Text style={styles.selectorValue}>{paymentCurrency}</Text>
            <Text style={styles.selectorHint}>{modalStrings.currencyHelper}</Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color={theme.colors.textSecondary} />
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.saveButton, (isFullPaymentDisabled || !editingDebt) && styles.saveButtonDisabled]}
          onPress={handleFullPayment}
          activeOpacity={0.9}
          disabled={isFullPaymentDisabled || !editingDebt}
        >
          <Text style={styles.saveButtonText}>
            {modalStrings.fullPaymentSubmit ?? 'Pay in full'}
          </Text>
        </TouchableOpacity>
      </CustomModal>

      <CustomModal
        ref={paymentModalRef}
        variant="form"
        scrollable
        scrollProps={{ keyboardShouldPersistTaps: 'handled' }}
        fallbackSnapPoint="70%"
        onDismiss={handleClosePaymentModal}
      >
        <KeyboardAvoidingView behavior={Platform.select({ ios: 'padding' })}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>{paymentStrings.title}</Text>
            <Pressable onPress={handleClosePaymentModal} hitSlop={10}>
              <Ionicons name="close" size={20} color={theme.colors.textSecondary} />
            </Pressable>
          </View>

          <View style={styles.inputWrapper}>
            <TextInput
              value={paymentAmountInput}
              onChangeText={handlePaymentAmountChange}
              keyboardType="numeric"
              placeholder="0"
              placeholderTextColor={theme.colors.textMuted}
              style={[styles.textInput, styles.amountInput]}
            />
          </View>

          <TouchableOpacity
            style={styles.selectorCard}
            onPress={() => {
              setAccountSelectorContext('payment');
              accountModalRef.current?.present();
            }}
            activeOpacity={0.85}
          >
            <View>
              <Text style={styles.selectorValue}>
                {paymentAccount?.name ?? modalStrings.selectAccount}
              </Text>
              <Text style={styles.selectorHint}>{paymentAccountHelper}</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={theme.colors.textSecondary} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.selectorCard}
            onPress={() => {
              setCurrencySelectorContext('payment');
              currencyModalRef.current?.present();
            }}
            activeOpacity={0.85}
          >
            <View>
              <Text style={styles.selectorValue}>{paymentCurrency}</Text>
              <Text style={styles.selectorHint}>{paymentStrings.helper}</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={theme.colors.textSecondary} />
          </TouchableOpacity>

          <View style={styles.noteInputWrapper}>
            <TextInput
              value={paymentNote}
              onChangeText={setPaymentNote}
              placeholder={paymentStrings.note}
              placeholderTextColor={theme.colors.textMuted}
              style={styles.noteInput}
              multiline
            />
          </View>

          <TouchableOpacity
            style={[styles.saveButton, isPaymentDisabled && styles.saveButtonDisabled]}
            onPress={handleRecordPayment}
            activeOpacity={0.9}
            disabled={isPaymentDisabled}
          >
            <Text style={styles.saveButtonText}>{paymentStrings.submit}</Text>
          </TouchableOpacity>
        </KeyboardAvoidingView>
      </CustomModal>

      <CustomModal
        ref={scheduleModalRef}
        variant="form"
        fallbackSnapPoint="45%"
        onDismiss={handleCloseScheduleModal}
      >
        <View style={styles.modalHeader}>
          <Text style={styles.modalTitle}>{modalStrings.scheduleTitle ?? 'Repayment schedule'}</Text>
          <Pressable onPress={handleCloseScheduleModal} hitSlop={10}>
            <Ionicons name="close" size={20} color={theme.colors.textSecondary} />
          </Pressable>
        </View>

        <TouchableOpacity
          style={styles.dateCard}
          onPress={handleOpenScheduleDatePicker}
          activeOpacity={0.85}
        >
          <View>
            <Text style={styles.dateLabel}>{scheduleDate.toLocaleDateString()}</Text>
            <Text style={styles.dateHint}>{modalStrings.selectDate}</Text>
          </View>
          <Ionicons name="calendar-outline" size={18} color={theme.colors.textSecondary} />
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.saveButton, styles.modalSaveButton]}
          onPress={handleSaveSchedule}
          activeOpacity={0.9}
        >
          <Text style={styles.saveButtonText}>{modalStrings.buttons.saveChanges}</Text>
        </TouchableOpacity>
      </CustomModal>

      <CustomModal
        ref={reminderModalRef}
        variant="form"
        fallbackSnapPoint="55%"
        onDismiss={handleCloseReminderModal}
      >
        <View style={styles.modalHeader}>
          <Text style={styles.modalTitle}>{modalStrings.reminderTitle ?? 'Reminders'}</Text>
          <Pressable onPress={handleCloseReminderModal} hitSlop={10}>
            <Ionicons name="close" size={20} color={theme.colors.textSecondary} />
          </Pressable>
        </View>

        <View style={styles.reminderRow}>
          <Text style={styles.reminderLabel}>{modalStrings.reminderToggle ?? 'Enable notification'}</Text>
          <Switch value={reminderEnabled} onValueChange={handleToggleReminder} />
        </View>

        {reminderEnabled && (
          <View style={styles.reminderTimeWrapper}>
            <Text style={styles.selectorHint}>
              {modalStrings.reminderTimeLabel ?? 'Reminder time (HH:MM)'}
            </Text>
            <TextInput
              value={reminderTime}
              onChangeText={handleReminderTimeChange}
              placeholder="09:00"
              placeholderTextColor={theme.colors.textMuted}
              keyboardType="numeric"
              style={styles.reminderInput}
            />
          </View>
        )}

        <TouchableOpacity
          style={[styles.saveButton, styles.modalSaveButton]}
          onPress={handleSaveReminder}
          activeOpacity={0.9}
        >
          <Text style={styles.saveButtonText}>{modalStrings.buttons.saveChanges}</Text>
        </TouchableOpacity>
      </CustomModal>

      <DateChangeModal
        ref={dateModalRef}
        selectedDate={activeDateField === 'expected' ? expectedDate ?? startDate : startDate}
        onSelectDate={handleSelectDate}
      />

      <DateChangeModal
        ref={scheduleDateModalRef}
        selectedDate={scheduleDate}
        onSelectDate={handleScheduleDateChange}
      />

      <CustomModal ref={accountModalRef} variant="picker" fallbackSnapPoint="50%">
        <View style={styles.pickerHeader}>
          <Text style={styles.pickerTitle}>{modalStrings.accountPickerTitle}</Text>
          <Pressable onPress={() => accountModalRef.current?.dismiss()} hitSlop={10}>
            <Ionicons name="close" size={20} color={theme.colors.textSecondary} />
          </Pressable>
        </View>
        <View style={styles.pickerList}>
          {accounts.map((account) => {
            const selected = account.id === selectedAccountId;
            const currency = getAccountCurrency(account);
            return (
              <TouchableOpacity
                key={account.id}
                style={[styles.pickerItem, selected && styles.pickerItemSelected]}
                onPress={() => handleSelectAccount(account.id)}
                activeOpacity={0.85}
              >
                <View style={styles.pickerIcon}>
                  <Wallet size={16} color={theme.colors.textSecondary} />
                </View>
                <View style={styles.pickerInfo}>
                  <Text style={styles.pickerName}>{account.name}</Text>
                  <Text style={styles.pickerSubtitle}>
                    {currency} • {account.subtitle ?? modalStrings.accountHelper}
                  </Text>
                </View>
                <Ionicons
                  name={selected ? 'checkmark-circle' : 'ellipse-outline'}
                  size={20}
                  color={selected ? theme.colors.success : theme.colors.textSecondary}
                />
              </TouchableOpacity>
            );
          })}
        </View>
      </CustomModal>

      <CustomModal ref={currencyModalRef} variant="picker" fallbackSnapPoint="40%">
        <View style={styles.pickerHeader}>
          <Text style={styles.pickerTitle}>{modalStrings.currencyPickerTitle}</Text>
          <Pressable onPress={() => currencyModalRef.current?.dismiss()} hitSlop={10}>
            <Ionicons name="close" size={20} color={theme.colors.textSecondary} />
          </Pressable>
        </View>
        <View style={styles.pickerList}>
          {AVAILABLE_FINANCE_CURRENCIES.map((currency) => {
            const selected = currency === selectedCurrency;
            return (
              <TouchableOpacity
                key={currency}
                style={[styles.pickerItem, selected && styles.pickerItemSelected]}
                onPress={() => handleSelectCurrency(currency)}
                activeOpacity={0.85}
              >
                <View style={styles.pickerInfo}>
                  <Text style={styles.pickerName}>{currency}</Text>
                </View>
                <Ionicons
                  name={selected ? 'checkmark-circle' : 'ellipse-outline'}
                  size={20}
                  color={selected ? theme.colors.success : theme.colors.textSecondary}
                />
              </TouchableOpacity>
            );
          })}
        </View>
      </CustomModal>
    </>
  );
}

const createStyles = (theme: Theme) =>
  StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: theme.colors.textPrimary,
  },
  subtitle: {
    marginTop: 4,
    fontSize: 13,
    color: theme.colors.textSecondary,
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
    backgroundColor: theme.colors.surfaceElevated,
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
    color: theme.colors.textSecondary,
  },
  typeLabelActive: {
    color: theme.colors.textPrimary,
  },
  typeIndicator: {
    position: 'absolute',
    top: 4,
    bottom: 4,
    left: 4,
    width: 120,
    backgroundColor: theme.colors.surface,
    borderRadius: 12,
  },
  section: {
    marginTop: 20,
  },
  actionsGrid: {
    marginTop: 12,
    gap: 12,
  },
  actionCard: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surfaceElevated,
    paddingVertical: 14,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  actionCardPressed: {
    opacity: 0.9,
  },
  actionIcon: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionText: {
    flex: 1,
    gap: 2,
  },
  actionTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: theme.colors.textPrimary,
  },
  actionSubtitle: {
    fontSize: 13,
    color: theme.colors.textSecondary,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: theme.colors.textPrimary,
  },
  inputWrapper: {
    marginTop: 12,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surfaceElevated,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  textInput: {
    fontSize: 15,
    color: theme.colors.textPrimary,
  },
  amountInput: {
    fontSize: 28,
    textAlign: 'center',
  },
  selectorCard: {
    marginTop: 12,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surfaceElevated,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  selectorValue: {
    fontSize: 15,
    fontWeight: '600',
    color: theme.colors.textPrimary,
  },
  selectorHint: {
    marginTop: 4,
    fontSize: 13,
    color: theme.colors.textSecondary,
  },
  dateCard: {
    marginTop: 12,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surfaceElevated,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dateLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: theme.colors.textPrimary,
  },
  dateHint: {
    marginTop: 4,
    fontSize: 13,
    color: theme.colors.textSecondary,
  },
  expectedHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  clearButton: {
    fontSize: 13,
    fontWeight: '600',
    color: theme.colors.textSecondary,
  },
  noteInputWrapper: {
    marginTop: 12,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surfaceElevated,
    padding: 14,
  },
  noteInput: {
    minHeight: 60,
    color: theme.colors.textPrimary,
    fontSize: 14,
    textAlignVertical: 'top',
  },
  footerSafeArea: {
    paddingTop: 20,
  },
  footerButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.colors.textPrimary,
  },
  modalSaveButton: {
    marginTop: 20,
  },
  secondaryButton: {
    flex: 1,
    borderRadius: 16,
    paddingVertical: 16,
    borderWidth: 1,
    borderColor: theme.colors.border,
    alignItems: 'center',
    backgroundColor: theme.colors.surfaceElevated,
  },
  secondaryButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.textPrimary,
  },
  saveButton: {
    flex: 1,
    borderRadius: 16,
    paddingVertical: 16,
    backgroundColor: theme.colors.primary,
    alignItems: 'center',
  },
  saveButtonDisabled: {
    backgroundColor: theme.colors.textMuted,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.textPrimary,
  },
  deleteButton: {
    marginTop: 16,
    alignItems: 'center',
    backgroundColor: "transparent",
    borderColor: theme.colors.border,
    paddingVertical: 18,
    borderRadius: 16
  },
  deleteButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: theme.colors.danger,
  },
  pickerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
  },
  pickerTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.textPrimary,
  },
  pickerList: {
    marginTop: 16,
    gap: 14,
  },
  pickerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surfaceElevated,
    padding: 14,
    gap: 12,
  },
  pickerItemSelected: {
    borderColor: theme.colors.primary,
  },
  pickerIcon: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.surface,
  },
  pickerInfo: {
    flex: 1,
  },
  pickerName: {
    fontSize: 15,
    fontWeight: '600',
    color: theme.colors.textPrimary,
  },
  pickerSubtitle: {
    marginTop: 2,
    fontSize: 12,
    color: theme.colors.textSecondary,
  },
  reminderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  reminderLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: theme.colors.textPrimary,
  },
  reminderTimeWrapper: {
    marginTop: 12,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surfaceElevated,
    padding: 14,
  },
  reminderInput: {
    marginTop: 6,
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.textPrimary,
  },
  fullPaymentDescription: {
    marginBottom: 12,
    fontSize: 14,
    color: theme.colors.textSecondary,
  },
});
