// app/(tabs)/(finance)/_layout.tsx
import React from 'react';
import { Stack } from 'expo-router';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import UniversalFAB from '@/components/UniversalFAB';
import { DateTransferIcon, DiagramIcon, DollorEuroIcon, SearchDocIcon, SettingIcon } from '@assets/icons';

function FinanceHeader() {
  return (
    <View style={styles.header}>
      <View style={styles.headerActions0}>
        <TouchableOpacity style={styles.headerButton}>
          <DollorEuroIcon color="#A6A6B9" size={24} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.headerButton}>
          <DiagramIcon color="#A6A6B9" size={24} />
        </TouchableOpacity>
      </View>
      <View style={styles.headerTitle}>
        <Text style={styles.headerTitleText}>FINANCE</Text>
      </View>
      <View style={styles.headerActions1}>
        <TouchableOpacity style={styles.headerButton}>
          <DateTransferIcon color="#A6A6B9" size={24} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.headerButton}>
          <SearchDocIcon color="#A6A6B9" size={24} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.headerButton}>
          <SettingIcon color="#A6A6B9" size={24} />
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
      <UniversalFAB />
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
    height: 60,
    backgroundColor: '#25252B',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#34343D',
  },
  headerTitle: {
    justifyContent: "center",
    alignItems: "center",
    flex: 1,
  },
  headerTitleText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#A6A6B9',
  },
  headerActions0: {
    flex: 1,
    flexDirection: 'row',
    gap: 12,
  },
  headerActions1: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: "flex-end",
    gap: 12,
  },
  headerButton: {
    width: "auto",
    height: "auto",
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
});