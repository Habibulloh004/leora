import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { EditSquareIcon } from '@assets/icons';
import { AdaptiveGlassView } from '@/components/ui/AdaptiveGlassView';
import { useAppTheme } from '@/constants/theme';

interface GreetingCardProps {
  userName?: string;
  onEditModeChange?: (isEditMode: boolean) => void;
}

export default function GreetingCard({
  userName = 'Sardor',
  onEditModeChange,
}: GreetingCardProps) {
  const [editMode, setEditMode] = useState(false);
  const router = useRouter();
  const theme = useAppTheme();

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  const getFormattedDate = () => {
    const date = new Date();
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
    });
  };

  const handleEditToggle = () => {
    const newEditMode = !editMode;
    setEditMode(newEditMode);
    onEditModeChange?.(newEditMode);
    router.navigate('/(modals)/menage-widget');
  };

  const styles = createStyles(theme);

  return (
    <AdaptiveGlassView style={styles.card}>
      <View style={styles.content}>
        <View>
          <Text style={[styles.greeting, { color: theme.colors.textPrimary }]}>
            {getGreeting()}, {userName}
          </Text>
          <Text style={[styles.date, { color: theme.colors.textMuted }]}>{getFormattedDate()}</Text>
        </View>
        <TouchableOpacity
          style={[styles.editButton, {
            backgroundColor: theme.mode === 'dark'
              ? 'rgba(255, 255, 255, 0.08)'
              : 'rgba(0, 0, 0, 0.05)',
          }]}
          onPress={handleEditToggle}
          activeOpacity={0.7}
        >
          <EditSquareIcon color={theme.colors.textSecondary} size={16} />
          <Text style={[styles.editText, { color: theme.colors.textSecondary }]}>{'Edit'}</Text>
        </TouchableOpacity>
      </View>
    </AdaptiveGlassView>
  );
}

const createStyles = (theme: ReturnType<typeof useAppTheme>) => StyleSheet.create({
  card: {
    marginHorizontal: 16,
    backgroundColor: theme.colors.card,
    marginTop: 16,
    marginBottom: 16,
    borderRadius: 16,
    padding: 20,
  },
  content: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  greeting: {
    fontSize: 24,
    fontWeight: '400',
    marginBottom: 4,
  },
  date: {
    fontSize: 14,
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  editText: {
    fontSize: 14,
    fontWeight: '500',
  },
});
