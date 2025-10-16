// app/(tabs)/(finance)/(tabs)/goals.tsx
import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Plus, TrendingUp, Target, Calendar, DollarSign } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';

interface Goal {
  id: string;
  title: string;
  description: string;
  current: number;
  target: number;
  currency: string;
  deadline: string;
  category: 'savings' | 'investment' | 'purchase' | 'debt';
  color: string;
  monthlyContribution: number;
}

const MOCK_GOALS: Goal[] = [
  {
    id: '1',
    title: 'Buy a Car',
    description: 'Toyota Camry 2024',
    current: 4100000,
    target: 5000000,
    currency: 'UZS',
    deadline: 'March 2025',
    category: 'purchase',
    color: '#2196F3',
    monthlyContribution: 300000,
  },
  {
    id: '2',
    title: 'Emergency Fund',
    description: '6 months expenses',
    current: 2500,
    target: 10000,
    currency: 'USD',
    deadline: 'December 2025',
    category: 'savings',
    color: '#4CAF50',
    monthlyContribution: 500,
  },
  {
    id: '3',
    title: 'Vacation',
    description: 'Dubai trip',
    current: 800,
    target: 3000,
    currency: 'USD',
    deadline: 'July 2025',
    category: 'savings',
    color: '#FF9800',
    monthlyContribution: 400,
  },
];

