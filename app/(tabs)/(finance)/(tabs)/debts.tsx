// app/(tabs)/(finance)/(tabs)/debts.tsx
import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Plus, ArrowUpRight, ArrowDownLeft, Calendar, User, AlertCircle, CheckCircle, ClipboardList } from 'lucide-react-native';

import { Colors } from '@/constants/Colors';

interface Debt {
  id: string;
  type: 'owed_by_me' | 'owed_to_me';
  person: string;
  amount: number;
  currency: string;
  originalAmount: number;
  description: string;
  dueDate: string;
  status: 'pending' | 'partial' | 'overdue';
  avatar?: string;
  payments: Payment[];
}

interface Payment {
  id: string;
  amount: number;
  date: string;
}

const MOCK_DEBTS: Debt[] = [
  {
    id: '1',
    type: 'owed_by_me',
    person: 'Jovzod',
    amount: 2000,
    currency: 'USD',
    originalAmount: 2500,
    description: 'Loan for business',
    dueDate: '2025-10-05',
    status: 'pending',
    payments: [
      { id: 'p1', amount: 500, date: '2025-01-10' },
    ],
  },
  {
    id: '2',
    type: 'owed_by_me',
    person: 'Sardor',
    amount: 500000,
    currency: 'UZS',
    originalAmount: 500000,
    description: 'Borrowed for rent',
    dueDate: '2025-02-01',
    status: 'overdue',
    payments: [],
  },
  {
    id: '3',
    type: 'owed_to_me',
    person: 'Aziz',
    amount: 10000,
    currency: 'UZS',
    originalAmount: 15000,
    description: 'Personal loan',
    dueDate: '2025-10-11',
    status: 'partial',
    payments: [
      { id: 'p2', amount: 5000, date: '2024-12-20' },
    ],
  },
  {
    id: '4',
    type: 'owed_to_me',
    person: 'Bekzod',
    amount: 300,
    currency: 'USD',
    originalAmount: 300,
    description: 'Lent for emergency',
    dueDate: '2025-01-25',
    status: 'pending',
    payments: [],
  },
];

