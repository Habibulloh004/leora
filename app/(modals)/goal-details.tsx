// app/(modals)/goal-details.tsx
import React, { useEffect, useMemo } from 'react';
import { ScrollView, StyleSheet, Text, View, Pressable } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Lightbulb, X } from 'lucide-react-native';

import { AdaptiveGlassView } from '@/components/ui/AdaptiveGlassView';
import { useAppTheme } from '@/constants/theme';
import { createGoalSections } from '@/features/planner/goals/data';
import { useLocalization } from '@/localization/useLocalization';
import { usePlannerDomainStore } from '@/stores/usePlannerDomainStore';

export default function GoalDetailsModal() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const theme = useAppTheme();
  const params = useLocalSearchParams<{ goalId?: string }>();
  const { strings } = useLocalization();
  const goalStrings = strings.plannerScreens.goals;
  const domainGoals = usePlannerDomainStore((state) => state.goals);

  const goal = useMemo(() => {
    if (!params.goalId) return undefined;
    const sections = createGoalSections(goalStrings, domainGoals);
    for (const section of sections) {
      const match = section.data.find((item) => item.id === params.goalId);
      if (match) return match;
    }
    return undefined;
  }, [goalStrings, params.goalId]);

  useEffect(() => {
    if (!goal) {
      router.back();
    }
  }, [goal, router]);

  if (!goal) {
    return null;
  }

  const progressPercent = Math.round(goal.progress * 100);

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.colors.background }]} edges={['top', 'bottom']}>
      <View style={[styles.container, { paddingBottom: Math.max(insets.bottom, 16) }]}>
        <View style={styles.header}>
          <Text style={styles.title}>{goal.title}</Text>
          <Pressable onPress={() => router.back()} style={styles.closeButton} accessibilityRole="button">
            <X size={20} color="#E2E8F0" />
          </Pressable>
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false} bounces={false}>
          <View style={styles.badgeBlock}>
            <Text style={styles.badgeMain}>{progressPercent}%</Text>
            <Text style={styles.badgeSub}>
              {goal.currentAmount}
              <Text style={styles.badgeMuted}> / {goal.targetAmount}</Text>
            </Text>
          </View>

          <View style={styles.progressRow}>
            <View style={styles.progressTrack}>
              <View style={[styles.progressFill, { width: `${progressPercent}%` }]} />
            </View>
            <Text style={styles.progressLabel}>{progressPercent}%</Text>
          </View>

          <View style={styles.summary}>
            {goal.summary.map((row) => (
              <View key={row.label} style={styles.summaryRow}>
                <Text style={[styles.summaryLabel, { color: theme.colors.textSecondary }]}>{row.label}</Text>
                <Text style={styles.summaryValue}>{row.value}</Text>
              </View>
            ))}
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionHeading}>{goalStrings.details.milestones}</Text>
            <View style={styles.milestonesGrid}>
              {goal.milestones.map((item) => (
                <View key={`${goal.id}-milestone-${item.percent}`} style={styles.milestoneRow}>
                  <Text style={styles.milestonePercent}>{item.percent}%</Text>
                  <Text style={styles.milestoneLabel}>{item.label}</Text>
                </View>
              ))}
            </View>
          </View>

          <View style={styles.section}>
            <View style={styles.historyHeader}>
              <Text style={styles.sectionHeading}>{goalStrings.details.history}</Text>
              <Pressable style={styles.showMoreButton}>
                <Text style={styles.showMoreText}>{goalStrings.details.showMore}</Text>
              </Pressable>
            </View>
            <View style={styles.historyList}>
              {goal.history.map((entry) => (
                <View key={entry.id} style={styles.historyRow}>
                  <Text style={styles.historyLabel}>{entry.label}</Text>
                  <Text style={styles.historyDelta}>{entry.delta}</Text>
                </View>
              ))}
            </View>
          </View>

          <AdaptiveGlassView
            style={[
              styles.tipCard,
              {
                borderColor: 'rgba(255,255,255,0.08)',
                backgroundColor: 'rgba(255,255,255,0.05)',
              },
            ]}
          >
            <View style={styles.tipContent}>
              <Lightbulb size={18} color="#FACC15" />
              <Text style={styles.tipText}>
                {goal.aiTip}{' '}
                {goal.aiTipHighlight ? <Text style={styles.tipHighlight}>{goal.aiTipHighlight}</Text> : null}
              </Text>
            </View>
          </AdaptiveGlassView>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  title: {
    flex: 1,
    fontSize: 20,
    fontWeight: '700',
    color: '#F8FAFC',
    letterSpacing: 0.2,
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  scrollContent: {
    paddingBottom: 24,
    gap: 20,
  },
  badgeBlock: {
    alignItems: 'flex-start',
    gap: 4,
  },
  badgeMain: {
    fontSize: 36,
    fontWeight: '800',
    color: '#C7D2FE',
  },
  badgeSub: {
    fontSize: 14,
    fontWeight: '600',
    color: '#E0E7FF',
  },
  badgeMuted: {
    color: 'rgba(224,231,255,0.6)',
  },
  progressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  progressTrack: {
    flex: 1,
    height: 8,
    borderRadius: 6,
    backgroundColor: 'rgba(255,255,255,0.08)',
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 6,
    backgroundColor: '#8B5CF6',
  },
  progressLabel: {
    fontSize: 15,
    fontWeight: '700',
    color: '#F3F4F6',
  },
  summary: {
    gap: 12,
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
    color: 'rgba(226,232,240,0.72)',
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#F8FAFC',
    flexShrink: 1,
    textAlign: 'right',
  },
  section: {
    gap: 12,
  },
  sectionHeading: {
    fontSize: 15,
    fontWeight: '700',
    color: '#F3F4F6',
    letterSpacing: 0.3,
  },
  milestonesGrid: {
    gap: 10,
  },
  milestoneRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  milestonePercent: {
    fontSize: 13,
    fontWeight: '700',
    color: '#C7D2FE',
  },
  milestoneLabel: {
    fontSize: 13,
    fontWeight: '500',
    color: '#F3F4F6',
  },
  historyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  showMoreButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  showMoreText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#C7D2FE',
  },
  historyList: {
    gap: 10,
  },
  historyRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  historyLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#94A3B8',
  },
  historyDelta: {
    fontSize: 13,
    fontWeight: '600',
    color: '#FACC15',
  },
  tipCard: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
  },
  tipContent: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'flex-start',
  },
  tipText: {
    flex: 1,
    fontSize: 13,
    fontWeight: '500',
    lineHeight: 20,
    color: '#F1F5F9',
  },
  tipHighlight: {
    color: '#FACC15',
    fontWeight: '700',
  },
});
