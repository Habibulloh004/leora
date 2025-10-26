import React, { useCallback, useEffect, useState } from 'react';
import { BackHandler, Image, Pressable, StyleSheet, Switch, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, {
  Easing,
  FadeIn,
  FadeInDown,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import {
  AppWindow,
  BarChart3,
  Bell,
  BookOpen,
  Building2,
  Calendar,
  CircleHelp,
  Cloud,
  Crown,
  Gem,
  Info,
  Languages,
  LifeBuoy,
  LogOut,
  Medal,
  MonitorSmartphone,
  Palette,
  RefreshCw,
  Share,
  ShieldCheck,
  Sparkles,
  Star,
  Trash2,
  UserRound,
} from 'lucide-react-native';

import UniversalFAB from '@/components/UniversalFAB';
import { GlassCard, ListItem, SectionHeader } from '@/features/more/components';
import { createThemedStyles, useAppTheme } from '@/constants/theme';

const useStyles = createThemedStyles((theme) => ({
  safeArea: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  scrollContent: {
    paddingHorizontal: theme.spacing.xl,
    paddingBottom: theme.spacing.xxxl * 2,
    paddingTop: theme.spacing.lg,
    gap: theme.spacing.xl,
  },
  headerCardContent: {
    padding: theme.spacing.xxl,
    gap: theme.spacing.lg,
  },
  identityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.lg,
  },
  avatarWrapper: {
    width: 64,
    height: 64,
    borderRadius: theme.radius.full,
    overflow: 'hidden',
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarFallback: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: theme.radius.full,
  },
  avatarInitials: {
    fontSize: 20,
    fontWeight: '700',
    letterSpacing: 0.5,
    color: '#FFFFFF',
  },
  identityText: {
    flex: 1,
    gap: 6,
  },
  nameText: {
    fontSize: 20,
    fontWeight: '700',
    letterSpacing: -0.2,
  },
  emailText: {
    fontSize: 14,
    color: theme.colors.textMuted,
  },
  premiumBadge: {
    alignSelf: 'flex-start',
    borderRadius: theme.radius.full,
    overflow: 'hidden',
  },
  premiumBadgeInner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.xs,
  },
  premiumBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
    letterSpacing: 0.3,
  },
  progressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.lg,
  },
  levelBadge: {
    width: 42,
    height: 42,
    borderRadius: theme.radius.lg,
    justifyContent: 'center',
    alignItems: 'center',
  },
  levelText: {
    fontSize: 15,
    fontWeight: '700',
  },
  progressTrack: {
    flex: 1,
    height: 48,
    borderRadius: theme.radius.lg,
    justifyContent: 'center',
    backgroundColor: theme.mode === 'dark' ? 'rgba(255,255,255,0.06)' : 'rgba(15,23,42,0.08)',
    overflow: 'hidden',
  },
  progressFill: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    borderRadius: theme.radius.lg,
  },
  progressOverlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 4,
  },
  progressLevelLabel: {
    fontSize: 14,
    fontWeight: '700',
  },
  progressXpRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  progressXpText: {
    fontSize: 13,
    fontWeight: '600',
  },
  nextLevelBadge: {
    width: 42,
    height: 42,
    borderRadius: theme.radius.lg,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: StyleSheet.hairlineWidth,
  },
  sectionGroup: {
    gap: theme.spacing.sm,
  },
  listCardContent: {
    paddingHorizontal: 0,
    paddingVertical: 0,
  },
  integrationHeader: {
    marginTop: theme.spacing.md,
  },
  logoutCard: {
    marginTop: theme.spacing.sm,
  },
  logoutContent: {
    padding: theme.spacing.md,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing.sm,
    paddingVertical: theme.spacing.md,
    borderRadius: theme.radius.full,
    overflow: 'hidden',
  },
  logoutText: {
    fontSize: 16,
    fontWeight: '700',
  },
}));

