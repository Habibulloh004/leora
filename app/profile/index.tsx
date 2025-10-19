import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '@/stores/useAuthStore';
import { useSettingsStore } from '@/stores/useSettingsStore';
import { useTheme } from '@/contexts/ThemeContext';
import { useRouter } from 'expo-router';
import React, { useMemo } from 'react';
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

import { LogoutButton } from '@/components/screens/auth/LogoutButton';

const SUPPORTED_LANGUAGES = [
  { code: 'en', label: 'English' },
  { code: 'ru', label: 'Русский' },
  { code: 'uz', label: "O'zbek" },
];

const InfoRow = ({
  label,
  value,
  icon,
}: {
  label: string;
  value?: string | null;
  icon: keyof typeof Ionicons.glyphMap;
}) => {
  if (!value) return null;

  return (
    <View style={styles.infoRow}>
      <View style={styles.infoIcon}>
        <Ionicons name={icon} size={18} color="#A6A6B9" />
      </View>
      <View style={styles.infoContent}>
        <Text style={styles.infoLabel}>{label}</Text>
        <Text style={styles.infoValue}>{value}</Text>
      </View>
    </View>
  );
};

export default function ProfileScreen() {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const deleteAccount = useAuthStore((state) => state.deleteAccount);
  const authLoading = useAuthStore((state) => state.isLoading);
  const language = useSettingsStore((state) => state.language);
  const setLanguage = useSettingsStore((state) => state.setLanguage);
  const { theme, toggleTheme } = useTheme();

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
      <SafeAreaView style={[styles.safeArea, styles.centered]}>
        <Text style={styles.mutedText}>We couldn&apos;t find your profile information.</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <View style={styles.avatarContainer}>
            <Text style={styles.avatarText}>{initials}</Text>
          </View>
          <View style={styles.headerText}>
            <Text style={styles.name}>{user.fullName}</Text>
            <Text style={styles.username}>@{user.username}</Text>
          </View>
          <View style={styles.headerActions}>
            <View style={styles.badge}>
              <Text style={styles.badgeLabel}>Member • {formattedJoinedDate}</Text>
            </View>
            <View style={styles.editRow}>
              <Ionicons name="create-outline" size={16} color="#A6A6B9" />
              <Text style={styles.editLink} onPress={() => router.push('/profile/edit')}>
                Edit profile
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Contact</Text>
          <InfoRow label="Email" value={user.email || undefined} icon="mail-outline" />
          <InfoRow label="Phone" value={user.phoneNumber || undefined} icon="call-outline" />
          <InfoRow label="Preferred language" value={languageLabel} icon="language-outline" />
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Preferences</Text>
          <View style={styles.preferenceRow}>
            <View>
              <Text style={styles.preferenceLabel}>Primary language</Text>
              <Text style={styles.preferenceHint}>{languageLabel}</Text>
            </View>
            <Ionicons
              name="chevron-forward"
              size={16}
              color="#A6A6B9"
              onPress={handleChangeLanguage}
            />
          </View>

          <View style={styles.preferenceRow}>
            <View>
              <Text style={styles.preferenceLabel}>Dark mode</Text>
              <Text style={styles.preferenceHint}>
                {theme === 'dark' ? 'Enabled' : 'Disabled'}
              </Text>
            </View>
            <Switch
              value={theme === 'dark'}
              onValueChange={toggleTheme}
              thumbColor="#ffffff"
              trackColor={{ false: '#505059', true: '#4CAF50' }}
            />
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Activity</Text>
          <View style={styles.activityRow}>
            <View style={styles.activityBadge}>
              <Ionicons name="calendar-outline" size={18} color="#A6A6B9" />
            </View>
            <View>
              <Text style={styles.activityLabel}>Days with Leora</Text>
              <Text style={styles.activityValue}>
                {daysInApp === 1 ? '1 day' : `${daysInApp} days`}
              </Text>
            </View>
          </View>
          <View style={styles.divider} />
          <View style={styles.activityRow}>
            <View style={styles.activityBadge}>
              <Ionicons name="time-outline" size={18} color="#A6A6B9" />
            </View>
            <View>
              <Text style={styles.activityLabel}>Last updated</Text>
              <Text style={styles.activityValue}>{formattedUpdatedAt}</Text>
            </View>
          </View>
        </View>

        <View style={styles.card}>
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
              android_ripple={{ color: 'rgba(255,107,107,0.2)', borderless: false }}
            >
              <Ionicons name="trash-outline" size={18} color="#FF6B6B" />
              <Text style={styles.deleteLabel}>Delete account</Text>
            </Pressable>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#25252B',
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  mutedText: {
    color: '#A6A6B9',
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 32,
    gap: 16,
  },
  header: {
    backgroundColor: '#31313A',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    gap: 16,
  },
  avatarContainer: {
    width: 92,
    height: 92,
    borderRadius: 46,
    backgroundColor: '#4B4B53',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 40,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  headerText: {
    alignItems: 'center',
    gap: 4,
  },
  name: {
    fontSize: 22,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  username: {
    fontSize: 14,
    color: '#A6A6B9',
  },
  headerActions: {
    alignItems: 'center',
    gap: 12,
  },
  badge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: 'rgba(166,166,185,0.16)',
  },
  badgeLabel: {
    color: '#A6A6B9',
    fontSize: 12,
    letterSpacing: 0.5,
  },
  editRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  editLink: {
    color: '#667eea',
    fontSize: 14,
    fontWeight: '600',
  },
  card: {
    backgroundColor: '#31313A',
    borderRadius: 16,
    padding: 20,
    gap: 16,
  },
  sectionTitle: {
    color: '#FFFFFF',
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
    backgroundColor: 'rgba(166,166,185,0.12)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  infoContent: {
    flex: 1,
  },
  infoLabel: {
    color: '#A6A6B9',
    fontSize: 12,
  },
  infoValue: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  preferenceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  preferenceLabel: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  preferenceHint: {
    color: '#A6A6B9',
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
    backgroundColor: 'rgba(166,166,185,0.12)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  activityLabel: {
    color: '#A6A6B9',
    fontSize: 12,
  },
  activityValue: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  deleteWrapper: {
    gap: 12,
    marginTop: 8,
  },
  deleteHint: {
    color: '#A6A6B9',
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
    backgroundColor: 'rgba(255,107,107,0.12)',
  },
  deleteButtonDisabled: {
    opacity: 0.5,
  },
  deleteLabel: {
    color: '#FF6B6B',
    fontSize: 14,
    fontWeight: '600',
  },
});
