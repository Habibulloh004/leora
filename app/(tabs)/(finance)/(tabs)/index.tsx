// app/(tabs)/(finance)/(tabs)/index.tsx
import React, { useEffect, useRef } from 'react';
import {
  Animated,
  Dimensions,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {
  Clock,
  Wallet,
  AlertCircle,
  TrendingUp,
  TrendingDown,
} from 'lucide-react-native';
import { PieChart } from 'react-native-chart-kit';
import * as Progress from 'react-native-progress';
import { AdaptiveGlassView } from '@/components/ui/AdaptiveGlassView';

import { useAppTheme } from '@/constants/theme';
import { Table, TableColumn } from '@/components/ui/Table';

const { width: screenWidth } = Dimensions.get('window');

// Mock data
const BALANCE_DATA = {
  total: 12500000,
  income: 12500000,
  incomeChange: 15,
  outcome: 8600000,
  outcomeChange: -8,
  currency: 'UZS',
  month: 'December',
};

const PROGRESS_DATA = {
  used: 3750000,
  percentage: 68,
};

const EXPENSE_CATEGORIES = [
  { name: 'Food', percentage: 35, color: '#8B5CF6' },
  { name: 'Transport', percentage: 25, color: '#EF4444' },
  { name: 'Living', percentage: 20, color: '#10B981' },
  { name: 'Shopping', percentage: 15, color: '#F59E0B' },
  { name: 'Entertainment', percentage: 5, color: '#3B82F6' },
];

interface Transaction {
  id: string;
  type: string;
  amount: number;
  time: string;
  isIncome: boolean;
}

const RECENT_TRANSACTIONS: Transaction[] = [
  { id: '1', type: 'Korzinka', amount: -45000, time: 'Today 14:30', isIncome: false },
  { id: '2', type: 'Salary', amount: 12500000, time: 'Today 09:00', isIncome: true },
  { id: '3', type: 'Yandex Taxi', amount: -15000, time: 'Yesterday', isIncome: false },
  { id: '4', type: 'MegaPlanet', amount: -120000, time: '2 Jan 19:46', isIncome: false },
];

const IMPORTANT_EVENTS = [
  {
    id: '1',
    icon: 'wallet' as const,
    title: 'Debt Repaid',
    description: 'Debt will return after 6 days (15.04)',
    time: '34m ago',
  },
  {
    id: '2',
    icon: 'clock' as const,
    title: 'Payment',
    description: 'Internet bill due tomorrow',
    time: '50m ago',
  },
  {
    id: '3',
    icon: 'alert' as const,
    title: 'Budget',
    description: 'Food budget 85% used',
    time: '11h ago',
  },
];

export default function FinanceReviewScreen() {
  const theme = useAppTheme();
  const styles = createStyles(theme);

  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 400,
      useNativeDriver: true,
    }).start();
  }, [fadeAnim]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US').format(Math.abs(amount));
  };

  // Define table columns for transactions
  const transactionColumns: TableColumn<Transaction>[] = [
    {
      key: 'type',
      title: 'Type',
      flex: 2,
      align: 'left',
      renderText: (item) => item.type,
    },
    {
      key: 'amount',
      title: 'Amount',
      flex: 3,
      align: 'right',
      render: (item) => (
        <Text
          style={[
            styles.transactionAmount,
            { color: item.isIncome ? theme.colors.success : theme.colors.danger },
          ]}
        >
          {item.isIncome ? '+' : ''}
          {formatCurrency(item.amount)} {BALANCE_DATA.currency}
        </Text>
      ),
    },
    {
      key: 'time',
      title: 'Date',
      flex: 2,
      align: 'right',
      renderText: (item) => item.time,
      style: styles.transactionTime,
    },
  ];

  const getEventIcon = (iconType: 'wallet' | 'clock' | 'alert') => {
    const iconProps = { size: 20, color: theme.colors.textPrimary };
    switch (iconType) {
      case 'wallet':
        return <Wallet {...iconProps} />;
      case 'clock':
        return <Clock {...iconProps} />;
      case 'alert':
        return <AlertCircle {...iconProps} />;
    }
  };

  // Prepare data for PieChart
  const pieChartData = EXPENSE_CATEGORIES.map((category) => ({
    name: category.name,
    population: category.percentage,
    color: category.color,
    legendFontColor: theme.colors.textSecondary,
    legendFontSize: 13,
  }));


  const chartConfig = {
    backgroundGradientFrom: theme.colors.surface,
    backgroundGradientTo: theme.colors.surface,
    color: () => theme.colors.textPrimary,
    strokeWidth: 2,
    barPercentage: 0.5,
    useShadowColorFromDataset: false,
  };

  return (
    <ScrollView
      style={styles.container}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.contentContainer}
    >
      <Animated.View style={{ opacity: fadeAnim }}>
        {/* 1. Balance Section */}
        <View style={styles.balanceSection}>
          {/* Main Balance Card */}
          <AdaptiveGlassView style={styles.mainBalanceCard}>
            <Text style={styles.balanceLabel}>Total Balance</Text>
            <Text style={styles.balanceAmount}>
              {formatCurrency(BALANCE_DATA.total)} {BALANCE_DATA.currency}
            </Text>
          </AdaptiveGlassView>

          {/* Income & Outcome Cards */}
          <View style={styles.inOutRow}>
            {/* Income Card */}
            <AdaptiveGlassView style={styles.inOutCard}>
              <View style={styles.inOutHeader}>
                <Text style={styles.inOutLabel}>Income</Text>
                <TrendingUp size={16} color={theme.colors.success} />
              </View>
              <Text style={[styles.inOutAmount, { color: theme.colors.success }]}>
                {formatCurrency(BALANCE_DATA.income)} {BALANCE_DATA.currency}
              </Text>
              <Text style={styles.inOutChange}>
                +{BALANCE_DATA.incomeChange}% {BALANCE_DATA.month}
              </Text>
            </AdaptiveGlassView>

            {/* Outcome Card */}
            <AdaptiveGlassView style={styles.inOutCard}>
              <View style={styles.inOutHeader}>
                <Text style={styles.inOutLabel}>Outcome</Text>
                <TrendingDown size={16} color={theme.colors.danger} />
              </View>
              <Text style={[styles.inOutAmount, { color: theme.colors.danger }]}>
                {formatCurrency(BALANCE_DATA.outcome)} {BALANCE_DATA.currency}
              </Text>
              <Text style={styles.inOutChange}>
                {BALANCE_DATA.outcomeChange}% {BALANCE_DATA.month}
              </Text>
            </AdaptiveGlassView>
          </View>
        </View>

        {/* 2. Monthly Progress Indicator */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Balance at the end of the month</Text>
          <View style={styles.progressWrapper}>
            <Progress.Bar
              progress={PROGRESS_DATA.percentage / 100}
              width={screenWidth - 32}
              height={16}
              color={theme.colors.textSecondary}
              unfilledColor={theme.colors.surfaceElevated}
              borderWidth={0}
              borderRadius={999}
              animated={true}
              animationType="spring"
              animationConfig={{ bounciness: 8 }}
            />
            <View style={styles.progressLabelsRow}>
              <AdaptiveGlassView style={styles.progressLabelItem}>
                <Text style={styles.progressLabel}>Used</Text>
                <Text style={styles.progressValue}>
                  –{formatCurrency(PROGRESS_DATA.used)} {BALANCE_DATA.currency}
                </Text>
              </AdaptiveGlassView>
              <AdaptiveGlassView style={[styles.progressLabelItem, styles.progressLabelRight]}>
                <Text style={styles.progressLabel}>Progress</Text>
                <Text style={[styles.progressValue, { color: theme.colors.textSecondary }]}>
                  {PROGRESS_DATA.percentage}%
                </Text>
              </AdaptiveGlassView>
            </View>
          </View>
        </View>

        {/* 3. Expense Structure */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Expense structure</Text>
          <AdaptiveGlassView style={styles.expenseContainer}>
            <PieChart
              data={pieChartData}
              width={screenWidth - 64}
              height={220}
              chartConfig={chartConfig}
              accessor="population"
              backgroundColor="transparent"
              paddingLeft="15"
              center={[10, 0]}
              absolute={false}
              hasLegend={true}
              style={styles.pieChart}
            />
          </AdaptiveGlassView>
        </View>

        {/* 4. Expense History */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent transactions</Text>
            <TouchableOpacity>
              <Text style={styles.seeAllButton}>See all</Text>
            </TouchableOpacity>
          </View>

            <Table
              data={RECENT_TRANSACTIONS}
              columns={transactionColumns}
              showHeader={true}
              keyExtractor={(item) => item.id}
            />
        </View>

        {/* 5. Important Events */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Important events</Text>
          <View style={styles.eventsList}>
            {IMPORTANT_EVENTS.map((event) => (
              <AdaptiveGlassView key={event.id} style={styles.eventCard}>
                <View style={styles.eventIconContainer}>{getEventIcon(event.icon)}</View>
                <View style={styles.eventContent}>
                  <Text style={styles.eventTitle}>{event.title}</Text>
                  <Text style={styles.eventDescription}>{event.description}</Text>
                </View>
                <Text style={styles.eventTime}>{event.time}</Text>
              </AdaptiveGlassView>
            ))}
          </View>
        </View>

        <View style={styles.bottomSpacer} />
      </Animated.View>
    </ScrollView>
  );
}

const createStyles = (theme: ReturnType<typeof useAppTheme>) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    contentContainer: {
      paddingHorizontal: 16,
      paddingTop: 16,
    },

    // Balance Section
    balanceSection: {
      marginBottom: 24,
    },
    mainBalanceCard: {
      backgroundColor:theme.colors.card,
      borderRadius: 20,
      padding: 24,
      marginBottom: 12,
    },
    balanceLabel: {
      fontSize: 13,
      fontWeight: '600',
      color: theme.colors.textSecondary,
      marginBottom: 8,
      letterSpacing: 0.5,
    },
    balanceAmount: {
      fontSize: 36,
      fontWeight: '800',
      color: theme.colors.textSecondary,
      letterSpacing: -1,
    },
    inOutRow: {
      flexDirection: 'row',
      gap: 12,
    },
    inOutCard: {
      flex: 1,
      borderRadius: 16,
      padding: 16,
      backgroundColor:theme.colors.card,
    },
    inOutHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 8,
    },
    inOutLabel: {
      fontSize: 12,
      fontWeight: '600',
      color: theme.colors.textSecondary,
      letterSpacing: 0.3,
    },
    inOutAmount: {
      fontSize: 20,
      fontWeight: '700',
      marginBottom: 4,
      letterSpacing: -0.5,
    },
    inOutChange: {
      fontSize: 11,
      color: theme.colors.textMuted,
      fontWeight: '500',
    },

    // Section styles
    section: {
      marginBottom: 24,
    },
    sectionHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 12,
    },
    sectionTitle: {
      fontSize: 17,
      fontWeight: '600',
      color: theme.colors.textSecondary,
      marginBottom: 12,
      letterSpacing: -0.2,
    },
    seeAllButton: {
      fontSize: 12,
      color: theme.colors.textSecondary,
      fontWeight: '600',
    },

    // Progress Bar
    progressWrapper: {
      gap: 12,
    },
    progressLabelsRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      gap: 16,
    },
    progressLabelItem: {
      flex: 1,
      borderRadius: 12,
      padding: 12,
    },
    progressLabelRight: {
      alignItems: 'flex-end',
    },
    progressLabel: {
      fontSize: 11,
      fontWeight: '600',
      color: theme.colors.textSecondary,
      marginBottom: 4,
      letterSpacing: 0.3,
    },
    progressValue: {
      fontSize: 15,
      fontWeight: '700',
      color: theme.colors.textSecondary,
      letterSpacing: -0.2,
    },

    // Expense Structure
    expenseContainer: {
      alignItems: 'center',
      borderRadius: 16,
      padding: 16,
    },
    pieChart: {
      borderRadius: 16,
    },

    // Transactions (styles used by Table component)
    tableContainer: {
      borderRadius: 16,
    },
    transactionAmount: {
      fontSize: 14,
      fontWeight: '700',
    },
    transactionTime: {
      fontSize: 12,
      color: theme.colors.textSecondary,
    },

    // Events
    eventsList: {
      gap: 12,
    },
    eventCard: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: 16,
      borderRadius: 14,
      gap: 12,
    },
    eventIconContainer: {
      width: 40,
      height: 40,
      borderRadius: 12,
      backgroundColor: theme.colors.surfaceElevated,
      justifyContent: 'center',
      alignItems: 'center',
    },
    eventContent: {
      flex: 1,
      gap: 4,
    },
    eventTitle: {
      fontSize: 14,
      fontWeight: '700',
      color: theme.colors.textSecondary,
    },
    eventDescription: {
      fontSize: 12,
      color: theme.colors.textSecondary,
      lineHeight: 16,
    },
    eventTime: {
      fontSize: 11,
      color: theme.colors.textMuted,
      fontWeight: '500',
    },

    bottomSpacer: {
      height: 100,
    },
  });
