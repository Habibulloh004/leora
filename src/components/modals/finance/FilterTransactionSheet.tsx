import React, {
  forwardRef,
  useCallback,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { BottomSheetTextInput } from '@gorhom/bottom-sheet';
import { Easing } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import CustomBottomSheet, {
  BottomSheetHandle,
} from '@/components/modals/BottomSheet';
import { AdaptiveGlassView } from '@/components/ui/AdaptiveGlassView';
import { useAppTheme } from '@/constants/theme';

type ThemeColors = ReturnType<typeof useAppTheme>['colors'];

type FilterOption = {
  id: string;
  label: string;
};

const PERIOD_OPTIONS: FilterOption[] = [
  { id: 'today', label: 'Today' },
  { id: 'week', label: 'This Week' },
  { id: 'month', label: 'This Month' },
  { id: 'year', label: 'This Year' },
];

const TYPE_OPTIONS: FilterOption[] = [
  { id: 'all', label: 'All' },
  { id: 'income', label: 'Income' },
  { id: 'outcome', label: 'Outcome' },
  { id: 'transfer', label: 'Transfer' },
];

const CATEGORY_OPTIONS: FilterOption[] = [
  { id: 'all', label: 'All' },
  { id: 'salary', label: 'Salary' },
  { id: 'transport', label: 'Transport' },
  { id: 'food', label: 'Food' },
  { id: 'shopping', label: 'Shopping' },
  { id: 'entertainment', label: 'Entertainment' },
];

const ACCOUNT_OPTIONS: FilterOption[] = [
  { id: 'all', label: 'All' },
  { id: 'cash', label: 'Cash' },
  { id: 'plastic-1', label: 'Plastik 1' },
  { id: 'usd-balance', label: 'USD Balance' },
  { id: 'savings', label: 'Savings' },
];

export type FilterState = {
  period: string;
  category: string;
  account: string;
  type: string;
  minAmount: string;
  maxAmount: string;
};

export interface FilterTransactionSheetHandle {
  open: () => void;
  close: () => void;
  reset: () => void;
}

interface FilterTransactionSheetProps {
  onApply?: (filters: FilterState) => void;
  onReset?: () => void;
  accountOptions?: FilterOption[];
  categoryOptions?: FilterOption[];
}

const createInitialState = (): FilterState => ({
  period: 'today',
  category: 'all',
  account: 'all',
  type: 'all',
  minAmount: '',
  maxAmount: '',
});

const FilterTransactionSheet = forwardRef<
  FilterTransactionSheetHandle,
  FilterTransactionSheetProps
>(({ onApply, onReset, accountOptions, categoryOptions }, ref) => {
  const theme = useAppTheme();
  const sheetRef = useRef<BottomSheetHandle>(null);
  const [filters, setFilters] = useState<FilterState>(() => createInitialState());
  const insets = useSafeAreaInsets();

  const handleOpen = useCallback(() => {
    sheetRef.current?.present();
  }, []);

  const handleClose = useCallback(() => {
    sheetRef.current?.dismiss();
  }, []);

  const handleReset = useCallback(() => {
    setFilters(createInitialState());
    onReset?.();
  }, [onReset]);

  const handleApply = useCallback(() => {
    onApply?.(filters);
    handleClose();
  }, [filters, handleClose, onApply]);

  useImperativeHandle(
    ref,
    () => ({
      open: handleOpen,
      close: handleClose,
      reset: handleReset,
    }),
    [handleClose, handleOpen, handleReset],
  );

  const snapPoints = useMemo<(string | number)[]>(() => ['68%', '88%'], []);

  const handleOptionSelect = useCallback(
    (key: keyof FilterState, value: string) => {
      setFilters((prev) => ({ ...prev, [key]: value }));
    },
    [],
  );

  return (
    <CustomBottomSheet
      ref={sheetRef}
      snapPoints={snapPoints}
      animationConfigs={{ duration: 320, easing: Easing.linear }}
      enableDynamicSizing={false}
      backgroundStyle={[
        styles.sheetBackground,
        {
          backgroundColor:
            theme.mode === 'dark'
              ? 'rgba(18,18,22,0.92)'
              : 'rgba(24,24,28,0.92)',
          borderColor: theme.colors.borderMuted,
        },
      ]}
      handleIndicatorStyle={[
        styles.handleIndicator,
        { backgroundColor: theme.colors.textMuted },
      ]}
      scrollable
      scrollProps={{ keyboardShouldPersistTaps: 'handled' }}
      contentContainerStyle={[
        styles.contentContainer,
      ]}
    >
      <View style={styles.innerContent}>
        <Text style={[styles.sheetTitle, { color: theme.colors.textSecondary }]}>
          Filter by
        </Text>

        <FilterSection title="Period" themeColor={theme.colors.textSecondary}>
          <FilterOptionRow
            options={PERIOD_OPTIONS}
            selectedId={filters.period}
            onSelect={(value) => handleOptionSelect('period', value)}
            themeColors={theme.colors}
          />
        </FilterSection>

        <FilterSection title="Category" themeColor={theme.colors.textSecondary}>
          <FilterOptionRow
            options={categoryOptions?.length ? categoryOptions : CATEGORY_OPTIONS}
            selectedId={filters.category}
            onSelect={(value) => handleOptionSelect('category', value)}
            themeColors={theme.colors}
            wrap
          />
        </FilterSection>

        <FilterSection title="Accounts" themeColor={theme.colors.textSecondary}>
          <FilterOptionRow
            options={accountOptions?.length ? accountOptions : ACCOUNT_OPTIONS}
            selectedId={filters.account}
            onSelect={(value) => handleOptionSelect('account', value)}
            themeColors={theme.colors}
            wrap
          />
        </FilterSection>

        <FilterSection title="Type" themeColor={theme.colors.textSecondary}>
          <FilterOptionRow
            options={TYPE_OPTIONS}
            selectedId={filters.type}
            onSelect={(value) => handleOptionSelect('type', value)}
            themeColors={theme.colors}
          />
        </FilterSection>

        <FilterSection title="Amount Range" themeColor={theme.colors.textSecondary}>
          <View style={styles.amountRow}>
            <AdaptiveGlassView
              style={[
                styles.amountInputContainer,
                { borderColor: theme.colors.border },
              ]}
            >
              <BottomSheetTextInput
                value={filters.minAmount}
                onChangeText={(value) => handleOptionSelect('minAmount', value)}
                placeholder="From"
                placeholderTextColor={theme.colors.textMuted}
                style={[
                  styles.amountInput,
                  { color: theme.colors.textPrimary },
                ]}
                keyboardType="numeric"
                returnKeyType="done"
              />
            </AdaptiveGlassView>

            <AdaptiveGlassView
              style={[
                styles.amountInputContainer,
                { borderColor: theme.colors.border },
              ]}
            >
              <BottomSheetTextInput
                value={filters.maxAmount}
                onChangeText={(value) => handleOptionSelect('maxAmount', value)}
                placeholder="To"
                placeholderTextColor={theme.colors.textMuted}
                style={[
                  styles.amountInput,
                  { color: theme.colors.textPrimary },
                ]}
                keyboardType="numeric"
                returnKeyType="done"
              />
            </AdaptiveGlassView>
          </View>
        </FilterSection>
      </View>
      <View
        style={[
          styles.actionsContainer,
          {
            borderColor: theme.colors.borderMuted,
          },
        ]}
      >
        <Pressable
          onPress={handleReset}
          style={({ pressed }) => [
            styles.resetButton,
            { borderColor: theme.colors.border },
            pressed && styles.pressedOpacity,
          ]}
        >
          <Text style={[styles.resetText, { color: theme.colors.textSecondary }]}>
            Reset All
          </Text>
        </Pressable>

        <Pressable
          onPress={handleApply}
          style={({ pressed }) => [
            styles.confirmButton,
            { backgroundColor: theme.colors.primary },
            pressed && styles.pressedOpacity,
          ]}
        >
          <Text style={[styles.confirmText, { color: theme.colors.white }]}>
            Confirm
          </Text>
        </Pressable>
      </View>
    </CustomBottomSheet>
  );
});

FilterTransactionSheet.displayName = 'FilterTransactionSheet';

type FilterSectionProps = {
  title: string;
  themeColor: string;
  children: React.ReactNode;
};

const FilterSection: React.FC<FilterSectionProps> = ({
  title,
  themeColor,
  children,
}) => (
  <View style={styles.section}>
    <Text style={[styles.sectionTitle, { color: themeColor }]}>{title}</Text>
    {children}
  </View>
);

type FilterOptionRowProps = {
  options: FilterOption[];
  selectedId: string;
  onSelect: (value: string) => void;
  themeColors: ThemeColors;
  wrap?: boolean;
};

const FilterOptionRow: React.FC<FilterOptionRowProps> = ({
  options,
  selectedId,
  onSelect,
  themeColors,
  wrap = false,
}) => (
  <View
    style={[
      styles.optionRow,
      wrap && styles.optionRowWrap,
    ]}
  >
    {options.map((option) => {
      const isActive = option.id === selectedId;
      return (
        <Pressable
          key={option.id}
          onPress={() => onSelect(option.id)}
          style={({ pressed }) => [
            styles.optionPill,
            {
              backgroundColor: isActive
                ? themeColors.primary
                : 'rgba(255,255,255,0.04)',
              borderColor: isActive
                ? themeColors.primary
                : themeColors.border,
            },
            pressed && styles.pressedOpacity,
          ]}
        >
          <Text
            style={[
              styles.optionLabel,
              {
                color: isActive
                  ? themeColors.white
                  : themeColors.textSecondary,
              },
            ]}
          >
            {option.label}
          </Text>
        </Pressable>
      );
    })}
  </View>
);

const styles = StyleSheet.create({
  sheetBackground: {
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    borderWidth: 1,
  },
  handleIndicator: {
    width: 42,
    height: 4,
    borderRadius: 10,
    opacity: 0.65,
  },
  contentContainer: {
  },
  innerContent: {
    gap: 24,
  },
  sheetTitle: {
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: 0.2,
  },
  section: {
    gap: 12,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  optionRow: {
    flexDirection: 'row',
    gap: 10,
  },
  optionRowWrap: {
    flexWrap: 'wrap',
  },
  optionPill: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 14,
    borderWidth: 1,
  },
  optionLabel: {
    fontSize: 13,
    fontWeight: '600',
  },
  amountRow: {
    flexDirection: 'row',
    gap: 12,
  },
  amountInputContainer: {
    flex: 1,
    borderRadius: 14,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  amountInput: {
    fontSize: 14,
    paddingVertical: 8,
  },
  actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    gap: 14,
    borderTopWidth: 1,
  },
  resetButton: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  resetText: {
    fontSize: 14,
    fontWeight: '600',
  },
  confirmButton: {
    flex: 1,
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  confirmText: {
    fontSize: 14,
    fontWeight: '700',
  },
  pressedOpacity: {
    opacity: 0.85,
  },
});

export default FilterTransactionSheet;
