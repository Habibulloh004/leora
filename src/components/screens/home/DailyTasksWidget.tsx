import type { Task } from '@/types/home';
import { Check } from 'lucide-react-native';
import React, { useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface DailyTasksWidgetProps {
  initialTasks?: Task[];
  onTaskToggle?: (taskId: string) => void;
  onMenuPress?: () => void;
}

const MOCK_TASKS: Task[] = [
  { id: '1', title: 'Review Q1 financial reports', time: '09:00', completed: false },
  { id: '2', title: 'Team meeting', time: '10:30', completed: true },
  { id: '3', title: 'Lunch with client', time: '13:00', completed: false },
  { id: '4', title: 'Gym workout', time: '18:00', completed: false },
];

interface TaskItemProps {
  task: Task;
  onToggle: () => void;
}

const TaskItem = ({ task, onToggle }: TaskItemProps) => (
  <TouchableOpacity 
    style={styles.taskItem} 
    onPress={onToggle}
    activeOpacity={0.7}
  >
    <View style={[styles.checkbox, task.completed && styles.checkboxCompleted]}>
      {task.completed && <Check color="#FFFFFF" size={16} />}
    </View>
    <View style={styles.taskContent}>
      <Text style={[styles.taskTitle, task.completed && styles.taskTitleCompleted]}>
        {task.title}
      </Text>
    </View>
    <Text style={styles.taskTime}>{task.time}</Text>
  </TouchableOpacity>
);

export default function DailyTasksWidget({
  initialTasks = MOCK_TASKS,
  onTaskToggle,
  onMenuPress,
}: DailyTasksWidgetProps) {
  const [tasks, setTasks] = useState<Task[]>(initialTasks);

  const handleTaskToggle = (taskId: string) => {
    setTasks(prevTasks =>
      prevTasks.map(task =>
        task.id === taskId ? { ...task, completed: !task.completed } : task
      )
    );
    onTaskToggle?.(taskId);
  };

  return (
    <View style={styles.widget}>
      <View style={styles.header}>
        <Text style={styles.title}>DAILY TASKS</Text>
        <TouchableOpacity onPress={onMenuPress} activeOpacity={0.7}>
          <Text style={styles.menu}>⋯</Text>
        </TouchableOpacity>
      </View>

      {tasks.map(task => (
        <TaskItem
          key={task.id}
          task={task}
          onToggle={() => handleTaskToggle(task.id)}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  widget: {
    marginHorizontal: 16,
    marginBottom: 16,
    backgroundColor: '#0F0F0F',
    borderRadius: 16,
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 12,
    fontWeight: '500',
    color: '#999999',
    letterSpacing: 2,
  },
  menu: {
    fontSize: 20,
    color: '#666666',
  },
  taskItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    gap: 12,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#333333',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxCompleted: {
    backgroundColor: '#4CAF50',
    borderColor: '#4CAF50',
  },
  taskContent: {
    flex: 1,
  },
  taskTitle: {
    fontSize: 16,
    color: '#FFFFFF',
  },
  taskTitleCompleted: {
    textDecorationLine: 'line-through',
    color: '#666666',
  },
  taskTime: {
    fontSize: 14,
    color: '#666666',
  },
});

