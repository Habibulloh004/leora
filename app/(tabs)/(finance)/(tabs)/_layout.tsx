import { createMaterialTopTabNavigator, MaterialTopTabNavigationOptions, MaterialTopTabNavigationEventMap } from "@react-navigation/material-top-tabs"
import { ParamListBase, TabNavigationState } from "@react-navigation/native";
import { withLayoutContext } from "expo-router";
import { StyleSheet } from "react-native";
const { Navigator } = createMaterialTopTabNavigator();

export const MaterialTopTabs = withLayoutContext<
  MaterialTopTabNavigationOptions,
  typeof Navigator,
  TabNavigationState<ParamListBase>,
  MaterialTopTabNavigationEventMap
>(Navigator);

const Layout = () => {
  return <MaterialTopTabs style={styles.container}>
    <MaterialTopTabs.Screen name="index" options={{ title: "Finance Pagei" }} />
    <MaterialTopTabs.Screen name="goals" options={{ title: "Goals Pagei" }} />
  </MaterialTopTabs>
}

export default Layout

const styles = StyleSheet.create({
  container:{
    backgroundColor:"#25252B"
  }
})