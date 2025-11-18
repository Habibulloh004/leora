import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  View,
} from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { AlertCircle, Check } from 'lucide-react-native';
import DateTimePicker, {
  DateTimePickerAndroid,
  DateTimePickerEvent,
} from '@react-native-community/datetimepicker';

import CustomBottomSheet, { BottomSheetHandle } from '@/components/modals/BottomSheet';
import { AdaptiveGlassView } from '@/components/ui/AdaptiveGlassView';
import { getCategoriesForType } from '@/constants/financeCategories';
import { useSelectedDayStore } from '@/stores/selectedDayStore';
import { addDays, addMonths, startOfDay, startOfMonth, startOfWeek } from '@/utils/calendar';
import { useLocalization } from '@/localization/useLocalization';
import { useFinanceDomainStore } from '@/stores/useFinanceDomainStore';
import { useFinancePreferencesStore } from '@/stores/useFinancePreferencesStore';
import { useShallow } from 'zustand/react/shallow';
import type { Budget as DomainBudget, BudgetPeriodType } from '@/domain/finance/types';
import { BottomSheetTextInput } from '@gorhom/bottom-sheet';

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
const resolveBudgetState = (limit: number, spent: number): BudgetState => {
  if (limit <= 0) {
    return 'fixed';
  }
  if (spent > limit) {
    return 'exceeding';
  }
  return 'within';
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
      <AdaptiveGlassView style={[styles.glassSurface, styles.progressShell]}>
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
  labels: Record<BudgetState, string>;
  actionLabel: string;
  onManage?: (budgetId: string) => void;
}