const GoalsPage = () => {
  const [goals] = useState<Goal[]>(MOCK_GOALS);

  const formatCurrency = (amount: number, currency: string) => {
    if (currency === 'UZS') {
      return new Intl.NumberFormat('uz-UZ', {
        minimumFractionDigits: 0,
      }).format(amount) + ' сум';
    }
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
    }).format(amount);
  };

  const calculateProgress = (current: number, target: number) => {
    return Math.min(Math.round((current / target) * 100), 100);
  };

  const calculateRemaining = (current: number, target: number) => {
    return Math.max(target - current, 0);
  };

  const calculateMonthsRemaining = (current: number, target: number, monthly: number) => {
    const remaining = target - current;
    if (remaining <= 0) return 0;
    if (monthly <= 0) return Infinity;
    return Math.ceil(remaining / monthly);
  };

  const getTotalStats = () => {
    const totalTarget = goals.reduce((sum, goal) => {
      // Convert to USD for comparison (simple mock conversion)
      const amount = goal.currency === 'USD' ? goal.target : goal.target / 12650;
      return sum + amount;
    }, 0);

    const totalCurrent = goals.reduce((sum, goal) => {
      const amount = goal.currency === 'USD' ? goal.current : goal.current / 12650;
      return sum + amount;
    }, 0);

    const totalMonthly = goals.reduce((sum, goal) => {
      const amount = goal.currency === 'USD' ? goal.monthlyContribution : goal.monthlyContribution / 12650;
      return sum + amount;
    }, 0);

    return {
      totalTarget: Math.round(totalTarget),
      totalCurrent: Math.round(totalCurrent),
      totalMonthly: Math.round(totalMonthly),
      progress: Math.round((totalCurrent / totalTarget) * 100),
    };
  };

  const stats = getTotalStats();

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Summary Card */}
      <LinearGradient
        colors={['#0A0A0A', '#31313A']}
        style={styles.summaryCard}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.summaryHeader}>
          <Text style={styles.summaryLabel}>TOTAL GOALS PROGRESS</Text>
          <View style={styles.progressBadge}>
            <Text style={styles.progressBadgeText}>{stats.progress}%</Text>
          </View>
        </View>

        <View style={styles.summaryStats}>
          <View style={styles.summaryStatItem}>
            <Text style={styles.summaryStatLabel}>Saved</Text>
            <Text style={styles.summaryStatValue}>${stats.totalCurrent.toLocaleString()}</Text>
          </View>
          <View style={styles.summaryDivider} />
          <View style={styles.summaryStatItem}>
            <Text style={styles.summaryStatLabel}>Target</Text>
            <Text style={styles.summaryStatValue}>${stats.totalTarget.toLocaleString()}</Text>
          </View>
          <View style={styles.summaryDivider} />
          <View style={styles.summaryStatItem}>
            <Text style={styles.summaryStatLabel}>Monthly</Text>
            <Text style={styles.summaryStatValue}>${stats.totalMonthly.toLocaleString()}</Text>
          </View>
        </View>

        <View style={styles.summaryProgressBar}>
          <View style={[styles.summaryProgressFill, { width: `${stats.progress}%` }]} />
        </View>
      </LinearGradient>

      {/* Quick Stats */}
      <View style={styles.quickStats}>
        <View style={[styles.quickStatCard, { borderLeftColor: '#4CAF50' }]}>
          <Target size={20} color="#4CAF50" />
          <Text style={styles.quickStatValue}>{goals.length}</Text>
          <Text style={styles.quickStatLabel}>Active Goals</Text>
        </View>

        <View style={[styles.quickStatCard, { borderLeftColor: '#2196F3' }]}>
          <TrendingUp size={20} color="#2196F3" />
          <Text style={styles.quickStatValue}>
            {goals.filter(g => calculateProgress(g.current, g.target) >= 75).length}
          </Text>
          <Text style={styles.quickStatLabel}>Near Complete</Text>
        </View>
      </View>

      {/* Goals List */}
      <View style={styles.goalsSection}>
        <View style={styles.goalsSectionHeader}>
          <Text style={styles.goalsSectionTitle}>My Goals</Text>
          <Text style={styles.goalsSectionSubtitle}>
            {goals.length} active • Track your progress
          </Text>
        </View>

        {goals.map((goal) => {
          const progress = calculateProgress(goal.current, goal.target);
          const remaining = calculateRemaining(goal.current, goal.target);
          const monthsLeft = calculateMonthsRemaining(
            goal.current,
            goal.target,
            goal.monthlyContribution
          );

          return (
            <TouchableOpacity key={goal.id} style={styles.goalCard}>
              {/* Goal Header */}
              <View style={styles.goalHeader}>
                <View style={[styles.goalIconContainer, { backgroundColor: goal.color + '20' }]}>
                  <DollarSign size={24} color={goal.color} />
                </View>
                <View style={styles.goalHeaderInfo}>
                  <Text style={styles.goalTitle}>{goal.title}</Text>
                  <Text style={styles.goalDescription}>{goal.description}</Text>
                </View>
                <Text style={[styles.goalProgress, { color: goal.color }]}>{progress}%</Text>
              </View>

              {/* Progress Bar */}
              <View style={styles.goalProgressBar}>
                <View
                  style={[
                    styles.goalProgressFill,
                    { width: `${progress}%`, backgroundColor: goal.color },
                  ]}
                />
              </View>

              {/* Goal Details */}
              <View style={styles.goalDetails}>
                <View style={styles.goalDetailRow}>
                  <Text style={styles.goalDetailLabel}>Current</Text>
                  <Text style={styles.goalDetailValue}>
                    {formatCurrency(goal.current, goal.currency)}
                  </Text>
                </View>
                <View style={styles.goalDetailRow}>
                  <Text style={styles.goalDetailLabel}>Target</Text>
                  <Text style={styles.goalDetailValue}>
                    {formatCurrency(goal.target, goal.currency)}
                  </Text>
                </View>
                <View style={styles.goalDetailRow}>
                  <Text style={styles.goalDetailLabel}>Remaining</Text>
                  <Text style={[styles.goalDetailValue, { color: '#FF9800' }]}>
                    {formatCurrency(remaining, goal.currency)}
                  </Text>
                </View>
              </View>

              {/* Goal Footer */}
              <View style={styles.goalFooter}>
                <View style={styles.goalFooterItem}>
                  <Calendar size={14} color="#7E8491" />
                  <Text style={styles.goalFooterText}>{goal.deadline}</Text>
                </View>
                <View style={styles.goalFooterDivider} />
                <View style={styles.goalFooterItem}>
                  <TrendingUp size={14} color="#7E8491" />
                  <Text style={styles.goalFooterText}>
                    {formatCurrency(goal.monthlyContribution, goal.currency)}/mo
                  </Text>
                </View>
                <View style={styles.goalFooterDivider} />
                <View style={styles.goalFooterItem}>
                  <Text style={styles.goalFooterText}>
                    {monthsLeft === Infinity
                      ? 'Add funds'
                      : monthsLeft === 0
                      ? 'Complete!'
                      : `~${monthsLeft} months`}
                  </Text>
                </View>
              </View>

              {/* Action Buttons */}
              <View style={styles.goalActions}>
                <TouchableOpacity style={styles.goalActionButton}>
                  <Plus size={16} color="#FFFFFF" />
                  <Text style={styles.goalActionText}>Add Progress</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.goalActionButton, styles.goalActionButtonSecondary]}>
                  <Text style={styles.goalActionTextSecondary}>View History</Text>
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Add Goal Button */}
      <TouchableOpacity style={styles.addGoalButton}>
        <Plus color="#FFFFFF" size={24} />
        <Text style={styles.addGoalText}>Create New Goal</Text>
      </TouchableOpacity>

      <View style={styles.bottomSpacer} />
    </ScrollView>
  );
};

