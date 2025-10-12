import React, { useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Dot } from 'lucide-react-native';

interface Habit {
  id: string;
  name: string;
  streak: number;
  completed: boolean;
  icon: string;
}

const MOCK_HABITS: Habit[] = [
  { id: '1', name: 'Morning Workout', streak: 12, completed: false, icon: '🏃' },
  { id: '2', name: 'Meditation', streak: 21, completed: true, icon: '🧘' },
  { id: '3', name: 'Read 30 min', streak: 8, completed: false, icon: '📚' },
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
          {habits.map(habit => (
            <TouchableOpacity
              key={habit.id}
              style={styles.habitItem}
              onPress={() => toggleHabit(habit.id)}
              activeOpacity={0.7}
            >
              <Text style={styles.habitIcon}>{habit.icon}</Text>
              <View style={styles.habitContent}>
                <Text style={[styles.habitName, habit.completed && styles.habitCompleted]}>
                  {habit.name}
                </Text>
                <Text style={styles.habitStreak}>🔥 {habit.streak} day streak</Text>
              </View>
              <View style={[styles.checkbox, habit.completed && styles.checkboxCompleted]} />
            </TouchableOpacity>
          ))}
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
  habitIcon: {
    fontSize: 24,
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
  habitStreak: {
    fontSize: 12,
    color: '#FF6B35',
    marginTop: 2,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#3A3A42',
  },
  checkboxCompleted: {
    backgroundColor: '#4CAF50',
    borderColor: '#4CAF50',
  },
});