const userProfile = {
  name: 'Ivan Petrov',
  email: 'ivan.petrov@email.com',
  premiumUntil: '15 March 2025',
  level: 12,
  nextLevel: 13,
  xp: 3500,
  xpTarget: 4000,
  avatarUri: undefined,
};

type IconComponent = React.ComponentType<{ color?: string; size?: number; strokeWidth?: number }>;

type SectionItem = {
  key: string;
  icon: IconComponent;
  label: string;
  value?: string;
  destination: string;
  rightAccessory?: React.ReactNode;
  disabled?: boolean;
};

export default function MoreHomeScreen() {
  const styles = useStyles();
  const theme = useAppTheme();
  const router = useRouter();
  const progress = useSharedValue(0);
  const [syncEnabled, setSyncEnabled] = useState(true);

  useEffect(() => {
    progress.value = withTiming(userProfile.xp / userProfile.xpTarget, {
      duration: 900,
      easing: Easing.out(Easing.cubic),
    });
  }, [progress]);

  const navigateTo = useCallback(
    (target: string) => {
      router.push(`/(tabs)/more/${target}`);
    },
    [router],
  );

  useFocusEffect(
    useCallback(() => {
      const handleBackPress = () => {
        if (router.canGoBack()) {
          router.back();
        } else {
          router.replace('/(tabs)/index');
        }
        return true;
      };

      const subscription = BackHandler.addEventListener('hardwareBackPress', handleBackPress);
      return () => subscription.remove();
    }, [router]),
  );

  const progressFillStyle = useAnimatedStyle(() => {
    const value = Math.max(Math.min(progress.value, 1), 0);
    return { width: `${Math.max(value * 100, 6)}%` };
  });

  const levelBadgeBackground = theme.mode === 'dark' ? 'rgba(120, 133, 255, 0.18)' : 'rgba(79, 70, 229, 0.16)';
  const nextLevelBorder = theme.mode === 'dark' ? 'rgba(255,255,255,0.12)' : 'rgba(15,23,42,0.12)';
  const logoutGradientColors: [string, string] =
    theme.mode === 'dark' ? ['rgba(59,130,246,0.18)', 'rgba(147,197,253,0.12)'] : ['rgba(79,70,229,0.12)', 'rgba(59,130,246,0.1)'];
  const badgeGradientColors: [string, string, string] =
    theme.mode === 'dark' ? ['#38bdf8', '#6366f1', '#fbbf24'] : ['#2563eb', '#6d28d9', '#fdba74'];

  const accountItems: SectionItem[] = [
    { key: 'profile', icon: UserRound, label: 'Profile', destination: 'profile' },
    { key: 'premium', icon: Crown, label: 'Premium status', destination: 'premium' },
    { key: 'achievements', icon: Medal, label: 'Achievements', value: '23 / 50', destination: 'achievements' },
    { key: 'statistics', icon: BarChart3, label: 'Statistics', destination: 'statistics' },
  ];

  const settingsItems: SectionItem[] = [
    {
      key: 'appearance',
      icon: Palette,
      label: 'Appearance',
      value: theme.mode === 'dark' ? 'Dark' : 'Light',
      destination: 'settings/appearance',
    },
    { key: 'notifications', icon: Bell, label: 'Notifications', value: 'Enabled', destination: 'settings/notifications' },
    { key: 'assistant', icon: Sparkles, label: 'AI Assistant', value: 'Alpha', destination: 'settings/assistant' },
    { key: 'security', icon: ShieldCheck, label: 'Security', destination: 'settings/security' },
    { key: 'language', icon: Languages, label: 'Language and Region', value: 'English', destination: 'settings/language' },
  ];

  const dataItems: SectionItem[] = [
    { key: 'backup', icon: RefreshCw, label: 'Backup / Restore', destination: 'data/backup' },
    { key: 'export', icon: Share, label: 'Export data', destination: 'data/export' },
    { key: 'cache', icon: Trash2, label: 'Clear cache', value: '45 MB', destination: 'data/cache' },
  ];

  const integrationItems: SectionItem[] = [
    { key: 'calendars', icon: Calendar, label: 'Calendars', value: '2 / 3', destination: 'integrations/calendars' },
    { key: 'banks', icon: Building2, label: 'Banks', value: '0 / 5', destination: 'integrations/banks' },
    { key: 'apps', icon: AppWindow, label: 'Apps', value: '3 / 8', destination: 'integrations/apps' },
    { key: 'devices', icon: MonitorSmartphone, label: 'Devices', value: '1 / 2', destination: 'integrations/devices' },
  ];

  const helpItems: SectionItem[] = [
    { key: 'manual', icon: BookOpen, label: 'Manual', destination: 'help/manual' },
    { key: 'faq', icon: CircleHelp, label: 'FAQ', destination: 'help/faq' },
    { key: 'support', icon: LifeBuoy, label: 'Support', destination: 'help/support' },
    { key: 'about', icon: Info, label: 'About LEORA', destination: 'help/about' },
  ];

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <Animated.ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <Animated.View entering={FadeIn.duration(450)}>
          <GlassCard contentStyle={styles.headerCardContent}>
            <View style={styles.identityRow}>
              <View style={[styles.avatarWrapper, { backgroundColor: levelBadgeBackground }]}>
                <LinearGradient
                  colors={theme.mode === 'dark' ? ['rgba(59,130,246,0.25)', 'rgba(99,102,241,0.15)'] : ['rgba(79,70,229,0.24)', 'rgba(59,130,246,0.12)']}
                  style={styles.avatarFallback}
                />

                {userProfile.avatarUri ? (
                  <Image source={{ uri: userProfile.avatarUri }} style={StyleSheet.absoluteFillObject} />
                ) : (
                  <Text style={styles.avatarInitials}>
                    {userProfile.name
                      .split(' ')
                      .map((part) => part[0])
                      .join('')
                      .slice(0, 2)
                      .toUpperCase()}
                  </Text>
                )}
              </View>

              <View style={styles.identityText}>
                <Text style={[styles.nameText, { color: theme.colors.textPrimary }]}>{userProfile.name}</Text>
                <Text style={styles.emailText}>{userProfile.email}</Text>
              </View>
            </View>

            <View style={styles.premiumBadge}>
              <LinearGradient colors={badgeGradientColors} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.premiumBadgeInner}>
                <Gem size={16} color="#FFFFFF" />
                <Text style={styles.premiumBadgeText}>Premium until {userProfile.premiumUntil}</Text>
              </LinearGradient>
            </View>

            <View style={styles.progressRow}>
              <View style={[styles.levelBadge, { backgroundColor: levelBadgeBackground }]}>
                <Text style={[styles.levelText, { color: theme.colors.textPrimary }]}>{userProfile.level}</Text>
              </View>

              <View style={styles.progressTrack}>
                <Animated.View style={[styles.progressFill, progressFillStyle]}>
                  <LinearGradient colors={['#38bdf8', '#6366f1', '#facc15']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={StyleSheet.absoluteFillObject} />
                </Animated.View>
                <View style={styles.progressOverlay} pointerEvents="none">
                  <Text style={[styles.progressLevelLabel, { color: theme.colors.onPrimary }]}>Level {userProfile.level}</Text>
                  <View style={styles.progressXpRow}>
                    <Star size={14} color="#fde047" fill="#fde047" />
                    <Text style={[styles.progressXpText, { color: theme.colors.onPrimary }]}>
                      {userProfile.xp} / {userProfile.xpTarget}
                    </Text>
                  </View>
                </View>
              </View>

              <View style={[styles.nextLevelBadge, { borderColor: nextLevelBorder, backgroundColor: 'rgba(255,255,255,0.04)' }]}>
                <Text style={[styles.levelText, { color: theme.colors.textPrimary }]}>{userProfile.nextLevel}</Text>
              </View>
            </View>
          </GlassCard>
        </Animated.View>

        <Animated.View entering={FadeInDown.springify().delay(50)} style={styles.sectionGroup}>
          <GlassCard contentStyle={styles.listCardContent}>
            {accountItems.map((item, index) => (
              <ListItem
                key={item.key}
                icon={item.icon}
                label={item.label}
                value={item.value}
                onPress={() => navigateTo(item.destination)}
                isLast={index === accountItems.length - 1}
              />
            ))}
          </GlassCard>
        </Animated.View>

        <Animated.View entering={FadeInDown.springify().delay(100)} style={styles.sectionGroup}>
          <SectionHeader title="Settings" />
          <GlassCard contentStyle={styles.listCardContent}>
            {settingsItems.map((item, index) => (
              <ListItem
                key={item.key}
                icon={item.icon}
                label={item.label}
                value={item.value}
                onPress={() => navigateTo(item.destination)}
                isLast={index === settingsItems.length - 1}
              />
            ))}
          </GlassCard>
        </Animated.View>

        <Animated.View entering={FadeInDown.springify().delay(150)} style={styles.sectionGroup}>
          <SectionHeader title="Data" />
          <GlassCard contentStyle={styles.listCardContent}>
            <ListItem
              icon={Cloud}
              label="Synchronization"
              value={syncEnabled ? 'On' : 'Off'}
              disabled
              showChevron={false}
              rightAccessory={
                <Switch
                  value={syncEnabled}
                  onValueChange={setSyncEnabled}
                  trackColor={{
                    false: theme.mode === 'dark' ? 'rgba(255,255,255,0.2)' : 'rgba(15,23,42,0.2)',
                    true: theme.colors.primary,
                  }}
                  thumbColor={theme.colors.white}
                />
              }
            />
            {dataItems.map((item, index) => (
              <ListItem
                key={item.key}
                icon={item.icon}
                label={item.label}
                value={item.value}
                onPress={() => navigateTo(item.destination)}
                isLast={index === dataItems.length - 1}
              />
            ))}
          </GlassCard>

          <SectionHeader title="Integration" style={styles.integrationHeader} />
          <GlassCard contentStyle={styles.listCardContent}>
            {integrationItems.map((item, index) => (
              <ListItem
                key={item.key}
                icon={item.icon}
                label={item.label}
                value={item.value}
                onPress={() => navigateTo(item.destination)}
                isLast={index === integrationItems.length - 1}
              />
            ))}
          </GlassCard>
        </Animated.View>

        <Animated.View entering={FadeInDown.springify().delay(200)} style={styles.sectionGroup}>
          <SectionHeader title="Help" />
          <GlassCard contentStyle={styles.listCardContent}>
            {helpItems.map((item, index) => (
              <ListItem
                key={item.key}
                icon={item.icon}
                label={item.label}
                onPress={() => navigateTo(item.destination)}
                isLast={index === helpItems.length - 1}
              />
            ))}
          </GlassCard>

          <GlassCard style={styles.logoutCard} contentStyle={styles.logoutContent}>
            <Pressable
              onPress={() => router.replace('/auth/login')}
              style={({ pressed }) => [
                styles.logoutButton,
                {
                  opacity: pressed ? 0.9 : 1,
                  transform: [{ scale: pressed ? 0.97 : 1 }],
                  backgroundColor: theme.mode === 'dark' ? 'rgba(255,255,255,0.04)' : 'rgba(15,23,42,0.04)',
                },
              ]}
            >
              <LinearGradient colors={logoutGradientColors} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={StyleSheet.absoluteFillObject} />
              <LogOut size={20} color={theme.colors.textPrimary} />
              <Text style={[styles.logoutText, { color: theme.colors.textPrimary }]}>Log out</Text>
            </Pressable>
          </GlassCard>
        </Animated.View>
      </Animated.ScrollView>

      <UniversalFAB />
    </SafeAreaView>
  );
}
