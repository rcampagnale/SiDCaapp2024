import {
  ImageBackground,
  Text,
  TouchableOpacity,
  View,
  ScrollView,
  Image,
  Linking,
  SafeAreaView,
  Platform,
  KeyboardAvoidingView,
  TouchableWithoutFeedback,
  Keyboard,
} from "react-native";
import React, { useContext } from "react";
import styles from "../../styles/courses/courses-styles";
import { useRouter } from "expo-router"; // Importa el hook para la navegación
import { SidcaContext } from "../_layout";
import { useSidcaAlert } from "../../components/SidcaAlert";

const MOODLE_BASE_URL = "https://aula.sidcagremio.com";
const MOODLE_ANDROID_PACKAGE = "com.moodle.moodlemobile";
const MOODLE_IOS_STORE_URL = "https://apps.apple.com/app/moodle/id633359593";

const normalizarDni = (value: unknown) =>
  String(value || "").replace(/\D/g, "");

const crearDeepLinkMoodle = (dni: string) => {
  const sitio = new URL(MOODLE_BASE_URL);
  const ruta = sitio.pathname === "/" ? "" : sitio.pathname.replace(/\/$/, "");
  const usuario = dni ? `${encodeURIComponent(dni)}@` : "";
  return `moodlemobile://${sitio.protocol}//${usuario}${sitio.host}${ruta}`;
};

interface HandleOptionsCourse {
  setActionType: (value: null | string) => void;
}

