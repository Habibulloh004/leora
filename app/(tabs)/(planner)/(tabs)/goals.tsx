// app/(tabs)/(planner)/(tabs)/goals.tsx
import React, { useCallback, useMemo } from 'react';
import { SectionList, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';

import { AdaptiveGlassView } from '@/components/ui/AdaptiveGlassView';
import GoalCard from '@/components/planner/goals/GoalCard';
import { createThemedStyles } from '@/constants/theme';
import { GOAL_SECTIONS, type Goal, type GoalSection } from '@/features/planner/goals/data';

const GoalsPage: React.FC = () => {
  const styles = useStyles();
  const router = useRouter();

  const sections = useMemo(() => GOAL_SECTIONS, []);

  const renderSectionHeader = useCallback(
    ({ section }: { section: GoalSection }) => (
      <View style={styles.sectionHeaderContainer}>
        <View style={styles.sectionHeader}>
          <View>
            <Text style={styles.sectionTitle}>{section.title}</Text>
            <Text style={styles.sectionSubtitle}>{section.subtitle}</Text>
          </View>
        </View>
        <View style={styles.sectionDivider} />
      </View>
    ),
    [styles],
  );

  const handleOpenGoal = useCallback(
    (goalId: string) => {
      router.push({ pathname: '/(modals)/goal-details', params: { goalId } });
    },
    [router],
  );

  const renderItem = useCallback(
    ({ item }: { item: Goal }) => (
      <GoalCard
        goal={item}
        onPress={() => handleOpenGoal(item.id)}
        onAddValue={() => router.push('/(modals)/add-goal')}
        onRefresh={() => {}}
        onEdit={() => router.push('/(modals)/add-goal')}
      />
    ),
    [handleOpenGoal, router],
  );

  return (
    <View style={styles.screen}>
      <SectionList
        sections={sections}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        stickySectionHeadersEnabled
        renderSectionHeader={renderSectionHeader}
        renderItem={renderItem}
        ListHeaderComponent={
          <View style={styles.pageHeader}>
            <View>
              <Text style={styles.pageTitle}>Strategic goals</Text>
              <Text style={styles.pageSubtitle}>Forward momentum for financial and personal wins</Text>
            </View>
          </View>
        }
        ListEmptyComponent={
          <View style={styles.emptyStateWrapper}>
            <AdaptiveGlassView style={styles.emptyStateCard}>
              <Text style={styles.emptyTitle}>Create your first goal</Text>
              <Text style={styles.emptySubtitle}>
                Track milestones, projections, and AI-backed insights once you add your first objective. Use the
                universal add button to get started.
              </Text>
            </AdaptiveGlassView>
          </View>
        }
      />
    </View>
  );
};

const useStyles = createThemedStyles((theme) => ({
  screen: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 80,
    gap: 18,
  },
  pageHeader: {
    paddingTop: 20,
    paddingBottom: 12,
    gap: 18,
  },
  pageTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: theme.colors.textPrimary,
    letterSpacing: 0.4,
  },
  pageSubtitle: {
    marginTop: 6,
    fontSize: 14,
    color: theme.colors.textSecondary,
    fontWeight: '600',
  },
  sectionHeaderContainer: {
    paddingTop: 12,
    paddingBottom: 8,
    backgroundColor: theme.colors.background,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: theme.colors.textPrimary,
    letterSpacing: 0.3,
  },
  sectionSubtitle: {
    marginTop: 4,
    fontSize: 13,
    fontWeight: '500',
    color: theme.colors.textMuted,
  },
  sectionDivider: {
    marginTop: 12,
    height: StyleSheet.hairlineWidth,
    backgroundColor: theme.colors.border,
  },
  emptyStateWrapper: {
    paddingVertical: 40,
  },
  emptyStateCard: {
    borderRadius: 20,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: theme.colors.border,
    padding: 24,
    gap: 14,
    backgroundColor: theme.colors.card,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: theme.colors.textPrimary,
  },
  emptySubtitle: {
    fontSize: 14,
    fontWeight: '500',
    color: theme.colors.textMuted,
    lineHeight: 20,
  },
}));

export default GoalsPage;
