import {
  StatusBar,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  ImageBackground,
  Image,
  Platform,
} from "react-native";
import styles from "../../styles/home-styles/home-styles";
import { router } from "expo-router";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import Ionicons from "@expo/vector-icons/Ionicons";
import FontAwesome5 from "@expo/vector-icons/FontAwesome5";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import Feather from "@expo/vector-icons/Feather";
import Entypo from "@expo/vector-icons/Entypo";
import CloseApp from "./log-out";
import { MaterialIcons, Fontisto, FontAwesome6 } from "@expo/vector-icons";
import AntDesign from "@expo/vector-icons/AntDesign";
import { useFocusEffect } from "expo-router";
import React, { useContext, useMemo } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

// ⬇️ importa tu contexto y el modal
import { SidcaContext } from "../_layout"; // ajustá la ruta si es distinta
import ModalAlerta from "@/components/ModalAlerta";

// Helper: normalizar valores "si/no", true/false, "1"/"0"
const toBool = (v: any): boolean => {
  if (typeof v === "boolean") return v;
  if (typeof v === "number") return v === 1;
  if (typeof v === "string") {
    const s = v.trim().toLowerCase();
    return ["si", "sí", "true", "1", "yes"].includes(s);
  }
  return false;
};

export default function HomePage() {
  const statusBarHeight = StatusBar.currentHeight;

  // ✅ Restaura el StatusBar blanco cada vez que volvés a esta pantalla
  useFocusEffect(
    React.useCallback(() => {
      StatusBar.setBarStyle("dark-content");
      if (Platform.OS === "android") {
        StatusBar.setBackgroundColor("#ffffff"); // blanco en Android
      }
    }, [])
  );

  // ⬇️ Trae usuario del contexto y calcula adherente/estado
  // ⬇️ Trae usuario del contexto y calcula adherente/estado (con defaults seguros)

  const { userData, setUserData } = useContext(SidcaContext) as any;

  const adherente = toBool(userData?._afiliado?.adherente ?? false);
  // si es adherente: mirar _afiliado.activo; si no es adherente: activo=true
  const activo = adherente
    ? toBool(userData?._afiliado?.activo ?? false)
    : true;

  const showBlocker = adherente && !activo;

  const handleSalir = async () => {
    try {
      await AsyncStorage.removeItem("sidca_user");
    } catch {}
    setUserData(null);
    router.replace("/"); // vuelve al login
  };

  // Opcional: aún con el modal, evitamos navegar por software
  const requireActivo = (fn: () => void) => {
    if (adherente && !activo) return; // bloqueado
    fn();
  };

  return (
    <View style={{ flex: 1, paddingTop: statusBarHeight }}>
      <StatusBar
        translucent
        backgroundColor="#ffffff"
        barStyle="dark-content"
      />
      <View style={styles.topBar}>
        <View>
          <Image
            source={require("../../assets/logos/cea_1.png")}
            style={{ width: 80, height: 80 }}
            resizeMode="contain"
          />
        </View>
        <View>
          <Image
            source={require("../../assets/logos/logo-01.png")}
            style={{ width: 80, height: 80 }}
            resizeMode="contain"
          />
        </View>
        <View>
          <Image
            source={require("../../assets/logos/cgt.png")}
            style={{ width: 40, height: 40 }}
            resizeMode="contain"
          />
        </View>
        <View>
          <Image
            source={require("../../assets/logos/ie.png")}
            style={{ width: 40, height: 40 }}
            resizeMode="contain"
          />
        </View>
        <CloseApp />
      </View>

      <ScrollView
        contentContainerStyle={{
          justifyContent: "space-between",
          rowGap: 20,
          backgroundColor: "#091d24",
        }}
      >
        <ImageBackground
          style={styles.viewAbout}
          source={require("../../assets/home/nosotros.png")}
          resizeMode="cover"
        >
          <Text style={{ fontSize: 28, fontWeight: 600, color: "#ffffff" }}>
            Nosotros
          </Text>
          <View style={styles.btnsContainer}>
            <TouchableOpacity
              style={styles.btnActions}
              activeOpacity={1}
              onPress={() =>
                requireActivo(() => router.navigate("/aboutus/about-sidca"))
              }
            >
              <View style={styles.logoContainer}>
                <Ionicons name="heart" size={25} color="black" />
              </View>
              <Text style={{ fontSize: 18 }}>Quienes somos</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.btnActions}
              activeOpacity={1}
              onPress={() =>
                requireActivo(() => router.navigate("/credential"))
              }
            >
              <View style={styles.logoContainer}>
                <Entypo name="v-card" size={26} color="black" />
              </View>
              <Text style={{ fontSize: 18 }}>Credencial de Afiliado</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.btnActions}
              activeOpacity={1}
              onPress={() =>
                requireActivo(() =>
                  router.navigate("/contact/contact-information")
                )
              }
            >
              <View style={styles.logoContainer}>
                <FontAwesome5 name="phone-alt" size={24} color="black" />
              </View>
              <Text style={{ fontSize: 18 }}>Contacto</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.btnActions}
              activeOpacity={1}
              onPress={() =>
                requireActivo(() => router.navigate("/quota/quota-users"))
              }
            >
              <View style={styles.logoContainer}>
                <MaterialCommunityIcons
                  name="card-multiple"
                  size={24}
                  color="black"
                />
              </View>
              <Text style={{ fontSize: 18 }}>Cuotas Adherentes</Text>
            </TouchableOpacity>
          </View>
        </ImageBackground>

        <ImageBackground
          style={styles.viewInformation}
          source={require("../../assets/home/capacitaciones.png")}
          resizeMode="cover"
        >
          <Text style={{ fontSize: 28, fontWeight: 600, color: "#ffffff" }}>
            Información
          </Text>
          <View style={styles.btnsContainer}>
            <TouchableOpacity
              style={styles.btnActions}
              activeOpacity={1}
              onPress={() =>
                requireActivo(() => router.navigate("/courses/get-my-courses"))
              }
            >
              <View style={styles.logoContainer}>
                <FontAwesome5 name="user-graduate" size={24} color="black" />
              </View>
              <Text style={{ fontSize: 18 }}>Capacitaciones</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.btnActions}
              activeOpacity={1}
              onPress={() =>
                requireActivo(() =>
                  router.navigate("/sala_de_reuniones/sala_de_reuniones")
                )
              }
            >
              <View style={styles.logoContainer}>
                <AntDesign name="customerservice" size={27} color="black" />
              </View>
              <Text style={{ fontSize: 18 }}>Sala de Reuniones</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.btnActions}
              activeOpacity={1}
              onPress={() =>
                requireActivo(() => router.navigate("/links/short-links"))
              }
            >
              <View style={styles.logoContainer}>
                <Feather name="external-link" size={24} color="black" />
              </View>
              <Text style={{ fontSize: 18 }}>Enlaces de utilidad</Text>
            </TouchableOpacity>
          </View>
        </ImageBackground>

        <ImageBackground
          style={styles.viewSupport}
          source={require("../../assets/home/asesoramiento.jpg")}
          resizeMode="cover"
        >
          <Text style={{ fontSize: 28, fontWeight: 600, color: "#ffffff" }}>
            Asesoramiento
          </Text>
          <View style={styles.btnsContainer}>
            <TouchableOpacity
              style={styles.btnActions}
              activeOpacity={1}
              onPress={() =>
                requireActivo(() => router.navigate("/advice-general/advicer"))
              }
            >
              <View style={styles.logoContainer}>
                <Fontisto name="person" color="#000" size={24} />
              </View>
              <Text style={{ fontSize: 18 }}>Gremial</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.btnActions}
              activeOpacity={1}
              onPress={() =>
                requireActivo(() => router.navigate("/legal-advice/legal"))
              }
            >
              <View style={styles.logoContainer}>
                <FontAwesome name="legal" size={24} color="black" />
              </View>
              <Text style={{ fontSize: 18 }}>Legal</Text>
            </TouchableOpacity>
          </View>
        </ImageBackground>

        <ImageBackground
          style={styles.viewBenefits}
          source={require("../../assets/casa/casa.jpg")}
          resizeMode="cover"
        >
          <Text style={{ fontSize: 28, fontWeight: 600, color: "#ffffff" }}>
            Beneficios
          </Text>
          <View style={styles.btnsContainer}>
            <TouchableOpacity
              style={styles.btnActions}
              activeOpacity={1}
              onPress={() =>
                requireActivo(() => router.navigate("/tourist/tourist"))
              }
            >
              <View style={styles.logoContainer}>
                <FontAwesome name="bus" size={24} color="black" />
              </View>
              <Text style={{ fontSize: 18 }}>Turismo</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.btnActions}
              activeOpacity={1}
              onPress={() =>
                requireActivo(() => router.navigate("/house/house"))
              }
            >
              <View style={styles.logoContainer}>
                <FontAwesome5 name="house-user" size={24} color="black" />
              </View>
              <Text style={{ fontSize: 18 }}>Casa del docente</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.btnActions}
              activeOpacity={1}
              onPress={() =>
                requireActivo(() => router.navigate("/campus/campus"))
              }
            >
              <View style={styles.logoContainer}>
                <MaterialIcons name="maps-home-work" color="#000" size={24} />
              </View>
              <Text style={{ fontSize: 18 }}>Predio Recreativo</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.btnActions}
              activeOpacity={1}
              onPress={() =>
                requireActivo(() => router.navigate("/convenio/convenio"))
              }
            >
              <View style={styles.logoContainer}>
                <MaterialCommunityIcons
                  name="network-outline"
                  color="#000"
                  size={28}
                />
              </View>
              <Text style={{ fontSize: 18 }}>Red de Convenios</Text>
            </TouchableOpacity>
          </View>
        </ImageBackground>
      </ScrollView>

      {/* 🔒 Modal bloqueante si adherente inactivo */}
      <ModalAlerta
  visible={showBlocker}
  onSalir={handleSalir}
  // whatsapp: si no llega desde Firestore, el propio modal tiene default 3834539754
  whatsapp={userData?._afiliado?.whatsapp ?? undefined}
  motivo={userData?._afiliado?.motivo ?? null}   // 👈 ahora este campo
/>


      {/*<ChatbotModal />*/}
    </View>
  );
}
