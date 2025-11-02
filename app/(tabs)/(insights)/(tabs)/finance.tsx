// app/(tabs)/(insights)/(tabs)/finance.tsx - Finance Insights Tab
import React, { useMemo } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { TrendingUp, TrendingDown, Sun } from 'lucide-react-native';

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
    headerCard: {
      borderRadius: theme.radius.xl,
      padding: theme.spacing.xl,
      marginBottom: theme.spacing.lg,
      backgroundColor:
        theme.mode === 'dark'
          ? 'rgba(148, 163, 184, 0.08)'
          : 'rgba(37, 99, 235, 0.08)',
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: theme.colors.border,
    },
    headerTitle: {
      fontSize: 26,
      fontWeight: '800',
      color: theme.colors.textPrimary,
      letterSpacing: -0.3,
    },
    headerSubtitle: {
      marginTop: theme.spacing.xs,
      fontSize: 14,
      color: theme.colors.textMuted,
    },
    headerBadgeRow: {
      flexDirection: 'row',
      gap: theme.spacing.sm,
      marginTop: theme.spacing.md,
    },
    headerBadge: {
      paddingHorizontal: theme.spacing.md,
      paddingVertical: 6,
      borderRadius: theme.radius.full,
      backgroundColor: theme.colors.surface,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: theme.colors.border,
    },
    headerBadgeText: {
      fontSize: 12,
      fontWeight: '700',
      color: theme.colors.textSecondary,
      letterSpacing: 0.4,
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
      padding: theme.spacing.lg,
      alignItems: 'center',
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: theme.colors.border,
    },
    metricValueContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.xs,
    },
    metricValue: {
      fontSize: 20,
      fontWeight: '700',
      color: theme.colors.textPrimary,
      marginBottom: 4,
    },
    metricLabel: {
      fontSize: 12,
      color: theme.colors.textMuted,
      marginBottom: 8,
    },
    metricTitle: {
      fontSize: 14,
      fontWeight: '600',
      color: theme.colors.textPrimary,
    },
    wisdomCard: {
      backgroundColor: theme.colors.surfaceElevated,
      borderRadius: theme.radius.lg,
      padding: theme.spacing.xl,
      marginBottom: theme.spacing.lg,
      alignItems: 'center',
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: theme.colors.border,
    },
    wisdomTitle: {
      fontSize: 20,
      fontWeight: '700',
      color: theme.colors.textPrimary,
      marginTop: theme.spacing.md,
      marginBottom: theme.spacing.md,
    },
    wisdomDescription: {
      fontSize: 16,
      color: theme.colors.textMuted,
      textAlign: 'center',
      lineHeight: 24,
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
    categoryItem: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: theme.colors.surface,
      borderRadius: theme.radius.md,
      padding: theme.spacing.lg,
      marginBottom: theme.spacing.md,
      gap: theme.spacing.md,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: theme.colors.border,
    },
    categoryLabel: {
      fontSize: 14,
      color: theme.colors.textPrimary,
      width: 100,
    },
    categoryBarContainer: {
      flex: 1,
      height: 8,
      backgroundColor: theme.colors.surfaceMuted,
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
      color: theme.colors.textPrimary,
      width: 80,
      textAlign: 'right',
    },
    recommendationCard: {
      flexDirection: 'row',
      backgroundColor: theme.colors.surface,
      borderRadius: theme.radius.lg,
      padding: theme.spacing.lg,
      marginBottom: theme.spacing.md,
      gap: theme.spacing.lg,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: theme.colors.border,
    },
    recommendationNumber: {
      width: 32,
      height: 32,
      borderRadius: 16,
      backgroundColor: theme.colors.primary,
      justifyContent: 'center',
      alignItems: 'center',
    },
    recommendationNumberText: {
      fontSize: 16,
      fontWeight: '700',
      color: theme.colors.onPrimary,
    },
    recommendationContent: {
      flex: 1,
    },
    recommendationTitle: {
      fontSize: 14,
      fontWeight: '600',
      color: theme.colors.textPrimary,
      marginBottom: 4,
    },
    recommendationSubtitle: {
      fontSize: 12,
      color: theme.colors.textMuted,
    },
    bottomSpacer: {
      height: theme.spacing.xxxl,
    },
  });

const categoryConfig = [
  { label: 'Продукты', width: 100, amount: '450,000', tone: 'danger' as const },
  { label: 'Транспорт', width: 82, amount: '370,000', tone: 'danger' as const },
  { label: 'Развлечения', width: 64, amount: '290,000', tone: 'warning' as const },
  { label: 'Образование', width: 47, amount: '210,000', tone: 'warning' as const },
  { label: 'Здоровье', width: 29, amount: '130,000', tone: 'success' as const },
];

export default function FinanceTab() {
  const theme = useAppTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.headerCard}>
        <Text style={styles.headerTitle}>Финансовый обзор</Text>
        <Text style={styles.headerSubtitle}>
          Сводка по балансу, расходам и рекомендациям за последнюю неделю. Все значения
          обновляются автоматически.
        </Text>
        <View style={styles.headerBadgeRow}>
          <View style={styles.headerBadge}>
            <Text style={styles.headerBadgeText}>Баланс · +12%</Text>
          </View>
          <View style={styles.headerBadge}>
            <Text style={styles.headerBadgeText}>Изменения расходов · -8%</Text>
          </View>
        </View>
      </View>

      <View style={styles.metricsContainer}>
        <View style={styles.metricCard}>
          <Text style={styles.metricValue}>2,450,000</Text>
          <Text style={styles.metricLabel}>сум</Text>
          <Text style={styles.metricTitle}>Баланс</Text>
        </View>

        <View style={styles.metricCard}>
          <View style={styles.metricValueContainer}>
            <TrendingUp color={theme.colors.success} size={20} />
            <Text style={[styles.metricValue, { color: theme.colors.success }]}>+12%</Text>
          </View>
          <Text style={styles.metricLabel}>рост</Text>
          <Text style={styles.metricTitle}>Сбережения</Text>
        </View>

        <View style={styles.metricCard}>
          <View style={styles.metricValueContainer}>
            <TrendingDown color={theme.colors.danger} size={20} />
            <Text style={[styles.metricValue, { color: theme.colors.danger }]}>-8%</Text>
          </View>
          <Text style={styles.metricLabel}>снижение</Text>
          <Text style={styles.metricTitle}>Расходы</Text>
        </View>
      </View>

      <View style={styles.wisdomCard}>
        <Sun color={theme.colors.warning} size={32} />
        <Text style={styles.wisdomTitle}>Правило 50/30/20</Text>
        <Text style={styles.wisdomDescription}>
          50% на нужды, 30% на желания, 20% на сбережения. Вы близки к идеальному балансу!
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Топ категорий расходов</Text>
        {categoryConfig.map((category) => {
          const toneColor =
            category.tone === 'danger'
              ? theme.colors.danger
              : category.tone === 'warning'
              ? theme.colors.warning
              : theme.colors.success;

          return (
            <View key={category.label} style={styles.categoryItem}>
              <Text style={styles.categoryLabel}>{category.label}</Text>
              <View style={styles.categoryBarContainer}>
                <View
                  style={[
                    styles.categoryBar,
                    {
                      width: `${category.width}%`,
                      backgroundColor: toneColor,
                    },
                  ]}
                />
              </View>
              <Text style={styles.categoryAmount}>{category.amount}</Text>
            </View>
          );
        })}
      </View>

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
