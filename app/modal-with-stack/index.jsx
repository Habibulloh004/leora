import { View } from "react-native";
import { Link } from "expo-router";

export default function ModalWithStackScreen() {
  return (
    <View style={{
      flex: 1,
      justifyContent: 'center',
      width: "100%",
      height: "100%",
      alignItems: "center"
    }}>
      <Link href="/modal-with-stack/home" style={{
        padding:10,
        borderRadius:10,
        backgroundColor:"blue",
        color:"white"
      }} push>
        Go home nasted
      </Link>
    </View>
  );
}