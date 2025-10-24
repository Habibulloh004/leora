import type { Task } from '@/types/home';
import { CheckIcon } from '@assets/icons';
import { Dot } from 'lucide-react-native';
import React, { useState } from 'react';
import {
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { AdaptiveGlassView } from '@/components/ui/AdaptiveGlassView';
import { useAppTheme } from '@/constants/theme';
import { GlassView } from 'expo-glass-effect';

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

const TaskItem = ({ task, onToggle }: TaskItemProps) => {
  const theme = useAppTheme();

  return (
    <TouchableOpacity
      style={[styles.taskItem, { borderBottomColor: theme.colors.border }]}
      onPress={onToggle}
      activeOpacity={0.7}
    >
      <TouchableOpacity
        onPress={onToggle}
        activeOpacity={0.7}
        style={styles.checkboxHit}
      >
        <View style={[
          styles.checkbox,
          { borderColor: theme.colors.border },
          task.completed && { backgroundColor: theme.colors.surfaceElevated, borderColor: theme.colors.surfaceElevated }
        ]}>
          {task.completed && <CheckIcon color={theme.colors.textPrimary} size={18} />}
        </View>
      </TouchableOpacity>

      <View style={styles.taskContent}>
        <Text style={[
          styles.taskTitle,
          { color: theme.colors.textPrimary },
          task.completed && { textDecorationLine: 'line-through', color: theme.colors.textMuted }
        ]}>
          {task.title}
        </Text>
      </View>

      <Text style={[styles.taskTime, { color: theme.colors.textSecondary }]}>{task.time}</Text>
    </TouchableOpacity>
  );
};

export default function DailyTasksWidget({
  initialTasks = MOCK_TASKS,
  onTaskToggle,
  onMenuPress,
}: DailyTasksWidgetProps) {
  const theme = useAppTheme();
  const [tasks, setTasks] = useState<Task[]>(initialTasks);

  const handleTaskToggle = (taskId: string) => {
    setTasks(prev =>
      prev.map(t => (t.id === taskId ? { ...t, completed: !t.completed } : t))
    );
    onTaskToggle?.(taskId);
  };

  return (
    <View style={styles.container}>
      <AdaptiveGlassView style={[styles.widget, { backgroundColor: Platform.OS === "ios" ? "transparent" : theme.colors.card }]}>
        <View style={[styles.header, { borderBottomColor: theme.colors.border }]}>
          <View style={styles.titleContainer}>
            <Text style={[styles.title, { color: theme.colors.textSecondary }]}>Daily tasks</Text>
            <Dot color={theme.colors.textSecondary} />
            <Text style={[styles.title, { color: theme.colors.textSecondary }]}>Monday</Text>
          </View>
          <TouchableOpacity onPress={onMenuPress} activeOpacity={0.7}>
            <Text style={[styles.menu, { color: theme.colors.textSecondary }]}>⋯</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.tasksContainer}>
          {tasks.map(task => (
            <TaskItem
              key={task.id}
              task={task}
              onToggle={() => handleTaskToggle(task.id)}
            />
          ))}
        </View>
      </AdaptiveGlassView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 16,
    marginBottom: 16,
  },
  widget: {
    borderRadius: 16,
    padding: 12,
  },
  tasksContainer: {
    flexDirection: "column",
    gap: 0
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    borderBottomWidth: 1,
    paddingBottom: 8
  },
  titleContainer: {
    justifyContent: "flex-start",
    alignItems: "center",
    flexDirection: "row",
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
  },
  menu: {
    fontSize: 20,
  },
  taskItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 5,
    borderBottomWidth: 1,
  },
  checkboxHit: {
    padding: 4,
    borderRadius: 12,
  },
  checkbox: {
    width: 28,
    height: 28,
    borderRadius: 6,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  taskContent: {
    flex: 1,
  },
  taskTitle: {
    fontSize: 16,
    fontWeight: '200',
  },
  taskTime: {
    fontSize: 14,
    fontWeight: '500',
  },
});