import React, { useCallback, useMemo, useRef, useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { BottomSheetTextInput } from '@gorhom/bottom-sheet';
import {
  AlertTriangle,
  BellRing,
  Calendar,
  CircleDollarSign,
  HandCoins,
  LucideIcon,
  Plus,
  UserRound,
} from 'lucide-react-native';

import CustomBottomSheet, {
  BottomSheetHandle,
} from '@/components/modals/BottomSheet';
import { AdaptiveGlassView } from '@/components/ui/AdaptiveGlassView';
import type { Theme } from '@/constants/theme';
import { useAppTheme } from '@/constants/theme';

type Debt = {
  id: string;
  name: string;
  description: string;
  amount: string;
  secondary?: string;
  dueIn: string;
  isIncoming: boolean;
};

type DebtSectionData = {
  title: string;
  debts: Debt[];
};

type DebtAction = {
  label: string;
  Icon: LucideIcon;
};

type AddDebtModalProps = {
  onSubmit: (payload: Debt) => void;
};

export type AddDebtModalHandle = {
  open: () => void;
  close: () => void;
};

const INCOMING_DEBTS: Debt[] = [
  {
    id: 'bekzod',
    name: 'Bekzod',
    description: 'Toke for repairment',
    amount: '+$150',
    secondary: '(1.7m UZS)',
    dueIn: 'in 2 days',
    isIncoming: true,
  },
  {
    id: 'aziz',
    name: 'Aziz',
    description: 'For present',
    amount: '+500 000',
    dueIn: 'in -5 days',
    isIncoming: true,
  },
];

const OUTGOING_DEBTS: Debt[] = [
  {
    id: 'parents',
    name: 'For parents',
    description: 'Current outcome',
    amount: '-500 000',
    dueIn: 'No period',
    isIncoming: false,
  },
];

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    root: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    content: {
      paddingHorizontal: theme.spacing.lg,
      paddingTop: theme.spacing.lg,
      paddingBottom: theme.spacing.xxxl,
      gap: theme.spacing.xxl,
    },
    section: {
      gap: theme.spacing.md,
    },
    sectionTitle: {
      fontSize: 16,
      fontWeight: '600',
      color: theme.colors.textPrimary,
    },
    sectionDivider: {
      height: StyleSheet.hairlineWidth,
      backgroundColor: theme.colors.border,
    },
    card: {
      borderRadius: theme.radius.xxl,
      padding: theme.spacing.lg,
      gap: theme.spacing.md,
    },
    cardHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      gap: theme.spacing.md,
    },
    personBlock: {
      flexDirection: 'row',
      gap: theme.spacing.md,
      flex: 1,
    },
    avatar: {
      width: 40,
      height: 40,
      borderRadius: theme.radius.lg,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor:
        theme.mode === 'dark'
          ? 'rgba(148,163,184,0.12)'
          : 'rgba(15,23,42,0.08)',
    },
    name: {
      fontSize: 15,
      fontWeight: '600',
      color: theme.colors.textPrimary,
    },
    description: {
      fontSize: 12,
      color: theme.colors.textSecondary,
    },
    amountBlock: {
      alignItems: 'flex-end',
      gap: 4,
    },
    amount: {
      fontSize: 16,
      fontWeight: '600',
      color: theme.colors.textPrimary,
    },
    secondary: {
      fontSize: 12,
      color: theme.colors.textSecondary,
    },
    timelineRow: {
      flexDirection: 'row',
      gap: theme.spacing.md,
      alignItems: 'center',
    },
    timelineLabel: {
      fontSize: 12,
      color: theme.colors.textSecondary,
    },
    timelineValue: {
      fontSize: 12,
      fontWeight: '600',
      color: theme.colors.textPrimary,
    },
    actionsRow: {
      flexDirection: 'row',
      gap: theme.spacing.sm,
    },
    actionButton: {
      flex: 1,
      borderRadius: theme.radius.full,
      paddingVertical: theme.spacing.sm,
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      gap: theme.spacing.xs,
      backgroundColor:
        theme.mode === 'dark'
          ? 'rgba(148,163,184,0.12)'
          : 'rgba(15,23,42,0.08)',
    },
    actionLabel: {
      fontSize: 12,
      fontWeight: '600',
      color: theme.colors.textSecondary,
    },
    fabWrapper: {
      position: 'absolute',
      right: theme.spacing.lg,
      bottom: theme.spacing.xxl,
    },
    fab: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.sm,
      borderRadius: theme.radius.full,
      paddingHorizontal: theme.spacing.lg,
      paddingVertical: theme.spacing.md,
      backgroundColor:
        theme.mode === 'dark'
          ? 'rgba(148,163,184,0.16)'
          : 'rgba(15,23,42,0.1)',
    },
    fabLabel: {
      fontSize: 13,
      fontWeight: '600',
      color: theme.colors.textPrimary,
    },
    modalContent: {
      paddingHorizontal: theme.spacing.lg,
      paddingBottom: theme.spacing.lg,
      gap: theme.spacing.md,
    },
    modalTitle: {
      fontSize: 16,
      fontWeight: '600',
      color: theme.colors.textPrimary,
    },
    input: {
      borderRadius: theme.radius.lg,
      borderWidth: 1,
      paddingHorizontal: theme.spacing.md,
      paddingVertical: theme.spacing.sm,
      fontSize: 14,
    },
    inputRow: {
      flexDirection: 'row',
      gap: theme.spacing.sm,
    },
    inputHalf: {
      flex: 1,
    },
    toggleRow: {
      flexDirection: 'row',
      gap: theme.spacing.sm,
    },
    toggleOption: {
      flex: 1,
      borderRadius: theme.radius.full,
      paddingVertical: theme.spacing.sm,
      alignItems: 'center',
      backgroundColor:
        theme.mode === 'dark'
          ? 'rgba(148,163,184,0.12)'
          : 'rgba(15,23,42,0.08)',
    },
    toggleOptionActive: {
      backgroundColor: theme.colors.success,
    },
    toggleLabel: {
      fontSize: 12,
      fontWeight: '600',
      color: theme.colors.textSecondary,
    },
    toggleLabelActive: {
      color: theme.colors.onSuccess,
    },
    modalActions: {
      flexDirection: 'row',
      gap: theme.spacing.sm,
    },
    modalButtonPrimary: {
      flex: 1,
      borderRadius: theme.radius.full,
      paddingVertical: theme.spacing.sm,
      alignItems: 'center',
      backgroundColor: theme.colors.primary,
    },
    modalButtonTextPrimary: {
      fontSize: 13,
      fontWeight: '600',
      color: theme.colors.onPrimary,
    },
    modalButtonSecondary: {
      flex: 1,
      borderRadius: theme.radius.full,
      paddingVertical: theme.spacing.sm,
      alignItems: 'center',
      backgroundColor:
        theme.mode === 'dark'
          ? 'rgba(148,163,184,0.12)'
          : 'rgba(15,23,42,0.08)',
    },
    modalButtonTextSecondary: {
      fontSize: 13,
      fontWeight: '600',
      color: theme.colors.textSecondary,
    },
  });

