import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { EditSquareIcon } from '@assets/icons';
interface GreetingCardProps {
  userName?: string;
  onEditModeChange?: (isEditMode: boolean) => void;
}

export default function GreetingCard({
  userName = 'Sardor',
  onEditModeChange
}: GreetingCardProps) {
  const [editMode, setEditMode] = useState(false);
  const router = useRouter()
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
    router.navigate('/(modals)/menage-widget')
  };

  return (
    <LinearGradient
      colors={['#34343DCC', '#34343DCC']}
      style={styles.card}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      <View style={styles.content}>
        <View>
          <Text style={styles.greeting}>
            {getGreeting()}, {userName}
          </Text>
          <Text style={styles.date}>{getFormattedDate()}</Text>
        </View>
        <TouchableOpacity
          style={styles.editButton}
          onPress={handleEditToggle}
          activeOpacity={0.7}
        >
            <EditSquareIcon color="#A6A6B9" size={16} />
          <Text style={styles.editText}>{'Edit'}</Text>
        </TouchableOpacity>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  card: {
    marginHorizontal: 16,
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
    color: '#FFFFFF',
    marginBottom: 4,
  },
  date: {
    fontSize: 14,
    color: '#999999',
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  editText: {
    fontSize: 14,
    color: '#A6A6B9',
    fontWeight: '500',
  },
});
