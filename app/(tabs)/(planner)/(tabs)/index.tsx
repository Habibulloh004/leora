// app/(tabs)/(planner)/(tabs)/index.tsx
import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

const TODAY_TASKS = [
  { id: '1', title: 'Review product roadmap', status: 'In progress', due: '09:00' },
  { id: '2', title: 'Ship finance analytics draft', status: 'Not started', due: '13:30' },
  { id: '3', title: 'Weekly team sync', status: 'Scheduled', due: '17:00' },
];

const UPCOMING_TASKS = [
  { id: '4', title: 'Plan habit streak rewards', status: 'Tomorrow', due: 'All day' },
  { id: '5', title: 'Research new AI prompts', status: 'This week', due: 'Fri' },
];

export default function PlannerTasksTab() {
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <Section title="Today" description="Focus on the three wins that move the week forward.">
        {TODAY_TASKS.map((task) => (
          <TaskCard key={task.id} title={task.title} status={task.status} due={task.due} />
        ))}
      </Section>

      <Section title="Up next" description="Line up tomorrow and the rest of the week.">
        {UPCOMING_TASKS.map((task) => (
          <TaskCard key={task.id} title={task.title} status={task.status} due={task.due} tone="dim" />
        ))}
      </Section>
    </ScrollView>
  );
}

interface SectionProps {
  title: string;
  description: string;
  children: React.ReactNode;
}

function Section({ title, description, children }: SectionProps) {
  return (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>{title}</Text>
        <Text style={styles.sectionDescription}>{description}</Text>
      </View>
      <View style={styles.sectionBody}>{children}</View>
    </View>
  );
}

interface TaskCardProps {
  title: string;
  status: string;
  due: string;
  tone?: 'default' | 'dim';
}

function TaskCard({ title, status, due, tone = 'default' }: TaskCardProps) {
  return (
    <View style={[styles.taskCard, tone === 'dim' && styles.taskCardDim]}>
      <View style={styles.taskMeta}>
        <Text style={styles.taskTitle}>{title}</Text>
        <Text style={[styles.taskStatus, tone === 'dim' && styles.taskStatusDim]}>{status}</Text>
      </View>
      <Text style={[styles.taskDue, tone === 'dim' && styles.taskDueDim]}>{due}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#25252B',
  },
  content: {
    padding: 16,
    paddingBottom: 120,
    gap: 20,
  },
  section: {
    gap: 16,
  },
  sectionHeader: {
    gap: 4,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.4,
  },
  sectionDescription: {
    fontSize: 14,
    color: '#7E8B9A',
  },
  sectionBody: {
    gap: 12,
  },
  taskCard: {
    backgroundColor: '#31313A',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#1F1F22',
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 12,
  },
  taskCardDim: {
    backgroundColor: '#31313A',
    borderColor: '#16161A',
  },
  taskMeta: {
    flex: 1,
    gap: 6,
  },
  taskTitle: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
  },
  taskStatus: {
    fontSize: 13,
    color: '#AEB5BF',
    fontWeight: '500',
  },
  taskStatusDim: {
    color: '#7E8B9A',
  },
  taskDue: {
    fontSize: 12,
    color: '#FFFFFF',
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  taskDueDim: {
    color: '#AEB5BF',
  },
});
