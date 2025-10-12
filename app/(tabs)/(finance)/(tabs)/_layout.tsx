import { createMaterialTopTabNavigator, MaterialTopTabNavigationOptions, MaterialTopTabNavigationEventMap } from "@react-navigation/material-top-tabs"
import { ParamListBase, TabNavigationState } from "@react-navigation/native";
import { withLayoutContext } from "expo-router";

const { Navigator } = createMaterialTopTabNavigator();

export const MaterialTopTabs = withLayoutContext<
  MaterialTopTabNavigationOptions,
  typeof Navigator,
  TabNavigationState<ParamListBase>,
  MaterialTopTabNavigationEventMap
>(Navigator);

const Layout = () => {
  return <MaterialTopTabs>
    <MaterialTopTabs.Screen name="index" options={{ title: "Finance Pagei" }} />
    <MaterialTopTabs.Screen name="goals" options={{ title: "Goals Pagei" }} />
  </MaterialTopTabs>
}

export default Layout