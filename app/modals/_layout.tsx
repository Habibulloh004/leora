import { Stack } from "expo-router";
import { Button } from "react-native";

export default function Layout() {
  return (
    <Stack>
      <Stack.Screen name="index" options={{
        headerStyle: {
          backgroundColor: "#25252B",
        },
        headerRight: () => <Button onPress={() =>{}} title="Update count" />,
        headerTitle: "Index page",
        headerTintColor: "#fff"
      }} />
      <Stack.Screen name="start-focus" options={{
        headerStyle: {
          backgroundColor: "#25252B",
        },
        headerTitle: "Start Focus",
        headerTintColor: "#fff"
      }} />
    </Stack>
  );
}