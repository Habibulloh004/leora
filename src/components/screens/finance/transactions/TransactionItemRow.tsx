import React, { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withTiming,
} from 'react-native-reanimated';

import { useAppTheme } from '@/constants/theme';
import type { TransactionItemData } from './types';

type TransactionItemRowProps = {
  item: TransactionItemData;
  index: number;
  showDivider: boolean;
};

const formatAmount = (amount: number) =>
  `${amount > 0 ? '+' : amount < 0 ? '−' : ''}${new Intl.NumberFormat('en-US').format(Math.abs(amount))}`;

const TransactionItemRow: React.FC<TransactionItemRowProps> = ({
  item,
  index,
  showDivider,
}) => {
  const theme = useAppTheme();
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(10);

  useEffect(() => {
    const config = { duration: 220, easing: Easing.linear };
    opacity.value = withDelay(index * 60, withTiming(1, config));
    translateY.value = withDelay(index * 60, withTiming(0, config));
  }, [index, opacity, translateY]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }],
  }));

  const amountColor =
    item.type === 'income'
      ? theme.colors.success
      : item.type === 'outcome'
        ? theme.colors.danger
        : theme.colors.primary;

  return (
    <Animated.View style={[styles.row, animatedStyle]}>
      <View style={styles.rowLeft}>
        <Text style={[styles.category, { color: theme.colors.textPrimary }]} numberOfLines={1}>
          {item.category}
        </Text>
        <Text style={[styles.description, { color: theme.colors.textSecondary }]} numberOfLines={1}>
          {item.description}
        </Text>
      </View>

      <View style={styles.rowCenter}>
        <Text style={[styles.account, { color: theme.colors.textMuted }]} numberOfLines={1}>
          {item.account}
        </Text>
      </View>

      <View style={styles.rowRight}>
        <Text style={[styles.time, { color: theme.colors.textMuted }]}>{item.time}</Text>
        <Text style={[styles.amount, { color: amountColor }]}>{formatAmount(item.amount)} UZS</Text>
      </View>

      {showDivider && (
        <View
          style={[
            styles.divider,
            { backgroundColor: 'rgba(255,255,255,0.1)' },
          ]}
        />
      )}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 18,
    overflow: 'hidden',
    position: 'relative',
  },
  rowLeft: {
    flex: 1.2,
    gap: 4,
  },
  rowCenter: {
    flex: 0.9,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 12,
    minWidth: 120,
  },
  rowRight: {
    alignItems: 'flex-end',
    justifyContent: 'center',
    gap: 6,
  },
  category: {
    fontSize: 15,
    fontWeight: '600',
  },
  description: {
    fontSize: 13,
  },
  account: {
    fontSize: 13,
    textAlign: 'center',
  },
  time: {
    fontSize: 12,
    letterSpacing: 0.2,
  },
  amount: {
    fontSize: 16,
    fontWeight: '600',
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    position: 'absolute',
    left: 16,
    right: 16,
    bottom: 0,
  },
});

export default TransactionItemRow;
