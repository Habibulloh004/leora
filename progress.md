import AnimatedBorderCard from '@/components/shared/AnimatedBorderCard';
import type { Task } from '@/types/home';
import { Check } from 'lucide-react-native';
import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

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
    <TouchableOpacity
      onPress={onToggle}
      activeOpacity={0.7}
      style={styles.checkboxHit}
    >
      <View style={[styles.checkbox, task.completed && styles.checkboxCompleted]}>
        {task.completed && <Check color="#FFFFFF" size={14} />}
      </View>
    </TouchableOpacity>

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
    setTasks(prev =>
      prev.map(t => (t.id === taskId ? { ...t, completed: !t.completed } : t))
    );
    onTaskToggle?.(taskId);
  };

  return (
    <AnimatedBorderCard style={styles.widget}>
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
    </AnimatedBorderCard>
  );
}

const styles = StyleSheet.create({
  widget: {
    backgroundColor: '#25252B',
    borderRadius: 16,
    marginTop: 16,
  },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  
  title: {
    fontSize: 12,
    fontWeight: '700',
    color: '#A6A6B9',
    letterSpacing: 2.5,
  },
  
  menu: {
    fontSize: 20,
    color: '#888888',
  },

  taskItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    gap: 12,
  },

  checkboxHit: {
    padding: 4,
    borderRadius: 12,
  },

  checkbox: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 2,
    borderColor: '#3A3A42',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
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
    fontWeight: '500',
  },
  
  taskTitleCompleted: {
    textDecorationLine: 'line-through',
    color: '#6B6B76',
  },
  
  taskTime: {
    fontSize: 14,
    color: '#8E8E93',
    fontWeight: '500',
  },
});