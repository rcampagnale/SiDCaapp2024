import { Text, TouchableOpacity, ScrollView, View } from "react-native";
import { router } from "expo-router";

export default function CloseApp() {
  return (
    <ScrollView
      contentContainerStyle={{
        flexGrow: 1, // Esto hace que el ScrollView ocupe todo el espacio disponible
        justifyContent: "flex-end", // Coloca el contenido al final del ScrollView
        paddingBottom: 20, // Agrega un poco de espacio en la parte inferior
      }}
    >
      <View
        style={{
          width: "auto",
          height: 40, // Establece una altura fija para el botón
          backgroundColor: "#007BFF", // Fondo azul
          justifyContent: "center", // Centra el texto verticalmente
          alignItems: "center", // Centra el texto horizontalmente
          marginRight: 0,
          paddingTop: 3,
          paddingBottom: 3,
          paddingHorizontal: 10,
          borderRadius: 5, // Bordes redondeados para mejorar la apariencia
        }}
      >
        <TouchableOpacity
          activeOpacity={1}
          onPress={() => router.navigate("/")}
        >
          <Text style={{ color: "white", fontWeight: "bold" }}>
            Cerrar Sección
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}
