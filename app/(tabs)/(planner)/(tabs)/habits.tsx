// app/(tabs)/(planner)/(tabs)/habits.tsx
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

const HABITS = [
  { id: '1', name: 'Deep work block', streak: 7, target: 21, tone: '#4CAF50' },
  { id: '2', name: 'Shipping update', streak: 12, target: 30, tone: '#3B82F6' },
  { id: '3', name: 'Customer outreach', streak: 4, target: 14, tone: '#F59E0B' },
];

export default function PlannerHabitsTab() {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Habits & rituals</Text>
        <Text style={styles.subtitle}>Consistency compounds. Keep the streak alive.</Text>
      </View>

      <View style={styles.list}>
        {HABITS.map((habit) => (
          <HabitCard key={habit.id} {...habit} />
        ))}
      </View>
    </View>
  );
}

interface HabitCardProps {
  name: string;
  streak: number;
  target: number;
  tone: string;
}

function HabitCard({ name, streak, target, tone }: HabitCardProps) {
  const completion = Math.min(streak / target, 1);

  return (
    <View style={styles.card}>
      <View style={[styles.marker, { backgroundColor: tone }]} />
      <View style={styles.cardBody}>
        <Text style={styles.habitName}>{name}</Text>
        <Text style={styles.habitSubtitle}>Streak target {target} days</Text>
        <View style={styles.progressRow}>
          <View style={styles.progressTrack}>
            <View style={[styles.progressFill, { width: `${Math.round(completion * 100)}%`, backgroundColor: tone }]} />
          </View>
          <Text style={styles.progressLabel}>{streak}d</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#25252B',
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
  list: {
    gap: 14,
  },
  card: {
    flexDirection: 'row',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#1F1F22',
    backgroundColor: '#31313A',
    overflow: 'hidden',
  },
  marker: {
    width: 6,
  },
  cardBody: {
    flex: 1,
    padding: 18,
    gap: 10,
  },
  habitName: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  habitSubtitle: {
    color: '#9399A3',
    fontSize: 13,
  },
  progressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  progressTrack: {
    flex: 1,
    height: 6,
    borderRadius: 4,
    backgroundColor: '#18181C',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  progressLabel: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '600',
    letterSpacing: 0.4,
  },
});
