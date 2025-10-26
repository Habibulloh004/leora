import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withTiming,
} from 'react-native-reanimated';
import {
  BellRing,
  CalendarDays,
  CalendarRange,
  Check,
  CircleAlert,
  HandCoins,
  Plus,
  UserRound,
} from 'lucide-react-native';
import { BottomSheetTextInput } from '@gorhom/bottom-sheet';

import CustomBottomSheet, {
  BottomSheetHandle,
} from '@/components/modals/BottomSheet';
import { AdaptiveGlassView } from '@/components/ui/AdaptiveGlassView';
import { useAppTheme } from '@/constants/theme';

type DebtCardProps = {
  name: string;
  description: string;
  amount: number | string;
  currency?: string;
  period: string;
  isIncoming: boolean;
  secondaryAmount?: string;
  onNotify?: () => void;
  onCancel?: () => void;
  onPlan?: () => void;
  onPayPartly?: () => void;
};

type DebtSectionProps = {
  title: string;
  data: DebtCardProps[];
};

type AddDebtPayload = {
  name: string;
  description: string;
  amount: number;
  currency: string;
  period: string;
  isIncoming: boolean;
};

type AddDebtModalProps = {
  onSubmit: (payload: AddDebtPayload) => void;
};

export type AddDebtModalHandle = {
  open: () => void;
  close: () => void;
};

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);
type LucideIcon = (props: { size?: number; color?: string }) => JSX.Element;

type DebtActionButtonProps = {
  label: string;
  Icon: LucideIcon;
  onPress?: () => void;
};

const DebtActionButton: React.FC<DebtActionButtonProps> = ({ label, Icon, onPress }) => {
  const theme = useAppTheme();
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: scale.value,
  }));

  const handlePressIn = () => {
    scale.value = withTiming(0.96, { duration: 120, easing: Easing.linear });
  };

  const handlePressOut = () => {
    scale.value = withTiming(1, { duration: 160, easing: Easing.linear });
  };

  return (
    <AnimatedPressable
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={[styles.actionPressable, animatedStyle]}
    >
      <AdaptiveGlassView
        style={[
          styles.actionButton,
          {
            borderColor: theme.colors.borderMuted,
            backgroundColor: theme.mode === 'dark'
              ? 'rgba(255,255,255,0.08)'
              : 'rgba(20,20,30,0.06)',
          },
        ]}
      >
        <Icon size={15} color={theme.colors.textSecondary} />
        <Text style={[styles.actionLabel, { color: theme.colors.textSecondary }]}>
          {label}
        </Text>
      </AdaptiveGlassView>
    </AnimatedPressable>
  );
};

const formatAmount = (amount: number, currency: string) =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(amount);

