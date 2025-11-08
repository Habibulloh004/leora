import React, { useEffect, useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { RectButton } from 'react-native-gesture-handler';
import Animated, {
  useAnimatedProps,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { AlertCircle, Check } from 'lucide-react-native';
import { Defs, LinearGradient, Rect, Stop, Svg } from 'react-native-svg';

import { AdaptiveGlassView } from '@/components/ui/AdaptiveGlassView';
import { useAppTheme } from '@/constants/theme';
import { useSelectedDayStore } from '@/stores/selectedDayStore';
import { startOfDay } from '@/utils/calendar';

type BudgetState = 'exceeding' | 'within' | 'fixed';

type CategoryBudget = {
  id: string;
  name: string;
  spent: number;
  limit: number;
  state: BudgetState;
};

type MainBudget = {
  current: number;
  total: number;
  currency: string;
};

const AnimatedRect = Animated.createAnimatedComponent(Rect);

const MAIN_BUDGET: MainBudget = {
  current: 487_000,
  total: 780_000,
  currency: 'UZS',
};

const CATEGORY_BUDGETS: CategoryBudget[] = [
  { id: 'food', name: 'Food', spent: 340_000, limit: 300_000, state: 'exceeding' },
  { id: 'transport', name: 'Transport', spent: 180_000, limit: 250_000, state: 'within' },
  { id: 'living', name: 'Living', spent: 150_000, limit: 150_000, state: 'fixed' },
];

const PROGRESS_HEIGHT = 32;
const PROGRESS_RADIUS = 18;

const formatCurrency = (value: number, currency: string) =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(value);

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
  gradientStops: string[];
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
  const gradientId = useMemo(() => `progress-${Math.random().toString(36).slice(2, 8)}`, []);

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

  const animatedProps = useAnimatedProps(() => ({
    width: widthValue.value,
  }));

  const gradientStops = appearance.gradientStops;
  const gradientDenominator = Math.max(gradientStops.length - 1, 1);
  const iconColor = appearance.textColor;

  const overlayStyle = useAnimatedStyle(() => ({
    width: widthValue.value,
  }));

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
        {trackWidth > 0 ? (
          <Svg
            width={trackWidth}
            height={PROGRESS_HEIGHT}
            style={StyleSheet.absoluteFillObject}
          >
            <Defs>
              <LinearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="0%">
                {gradientStops.map((color, index) => (
                  <Stop
                    key={`${color}-${index}`}
                    offset={`${(index / gradientDenominator) * 100}%`}
                    stopColor={color}
                  />
                ))}
              </LinearGradient>
            </Defs>
            <Rect
              x={0}
              y={0}
              rx={PROGRESS_RADIUS}
              ry={PROGRESS_RADIUS}
              width={trackWidth}
              height={PROGRESS_HEIGHT}
              fill={applyAlpha(theme.colors.backgroundMuted, theme.mode === 'dark' ? 0.38 : 1)}
            />
            <AnimatedRect
              animatedProps={animatedProps}
              x={0}
              y={0}
              rx={PROGRESS_RADIUS}
              ry={PROGRESS_RADIUS}
              height={PROGRESS_HEIGHT}
              fill={`url(#${gradientId})`}
            />
          </Svg>
        ) : null}

        <Animated.View style={[styles.progressOverlay, overlayStyle]} pointerEvents="none">
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
        </Animated.View>
      </AdaptiveGlassView>
    </View>
  );
};

const buildProgressAppearance = (
  theme: ReturnType<typeof useAppTheme>,
  state: BudgetState,
): ProgressAppearance => {
  const neutralStops =
    theme.mode === 'dark'
      ? [
          applyAlpha(theme.colors.white, 0.25),
          applyAlpha(theme.colors.textSecondary, 0.6),
          applyAlpha(theme.colors.background, 0.85),
        ]
      : [
          applyAlpha(theme.colors.textSecondary, 0.18),
          applyAlpha(theme.colors.textSecondary, 0.35),
          applyAlpha(theme.colors.backgroundMuted, 0.45),
        ];

  switch (state) {
    case 'exceeding':
      return {
        gradientStops: [...theme.gradients.danger],
        label: 'Exceeding',
        icon: 'alert',
        textColor: theme.mode === 'dark' ? theme.colors.white : theme.colors.onDanger,
      };
    case 'fixed':
      return {
        gradientStops: [...theme.gradients.success],
        label: 'Fixed',
        icon: 'check',
        textColor: theme.mode === 'dark' ? theme.colors.white : theme.colors.onSuccess,
      };
    default:
      return {
        gradientStops: neutralStops,
        label: 'Within',
        icon: 'check',
        textColor: theme.mode === 'dark' ? theme.colors.white : theme.colors.textPrimary,
      };
  }
};