const DebtCard = ({ debt }: { debt: Debt }) => {
  const theme = useAppTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);

  const actions: DebtAction[] = debt.isIncoming
    ? [
        { label: 'Notify', Icon: BellRing },
        { label: 'Cancel debt', Icon: AlertTriangle },
      ]
    : [
        { label: 'Plan', Icon: Calendar },
        { label: 'Pay partly', Icon: HandCoins },
      ];

  return (
    <AdaptiveGlassView style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={styles.personBlock}>
          <View style={styles.avatar}>
            <UserRound size={18} color={theme.colors.textSecondary} />
          </View>
          <View style={{ gap: 4 }}>
            <Text style={styles.name}>{debt.name}</Text>
            <Text style={styles.description}>{debt.description}</Text>
          </View>
        </View>
        <View style={styles.amountBlock}>
          <Text
            style={[
              styles.amount,
              { color: debt.isIncoming ? theme.colors.success : theme.colors.danger },
            ]}
          >
            {debt.amount}
          </Text>
          {debt.secondary ? <Text style={styles.secondary}>{debt.secondary}</Text> : null}
        </View>
      </View>

      <View style={styles.timelineRow}>
        <View style={styles.avatar}>
          <Calendar size={16} color={debt.isIncoming ? '#22c55e' : '#ef4444'} />
        </View>
        <View>
          <Text style={styles.timelineLabel}>
            {debt.isIncoming ? 'Gives back in' : 'Period'}
          </Text>
          <Text style={styles.timelineValue}>{debt.dueIn}</Text>
        </View>
      </View>

      <View style={styles.actionsRow}>
        {actions.map(({ label, Icon }) => (
          <View key={label} style={styles.actionButton}>
            <Icon size={14} color={theme.colors.textSecondary} />
            <Text style={styles.actionLabel}>{label}</Text>
          </View>
        ))}
      </View>
    </AdaptiveGlassView>
  );
};

const DebtSection = ({ section }: { section: DebtSectionData }) => {
  const theme = useAppTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);

  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{section.title}</Text>
      <View style={styles.sectionDivider} />
      <View style={{ gap: theme.spacing.md }}>
        {section.debts.map((debt) => (
          <DebtCard key={debt.id} debt={debt} />
        ))}
      </View>
    </View>
  );
};

