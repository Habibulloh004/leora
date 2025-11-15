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
  TouchableOpacity,
  View,
} from 'react-native';
import { RectButton } from 'react-native-gesture-handler';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { AlertCircle, Check } from 'lucide-react-native';
import { Ionicons } from '@expo/vector-icons';

import CustomModal from '@/components/modals/CustomModal';
import { BottomSheetHandle } from '@/components/modals/BottomSheet';
import { AdaptiveGlassView } from '@/components/ui/AdaptiveGlassView';
import { useAppTheme } from '@/constants/theme';
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

const formatCurrency = (value: number, currency: string) => {
  const locale = currency === 'UZS' ? 'uz-UZ' : 'en-US';
  const maximumFractionDigits = currency === 'UZS' ? 0 : 2;
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    maximumFractionDigits,
  }).format(value);
};

const applyAlpha = (hex: string, alpha: number) => {
  const normalized = hex.replace('#', '');
  if (normalized.length !== 6 && normalized.length !== 8) {
    return hex;
  }
  const alphaHex = Math.round(Math.min(Math.max(alpha, 0), 1) * 255)
    .toString(16)
    .padStart(2, '0');
  return `#${normalized.substring(0, 6)}${alphaHex}`;
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
  const theme = useAppTheme();
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
      <AdaptiveGlassView
        style={[
          styles.progressShell,
          {
            borderColor: applyAlpha(theme.colors.borderMuted, 0.55),
            backgroundColor: applyAlpha(theme.colors.textSecondary, 0.16),
          },
        ]}
      >
        <View
          style={[
            styles.progressTrack,
            {
              backgroundColor: applyAlpha(
                theme.colors.backgroundMuted,
                theme.mode === 'dark' ? 0.38 : 1,
              ),
            },
          ]}
        />
        <Animated.View
          style={[
            styles.progressFill,
            fillStyle,
            { backgroundColor: appearance.fillColor },
          ]}
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
  theme: ReturnType<typeof useAppTheme>,
  state: BudgetState,
  labels: Record<BudgetState, string>,
): ProgressAppearance => {
  const neutralFill =
    theme.mode === 'dark'
      ? applyAlpha(theme.colors.white, 0.45)
      : applyAlpha(theme.colors.primary, 0.6);

  switch (state) {
    case 'exceeding':
      return {
        fillColor: theme.colors.danger,
        label: labels.exceeding,
        icon: 'alert',
        textColor: theme.mode === 'dark' ? theme.colors.white : theme.colors.onDanger,
      };
    case 'fixed':
      return {
        fillColor: theme.colors.success,
        label: labels.fixed,
        icon: 'check',
        textColor: theme.mode === 'dark' ? theme.colors.white : theme.colors.onSuccess,
      };
    default:
      return {
        fillColor: neutralFill,
        label: labels.within,
        icon: 'check',
        textColor: theme.mode === 'dark' ? theme.colors.white : theme.colors.textPrimary,
      };
  }
};