const DebtCard: React.FC<DebtCardProps & { index: number }> = ({
  name,
  description,
  amount,
  currency = 'UZS',
  period,
  isIncoming,
  secondaryAmount,
  onNotify,
  onCancel,
  onPlan,
  onPayPartly,
  index,
}) => {
  const theme = useAppTheme();
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(12);

  useEffect(() => {
    opacity.value = withDelay(
      index * 60,
      withTiming(1, { duration: 260, easing: Easing.linear }),
    );
    translateY.value = withDelay(
      index * 60,
      withTiming(0, { duration: 260, easing: Easing.linear }),
    );
  }, [index, opacity, translateY]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }],
  }));

  const numericAmount = typeof amount === 'number' ? amount : Number(amount);
  const formattedAmount =
    typeof amount === 'number'
      ? formatAmount(amount, currency)
      : amount;
  const amountPrefix = isIncoming ? '+' : '−';
  const amountColor = isIncoming ? theme.colors.success : theme.colors.danger;
  const defaultSecondary =
    Number.isFinite(numericAmount) && currency
      ? `(${new Intl.NumberFormat('en-US', {
          notation: 'compact',
          compactDisplay: 'short',
          maximumFractionDigits: 1,
        }).format(numericAmount)} ${currency})`
      : undefined;

  const buttons = isIncoming
    ? [
        { label: 'Notify', icon: BellRing, onPress: onNotify },
        { label: 'Cancel debt', icon: CircleAlert, onPress: onCancel },
      ]
    : [
        { label: 'Plan', icon: CalendarRange, onPress: onPlan },
        { label: 'Pay partly', icon: HandCoins, onPress: onPayPartly },
      ];

  return (
    <Animated.View style={[styles.cardAnimated, animatedStyle]}>
      <AdaptiveGlassView
        style={[
          styles.cardContainer,
          {
            borderColor: theme.colors.borderMuted,
            backgroundColor:
              theme.mode === 'dark'
                ? 'rgba(44,44,52,0.65)'
                : 'rgba(255,255,255,0.75)',
          },
        ]}
      >
        <View style={styles.cardHeader}>
          <View style={styles.cardInfo}>
            <AdaptiveGlassView
              style={[
                styles.avatar,
                {
                  borderColor: theme.colors.borderMuted,
                  backgroundColor: theme.mode === 'dark'
                    ? 'rgba(84,84,96,0.28)'
                    : 'rgba(224,224,236,0.24)',
                },
              ]}
            >
              <UserRound size={18} color={theme.colors.textSecondary} />
            </AdaptiveGlassView>
            <View style={styles.titleBlock}>
              <Text style={[styles.cardTitle, { color: theme.colors.textPrimary }]}>
                {name}
              </Text>
              <Text
                style={[styles.cardSubtitle, { color: theme.colors.textMuted }]}
                numberOfLines={1}
              >
                {description}
              </Text>
            </View>
          </View>

          <View style={styles.amountBlock}>
            <Text style={[styles.amountText, { color: amountColor }]}>
              {amountPrefix} {formattedAmount.replace('-', '').replace('+', '')}
            </Text>
            {secondaryAmount ?? defaultSecondary ? (
              <Text style={[styles.secondaryAmount, { color: theme.colors.textSecondary }]}>
                {secondaryAmount ?? defaultSecondary}
              </Text>
            ) : null}
          </View>
        </View>

        <View style={styles.periodRow}>
          <AdaptiveGlassView
            style={[
              styles.periodBadge,
              {
                borderColor: theme.colors.border,
                backgroundColor: theme.mode === 'dark'
                  ? 'rgba(110,110,120,0.18)'
                  : 'rgba(200,200,210,0.18)',
              },
            ]}
          >
            <CalendarDays size={16} color={theme.colors.textSecondary} />
            <Text style={[styles.periodText, { color: theme.colors.textSecondary }]}>
              {period}
            </Text>
          </AdaptiveGlassView>
        </View>

        <View style={styles.actionsRow}>
        {buttons.map(({ label, icon, onPress }, idx) => (
          <DebtActionButton key={`${label}-${idx}`} label={label} Icon={icon} onPress={onPress} />
        ))}
      </View>
    </AdaptiveGlassView>
  </Animated.View>
  );
};

const DebtSection: React.FC<DebtSectionProps> = ({ title, data }) => {
  const theme = useAppTheme();
  return (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Text style={[styles.sectionTitle, { color: theme.colors.textSecondary }]}>
          {title}
        </Text>
        <View style={[styles.sectionDivider, { backgroundColor: theme.colors.borderMuted }]} />
      </View>

      <View style={styles.sectionBody}>
        {data.map((item, index) => (
          <DebtCard key={`${item.name}-${index}`} index={index} {...item} />
        ))}
      </View>
    </View>
  );
};

