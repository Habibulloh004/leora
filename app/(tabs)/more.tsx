import React from 'react';
import { ScrollView, StyleSheet, Text, View, Pressable, Switch } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import MoreHeader from '@/components/more/MoreHeader';
import UniversalFAB from '@/components/UniversalFAB';
import { LogoutButton } from '@/components/auth';

interface MenuItemProps {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  subtitle?: string;
  badge?: string;
  showArrow?: boolean;
  onPress?: () => void;
  rightElement?: React.ReactNode;
}

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
        <Ionicons name={icon} size={24} color="#A6A6B9" />
      </View>
      <View style={styles.menuContent}>
        <Text style={styles.menuTitle}>{title}</Text>
        {subtitle && <Text style={styles.menuSubtitle}>{subtitle}</Text>}
      </View>
      {badge && (
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{badge}</Text>
        </View>
      )}
      {rightElement || (showArrow && <Ionicons name="chevron-forward" size={20} color="#666666" />)}
    </Pressable>
  );
}

interface SectionHeaderProps {
  title: string;
}

function SectionHeader({ title }: SectionHeaderProps) {
  return <Text style={styles.sectionHeader}>{title}</Text>;
}

export default function MoreScreen() {
  const [syncEnabled, setSyncEnabled] = React.useState(true);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <MoreHeader />
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* User Profile Card */}
        <Pressable style={styles.profileCard}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>S</Text>
          </View>
          <View style={styles.profileInfo}>
            <Text style={styles.profileName}>Sarvar</Text>
            <Text style={styles.profileEmail}>sarvar@example.com</Text>
            <Text style={styles.profilePremium}>⭐ Premium до 15 марта 2025</Text>
            <Text style={styles.profileLevel}>Уровень 12 • 3,450 XP</Text>
          </View>
        </Pressable>

        {/* Account Section */}
        <SectionHeader title="АККАУНТ" />
        <View style={styles.section}>
          <MenuItem
            icon="person-outline"
            title="Профиль"
            onPress={() => {}}
          />
          <MenuItem
            icon="star-outline"
            title="Premium статус"
            subtitle="Активен"
            onPress={() => {}}
          />
          <MenuItem
            icon="trophy-outline"
            title="Достижения"
            badge="23/50"
            onPress={() => {}}
          />
          <MenuItem
            icon="stats-chart-outline"
            title="Статистика"
            onPress={() => {}}
          />
        </View>

        {/* Settings Section */}
        <SectionHeader title="НАСТРОЙКИ" />
        <View style={styles.section}>
          <MenuItem
            icon="color-palette-outline"
            title="Внешний вид"
            subtitle="Темная тема"
            onPress={() => {}}
          />
          <MenuItem
            icon="notifications-outline"
            title="Уведомления"
            onPress={() => {}}
          />
          <MenuItem
            icon="hardware-chip-outline"
            title="AI ассистент"
            subtitle="Умеренный"
            onPress={() => {}}
          />
          <MenuItem
            icon="shield-checkmark-outline"
            title="Безопасность"
            subtitle="Face ID"
            onPress={() => {}}
          />
          <MenuItem
            icon="globe-outline"
            title="Язык и регион"
            subtitle="Русский"
            onPress={() => {}}
          />
        </View>

        {/* Data Section */}
        <SectionHeader title="ДАННЫЕ" />
        <View style={styles.section}>
          <MenuItem
            icon="cloud-outline"
            title="Синхронизация"
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
            title="Резервное копирование"
            subtitle="Сегодня, 03:45"
            onPress={() => {}}
          />
          <MenuItem
            icon="share-outline"
            title="Экспорт данных"
            onPress={() => {}}
          />
          <MenuItem
            icon="trash-outline"
            title="Очистка кэша"
            subtitle="45 MB"
            onPress={() => {}}
          />
        </View>

        {/* Integrations Section */}
        <SectionHeader title="ИНТЕГРАЦИИ" />
        <View style={styles.section}>
          <MenuItem
            icon="calendar-outline"
            title="Календари"
            badge="2/3"
            onPress={() => {}}
          />
          <MenuItem
            icon="apps-outline"
            title="Приложения"
            badge="3/8"
            onPress={() => {}}
          />
          <MenuItem
            icon="phone-portrait-outline"
            title="Устройства"
            badge="1/2"
            onPress={() => {}}
          />
        </View>

        {/* Help Section */}
        <SectionHeader title="ПОМОЩЬ" />
        <View style={styles.section}>
          <MenuItem
            icon="book-outline"
            title="Руководство"
            onPress={() => {}}
          />
          <MenuItem
            icon="help-circle-outline"
            title="FAQ"
            onPress={() => {}}
          />
          <MenuItem
            icon="chatbubbles-outline"
            title="Поддержка"
            subtitle="Онлайн"
            onPress={() => {}}
          />
          <MenuItem
            icon="information-circle-outline"
            title="О приложении"
            subtitle="v1.0.0"
            onPress={() => {}}
          />
        </View>

        {/* Account Actions */}
        <View style={styles.dangerSection}>
          <LogoutButton/>
          <Pressable style={styles.dangerButton}>
            <Ionicons name="log-out-outline" size={20} color="#FF6B6B" />
            <Text style={styles.dangerButtonText}>Выйти из аккаунта</Text>
          </Pressable>

          <Pressable style={styles.deleteButton}>
            <Ionicons name="trash-outline" size={20} color="#999999" />
            <Text style={styles.deleteButtonText}>Удалить аккаунт</Text>
          </Pressable>
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
  },
  profileCard: {
    flexDirection: 'row',
    backgroundColor: '#31313A',
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    gap: 16,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 100,
    backgroundColor: '#78788059',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 28,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  profileInfo: {
    flex: 1,
    justifyContent: 'center',
    gap: 4,
  },
  profileName: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  profileEmail: {
    fontSize: 14,
    color: '#A6A6B9',
  },
  profilePremium: {
    fontSize: 14,
    color: '#FFD700',
    marginTop: 4,
  },
  profileLevel: {
    fontSize: 14,
    color: '#A6A6B9',
  },
  sectionHeader: {
    fontSize: 12,
    fontWeight: '700',
    color: '#666666',
    letterSpacing: 1,
    marginTop: 8,
    marginBottom: 12,
    marginLeft: 4,
  },
  section: {
    backgroundColor: '#31313A',
    borderRadius: 12,
    marginBottom: 20,
    overflow: 'hidden',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#78788059',
  },
  menuIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: '#78788059',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  menuContent: {
    flex: 1,
  },
  menuTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  menuSubtitle: {
    fontSize: 14,
    color: '#4CAF50',
  },
  badge: {
    backgroundColor: '#78788059',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 8,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#A6A6B9',
  },
  dangerSection: {
    marginTop: 20,
    gap: 12,
  },
  dangerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#31313A',
    borderRadius: 12,
    padding: 16,
    gap: 8,
  },
  dangerButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FF6B6B',
  },
  deleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#31313A',
    borderRadius: 12,
    padding: 16,
    gap: 8,
  },
  deleteButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#999999',
  },
  bottomSpacer: {
    height: 100,
  },
});

