import React, {
  forwardRef,
  useCallback,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import Animated, { Easing } from 'react-native-reanimated';
import {
  Banknote,
  Bitcoin,
  CreditCard,
  DollarSign,
  PiggyBank,
  Sparkles,
} from 'lucide-react-native';

import CustomBottomSheet, {
  BottomSheetHandle,
} from '@/components/modals/BottomSheet';
import { AdaptiveGlassView } from '@/components/ui/AdaptiveGlassView';
import { useAppTheme } from '@/constants/theme';
import type {
  AccountItem,
  AddAccountPayload,
  AccountKind,
} from '@/types/accounts';
import { BottomSheetTextInput } from '@gorhom/bottom-sheet';

export type { AddAccountPayload } from '@/types/accounts';

interface AddAccountSheetProps {
  onSubmit: (payload: AddAccountPayload) => void;
  onEditSubmit?: (id: string, payload: AddAccountPayload) => void;
}

type TypeOption = {
  id: AccountKind;
  label: string;
  Icon: typeof Banknote;
};

const TYPE_OPTIONS: TypeOption[] = [
  { id: 'cash', label: 'Cash', Icon: Banknote },
  { id: 'card', label: 'Card', Icon: CreditCard },
  { id: 'savings', label: 'Savings', Icon: PiggyBank },
  { id: 'usd', label: 'USD', Icon: DollarSign },
  { id: 'crypto', label: 'Crypto', Icon: Bitcoin },
  { id: 'other', label: 'Other', Icon: Sparkles },
];

const ITEM_SPACING = 12;
const ICON_SIZE = 18;

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export interface AddAccountSheetHandle {
  expand: () => void;
  close: () => void;
  edit: (account: AccountItem) => void;
}

interface TypeOptionItemProps {
  option: TypeOption;
  isSelected: boolean;
  onSelect: (id: AccountKind) => void;
  theme: ReturnType<typeof useAppTheme>;
}

const TypeOptionItem: React.FC<TypeOptionItemProps> = ({
  option,
  isSelected,
  onSelect,
  theme,
}) => {
  const { Icon, label, id } = option;

  return (
    <View style={styles.typeItem}>
      <Pressable
        onPress={() => onSelect(id)}
        android_ripple={{ color: theme.colors.borderMuted, borderless: false }}
        style={({ pressed }) => [
          styles.typePressable,
          pressed && { opacity: 0.9 },
        ]}
      >
        <AdaptiveGlassView
          style={[
            styles.typeCard,
            {
              borderColor: isSelected
                ? theme.colors.primary
                : theme.colors.border,
            },
          ]}
        >
          <View style={styles.typeInner}>
            <Icon
              size={ICON_SIZE}
              color={isSelected ? theme.colors.primary : theme.colors.textSecondary}
            />
            <Text
              style={[
                styles.typeLabel,
                {
                  color: isSelected
                    ? theme.colors.primary
                    : theme.colors.textSecondary,
                },
              ]}
            >
              {label}
            </Text>
          </View>
        </AdaptiveGlassView>
      </Pressable>
    </View>
  );
};

const AddAccountSheet = forwardRef<AddAccountSheetHandle, AddAccountSheetProps>(
  ({ onSubmit, onEditSubmit }, ref) => {
    const theme = useAppTheme();
    const sheetRef = useRef<BottomSheetHandle>(null);

    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [amount, setAmount] = useState('');
    const [selectedType, setSelectedType] = useState<AccountKind>('cash');
    const [formMode, setFormMode] = useState<'create' | 'edit'>('create');
    const editingAccountId = useRef<string | null>(null);

    const snapPoints = useMemo<(string | number)[]>(() => ['55%', '80%'], []);
    const animationConfigs = useMemo(
      () => ({
        duration: 400,
        easing: Easing.linear,
      }),
      [],
    );

    const handleResetForm = useCallback(() => {
      setName('');
      setDescription('');
      setAmount('');
      setSelectedType('cash');
      setFormMode('create');
      editingAccountId.current = null;
    }, []);

    useImperativeHandle(
      ref,
      () => ({
        expand: () => {
          handleResetForm();
          sheetRef.current?.present();
        },
        edit: (account: AccountItem) => {
          setFormMode('edit');
          editingAccountId.current = account.id;
          setName(account.name);
          setDescription(account.subtitle ?? '');
          setAmount(String(account.balance));
          setSelectedType(account.type);
          sheetRef.current?.present();
        },
        close: () => sheetRef.current?.dismiss(),
      }),
      [handleResetForm],
    );

    const handleCancel = useCallback(() => {
      sheetRef.current?.dismiss();
      handleResetForm();
    }, [handleResetForm]);

    const handleSubmit = useCallback(() => {
      const parsedAmount = Number(
        amount.replace(/[^0-9.-]+/g, '').trim() || '0',
      );

      const payload: AddAccountPayload = {
        name: name.trim(),
        description: description.trim(),
        amount: Number.isFinite(parsedAmount) ? parsedAmount : 0,
        type: selectedType,
      };

      if (formMode === 'edit' && editingAccountId.current) {
        onEditSubmit?.(editingAccountId.current, payload);
      } else {
        onSubmit(payload);
      }

      handleResetForm();
      sheetRef.current?.dismiss();
    }, [
      amount,
      description,
      formMode,
      handleResetForm,
      name,
      onEditSubmit,
      onSubmit,
      selectedType,
    ]);

    const isEditMode = formMode === 'edit';

    return (
      <CustomBottomSheet
        ref={sheetRef}
        snapPoints={snapPoints}
        animationConfigs={animationConfigs}
        enableDynamicSizing={false}
        enablePanDownToClose
        scrollable
        scrollProps={{ keyboardShouldPersistTaps: 'handled' }}
        backgroundStyle={[
          styles.sheetBackground,
          {
            backgroundColor:
              theme.mode === 'dark'
                ? 'rgba(22,22,28,0.92)'
                : 'rgba(255,255,255,0.9)',
            borderColor: theme.colors.borderMuted,
          },
        ]}
        handleIndicatorStyle={[
          styles.handleIndicator,
          { backgroundColor: theme.colors.textMuted },
        ]}
        contentContainerStyle={styles.contentContainer}
        onDismiss={handleResetForm}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <Text style={[styles.title, { color: theme.colors.textSecondary }]}>
            {isEditMode ? 'Edit Account' : 'Add New Account'}
          </Text>

          <View style={styles.formGroup}>
            <Text style={[styles.label, { color: theme.colors.textSecondary }]}>Name</Text>
            <AdaptiveGlassView
              style={[
                styles.inputGlass,
                { borderColor: theme.colors.border },
              ]}
            >
              <BottomSheetTextInput
                value={name}
                onChangeText={setName}
                placeholder="Account Name"
                placeholderTextColor={theme.colors.textMuted}
                style={[
                  styles.input,
                  { color: theme.colors.textPrimary },
                ]}
              />
            </AdaptiveGlassView>
          </View>

          <View style={styles.formGroup}>
            <Text style={[styles.label, { color: theme.colors.textSecondary }]}>Description</Text>
            <AdaptiveGlassView
              style={[
                styles.inputGlass,
                styles.multilineGlass,
                { borderColor: theme.colors.border },
              ]}
            >
              <BottomSheetTextInput
                value={description}
                onChangeText={setDescription}
                placeholder="Description"
                placeholderTextColor={theme.colors.textMuted}
                multiline
                style={[
                  styles.input,
                  styles.multilineInput,
                  { color: theme.colors.textPrimary },
                ]}
              />
            </AdaptiveGlassView>
          </View>

          <View style={styles.formGroup}>
            <Text style={[styles.label, { color: theme.colors.textSecondary }]}>Type</Text>
            <View style={styles.typeGrid}>
              {TYPE_OPTIONS.map((option) => (
                <TypeOptionItem
                  key={option.id}
                  option={option}
                  isSelected={selectedType === option.id}
                  onSelect={setSelectedType}
                  theme={theme}
                />
              ))}
            </View>
          </View>

          <View style={styles.formGroup}>
            <Text style={[styles.label, { color: theme.colors.textSecondary }]}>Amount</Text>
            <AdaptiveGlassView
              style={[
                styles.inputGlass,
                { borderColor: theme.colors.border },
              ]}
            >
              <BottomSheetTextInput
                value={amount}
                onChangeText={setAmount}
                placeholder="Amount (UZS)"
                placeholderTextColor={theme.colors.textMuted}
                style={[
                  styles.input,
                  { color: theme.colors.textPrimary },
                ]}
                keyboardType="decimal-pad"
                returnKeyType="done"
              />
            </AdaptiveGlassView>
          </View>

          <View style={styles.buttonRow}>
            <AnimatedPressable
              style={[
                styles.primaryButton,
                {
                  backgroundColor: theme.colors.primary,
                  shadowColor: '#000',
                  shadowOpacity: 0.25,
                  shadowRadius: 5,
                  shadowOffset: { width: 0, height: 3 },
                },
              ]}
              onPress={handleSubmit}
            >
              <Text style={[styles.primaryButtonText, { color: theme.colors.white }]}>
                {isEditMode ? 'Save' : 'Add'}
              </Text>
            </AnimatedPressable>

            <AnimatedPressable
              style={[
                styles.secondaryButton,
                { borderColor: theme.colors.border },
              ]}
              onPress={handleCancel}
            >
              <Text style={[styles.secondaryButtonText, { color: theme.colors.textSecondary }]}>Cancel</Text>
            </AnimatedPressable>
          </View>
        </KeyboardAvoidingView>
      </CustomBottomSheet>
    );
  },
);

const styles = StyleSheet.create({
  sheetBackground: {
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    borderWidth: 1,
  },
  handleIndicator: {
    width: 40,
    height: 4,
    borderRadius: 2,
  },
  contentContainer: {
    paddingBottom: 24,
    paddingTop: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 24,
  },
  formGroup: {
    marginBottom: 20,
    paddingHorizontal: 24,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 10,
  },
  inputGlass: {
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
  },
  multilineGlass: {
    minHeight: 110,
  },
  input: {
    minHeight: 48,
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 15,
    width: '100%',
  },
  multilineInput: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  typeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -ITEM_SPACING / 2,
    paddingVertical: 4,
  },
  typeItem: {
    width: '33.3333%',
    paddingHorizontal: ITEM_SPACING / 2,
    marginBottom: ITEM_SPACING,
  },
  typePressable: {
    borderRadius: 14,
    overflow: 'hidden',
    width: '100%',
  },
  typeCard: {
    borderRadius: 14,
    paddingVertical: 10,
    paddingHorizontal: 10,
    alignItems: 'center',
    width: '100%',
  },
  typeInner: {
    alignItems: 'center',
    gap: 6,
  },
  typeLabel: {
    fontSize: 12,
    fontWeight: '600',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 16,
    paddingHorizontal: 24,
    marginTop: 16,
  },
  primaryButton: {
    flex: 1,
    height: 52,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryButtonText: {
    fontSize: 16,
    fontWeight: '700',
  },
  secondaryButton: {
    flex: 1,
    height: 52,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  secondaryButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
});

AddAccountSheet.displayName = 'AddAccountSheet';

export default AddAccountSheet;
