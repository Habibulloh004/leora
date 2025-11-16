import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
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
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { AlertCircle, Check } from 'lucide-react-native';
import { Ionicons } from '@expo/vector-icons';

import CustomModal, { CustomModalProps } from '@/components/modals/CustomModal';
import { BottomSheetHandle } from '@/components/modals/BottomSheet';
import { AdaptiveGlassView } from '@/components/ui/AdaptiveGlassView';
import { getCategoriesForType } from '@/constants/financeCategories';
import { useSelectedDayStore } from '@/stores/selectedDayStore';
import { startOfDay } from '@/utils/calendar';
import { useLocalization } from '@/localization/useLocalization';
import { useFinanceStore } from '@/stores/useFinanceStore';
import type { Budget } from '@/stores/useFinanceStore';

type BudgetState = 'exceeding' | 'within' | 'fixed';

type CategoryBudget = {
  id: string;
  name: string;
  spent: number;
  limit: number;
  state: BudgetState;
  currency: string;
  accountName: string;
  categories: string[];
  notifyOnExceed: boolean;
};

const PROGRESS_HEIGHT = 32;
const PROGRESS_RADIUS = 18;

const modalProps: Partial<CustomModalProps> = {
  variant: 'form',
  enableDynamicSizing: false,
  fallbackSnapPoint: '96%',
  scrollable: true,
  scrollProps: { keyboardShouldPersistTaps: 'handled' },
  contentContainerStyle: { paddingHorizontal: 20, paddingTop: 12, paddingBottom: 32 },
};

const formatCurrency = (value: number, currency: string) => {
  const locale = currency === 'UZS' ? 'uz-UZ' : 'en-US';
  const maximumFractionDigits = currency === 'UZS' ? 0 : 2;
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    maximumFractionDigits,
  }).format(value);
};

type ProgressAppearance = {
  fillColor: string;
  label: string;
  icon: 'alert' | 'check';
  textColor: string;
};

type ProgressBarProps = {
  percentage: number;
  appearance: ProgressAppearance;
};

const AnimatedProgressBar: React.FC<ProgressBarProps> = ({ percentage, appearance }) => {
  const widthValue = useSharedValue(0);
  const [trackWidth, setTrackWidth] = useState(0);

  const clampedPercentage = Math.max(0, Math.min(percentage, 125));

  useEffect(() => {
    if (!trackWidth) return;

    const ratio = Math.min(clampedPercentage / 100, 1);
    const targetWidth = trackWidth * ratio;
    const minWidth = clampedPercentage > 0 ? Math.min(trackWidth, 120) : 0;
    widthValue.value = withTiming(Math.min(trackWidth, Math.max(targetWidth, minWidth)), {
      duration: 360,
    });
  }, [clampedPercentage, trackWidth, widthValue]);

  const fillStyle = useAnimatedStyle(() => ({
    width: widthValue.value,
  }));

  const iconColor = appearance.textColor;

  return (
    <View
      style={styles.progressShellWrapper}
      onLayout={(event) => setTrackWidth(event.nativeEvent.layout.width)}
    >
      <AdaptiveGlassView style={styles.progressShell}>
        <Animated.View
          style={[styles.progressFill, fillStyle, { backgroundColor: appearance.fillColor }]}
        />

        <View style={styles.progressOverlay} pointerEvents="none">
          <View style={styles.progressLabelGroup}>
            {appearance.icon === 'alert' ? (
              <AlertCircle size={16} color={iconColor} />
            ) : (
              <Check size={16} color={iconColor} />
            )}
            <Text style={[styles.progressLabel, { color: appearance.textColor }]}>
              {appearance.label}
            </Text>
          </View>
          <Text style={[styles.progressLabel, { color: appearance.textColor }]}>
            {Math.round(clampedPercentage)}%
          </Text>
        </View>
      </AdaptiveGlassView>
    </View>
  );
};

