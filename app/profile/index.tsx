import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '@/stores/useAuthStore';
import { useSettingsStore } from '@/stores/useSettingsStore';
import { useTheme } from '@/contexts/ThemeContext';
import { getTheme, type ThemeColors } from '@/constants/theme';
import { useRouter } from 'expo-router';
import React, { useEffect, useMemo } from 'react';
import {
  ActionSheetIOS,
  Alert,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, {
  Easing,
  interpolateColor,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

import { LogoutButton } from '@/components/screens/auth/LogoutButton';

const SUPPORTED_LANGUAGES = [
  { code: 'en', label: 'English' },
  { code: 'ru', label: 'Русский' },
  { code: 'uz', label: "O'zbek" },
];

type InfoRowProps = {
  label: string;
  value?: string | null;
  icon: keyof typeof Ionicons.glyphMap;
};

const LIGHT_COLORS = getTheme('light').colors;
const DARK_COLORS = getTheme('dark').colors;
const AnimatedSafeAreaView = Animated.createAnimatedComponent(SafeAreaView);

export default function ProfileScreen() {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const deleteAccount = useAuthStore((state) => state.deleteAccount);
  const authLoading = useAuthStore((state) => state.isLoading);
  const language = useSettingsStore((state) => state.language);
  const setLanguage = useSettingsStore((state) => state.setLanguage);
  const { theme, toggleTheme } = useTheme();
  const palette = useMemo(() => getTheme(theme).colors, [theme]);
  const styles = useMemo(() => createStyles(palette), [palette]);
  const themeTransition = useSharedValue(theme === 'dark' ? 1 : 0);

  useEffect(() => {
    themeTransition.value = withTiming(theme === 'dark' ? 1 : 0, {
      duration: 280,
      easing: Easing.inOut(Easing.ease),
    });
  }, [theme, themeTransition]);

  const safeAreaAnimatedStyle = useAnimatedStyle(() => ({
    backgroundColor: interpolateColor(
      themeTransition.value,
      [0, 1],
      [LIGHT_COLORS.background, DARK_COLORS.background]
    ),
  }));

  const surfaceAnimatedStyle = useAnimatedStyle(() => ({
    backgroundColor: interpolateColor(
      themeTransition.value,
      [0, 1],
      [LIGHT_COLORS.card, DARK_COLORS.card]
    ),
  }));

  const overlayAnimatedStyle = useAnimatedStyle(() => ({
    backgroundColor: interpolateColor(
      themeTransition.value,
      [0, 1],
      [LIGHT_COLORS.overlaySoft, DARK_COLORS.overlaySoft]
    ),
  }));

  const dividerAnimatedStyle = useAnimatedStyle(() => ({
    backgroundColor: interpolateColor(
      themeTransition.value,
      [0, 1],
      [LIGHT_COLORS.border, DARK_COLORS.border]
    ),
  }));

  const InfoRow = ({ label, value, icon }: InfoRowProps) => {
    if (!value) return null;

    return (
      <View style={styles.infoRow}>
        <Animated.View style={[styles.infoIcon, overlayAnimatedStyle]}>
          <Ionicons name={icon} size={18} color={palette.textMuted} />
        </Animated.View>
        <View style={styles.infoContent}>
          <Text style={styles.infoLabel}>{label}</Text>
          <Text style={styles.infoValue}>{value}</Text>
        </View>
      </View>
    );
  };

  const initials = useMemo(() => {
    const source = user?.fullName || user?.username || 'U';
    return source.slice(0, 1).toUpperCase();
  }, [user]);

  const formattedJoinedDate = useMemo(() => {
    if (!user?.createdAt) return '—';
    const date =
      typeof user.createdAt === 'string' ? new Date(user.createdAt) : new Date(user.createdAt);
    if (Number.isNaN(date.getTime())) return '—';
    return date.toLocaleDateString();
  }, [user?.createdAt]);

  const formattedUpdatedAt = useMemo(() => {
    if (!user?.updatedAt) return '—';
    const date =
      typeof user.updatedAt === 'string' ? new Date(user.updatedAt) : new Date(user.updatedAt);
    if (Number.isNaN(date.getTime())) return '—';
    return date.toLocaleString();
  }, [user?.updatedAt]);

  const daysInApp = useMemo(() => {
    if (!user?.createdAt) return 0;
    const created =
      typeof user.createdAt === 'string' ? new Date(user.createdAt) : new Date(user.createdAt);
    if (Number.isNaN(created.getTime())) return 0;
    const diff = Date.now() - created.getTime();
    return Math.max(1, Math.round(diff / (1000 * 60 * 60 * 24)));
  }, [user?.createdAt]);

  const languageLabel = useMemo(
    () => SUPPORTED_LANGUAGES.find((item) => item.code === language)?.label || 'English',
    [language]
  );

  const handleChangeLanguage = () => {
    if (Platform.OS === 'ios') {
      ActionSheetIOS.showActionSheetWithOptions(
        {
          title: 'Choose language',
          options: SUPPORTED_LANGUAGES.map((item) => item.label).concat('Cancel'),
          cancelButtonIndex: SUPPORTED_LANGUAGES.length,
        },
        (index) => {
          if (index < SUPPORTED_LANGUAGES.length) {
            setLanguage(SUPPORTED_LANGUAGES[index].code);
          }
        }
      );
      return;
    }
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      'Delete account',
      'This action cannot be undone. Are you sure you want to permanently delete your account?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            const success = await deleteAccount();
            if (success) {
              router.replace('/(auth)/login');
            }
          },
        },
      ]
    );
  };

  if (!user) {
    return (
      <AnimatedSafeAreaView style={[styles.safeArea, styles.centered, safeAreaAnimatedStyle]}>
        <Text style={styles.mutedText}>We couldn&apos;t find your profile information.</Text>
      </AnimatedSafeAreaView>
    );
  }

  return (
    <AnimatedSafeAreaView style={[styles.safeArea, safeAreaAnimatedStyle]}>
      <ScrollView
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View style={[styles.header, surfaceAnimatedStyle]}>
          <Animated.View style={[styles.avatarContainer, overlayAnimatedStyle]}>
            <Text style={styles.avatarText}>{initials}</Text>
          </Animated.View>
          <View style={styles.headerText}>
            <Text style={styles.name}>{user.fullName}</Text>
            <Text style={styles.username}>@{user.username}</Text>
          </View>
          <View style={styles.headerActions}>
            <Animated.View style={[styles.badge, overlayAnimatedStyle]}>
              <Text style={styles.badgeLabel}>Member • {formattedJoinedDate}</Text>
            </Animated.View>
            <View style={styles.editRow}>
              <Ionicons name="create-outline" size={16} color={palette.textMuted} />
              <Text style={styles.editLink} onPress={() => router.push('/profile/edit')}>
                Edit profile
              </Text>
            </View>
          </View>
        </Animated.View>

        <Animated.View style={[styles.card, surfaceAnimatedStyle]}>
          <Text style={styles.sectionTitle}>Contact</Text>
          <InfoRow label="Email" value={user.email || undefined} icon="mail-outline" />
          <InfoRow label="Phone" value={user.phoneNumber || undefined} icon="call-outline" />
          <InfoRow label="Preferred language" value={languageLabel} icon="language-outline" />
        </Animated.View>

        <Animated.View style={[styles.card, surfaceAnimatedStyle]}>
          <Text style={styles.sectionTitle}>Preferences</Text>
          <View style={styles.preferenceRow}>
            <View>
              <Text style={styles.preferenceLabel}>Primary language</Text>
              <Text style={styles.preferenceHint}>{languageLabel}</Text>
            </View>
            <Ionicons name="chevron-forward" size={16} color={palette.textMuted} onPress={handleChangeLanguage} />
          </View>

          <View style={styles.preferenceRow}>
            <View>
              <Text style={styles.preferenceLabel}>Dark mode</Text>
              <Text style={styles.preferenceHint}>{theme === 'dark' ? 'Enabled' : 'Disabled'}</Text>
            </View>
            <Switch
              value={theme === 'dark'}
              onValueChange={toggleTheme}
              thumbColor={theme === 'dark' ? palette.surface : palette.white}
              trackColor={{ false: palette.borderMuted, true: palette.primary }}
              ios_backgroundColor={palette.borderMuted}
            />
          </View>
        </Animated.View>

        <Animated.View style={[styles.card, surfaceAnimatedStyle]}>
          <Text style={styles.sectionTitle}>Activity</Text>
          <View style={styles.activityRow}>
            <Animated.View style={[styles.activityBadge, overlayAnimatedStyle]}>
              <Ionicons name="calendar-outline" size={18} color={palette.textMuted} />
            </Animated.View>
            <View>
              <Text style={styles.activityLabel}>Days with Leora</Text>
              <Text style={styles.activityValue}>
                {daysInApp === 1 ? '1 day' : `${daysInApp} days`}
              </Text>
            </View>
          </View>
          <Animated.View style={[styles.divider, dividerAnimatedStyle]} />
          <View style={styles.activityRow}>
            <Animated.View style={[styles.activityBadge, overlayAnimatedStyle]}>
              <Ionicons name="time-outline" size={18} color={palette.textMuted} />
            </Animated.View>
            <View>
              <Text style={styles.activityLabel}>Last updated</Text>
              <Text style={styles.activityValue}>{formattedUpdatedAt}</Text>
            </View>
          </View>
        </Animated.View>

        <Animated.View style={[styles.card, surfaceAnimatedStyle]}>
          <Text style={styles.sectionTitle}>Account</Text>
          <LogoutButton />
          <View style={styles.deleteWrapper}>
            <Text style={styles.deleteHint}>
              Leaving? You can delete your account and remove all personal data.
            </Text>
            <Pressable
              style={[styles.deleteButton, authLoading && styles.deleteButtonDisabled]}
              onPress={handleDeleteAccount}
              disabled={authLoading}
              android_ripple={{ color: palette.dangerBg, borderless: false }}
            >
              <Ionicons name="trash-outline" size={18} color={palette.danger} />
              <Text style={styles.deleteLabel}>Delete account</Text>
            </Pressable>
          </View>
        </Animated.View>
      </ScrollView>
    </AnimatedSafeAreaView>
  );
}

