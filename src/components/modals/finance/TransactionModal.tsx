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
import { ArrowRightLeft, Wallet } from 'lucide-react-native';

import CustomModal from '@/components/modals/CustomModal';
import DateChangeModal from '@/components/modals/DateChangeModal';
import { BottomSheetHandle } from '@/components/modals/BottomSheet';
import { Colors } from '@/constants/theme';
import { useFinanceStore } from '@/stores/useFinanceStore';
import { useModalStore } from '@/stores/useModalStore';
import { useTranslation } from '../../../utils/localization';
import type { Transaction } from '@/types/store.types';

type AccountPickerContext = 'from' | 'to';

export default function TransactionModal() {
  const modalRef = useRef<BottomSheetHandle>(null);
  const dateModalRef = useRef<BottomSheetHandle>(null);
  const accountPickerRef = useRef<BottomSheetHandle>(null);

  const [accountPickerContext, setAccountPickerContext] = useState<AccountPickerContext | null>(
    null
  );
  const [fromAccountId, setFromAccountId] = useState<string | null>(null);
  const [toAccountId, setToAccountId] = useState<string | null>(null);
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const [transferDate, setTransferDate] = useState(new Date());

  const openProgress = useSharedValue(0);

  const { t } = useTranslation();

  const transferModal = useModalStore((state) => state.transferModal);
  const closeTransferModal = useModalStore((state) => state.closeTransferModal);

  const accounts = useFinanceStore((state) => state.accounts);
  const addTransaction = useFinanceStore((state) => state.addTransaction);
  const updateTransaction = useFinanceStore((state) => state.updateTransaction);

  const isEditing = Boolean(
    transferModal.mode === 'edit' && transferModal.transaction?.type === 'transfer'
  );
  const editingTransaction = transferModal.transaction;

  useEffect(() => {
    if (transferModal.isOpen) {
      modalRef.current?.present();
    } else {
      modalRef.current?.dismiss();
    }
  }, [transferModal.isOpen]);

  const resetForm = useCallback(() => {
    setFromAccountId(accounts[0]?.id ?? null);
    setToAccountId(accounts[1]?.id ?? null);
    setAmount('');
    setNote('');
    setTransferDate(new Date());
  }, [accounts]);

  useEffect(() => {
    if (transferModal.isOpen && editingTransaction) {
      if (editingTransaction.type !== 'transfer') {
        resetForm();
        return;
      }

      setFromAccountId(editingTransaction.accountId);
      setToAccountId(editingTransaction.toAccountId ?? null);
      setAmount(editingTransaction.amount.toString());
      setNote(editingTransaction.note ?? editingTransaction.description ?? '');
      setTransferDate(new Date(editingTransaction.date));
    } else if (transferModal.isOpen) {
      resetForm();
    }
  }, [editingTransaction, resetForm, transferModal.isOpen]);

  useEffect(() => {
    openProgress.value = withTiming(transferModal.isOpen ? 1 : 0, {
      duration: 250,
      easing: Easing.out(Easing.cubic),
    });
  }, [openProgress, transferModal.isOpen]);

  const pickerTitleStyle = useAnimatedStyle(() => ({
    opacity: openProgress.value,
  }));

  const formatCurrency = useCallback((value: number, currency: string = 'USD') => {
    try {
      return new Intl.NumberFormat(
        currency === 'UZS' ? 'uz-UZ' : 'en-US',
        {
          style: 'currency',
          currency,
          maximumFractionDigits: currency === 'UZS' ? 0 : 2,
        }
      ).format(value);
    } catch {
      return `${currency} ${value.toFixed(2)}`;
    }
  }, []);

  const fromAccount = useMemo(
    () => accounts.find((account:any) => account.id === fromAccountId) ?? accounts[0],
    [accounts, fromAccountId]
  );

  const toAccount = useMemo(
    () => accounts.find((account:any) => account.id === toAccountId) ?? accounts[1],
    [accounts, toAccountId]
  );

  const amountNumber = useMemo(() => {
    const parsed = parseFloat(amount.replace(/,/g, '.'));
    return Number.isFinite(parsed) ? parsed : 0;
  }, [amount]);

  const isSaveDisabled =
    !fromAccount ||
    !toAccount ||
    fromAccount.id === toAccount.id ||
    amountNumber <= 0;

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

  const handleSelectAccount = useCallback(
    (accountId: string) => {
      if (!accountPickerContext) {
        return;
      }

      if (accountPickerContext === 'from') {
        setFromAccountId(accountId);
      } else {
        setToAccountId(accountId);
      }

      accountPickerRef.current?.dismiss();
      setAccountPickerContext(null);
    },
    [accountPickerContext]
  );

  const handleOpenAccountPicker = useCallback((context: AccountPickerContext) => {
    setAccountPickerContext(context);
    accountPickerRef.current?.present();
  }, []);

  const handleSelectDate = useCallback((dateString: string) => {
    const nextDate = new Date(dateString);
    if (!Number.isNaN(nextDate.getTime())) {
      setTransferDate(nextDate);
    }
    dateModalRef.current?.dismiss();
  }, []);

  const handleClose = useCallback(() => {
    closeTransferModal();
  }, [closeTransferModal]);

  const handleSubmit = useCallback(() => {
    if (isSaveDisabled || !fromAccount || !toAccount) {
      return;
    }

    const payload: Transaction = {
      id: editingTransaction?.id ?? '',
      type: 'transfer',
      amount: amountNumber,
      accountId: fromAccount.id,
      toAccountId: toAccount.id,
      category: 'Transfer',
      date: transferDate,
      note: note.trim().length ? note.trim() : undefined,
      currency: fromAccount.currency,
      createdAt: editingTransaction?.createdAt ?? new Date(),
    };

    if (isEditing && editingTransaction) {
      updateTransaction(editingTransaction.id, payload);
    } else {
      const { id, createdAt, ...rest } = payload;
      addTransaction(rest);
    }

    closeTransferModal();
  }, [
    addTransaction,
    amountNumber,
    closeTransferModal,
    editingTransaction,
    fromAccount,
    isEditing,
    isSaveDisabled,
    note,
    toAccount,
    transferDate,
    updateTransaction,
  ]);

  return (
    <>
      <CustomModal
        ref={modalRef}
        variant="form"
        onDismiss={handleClose}
        scrollable
        scrollProps={{ keyboardShouldPersistTaps: 'handled' }}
        fallbackSnapPoint="88%"
        enableDynamicSizing
      >
        <KeyboardAvoidingView behavior={Platform.select({ ios: 'padding' })}>
          <View style={styles.header}>
            <View>
              <Text style={styles.title}>{t('finance.transferTitle')}</Text>
              <Text style={styles.subtitle}>{t('finance.transferSubtitle')}</Text>
            </View>
            <Pressable onPress={handleClose} hitSlop={12}>
              <Ionicons name="close" size={24} color={Colors.textSecondary} />
            </Pressable>
          </View>

          <View style={styles.selectorRow}>
            <TouchableOpacity
              style={styles.selectorCard}
              onPress={() => handleOpenAccountPicker('from')}
              activeOpacity={0.85}
            >
              <Text style={styles.selectorLabel}>{t('finance.fromAccount')}</Text>
              <Text style={styles.selectorValue}>{fromAccount?.name ?? t('finance.select')}</Text>
              <Text style={styles.selectorHint}>
                {fromAccount
                  ? formatCurrency(fromAccount.balance, fromAccount.currency)
                  : t('finance.balanceUnavailable')}
              </Text>
            </TouchableOpacity>

            <View style={styles.arrowWrapper}>
              <ArrowRightLeft size={22} color={Colors.textSecondary} />
            </View>

            <TouchableOpacity
              style={styles.selectorCard}
              onPress={() => handleOpenAccountPicker('to')}
              activeOpacity={0.85}
            >
              <Text style={styles.selectorLabel}>{t('finance.toAccount')}</Text>
              <Text style={styles.selectorValue}>{toAccount?.name ?? t('finance.select')}</Text>
              <Text style={styles.selectorHint}>
                {toAccount
                  ? formatCurrency(toAccount.balance, toAccount.currency)
                  : t('finance.balanceUnavailable')}
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.amountSection}>
            <Text style={styles.sectionTitle}>{t('finance.amount')}</Text>
            <TextInput
              value={amount}
              onChangeText={handleAmountChange}
              placeholder="0"
              placeholderTextColor={Colors.textTertiary}
              style={styles.amountInput}
              keyboardType="numeric"
            />
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{t('finance.date')}</Text>
            <TouchableOpacity
              style={styles.dateCard}
              onPress={() => dateModalRef.current?.present()}
              activeOpacity={0.85}
            >
              <View>
                <Text style={styles.dateLabel}>{transferDate.toLocaleDateString()}</Text>
                <Text style={styles.dateHint}>{t('finance.changeDate')}</Text>
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
            <Text style={styles.saveButtonText}>{t('finance.transfer')}</Text>
          </TouchableOpacity>
        </KeyboardAvoidingView>
      </CustomModal>

      <DateChangeModal ref={dateModalRef} onSelectDate={handleSelectDate} />

      <CustomModal
        ref={accountPickerRef}
        variant="picker"
        fallbackSnapPoint="40%"
        onDismiss={() => setAccountPickerContext(null)}
      >
        <Animated.View style={[styles.accountPickerHeader, pickerTitleStyle]}>
          <Text style={styles.accountPickerTitle}>
            {accountPickerContext === 'from'
              ? t('finance.selectFromAccount')
              : t('finance.selectToAccount')}
          </Text>
          <Pressable onPress={() => accountPickerRef.current?.dismiss()} hitSlop={10}>
            <Ionicons name="close" size={22} color={Colors.textSecondary} />
          </Pressable>
        </Animated.View>

        <View style={styles.accountPickerList}>
          {accounts.map((account) => {
            const selected =
              accountPickerContext === 'from'
                ? account.id === fromAccount?.id
                : account.id === toAccount?.id;
            return (
              <TouchableOpacity
                key={account.id}
                style={[
                  styles.accountPickerItem,
                  selected && styles.accountPickerItemSelected,
                ]}
                onPress={() => handleSelectAccount(account.id)}
                activeOpacity={0.85}
              >
                <View style={styles.accountPickerIcon}>
                  <Wallet size={18} color={Colors.textSecondary} />
                </View>
                <View style={styles.accountPickerInfo}>
                  <Text style={styles.accountPickerName}>{account.name}</Text>
                  <Text style={styles.accountPickerBalance}>
                    {formatCurrency(account.balance, account.currency)}
                  </Text>
                </View>
                {selected && (
                  <Ionicons name="checkmark-circle" size={20} color={Colors.success} />
                )}
              </TouchableOpacity>
            );
          })}
        </View>
      </CustomModal>
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
  selectorRow: {
    marginTop: 24,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  selectorCard: {
    flex: 1,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.surfaceElevated,
    padding: 16,
  },
  selectorLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  selectorValue: {
    marginTop: 6,
    fontSize: 16,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  selectorHint: {
    marginTop: 8,
    fontSize: 12,
    color: Colors.textSecondary,
  },
  arrowWrapper: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.surfaceElevated,
    alignItems: 'center',
    justifyContent: 'center',
  },
  amountSection: {
    marginTop: 24,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  amountInput: {
    marginTop: 12,
    fontSize: 32,
    fontWeight: '700',
    color: Colors.textPrimary,
    textAlign: 'center',
  },
  section: {
    marginTop: 24,
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
    marginTop: 28,
    borderRadius: 16,
    backgroundColor: Colors.primary,
    paddingVertical: 16,
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
  accountPickerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  accountPickerTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  accountPickerList: {
    marginTop: 16,
    gap: 12,
  },
  accountPickerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.surfaceElevated,
  },
  accountPickerItemSelected: {
    borderColor: Colors.primary,
  },
  accountPickerIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  accountPickerInfo: {
    flex: 1,
  },
  accountPickerName: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  accountPickerBalance: {
    marginTop: 4,
    fontSize: 13,
    color: Colors.textSecondary,
  },
});
