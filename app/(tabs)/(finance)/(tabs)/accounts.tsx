// app/(tabs)/(finance)/(tabs)/accounts.tsx
import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import {
  CreditCard,
  Eye,
  EyeOff,
  PiggyBank,
  Plus,
  Wallet,
} from 'lucide-react-native';

import { Colors } from '@/constants/Colors';

type AccountIcon = typeof Wallet;

interface Account {
  id: string;
  name: string;
  type: string;
  balance: number;
  currency: string;
  icon: AccountIcon;
  tone: string;
}

const ACCOUNTS: Account[] = [
  {
    id: '1',
    name: 'Cash',
    type: 'Cash',
    balance: 10_000,
    currency: 'UZS',
    icon: Wallet,
    tone: Colors.info,
  },
  {
    id: '2',
    name: 'USD Wallet',
    type: 'Cash',
    balance: 1_007_960,
    currency: 'USD',
    icon: PiggyBank,
    tone: Colors.primary,
  },
  {
    id: '3',
    name: 'Humo Card',
    type: 'Card',
    balance: 100_000_000,
    currency: 'UZS',
    icon: CreditCard,
    tone: Colors.secondary,
  },
];

const formatBalance = (value: number, currency: string) =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: currency === 'UZS' ? 0 : 2,
  }).format(value);

export default function AccountsTab() {
  const [hiddenAccounts, setHiddenAccounts] = React.useState<Set<string>>(new Set());

  const toggleVisibility = (id: string) => {
    setHiddenAccounts((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.list}>
        {ACCOUNTS.map((account) => {
          const Icon = account.icon;
          const hidden = hiddenAccounts.has(account.id);

          return (
            <View key={account.id} style={styles.card}>
              <View style={[styles.iconBadge, { backgroundColor: account.tone + '1A' }]}>
                <Icon size={18} color={account.tone} strokeWidth={2} />
              </View>

              <View style={styles.info}>
                <Text style={styles.name}>{account.name}</Text>
                <Text style={styles.type}>{account.type}</Text>
                <Text style={styles.balance}>
                  {hidden ? '••••••' : formatBalance(account.balance, account.currency)}
                </Text>
              </View>

              <TouchableOpacity
                onPress={() => toggleVisibility(account.id)}
                style={styles.visibilityButton}
                activeOpacity={0.7}
              >
                {hidden ? (
                  <EyeOff size={18} color={Colors.textTertiary} />
                ) : (
                  <Eye size={18} color={Colors.textTertiary} />
                )}
              </TouchableOpacity>
            </View>
          );
        })}
      </View>

      <TouchableOpacity style={styles.addButton} activeOpacity={0.75}>
        <Plus size={18} color={Colors.textPrimary} />
        <Text style={styles.addText}>Add new account</Text>
      </TouchableOpacity>

      <View style={styles.bottomSpacer} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  list: {
    gap: 12,
    marginBottom: 20,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  iconBadge: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  info: {
    flex: 1,
  },
  name: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  type: {
    fontSize: 11,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  balance: {
    marginTop: 6,
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  visibilityButton: {
    padding: 6,
  },
  addButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    borderRadius: 14,
    paddingVertical: 14,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: Colors.border,
    backgroundColor: Colors.surface,
  },
  addText: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.textPrimary,
  },
  bottomSpacer: {
    height: 80,
  },
});

