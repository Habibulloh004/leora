import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

interface MoreHeaderProps {
  title?: string;
}

export default function MoreHeader({ title = 'MORE' }: MoreHeaderProps) {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Open profile"
        style={styles.iconButton}
        onPress={() => router.navigate('/profile')}
      >
        <Ionicons name="person-circle-outline" size={26} color="#A6A6B9" />
      </Pressable>
      <Text style={styles.title}>{title}</Text>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Notifications"
        style={styles.iconButton}
        onPress={() => {}}
      >
        <Ionicons name="notifications-outline" size={24} color="#A6A6B9" />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 60,
    backgroundColor: '#25252B',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#34343D',
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#A6A6B9',
    letterSpacing: 1,
  },
  iconButton: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