const AddDebtModal = React.forwardRef<AddDebtModalHandle, AddDebtModalProps>(
  ({ onSubmit }, ref) => {
    const theme = useAppTheme();
    const sheetRef = useRef<BottomSheetHandle>(null);

    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [amount, setAmount] = useState('');
    const [currency, setCurrency] = useState('UZS');
    const [period, setPeriod] = useState('');
    const [isIncoming, setIsIncoming] = useState(true);

    const resetForm = useCallback(() => {
      setName('');
      setDescription('');
      setAmount('');
      setCurrency('UZS');
      setPeriod('');
      setIsIncoming(true);
    }, []);

    React.useImperativeHandle(
      ref,
      () => ({
        open: () => {
          resetForm();
          sheetRef.current?.present();
        },
        close: () => sheetRef.current?.dismiss(),
      }),
      [resetForm],
    );

    const snapPoints = useMemo<(string | number)[]>(() => ['35%', '70%'], []);
    const animationConfigs = useMemo(
      () => ({
        duration: 340,
        easing: Easing.linear,
      }),
      [],
    );

    const handleSubmit = useCallback(() => {
      const parsedAmount = Number(
        amount.replace(/[^0-9.-]+/g, '').trim() || '0',
      );

      const payload: AddDebtPayload = {
        name: name.trim(),
        description: description.trim(),
        amount: Number.isFinite(parsedAmount) ? parsedAmount : 0,
        currency: currency.trim() || 'UZS',
        period: period.trim() || 'No period',
        isIncoming,
      };

      onSubmit(payload);
      sheetRef.current?.dismiss();
      resetForm();
    }, [amount, currency, isIncoming, name, onSubmit, period, resetForm]);

    return (
      <CustomBottomSheet
        ref={sheetRef}
        snapPoints={snapPoints}
        animationConfigs={animationConfigs}
        enableDynamicSizing={false}
        backgroundStyle={{
          backgroundColor:
            theme.mode === 'dark'
              ? 'rgba(20,20,24,0.92)'
              : 'rgba(240,240,246,0.92)',
        }}
        handleIndicatorStyle={{ backgroundColor: theme.colors.textMuted }}
      >
        <View style={[styles.modalContent, { gap: 16 }]}>
          <Text style={[styles.modalTitle, { color: theme.colors.textPrimary }]}>
            Add new debt
          </Text>

          <View style={styles.modalRow}>
            <BottomSheetTextInput
              placeholder="Name"
              placeholderTextColor={theme.colors.textMuted}
              value={name}
              onChangeText={setName}
              style={[
                styles.modalInput,
                {
                  color: theme.colors.textPrimary,
                  borderColor: theme.colors.border,
                  backgroundColor: theme.mode === 'dark'
                    ? 'rgba(255,255,255,0.04)'
                    : 'rgba(0,0,0,0.04)',
                },
              ]}
            />
          </View>

          <BottomSheetTextInput
            placeholder="Description"
            placeholderTextColor={theme.colors.textMuted}
            value={description}
            onChangeText={setDescription}
            style={[
              styles.modalInput,
              {
                color: theme.colors.textPrimary,
                borderColor: theme.colors.border,
                backgroundColor: theme.mode === 'dark'
                  ? 'rgba(255,255,255,0.04)'
                  : 'rgba(0,0,0,0.04)',
              },
            ]}
          />

          <View style={styles.modalInputsRow}>
            <BottomSheetTextInput
              placeholder="Amount"
              keyboardType="numeric"
              placeholderTextColor={theme.colors.textMuted}
              value={amount}
              onChangeText={setAmount}
              style={[
                styles.modalInput,
                styles.modalInputHalf,
                {
                  color: theme.colors.textPrimary,
                  borderColor: theme.colors.border,
                  backgroundColor: theme.mode === 'dark'
                    ? 'rgba(255,255,255,0.04)'
                    : 'rgba(0,0,0,0.04)',
                },
              ]}
            />

            <BottomSheetTextInput
              placeholder="Currency"
              placeholderTextColor={theme.colors.textMuted}
              value={currency}
              onChangeText={setCurrency}
              style={[
                styles.modalInput,
                styles.modalInputHalf,
                {
                  color: theme.colors.textPrimary,
                  borderColor: theme.colors.border,
                  backgroundColor: theme.mode === 'dark'
                    ? 'rgba(255,255,255,0.04)'
                    : 'rgba(0,0,0,0.04)',
                },
              ]}
            />
          </View>

          <BottomSheetTextInput
            placeholder="Due date / Period"
            placeholderTextColor={theme.colors.textMuted}
            value={period}
            onChangeText={setPeriod}
            style={[
              styles.modalInput,
              {
                color: theme.colors.textPrimary,
                borderColor: theme.colors.border,
                backgroundColor: theme.mode === 'dark'
                  ? 'rgba(255,255,255,0.04)'
                  : 'rgba(0,0,0,0.04)',
              },
            ]}
          />

          <View style={styles.switchRow}>
            <AdaptiveGlassView
              style={[
                styles.togglePill,
                {
                  borderColor: theme.colors.borderMuted,
                  backgroundColor: theme.mode === 'dark'
                    ? 'rgba(255,255,255,0.04)'
                    : 'rgba(0,0,0,0.04)',
                },
              ]}
            >
              <Pressable
                style={[
                  styles.toggleOption,
                  isIncoming && {
                    backgroundColor: theme.colors.success,
                  },
                ]}
                onPress={() => setIsIncoming(true)}
              >
                <Text
                  style={[
                    styles.toggleLabel,
                    {
                      color: isIncoming ? theme.colors.onSuccess : theme.colors.textSecondary,
                    },
                  ]}
                >
                  They owe me
                </Text>
              </Pressable>
              <Pressable
                style={[
                  styles.toggleOption,
                  !isIncoming && {
                    backgroundColor: theme.colors.danger,
                  },
                ]}
                onPress={() => setIsIncoming(false)}
              >
                <Text
                  style={[
                    styles.toggleLabel,
                    {
                      color: !isIncoming ? theme.colors.onDanger : theme.colors.textSecondary,
                    },
                  ]}
                >
                  I owe
                </Text>
              </Pressable>
            </AdaptiveGlassView>
          </View>

          <View style={styles.modalActions}>
            <Pressable
              onPress={() => sheetRef.current?.dismiss()}
              style={[
                styles.modalSecondaryButton,
                {
                  borderColor: theme.colors.border,
                  backgroundColor: theme.mode === 'dark'
                    ? 'rgba(255,255,255,0.05)'
                    : 'rgba(0,0,0,0.04)',
                },
              ]}
            >
              <Text style={[styles.modalSecondaryLabel, { color: theme.colors.textSecondary }]}>
                Cancel
              </Text>
            </Pressable>
            <Pressable
              onPress={handleSubmit}
              style={[
                styles.modalPrimaryButton,
                { backgroundColor: theme.colors.primary },
              ]}
            >
              <Text style={[styles.modalPrimaryLabel, { color: theme.colors.onPrimary }]}>
                Add
              </Text>
            </Pressable>
          </View>
        </View>
      </CustomBottomSheet>
    );
  },
);