const DebtsPage = () => {
  const [debts] = useState<Debt[]>(MOCK_DEBTS);
  const [activeTab, setActiveTab] = useState<'all' | 'owed_by_me' | 'owed_to_me'>('all');

  const formatCurrency = (amount: number, currency: string) => {
    if (currency === 'UZS') {
      return new Intl.NumberFormat('uz-UZ', {
        minimumFractionDigits: 0,
      }).format(amount) + ' сум';
    }
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
    }).format(amount);
  };

  const calculateProgress = (amount: number, original: number) => {
    const paid = original - amount;
    return Math.round((paid / original) * 100);
  };

  const isOverdue = (dueDate: string) => {
    return new Date(dueDate) < new Date();
  };

  const getDaysRemaining = (dueDate: string) => {
    const today = new Date();
    const due = new Date(dueDate);
    const diff = Math.ceil((due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diff < 0) return `${Math.abs(diff)} days overdue`;
    if (diff === 0) return 'Due today';
    if (diff === 1) return 'Due tomorrow';
    return `${diff} days left`;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'overdue':
        return Colors.danger;
      case 'partial':
        return Colors.warning;
      case 'pending':
      default:
        return Colors.textSecondary;
    }
  };

  const getTotals = () => {
    const owedByMe = debts
      .filter(d => d.type === 'owed_by_me')
      .reduce((sum, d) => {
        const amount = d.currency === 'USD' ? d.amount : d.amount / 12650;
        return sum + amount;
      }, 0);

    const owedToMe = debts
      .filter(d => d.type === 'owed_to_me')
      .reduce((sum, d) => {
        const amount = d.currency === 'USD' ? d.amount : d.amount / 12650;
        return sum + amount;
      }, 0);

    return {
      owedByMe: Math.round(owedByMe),
      owedToMe: Math.round(owedToMe),
      netBalance: Math.round(owedToMe - owedByMe),
    };
  };

  const filteredDebts = debts.filter(debt => {
    if (activeTab === 'all') return true;
    return debt.type === activeTab;
  });

  const totals = getTotals();

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Summary Cards */}
      <View style={styles.summaryCards}>
        <View style={[styles.summaryCard, styles.owedByMeCard]}>
          <View style={styles.summaryCardHeader}>
            <View style={[styles.summaryIconContainer, styles.summaryIconNegative]}>
              <ArrowUpRight size={18} color={Colors.danger} />
            </View>
            <Text style={styles.summaryLabel}>I OWE</Text>
          </View>
          <Text style={[styles.summaryAmount, styles.negativeAmount]}>
            ${totals.owedByMe.toLocaleString()}
          </Text>
          <Text style={styles.summarySubtext}>
            {debts.filter(d => d.type === 'owed_by_me').length} active debts
          </Text>
        </View>

        <View style={[styles.summaryCard, styles.owedToMeCard]}>
          <View style={styles.summaryCardHeader}>
            <View style={[styles.summaryIconContainer, styles.summaryIconPositive]}>
              <ArrowDownLeft size={18} color={Colors.success} />
            </View>
            <Text style={styles.summaryLabel}>OWED TO ME</Text>
          </View>
          <Text style={[styles.summaryAmount, styles.positiveAmount]}>
            ${totals.owedToMe.toLocaleString()}
          </Text>
          <Text style={styles.summarySubtext}>
            {debts.filter(d => d.type === 'owed_to_me').length} loans out
          </Text>
        </View>
      </View>

      {/* Net Balance */}
      <View style={styles.netBalanceCard}>
        <Text style={styles.netBalanceLabel}>Net Balance</Text>
        <Text style={[
          styles.netBalanceAmount,
          totals.netBalance >= 0 ? styles.positiveAmount : styles.negativeAmount
        ]}>
          {totals.netBalance >= 0 ? '+' : ''}${Math.abs(totals.netBalance).toLocaleString()}
        </Text>
        <Text style={styles.netBalanceSubtext}>
          {totals.netBalance >= 0 
            ? 'You are owed more than you owe' 
            : 'You owe more than owed to you'}
        </Text>
      </View>

      {/* Filter Tabs */}
      <View style={styles.filterTabs}>
        <TouchableOpacity
          style={[styles.filterTab, activeTab === 'all' && styles.filterTabActive]}
          onPress={() => setActiveTab('all')}
        >
          <Text style={[styles.filterTabText, activeTab === 'all' && styles.filterTabTextActive]}>
            All ({debts.length})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.filterTab, activeTab === 'owed_by_me' && styles.filterTabActive]}
          onPress={() => setActiveTab('owed_by_me')}
        >
          <Text style={[styles.filterTabText, activeTab === 'owed_by_me' && styles.filterTabTextActive]}>
            I Owe ({debts.filter(d => d.type === 'owed_by_me').length})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.filterTab, activeTab === 'owed_to_me' && styles.filterTabActive]}
          onPress={() => setActiveTab('owed_to_me')}
        >
          <Text style={[styles.filterTabText, activeTab === 'owed_to_me' && styles.filterTabTextActive]}>
            Owed to Me ({debts.filter(d => d.type === 'owed_to_me').length})
          </Text>
        </TouchableOpacity>
      </View>

      {/* Debts List */}
      <View style={styles.debtsList}>
        {filteredDebts.length === 0 ? (
          <View style={styles.emptyState}>
            <View style={styles.emptyStateIcon}>
              <ClipboardList size={28} color={Colors.textPrimary} />
            </View>
            <Text style={styles.emptyStateTitle}>No debts found</Text>
            <Text style={styles.emptyStateSubtitle}>
              {activeTab === 'all' 
                ? 'Add a debt to get started' 
                : activeTab === 'owed_by_me'
                ? 'You have no outstanding debts'
                : 'No one owes you money'}
            </Text>
          </View>
        ) : (
          filteredDebts.map((debt) => {
            const progress = calculateProgress(debt.amount, debt.originalAmount);
            const daysInfo = getDaysRemaining(debt.dueDate);
            const overdue = isOverdue(debt.dueDate);

            return (
              <TouchableOpacity key={debt.id} style={styles.debtCard}>
                {/* Debt Header */}
                <View style={styles.debtHeader}>
                  <View
                    style={[
                      styles.debtIconContainer,
                      {
                        backgroundColor:
                          (debt.type === 'owed_by_me' ? Colors.danger : Colors.success) + '1A',
                      },
                    ]}
                  >
                    <User
                      size={22}
                      color={debt.type === 'owed_by_me' ? Colors.danger : Colors.success}
                    />
                  </View>
                  <View style={styles.debtHeaderInfo}>
                    <Text style={styles.debtPerson}>{debt.person}</Text>
                    <Text style={styles.debtDescription}>{debt.description}</Text>
                  </View>
                  <View style={styles.debtTypeIndicator}>
                    {debt.type === 'owed_by_me' ? (
                      <ArrowUpRight size={18} color={Colors.danger} />
                    ) : (
                      <ArrowDownLeft size={18} color={Colors.success} />
                    )}
                  </View>
                </View>

                {/* Amount Section */}
                <View style={styles.debtAmountSection}>
                  <View style={styles.debtAmountRow}>
                    <Text style={styles.debtAmountLabel}>Amount</Text>
                    <Text
                      style={[
                        styles.debtAmount,
                        { color: debt.type === 'owed_by_me' ? Colors.danger : Colors.success },
                      ]}
                    >
                      {debt.type === 'owed_by_me' ? '-' : '+'}
                      {formatCurrency(debt.amount, debt.currency)}
                    </Text>
                  </View>
                  
                  {progress > 0 && progress < 100 && (
                    <>
                      <View style={styles.debtProgressBar}>
                        <View
                          style={[
                            styles.debtProgressFill,
                            {
                              width: `${progress}%`,
                              backgroundColor:
                                debt.type === 'owed_by_me' ? Colors.danger : Colors.success,
                            },
                          ]}
                        />
                      </View>
                      <Text style={styles.debtProgressText}>
                        {formatCurrency(debt.originalAmount - debt.amount, debt.currency)} paid ({progress}%)
                      </Text>
                    </>
                  )}
                </View>

                {/* Due Date Section */}
                <View style={[
                  styles.debtDueSection,
                  overdue && styles.debtOverdue
                ]}>
                  <View style={styles.debtDueInfo}>
                    <Calendar
                      size={14}
                      color={overdue ? Colors.danger : Colors.textSecondary}
                    />
                    <Text
                      style={[
                        styles.debtDueText,
                        overdue && styles.debtDueTextOverdue,
                      ]}
                    >
                      {daysInfo}
                    </Text>
                  </View>
                  {overdue && (
                    <View style={styles.overdueTag}>
                      <AlertCircle size={14} color={Colors.danger} />
                      <Text style={styles.overdueTagText}>OVERDUE</Text>
                    </View>
                  )}
                  {debt.status === 'partial' && !overdue && (
                    <View style={styles.partialTag}>
                      <CheckCircle size={14} color={Colors.warning} />
                      <Text style={styles.partialTagText}>PARTIAL</Text>
                    </View>
                  )}
                </View>

                {/* Payment History */}
                {debt.payments.length > 0 && (
                  <View style={styles.debtPayments}>
                    <Text style={styles.debtPaymentsTitle}>Payment History</Text>
                    {debt.payments.map((payment) => (
                      <View key={payment.id} style={styles.paymentItem}>
                        <View style={styles.paymentDot} />
                        <Text style={styles.paymentAmount}>
                          {formatCurrency(payment.amount, debt.currency)}
                        </Text>
                        <Text style={styles.paymentDate}>
                          {new Date(payment.date).toLocaleDateString()}
                        </Text>
                      </View>
                    ))}
                  </View>
                )}

                {/* Action Buttons */}
                <View style={styles.debtActions}>
                  {debt.type === 'owed_by_me' ? (
                    <>
                      <TouchableOpacity style={[styles.debtActionButton, styles.payButton]}>
                        <Text style={styles.debtActionText}>Pay</Text>
                      </TouchableOpacity>
                      <TouchableOpacity style={[styles.debtActionButton, styles.secondaryButton]}>
                        <Text style={styles.secondaryButtonText}>Remind Me</Text>
                      </TouchableOpacity>
                    </>
                  ) : (
                    <>
                      <TouchableOpacity style={[styles.debtActionButton, styles.collectButton]}>
                        <Text style={styles.debtActionText}>Mark Paid</Text>
                      </TouchableOpacity>
                      <TouchableOpacity style={[styles.debtActionButton, styles.secondaryButton]}>
                        <Text style={styles.secondaryButtonText}>Send Reminder</Text>
                      </TouchableOpacity>
                    </>
                  )}
                </View>
              </TouchableOpacity>
            );
          })
        )}
      </View>

      {/* Add Debt Button */}
      <TouchableOpacity style={styles.addDebtButton}>
        <Plus color={Colors.textPrimary} size={20} />
        <Text style={styles.addDebtText}>Add New Debt</Text>
      </TouchableOpacity>

      <View style={styles.bottomSpacer} />
    </ScrollView>
  );
};

