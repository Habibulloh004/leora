// src/components/planner/goals/GoalCard.tsx
import React, { memo, useCallback, useMemo } from 'react';
import { GestureResponderEvent, Pressable, StyleSheet, Text, View } from 'react-native';
import { Pencil, Plus, RefreshCcw } from 'lucide-react-native';

import { AdaptiveGlassView } from '@/components/ui/AdaptiveGlassView';
import { useAppTheme } from '@/constants/theme';
import type { Goal } from '@/features/planner/goals/data';

type GoalCardProps = {
  goal: Goal;
  onPress: () => void;
  onAddValue?: () => void;
  onRefresh?: () => void;
  onEdit?: () => void;
};

const GoalCardComponent: React.FC<GoalCardProps> = ({ goal, onPress, onAddValue, onRefresh, onEdit }) => {
  const theme = useAppTheme();

  const intercept = useCallback(
    (handler?: () => void) => (event: GestureResponderEvent) => {
      event.stopPropagation();
      handler?.();
    },
    [],
  );

  const progressPercent = useMemo(() => Math.round(goal.progress * 100), [goal.progress]);

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.pressable,
        pressed && {
          transform: [{ scale: 0.995 }],
          opacity: 0.96,
        },
      ]}
      accessibilityRole="button"
      accessibilityLabel={goal.title}
      accessibilityHint="Open goal details"
    >
      <AdaptiveGlassView style={[styles.card, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
        <View style={styles.inner}>
          <View style={styles.header}>
            <Text style={[styles.title, { color: theme.colors.textPrimary }]} numberOfLines={2}>
              {goal.title}
            </Text>
            <View style={styles.badge}>
              <Text style={[styles.badgeMain, { color: theme.colors.white }]}>{progressPercent}%</Text>
              <Text style={[styles.badgeSub, { color: theme.colors.textSecondary }]}>
                {goal.currentAmount}
                <Text style={[styles.badgeMuted, { color: theme.colors.textTertiary }]}> / {goal.targetAmount}</Text>
              </Text>
            </View>
          </View>

          <View style={styles.progressRow}>
            <View style={[styles.progressTrack, { backgroundColor: theme.colors.surfaceMuted }]}>
              <View
                style={[
                  styles.progressFill,
                  {
                    width: `${progressPercent}%`,
                    backgroundColor: progressPercent >= 80 ? theme.colors.success : theme.colors.secondary,
                  },
                ]}
              />
            </View>
            <Text style={[styles.progressLabel, { color: theme.colors.textSecondary }]}>{progressPercent}%</Text>
          </View>

          <View style={styles.summary}>
            {goal.summary.slice(0, 3).map((row) => (
              <View key={row.label} style={styles.summaryRow}>
                <Text style={[styles.summaryLabel, { color: theme.colors.textSecondary }]}>{row.label}</Text>
                <Text style={[styles.summaryValue, { color: theme.colors.white }]} numberOfLines={1}>
                  {row.value}
                </Text>
              </View>
            ))}
          </View>

          <View style={styles.actionsRow}>
            <Pressable
              style={[
                styles.actionButton,
                {
                  backgroundColor: theme.colors.card,
                },
              ]}
              onPress={intercept(onAddValue)}
              accessibilityRole="button"
              accessibilityLabel="Add value"
            >
              <Plus size={16} color={theme.colors.iconText} />
              <Text style={[styles.actionLabel, { color: theme.colors.iconText }]}>Add value</Text>
            </Pressable>
            <Pressable
              style={[
                styles.actionButton,
                {
                  backgroundColor: theme.colors.card,
                },
              ]}
              onPress={intercept(onRefresh)}
              accessibilityRole="button"
              accessibilityLabel="Refresh goal"
            >
              <RefreshCcw size={16} color={theme.colors.iconText} />
              <Text style={[styles.actionLabel, { color: theme.colors.textSecondary }]}>Refresh</Text>
            </Pressable>
            <Pressable
              style={[
                styles.actionButton,
                {
                  backgroundColor: theme.colors.card,
                },
              ]}
              onPress={intercept(onEdit)}
              accessibilityRole="button"
              accessibilityLabel="Edit goal"
            >
              <Pencil size={16} color={theme.colors.iconText} />
              <Text style={[styles.actionLabel, { color: theme.colors.iconText }]}>Edit</Text>
            </Pressable>
          </View>
        </View>
      </AdaptiveGlassView>
    </Pressable>
  );
};

export const GoalCard = memo(GoalCardComponent);

const styles = StyleSheet.create({
  pressable: {
    width: '100%',
  },
  card: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 0,
    overflow: 'hidden',
    shadowOpacity: 0.4,
    shadowRadius: 22,
    shadowOffset: { width: 0, height: 10 },
  },
  inner: {
    padding: 20,
    gap: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  title: {
    flex: 1,
    fontSize: 17,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  badge: {
    alignItems: 'flex-end',
    gap: 4,
  },
  badgeMain: {
    fontSize: 22,
    fontWeight: '700',
  },
  badgeSub: {
    fontSize: 13,
    fontWeight: '600',
  },
  badgeMuted: {
    fontSize: 12,
    fontWeight: '600',
  },
  progressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  progressTrack: {
    flex: 1,
    height: 6,
    borderRadius: 6,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 6,
  },
  progressLabel: {
    fontSize: 13,
    fontWeight: '600',
  },
  summary: {
    gap: 8,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  summaryLabel: {
    fontSize: 13,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  summaryValue: {
    fontSize: 13,
    fontWeight: '600',
    flexShrink: 1,
    textAlign: 'right',
  },
  actionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flexWrap: 'wrap',
  },
  actionButton: {
    minHeight: 44,
    paddingHorizontal: 14,
    borderRadius: 12,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  actionLabel: {
    fontSize: 13,
    fontWeight: '600',
  },
});

export default GoalCard;