const CategoryBudgetCard: React.FC<CategoryBudgetCardProps> = ({
  category,
  index,
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
      <AdaptiveGlassView style={[styles.glassSurface, styles.categoryCard]}>
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
  const normalizedSelectedDate = useMemo(
    () => startOfDay(selectedDate ?? new Date()),
    [selectedDate],
  );
  const baseCurrency = useFinancePreferencesStore((state) => state.baseCurrency);
  const {
    budgets: domainBudgets,
    accounts: domainAccounts,
    createBudget,
    updateBudget,
    archiveBudget,
  } = useFinanceDomainStore(
    useShallow((state) => ({
      budgets: state.budgets,
      accounts: state.accounts,
      createBudget: state.createBudget,
      updateBudget: state.updateBudget,
      archiveBudget: state.archiveBudget,
    })),
  );

  const accountMap = useMemo(
    () => new Map(domainAccounts.map((account) => [account.id, account])),
    [domainAccounts],
  );

  const budgetModalRef = useRef<BottomSheetHandle>(null);
  const [editingBudget, setEditingBudget] = useState<DomainBudget | null>(null);
  const [formName, setFormName] = useState('');
  const [limitInput, setLimitInput] = useState('');
  const [limitValue, setLimitValue] = useState(0);
  const [selectedAccountId, setSelectedAccountId] = useState<string | null>(domainAccounts[0]?.id ?? null);
  const [transactionType, setTransactionType] = useState<'income' | 'outcome'>('outcome');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [notifyEnabled, setNotifyEnabled] = useState(true);
  const [periodType, setPeriodType] = useState<BudgetPeriodType>('monthly');
  const [customStartDate, setCustomStartDate] = useState<Date | null>(null);
  const [customEndDate, setCustomEndDate] = useState<Date | null>(null);
  const [iosRangePicker, setIosRangePicker] = useState<{ target: 'start' | 'end'; value: Date } | null>(null);
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
    if (!selectedAccountId && domainAccounts[0]) {
      setSelectedAccountId(domainAccounts[0].id);
    }
  }, [domainAccounts, selectedAccountId]);

  const resetFormState = useCallback(
    (budget?: DomainBudget | null) => {
      if (budget) {
        setFormName(budget.name);
        setLimitInput(String(budget.limitAmount));
        setLimitValue(budget.limitAmount);
        setSelectedAccountId(budget.accountId ?? null);
        setTransactionType((budget.transactionType ?? 'expense') === 'income' ? 'income' : 'outcome');
        setSelectedCategories(budget.categoryIds ?? []);
        setNotifyEnabled(Boolean(budget.notifyOnExceed));
        setPeriodType(budget.periodType ?? 'monthly');
        setCustomStartDate(budget.startDate ? new Date(budget.startDate) : null);
        setCustomEndDate(budget.endDate ? new Date(budget.endDate) : null);
        return;
      }

      const defaultAccountId = domainAccounts[0]?.id ?? null;
      setFormName('');
      setLimitInput('');
      setLimitValue(0);
      setSelectedAccountId(defaultAccountId);
      setTransactionType('outcome');
      const defaultCategory = getCategoriesForType('outcome')[0]?.name;
      setSelectedCategories(defaultCategory ? [defaultCategory] : []);
      setNotifyEnabled(true);
      setPeriodType('monthly');
      setCustomStartDate(null);
      setCustomEndDate(null);
    },
    [domainAccounts],
  );

  const handleSheetDismiss = useCallback(() => {
    setIsFormVisible(false);
    setEditingBudget(null);
    resetFormState(null);
    setIosRangePicker(null);
  }, [resetFormState]);

  const handleCloseBudgetModal = useCallback(() => {
    budgetModalRef.current?.dismiss();
    handleSheetDismiss();
  }, [handleSheetDismiss]);

  const handleOpenBudgetModal = useCallback(
    (budget?: DomainBudget) => {
      setEditingBudget(budget ?? null);
      resetFormState(budget ?? null);
      setIsFormVisible(true);
      budgetModalRef.current?.present();
    },
    [resetFormState]
  );

  const effectiveAccountId = useMemo(
    () => selectedAccountId ?? domainAccounts[0]?.id ?? null,
    [domainAccounts, selectedAccountId],
  );

  const ensuredCategories = useMemo(() => {
    if (selectedCategories.length > 0) {
      return selectedCategories;
    }
    if (availableCategories.length > 0) {
      return [availableCategories[0].name];
    }
    return [];
  }, [availableCategories, selectedCategories]);

  const hasValidCategorySelection = ensuredCategories.length > 0;

  const computedRange = useMemo(() => {
    if (periodType === 'weekly') {
      const base = customStartDate ?? startOfWeek(normalizedSelectedDate);
      return { start: base, end: customEndDate ?? addDays(base, 6) };
    }
    if (periodType === 'monthly') {
      const base = customStartDate ?? startOfMonth(normalizedSelectedDate);
      const endSeed = addMonths(new Date(base), 1);
      const end = customEndDate ?? addDays(endSeed, -1);
      return { start: base, end };
    }
    if (periodType === 'custom_range') {
      return { start: customStartDate, end: customEndDate };
    }
    return { start: null, end: null };
  }, [customEndDate, customStartDate, normalizedSelectedDate, periodType]);

  const isCustomRangeValid =
    periodType !== 'custom_range' ||
    (customStartDate != null && customEndDate != null && customEndDate >= customStartDate);

  const formattedRange = useMemo(() => {
    if (!computedRange.start || !computedRange.end) {
      return null;
    }
    const formatter = new Intl.DateTimeFormat(locale, { month: 'short', day: 'numeric' });
    return `${formatter.format(computedRange.start)} — ${formatter.format(computedRange.end)}`;
  }, [computedRange.end, computedRange.start, locale]);

  const isBudgetFormValid =
    Boolean(formName.trim()) &&
    limitValue > 0 &&
    hasValidCategorySelection &&
    isCustomRangeValid;

  const handleLimitInputChange = useCallback((value: string) => {
    const sanitized = value.replace(/[^0-9.]/g, '').replace(/(\..*?)\./g, '$1');
    setLimitInput(sanitized);
    const numeric = Number.parseFloat(sanitized);
    setLimitValue(Number.isFinite(numeric) ? numeric : 0);
  }, []);

  const openRangePicker = useCallback(
    (target: 'start' | 'end') => {
      const fallbackDate = customStartDate ?? normalizedSelectedDate;
      const currentValue = target === 'start' ? customStartDate ?? fallbackDate : customEndDate ?? fallbackDate;
      if (Platform.OS === 'android') {
        DateTimePickerAndroid.open({
          value: currentValue,
          mode: 'date',
          display: 'calendar',
          onChange: (event, selected) => {
            if (event.type === 'set' && selected) {
              if (target === 'start') {
                setCustomStartDate(selected);
                if (!customEndDate || customEndDate < selected) {
                  setCustomEndDate(selected);
                }
              } else {
                setCustomEndDate(selected);
              }
            }
          },
        });
        return;
      }
      setIosRangePicker({ target, value: currentValue });
    },
    [customEndDate, customStartDate, normalizedSelectedDate],
  );

  const handleIosRangeChange = useCallback(
    (event: DateTimePickerEvent, selected?: Date) => {
      if (event.type === 'dismissed') {
        setIosRangePicker(null);
        return;
      }
      if (selected && iosRangePicker) {
        if (iosRangePicker.target === 'start') {
          setCustomStartDate(selected);
          if (!customEndDate || customEndDate < selected) {
            setCustomEndDate(selected);
          }
        } else {
          setCustomEndDate(selected);
        }
      }
      setIosRangePicker(null);
    },
    [customEndDate, iosRangePicker],
  );

  const toggleCategory = useCallback((name: string) => {
    setSelectedCategories((prev) => {
      if (prev.includes(name)) {
        return prev.length === 1 ? prev : prev.filter((item) => item !== name);
      }
      return [...prev, name];
    });
  }, []);

  const handlePeriodChange = useCallback(
    (next: BudgetPeriodType) => {
      setPeriodType(next);
      if (next === 'custom_range') {
        if (!customStartDate) {
          setCustomStartDate(normalizedSelectedDate);
        }
        if (!customEndDate) {
          setCustomEndDate(addDays(normalizedSelectedDate, 6));
        }
      }
    },
    [customEndDate, customStartDate, normalizedSelectedDate],
  );

  const handleSubmitBudget = useCallback(() => {
    if (!isBudgetFormValid || ensuredCategories.length === 0) {
      return;
    }
    const startDateValue = computedRange.start ?? startOfMonth(normalizedSelectedDate);
    const endDateValue =
      computedRange.end ??
      (periodType === 'weekly'
        ? addDays(startDateValue, 6)
        : addDays(addMonths(new Date(startDateValue), 1), -1));
    const startIso = startDateValue.toISOString();
    const endIso = endDateValue.toISOString();
    if (editingBudget) {
      updateBudget(editingBudget.id, {
        name: formName.trim(),
        limitAmount: limitValue,
        accountId: effectiveAccountId ?? undefined,
        transactionType: transactionType === 'income' ? 'income' : 'expense',
        categoryIds: ensuredCategories,
        notifyOnExceed: notifyEnabled,
        periodType,
        startDate: startIso,
        endDate: endIso,
      });
    } else {
      const account = effectiveAccountId ? accountMap.get(effectiveAccountId) : undefined;
      createBudget({
        userId: 'local-user',
        name: formName.trim(),
        budgetType: 'category',
        linkedGoalId: undefined,
        categoryIds: ensuredCategories,
        accountId: effectiveAccountId ?? undefined,
        transactionType: transactionType === 'income' ? 'income' : 'expense',
        currency: account?.currency ?? baseCurrency,
        limitAmount: limitValue,
        periodType,
        startDate: startIso,
        endDate: endIso,
        notifyOnExceed: notifyEnabled,
        rolloverMode: 'none',
        isArchived: false,
      });
    }
    handleCloseBudgetModal();
  }, [
    accountMap,
    baseCurrency,
    computedRange,
    createBudget,
    editingBudget,
    ensuredCategories,
    effectiveAccountId,
    formName,
    handleCloseBudgetModal,
    isBudgetFormValid,
    limitValue,
    normalizedSelectedDate,
    notifyEnabled,
    periodType,
    selectedCategories,
    transactionType,
    updateBudget,
  ]);

  const handleDeleteCurrentBudget = useCallback(() => {
    if (!editingBudget) {
      return;
    }
    archiveBudget(editingBudget.id);
    handleCloseBudgetModal();
  }, [archiveBudget, editingBudget, handleCloseBudgetModal]);

  const handleManageBudget = useCallback(
    (budgetId: string) => {
      const target = domainBudgets.find((budget) => budget.id === budgetId);
      if (target) {
        handleOpenBudgetModal(target);
      }
    },
    [domainBudgets, handleOpenBudgetModal],
  );

  const handleOpenCreateBudget = useCallback(() => {
    handleOpenBudgetModal();
  }, [handleOpenBudgetModal]);

  const aggregate = useMemo(() => {
    const total = domainBudgets.reduce(
      (acc, budget) => {
        acc.current += budget.spentAmount;
        acc.total += budget.limitAmount;
        return acc;
      },
      { current: 0, total: 0 },
    );
    const categories = domainBudgets.map((budget) => {
      const account = budget.accountId ? accountMap.get(budget.accountId) : undefined;
      const state = resolveBudgetState(budget.limitAmount, budget.spentAmount);
      return {
        id: budget.id,
        name: budget.name,
        spent: budget.spentAmount,
        limit: budget.limitAmount,
        state,
        currency: budget.currency ?? account?.currency ?? baseCurrency,
        accountName: account?.name ?? strings.financeScreens.accounts.header,
        categories: budget.categoryIds ?? [],
        notifyOnExceed: Boolean(budget.notifyOnExceed),
      };
    });
    return {
      main: {
        current: total.current,
        total: total.total,
        currency: baseCurrency,
      },
      categories,
    };
  }, [accountMap, baseCurrency, domainBudgets, strings.financeScreens.accounts.header]);

  const selectedDateLabel = useMemo(() => {
    const today = startOfDay(new Date());
    if (normalizedSelectedDate.getTime() === today.getTime()) {
      return budgetsStrings.today;
    }
    const formatted = new Intl.DateTimeFormat(locale, {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    }).format(normalizedSelectedDate);
    return budgetsStrings.dateTemplate.replace('{date}', formatted);
  }, [budgetsStrings, locale, normalizedSelectedDate]);

  const manageLabel = strings.financeScreens.accounts.actions.edit;
  const selectedAccount = effectiveAccountId ? accountMap.get(effectiveAccountId) : null;
  const selectedCurrency = selectedAccount?.currency ?? baseCurrency;

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
            <AdaptiveGlassView style={[styles.glassSurface, styles.addCategoryButtonInner]}>
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
              labels={budgetsStrings.states}
              actionLabel={manageLabel}
              onManage={handleManageBudget}
            />
          ))}
        </View>
      </ScrollView>

      <CustomBottomSheet
        ref={budgetModalRef}
        snapPoints={['70%', '96%']}
        enableDynamicSizing={false}
        enablePanDownToClose
        scrollable
        scrollProps={{ keyboardShouldPersistTaps: 'handled' }}
        keyboardBehavior="interactive"
        keyboardBlurBehavior="restore"
        onDismiss={handleSheetDismiss}
      >
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
              <AdaptiveGlassView style={[styles.glassSurface, styles.inputContainer]}>
                <BottomSheetTextInput
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
              <AdaptiveGlassView style={[styles.glassSurface, styles.inputContainer]}>
                <BottomSheetTextInput
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
                {domainAccounts.map((account) => {
                  const isSelected = account.id === selectedAccountId;
                  return (
                    <Pressable
                      key={account.id}
                      onPress={() => setSelectedAccountId(account.id)}
                      style={({ pressed }) => [pressed && styles.pressed]}
                    >
                      <AdaptiveGlassView
                        style={[styles.glassSurface, styles.accountChip, { opacity: isSelected ? 1 : 0.6 }]}
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

            {/* Period */}
            <View style={styles.section}>
              <Text style={styles.sectionLabel}>{budgetsStrings.form.periodLabel}</Text>
              <View style={styles.periodChipsRow}>
                {(['weekly', 'monthly', 'custom_range'] as BudgetPeriodType[]).map((type) => {
                  const active = periodType === type;
                  return (
                    <Pressable key={type} onPress={() => handlePeriodChange(type)}>
                      <AdaptiveGlassView
                        style={[
                          styles.glassSurface,
                          styles.periodChip,
                          active && styles.periodChipActive,
                        ]}
                      >
                        <Text
                          style={[
                            styles.periodChipLabel,
                            active && styles.periodChipLabelActive,
                          ]}
                        >
                          {budgetsStrings.form.periodOptions[type]}
                        </Text>
                      </AdaptiveGlassView>
                    </Pressable>
                  );
                })}
              </View>
              <Text style={styles.rangeSummary}>
                {budgetsStrings.form.selectedRangeLabel.replace(
                  '{range}',
                  formattedRange ?? '—',
                )}
              </Text>
            </View>

            {periodType === 'custom_range' && (
              <View style={styles.section}>
                <Text style={styles.sectionLabel}>{budgetsStrings.form.customRange.helper}</Text>
                <View style={styles.customRangeRow}>
                  <Pressable onPress={() => openRangePicker('start')}>
                    <AdaptiveGlassView style={[styles.glassSurface, styles.rangeButton]}>
                      <Text style={styles.rangeButtonLabel}>{budgetsStrings.form.customRange.start}</Text>
                      <Text style={styles.rangeValue}>
                        {customStartDate
                          ? new Intl.DateTimeFormat(locale, { month: 'short', day: 'numeric' }).format(
                              customStartDate,
                            )
                          : '—'}
                      </Text>
                    </AdaptiveGlassView>
                  </Pressable>
                  <Pressable onPress={() => openRangePicker('end')}>
                    <AdaptiveGlassView style={[styles.glassSurface, styles.rangeButton]}>
                      <Text style={styles.rangeButtonLabel}>{budgetsStrings.form.customRange.end}</Text>
                      <Text style={styles.rangeValue}>
                        {customEndDate
                          ? new Intl.DateTimeFormat(locale, { month: 'short', day: 'numeric' }).format(
                              customEndDate,
                            )
                          : '—'}
                      </Text>
                    </AdaptiveGlassView>
                  </Pressable>
                </View>
                {!isCustomRangeValid && (
                  <Text style={styles.rangeError}>{budgetsStrings.form.customRange.error}</Text>
                )}
              </View>
            )}

            {/* Type */}
            <View style={styles.section}>
              <Text style={styles.sectionLabel}>Type</Text>
              <AdaptiveGlassView style={[styles.glassSurface, styles.typeContainer]}>
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
                        style={[styles.glassSurface, styles.categoryChipCard, { opacity: isActive ? 1 : 0.6 }]}
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
              <AdaptiveGlassView style={[styles.glassSurface, styles.notificationRow]}>
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
                disabled={!isBudgetFormValid}
                onPress={handleSubmitBudget}
                style={({ pressed }) => [
                  styles.primaryButton,
                  pressed && isBudgetFormValid && styles.pressed,
                ]}
              >
                <AdaptiveGlassView
                  style={[
                    styles.glassSurface,
                    styles.primaryButtonInner,
                    { opacity: !isBudgetFormValid ? 0.4 : 1 },
                  ]}
                >
                  <Text
                    style={[
                      styles.primaryButtonText,
                      { color: !isBudgetFormValid ? '#7E8B9A' : '#FFFFFF' },
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
      </CustomBottomSheet>

      {Platform.OS === 'ios' && iosRangePicker && (
        <Modal transparent visible animationType="fade" onRequestClose={() => setIosRangePicker(null)}>
          <View style={styles.pickerModal}>
            <Pressable style={styles.pickerBackdrop} onPress={() => setIosRangePicker(null)} />
            <AdaptiveGlassView style={styles.pickerCard}>
              <DateTimePicker
                value={iosRangePicker.value}
                mode="date"
                display="inline"
                onChange={handleIosRangeChange}
              />
              <Pressable onPress={() => setIosRangePicker(null)} style={styles.pickerDoneButton}>
                <Text style={styles.pickerDoneText}>OK</Text>
              </Pressable>
            </AdaptiveGlassView>
          </View>
        </Modal>
      )}
    </>
  );
};

export default BudgetsScreen;

const styles = StyleSheet.create({
  glassSurface: {
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(255,255,255,0.18)',
    backgroundColor: 'rgba(255,255,255,0.04)',
  },
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
  periodChipsRow: {
    flexDirection: 'row',
    gap: 10,
    paddingVertical: 4,
    flexWrap: 'wrap',
  },
  periodChip: {
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 10,
    marginRight: 6,
    marginBottom: 6,
  },
  periodChipActive: {
    borderColor: 'rgba(124,101,255,0.8)',
    backgroundColor: 'rgba(124,101,255,0.18)',
  },
  periodChipLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#9E9E9E',
  },
  periodChipLabelActive: {
    color: '#FFFFFF',
  },
  rangeSummary: {
    marginTop: 6,
    fontSize: 12,
    color: '#7E8B9A',
  },
  customRangeRow: {
    flexDirection: 'row',
    gap: 10,
  },
  rangeButton: {
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 12,
    minWidth: 140,
  },
  rangeButtonLabel: {
    fontSize: 12,
    color: '#7E8B9A',
  },
  rangeValue: {
    marginTop: 4,
    fontSize: 15,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  rangeError: {
    marginTop: 6,
    fontSize: 12,
    color: '#F87171',
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
  pickerModal: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.4)',
    padding: 24,
  },
  pickerBackdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  pickerCard: {
    width: '100%',
    borderRadius: 24,
    padding: 16,
    gap: 12,
  },
  pickerDoneButton: {
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    paddingVertical: 10,
    alignItems: 'center',
  },
  pickerDoneText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
});
