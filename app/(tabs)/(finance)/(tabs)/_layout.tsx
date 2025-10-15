// app/(tabs)/(finance)/(tabs)/_layout.tsx
import { createMaterialTopTabNavigator } from "@react-navigation/material-top-tabs";
import { withLayoutContext } from "expo-router";
import { StyleSheet } from "react-native";

const { Navigator } = createMaterialTopTabNavigator();

export const MaterialTopTabs = withLayoutContext(Navigator);

const Layout = () => {
  return (
    <MaterialTopTabs
      style={styles.container}
      screenOptions={{
        tabBarStyle: styles.tabBar,
        tabBarIndicatorStyle: styles.indicator,
        tabBarLabelStyle: styles.label,
        tabBarScrollEnabled: true,
        tabBarActiveTintColor: '#FFFFFF',
        tabBarInactiveTintColor: '#7E8491',
        tabBarItemStyle: styles.tabItem,
      }}
    >
      <MaterialTopTabs.Screen
        name="index"
        options={{
          title: "Overview",
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
      <MaterialTopTabs.Screen
        name="goals"
        options={{ title: "Goals" }}
      />
    </MaterialTopTabs>
  );
};

export default Layout;

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#25252B",
  },
  tabBar: {
    backgroundColor: "#25252B",
    borderBottomWidth: 1,
    borderBottomColor: "#34343D",
    elevation: 0,
    shadowOpacity: 0,
  },
  indicator: {
    backgroundColor: "#FFFFFF",
    height: 2,
  },
  label: {
    fontSize: 13,
    fontWeight: "600",
    textTransform: "none",
  },
  tabItem: {
    width: 'auto',
  },
});
