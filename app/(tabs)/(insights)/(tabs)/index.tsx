// app/(tabs)/(insights)/(tabs)/index.tsx - Overview Tab
import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { TrendingUp, Lightbulb, Star, Heart, CheckCircle, AlertTriangle, Target, TrendingDown } from 'lucide-react-native';

export default function OverviewTab() {
  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
    >
      {/* Personal Development Index */}
      <View style={styles.pdiCard}>
        <Text style={styles.pdiTitle}>Персональный индекс развития</Text>
        <View style={styles.pdiMainScore}>
          <Text style={styles.pdiScore}>7.8</Text>
          <View style={styles.pdiChange}>
            <TrendingUp color="#4CAF50" size={20} />
            <Text style={styles.pdiChangeText}>+0.5</Text>
          </View>
        </View>
      </View>

      {/* Index Breakdown */}
      <View style={styles.section}>
        <View style={styles.progressItem}>
          <Text style={styles.progressLabel}>Финансовое здоровье</Text>
          <View style={styles.progressBarContainer}>
            <View style={[styles.progressBar, { width: '82%', backgroundColor: '#4CAF50' }]} />
          </View>
          <Text style={styles.progressValue}>8.2</Text>
        </View>

        <View style={styles.progressItem}>
          <Text style={styles.progressLabel}>Продуктивность</Text>
          <View style={styles.progressBarContainer}>
            <View style={[styles.progressBar, { width: '65%', backgroundColor: '#FF9800' }]} />
          </View>
          <Text style={styles.progressValue}>6.5</Text>
        </View>

        <View style={styles.progressItem}>
          <Text style={styles.progressLabel}>Work-Life баланс</Text>
          <View style={styles.progressBarContainer}>
            <View style={[styles.progressBar, { width: '70%', backgroundColor: '#00BCD4' }]} />
          </View>
          <Text style={styles.progressValue}>7.0</Text>
        </View>

        <View style={styles.progressItem}>
          <Text style={styles.progressLabel}>Достижение целей</Text>
          <View style={styles.progressBarContainer}>
            <View style={[styles.progressBar, { width: '91%', backgroundColor: '#4CAF50' }]} />
          </View>
          <Text style={styles.progressValue}>9.1</Text>
        </View>

        <View style={styles.progressItem}>
          <Text style={styles.progressLabel}>Дисциплина</Text>
          <View style={styles.progressBarContainer}>
            <View style={[styles.progressBar, { width: '80%', backgroundColor: '#4CAF50' }]} />
          </View>
          <Text style={styles.progressValue}>8.0</Text>
        </View>
      </View>

      {/* AI Insights */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Персональные инсайты AI</Text>

        <View style={styles.insightCard}>
          <View style={styles.insightHeader}>
            <Lightbulb color="#FFD700" size={24} />
            <Text style={styles.insightTitle}>Паттерн обнаружен</Text>
          </View>
          <Text style={styles.insightDescription}>
            Вы наиболее продуктивны по вторникам и четвергам. Планируйте важные задачи на эти дни.
          </Text>
        </View>

        <View style={styles.insightCard}>
          <View style={styles.insightHeader}>
            <Star color="#4CAF50" size={24} />
            <Text style={styles.insightTitle}>Финансовая возможность</Text>
          </View>
          <Text style={styles.insightDescription}>
            Автоматизация сбережений может увеличить ваш капитал на 23% за год.
          </Text>
        </View>

        <View style={styles.insightCard}>
          <View style={styles.insightHeader}>
            <Heart color="#F44336" size={24} />
            <Text style={styles.insightTitle}>Забота о себе</Text>
          </View>
          <Text style={styles.insightDescription}>
            Добавьте 10-минутную медитацию в утреннюю рутину для улучшения фокуса на 40%.
          </Text>
        </View>
      </View>

      {/* Key Changes */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Ключевые изменения за месяц</Text>

        <View style={styles.changeItem}>
          <TrendingDown color="#4CAF50" size={24} />
          <View style={styles.changeContent}>
            <Text style={styles.changeTitle}>Расходы снизились на 15%</Text>
            <Text style={styles.changeDescription}>
              Экономия 347,000 сум по сравнению с прошлым месяцем
            </Text>
          </View>
        </View>

        <View style={styles.changeItem}>
          <CheckCircle color="#4CAF50" size={24} />
          <View style={styles.changeContent}>
            <Text style={styles.changeTitle}>21 день новой привычки</Text>
            <Text style={styles.changeDescription}>
              Утренняя зарядка успешно закреплялась
            </Text>
          </View>
        </View>

        <View style={styles.changeItem}>
          <AlertTriangle color="#FF9800" size={24} />
          <View style={styles.changeContent}>
            <Text style={styles.changeTitle}>Внимание: приближаетесь к лимиту</Text>
            <Text style={styles.changeDescription}>
              Категория &apos;Рестораны&apos; - осталось 23% от бюджета
            </Text>
          </View>
        </View>
      </View>

      {/* Weekly Achievements */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Достижения недели</Text>

        <View style={styles.achievementItem}>
          <Target color="#4CAF50" size={20} />
          <Text style={styles.achievementText}>7 дней подряд без импульсивных покупок</Text>
        </View>

        <View style={styles.achievementItem}>
          <CheckCircle color="#4CAF50" size={20} />
          <Text style={styles.achievementText}>Сэкономлено 125,000 сум на подписках</Text>
        </View>

        <View style={styles.achievementItem}>
          <TrendingUp color="#4CAF50" size={20} />
          <Text style={styles.achievementText}>Продуктивность выросла на 35%</Text>
        </View>

        <View style={styles.achievementItem}>
          <Star color="#FFD700" size={20} />
          <Text style={styles.achievementText}>Все недельные цели достигнуты</Text>
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
  pdiCard: {
    backgroundColor: '#31313A',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
  },
  pdiTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 20,
  },
  pdiMainScore: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  pdiScore: {
    fontSize: 72,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  pdiChange: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  pdiChangeText: {
    fontSize: 24,
    fontWeight: '600',
    color: '#4CAF50',
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
  progressItem: {
    backgroundColor: '#31313A',
    borderRadius: 8,
    padding: 16,
    marginBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  progressLabel: {
    fontSize: 14,
    color: '#FFFFFF',
    flex: 1,
  },
  progressBarContainer: {
    flex: 2,
    height: 8,
    backgroundColor: '#1A1A1A',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    borderRadius: 4,
  },
  progressValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
    width: 40,
    textAlign: 'right',
  },
  insightCard: {
    backgroundColor: '#1A1A1A',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  insightHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  insightTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  insightDescription: {
    fontSize: 14,
    color: '#A6A6B9',
    lineHeight: 20,
  },
  changeItem: {
    backgroundColor: '#31313A',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  changeContent: {
    flex: 1,
  },
  changeTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  changeDescription: {
    fontSize: 14,
    color: '#A6A6B9',
  },
  achievementItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#31313A',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  achievementText: {
    fontSize: 14,
    color: '#FFFFFF',
    flex: 1,
  },
  bottomSpacer: {
    height: 100,
  },
});
