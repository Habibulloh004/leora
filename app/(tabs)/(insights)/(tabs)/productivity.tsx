// app/(tabs)/(insights)/(tabs)/productivity.tsx - Productivity Tab
import React, { useMemo } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { Clock, CheckCircle, Zap } from 'lucide-react-native';

import { Theme, useAppTheme } from '@/constants/theme';

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    contentContainer: {
      padding: theme.spacing.lg,
    },
    metricsContainer: {
      flexDirection: 'row',
      gap: theme.spacing.md,
      marginBottom: theme.spacing.lg,
    },
    metricCard: {
      flex: 1,
      backgroundColor: theme.colors.surface,
      borderRadius: theme.radius.lg,
      padding: theme.spacing.xl,
      alignItems: 'center',
      justifyContent: 'center',
      gap: theme.spacing.sm,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: theme.colors.border,
    },
    metricValue: {
      fontSize: 24,
      fontWeight: '700',
      color: theme.colors.textPrimary,
    },
    metricLabel: {
      fontSize: 12,
      color: theme.colors.textMuted,
      textAlign: 'center',
    },
    section: {
      marginBottom: theme.spacing.lg,
    },
    sectionTitle: {
      fontSize: 20,
      fontWeight: '700',
      color: theme.colors.textPrimary,
      marginBottom: theme.spacing.md,
    },
    peakCard: {
      backgroundColor: theme.colors.surfaceElevated,
      borderRadius: theme.radius.lg,
      padding: theme.spacing.lg,
      marginBottom: theme.spacing.md,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: theme.colors.border,
    },
    peakHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: theme.spacing.sm,
    },
    peakTime: {
      fontSize: 18,
      fontWeight: '700',
      color: theme.colors.textPrimary,
    },
    peakBadge: {
      paddingHorizontal: theme.spacing.md,
      paddingVertical: 4,
      borderRadius: theme.radius.full,
    },
    peakBadgeText: {
      fontSize: 12,
      fontWeight: '600',
    },
    peakDescription: {
      fontSize: 14,
      color: theme.colors.textMuted,
    },
    matrixContainer: {
      gap: theme.spacing.md,
    },
    matrixRow: {
      flexDirection: 'row',
      gap: theme.spacing.md,
    },
    matrixCell: {
      flex: 1,
      borderRadius: theme.radius.lg,
      padding: theme.spacing.lg,
      gap: theme.spacing.sm,
    },
    matrixLabel: {
      fontSize: 14,
      fontWeight: '600',
      color: theme.colors.textPrimary,
    },
    matrixCount: {
      fontSize: 12,
      color: theme.colors.textPrimary,
    },
    habitCard: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: theme.colors.surface,
      borderRadius: theme.radius.lg,
      padding: theme.spacing.lg,
      marginBottom: theme.spacing.md,
      gap: theme.spacing.md,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: theme.colors.border,
    },
    habitContent: {
      flex: 1,
    },
    habitTitle: {
      fontSize: 14,
      fontWeight: '600',
      color: theme.colors.textPrimary,
    },
    habitStreak: {
      fontSize: 12,
      color: theme.colors.textMuted,
    },
    bottomSpacer: {
      height: theme.spacing.xxxl,
    },
  });

const peakConfig = [
  { time: '9:00-11:00', label: 'Утренний пик', tone: 'success' as const, description: 'Идеально для творческих задач' },
  { time: '14:00-16:00', label: 'Дневной пик', tone: 'warning' as const, description: 'Лучшее время для встреч' },
  { time: '19:00-20:00', label: 'Вечерний подъем', tone: 'secondary' as const, description: 'Планирование и рефлексия' },
];

const matrixConfig = [
  { label: 'Срочно и важно', count: '2 задачи', tone: 'danger' as const },
  { label: 'Важно, не срочно', count: '5 задач', tone: 'success' as const },
  { label: 'Срочно, не важно', count: '3 задачи', tone: 'warning' as const },
  { label: 'Не срочно, не важно', count: '1 задача', tone: 'muted' as const },
];

