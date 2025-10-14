import React, { useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { BookOpen, Brain, CheckCircle2, Dot, Dumbbell, Flame } from 'lucide-react-native';

import { Colors } from '@/constants/Colors';

interface Habit {
  id: string;
  name: string;
  streak: number;
  completed: boolean;
  icon: React.ComponentType<{ size?: number; color?: string }>;
}

const MOCK_HABITS: Habit[] = [
  { id: '1', name: 'Morning Workout', streak: 12, completed: false, icon: Dumbbell },
  { id: '2', name: 'Meditation', streak: 21, completed: true, icon: Brain },
  { id: '3', name: 'Read 30 min', streak: 8, completed: false, icon: BookOpen },
];

export default function HabitsWidget() {
  const [habits, setHabits] = useState<Habit[]>(MOCK_HABITS);

  const toggleHabit = (id: string) => {
    setHabits(prev =>
      prev.map(h => (h.id === id ? { ...h, completed: !h.completed } : h))
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.widget}>
        <View style={styles.header}>
          <View style={styles.titleContainer}>
            <Text style={styles.title}>Habits</Text>
            <Dot color="#7E8491" />
            <Text style={styles.title}>Today</Text>
          </View>
          <TouchableOpacity activeOpacity={0.7}>
            <Text style={styles.menu}>⋯</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.habitsContainer}>
          {habits.map((habit) => {
            const Icon = habit.icon;
            return (
              <TouchableOpacity
                key={habit.id}
                style={styles.habitItem}
                onPress={() => toggleHabit(habit.id)}
                activeOpacity={0.7}
              >
                <View style={styles.habitIconBadge}>
                  <Icon size={18} color={Colors.textPrimary} />
                </View>
                <View style={styles.habitContent}>
                  <Text style={[styles.habitName, habit.completed && styles.habitCompleted]}>
                    {habit.name}
                  </Text>
                  <View style={styles.habitMeta}>
                    <Flame size={14} color={Colors.warning} />
                    <Text style={styles.habitStreak}>{habit.streak} day streak</Text>
                  </View>
                </View>
                <CheckCircle2
                  size={20}
                  color={habit.completed ? Colors.success : Colors.border}
                  fill={habit.completed ? Colors.success : 'transparent'}
                />
              </TouchableOpacity>
            );
          })}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#34343D',
  },
  widget: {
    backgroundColor: '#25252B',
    borderRadius: 16,
    marginTop: 6,
    padding: 12,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    borderBottomWidth: 2,
    borderBottomColor: '#34343D',
    paddingBottom: 8,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: '#7E8491',
  },
  menu: {
    fontSize: 20,
    color: '#888888',
  },
  habitsContainer: {
    gap: 8,
  },
  habitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 2,
    borderBottomColor: '#34343D',
  },
  habitIconBadge: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: '#34343D',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  habitContent: {
    flex: 1,
  },
  habitName: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: '400',
  },
  habitCompleted: {
    textDecorationLine: 'line-through',
    color: '#6B6B76',
  },
  habitMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 4,
  },
  habitStreak: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
});
