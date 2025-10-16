// app/(tabs)/(insights)/(tabs)/_layout.tsx
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import { withLayoutContext } from 'expo-router';
import { StyleSheet } from 'react-native';

const { Navigator } = createMaterialTopTabNavigator();

export const InsightsTopTabs = withLayoutContext(Navigator);

const InsightsTabsLayout = () => {
  return (
    <InsightsTopTabs
      style={styles.container}
      screenOptions={{
        tabBarStyle: styles.tabBar,
        tabBarIndicatorStyle: styles.indicator,
        tabBarLabelStyle: styles.label,
        tabBarActiveTintColor: '#FFFFFF',
        tabBarInactiveTintColor: '#7E8B9A',
        tabBarItemStyle: styles.tabItem,
        tabBarScrollEnabled: false,
      }}
    >
      <InsightsTopTabs.Screen name="index" options={{ title: 'Обзор' }} />
      <InsightsTopTabs.Screen name="finance" options={{ title: 'Финансы' }} />
      <InsightsTopTabs.Screen name="productivity" options={{ title: 'Продуктивность' }} />
      <InsightsTopTabs.Screen name="wisdom" options={{ title: 'Мудрость' }} />
    </InsightsTopTabs>
  );
};

export default InsightsTabsLayout;

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#25252B',
  },
  tabBar: {
    backgroundColor: '#25252B',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#1F1F22',
    elevation: 0,
    shadowOpacity: 0,
  },
  indicator: {
    backgroundColor: '#FFFFFF',
    height: 2,
    borderRadius: 1,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    textTransform: 'none',
  },
  tabItem: {
    width: 'auto',
  },
});
