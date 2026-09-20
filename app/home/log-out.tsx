import { Text, TouchableOpacity } from "react-native";
import { router } from "expo-router";
import React, { useContext } from "react";
import { SidcaContext } from "../_layout";
import { resetNewsModalSession } from "../../services/pushNotificationNavigation";
export default function CloseApp() {
  const { setUserData, setPushNewsModal } = useContext(SidcaContext);

  const cerrarSesion = () => {
    resetNewsModalSession();
    setPushNewsModal(null);
    setUserData(null);
    router.replace("/");
  };

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
      onPress={cerrarSesion}
    >
      <Text>Salir</Text>
    </TouchableOpacity>
  );
}