export default function HandleCourses({ setActionType }: HandleOptionsCourse) {
  const router = useRouter(); // Inicializa el router
  const { userData } = useContext(SidcaContext) as any;
  const { showAlert, AlertPortal } = useSidcaAlert();

  const abrirTiendaMoodle = async () => {
    if (Platform.OS === "ios") {
      await Linking.openURL(MOODLE_IOS_STORE_URL).catch(() => undefined);
      return;
    }

    const referrer = encodeURIComponent(`siteurl=${MOODLE_BASE_URL}`);
    const marketUrl =
      `market://details?id=${MOODLE_ANDROID_PACKAGE}` +
      `&referrer=${referrer}`;
    const webUrl =
      `https://play.google.com/store/apps/details?id=${MOODLE_ANDROID_PACKAGE}` +
      `&referrer=${referrer}`;

    try {
      const puedeAbrirMarket = await Linking.canOpenURL(marketUrl);
      await Linking.openURL(puedeAbrirMarket ? marketUrl : webUrl);
    } catch {
      await Linking.openURL(webUrl).catch(() => undefined);
    }
  };

  const mostrarInstalacionMoodle = () => {
    showAlert(
      "Aula Virtual SIDCA",
      "Para ingresar al Aula Virtual necesitás la aplicación oficial Moodle.",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Abrir en navegador",
          onPress: () => Linking.openURL(MOODLE_BASE_URL).catch(() => undefined),
        },
        { text: "Instalar Moodle", onPress: abrirTiendaMoodle },
      ],
    );
  };

  const openClassroom = async () => {
    const dni = normalizarDni(userData?.dni);
    const deepLink = crearDeepLinkMoodle(dni);

    try {
      // Android puede ocultar el resultado de canOpenURL por Package Visibility.
      // El intento directo es la comprobación real y se ejecuta en cada toque.
      await Linking.openURL(deepLink);
    } catch {
      mostrarInstalacionMoodle();
    }
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <ScrollView
            contentContainerStyle={{
              flexGrow: 1,
              paddingBottom: 30,
            }}
          >
            {/* Carrusel de imágenes */}
            <View style={styles.scrollContainer}>
              <ScrollView
                horizontal
                contentContainerStyle={{
                  display: "flex",
                  justifyContent: "space-around",
                  alignItems: "center",
                  columnGap: 10,
                }}
                showsHorizontalScrollIndicator={false}
              >
                <Image
                  style={{ width: 180, height: 120 }}
                  source={require("../../assets/cursos/curso.jpg")}
                />
                <Image
                  style={{ width: 180, height: 120 }}
                  source={require("../../assets/cursos/curso1.jpg")}
                />
                <Image
                  style={{ width: 180, height: 120 }}
                  source={require("../../assets/cursos/curso2.jpg")}
                />
                <Image
                  style={{ width: 180, height: 120 }}
                  source={require("../../assets/cursos/curso3.jpg")}
                />
                <Image
                  style={{ width: 180, height: 120 }}
                  source={require("../../assets/cursos/curso4.jpg")}
                />
              </ScrollView>
            </View>

            {/* Descripción del curso */}
            <View style={styles.textAboutCourse}>
              <Text
                style={{
                  fontSize: 17,
                  textAlign: "justify",
                  paddingHorizontal: 10,
                }}
              >
                La Secretaría de Capacitación de SiDCa brinda durante todo el
                año ofertas de capacitación y perfeccionamiento docente gratuita
                a sus afiliados, mediante cursos, talleres, congresos y
                seminarios que propician el acceso a material innovador y
                actualizado, contribuyendo en la profesionalización de nuestros
                docentes.
              </Text>
            </View>

            {/* Tarjetas de cursos */}
            <ImageBackground
              style={styles.cardCourses}
              source={require("../../assets/home/capacitaciones.png")}
              resizeMode="cover"
            >
              <Text style={{ color: "#ffffff", fontSize: 22, fontWeight: 600 }}>
                Cursos Aprobados
              </Text>
              <TouchableOpacity
                style={styles.btnSeeInfo}
                activeOpacity={1}
                onPress={() => router.push("/courses/courses-picked")}
              >
                <Text style={{ color: "#ffffff", fontSize: 20 }}>Ver</Text>
              </TouchableOpacity>
            </ImageBackground>

            <ImageBackground
              style={styles.cardCourses}
              source={require("../../assets/home/capacitaciones2.png")}
              resizeMode="cover"
            >
              <Text style={{ color: "#ffffff", fontSize: 22, fontWeight: 600 }}>
                Cursos Disponibles
              </Text>
              <TouchableOpacity
                style={styles.btnSeeInfo}
                onPress={() => setActionType("verify")}
              >
                <Text style={{ color: "#ffffff", fontSize: 20 }}>Ver</Text>
              </TouchableOpacity>
            </ImageBackground>

            <ImageBackground
              style={styles.cardCourses}
              source={require("../../assets/home/capacitaciones1.png")}
              resizeMode="cover"
            >
              <Text style={{ color: "#ffffff", fontSize: 22, fontWeight: 600 }}>
                Registro de Asistencia
              </Text>
              <TouchableOpacity
                style={styles.btnSeeInfo}
                onPress={() => router.push("/asistencia/asistencia")}
              >
                <Text style={{ color: "#ffffff", fontSize: 20 }}>Ver</Text>
              </TouchableOpacity>
            </ImageBackground>

            {/* Botón de Aula Virtual con el mismo estilo que los botones "Ver" */}
            <View
              style={{
                width: "100%",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                paddingVertical: 15,
                alignSelf: "center", // Alinea el botón en el centro de la pantalla
              }}
            >
              <Text
                style={{
                  color: "#ffffff",
                  fontSize: 22,
                  fontWeight: 600,
                  textAlign: "center",
                  marginBottom: 10,
                }}
              >
                Acceso Aula Virtual
              </Text>
              <TouchableOpacity
                style={styles.btnSeeInfo} // Usamos el mismo estilo que el botón "Ver"
                onPress={openClassroom}
                activeOpacity={1}
              >
                <Text
                  style={{ color: "#ffffff", fontSize: 20, fontWeight: 600 }}
                >
                  Abrir
                </Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
      <AlertPortal />
    </SafeAreaView>
  );
}