export default DebtsPage;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  summaryCards: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingTop: 16,
    gap: 12,
    marginBottom: 16,
  },
  summaryCard: {
    flex: 1,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.surface,
    gap: 10,
  },
  owedByMeCard: {},
  owedToMeCard: {},
  summaryCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  summaryIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  summaryIconNegative: {
    backgroundColor: Colors.dangerBg,
  },
  summaryIconPositive: {
    backgroundColor: Colors.successBg,
  },
  summaryLabel: {
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 0.5,
    color: Colors.textSecondary,
  },
  summaryAmount: {
    fontSize: 22,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  negativeAmount: {
    color: Colors.danger,
  },
  positiveAmount: {
    color: Colors.success,
  },
  summarySubtext: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  netBalanceCard: {
    marginHorizontal: 16,
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 18,
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: 6,
  },
  netBalanceLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  netBalanceAmount: {
    fontSize: 26,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  netBalanceSubtext: {
    fontSize: 12,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  filterTabs: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    gap: 8,
    marginBottom: 16,
  },
  filterTab: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.surface,
  },
  filterTabActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  filterTabText: {
    fontSize: 12,
    fontWeight: '500',
    color: Colors.textSecondary,
  },
  filterTabTextActive: {
    color: Colors.background,
  },
  debtsList: {
    paddingHorizontal: 16,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
    gap: 12,
  },
  emptyStateIcon: {
    width: 52,
    height: 52,
    borderRadius: 26,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  emptyStateSubtitle: {
    fontSize: 13,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  debtCard: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  debtHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
    gap: 12,
  },
  debtIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  debtHeaderInfo: {
    flex: 1,
    gap: 2,
  },
  debtPerson: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  debtDescription: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  debtTypeIndicator: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: Colors.surfaceElevated,
    justifyContent: 'center',
    alignItems: 'center',
  },
  debtAmountSection: {
    marginBottom: 12,
    gap: 6,
  },
  debtAmountRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  debtAmountLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  debtAmount: {
    fontSize: 18,
    fontWeight: '600',
  },
  debtProgressBar: {
    height: 6,
    backgroundColor: Colors.overlay.light,
    borderRadius: 3,
    overflow: 'hidden',
  },
  debtProgressFill: {
    height: '100%',
    borderRadius: 3,
  },
  debtProgressText: {
    fontSize: 11,
    color: Colors.textSecondary,
  },
  debtDueSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 12,
    backgroundColor: Colors.surfaceElevated,
    borderRadius: 10,
    marginBottom: 12,
  },
  debtOverdue: {
    backgroundColor: Colors.dangerBg,
    borderWidth: 1,
    borderColor: Colors.danger + '45',
  },
  debtDueInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  debtDueText: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  debtDueTextOverdue: {
    color: Colors.danger,
  },
  overdueTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
    backgroundColor: Colors.dangerBg,
  },
  overdueTagText: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.danger,
  },
  partialTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
    backgroundColor: Colors.warningBg,
  },
  partialTagText: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.warning,
  },
  debtPayments: {
    marginTop: 12,
    gap: 8,
  },
  debtPaymentsTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  paymentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  paymentDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.textSecondary,
  },
  paymentAmount: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  paymentDate: {
    fontSize: 11,
    color: Colors.textSecondary,
  },
  debtActions: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 16,
  },
  debtActionButton: {
    flex: 1,
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  payButton: {
    backgroundColor: Colors.danger,
  },
  collectButton: {
    backgroundColor: Colors.success,
  },
  secondaryButton: {
    backgroundColor: Colors.surfaceElevated,
  },
  debtActionText: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  secondaryButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  addDebtButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginHorizontal: 16,
    marginTop: 8,
    backgroundColor: Colors.surface,
    borderRadius: 14,
    paddingVertical: 14,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: Colors.border,
  },
  addDebtText: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.textPrimary,
  },
  bottomSpacer: {
    height: 90,
  },
});
