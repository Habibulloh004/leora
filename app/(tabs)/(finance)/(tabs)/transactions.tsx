import React, { useCallback, useRef } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SlidersHorizontal } from 'lucide-react-native';

import FilterTransactionSheet, {
  FilterState,
  FilterTransactionSheetHandle,
} from '@/components/modals/finance/FilterTransactionSheet';
import { useAppTheme } from '@/constants/theme';
import TransactionGroup from '@/components/screens/finance/transactions/TransactionGroup';
import { SAMPLE_TRANSACTION_GROUPS } from '@/components/screens/finance/transactions/sample-data';

const TransactionsPage: React.FC = () => {
  const theme = useAppTheme();
  const filterSheetRef = useRef<FilterTransactionSheetHandle>(null);

  const openFilters = useCallback(() => {
    filterSheetRef.current?.open();
  }, []);

  const handleApplyFilters = useCallback((filters: FilterState) => {
    console.log('Apply filters', filters);
  }, []);

  const handleResetFilters = useCallback(() => {
    console.log('Reset filters');
  }, []);

  return (
    <>
      <ScrollView
        style={[styles.screen, { backgroundColor: theme.colors.background }]}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.headerRow}>
          <Text style={[styles.headerTitle, { color: theme.colors.textPrimary }]}>Transactions history</Text>

          <Pressable
            onPress={openFilters}
            style={({ pressed }) => [
              styles.filterButton,
              {
                backgroundColor: theme.colors.surface,
                borderColor: theme.colors.border,
              },
              pressed && styles.pressedOpacity,
            ]}
          >
            <SlidersHorizontal size={18} color={theme.colors.textSecondary} />
          </Pressable>
        </View>

        {SAMPLE_TRANSACTION_GROUPS.map((group) => (
          <TransactionGroup key={group.id} group={group} />
        ))}

        <View style={styles.bottomSpacer} />
      </ScrollView>

      <FilterTransactionSheet
        ref={filterSheetRef}
        onApply={handleApplyFilters}
        onReset={handleResetFilters}
      />
    </>
  );
};

export default TransactionsPage;

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 36,
    gap: 24,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    letterSpacing: -0.3,
  },
  filterButton: {
    width: 42,
    height: 42,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressedOpacity: {
    opacity: 0.85,
  },
  bottomSpacer: {
    height: 40,
  },
});