const buildProgressAppearance = (
  state: BudgetState,
  labels: Record<BudgetState, string>
): ProgressAppearance => {
  switch (state) {
    case 'exceeding':
      return {
        fillColor: '#FF6B6B',
        label: labels.exceeding,
        icon: 'alert',
        textColor: '#FFFFFF',
      };
    case 'fixed':
      return {
        fillColor: '#51CF66',
        label: labels.fixed,
        icon: 'check',
        textColor: '#FFFFFF',
      };
    default:
      return {
        fillColor: 'rgba(255,255,255,0.4)',
        label: labels.within,
        icon: 'check',
        textColor: '#FFFFFF',
      };
  }
};

const MainBudgetProgress: React.FC<{
  budget: { current: number; total: number; currency: string };
  labels: Record<BudgetState, string>;
}> = ({ budget, labels }) => {
  const percentage =
    budget.total === 0 ? 0 : Math.min((budget.current / budget.total) * 100, 125);
  const appearance = useMemo(() => buildProgressAppearance('within', labels), [labels]);

  return (
    <View style={styles.mainSection}>
      <View style={styles.mainAmountsRow}>
        <Text style={styles.mainAmount}>{formatCurrency(budget.current, budget.currency)}</Text>
        <Text style={styles.mainAmount}>/ {formatCurrency(budget.total, budget.currency)}</Text>
      </View>

      <AnimatedProgressBar percentage={percentage} appearance={appearance} />
    </View>
  );
};

interface CategoryBudgetCardProps {
  category: CategoryBudget;
  index: number;
  isLast: boolean;
  labels: Record<BudgetState, string>;
  actionLabel: string;
  onManage?: (budgetId: string) => void;
}

const CategoryBudgetCard: React.FC<CategoryBudgetCardProps> = ({
  category,
  index,
  isLast,
  labels,
  actionLabel,
  onManage,
}) => {
  const fade = useSharedValue(0);
  const translateY = useSharedValue(12);

  const progress = useMemo(() => {
    if (category.limit === 0) return 0;
    return Math.min((category.spent / category.limit) * 100, 125);
  }, [category.limit, category.spent]);

  useEffect(() => {
    const delayMs = index * 80;
    const timer = setTimeout(() => {
      fade.value = withTiming(1, { duration: 280 });
      translateY.value = withTiming(0, { duration: 280 });
    }, delayMs);
    return () => clearTimeout(timer);
  }, [fade, index, translateY]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: fade.value,
    transform: [{ translateY: translateY.value }],
  }));

  const appearance = useMemo(
    () => buildProgressAppearance(category.state, labels),
    [category.state, labels]
  );

  const categoriesSummary = category.categories.join(', ');
  const remainingAmount = Math.max(category.limit - category.spent, 0);

  return (
    <Animated.View style={[styles.categoryBlock, animatedStyle]}>
      <AdaptiveGlassView style={styles.categoryCard}>
        <View style={styles.categoryHeaderRow}>
          <Text style={styles.categoryTitle}>{category.name}</Text>
          <Pressable
            style={({ pressed }) => [styles.categoryActionButton, pressed && styles.pressed]}
            onPress={() => onManage?.(category.id)}
          >
            <Text style={styles.categoryAction}>{actionLabel}</Text>
          </Pressable>
        </View>
        <Text style={styles.categorySubtitle}>
          {category.accountName}
          {categoriesSummary ? ` · ${categoriesSummary}` : ''}
        </Text>

        <View style={styles.categoryAmountsRow}>
          <Text style={styles.categoryAmount}>
            {formatCurrency(category.spent, category.currency)}
          </Text>
          <Text style={styles.categoryAmount}>
            / {formatCurrency(category.limit, category.currency)}
          </Text>
        </View>

        <AnimatedProgressBar percentage={progress} appearance={appearance} />
        <Text style={styles.remainingLabel}>
          {appearance.label === labels.exceeding
            ? `${formatCurrency(category.spent - category.limit, category.currency)} over limit`
            : `Remaining ${formatCurrency(remainingAmount, category.currency)}`}
        </Text>
      </AdaptiveGlassView>
    </Animated.View>
  );
};