const MainBudgetProgress: React.FC<{
  budget: { current: number; total: number; currency: string };
  labels: Record<BudgetState, string>;
}> = ({
  budget,
  labels,
}) => {
  const theme = useAppTheme();
  const percentage =
    budget.total === 0 ? 0 : Math.min((budget.current / budget.total) * 100, 125);
  const appearance = useMemo(
    () => buildProgressAppearance(theme, 'within', labels),
    [theme, labels],
  );

  return (
    <View style={styles.mainSection}>
      <View style={styles.mainAmountsRow}>
        <Text style={[styles.mainAmount, { color: theme.colors.textSecondary }]}>
          {formatCurrency(budget.current, budget.currency)}
        </Text>
        <Text style={[styles.mainAmount, { color: theme.colors.textSecondary }]}>
          / {formatCurrency(budget.total, budget.currency)}
        </Text>
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
  const theme = useAppTheme();
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
    () => buildProgressAppearance(theme, category.state, labels),
    [category.state, labels, theme],
  );

  const categoriesSummary = category.categories.join(', ');
  const remainingAmount = Math.max(category.limit - category.spent, 0);

  return (
    <Animated.View style={[styles.categoryBlock, animatedStyle]}>
      <View style={styles.categoryHeaderRow}>
        <Text style={[styles.categoryTitle, { color: theme.colors.textSecondary }]}>
          {category.name}
        </Text>
        <RectButton
          style={styles.categoryActionButton}
          rippleColor={applyAlpha(theme.colors.textSecondary, 0.15)}
          onPress={() => onManage?.(category.id)}
        >
          <Text style={[styles.categoryAction, { color: theme.colors.textSecondary }]}>
            {actionLabel}
          </Text>
        </RectButton>
      </View>
      <Text style={[styles.categorySubtitle, { color: theme.colors.textTertiary }]}>
        {category.accountName}
        {categoriesSummary ? ` · ${categoriesSummary}` : ''}
      </Text>

      <View style={styles.categoryAmountsRow}>
        <Text style={[styles.categoryAmount, { color: theme.colors.textSecondary }]}>
          {formatCurrency(category.spent, category.currency)}
        </Text>
        <Text style={[styles.categoryAmount, { color: theme.colors.textSecondary }]}>
          / {formatCurrency(category.limit, category.currency)}
        </Text>
      </View>

      <AnimatedProgressBar percentage={progress} appearance={appearance} />
      <Text style={[styles.remainingLabel, { color: theme.colors.textSecondary }]}>
        {appearance.label === labels.exceeding
          ? `${formatCurrency(category.spent - category.limit, category.currency)} over limit`
          : `Remaining ${formatCurrency(remainingAmount, category.currency)}`}
      </Text>

      {isLast ? null : (
        <View style={[styles.divider, { backgroundColor: applyAlpha(theme.colors.borderMuted, 0.5) }]} />
      )}
    </Animated.View>
  );
};

