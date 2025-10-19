import React from 'react';
import { Pressable, ScrollView, StyleSheet, Switch, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

import UniversalFAB from '@/components/UniversalFAB';
import { useSettingsStore } from '@/stores/useSettingsStore';
import { useTheme } from '@/contexts/ThemeContext';

interface MenuItemProps {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  subtitle?: string;
  badge?: string;
  showArrow?: boolean;
  onPress?: () => void;
  rightElement?: React.ReactNode;
}

const languageLabels: Record<string, string> = {
  en: 'English',
  ru: 'Русский',
  uz: "O'zbek",
};

function MenuItem({
  icon,
  title,
  subtitle,
  badge,
  showArrow = true,
  onPress,
  rightElement,
}: MenuItemProps) {
  return (
    <Pressable style={styles.menuItem} onPress={onPress}>
      <View style={styles.menuIconContainer}>
        <Ionicons name={icon} size={22} color="#A6A6B9" />
      </View>
      <View style={styles.menuContent}>
        <Text style={styles.menuTitle}>{title}</Text>
        {subtitle ? <Text style={styles.menuSubtitle}>{subtitle}</Text> : null}
      </View>
      {badge && (
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{badge}</Text>
        </View>
      )}
      {rightElement || (showArrow && <Ionicons name="chevron-forward" size={18} color="#666666" />)}
    </Pressable>
  );
}

function SectionHeader({ title }: { title: string }) {
  return <Text style={styles.sectionHeader}>{title}</Text>;
}

export default function MoreScreen() {
  const router = useRouter();
  const [syncEnabled, setSyncEnabled] = React.useState(true);
  const language = useSettingsStore((state) => state.language);
  const { theme } = useTheme();

  const currentLanguageLabel = languageLabels[language] ?? 'English';

  return (
    <SafeAreaView style={styles.container} edges={['left', 'right', 'bottom']}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <SectionHeader title="Account" />
        <View style={styles.section}>
          <MenuItem
            icon="person-outline"
            title="Profile"
            subtitle="View and update your personal details"
            onPress={() => router.navigate('/profile')}
          />
          <MenuItem
            icon="star-outline"
            title="Premium status"
            subtitle="Manage your subscription"
            onPress={() => {}}
          />
          <MenuItem
            icon="trophy-outline"
            title="Achievements"
            subtitle="Track your milestones"
            onPress={() => {}}
          />
          <MenuItem
            icon="stats-chart-outline"
            title="Statistics"
            subtitle="See your productivity insights"
            onPress={() => {}}
          />
        </View>

        <SectionHeader title="Preferences" />
        <View style={styles.section}>
          <MenuItem
            icon="color-palette-outline"
            title="Appearance"
            subtitle={theme === 'dark' ? 'Dark theme' : 'Light theme'}
            onPress={() => router.navigate('/profile')}
          />
          <MenuItem
            icon="language-outline"
            title="Language & region"
            subtitle={currentLanguageLabel}
            onPress={() => router.navigate('/profile')}
          />
          <MenuItem
            icon="notifications-outline"
            title="Notifications"
            subtitle="Reminders and alerts"
            onPress={() => {}}
          />
          <MenuItem
            icon="shield-checkmark-outline"
            title="Security"
            subtitle="Passwords, Face ID"
            onPress={() => router.navigate('/profile/security')}
          />
        </View>

        <SectionHeader title="Data & Storage" />
        <View style={styles.section}>
          <MenuItem
            icon="cloud-outline"
            title="Cloud sync"
            showArrow={false}
            rightElement={
              <Switch
                value={syncEnabled}
                onValueChange={setSyncEnabled}
                trackColor={{ false: '#3e3e3e', true: '#4CAF50' }}
                thumbColor="#ffffff"
              />
            }
          />
          <MenuItem
            icon="save-outline"
            title="Backups"
            subtitle="Today, 03:45"
            onPress={() => {}}
          />
          <MenuItem
            icon="share-outline"
            title="Export data"
            onPress={() => {}}
          />
          <MenuItem
            icon="trash-outline"
            title="Clear cache"
            subtitle="45 MB"
            onPress={() => {}}
          />
        </View>

        <SectionHeader title="Integrations" />
        <View style={styles.section}>
          <MenuItem
            icon="calendar-outline"
            title="Calendars"
            badge="2/3"
            onPress={() => {}}
          />
          <MenuItem
            icon="apps-outline"
            title="Connected apps"
            badge="3/8"
            onPress={() => {}}
          />
          <MenuItem
            icon="phone-portrait-outline"
            title="Devices"
            badge="1/2"
            onPress={() => {}}
          />
        </View>

        <SectionHeader title="Help & Support" />
        <View style={styles.section}>
          <MenuItem
            icon="book-outline"
            title="Guides"
            onPress={() => {}}
          />
          <MenuItem
            icon="help-circle-outline"
            title="FAQ"
            onPress={() => {}}
          />
          <MenuItem
            icon="chatbubbles-outline"
            title="Support"
            subtitle="Live chat"
            onPress={() => {}}
          />
          <MenuItem
            icon="information-circle-outline"
            title="About Leora"
            subtitle="Version 1.0.0"
            onPress={() => {}}
          />
        </View>

        <View style={styles.bottomSpacer} />
      </ScrollView>
      <UniversalFAB />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#25252B',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    gap: 24,
  },
  section: {
    backgroundColor: '#31313A',
    borderRadius: 12,
    overflow: 'hidden',
  },
  sectionHeader: {
    fontSize: 12,
    fontWeight: '700',
    color: '#666666',
    letterSpacing: 1,
    marginLeft: 4,
    marginTop: 8,
    marginBottom: 12,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#78788059',
  },
  menuIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#78788033',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  menuContent: {
    flex: 1,
  },
  menuTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  menuSubtitle: {
    fontSize: 13,
    color: '#A6A6B9',
    marginTop: 2,
  },
  badge: {
    backgroundColor: '#78788033',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
    marginRight: 8,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#A6A6B9',
  },
  bottomSpacer: {
    height: 120,
  },
});
