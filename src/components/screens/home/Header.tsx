import { Bell, Search } from 'lucide-react-native';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface HeaderProps {
  onSearchPress?: () => void;
  onNotificationPress?: () => void;
  onProfilePress?: () => void;
  hasNotifications?: boolean;
}

export default function Header({
  onSearchPress,
  onNotificationPress,
  onProfilePress,
  hasNotifications = true,
}: HeaderProps) {
  return (
    <View style={styles.header}>
      <Text style={styles.logo}>LEORA</Text>
      
      <View style={styles.actions}>
        <TouchableOpacity 
          style={styles.iconButton}
          onPress={onSearchPress}
          activeOpacity={0.7}
        >
          <Search color="#FFFFFF" size={22} opacity={0.7} />
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.iconButton}
          onPress={onNotificationPress}
          activeOpacity={0.7}
        >
          <Bell color="#FFFFFF" size={22} opacity={0.7} />
          {hasNotifications && <View style={styles.notificationDot} />}
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.avatar}
          onPress={onProfilePress}
          activeOpacity={0.7}
        >
          <Text style={styles.avatarText}>S</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#1A1A1A',
  },
  logo: {
    fontSize: 18,
    fontWeight: '300',
    color: '#FFFFFF',
    letterSpacing: 3,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  iconButton: {
    position: 'relative',
    padding: 4,
  },
  notificationDot: {
    position: 'absolute',
    top: 2,
    right: 2,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FFA500',
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#1A1A1A',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});

