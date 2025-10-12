import { Colors } from "@/constants/Colors";
import { View } from "react-native";
import { Text } from "react-native-gesture-handler";
export default function AddTask() {
  return (
    <View style={{
      flex: 1,
      justifyContent: 'center',
      width: "100%",
      height: "100%",
      alignItems: "center",
      backgroundColor:Colors.background
    }}>
      <Text>
        Focus Mode
      </Text>
    </View>
  );
}