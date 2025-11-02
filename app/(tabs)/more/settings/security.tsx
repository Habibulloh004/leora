import React, { useMemo, useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  Bell,
  Fingerprint,
  KeyRound,
  Lock,
  LogOut,
  ShieldCheck,
} from 'lucide-react-native';

import { AdaptiveGlassView } from '@/components/ui/AdaptiveGlassView';
import { Theme, useAppTheme } from '@/constants/theme';

type LucideIcon = React.ComponentType<{ color?: string; size?: number; strokeWidth?: number }>;

type ToggleRowProps = {
  icon: LucideIcon;
  label: string;
  description: string;
  value: boolean;
  onChange: (value: boolean) => void;
};

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    safe: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    container: {
      flex: 1,
      paddingHorizontal: theme.spacing.lg,
    },
    sectionTitle: {
      color: theme.colors.textMuted,
      fontSize: 13,
      letterSpacing: 0.5,
      marginTop: theme.spacing.md,
      marginBottom: theme.spacing.sm,
    },
    card: {
      gap: theme.spacing.sm,
      marginBottom: theme.spacing.lg,
    },
    pressableWrapper: {
      borderRadius: theme.radius.xl,
      overflow: 'hidden',
    },
    rowCard: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: theme.spacing.lg,
      paddingVertical: theme.spacing.md + 2,
      borderRadius: theme.radius.xl,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: theme.colors.border,
      backgroundColor: theme.colors.cardItem,
    },
    rowLeft: {
      flexDirection: 'row',
      alignItems: 'center',
      flex: 1,
      marginRight: theme.spacing.sm,
    },
    iconBadge: {
      width: 40,
      height: 40,
      borderRadius: theme.radius.md,
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: theme.spacing.md,
      backgroundColor:
        theme.mode === 'dark' ? 'rgba(255,255,255,0.06)' : 'rgba(15,23,42,0.06)',
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: theme.colors.border,
    },
    rowTexts: {
      flexShrink: 1,
    },
    rowLabel: {
      color: theme.colors.textPrimary,
      fontSize: 16,
      fontWeight: '700',
    },
    rowDescription: {
      color: theme.colors.textMuted,
      fontSize: 13,
      marginTop: 2,
      lineHeight: 18,
    },
    chip: {
      paddingHorizontal: theme.spacing.md,
      paddingVertical: 6,
      borderRadius: theme.radius.full,
      backgroundColor: theme.colors.overlaySoft,
    },
    chipActive: {
      backgroundColor: theme.colors.successBg,
    },
    chipInactive: {
      backgroundColor: theme.colors.overlaySoft,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: theme.colors.border,
    },
    chipText: {
      color: theme.colors.textMuted,
      fontSize: 12,
      fontWeight: '700',
      letterSpacing: 0.3,
    },
    chipTextActive: {
      color: theme.colors.success,
    },
    helperCard: {
      padding: theme.spacing.md,
      borderRadius: theme.radius.xl,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: theme.colors.border,
      backgroundColor: theme.colors.cardItem,
      gap: theme.spacing.sm,
    },
    helperRow: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    helperIconWrap: {
      width: 36,
      height: 36,
      borderRadius: theme.radius.md,
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: theme.spacing.sm,
      backgroundColor:
        theme.mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(15,23,42,0.05)',
    },
    helperTitle: {
      color: theme.colors.textPrimary,
      fontSize: 15,
      fontWeight: '600',
    },
    helperText: {
      color: theme.colors.textMuted,
      fontSize: 13,
      lineHeight: 18,
    },
    helperAction: {
      marginTop: theme.spacing.sm,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    helperButton: {
      paddingHorizontal: theme.spacing.md,
      paddingVertical: 10,
      borderRadius: theme.radius.full,
      backgroundColor: theme.colors.primary,
    },
    helperButtonText: {
      color: theme.colors.onPrimary,
      fontWeight: '700',
    },
  });

const SecuritySettingsScreen: React.FC = () => {
  const theme = useAppTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const rippleColor =
    theme.mode === 'dark' ? 'rgba(255,255,255,0.08)' : 'rgba(15,23,42,0.12)';

  const [biometrics, setBiometrics] = useState(true);
  const [twoFactor, setTwoFactor] = useState(false);
  const [loginAlerts, setLoginAlerts] = useState(true);
  const [autoLock, setAutoLock] = useState(true);

  const Chip = ({ active, label }: { active: boolean; label: string }) => (
    <View style={[styles.chip, active ? styles.chipActive : styles.chipInactive]}>
      <Text style={[styles.chipText, active && styles.chipTextActive]}>{label}</Text>
    </View>
  );

  const ToggleRow = ({ icon: Icon, label, description, value, onChange }: ToggleRowProps) => (
    <Pressable
      onPress={() => onChange(!value)}
      android_ripple={{ color: rippleColor }}
      style={styles.pressableWrapper}
    >
      <AdaptiveGlassView style={styles.rowCard}>
        <View style={styles.rowLeft}>
          <View style={styles.iconBadge}>
            <Icon color={theme.colors.iconText} size={18} />
          </View>
          <View style={styles.rowTexts}>
            <Text style={styles.rowLabel}>{label}</Text>
            <Text style={styles.rowDescription}>{description}</Text>
          </View>
        </View>
        <Chip active={value} label={value ? 'Enabled' : 'Off'} />
      </AdaptiveGlassView>
    </Pressable>
  );

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={{ paddingBottom: 32 }}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.sectionTitle}>Protection</Text>
        <View style={styles.card}>
          <ToggleRow
            icon={ShieldCheck}
            label="Two-factor authentication"
            description="Require a verification code the next time you sign in."
            value={twoFactor}
            onChange={setTwoFactor}
          />
          <ToggleRow
            icon={Fingerprint}
            label="Biometric unlock"
            description="Use Face ID or Touch ID to unlock sensitive sections."
            value={biometrics}
            onChange={setBiometrics}
          />
          <ToggleRow
            icon={Bell}
            label="Login alerts"
            description="Send a push notification whenever a new device signs in."
            value={loginAlerts}
            onChange={setLoginAlerts}
          />
          <ToggleRow
            icon={Lock}
            label="Auto-lock"
            description="Lock the app automatically after 60 seconds of inactivity."
            value={autoLock}
            onChange={setAutoLock}
          />
        </View>

        <AdaptiveGlassView style={styles.helperCard}>
          <View style={styles.helperRow}>
            <View style={styles.helperIconWrap}>
              <KeyRound size={18} color={theme.colors.iconText} />
            </View>
            <View>
              <Text style={styles.helperTitle}>Password hygiene</Text>
              <Text style={styles.helperText}>Last changed 48 days ago</Text>
            </View>
          </View>
          <Text style={styles.helperText}>
            Rotating your password every 90 days keeps your financial data safer. Generate a random
            16-character passphrase and store it in a manager you trust.
          </Text>
          <View style={styles.helperAction}>
            <Text style={styles.helperText}>Sessions: 3 active</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: theme.spacing.sm }}>
              <Pressable android_ripple={{ color: rippleColor }}>
                <View style={styles.helperButton}>
                  <Text style={styles.helperButtonText}>Update password</Text>
                </View>
              </Pressable>
              <Pressable android_ripple={{ color: rippleColor }}>
                <View style={styles.helperIconWrap}>
                  <LogOut size={18} color={theme.colors.iconText} />
                </View>
              </Pressable>
            </View>
          </View>
        </AdaptiveGlassView>
      </ScrollView>
    </SafeAreaView>
  );
};

export default SecuritySettingsScreen;
