import { View } from "react-native";
import { Text } from "react-native-gesture-handler";

export default function NestedScreen() {
  return (
    <View style={{
      flex:1,
      justifyContent:'center',
      width:"100%",
      height:"100%",
      alignItems:"center"
    }}>
      <Text>
        Home nested
      </Text>
    </View>
  );
}