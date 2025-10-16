// app/(tabs)/(planner)/(tabs)/goals.tsx
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

const GOALS = [
  { id: '1', title: 'Launch subscription MVP', progress: 0.68, target: 'Dec 2024', impact: 'Revenue' },
  { id: '2', title: 'Reach 10K active planners', progress: 0.42, target: 'Mar 2025', impact: 'Engagement' },
  { id: '3', title: 'Reduce churn below 3%', progress: 0.25, target: 'May 2025', impact: 'Retention' },
];

export default function PlannerGoalsTab() {
  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>Strategic goals</Text>
          <Text style={styles.subtitle}>Progress updates and impact focus</Text>
        </View>

        <View style={styles.grid}>
          {GOALS.map((goal) => (
            <GoalCard key={goal.id} {...goal} />
          ))}
        </View>
      </View>
    </View>
  );
}

interface GoalCardProps {
  title: string;
  progress: number;
  target: string;
  impact: string;
}

function GoalCard({ title, progress, target, impact }: GoalCardProps) {
  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{impact}</Text>
        </View>
        <Text style={styles.target}>{target}</Text>
      </View>
      <Text style={styles.cardTitle}>{title}</Text>

      <View style={styles.progressContainer}>
        <View style={styles.progressTrack}>
          <View style={[styles.progressFill, { width: `${Math.round(progress * 100)}%` }]} />
        </View>
        <Text style={styles.progressLabel}>{Math.round(progress * 100)}%</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#25252B',
  },
  content: {
    flex: 1,
    padding: 16,
    gap: 20,
  },
  header: {
    gap: 6,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  subtitle: {
    fontSize: 14,
    color: '#7E8B9A',
  },
  grid: {
    gap: 16,
  },
  card: {
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#202025',
    backgroundColor: '#31313A',
    padding: 20,
    gap: 14,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  badge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    backgroundColor: 'rgba(124, 58, 237, 0.15)',
  },
  badgeText: {
    color: '#B19BFF',
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
  target: {
    color: '#7E8B9A',
    fontSize: 12,
    fontWeight: '500',
  },
  cardTitle: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: '600',
    lineHeight: 22,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  progressTrack: {
    flex: 1,
    height: 8,
    borderRadius: 6,
    backgroundColor: '#1C1C1F',
  },
  progressFill: {
    height: '100%',
    borderRadius: 6,
    backgroundColor: '#8B5CF6',
  },
  progressLabel: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '600',
  },
});