export default GoalsPage;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#25252B',
  },
  summaryCard: {
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 16,
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#1A1A1A',
  },
  summaryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  summaryLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#7E8491',
    letterSpacing: 1,
  },
  progressBadge: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  progressBadgeText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  summaryStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  summaryStatItem: {
    flex: 1,
    alignItems: 'center',
  },
  summaryStatLabel: {
    fontSize: 12,
    color: '#7E8491',
    marginBottom: 4,
  },
  summaryStatValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  summaryDivider: {
    width: 1,
    backgroundColor: '#34343D',
    marginHorizontal: 8,
  },
  summaryProgressBar: {
    height: 8,
    backgroundColor: '#1A1A1A',
    borderRadius: 4,
    overflow: 'hidden',
  },
  summaryProgressFill: {
    height: '100%',
    backgroundColor: '#4CAF50',
    borderRadius: 4,
  },
  quickStats: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    gap: 12,
    marginBottom: 20,
  },
  quickStatCard: {
    flex: 1,
    backgroundColor: '#31313A',
    borderRadius: 12,
    padding: 16,
    borderLeftWidth: 3,
    gap: 8,
  },
  quickStatValue: {
    fontSize: 28,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  quickStatLabel: {
    fontSize: 12,
    color: '#7E8491',
  },
  goalsSection: {
    paddingHorizontal: 16,
  },
  goalsSectionHeader: {
    marginBottom: 16,
  },
  goalsSectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  goalsSectionSubtitle: {
    fontSize: 14,
    color: '#7E8491',
  },
  goalCard: {
    backgroundColor: '#31313A',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#1A1A1A',
  },
  goalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 12,
  },
  goalIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  goalHeaderInfo: {
    flex: 1,
  },
  goalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  goalDescription: {
    fontSize: 13,
    color: '#7E8491',
  },
  goalProgress: {
    fontSize: 24,
    fontWeight: '700',
  },
  goalProgressBar: {
    height: 8,
    backgroundColor: '#1A1A1A',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 16,
  },
  goalProgressFill: {
    height: '100%',
    borderRadius: 4,
  },
  goalDetails: {
    gap: 8,
    marginBottom: 12,
  },
  goalDetailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  goalDetailLabel: {
    fontSize: 14,
    color: '#7E8491',
  },
  goalDetailValue: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  goalFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#1A1A1A',
    marginBottom: 12,
  },
  goalFooterItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  goalFooterDivider: {
    width: 1,
    height: 16,
    backgroundColor: '#34343D',
  },
  goalFooterText: {
    fontSize: 12,
    color: '#7E8491',
  },
  goalActions: {
    flexDirection: 'row',
    gap: 8,
  },
  goalActionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#4CAF50',
    paddingVertical: 10,
    borderRadius: 10,
    gap: 6,
  },
  goalActionButtonSecondary: {
    backgroundColor: '#1A1A1A',
  },
  goalActionText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  goalActionTextSecondary: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  addGoalButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#31313A',
    marginHorizontal: 16,
    paddingVertical: 18,
    borderRadius: 16,
    gap: 8,
    borderWidth: 1,
    borderColor: '#34343D',
    borderStyle: 'dashed',
  },
  addGoalText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  bottomSpacer: {
    height: 100,
  },
});