const createStyles = (palette: ThemeColors) =>
  StyleSheet.create({
    safeArea: {
      flex: 1,
      backgroundColor: palette.background,
    },
    centered: {
      justifyContent: 'center',
      alignItems: 'center',
    },
    mutedText: {
      color: palette.textSecondary,
    },
    contentContainer: {
      padding: 16,
      paddingBottom: 32,
      gap: 16,
    },
    header: {
      backgroundColor: palette.surface,
      borderRadius: 16,
      padding: 20,
      alignItems: 'center',
      gap: 16,
    },
    avatarContainer: {
      width: 92,
      height: 92,
      borderRadius: 46,
      backgroundColor: palette.overlaySoft,
      justifyContent: 'center',
      alignItems: 'center',
    },
    avatarText: {
      fontSize: 40,
      fontWeight: '700',
      color: palette.textPrimary,
    },
    headerText: {
      alignItems: 'center',
      gap: 4,
    },
    name: {
      fontSize: 22,
      fontWeight: '700',
      color: palette.textPrimary,
    },
    username: {
      fontSize: 14,
      color: palette.textSecondary,
    },
    headerActions: {
      alignItems: 'center',
      gap: 12,
    },
    badge: {
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 999,
      backgroundColor: palette.overlaySoft,
    },
    badgeLabel: {
      color: palette.textSecondary,
      fontSize: 12,
      letterSpacing: 0.5,
    },
    editRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
    },
    editLink: {
      color: palette.primary,
      fontSize: 14,
      fontWeight: '600',
    },
    card: {
      backgroundColor: palette.surface,
      borderRadius: 16,
      padding: 20,
      gap: 16,
    },
    sectionTitle: {
      color: palette.textPrimary,
      fontSize: 16,
      fontWeight: '700',
    },
    infoRow: {
      flexDirection: 'row',
      gap: 12,
      alignItems: 'center',
    },
    infoIcon: {
      width: 36,
      height: 36,
      borderRadius: 12,
      backgroundColor: palette.overlaySoft,
      justifyContent: 'center',
      alignItems: 'center',
    },
    infoContent: {
      flex: 1,
    },
    infoLabel: {
      color: palette.textSecondary,
      fontSize: 12,
    },
    infoValue: {
      color: palette.textPrimary,
      fontSize: 14,
      fontWeight: '600',
    },
    preferenceRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    preferenceLabel: {
      color: palette.textPrimary,
      fontSize: 14,
      fontWeight: '600',
    },
    preferenceHint: {
      color: palette.textSecondary,
      fontSize: 12,
      marginTop: 2,
    },
    activityRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
    },
    activityBadge: {
      width: 36,
      height: 36,
      borderRadius: 12,
      backgroundColor: palette.overlaySoft,
      justifyContent: 'center',
      alignItems: 'center',
    },
    activityLabel: {
      color: palette.textSecondary,
      fontSize: 12,
    },
    activityValue: {
      color: palette.textPrimary,
      fontSize: 14,
      fontWeight: '600',
    },
    divider: {
      height: StyleSheet.hairlineWidth,
      backgroundColor: palette.border,
    },
    deleteWrapper: {
      gap: 12,
      marginTop: 8,
    },
    deleteHint: {
      color: palette.textSecondary,
      fontSize: 12,
      lineHeight: 16,
    },
    deleteButton: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      paddingVertical: 12,
      justifyContent: 'center',
      borderRadius: 12,
      backgroundColor: palette.dangerBg,
    },
    deleteButtonDisabled: {
      opacity: 0.5,
    },
    deleteLabel: {
      color: palette.danger,
      fontSize: 14,
      fontWeight: '600',
    },
  });