const MainBudgetProgress: React.FC<{ budget: MainBudget }> = ({ budget }) => {
  const theme = useAppTheme();
  const percentage =
    budget.total === 0 ? 0 : Math.min((budget.current / budget.total) * 100, 125);
  const appearance = useMemo(() => buildProgressAppearance(theme, 'within'), [theme]);

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
}

const CategoryBudgetCard: React.FC<CategoryBudgetCardProps> = ({ category, index, isLast }) => {
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
    () => buildProgressAppearance(theme, category.state),
    [category.state, theme],
  );

  return (
    <Animated.View style={[styles.categoryBlock, animatedStyle]}>
      <View style={styles.categoryHeaderRow}>
        <Text style={[styles.categoryTitle, { color: theme.colors.textSecondary }]}>
          {category.name}
        </Text>
        <RectButton
          style={styles.categoryActionButton}
          rippleColor={applyAlpha(theme.colors.textSecondary, 0.15)}
          onPress={() => {}}
        >
          <Text style={[styles.categoryAction, { color: theme.colors.textSecondary }]}>
            Set a limit
          </Text>
        </RectButton>
      </View>

      <View style={styles.categoryAmountsRow}>
        <Text style={[styles.categoryAmount, { color: theme.colors.textSecondary }]}>
          {formatCurrency(category.spent, MAIN_BUDGET.currency)}
        </Text>
        <Text style={[styles.categoryAmount, { color: theme.colors.textSecondary }]}>
          / {formatCurrency(category.limit, MAIN_BUDGET.currency)}
        </Text>
      </View>

      <AnimatedProgressBar percentage={progress} appearance={appearance} />

      {isLast ? null : (
        <View style={[styles.divider, { backgroundColor: applyAlpha(theme.colors.borderMuted, 0.5) }]} />
      )}
    </Animated.View>
  );
};

const BudgetsScreen: React.FC = () => {
  const theme = useAppTheme();
  const dividerColor = applyAlpha(theme.colors.borderMuted, theme.mode === 'dark' ? 0.4 : 0.6);
  const selectedDate = useSelectedDayStore((state) => state.selectedDate);
  const selectedDateLabel = useMemo(() => {
    const normalized = startOfDay(selectedDate ?? new Date());
    const today = startOfDay(new Date());
    if (normalized.getTime() === today.getTime()) {
      return 'Today\'s budget overview';
    }
    const formatted = new Intl.DateTimeFormat('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    }).format(normalized);
    return `Budget overview for ${formatted}`;
  }, [selectedDate]);

  return (
    <ScrollView
      style={[styles.screen, { backgroundColor: theme.colors.background }]}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <Text style={[styles.dateCaption, { color: theme.colors.textSecondary }]}>{selectedDateLabel}</Text>
      <Text style={[styles.sectionHeading, { color: theme.colors.textSecondary }]}>Main budget</Text>
      <View style={[styles.divider, { backgroundColor: dividerColor }]} />

      <MainBudgetProgress budget={MAIN_BUDGET} />

      <View style={styles.sectionHeaderRow}>
        <Text style={[styles.sectionHeading, { color: theme.colors.textSecondary }]}>
          Categories
        </Text>
        <RectButton
          style={[
            styles.addCategoryButton,
            { borderColor: applyAlpha(theme.colors.textSecondary, 0.35) },
          ]}
          rippleColor={applyAlpha(theme.colors.textSecondary, 0.15)}
          onPress={() => {}}
        >
          <Text style={[styles.addCategoryText, { color: theme.colors.textSecondary }]}>
            ADD CATEGORY
          </Text>
        </RectButton>
      </View>
      <View style={[styles.divider, { backgroundColor: dividerColor }]} />

      <View style={styles.categoriesList}>
        {CATEGORY_BUDGETS.map((category, index) => (
          <CategoryBudgetCard
            key={category.id}
            category={category}
            index={index}
            isLast={index === CATEGORY_BUDGETS.length - 1}
          />
        ))}
      </View>
    </ScrollView>
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
    paddingBottom: 40,
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
  progressOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
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
});
