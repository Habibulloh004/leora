import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { BackHandler, Image, Pressable, StyleSheet, Switch, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, {
  Easing,
  FadeIn,
  FadeInDown,
  useAnimatedProps,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { Defs, LinearGradient as SvgLinearGradient, Rect, Stop, Svg } from 'react-native-svg';
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
import { ListItem, SectionHeader } from '@/features/more/components';
import { createThemedStyles, useAppTheme } from '@/constants/theme';
import { AdaptiveGlassView } from '@/components/ui/AdaptiveGlassView';


const LEVEL_PROGRESS_HEIGHT = 44;
const LEVEL_PROGRESS_RADIUS = 22;
const AnimatedRectSvg = Animated.createAnimatedComponent(Rect);

const useStyles = createThemedStyles((theme) => ({
  safeArea: {
    flex: 1,
    backgroundColor: theme.colors.background,
    paddingBottom: 32,
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
    flexDirection: 'row',
    gap: theme.spacing.xs,
  },
  premiumBadgeIcon: {
    width: 20,
    height: 20,
    resizeMode: 'contain',
  },
  premiumBadgeText: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.textSecondary,
    letterSpacing: 0.3,
  },
  progressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 6,
    borderRadius: 28,
    backgroundColor: theme.mode === 'dark' ? 'rgba(18, 19, 27, 0.7)' : 'rgba(229, 231, 235, 0.7)',
  },
  levelRingOuter: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: StyleSheet.hairlineWidth,
  },
  levelRingOuterDim: {
    opacity: 0.85,
  },
  levelRingInner: {
    width: 34,
    height: 34,
    borderRadius: 17,
    justifyContent: 'center',
    alignItems: 'center',
  },
  levelNumber: {
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: -0.2,
  },
  levelNumberDim: {
    fontWeight: '600',
  },
  progressShell: {
    flex: 1,
    height: LEVEL_PROGRESS_HEIGHT,
    borderRadius: LEVEL_PROGRESS_RADIUS,
    overflow: 'hidden',
    justifyContent: 'center',
    position: 'relative',
  },
  progressContent: {
    ...StyleSheet.absoluteFillObject,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  progressLabel: {
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: -0.1,
  },
  progressXpGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  progressXpCurrent: {
    fontSize: 15,
    fontWeight: '700',
  },
  progressXpMax: {
    fontSize: 15,
    fontWeight: '600',
  },
  sectionGroup: {
    gap: theme.spacing.sm,
  },
  listCardContent: {
    paddingHorizontal: 0,
    paddingVertical: 0,
    gap: 6
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
    paddingVertical: theme.spacing.lg,
    borderRadius: theme.radius.xl,
    backgroundColor:theme.colors.card
  },
  logoutText: {
    fontSize: 16,
    fontWeight: '700',
  },
  // qo'shimcha/yangilangan style-lar
  profileStub: {
    width: 72,
    height: 72,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
}));

const userProfile = {
  name: 'Oybek Baxtiyorov',
  email: 'progremmer@gmail.com',
  premiumUntil: '15 March 2025',
  level: 1,
  nextLevel: 2,
  xp: 300,
  xpTarget: 1000,
  avatarUri: undefined,
};

type LevelProgressProps = {
  level: number;
  nextLevel: number;
  currentXp: number;
  targetXp: number;
};

const LevelProgress: React.FC<LevelProgressProps> = ({ level, nextLevel, currentXp, targetXp }) => {
  const theme = useAppTheme();
  const [trackWidth, setTrackWidth] = useState(0);
  const widthValue = useSharedValue(0);
  const gradientId = useMemo(() => `level-progress-${level}-${nextLevel}`, [level, nextLevel]);
  const styles = useStyles();

  const clampedRatio = targetXp > 0 ? Math.min(Math.max(currentXp / targetXp, 0), 1) : 0;

  useEffect(() => {
    if (!trackWidth) return;
    const width = clampedRatio <= 0 ? 0 : Math.max(trackWidth * clampedRatio, 10);
    widthValue.value = withTiming(Math.min(trackWidth, width), {
      duration: 420,
    });
  }, [clampedRatio, trackWidth, widthValue]);

  const animatedProps = useAnimatedProps(() => ({
    width: widthValue.value,
  }));

  const ringBorderColor = theme.mode === 'dark' ? 'rgba(255,255,255,0.08)' : 'rgba(17,24,39,0.08)';
  const leftRingBg = theme.mode === 'dark' ? 'rgba(21,22,30,0.6)' : 'rgba(226,232,240,0.62)';
  const rightRingBg = theme.mode === 'dark' ? 'rgba(21,22,30,0.6)' : 'rgba(226,232,240,0.6)';
  const innerRingColor = theme.mode === 'dark' ? 'rgba(255,255,255,0.12)' : 'rgba(15,23,42,0.08)';
  const innerRingDimColor = theme.mode === 'dark' ? 'rgba(255,255,255,0.06)' : 'rgba(15,23,42,0.05)';
  const levelNumberColor = theme.mode === 'dark' ? '#F8FAFC' : '#111827';
  const levelNumberDimColor = theme.mode === 'dark' ? 'rgba(248,250,252,0.65)' : 'rgba(55,65,81,0.65)';
  const trackBaseColor = theme.mode === 'dark' ? 'rgba(203, 213, 225, 0.35)' : 'rgba(203, 213, 225, 0.6)';
  const gradientStops =
    theme.mode === 'dark'
      ? ['#8FA399', '#3d8f76ff', '#22ad98ff'] // dark mode: biroz to‘q-yashil + sovuq kulrang
      : ['#30ab94ff', '#45b8c0ff', '#42ba54ff']; // light mod

  const labelColor = theme.mode === 'dark' ? '#1E1F2A' : theme.colors.textPrimary;
  const xpMaxColor = theme.mode === 'dark' ? 'rgba(30,31,42,0.45)' : 'rgba(71,85,105,0.55)';

  return (
    <AdaptiveGlassView style={{
      borderRadius: LEVEL_PROGRESS_RADIUS,
    }}>
      <View
        style={[styles.progressShell, { backgroundColor: "transparent" }]}
        onLayout={(event) => setTrackWidth(event.nativeEvent.layout.width)}
      >
        {trackWidth > 0 ? (
          <Svg width={trackWidth} height={LEVEL_PROGRESS_HEIGHT} style={StyleSheet.absoluteFillObject}>
            <Defs>
              <SvgLinearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="0%">
                {gradientStops.map((stopColor, index) => (
                  <Stop
                    key={`${stopColor}-${index}`}
                    offset={`${(index / Math.max(gradientStops.length - 1, 1)) * 100}%`}
                    stopColor={stopColor}
                  />
                ))}
              </SvgLinearGradient>
            </Defs>
            <Rect
              x={0}
              y={0}
              rx={LEVEL_PROGRESS_RADIUS}
              ry={LEVEL_PROGRESS_RADIUS}
              width={trackWidth}
              height={LEVEL_PROGRESS_HEIGHT}
              fill={trackBaseColor}
            />
            <AnimatedRectSvg
              animatedProps={animatedProps}
              x={0}
              y={0}
              rx={LEVEL_PROGRESS_RADIUS}
              ry={LEVEL_PROGRESS_RADIUS}
              height={LEVEL_PROGRESS_HEIGHT}
              fill={`url(#${gradientId})`}
            />
          </Svg>
        ) : null}

        <View style={styles.progressContent} pointerEvents="none">
          <View style={[styles.levelRingOuter, { backgroundColor: leftRingBg, borderColor: ringBorderColor }]}>
            <View style={[styles.levelRingInner, { backgroundColor: innerRingColor }]}>
              <Text style={[styles.levelNumber, { color: levelNumberColor }]}>{level}</Text>
            </View>
          </View>
          <Text style={[styles.progressLabel, { color: labelColor }]}>Level {level}</Text>
          <View style={styles.progressXpGroup}>
            <Star size={16} color="#FACC15" fill="#FACC15" />
            <Text style={[styles.progressXpCurrent, { color: labelColor }]}>{currentXp}</Text>
            <Text style={[styles.progressXpMax, { color: xpMaxColor }]}>/{targetXp}</Text>
          </View>
          <View style={[styles.levelRingOuter, styles.levelRingOuterDim, { backgroundColor: rightRingBg, borderColor: ringBorderColor }]}>
            <View style={[styles.levelRingInner, { backgroundColor: innerRingDimColor }]}>
              <Text style={[styles.levelNumber, styles.levelNumberDim, { color: levelNumberDimColor }]}>
                {nextLevel}
              </Text>
            </View>
          </View>
        </View>

      </View>
    </AdaptiveGlassView>
  );
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
  const [syncEnabled, setSyncEnabled] = useState(true);

  const navigateTo = useCallback(
    (target: string) => {
      if (target.includes('?')) {
        const [path, query] = target.split('?');
        const params = Object.fromEntries(new URLSearchParams(query));
        router.push({
          pathname: `/(tabs)/more/${path}`,
          params,
        });
        return;
      }
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

  const logoutGradientColors: [string, string] =
    theme.mode === 'dark' ? ['rgba(59,130,246,0.18)', 'rgba(147,197,253,0.12)'] : ['rgba(79,70,229,0.12)', 'rgba(59,130,246,0.1)'];

  const accountItems: SectionItem[] = [
    { key: 'profile', icon: UserRound, label: 'Profile', destination: 'account/profile' },
    { key: 'premium', icon: Crown, label: 'Premium status', destination: 'account/premium' },
    { key: 'achievements', icon: Medal, label: 'Achievements', value: '23 / 50', destination: 'account/achievements' },
    { key: 'statistics', icon: BarChart3, label: 'Statistics', destination: 'account/statistics' },
  ];

  const settingsItems: SectionItem[] = [
    {
      key: 'appearance',
      icon: Palette,
      label: 'Appearance',
      value: theme.mode === 'dark' ? 'Dark' : 'Light',
      destination: 'settings',
    },
    { key: 'notifications', icon: Bell, label: 'Notifications', value: 'Enabled', destination: 'settings/notifications' },
    { key: 'assistant', icon: Sparkles, label: 'AI Assistant', value: 'Alpha', destination: 'settings/ai' },
    { key: 'security', icon: ShieldCheck, label: 'Security', destination: 'settings/security?section=security-type' },
    { key: 'language', icon: Languages, label: 'Language and Region', value: 'English', destination: 'settings/language' },
  ];

  const dataItems: SectionItem[] = [
    { key: 'backup', icon: RefreshCw, label: 'Backup / Restore', destination: 'data?section=backup' },
    { key: 'export', icon: Share, label: 'Export data', destination: 'data?section=export' },
    { key: 'cache', icon: Trash2, label: 'Clear cache', value: '45 MB', destination: 'data?section=storage' },
  ];

  const integrationItems: SectionItem[] = [
    { key: 'calendars', icon: Calendar, label: 'Calendars', value: '2 / 3', destination: 'integrations?section=calendars' },
    { key: 'banks', icon: Building2, label: 'Banks', value: '0 / 4', destination: 'integrations?section=banks' },
    { key: 'apps', icon: AppWindow, label: 'Apps', value: '2 / 8', destination: 'integrations?section=applications' },
    { key: 'devices', icon: MonitorSmartphone, label: 'Devices', value: '1 / 2', destination: 'integrations?section=devices' },
  ];

  const helpItems: SectionItem[] = [
    { key: 'manual', icon: BookOpen, label: 'Manual', destination: 'support?section=manuals' },
    { key: 'faq', icon: CircleHelp, label: 'FAQ', destination: 'support?section=popular' },
    { key: 'support', icon: LifeBuoy, label: 'Support', destination: 'support?section=contact' },
    { key: 'about', icon: Info, label: 'About LEORA', destination: 'about' },
  ];

  return (
    <SafeAreaView style={styles.safeArea} edges={['left', 'right', 'bottom']}>
      <Animated.ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Profile header (drop‑in replacement) */}
        <AdaptiveGlassView style={{ backgroundColor: theme.colors.card, borderRadius: 16 }}>
          <Animated.View entering={FadeIn.duration(450)}>
            <View style={styles.headerCardContent}>
              {/* Identity: text on the left, profile stub on the right */}
              <View style={[styles.identityRow, { justifyContent: 'space-between' }]}>
                <View style={styles.identityText}>
                  <Text style={[styles.nameText, { color: theme.colors.textPrimary }]}>
                    {userProfile.name}
                  </Text>
                  <Text style={styles.emailText}>{userProfile.email}</Text>
                </View>

                {/* Minimal user placeholder like on the mock */}
                <AdaptiveGlassView
                  style={[
                    styles.profileStub,
                    { backgroundColor: theme.colors.background }
                  ]}
                >
                  <UserRound
                    size={48}
                    color={theme.colors.icon}
                    strokeWidth={1.8}
                  />
                </AdaptiveGlassView>
              </View>

              {/* Premium badge */}
              <View style={styles.premiumBadge}>
                <Image source={require("@assets/images/premium.png")} style={styles.premiumBadgeIcon} />
                <Text style={styles.premiumBadgeText}>
                  Premium until {userProfile.premiumUntil}
                </Text>
              </View>

              <LevelProgress
                level={userProfile.level}
                nextLevel={userProfile.nextLevel}
                currentXp={userProfile.xp}
                targetXp={userProfile.xpTarget}
              />

            </View>
          </Animated.View>
        </AdaptiveGlassView>

        <Animated.View entering={FadeInDown.springify().delay(50)} style={styles.sectionGroup}>
          <View style={styles.listCardContent}>
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
          </View>
        </Animated.View>

        <Animated.View entering={FadeInDown.springify().delay(100)} style={styles.sectionGroup}>
          <SectionHeader title="Settings" />
          <View style={styles.listCardContent}>
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
          </View>
        </Animated.View>

        <Animated.View entering={FadeInDown.springify().delay(150)} style={styles.sectionGroup}>
          <SectionHeader title="Data" />
          <View style={styles.listCardContent}>
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
          </View>

          <SectionHeader title="Integration" style={styles.integrationHeader} />
          <View style={styles.listCardContent}>
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
          </View>
        </Animated.View>

        <Animated.View entering={FadeInDown.springify().delay(200)} style={styles.sectionGroup}>
          <SectionHeader title="Help" />
          <View style={styles.listCardContent}>
            {helpItems.map((item, index) => (
              <ListItem
                key={item.key}
                icon={item.icon}
                label={item.label}
                onPress={() => navigateTo(item.destination)}
                isLast={index === helpItems.length - 1}
              />
            ))}
          </View>

            <AdaptiveGlassView
              style={[
                styles.logoutButton,
              ]}
            >
              <LogOut size={20} color={theme.colors.textPrimary} />
              <Text style={[styles.logoutText, { color: theme.colors.textPrimary }]}>Log out</Text>
            </AdaptiveGlassView>
        </Animated.View>
      </Animated.ScrollView>
      <UniversalFAB />
    </SafeAreaView>
  );
}
