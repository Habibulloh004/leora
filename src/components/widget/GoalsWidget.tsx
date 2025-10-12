import type { Goal } from '@/types/home';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Dot } from "lucide-react-native"

interface GoalsWidgetProps {
  goals?: Goal[];
  onMenuPress?: () => void;
}

interface GoalItemProps {
  goal: Goal;
}

const MOCK_GOALS: Goal[] = [
  {
    id: '1',
    title: 'Buy a car',
    progress: 82,
    current: 4100000,
    target: 5000000,
    unit: 'UZS',
    category: 'financial',
  },
  {
    id: '2',
    title: 'Read 24 books',
    progress: 45,
    current: 11,
    target: 24,
    unit: 'books',
    category: 'personal',
  },
  {
    id: '3',
    title: 'Learn Spanish',
    progress: 30,
    current: 30,
    target: 100,
    unit: '%',
    category: 'personal',
  },
];

const GoalItem = ({ goal }: GoalItemProps) => (
  <View style={styles.goalItem}>
    <View style={styles.goalHeader}>
      <Text style={styles.goalTitle}>{goal.title}</Text>
      <Text style={styles.goalProgress}>{goal.progress}%</Text>
    </View>

    <View style={styles.progressBarContainer}>
      <View style={[styles.progressBar, { width: `${goal.progress}%` }]} />
    </View>

    <Text style={styles.goalTarget}>
      {goal.current.toLocaleString()} / {goal.target.toLocaleString()} {goal.unit}
    </Text>
  </View>
);

export default function GoalsWidget({
  goals = MOCK_GOALS,
  onMenuPress,
}: GoalsWidgetProps) {
  return (
    <View style={styles.container}>

      <View style={styles.widget}>
        <View style={styles.header}>
            <View style={styles.titleContainer}>
              <Text style={styles.title}>Goals</Text>
              <Dot color="#7E8491" />
              <Text style={styles.title}>2025</Text>
            </View>
          <TouchableOpacity onPress={onMenuPress} activeOpacity={0.7}>
            <Text style={styles.menu}>⋯</Text>
          </TouchableOpacity>
        </View>

        {goals.map(goal => (
          <GoalItem key={goal.id} goal={goal} />
        ))}
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
    borderColor: "#34343D",
  },
  widget: {
    backgroundColor: '#25252B',
    borderRadius: 16,
    padding: 12,
  },
  titleContainer: {
    justifyContent: "flex-start",
    alignItems: "center",
    flexDirection: "row",
    color: '#7E8491',
    
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    borderBottomWidth:2,
    borderBottomColor:"#34343D",
    paddingBottom:8
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
  goalItem: {
    marginBottom: 16,
  },
  goalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  goalTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#A6A6B9',
  },
  goalProgress: {
    fontSize: 14,
    fontWeight: '400',
    color: '#7E8491',
  },
  progressBarContainer: {
    height: 4,
    backgroundColor: '#1A1A1A',
    borderRadius: 2,
    marginBottom: 8,
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#007AFF',
    borderRadius: 2,
  },
  goalTarget: {
    fontSize: 12,
    color: '#666666',
  },
});