const AddDebtFab: React.FC<{ onPress: () => void }> = ({ onPress }) => {
  const theme = useAppTheme();
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: scale.value,
  }));

  const handlePressIn = () => {
    scale.value = withTiming(0.94, { duration: 120, easing: Easing.linear });
  };

  const handlePressOut = () => {
    scale.value = withTiming(1, { duration: 180, easing: Easing.linear });
  };

  return (
    <AnimatedPressable
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={[styles.fabContainer, animatedStyle]}
    >
      <AdaptiveGlassView
        style={[
          styles.fabInner,
          {
            borderColor: theme.colors.borderMuted,
            backgroundColor: theme.mode === 'dark'
              ? 'rgba(60,60,72,0.75)'
              : 'rgba(255,255,255,0.85)',
          },
        ]}
      >
        <Plus size={22} color={theme.colors.primary} />
        <Text style={[styles.fabLabel, { color: theme.colors.textSecondary }]}>
          ADD DEBT
        </Text>
      </AdaptiveGlassView>
    </AnimatedPressable>
  );
};

const initialIncomingDebts: DebtCardProps[] = [
  {
    name: 'Bekzod',
    description: 'Took for repairment',
    amount: 1_700_000,
    currency: 'UZS',
    period: 'Gives back in 2 days',
    isIncoming: true,
    onNotify: () => {},
    onCancel: () => {},
  },
  {
    name: 'Malika',
    description: 'Birthday gift',
    amount: 540_000,
    currency: 'UZS',
    period: 'Gives back in 5 days',
    isIncoming: true,
    onNotify: () => {},
    onCancel: () => {},
  },
];

const initialOutgoingDebts: DebtCardProps[] = [
  {
    name: 'Apple Card',
    description: 'MacBook Pro Installment',
    amount: 2_300_000,
    currency: 'UZS',
    period: 'Pay in 3 days',
    isIncoming: false,
    onPlan: () => {},
    onPayPartly: () => {},
  },
  {
    name: 'Farruh',
    description: 'Car service',
    amount: 780_000,
    currency: 'UZS',
    period: 'No period',
    isIncoming: false,
    onPlan: () => {},
    onPayPartly: () => {},
  },
];