const AddDebtModal = React.forwardRef<AddDebtModalHandle, AddDebtModalProps>(
  ({ onSubmit }, ref) => {
    const theme = useAppTheme();
    const styles = useMemo(() => createStyles(theme), [theme]);
    const sheetRef = useRef<BottomSheetHandle>(null);

    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [amount, setAmount] = useState('');
    const [secondary, setSecondary] = useState('');
    const [dueIn, setDueIn] = useState('');
    const [isIncoming, setIsIncoming] = useState(true);

    React.useImperativeHandle(ref, () => ({
      open: () => {
        sheetRef.current?.present();
      },
      close: () => sheetRef.current?.dismiss(),
    }));

    const resetForm = useCallback(() => {
      setName('');
      setDescription('');
      setAmount('');
      setSecondary('');
      setDueIn('');
      setIsIncoming(true);
    }, []);

    const handleSubmit = () => {
      onSubmit({
        id: `${Date.now()}`,
        name: name || 'New debt',
        description: description || 'Description',
        amount: amount || '+0',
        secondary: secondary || undefined,
        dueIn: dueIn || 'No period',
        isIncoming,
      });
      resetForm();
      sheetRef.current?.dismiss();
    };

    const backgroundColor =
      theme.mode === 'dark' ? 'rgba(20,20,24,0.94)' : 'rgba(240,240,246,0.94)';

    return (
      <CustomBottomSheet
        ref={sheetRef}
        snapPoints={['45%', '70%']}
        enableDynamicSizing={false}
        backgroundStyle={{ backgroundColor }}
        handleIndicatorStyle={{ backgroundColor: theme.colors.textMuted }}
        onDismiss={resetForm}
      >
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Add new debt</Text>
          <BottomSheetTextInput
            placeholder="Name"
            placeholderTextColor={theme.colors.textSecondary}
            value={name}
            onChangeText={setName}
            style={[styles.input, { color: theme.colors.textPrimary, borderColor: theme.colors.border }]}
          />
          <BottomSheetTextInput
            placeholder="Description"
            placeholderTextColor={theme.colors.textSecondary}
            value={description}
            onChangeText={setDescription}
            style={[styles.input, { color: theme.colors.textPrimary, borderColor: theme.colors.border }]}
          />
          <View style={styles.inputRow}>
            <BottomSheetTextInput
              placeholder="Amount"
              placeholderTextColor={theme.colors.textSecondary}
              value={amount}
              onChangeText={setAmount}
              style={[styles.input, styles.inputHalf, { color: theme.colors.textPrimary, borderColor: theme.colors.border }]}
            />
            <BottomSheetTextInput
              placeholder="Secondary"
              placeholderTextColor={theme.colors.textSecondary}
              value={secondary}
              onChangeText={setSecondary}
              style={[styles.input, styles.inputHalf, { color: theme.colors.textPrimary, borderColor: theme.colors.border }]}
            />
          </View>
          <BottomSheetTextInput
            placeholder="Due / Period"
            placeholderTextColor={theme.colors.textSecondary}
            value={dueIn}
            onChangeText={setDueIn}
            style={[styles.input, { color: theme.colors.textPrimary, borderColor: theme.colors.border }]}
          />

          <View style={styles.toggleRow}>
            <Pressable
              style={[styles.toggleOption, isIncoming && styles.toggleOptionActive]}
              onPress={() => setIsIncoming(true)}
            >
              <Text
                style={[styles.toggleLabel, isIncoming && styles.toggleLabelActive]}
              >
                They owe me
              </Text>
            </Pressable>
            <Pressable
              style={[styles.toggleOption, !isIncoming && styles.toggleOptionActive]}
              onPress={() => setIsIncoming(false)}
            >
              <Text
                style={[styles.toggleLabel, !isIncoming && styles.toggleLabelActive]}
              >
                I owe
              </Text>
            </Pressable>
          </View>

          <View style={styles.modalActions}>
            <Pressable style={styles.modalButtonSecondary} onPress={() => sheetRef.current?.dismiss()}>
              <Text style={styles.modalButtonTextSecondary}>Cancel</Text>
            </Pressable>
            <Pressable style={styles.modalButtonPrimary} onPress={handleSubmit}>
              <Text style={styles.modalButtonTextPrimary}>Save</Text>
            </Pressable>
          </View>
        </View>
      </CustomBottomSheet>
    );
  },
);
AddDebtModal.displayName = 'AddDebtModal';

const DebtsScreen: React.FC = () => {
  const theme = useAppTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);

  const [incoming, setIncoming] = useState<Debt[]>(INCOMING_DEBTS);
  const [outgoing, setOutgoing] = useState<Debt[]>(OUTGOING_DEBTS);

  const modalRef = useRef<AddDebtModalHandle>(null);

  const handleAddDebt = useCallback((debt: Debt) => {
    if (debt.isIncoming) {
      setIncoming((prev) => [debt, ...prev]);
    } else {
      setOutgoing((prev) => [debt, ...prev]);
    }
  }, []);

  const sections: DebtSectionData[] = [
    { title: 'Debts', debts: incoming },
    { title: 'My debts', debts: outgoing },
  ];

  return (
    <View style={styles.root}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {sections.map((section) => (
          <DebtSection key={section.title} section={section} />
        ))}
      </ScrollView>
      <AddDebtModal ref={modalRef} onSubmit={handleAddDebt} />
    </View>
  );
};

export default DebtsScreen;
