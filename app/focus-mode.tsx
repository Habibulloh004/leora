import { useThemeColors } from "@/constants/theme";
import { View } from "react-native";
import { Text } from "react-native-gesture-handler";
export default function AddTask() {
  const colors = useThemeColors();

  return (
    <View style={{
      flex: 1,
      justifyContent: 'center',
      width: "100%",
      height: "100%",
      alignItems: "center",
      backgroundColor: colors.background 
    }}>
      <Text>
        Focus Mode
      </Text>
    </View>
  );
}