const BudgetsScreen: React.FC = () => {
  const { strings, locale } = useLocalization();
  const budgetsStrings = strings.financeScreens.budgets;

  const selectedDate = useSelectedDayStore((state) => state.selectedDate);
  const budgets = useFinanceStore((state) => state.budgets);
  const accounts = useFinanceStore((state) => state.accounts);
  const addBudget = useFinanceStore((state) => state.addBudget);
  const updateBudget = useFinanceStore((state) => state.updateBudget);
  const deleteBudget = useFinanceStore((state) => state.deleteBudget);

  const accountMap = useMemo(
    () => new Map(accounts.map((account) => [account.id, account])),
    [accounts]
  );

  const budgetModalRef = useRef<BottomSheetHandle>(null);
  const [editingBudget, setEditingBudget] = useState<Budget | null>(null);
  const [formName, setFormName] = useState('');
  const [limitInput, setLimitInput] = useState('');
  const [limitValue, setLimitValue] = useState(0);
  const [selectedAccountId, setSelectedAccountId] = useState<string | null>(accounts[0]?.id ?? null);
  const [transactionType, setTransactionType] = useState<'income' | 'outcome'>('outcome');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [notifyEnabled, setNotifyEnabled] = useState(true);
  const [isFormVisible, setIsFormVisible] = useState(false);

  const availableCategories = useMemo(
    () => getCategoriesForType(transactionType),
    [transactionType]
  );

  useEffect(() => {
    if (!isFormVisible) {
      return;
    }
    const allowedNames = availableCategories.map((category) => category.name);
    setSelectedCategories((prev) => {
      const filtered = prev.filter((name) => allowedNames.includes(name));
      if (filtered.length > 0) {
        return filtered;
      }
      return allowedNames.length > 0 ? [allowedNames[0]] : [];
    });
  }, [availableCategories, isFormVisible]);

  useEffect(() => {
    if (!selectedAccountId && accounts[0]) {
      setSelectedAccountId(accounts[0].id);
    }
  }, [accounts, selectedAccountId]);

  const resetFormState = useCallback(
    (budget?: Budget | null) => {
      if (budget) {
        setFormName(budget.name);
        setLimitInput(String(budget.limit));
        setLimitValue(budget.limit);
        setSelectedAccountId(budget.accountId);
        setTransactionType(budget.transactionType);
        setSelectedCategories(budget.categories);
        setNotifyEnabled(budget.notifyOnExceed);
        return;
      }

      const defaultAccountId = accounts[0]?.id ?? null;
      setFormName('');
      setLimitInput('');
      setLimitValue(0);
      setSelectedAccountId(defaultAccountId);
      setTransactionType('outcome');
      const defaultCategory = getCategoriesForType('outcome')[0]?.name;
      setSelectedCategories(defaultCategory ? [defaultCategory] : []);
      setNotifyEnabled(true);
    },
    [accounts]
  );

  const handleCloseBudgetModal = useCallback(() => {
    budgetModalRef.current?.dismiss();
    setIsFormVisible(false);
    setEditingBudget(null);
    resetFormState(null);
  }, [resetFormState]);

  const handleOpenBudgetModal = useCallback(
    (budget?: Budget) => {
      setEditingBudget(budget ?? null);
      resetFormState(budget ?? null);
      setIsFormVisible(true);
      budgetModalRef.current?.present();
    },
    [resetFormState]
  );

  const isBudgetFormValid =
    Boolean(formName.trim()) &&
    limitValue > 0 &&
    Boolean(selectedAccountId) &&
    selectedCategories.length > 0;

  const handleLimitInputChange = useCallback((value: string) => {
    const sanitized = value.replace(/[^0-9.]/g, '').replace(/(\..*?)\./g, '$1');
    setLimitInput(sanitized);
    const numeric = Number.parseFloat(sanitized);
    setLimitValue(Number.isFinite(numeric) ? numeric : 0);
  }, []);

  const toggleCategory = useCallback((name: string) => {
    setSelectedCategories((prev) =>
      prev.includes(name) ? prev.filter((item) => item !== name) : [...prev, name]
    );
  }, []);

  const handleSubmitBudget = useCallback(() => {
    if (!isBudgetFormValid || !selectedAccountId) {
      return;
    }
    const payload = {
      id: editingBudget?.id,
      name: formName.trim(),
      category: selectedCategories.length === 1 ? selectedCategories[0] : undefined,
      categories: selectedCategories,
      limit: limitValue,
      accountId: selectedAccountId,
      transactionType,
      notifyOnExceed: notifyEnabled,
    };
    if (editingBudget) {
      updateBudget(editingBudget.id, payload);
    } else {
      addBudget(payload);
    }
    handleCloseBudgetModal();
  }, [
    addBudget,
    editingBudget,
    formName,
    handleCloseBudgetModal,
    isBudgetFormValid,
    limitValue,
    notifyEnabled,
    selectedAccountId,
    selectedCategories,
    transactionType,
    updateBudget,
  ]);

  const handleDeleteCurrentBudget = useCallback(() => {
    if (!editingBudget) {
      return;
    }
    deleteBudget(editingBudget.id);
    handleCloseBudgetModal();
  }, [deleteBudget, editingBudget, handleCloseBudgetModal]);

  const handleManageBudget = useCallback(
    (budgetId: string) => {
      const target = budgets.find((budget) => budget.id === budgetId);
      if (target) {
        handleOpenBudgetModal(target);
      }
    },
    [budgets, handleOpenBudgetModal]
  );

  const handleOpenCreateBudget = useCallback(() => {
    handleOpenBudgetModal();
  }, [handleOpenBudgetModal]);

  const aggregate = useMemo(() => {
    const total = budgets.reduce(
      (acc, budget) => {
        acc.current += budget.spent;
        acc.total += budget.limit;
        return acc;
      },
      { current: 0, total: 0 }
    );
    const categories = budgets.map((budget) => {
      const account = accountMap.get(budget.accountId);
      return {
        id: budget.id,
        name: budget.name,
        spent: budget.spent,
        limit: budget.limit,
        state: budget.state,
        currency: account?.currency ?? 'UZS',
        accountName: account?.name ?? strings.financeScreens.accounts.header,
        categories: budget.categories,
        notifyOnExceed: budget.notifyOnExceed,
      };
    });
    return {
      main: {
        current: total.current,
        total: total.total,
        currency: 'UZS',
      },
      categories,
    };
  }, [accountMap, budgets, strings.financeScreens.accounts.header]);

  const selectedDateLabel = useMemo(() => {
    const normalized = startOfDay(selectedDate ?? new Date());
    const today = startOfDay(new Date());
    if (normalized.getTime() === today.getTime()) {
      return budgetsStrings.today;
    }
    const formatted = new Intl.DateTimeFormat(locale, {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    }).format(normalized);
    return budgetsStrings.dateTemplate.replace('{date}', formatted);
  }, [budgetsStrings, locale, selectedDate]);

  const manageLabel = strings.financeScreens.accounts.actions.edit;
  const selectedAccount = selectedAccountId ? accountMap.get(selectedAccountId) : null;
  const selectedCurrency = selectedAccount?.currency ?? 'UZS';

  return (
    <>
      <ScrollView
        style={styles.screen}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.dateCaption}>{selectedDateLabel}</Text>
        <Text style={styles.sectionHeading}>{budgetsStrings.mainTitle}</Text>

        <MainBudgetProgress budget={aggregate.main} labels={budgetsStrings.states} />

        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionHeading}>{budgetsStrings.categoriesTitle}</Text>
          <Pressable
            style={({ pressed }) => [styles.addCategoryButton, pressed && styles.pressed]}
            onPress={handleOpenCreateBudget}
          >
            <AdaptiveGlassView style={styles.addCategoryButtonInner}>
              <Text style={styles.addCategoryText}>{budgetsStrings.setLimit}</Text>
            </AdaptiveGlassView>
          </Pressable>
        </View>

        <View style={styles.categoriesList}>
          {aggregate.categories.map((category, index) => (
            <CategoryBudgetCard
              key={category.id}
              category={category}
              index={index}
              isLast={index === aggregate.categories.length - 1}
              labels={budgetsStrings.states}
              actionLabel={manageLabel}
              onManage={handleManageBudget}
            />
          ))}
        </View>
      </ScrollView>

      <CustomModal ref={budgetModalRef} onDismiss={handleCloseBudgetModal} {...modalProps}>
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
            {/* Header */}
            <View style={styles.header}>
              <Text style={styles.headerTitle}>
                {editingBudget ? 'EDIT BUDGET' : 'NEW BUDGET'}
              </Text>
            </View>

            {/* Name */}
            <View style={styles.section}>
              <Text style={styles.sectionLabel}>Budget name</Text>
              <AdaptiveGlassView style={styles.inputContainer}>
                <TextInput
                  value={formName}
                  onChangeText={setFormName}
                  placeholder="Budget name"
                  placeholderTextColor="#7E8B9A"
                  style={styles.textInput}
                />
              </AdaptiveGlassView>
            </View>

            {/* Limit */}
            <View style={styles.section}>
              <Text style={styles.sectionLabel}>
                {`${strings.financeScreens.transactions.details.amount} (${selectedCurrency})`}
              </Text>
              <AdaptiveGlassView style={styles.inputContainer}>
                <TextInput
                  value={limitInput}
                  onChangeText={handleLimitInputChange}
                  keyboardType="numeric"
                  placeholder="0"
                  placeholderTextColor="#7E8B9A"
                  style={styles.textInput}
                />
              </AdaptiveGlassView>
            </View>

            {/* Account */}
            <View style={styles.section}>
              <Text style={styles.sectionLabel}>{strings.financeScreens.debts.modal.accountLabel}</Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.accountScroll}
              >
                {accounts.map((account) => {
                  const isSelected = account.id === selectedAccountId;
                  return (
                    <Pressable
                      key={account.id}
                      onPress={() => setSelectedAccountId(account.id)}
                      style={({ pressed }) => [pressed && styles.pressed]}
                    >
                      <AdaptiveGlassView
                        style={[styles.accountChip, { opacity: isSelected ? 1 : 0.6 }]}
                      >
                        <Text style={[styles.accountChipLabel, { color: isSelected ? '#FFFFFF' : '#9E9E9E' }]}>
                          {account.name}
                        </Text>
                        <Text style={styles.accountChipSubtext}>{account.currency}</Text>
                      </AdaptiveGlassView>
                    </Pressable>
                  );
                })}
              </ScrollView>
            </View>

            {/* Type */}
            <View style={styles.section}>
              <Text style={styles.sectionLabel}>Type</Text>
              <AdaptiveGlassView style={styles.typeContainer}>
                <Pressable
                  onPress={() => setTransactionType('outcome')}
                  style={({ pressed }) => [
                    styles.typeOption,
                    { borderBottomWidth: 1 },
                    pressed && styles.pressed,
                  ]}
                >
                  <View style={styles.typeOptionContent}>
                    <Text
                      style={[
                        styles.typeLabel,
                        { color: transactionType === 'outcome' ? '#FFFFFF' : '#7E8B9A' },
                      ]}
                    >
                      {strings.financeScreens.accounts.outcome}
                    </Text>
                  </View>
                </Pressable>

                <Pressable
                  onPress={() => setTransactionType('income')}
                  style={({ pressed }) => [styles.typeOption, pressed && styles.pressed]}
                >
                  <View style={styles.typeOptionContent}>
                    <Text
                      style={[
                        styles.typeLabel,
                        { color: transactionType === 'income' ? '#FFFFFF' : '#7E8B9A' },
                      ]}
                    >
                      {strings.financeScreens.accounts.income}
                    </Text>
                  </View>
                </Pressable>
              </AdaptiveGlassView>
            </View>

            {/* Categories */}
            <View style={[styles.section, { paddingHorizontal: 0 }]}>
              <Text style={[styles.sectionLabel, { paddingHorizontal: 20 }]}>
                {strings.financeScreens.transactions.details.category}
              </Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.categoryChipScroll}
              >
                {availableCategories.map((category) => {
                  const Icon = category.icon;
                  const isActive = selectedCategories.includes(category.name);
                  return (
                    <Pressable
                      key={category.id}
                      onPress={() => toggleCategory(category.name)}
                      style={({ pressed }) => [pressed && styles.pressed]}
                    >
                      <AdaptiveGlassView
                        style={[styles.categoryChipCard, { opacity: isActive ? 1 : 0.6 }]}
                      >
                        <Icon size={20} color={isActive ? '#FFFFFF' : '#9E9E9E'} />
                        <Text
                          style={[
                            styles.categoryChipLabel,
                            { color: isActive ? '#FFFFFF' : '#9E9E9E' },
                          ]}
                        >
                          {category.name}
                        </Text>
                      </AdaptiveGlassView>
                    </Pressable>
                  );
                })}
              </ScrollView>
            </View>

            {/* Notifications */}
            <View style={styles.section}>
              <AdaptiveGlassView style={styles.notificationRow}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.notificationLabel}>
                    {strings.financeScreens.debts.modal.reminderToggle}
                  </Text>
                  <Text style={styles.notificationSubtext}>
                    {notifyEnabled
                      ? strings.financeScreens.debts.modal.reminderEnabledLabel
                      : strings.financeScreens.debts.modal.reminderDisabledLabel}
                  </Text>
                </View>
                <Switch value={notifyEnabled} onValueChange={setNotifyEnabled} />
              </AdaptiveGlassView>
            </View>

            {/* Action Buttons */}
            <View style={styles.actionButtons}>
              <Pressable
                style={({ pressed }) => [styles.secondaryButton, pressed && styles.pressed]}
                onPress={handleCloseBudgetModal}
              >
                <Text style={styles.secondaryButtonText}>Cancel</Text>
              </Pressable>
              <Pressable
                disabled={!isBudgetFormValid || !selectedAccountId}
                onPress={handleSubmitBudget}
                style={({ pressed }) => [
                  styles.primaryButton,
                  pressed && isBudgetFormValid && selectedAccountId && styles.pressed,
                ]}
              >
                <AdaptiveGlassView
                  style={[
                    styles.primaryButtonInner,
                    { opacity: !isBudgetFormValid || !selectedAccountId ? 0.4 : 1 },
                  ]}
                >
                  <Text
                    style={[
                      styles.primaryButtonText,
                      { color: !isBudgetFormValid || !selectedAccountId ? '#7E8B9A' : '#FFFFFF' },
                    ]}
                  >
                    {editingBudget
                      ? strings.financeScreens.debts.modal.buttons.saveChanges
                      : budgetsStrings.setLimit}
                  </Text>
                </AdaptiveGlassView>
              </Pressable>
            </View>

            {/* Delete Button */}
            {editingBudget && (
              <Pressable
                onPress={handleDeleteCurrentBudget}
                style={({ pressed }) => [styles.deleteButton, pressed && styles.pressed]}
              >
                <Text style={styles.deleteButtonText}>
                  {strings.financeScreens.accounts.actions.delete}
                </Text>
              </Pressable>
            )}
          </ScrollView>
        </KeyboardAvoidingView>
      </CustomModal>
    </>
  );
};

