import React from 'react';
import { TouchableOpacity, Text, StyleSheet, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { LogOut } from 'lucide-react-native';
import { useAuthStore } from '@/stores/useAuthStore';

interface LogoutButtonProps {
  variant?: 'icon' | 'text' | 'both';
  iconColor?: string;
  textColor?: string;
  size?: number;
}

export const LogoutButton: React.FC<LogoutButtonProps> = ({
  variant = 'both',
  iconColor = '#ef4444',
  textColor = '#ef4444',
  size = 20,
}) => {
  const { logout, user } = useAuthStore();
  const router = useRouter();

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            await logout();
            router.replace('/(auth)/login');
          },
        },
      ]
    );
  };

  return (
    <TouchableOpacity
      onPress={handleLogout}
      style={styles.container}
      activeOpacity={0.7}
    >
      {(variant === 'icon' || variant === 'both') && (
        <LogOut size={size} color={iconColor} />
      )}
      {(variant === 'text' || variant === 'both') && (
        <Text style={[styles.text, { color: textColor }]}>Logout</Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 8,
  },
  text: {
    fontSize: 16,
    fontWeight: '600',
  },
});
