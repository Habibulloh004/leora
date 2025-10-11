import FABMenu from '@/components/screens/home/FABMenu';
import Header from '@/components/screens/home/Header';
import React from 'react';
import { ScrollView, StyleSheet, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';


export default function HomeScreen() {
  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Header />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <Text style={{ color: "#fff" }}>Finance Screen</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#25252B',
  },
  scrollContent: {
    paddingTop: 64, // allow space for header above
    paddingBottom: 40,
  },
  bottomSpacer: {
    height: 100,
  },
});

