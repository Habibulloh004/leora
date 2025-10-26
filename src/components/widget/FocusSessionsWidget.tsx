// src/components/widget/FocusSessionsWidget.tsx
import React from 'react';
import { Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Dot, Timer } from 'lucide-react-native';
import { AdaptiveGlassView } from '@/components/ui/AdaptiveGlassView';
import { useAppTheme } from '@/constants/theme';

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
  const theme = useAppTheme();

  return (
    <View style={styles.container}>
      <AdaptiveGlassView style={[styles.widget, { backgroundColor: theme.colors.card }]}>
        <View style={[styles.header, { borderBottomColor: theme.colors.border }]}>
          <View style={styles.titleContainer}>
            <Text style={[styles.title, { color: theme.colors.textSecondary }]}>Focus Sessions</Text>
            <Dot color={theme.colors.textSecondary} />
            <Text style={[styles.title, { color: theme.colors.textSecondary }]}>Today</Text>
          </View>
          <TouchableOpacity activeOpacity={0.7}>
            <Text style={[styles.menu, { color: theme.colors.textSecondary }]}>⋯</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.stats}>
          <View style={styles.statItem}>
            <Text style={[styles.statValue, { color: theme.colors.textPrimary }]}>2</Text>
            <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>Completed</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={[styles.statValue, { color: theme.colors.textPrimary }]}>50m</Text>
            <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>Total Time</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={[styles.statValue, { color: theme.colors.textPrimary }]}>25m</Text>
            <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>Next Session</Text>
          </View>
        </View>

        <View style={styles.sessionsContainer}>
          {MOCK_SESSIONS.map(session => (
            <View key={session.id} style={[styles.sessionItem, { borderBottomColor: theme.colors.border }]}>
              <Timer size={20} color={session.completed ? theme.colors.success : theme.colors.textSecondary} />
              <Text style={[
                styles.sessionTask,
                { color: theme.colors.textPrimary },
                session.completed && { textDecorationLine: 'line-through', color: theme.colors.textMuted }
              ]}>
                {session.task}
              </Text>
              <Text style={[styles.sessionDuration, { color: theme.colors.textSecondary }]}>{session.duration}m</Text>
            </View>
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    borderBottomWidth: 1,
    paddingBottom: 8,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
  },
  menu: {
    fontSize: 20,
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
  },
  statLabel: {
    fontSize: 12,
    marginTop: 4,
  },
  sessionsContainer: {
    gap: 8,
  },
  sessionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    gap: 12,
  },
  sessionTask: {
    flex: 1,
    fontSize: 16,
    fontWeight: '400',
  },
  sessionDuration: {
    fontSize: 14,
    fontWeight: '500',
  },
});