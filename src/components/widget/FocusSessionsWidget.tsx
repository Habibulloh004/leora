// src/components/widget/FocusSessionsWidget.tsx
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Dot, Timer } from 'lucide-react-native';

interface FocusSession {
  id: string;
  task: string;
  duration: number;
  completed: boolean;
}

const MOCK_SESSIONS: FocusSession[] = [
  { id: '1', task: 'Deep Work', duration: 25, completed: true },
  { id: '2', task: 'Email Processing', duration: 25, completed: true },
  { id: '3', task: 'Project Planning', duration: 25, completed: false },
];

export default function FocusSessionsWidget() {
  return (
    <View style={styles.container}>
      <View style={styles.widget}>
        <View style={styles.header}>
          <View style={styles.titleContainer}>
            <Text style={styles.title}>Focus Sessions</Text>
            <Dot color="#7E8491" />
            <Text style={styles.title}>Today</Text>
          </View>
          <TouchableOpacity activeOpacity={0.7}>
            <Text style={styles.menu}>⋯</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.stats}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>2</Text>
            <Text style={styles.statLabel}>Completed</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>50m</Text>
            <Text style={styles.statLabel}>Total Time</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>25m</Text>
            <Text style={styles.statLabel}>Next Session</Text>
          </View>
        </View>

        <View style={styles.sessionsContainer}>
          {MOCK_SESSIONS.map(session => (
            <View key={session.id} style={styles.sessionItem}>
              <Timer size={20} color={session.completed ? '#4CAF50' : '#7E8491'} />
              <Text style={[styles.sessionTask, session.completed && styles.completed]}>
                {session.task}
              </Text>
              <Text style={styles.sessionDuration}>{session.duration}m</Text>
            </View>
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
  stats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  statLabel: {
    fontSize: 12,
    color: '#7E8491',
    marginTop: 4,
  },
  sessionsContainer: {
    gap: 8,
  },
  sessionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 2,
    borderBottomColor: '#34343D',
    gap: 12,
  },
  sessionTask: {
    flex: 1,
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: '400',
  },
  completed: {
    textDecorationLine: 'line-through',
    color: '#6B6B76',
  },
  sessionDuration: {
    fontSize: 14,
    color: '#8E8E93',
    fontWeight: '500',
  },
});