const DebtsScreen: React.FC = () => {
  const theme = useAppTheme();
  const { height } = useWindowDimensions();
  const modalRef = useRef<AddDebtModalHandle>(null);

  const [incomingDebts, setIncomingDebts] = useState(initialIncomingDebts);
  const [outgoingDebts, setOutgoingDebts] = useState(initialOutgoingDebts);

  const handleAddDebt = useCallback(
    (payload: AddDebtPayload) => {
      const card: DebtCardProps = {
        name: payload.name || 'Unknown',
        description: payload.description || 'No description',
        amount: payload.amount,
        currency: payload.currency,
        period: payload.period,
        isIncoming: payload.isIncoming,
      };

      if (payload.isIncoming) {
        setIncomingDebts((prev) => [card, ...prev]);
      } else {
        setOutgoingDebts((prev) => [card, ...prev]);
      }
    },
    [],
  );

  const openModal = useCallback(() => {
    modalRef.current?.open();
  }, []);

  return (
    <>
      <ScrollView
        style={[styles.screen, { backgroundColor: theme.colors.background }]}
        contentContainerStyle={[
          styles.content,
          { paddingBottom: Math.max(60, height * 0.12) },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <DebtSection title="Debts" data={incomingDebts} />
        <DebtSection title="My debts" data={outgoingDebts} />
      </ScrollView>

      <View pointerEvents="box-none" style={styles.fabWrapper}>
        <AddDebtFab onPress={openModal} />
      </View>

      <AddDebtModal ref={modalRef} onSubmit={handleAddDebt} />
    </>
  );
};

export default DebtsScreen;

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 28,
    gap: 28,
  },
  section: {
    gap: 16,
  },
  sectionHeader: {
    gap: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: -0.1,
  },
  sectionDivider: {
    height: StyleSheet.hairlineWidth,
    width: '100%',
    opacity: 0.6,
  },
  sectionBody: {
    gap: 18,
  },
  cardAnimated: {
    width: '100%',
  },
  cardContainer: {
    borderRadius: 24,
    borderWidth: 1,
    paddingHorizontal: 18,
    paddingVertical: 18,
    gap: 18,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 14,
  },
  cardInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 14,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  titleBlock: {
    flex: 1,
    gap: 4,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  cardSubtitle: {
    fontSize: 13,
    fontWeight: '500',
  },
  amountBlock: {
    alignItems: 'flex-end',
    gap: 4,
  },
  amountText: {
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  secondaryAmount: {
    fontSize: 12,
    fontWeight: '500',
  },
  periodRow: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
  },
  periodBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
    borderWidth: 1,
  },
  periodText: {
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.4,
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  actionPressable: {
    flex: 1,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    borderRadius: 14,
    borderWidth: 1,
  },
  actionLabel: {
    fontSize: 13,
    fontWeight: '600',
  },
  modalContent: {
    paddingHorizontal: 20,
    paddingBottom: 28,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: -0.1,
  },
  modalRow: {
    width: '100%',
  },
  modalInput: {
    borderWidth: 1,
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 15,
  },
  modalInputsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  modalInputHalf: {
    flex: 1,
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  togglePill: {
    flexDirection: 'row',
    borderRadius: 18,
    borderWidth: 1,
    overflow: 'hidden',
  },
  toggleOption: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  toggleLabel: {
    fontSize: 13,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
  },
  modalPrimaryButton: {
    flex: 1,
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalPrimaryLabel: {
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  modalSecondaryButton: {
    flex: 1,
    borderRadius: 16,
    borderWidth: 1,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalSecondaryLabel: {
    fontSize: 15,
    fontWeight: '600',
  },
  fabWrapper: {
    position: 'absolute',
    bottom: 36,
    right: 20,
    left: 20,
    alignItems: 'flex-end',
    pointerEvents: 'box-none',
  },
  fabContainer: {
    alignItems: 'flex-end',
  },
  fabInner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderWidth: 1,
    borderRadius: 22,
  },
  fabLabel: {
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 0.6,
  },
});