const BudgetsScreen: React.FC = () => {
  const theme = useAppTheme();
  const { strings, locale } = useLocalization();
  const budgetsStrings = strings.financeScreens.budgets;
  const dividerColor = applyAlpha(theme.colors.borderMuted, theme.mode === 'dark' ? 0.4 : 0.6);
  const selectedDate = useSelectedDayStore((state) => state.selectedDate);
  const budgets = useFinanceStore((state) => state.budgets);
  const accounts = useFinanceStore((state) => state.accounts);
  const addBudget = useFinanceStore((state) => state.addBudget);
  const updateBudget = useFinanceStore((state) => state.updateBudget);
  const deleteBudget = useFinanceStore((state) => state.deleteBudget);
  const accountMap = useMemo(
    () => new Map(accounts.map((account) => [account.id, account])),
    [accounts],
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
    [transactionType],
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
    [accounts],
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
    [resetFormState],
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
      prev.includes(name) ? prev.filter((item) => item !== name) : [...prev, name],
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
    [budgets, handleOpenBudgetModal],
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
      { current: 0, total: 0 },
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
        style={[styles.screen, { backgroundColor: theme.colors.background }]}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
      <Text style={[styles.dateCaption, { color: theme.colors.textSecondary }]}>{selectedDateLabel}</Text>
      <Text style={[styles.sectionHeading, { color: theme.colors.textSecondary }]}>
        {budgetsStrings.mainTitle}
      </Text>
      <View style={[styles.divider, { backgroundColor: dividerColor }]} />

      <MainBudgetProgress budget={aggregate.main} labels={budgetsStrings.states} />

      <View style={styles.sectionHeaderRow}>
        <Text style={[styles.sectionHeading, { color: theme.colors.textSecondary }]}>
          {budgetsStrings.categoriesTitle}
        </Text>
        <RectButton
          style={[
            styles.addCategoryButton,
            { borderColor: applyAlpha(theme.colors.textSecondary, 0.35) },
          ]}
          rippleColor={applyAlpha(theme.colors.textSecondary, 0.15)}
          onPress={handleOpenCreateBudget}
        >
          <Text style={[styles.addCategoryText, { color: theme.colors.textSecondary }]}>
            {budgetsStrings.setLimit}
          </Text>
        </RectButton>
      </View>
      <View style={[styles.divider, { backgroundColor: dividerColor }]} />

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

      <CustomModal
        ref={budgetModalRef}
        variant='form'
        scrollable
        scrollProps={{ keyboardShouldPersistTaps: 'handled' }}
        fallbackSnapPoint='85%'
        onDismiss={handleCloseBudgetModal}
      >
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <View style={styles.modalHeader}>
            <Text style={[styles.modalTitle, { color: theme.colors.textPrimary }]}>
              {editingBudget ? manageLabel : budgetsStrings.setLimit}
            </Text>
            <Pressable onPress={handleCloseBudgetModal} hitSlop={12}>
              <Ionicons name='close' size={20} color={theme.colors.textSecondary} />
            </Pressable>
          </View>

          <View style={styles.modalSection}>
            <Text style={[styles.modalLabel, { color: theme.colors.textSecondary }]}>
              {strings.financeScreens.debts.modal.person}
            </Text>
            <TextInput
              value={formName}
              onChangeText={setFormName}
              placeholder={strings.financeScreens.debts.modal.defaults.name}
              placeholderTextColor={theme.colors.textMuted}
              style={[
                styles.modalInput,
                {
                  backgroundColor: theme.colors.cardItem,
                  borderColor: applyAlpha(theme.colors.borderMuted, 0.6),
                  color: theme.colors.textPrimary,
                },
              ]}
            />
          </View>

          <View style={styles.modalSection}>
            <Text style={[styles.modalLabel, { color: theme.colors.textSecondary }]}>
              {`${strings.financeScreens.transactions.details.amount} (${selectedCurrency})`}
            </Text>
            <TextInput
              value={limitInput}
              onChangeText={handleLimitInputChange}
              keyboardType='numeric'
              placeholder='0'
              placeholderTextColor={theme.colors.textMuted}
              style={[
                styles.modalInput,
                {
                  backgroundColor: theme.colors.cardItem,
                  borderColor: applyAlpha(theme.colors.borderMuted, 0.6),
                  color: theme.colors.textPrimary,
                },
              ]}
            />
          </View>

          <View style={styles.modalSection}>
            <Text style={[styles.modalLabel, { color: theme.colors.textSecondary }]}>
              {strings.financeScreens.debts.modal.accountLabel}
            </Text>
            <View style={styles.accountList}>
              {accounts.length === 0 ? (
                <Text style={{ color: theme.colors.textMuted }}>
                  {strings.financeScreens.accounts.header}
                </Text>
              ) : (
                accounts.map((account) => {
                  const isSelected = account.id === selectedAccountId;
                  return (
                    <Pressable
                      key={account.id}
                      style={[
                        styles.accountChip,
                        {
                          borderColor: isSelected ? theme.colors.primary : applyAlpha(theme.colors.borderMuted, 0.8),
                          backgroundColor: isSelected ? applyAlpha(theme.colors.primary, 0.12) : theme.colors.cardItem,
                        },
                      ]}
                      onPress={() => setSelectedAccountId(account.id)}
                    >
                      <Text
                        style={[
                          styles.accountChipLabel,
                          { color: isSelected ? theme.colors.primary : theme.colors.textSecondary },
                        ]}
                      >
                        {account.name}
                      </Text>
                      <Text style={[styles.accountChipSubtext, { color: theme.colors.textTertiary }]}>
                        {account.currency}
                      </Text>
                    </Pressable>
                  );
                })
              )}
            </View>
          </View>

          <View style={styles.modalSection}>
            <Text style={[styles.modalLabel, { color: theme.colors.textSecondary }]}>
              {strings.financeScreens.accounts.header}
            </Text>
            <View style={styles.typeToggle}>
              {(['outcome', 'income'] as const).map((type) => {
                const isSelected = transactionType === type;
                return (
                  <Pressable
                    key={type}
                    style={[
                      styles.typeOption,
                      {
                        backgroundColor: isSelected ? theme.colors.primary : theme.colors.cardItem,
                      },
                    ]}
                    onPress={() => setTransactionType(type)}
                  >
                    <Text
                      style={[
                        styles.typeOptionLabel,
                        { color: isSelected ? theme.colors.onPrimary : theme.colors.textSecondary },
                      ]}
                    >
                      {type === 'outcome'
                        ? strings.financeScreens.accounts.outcome
                        : strings.financeScreens.accounts.income}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </View>

          <View style={styles.modalSection}>
            <Text style={[styles.modalLabel, { color: theme.colors.textSecondary }]}>
              {strings.financeScreens.transactions.details.category}
            </Text>
            <View style={styles.categoryChipGrid}>
              {availableCategories.map((category) => {
                const Icon = category.icon;
                const isActive = selectedCategories.includes(category.name);
                return (
                  <Pressable
                    key={category.id}
                    style={[
                      styles.categoryChip,
                      {
                        borderColor: isActive ? theme.colors.primary : applyAlpha(theme.colors.borderMuted, 0.7),
                        backgroundColor: isActive ? applyAlpha(theme.colors.primary, 0.12) : theme.colors.cardItem,
                      },
                    ]}
                    onPress={() => toggleCategory(category.name)}
                  >
                    <Icon size={14} color={isActive ? theme.colors.primary : theme.colors.textSecondary} />
                    <Text
                      style={[
                        styles.categoryChipLabel,
                        { color: isActive ? theme.colors.primary : theme.colors.textSecondary },
                      ]}
                    >
                      {category.name}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </View>

          <View style={[styles.modalSection, styles.modalRow]}>
            <View>
              <Text style={[styles.modalLabel, { color: theme.colors.textSecondary }]}>
                {strings.financeScreens.debts.modal.reminderToggle}
              </Text>
              <Text style={{ color: theme.colors.textTertiary }}>
                {notifyEnabled
                  ? strings.financeScreens.debts.modal.reminderEnabledLabel
                  : strings.financeScreens.debts.modal.reminderDisabledLabel}
              </Text>
            </View>
            <Switch value={notifyEnabled} onValueChange={setNotifyEnabled} />
          </View>

          <TouchableOpacity
            style={[
              styles.primaryButton,
              (!isBudgetFormValid || !selectedAccountId) && styles.primaryButtonDisabled,
              { backgroundColor: theme.colors.primary },
            ]}
            onPress={handleSubmitBudget}
            activeOpacity={0.85}
            disabled={!isBudgetFormValid || !selectedAccountId}
          >
            <Text style={[styles.primaryButtonText, { color: theme.colors.onPrimary }]}>
              {editingBudget ? strings.financeScreens.debts.modal.buttons.saveChanges : budgetsStrings.setLimit}
            </Text>
          </TouchableOpacity>

          {editingBudget ? (
            <TouchableOpacity
              style={[styles.deleteButton, { borderColor: applyAlpha(theme.colors.danger, 0.4) }]}
              onPress={handleDeleteCurrentBudget}
              activeOpacity={0.8}
            >
              <Text style={[styles.deleteButtonText, { color: theme.colors.danger }]}>
                {strings.financeScreens.accounts.actions.delete}
              </Text>
            </TouchableOpacity>
          ) : null}
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
  },
  sectionHeading: {
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: 0.4,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    width: '100%',
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
    borderWidth: 1,
    justifyContent: 'center',
    overflow: 'hidden',
    position: 'relative',
  },
  progressTrack: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: PROGRESS_RADIUS,
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
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
    borderWidth: 1,
  },
  addCategoryText: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1,
  },
  categoriesList: {
    gap: 18,
  },
  categoryBlock: {
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
  },
  categoryActionButton: {
    paddingHorizontal: 6,
    paddingVertical: 4,
    borderRadius: 12,
  },
  categoryTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  categoryAction: {
    fontSize: 13,
    fontWeight: '500',
    letterSpacing: 0.2,
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
  },
  remainingLabel: {
    fontSize: 13,
    fontWeight: '500',
    marginTop: 4,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  modalSection: {
    marginBottom: 16,
    gap: 8,
  },
  modalLabel: {
    fontSize: 13,
    fontWeight: '600',
    letterSpacing: 0.2,
  },
  modalInput: {
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 15,
  },
  accountList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  accountChip: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    minWidth: 140,
  },
  accountChipLabel: {
    fontSize: 14,
    fontWeight: '600',
  },
  accountChipSubtext: {
    fontSize: 11,
    marginTop: 2,
  },
  typeToggle: {
    flexDirection: 'row',
    gap: 10,
  },
  typeOption: {
    flex: 1,
    borderRadius: 12,
    paddingVertical: 10,
    alignItems: 'center',
  },
  typeOptionLabel: {
    fontSize: 14,
    fontWeight: '600',
  },
  categoryChipGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderRadius: 18,
  },
  categoryChipLabel: {
    fontSize: 13,
    fontWeight: '600',
  },
  modalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  primaryButton: {
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 8,
  },
  primaryButtonDisabled: {
    opacity: 0.5,
  },
  primaryButtonText: {
    fontSize: 15,
    fontWeight: '600',
  },
  deleteButton: {
    borderWidth: 1,
    borderRadius: 14,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 12,
  },
  deleteButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
});
