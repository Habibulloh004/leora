import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useShallow } from 'zustand/react/shallow';

import { useModalStore } from '@/stores/useModalStore';

interface InsightsHeaderProps {
  title?: string;
}

export default function InsightsHeader({ title = 'INSIGHTS' }: InsightsHeaderProps) {
  const router = useRouter();
  const { openInsightsReportModal } = useModalStore(
    useShallow((state) => ({
      openInsightsReportModal: state.openInsightsReportModal,
    }))
  );

  return (
    <View style={styles.container}>
      <View style={styles.actions}>
        <Pressable onPress={() => {}} style={styles.iconButton}>
          <Ionicons name="refresh" size={24} color="#A6A6B9" />
        </Pressable>
        <Pressable onPress={openInsightsReportModal} style={styles.iconButton}>
          <Ionicons name="bar-chart-outline" size={24} color="#A6A6B9" />
        </Pressable>
      </View>
      <View>
        <Text style={styles.title}>{title}</Text>
      </View>
      <View style={styles.actions}>
        <Pressable onPress={() => {}} style={styles.iconButton}>
          <Ionicons name="sparkles-outline" size={24} color="#A6A6B9" />
        </Pressable>
        <Pressable onPress={() => router.navigate('/(tabs)/more')} style={styles.iconButton}>
          <Ionicons name="settings-outline" size={24} color="#A6A6B9" />
        </Pressable>
      </View>
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
  },
});