const habitConfig = [
  { icon: CheckCircle, title: 'Утренняя медитация', streak: '21 день подряд', tone: 'success' as const },
  { icon: CheckCircle, title: 'Pomodoro техника', streak: '14 дней подряд', tone: 'success' as const },
  { icon: Clock, title: 'Вечернее планирование', streak: '5 дней подряд', tone: 'warning' as const },
];

export default function ProductivityTab() {
  const theme = useAppTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);

  const resolveTone = (tone: 'success' | 'warning' | 'danger' | 'secondary' | 'muted') => {
    switch (tone) {
      case 'success':
        return { background: theme.colors.success, text: theme.colors.onSuccess };
      case 'warning':
        return { background: theme.colors.warning, text: theme.colors.onWarning };
      case 'danger':
        return { background: theme.colors.danger, text: theme.colors.onDanger };
      case 'secondary':
        return { background: theme.colors.secondary, text: theme.colors.onSecondary };
      case 'muted':
      default:
        return { background: theme.colors.surface, text: theme.colors.textPrimary };
    }
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.metricsContainer}>
        <View style={styles.metricCard}>
          <Clock color={theme.colors.info} size={32} />
          <Text style={styles.metricValue}>6.5 ч</Text>
          <Text style={styles.metricLabel}>Глубокий фокус</Text>
        </View>

        <View style={styles.metricCard}>
          <CheckCircle color={theme.colors.success} size={32} />
          <Text style={styles.metricValue}>18</Text>
          <Text style={styles.metricLabel}>Задач выполнено</Text>
        </View>

        <View style={styles.metricCard}>
          <Zap color={theme.colors.warning} size={32} />
          <Text style={styles.metricValue}>92%</Text>
          <Text style={styles.metricLabel}>Эффективность</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Энергетические пики</Text>
        {peakConfig.map((peak) => {
          const tone = resolveTone(peak.tone);
          return (
            <View key={peak.time} style={styles.peakCard}>
              <View style={styles.peakHeader}>
                <Text style={styles.peakTime}>{peak.time}</Text>
                <View style={[styles.peakBadge, { backgroundColor: tone.background }]}>
                  <Text style={[styles.peakBadgeText, { color: tone.text }]}>{peak.label}</Text>
                </View>
              </View>
              <Text style={styles.peakDescription}>{peak.description}</Text>
            </View>
          );
        })}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Матрица Эйзенхауэра</Text>
        <View style={styles.matrixContainer}>
          <View style={styles.matrixRow}>
            {matrixConfig.slice(0, 2).map((item) => {
              const tone = resolveTone(item.tone);
              return (
                <View
                  key={item.label}
                  style={[
                    styles.matrixCell,
                    { backgroundColor: tone.background },
                  ]}
                >
                  <Text style={[styles.matrixLabel, { color: tone.text }]}>{item.label}</Text>
                  <Text style={[styles.matrixCount, { color: tone.text }]}>{item.count}</Text>
                </View>
              );
            })}
          </View>
          <View style={styles.matrixRow}>
            {matrixConfig.slice(2, 4).map((item) => {
              const tone = resolveTone(item.tone);
              return (
                <View
                  key={item.label}
                  style={[
                    styles.matrixCell,
                    { backgroundColor: tone.background },
                  ]}
                >
                  <Text style={[styles.matrixLabel, { color: tone.text }]}>{item.label}</Text>
                  <Text style={[styles.matrixCount, { color: tone.text }]}>{item.count}</Text>
                </View>
              );
            })}
          </View>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Продуктивные привычки</Text>
        {habitConfig.map((habit) => {
          const Icon = habit.icon;
          const tone = resolveTone(habit.tone);
          return (
            <View key={habit.title} style={styles.habitCard}>
              <Icon color={tone.background} size={24} />
              <View style={styles.habitContent}>
                <Text style={styles.habitTitle}>{habit.title}</Text>
                <Text style={styles.habitStreak}>{habit.streak}</Text>
              </View>
            </View>
          );
        })}
      </View>

      <View style={styles.bottomSpacer} />
    </ScrollView>
  );
}