export default BudgetsScreen;

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 28,
    paddingBottom: 120,
    gap: 18,
  },
  dateCaption: {
    fontSize: 12,
    letterSpacing: 0.4,
    textTransform: 'uppercase',
    color: '#7E8B9A',
  },
  sectionHeading: {
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: 0.4,
    color: '#7E8B9A',
  },
  mainSection: {
    gap: 12,
  },
  mainAmountsRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 8,
  },
  mainAmount: {
    fontSize: 16,
    fontWeight: '500',
    letterSpacing: 0.2,
    color: '#7E8B9A',
  },
  progressShellWrapper: {
    height: PROGRESS_HEIGHT,
    borderRadius: PROGRESS_RADIUS,
    overflow: 'hidden',
    width: '100%',
  },
  progressShell: {
    flex: 1,
    height: PROGRESS_HEIGHT,
    borderRadius: PROGRESS_RADIUS,
    justifyContent: 'center',
    overflow: 'hidden',
    position: 'relative',
  },
  progressFill: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    borderRadius: PROGRESS_RADIUS,
  },
  progressOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    gap: 12,
  },
  progressLabelGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  progressLabel: {
    fontSize: 14,
    fontWeight: '600',
    letterSpacing: 0.4,
  },
  sectionHeaderRow: {
    marginTop: 6,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  addCategoryButton: {
    borderRadius: 16,
  },
  addCategoryButtonInner: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
  },
  addCategoryText: {
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 1,
    color: '#FFFFFF',
  },
  categoriesList: {
    gap: 12,
  },
  categoryBlock: {
    marginBottom: 8,
  },
  categoryCard: {
    borderRadius: 16,
    padding: 16,
    gap: 10,
  },
  categoryHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  categorySubtitle: {
    fontSize: 13,
    marginTop: 2,
    color: '#7E8B9A',
  },
  categoryActionButton: {
    paddingHorizontal: 6,
    paddingVertical: 4,
    borderRadius: 12,
  },
  categoryTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  categoryAction: {
    fontSize: 13,
    fontWeight: '500',
    letterSpacing: 0.2,
    color: '#7E8B9A',
  },
  categoryAmountsRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 8,
  },
  categoryAmount: {
    fontSize: 15,
    fontWeight: '500',
    letterSpacing: 0.2,
    color: '#7E8B9A',
  },
  remainingLabel: {
    fontSize: 13,
    fontWeight: '500',
    marginTop: 4,
    color: '#7E8B9A',
  },
  pressed: {
    opacity: 0.7,
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
    marginBottom: 8,
    paddingHorizontal: 20,
  },
  sectionLabel: {
    fontSize: 14,
    fontWeight: '400',
    color: '#7E8B9A',
    marginBottom: 12,
  },
  inputContainer: {
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  textInput: {
    fontSize: 15,
    fontWeight: '400',
    color: '#FFFFFF',
  },
  accountScroll: {
    gap: 12,
    paddingVertical: 10,
  },
  accountChip: {
    minWidth: 120,
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  accountChipLabel: {
    fontSize: 14,
    fontWeight: '600',
  },
  accountChipSubtext: {
    fontSize: 11,
    marginTop: 2,
    color: '#7E8B9A',
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
    justifyContent: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  typeLabel: {
    fontSize: 14,
    fontWeight: '400',
  },
  categoryChipScroll: {
    gap: 12,
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  categoryChipCard: {
    width: 90,
    height: 90,
    borderRadius: 16,
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  categoryChipLabel: {
    fontSize: 12,
    fontWeight: '500',
    textAlign: 'center',
  },
  notificationRow: {
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  notificationLabel: {
    fontSize: 15,
    fontWeight: '400',
    color: '#FFFFFF',
  },
  notificationSubtext: {
    fontSize: 13,
    fontWeight: '400',
    color: '#7E8B9A',
    marginTop: 4,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 24,
    paddingHorizontal: 20,
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
  deleteButton: {
    marginTop: 16,
    paddingVertical: 16,
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  deleteButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FF6B6B',
  },
});