// app/(tabs)/(finance)/(tabs)/_layout.tsx
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import { withLayoutContext } from 'expo-router';
import { StyleSheet } from 'react-native';
import { useMemo } from 'react';
import { useAppTheme } from '@/constants/theme';

const { Navigator } = createMaterialTopTabNavigator();

export const MaterialTopTabs = withLayoutContext(Navigator);

const Layout = () => {
  const theme = useAppTheme();
  const styles = useMemo(
    () =>
      StyleSheet.create({
        container: {
          backgroundColor: theme.colors.background,
          paddingBottom: 32,
        },
        tabBar: {
          backgroundColor: theme.colors.background,
          borderBottomWidth: StyleSheet.hairlineWidth,
          borderBottomColor: theme.colors.border,
          elevation: 0,
          shadowOpacity: 0,
        },
        indicator: {
          backgroundColor: theme.colors.textTertiary,
          height: 1,
          borderRadius: 1,
        },
        label: {
          fontSize: 13,
          fontWeight: '600',
          textTransform: 'none',
        },
        tabItem: {
          width: 'auto',
          overflow: 'hidden',
          paddingHorizontal: 10,
        },
        indicatorContainer: {
          paddingHorizontal: 20,
        },
      }),
    [theme],
  );

  return (
    <MaterialTopTabs
      style={styles.container}
      screenOptions={{
        tabBarStyle: styles.tabBar,
        tabBarIndicatorStyle: styles.indicator,
        tabBarLabelStyle: styles.label,
        tabBarActiveTintColor: theme.colors.textPrimary,
        tabBarInactiveTintColor: theme.colors.textMuted,
        tabBarItemStyle: styles.tabItem,
        tabBarIndicatorContainerStyle: styles.indicatorContainer,
        tabBarScrollEnabled: true,
      }}
    >
      <MaterialTopTabs.Screen
        name="index"
        options={{
          title: 'Review',
        }}
      />
      <MaterialTopTabs.Screen
        name="accounts"
        options={{ title: "Accounts" }}
      />
      <MaterialTopTabs.Screen
        name="transactions"
        options={{ title: "Transactions" }}
      />
      <MaterialTopTabs.Screen
        name="budgets"
        options={{ title: "Budgets" }}
      />
      <MaterialTopTabs.Screen
        name="analytics"
        options={{ title: "Analytics" }}
      />
      <MaterialTopTabs.Screen
        name="debts"
        options={{ title: "Debts" }}
      />
    </MaterialTopTabs>
  );
};

export default Layout;
