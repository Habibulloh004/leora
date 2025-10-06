import { LinearGradient } from 'expo-linear-gradient';
import { Bell, Check, Clock, Pencil, Plus, Search, Target } from 'lucide-react-native';
import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Circle } from 'react-native-svg';

type WelcomeSectionProps = {
  editMode: boolean;
  setEditMode: React.Dispatch<React.SetStateAction<boolean>>;
};

type CircleProgressProps = {
  label: string;
  value: number;
  color: string;
};

type Task = {
  id: number;
  title: string;
  time: string;
  completed: boolean;
};

type Goal = {
  id: number;
  title: string;
  progress: number;
  target: string;
};

type FABAction = {
  icon: React.ComponentType<{ color?: string; size?: number }>;
  label: string;
  color: string;
};

export default function HomeScreen() {
  const [editMode, setEditMode] = useState<boolean>(false);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <Header />
        <WelcomeSection editMode={editMode} setEditMode={setEditMode} />
        <ProgressIndicators />
        <DailyTasksWidget />
        <GoalsWidget />
      </ScrollView>
      <FABMenu />
    </SafeAreaView>
  );
}

const Header = () => (
  <View style={styles.header}>
    <Text style={styles.headerTitle}>LEORA</Text>
    <View style={styles.headerActions}>
      <TouchableOpacity style={styles.headerButton}>
        <Search color="#FFFFFF" size={22} opacity={0.7} />
      </TouchableOpacity>
      <TouchableOpacity style={styles.headerButton}>
        <Bell color="#FFFFFF" size={22} opacity={0.7} />
        <View style={styles.notificationDot} />
      </TouchableOpacity>
      <TouchableOpacity style={styles.avatar}>
        <Text style={styles.avatarText}>S</Text>
      </TouchableOpacity>
    </View>
  </View>
);

const WelcomeSection = ({ editMode, setEditMode }: WelcomeSectionProps) => {
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';
  const date = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });

  return (
    <LinearGradient
      colors={['#0F0F0F', '#000000']}
      style={styles.welcomeCard}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      <View style={styles.welcomeContent}>
        <View>
          <Text style={styles.greeting}>{greeting}, Sardor</Text>
          <Text style={styles.date}>{date}</Text>
        </View>
        <TouchableOpacity style={styles.editButton} onPress={() => setEditMode(!editMode)}>
          {editMode ? <Check color="#4CAF50" size={16} /> : <Pencil color="#4CAF50" size={16} />}
          <Text style={styles.editText}>{editMode ? 'Done' : 'Edit'}</Text>
        </TouchableOpacity>
      </View>
    </LinearGradient>
  );
};

const ProgressIndicators = () => (
  <ScrollView
    horizontal
    showsHorizontalScrollIndicator={false}
    style={styles.progressContainer}
    contentContainerStyle={styles.progressContent}
  >
    <CircleProgress label="TASKS" value={50} color="#4CAF50" />
    <CircleProgress label="BUDGET" value={62} color="#2196F3" />
    <CircleProgress label="FOCUS" value={75} color="#FF9800" />
  </ScrollView>
);

const CircleProgress = ({ label, value, color }: CircleProgressProps) => {
  const size = 96;
  const strokeWidth = 6;
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const strokeDashoffset = circumference - (value / 100) * circumference;

  return (
    <View style={styles.circleProgressContainer}>
      <View style={styles.circleProgress}>
        <Svg width={size} height={size}>
          <Circle cx={size / 2} cy={size / 2} r={radius} stroke="#1A1A1A" strokeWidth={strokeWidth} fill="none" />
          <Circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={color}
            strokeWidth={strokeWidth}
            fill="none"
            strokeDasharray={`${circumference} ${circumference}`}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            rotation={-90}
            originX={size / 2}
            originY={size / 2}
          />
        </Svg>
        <View style={styles.circleProgressText}>
          <Text style={styles.circleProgressValue}>{value}%</Text>
        </View>
      </View>
      <Text style={styles.circleProgressLabel}>{label}</Text>
    </View>
  );
};

