import React, { useMemo, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  View,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

import { AdaptiveGlassView } from '@/components/ui/AdaptiveGlassView';
import { Theme, useAppTheme } from '@/constants/theme';

type PasswordFormState = {
  current: string;
  next: string;
  confirm: string;
};

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: theme.spacing.lg,
      paddingTop: Platform.OS === 'ios' ? theme.spacing.xl : theme.spacing.xxl,
      paddingBottom: theme.spacing.md,
    },
    title: {
      fontSize: 22,
      fontWeight: '700',
      color: theme.colors.textPrimary,
      letterSpacing: -0.4,
    },
    content: {
      paddingHorizontal: theme.spacing.lg,
      paddingBottom: theme.spacing.xxxl,
      gap: theme.spacing.xl,
    },
    card: {
      borderRadius: theme.radius.xxl,
      padding: theme.spacing.xl,
      gap: theme.spacing.lg,
    },
    inputGroup: {
      gap: theme.spacing.xs,
    },
    label: {
      fontSize: 13,
      fontWeight: '700',
      color: theme.colors.textMuted,
      letterSpacing: 0.4,
      textTransform: 'uppercase',
    },
    input: {
      borderRadius: theme.radius.xl,
      paddingHorizontal: theme.spacing.lg,
      paddingVertical: theme.spacing.md,
      fontSize: 16,
      fontWeight: '600',
      letterSpacing: 0.2,
      color: theme.colors.textPrimary,
      backgroundColor:
        theme.mode === 'dark'
          ? 'rgba(17,24,39,0.72)'
          : 'rgba(248,250,252,0.92)',
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: theme.colors.border,
    },
    hint: {
      fontSize: 12,
      color: theme.colors.textMuted,
      lineHeight: 18,
    },
    buttonPrimary: {
      borderRadius: theme.radius.full,
      paddingVertical: theme.spacing.md,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: theme.colors.primary,
    },
    buttonPrimaryText: {
      fontSize: 16,
      fontWeight: '700',
      color: theme.colors.onPrimary,
    },
    helperText: {
      fontSize: 13,
      color: theme.colors.textSecondary,
      lineHeight: 20,
    },
  });

const ChangePasswordModal: React.FC = () => {
  const router = useRouter();
  const theme = useAppTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const [form, setForm] = useState<PasswordFormState>({
    current: '',
    next: '',
    confirm: '',
  });

  const handleClose = () => {
    router.back();
  };

  const handleChange =
    (field: keyof PasswordFormState) => (value: string) => {
      setForm((prev) => ({ ...prev, [field]: value }));
    };

  const handleSubmit = () => {
    console.log('Password change requested', form);
    router.back();
  };

  const submitEnabled =
    form.current.length >= 6 &&
    form.next.length >= 10 &&
    form.next === form.confirm;

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.header}>
          <Text style={styles.title}>Change password</Text>
          <Pressable onPress={handleClose} hitSlop={12}>
            <Ionicons
              name="close"
              size={26}
              color={theme.colors.textSecondary}
            />
          </Pressable>
        </View>

        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
        >
          <AdaptiveGlassView style={styles.card}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Current password</Text>
              <TextInput
                value={form.current}
                onChangeText={handleChange('current')}
                style={styles.input}
                secureTextEntry
                autoCapitalize="none"
                autoCorrect={false}
                textContentType="password"
              />
            </View>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>New password</Text>
              <TextInput
                value={form.next}
                onChangeText={handleChange('next')}
                style={styles.input}
                secureTextEntry
                autoCapitalize="none"
                autoCorrect={false}
                textContentType="newPassword"
              />
              <Text style={styles.hint}>
                Use at least 10 characters with a mix of symbols and numbers.
              </Text>
            </View>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Confirm password</Text>
              <TextInput
                value={form.confirm}
                onChangeText={handleChange('confirm')}
                style={styles.input}
                secureTextEntry
                autoCapitalize="none"
                autoCorrect={false}
                textContentType="password"
              />
            </View>
            <Text style={styles.helperText}>
              By saving you’ll sign out of other active sessions. You’ll receive
              a verification email if a new device tries to sign in.
            </Text>
            <Pressable
              onPress={handleSubmit}
              disabled={!submitEnabled}
              style={{ opacity: submitEnabled ? 1 : 0.5 }}
            >
              <AdaptiveGlassView style={styles.buttonPrimary}>
                <Text style={styles.buttonPrimaryText}>Save new password</Text>
              </AdaptiveGlassView>
            </Pressable>
          </AdaptiveGlassView>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default ChangePasswordModal;
