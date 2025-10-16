// app/(tabs)/(insights)/(tabs)/productivity.tsx - Productivity Tab
import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { Clock, CheckCircle, Zap } from 'lucide-react-native';

export default function ProductivityTab() {
  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
    >
      {/* Productivity Metrics */}
      <View style={styles.metricsContainer}>
        <View style={styles.metricCard}>
          <Clock color="#00BCD4" size={32} />
          <Text style={styles.metricValue}>6.5 ч</Text>
          <Text style={styles.metricLabel}>Глубокий фокус</Text>
        </View>

        <View style={styles.metricCard}>
          <CheckCircle color="#4CAF50" size={32} />
          <Text style={styles.metricValue}>18</Text>
          <Text style={styles.metricLabel}>Задач выполнено</Text>
        </View>

        <View style={styles.metricCard}>
          <Zap color="#FFD700" size={32} />
          <Text style={styles.metricValue}>92%</Text>
          <Text style={styles.metricLabel}>Эффективность</Text>
        </View>
      </View>

      {/* Energy Peaks */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Энергетические пики</Text>

        <View style={styles.peakCard}>
          <View style={styles.peakHeader}>
            <Text style={styles.peakTime}>9:00-11:00</Text>
            <View style={styles.peakBadge}>
              <Text style={styles.peakBadgeText}>Утренний пик</Text>
            </View>
          </View>
          <Text style={styles.peakDescription}>Идеально для творческих задач</Text>
        </View>

        <View style={styles.peakCard}>
          <View style={styles.peakHeader}>
            <Text style={styles.peakTime}>14:00-16:00</Text>
            <View style={[styles.peakBadge, { backgroundColor: '#FF9800' }]}>
              <Text style={styles.peakBadgeText}>Дневной пик</Text>
            </View>
          </View>
          <Text style={styles.peakDescription}>Лучшее время для встреч</Text>
        </View>

        <View style={styles.peakCard}>
          <View style={styles.peakHeader}>
            <Text style={styles.peakTime}>19:00-20:00</Text>
            <View style={[styles.peakBadge, { backgroundColor: '#9C27B0' }]}>
              <Text style={styles.peakBadgeText}>Вечерний подъем</Text>
            </View>
          </View>
          <Text style={styles.peakDescription}>Планирование и рефлексия</Text>
        </View>
      </View>

      {/* Eisenhower Matrix */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Матрица Эйзенхауэра</Text>

        <View style={styles.matrixContainer}>
          <View style={styles.matrixRow}>
            <View style={[styles.matrixCell, { backgroundColor: '#F44336' }]}>
              <Text style={styles.matrixLabel}>Срочно и важно</Text>
              <Text style={styles.matrixCount}>2 задачи</Text>
            </View>

            <View style={[styles.matrixCell, { backgroundColor: '#4CAF50' }]}>
              <Text style={styles.matrixLabel}>Важно, не срочно</Text>
              <Text style={styles.matrixCount}>5 задач</Text>
            </View>
          </View>

          <View style={styles.matrixRow}>
            <View style={[styles.matrixCell, { backgroundColor: '#FF9800' }]}>
              <Text style={styles.matrixLabel}>Срочно, не важно</Text>
              <Text style={styles.matrixCount}>3 задачи</Text>
            </View>

            <View style={[styles.matrixCell, { backgroundColor: '#9E9E9E' }]}>
              <Text style={styles.matrixLabel}>Не срочно, не важно</Text>
              <Text style={styles.matrixCount}>1 задача</Text>
            </View>
          </View>
        </View>
      </View>

      {/* Productive Habits */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Продуктивные привычки</Text>

        <View style={styles.habitCard}>
          <CheckCircle color="#4CAF50" size={24} />
          <View style={styles.habitContent}>
            <Text style={styles.habitTitle}>Утренняя медитация</Text>
            <Text style={styles.habitStreak}>21 день подряд</Text>
          </View>
        </View>

        <View style={styles.habitCard}>
          <CheckCircle color="#4CAF50" size={24} />
          <View style={styles.habitContent}>
            <Text style={styles.habitTitle}>Pomodoro техника</Text>
            <Text style={styles.habitStreak}>14 дней подряд</Text>
          </View>
        </View>

        <View style={styles.habitCard}>
          <Clock color="#FF9800" size={24} />
          <View style={styles.habitContent}>
            <Text style={styles.habitTitle}>Вечернее планирование</Text>
            <Text style={styles.habitStreak}>5 дней подряд</Text>
          </View>
        </View>
      </View>

      <View style={styles.bottomSpacer} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#25252B',
  },
  contentContainer: {
    padding: 16,
  },
  metricsContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  metricCard: {
    flex: 1,
    backgroundColor: '#31313A',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  metricValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  metricLabel: {
    fontSize: 12,
    color: '#A6A6B9',
    textAlign: 'center',
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 16,
  },
  peakCard: {
    backgroundColor: '#1A1A1A',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  peakHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  peakTime: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  peakBadge: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  peakBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  peakDescription: {
    fontSize: 14,
    color: '#A6A6B9',
  },
  matrixContainer: {
    gap: 12,
  },
  matrixRow: {
    flexDirection: 'row',
    gap: 12,
  },
  matrixCell: {
    flex: 1,
    borderRadius: 12,
    padding: 20,
    minHeight: 100,
    justifyContent: 'center',
    alignItems: 'center',
  },
  matrixLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 8,
  },
  matrixCount: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  habitCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#31313A',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    gap: 16,
  },
  habitContent: {
    flex: 1,
  },
  habitTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  habitStreak: {
    fontSize: 14,
    color: '#4CAF50',
  },
  bottomSpacer: {
    height: 100,
  },
});
