import type { Task } from '@/types/home';
import { CheckIcon } from '@assets/icons';
import { Dot } from 'lucide-react-native';
import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View
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
        {task.completed && <CheckIcon color="#FFFFFF" size={18} />}
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
    <View style={styles.container}>
      <View style={styles.widget}>
        <View style={styles.header}>
          <View style={styles.titleContainer}>
            <Text style={styles.title}>Daily tasks</Text>
            <Dot color="#7E8491" />
            <Text style={styles.title}>Monday</Text>
          </View>
          <TouchableOpacity onPress={onMenuPress} activeOpacity={0.7}>
            <Text style={styles.menu}>⋯</Text>
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
    marginTop: 6,
    padding: 12
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
    borderBottomWidth: 2,
    borderBottomColor: "#34343D",
    paddingBottom: 8
  },
  titleContainer: {
    justifyContent: "flex-start",
    alignItems: "center",
    flexDirection: "row",
    color: '#7E8491',
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

  taskItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 5,
    borderBottomWidth: 2,
    borderBottomColor: "#34343D"
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
    borderColor: '#3A3A42',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },

  checkboxCompleted: {
    backgroundColor: '#3A3A42',
    borderColor: '#3A3A42',
  },

  taskContent: {
    flex: 1,
  },

  taskTitle: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: '200',
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