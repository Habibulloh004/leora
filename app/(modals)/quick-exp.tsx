import { View } from "react-native";
import { Text } from "react-native-gesture-handler";
import { Colors } from "@/constants/Colors";
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
        Quick Expence modal
      </Text>
    </View>
  );
}