import { View } from "react-native";
import { Text } from "react-native-gesture-handler";
import { BlurView } from "expo-blur";
export default function AddTask() {
  return (
    <View style={{
      flex: 1,
      justifyContent: 'center',
      width: "100%",
      height: "100%",
      alignItems: "center"
    }}>
      <BlurView
        experimentalBlurMethod="dimezisBlurView"
        intensity={30} tint="dark" style={{
          width: "100%",
          height: "50%",
          position: "absolute",
          bottom: 0
        }} />
      <Text>
        Add Task modal
      </Text>
    </View>
  );
}