import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useShallow } from 'zustand/react/shallow';

import { useModalStore } from '@/stores/useModalStore';
import { useThemeColors } from '@/constants/theme';

interface PlannerHeaderProps {
  title?: string;
}

export default function PlannerHeader({ title = 'PLANNER' }: PlannerHeaderProps) {
  const router = useRouter();
  const colors = useThemeColors();
  const { openPlannerFocusModal } = useModalStore(
    useShallow((state) => ({
      openPlannerFocusModal: state.openPlannerFocusModal,
    }))
  );

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: colors.background, borderBottomColor: colors.border },
      ]}
    >
      <View style={styles.actions}>
        <Pressable
          onPress={() => router.navigate('/(modals)/calendar')}
          style={[styles.iconButton, { backgroundColor: colors.background }]}
        >
          <Ionicons name="calendar-outline" size={24} color={colors.textSecondary} />
        </Pressable>
        <Pressable
          onPress={openPlannerFocusModal}
          style={[styles.iconButton, { backgroundColor: colors.background }]}
        >
          <Ionicons name="sparkles-outline" size={24} color={colors.textSecondary} />
        </Pressable>
      </View>
      <View>
        <Text style={[styles.title, { color: colors.textPrimary }]}>{title}</Text>
      </View>
      <View style={styles.actions}>
        <Pressable
          onPress={() => router.navigate('/(modals)/search')}
          style={[styles.iconButton, { backgroundColor: colors.background }]}
        >
          <Ionicons name="search" size={24} color={colors.textSecondary} />
        </Pressable>
        <Pressable
          onPress={() => router.navigate('/(tabs)/more')}
          style={[styles.iconButton, { backgroundColor: colors.background }]}
        >
          <Ionicons name="settings-outline" size={24} color={colors.textSecondary} />
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 60,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    borderBottomWidth: 1,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: 1,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconButton: {
    width: 'auto',
    height: 'auto',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 4,
  },
});
