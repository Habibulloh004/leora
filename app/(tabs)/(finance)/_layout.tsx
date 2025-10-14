// app/(tabs)/(finance)/_layout.tsx
import React from 'react';
import { Stack } from 'expo-router';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeftRight, Download } from 'lucide-react-native';

function FinanceHeader() {
  return (
    <View style={styles.header}>
      <Text style={styles.headerTitle}>Finance</Text>
      <View style={styles.headerActions}>
        <TouchableOpacity style={styles.headerButton}>
          <ArrowLeftRight color="#FFFFFF" size={20} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.headerButton}>
          <Download color="#FFFFFF" size={20} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const FinanceLayout = () => {
  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <FinanceHeader />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: '#25252B' },
        }}
      >
        <Stack.Screen name="(tabs)" />
      </Stack>
    </SafeAreaView>
  );
};

export default FinanceLayout;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#25252B',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#34343D',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  headerActions: {
    flexDirection: 'row',
    gap: 8,
  },
  headerButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#0F0F0F',
    justifyContent: 'center',
    alignItems: 'center',
  },
});