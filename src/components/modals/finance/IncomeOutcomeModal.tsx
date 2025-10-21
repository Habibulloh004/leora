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
import { Wallet } from 'lucide-react-native';

import CustomModal, { CustomModalProps } from '@/components/modals/CustomModal';
import DateChangeModal from '@/components/modals/DateChangeModal';
import { BottomSheetHandle } from '@/components/modals/BottomSheet';
import { Colors } from '@/constants/theme';
import {
  FINANCE_CATEGORIES,
  FinanceCategory,
  getCategoriesForType,
} from '@/constants/financeCategories';
import { useFinanceStore } from '@/stores/useFinanceStore';
import { useModalStore } from '@/stores/useModalStore';
import { useTranslation } from '../../../utils/localization';
import type { Transaction } from '@/types/store.types';

type IncomeOutcomeTab = 'income' | 'outcome';

interface CategoryModalState {
  mode: 'add' | 'edit';
  baseValue?: string;
}

const iconSize = 22;

const amountInputConfig: Partial<CustomModalProps> = {
  scrollable: true,
  scrollProps: {
    keyboardShouldPersistTaps: 'handled',
  },
};

export default function IncomeOutcomeModal() {
  const modalRef = useRef<BottomSheetHandle>(null);
  const dateModalRef = useRef<BottomSheetHandle>(null);
  const categoryModalRef = useRef<BottomSheetHandle>(null);
  const accountModalRef = useRef<BottomSheetHandle>(null);

  const { t } = useTranslation();

  const incomeOutcome = useModalStore((state) => state.incomeOutcome);
  const closeIncomeOutcome = useModalStore((state) => state.closeIncomeOutcome);

  const accounts = useFinanceStore((state) => state.accounts);
  const categories = useFinanceStore((state) => state.categories);
  const addTransaction = useFinanceStore((state) => state.addTransaction);
  const updateTransaction = useFinanceStore((state) => state.updateTransaction);
  const addCategory = useFinanceStore((state) => state.addCategory);
  const renameCategory = useFinanceStore((state) => state.renameCategory);

  const [activeTab, setActiveTab] = useState<IncomeOutcomeTab>('income');
  const [amount, setAmount] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedAccount, setSelectedAccount] = useState<string | null>(null);
  const [note, setNote] = useState('');
  const [transactionDate, setTransactionDate] = useState(new Date());
  const [categoryModalState, setCategoryModalState] = useState<CategoryModalState | null>(null);
  const [categoryDraft, setCategoryDraft] = useState('');

  const indicatorProgress = useSharedValue(0);
  const segmentWidth = useSharedValue(0);

  const isEditing = Boolean(
    incomeOutcome.mode === 'edit' && incomeOutcome.transaction?.type !== 'transfer'
  );
  const editingTransaction = incomeOutcome.transaction;

  const availableCategories = useMemo(() => {
    const baseList = getCategoriesForType(activeTab);
    const aggregated = new Map<string, FinanceCategory & { isCustom?: boolean }>();
    baseList.forEach((category) => aggregated.set(category.name, category));

    categories.forEach((name) => {
      if (!aggregated.has(name)) {
        const fallback = FINANCE_CATEGORIES.find((cat) => cat.name === name);
        aggregated.set(name, {
          id: `custom-${name}`,
          name,
          type: 'both',
          color: fallback?.color ?? Colors.borderFocus,
          icon: fallback?.icon ?? Wallet,
          isCustom: true,
        });
      }
    });

    return Array.from(aggregated.values());
  }, [activeTab, categories]);

  useEffect(() => {
    if (incomeOutcome.isOpen) {
      modalRef.current?.present();
    } else {
      modalRef.current?.dismiss();
    }
  }, [incomeOutcome.isOpen]);

  const resetForm = useCallback(
    (tab: IncomeOutcomeTab = 'income') => {
      setActiveTab(tab);
      setAmount('');
      setSelectedCategory(null);
      setSelectedAccount(accounts[0]?.id ?? null);
      setTransactionDate(new Date());
      setNote('');
    },
    [accounts]
  );

  useEffect(() => {
    if (incomeOutcome.isOpen) {
      const transaction = incomeOutcome.transaction;
      const fallbackTab = incomeOutcome.initialTab ?? 'income';

      if (transaction && transaction.type !== 'transfer') {
        const tab = transaction.type ?? 'income';
        resetForm(tab);
        setAmount(transaction.amount.toString());
        setSelectedCategory(transaction.category ?? null);
        setSelectedAccount(transaction.accountId);
        setTransactionDate(new Date(transaction.date));
        setNote(transaction.note ?? transaction.description ?? '');
      } else {
        resetForm(fallbackTab);
      }
    } else {
      resetForm('income');
    }
  }, [incomeOutcome, resetForm]);

  useEffect(() => {
    indicatorProgress.value = withTiming(activeTab === 'income' ? 0 : 1, {
      duration: 220,
      easing: Easing.bezier(0.16, 1, 0.3, 1),
    });
  }, [activeTab, indicatorProgress]);

  useEffect(() => {
    if (!selectedCategory) {
      return;
    }
    const exists = availableCategories.some((category) => category.name === selectedCategory);
    if (!exists) {
      setSelectedCategory(null);
    }
  }, [availableCategories, selectedCategory]);

  const indicatorStyle = useAnimatedStyle(() => ({
    width: segmentWidth.value,
    transform: [{ translateX: indicatorProgress.value * segmentWidth.value }],
  }));

  const handleTabLayout = useCallback(
    (event: any) => {
      const { width } = event.nativeEvent.layout;
      const segment = Math.max((width - 8) / 2, 0);
      segmentWidth.value = segment;
    },
    [segmentWidth]
  );

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

  const selectedAccountData = useMemo(
    () => accounts.find((account) => account.id === selectedAccount) ?? accounts[0],
    [accounts, selectedAccount]
  );

  const amountNumber = useMemo(() => {
    const sanitized = amount.replace(/,/g, '.');
    const parsed = parseFloat(sanitized);
    return Number.isFinite(parsed) ? parsed : 0;
  }, [amount]);

  const isSaveDisabled = !(
    amountNumber > 0 &&
    selectedCategory &&
    selectedAccountData &&
    transactionDate
  );

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
    const nextDate = new Date(dateString);
    if (Number.isNaN(nextDate.getTime())) {
      return;
    }
    setTransactionDate(nextDate);
    dateModalRef.current?.dismiss();
  }, []);

  const handleOpenCategoryModal = useCallback((state: CategoryModalState) => {
    setCategoryModalState(state);
    setCategoryDraft(state.mode === 'edit' ? (state.baseValue ?? '') : '');
    categoryModalRef.current?.present();
  }, []);

  const handleConfirmCategory = useCallback(() => {
    const trimmed = categoryDraft.trim();
    if (!trimmed) {
      return;
    }

    if (!categoryModalState) {
      return;
    }

    if (categoryModalState.mode === 'add') {
      addCategory(trimmed);
      setSelectedCategory(trimmed);
    } else if (categoryModalState.baseValue) {
      renameCategory(categoryModalState.baseValue, trimmed);
      setSelectedCategory(trimmed);
    }

    categoryModalRef.current?.dismiss();
    setCategoryDraft('');
    setCategoryModalState(null);
  }, [addCategory, categoryDraft, categoryModalState, renameCategory]);

  const handleDismissCategoryModal = useCallback(() => {
    categoryModalRef.current?.dismiss();
    setCategoryDraft('');
    setCategoryModalState(null);
  }, []);

  const handleSelectAccount = useCallback((accountId: string) => {
    setSelectedAccount(accountId);
    accountModalRef.current?.dismiss();
  }, []);

  const handleClose = useCallback(() => {
    closeIncomeOutcome();
  }, [closeIncomeOutcome]);

  const handleSubmit = useCallback(() => {
    if (isSaveDisabled || !selectedAccountData || !selectedCategory) {
      return;
    }

    const payload: Transaction = {
      id: editingTransaction?.id ?? '',
      type: activeTab,
      amount: amountNumber,
      category: selectedCategory,
      accountId: selectedAccountData.id,
      date: transactionDate,
      toAccountId: undefined,
      note: note.trim().length ? note.trim() : undefined,
      currency: selectedAccountData.currency,
      createdAt: editingTransaction?.createdAt ?? new Date(),
    };

    if (isEditing && editingTransaction) {
      updateTransaction(editingTransaction.id, payload);
    } else {
      const { id, createdAt, ...rest } = payload;
      addTransaction(rest);
    }

    closeIncomeOutcome();
  }, [
    activeTab,
    addTransaction,
    amountNumber,
    closeIncomeOutcome,
    editingTransaction,
    isEditing,
    isSaveDisabled,
    note,
    selectedAccountData,
    selectedCategory,
    transactionDate,
    updateTransaction,
  ]);

  const buttonLabel = isEditing ? t('finance.saveChanges') : t('finance.addEntry');

  return (
    <>
      <CustomModal
        ref={modalRef}
        variant="form"
        onDismiss={handleClose}
        {...amountInputConfig}
        fallbackSnapPoint="88%"
        enableDynamicSizing
      >
        <KeyboardAvoidingView
          behavior={Platform.select({ ios: 'padding', android: undefined })}
        >
          <View style={styles.header}>
            <View>
              <Text style={styles.title}>{t('finance.incomeOutcomeTitle')}</Text>
              <Text style={styles.subtitle}>
                {t(activeTab === 'income' ? 'finance.incomeSubtitle' : 'finance.outcomeSubtitle')}
              </Text>
            </View>

            <Pressable onPress={handleClose} hitSlop={12}>
              <Ionicons name="close" size={24} color={Colors.textSecondary} />
            </Pressable>
          </View>

          <View style={styles.tabContainer} onLayout={handleTabLayout}>
            <TouchableOpacity
              style={[
                styles.tabButton,
                activeTab === 'income' && styles.tabButtonActive,
              ]}
              onPress={() => setActiveTab('income')}
              activeOpacity={0.85}
            >
              <Text
                style={[
                  styles.tabLabel,
                  activeTab === 'income' && styles.tabLabelActive,
                ]}
              >
                {t('finance.income')}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.tabButton,
                activeTab === 'outcome' && styles.tabButtonActive,
              ]}
              onPress={() => setActiveTab('outcome')}
              activeOpacity={0.85}
            >
              <Text
                style={[
                  styles.tabLabel,
                  activeTab === 'outcome' && styles.tabLabelActive,
                ]}
              >
                {t('finance.outcome')}
              </Text>
            </TouchableOpacity>

            <Animated.View style={[styles.tabIndicator, indicatorStyle]}>
              <View style={styles.tabIndicatorFill} />
            </Animated.View>
          </View>

          <View style={styles.amountSection}>
            <Text style={styles.amountLabel}>{t('finance.amount')}</Text>
            <TextInput
              value={amount}
              onChangeText={handleAmountChange}
              keyboardType="numeric"
              placeholder="0"
              placeholderTextColor={Colors.textTertiary}
              style={styles.amountInput}
            />
          </View>

          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>{t('finance.category')}</Text>
              <View style={styles.sectionActions}>
                <Pressable
                  onPress={() => handleOpenCategoryModal({ mode: 'add' })}
                  hitSlop={10}
                  style={styles.iconButton}
                >
                  <Ionicons name="add" size={16} color={Colors.textSecondary} />
                </Pressable>
              </View>
            </View>

            <View style={styles.categoryGrid}>
              {availableCategories.map((category) => {
                const IconComponent = category.icon as React.ComponentType<{
                  size?: number;
                  color?: string;
                }>;
                const selected = category.name === selectedCategory;
                return (
                  <View key={category.id} style={styles.categoryWrapper}>
                    <TouchableOpacity
                      onPress={() => setSelectedCategory(category.name)}
                      style={[
                        styles.categoryCard,
                        selected && { borderColor: category.color ?? Colors.primary },
                      ]}
                      activeOpacity={0.85}
                    >
                      <View
                        style={[
                          styles.categoryIconWrapper,
                          { backgroundColor: (category.color ?? Colors.primary) + '1A' },
                        ]}
                      >
                        <IconComponent
                          size={iconSize}
                          color={selected ? Colors.textPrimary : category.color ?? Colors.primary}
                        />
                      </View>

                      <Text
                        numberOfLines={2}
                        style={[
                          styles.categoryName,
                          selected && { color: Colors.textPrimary },
                        ]}
                      >
                        {category.name}
                      </Text>
                    </TouchableOpacity>

                    <View style={styles.categoryActions}>
                      <Pressable
                        style={styles.categoryActionButton}
                        hitSlop={6}
                        onPress={() => handleOpenCategoryModal({ mode: 'add' })}
                      >
                        <Ionicons name="add-circle" size={18} color={Colors.textSecondary} />
                      </Pressable>
                      <Pressable
                        style={styles.categoryActionButton}
                        hitSlop={6}
                        onPress={() =>
                          handleOpenCategoryModal({ mode: 'edit', baseValue: category.name })
                        }
                      >
                        <Ionicons name="create-outline" size={18} color={Colors.textSecondary} />
                      </Pressable>
                    </View>
                  </View>
                );
              })}
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{t('finance.account')}</Text>
            <TouchableOpacity
              style={styles.accountCard}
              onPress={() => accountModalRef.current?.present()}
              activeOpacity={0.85}
            >
              <View>
                <Text style={styles.accountName}>{selectedAccountData?.name}</Text>
                <Text style={styles.accountBalance}>
                  {selectedAccountData
                    ? formatCurrency(selectedAccountData.balance, selectedAccountData.currency)
                    : t('finance.selectAccountPlaceholder')}
                </Text>
              </View>

              <Ionicons name="chevron-forward" size={18} color={Colors.textSecondary} />
            </TouchableOpacity>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{t('finance.date')}</Text>
            <TouchableOpacity
              style={styles.accountCard}
              activeOpacity={0.85}
              onPress={() => dateModalRef.current?.present()}
            >
              <View>
                <Text style={styles.accountName}>
                  {transactionDate.toLocaleDateString()}
                </Text>
                <Text style={styles.accountBalance}>{t('finance.changeDate')}</Text>
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
                multiline
                style={styles.noteInput}
              />
            </View>
          </View>

          <TouchableOpacity
            style={[
              styles.saveButton,
              isSaveDisabled && styles.saveButtonDisabled,
            ]}
            onPress={handleSubmit}
            activeOpacity={0.9}
            disabled={isSaveDisabled}
          >
            <Text style={styles.saveButtonText}>{buttonLabel}</Text>
          </TouchableOpacity>
        </KeyboardAvoidingView>
      </CustomModal>

      <DateChangeModal ref={dateModalRef} onSelectDate={handleSelectDate} />

      <CustomModal
        ref={categoryModalRef}
        variant="picker"
        fallbackSnapPoint="40%"
        onDismiss={() => setCategoryModalState(null)}
      >
        <View style={styles.categoryEditorContainer}>
          <View style={styles.categoryEditorHeader}>
            <Text style={styles.categoryEditorTitle}>
              {categoryModalState?.mode === 'edit'
                ? t('finance.editCategory')
                : t('finance.addCategory')}
            </Text>
            <Pressable onPress={handleDismissCategoryModal} hitSlop={10}>
              <Ionicons name="close" size={22} color={Colors.textSecondary} />
            </Pressable>
          </View>

          <View style={styles.noteInputWrapper}>
            <TextInput
              value={categoryDraft}
              onChangeText={setCategoryDraft}
              placeholder={t('finance.categoryPlaceholder')}
              placeholderTextColor={Colors.textTertiary}
              style={styles.modalInput}
            />
          </View>

          <TouchableOpacity
            style={[
              styles.saveButton,
              !categoryDraft.trim() && styles.saveButtonDisabled,
            ]}
            onPress={handleConfirmCategory}
            activeOpacity={0.9}
            disabled={!categoryDraft.trim()}
          >
            <Text style={styles.saveButtonText}>{t('finance.save')}</Text>
          </TouchableOpacity>
        </View>
      </CustomModal>

      <CustomModal
        ref={accountModalRef}
        variant="picker"
        fallbackSnapPoint="40%"
      >
        <View style={styles.accountPickerContainer}>
          <View style={styles.categoryEditorHeader}>
            <Text style={styles.categoryEditorTitle}>{t('finance.selectAccount')}</Text>
            <Pressable onPress={() => accountModalRef.current?.dismiss()} hitSlop={10}>
              <Ionicons name="close" size={22} color={Colors.textSecondary} />
            </Pressable>
          </View>

          <View style={styles.accountPickerList}>
            {accounts.map((account) => {
              const selected = account.id === selectedAccountData?.id;
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
                  <View>
                    <Text style={styles.accountName}>{account.name}</Text>
                    <Text style={styles.accountBalance}>
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
  tabContainer: {
    marginTop: 16,
    flexDirection: 'row',
    backgroundColor: Colors.surfaceElevated,
    borderRadius: 14,
    padding: 4,
    position: 'relative',
  },
  tabButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 12,
  },
  tabButtonActive: {
    zIndex: 2,
  },
  tabLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  tabLabelActive: {
    color: Colors.textPrimary,
  },
  tabIndicator: {
    position: 'absolute',
    top: 4,
    bottom: 4,
    left: 4,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: 'transparent',
  },
  tabIndicatorFill: {
    flex: 1,
    borderRadius: 12,
    backgroundColor: Colors.surface,
  },
  amountSection: {
    marginTop: 24,
    alignItems: 'center',
  },
  amountLabel: {
    fontSize: 13,
    fontWeight: '500',
    color: Colors.textSecondary,
    marginBottom: 8,
  },
  amountInput: {
    fontSize: 36,
    fontWeight: '700',
    color: Colors.textPrimary,
    textAlign: 'center',
    letterSpacing: 1,
  },
  section: {
    marginTop: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  sectionActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.surfaceElevated,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  categoryGrid: {
    marginTop: 16,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  categoryWrapper: {
    width: '30%',
    minWidth: 96,
    alignItems: 'center',
  },
  categoryCard: {
    width: '100%',
    alignItems: 'center',
    paddingVertical: 16,
    borderRadius: 16,
    backgroundColor: Colors.surfaceElevated,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  categoryIconWrapper: {
    width: 48,
    height: 48,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  categoryName: {
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
    color: Colors.textSecondary,
  },
  categoryActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 8,
  },
  categoryActionButton: {
    width: 28,
    height: 28,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.surfaceElevated,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  accountCard: {
    marginTop: 12,
    padding: 16,
    borderRadius: 16,
    backgroundColor: Colors.surfaceElevated,
    borderWidth: 1,
    borderColor: Colors.border,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  accountName: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  accountBalance: {
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
    paddingVertical: 16,
    borderRadius: 16,
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
  categoryEditorContainer: {
    paddingTop: 12,
  },
  categoryEditorHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  categoryEditorTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  modalInput: {
    fontSize: 15,
    color: Colors.textPrimary,
  },
  accountPickerContainer: {
    paddingTop: 12,
  },
  accountPickerList: {
    marginTop: 16,
    gap: 12,
  },
  accountPickerItem: {
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.surfaceElevated,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  accountPickerItemSelected: {
    borderColor: Colors.primary,
  },
});
