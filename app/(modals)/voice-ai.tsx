import { View } from "react-native";
import { Text } from "react-native-gesture-handler";

export default function VoiceAi() {
  return (
    <View style={{
      flex:1,
      justifyContent:'center',
      width:"100%",
      height:"100%",
      alignItems:"center",
      backgroundColor:"#25252B"
    }}>
      <Text style={{
        color:"white"
      }}>
        Start focus modal
      </Text>
    </View>
  );
}