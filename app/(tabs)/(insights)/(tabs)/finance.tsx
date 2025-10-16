// app/(tabs)/(insights)/(tabs)/finance.tsx - Finance Insights Tab
import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { TrendingUp, TrendingDown, Sun } from 'lucide-react-native';

export default function FinanceTab() {
  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
    >
      {/* Financial Health Metrics */}
      <View style={styles.metricsContainer}>
        <View style={styles.metricCard}>
          <Text style={styles.metricValue}>2,450,000</Text>
          <Text style={styles.metricLabel}>сум</Text>
          <Text style={styles.metricTitle}>Баланс</Text>
        </View>

        <View style={styles.metricCard}>
          <View style={styles.metricValueContainer}>
            <TrendingUp color="#4CAF50" size={20} />
            <Text style={[styles.metricValue, { color: '#4CAF50' }]}>+12%</Text>
          </View>
          <Text style={styles.metricLabel}>рост</Text>
          <Text style={styles.metricTitle}>Сбережения</Text>
        </View>

        <View style={styles.metricCard}>
          <View style={styles.metricValueContainer}>
            <TrendingDown color="#4CAF50" size={20} />
            <Text style={[styles.metricValue, { color: '#4CAF50' }]}>-8%</Text>
          </View>
          <Text style={styles.metricLabel}>снижение</Text>
          <Text style={styles.metricTitle}>Расходы</Text>
        </View>
      </View>

      {/* Financial Wisdom */}
      <View style={styles.wisdomCard}>
        <Sun color="#FFD700" size={32} />
        <Text style={styles.wisdomTitle}>Правило 50/30/20</Text>
        <Text style={styles.wisdomDescription}>
          50% на нужды, 30% на желания, 20% на сбережения. Вы близки к идеальному балансу!
        </Text>
      </View>

      {/* Top Categories */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Топ категорий расходов</Text>

        <View style={styles.categoryItem}>
          <Text style={styles.categoryLabel}>Продукты</Text>
          <View style={styles.categoryBarContainer}>
            <View style={[styles.categoryBar, { width: '100%', backgroundColor: '#F44336' }]} />
          </View>
          <Text style={styles.categoryAmount}>450,000</Text>
        </View>

        <View style={styles.categoryItem}>
          <Text style={styles.categoryLabel}>Транспорт</Text>
          <View style={styles.categoryBarContainer}>
            <View style={[styles.categoryBar, { width: '82%', backgroundColor: '#F44336' }]} />
          </View>
          <Text style={styles.categoryAmount}>370,000</Text>
        </View>

        <View style={styles.categoryItem}>
          <Text style={styles.categoryLabel}>Развлечения</Text>
          <View style={styles.categoryBarContainer}>
            <View style={[styles.categoryBar, { width: '64%', backgroundColor: '#FF9800' }]} />
          </View>
          <Text style={styles.categoryAmount}>290,000</Text>
        </View>

        <View style={styles.categoryItem}>
          <Text style={styles.categoryLabel}>Образование</Text>
          <View style={styles.categoryBarContainer}>
            <View style={[styles.categoryBar, { width: '47%', backgroundColor: '#FF9800' }]} />
          </View>
          <Text style={styles.categoryAmount}>210,000</Text>
        </View>

        <View style={styles.categoryItem}>
          <Text style={styles.categoryLabel}>Здоровье</Text>
          <View style={styles.categoryBarContainer}>
            <View style={[styles.categoryBar, { width: '29%', backgroundColor: '#4CAF50' }]} />
          </View>
          <Text style={styles.categoryAmount}>130,000</Text>
        </View>
      </View>

      {/* Smart Recommendations */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Умные рекомендации</Text>

        <View style={styles.recommendationCard}>
          <View style={styles.recommendationNumber}>
            <Text style={styles.recommendationNumberText}>1</Text>
          </View>
          <View style={styles.recommendationContent}>
            <Text style={styles.recommendationTitle}>
              Переведите подписку на Netflix на семейный план
            </Text>
            <Text style={styles.recommendationSubtitle}>экономия 60,000 сум/месяц</Text>
          </View>
        </View>

        <View style={styles.recommendationCard}>
          <View style={styles.recommendationNumber}>
            <Text style={styles.recommendationNumberText}>2</Text>
          </View>
          <View style={styles.recommendationContent}>
            <Text style={styles.recommendationTitle}>
              Инвестируйте 10% дохода в индексный фонд
            </Text>
            <Text style={styles.recommendationSubtitle}>для долгосрочного роста</Text>
          </View>
        </View>

        <View style={styles.recommendationCard}>
          <View style={styles.recommendationNumber}>
            <Text style={styles.recommendationNumberText}>3</Text>
          </View>
          <View style={styles.recommendationContent}>
            <Text style={styles.recommendationTitle}>
              Создайте резервный фонд на 3 месяца расходов
            </Text>
            <Text style={styles.recommendationSubtitle}>финансовая подушка безопасности</Text>
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
    padding: 16,
    alignItems: 'center',
  },
  metricValueContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metricValue: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  metricLabel: {
    fontSize: 12,
    color: '#A6A6B9',
    marginBottom: 8,
  },
  metricTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  wisdomCard: {
    backgroundColor: '#1A1A1A',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    alignItems: 'center',
  },
  wisdomTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
    marginTop: 12,
    marginBottom: 12,
  },
  wisdomDescription: {
    fontSize: 16,
    color: '#A6A6B9',
    textAlign: 'center',
    lineHeight: 24,
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
  categoryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#31313A',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    gap: 12,
  },
  categoryLabel: {
    fontSize: 14,
    color: '#FFFFFF',
    width: 100,
  },
  categoryBarContainer: {
    flex: 1,
    height: 8,
    backgroundColor: '#1A1A1A',
    borderRadius: 4,
    overflow: 'hidden',
  },
  categoryBar: {
    height: '100%',
    borderRadius: 4,
  },
  categoryAmount: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
    width: 80,
    textAlign: 'right',
  },
  recommendationCard: {
    flexDirection: 'row',
    backgroundColor: '#31313A',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    gap: 16,
  },
  recommendationNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#4CAF50',
    justifyContent: 'center',
    alignItems: 'center',
  },
  recommendationNumberText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  recommendationContent: {
    flex: 1,
  },
  recommendationTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  recommendationSubtitle: {
    fontSize: 12,
    color: '#A6A6B9',
  },
  bottomSpacer: {
    height: 100,
  },
});
