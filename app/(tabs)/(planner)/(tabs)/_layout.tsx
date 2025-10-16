// app/(tabs)/(planner)/(tabs)/_layout.tsx
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import { withLayoutContext } from 'expo-router';
import { StyleSheet } from 'react-native';

const { Navigator } = createMaterialTopTabNavigator();

export const PlannerTopTabs = withLayoutContext(Navigator);

const PlannerTabsLayout = () => {
  return (
    <PlannerTopTabs
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
      <PlannerTopTabs.Screen name="index" options={{ title: 'Tasks' }} />
      <PlannerTopTabs.Screen name="goals" options={{ title: 'Goals' }} />
      <PlannerTopTabs.Screen name="habits" options={{ title: 'Habits' }} />
    </PlannerTopTabs>
  );
};

export default PlannerTabsLayout;

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
