import { Text, TouchableOpacity } from "react-native";
import { router } from "expo-router";
export default function CloseApp() {
  return (
    <TouchableOpacity
      style={{
        width: "auto",
        height: "auto",
        marginRight: 20,
        paddingTop: 3,
        paddingBottom: 3,
        paddingHorizontal: 10,
      }}
      activeOpacity={1}
      onPress={() => router.navigate("/")}
    >
      <Text>Salir</Text>
    </TouchableOpacity>
  );
}