const DailyTasksWidget = () => {
  const tasks: Task[] = [
    { id: 1, title: 'Review Q1 financial reports', time: '09:00', completed: false },
    { id: 2, title: 'Team meeting', time: '10:30', completed: true },
    { id: 3, title: 'Lunch with client', time: '13:00', completed: false },
    { id: 4, title: 'Gym workout', time: '18:00', completed: false },
  ];

  return (
    <View style={styles.widgetCard}>
      <View style={styles.widgetHeader}>
        <Text style={styles.widgetTitle}>DAILY TASKS</Text>
        <TouchableOpacity>
          <Text style={styles.widgetMenu}>⋯</Text>
        </TouchableOpacity>
      </View>
      {tasks.map((task) => (
        <TouchableOpacity key={task.id} style={styles.taskItem}>
          <View style={[styles.checkbox, task.completed && styles.checkboxCompleted]}>
            {task.completed && <Check color="#FFFFFF" size={16} />}
          </View>
          <View style={styles.taskContent}>
            <Text style={[styles.taskTitle, task.completed && styles.taskTitleCompleted]}>{task.title}</Text>
          </View>
          <Text style={styles.taskTime}>{task.time}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};

const GoalsWidget = () => {
  const goals: Goal[] = [
    { id: 1, title: 'Buy a car', progress: 82, target: '5,000,000 UZS' },
    { id: 2, title: 'Read 24 books', progress: 45, target: '24 books' },
    { id: 3, title: 'Learn Spanish', progress: 30, target: 'B2 level' },
  ];

  return (
    <View style={styles.widgetCard}>
      <View style={styles.widgetHeader}>
        <Text style={styles.widgetTitle}>GOALS</Text>
        <TouchableOpacity>
          <Text style={styles.widgetMenu}>⋯</Text>
        </TouchableOpacity>
      </View>
      {goals.map((goal) => (
        <View key={goal.id} style={styles.goalItem}>
          <View style={styles.goalHeader}>
            <Text style={styles.goalTitle}>{goal.title}</Text>
            <Text style={styles.goalProgress}>{goal.progress}%</Text>
          </View>
          <View style={styles.progressBarContainer}>
            <View style={[styles.progressBar, { width: `${goal.progress}%` }]} />
          </View>
          <Text style={styles.goalTarget}>{goal.target}</Text>
        </View>
      ))}
    </View>
  );
};

const FABMenu = () => {
  const [expanded, setExpanded] = useState<boolean>(false);

  const actions: FABAction[] = [
    { icon: Check, label: 'ADD TASK', color: '#4CAF50' },
    { icon: Target, label: 'QUICK EXPENSE', color: '#F44336' },
    { icon: Clock, label: 'START FOCUS', color: '#FF9800' },
  ];

  return (
    <View style={styles.fabContainer}>
      {expanded &&
        actions.map((action, index) => (
          <TouchableOpacity
            key={action.label}
            style={[styles.fabAction, { bottom: 80 + index * 60, backgroundColor: action.color }]}
            accessibilityLabel={action.label}
          >
            <action.icon color="#FFFFFF" size={20} />
          </TouchableOpacity>
        ))}
      <TouchableOpacity style={styles.fab} onPress={() => setExpanded((prev) => !prev)}>
        <Plus color="#000000" size={28} style={{ transform: [{ rotate: expanded ? '45deg' : '0deg' }] }} />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#1A1A1A',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '300',
    color: '#FFFFFF',
    letterSpacing: 3,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  headerButton: {
    position: 'relative',
  },
  notificationDot: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FFA500',
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#1A1A1A',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#FFFFFF',
  },
  welcomeCard: {
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 16,
    borderRadius: 16,
    padding: 20,
  },
  welcomeContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  greeting: {
    fontSize: 24,
    fontWeight: '400',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  date: {
    fontSize: 14,
    color: '#999999',
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  editText: {
    fontSize: 14,
    color: '#4CAF50',
    fontWeight: '500',
  },
  progressContainer: {
    marginBottom: 24,
  },
  progressContent: {
    paddingHorizontal: 16,
    gap: 12,
  },
  circleProgressContainer: {
    alignItems: 'center',
    minWidth: 100,
  },
  circleProgress: {
    position: 'relative',
    marginBottom: 8,
  },
  circleProgressText: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  circleProgressValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  circleProgressLabel: {
    fontSize: 12,
    color: '#666666',
    fontWeight: '500',
    letterSpacing: 1,
  },
  widgetCard: {
    marginHorizontal: 16,
    marginBottom: 16,
    backgroundColor: '#0F0F0F',
    borderRadius: 16,
    padding: 16,
  },
  widgetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  widgetTitle: {
    fontSize: 12,
    fontWeight: '500',
    color: '#999999',
    letterSpacing: 2,
  },
  widgetMenu: {
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
    color: '#FFFFFF',
  },
  goalProgress: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4CAF50',
  },
  progressBarContainer: {
    height: 4,
    backgroundColor: '#1A1A1A',
    borderRadius: 2,
    marginBottom: 8,
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#4CAF50',
    borderRadius: 2,
  },
  goalTarget: {
    fontSize: 12,
    color: '#666666',
  },
  fabContainer: {
    position: 'absolute',
    bottom: 80,
    right: 16,
  },
  fab: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  fabAction: {
    position: 'absolute',
    right: 0,
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 4,
  },
});
